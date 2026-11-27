# 现货页面迁移实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 web3 的现货账本页迁移到 aaa：数据落 SQLite、按用户隔离、费率可配、需登录访问。

**Architecture:** 后端三张表（`spot_records` / `spot_transactions` / `spot_fee_settings`），计算逻辑抽成纯函数 `app/lib/spot/compute.ts`，接口返回整页数据；前端 `/spot` 放在工作台 layout 内，请求页面内 `api.js`。

**Tech Stack:** Egg 3 + TypeScript + Knex + SQLite（better-sqlite3）；Umi/Max 4 + antd 6 + fintech。

**设计文档：** `docs/plans/2026-11-27-spot-page-design.md`

---

## 准备

```bash
cd /Users/chenlong/Desktop/my/aaa
git checkout main && git pull
git checkout -b feat/spot
```

---

### Task 1: 建表迁移

**Files:**
- Create: `backend/database/migrations/20261127000100_create_spot_tables.ts`
- Modify: `backend/test/support/db.ts`（`TABLES` 数组）

**Step 1: 写迁移**

```ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('spot_records', (table) => {
    table.increments('id');
    table
      .bigInteger('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('currency', 16).notNullable();
    table.text('remark').nullable();
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
    table.unique(['user_id', 'currency'], 'uniq_spot_records_user_currency');
  });

  await knex.schema.createTable('spot_transactions', (table) => {
    table.increments('id');
    table
      .integer('record_id')
      .notNullable()
      .references('id')
      .inTable('spot_records')
      .onDelete('CASCADE');
    table.string('type', 8).notNullable();
    table.float('price').notNullable();
    table.float('quantity').notNullable();
    table.float('value').notNullable();
    table.float('fee').notNullable();
    table.datetime('created_at').notNullable();
    table.index(['record_id'], 'idx_spot_transactions_record_id');
  });

  await knex.schema.createTable('spot_fee_settings', (table) => {
    table.increments('id');
    table
      .bigInteger('user_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.float('buy_rate').notNullable();
    table.float('sell_rate').notNullable();
    table.datetime('updated_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('spot_fee_settings');
  await knex.schema.dropTableIfExists('spot_transactions');
  await knex.schema.dropTableIfExists('spot_records');
}
```

**Step 2: 测试库重置列表加三张表**

`backend/test/support/db.ts` 的 `TABLES` 改成（顺序按外键依赖）：

```ts
const TABLES = [
  'spot_transactions',
  'spot_fee_settings',
  'spot_records',
  'market_snapshots',
  'user_identities',
  'mobile_login_tickets',
  'sessions',
  'user_permissions',
  'users',
];
```

**Step 3: 验证迁移**

```bash
cd backend && npm run migrate:test && npm run typecheck
```

Expected: `Batch N run: 1 migrations`，typecheck 无输出。

**Step 4: 提交**

```bash
git add backend/database/migrations/20261127000100_create_spot_tables.ts backend/test/support/db.ts
git commit -m "feat: 新增现货账本表"
```

---

### Task 2: 计算纯函数（TDD）

**Files:**
- Create: `backend/app/lib/spot/compute.ts`
- Test: `backend/test/app/service/spot-compute.test.ts`

**Step 1: 先写失败测试**

