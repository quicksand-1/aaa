/**
 * 列表数据导出功能
 * API
 *   items
 *     type?: 导出数据的类型，默认是导出当前页，如果是 all，则是分页数据导出
 *     open?: 是否展示，一般配合权限来使用
 *     title?: 按钮文案
 *     filename: 导出的文件名
 *     buttonProps?: 按钮属性
 * PS:
 *   1、当 column.title 是 ReactNode 时，可以新增 column.excelTitle 来代替导出表头的名称
 *
 * todo:
 *   1、如果在后期使用中，一个列表都只有一个导出的需求，那么可以由table组件的 isPagination 来控制是分页导出还是当前页导出
 * */

import { Button, message } from 'antd';
import { JSXElementConstructor, useState } from 'react';
import useAsyncScripts from '../../hooks/useAsyncScripts';
import _filter from '../../utils/_filter';
import fileController from '../../utils/fileController';
import _flattenColumns from '../_flattenColumns';
import queueRequest from './queueRequest';

export default (
  props: any,
): React.ReactElement<any, string | JSXElementConstructor<any>>[] => {
  const {
    url,
    params,
    formatData,
    items = [], // 下载按钮列表
    dataSource = [], // 原始数据
    columns = [], // 表头
    persistenceKey, // 持久化key，是 ProTable 原生的
    defaultExportTitle,
  } = props;

  const [exportLoading, setExportLoading] = useState(false);
  const [loading] = useAsyncScripts(['assets/xlsx.js']);

  const toExcel = (
    data = [],
    name = new Date().getTime(),
    filetype: string,
  ) => {
    fileController.exportToExcel({
      data,
      columns: _flattenColumns({
        columns,
        persistenceKey,
      }),
      filetype,
      filename: name,
    });
  };

  // 数据下载
  const onExport = async (item) => {
    // 分页数据导出
    if (item.type === 'all') {
      let datas: any[] = [];
      setExportLoading(true);
      await queueRequest({
        url,
        params,
        callback({ response = {}, ...res }: any) {
          datas = datas.concat(response.datas || []);
          if (res.finally) {
            if (datas.length === res.total) {
              const d = formatData ? formatData({ datas }) : datas;
              toExcel(d, item.filename, item.filetype);
            } else {
              message.error(
                `错误：数据组装条数不对，可能有失败请求，原始有${res.total}条，实际${datas.length}条`,
                5,
              );
            }
          }
        },
      });
      setExportLoading(false);
    } else {
      toExcel(dataSource, item.filename, item.filetype);
    }
  };

  return _filter(items).map((item) => {
    const title = item.title || defaultExportTitle || '报表导出';

    if (item.exportRef) {
      item.exportRef.current = onExport.bind(null, item);
      return null;
    }
    return (
      <Button
        loading={loading || exportLoading}
        {...item.buttonProps}
        key={title}
        disabled={!dataSource.length}
        onClick={async () => {
          await onExport(item);
        }}
      >
        {title}
      </Button>
    );
  });
};
