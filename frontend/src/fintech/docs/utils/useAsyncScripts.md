---
group: 钩子
toc: content
title: useAsyncScripts
order: 4
---

# useAsyncScripts

JS、CSS 文件的异步加载，默认加载目录 public/assets 下的文件。默认支持 `publicPath` 配置

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useState, useLayoutEffect } from 'react';
import { Input } from 'antd';
import { useAsyncScripts } from 'fintech';

export default () => {
  const [value, setValue] = useState(`console.log('hello world');

const a = 100;
const b = 200;
const c = a * b;

console.log(c);`);

  const [loading] = useAsyncScripts([
    'assets/highlight.min.css',
    'assets/highlight.min.js',
  ]);

  useLayoutEffect(() => {
    if (!loading) {
      window['hljs']?.highlightAll();
    }
  }, [loading, value]);

  /**
   * 在 react 中，换行的代码会被转义为单行代码，从而导致 code 显示代码都在一行上，如：
   * 1  <pre>
   * 2    <code>
   * 3      const x = 10;
   * 4      console.log(x);
   * 5    </code>
   * 6  </pre>
   * 转化后：<pre><code>const x = 10; console.log(x);</code></pre>
   * 解决方案：使用模板字符串（带反引号）或明确传递换行符：
   * */
  return (
    <>
      <Input.TextArea
        rows={10}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <pre>
        <code>{value}</code>
      </pre>
    </>
  );
};
```