```ts
import assert from 'assert';
import { computeOverview } from '../../../app/lib/spot/compute';

const tx = (over: Partial<any>) => ({
  id: 1,
  type: 'add',
  price: 100,
  quantity: 1,
  value: 100,
  fee: 0.1,
  createdAt: '2026-01-01 00:00:00',
  ...over,
});

describe('lib/spot/compute', () => {
  it('买入累加数量与价值，算出持仓均价', () => {
    const result = computeOverview([
      {
        id: 1,
        currency: 'BTC',
        remark: null,
        transactions: [
          tx({ id: 1, type: 'first', price: 100, quantity: 1, value: 100 }),
          tx({ id: 2, type: 'add', price: 200, quantity: 1, value: 200 }),
        ],
      },
    ]);

    const record = result.records[0];
    assert.strictEqual(record.status, 'holding');
    assert.strictEqual(record.quantity, '2');
    assert.strictEqual(record.avgPrice, '150');
    assert.strictEqual(record.cost, '300');
    assert.strictEqual(record.fee, '0.2');
    assert.strictEqual(record.spotProfit, '-0.2');
    assert.strictEqual(record.buyAvgPrice, '150');
    assert.strictEqual(record.sellAvgPrice, '-');
  });

  it('卖出按当时持仓均价算收益，亏损摊入剩余成本', () => {
    const result = computeOverview([
      {
        id: 1,
        currency: 'BTC',
        remark: null,
        transactions: [
          tx({ id: 1, type: 'first', price: 100, quantity: 2, value: 200, fee: 0 }),
          tx({ id: 2, type: 'sell', price: 90, quantity: 1, value: 90, fee: 0 }),
        ],
      },
    ]);

    const record = result.records[0];
    // 卖 1 个亏 10，剩 1 个成本 100 - 10 = 90
    assert.strictEqual(record.quantity, '1');
    assert.strictEqual(record.cost, '90');
    assert.strictEqual(record.avgPrice, '90');
    assert.strictEqual(record.spotProfit, '-10');
  });

  it('清仓后数量、成本、均价归零', () => {
    const result = computeOverview([
      {
        id: 1,
        currency: 'ETH',
        remark: null,
        transactions: [
          tx({ id: 1, type: 'first', price: 100, quantity: 1, value: 100, fee: 0 }),
          tx({ id: 2, type: 'sell', price: 120, quantity: 1, value: 120, fee: 0 }),
        ],
      },
    ]);

    const record = result.records[0];
    assert.strictEqual(record.status, 'closed');
    assert.strictEqual(record.quantity, '0');
    assert.strictEqual(record.cost, '0');
    assert.strictEqual(record.profit, '20');
  });

  it('USDT 收益按数量差，且不参与占比', () => {
    const result = computeOverview([
      {
        id: 1,
        currency: 'BTC',
        remark: null,
        transactions: [
          tx({ id: 1, type: 'first', price: 100, quantity: 1, value: 100, fee: 0 }),
        ],
      },
      {
        id: 2,
        currency: 'USDT',
        remark: null,
        transactions: [
          tx({ id: 2, type: 'first', price: 1, quantity: 100, value: 100, fee: 0 }),
          tx({ id: 3, type: 'sell', price: 1, quantity: 40, value: 40, fee: 0 }),
        ],
      },
    ]);

    const usdt = result.records.find((item) => item.currency === 'USDT')!;
    assert.strictEqual(usdt.profit, '40');
    assert.strictEqual(usdt.weight, '-');

    const btc = result.records.find((item) => item.currency === 'BTC')!;
    assert.strictEqual(btc.weight, '100');
  });

  it('统计只累加非 USDT 收益，手续费累加全部', () => {
    const result = computeOverview([
      {
        id: 1,
        currency: 'BTC',
        remark: null,
        transactions: [
          tx({ id: 1, type: 'first', price: 100, quantity: 1, value: 100, fee: 0.1 }),
          tx({ id: 2, type: 'sell', price: 110, quantity: 1, value: 110, fee: 0.11 }),
        ],
      },
      {
        id: 2,
        currency: 'USDT',
        remark: null,
        transactions: [
          tx({ id: 3, type: 'first', price: 1, quantity: 100, value: 100, fee: 0 }),
        ],
      },
    ]);

    assert.strictEqual(result.statistics.profit, 9.79);
    assert.strictEqual(result.statistics.fee, 0.21);
  });

  it('排序按持仓成本降序，USDT 固定最后', () => {
    const result = computeOverview([
      {
        id: 1,
        currency: 'USDT',
        remark: null,
        transactions: [tx({ id: 1, price: 1, quantity: 10, value: 10, fee: 0 })],
      },
      {
        id: 2,
        currency: 'ETH',
        remark: null,
        transactions: [tx({ id: 2, price: 100, quantity: 1, value: 100, fee: 0 })],
      },
      {
        id: 3,
        currency: 'BTC',
        remark: null,
        transactions: [tx({ id: 3, price: 100, quantity: 5, value: 500, fee: 0 })],
      },
    ]);

    assert.deepStrictEqual(
      result.records.map((item) => item.currency),
      ['BTC', 'ETH', 'USDT'],
    );
  });

  it('没有交易的记录视为已清仓', () => {
    const result = computeOverview([
      { id: 1, currency: 'POL', remark: '空', transactions: [] },
    ]);

    assert.strictEqual(result.records[0].status, 'closed');
    assert.strictEqual(result.records[0].quantity, '0');
    assert.strictEqual(result.records[0].profit, '0');
  });
});
```

**Step 2: 跑测试确认失败**

```bash
cd backend && npx egg-bin test test/app/service/spot-compute.test.ts
```

Expected: `Cannot find module '../../../app/lib/spot/compute'`。

**Step 3: 实现**

`backend/app/lib/spot/compute.ts`：

