# Xagent Surfaces 交互设计

## 1. 背景

当前 `Xagent` 已具备完整的文本澄清链路：

- 模型在缺少参数时调用内部 `agent_clarify`
- runtime 返回 `type: 'clarify'`
- `sessionState.pendingClarify` 保存当前待补充信息
- 用户下一轮通过自然语言补充后，agent 继续执行

这条链路已经成立，但纯文本澄清存在几个问题：

- 用户不知道该补什么字段，尤其是多字段场景
- 对“项目编号”“用户 ID”“确认提交”这类结构化交互不友好
- UI 无法用表单、按钮、确认卡片等更强约束的方式收集输入
- 对副作用工具来说，仅靠文本“你确认吗”不够稳定

因此需要在 `clarify` 之上补一层结构化交互协议，即 `surfaces`。

`surfaces` 的目标不是替代 `Xagent` 的状态机，而是作为 `Xagent` 的 UI 交互层，让“缺参数”和“确认动作”这两类问题能以更稳定的方式完成。

本设计第一阶段只覆盖两种 surface：

- `form`
- `confirm`

---

## 2. 设计目标

### 2.1 目标

- 把纯文本澄清升级为结构化交互 ask
- 保持 `Xagent` 当前“一次运行，返回结果，再恢复”的状态机
- 不让 tool 自己等待用户输入
- 支持 `FormSchema` 驱动的参数补充表单
- 支持副作用工具执行前的显式确认
- 与现有 `pro-aify` 的 `Surfaces` 设计兼容，尽量复用 `surfaceId` 路由和 `FormSurface` 思路

### 2.2 非目标

- 本阶段不做多步 wizard
- 本阶段不做一个会话同时存在多个活跃 surface
- 本阶段不做 surface 内部独立调用业务后端
- 本阶段不做完全通用的 A2UI 协议实现
- 本阶段不处理 `options`、`login`、文件上传等更复杂交互

---

## 3. 核心原则

### 3.1 语义分层

- `clarify` 是 runtime 语义，表示当前流程需要用户参与
- `surface` 是 UI 语义，表示该如何收集用户输入

也就是说：

- `clarify` 决定“为什么停下来”
- `surface` 决定“停下来后给用户展示什么控件”

### 3.2 单轮中断，显式恢复

`Xagent` 不应在某个 tool 内部挂起等待用户输入，而应：

1. 当前轮运行到澄清点
2. 返回 `clarify + surface`
3. UI 渲染 surface
4. 用户提交 surface
5. 业务层再次调用 `runAgent()`
6. runtime 根据 `clarifyResponse` 恢复执行

这保证了：

- 不依赖长连接上下文驻留
- 不把 runtime 和 React 组件耦合在一起
- 与当前仅内存态的页面编排方式兼容

### 3.3 surface 只收集输入，不直接执行业务

surface 的职责只有两件事：

- 向用户展示需要补充或确认的上下文
- 把结构化结果提交给外层回调

surface 不直接请求工具后端，也不自己推进会话。  
真正继续执行的是 `runAgent()`。

### 3.4 兼容纯文本澄清

结构化 surface 是增强，不是替代。  
如果某个 capability 没有 surface 元数据，或 UI 层没有接 surface renderer，系统仍应退化回纯文本 clarify。

---

## 4. 总体架构

### 4.1 架构关系

```text
LLM / Tool
   ↓
Xagent Runtime
   ↓  clarify + surface
Message State
   ↓
Xmessages / Surfaces
   ↓  用户提交
clarifyResponse
   ↓
runAgent() resume
```

### 4.2 组件职责

#### Runtime 层

- 判断何时需要澄清
- 生成 `surface` 协议
- 把交互上下文写入 `sessionState.pendingClarify`
- 在下一轮读取 `clarifyResponse` 恢复执行

#### UI 层

- 把 `surface` 渲染成具体交互控件
- 处理提交中、禁用态、只读态
- 将用户输入通过 `callback` 回传上层

#### 业务编排层

- 收到 `clarify` 后写入消息列表
- 收到 `callback` 后再次调用 `runAgent()`
- 在当前运行期持有最新 `sessionState`

---

## 5. 关键概念

### 5.1 Clarify

表示 agent 当前无法继续推进，需要用户参与。

典型原因：

- 缺少必需 slot
- 需要唯一定位实体
- 工具执行前需要显式确认

### 5.2 Surface

表示一段嵌在消息中的结构化交互卡片。

第一阶段支持：

