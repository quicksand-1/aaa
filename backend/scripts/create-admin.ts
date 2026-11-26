import path from 'path';
import 'dotenv/config';
import knex from 'knex';
import {
  hashPassword,
  isPasswordValid,
  PASSWORD_MESSAGE,
} from '../app/lib/password';
import { adminPermissions, PERMISSION_MODULES } from '../app/lib/permissions';
import { sqlNow } from '../app/lib/time';

async function main() {
  const username = process.argv[2];
  const name = process.argv[3] || '系统管理员';
  const password = process.env.ADMIN_PASSWORD || '';

  if (!username || !/^[A-Za-z0-9_]{3,30}$/.test(username)) {
    throw new Error(
      '用法：ADMIN_PASSWORD=... npm run create-admin -- <username> [name]',
    );
  }
  if (!isPasswordValid(password)) {
    throw new Error(PASSWORD_MESSAGE);
  }

  const db = knex({
    client: 'better-sqlite3',
    connection: {
      filename:
        process.env.DB_FILE ||
        path.join(__dirname, '..', 'storage', 'dev.sqlite'),
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 1,
      afterCreate: (conn: any, done: any) => {
        conn.pragma('foreign_keys = ON');
        conn.pragma('busy_timeout = 5000');
        done(null, conn);
      },
    },
  });

  try {
    if (!(await db.schema.hasTable('users'))) {
      throw new Error('数据库尚未初始化，请先执行 npm run migrate');
    }

    const existing = await db('users').where({ username }).first('id');
    const passwordHash = await hashPassword(password);
    let userId: number;

    if (existing) {
      userId = Number(existing.id);
      await db('users').where({ id: userId }).update({
        name,
        password_hash: passwordHash,
        role: '管理员',
        is_admin: 1,
        status: 1,
        need_modified_pwd: 1,
        failed_attempts: 0,
        locked_until: null,
        password_changed_at: sqlNow(),
        updated_at: sqlNow(),
      });
      await db('sessions').where({ user_id: userId }).del();
      await db('user_permissions').where({ user_id: userId }).del();
    } else {
      const now = sqlNow();
      const [inserted] = await db('users').insert({
        username,
        name,
        password_hash: passwordHash,
        role: '管理员',
        is_admin: 1,
        status: 1,
        need_modified_pwd: 1,
        created_at: now,
        updated_at: now,
      });
      userId = Number(inserted);
    }

    const permissions = adminPermissions();
    const permissionNow = sqlNow();
    const permissionRows = PERMISSION_MODULES.map((module) => ({
      user_id: userId,
      module,
      can_read: permissions[module].read ? 1 : 0,
      can_edit: permissions[module].edit ? 1 : 0,
      can_download: permissions[module].download ? 1 : 0,
      created_at: permissionNow,
      updated_at: permissionNow,
    }));
    if (permissionRows.length > 0) {
      await db('user_permissions').insert(permissionRows);
    }

    console.log(`${username} 已创建/重置为管理员，首次登录必须修改密码。`);
  } finally {
    await db.destroy();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
