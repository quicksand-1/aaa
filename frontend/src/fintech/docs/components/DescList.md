---
group: 通用
title: DescList
order: 7
---

# DescList

封装 [Descriptions](https://ant-design.antgroup.com/components/descriptions-cn)

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { DescList } from 'fintech';

export default () => {
  const data = {
    name: '张三',
    age: 24,
    gender: 'male',
    motto: '以为忙碌的时候不会想你，却是更加的想你。',
    revenue: {
      amount: 20000000,
    },
    lifeProgress: 50,
    lifeProgress2: 0.5,
    status: {
      desc: '初始化',
      code: 'init',
    },
    luck: {
      desc: '幸运',
      code: 'succ',
    },
    boolean: true,
  };

  return (
    <DescList
      bordered
      column={2}
      dataSource={{
        ...data,
        json: JSON.stringify(data),
      }}
      columns={[
        {
          title: '姓名',
          dataIndex: 'name',
          open: ({ column, dataSource }) => {
            console.log('column', column);
            console.log('dataSource', dataSource);
            return true;
          },
        },
        {
          title: '年龄',
          dataIndex: 'age',
        },
        {
          title: '性别',
          tooltip: '世界只有两种性别，天王老子来了也只有两种',
          dataIndex: 'gender',
          valueEnum: { female: '女性', male: '男性' },
        },
        {
          title: '年收入',
          dataIndex: ['revenue', 'amount'],
          valueType: 'money',
          valueEnum: '元',
        },
        {
          title: '人生状态',
          dataIndex: 'status.code',
          valueType: 'badge',
          valueEnum: {
            init: { text: '初始化', status: 'Processing' },
          },
        },
        {
          title: '气运状态',
          dataIndex: 'luck.code',
          valueType: 'tag',
          valueEnum: {
            succ: { text: '幸运', status: 'Success' },
          },
        },
        {
          title: '人生进度',
          dataIndex: 'lifeProgress',
          valueType: 'percent',
        },
        {
          title: '人生进度2',
          dataIndex: 'lifeProgress2',
          valueType: 'percent*100',
        },
        {
          title: '布尔',
          dataIndex: 'boolean',
          valueType: 'boolean',
        },
        {
          span: 2,
          title: '座右铭',
          dataIndex: 'motto',
          copyable: true,
        },
        {
          span: 2,
          title: 'JSON',
          dataIndex: 'json',
          valueType: 'jsonCode',
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: 多数据源
 */
import React from 'react';
import { DescList } from 'fintech';

export default () => {
  const data = [
    {
      name: '张三',
      age: 24,
      gender: 'male',
    },
    {
      motto: '在你最虚弱的时候，最强版本的你正在准备登场。',
      revenue: {
        amount: 20000000,
      },
      lifeProgress: 50,
      lifeProgress2: 0.5,
    },
  ];

  return (
    <DescList
      bordered
      column={2}
      dataSource={data}
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
          title: '性别',
          dataIndex: 'gender',
          valueEnum: { female: '女性', male: '男性' },
        },
        {
          sourceIndex: 1,
          title: '年收入',
          dataIndex: ['revenue', 'amount'],
          valueType: 'money',
        },
        {
          sourceIndex: 1,
          title: '人生进度',
          dataIndex: 'lifeProgress',
          valueType: 'percent',
        },
        {
          sourceIndex: 1,
          title: '人生进度2',
          dataIndex: 'lifeProgress2',
          valueType: 'percent*100',
        },
        {
          sourceIndex: 1,
          span: 2,
          title: '座右铭',
          dataIndex: 'motto',
          copyable: true,
        },
      ]}
    />
  );
};
```

```jsx
/**
 * title: 异步数据
 */
import React, { useRef } from 'react';
import { Button } from 'antd';
import { DescList } from 'fintech';

export default () => {
  const actionRef = useRef();

  return (
    <DescList
      actionRef={actionRef}
      title={
        <Button onClick={() => actionRef.current.reload()}>重新加载</Button>
      }
      url="/descList/demo.json"
      columns={[
        {
          title: 'Name',
          dataIndex: 'name',
          open: ({ column, dataSource }) => {
            console.log('column', column);
            console.log('dataSource', dataSource);
            return true;
          },
        },
        { title: 'IP', dataIndex: 'ip' },
        { title: 'Time', dataIndex: 'time' },
        { title: 'Color', dataIndex: 'color' },
      ]}
    />
  );
};
```

```jsx
/**
 * title: tooltip 用法
 */
import React from 'react';
import { DescList } from 'fintech';

export default () => {
  return (
    <DescList
      bordered
      column={2}
      dataSource={{
        name: '张三',
      }}
      columns={[
        {
          title: '无提示',
          dataIndex: 'name',
        },
        {
          title: '字符串提示',
          dataIndex: 'name',
          tooltip: '字符串类型的提示',
        },
        {
          title: 'ReactNode提示',
          dataIndex: 'name',
          tooltip: <div>ReactNode 类型的提示</div>,
        },
        {
          title: '对象提示',
          dataIndex: 'name',
          tooltip: {
            title: '对象类型的提示',
          },
        },
        {
          title: '函数返回字符串',
          dataIndex: 'name',
          tooltip: (res) => res.name,
        },
        {
          title: '函数返回对象',
          dataIndex: 'name',
          tooltip: (res) => ({
            title: res.name,
          }),
        },
      ]}
    />
  );
};
```

## API

| 参数         | 说明       | 类型               | 默认值 |
| :----------- | :--------- | :----------------- | :----- |
| dataSource   | 源数据     | object \| object[] |        |
| defaultValue | 空值填充   | string             | -      |
| columns      | 配置描述列 | ColumnsType[]      |        |

### Column

| 参数        | 说明                                                 | 类型                                                                  | 默认值 |
| :---------- | :--------------------------------------------------- | :-------------------------------------------------------------------- | :----- |
| title       | 显示文字                                             | ReactNode                                                             |        |
| dataIndex   | 列数据在数据项中对应的路径，支持通过数组查询嵌套路径 | string \| string[]                                                    |        |
| span        | 一行中所占格数                                       | number                                                                | 1      |
| open        | 是否展示                                             | boolean \| ({ column, dataSource }) => boolean                        | true   |
| sourceIndex | 源数据下标，当 dataSource 是数组时生效               | number                                                                | 0      |
| render      | 自定义渲染函数                                       | function(text, record) {}                                             |        |
| copyable    | 复制功能，值必须是字符串                             | boolean                                                               | false  |
| valueType   | 值类型                                               | ValueType                                                             |        |
| valueEnum   | 值枚举，不同的值类型，作用不同                       | any                                                                   |        |
| tooltip     | 配置提示信息                                         | ReactNode \| Function(record) \| `TooltipProps & { icon: ReactNode }` |        |

### ValueType ==> ValueEnum

| valueType    | 说明                                                                       | valueEnum                                                            | 说明                                             |
| :----------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------- | :----------------------------------------------- |
| money        | 金额                                                                       | ￥                                                                   | 金额单位。符号类型的会在前面，中文类型的会在后面 |
| jsonCode     | json 数据展示                                                              |                                                                      |                                                  |
| percent      | 会把值转成百分比展示                                                       |                                                                      |                                                  |
| percent\*100 | 会把值乘以 100 后做百分比展示，`* 符号后面可以是其他数值，比如 percent*50` |                                                                      |                                                  |
| percent/100  | 会把值除以 100 后做百分比展示，`/ 符号后面可以是其他数值，比如 percent/50` |                                                                      |                                                  |
|              |                                                                            | object                                                               | 值会从枚举中进行匹配展示                         |
| badge        | 状态点                                                                     | [参考](/components/status-badge#docs-components-status-badge-demo-0) |                                                  |

## 异步 API

| 参数          | 说明       | 类型             | 默认值 |
| :------------ | :--------- | :--------------- | :----- |
| url           | 请求地址   | string           |        |
| params        | 请求参数   | object           |        |
| dataPath      | 数据路径   | string           |        |
| manualRequest | 手动触发   | boolean          | false  |
| formatData    | 自定义数据 | function(data){} |        |
| actionRef     | ref        | Ref              |        |

### Ref

- reload：重新触发请求
