---
group: 通用
title: ProTableAsync
order: 22
---

# ProTableAsync

> 封装 [ProTable](https://pro-components.antdigital.dev/components/table)，并添加了一些额外的特性

## 组件资源依赖

> 数据导出功能依赖 xlsx.js，请确保项目的 public/assets/<a href="/assets/xlsx.js" download="xlsx.js">xlsx.js</a> 有该资源

## 代码演示

```jsx
/**
 * title: 日期类型联动
 */
import React from 'react';
import { ProTableAsync } from 'fintech';

const DateMap = {
  ENUM: {
    DATE: '日',
    WEEK: '周',
    MONTH: '月',
    QUARTER: '季',
    YEAR: '年',
  },
  PICKER: {
    DATE: 'date',
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
  },
  FORMAT: {
    DATE: 'YYYY-MM-DD',
    WEEK: 'YYYY-WW',
    MONTH: 'YYYY-MM',
    QUARTER: 'YYYY-Q',
    YEAR: 'YYYY',
  },
};
export default () => {
  return (
    <ProTableAsync
      tableRender={() => null}
      beforeSearchSubmit={(v) => console.log(v)}
      columns={[
        {
          search: true,
          required: true,
          title: '日期类型',
          dataIndex: 'dataType',
          valueType: 'select',
          valueEnum: DateMap.ENUM,
        },
        {
          search: true,
          title: '日期',
          dataIndex: 'date',
          valueType: 'date',
          dependencies: ['dataType'],
          fieldProps: (form) => {
            const dataType = form.getFieldValue('dataType');
            const picker = dataType?.toLowerCase(); // 将类型转成小写字母，正好是 picker 的值

            return {
              picker: picker,
              format: DateMap.FORMAT[dataType],
            };
          },
        },
        {
          title: '日期范围',
          dataIndex: 'dateRange',
          valueType: 'dateRange',
          dependencies: ['dataType'],
          search: {
            transform: (v) => ({
              startDate: v[0],
              endDate: v[1],
            }),
          },
          fieldProps: (form) => {
            const dataType = form.getFieldValue('dataType');
            const picker = dataType?.toLowerCase();

            return {
              picker: picker,
              format: DateMap.FORMAT[dataType],
            };
          },
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: 初始化参数加载
 * description: 从 LinkBtn 组件跳转过来
 */
import React, { useEffect, useRef } from 'react';
import { ProTableAsync, getUrlParams, LinkBtn } from 'fintech';

export default () => {
  const formRef = useRef();

  /**
   * 初始化时如果是跳转过来的，则查看是否有参数可使用，如果有则进行列表数据请求
   */
  useEffect(() => {
    const params = getUrlParams({ key: 'TASK', destroy: true });
    if (params.taskName) {
      formRef.current?.setFieldsValue(params);
      // 表单异步处理，否则 submit 时无法拿到上面设置的参数
      setTimeout(() => {
        formRef.current?.submit();
      }, 100);
    }
  }, []);

  return (
    <ProTableAsync
      manualRequest
      formRef={formRef}
      search={{ span: 6 }}
      url="/table/demo2.json"
      columns={[
        {
          search: true,
          required: true,
          title: '任务名称',
          dataIndex: 'taskName',
        },
        {
          search: true,
          title: '任务状态',
          dataIndex: 'status',
          valueEnum: {
            init: { text: '初始', status: 'Processing' },
            exec: { text: '执行', status: 'Processing' },
            wait: { text: '等待结果', status: 'Processing' },
            succ: { text: '成功', status: 'Success' },
            fail: { text: '失败', status: 'Error' },
            ignore: { text: '忽略', status: 'Default' },
          },
        },
        {
          valueType: 'option',
          render: (_, record) => [
            <LinkBtn color="green" key="detail">
              查看
            </LinkBtn>,
            <LinkBtn key="edit">编辑</LinkBtn>,
            <LinkBtn color="red" key="remove">
              删除
            </LinkBtn>,
          ],
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: 搜索项多选一模式
 * description: 通过requiredOne参数内置实现
 */
import React from 'react';
import { ProTableAsync } from 'fintech';

export default () => {
  return (
    <ProTableAsync
      manualRequest
      url="/table/demo3.json"
      columns={[
        {
          search: true,
          hideInTable: true,
          title: '唯一',
          dataIndex: 'only',
          valueType: 'select',
          valueEnum: { true: '是', false: '否' },
        },
        {
          requiredOne: true,
          search: true,
          hideInTable: true,
          title: '业务日期',
          dataIndex: 'acctDate',
        },
        {
          requiredOne: true,
          search: true,
          hideInTable: true,
          title: '资金来源',
          dataIndex: 'providerId',
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
        },
        {
          title: '任务状态',
          dataIndex: 'status',
          valueEnum: {
            init: { text: '初始', status: 'Processing' },
            exec: { text: '执行', status: 'Processing' },
            wait: { text: '等待结果', status: 'Processing' },
            succ: { text: '成功', status: 'Success' },
            fail: { text: '失败', status: 'Error' },
            ignore: { text: '忽略', status: 'Default' },
          },
        },
      ]}
      beforeSearchSubmit={(p, { requiredOne }) => {
        if (p.only === 'true') {
          return p;
        }

        return requiredOne;
      }}
    />
  );
};
```

```jsx
/**
 * title: 导出及位置定义
 */
import React, { useState, useRef } from 'react';
import { Button } from 'antd';
import { ProTableAsync, RadioList } from 'fintech';

export default () => {
  const exportRef = useRef();
  const [exportItemsPosition, setExportItemsPosition] = useState('unshift');

  return (
    <>
      <RadioList
        value={exportItemsPosition}
        options={{ unshift: '报表导出在左边', push: '报表导出在右边' }}
        onChange={(e) => {
          setExportItemsPosition(e.target.value);
        }}
      />
      <ProTableAsync
        autoRefresh
        url="/table/demo4.json"
        exportItemsPosition={exportItemsPosition}
        exportItems={[
          { filename: 'excel导出', title: 'excel导出' },
          { filename: 'csv导出', filetype: 'csv', title: 'csv导出' },
          { filename: '自定义控制导出', exportRef, filetype: 'csv' },
          { filename: '默认导出' },
        ]}
        toolBarRender={() => [
          <Button key="add" type="primary">
            新增
          </Button>,
          <Button key="export" onClick={() => exportRef.current()}>
            自定义导出
          </Button>,
        ]}
        columns={[
          {
            title: '姓名',
            dataIndex: 'name',
          },
          {
            title: '年龄',
            dataIndex: 'age',
          },
          {
            title: '地址',
            dataIndex: 'address',
          },
          {
            title: '布尔',
            dataIndex: 'boolean',
            valueType: 'boolean',
          },
        ]}
      />
    </>
  );
};
```

`exportRef` 用于把组件内部的导出方法暴露给外部自定义按钮。运行时它不强依赖 React 的 ref 实现，只要传入的对象可以被写入 `current` 属性即可；但这个对象必须是稳定的，不能在每次渲染时都重新创建，因此推荐使用 `useRef()`，或者使用一个稳定的 `{ current: null }` 对象。不建议直接在 JSX 中传临时的 `{}`。

```jsx
/**
 * title: 自定义内容区域
 */
import React from 'react';
import { ProTableAsync, LinePro, regexp } from 'fintech';

export default () => {
  return (
    <ProTableAsync
      manualRequest
      headerTitle={false}
      url="/charts/line.json"
      columns={[
        {
          title: '项目',
          dataIndex: 'prod',
          fieldProps: {
            placeholder: '可以输入项目编号 / 项目名称',
          },
          search: {
            transform: (v) => {
              if (regexp.EN.test(v)) {
                return { prodCode: v };
              }
              return { prodName: v };
            },
          },
        },
      ]}
      tableRender={() => null}
      tableExtraRender={(props, dataSource) => {
        if (dataSource.length > 0) {
          return (
            <LinePro
              data={dataSource}
              label={{
                // point 上的值展示格式化
                formatter: (t) => `${(+t / 100000000).toFixed(2)}亿`,
              }}
              fields={['terms', 'value']}
              xAxisFormatter={(v) => v + 1}
              yAxisFormatter={(v) => `${+v / 100000000}亿`}
              tooltipTitle={false}
              tooltipItems={[
                {
                  field: 'terms',
                  name: '期次',
                  valueFormatter: (v) => `第 ${v + 1} 期`,
                },
                /**
                 * name：可以设置该字段的别名，呈现在左边
                 * valueFormatter：可以转义对应 field 字段的值，呈现在右边
                 */
                {
                  field: 'value',
                  name: '净值',
                  valueFormatter: (v) => `${(+v / 100000000).toFixed(6)}亿`,
                },
              ]}
            />
          );
        }
      }}
    />
  );
};
```

```jsx
/**
 * title: 测试用例：虚拟列表+宽度自适应
 */
import React, { useState } from 'react';
import { ProTableAsync, RadioList } from 'fintech';

const CASE_LIST = [
  // 用例1
  {
    rowKey: 'name',
    columns: [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Age', dataIndex: 'age' },
      { title: 'Address', dataIndex: 'address' },
      { valueType: 'option', width: 80, render: () => [<a key="a">查看</a>] },
    ],
    dataSource: [
      { name: 'John Brown', age: '32', address: 'New York No.1 Lake Park' },
      { name: 'Jim Green', age: '42', address: 'London No.1 Lake Park' },
      { name: 'Joe Black', age: '32', address: 'Sydney No.1 Lake Park' },
    ],
  },

  // 用例2
  {
    rowKey: 'name',
    columns: [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Age', dataIndex: 'age' },
      { title: 'Address', dataIndex: 'address' },
      { valueType: 'option', width: 80, render: () => [<a key="a">查看</a>] },
    ],
    dataSource: Array.from({ length: 49 }).map((_, index) => ({
      name: `John ${index} Brown`,
      age: `${index}`,
      address: `New York No. ${index} Lake Park`,
    })),
  },

  // 用例3
  {
    url: '/table/demo2.json',
    columns: [
      { title: '任务名称', dataIndex: 'taskName' },
      {
        title: '任务状态',
        dataIndex: 'status',
        valueEnum: {
          init: { text: '初始', status: 'Processing' },
          exec: { text: '执行', status: 'Processing' },
          wait: { text: '等待结果', status: 'Processing' },
          succ: { text: '成功', status: 'Success' },
          fail: { text: '失败', status: 'Error' },
          ignore: { text: '忽略', status: 'Default' },
        },
      },
    ],
  },

  // 用例4
  {
    url: '/table/demo6/4.json',
    columns: [
      {
        title: '项目编号',
        dataIndex: 'planNo',
      },
      {
        title: '项目名称',
        dataIndex: 'planName',
      },
      {
        title: '项目类型',
        dataIndex: 'planType',
      },
      {
        title: '产品规模',
        dataIndex: 'totalAmt',
      },
      {
        width: 240,
        title: '机构邮箱',
        dataIndex: 'orgEmail',
      },
      {
        title: '起息日',
        dataIndex: 'effectDate',
      },
      {
        title: '转付日',
        dataIndex: 'payDate',
      },
      {
        title: '分配日',
        dataIndex: 'allotDate',
      },
      {
        title: '计费结束日',
        dataIndex: 'calcFeeEndDate',
      },
      {
        title: '年天数',
        dataIndex: 'yearDays',
      },
      {
        title: '停止注水日',
        dataIndex: 'transEndDate',
      },
      {
        title: '资产到期日',
        dataIndex: 'endDate',
      },
    ],
  },

  // 用例5
  {
    rowKey: 'key',
    columns: [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 100,
        fixed: 'left',
        filters: [
          {
            text: 'Joe',
            value: 'Joe',
          },
          {
            text: 'John',
            value: 'John',
          },
        ],
        onFilter: (value, record) => record.name.indexOf(value) === 0,
      },
      {
        title: 'Other',
        children: [
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            width: 150,
            sorter: (a, b) => a.age - b.age,
          },
          {
            title: 'Address',
            children: [
              {
                title: 'Street',
                dataIndex: 'street',
                key: 'street',
                width: 150,
              },
              {
                title: 'Block',
                children: [
                  {
                    title: 'Building',
                    dataIndex: 'building',
                    key: 'building',
                    width: 100,
                  },
                  {
                    title: 'Door No.',
                    dataIndex: 'number',
                    key: 'number',
                    width: 100,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Company',
        children: [
          {
            title: 'Company Address',
            dataIndex: 'companyAddress',
            key: 'companyAddress',
            width: 200,
          },
          {
            title: 'Company Name',
            dataIndex: 'companyName',
            key: 'companyName',
          },
        ],
      },
      {
        title: 'Gender',
        dataIndex: 'gender',
        key: 'gender',
        width: 80,
        fixed: 'right',
      },
    ],
    dataSource: Array.from({ length: 100 }).map((_, i) => ({
      key: i,
      name: 'John Brown',
      age: i + 1,
      street: 'Lake Park',
      building: 'C',
      number: 2035,
      companyAddress: 'Lake Street 42',
      companyName: 'SoftLake Co',
      gender: 'M',
    })),
  },
];

export default () => {
  const [caseNo, setCaseNo] = useState('0');

  return (
    <>
      <RadioList
        value={caseNo}
        options={{ 0: '用例1', 1: '用例2', 2: '用例3', 3: '用例4', 4: '用例5' }}
        onChange={(e) => setCaseNo(e.target.value)}
      />
      <br />
      <ProTableAsync key={caseNo} search={false} {...CASE_LIST[caseNo]} />
    </>
  );
};
```

```jsx
/**
 * title: 数据锚点
 */
import React from 'react';
import { ProTableAsync } from 'fintech';

export default () => {
  return (
    <>
      <a
        href="/docs/~demos/docs-components-pro-table-async-demo-demo7#ASSET_TRADE_GRANT_REVERSAL"
        target="_blank"
      >
        锚点演示
      </a>
      <ProTableAsync
        anchor="code"
        search={false}
        virtual={false}
        scroll={{ y: null }}
        url="/table/demo7.json"
        columns={[
          {
            title: '业务事件编码',
            dataIndex: 'code',
          },
          {
            title: '业务事件名称',
            dataIndex: 'name',
          },
        ]}
      />
    </>
  );
};
```

```jsx
/**
 * title: formItemRender 联动
 */
import React from 'react';
import { ProTableAsync, SelectList } from 'fintech';

export default () => {
  return (
    <ProTableAsync
      tableRender={() => null}
      columns={[
        {
          title: '机构',
          dataIndex: 'orgCode',
          search: true,
          hideInTable: true,
          fieldProps: (form) => {
            return {
              onChange() {
                form.setFieldsValue({ projNo: null });
              },
            };
          },
          formItemRender: () => (
            <SelectList
              allowClear
              url="/table/demo8/1.json"
              placeholder="请选择机构"
              fields={['orgCode', 'orgName']}
            />
          ),
        },
        {
          required: false,
          search: true,
          hideInTable: true,
          title: '项目',
          dataIndex: 'projNo',
          dependencies: ['orgCode'],
          formItemRender: (item, _, form) => {
            const orgCode = form.getFieldValue('orgCode');

            return (
              <SelectList
                allowClear
                key={orgCode}
                trigger="focus"
                disabled={!orgCode}
                url="/table/demo8/2.json"
                fields={['projNo', 'projName']}
                params={{ orgCode }}
              />
            );
          },
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: 搜索项列宽修改
 */

/**
 * 搜索项列大小
 * @PS：一个表单项占用的格子数量，占比 = colSize*span，colSize默认为 1 ，span为 8，span是form={{span:8}}全局设置的
 * 在 ProTable 组件中，使用 search={ span: 4 }
 */
import React from 'react';
import { ProTableAsync } from 'fintech';

export default () => {
  return (
    <ProTableAsync
      // 默认 span=8，则一排是3个搜索元素；
      search={{ span: 4 }}
      tableRender={() => null}
      columns={[
        {
          search: true,
          hideInTable: true,
          title: '抽样场景',
          valueEnum: {
            FIRST_BUY: '首次购买',
            CYCLE_BUY: '循环购买',
            DAY_END: '日终资产',
          },
          dataIndex: 'samplingType',
        },
        {
          hideInTable: true,
          search: {
            transform: (v) => v?.toString(),
          },
          colSize: 2,
          title: '资金包范围',
          dataIndex: 'poolNoes',
          valueType: 'select',
          valueEnum: ['资金包1/存续中', '资金包2/进行中', '资金包3/已结束'],
          fieldProps: {
            mode: 'multiple',
          },
        },
        {
          search: true,
          hideInTable: true,
          title: '抽样状态',
          dataIndex: ['status', 'code'],
          valueEnum: {
            PROCESSING: { text: '执行中', status: 'Processing' },
            FINISHED: { text: '完成', status: 'Success' },
          },
          formItemProps: {
            name: 'status',
          },
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: 批量操作
 */

/**
 * 批量操作，不同于原生的 Table
 * 1、可以使用 rowSelection 原生方式来实现批量操作
 * 2、使用 ProTable 的批量操作，关键 API：tableAlertRender、tableAlertOptionRender
 */
import React from 'react';
import { Flex } from 'antd';
import { ProTableAsync, LinkBtn } from 'fintech';

export default () => {
  return (
    <ProTableAsync
      rowSelection={{ columnWidth: 60 }}
      search={false}
      dataSource={[
        {
          id: 1,
          gmtModified: '2025-11-03 15:13:10',
          isEff: 'Y',
          jobName: '系统任务1',
          memo: '系统指标总控任务',
        },
        {
          id: 2,
          gmtModified: '2025-11-03 15:13:10',
          isEff: 'Y',
          jobName: '系统任务2',
          memo: '系统指标总控任务',
        },
      ]}
      columns={[
        {
          title: '任务名称',
          dataIndex: 'jobName',
        },
        {
          title: '备注',
          dataIndex: 'memo',
        },
        {
          title: '任务状态',
          dataIndex: 'isEff',
          valueType: 'select',
          valueEnum: {
            N: { text: '已关闭', status: 'Error' },
            Y: { text: '已开启', status: 'Success' },
          },
        },
      ]}
      // 自定义批量操作工具栏左侧信息区域，false 时不显示
      tableAlertRender={({
        selectedRowKeys,
        selectedRows,
        onCleanSelected,
      }) => {
        return (
          <Flex gap={8}>
            <span>已选 {selectedRowKeys.length} 项</span>
            <LinkBtn warn onClick={onCleanSelected}>
              取消选择
            </LinkBtn>
          </Flex>
        );
      }}
      // 自定义批量操作工具栏右侧选项区域，false 时不显示
      tableAlertOptionRender={({
        selectedRowKeys,
        selectedRows,
        onCleanSelected,
      }) => {
        return (
          <Flex gap={8}>
            <LinkBtn>批量启动</LinkBtn>
            <LinkBtn>批量暂停</LinkBtn>
          </Flex>
        );
      }}
    />
  );
};
```

```jsx
/**
 * title: valueType 展示
 */
import React from 'react';
import { ProTableAsync } from 'fintech';

export default () => {
  return (
    <ProTableAsync
      search={false}
      dataSource={[
        {
          id: 1,
          aidAgencySubAmount: 10000.11,
          writeOffPrinBal: { amount: 20000.22 },
          encashAmt: { amount: 30000.33 },
        },
      ]}
      columns={[
        {
          title: '金额1',
          dataIndex: 'aidAgencySubAmount',
        },
        {
          title: '金额2',
          dataIndex: 'writeOffPrinBal',
        },
        {
          title: '金额3',
          dataIndex: 'encashAmt',
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: url 翻页控制
 */
import React from 'react';
import { ProTableAsync } from 'fintech';

export default () => {
  return (
    <ProTableAsync
      search={false}
      url="/table/demo9.json"
      pagination={{
        defaultPageSize: 50,
      }}
      columns={[
        {
          title: '数据集名称',
          dataIndex: 'name',
        },
        {
          title: '数据集描述',
          dataIndex: 'desc',
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: dataSource 翻页控制
 */
import React from 'react';
import { ProTableAsync } from 'fintech';

export default () => {
  return (
    <ProTableAsync
      search={false}
      pagination={{
        defaultPageSize: 50,
      }}
      dataSource={Array.from({ length: 1000 }).map((_, i) => ({
        id: i,
        name: `数据集${i}`,
        desc: `描述${i}`,
      }))}
      columns={[
        {
          title: '数据集名称',
          dataIndex: 'name',
        },
        {
          title: '数据集描述',
          dataIndex: 'desc',
        },
      ]}
    />
  );
};
```

## API

| 参数                | 说明                                                                              | 类型                                             | 默认值  |
| :------------------ | :-------------------------------------------------------------------------------- | :----------------------------------------------- | :------ |
| rowKey              | 数据唯一标识，如果 request 请求来的数据中没有 rowKey 的值，则由组件自动生成随机数 | string                                           | id      |
| url                 | 请求地址                                                                          | string                                           |         |
| extraParams         | 请求的额外入参                                                                    | object                                           |         |
| formatData          | 请求成功后的数据格式化，必须返回列表渲染的数据                                    | ({ datas, dataObject, mergeParams }) => record[] |         |
| mergeDataIndex      | 需要单元格合并的 dataIndex，目前只会针对纵向进行合并                              | dataIndex[ ]                                     |         |
| persistenceKey      | 持久化秘钥，当设置时会自动打开 `option.setting`                                   |                                                  | string  |
| exportItems         | 在 toolBarRender 中自定义的项，在这里用来做数据导出的功能                         | [ExportItemProps](#exportitemprops)              |         |
| exportItemsPosition | 导出按钮位于 toolBarRender 的位置 unshift=左边、push=右边                         | `unshift \| push`                                | unshift |
| anchor              | 锚点滚动；path 中的锚点内容等于源数据中 anchor 对应的值                           | string                                           |         |
| requestProps        | 自定义请求属性                                                                    | request.options                                  |         |
| autoRefresh         | 是否有自动刷新按钮                                                                | boolean                                          | false   |
| fields              | 字段映射                                                                          | [FieldsProps](#fieldsprops)                      |         |

### ExportItemProps

> 数据导出的配置属性

| 参数        | 说明                                                                                                                        | 类型             | 默认值 |
| :---------- | :-------------------------------------------------------------------------------------------------------------------------- | :--------------- | :----- |
| title       | 按钮文案                                                                                                                    | string           |        |
| filetype    | 文件类型                                                                                                                    | `xlsx \| csv`    | xlsx   |
| filename    | 导出后的文件名，如果不写，会读取 headerTitle 作为导出的文件名                                                               | string           |        |
| type        | 是否导出分页的全部数据，all 时内部会自动进行分页数据查询和数据合并                                                          | `all \| single`  | single |
| open        | 是否展示                                                                                                                    | boolean          | true   |
| buttonProps | Button 按钮属性                                                                                                             | ButtonProps      |        |
| exportRef   | 用于把导出方法挂到 `exportRef.current` 供外部触发；推荐使用 `useRef()` 或稳定的 `{ current: null }` 对象，不建议传临时 `{}` | MutableRefObject |        |

### FieldsProps

> 组件内部数据字段的映射

| 参数       | 说明     | 类型   | 默认值     |
| :--------- | :------- | :----- | :--------- |
| dataSource | 数据源   | string | datas      |
| total      | 总数据量 | string | total      |
| current    | 当前页码 | string | currPageNo |
| pageSize   | 页数     | string | pageSize   |

## PS

1. `beforeSearchSubmit<(params: Partial<U>) => any>` 属性在搜索的时候会触发，但是翻页的时候不会触发

   ```js
   beforeSearchSubmit: (params, { requiredOne }) => {
     // requiredOne 是搜索项多选一的特有参数，当业务需要时，可返回该参数
     return requiredOne; // 内部会对 search 参数进行判断
   };
   ```

2. 在使用 expandable.expandAll 特性时，组件会自动控制展开所有项，如果需要自己控制，则正常使用 expandable 中的 api，不要使用
   expandAll
3. 设置 persistenceKey 时，会自动展示 setting 功能
4. 当需要动态设置 columns 时，请使用 `onDataSourceChange<(dataSource: T[]) => void>` 接口
5. 如何进行页面初始化数据请求？

   ```js
   formRef.current?.setFieldsValue(params);
   // 表单异步处理，否则 submit 时无法拿到上面设置的参数
   setTimeout(() => {
     formRef.current?.submit();
   }, 100);
   ```

## FAQ

### Q: 开启虚拟滚动和合并单元格的情况下，dataSource 频繁改动会报底层代码错误？

**A:** 这主要是 antd 的 Table 组件在渲染时对高度计算造成的错误问题。当同时启用虚拟滚动和单元格合并功能，并且 dataSource 频繁变化时，antd Table 组件内部的高度计算逻辑可能会出现异常，导致渲染错误。

**解决方案：**

1. 如果业务场景允许，建议在 dataSource 频繁变动时暂时关闭虚拟滚动功能
2. 或考虑减少单元格合并的使用，特别是在数据频繁变化的场景
3. 可以尝试使用防抖或节流的方式减少 dataSource 的更新频率
4. 对于必须同时使用的场景，可以考虑在 dataSource 变化时给 Table 组件添加一个 key 属性，强制重新渲染整个组件
