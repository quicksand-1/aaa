# 首页行情迁移实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 web3 首页迁到 aaa，行情抓取全部改由 aaa 后端每 5 分钟聚合一次并落 SQLite，前端只读一个公开接口。

**Architecture:** 后端按上游数据源拆成 9 个适配器（`app/lib/market/sources/*`），由 `refreshMarket()` 并行执行、逐源写 `market_snapshots` 快照表；`app/schedule/market-refresh.ts` 每 5 分钟触发；`GET /api/market/overview.json` 免登录读取快照并组装成整页数据。前端首页改为 `layout: false` 的公开全屏页，进入页面和标签页可见时各拉一次。

**Tech Stack:** Egg 3 + TypeScript + Knex + better-sqlite3（后端）；Umi/Max 4 + antd 6 + Tailwind（前端）。不新增任何第三方依赖，XML / HTML / GBK 文本全部用正则和 `TextDecoder` 解析。

**设计文档:** `docs/plans/2026-11-26-market-home-design.md`

---

## 约定

- 后端所有命令在 `backend/` 下执行；前端所有命令在 `frontend/` 下执行。
- 后端单测依赖 `npm test`（内部会执行 `typecheck`、准备测试库、跑迁移、`egg-bin test`）。只想跑单文件时用 `npm run test-local -- test/app/xxx.test.ts`。
- 前端 AGENTS.md 禁止提交前端代码；本计划的 commit 步骤只提交后端与文档，前端改动留到用户确认后再提交。
- 不修改 `frontend/src/fintech` 下任何文件。

---

## Task 1: 快照表与测试库重置

**Files:**
- Create: `backend/database/migrations/20261126000100_create_market_snapshots.ts`
- Modify: `backend/test/support/db.ts:3-9`

**Step 1: 写迁移**

```ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('market_snapshots', (table) => {
    table.string('source', 32).primary();
    // 首次抓取就失败的源没有历史值，payload 必须允许为空
    table.text('payload').nullable();
    table.text('fetched_at').nullable();
    table.text('failed_at').nullable();
    table.text('error').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('market_snapshots');
}
```

**Step 2: 把新表加进测试重置列表**

`backend/test/support/db.ts` 的 `TABLES` 首行加 `'market_snapshots'`（无外键，放最前即可）：

```ts
const TABLES = [
  'market_snapshots',
  'user_identities',
  'mobile_login_tickets',
  'sessions',
  'user_permissions',
  'users',
];
```

**Step 3: 验证迁移能跑通**

Run: `npm run migrate:test`
Expected: 输出包含 `Batch 5 run: 1 migrations`（或提示已是最新），无报错。

**Step 4: Commit**

```bash
git add database/migrations/20261126000100_create_market_snapshots.ts test/support/db.ts
git commit -m "feat: 新增行情快照表"
```

---

## Task 2: 纯解析函数

**Files:**
- Create: `backend/app/lib/market/types.ts`
- Create: `backend/app/lib/market/parse.ts`
- Test: `backend/test/app/service/market-parse.test.ts`

**Step 1: 写失败测试**

```ts
import assert from 'assert';
import {
  computeDiff,
  computeInflation,
  parseFedWatch,
  parseFredCsv,
  parseSinaQuotes,
  parseTreasuryXml,
} from '../../../app/lib/market/parse';

describe('lib/market/parse', () => {
  it('解析新浪文本里的美元指数、布伦特原油和 USD/CNY', () => {
    const text = [
      'var hq_str_DINIW="16:48:08,103.7387,103.7387,103.7010,1635,103.7189,103.8405,103.6770,103.7387,美元指数,2026-11-26";',
      'var hq_str_hf_OIL="90.502,,90.500,90.520,92.080,90.360,16:48:08,90.640,90.690,0,6,3";',
      'var hq_str_fx_susdcny="17:03:59,7.1234,7.1250,7.1100,7.1200,7.1300,7.1000,7.1150,7.1180";',
    ].join('\n');

    const items = parseSinaQuotes(text);

    assert.strictEqual(items.length, 3);
    assert.deepStrictEqual(items[0], {
      label: '美元指数',
      value: '103.74',
      diff: 0.04,
      category: '汇率',
    });
    assert.deepStrictEqual(items[1], {
      label: '布伦特原油',
      value: '90.50',
      diff: -0.15,
      prefix: '$',
      category: '能源',
    });
    assert.deepStrictEqual(items[2], {
      label: 'USD/CNY',
      value: '7.1180',
      category: '汇率',
    });
  });

  it('FRED CSV 跳过空值行', () => {
    const csv = [
      'observation_date,DFEDTARU',
      '2026-11-24,4.00',
      '2026-11-25,.',
      '2026-11-26,3.88',
    ].join('\n');

    assert.strictEqual(parseFredCsv(csv), 3.88);
  });

  it('用 CPI 最新月与去年同月算同比', () => {
    const csv = [
      'observation_date,CPIAUCSL',
      '2025-09-01,298.0',
      '2025-10-01,300.0',
      '2026-09-01,306.0',
      '2026-10-01,309.0',
    ].join('\n');

    assert.strictEqual(computeInflation(csv), 3);
  });

  it('解析美债收益率 XML 的 entry', () => {
    const xml = `<feed><entry><d:NEW_DATE>2026-11-24T00:00:00</d:NEW_DATE><d:BC_2YEAR>3.60</d:BC_2YEAR><d:BC_10YEAR>4.10</d:BC_10YEAR><d:BC_30YEAR>4.70</d:BC_30YEAR></entry><entry><d:NEW_DATE>2026-11-25T00:00:00</d:NEW_DATE><d:BC_2YEAR>3.58</d:BC_2YEAR><d:BC_10YEAR>4.12</d:BC_10YEAR><d:BC_30YEAR>4.72</d:BC_30YEAR></entry></feed>`;

    assert.deepStrictEqual(parseTreasuryXml(xml), [
      { date: '2026-11-24', '2Y': 3.6, '10Y': 4.1, '30Y': 4.7 },
      { date: '2026-11-25', '2Y': 3.58, '10Y': 4.12, '30Y': 4.72 },
    ]);
  });

  it('解析 FedWatch 页面里的会议行', () => {
    const html = `<div class=cbw-head><div class=cbw-row-date><span class=cbw-h>Meeting</span></div></div><div class=cbw-row><div class=cbw-row-date>December 9, 2026</div><div class=cbw-row-move><div class=cbw-move><span class=cbw-move-pct>95.8%</span><span class=cbw-move-step style=color:#d55e00>+24.0 bp</span></div></div><div class=cbw-row-level><span class=cbw-exp-big>4.11%</span><span class=cbw-level-split><span class="cbw-chip cbw-chip-up">higher 95.8%</span><span class="cbw-chip cbw-chip-flat">same 4.2%</span><span class="cbw-chip cbw-chip-down">lower 0.0%</span></span></div></div>`;

    assert.deepStrictEqual(parseFedWatch(html), [
      {
        date: 'December 9, 2026',
        moveProbability: '95.8%',
        bpChange: '+24.0 bp',
        rateLevel: '4.11%',
        higher: '95.8',
        same: '4.2',
        lower: '0.0',
      },
    ]);
  });

  it('涨跌幅按百分比保留两位，基数为 0 时返回 0', () => {
    assert.strictEqual(computeDiff(110, 100), 10);
    assert.strictEqual(computeDiff(90, 100), -10);
    assert.strictEqual(computeDiff(100, 0), 0);
  });
});
```

**Step 2: 跑测试确认失败**

Run: `npm run test-local -- test/app/service/market-parse.test.ts`
Expected: FAIL，`Cannot find module '../../../app/lib/market/parse'`。

**Step 3: 写类型**

`backend/app/lib/market/types.ts`：

```ts
export interface MarketItem {
  label: string;
  value: string;
  diff: number;
  prefix?: string;
  suffix?: string;
  category: string;
}