```ts
export type SpotTransactionType = 'first' | 'add' | 'sell';

export interface SpotTransactionInput {
  id: number;
  type: SpotTransactionType;
  price: number;
  quantity: number;
  value: number;
  fee: number;
  createdAt: string;
}

export interface SpotRecordInput {
  id: number;
  currency: string;
  remark: string | null;
  transactions: SpotTransactionInput[];
}

export interface SpotRecordView extends Omit<SpotRecordInput, 'transactions'> {
  status: 'holding' | 'closed';
  quantity: string;
  avgPrice: string;
  cost: string;
  fee: string;
  spotProfit: string;
  profit: string;
  profitRaw: number;
  buyAvgPrice: string;
  sellAvgPrice: string;
  weight: string;
  transactions: SpotTransactionInput[];
}

export interface SpotOverview {
  records: SpotRecordView[];
  statistics: { profit: number; fee: number };
}

// 沿用 web3 的币种精度配置：持仓均价、累计买卖均价共用，未知币种均价 2 位、累计均价 4 位、数量 4 位
const CURRENCY_PRECISION: Record<string, number> = {
  BTC: 0,
  ETH: 0,
  SOL: 3,
  DOGE: 5,
  PEOPLE: 4,
  PEPE: 8,
  TURBO: 5,
  OM: 5,
  CFX: 4,
  OKB: 0,
  XAUT: 4,
};

const format = (value: number, precision: number): string =>
  String(Number(value.toFixed(precision)));

const pricePrecision = (currency: string) =>
  CURRENCY_PRECISION[currency] ?? 2;
const avgPrecision = (currency: string) => CURRENCY_PRECISION[currency] ?? 4;
const quantityPrecision = (currency: string) =>
  CURRENCY_PRECISION[currency] ?? 4;

interface ComputedRecord {
  record: SpotRecordInput;
  status: 'holding' | 'closed';
  quantity: number;
  cost: number;
  avgPrice: number;
  fee: number;
  spotProfit: number;
  profit: number;
  buyQuantity: number;
  buyAmount: number;
  sellQuantity: number;
  sellAmount: number;
}

function computeRecord(record: SpotRecordInput): ComputedRecord {
  let quantity = 0;
  let cost = 0;
  let avgPrice = 0;
  let fee = 0;
  let soldProfit = 0;
  let buyQuantity = 0;
  let buyAmount = 0;
  let sellQuantity = 0;
  let sellAmount = 0;

  for (const item of record.transactions) {
    fee += Number(item.fee || 0);

    if (item.type === 'sell') {
      quantity -= item.quantity;
      cost = quantity * avgPrice;
      sellQuantity += item.quantity;
      sellAmount += item.quantity * item.price;
      // 现货默认做多，按当时持仓均价算已实现收益
      soldProfit += (item.price - avgPrice) * item.quantity;
    } else {
      if (quantity < 0) {
        quantity = item.quantity;
        cost = item.value;
      } else {
        quantity += item.quantity;
        cost += item.value;
      }
      avgPrice = quantity > 0 ? cost / quantity : 0;
      buyQuantity += item.quantity;
      buyAmount += item.quantity * item.price;
    }
  }

  let status: 'holding' | 'closed' = quantity > 0 ? 'holding' : 'closed';
  if (quantity <= 0) {
    quantity = 0;
    cost = 0;
    avgPrice = 0;
  }

  const spotProfit = soldProfit - fee;
  const isUsdt = record.currency === 'USDT';
  const profit = isUsdt ? sellQuantity - buyQuantity : spotProfit;

  // 亏损摊入剩余持仓成本，与 web3 口径一致
  if (quantity > 0) {
    cost -= Math.min(spotProfit, 0);
    avgPrice = cost / quantity;
  }

  return {
    record,
    status,
    quantity,
    cost,
    avgPrice,
    fee,
    spotProfit,
    profit,
    buyQuantity,
    buyAmount,
    sellQuantity,
    sellAmount,
  };
}

export function computeOverview(records: SpotRecordInput[]): SpotOverview {
  const computed = records.map(computeRecord);

  const totalCost = computed.reduce(
    (sum, item) =>
      item.record.currency === 'USDT' ? sum : sum + item.cost,
    0,
  );

  const views: SpotRecordView[] = computed.map((item) => {
    const { currency } = item.record;
    const isUsdt = currency === 'USDT';

    return {
      id: item.record.id,
      currency,
      remark: item.record.remark,
      transactions: item.record.transactions,
      status: item.status,
      quantity: format(item.quantity, quantityPrecision(currency)),
      avgPrice: format(item.avgPrice, pricePrecision(currency)),
      cost: format(item.cost, 2),
      fee: format(item.fee, 4),
      spotProfit: format(item.spotProfit, 2),
      profit: format(item.profit, 2),
      profitRaw: Number(item.profit.toFixed(2)),
      buyAvgPrice: item.buyQuantity
        ? format(item.buyAmount / item.buyQuantity, avgPrecision(currency))
        : '-',
      sellAvgPrice: item.sellQuantity
        ? format(item.sellAmount / item.sellQuantity, avgPrecision(currency))
        : '-',
      weight:
        isUsdt || !totalCost
          ? '-'
          : format((item.cost / totalCost) * 100, 2),
    };
  });

  const sorted = [...views].sort((a, b) => {
    if (a.currency === 'USDT') return 1;
    if (b.currency === 'USDT') return -1;
    return Number(b.cost) - Number(a.cost);
  });

  return {
    records: sorted,
    statistics: {
      profit: Number(
        computed
          .filter((item) => item.record.currency !== 'USDT')
          .reduce((sum, item) => sum + item.profit, 0)
          .toFixed(2),
      ),
      fee: Number(
        computed.reduce((sum, item) => sum + item.fee, 0).toFixed(4),
      ),
    },
  };
}
```

**Step 4: 跑测试**

```bash
cd backend && npx egg-bin test test/app/service/spot-compute.test.ts
```

Expected: 7 passing。

**Step 5: 提交**

```bash
git add backend/app/lib/spot/compute.ts backend/test/app/service/spot-compute.test.ts
git commit -m "feat: 现货持仓收益计算"
```

---

### Task 3: 服务、接口与鉴权测试

**Files:**
- Create: `backend/app/service/spot.ts`
- Create: `backend/app/controller/spot.ts`
- Modify: `backend/app/router.ts`
- Test: `backend/test/app/controller/spot.test.ts`

**Step 1: 写接口测试（先失败）**

测试用 `app.mockService('auth', 'currentUserInfo')`? 不，用真实会话更稳：参照 `test/app/controller/market.test.ts` 和 `users.test.ts` 的做法。先看 `test/app/controller/users.test.ts` 里怎么造登录态，沿用同一套 helper；若没有 helper，用 `createSession` 直接插 `sessions` 表。

测试覆盖：

```ts
import assert from 'assert';
import crypto from 'crypto';
import { app } from 'egg-mock/bootstrap';
import { resetDb } from '../../support/db';

const TOKEN = 'spot-test-token';
const HASH = crypto.createHash('sha256').update(TOKEN).digest('hex');

async function loginAs(userId: number) {
  await app.knex('sessions').insert({
    token_hash: `${HASH}-${userId}`,
    user_id: userId,
    expires_at: '2099-01-01 00:00:00',
    last_seen_at: '2026-01-01 00:00:00',
    created_at: '2026-01-01 00:00:00',
  });
  return `biz_sid=${TOKEN}-${userId}`;
}

describe('spot', () => {
  let adminId: number;
  let otherId: number;

  beforeEach(async () => {
    await resetDb(app);
    const [admin] = await app.knex('users').insert({
      username: 'admin',
      name: '管理员',
      password_hash: 'x',
      role: '管理员',
      is_admin: true,
      status: true,
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00',
    });
    ...
  });

  it('未登录返回 401', ...);
  it('首次买入后可读回', ...);
  it('重复币种返回 409', ...);
  it('卖出超过持仓返回 400', ...);
  it('两个用户数据隔离', ...);
  it('费率越界返回 400', ...);
  it('删除明细后统计更新', ...);
});
```

