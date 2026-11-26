import type { ProTableProps } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { ButtonProps } from 'antd';
import { message } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';
import AutoRefresh from '../AutoRefresh';
import request from '../fetch/request';
import useScrollAnchor from '../hooks/useScrollAnchor';
import localConfig from '../localConfig';
import _typeOf from '../utils/_typeOf';
import _beforeSearchSubmit from './_beforeSearchSubmit';
import _loopData from './_loopData';
import _mergeRowspanResults from './_mergeRowspanResults';
import _validateTableAndColumnsWidth from './_validateTableAndColumnsWidth';
import Export from './Export';
import useStyles from './style';

export type FieldProps = {
  dataSource: string; // 数据源
  total: string; // 总数据量
  current: string; // 当前页码
  pageSize: string; // 页数
};

export type ExportItemProps = {
  title?: string; // 按钮文案
  type?: 'all' | 'single'; // 是否导出分页的全部数据
  open?: boolean; // 是否展示按钮，一般用于按钮的权限控制
  buttonProps?: ButtonProps;
};

interface ProTableAsyncProps<T, U = any>
  extends Omit<ProTableProps<T, U>, 'request' | 'toolBarRender' | 'rowKey'> {
  url?: string;
  rowKey?: string;
  toolBarRender?: (action: any) => React.ReactNode[];
  extraParams?: Record<string, string | number>;
  formatData?: (params: any) => unknown;
  persistenceKey?: string; // 持久化秘钥
  mergeDataIndex?: string[]; // 需要数据合并的 dataIndex
  exportItems?: ExportItemProps[];
  anchor?: string; // 是否进行锚点滚动
  requestProps?: any; // 请求的 api
  exportItemsPosition?: 'unshift' | 'push';
  autoRefresh?: boolean; // 自动刷新按钮
  fields?: FieldProps;
  pagination?: object | false;
}