export type MarketSourceKey =
  | 'gold'
  | 'treasury'
  | 'rates'
  | 'crypto'
  | 'fiscal'
  | 'fearGreed'
  | 'sina'
  | 'fred'
  | 'fedWatch';

export type MarketFetcher = typeof fetch;

export interface MarketSource {
  key: MarketSourceKey;
  run: (fetcher: MarketFetcher) => Promise<Record<string, unknown>>;
}
```

**Step 4: 写解析实现**

`backend/app/lib/market/parse.ts`：

```ts
import type { MarketItem } from './types';

const toNum = (value: unknown): number => {
  const n = parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : 0;
};

export const computeDiff = (value: number, base: number): number =>
  base > 0 ? Number((((value - base) / base) * 100).toFixed(2)) : 0;

/**
 * 新浪返回 GBK 编码的 `var hq_str_SYMBOL="a,b,c";`。
 * 只取数字字段，中文名称统一用本地文案，避免依赖 GBK 解码后的中文。
 */
export function parseSinaQuotes(text: string): MarketItem[] {
  const items: MarketItem[] = [];
  const re = /var hq_str_(\w+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const [, symbol, payload] = match;
    const fields = payload.split(',');

    if (symbol === 'DINIW') {
      // 0=时间 1=最新价 3=昨收
      const price = toNum(fields[1]);
      if (!price) continue;
      items.push({
        label: '美元指数',
        value: price.toFixed(2),
        diff: computeDiff(price, toNum(fields[3])),
        category: '汇率',
      });
    } else if (symbol === 'hf_OIL') {
      // 0=最新价 7=昨结
      const price = toNum(fields[0]);
      if (!price) continue;
      items.push({
        label: '布伦特原油',
        value: price.toFixed(2),
        diff: computeDiff(price, toNum(fields[7])),
        prefix: '$',
        category: '能源',
      });
    } else if (symbol === 'fx_susdcny') {
      // 8=最新价，缺失时退回 1=买入价
      const price = toNum(fields[8]) || toNum(fields[1]);
      if (!price) continue;
      items.push({
        label: 'USD/CNY',
        value: price.toFixed(4),
        diff: 0,
        category: '汇率',
      });
    }
  }
  return items;
}

/** 取最后一条 YYYY-MM-DD 行的数值，跳过 '.' 占位和 HTML 维护页 */
export function parseFredCsv(csv: string): number {
  const lines = csv.trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const [date, value] = lines[i].split(',');
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && value && value !== '.') {
      return parseFloat(value);
    }
  }
  return 0;
}

export function computeInflation(csv: string): number | null {
  const rows = csv
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => {
      const [date, value] = line.split(',');
      return { date, value: value && value !== '.' ? parseFloat(value) : null };
    })
    .filter(
      (row): row is { date: string; value: number } =>
        row.value !== null && /^\d{4}-\d{2}-\d{2}$/.test(row.date),
    );

  const latest = rows[rows.length - 1];
  if (!latest) return null;

  const [year, month] = latest.date.split('-').map(Number);
  const lastYear = rows.find((row) => {
    const [rowYear, rowMonth] = row.date.split('-').map(Number);
    return rowYear === year - 1 && rowMonth === month;
  });

  return lastYear ? (latest.value / lastYear.value - 1) * 100 : null;
}

export interface TreasuryEntry {
  date: string;
  '2Y': number;
  '10Y': number;
  '30Y': number;
}

const readTag = (chunk: string, tag: string): string => {
  const match = new RegExp(`<(?:d|m):${tag}[^>]*>([^<]*)<`).exec(chunk);
  return match ? match[1].trim() : '';
};

export function parseTreasuryXml(xml: string): TreasuryEntry[] {
  const entries = xml.match(/<entry[^>]*>[\s\S]*?<\/entry>/g) ?? [];
  return entries
    .map((entry) => ({
      date: readTag(entry, 'NEW_DATE').slice(0, 10),
      '2Y': toNum(readTag(entry, 'BC_2YEAR')),
      '10Y': toNum(readTag(entry, 'BC_10YEAR')),
      '30Y': toNum(readTag(entry, 'BC_30YEAR')),
    }))
    .filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.date));
}

export interface FomcProbability {
  date: string;
  moveProbability: string;
  bpChange: string;
  rateLevel: string;
  higher: string;
  same: string;
  lower: string;
}

const readClass = (chunk: string, className: string): string => {
  const match = new RegExp(
    `<[a-z]+ class=["']?${className}["']?[^>]*>([^<]*)<`,
  ).exec(chunk);
  return match ? match[1].trim() : '';
};

const extractPercent = (chip?: string): string => {
  const match = chip ? /([\d.]+)%/.exec(chip) : null;
  return match ? match[1] : '0';
};

/**
 * centralbank.watch 是 HTML 页面且属性值不带引号。
 * 按行分隔后每段都从当前行开头，取各 class 的第一次出现即为本行数据。
 */