（users 表字段以 `database/migrations/20261026000100_create_system_tables.ts` 为准，写测试前先读该文件。）

**Step 2: 跑测试确认失败**

```bash
cd backend && npx egg-bin test test/app/controller/spot.test.ts
```

Expected: 404（路由不存在）。

**Step 3: 实现 service**

`backend/app/service/spot.ts`：

```ts
import { Service } from 'egg';
import { ApiError, conflict, notFound, validationError } from '../lib/errors';
import { sqlNow } from '../lib/time';
import {
  computeOverview,
  SpotRecordInput,
  SpotTransactionInput,
  SpotTransactionType,
} from '../lib/spot/compute';

const DEFAULT_FEE_RATE = 0.001;
const MAX_FEE_RATE = 0.1;
const CURRENCY_RE = /^[A-Z0-9]{2,16}$/;

const round = (value: number, precision = 9) =>
  Number(value.toFixed(precision));

const positive = (value: unknown, field: string): number => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw validationError(`${field}必须大于 0`);
  }
  return round(num);
};

export default class SpotService extends Service {
  public async overview(userId: number) {
    const [feeRates, records] = await Promise.all([
      this.getFeeRates(userId),
      this.listRecords(userId),
    ]);

    return { feeRates, ...computeOverview(records) };
  }

  public async createRecord(
    userId: number,
    body: { currency?: string; price?: unknown; quantity?: unknown },
  ) {
    const currency = String(body.currency || '')
      .trim()
      .toUpperCase();
    if (!CURRENCY_RE.test(currency)) throw validationError('币种格式不正确');

    const price = positive(body.price, '均价');
    const quantity = positive(body.quantity, '数量');

    const exists = await this.app
      .knex('spot_records')
      .where({ user_id: userId, currency })
      .first();
    if (exists) throw conflict(`${currency} 已存在`);

    const feeRates = await this.getFeeRates(userId);
    const value = round(price * quantity);

    return this.app.knex.transaction(async (trx) => {
      const now = sqlNow();
      const [recordId] = await trx('spot_records').insert({
        user_id: userId,
        currency,
        remark: null,
        created_at: now,
        updated_at: now,
      });
      await trx('spot_transactions').insert({
        record_id: recordId,
        type: 'first',
        price,
        quantity,
        value,
        fee: round(value * feeRates.buyRate),
        created_at: now,
      });
      return { id: Number(recordId) };
    });
  }

  public async addTransaction(
    userId: number,
    recordId: number,
    body: { type?: string; price?: unknown; quantity?: unknown },
  ) {
    const type = body.type;
    if (type !== 'add' && type !== 'sell') {
      throw validationError('交易类型只能是 add 或 sell');
    }

    const record = await this.getRecordOrThrow(userId, recordId);
    const price = positive(body.price, '均价');
    const quantity = positive(body.quantity, '数量');

    if (type === 'sell') {
      const available = await this.availableQuantity(recordId);
      if (quantity > available + 1e-9) {
        throw validationError(
          `最多可卖出 ${round(available, 9)}`,
        );
      }
    }

    const feeRates = await this.getFeeRates(userId);
    const value = round(price * quantity);
    const rate = type === 'sell' ? feeRates.sellRate : feeRates.buyRate;

    await this.app.knex('spot_transactions').insert({
      record_id: recordId,
      type,
      price,
      quantity,
      value,
      fee: round(value * rate),
      created_at: sqlNow(),
    });
    await this.app
      .knex('spot_records')
      .where({ id: recordId })
      .update({ updated_at: sqlNow() });

    return { id: record.id };
  }

  public async removeTransaction(
    userId: number,
    recordId: number,
    transactionId: number,
  ) {
    await this.getRecordOrThrow(userId, recordId);

    const deleted = await this.app
      .knex('spot_transactions')
      .where({ id: transactionId, record_id: recordId })
      .del();
    if (!deleted) throw notFound('明细不存在');
  }

  public async saveRemark(userId: number, recordId: number, remark: unknown) {
    const text = String(remark ?? '').trim();
    if (text.length > 2000) throw validationError('备注不能超过 2000 字');

    await this.getRecordOrThrow(userId, recordId);
    await this.app
      .knex('spot_records')
      .where({ id: recordId })
      .update({ remark: text, updated_at: sqlNow() });
  }

  public async saveFeeRates(
    userId: number,
    body: { buyRate?: unknown; sellRate?: unknown },
  ) {
    const parseRate = (value: unknown, field: string) => {
      const num = Number(value);
      if (!Number.isFinite(num) || num < 0 || num > MAX_FEE_RATE) {
        throw validationError(`${field}必须在 0 ~ ${MAX_FEE_RATE} 之间`);
      }
      return round(num);
    };

    const buyRate = parseRate(body.buyRate, '买入费率');
    const sellRate = parseRate(body.sellRate, '卖出费率');

    await this.upsertFeeRates(userId, buyRate, sellRate);
    return { buyRate, sellRate };
  }

  private async getFeeRates(userId: number) {
    const row = await this.app
      .knex('spot_fee_settings')
      .where({ user_id: userId })
      .first();
    if (row) return { buyRate: row.buy_rate, sellRate: row.sell_rate };

    await this.upsertFeeRates(userId, DEFAULT_FEE_RATE, DEFAULT_FEE_RATE);
    return { buyRate: DEFAULT_FEE_RATE, sellRate: DEFAULT_FEE_RATE };
  }

  private async upsertFeeRates(
    userId: number,
    buyRate: number,
    sellRate: number,
  ) {
    await this.app
      .knex('spot_fee_settings')
      .insert({
        user_id: userId,
        buy_rate: buyRate,
        sell_rate: sellRate,
        updated_at: sqlNow(),
      })
      .onConflict('user_id')
      .merge(['buy_rate', 'sell_rate', 'updated_at']);
  }

  private async listRecords(userId: number): Promise<SpotRecordInput[]> {
    const records = await this.app
      .knex('spot_records')
      .where({ user_id: userId })
      .orderBy('id', 'asc');

    if (!records.length) return [];

    const transactions = await this.app
      .knex('spot_transactions')
      .whereIn(
        'record_id',
        records.map((row) => row.id),
      )
      .orderBy('id', 'asc');

    const grouped = new Map<number, SpotTransactionInput[]>();
    for (const row of transactions) {
      const list = grouped.get(row.record_id) ?? [];
      list.push({
        id: Number(row.id),
        type: row.type as SpotTransactionType,
        price: Number(row.price),
        quantity: Number(row.quantity),
        value: Number(row.value),
        fee: Number(row.fee),
        createdAt: row.created_at,
      });
      grouped.set(row.record_id, list);
    }

    return records.map((row) => ({
      id: Number(row.id),
      currency: row.currency,
      remark: row.remark,
      transactions: grouped.get(row.id) ?? [],
    }));
  }

  private async getRecordOrThrow(userId: number, recordId: number) {
    const record = await this.app
      .knex('spot_records')
      .where({ id: recordId, user_id: userId })
      .first();
    if (!record) throw notFound('币种记录不存在');
    return record;
  }

  private async availableQuantity(recordId: number): Promise<number> {
    const rows = await this.app
      .knex('spot_transactions')
      .where({ record_id: recordId })
      .orderBy('id', 'asc');

    let quantity = 0;
    for (const row of rows) {
      quantity +=
        row.type === 'sell' ? -Number(row.quantity) : Number(row.quantity);
    }
    return Math.max(0, round(quantity));
  }
}
```

