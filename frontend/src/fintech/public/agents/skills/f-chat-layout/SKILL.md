---
name: f-chat-layout
description: 创建、审查或修复基于 React、Xsender 和 Xmessages/Bubble.List 的聊天面板大结构布局，确保消息区内部滚动、输入区固定、自定义空状态可滚动以及父级高度链完整。用于聊天页面、Drawer、侧栏或分栏面板出现内容撑高、双重滚动条、输入框被压缩、消息列表无法占满、空状态被裁切等场景。
---

# F Chat Layout

## 工作流程

1. 阅读 [references/layout-standard.md](references/layout-standard.md)。
2. 定位聊天面板根节点、`Xmessages` 外层、`Xsender` 外层和所有高度相关祖先。
3. 检查 `Xmessages` 的空状态是否直接返回 `slots.empty`，不要假设空状态位于 `Bubble.List` 内部。
4. 按标准结构修复高度、Flex 分配和滚动职责。
5. 运行格式检查、构建或相关测试，并对照检查清单复核。

## 必须满足

- 为聊天根容器建立纵向 Flex 和明确高度链。
- 为所有需要收缩的 Flex 子项设置 `min-height: 0`。
- 让 `Xmessages` 外层占据剩余空间并使用 `overflow: hidden`。
- 通过 `listProps.style.height = '100%'` 为消息列表提供明确高度。
- 让 `Xsender` 保持自然高度，不设置 `flex: 1`、`height: 100%` 或内部滚动。
- 只保留一个当前可见的垂直滚动区域。
- 为可能超高且绕过 `Bubble.List` 的自定义空状态单独提供满高滚动容器。

## 标准结构

```jsx
<div className="flex h-full min-h-0 flex-col overflow-hidden">
  <div className="min-h-0 flex-1 overflow-hidden">
    <Xmessages
      items={items}
      listProps={{ style: { height: '100%' } }}
      slots={{
        empty: () => (
          <div className="h-full overflow-y-auto">
            <EmptyContent />
          </div>
        ),
      }}
    />
  </div>

  <div className="shrink-0 border-t px-4 py-4">
    <div className="w-full">
      <Xsender />
    </div>
  </div>
</div>
```

根据项目样式方案将 Tailwind 类转换为 CSS、CSS-in-JS 或内联样式，但保持布局语义不变。

## 禁止做法

- 不要让页面内容区、消息外层和 `Bubble.List` 同时滚动。
- 不要遗漏父级的明确高度或 `min-height: 0`。
- 不要依赖 `max-height: 100%` 自动建立消息列表高度。
- 不要给 `Xsender` 分配剩余空间或固定高度。
- 不要在不了解 `slots.empty` 渲染路径时直接设置外层 `overflow: hidden`。
- 不要为了修复布局顺带修改消息气泡、颜色、字体等无关视觉细节。

## 验证

- 检查短消息、长消息和连续多轮消息。
- 检查输入框从一行增长到最大行数时，消息区是否正确让出空间。
- 检查空状态内容超过面板高度时是否可完整滚动。
- 检查页面、Drawer 和消息列表是否出现双重滚动条。
- 检查关闭并重新打开容器后高度是否仍然正确。
- 运行项目已有的格式检查、构建或测试命令；不要新增无关工具链。
