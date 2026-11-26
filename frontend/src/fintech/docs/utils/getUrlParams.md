---
group: 工具
toc: content
order: 7
---

# getUrlParams

获取参数

## 代码演示

```jsx
/**
 * title: 通过 localstorage 获取参数
 * description: 设置为 true 时获取缓存中的参数，只能消费一次，刷新页面后失效
 */
import React, { useState, useEffect } from 'react';
import { Space, Input, Button, message } from 'antd';
import { getUrlParams } from 'fintech';

export default () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const params = getUrlParams({ key: 'PAGE_PARAMS', destroy: true });
    setData(params);
  }, []);

  return `localstorage 类型参数：${JSON.stringify(data)}`;
};
```

```jsx
/**
 * title: 通过 url 获取参数
 */
import React, { useState, useEffect } from 'react';
import { Space, Input, Button, message } from 'antd';
import { getUrlParams } from 'fintech';

export default () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const params = getUrlParams();
    setData(params);
  }, []);

  return `url 类型参数：${JSON.stringify(data)}`;
};
```