export function parseFedWatch(html: string): FomcProbability[] {
  const rows = html.split(/<div class=["']?cbw-row["']?>/).slice(1);
  const results: FomcProbability[] = [];

  for (const row of rows) {
    const date = readClass(row, 'cbw-row-date');
    const moveProbability = readClass(row, 'cbw-move-pct');
    if (!date || !moveProbability) continue;

    const chips = [...row.matchAll(/<span class=["']cbw-chip [^"']*["']>([^<]*)</g)]
      .map((match) => match[1].trim())
      .slice(0, 3);

    results.push({
      date,
      moveProbability,
      bpChange: readClass(row, 'cbw-move-step'),
      rateLevel: readClass(row, 'cbw-exp-big'),
      higher: extractPercent(chips[0]),
      same: extractPercent(chips[1]),
      lower: extractPercent(chips[2]),
    });
  }

  return results;
}
```

**Step 5: 跑测试确认通过**

Run: `npm run test-local -- test/app/service/market-parse.test.ts`
Expected: PASS，6 passing。

**Step 6: Commit**

```bash
git add app/lib/market/types.ts app/lib/market/parse.ts test/app/service/market-parse.test.ts
git commit -m "feat: 行情上游解析函数"
```

---

## Task 3: 上游适配器

**Files:**
- Create: `backend/app/lib/market/http.ts`
- Create: `backend/app/lib/market/sources/gold.ts`
- Create: `backend/app/lib/market/sources/treasury.ts`
- Create: `backend/app/lib/market/sources/rates.ts`
- Create: `backend/app/lib/market/sources/crypto.ts`
- Create: `backend/app/lib/market/sources/fiscal.ts`
- Create: `backend/app/lib/market/sources/fearGreed.ts`
- Create: `backend/app/lib/market/sources/sina.ts`
- Create: `backend/app/lib/market/sources/fred.ts`
- Create: `backend/app/lib/market/sources/fedWatch.ts`

每个适配器只做"抓取 + 归一化"，失败一律 `throw`，由调用方统一降级。上游地址固定写在模块里，不做配置化（没有第二个调用方）。

**Step 1: 写请求封装**

`backend/app/lib/market/http.ts`：

```ts
import type { MarketFetcher } from './types';

// 上游多为境外站点，8 秒足够；超时按单源失败处理，不拖累整轮刷新
const TIMEOUT_MS = 8000;

const request = (fetcher: MarketFetcher, url: string, init: RequestInit = {}) =>
  fetcher(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });

const ensureOk = (response: Response, url: string) => {
  if (!response.ok) throw new Error(`${url} 返回 HTTP ${response.status}`);
};

export async function getJson<T = any>(
  fetcher: MarketFetcher,
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await request(fetcher, url, init);
  ensureOk(response, url);
  return (await response.json()) as T;
}

export async function getText(
  fetcher: MarketFetcher,
  url: string,
  init?: RequestInit,
): Promise<string> {
  const response = await request(fetcher, url, init);
  ensureOk(response, url);
  return response.text();
}

/** 新浪返回 GBK，必须按字节解码，直接 text() 会得到乱码 */
export async function getGbkText(
  fetcher: MarketFetcher,
  url: string,
  init?: RequestInit,
): Promise<string> {
  const response = await request(fetcher, url, init);
  ensureOk(response, url);
  return new TextDecoder('gbk').decode(await response.arrayBuffer());
}
```

**Step 2: 写 9 个适配器**

`backend/app/lib/market/sources/gold.ts`：

```ts
import { computeDiff } from '../parse';
import { getJson } from '../http';
import type { MarketFetcher, MarketItem } from '../types';

const BASE = 'https://api.goldprice.dev/v1';

export default async function fetchGold(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  const [price, convert, bars] = await Promise.all([
    getJson(fetcher, `${BASE}/prices?symbol=XAU-USD-SPOT`),
    getJson(fetcher, `${BASE}/convert?from=XAU&to=CNY&unit=gram`),
    getJson(
      fetcher,
      `${BASE}/bars?symbol=XAU-USD-SPOT&interval=1d&from=${weekAgo}&to=${today}&limit=2`,
    ),
  ]);

  const usd = parseFloat(price?.symbols?.[0]?.price);
  if (!Number.isFinite(usd)) throw new Error('黄金价格字段缺失');

  const current = parseFloat(bars?.bars?.[0]?.close);
  const previous = parseFloat(bars?.bars?.[1]?.close);
  const diff =
    Number.isFinite(current) && Number.isFinite(previous)
      ? computeDiff(current, previous)
      : 0;

  const marketData: MarketItem[] = [
    {
      label: 'XAU/USD',
      value: usd.toFixed(2),
      diff,
      prefix: '$',
      category: '黄金',
    },
  ];

  const cny = parseFloat(convert?.result);
  if (Number.isFinite(cny)) {
    marketData.push({
      label: 'XAU/CNY',
      value: cny.toFixed(2),
      diff,
      prefix: '¥',
      suffix: '/克',
      category: '黄金',
    });
  }

  return { marketData };
}
```

`backend/app/lib/market/sources/treasury.ts`：

```ts
import { getText } from '../http';
import { parseTreasuryXml } from '../parse';
import type { MarketFetcher, MarketItem } from '../types';

const URL =
  'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml';

export default async function fetchTreasury(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const year = new Date().getFullYear();
  const xml = await getText(
    fetcher,
    `${URL}?data=daily_treasury_yield_curve&field_tdr_date_value=${year}`,
  );

  const entries = parseTreasuryXml(xml);
  if (entries.length < 2) throw new Error('美债收益率数据不足两条');

  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];

  // 收益率口径沿用现状：diff 是百分点差，不是百分比
  const marketData: MarketItem[] = (['2Y', '10Y', '30Y'] as const).map(
    (label) => ({
      label,
      value: latest[label].toFixed(2),
      diff: Number((latest[label] - previous[label]).toFixed(2)),
      suffix: '%',
      category: '美债',
    }),
  );

  return { marketData };
}
```

`backend/app/lib/market/sources/rates.ts`：

```ts
import { getText } from '../http';
import type { MarketFetcher, MarketItem } from '../types';

const BASE = 'https://markets.newyorkfed.org/api/rates';

interface RefRate {
  percentRate: number;
}

