import { getJson } from '../http';
import { computeDiff } from '../parse';
import type { MarketFetcher, MarketItem } from '../types';

const TGA_URL =
  'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance';
const DEBT_URL =
  'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny';

interface DebtRow {
  tot_pub_debt_out_amt: string;
}

interface TgaRow {
  record_date: string;
  open_today_bal: string;
}

export default async function fetchFiscal(
  fetcher: MarketFetcher,
): Promise<Record<string, unknown>> {
  const tgaFrom = new Date(Date.now() - 90 * 86400000)
    .toISOString()
    .slice(0, 10);
  const filter = encodeURIComponent(
    `account_type:eq:Treasury General Account (TGA) Closing Balance,record_date:gte:${tgaFrom}`,
  );

  const [debtRes, tgaRes] = await Promise.all([
    getJson<{ data?: DebtRow[] }>(
      fetcher,
      `${DEBT_URL}?sort=-record_date&page[size]=2&fields=record_date,tot_pub_debt_out_amt`,
    ),
    getJson<{ data?: TgaRow[] }>(
      fetcher,
      `${TGA_URL}?filter=${filter}&fields=record_date,open_today_bal&sort=record_date&page[size]=500`,
    ),
  ]);

  const result: Record<string, unknown> = {};

  const debtRows = debtRes?.data ?? [];
  if (debtRows.length >= 2) {
    const latest = parseFloat(debtRows[0].tot_pub_debt_out_amt);
    const previous = parseFloat(debtRows[1].tot_pub_debt_out_amt);
    const marketData: MarketItem[] = [
      {
        label: '美债总量',
        value: (latest / 1e12).toFixed(2),
        diff: computeDiff(latest, previous),
        suffix: '万亿$',
        category: '美债',
      },
    ];
    result.marketData = marketData;
  }

  const history = (tgaRes?.data ?? [])
    .map((row) => ({
      date: row.record_date,
      value: parseFloat(row.open_today_bal) * 1e6,
    }))
    .filter((row) => row.date && Number.isFinite(row.value));

  if (history.length >= 2) {
    result.tga = {
      date: history[history.length - 1].date,
      balance: history[history.length - 1].value,
      prevBalance: history[history.length - 2].value,
      history,
    };
  }

  if (!result.marketData && !result.tga) {
    throw new Error('财政部数据为空');
  }

  return result;
}
