---
sidebar: false
---

---

:::success{title=更新日志}
组件、文档更新都会进行记录
:::

`未来要支持的内容`

- Xagent 的 clarify 新增 surfaces 数据规范
  - 原 agent_clarify 模式做兜底处理

---

## ⚡️1.0.6

`2026-09-29`

- 新增 [XmessageNav](/components/xmessage-nav) 组件
  - 面向聊天、问答、Copilot 场景的消息导航轨，支持悬停预览和激活态控制
  - 可在 `onNavigate` 中调用 `Xmessages` 的 `actionRef.scrollTo({ key, behavior: 'smooth' })` 快速定位消息

---

## ⚡️1.0.5

`2026-09-04`

- parseNestedJSON
  - 🐞 修复类型保护失效的问题
- secret
  - 新增管理员模式

---

## ⚡️1.0.4

`2026-08-19`

- 新增 secret 公共模块
  - 对齐 general-system 最新 API Token 管理契约：列表吸收明文回看，新增编辑与停用后删除，启停统一使用状态接口，并切换为六项新权限编码
  - 创建抽屉保持仅输入秘钥名称，默认不提交有效期和接口 scope
  - 增加秘钥表单契约测试，并让 Vitest 收集 `frame` 目录测试

---

## ⚡️1.0.3

`2026-08-07`

- Xsender
  - 🐞 修复 useEffect 引用不稳定变量导致内存泄漏的问题
- AGENTS.md
  - 大幅优化规则逻辑，从 400+ 行缩短到 170+行

---

## ⚡️1.0.2

`2026-07-31`

- Xmarkdown
  - 支持 code 可配置

---

## ⚡️1.0.1

`2026-07-24`

- LinkBtn
  - 支持 href + download 的原生属性，自动拼接 proxy
- ProTableAsync
  - rowSelection 模型是自动添加 `columnWidth: 50`

---

## ⚡️1.0.0

`2026-07-17`

- 用户编辑：新增“定期修改密码”的开关字段
- Xmessages：新增内置功能，消息下拉到底部的悬浮按钮
- skills：新增 f-chat-layout 技能，用于指导页面 Chat 创建/修复

---

<details>
<summary>展开查看 1.0.0-beta8 及之前的历史版本</summary>

> 以下为 1.0.0-beta8 及之前的更新记录

## ⚡️1.0.0-beta8

`2026-07-03`

- Xsender：重构输入内核。
  - PS：`项目升级该版本后，业务侧需要重新接入该组件`
  - 提示词：`fintech Xsender 重构了设计，请按照现有业务形态进行改造，在此之前请仔细阅读组件源码和业务代码。`
- Login：登录新增 `needModifiedPwd` 交互，强制用户修改密码。

---

## ⚡️1.0.0-beta7

`2026-06-26`

- Xmessages
  - 🐞 修复初始化滚动时内容在持续增长时无法吸附到底部的问题
- clipboard：兼容性优化
- 🐞 修复字典管理数据读取错误的问题

---

## ⚡️1.0.0-beta6

`2026-06-12`

- 移除文档 utils/eventSource
- 新增 [fetchSSE](/utils/fetch-sse) 函数，用于发送 SSE 事件

---

## ⚡️1.0.0-beta5

`2026-06-05`

- Ticket
  - 样式改为 tailwindcss 样式，宿主项目 `tailwindcss.config.js` 需要添加 `'./src/fintech/src/**/*.{ts,tsx,js,jsx}'`
  - TicketContainer
    - 支持 height 高度自定义
    - 移除 PageContainer 组件包裹，由业务自行决定是否包裹
  - TicketBell 的跳转行为可以自定义了
  - TicketDrawer 的 Iframe src 路径统一为 `/ticket/${ticketKey}`
  - useBald：通过路由规范后，该函数已被移除
- X 系列组件
  - 拆分为独立子入口，避免主入口默认带入相关资源
  - 现在请从 `fintech/x` 引用，例如 `import { Xmarkdown, Xmessages } from 'fintech/x'`
- ProTableAsync
  - 🐞 修复非 url 模式时，pagination 事件触发多次的问题

---

## ⚡️1.0.0-beta4

`2026-05-20`

- 新增 [Xagent](/components/xagent) 套件
- system 相关组件内部移除 PageContainer 组件包裹

---

## ⚡️1.0.0-beta3

`2026-05-13`

