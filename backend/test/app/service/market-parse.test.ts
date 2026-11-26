import assert from 'assert';
import {
  computeDiff,
  computeInflation,
  parseFedWatch,
  parseFredCsv,
  parseSinaQuotes,
  parseTreasuryXml,
} from '../../../app/lib/market/parse';

describe('lib/market/parse', () => {
  it('解析新浪文本里的美元指数、布伦特原油和 USD/CNY', () => {
    const text = [
      'var hq_str_DINIW="16:48:08,103.7387,103.7387,103.7010,1635,103.7189,103.8405,103.6770,103.7387,美元指数,2026-11-26";',
      'var hq_str_hf_OIL="90.502,,90.500,90.520,92.080,90.360,16:48:08,90.640,90.690,0,6,3";',
      'var hq_str_fx_susdcny="17:03:59,7.1234,7.1250,7.1100,7.1200,7.1300,7.1000,7.1150,7.1180";',
    ].join('\n');

    const items = parseSinaQuotes(text);

    assert.strictEqual(items.length, 3);
    assert.deepStrictEqual(items[0], {
      label: '美元指数',
      value: '103.74',
      diff: 0.04,
      category: '汇率',
    });
    assert.deepStrictEqual(items[1], {
      label: '布伦特原油',
      value: '90.50',
      diff: -0.15,
      prefix: '$',
      category: '能源',
    });
    assert.deepStrictEqual(items[2], {
      label: 'USD/CNY',
      value: '7.1180',
      diff: 0,
      category: '汇率',
    });
  });

  it('FRED CSV 跳过空值行', () => {
    const csv = [
      'observation_date,DFEDTARU',
      '2026-11-24,4.00',
      '2026-11-25,.',
      '2026-11-26,3.88',
    ].join('\n');

    assert.strictEqual(parseFredCsv(csv), 3.88);
  });

  it('用 CPI 最新月与去年同月算同比', () => {
    const csv = [
      'observation_date,CPIAUCSL',
      '2025-09-01,298.0',
      '2025-10-01,300.0',
      '2026-09-01,306.0',
      '2026-10-01,309.0',
    ].join('\n');

    assert.strictEqual(computeInflation(csv), 3);
  });

  it('解析美债收益率 XML 的 entry', () => {
    const xml =
      '<feed><entry><m:properties><d:NEW_DATE m:type="Edm.DateTime">2026-11-24T00:00:00</d:NEW_DATE><d:BC_2YEAR m:type="Edm.Double">3.60</d:BC_2YEAR><d:BC_10YEAR m:type="Edm.Double">4.10</d:BC_10YEAR><d:BC_30YEAR m:type="Edm.Double">4.70</d:BC_30YEAR></m:properties></entry><entry><m:properties><d:NEW_DATE m:type="Edm.DateTime">2026-11-25T00:00:00</d:NEW_DATE><d:BC_2YEAR m:type="Edm.Double">3.58</d:BC_2YEAR><d:BC_10YEAR m:type="Edm.Double">4.12</d:BC_10YEAR><d:BC_30YEAR m:type="Edm.Double">4.72</d:BC_30YEAR></m:properties></entry></feed>';

    assert.deepStrictEqual(parseTreasuryXml(xml), [
      { date: '2026-11-24', '2Y': 3.6, '10Y': 4.1, '30Y': 4.7 },
      { date: '2026-11-25', '2Y': 3.58, '10Y': 4.12, '30Y': 4.72 },
    ]);
  });

  it('解析 FedWatch 页面里的会议行', () => {
    const html =
      '<div class=cbw-head><div class=cbw-row-date><span class=cbw-h>Meeting</span></div></div><div class=cbw-row><div class=cbw-row-date>December 9, 2026</div><div class=cbw-row-move><div class=cbw-move><span class=cbw-move-pct>95.8%</span><span class=cbw-move-step style=color:#d55e00>+24.0 bp</span></div></div><div class=cbw-row-level><span class=cbw-exp-big>4.11%</span><span class=cbw-level-split><span class="cbw-chip cbw-chip-up">higher 95.8%</span><span class="cbw-chip cbw-chip-flat">same 4.2%</span><span class="cbw-chip cbw-chip-down">lower 0.0%</span></span></div></div>';

    assert.deepStrictEqual(parseFedWatch(html), [
      {
        date: 'December 9, 2026',
        moveProbability: '95.8%',
        bpChange: '+24.0 bp',
        rateLevel: '4.11%',
        higher: '95.8',
        same: '4.2',
        lower: '0.0',
      },
    ]);
  });

  it('涨跌幅按百分比保留两位，基数为 0 时返回 0', () => {
    assert.strictEqual(computeDiff(110, 100), 10);
    assert.strictEqual(computeDiff(90, 100), -10);
    assert.strictEqual(computeDiff(100, 0), 0);
  });
});
