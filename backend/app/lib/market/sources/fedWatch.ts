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
  if (!fomcProbabilities.length) {
    throw new Error('FedWatch 页面结构变化，未解析到会议行');
  }

  return { fomcProbabilities };
}