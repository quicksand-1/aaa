# 首页行情迁移设计

日期：2026-11-26
来源项目：`Desktop/my/web3`（首页 `/`）
目标项目：`aaa`（backend: Egg 3 + TS + Knex + SQLite；frontend: Umi/Max 4 + antd 6）

## 背景

web3 首页把 9 个外部数据源直接暴露给浏览器，靠 Umi dev proxy 和本机 nginx 做跨域代理，行情解析全部在浏览器里完成。迁移到 aaa 后：

- 浏览器不再直连任何外部接口，全部由 aaa 后端承接；
- 后端每 5 分钟抓取一轮并落库，前端只读后端；
- 首页与其数据接口都不需要登录。

## 目标

1. 首页视觉与信息结构保持 web3 现状（深色 hero + 黄金 / 美债 / 利率 / 加密四张卡片）。
2. 后端每 5 分钟刷新一次，逐源独立降级：单源失败不影响其他源，失败源保留上一次成功值。
3. 前端只请求一个聚合接口，一次拿到整页数据。
4. 首页免登录可访问，行情接口不挂鉴权。

## 非目标

- 不迁移走势图：`RateHistoryDrawer`、`charts/*`、`ChartDrawer` 都不迁，`RateModule` 的「走势图」按钮一并去掉。
- 不迁移 web3 的 spot / contract / gold / tools / etf 页面。
- 不做 WebSocket 推送、失败重试、告警通道。
- 不改动 `frontend/src/fintech`。

## 架构

```
浏览器
  │  GET /api/market/overview.json（公开，无 auth）
  ▼
controller/market.ts → service/market/index.ts（读快照 + 组装响应）
  ▲
  │  market_snapshots（每源一行：payload / fetched_at / failed_at / error）
  ▲
schedule/market-refresh.ts（interval 5m，immediate）
  │
  ▼
service/market/sources/*.ts  并行抓取 9 个上游
```

### 目录

```
backend/app/lib/market/
  index.ts          # 调度：并行抓取、逐源合并、读写快照
  parse.ts          # 纯解析函数：XML / CSV / GBK 文本 / HTML
  http.ts           # 8 秒超时 + JSON / 文本 / GBK 文本读取
  types.ts          # MarketItem / MarketSource 等类型
  sources/gold.ts       # api.goldprice.dev
  sources/treasury.ts   # home.treasury.gov XML
  sources/crypto.ts     # api.coinlore.net
  sources/rates.ts      # markets.newyorkfed.org（SOFR / EFFR）
  sources/fiscal.ts     # api.fiscaldata.treasury.gov（美债总量 + TGA）
  sources/fearGreed.ts  # api.alternative.me
  sources/sina.ts       # hq.sinajs.cn（GBK，需 Referer）
  sources/fred.ts       # fred.stlouisfed.org CSV
  sources/fedWatch.ts   # centralbank.watch（HTML 抓取）
backend/app/service/market.ts     # 薄封装：overview / refresh
backend/app/schedule/market-refresh.ts
backend/app/controller/market.ts
backend/database/migrations/20261126000100_create_market_snapshots.ts
```

抓取与解析放在 `app/lib/market` 而不是 `app/service/market`：Egg 的 loader 会把 `app/service` 下的每个文件当 Service 类加载，纯函数模块放在 `app/lib` 更合适。


### 上游与产出

| source | 上游 | 产出 |
| --- | --- | --- |
| gold | `/v1/prices`、`/v1/convert`、`/v1/bars`（近 7 天，取 2 条） | XAU/USD、XAU/CNY（含 diff） |
| treasury | `home.treasury.gov/.../pages/xml?data=daily_treasury_yield_curve` | 2Y / 10Y / 30Y（diff 为百分点差） |
| crypto | `api.coinlore.net/api/ticker/?id=90,80,48543,58` | BTC / ETH / SOL / XRP（diff = 24h 涨跌） |
| rates | `markets.newyorkfed.org/api/rates/{secured/sofr,unsecured/effr}/search.json`（近 7 天） | SOFR / EFFR（diff 为百分点差） |
| fiscal | `debt_to_penny`（2 条）、`operating_cash_balance`（近 90 天） | 美债总量（diff 为百分比）、TGA（余额 + 前值 + 历史序列） |
| fearGreed | `api.alternative.me/fng/?limit=1` | `{ value, classification }` |
| sina | `hq.sinajs.cn/list=DINIW,hf_OIL,fx_susdcny` | 美元指数、布伦特原油、USD/CNY（diff 按昨收计算） |
| fred | `fredgraph.csv?id=DFEDTARU / DFEDTARL / CPIAUCSL / IORB` | `fedTargetRate`、`inflation`、`realRate`、`iorb` |
| fedWatch | `centralbank.watch/federal-reserve/` | `fomcProbabilities` |

数值口径与 web3 现状完全一致（字符串化数值、黄金按两日收盘、美债/利率用百分点差、加密用 24h 涨跌、美债总量用百分比），前端渲染逻辑不需要改。

## 表结构

```sql
market_snapshots(
  source      TEXT PRIMARY KEY,  -- gold / treasury / crypto / rates / fiscal / fearGreed / sina / fred / fedWatch
  payload     TEXT NOT NULL,     -- 该源归一化后的 JSON
  fetched_at  TEXT NOT NULL,     -- 最近一次成功时间（ISO UTC）
  failed_at   TEXT,              -- 最近一次失败时间
  error       TEXT               -- 最近一次失败原因，成功后清空
)
```

