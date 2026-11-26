---
group: 请求
toc: content
order: 1
---

# cacheRequest

缓存加载技术， 会将请求后结果进行缓存，当有相同的请求时，会直接从缓存中获取数据

## 代码示例

```jsx
import React, { useState } from 'react';
import { Space, Input, Button, Switch, Spin } from 'antd';
import { cacheRequest } from 'fintech';

export default () => {
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const [cache, setCache] = useState(true);
  const [loading, setLoading] = useState(false);

  return (
    <Spin spinning={loading}>
      <Space>
        <Switch
          checked={cache}
          onChange={setCache}
          checkedChildren="缓存"
          unCheckedChildren="不缓存"
        />
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <Button
          disabled={!value}
          onClick={() => {
            cacheRequest('/request/demo.json', {
              cache,
              setLoading,
              params: { v: value },
            }).then((res) => {
              setResult(res);
            });
          }}
        >
          发送请求
        </Button>
        <div>{result}</div>
      </Space>
    </Spin>
  );
};
```
