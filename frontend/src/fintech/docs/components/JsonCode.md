---
group: 通用
title: JsonCode
order: 15
---

简易版 json 格式化展示组件

## 代码演示

```jsx
/**
 * title: 对象用法
 */
import React from 'react';
import { JsonCode } from 'fintech';

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
};

export default () => {
  return <JsonCode data={data} />;
};
```

```jsx
/**
 * title: 字符串用法
 */
import React, { useState } from 'react';
import { Input } from 'antd';
import { JsonCode } from 'fintech';

export default () => {
  const [value, setValue] = useState('');

  return (
    <>
      <Input.TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="请输入可行的json"
      />
      <JsonCode data={value} />
    </>
  );
};
```
