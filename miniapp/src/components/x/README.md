# X 系列对话组件

从 `enterprise-wiki-mp` 的 chat 公共组件移植到 Taro / React，并适配当前小程序的蓝色业务主题。

```tsx
import {
  XMessages,
  XSender,
  XThinking,
  XWorkspace,
} from '@/components/x'
```

统一入口：`src/components/x/index.ts`。示例页面：`src/pages/chat/index.tsx`，登录后可从首页“对话组件”进入。

## XMessages

用于渲染用户消息、助手 Markdown、思考过程、工具调用、附件、状态、耗时、Token 用量和复制操作。

```tsx
<XMessages
  items={messages}
  typing={typing}
  density="compact"
  onThinkingToggle={({ groupKey, expanded }) => {}}
  onToolGroupToggle={({ blockKey }) => {}}
/>
```

消息至少支持以下两类输入：

```ts
// 普通用户消息
{ key: 'm1', role: 'user', content: '你好', status: 'success' }

// 助手 Markdown 消息
{ key: 'm2', role: 'assistant', content: '### 标题\n正文', status: 'success' }
```

包含思考或工具调用时，可传：

```ts
{
  key: 'm3',
  role: 'assistant',
  status: 'success',
  blocks: {
    contentBlocks: [
      { key: 'b1', type: 'text', text: '处理结果' },
      {
        key: 'b2',
        type: 'tool',
        call: { id: 't1', name: 'Bash', input: '{"command":"npm test"}' },
        result: { state: 'success', output: '42 passing' }
      }
    ],
    thinking: [{ type: 'thinking', thinking: '分析过程' }]
  }
}
```

## XSender

受控或非受控输入框，支持发送、停止等尾部操作：

```tsx
<XSender
  value={input}
  placeholder="输入消息"
  onInput={setInput}
  onConfirm={send}
>
  <Button onClick={send}>发送</Button>
</XSender>
```

## XThinking

独立折叠组件；`XMessages` 内部也会自动使用：

```tsx
<XThinking
  label="思考过程"
  content="这里展示模型的思考内容"
  expanded={expanded}
  onToggle={setExpanded}
/>
```

## XWorkspace

会话文件树、搜索、目录展开、懒加载和文件操作入口。组件不绑定具体后端：

```tsx
<XWorkspace
  open={workspaceOpen}
  entries={entries}
  onClose={() => setWorkspaceOpen(false)}
  onFilePress={(node) => shareOrDownload(node)}
/>
```

需要按目录懒加载时：

```tsx
<XWorkspace
  open={workspaceOpen}
  loadEntries={(path) => fetchWorkspaceEntries(path)}
  onClose={() => setWorkspaceOpen(false)}
  onFilePress={(node) => shareOrDownload(node)}
/>
```

`WorkspaceEntry` 支持 `name`、`is_dir`、`size_bytes`、`updated_at` 和嵌套 `children`。文件下载、发送给微信好友等业务能力通过 `onFilePress` 注入。
