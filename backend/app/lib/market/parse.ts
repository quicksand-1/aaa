import type { MarketItem } from './types';

const toNum = (value: unknown): number => {
  const n = parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : 0;
};

export const computeDiff = (value: number, base: number): number =>
  base > 0 ? Number((((value - base) / base) * 100).toFixed(2)) : 0;

/**
 * 新浪返回 GBK 编码的 `var hq_str_SYMBOL="a,b,c";`。
 * 只取数字字段，中文名称统一用本地文案，避免依赖 GBK 解码后的中文。
 */
export function parseSinaQuotes(text: string): MarketItem[] {
  const items: MarketItem[] = [];
  const re = /var hq_str_(\w+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const [, symbol, payload] = match;
    const fields = payload.split(',');

    if (symbol === 'DINIW') {
      // 0=时间 1=最新价 3=昨收
      const price = toNum(fields[1]);
      if (!price) continue;
      items.push({
        label: '美元指数',
        value: price.toFixed(2),
        diff: computeDiff(price, toNum(fields[3])),
        category: '汇率',
      });
    } else if (symbol === 'hf_OIL') {
      // 0=最新价 7=昨结
      const price = toNum(fields[0]);
      if (!price) continue;
      items.push({
        label: '布伦特原油',
        value: price.toFixed(2),
        diff: computeDiff(price, toNum(fields[7])),
        prefix: '$',
        category: '能源',
      });
    } else if (symbol === 'fx_susdcny') {
      // 8=最新价，缺失时退回 1=买入价
      const price = toNum(fields[8]) || toNum(fields[1]);
      if (!price) continue;
      items.push({
        label: 'USD/CNY',
        value: price.toFixed(4),
        diff: 0,
        category: '汇率',
      });
    }
  }
  return items;
}

/** 取最后一条 YYYY-MM-DD 行的数值，跳过 '.' 占位和 HTML 维护页 */
export function parseFredCsv(csv: string): number {
  const lines = csv.trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const [date, value] = lines[i].split(',');
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && value && value !== '.') {
      return parseFloat(value);
    }
  }
  return 0;
}

export function computeInflation(csv: string): number | null {
  const rows = csv
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => {
      const [date, value] = line.split(',');
      return { date, value: value && value !== '.' ? parseFloat(value) : null };
    })
    .filter(
      (row): row is { date: string; value: number } =>
        row.value !== null && /^\d{4}-\d{2}-\d{2}$/.test(row.date),
    );

  const byMonth = new Map<string, number>();
  for (const row of rows) byMonth.set(row.date.slice(0, 7), row.value);

  // 上游偶有单月空值（例如 2025-10 缺失），最新月算不出同比就往前退一个月
  for (let i = rows.length - 1; i >= 0; i--) {
    const [year, month] = rows[i].date.split('-').map(Number);
    const base = byMonth.get(
      `${year - 1}-${String(month).padStart(2, '0')}`,
    );
    if (base) return Number(((rows[i].value / base - 1) * 100).toFixed(2));
  }

  return null;
}

export interface TreasuryEntry {
  date: string;
  '2Y': number;
  '10Y': number;
  '30Y': number;
}

const readTag = (chunk: string, tag: string): string => {
  const match = new RegExp(`<(?:d|m):${tag}[^>]*>([^<]*)<`).exec(chunk);
  return match ? match[1].trim() : '';
};

export function parseTreasuryXml(xml: string): TreasuryEntry[] {
  const entries = xml.match(/<entry[^>]*>[\s\S]*?<\/entry>/g) ?? [];
  return entries
    .map((entry) => ({
      date: readTag(entry, 'NEW_DATE').slice(0, 10),
      '2Y': toNum(readTag(entry, 'BC_2YEAR')),
      '10Y': toNum(readTag(entry, 'BC_10YEAR')),
      '30Y': toNum(readTag(entry, 'BC_30YEAR')),
    }))
    .filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.date))
    // 调用方按「最后一条」取最新值，依赖日期升序；不信任上游顺序
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface FomcProbability {
  date: string;
  moveProbability: string;
  bpChange: string;
  rateLevel: string;
  higher: string;
  same: string;
  lower: string;
}

const readClass = (chunk: string, className: string): string => {
  const match = new RegExp(
    `<[a-z]+ class=["']?${className}["']?[^>]*>([^<]*)<`,
  ).exec(chunk);
  return match ? match[1].trim() : '';
};

const extractPercent = (chip?: string): string => {
  const match = chip ? /([\d.]+)%/.exec(chip) : null;
  return match ? match[1] : '0';
};

/**
 * centralbank.watch 是 HTML 页面且属性值不带引号。
 * 按行标签切分后每段都从当前行开头，取各 class 的第一次出现即为本行数据。
 */
export function parseFedWatch(html: string): FomcProbability[] {
  const rows = html.split(/<div class=["']?cbw-row["']?>/).slice(1);
  const results: FomcProbability[] = [];

  for (const row of rows) {
    const date = readClass(row, 'cbw-row-date');
    const moveProbability = readClass(row, 'cbw-move-pct');
    if (!date || !moveProbability) continue;

    const chips = [
      ...row.matchAll(/<span class=["']cbw-chip [^"']*["']>([^<]*)</g),
    ]
      .map((match) => match[1].trim())
      .slice(0, 3);

    results.push({
      date,
      moveProbability,
      bpChange: readClass(row, 'cbw-move-step'),
      rateLevel: readClass(row, 'cbw-exp-big'),
      higher: extractPercent(chips[0]),
      same: extractPercent(chips[1]),
      lower: extractPercent(chips[2]),
    });
  }

  return results;
}