export default async function fetchRates(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  const query = `startDate=${weekAgo}&endDate=${today}`;

  const [sofrText, effrText] = await Promise.all([
    getText(fetcher, `${BASE}/secured/sofr/search.json?${query}`),
    getText(fetcher, `${BASE}/unsecured/effr/search.json?${query}`),
  ]);

  const build = (text: string, label: string): MarketItem | null => {
    const rates: RefRate[] = JSON.parse(text)?.refRates ?? [];
    if (!rates.length) return null;
    const current = rates[0].percentRate;
    const previous = rates[1]?.percentRate;
    return {
      label,
      value: current.toFixed(2),
      diff: previous ? Number((current - previous).toFixed(2)) : 0,
      suffix: '%',
      category: '利率',
    };
  };

  const marketData = [build(sofrText, 'SOFR'), build(effrText, 'EFFR')].filter(
    (item): item is MarketItem => item !== null,
  );
  if (!marketData.length) throw new Error('SOFR / EFFR 数据为空');

  return { marketData };
}
```

`backend/app/lib/market/sources/crypto.ts`：

```ts
import { getJson } from '../http';
import type { MarketFetcher, MarketItem } from '../types';

// 90=BTC 80=ETH 48543=SOL 58=XRP
const IDS = '90,80,48543,58';

interface Coin {
  symbol: string;
  price_usd: string;
  percent_change_24h: string;
}

export default async function fetchCrypto(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const list = await getJson<Coin[]>(
    fetcher,
    `https://api.coinlore.net/api/ticker/?id=${IDS}`,
  );
  if (!Array.isArray(list) || !list.length) throw new Error('加密行情为空');

  const marketData: MarketItem[] = list.map((item) => ({
    label: String(item.symbol).toUpperCase(),
    value: String(item.price_usd),
    diff: parseFloat(item.percent_change_24h) || 0,
    prefix: '$',
    category: '加密货币',
  }));

  return { marketData };
}
```

`backend/app/lib/market/sources/fiscal.ts`：

```ts
import { getJson } from '../http';
import { computeDiff } from '../parse';
import type { MarketFetcher, MarketItem } from '../types';

const BASE =
  'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance';
const DEBT_URL =
  'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny';

interface TgaRow {
  record_date: string;
  open_today_bal: string;
}

export default async function fetchFiscal(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const tgaFrom = new Date(Date.now() - 90 * 86400000)
    .toISOString()
    .slice(0, 10);
  const filter = encodeURIComponent(
    `account_type:eq:Treasury General Account (TGA) Closing Balance,record_date:gte:${tgaFrom}`,
  );

  const [debtRes, tgaRes] = await Promise.all([
    getJson(
      fetcher,
      `${DEBT_URL}?sort=-record_date&page[size]=2&fields=record_date,tot_pub_debt_out_amt`,
    ),
    getJson(
      fetcher,
      `${BASE}?filter=${filter}&fields=record_date,open_today_bal&sort=record_date&page[size]=500`,
    ),
  ]);

  const result: Record<string, unknown> = {};

  const debtRows = debtRes?.data ?? [];
  if (debtRows.length >= 2) {
    const latest = parseFloat(debtRows[0].tot_pub_debt_out_amt);
    const previous = parseFloat(debtRows[1].tot_pub_debt_out_amt);
    const marketData: MarketItem[] = [
      {
        label: '美债总量',
        value: (latest / 1e12).toFixed(2),
        diff: computeDiff(latest, previous),
        suffix: '万亿$',
        category: '美债',
      },
    ];
    result.marketData = marketData;
  }

  const history = ((tgaRes?.data ?? []) as TgaRow[])
    .map((row) => ({
      date: row.record_date,
      value: parseFloat(row.open_today_bal) * 1e6,
    }))
    .filter((row) => row.date && Number.isFinite(row.value));

  if (history.length >= 2) {
    result.tga = {
      date: history[history.length - 1].date,
      balance: history[history.length - 1].value,
      prevBalance: history[history.length - 2].value,
      history,
    };
  }

  if (!result.marketData && !result.tga) {
    throw new Error('财政部数据为空');
  }

  return result;
}
```

`backend/app/lib/market/sources/fearGreed.ts`：

```ts
import { getJson } from '../http';
import type { MarketFetcher } from '../types';

export default async function fetchFearGreed(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const res = await getJson(
    fetcher,
    'https://api.alternative.me/fng/?limit=1',
  );
  const item = res?.data?.[0];
  if (!item) throw new Error('恐惧贪婪指数为空');

  return {
    fearGreed: {
      value: Number(item.value),
      classification: String(item.value_classification),
    },
  };
}
```

`backend/app/lib/market/sources/sina.ts`：

```ts
import { getGbkText } from '../http';
import { parseSinaQuotes } from '../parse';
import type { MarketFetcher } from '../types';

// DINIW=美元指数 hf_OIL=布伦特原油主连 fx_susdcny=在岸人民币
const SYMBOLS = 'DINIW,hf_OIL,fx_susdcny';

export default async function fetchSina(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const text = await getGbkText(
    fetcher,
    `https://hq.sinajs.cn/list=${SYMBOLS}`,
    // 新浪校验 Referer，缺失会返回空内容
    { headers: { Referer: 'https://finance.sina.com.cn' } },
  );

  const marketData = parseSinaQuotes(text);
  if (!marketData.length) throw new Error('新浪行情为空');

  return { marketData };
}
```

`backend/app/lib/market/sources/fred.ts`：

```ts
import { getText } from '../http';
import { computeInflation, parseFredCsv } from '../parse';
import type { MarketFetcher } from '../types';

const BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';

export default async function fetchFred(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const cpiFrom = (() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 13);
    date.setDate(1);
    return date.toISOString().slice(0, 10);
  })();

  const [upperCsv, lowerCsv, cpiCsv, iorbCsv] = await Promise.all([
    getText(fetcher, `${BASE}?id=DFEDTARU`),
    getText(fetcher, `${BASE}?id=DFEDTARL`),
    getText(fetcher, `${BASE}?id=CPIAUCSL&cosd=${cpiFrom}`),
    getText(fetcher, `${BASE}?id=IORB`),
  ]);

  const high = parseFredCsv(upperCsv);
  const low = parseFredCsv(lowerCsv);
  const inflation = computeInflation(cpiCsv);
  const iorb = parseFredCsv(iorbCsv);

  const result: Record<string, unknown> = {};
  if (high && low) result.fedTargetRate = { high, low };
  if (inflation !== null) result.inflation = inflation;
  if (high && inflation !== null) result.realRate = high - inflation;
  if (iorb) result.iorb = iorb;

  if (!Object.keys(result).length) throw new Error('FRED 数据为空');
  return result;
}
```

`backend/app/lib/market/sources/fedWatch.ts`：

```ts
import { getText } from '../http';
import { parseFedWatch } from '../parse';
import type { MarketFetcher } from '../types';