- `form`：用于补 slot
- `confirm`：用于确认动作

### 5.3 ClarifyResponse

表示用户完成 surface 交互后的结构化提交结果。

ClarifyResponse 不是工具结果，也不是普通消息文本，而是“继续当前 clarify 上下文所需的信息包”。

### 5.4 PendingClarify

`sessionState` 里保存的待处理澄清状态。  
它是整个交互式 ask 的状态锚点。

---

## 6. 数据流与生命周期

### 6.1 Form 场景

```text
用户提问
  ↓
agent 选择 capability
  ↓
工具调用前发现缺少 slot
  ↓
runtime 返回 clarify + form surface
  ↓
UI 渲染 Form
  ↓
用户填写并提交
  ↓
业务层构造 clarifyResponse(slotPatch)
  ↓
再次调用 runAgent()
  ↓
runtime 合并 slotPatch
  ↓
继续执行原能力
  ↓
success / clarify / error
```

### 6.2 Confirm 场景

```text
用户提问
  ↓
agent 已经拿到完整参数
  ↓
某个 tool 标记为需要确认
  ↓
runtime 不立即执行 tool
  ↓
runtime 返回 clarify + confirm surface
  ↓
UI 渲染 Confirm
  ↓
用户确认
  ↓
业务层构造 clarifyResponse(confirmDecision)
  ↓
再次调用 runAgent()
  ↓
runtime 直接恢复 pendingAction
  ↓
执行 tool
  ↓
success / error
```

---

## 7. 协议总览

### 7.1 Runtime 输出

当需要交互时，`runAgent()` 返回：

```ts
type AgentClarifyResult = {
  type: 'clarify';
  answer: string;
  steps: AgentStep[];
  surface?: SurfaceSpec | null;
  sessionState: AgentSessionState;
};
```

其中 `surface` 为可选字段：

- 有 `surface`：UI 可以渲染结构化交互
- 无 `surface`：退化为纯文本澄清

### 7.2 Surface 通用结构

```ts
type SurfaceSpec = {
  surfaceId: 'form' | 'confirm';
  surfaceKey: string;
  version: '1';
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  responseType: 'slotPatch' | 'confirmDecision';
  readonly?: boolean;
  meta?: Record<string, any>;
  data: Record<string, any>;
};
```

### 7.3 用户提交结构

```ts
type ClarifyResponse = {
  surfaceKey: string;
  surfaceId: 'form' | 'confirm';
  responseType: 'slotPatch' | 'confirmDecision';
  payload: Record<string, any>;
  submittedAt: number;
};
```

---

## 8. SessionState 设计

### 8.1 当前状态

当前 `pendingClarify` 只包含：

- `question`
- `capabilityId`
- `intent`
- `slots`
- `missingSlots`

这足以支持文本澄清，但不足以支持结构化 surface、确认动作恢复和更明确的交互状态管理。

### 8.2 建议结构

```ts
type PendingClarifyState = {
  question: string;
  capabilityId: string | null;
  intent: string | null;
  slots: Record<string, any>;
  missingSlots: string[];
  surface: SurfaceSpec | null;
  source: {
    toolName?: string;
    reason?: string;
    step?: number;
  };
  pendingAction?: {
    type: 'tool_execution';
    toolName: string;
    args: Record<string, any>;
    entityId?: string | null;
  } | null;
};
```

### 8.3 字段说明

| 字段            | 说明                                     |
| :-------------- | :--------------------------------------- |
| `surface`       | 当前运行期内用于渲染结构化交互           |
| `source`        | 记录这次 clarify 来自哪个工具、哪一步    |
| `pendingAction` | `confirm` 模式下记录待恢复执行的工具调用 |

---

## 9. Form Surface 设计

### 9.1 适用场景

`form` 用于补齐缺失参数，典型场景：

- 缺少项目编号
- 缺少日期区间
- 缺少用户名 / 手机号 / 用户 ID
- 缺少某个筛选条件，但用户原问题足以确定是哪个能力

### 9.2 协议结构

```ts
type FormSurfaceSpec = {
  surfaceId: 'form';
  surfaceKey: string;
  version: '1';
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  responseType: 'slotPatch';
  readonly?: boolean;
  meta?: Record<string, any>;
  data: {
    schema: FormSurfaceField[];
    initialValues?: Record<string, any>;
    missingSlots: string[];
  };
};
```

字段项：

```ts
type FormSurfaceField = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  valueType?: string;
  help?: string;
  options?: any;
  inputProps?: Record<string, any>;
};
```