**Step 4: 实现 controller + 路由**

`backend/app/controller/spot.ts`：

```ts
import { Controller } from 'egg';

export default class SpotController extends Controller {
  public async overview() {
    const userId = this.ctx.state.currentUser.id;
    this.ctx.body = {
      success: true,
      data: await this.ctx.service.spot.overview(userId),
    };
  }

  public async createRecord() {
    const userId = this.ctx.state.currentUser.id;
    const data = await this.ctx.service.spot.createRecord(
      userId,
      this.ctx.request.body,
    );
    this.ctx.status = 201;
    this.ctx.body = { success: true, data };
  }

  public async addTransaction() {
    const userId = this.ctx.state.currentUser.id;
    const recordId = Number(this.ctx.params.id);
    const data = await this.ctx.service.spot.addTransaction(
      userId,
      recordId,
      this.ctx.request.body,
    );
    this.ctx.body = { success: true, data };
  }

  public async removeTransaction() {
    const userId = this.ctx.state.currentUser.id;
    await this.ctx.service.spot.removeTransaction(
      userId,
      Number(this.ctx.params.id),
      Number(this.ctx.params.txId),
    );
    this.ctx.body = { success: true, data: null };
  }

  public async saveRemark() {
    const userId = this.ctx.state.currentUser.id;
    await this.ctx.service.spot.saveRemark(
      userId,
      Number(this.ctx.params.id),
      this.ctx.request.body?.remark,
    );
    this.ctx.body = { success: true, data: null };
  }

  public async saveFeeRates() {
    const userId = this.ctx.state.currentUser.id;
    this.ctx.body = {
      success: true,
      data: await this.ctx.service.spot.saveFeeRates(
        userId,
        this.ctx.request.body,
      ),
    };
  }
}
```

`backend/app/router.ts` 在行情路由后加：

```ts
  router.get('/api/spot/overview.json', auth, controller.spot.overview);
  router.post('/api/spot/records.json', auth, controller.spot.createRecord);
  router.post(
    '/api/spot/records/:id/transactions.json',
    auth,
    controller.spot.addTransaction,
  );
  router.delete(
    '/api/spot/records/:id/transactions/:txId',
    auth,
    controller.spot.removeTransaction,
  );
  router.put(
    '/api/spot/records/:id/remark.json',
    auth,
    controller.spot.saveRemark,
  );
  router.put('/api/spot/fee-rates.json', auth, controller.spot.saveFeeRates);
```

**Step 5: 跑测试 + typecheck**

```bash
cd backend && npx egg-bin test test/app/controller/spot.test.ts && npm run typecheck
```

Expected: 全部通过。

**Step 6: 提交**

```bash
git add backend/app/service/spot.ts backend/app/controller/spot.ts backend/app/router.ts backend/test/app/controller/spot.test.ts
git commit -m "feat: 现货账本接口"
```

---

### Task 4: 导入备份数据

**Files:**
- Create: `backend/database/seed/spot-20261126.json`
- Create: `backend/scripts/import-spot.ts`
- Modify: `backend/package.json`（新增 `import:spot`）

**Step 1: 生成 seed 文件**

```bash
cd /Users/chenlong/Desktop/my/aaa/backend
mkdir -p database/seed
node -e "
const fs = require('fs');
const src = JSON.parse(fs.readFileSync('/Users/chenlong/Desktop/my/web3/backup/20261126.json', 'utf8'));
fs.writeFileSync('database/seed/spot-20261126.json', JSON.stringify({ record: src.record }, null, 2));
"
node -e "const d=require('./database/seed/spot-20261126.json'); console.log('records', d.record.length, 'tx', d.record.reduce((s,r)=>s+r.list.length,0))"
```

