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