### 9.3 与 `FormSchema` 的关系

建议 `form.data.schema` 尽量复用现有 `FormSchema` 的 item 结构，而不是重新发明一套前端字段协议。  
原因：

- 当前仓库已经有 `FormSchema`
- 你在 `pro-aify` 的 `FormSurface` 已经用 [Form.jsx](/Users/chenlong/Desktop/dev/pro-aify/src/components/ChatContainer/Surfaces/Form.jsx:28) 证明这条路线可行
- 复用后成本更低

因此第一阶段 `form` 的字段协议可以认为是“`FormSchema` 子集”。

### 9.4 默认生成策略

如果 capability 没有自定义 form surface，runtime 默认基于 `missingSlots` 生成：

1. 遍历 `missingSlots`
2. 从 capability 的 slot 定义中读取：
   - `label`
   - `schema`
   - `ui.placeholder`
   - `ui.valueType`
   - `ui.help`
3. 生成 `schema`
4. 用当前 `pendingClarify.slots` 生成 `initialValues`

### 9.5 建议的 slot UI 元数据

```ts
slots: {
  projectCode: {
    label: '项目编号',
    schema: { type: 'string' },
    defaultValue: null,
    normalize: (value) => String(value || '').trim() || null,
    ui: {
      placeholder: '请输入项目编号',
      valueType: 'input',
      help: '例如：P20260520',
    },
  },
}
```

### 9.6 提交语义

Form 提交后：

```ts
{
  surfaceKey: 'clarify_projectCode_001',
  surfaceId: 'form',
  responseType: 'slotPatch',
  payload: {
    projectCode: 'P20260520',
  },
  submittedAt: 1740000000000,
}
```

`payload` 直接解释为 `slotPatch`。

### 9.7 运行时恢复逻辑

runtime 在收到 `clarifyResponse` 后：

1. 校验 `surfaceKey` 是否匹配当前 `pendingClarify.surface.surfaceKey`
2. 校验 `surfaceId === 'form'`
3. 把 `payload` 合并进 `pendingClarify.slots`
4. 对相关 slot 执行 `normalize`
5. 重新判断是否还有缺失 slot
6. 如果还有缺失：
   - 返回新的 `clarify + form`
7. 如果已补齐：
   - 继续原有 capability 执行

### 9.8 Cancel 语义

Form 的取消分两种：

- 关闭表单但不提交：仅 UI 行为，不改变 runtime
- 明确点击“取消”：提交一条取消响应，runtime 清理当前 `pendingClarify`

建议第一阶段保守处理：

- `cancel` 后返回一条普通 assistant 结果，例如“已取消本次补充”
- 同时清掉 `pendingClarify`

---

## 10. Confirm Surface 设计

### 10.1 适用场景

`confirm` 用于危险动作或副作用动作的二次确认，典型场景：

- 提交申请
- 删除数据
- 覆盖配置
- 发起同步
- 下发任务

它不是补参数，而是让用户确认“是否执行当前已准备好的动作”。

### 10.2 协议结构

```ts
type ConfirmSurfaceSpec = {
  surfaceId: 'confirm';
  surfaceKey: string;
  version: '1';
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  responseType: 'confirmDecision';
  readonly?: boolean;
  meta?: {
    severity?: 'info' | 'warning' | 'danger';
    [key: string]: any;
  };
  data: {
    summary?: Array<{
      label: string;
      value: string;
    }>;
    confirmValue?: true;
  };
};
```

### 10.3 典型示例

```ts
{
  surfaceId: 'confirm',
  surfaceKey: 'confirm_submit_project_001',
  version: '1',
  title: '确认提交',
  description: '该操作会正式提交项目申请，提交后不可撤回。',
  submitText: '确认提交',
  cancelText: '取消',
  responseType: 'confirmDecision',
  meta: {
    severity: 'warning',
  },
  data: {
    summary: [
      { label: '项目编号', value: 'P20260520' },
      { label: '操作', value: '提交立项申请' },
    ],
    confirmValue: true,
  },
}
```

### 10.4 触发方式

建议 tool 增加确认配置：

```ts
{
  name: 'project_submit',
  confirmBeforeExecute: true,
  confirmText: '该操作会正式提交项目申请，提交后不可撤回。',
  confirmSeverity: 'warning',
  buildConfirmSummary: ({ args, slots, currentEntity }) => [
    { label: '项目编号', value: slots.projectCode },
    { label: '项目名称', value: currentEntity?.projectName || '-' },
  ],
}
```