export default async function fetchFedWatch(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const html = await getText(
    fetcher,
    'https://centralbank.watch/federal-reserve/',
  );

  const fomcProbabilities = parseFedWatch(html);
  if (!fomcProbabilities.length) throw new Error('FedWatch 页面结构变化，未解析到会议行');

  return { fomcProbabilities };
}
```

**Step 3: 类型检查**

Run: `npm run typecheck`
Expected: 无报错。

**Step 4: Commit**

```bash
git add app/lib/market/http.ts app/lib/market/sources
git commit -m "feat: 行情上游适配器"
```

---

## Task 4: 刷新与组装

**Files:**
- Create: `backend/app/lib/market/index.ts`
- Test: `backend/test/app/service/market.test.ts`

**Step 1: 写失败测试**

```ts
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { getOverview, refreshMarket } from '../../../app/lib/market';
import { resetDb } from '../../support/db';

describe('lib/market', () => {
  beforeEach(async () => {
    await resetDb(app);
  });

  it('逐源写入快照并组装成整页数据', async () => {
    const sources = [
      {
        key: 'gold' as const,
        run: async () => ({
          marketData: [
            {
              label: 'XAU/USD',
              value: '3564.23',
              diff: 0.42,
              prefix: '$',
              category: '黄金',
            },
          ],
        }),
      },
      {
        key: 'fearGreed' as const,
        run: async () => ({
          fearGreed: { value: 11, classification: 'Extreme Fear' },
        }),
      },
    ];

    await refreshMarket({
      knex: app.knex,
      logger: app.logger,
      sources,
    });

    const data = await getOverview(app.knex);
    assert.deepStrictEqual(data.marketData, [
      {
        label: 'XAU/USD',
        value: '3564.23',
        diff: 0.42,
        prefix: '$',
        category: '黄金',
      },
    ]);
    assert.deepStrictEqual(data.fearGreed, {
      value: 11,
      classification: 'Extreme Fear',
    });
    assert.ok(data.updatedAt);
  });

  it('单个源失败时保留上一次成功值并记录错误', async () => {
    const okSource = {
      key: 'crypto' as const,
      run: async () => ({
        marketData: [
          {
            label: 'BTC',
            value: '60701.17',
            diff: 2.43,
            prefix: '$',
            category: '加密货币',
          },
        ],
      }),
    };
    await refreshMarket({
      knex: app.knex,
      logger: app.logger,
      sources: [okSource],
    });

    await refreshMarket({
      knex: app.knex,
      logger: app.logger,
      sources: [
        {
          key: 'crypto' as const,
          run: async () => {
            throw new Error('upstream down');
          },
        },
      ],
    });

    const row = await app.knex('market_snapshots')
      .where({ source: 'crypto' })
      .first();
    assert.ok(row.payload, '失败时不能清掉上一次的 payload');
    assert.strictEqual(row.error, 'Error: upstream down');

    const data = await getOverview(app.knex);
    assert.strictEqual(data.marketData.length, 1);
    assert.strictEqual(data.marketData[0].label, 'BTC');

    await refreshMarket({
      knex: app.knex,
      logger: app.logger,
      sources: [okSource],
    });
    const recovered = await app.knex('market_snapshots')
      .where({ source: 'crypto' })
      .first();
    assert.strictEqual(recovered.error, null);
    assert.strictEqual(recovered.failed_at, null);
  });

  it('首次失败不产生空快照行', async () => {
    await refreshMarket({
      knex: app.knex,
      logger: app.logger,
      sources: [
        {
          key: 'sina' as const,
          run: async () => {
            throw new Error('blocked');
          },
        },
      ],
    });

    const data = await getOverview(app.knex);
    assert.deepStrictEqual(data.marketData, []);
    assert.strictEqual(data.updatedAt, null);
  });
});
```

**Step 2: 跑测试确认失败**

Run: `npm run test-local -- test/app/service/market.test.ts`
Expected: FAIL，`Cannot find module '../../../app/lib/market'`。

**Step 3: 写实现**

`backend/app/lib/market/index.ts`：

```ts
import type { Knex } from 'knex';
import type { MarketFetcher, MarketItem, MarketSource } from './types';
import fetchGold from './sources/gold';
import fetchTreasury from './sources/treasury';
import fetchRates from './sources/rates';
import fetchCrypto from './sources/crypto';
import fetchFiscal from './sources/fiscal';
import fetchFearGreed from './sources/fearGreed';
import fetchSina from './sources/sina';
import fetchFred from './sources/fred';
import fetchFedWatch from './sources/fedWatch';

interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
}

const DEFAULT_SOURCES: MarketSource[] = [
  { key: 'gold', run: fetchGold },
  { key: 'treasury', run: fetchTreasury },
  { key: 'rates', run: fetchRates },
  { key: 'crypto', run: fetchCrypto },
  { key: 'fiscal', run: fetchFiscal },
  { key: 'fearGreed', run: fetchFearGreed },
  { key: 'sina', run: fetchSina },
  { key: 'fred', run: fetchFred },
  { key: 'fedWatch', run: fetchFedWatch },
];

// marketData 的拼装顺序固定，避免前端卡片顺序随上游返回时机变化
const MARKET_ORDER = ['gold', 'treasury', 'rates', 'crypto', 'sina'];

// 同一进程只允许一轮刷新在跑，长请求不会叠加
let inFlight: Promise<void> | null = null;

export function refreshMarket(options: {
  knex: Knex;
  logger: Logger;
  fetcher?: MarketFetcher;
  sources?: MarketSource[];
}): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = runRefresh(options).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function runRefresh({
  knex,
  logger,
  fetcher = fetch,
  sources = DEFAULT_SOURCES,
}: {
  knex: Knex;
  logger: Logger;
  fetcher?: MarketFetcher;
  sources?: MarketSource[];
}): Promise<void> {
  const startedAt = Date.now();
  let failed = 0;

  await Promise.all(
    sources.map(async ({ key, run }) => {
      try {
        const payload = await run(fetcher);
        await knex('market_snapshots')
          .insert({
            source: key,
            payload: JSON.stringify(payload),
            fetched_at: new Date().toISOString(),
            failed_at: null,
            error: null,
          })
          .onConflict('source')
          .merge(['payload', 'fetched_at', 'failed_at', 'error']);
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        logger.warn('[market] 数据源 %s 刷新失败：%s', key, message);
        // 只写失败信息，payload 和 fetched_at 保留上一次成功值
        await knex('market_snapshots')
          .insert({
            source: key,
            payload: null,
            fetched_at: null,
            failed_at: new Date().toISOString(),
            error: `Error: ${message}`,
          })
          .onConflict('source')
          .merge(['failed_at', 'error']);
      }
    }),
  );

  logger.info(
    '[market] 刷新完成：%d 个源，失败 %d 个，耗时 %dms',
    sources.length,
    failed,
    Date.now() - startedAt,
  );
}

