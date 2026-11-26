---
group: 通用
title: Html2Image
order: 14
---

# Html2Image

使用 html2canvas 将组件包裹的内容转为 image

## 组件资源依赖

- `注意：组件依赖 html2canvas.js，请确保 public/assets/html2canvas.js 有该资源`
- <a href="/assets/html2canvas.js" download="html2canvas.js">html2canvas.js</a>

## 代码演示

```jsx
/**
 * title: 组件用法
 */
import React from 'react';
import { Button } from 'antd';
import { Html2Image } from 'fintech';

export default () => {
  return (
    <Html2Image filename="html2Image">
      <Button>按钮</Button>
    </Html2Image>
  );
};
```

```jsx
/**
 * title: hook 用法
 */
import React from 'react';
import { Button } from 'antd';
import { useHtml2Image } from 'fintech';

export default () => {
  const { loading, onImage } = useHtml2Image();

  return (
    <Button
      loading={loading}
      onClick={() => {
        onImage(document.body);
      }}
    >
      截屏
    </Button>
  );
};
```

## API

| 参数     | 说明                                  | 类型   | 默认值 |
| :------- | :------------------------------------ | :----- | :----- |
| filename | 不带后缀的文件名，默认导出为 png 格式 | string |        |
