---
group: 通用
title: Dnd
order: 7
---

# Dnd

对 `react-dnd` 进行封装，使其可以更简易的使用

## 依赖安装

```bash
npm install react-dnd react-dnd-html5-backend immutability-helper
```

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useState } from 'react';
import Dnd from 'fintech/Dnd';

export default () => {
  const [data, setData] = useState([
    { key: 'purple-1', value: 'purple-1' },
    { key: 'purple-2', value: 'purple-2' },
    { key: 'purple-3', value: 'purple-3' },
    { key: 'purple-4', value: 'purple-4' },
    { key: 'purple-5', value: 'purple-5' },
    { key: 'purple-6', value: 'purple-6' },
  ]);

  return (
    <Dnd
      data={data}
      rowKey="key"
      type="dnd-demo2"
      setValue={(rs) => {
        setData(rs);
      }}
      originNode={(i) => (
        <div
          style={{
            padding: '4px 8px',
            margin: '2px 0',
            borderRadius: 2,
            border: '1px dashed #ccc',
          }}
        >
          {i.value}
        </div>
      )}
    />
  );
};
```

## API

| 参数       | 说明                                 | 类型                         | 默认值 |
| :--------- | :----------------------------------- | :--------------------------- | :----- |
| data       | 源数据                               | object[]                     |        |
| rowKey     | 数据唯一键                           | string                       |        |
| type       | 拖拽类型，不同的拖拽组件需要进行区别 | string                       |        |
| setValue   | 拖拽后的回调函数                     | Function(List)               |        |
| originNode | 需要渲染的子元素                     | (record, index) => ReactNode |        |
