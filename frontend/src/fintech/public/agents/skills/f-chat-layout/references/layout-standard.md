# Xsender / Xmessages 布局规范

## 目标结构

```text
固定高度的聊天面板
├── Xmessages：占据剩余高度，消息列表内部滚动
└── Xsender：自然高度，固定在底部，不参与滚动
```

## 核心规则

| 位置 | 推荐样式 | 职责 |
| --- | --- | --- |
| 聊天根容器 | `flex h-full min-h-0 flex-col overflow-hidden` | 建立固定高度的纵向布局 |
| `Xmessages` 外层 | `min-h-0 flex-1 overflow-hidden` | 占据剩余空间并允许缩小 |
| `Xmessages` | `listProps.style.height = '100%'` | 为 `Bubble.List` 提供明确高度 |
| 较长的空状态 | `h-full overflow-y-auto` | 在没有 `Bubble.List` 时承担滚动 |
| `Xsender` 区域 | `shrink-0 border-t px-4 py-4` | 保持自然高度并固定在底部 |
| `Xsender` 直接外层 | `w-full` | 明确占满可用宽度 |
| 其他父级 | `min-h-0 overflow-hidden` | 保持完整高度链，避免双重滚动 |

## 布局原理

### `min-height: 0`

Flex 子项默认可能按内容最小高度撑开。消息外层缺少 `min-height: 0` 时，长消息会扩大聊天面板，而不是在列表内部滚动。

### `height: 100%`

`Xmessages` 基于 `Bubble.List`。底层主要使用 `max-height: 100%`，业务侧仍需通过 `listProps` 提供明确高度，否则列表可能随内容自然增长。

### 输入区不收缩

`Xsender` 会随输入内容增高。输入区应保持自然高度，增高时由消息区让出空间。不要给 `Xsender` 设置 `height: 100%`、`flex: 1` 或 `overflow: auto`。

## 滚动职责

正常消息状态只保留一个垂直滚动区域：

```text
页面及聊天祖先：overflow-hidden
聊天根容器：overflow-hidden
Xmessages 外层：overflow-hidden
Bubble.List 内部：overflow-y-auto
```

不要同时在页面内容区、`Xmessages` 外层和列表根节点设置 `overflow-y-auto`。

## 自定义空状态

`Xmessages` 没有消息时可能直接返回 `slots.empty`，不会渲染 `Bubble.List`。此时 `listProps` 和列表内部滚动不会作用于空状态。

较长的空状态应自行提供满高滚动容器：

```jsx
slots={{
  empty: () => (
    <div className="h-full overflow-y-auto">
      <EmptyContent />
    </div>
  ),
}}
```

滚动职责根据状态切换：

```text
无消息：empty 插槽内部滚动
有消息：Bubble.List 内部滚动
```

两者不会同时渲染，因此不会形成同时存在的嵌套滚动。

## 父级高度链

`height: 100%` 只有在祖先具有明确高度时才有效：

```text
固定高度页面或 Drawer Body
└── h-full min-h-0 overflow-hidden
    └── 聊天根容器
        ├── min-h-0 flex-1 的消息区
        └── shrink-0 的输入区
```

如果中间父级也是 Flex 子项，同时设置 `flex: 1` 和 `min-height: 0`。聊天面板的祖先通常使用 `overflow: hidden`，将滚动职责留给消息列表。

## 检查清单

- [ ] 聊天面板具有明确高度或完整的 `height: 100%` 高度链
- [ ] 聊天根容器使用纵向 Flex、`min-height: 0` 和 `overflow: hidden`
- [ ] `Xmessages` 外层使用 `flex: 1`、`min-height: 0` 和 `overflow: hidden`
- [ ] `Xmessages` 设置 `listProps.style.height = '100%'`
- [ ] `Xsender` 区域不收缩，组件自身不使用 `flex: 1`
- [ ] 页面内容区和消息外层没有额外的垂直滚动条
- [ ] 较长的自定义空状态具有独立的满高滚动容器