export interface MarketOverview {
  updatedAt: string | null;
  marketData: MarketItem[];
  tga?: Record<string, unknown>;
  fearGreed?: Record<string, unknown>;
  fedTargetRate?: Record<string, unknown>;
  inflation?: number;
  realRate?: number;
  iorb?: number;
  fomcProbabilities?: Record<string, unknown>[];
}

export async function getOverview(knex: Knex): Promise<MarketOverview> {
  const rows = await knex('market_snapshots').select(
    'source',
    'payload',
    'fetched_at',
  );

  const snapshots = new Map<string, any>();
  for (const row of rows) {
    if (!row.payload) continue;
    snapshots.set(row.source, JSON.parse(row.payload));
  }

  const marketData: MarketItem[] = MARKET_ORDER.flatMap(
    (key) => snapshots.get(key)?.marketData ?? [],
  );

  const updatedAt =
    rows
      .map((row) => row.fetched_at as string | null)
      .filter((value): value is string => Boolean(value))
      .sort()
      .pop() ?? null;

  const overview: MarketOverview = { updatedAt, marketData };

  const fiscal = snapshots.get('fiscal');
  if (fiscal?.tga) overview.tga = fiscal.tga;

  const fearGreed = snapshots.get('fearGreed');
  if (fearGreed?.fearGreed) overview.fearGreed = fearGreed.fearGreed;

  const fred = snapshots.get('fred') ?? {};
  if (fred.fedTargetRate) overview.fedTargetRate = fred.fedTargetRate;
  if (typeof fred.inflation === 'number') overview.inflation = fred.inflation;
  if (typeof fred.realRate === 'number') overview.realRate = fred.realRate;
  if (typeof fred.iorb === 'number') overview.iorb = fred.iorb;

  const fedWatch = snapshots.get('fedWatch');
  if (fedWatch?.fomcProbabilities) {
    overview.fomcProbabilities = fedWatch.fomcProbabilities;
  }

  return overview;
}
```

**Step 4: 跑测试确认通过**

Run: `npm run test-local -- test/app/service/market.test.ts`
Expected: PASS，3 passing。

**Step 5: Commit**

```bash
git add app/lib/market/index.ts test/app/service/market.test.ts
git commit -m "feat: 行情刷新与快照组装"
```

---

## Task 5: 接口层

**Files:**
- Create: `backend/app/service/market.ts`
- Create: `backend/app/controller/market.ts`
- Modify: `backend/app/router.ts`
- Test: `backend/test/app/controller/market.test.ts`

**Step 1: 写失败测试**

```ts
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { resetDb } from '../../support/db';

const GOLD_PAYLOAD = {
  marketData: [
    {
      label: 'XAU/USD',
      value: '3564.23',
      diff: 0.42,
      prefix: '$',
      category: '黄金',
    },
  ],
};

describe('GET /api/market/overview.json', () => {
  beforeEach(async () => {
    await resetDb(app);
    await app.knex('market_snapshots').insert({
      source: 'gold',
      payload: JSON.stringify(GOLD_PAYLOAD),
      fetched_at: '2026-11-26T08:35:12.000Z',
    });
  });

  it('未登录也能读取整页行情', async () => {
    const res = await app
      .httpRequest()
      .get('/api/market/overview.json')
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.deepStrictEqual(res.body.data.marketData, GOLD_PAYLOAD.marketData);
    assert.strictEqual(res.body.data.updatedAt, '2026-11-26T08:35:12.000Z');
  });

  it('没有快照时返回空数组和 null 时间', async () => {
    await resetDb(app);

    const res = await app
      .httpRequest()
      .get('/api/market/overview.json')
      .expect(200);

    assert.deepStrictEqual(res.body.data, {
      updatedAt: null,
      marketData: [],
    });
  });
});
```

**Step 2: 跑测试确认失败**

Run: `npm run test-local -- test/app/controller/market.test.ts`
Expected: FAIL，404。

**Step 3: 写 service**

`backend/app/service/market.ts`：

```ts
import { Service } from 'egg';
import { getOverview, refreshMarket } from '../lib/market';

export default class MarketService extends Service {
  public async overview() {
    return getOverview(this.app.knex);
  }

  public async refresh() {
    return refreshMarket({
      knex: this.app.knex,
      logger: this.app.logger,
    });
  }
}
```

**Step 4: 写 controller 与路由**

`backend/app/controller/market.ts`：

```ts
import { Controller } from 'egg';

export default class MarketController extends Controller {
  public async overview() {
    const data = await this.ctx.service.market.overview();
    this.ctx.body = { success: true, data };
  }
}
```

`backend/app/router.ts` 在 `/api/health` 之后加一行（不挂 `auth`）：

```ts
  router.get('/api/market/overview.json', controller.market.overview);
```

**Step 5: 跑测试确认通过**

Run: `npm run test-local -- test/app/controller/market.test.ts`
Expected: PASS，2 passing。

**Step 6: Commit**

```bash
git add app/service/market.ts app/controller/market.ts app/router.ts test/app/controller/market.test.ts
git commit -m "feat: 公开行情聚合接口"
```

---

## Task 6: 5 分钟定时刷新

**Files:**
- Create: `backend/app/schedule/market-refresh.ts`

**Step 1: 写定时任务**

```ts
import { Subscription } from 'egg';

export default class MarketRefresh extends Subscription {
  static get schedule() {
    return {
      interval: '5m',
      type: 'worker',
      immediate: true,
    };
  }

