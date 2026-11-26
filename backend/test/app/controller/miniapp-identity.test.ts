import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { resetDb } from '../../support/db';
import {
  ADMIN_PASSWORD,
  createUser,
  post,
} from '../../support/factory';

function mockWechatIdentity(openid: string, unionid = '') {
  globalThis.fetch = (async () =>
    ({
      ok: true,
      json: async () => ({ openid, unionid }),
    }) as Response) as typeof fetch;
}

async function passwordLogin(account = 'admin') {
  const response = await post(app, '/api/login.json')
    .set('X-Client-Type', 'miniapp')
    .send({ account, password: ADMIN_PASSWORD })
    .expect(200);
  return String(response.body.data.sessionToken);
}

describe('miniapp identity api', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    await resetDb(app);
    app.config.wechatMiniapp = {
      appId: 'wx-test-app',
      appSecret: 'test-secret',
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('binds after password login, logs in without a password and unbinds', async () => {
    await createUser(app);
    mockWechatIdentity('openid-1', 'unionid-1');

    const unknown = await post(app, '/api/miniapp/login.json')
      .set('X-Client-Type', 'miniapp')
      .send({ code: 'code-before-bind' })
      .expect(200);
    assert.deepStrictEqual(unknown.body.data, { bound: false });

    const sessionToken = await passwordLogin();
    const authorization = `Bearer ${sessionToken}`;
    await post(app, '/api/miniapp/bind.json')
      .set('X-Client-Type', 'miniapp')
      .set('Authorization', authorization)
      .send({ code: 'code-for-bind' })
      .expect(200);

    const binding = await app
      .httpRequest()
      .get('/api/miniapp/binding.json')
      .set('Authorization', authorization)
      .expect(200);
    assert.deepStrictEqual(binding.body.data, { bound: true });

    const autoLogin = await post(app, '/api/miniapp/login.json')
      .set('X-Client-Type', 'miniapp')
      .send({ code: 'code-for-auto-login' })
      .expect(200);
    assert.strictEqual(autoLogin.body.data.bound, true);
    assert.strictEqual(autoLogin.body.data.needModifiedPwd, false);
    assert.strictEqual(typeof autoLogin.body.data.sessionToken, 'string');

    const info = await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Authorization', `Bearer ${autoLogin.body.data.sessionToken}`)
      .expect(200);
    assert.strictEqual(info.body.data.account, 'admin');

    await app
      .httpRequest()
      .delete('/api/miniapp/binding.json')
      .set('X-Client-Type', 'miniapp')
      .set('Authorization', authorization)
      .expect(200);
    const identities = await app.knex('user_identities').select('id');
    assert.strictEqual(identities.length, 0);

    const afterUnbind = await post(app, '/api/miniapp/login.json')
      .set('X-Client-Type', 'miniapp')
      .send({ code: 'code-after-unbind' })
      .expect(200);
    assert.deepStrictEqual(afterUnbind.body.data, { bound: false });
  });

  it('rejects binding an identity owned by another account', async () => {
    await createUser(app);
    const other = await createUser(app, {
      username: 'other',
      name: '其他用户',
      isAdmin: false,
    });

    mockWechatIdentity('openid-shared');
    const adminToken = await passwordLogin();
    await post(app, '/api/miniapp/bind.json')
      .set('X-Client-Type', 'miniapp')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'admin-code' })
      .expect(200);

    const otherToken = await passwordLogin(other.username);
    const conflict = await post(app, '/api/miniapp/bind.json')
      .set('X-Client-Type', 'miniapp')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ code: 'other-code' })
      .expect(409);
    assert.strictEqual(conflict.body.errorCode, 'MINIAPP_IDENTITY_CONFLICT');
  });

  it('requires a session for binding and unbinding', async () => {
    await post(app, '/api/miniapp/bind.json')
      .set('X-Client-Type', 'miniapp')
      .send({ code: 'code' })
      .expect(401);
    await app
      .httpRequest()
      .delete('/api/miniapp/binding.json')
      .set('X-Client-Type', 'miniapp')
      .expect(401);
  });
});