Expected: `records 12 tx 196`。

**Step 2: 写导入脚本**

`backend/scripts/import-spot.ts`：

```ts
import fs from 'fs';
import path from 'path';
import knexFactory from 'knex';
import config from '../knexfile';

const TYPE_MAP: Record<string, string> = {
  首次: 'first',
  加仓: 'add',
  卖出: 'sell',
};

async function main() {
  const args = process.argv.slice(2);
  const userIndex = args.indexOf('--user');
  const username = userIndex >= 0 ? args[userIndex + 1] : 'admin';
  const fileIndex = args.indexOf('--file');
  const file =
    fileIndex >= 0
      ? args[fileIndex + 1]
      : path.join(__dirname, '../database/seed/spot-20261126.json');

  const env = process.env.NODE_ENV || 'development';
  const knex = knexFactory(config[env]);

  try {
    const user = await knex('users').where({ username }).first();
    if (!user) throw new Error(`用户 ${username} 不存在`);

    const exists = await knex('spot_records')
      .where({ user_id: user.id })
      .first();
    if (exists) throw new Error(`用户 ${username} 已有现货数据，停止导入`);

    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let txCount = 0;

    await knex.transaction(async (trx) => {
      for (const record of data.record) {
        const createdAt = record.createTime || '2026-08-24 18:07:58';
        const [recordId] = await trx('spot_records').insert({
          user_id: user.id,
          currency: String(record.currency).toUpperCase(),
          remark: record.remark || null,
          created_at: createdAt,
          updated_at: record.modifyTime || createdAt,
        });

        for (const item of record.list || []) {
          const type = TYPE_MAP[item.类型];
          if (!type) throw new Error(`未知交易类型：${item.类型}`);
          await trx('spot_transactions').insert({
            record_id: recordId,
            type,
            price: Number(item.均价),
            quantity: Number(item.数量),
            value: Number(item.价值),
            fee: Number(item.手续费 || 0),
            created_at: createdAt,
          });
          txCount += 1;
        }
      }
    });

    console.log(`导入完成：${data.record.length} 个币种，${txCount} 笔交易`);
  } finally {
    await knex.destroy();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
```

`backend/package.json` scripts 加：

```json
"import:spot": "node -r ts-node/register/transpile-only scripts/import-spot.ts"
```

**Step 3: 导入到开发库并抽查**

```bash
cd backend
npm run migrate
npm run import:spot -- --user admin
sqlite3 storage/dev.sqlite "select count(*) from spot_records; select count(*) from spot_transactions;"
```

Expected: `12` 和 `196`。

**Step 4: 再跑一次确认幂等保护**

```bash
npm run import:spot -- --user admin
```

Expected: `用户 admin 已有现货数据，停止导入`，退出码 1。

**Step 5: 提交**

```bash
git add backend/database/seed/spot-20261126.json backend/scripts/import-spot.ts backend/package.json
git commit -m "feat: 导入现货历史数据"
```

---

### Task 5: 前端公共组件、数据层与页面骨架

**Files:**
- Create: `frontend/src/components/PositionTabs.jsx`、`PositionCardActions.jsx`、`GlassButton.jsx`（从 web3 原样复制）
- Create: `frontend/src/pages/spot/api.js`
- Create: `frontend/src/pages/spot/index.jsx`
- Create: `frontend/src/pages/spot/CurrencyCard.jsx`、`StatisticList.jsx`
- Modify: `frontend/config/routes.ts`

**Step 1: 复制公共组件**

```bash
cd /Users/chenlong/Desktop/my/aaa/frontend
cp /Users/chenlong/Desktop/my/web3/src/components/PositionTabs.jsx src/components/
cp /Users/chenlong/Desktop/my/web3/src/components/PositionCardActions.jsx src/components/
cp /Users/chenlong/Desktop/my/web3/src/components/GlassButton.jsx src/components/
```

**Step 2: 写 api.js**

```js
import { request } from 'fintech';

export const fetchOverview = () => request('/spot/overview.json');

export const createRecord = (data) =>
  request('/spot/records.json', { method: 'POST', data });

export const createTransaction = (recordId, data) =>
  request(`/spot/records/${recordId}/transactions.json`, {
    method: 'POST',
    data,
  });

export const removeTransaction = (recordId, txId) =>
  request(`/spot/records/${recordId}/transactions/${txId}`, {
    method: 'DELETE',
  });

export const saveRemark = (recordId, remark) =>
  request(`/spot/records/${recordId}/remark.json`, {
    method: 'PUT',
    data: { remark },
  });

export const saveFeeRates = (data) =>
  request('/spot/fee-rates.json', { method: 'PUT', data });
```

**Step 3: 写 StatisticList.jsx**

字段从 `statistics.收益/手续费` 改为 `statistics.profit / statistics.fee`，其余样式照抄 web3 版本。

**Step 4: 写 CurrencyCard.jsx**

以 web3 版本为底，按下面映射改字段，并删掉本币合约相关部分：

| web3 | 新实现 |
| --- | --- |
| `record.状态 === '持仓中'` | `record.status === 'holding'` |
| `record.收益` | `record.profit` |
| `record.现货收益` | `record.spotProfit` |
| `record.占比` | `record.weight` |
| `持仓数量 / 持仓均价 / 持仓成本 / 手续费` | `quantity / avgPrice / cost / fee` |
| `累计买入均价 / 累计卖出均价` | `buyAvgPrice / sellAvgPrice` |