- 新增 [SplitterBox](/components/splitter-box) 组件
- 新增 [Xmarkdown](/components/xmarkdown) 组件
- 新增 [Xllm](/components/xllm) 组件
- 新增 [Xsender](/components/xsender) 组件
- 新增 [Xmessages](/components/xmessages) 组件
- FormItem 新增 password 类型
- DrawerBox 移除 ref 用法，统一使用 actionRef

---

## ⚡️1.0.0-beta2

`2026-04-24`

> 本次升级内容较多，antd、icons、pro-components 都升级到了官方最新版本

- 大版本升级[参考](https://abssqr.yuque.com/vy6o6k/dral7s/ddmg385owtuhdgsw)
- Agents
  - AGENTS.md
    - 新增 storageSQL 使用约定
    - 新增全局状态管理规范
  - 技能
    - 新增技能 upgrade-guide，帮助老项目代码升级到新版本
- usePageAgent 引用方式修改 `import usePageAgent from 'fintech/hooks/usePageAgent'`
- login：
  - 移除了老版的登录页面
  - 项目中 routes.ts `❌ component: '@/fintech/frame/login/new'` `✅ component: '@/fintech/frame/login'`

---

## ⚡️1.0.0-beta

`2026-03-25`

- 新增 [usePageAgent](/utils/use-page-agent) 钩子函数
- 新增 [agents](/agents) 公共管理目录
- useKeyboard 钩子函数新增 callback 参数

---

</details>

<details>
<summary>展开查看 0.7.0 之前的历史版本</summary>

> 以下为 0.7.0 之前的更新记录

## ⚡️0.7.0

`2026-03-18`

- EditTable
  - 现在能支持 select 类型的异步选择了，用法同 FormSchema 中的 select 类型

---

## ⚡️0.6.2

`2026-03-05`

- ChartFilterDrawer
  - 移除 defaultVisible 参数，使用 initialVisibleCount 替代默认显示所有分类和控制数量
- ProTableAsync
  - mergeDataIndex 支持嵌套的 dataIndex
- qrcode
  - 生成二维码时改为翻页显示，避免大量二维码造成页面卡顿的情况

---

## ⚡️0.6.1

`2026-02-28`

- ChartFilterDrawer
  - 新增图表数据过滤组件，一般搭配 Charts 使用
- 新增 useComposing 自定义 hook，用于处理复合文本输入（如拼音）
- 文档结构变更，移除 charts 导航，现在所有组件都在 components 目录下
- 移除 \_components 示例的目录，现在所有示例都在各自组件的文档中
- ProTableAsync
  - 修复 pagination 控制不生效的问题；主要表现在自定义 pagination 时，pageSize 选择不生效的问题；

---

## ⚡️0.6.0

`2026-02-11`

- LinkBtn
  - 减少 API 数量，减少混合使用
  - 移除 API：params，回归原生 Link 模式
  - 移除 type：请使用 variant + color 进行控制
  - confirm 模式下，method 属性改为 boolean

---

## ⚡️0.5.6

`2026-02-09`

- LinkBtn
  - 新增 tooltip 属性，支持为按钮添加提示信息
  - 新增 tooltipProps 属性，可自定义提示框位置、样式等
  - 扩展基础示例，添加图标支持，展示纯文本、纯 icon 和文本+icon 三种使用场景

---

## ⚡️0.5.5

`2026-01-28`

- EditTable
  - 移除了 EditTable.initSubId 方法
  - 新增 actionRef.current?.initId 方法

---

## ⚡️0.5.4

`2026-01-19`

- UserManage：状态新增“删除”
- More：重构，现在 items 改为 object[]，扩展性更好

---

## ⚡️0.5.3

`2026-01-16`

- ProTableAsync：修复自定义 pagination 时内部分页器判断错误的问题

`2026-01-14`

- SelectList
  - 新增“复合文本输入，比如拼音”的时机判断，在 localSearch 和 search 模式下生效，降低触发搜索的频率

---

## ⚡️0.5.2

`2026-01-12`

- Excel2Json：templateUrl 支持 publicPath 配置

`2026-01-08`

- SelectList
  - 优化 options 过滤函数，降低频繁渲染的额外消耗，提升性能
  - 新增 options 和 extraOptions 的去重功能
  - localSearch 现在会默认打开 showSearch 参数，以配合搜索功能

---

## ⚡️0.5.1

`2026-01-07`

- localConfig：简化配置内容，现在以组件为单位进行收缩接口
  - 同步修改 ProTableAsync、DescList 组件接口

`2026-01-05`

- 移除 LinkBtn.Confirm 的调用，现在直接使用 [LinkBtn](/components/link-btn#docs-components-link-btn-demo-demo5)
- More
  - 文档更新
  - items 现在支持 ReactNode 的 open 属性了

---

## ⚡️0.5.0

`2025-12-30`

- delayQuery：移除
- [cacheRequest](/util/cache-request)：新增，替代 delayQuery
- delay：该参数已弃用，请使用 cache

---

## ⚡️0.4.4

`2025-12-18`

- useCrypto
  - 优化 sm2 的 encode 函数，使其支持公钥压缩
- 移除单独使用 sm2 和 sm4 的代码和演示用例

`2025-12-15`

- 移除 useSM4 方法
- 新增 [useCrypto](/util/use-crypto) 方法
- Login：新增 crypto 控制器，可对账号和密码进行加密

---

## ⚡️0.4.3

`2025-12-11`

- [GlobalScheduler](/util/global-scheduler)
  - 队列任务优化，现在支持 listen 函数了
- [LinkBtn](/components/link-btn#docs-components-link-btn-demo-demo6)
  - 新增属性 open，请避免使用原生的 hidden 属性
- [SelectList](/components/select-list)
  - 异步 search 时，清空搜索值需要请求
- [AsyncSwitch](/components/async-switch#docs-components-async-switch-demo-demo2)
  - 新增 beforeChange API，可在切换前进行拦截或添加额外数据

`2025-12-10`

- DrawerBox
  - confirmLoading 现在也会同时影响内容区域了

`2025-12-08`

- Login
  - 新增验证码功能
  - 新增加密功能，请 `npm install sm-crypto`

---

## ⚡️0.4.2

`2025-12-05`

- AsyncSwitch
  - 修复 name 不设置时，依然传递 name 的问题

`2025-12-04`

- ProTableAsync
  - 修复 column 有 children 时内部计算宽度错误的问题
- Login
  - remember 改为可配置

`2025-12-03`

- FormSchema
  - 支持紧凑型的表单数据渲染模型。[demo](/components/form-item#docs-components-form-item-demo-demo7)

---

## ⚡️0.4.1

`2025-11-28`

- parseNestedJSON
  - 优化 json 字符串格式化的逻辑

`2025-11-25`

- FormItem
  - 修复没有 name 时无法使用 required 来显示必填标记的问题
- DescList
  - 扩展 tooltip 的 [使用方式](/components/desc-list#docs-components-desc-list-demo-demo4)
  - 移除 valueType=status，改成使用 valueType=badge

`2025-11-24`

- JsonCode
  - 分离复杂 json 字符串的识别能力，独立函数 parseNestedJSON。

---

## ⚡️0.4.0

`2025-11-20`

- More（新增）：可以将多个操作按钮收拢到一个按钮，hover 展开，减少页面宽度占用
- Chronobreak：
  - 修改默认按钮文案：时空断裂 => 回显
  - 新增 hover 用户提示
- ProTableAsync
  - 移除属性 autoScrollX，并由组件内部自动识别
  - 默认添加 virtual 属性，自动开启条件：无翻页 或 pageSize >= 50
- StatusTag
  - 扩展 [valueEnum](/components/status-tag#docs-components-status-tag-demo-demo2) 的使用范围，现在可以支持 Tag 的原生 API 了

---

## ⚡️0.3.4

`2025-11-18`

- LinkBtn
  - 默认 color 属性值改为 primary，可以适配系统的 token.colorPrimary 变量

---

## ⚡️0.3.3

`2025-11-12`

- ProTableAsync
  - 修复无法使用 rowClassName 的问题

`2025-11-11`

- ProTableAsync
  - column 新增配置项 requiredOne，实现多选一的场景
- fileController
  - downloadBlob 方法兼容了后端返回 errorMessage 的错误提示

`2025-11-07`

- 优化文档：关于 Status 在各个组件中的默认行为和颜色规范，请参考：[StatusBadge](/components/status-badge)

---

## ⚡️0.3.2

`2025-10-23`

- MagicTabs
  - 修复初始化选中项错误的问题

`2025-10-15`

- BarPro
  - 新增属性 autoHeight

---

## ⚡️0.3.1

`2025-10-09`

- EditTable
  - 优化内部对默认的 fieldProps、formItemProps 的优先级
  - 新增属性 createDefaultValue

`2025-09-30`

- GlobalScheduler
  - 代码优化，移除未知 this 属性，防止内存泄漏

`2025-09-24`

- GlobalScheduler
  - 参数名称优化
  - 文档优化

---

## ⚡️0.3.0

`2025-09-22`

- storageSQL：rename 方法传参改为 object

`2025-09-19`

- 新增类：[GlobalScheduler](/util/global-scheduler)

---

## ⚡️0.2.1

`2025-09-12`

- storageSQL：恢复 rename 方法
- 新增组件：
  - Chronobreak：时空断裂组件，可记录上一次提交的表单内容，并提供回显

`2025-09-11`

- DateQuick：优化 disabledDate 逻辑，使其支持 >0 或 <0 语法，[示例](/components/date-quick#docs-components-date-quick-demo-2)

---

## ⚡️0.2.0

`2025-09-03`

- SelectList：localSearch 属性默认支持 label、value 的匹配搜索

`2025-08-29`

- 重构中间件逻辑，使其支持 sso 登录功能
- platform.ts：新增 ssoToken 属性，配合 sso 登录使用

---

## ⚡️0.1.0

`2025-08-27`

- SelectList：重构，优化冗余语法，现在可以直接将 api 传给 SelectList 并获得能力
  - 移除用法 `SelectList.Dict、SelectList.Async`
- DescList：重构，优化冗余语法，现在可以直接将 api 传给 DescList 并获得能力
  - 移除用法 `DescList.Async`

---

## ⚡️0.0.9

`2025-08-21`

- frame：TopRightWidget UI 改造，现在更美观了

`2025-08-20`

- 新增组件：AsyncTree
- FormItem：支持 tree 类型
- frame：系统管理新增“数据权限”

`2025-08-19`

- frame：系统管理新增“参与方管理”

`2025-08-18`

- LinkBtn：重构，内部组件由原生的 button 改为 antd 的 Button
- BarPro：设置默认的最大宽度样式

---

## ⚡️0.0.8

`2025-08-05`

- RadioList、CheckList、SelectList：option 对象支持 open 属性
- CodeMirror：新增 autoHeight 属性

---

## ⚡️0.0.7

`2025-07-31`

- 新增组件 [StatusTag](/components/status-tag)，用法同 StatusBadge
- DescList 新增 valueType=tag

---

## ⚡️0.0.6

`2025-07-28`

- 新增组件 [CodeMirror](/components/code-mirror)
- AsyncSwitch：新增 nameEnum 属性，关联 name 属性提交枚举

---

## ⚡️0.0.5

`2025-07-25`

- Ticket：当审批状态为 “无审批” 时，不展示审批节点信息

`2025-07-23`

- ProTableAsync：数据导出支持 csv 格式

---

## ⚡️0.0.4

`2025-07-21`

- Ticket：Container 组件的 footer 渲染代码改为 ActionsContainer 组件支持

`2025-07-18`

- ProTableAsync：ExportItemProps 新增 exportRef 属性，使其可以自定义下载功能

`2025-07-16`

- FormUpdate：新增组件，区别于 FormSchema 的函数式，可用于零散的表单联动

---

## ⚡️0.0.3

`2025-07-14`

- frame 目录下关于框架层面的代码进行整理和优化，请注意升级后框架的改造方案

`2025-07-09`

- Pro 框架整理，主要对 platform.ts 的配置进行规范，方便后期进行改造

`2025-07-08`

- ProTableAsync：优化 pagination 的默认行为

`2025-07-07`

- DrawerBox：重新定义组件内部的 ref 调用方式，现在推荐使用 actionRef 代替 ref

---

## ⚡️0.0.2

`2025-07-04`

- FormSchema：items 的 function 支持返回 Object 类型
- Dnd：使用方式优化，现在使用独立的 Dnd 组件了

---

## ⚡️0.0.1

`2025-06-30`

- FormSchema：优化 unique 使其支持数组模式，现在可以配置多个字段进行唯一性验证

`2025-06-27`

- 创建新的登录界面

`2025-06-26`

- Pro：框架说明文档 “多平台支持” 优化
- frame：框架层新增 RoutesSearch 组件，搭配 routesSearch 参数使用

`2025-06-25`

- SelectList：
  - 修改文档对 linkProps 的使用方式
  - 修改 trigger 的枚举，使其对齐 antd 官方的使用语法

`2025-06-24`

- 新增 Dnd 组件

`2025-06-23`

- antd 依赖版本升级，>=5.25。`请注意升级项目中的 antd 版本`
- SelectList：dropdownRender 函数改为最新的 popupRender
- DrawerBox：destroyOnClose 属性改为 destroyOnHidden

`2025-06-20`

- useAsyncScripts：内部默认支持 `localConfig.publicPath` 配置

`2025-06-17`

- MagicTabs：优化 persistenceKey 初始化机制
- AutoRefresh：优化 persistenceKey 持久化机制

</details>