每源一行，是"逐源独立降级"的落点：某源失败时只更新 `failed_at/error`，`payload` 与 `fetched_at` 保持上一次成功值。单进程写（生产 `workers=1`），SQLite 每 5 分钟写 9 行，压力可忽略。

## 接口契约

`GET /api/market/overview.json`，不挂 `auth` 中间件。

```json
{
  "success": true,
  "data": {
    "updatedAt": "2026-11-26T08:35:12.000Z",
    "marketData": [
      { "label": "XAU/USD", "value": "3564.23", "diff": -0.42, "prefix": "$", "category": "黄金" },
      { "label": "2Y", "value": "3.58", "diff": -0.02, "suffix": "%", "category": "美债" }
    ],
    "tga": { "date": "2026-11-24", "balance": 812000000000, "prevBalance": 806000000000, "history": [{ "date": "2026-11-24", "value": 812000000000 }] },
    "fearGreed": { "value": 11, "classification": "Extreme Fear" },
    "fedTargetRate": { "high": 4, "low": 3.75 },
    "inflation": 3.02,
    "realRate": 0.98,
    "iorb": 3.9,
    "fomcProbabilities": [
      { "date": "December 9", "higher": "12.0", "same": "58.0", "lower": "30.0", "rateLevel": "3.75-4.00%", "bpChange": "-25bp" }
    ]
  }
}
```

约定：

- 只返回页面需要的字段，不暴露每源状态；`updatedAt` 是最近一轮刷新的完成时间。
- 页面没有用到的字段不返回：web3 里的 `nominalRate` 已废弃（只解析未渲染），`sources` 状态只落库和写日志，不进接口。
- `marketData` 顺序由后端固定：黄金 → 美债 → 利率 → 加密 → 汇率/能源。
- `realRate`（`fedTargetRate.high - inflation`）在后端计算；"流动性紧张""曲线倒挂"等文案判定仍在前端。
- 缺失源对应的字段整体省略（不是返回 null），前端按空值渲染骨架。

## 定时任务

`backend/app/schedule/market-refresh.ts`：

- `interval: '5m'`、`immediate: true`、`type: 'worker'`。
- 每源 `AbortSignal.timeout(8000)`，`Promise.allSettled` 并行，单源异常只记录该源。
- 模块级 in-flight 标记防重入（长请求不会叠加）。
- 日志：失败 `warn`（含 source 与错误摘要），成功记录整体耗时。

## 前端

- 新增 `frontend/src/pages/home/`：`index.jsx`、`MarketModuleCard.jsx`、`GoldModule.jsx`、`CryptoModule.jsx`、`RateModule.jsx`、`TreasuryModule.jsx`，从 web3 迁移，去掉 `useModel('global')`，数据通过 props 传入。
- 新增 `frontend/src/components/PageHeader.jsx`（aaa 缺这个组件，原样迁移）。
- 删除 `frontend/src/pages/welcome/`；路由 `/welcome` 改为 `layout: false` + `component: './home'`，保持默认重定向地址不变。
- `frontend/src/app.tsx`：`validateAuthBeforeNonLoginRoutes` 的 `PATHS` 加入 `/welcome`，未登录访问首页不再请求用户信息、不再跳登录。
- 新增 `frontend/src/services/market.js`，用 `import { request } from 'fintech'` 调 `/api/market/overview.json`。
- 页面全屏壳：顶部条（品牌 + 未登录「登录」/ 已登录「工作台」入口），主体沿用 web3 深色 hero + 四张卡片。
- 取数时机：进入页面拉一次；`document.visibilitychange` 变为可见时再拉一次；不做定时轮询。
- 「最后同步」显示 `data.updatedAt` 的 `HH:mm`，不写死"刚刚"。

## 失败与空态

- 接口不可用：骨架 + 「行情数据暂时不可用」，不弹全局 message（公开页无会话）。
- 单源失败：该卡片显示上一次的值，其余卡片照常更新。
- 首次部署尚未拉取：全部骨架屏，`immediate` 调度会在启动后补上第一轮。

## 测试

- `backend/test/app/service/market-parse.test.ts`：新浪 GBK 文本、FRED CSV、财政部 XML、cbwatch HTML 的解析，以及 diff 计算。
- `backend/test/app/service/market.test.ts`：分源降级合并（注入假 fetch，一个源抛错时其余源正常写入、失败源保留旧值）。
- `backend/test/app/controller/market.test.ts`：无会话可访问、返回结构符合契约。
- `npm run typecheck`、`npm test`（backend）；`npm run build`（frontend）。

## 风险

- `goldapi.dev`、`coinlore` 的免费额度未知，5 分钟一轮是每天 288 次；如触发限流，需要把对应源降到 15 分钟，接口 `updatedAt` 会体现变旧。
- `centralbank.watch` 靠 HTML 结构抓取，站点改版即失效，已隔离在 `fedWatch` 单源内。
- 新浪返回 GBK，Node 侧用 `TextDecoder('gbk')` 解码，必须带 `Referer: https://finance.sina.com.cn`。
