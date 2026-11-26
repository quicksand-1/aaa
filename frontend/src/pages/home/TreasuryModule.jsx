import { Flex, Skeleton } from 'antd';
import {
  BankOutlined,
  CaretDownFilled,
  CaretUpFilled,
} from '@ant-design/icons';
import MarketModuleCard, {
  SnapshotItem,
  Sparkline,
  getDiffTone,
} from './MarketModuleCard';

// 把按日期升序的余额序列压进 Sparkline 的 120×32 画布（留 2px 边距）
const buildSparklinePath = (history) => {
  if (!history || history.length < 2) return '';
  const values = history.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = 2 + (index * 116) / (values.length - 1);
      const y = 28 - ((value - min) / span) * 24;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

// 美元 → 亿美金，保留整数
const toYi = (usd) => (usd / 1e8).toFixed(0);

const getCurveStatus = (items) => {
  const y2 = items.find((item) => item.label === '2Y');
  const y10 = items.find((item) => item.label === '10Y');
  if (!y2 || !y10) return null;

  const spread = parseFloat(y10.value) - parseFloat(y2.value);
  if (Number.isNaN(spread)) return null;

  if (spread < 0) {
    return {
      label: '收益率曲线倒挂',
      hint: `10Y-2Y 利差 ${spread.toFixed(2)}%，历史上多为衰退前兆`,
      tone: 'border-rose-200 bg-rose-50 text-rose-600',
      dot: 'bg-rose-500',
    };
  }
  if (spread < 0.25) {
    return {
      label: '曲线趋平',
      hint: `10Y-2Y 利差 ${spread.toFixed(2)}%，接近倒挂临界`,
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
    };
  }
  return {
    label: '收益率曲线正常',
    hint: `10Y-2Y 利差 ${spread.toFixed(2)}%，长短端期限溢价稳定`,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  };
};

const DebtRow = ({ label, value, suffix, diff = 0 }) => {
  const isUp = Number(diff) > 0;
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
      <Flex justify="space-between" align="center">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <Flex align="baseline" gap={6}>
          {Number(diff) !== 0 && (
            <span className={`text-[11px] font-semibold ${getDiffTone(diff)}`}>
              {isUp ? <CaretUpFilled /> : <CaretDownFilled />}
              {Math.abs(Number(diff)).toFixed(2)}%
            </span>
          )}
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            {value}
          </span>
          <span className="text-[11px] text-slate-400">{suffix}</span>
        </Flex>
      </Flex>
    </div>
  );
};

export default ({ marketData = [], tga }) => {
  const snapshots = marketData.filter((item) => item.category === '美债');
  const total = snapshots.find((item) => item.label === '美债总量');
  const yields = snapshots.filter((item) => item.label !== '美债总量');
  const curve = getCurveStatus(yields);
  const tgaDaily = tga ? tga.balance - tga.prevBalance : 0;
  const tgaMonthBase = tga
    ? tga.history[Math.max(0, tga.history.length - 21)]
    : null;
  const tgaMonth = tgaMonthBase ? tga.balance - tgaMonthBase.value : null;

  return (
    <MarketModuleCard
      title="美债"
      subtitle="收益率曲线 · 美债总量 · TGA"
      accent="blue"
      icon={<BankOutlined className="text-lg" />}
    >
      <Flex vertical gap={14}>
        <Flex gap={24} wrap>
          {yields.length ? (
            yields.map((item) => <SnapshotItem key={item.label} {...item} />)
          ) : (
            <Skeleton active paragraph={{ rows: 1 }} />
          )}
        </Flex>
        {curve && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${curve.tone}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${curve.dot}`} />
            <span className="text-xs font-semibold">{curve.label}</span>
            <span className="truncate text-xs opacity-75">{curve.hint}</span>
          </div>
        )}

        {total && (
          <div className="border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center gap-2">
              <BankOutlined className="text-xs text-slate-400" />
              <span className="text-xs font-medium text-slate-500">
                未偿还国债余额
              </span>
              <span className="ml-auto text-[11px] text-slate-400">
                较前一日变动
              </span>
            </div>
            <DebtRow {...total} />
          </div>
        )}

        {tga && (
          <div className="border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center gap-2">
              <BankOutlined className="text-xs text-slate-400" />
              <span className="text-xs font-medium text-slate-500">
                财政部现金余额（TGA）
              </span>
              <span
                className={`ml-auto text-[11px] font-semibold ${
                  tgaDaily === 0 ? 'text-slate-400' : getDiffTone(tgaDaily)
                }`}
              >
                {tgaDaily > 0 && <CaretUpFilled />}
                {tgaDaily < 0 && <CaretDownFilled />} 较前一日{' '}
                {Math.abs(tgaDaily / 1e8).toFixed(0)}亿$
              </span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="text-[24px] font-semibold leading-none tracking-tight text-slate-900">
                  {toYi(tga.balance)}
                </span>
                <span className="ml-1 text-[11px] text-slate-400">亿$</span>
                {tgaMonth != null && (
                  <div
                    className={`mt-1.5 text-[11px] ${
                      tgaMonth === 0 ? 'text-slate-400' : getDiffTone(tgaMonth)
                    }`}
                  >
                    近 30 日 {tgaMonth > 0 ? '+' : ''}
                    {toYi(tgaMonth)}亿$
                  </div>
                )}
              </div>
              <Sparkline path={buildSparklinePath(tga.history)} />
            </div>
            <div className="mt-2 text-[11px] leading-4 text-slate-400">
              TGA 增加＝资金从银行体系流向财政部，减少则相反
            </div>
          </div>
        )}
      </Flex>
    </MarketModuleCard>
  );
};
