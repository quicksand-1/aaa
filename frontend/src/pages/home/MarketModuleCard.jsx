import { Flex, Tooltip } from 'antd';
import { CaretDownFilled, CaretUpFilled } from '@ant-design/icons';

const accentMap = {
  gold: {
    bar: 'bg-amber-400',
    icon: 'bg-amber-100 text-amber-700',
    glow: 'from-amber-100/80 to-transparent',
  },
  blue: {
    bar: 'bg-sky-500',
    icon: 'bg-sky-100 text-sky-700',
    glow: 'from-sky-100/80 to-transparent',
  },
  violet: {
    bar: 'bg-violet-500',
    icon: 'bg-violet-100 text-violet-700',
    glow: 'from-violet-100/80 to-transparent',
  },
  emerald: {
    bar: 'bg-emerald-500',
    icon: 'bg-emerald-100 text-emerald-700',
    glow: 'from-emerald-100/80 to-transparent',
  },
};

export default ({
  title,
  subtitle,
  accent = 'blue',
  icon,
  extra,
  children,
  footer,
}) => {
  const colors = accentMap[accent] || accentMap.blue;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${colors.bar}`} />
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${colors.glow} blur-2xl`}
      />
      <div className="relative p-5">
        <Flex align="center" justify="space-between" gap={12}>
          <Flex align="center" gap={12} className="min-w-0">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <h2 className="m-0 text-[17px] font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-1 truncate text-xs text-slate-400">{subtitle}</p>
            </div>
          </Flex>
          {extra && <div className="shrink-0">{extra}</div>}
        </Flex>
        <div className="mt-6">{children}</div>
        {footer && (
          <div className="mt-5 border-t border-slate-100 pt-4">{footer}</div>
        )}
      </div>
    </section>
  );
};

// 首页统一口径：上涨绿色、下跌红色（与头部 HeroMetric 保持一致）
export const getDiffTone = (diff) =>
  Number(diff) > 0 ? 'text-emerald-600' : 'text-rose-500';

export const SnapshotItem = ({
  label,
  value,
  diff = 0,
  prefix = '',
  suffix = '',
  tip,
  diffOnLabel = false,
}) => {
  const isUp = Number(diff) > 0;
  const labelNode = (
    <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
      {label}
    </div>
  );
  const diffNode =
    Number(diff) !== 0 ? (
      <span className={`text-xs font-semibold ${getDiffTone(diff)}`}>
        {isUp ? <CaretUpFilled /> : <CaretDownFilled />}{' '}
        {Math.abs(Number(diff)).toFixed(2)}%
      </span>
    ) : null;
  const labelRow = (
    <div className="flex flex-wrap items-center gap-x-2">
      {labelNode}
      {diffOnLabel && diffNode}
    </div>
  );
  return (
    <div className="min-w-0 flex-1">
      {tip ? <Tooltip title={tip}>{labelRow}</Tooltip> : labelRow}
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[24px] font-semibold leading-none tracking-tight text-slate-900">
          {prefix}
          {value}
          {suffix}
        </span>
        {!diffOnLabel && diffNode}
      </div>
    </div>
  );
};

export const Sparkline = ({
  color = '#0ea5e9',
  path = 'M2 28 C 18 22, 22 26, 34 18 S 56 20, 68 10 S 92 14, 118 4',
}) => (
  <svg viewBox="0 0 120 32" className="h-8 w-28" aria-hidden="true">
    <path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d={`${path} L118 32 L2 32 Z`} fill={color} opacity="0.08" />
  </svg>
);
