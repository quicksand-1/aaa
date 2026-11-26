import { Flex, Skeleton } from 'antd';
import { PercentageOutlined, CalendarOutlined } from '@ant-design/icons';
import MarketModuleCard, { SnapshotItem } from './MarketModuleCard';

// SOFR 与政策下限 IORB 的偏离是流动性松紧的核心信号：
// 准备金充裕时，多余的备付金把回购利率压到 IORB 之下；
// 准备金收紧时，抢资金把 SOFR 推到 IORB 之上。
// SOFR − EFFR 是两个内生市场利率相减，符号没有稳定含义，不能用来判断松紧。
const getLiquidityStatus = (items, iorb) => {
  const sofr = items.find((item) => item.label === 'SOFR');
  if (!sofr || !iorb) return null;

  // 先归一到 0.1bp，避免浮点误差把恰好 3bp 判成偏紧
  const spreadBp = Number(((parseFloat(sofr.value) - iorb) * 100).toFixed(1));
  if (Number.isNaN(spreadBp)) return null;

  const basis = `SOFR ${sofr.value}% vs IORB ${iorb.toFixed(2)}%，${
    spreadBp >= 0 ? '+' : ''
  }${spreadBp.toFixed(0)}bp`;

  if (spreadBp > 10) {
    return {
      label: '流动性紧张',
      hint: `${basis}，资金成本明显抬升，风险溢价扩大`,
      tone: 'border-rose-200 bg-rose-50 text-rose-600',
      dot: 'bg-rose-500',
    };
  }
  if (spreadBp > 3) {
    return {
      label: '流动性偏紧',
      hint: `${basis}，准备金边际收紧`,
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
    };
  }
  if (spreadBp < -3) {
    return {
      label: '流动性宽松',
      hint: `${basis}，资金过剩压低回购利率`,
      tone: 'border-sky-200 bg-sky-50 text-sky-700',
      dot: 'bg-sky-500',
    };
  }
  return {
    label: '流动性中性',
    hint: `${basis}，准备金供需基本均衡`,
    tone: 'border-slate-200 bg-slate-50 text-slate-600',
    dot: 'bg-slate-400',
  };
};

const RATE_TIPS = {
  SOFR: '有担保隔夜融资利率（Secured Overnight Financing Rate），反映隔夜国债回购市场融资成本，是美联储官方替代 LIBOR 的基准利率',
  EFFR: '有效联邦基金利率（Effective Federal Funds Rate），反映银行间无担保隔夜拆借资金成本，是美联储货币政策关键参考',
  NOMINAL:
    '名义利率：未剔除通货膨胀影响的利率水平，实际利率 = 名义利率 − 通胀率',
};

const fomcMonthCn = {
  January: '1月',
  February: '2月',
  March: '3月',
  April: '4月',
  May: '5月',
  June: '6月',
  July: '7月',
  August: '8月',
  September: '9月',
  October: '10月',
  November: '11月',
  December: '12月',
};

export default ({
  marketData = [],
  fedTargetRate,
  realRate,
  inflation,
  iorb,
  fomcProbabilities = [],
}) => {
  const snapshots = marketData.filter((item) => item.category === '利率');
  const probabilities = fomcProbabilities.slice(0, 3);
  const liquidity = getLiquidityStatus(snapshots, iorb);
  const targetUpper = fedTargetRate?.high;

  const renderSnapshots = () => {
    const items = [];
    snapshots.forEach((item) => {
      items.push(
        <SnapshotItem key={item.label} {...item} tip={RATE_TIPS[item.label]} />
      );
      if (item.label === 'EFFR' && targetUpper) {
        items.push(
          <SnapshotItem
            key="NOMINAL"
            label="名义利率"
            value={targetUpper.toFixed(2)}
            suffix="%"
            tip={RATE_TIPS.NOMINAL}
          />
        );
        if (realRate != null && inflation != null) {
          items.push(
            <SnapshotItem
              key="REAL"
              label="实际利率"
              value={realRate.toFixed(2)}
              suffix="%"
              tip={`实际利率 = 名义利率 − 通胀率：${realRate.toFixed(
                2
              )}% = ${targetUpper.toFixed(2)}% − ${inflation.toFixed(
                2
              )}%（通胀取 FRED CPIAUCSL 同比）`}
            />
          );
        }
      }
    });
    return items;
  };

  return (
    <MarketModuleCard
      title="利率"
      subtitle="资金市场 · SOFR / EFFR"
      accent="emerald"
      icon={<PercentageOutlined className="text-lg" />}
    >
      <Flex vertical gap={14}>
        <Flex gap={24} wrap>
          {snapshots.length ? (
            renderSnapshots()
          ) : (
            <Skeleton active paragraph={{ rows: 1 }} />
          )}
        </Flex>

        {liquidity && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${liquidity.tone}`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${liquidity.dot}`}
            />
            <span className="text-xs font-semibold">{liquidity.label}</span>
            <span className="truncate text-xs opacity-75">
              {liquidity.hint}
            </span>
          </div>
        )}

        {probabilities.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center gap-2">
              <CalendarOutlined className="text-xs text-slate-400" />
              <span className="text-xs font-medium text-slate-500">
                FedWatch 升降息概率
              </span>
            </div>
            <Flex vertical gap={8}>
              {probabilities.map((item) => {
                const match = item.date.match(/^(\w+)\s+(\d{1,2})/);
                const monthCn = match ? fomcMonthCn[match[1]] || match[1] : '';
                const day = match ? match[2] : '';
                const higher = parseFloat(item.higher) || 0;
                const same = parseFloat(item.same) || 0;
                const lower = parseFloat(item.lower) || 0;
                const total = higher + same + lower || 1;
                const dominant = Math.max(higher, same, lower);
                const dominantColor =
                  dominant === higher
                    ? 'bg-rose-100'
                    : dominant === lower
                    ? 'bg-emerald-100'
                    : 'bg-slate-200';
                const dominantW = (dominant / total) * 100;
                return (
                  <div
                    key={item.date}
                    className="relative overflow-hidden rounded-lg bg-slate-50 px-2.5 py-2"
                  >
                    <div
                      className={`pointer-events-none absolute inset-y-0 left-0 ${dominantColor}`}
                      style={{ width: `${dominantW}%` }}
                    />
                    <div className="relative">
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={8}>
                          <span className="text-xs font-medium text-slate-700">
                            {monthCn}
                            {day}日
                          </span>
                          <span className="text-[11px] text-rose-500">
                            加息 {item.higher}%
                          </span>
                          <span className="text-[11px] text-slate-400">
                            不变 {item.same}%
                          </span>
                          <span className="text-[11px] text-emerald-500">
                            降息 {item.lower}%
                          </span>
                        </Flex>
                        <span className="text-[11px] text-slate-400">
                          隐含 {item.rateLevel} {item.bpChange}
                        </span>
                      </Flex>
                    </div>
                  </div>
                );
              })}
            </Flex>
          </div>
        )}
      </Flex>
    </MarketModuleCard>
  );
};
