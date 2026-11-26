import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

describe('GET /api/health', () => {
  it('returns ok without login', async () => {
    const res = await app.httpRequest().get('/api/health').expect(200);

    assert.deepStrictEqual(res.body, {
      success: true,
      data: { status: 'ok' },
    });
  });
});
