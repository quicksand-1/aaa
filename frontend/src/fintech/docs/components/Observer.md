---
group: 通用
title: Observer
order: 21
---

# Observer

[Web API](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver/IntersectionObserver) 监控元素内容是否在视口内

## 代码演示

```jsx
import React, { useState, useEffect } from 'react';
import { Observer } from 'fintech';

const Sub = ({ index = 0 }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setOpen(true);
    }, 3000);
  }, []);

  return open ? index : '加载中...';
};

export default () => {
  return Array.from({ length: 30 }, (_, index) => (
    <div key={index} style={{ border: '1px solid #ccc', height: 100 }}>
      <Observer>
        <Sub index={index} />
      </Observer>
    </div>
  ));
};
```
