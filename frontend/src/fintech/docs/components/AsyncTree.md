---
group: 通用
title: AsyncTree
order: 2
---

# AsyncTree

封装 [Tree](https://ant-design.antgroup.com/components/tree-cn) 使其具有异步请求能力

## 代码演示

```jsx
import React, { useState } from 'react';
import { AsyncTree } from 'fintech';

export default () => {
  const [keys, setKeys] = useState('');

  return (
    <AsyncTree
      showLine
      value={keys}
      url="/tree/demo2.json"
      onChange={(a, b, c) => {
        console.log(a);
        setKeys(a);
      }}
    />
  );
};
```

## API

| 参数       | 说明                                               | 类型                           | 默认值 |
| :--------- | :------------------------------------------------- | :----------------------------- | :----- |
| url        | 请求地址，默认是 GET 请求                          | requestUrl                     |        |
| params     | request 额外参数                                   | object                         |        |
| formatData | 数据过滤                                           | function(res)                  |        |
| fields     | 原生的 fieldNames 的简化版                         | `['key', 'title', 'children']` |        |
| dataPath   | 数据路径                                           | string                         |        |
| cache      | 延迟缓存加载，通常用于某个页面有多个相同请求的组件 | boolean                        | false  |
