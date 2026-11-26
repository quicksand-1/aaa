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
const MARKET_ORDER = ['gold', 'treasury', 'fiscal', 'rates', 'crypto', 'sina'];

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
            error: message,
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
  const fetchedAt: string[] = [];
  for (const row of rows) {
    if (row.fetched_at) fetchedAt.push(row.fetched_at);
    if (!row.payload) continue;
    snapshots.set(row.source, JSON.parse(row.payload));
  }

  const marketData: MarketItem[] = MARKET_ORDER.flatMap(
    (key) => snapshots.get(key)?.marketData ?? [],
  );

  const overview: MarketOverview = {
    updatedAt: fetchedAt.sort().pop() ?? null,
    marketData,
  };

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