当 runtime 准备执行该 tool 时：

1. 参数已齐
2. 工具可执行
3. 但命中 `confirmBeforeExecute`
4. runtime 不直接执行 `tool.execute()`
5. 生成 `confirm surface`
6. 把待执行动作写入 `pendingClarify.pendingAction`

### 10.5 PendingAction 设计

```ts
pendingAction: {
  type: 'tool_execution',
  toolName: 'project_submit',
  args: {
    projectCode: 'P20260520',
  },
  entityId: 'P20260520',
}
```

这里保存的是“已经准备好的动作”，不是“让模型下一轮再想一遍”。

### 10.6 提交语义

用户点击确认：

```ts
{
  surfaceKey: 'confirm_submit_project_001',
  surfaceId: 'confirm',
  responseType: 'confirmDecision',
  payload: {
    confirmed: true,
  },
  submittedAt: 1740000000000,
}
```

用户点击取消：

```ts
{
  surfaceKey: 'confirm_submit_project_001',
  surfaceId: 'confirm',
  responseType: 'confirmDecision',
  payload: {
    confirmed: false,
  },
  submittedAt: 1740000000000,
}
```

### 10.7 恢复逻辑

runtime 收到 `confirmDecision` 后：

#### confirmed = true

1. 校验 `surfaceKey`
2. 校验当前 `pendingClarify.pendingAction` 存在
3. 直接恢复对应 tool 调用
4. 不再让 LLM 重新判断

#### confirmed = false

1. 清理当前 `pendingClarify`
2. 返回一条“已取消本次操作”
3. 记录 `lastResult.mode = 'cancelled'`

### 10.8 为什么 confirm 不能重新跑模型

如果确认后又让模型重新生成 tool call，会出现几个问题：

- tool 是否还会命中同一个动作不确定
- 危险操作的确定性下降
- 有可能重复 ask
- 有可能因为 prompt 漂移导致执行了不同参数

因此确认后的恢复应是“恢复 pendingAction”，而不是“重新请模型决定”。

---

## 11. UI 层设计

### 11.1 消息结构

建议在消息列表中把 surface 作为结构化消息项：

```ts
{
  key: 'assistant-ask-1',
  role: 'assistant',
  type: 'surface',
  content: '请补充项目编号。',
  surface: {
    surfaceId: 'form',
    ...
  },
}
```

### 11.2 渲染策略

建议使用 `Xmessages.renderers` 渲染：

- `type === 'surface'` 时走 `Surfaces`
- `Surfaces` 根据 `surface.surfaceId` 路由：
  - `form` -> `FormSurface`
  - `confirm` -> `ConfirmSurface`

这与 `pro-aify` 现有 [Surfaces/index.jsx](/Users/chenlong/Desktop/dev/pro-aify/src/components/ChatContainer/Surfaces/index.jsx:13) 设计一致。

### 11.3 Surface 组件职责

#### `FormSurface`

- 渲染标题、说明、表单字段
- 使用 `FormSchema` 渲染
- 点击提交时调用 `callback(clarifyResponse)`
- 不直接 `request(data.requestUrl)`

#### `ConfirmSurface`

- 渲染标题、说明、摘要字段
- 渲染确认与取消按钮
- 点击按钮时调用 `callback(clarifyResponse)`

### 11.4 历史消息只读态

同一条 surface 一旦提交：

- 历史消息中的 surface 应进入只读态
- 避免用户对旧 surface 重复提交

可以通过：

- `surface.readonly = true`
- 或上层 message item 标记本条消息已完成

### 11.5 与底部输入框的关系

当有活跃 surface 时，底部 `Xsender` 有三种策略：

1. 保持可用
2. 保持可用但弱化提示
3. 暂时禁用并提示“请先完成当前交互”

建议第一阶段采用策略 1：

- 不禁用 `Xsender`
- 因为用户可能仍然想直接输入“项目编号是 P20260520”
- 这样可以保留当前文本澄清路径的兼容性

---

## 12. Runtime API 设计

### 12.1 `runAgent()` 入参扩展

建议新增：

```ts
runAgent({
  question?: string,
  sessionState?: AgentSessionState,
  llmConfig?: LLMConfig,
  capabilities?: Capability[],
  clarifyResponse?: ClarifyResponse,
})
```

### 12.2 处理优先级

建议 runtime 入口按以下优先级处理：

