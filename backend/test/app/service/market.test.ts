import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { getOverview, refreshMarket } from '../../../app/lib/market';
import { resetDb } from '../../support/db';

describe('lib/market', () => {
  beforeEach(async () => {
    await resetDb(app);
  });

  it('逐源写入快照并组装成整页数据', async () => {
    const sources = [
      {
        key: 'gold' as const,
        run: async () => ({
          marketData: [
            {
              label: 'XAU/USD',
              value: '3564.23',
              diff: 0.42,
              prefix: '$',
              category: '黄金',
            },
          ],
        }),
      },
      {
        key: 'fearGreed' as const,
        run: async () => ({
          fearGreed: { value: 11, classification: 'Extreme Fear' },
        }),
      },
    ];

    await refreshMarket({ knex: app.knex, logger: app.logger, sources });

    const data = await getOverview(app.knex);
    assert.deepStrictEqual(data.marketData, [
      {
        label: 'XAU/USD',
        value: '3564.23',
        diff: 0.42,
        prefix: '$',
        category: '黄金',
      },
    ]);
    assert.deepStrictEqual(data.fearGreed, {
      value: 11,
      classification: 'Extreme Fear',
    });
    assert.ok(data.updatedAt);
  });

  it('单个源失败时保留上一次成功值并记录错误', async () => {
    const okSource = {
      key: 'crypto' as const,
      run: async () => ({
        marketData: [
          {
            label: 'BTC',
            value: '60701.17',
            diff: 2.43,
            prefix: '$',
            category: '加密货币',
          },
        ],
      }),
    };
    await refreshMarket({ knex: app.knex, logger: app.logger, sources: [okSource] });

    await refreshMarket({
      knex: app.knex,
      logger: app.logger,
      sources: [
        {
          key: 'crypto' as const,
          run: async () => {
            throw new Error('upstream down');
          },
        },
      ],
    });

    const row = await app.knex('market_snapshots')
      .where({ source: 'crypto' })
      .first();
    assert.ok(row.payload, '失败时不能清掉上一次的 payload');
    assert.strictEqual(row.error, 'upstream down');

    const data = await getOverview(app.knex);
    assert.strictEqual(data.marketData.length, 1);
    assert.strictEqual(data.marketData[0].label, 'BTC');

    await refreshMarket({ knex: app.knex, logger: app.logger, sources: [okSource] });
    const recovered = await app.knex('market_snapshots')
      .where({ source: 'crypto' })
      .first();
    assert.strictEqual(recovered.error, null);
    assert.strictEqual(recovered.failed_at, null);
  });

  it('首次失败不产生可用数据', async () => {
    await refreshMarket({
      knex: app.knex,
      logger: app.logger,
      sources: [
        {
          key: 'sina' as const,
          run: async () => {
            throw new Error('blocked');
          },
        },
      ],
    });

    const data = await getOverview(app.knex);
    assert.deepStrictEqual(data.marketData, []);
    assert.strictEqual(data.updatedAt, null);
  });
});
