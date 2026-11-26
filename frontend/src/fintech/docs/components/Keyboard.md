---
group: 通用
title: Keyboard
order: 16
---

# Keyboard

组合键组件，当执行组合键命令时，会显示被包裹的内容；组合键要求：`shift + ctrl + 指定键`

## 代码演示

```jsx
/**
 * title: shift + ctrl + J
 */
import React from 'react';
import { Button } from 'antd';
import { Keyboard } from 'fintech';

export default () => {
  return (
    <Keyboard
      position="J"
      callback={(open) => {
        console.log('Open: ', open);
      }}
    >
      <Button>按钮</Button>
    </Keyboard>
  );
};
```

```jsx
/**
 * title: useKeyboard
 */
import React from 'react';
import { Button } from 'antd';
import { useKeyboard } from 'fintech';

export default () => {
  const open = useKeyboard();

  if (open) {
    return <Button>按钮</Button>;
  }

  return null;
};
```

## API

| 参数     | 说明                   | 类型              | 默认值 |
| :------- | :--------------------- | :---------------- | :----- |
| position | 组合键中指定的键位     | 大写字母          | O      |
| callback | 组合键执行后的回调函数 | function(open) {} |        |