function ProTableAsync<T>(props: ProTableAsyncProps<T>): React.ReactElement {
  const {
    url = '', // 请求的接口地址
    rowKey = 'id',
    pagination = false,
    mergeDataIndex = [], // 需要单元格合并的 dataIndex，目前只会针对纵向进行合并
    extraParams = {}, // 额外的入参
    formatData, // 数据过滤函数
    persistenceKey, // 持久化使用的 key
    exportItems, // 在 toolBarRender 中自定义的项，在这里用来做数据导出的功能
    exportItemsPosition = 'unshift',
    headerTitle = ' ',
    search = {},
    anchor = '',
    requestProps,
    autoRefresh = false,
    beforeSearchSubmit,
    ...rest
  } = props;

  const id = useId();
  const { styles, cx } = useStyles();

  /**
   * 搜索表单的 formRef，优先使用外部传入的
   * */
  const formRef = useRef(null);
  const formRef2 = rest.formRef || formRef;

  /**
   * 字段映射
   * */
  const fields = {
    dataSource: 'datas', // 数据源
    total: 'total', // 总数据量
    current: 'currPageNo', // 当前页码
    pageSize: 'pageSize', // 页数
    ...rest.fields,
  };

  /**
   * 分页器行为，统一合并 dataSource 模式 和 url 模式
   * 1、默认分页器是关闭状态
   * 2、dataSource 模式下，直接使用外部 pagination，避免缓存导致 onChange 闭包过期
   * 3、url 模式下，分页器由组件内部控制，主要由 request 函数控制
   * */
  const [autoPagination, setAutoPagination] = useState<any>(() => {
    return !url
      ? false
      : {
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100, 200, 500, 1000],
        };
  });

  /**
   * 缓存 request 后的数据，方便其他功能使用，比如数据导出
   * */
  const [data, setData] = useState([]);

  /**
   * 会自动计算每个 column 的宽度，并设置总的 scrollX
   * */
  const [scrollX, setScrollX] = useState(0);

  /**
   * 控制查询、重置等按钮会多次触发 request 的问题
   * */
  const [flagRequest, setFlagRequest] = useState(true);

  /**
   * 每次进行查询时会缓存列表入参内容，方便其他功能使用
   * */
  const [searchParams, setSearchParams] = useState({});

  /**
   * 表头内容数据
   * 1、在对 options.setting 的列项进行操作时，内部会重构 columns 内容
   * 2、在使用 mergeDataIndex 等属性时，会重构 columns 内容
   * */
  const [newColumns, setNewColumns] = useState([]);

  /**
   * 内部自动控制展开项的 rowKeys，也可以被外部 state 控制，直接使用原生 API 即可
   * */
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  /**
   * 锚点滚动
   * 1、path 中 #锚点内容 = rowkey 时，会滚动到锚点位置
   * */
  const [hash] = useScrollAnchor({
    anchor: !!anchor,
    dep: [data],
    duration: 10000,
  });

  /**
   * 读取全局配置内容
   * @column<Function>
   * @scroll
   * */
  const config = localConfig.newInstance()?.proTableAsync || {};

  // 传入的数据优先级大于内部请求的数据
  const newDataSource: any = rest.dataSource || data;
  // 持久化秘钥增加组件标识符
  const persistenceKey2 = persistenceKey
    ? `pro_table_${persistenceKey}`
    : undefined;

  const requestFn = url
    ? async ({ current = 1, pageSize = 20, ...params }) => {
        // 当是查询按钮触发时
        if (flagRequest) {
          // 如果有约定式的错误信息，则中断后续操作，进行错误提示
          if (params.errorMessage) {
            message.warning(params.errorMessage);
            return;
          }

          /**
           * 当有 url 时，自动进行数据请求
           * 1、合并入参
           * */
          const mergeParams = {
            ...extraParams,
            ...params,
            // 翻页字段
            [fields.current]: current,
            [fields.pageSize]: pageSize,
          };

          /**
           * 发送请求
           * 1、判断是否为 POST 请求，如果是则改变 options 入参
           * 2、options 合并 requestProps 自定义属性
           * */
          const dataObject = await request(url, {
            [requestProps?.method === 'POST' ? 'data' : 'params']: mergeParams,
            ...requestProps,
          });

          /**
           * 获取列表数据
           * 1、如果 dataObject 是数组，则就是列表所需数据
           * 2、如果 dataObject 是对象，则大概率是分页数据
           * */
          let datas = [];

          if (_typeOf(dataObject, 'Array')) {
            datas = dataObject;

            if (!pagination) {
              setAutoPagination(false);
            }
          } else {
            datas = dataObject[fields['dataSource']] || [];
          }

          /**
           * 自定义数据过滤
           * PS：建议 formatData 只做对原始的列表数据的过滤；如果要对数据做其他的操作，比如动态 columns，可以使用 onDataSourceChange 方法
           * */
          const newData: any = formatData
            ? formatData({ datas, dataObject, mergeParams })
            : datas;

          /**
           * 自定义数据字段生成，一般都是 id 等需要不重复的字段
           * */
          const newData2 = _loopData(newData, rowKey, rest.expandable);

          setData(newData2);
          setSearchParams(mergeParams);

          /**
           * 展开项逻辑：expandAll 存在，且 expandedRowKeys 不存在
           * */
          if (
            // @ts-ignore
            rest.expandable?.expandAll &&
            !rest.expandable.expandedRowKeys
          ) {
            setExpandedRowKeys(newData2.map((i: any) => i[rowKey]));
          }

          return {
            data: newData2, // 如果翻页约定返回 datas, 其他情况用 formatData 处理
            success: true,
            total: dataObject?.[fields.total],
          };
        }

        return {
          data: [],
          success: true,
          total: 0,
        };
      }
    : undefined;

  /**
   * 获取需要合并的数据下标结构，详见如下方法
   * */
  const mergeResults = _mergeRowspanResults(newDataSource, mergeDataIndex);

  /**
   * 递归 columns 进行数据重构
   * 0、默认列的搜索功能是关闭的，也就是 column.search = false；
   *   - 是否开启由使用者决定，比如：column.search = true / column.search = {...}
   * 1、查看 column 是否有 required = true 的情况，如果有，则设置 table.form.ignoreRules，则查询时会对表单进行必填项等校验
   * 2、递归进行数据单元格合并
   * 3、自定义 table 事件
   * 4、设置操作栏的默认行为
   * */
  const loopColumns = (columnList: any[] = []) => {
    // todo：对 table 宽度 和 columns 计算的宽度进行比较，如果 table 宽度大，那么直接使用，如果小，则再动态设置 column 的宽度
    const { autoScrollX, width } = _validateTableAndColumnsWidth({
      id,
      columns: columnList,
      persistenceKey: persistenceKey2,
    });

    // let totalScrollX = 0  // 计算后整体的 x轴 宽度
    const filterColumns = columnList.map((item) => {
      const column: any = {
        search: false, // 设置所有列的搜索功能为 false
        ...item,
        children: loopColumns(item.children),
      };

      /**
       * 搜索项必填要求设置
       * 1、当 column.required = true 时，则自动设置 column.formItemProps 的 rules 属性
       * 2、必填校验字段提示词：item.message
       *   - 原 ProTable 组件中的提示词是：请输入${label}
       *   - 如果不需要提示词，设置成空字符串
       * */
      if (item.required) {
        column.formItemProps = {
          rules: [{ required: true, message: item.message }],
          ...item.formItemProps,
        };
      }

      // 列的合并操作
      const key = item.key || item.dataIndex;
      const stringKey = Array.isArray(key) ? key.join('.') : key;
      if (mergeDataIndex?.includes(stringKey)) {
        column.onCell = (_: Record<any, any>, rowIndex: number) => ({
          rowSpan: mergeResults[stringKey][rowIndex],
        });
      }

      // 读取配置文件的自定义事件
      config.column?.(column);

      // 重新定义 percent。原本如果值是负数，会被转义成正值
      if (item.valueType === 'percent') {
        column.valueType = 'text';
        column.renderText = (t: any) => (!!t || t === 0 ? `${t}%` : '');
      }

      // 设置默认的操作列属性
      if (item.valueType === 'option') {
        column.title = item.title || '操作';
        column.width = item.width || 120;
        column.fixed = 'right';
      }

      // 动态计算 column 宽度
      if (autoScrollX) {
        column.width = column.calcwidth || column.width;
      }

      return column;
    });

    setScrollX(width);
    return filterColumns;
  };

  // 重新渲染 toolBarRender 函数，加入自定义的 exportItems 内容
  const toolBarRender = (action: any, action2: any) => {
    const toolList =
      rest.toolBarRender?.({
        ...action,
        ...action2,
        data: newDataSource,
        searchParams,
      }) || [];

    if (exportItems && exportItems.length > 0) {
      toolList[exportItemsPosition](
        // @ts-ignore
        <Export
          key="export"
          url={url}
          params={searchParams}
          formatData={formatData}
          items={exportItems}
          columns={newColumns}
          dataSource={newDataSource}
          persistenceKey={persistenceKey2}
          defaultExportTitle={config.defaultExportTitle}
        />,
      );
    }

    return toolList;
  };

  /**
   * 重新定义 columns 内容
   * PS：依赖中的 newDataSource 不可以删除，在数据变动后需要重新触发 columns 重组，才能进行单元格合并等操作
   * */
  useEffect(() => {
    if (rest.columns && rest.columns.length > 0) {
      setNewColumns(loopColumns(rest.columns));
    }
  }, [rest.columns, newDataSource]);

  return (
    <ProTable
      id={id}
      bordered
      headerTitle={headerTitle}
      virtual={
        !pagination ||
        (rest.dataSource?.length || searchParams[fields.pageSize] || 20) >= 50
      }
      request={requestFn}
      columnsState={{
        persistenceKey: persistenceKey2,
        persistenceType: 'localStorage',
      }}
      beforeSearchSubmit={(p) =>
        _beforeSearchSubmit(p, { columns: newColumns, beforeSearchSubmit })
      }
      {...rest}
      rowKey={rowKey}
      rowSelection={
        rest.rowSelection
          ? {
              columnWidth: 50,
              ...rest.rowSelection,
            }
          : rest.rowSelection
      }
      formRef={formRef2}
      pagination={url ? autoPagination : pagination}
      scroll={{ x: scrollX, ...(rest.scroll ?? config.scroll) }}
      columns={newColumns}
      options={{
        reload: false,
        setting: !!persistenceKey2,
        density: false,
        ...rest.options,
      }}
      toolBarRender={toolBarRender}
      onReset={() => {
        // 如果是手动触发请求的，则在重置时，设置成 false，这样就不会触发请求了
        if (rest.manualRequest) {
          setFlagRequest(false);
        }
        rest.onReset?.();
      }}
      onSubmit={(p) => {
        setFlagRequest(true);
        rest.onSubmit?.(p);
      }}
      search={
        !!search !== false && {
          // 添加搜索栏默认行为
          labelWidth: 'auto',
          defaultCollapsed: false,
          optionRender: (searchConfig, formProps, dom) => {
            if (autoRefresh) {
              return [
                <AutoRefresh
                  key="auto"
                  persistenceKey={false}
                  callback={formRef2.current?.submit}
                />,
                ...dom,
              ];
            }

            return dom;
          },
          ...search,
        }
      }
      form={{
        ignoreRules: false, // 减少 required = true 引起的 ignoreRules: false 的默认设置
        ...rest.form,
      }}
      rowClassName={(record, index) =>
        cx(
          {
            [styles.blink]: anchor && record[anchor] === hash,
            // @ts-ignore
          },
          rest.rowClassName?.(record, index),
        )
      }
      // 用于锚点的 id 赋值
      onRow={(r) => ({
        id: r[anchor],
      })}
      // 展开项内容
      expandable={{
        expandedRowKeys: rest.expandedRowKeys || expandedRowKeys,
        onExpandedRowsChange: (ks: any) => {
          setExpandedRowKeys(ks);
        },
        ...rest.expandable,
      }}
    />
  );
}

export default ProTableAsync;