删除：`可用数量` 列、`CoinContractPanel`、`CoinContractBuy/Sell`、`hasActiveCoinContract` 逻辑。收益 Tooltip 只显示 `现货 ${record.spotProfit} USDT`。操作区保留：图表、明细、卖出、加仓。

**Step 5: 写 index.jsx**

```jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Empty, Flex } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import PositionTabs from '@/components/PositionTabs';
import GlassButton from '@/components/GlassButton';
import { fetchOverview } from './api';
import Buy from './Buy';
import CurrencyCard from './CurrencyCard';
import FeeSettings from './FeeSettings';
import StatisticList from './StatisticList';

const TAB_CONFIG = {
  holding: { label: '持仓', hint: '现货仍有持仓，按持仓成本排序', empty: '暂无持仓记录' },
  profit: { label: '盈', hint: '已清仓且收益为正，按收益从高到低', empty: '暂无盈利记录' },
  loss: { label: '亏', hint: '已清仓且收益为负，按亏损从大到小', empty: '暂无亏损记录' },
  usdt: { label: 'USDT', hint: 'USDT 资金记录', empty: '暂无 USDT 记录' },
};

export default () => {
  const [data, setData] = useState({ records: [], statistics: {}, feeRates: {} });
  const [activeTab, setActiveTab] = useState('holding');

  const refresh = useCallback(() => {
    fetchOverview().then((result) => {
      setData(result || { records: [], statistics: {}, feeRates: {} });
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const groups = useMemo(() => {
    const holding = [];
    const profit = [];
    const loss = [];
    const usdt = [];

    (data.records || []).forEach((record) => {
      if (record.currency === 'USDT') {
        usdt.push(record);
        return;
      }
      if (record.status === 'holding') {
        holding.push(record);
        return;
      }
      if (record.profitRaw < 0) {
        loss.push(record);
      } else {
        profit.push(record);
      }
    });

    return {
      holding,
      profit: profit.sort((a, b) => b.profitRaw - a.profitRaw),
      loss: loss.sort((a, b) => a.profitRaw - b.profitRaw),
      usdt,
    };
  }, [data.records]);

  const currentList = groups[activeTab] || [];
  const currentTab = TAB_CONFIG[activeTab];

  return (
    <div className="-mx-6 -mt-6 min-h-full bg-[#f3f6fb] px-6 pb-12 pt-6 text-slate-900">
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          accent="sky"
          icon={<WalletOutlined className="text-xl" />}
          title="现货账户"
          description="管理持仓、成本与交易表现"
          actions={
            <Flex gap={12} align="center">
              <FeeSettings feeRates={data.feeRates} onSaved={refresh} />
              <Buy refresh={refresh} />
            </Flex>
          }
          metrics={<StatisticList statistics={data.statistics} />}
        />

        <Flex justify="space-between" align="end" gap={16} wrap className="mb-4 mt-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">仓位概览</h2>
            <p className="mb-0 mt-1 text-xs text-slate-400">{currentTab.hint}</p>
          </div>
          <PositionTabs
            value={activeTab}
            onChange={setActiveTab}
            items={Object.entries(TAB_CONFIG).map(([key, item]) => ({
              key,
              label: item.label,
              count: groups[key]?.length || 0,
            }))}
          />
        </Flex>

        {currentList.length ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {currentList.map((record) => (
              <CurrencyCard key={record.id} record={record} refresh={refresh} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 shadow-sm">
            <Empty description={currentTab.empty} />
          </div>
        )}
      </div>
    </div>
  );
};
```

`GlassButton` 只有在 `Buy` 里用；`index.jsx` 不直接使用，删掉多余 import。

**Step 6: 路由**

`frontend/config/routes.ts` 在 `/settings` 前加：

```ts
  {
    path: '/spot',
    name: '现货',
    component: './spot',
  },
```

**Step 7: 构建（此时 Buy/FeeSettings 还没写，先建占位再一起验证）**

先完成 Task 6、Task 7 后再构建，避免半成品报错。

---

### Task 6: 写操作组件

**Files:**
- Create: `frontend/src/pages/spot/Buy.jsx`、`Addition.jsx`、`Sell.jsx`、`Remark.jsx`、`DetailDrawer.jsx`

**Step 1: Buy.jsx**

基于 web3 版本，改三处：`storageSQL` 换 `createRecord`；`TRANS_FEE_RATE` 不再前端计算手续费（后端算）；成功后 `refresh()`。

```jsx
import { useRef } from 'react';
import { DrawerBox, FormSchema } from 'fintech';
import { PlusOutlined } from '@ant-design/icons';
import GlassButton from '@/components/GlassButton';
import { createRecord } from './api';

export default ({ refresh }) => {
  const drawerRef = useRef(null);

  return (
    <>
      <GlassButton accent="sky" icon={<PlusOutlined />} onClick={() => drawerRef.current?.open(true)}>
        买入
      </GlassButton>
      <DrawerBox
        form
        title="买入"
        actionRef={drawerRef}
        onOk={({ values }) =>
          createRecord({
            currency: values.currency,
            price: values.price,
            quantity: values.quantity,
          }).then(() => {
            drawerRef.current?.open(false);
            refresh();
          })
        }
      >
        <FormSchema
          items={[
            { name: 'currency', label: '币种' },
            { name: 'price', label: '均价', valueType: 'number' },
            { name: 'quantity', label: '数量', valueType: 'number' },
          ]}
        />
      </DrawerBox>
    </>
  );
};
```

**Step 2: Addition.jsx / Sell.jsx**

沿用 web3 结构，字段名改为 `price/quantity`，提交走 `createTransaction(record.id, { type: 'add'|'sell', price, quantity })`。

