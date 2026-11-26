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
