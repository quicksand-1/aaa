---
group: 通用
title: SplitterBox
order: 20
---

# SplitterBox

封装 [Splitter](https://ant.design/components/splitter-cn/) ，使其支持 `items` 写法

## 代码演示

```jsx
/**
 * title: items 用法
 */
import React from 'react';
import { SplitterBox } from 'fintech';

const boxStyle = {
  padding: 12,
  background: '#f5f5f5',
  boxSizing: 'border-box',
  height: '100%',
};

export default () => {
  return (
    <SplitterBox
      style={{ height: 360 }}
      items={[
        {
          key: 'left',
          defaultSize: 240,
          min: 160,
          children: <div style={boxStyle}>左侧筛选区</div>,
        },
        {
          key: 'right',
          splitter: {
            orientation: 'vertical',
            items: [
              {
                key: 'top',
                children: <div style={boxStyle}>右上内容区</div>,
              },
              {
                key: 'bottom',
                defaultSize: '35%',
                min: 120,
                collapsible: true,
                children: <div style={boxStyle}>右下详情区</div>,
              },
            ],
          },
        },
      ]}
    />
  );
};
```

## API

支持原生 `Splitter` 的大部分容器 API，但仅支持 `items` 写法

| 参数  | 说明     | 类型                | 默认值 |
| :---- | :------- | :------------------ | :----- |
| items | 面板配置 | `SplitterBoxItem[]` |        |

### SplitterBoxItem

支持原生 `Splitter.Panel` API

| 参数     | 说明               | 类型               | 默认值 |
| :------- | :----------------- | :----------------- | :----- |
| key      | 唯一标识           | `React.Key`        |        |
| open     | 是否展示           | `boolean`          | true   |
| children | 面板内容           | `ReactNode`        |        |
| splitter | 嵌套的 SplitterBox | `SplitterBoxProps` |        |

## FAQ

1. 为什么不支持原生子节点写法？

   - `SplitterBox` 的目标就是提供 `items` 语法糖；如果你想直接写 `Splitter.Panel`，请直接使用 antd 的 `Splitter`
