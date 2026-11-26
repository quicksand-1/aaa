import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { resetDb } from '../../support/db';
import {
  ADMIN_PASSWORD,
  cookieOf,
  createUser,
  post,
  put,
} from '../../support/factory';

async function loginAsAdmin() {
  const response = await post(app, '/api/login.json')
    .send({ account: 'admin', password: ADMIN_PASSWORD })
    .expect(200);
  return cookieOf(response);
}

describe('users api', () => {
  beforeEach(async () => {
    await resetDb(app);
  });

  it('lists users without password hash', async () => {
    await createUser(app);
    const cookie = await loginAsAdmin();

    const res = await app
      .httpRequest()
      .get('/api/users')
      .set('Cookie', cookie)
      .expect(200);

    assert.strictEqual(Array.isArray(res.body.data.datas), true);
    assert.strictEqual(res.body.data.datas[0].username, 'admin');
    assert.strictEqual('password_hash' in res.body.data.datas[0], false);
    assert.deepStrictEqual(res.body.data.datas[0].permissions, {});
  });

  it('paginates the list for ProTableAsync', async () => {
    await createUser(app);
    await createUser(app, {
      username: 'user01',
      name: '用户一',
      isAdmin: false,
      role: '查看员',
    });
    await createUser(app, {
      username: 'user02',
      name: '用户二',
      isAdmin: false,
      role: '查看员',
    });
    const cookie = await loginAsAdmin();

    const res = await app
      .httpRequest()
      .get('/api/users?currPageNo=2&pageSize=2')
      .set('Cookie', cookie)
      .expect(200);

    assert.strictEqual(res.body.data.total, 3);
    assert.strictEqual(res.body.data.datas.length, 1);
    assert.strictEqual(res.body.data.datas[0].username, 'user02');
  });

  it('creates a viewer and rejects duplicates and invalid accounts', async () => {
    await createUser(app);
    const cookie = await loginAsAdmin();

    const created = await post(app, '/api/users')
      .set('Cookie', cookie)
      .send({
        username: 'viewer01',
        name: '查看员',
        password: 'Viewer123!@#',
        role: '查看员',
        isAdmin: false,
      })
      .expect(200);

    assert.strictEqual(created.body.data.username, 'viewer01');
    assert.strictEqual(created.body.data.needModifiedPwd, true);
    assert.deepStrictEqual(created.body.data.permissions, {});

    await post(app, '/api/users')
      .set('Cookie', cookie)
      .send({
        username: 'viewer01',
        name: '重复账号',
        password: 'Viewer123!@#',
        role: '查看员',
      })
      .expect(409);

    await post(app, '/api/users')
      .set('Cookie', cookie)
      .send({
        username: '非法 账号',
        name: '非法',
        password: 'Viewer123!@#',
        role: '查看员',
      })
      .expect(400);
  });

  it('updates a non-admin profile without changing its role', async () => {
    await createUser(app);
    const cookie = await loginAsAdmin();
    const custom = await createUser(app, {
      username: 'custom',
      name: '自定义',
      isAdmin: false,
      role: '自定义',
    });

    await put(app, `/api/users/${custom.id}`)
      .set('Cookie', cookie)
      .send({ name: '自定义改名' })
      .expect(200);

    const list = await app
      .httpRequest()
      .get('/api/users')
      .set('Cookie', cookie)
      .expect(200);
    const updated = list.body.data.datas.find(
      (item: any) => item.username === 'custom',
    );

    assert.strictEqual(updated.name, '自定义改名');
    assert.strictEqual(updated.role, '自定义');
  });

  it('forbids non-admin users from account management', async () => {
    await createUser(app, {
      username: 'viewer',
      isAdmin: false,
      role: '查看员',
    });
    const response = await post(app, '/api/login.json')
      .send({ account: 'viewer', password: ADMIN_PASSWORD })
      .expect(200);

    await app
      .httpRequest()
      .get('/api/users')
      .set('Cookie', cookieOf(response))
      .expect(403);
  });

  it('protects self deletion and the last administrator', async () => {
    const admin = await createUser(app);
    const cookie = await loginAsAdmin();

    await app
      .httpRequest()
      .delete(`/api/users/${admin.id}`)
      .set('Origin', 'http://127.0.0.1')
      .set('Cookie', cookie)
      .expect(409);

    await put(app, `/api/users/${admin.id}/status`)
      .set('Cookie', cookie)
      .send({ status: 0 })
      .expect(409);

    await put(app, `/api/users/${admin.id}`)
      .set('Cookie', cookie)
      .send({ isAdmin: false })
      .expect(409);
  });

  it('resets password and invalidates old sessions', async () => {
    await createUser(app);
    await createUser(app, {
      username: 'viewer',
      isAdmin: false,
      role: '查看员',
    });
    const adminCookie = await loginAsAdmin();
    const viewerLogin = await post(app, '/api/login.json')
      .send({ account: 'viewer', password: ADMIN_PASSWORD })
      .expect(200);
    const viewerCookie = cookieOf(viewerLogin);

    const list = await app
      .httpRequest()
      .get('/api/users')
      .set('Cookie', adminCookie)
      .expect(200);
    const viewer = list.body.data.datas.find(
      (item: any) => item.username === 'viewer',
    );

    await put(app, `/api/users/${viewer.id}/password`)
      .set('Cookie', adminCookie)
      .send({ password: 'ResetPass123!@#' })
      .expect(200);

    await app
      .httpRequest()
      .get('/api/system/user/info.json')
      .set('Cookie', viewerCookie)
      .expect(401);

    const login = await post(app, '/api/login.json')
      .send({
        account: 'viewer',
        password: 'ResetPass123!@#',
      })
      .expect(200);
    assert.strictEqual(login.body.data.needModifiedPwd, true);
  });
});