  public async subscribe() {
    // 单测环境不联网，刷新逻辑由 service 层单测覆盖
    if (this.app.config.env === 'unittest') return;
    await this.ctx.service.market.refresh();
  }
}
```

**Step 2: 验证单测不会被定时任务拖慢**

Run: `npm run test-local -- test/app/controller/health.test.ts`
Expected: PASS，耗时在 1 秒级；如果出现上游请求或超时，说明 `config.env` 判断没生效。

**Step 3: 本地真实刷新一次**

Run:
```bash
npm run dev
```
另开终端：
```bash
curl -s http://127.0.0.1:7001/api/market/overview.json | head -c 400
```
Expected: 启动 10 秒内返回 `{"success":true,"data":{"updatedAt":"...","marketData":[...]}}`，`marketData` 含黄金、美债、利率、加密、汇率能源五类。

**Step 4: Commit**

```bash
git add app/schedule/market-refresh.ts
git commit -m "feat: 每 5 分钟刷新行情快照"
```

---

## Task 7: 前端页面与数据层

**Files:**
- Create: `frontend/src/components/PageHeader.jsx`（从 web3 原样复制）
- Create: `frontend/src/pages/home/MarketModuleCard.jsx`（原样复制）
- Create: `frontend/src/pages/home/GoldModule.jsx`（复制后改 props）
- Create: `frontend/src/pages/home/CryptoModule.jsx`（复制后改 props）
- Create: `frontend/src/pages/home/TreasuryModule.jsx`（复制后改 props）
- Create: `frontend/src/pages/home/RateModule.jsx`（复制后改 props，去掉走势图）
- Create: `frontend/src/pages/home/index.jsx`（重写）
- Create: `frontend/src/services/market.js`

**Step 1: 复制可原样复用的文件**

```bash
mkdir -p src/pages/home
cp /Users/chenlong/Desktop/my/web3/src/components/PageHeader.jsx src/components/PageHeader.jsx
cp /Users/chenlong/Desktop/my/web3/src/pages/home/MarketModuleCard.jsx src/pages/home/
cp /Users/chenlong/Desktop/my/web3/src/pages/home/GoldModule.jsx src/pages/home/
cp /Users/chenlong/Desktop/my/web3/src/pages/home/CryptoModule.jsx src/pages/home/
cp /Users/chenlong/Desktop/my/web3/src/pages/home/TreasuryModule.jsx src/pages/home/
cp /Users/chenlong/Desktop/my/web3/src/pages/home/RateModule.jsx src/pages/home/
```

不复制 `charts/`、`ChartDrawer.jsx`、`RateHistoryDrawer.jsx`（不迁走势图）。

**Step 2: 三个简单模块改成 props 取数**

`GoldModule.jsx`：删掉 `import { useModel } from '@umijs/max';`，把组件签名与取数改成：

```jsx
export default ({ marketData = [] }) => {
  const snapshots = marketData.filter((item) => item.category === '黄金');
```

`CryptoModule.jsx`：同样删 `useModel`，改成：

```jsx
export default ({ marketData = [] }) => {
  const snapshots = marketData.filter((item) => item.category === '加密货币');
```

`TreasuryModule.jsx`：删 `useModel`，改成：

```jsx
export default ({ marketData = [], tga }) => {
  const snapshots = marketData.filter((item) => item.category === '美债');
```

并删除原来那行 `const tga = globalState.tga;`（其余逻辑不动）。

**Step 3: 利率模块去掉走势图**

`RateModule.jsx`：

1. 删除 `import { useRef } from 'react';`、`import { LinkBtn } from 'fintech';`、`import RateHistoryDrawer from './RateHistoryDrawer';`。
2. 图标导入里删掉 `LineChartOutlined`。
3. 组件签名与取数改成：

```jsx
export default ({
  marketData = [],
  fedTargetRate,
  realRate,
  inflation,
  iorb,
  fomcProbabilities = [],
}) => {
  const snapshots = marketData.filter((item) => item.category === '利率');
  const probabilities = fomcProbabilities.slice(0, 3);
  const liquidity = getLiquidityStatus(snapshots, iorb);
  const targetUpper = fedTargetRate?.high;
```

4. 删除 `const drawerRef = useRef(null);` 与原来的 `const { globalState } = useModel('global');` 及后续基于 `globalState` 的取值。
5. `<MarketModuleCard ... extra={<LinkBtn ...>走势图</LinkBtn>}>` 的 `extra` 属性整段删掉。
6. 把原来 `fomcProbabilities.length > 0` 与 `fomcProbabilities.map` 改成 `probabilities.length > 0` 与 `probabilities.map`。
7. 删除文件末尾的 `<RateHistoryDrawer actionRef={drawerRef} />`。

**Step 4: 写数据层**

`frontend/src/services/market.js`：

```js
import { request } from 'fintech';

// baseURL 由平台配置提供（'/api'），这里只写业务路径
export const getMarketOverview = () =>
  request('/market/overview.json', { showError: false });
```

**Step 5: 写首页**

`frontend/src/pages/home/index.jsx`：

```jsx
import { useEffect, useState } from 'react';
import { Flex } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import platformStorage from 'frame/global/platformStorage';
import PageHeader from '@/components/PageHeader';
import { getMarketOverview } from '@/services/market';
import GoldModule from './GoldModule';
import RateModule from './RateModule';
import TreasuryModule from './TreasuryModule';
import CryptoModule from './CryptoModule';

const findItem = (items, label) => items.find((item) => item.label === label);

// 恐惧贪婪指数分类（来自接口）→ 中文文案 + 深色背景上的文字色
const FNG_META = {
  'Extreme Fear': ['极度恐惧', 'text-emerald-300'],
  Fear: ['恐惧', 'text-emerald-300'],
  Neutral: ['中性', 'text-slate-300'],
  Greed: ['贪婪', 'text-amber-300'],
  'Extreme Greed': ['极度贪婪', 'text-rose-300'],
};

const HeroMetric = ({ label, value, prefix = '', suffix = '', diff, tag }) => {
  const isUp = Number(diff) > 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          {label}
        </div>
        {tag ||
          (diff !== undefined && Number(diff) !== 0 && (
            <span
              className={`text-[11px] font-semibold ${
                isUp ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {isUp ? (
                <ArrowUpOutlined className="mr-1" />
              ) : (
                <ArrowDownOutlined className="mr-1" />
              )}
              {Math.abs(Number(diff)).toFixed(2)}%
            </span>
          ))}
      </div>
      <div className="mt-2">
        <span className="text-xl font-semibold tracking-tight text-white">
          {prefix}
          {value || '--'}
          {suffix}
        </span>
      </div>
    </div>
  );
};

const formatTime = (iso) => {
  if (!iso) return '--';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--';
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
};

export default () => {
  const [data, setData] = useState({ marketData: [] });
  const [failed, setFailed] = useState(false);
  const { name } = platformStorage.get();

  useEffect(() => {
    let active = true;

    const load = () => {
      getMarketOverview()
        .then((result) => {
          if (!active) return;
          setData(result || { marketData: [] });
          setFailed(false);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    };

    const handleVisible = () => {
      if (document.visibilityState === 'visible') load();
    };

    load();
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, []);

  const marketData = data.marketData || [];
  const btc = findItem(marketData, 'BTC');
  const gold = findItem(marketData, 'XAU/CNY');
  const dxy = findItem(marketData, '美元指数');
  const usdCny = findItem(marketData, 'USD/CNY');
  const brent = findItem(marketData, '布伦特原油');
  const sofr = findItem(marketData, 'SOFR');
  const fng = data.fearGreed;
  const fngMeta = fng ? FNG_META[fng.classification] : null;

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          {name || '行情看板'}
        </span>
        <Flex gap={16} align="center" className="text-xs">
          <a className="text-slate-500 hover:text-slate-900" href="/admin">
            工作台
          </a>
          <a className="text-slate-500 hover:text-slate-900" href="/login">
            登录
          </a>
        </Flex>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 pb-12 sm:px-6 sm:pb-16">
        <PageHeader
          accent="violet"
          variant="hero"
          metrics={[
            <HeroMetric
              key="btc"
              label="BTC"
              prefix="$"
              value={btc?.value}
              diff={btc?.diff}
            />,
            <HeroMetric
              key="gold"
              label="XAU/CNY"
              prefix={gold?.prefix}
              value={gold?.value}
              suffix={gold?.suffix}
              diff={gold?.diff}
            />,
            <HeroMetric
              key="dxy"
              label="美元指数"
              value={dxy?.value}
              diff={dxy?.diff}
            />,
            <HeroMetric key="usdcny" label="USD/CNY" value={usdCny?.value} />,
            <HeroMetric
              key="brent"
              label="布伦特原油"
              prefix={brent?.prefix}
              value={brent?.value}
              diff={brent?.diff}
            />,
            <HeroMetric
              key="sofr"
              label="SOFR"
              value={sofr?.value}
              suffix="%"
              diff={sofr?.diff}
            />,
            <HeroMetric
              key="fng"
              label="恐惧贪婪指数"
              value={fng?.value}
              tag={
                fngMeta ? (
                  <span className={`text-[11px] font-semibold ${fngMeta[1]}`}>
                    {fngMeta[0]}
                  </span>
                ) : null
              }
            />,
          ]}
        />

        <Flex justify="space-between" align="end" className="mb-4 mt-9">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">
            市场概览
          </h2>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <ClockCircleOutlined />
            {failed
              ? '行情数据暂时不可用'
              : `数据更新于 ${formatTime(data.updatedAt)}`}
          </span>
        </Flex>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <RateModule
            marketData={marketData}
            fedTargetRate={data.fedTargetRate}
            realRate={data.realRate}
            inflation={data.inflation}
            iorb={data.iorb}
            fomcProbabilities={data.fomcProbabilities}
          />
          <TreasuryModule marketData={marketData} tga={data.tga} />
          <GoldModule marketData={marketData} />
          <CryptoModule marketData={marketData} />
        </div>
      </div>
    </div>
  );
};
```

**Step 6: 构建验证**

Run: `npm run build`
Expected: 构建成功；如果报 `useModel` 未使用或 `LineChartOutlined` 未定义，说明 Task 7 的删除步骤漏了。

**Step 7: 不提交**

前端代码按 AGENTS.md 要求，等用户确认后再提交。

---

## Task 8: 首页免登录与路由切换

**Files:**
- Modify: `frontend/config/routes.ts:11-16`
- Modify: `frontend/src/app.tsx:20`
- Delete: `frontend/src/pages/welcome/index.jsx`

**Step 1: 替换路由**

`frontend/config/routes.ts` 把 welcome 路由换成：

```ts
  {
    layout: false,
    path: '/welcome',
    name: '首页',
    component: './home',
  },
```

**Step 2: 免登录放行**

`frontend/src/app.tsx` 的 `validateAuthBeforeNonLoginRoutes`：

```ts
const validateAuthBeforeNonLoginRoutes = () => {
  const PATHS = new Set(['/', '/login', '/m/scan', '/welcome']);
  return !PATHS.has(location.pathname);
};
```

**Step 3: 删除旧引导页**

```bash
rm -rf src/pages/welcome
```

确认没有其他引用：

Run: `grep -rn "pages/welcome\|'./welcome'" src config`
Expected: 只剩 `config/routes.ts` 里的 `path: '/welcome'`，没有组件路径引用。

**Step 4: 构建验证**

Run: `npm run build`
Expected: 构建成功。

**Step 5: 手动验证**

```bash
./dev.sh   # 选 1 和 2
```
浏览器无痕窗口直接访问 `http://localhost:8001/welcome`。
Expected: 不跳登录页，直接看到行情首页；顶部显示「数据更新于 HH:mm」；四张卡片有数据（首次启动若快照为空，等下一轮 5 分钟或重启后端触发 `immediate`）。

**Step 6: 不提交**

前端代码等用户确认后再提交。

---

## Task 9: 全量验证

**Step 1: 后端**

```bash
cd backend
npm run typecheck
npm test
```
Expected: 全部通过，无失败用例。

**Step 2: 前端**

```bash
cd ../frontend
npm run build
```
Expected: 构建成功。

**Step 3: 接口抽查**

```bash
curl -s http://127.0.0.1:7001/api/market/overview.json | python3 -m json.tool | head -40
```
Expected:
- `data.marketData` 顺序为 黄金 → 美债 → 利率 → 加密 → 汇率/能源；
- `data.tga.history` 长度大于 2；
- `data.fomcProbabilities` 至少 1 条；
- 不带 Cookie 请求也返回 200。

**Step 4: 降级验证**

```bash
cd backend
sqlite3 storage/dev.sqlite "select source, failed_at, substr(error,1,40) from market_snapshots;"
```
Expected: 正常情况下 `failed_at` 与 `error` 全为 NULL；若某个源为 NULL 之外的值，说明该上游当前不可用，但接口仍返回其余数据。

---

## 完成标准

- `GET /api/market/overview.json` 无 Cookie 返回 200 且包含整页数据。
- 后端每 5 分钟自动刷新一次，单源失败不影响其他源，失败源保留上一次值。
- `/welcome` 免登录可访问，页面不再依赖任何外部接口。
- 旧 `src/pages/welcome` 已删除，无残留引用。
- 后端 `npm test`、前端 `npm run build` 均通过。
