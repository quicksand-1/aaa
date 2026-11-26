---
group: 类
toc: content
order: 4
---

# Resizable

元素拖拽和缩放

## 代码演示

```jsx
import React, { useEffect } from 'react';
import { Resizable } from 'fintech';

export default () => {
  useEffect(() => {
    new Resizable({
      top: window.innerHeight / 4,
      left: window.innerWidth / 4,
      width: window.innerWidth / 2,
      height: window.innerHeight / 2,
      node: document.getElementById('box'),
      dragNode: document.getElementById('drag'),
      resizeNode: document.getElementById('resize'),
    });
  });

  return (
    <div
      id="box"
      style={{
        border: '2px solid #1660AB',
        background: '#F9F2E0',
      }}
    >
      <div
        id="drag"
        style={{
          borderBottom: '2px solid #1660AB',
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        拖拽位置
      </div>

      <div
        id="resize"
        style={{
          width: 20,
          height: 20,
          position: 'absolute',
          right: -2,
          bottom: -2,
          borderBottom: '2px solid red',
          borderRight: '2px solid red',
          cursor: 'nwse-resize',
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
};
```

## API

| 参数       | 说明                 | 类型                                   | 默认值 |
| :--------- | :------------------- | :------------------------------------- | :----- |
| left       | 初始视口左边位置     | number                                 | 0      |
| top        | 初始视口顶部位置     | number                                 | 0      |
| adsorb     | 边界吸附距离         | number                                 | 0      |
| adsorbMax  | 边界吸附阈值         | number                                 | 0      |
| width      | 初始视口宽度         | number                                 | 50     |
| height     | 初始视口高度         | number                                 | 50     |
| minWidth   | 视口最小宽度         | number                                 | 50     |
| minHeight  | 视口最小高度         | number                                 | 50     |
| node       | 主体元素，必填       | Element                                |        |
| dragNode   | 拖拽句柄的元素，可选 | Element                                |        |
| resizeNode | 拖拽句柄的元素       | Element                                |        |
| callback   | 拖拽结束后的回调函数 | function({ width, height, left, top }) |        |