- Sell 保留前端校验：均价 > 0、数量 > 0、数量不超过 `Number(record.quantity)`；后端仍会二次校验。
- 成功后 `drawerRef.current?.open(false)` + `refresh()`。

**Step 3: Remark.jsx**

```jsx
import { useEffect, useState } from 'react';
import { Input } from 'antd';
import { saveRemark } from './api';

export default ({ record, refresh }) => {
  const [value, setValue] = useState(record.remark || '');

  useEffect(() => {
    setValue(record.remark || '');
  }, [record.id, record.remark]);

  const save = () => {
    const remark = value.trim();
    if (remark === (record.remark || '')) return;
    saveRemark(record.id, remark).then(refresh);
  };

  return (
    <Input.TextArea
      variant="borderless"
      autoSize={{ minRows: 1, maxRows: 10 }}
      className="mt-3 !px-0 text-[13px] font-semibold leading-5 text-slate-500"
      value={value}
      placeholder="添加备注…"
      onChange={(event) => setValue(event.target.value)}
      onBlur={save}
    />
  );
};
```

**Step 4: DetailDrawer.jsx**

列改为 `type/price/quantity/value/fee`，`type` 用 `valueEnum`：

```js
valueEnum: {
  first: { text: '首次', status: 'Success' },
  add: { text: '加仓', status: 'Processing' },
  sell: { text: '卖出', status: 'Error' },
}
```

删除按钮调用 `removeTransaction(record.id, item.id).then(refresh)`；去掉「来源」列和 `来源 === '本币合约'` 判断。

**Step 5: 提交（前端部分等 Task 8 验证通过后一起提交）**

---

### Task 7: 图表与费率设置

**Files:**
- Create: `frontend/src/pages/spot/Chart.jsx`、`ChartDrawer.jsx`、`FeeSettings.jsx`

**Step 1: Chart.jsx**

复制 web3 版本，把 `item.类型 === '卖出'` 改为 `item.type === 'sell'`，其余不变；`CHART_COLOR_UP/DOWN` 直接写 `'#059669'` / `'#f43f5e'`，不新建常量文件。

**Step 2: ChartDrawer.jsx**

原样复制，标题 `${record.currency} · 交易价格与成本线`。

**Step 3: FeeSettings.jsx**

```jsx
import { useRef } from 'react';
import { DrawerBox, FormSchema } from 'fintech';
import { SettingOutlined } from '@ant-design/icons';
import GlassButton from '@/components/GlassButton';
import { saveFeeRates } from './api';

export default ({ feeRates, onSaved }) => {
  const drawerRef = useRef(null);

  return (
    <>
      <GlassButton
        variant="outlined"
        accent="sky"
        icon={<SettingOutlined />}
        onClick={() => drawerRef.current?.open(true)}
      >
        费率设置
      </GlassButton>
      <DrawerBox
        form
        title="手续费费率"
        actionRef={drawerRef}
        afterOpen={({ form }) => {
          form.setFieldsValue({
            buyRate: feeRates?.buyRate ?? 0.001,
            sellRate: feeRates?.sellRate ?? 0.001,
          });
        }}
        onOk={({ values }) =>
          saveFeeRates({
            buyRate: values.buyRate,
            sellRate: values.sellRate,
          }).then(() => {
            drawerRef.current?.open(false);
            onSaved();
          })
        }
      >
        <FormSchema
          items={[
            {
              name: 'buyRate',
              label: '买入费率（0 ~ 0.1）',
              valueType: 'number',
              inputProps: { min: 0, max: 0.1, step: 0.0001 },
            },
            {
              name: 'sellRate',
              label: '卖出费率（0 ~ 0.1）',
              valueType: 'number',
              inputProps: { min: 0, max: 0.1, step: 0.0001 },
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
```

**Step 4: 构建**

```bash
cd frontend && npx prettier --check src/pages/spot src/components/PositionTabs.jsx src/components/PositionCardActions.jsx src/components/GlassButton.jsx config/routes.ts
npm run build
```

Expected: Prettier 通过、`Build index.html`。

---

### Task 8: 全量验证

**Step 1: 后端全量测试**

```bash
cd backend && npm test
```

Expected: 全部通过（含新增 spot 测试）。

**Step 2: 启动后端 + 前端构建产物实测**

```bash
cd backend && npm run dev   # 7001
cd frontend && npm run build
```

用临时静态服务器（SPA fallback + `/api` 反代 7001）加载 `dist`，注入真实会话 Cookie，headless Chrome 验证：

1. 未登录访问 `/spot` → 跳 `/login`
2. 登录后访问 `/spot` → 渲染 12 张卡片，四个 tab 计数与预期一致
3. 总收益、手续费与直接查库/脚本计算结果一致
4. 新增加仓后持仓数量、成本、手续费变化
5. 改费率后新增一笔交易，手续费按新费率；历史手续费不变
6. 删除一笔明细后统计回退

**Step 3: 清理测试数据**

删掉验证过程中新增的记录/会话，确认 `dev.sqlite` 只剩导入数据。

**Step 4: 提交前端**

```bash
git add frontend/src/pages/spot frontend/src/components/PositionTabs.jsx frontend/src/components/PositionCardActions.jsx frontend/src/components/GlassButton.jsx frontend/config/routes.ts
git commit -m "feat: 现货账本页面"
```

---

## 完成标准

- `/spot` 未登录不可访问，登录后可看到导入的 12 个币种账本
- 买入 / 加仓 / 卖出 / 删除明细 / 备注 / 费率设置全部可用且落库
- 两个用户的账本互不可见
- 费率修改只影响之后的交易，历史手续费不变
- 后端 `npm test`、前端 `npm run build` 通过
