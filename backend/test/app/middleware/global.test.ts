import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

describe('global middleware', () => {
  it('rejects cross-origin writes with the frontend error envelope', async () => {
    const res = await app
      .httpRequest()
      .post('/api/health')
      .set('Origin', 'http://evil.example.com')
      .send({ a: 1 })
      .expect(403);

    assert.deepStrictEqual(res.body, {
      success: false,
      errorCode: 'DENY',
      errorMessage: '非法请求来源',
    });
    assert.match(res.headers['content-type'], /application\/json/);
  });

  it('rejects writes without origin', async () => {
    const res = await app.httpRequest().post('/api/health').send({}).expect(403);

    assert.strictEqual(res.body.errorCode, 'DENY');
  });

  it('lets same-origin writes through the origin guard', async () => {
    const res = await app
      .httpRequest()
      .post('/api/health')
      .set('Origin', 'http://127.0.0.1')
      .send({});

    // /api/health 只有 GET，404 说明请求已经通过 Origin 校验
    assert.strictEqual(res.status, 404);
  });
});
