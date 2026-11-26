---
group: 通用
title: AutoRefresh
order: 1
---

# AutoRefresh

自动刷新组件

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { message } from 'antd';
import { AutoRefresh } from 'fintech';

export default () => {
  return (
    <AutoRefresh
      interval={10}
      persistenceKey="refresh"
      callback={() => {
        message.success('刷新啦...');
      }}
    />
  );
};
```

## API

| 参数           | 说明                                    | 类型            | 默认值            |
| :------------- | :-------------------------------------- | :-------------- | :---------------- |
| callback       | 倒计时结束时触发的函数                  | function        |                   |
| interval       | 倒计时秒数                              | number          | 10                |
| persistenceKey | 持久化标识，设置为 false 时持久化会失效 | string \| false | location.pathname |
