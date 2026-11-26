import assert from 'assert';
import originGuard from '../../../app/middleware/origin-guard';
import { ApiError } from '../../../app/lib/errors';

function createCtx(overrides: any = {}) {
  return {
    method: overrides.method || 'POST',
    hostname: overrides.hostname || 'app.example.com',
    path: overrides.path || '/api/test',
    app: { config: { originWhitelist: [] } },
    get(name: string) {
      return overrides[name.toLowerCase()] || '';
    },
  } as any;
}

describe('middleware/origin-guard', () => {
  it('allows same-origin JSON writes', async () => {
    const ctx = createCtx({
      'content-type': 'application/json',
      origin: 'http://app.example.com:8080',
    });
    let called = false;

    await originGuard()(ctx, async () => {
      called = true;
    });

    assert.strictEqual(called, true);
  });

  it('allows miniapp JSON writes without origin', async () => {
    const ctx = createCtx({
      'content-type': 'application/json',
      'x-client-type': 'miniapp',
      path: '/api/login.json',
    });
    let called = false;

    await originGuard()(ctx, async () => {
      called = true;
    });

    assert.strictEqual(called, true);
  });

  it('rejects miniapp writes outside api routes', async () => {
    const ctx = createCtx({
      'content-type': 'application/json',
      'x-client-type': 'miniapp',
      path: '/admin',
    });

    await assert.rejects(
      () => originGuard()(ctx, async () => undefined),
      (err: ApiError) => err.errorCode === 'DENY',
    );
  });

  it('rejects missing origin', async () => {
    const ctx = createCtx({ 'content-type': 'application/json' });

    await assert.rejects(
      () => originGuard()(ctx, async () => undefined),
      (err: ApiError) => err.errorCode === 'DENY',
    );
  });

  it('rejects cross-origin writes', async () => {
    const ctx = createCtx({
      'content-type': 'application/json',
      origin: 'http://evil.example.com',
    });

    await assert.rejects(
      () => originGuard()(ctx, async () => undefined),
      (err: ApiError) => err.errorCode === 'DENY',
    );
  });

  it('rejects non-JSON writes', async () => {
    const ctx = createCtx({
      'content-type': 'application/x-www-form-urlencoded',
      origin: 'http://app.example.com:8080',
    });

    await assert.rejects(
      () => originGuard()(ctx, async () => undefined),
      (err: ApiError) => err.errorCode === 'DENY',
    );
  });

  it('skips read-only requests', async () => {
    const ctx = createCtx({ method: 'GET' });
    let called = false;

    await originGuard()(ctx, async () => {
      called = true;
    });

    assert.strictEqual(called, true);
  });

  it('allows same-origin DELETE without a JSON body', async () => {
    const ctx = createCtx({
      method: 'DELETE',
      origin: 'http://app.example.com:8080',
    });
    let called = false;

    await originGuard()(ctx, async () => {
      called = true;
    });

    assert.strictEqual(called, true);
  });

  it('falls back to referer when origin is absent', async () => {
    const ctx = createCtx({
      'content-type': 'application/json',
      referer: 'http://app.example.com:8080/pages/example',
    });
    let called = false;

    await originGuard()(ctx, async () => {
      called = true;
    });

    assert.strictEqual(called, true);
  });
});