1. 若有 `clarifyResponse`
   - 先尝试恢复 `pendingClarify`
2. 若没有 `clarifyResponse`
   - 走正常 question -> capability -> tool 流程

### 12.3 `clarifyResponse` 与 `question` 同时存在

建议允许两者同时存在，但规则如下：

- `clarifyResponse` 是主恢复输入
- `question` 是补充自然语言上下文

例如：

```ts
runAgent({
  question: '顺便帮我查一下负责人',
  sessionState,
  clarifyResponse: {
    surfaceKey: 'clarify_projectCode_001',
    surfaceId: 'form',
    responseType: 'slotPatch',
    payload: { projectCode: 'P20260520' },
    submittedAt: Date.now(),
  },
});
```

第一阶段实现可以更保守：

- 先支持 `clarifyResponse`
- `question` 留空或只作为附加文本

---

## 13. Capability / Tool 配置建议

### 13.1 Slot 配置建议

```ts
slots: {
  projectCode: {
    label: '项目编号',
    defaultValue: null,
    schema: { type: 'string' },
    normalize: (value) => String(value || '').trim() || null,
    ui: {
      placeholder: '请输入项目编号',
      valueType: 'input',
      help: '例如：P20260520',
    },
  },
}
```

### 13.2 Tool 配置建议

```ts
{
  type: 'function',
  name: 'project_submit',
  description: '提交项目申请',
  requiredSlots: ['projectCode'],
  confirmBeforeExecute: true,
  confirmText: '提交后不可撤回，请确认是否继续。',
  confirmSeverity: 'warning',
  buildConfirmSummary: ({ slots, currentEntity }) => [
    { label: '项目编号', value: slots.projectCode },
    { label: '项目名称', value: currentEntity?.projectName || '-' },
  ],
  execute: async ({ args }) => { ... },
}
```

### 13.3 自定义 clarify surface

对于少量特殊能力，允许 capability 或 tool 覆盖默认 surface 生成逻辑：

```ts
buildClarifySurface: ({ missingSlots, slots, sessionState }) => ({
  surfaceId: 'form',
  ...
})
```

但建议第一阶段不要强依赖自定义函数，优先走默认生成逻辑。

---

## 14. 错误与边界处理

### 14.1 surfaceKey 不匹配

场景：

- 用户提交了一个过期 surface
- 用户同时开了多个窗口
- 消息顺序错乱

处理建议：

- 拒绝恢复
- 返回错误结果或普通 assistant 提示：“当前交互已失效，请重新发起”

### 14.2 重复提交

场景：

- 用户双击提交
- 网络慢，按钮重复点击

处理建议：

- 通过 `surfaceKey` 和当前运行期消息状态做幂等保护
- 已提交的 surface 再次提交时忽略或返回提示结果

### 14.3 刷新页面

场景：

- 用户在表单还没提交时刷新

处理建议：

- 第一阶段不保证恢复
- 刷新后视为当前交互丢失，需要重新发起

### 14.4 用户绕开 surface 走文本补充

场景：

- UI 上有 form，但用户直接在输入框里输入“项目编号是 P20260520”

处理建议：

- 允许
- 继续沿用现有文本澄清能力
- surface 只是增强，不应成为唯一通道

### 14.5 Confirm 期间上下文变更

场景：

- `confirm` 已弹出，但底层数据已变化

处理建议：

- 第一阶段不做乐观锁
- 如业务需要，tool 恢复执行时自行再次校验

### 14.6 多个 pending surface

场景：

- 同一轮想同时要求填写多个独立表单或先填表再确认

处理建议：

- 第一阶段禁止
- 一个会话同一时间只允许一个 `pendingClarify`

---

## 15. 与现有 `pro-aify` Surfaces 的衔接

当前 `pro-aify` 的 surface 设计：

- 有 `surfaceId` 路由层
- `form` 用 `FormSchema`
- `options` 用单选/多选
- surface 通过 `callback()` 通知完成

这些设计方向都可以保留。

需要改的一点是：

- 现在 `FormSurface` / `OptionsSurface` 会直接调用 `request(data.requestUrl, ...)`
- 在 `Xagent` 里不应这么做

迁移后应改为：

```ts
onFinish={(values) => {
  callback({
    surfaceKey: data.surfaceKey,
    surfaceId: 'form',
    responseType: 'slotPatch',
    payload: values,
    submittedAt: Date.now(),
  });
}}
```

因此，`surfaces` 仍然保留 UI 协议身份，但不再承担会话推进逻辑。

