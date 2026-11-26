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
