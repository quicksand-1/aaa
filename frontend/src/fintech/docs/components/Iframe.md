---
group: 通用
title: Iframe
order: 13
---

# Iframe

有 loading 效果的 iframe

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { Iframe } from 'fintech';

export default () => {
  return <Iframe src="http://dev.www.abssqr.cn" />;
};
```

## API

| 参数   | 说明     | 类型   | 默认值 |
| :----- | :------- | :----- | :----- |
| src    | 网页地址 | string |        |
| height | 高度     | string | 100vh  |