---

## 16. 示例

### 16.1 Form 示例

用户提问：

```text
帮我查项目审批进度
```

agent 识别到需要 `projectCode`：

```json
{
  "type": "clarify",
  "answer": "请补充项目编号。",
  "surface": {
    "surfaceId": "form",
    "surfaceKey": "clarify_projectCode_001",
    "version": "1",
    "title": "补充查询条件",
    "description": "还缺少项目编号，补充后继续查询审批进度。",
    "submitText": "继续",
    "cancelText": "取消",
    "responseType": "slotPatch",
    "data": {
      "schema": [
        {
          "name": "projectCode",
          "label": "项目编号",
          "required": true,
          "placeholder": "请输入项目编号"
        }
      ],
      "initialValues": {
        "projectCode": null
      },
      "missingSlots": ["projectCode"]
    }
  }
}
```

用户提交：

```json
{
  "surfaceKey": "clarify_projectCode_001",
  "surfaceId": "form",
  "responseType": "slotPatch",
  "payload": {
    "projectCode": "P20260520"
  },
  "submittedAt": 1740000000000
}
```

### 16.2 Confirm 示例

用户提问：

```text
帮我提交这个项目申请
```

tool 命中确认逻辑：

```json
{
  "type": "clarify",
  "answer": "提交前请确认。",
  "surface": {
    "surfaceId": "confirm",
    "surfaceKey": "confirm_project_submit_001",
    "version": "1",
    "title": "确认提交",
    "description": "该操作会正式提交项目申请，提交后不可撤回。",
    "submitText": "确认提交",
    "cancelText": "取消",
    "responseType": "confirmDecision",
    "meta": {
      "severity": "warning"
    },
    "data": {
      "summary": [
        {
          "label": "项目编号",
          "value": "P20260520"
        },
        {
          "label": "项目名称",
          "value": "现金流平台改造"
        }
      ],
      "confirmValue": true
    }
  }
}
```

用户确认：

```json
{
  "surfaceKey": "confirm_project_submit_001",
  "surfaceId": "confirm",
  "responseType": "confirmDecision",
  "payload": {
    "confirmed": true
  },
  "submittedAt": 1740000000000
}
```

---

## 17. 第一阶段落地范围

建议第一阶段严格控制范围：

- `runAgent()` 支持 `clarifyResponse`
- `clarify` 结果支持携带 `surface`
- `pendingClarify` 扩展为运行期可续跑结构
- 支持 `surfaceId: 'form'`
- 支持 `surfaceId: 'confirm'`
- `form` 用于补 slot
- `confirm` 用于副作用工具执行前确认
- 只支持单个活跃 surface
- 保留纯文本澄清兜底

不进入第一阶段的内容：

- `options`
- `login`
- 文件上传
- 多步 wizard
- 一个 surface 内再发业务请求
- 多 surface 并发
- 页面刷新后的交互恢复

---

## 18. 后续扩展方向

当 `form` 和 `confirm` 稳定后，可以继续演进：

- `options`：候选实体选择
- `login`：认证补充或登录引导
- `picker`：日期、人员、组织等专用选择器
- `upload`：文件上传 ask
- `wizard`：复杂分步表单
- `toolPreview`：执行前结果预览

这些都可以继续复用同一套 `surfaceId + surfaceKey + clarifyResponse` 框架。

如果后续要支持页面刷新后的交互恢复，再统一引入持久化方案即可，例如：

- 本地缓存：`IndexedDB` / `localStorage`
- 服务端会话存储
- 前后端混合持久化

在那之前，本设计默认 `sessionState` 和 `pendingClarify` 只在当前页面运行期内有效。

---

## 19. 结论

这套设计的核心不是“把表单塞进消息”，而是把 `Xagent` 的文本澄清链路升级为“可结构化收集输入、可在当前运行期继续执行”的交互协议。

对于当前项目而言，最重要的设计结论有四条：

1. `surface` 是 `clarify` 的 UI 层，不是新的 agent runtime。
2. surface 提交后不直接打业务接口，而是回到 `runAgent()` 恢复执行。
3. `form` 解决缺参数，`confirm` 解决副作用确认，两者语义必须严格分开。
4. 第一阶段只做 `form + confirm + 单活跃 surface`，保证实现简洁、状态稳定、可调试。

在这个边界内，`Xagent` 可以从“能问一句话再继续”升级成“能展示结构化 ask 再继续”，而不破坏现有运行模型。
