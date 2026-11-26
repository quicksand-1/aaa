---
group: 工具
toc: content
order: 4
---

# desensitize

信息脱敏，支持：邮箱、手机号、身份证、姓名

## 代码演示

```jsx
import React, { useState } from 'react';
import { Input } from 'antd';
import { desensitize } from 'fintech';

export default () => {
  const [value, setValue] = useState('test123@qq.com');

  return (
    <>
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <br />
      <br />
      {desensitize(value)}
    </>
  );
};
```
