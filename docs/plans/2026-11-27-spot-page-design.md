# 现货页面迁移设计

日期：2026-11-27
来源项目：`Desktop/my/web3`（`/spot` 页面 + `backup/20261126.json`）
目标项目：`aaa`（backend: Egg 3 + TS + Knex + SQLite；frontend: Umi/Max 4 + antd 6）

## 背景

web3 的现货页是一个纯前端账本：数据存在浏览器 localStorage（`fintech` 的 `storageSQL` 表 `record`），手续费率写死为常量 `TRANS_FEE_RATE = 0.001`，并且把「本币合约」的已实现盈亏混入现货收益和持仓成本。

迁移到 aaa 后：

- 数据落到后端 SQLite，按登录用户隔离；
- 费率由用户自己设定并持久化；
- 页面与接口都要求登录；
- 用 `backup/20261126.json` 导入历史数据。

## 目标

1. 复刻 web3 现货页：持仓 / 盈 / 亏 / USDT 四个分组，卡片指标、买入、加仓、卖出、删除明细、备注、成本线图表。
2. 数据入库，按 `user_id` 隔离；接口全部挂 `auth`。
3. 每个用户一份全局费率（买入费率、卖出费率），默认 0.1%，页面可改。
4. 导入 `20261126.json` 的 12 个币种、196 笔交易，保留原始手续费。
5. 计算口径与 web3 一致（去掉本币合约部分）。

## 非目标

- 不迁移本币合约：`coinContract` 字段、`CoinContractBuy/Sell/Panel/Margin`、`CoinContractDetail`、`CoinCalculator`、`coinContractUtils` 都不迁；收益只算现货。
- 不迁移 `contract` / `gold` / `etf` / `tools` 页面。
- 不接实时行情接口：图表只画本地成交点与成本线。
- 不支持编辑单笔交易（只支持新增、删除，与原版一致）。
- 不改动 `frontend/src/fintech`。

## 架构

```
浏览器 /spot（工作台 layout，需登录）
  │ GET /api/spot/overview.json   (auth)
  │ POST/PUT/DELETE ...           (auth)
  ▼
controller/spot.ts → service/spot.ts（读写 + 组装）
  ▲
  │ spot_records / spot_transactions / spot_fee_settings
  ▲
scripts/import-spot.ts（一次性导入备份数据）
```

计算逻辑抽成纯函数放 `app/lib/spot/compute.ts`，方便单测。

### 目录

```
backend/
  database/migrations/20261127000100_create_spot_tables.ts
  database/seed/spot-20261126.json        # 只保留 backup 里的 record 部分
  scripts/import-spot.ts
  app/lib/spot/compute.ts                 # 纯计算：持仓、均价、收益、占比
  app/service/spot.ts                     # 读写、校验、费率
  app/controller/spot.ts
  app/router.ts                           # 6 条路由，全部挂 auth

frontend/src/pages/spot/
  index.jsx            # 拉数据、分组、布局
  api.js               # 页面内请求封装
  CurrencyCard.jsx     # 卡片
  Buy.jsx              # 首次买入
  Addition.jsx         # 加仓
  Sell.jsx             # 卖出
  Remark.jsx           # 备注
  DetailDrawer.jsx     # 明细抽屉（删除单笔）
  ChartDrawer.jsx      # 成本线抽屉
  Chart.jsx            # 成本线图
  StatisticList.jsx    # 总收益 / 手续费
  FeeSettings.jsx      # 费率设置抽屉
frontend/src/components/
  PositionTabs.jsx     # 从 web3 复制
  PositionCardActions.jsx
  GlassButton.jsx
```

## 表结构

```sql
spot_records(
  id integer primary key,
  user_id bigint not null references users(id) on delete cascade,
  currency varchar(16) not null,
  remark text null,
  created_at datetime not null,
  updated_at datetime not null,
  unique(user_id, currency)
)

spot_transactions(
  id integer primary key,
  record_id integer not null references spot_records(id) on delete cascade,
  type varchar(8) not null,      -- first / add / sell
  price real not null,
  quantity real not null,
  value real not null,           -- price * quantity
  fee real not null,             -- value * 对应费率（导入数据保留原值）
  created_at datetime not null,
  index(record_id)
)

spot_fee_settings(
  id integer primary key,
  user_id bigint not null unique references users(id) on delete cascade,
  buy_rate real not null,
  sell_rate real not null,
  updated_at datetime not null
)
```

- 金额与数量写入前统一四舍五入到 9 位（对齐 web3 的 `formatNumber` 默认精度）。
- 费率首次访问时惰性插入 `0.001 / 0.001`。
- 删除最后一笔交易后保留 `spot_records` 行（备注仍可保留），状态自然变为已清仓。

## 接口契约

所有接口挂在 `auth` 中间件下，数据按 `ctx.state.currentUser.id` 隔离。

### GET `/api/spot/overview.json`

```json
{
  "success": true,
  "data": {
    "feeRates": { "buyRate": 0.001, "sellRate": 0.001 },
    "statistics": { "profit": 123.45, "fee": 6.7891 },
    "records": [
      {
        "id": 1,
        "currency": "BTC",
        "remark": "…",
        "status": "holding",
        "quantity": "0.00312",
        "avgPrice": "103245.12",
        "cost": "322.13",
        "fee": "1.2345",
        "spotProfit": "12.34",
        "profit": "12.34",
        "profitRaw": 12.34,
        "buyAvgPrice": "102991.20",
        "sellAvgPrice": "105100.00",
        "weight": "35.21",
        "transactions": [
          {
            "id": 1,
            "type": "first",
            "price": 106014.4,
            "quantity": 0.00018865,
            "value": 19.99961656,
            "fee": 0.01599969,
            "createdAt": "2026-08-24 18:07:58"
          }
        ]
      }
    ]
  }
}
```

