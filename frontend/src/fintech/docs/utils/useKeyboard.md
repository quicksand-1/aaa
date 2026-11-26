---
group: 钩子
toc: content
title: useKeyboard
order: 10
---

# useKeyboard

快捷键事件

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { useKeyboard, LinkBtn } from 'fintech';

export default () => {
  const open = useKeyboard({
    callback: (open) => {
      console.log(open);
    },
  });

  if (open) {
    return (
      <>
        <p>再次使用 shift + ctrl + O 来隐藏内容</p>
        <LinkBtn to="/components/keyboard">也可以使用 Keyboard 组件</LinkBtn>
      </>
    );
  }

  return '使用 shift + ctrl + O 打开隐藏内容';
};
```

## (params) => boolean

| 参数     | 说明               | 类型           | 默认值 |
| :------- | :----------------- | :------------- | :----- |
| position | 指定键位，大写字母 | string         | O      |
| callback | 回调函数           | function(open) |        |
