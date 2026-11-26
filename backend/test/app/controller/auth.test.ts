import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { resetDb } from '../../support/db';
import {
  ADMIN_PASSWORD,
  cookieOf,
  createUser,
  post,
} from '../../support/factory';

describe('auth api', () => {
  beforeEach(async () => {
    await resetDb(app);
  });

  it('logs in, returns current user and logs out', async () => {
    await createUser(app);

    const login = await post(app, '/api/login.json')
      .send({
        account: 'admin',
        password: ADMIN_PASSWORD,
      })
      .expect(200);

    assert.strictEqual(login.body.success, true);
    const cookie = cookieOf(login);

    const info = await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Cookie', cookie)
      .expect(200);

    assert.strictEqual(info.body.data.account, 'admin');
    assert.strictEqual(info.body.data.isAdmin, true);
    assert.strictEqual(info.body.data.authFunctionList.includes('admin'), true);

    await app
      .httpRequest()
      .get('/api/logout.json')
      .set('Cookie', cookie)
      .expect(200);

    await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Cookie', cookie)
      .expect(401);
  });

  it('supports bearer sessions for miniapp', async () => {
    await createUser(app);

    const login = await app
      .httpRequest()
      .post('/api/login.json')
      .set('X-Client-Type', 'miniapp')
      .send({
        account: 'admin',
        password: ADMIN_PASSWORD,
      })
      .expect(200);

    assert.strictEqual(login.body.success, true);
    assert.strictEqual(typeof login.body.data.sessionToken, 'string');
    assert.ok(login.body.data.sessionToken.length > 20);

    const authorization = `Bearer ${login.body.data.sessionToken}`;
    const info = await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Authorization', authorization)
      .expect(200);

    assert.strictEqual(info.body.data.account, 'admin');

    await app
      .httpRequest()
      .get('/api/logout.json')
      .set('Authorization', authorization)
      .expect(200);

    await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Authorization', authorization)
      .expect(401);
  });

  it('rejects wrong password and disabled account with generic message', async () => {
    await createUser(app);
    await createUser(app, {
      username: 'disabled',
      name: '停用账号',
      isAdmin: false,
      status: false,
    });

    const wrong = await post(app, '/api/login.json')
      .send({ account: 'admin', password: 'Wrong123!@#x' })
      .expect(401);
    assert.strictEqual(wrong.body.errorCode, 'LOGIN_FAILED');

    const disabled = await post(app, '/api/login.json')
      .send({
        account: 'disabled',
        password: ADMIN_PASSWORD,
      })
      .expect(401);
    assert.strictEqual(disabled.body.errorCode, 'LOGIN_FAILED');
  });

  it('locks account after five consecutive failures', async () => {
    await createUser(app);

    for (let i = 0; i < 4; i += 1) {
      await post(app, '/api/login.json')
        .send({ account: 'admin', password: 'Wrong123!@#x' })
        .expect(401);
    }

    const fifth = await post(app, '/api/login.json')
      .send({ account: 'admin', password: 'Wrong123!@#x' })
      .expect(429);
    assert.strictEqual(fifth.body.errorCode, 'LOGIN_LOCKED');

    const locked = await post(app, '/api/login.json')
      .send({ account: 'admin', password: ADMIN_PASSWORD })
      .expect(429);
    assert.strictEqual(locked.body.errorCode, 'LOGIN_LOCKED');
  });

  it('changes own password and keeps only current session', async () => {
    await createUser(app);

    const first = await post(app, '/api/login.json')
      .send({ account: 'admin', password: ADMIN_PASSWORD })
      .expect(200);
    const second = await post(app, '/api/login.json')
      .send({ account: 'admin', password: ADMIN_PASSWORD })
      .expect(200);

    const currentCookie = cookieOf(second);
    await post(app, '/api/system/user/changePwd.json')
      .set('Cookie', currentCookie)
      .send({
        oldPwd: ADMIN_PASSWORD,
        newPwd: 'NewPass123!@#',
        rePwd: 'NewPass123!@#',
      })
      .expect(200);

    await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Cookie', currentCookie)
      .expect(200);

    await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Cookie', cookieOf(first))
      .expect(401);

    await post(app, '/api/login.json')
      .send({ account: 'admin', password: 'NewPass123!@#' })
      .expect(200);
  });

  it('requires login for current user info', async () => {
    await app.httpRequest().get('/api/system/user/info.json').expect(401);
  });
});
