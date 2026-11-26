import type { MarketFetcher } from './types';

// 上游多为境外站点，8 秒足够；超时按单源失败处理，不拖累整轮刷新
const TIMEOUT_MS = 8000;

const request = (fetcher: MarketFetcher, url: string, init: RequestInit = {}) =>
  fetcher(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });

const ensureOk = (response: Response, url: string) => {
  if (!response.ok) throw new Error(`${url} 返回 HTTP ${response.status}`);
};

export async function getJson<T = any>(
  fetcher: MarketFetcher,
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await request(fetcher, url, init);
  ensureOk(response, url);
  return (await response.json()) as T;
}

export async function getText(
  fetcher: MarketFetcher,
  url: string,
  init?: RequestInit,
): Promise<string> {
  const response = await request(fetcher, url, init);
  ensureOk(response, url);
  return response.text();
}

/** 新浪返回 GBK，必须按字节解码，直接 text() 会得到乱码 */
export async function getGbkText(
  fetcher: MarketFetcher,
  url: string,
  init?: RequestInit,
): Promise<string> {
  const response = await request(fetcher, url, init);
  ensureOk(response, url);
  return new TextDecoder('gbk').decode(await response.arrayBuffer());
}
