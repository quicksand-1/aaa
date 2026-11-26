---
group: 工具
toc: content
order: 8
---

# idCardInfo

从身份证号中获取信息：性别、出生日期、年龄

## 代码演示

```jsx
import React, { useState } from 'react';
import { idCardInfo, RadioList } from 'fintech';

export default () => {
  const [info, setInfo] = useState();

  return (
    <>
      <RadioList
        options={[
          '110105199001012331',
          '110105198505056782',
          '11010520001231567X',
          '11010519950715432X',
        ]}
        onChange={(e) => {
          setInfo(idCardInfo(e.target.value));
        }}
      />
      <br /> <br />
      性别：{info && (info.gender === '0' ? '女' : '男')}
      <br />
      年龄：{info?.age}
      <br />
      出生日期：{info?.birth}
    </>
  );
};
```
