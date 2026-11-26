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
