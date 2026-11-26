---
group: 通用
title: Highlight
order: 12
---

代码高亮组件

## 组件资源依赖

- `注意：组件依赖 highlight.min.css、highlight.min.js，请确保 public/assets 目录下有该资源`
- <a href="/assets/highlight.min.css" download="highlight.min.css">highlight.min.css</a>、<a href="/assets/highlight.min.js" download="highlight.min.js">highlight.min.js</a>

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useState } from 'react';
import { Input } from 'antd';
import { Highlight, RadioList } from 'fintech';

export default () => {
  const [value, setValue] = useState('');
  const [language, setLanguage] = useState('js');

  return (
    <>
      <RadioList
        value={language}
        options={['js', 'sql', 'java', 'py', 'css', 'html', 'bash']}
        onChange={(e) => setLanguage(e.target.value)}
      />
      <br />
      <br />
      <Input.TextArea
        rows={10}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <Highlight value={value} language={language} />
    </>
  );
};
```
