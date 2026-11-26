# PageAgent 初始化功能开发计划

## 需求概述
开发一个 agent 初始化功能，用户通过快捷键来初始化和加载 PageAgent。用户需要填写以下参数：
- model: 模型名称（如 'glm-4.6v'）
- baseURL: API 基础 URL（如 'https://open.bigmodel.cn/api/paas/v4/'）
- apiKey: API 密钥
- language: 语言设置（如 'zh-CN'）

## 技术要求
- 尽量使用原生 JavaScript 实现
- 利用已有的 `useKeyboard.ts` hook 监听快捷键
- 使用 `page-agent` 包（已在 peerDependencies 中）
- 使用 React useEffect 显示 panel

## 实现步骤

### 步骤 1: 创建配置存储和管理模块
在 `PageAgent/index.ts` 中实现：
- 使用 localStorage 存储用户配置
- 提供配置读取和保存方法
- 提供配置验证方法

### 步骤 2: 创建配置表单组件
使用原生 JavaScript 和 DOM 操作创建：
- 一个模态框（Modal）用于显示配置表单
- 表单包含以下字段：
  - model (文本输入，默认值 'glm-4.6v')
  - baseURL (文本输入，默认值 'https://open.bigmodel.cn/api/paas/v4/')
  - apiKey (密码输入)
  - language (下拉选择，默认值 'zh-CN')
- 保存和取消按钮

### 步骤 3: 实现 agent 初始化逻辑
在 `PageAgent/index.ts` 中实现：
- `initAgent()` 函数：读取配置，创建 PageAgent 实例
- `showAgentPanel()` 函数：调用 agent.panel.show()
- 配置验证失败时显示错误提示

### 步骤 4: 集成快捷键功能
- 使用 `useKeyboard` hook 监听快捷键（默认 Ctrl+Shift+O）
- 快捷键触发时：
  - 如果配置存在，直接初始化并显示 agent
  - 如果配置不存在，显示配置表单

### 步骤 5: 添加状态管理
- 管理配置表单的显示/隐藏状态
- 管理 agent 的初始化状态
- 管理错误提示的显示

### 步骤 6: 导出接口
- 导出 `initPageAgent` 函数供外部调用
- 导出配置相关的工具函数

## 文件结构

```
src/PageAgent/
└── index.ts          # 主要实现文件
```

## 核心代码结构

```typescript
// 配置接口
interface AgentConfig {
  model: string;
  baseURL: string;
  apiKey: string;
  language: string;
}

// 主要函数
- saveConfig(config: AgentConfig): void
- getConfig(): AgentConfig | null
- validateConfig(config: AgentConfig): boolean
- initAgent(): void
- showConfigModal(): void
- hideConfigModal(): void
```

## 快捷键设计
- 默认快捷键：Ctrl + Shift + O
- 可通过 `useKeyboard` hook 的 `position` 参数自定义

## 用户体验流程
1. 用户按下快捷键（Ctrl+Shift+O）
2. 系统检查是否有已保存的配置
3. 如果有配置，直接初始化 agent 并显示 panel
4. 如果没有配置，显示配置表单
5. 用户填写配置并保存
6. 系统初始化 agent 并显示 panel

## 错误处理
- 配置验证失败时显示错误提示
- API key 为空时提示用户输入
- 初始化失败时显示友好的错误信息

## 注意事项
- 所有 DOM 操作使用原生 JavaScript
- 避免使用 antd 组件，保持轻量级
- 确保配置安全存储（localStorage）
- 提供配置重置功能
