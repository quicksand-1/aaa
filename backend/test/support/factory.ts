import { Application } from 'egg';
import type { BaseMockApplication } from 'egg-mock';
import { hashPassword } from '../../app/lib/password';
import {
  adminPermissions,
  emptyPermissions,
} from '../../app/lib/permissions';
import { sqlNow } from '../../app/lib/time';
import type { ModulePermissions } from '../../app/lib/types';

export const ADMIN_PASSWORD = 'Abc123!@#xyz';

export async function createUser(
  app: Application,
  options: {
    username?: string;
    name?: string;
    password?: string;
    isAdmin?: boolean;
    status?: boolean;
    role?: string;
    permissions?: ModulePermissions;
    needModifiedPwd?: boolean;
  } = {},
) {
  const {
    username = 'admin',
    name = '系统管理员',
    password = ADMIN_PASSWORD,
    isAdmin = true,
    status = true,
    role = isAdmin ? '管理员' : '查看员',
    permissions = isAdmin ? adminPermissions() : emptyPermissions(),
    needModifiedPwd = false,
  } = options;

  const now = sqlNow();
  const [id] = await app.knex('users').insert({
    username,
    name,
    password_hash: await hashPassword(password),
    role,
    // SQLite 没有 boolean 类型，存的是 0/1，读出来是数字；写入统一显式转换，读侧用 !!value
    is_admin: isAdmin ? 1 : 0,
    status: status ? 1 : 0,
    need_modified_pwd: needModifiedPwd ? 1 : 0,
    created_at: now,
    updated_at: now,
  });

  const rows = Object.entries(permissions).map(([module, value]) => ({
    user_id: id,
    module,
    can_read: value.read ? 1 : 0,
    can_edit: value.edit ? 1 : 0,
    can_download: value.download ? 1 : 0,
    created_at: now,
    updated_at: now,
  }));
  if (rows.length > 0) {
    await app.knex('user_permissions').insert(rows);
  }

  return { id: Number(id), username, password, permissions };
}

export function cookieOf(response: any): string {
  const raw = response.headers['set-cookie'] as string | string[];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((item) => item.split(';')[0]).join('; ');
}

export function post(app: BaseMockApplication<any, any>, url: string) {
  return app
    .httpRequest()
    .post(url)
    .set('Origin', 'http://127.0.0.1');
}

export function put(app: BaseMockApplication<any, any>, url: string) {
  return app
    .httpRequest()
    .put(url)
    .set('Origin', 'http://127.0.0.1');
}
