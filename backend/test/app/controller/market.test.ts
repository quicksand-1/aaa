import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { resetDb } from '../../support/db';

const GOLD_PAYLOAD = {
  marketData: [
    {
      label: 'XAU/USD',
      value: '3564.23',
      diff: 0.42,
      prefix: '$',
      category: '黄金',
    },
  ],
};

describe('GET /api/market/overview.json', () => {
  beforeEach(async () => {
    await resetDb(app);
    await app.knex('market_snapshots').insert({
      source: 'gold',
      payload: JSON.stringify(GOLD_PAYLOAD),
      fetched_at: '2026-11-26T08:35:12.000Z',
    });
  });

  it('未登录也能读取整页行情', async () => {
    const res = await app
      .httpRequest()
      .get('/api/market/overview.json')
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.deepStrictEqual(res.body.data.marketData, GOLD_PAYLOAD.marketData);
    assert.strictEqual(res.body.data.updatedAt, '2026-11-26T08:35:12.000Z');
  });

  it('没有快照时返回空数组和 null 时间', async () => {
    await resetDb(app);

    const res = await app
      .httpRequest()
      .get('/api/market/overview.json')
      .expect(200);

    assert.deepStrictEqual(res.body.data, {
      updatedAt: null,
      marketData: [],
    });
  });
});
