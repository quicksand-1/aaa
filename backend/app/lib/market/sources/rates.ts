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
