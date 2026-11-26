---
name: 'ActionsContainer'
description: 'Generates code using the ActionsContainer component for flexible button groups. Invoke when user wants to render dynamic action buttons or button groups.'
---

# ActionsContainer

这个技能帮助你使用 `fintech` 库中的 `ActionsContainer` 组件生成代码。
该组件设计用于灵活渲染一组操作按钮，允许混合使用预定义操作（通过键引用）和自定义 React 节点。

## 使用方法

`ActionsContainer` 组件接受两个主要属性：

- `defaultActions`：一个对象，其中键是操作标识符，值是 React 节点（通常是按钮或链接）。
- `actions`：一个字符串数组（引用 `defaultActions` 的键）或 React 节点数组。

## 示例

```tsx
import React from 'react';
import { Button } from 'antd';
import { ActionsContainer } from 'fintech';

const MyComponent = () => {
  // 1. 定义可重用的默认操作
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
      <h3>基础用法</h3>
      {/* 渲染：编辑，删除 */}
      <ActionsContainer
        defaultActions={defaultActions}
        actions={['edit', 'delete']}
      />

      <h3>混合用法</h3>
      {/* 渲染：查看，自定义按钮，编辑 */}
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

export default MyComponent;
```

## 组件 API

| 参数             | 类型                        | 说明                                                                               |
| ---------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `defaultActions` | `Record<string, ReactNode>` | 预定义的操作按钮映射                                                               |
| `actions`        | `(string \| ReactNode)[]`   | 要渲染的操作数组，字符串表示引用 `defaultActions` 中的键，ReactNode 表示自定义操作 |

## 最佳实践

- 对于常见操作（如 'edit'、'delete'、'view'）使用 `defaultActions` 以提高一致性。
- 在 `defaultActions` 或 `actions` 数组中定义按钮时，始终提供唯一的 `key` 属性。
- 该组件会自动将子元素包装在 Ant Design 的 `Space` 组件中。

## 参考文档（相对路径）

- **组件文档**：[docs/components/ActionsContainer.md](docs/components/ActionsContainer.md)
- **组件源码**：[src/ActionsContainer/index.tsx](src/ActionsContainer/index.tsx)
- **组件分析报告**：[document/ActionsContainer/README.md](document/ActionsContainer/README.md)
