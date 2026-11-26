---
group: 通用
title: ActionsContainer
order: 1
---

# ActionsContainer

灵活的操作按钮容器，用于渲染动态按钮组。

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { Button } from 'antd';
import { ActionsContainer } from 'fintech';

const Demo1 = () => {
  const defaultActions = {
    edit: <Button key="edit">编辑</Button>,
    delete: (
      <Button key="delete" danger>
        删除
      </Button>
    ),
    view: <Button key="view">查看</Button>,
  };

  return (
    <div>
      <h3>基本用法</h3>
      <ActionsContainer
        defaultActions={defaultActions}
        actions={['edit', 'delete']}
      />

      <h3>混合用法</h3>
      <ActionsContainer
        defaultActions={defaultActions}
        actions={[
          'view',
          <Button key="custom" type="primary">
            自定义操作
          </Button>,
          'edit',
        ]}
      />
    </div>
  );
};

export default Demo1;
```

## API

| 参数             | 类型                        | 说明                                                                               |
| ---------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `defaultActions` | `Record<string, ReactNode>` | 预定义的操作按钮映射                                                               |
| `actions`        | `(string \| ReactNode)[]`   | 要渲染的操作数组，字符串表示引用 `defaultActions` 中的键，ReactNode 表示自定义操作 |
