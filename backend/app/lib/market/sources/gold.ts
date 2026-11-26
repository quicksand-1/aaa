import { getJson } from '../http';
import { computeDiff } from '../parse';
import type { MarketFetcher, MarketItem } from '../types';

const BASE = 'https://api.goldprice.dev/v1';

interface PriceResponse {
  symbols?: Array<{ price?: string }>;
}

interface ConvertResponse {
  result?: string;
}

interface BarsResponse {
  bars?: Array<{ close?: string }>;
}

export default async function fetchGold(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  const [price, convert, bars] = await Promise.all([
    getJson<PriceResponse>(
      fetcher,
      `${BASE}/prices?symbol=XAU-USD-SPOT`,
    ),
    getJson<ConvertResponse>(
      fetcher,
      `${BASE}/convert?from=XAU&to=CNY&unit=gram`,
    ),
    getJson<BarsResponse>(
      fetcher,
      `${BASE}/bars?symbol=XAU-USD-SPOT&interval=1d&from=${weekAgo}&to=${today}&limit=2`,
    ),
  ]);

  const usd = parseFloat(price?.symbols?.[0]?.price ?? '');
  if (!Number.isFinite(usd)) throw new Error('黄金价格字段缺失');

  const current = parseFloat(bars?.bars?.[0]?.close ?? '');
  const previous = parseFloat(bars?.bars?.[1]?.close ?? '');
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

  const cny = parseFloat(convert?.result ?? '');
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
