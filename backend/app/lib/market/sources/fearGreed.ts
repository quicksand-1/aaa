import { getJson } from '../http';
import type { MarketFetcher } from '../types';

interface FngResponse {
  data?: Array<{ value: string; value_classification: string }>;
}

export default async function fetchFearGreed(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const res = await getJson<FngResponse>(
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
