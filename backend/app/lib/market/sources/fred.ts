import { getText } from '../http';
import { computeInflation, parseFredCsv } from '../parse';
import type { MarketFetcher } from '../types';

const BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';

export default async function fetchFred(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  // CPI 是月频，同比需要「去年同月」；FRED 只返回 cosd 之后的行，
  // 取 13 个月会在最新月份缺失去年同月，导致通胀率静默为空。
  const cpiFrom = (() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 24);
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
  if (high && inflation !== null) {
    result.realRate = Number((high - inflation).toFixed(2));
  }
  if (iorb) result.iorb = iorb;

  if (!Object.keys(result).length) throw new Error('FRED 数据为空');
  return result;
}