- 展示用数值字段（`quantity`、`avgPrice`、`cost`、`fee`、`spotProfit`、`profit`、`buyAvgPrice`、`sellAvgPrice`、`weight`）返回已格式化的字符串，`-` 表示无值；`profitRaw` 为数值，用于排序和正负判断。
- `status`：`holding` / `closed`。
- `type`：`first` / `add` / `sell`，前端映射为 首次 / 加仓 / 卖出。

### 写接口

| 方法 | 路径 | 请求体 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/spot/records.json` | `{ currency, price, quantity }` | 首次买入；币种已存在返回 409 |
| POST | `/api/spot/records/:id/transactions.json` | `{ type: 'add'\|'sell', price, quantity }` | 卖出校验不超过可用数量 |
| DELETE | `/api/spot/records/:id/transactions/:txId` | - | 删除单笔 |
| PUT | `/api/spot/records/:id/remark.json` | `{ remark }` | 备注，最长 2000 字 |
| PUT | `/api/spot/fee-rates.json` | `{ buyRate, sellRate }` | 0 ≤ rate ≤ 0.1 |

错误口径沿用现有 `ApiError`：未登录 `401 UNLOGIN`；访问他人数据按不存在处理 `404 NOT_FOUND`；参数非法 `400 VALIDATION_ERROR`；币种重复 `409 CONFLICT`。

## 计算口径

按交易时间顺序（`id` 升序）逐笔累计：

1. 买入（`first` / `add`）：
   - 若当前持仓为负（不会出现在现货里，保留原逻辑防御），重置数量/价值；否则累加
   - `持仓均价 = 持仓价值 / 持仓数量`
   - 累计买入均价按 `Σ(数量 × 均价) / Σ数量` 计算
2. 卖出（`sell`）：
   - `持仓数量 -= 数量`
   - `持仓价值 = 持仓数量 × 持仓均价`
   - `收益 += (卖价 − 持仓均价) × 数量`
   - 累计卖出均价同样按 `Σ(数量 × 均价) / Σ数量`
3. 结束后：
   - `持仓数量 <= 0` → `status = closed`，数量/价值/均价归零
   - `现货收益 = 收益 − Σ手续费`
   - `持仓数量 > 0` 时 `持仓价值 -= min(现货收益, 0)`，再重算展示用持仓均价
4. USDT 特殊处理：`profit = 卖出总量 − 买入总量`，不展示持仓均价与手续费
5. `占比 = 该币种持仓成本 / 非 USDT 总持仓成本`，USDT 为 `-`
6. 排序：非 USDT 按持仓成本降序，USDT 固定最后
7. `statistics.profit` 为所有非 USDT 币种的现货收益之和，`statistics.fee` 为全部手续费之和

## 前端

- 路由：`{ path: '/spot', name: '现货', component: './spot' }`，位于工作台 layout 内，未登录会被现有守卫重定向到 `/login`。
- 页面拉一次 `overview.json`，把 `records`、`feeRates` 通过 props 传给子组件，写操作成功后调用 `refresh()` 重新拉取（沿用 web3 的 `query` 模式）。
- 分组规则：`holding`（持仓中）→ `profit`（收益 ≥ 0）→ `loss`（收益 < 0）→ `usdt`。
- 卡片指标：持仓数量、持仓均价、持仓成本、手续费、累计买入均价、累计卖出均价、成本占比、收益。
- 明细抽屉：类型标签、均价、数量、价值、手续费、删除按钮；卖出超量等错误由后端返回并提示。
- 费率设置：PageHeader 操作区新增「费率设置」按钮，抽屉内两个百分比输入（0~10%），保存后刷新。
- 删除 `Chart` 里的本币合约相关内容，只保留成交点 + 成本线。

## 历史数据导入

- `backend/database/seed/spot-20261126.json`：只保留 `record` 数组，去掉 `contract` / `gold_record` / `note` / `etf`。
- `scripts/import-spot.ts`：`npm run import:spot -- --user admin`，按币种创建 `spot_records` 并写入全部交易；`type` 由中文映射为 `first/add/sell`；`fee` 使用备份原值。
- 幂等策略：目标用户已有任何 `spot_records` 时直接报错退出，避免重复导入。
- 导入后 `created_at` 使用备份里的 `createTime`，交易 `created_at` 按原顺序生成，保证排序稳定。

## 测试

后端：

- `lib/spot/compute` 单测：普通买卖、全部清仓、USDT 口径、亏损摊入成本、占比、手续费合计、空交易记录。
- 接口测试：未登录 401；两个用户数据互不可见；首次买入重复币种 409；卖出超量 400；费率越界 400；删除明细后统计更新。
- 导入脚本：在测试库跑一次，断言 12 个币种、196 笔、admin 用户名下。

前端：

- `npm run build` 通过。
- headless Chrome 实测：登录后 `/spot` 渲染 12 张卡片、四个 tab 计数正确；新增加仓后数字变化；改费率后新交易按新费率计算，历史手续费不变。

## 风险

- 中文业务键改为英文键（`type`、`status`、派生字段）需要同步改所有复制过来的组件，遗漏会在构建或渲染时暴露；靠 build + 页面实测兜底。
- SQLite `real` 为浮点，累加收益可能有极小误差；写入前四舍五入到 9 位、展示时按 2 位格式化。
- 备份数据的 `价值` 字段在 USDT 上按 1:1 记录（价值=数量），计算累计均价时统一用 `数量 × 均价`，与原版保持一致。
- 导入脚本不可重复执行，靠「用户已有数据即拒绝」防止重复写入。
