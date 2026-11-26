import { useEffect, useState } from 'react';
import { Flex } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { request } from 'fintech';
import platformStorage from 'frame/global/platformStorage';
import PageHeader from '@/components/PageHeader';
import GoldModule from './GoldModule';
import RateModule from './RateModule';
import TreasuryModule from './TreasuryModule';
import CryptoModule from './CryptoModule';

const findItem = (items, label) => items.find((item) => item.label === label);

// 恐惧贪婪指数分类（来自接口）→ 中文文案 + 深色背景上的文字色
const FNG_META = {
  'Extreme Fear': ['极度恐惧', 'text-emerald-300'],
  Fear: ['恐惧', 'text-emerald-300'],
  Neutral: ['中性', 'text-slate-300'],
  Greed: ['贪婪', 'text-amber-300'],
  'Extreme Greed': ['极度贪婪', 'text-rose-300'],
};

const HeroMetric = ({ label, value, prefix = '', suffix = '', diff, tag }) => {
  const isUp = Number(diff) > 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          {label}
        </div>
        {tag ||
          (diff !== undefined && Number(diff) !== 0 && (
            <span
              className={`text-[11px] font-semibold ${
                isUp ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {isUp ? (
                <ArrowUpOutlined className="mr-1" />
              ) : (
                <ArrowDownOutlined className="mr-1" />
              )}
              {Math.abs(Number(diff)).toFixed(2)}%
            </span>
          ))}
      </div>
      <div className="mt-2">
        <span className="text-xl font-semibold tracking-tight text-white">
          {prefix}
          {value || '--'}
          {suffix}
        </span>
      </div>
    </div>
  );
};

const formatTime = (iso) => {
  if (!iso) return '--';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--';
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
};

export default () => {
  const [data, setData] = useState({ marketData: [] });
  const [failed, setFailed] = useState(false);
  const { name } = platformStorage.get();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  useEffect(() => {
    let active = true;

    const load = () => {
      // 公开页没有会话，失败时只做页面内降级，不触发全局登录跳转
      request('/market/overview.json', { showError: false })
        .then((result) => {
          if (!active) return;
          setData(result || { marketData: [] });
          setFailed(false);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    };

    // 后端 5 分钟才更新一轮，切回标签页时补拉一次比定时轮询更省
    const handleVisible = () => {
      if (document.visibilityState === 'visible') load();
    };

    load();
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, []);

  const marketData = data.marketData || [];
  const btc = findItem(marketData, 'BTC');
  const gold = findItem(marketData, 'XAU/CNY');
  const dxy = findItem(marketData, '美元指数');
  const usdCny = findItem(marketData, 'USD/CNY');
  const brent = findItem(marketData, '布伦特原油');
  const sofr = findItem(marketData, 'SOFR');
  const fng = data.fearGreed;
  const fngMeta = fng ? FNG_META[fng.classification] : null;

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          {name || '行情看板'}
        </span>
        <Flex gap={16} align="center" className="text-xs">
          {currentUser?.account ? (
            <>
              <span className="max-w-[140px] truncate text-slate-500">
                {currentUser.name || currentUser.account}
              </span>
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 text-slate-500 hover:text-slate-900"
                onClick={() => history.push('/admin')}
              >
                工作台
              </button>
            </>
          ) : (
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-slate-500 hover:text-slate-900"
              onClick={() => history.push('/login')}
            >
              登录
            </button>
          )}
        </Flex>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 pb-12 sm:px-6 sm:pb-16">
        <PageHeader
          accent="violet"
          variant="hero"
          metrics={[
            <HeroMetric
              key="btc"
              label="BTC"
              prefix="$"
              value={btc?.value}
              diff={btc?.diff}
            />,
            <HeroMetric
              key="gold"
              label="XAU/CNY"
              prefix={gold?.prefix}
              value={gold?.value}
              suffix={gold?.suffix}
              diff={gold?.diff}
            />,
            <HeroMetric
              key="dxy"
              label="美元指数"
              value={dxy?.value}
              diff={dxy?.diff}
            />,
            <HeroMetric key="usdcny" label="USD/CNY" value={usdCny?.value} />,
            <HeroMetric
              key="brent"
              label="布伦特原油"
              prefix={brent?.prefix}
              value={brent?.value}
              diff={brent?.diff}
            />,
            <HeroMetric
              key="sofr"
              label="SOFR"
              value={sofr?.value}
              suffix="%"
              diff={sofr?.diff}
            />,
            <HeroMetric
              key="fng"
              label="恐惧贪婪指数"
              value={fng?.value}
              tag={
                fngMeta ? (
                  <span className={`text-[11px] font-semibold ${fngMeta[1]}`}>
                    {fngMeta[0]}
                  </span>
                ) : null
              }
            />,
          ]}
        />

        <Flex justify="space-between" align="end" className="mb-4 mt-9">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">
            市场概览
          </h2>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <ClockCircleOutlined />
            {failed
              ? '行情数据暂时不可用'
              : `数据更新于 ${formatTime(data.updatedAt)}`}
          </span>
        </Flex>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <RateModule
            marketData={marketData}
            fedTargetRate={data.fedTargetRate}
            realRate={data.realRate}
            inflation={data.inflation}
            iorb={data.iorb}
            fomcProbabilities={data.fomcProbabilities}
          />
          <TreasuryModule marketData={marketData} tga={data.tga} />
          <GoldModule marketData={marketData} />
          <CryptoModule marketData={marketData} />
        </div>
      </div>
    </div>
  );
};
