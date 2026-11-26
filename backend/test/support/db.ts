import { Application } from 'egg';

const TABLES = [
  'market_snapshots',
  'user_identities',
  'mobile_login_tickets',
  'sessions',
  'user_permissions',
  'users',
];

export async function resetDb(app: Application): Promise<void> {
  // 按外键依赖顺序删除；SQLite 没有 TRUNCATE
  for (const table of TABLES) {
    await app.knex(table).del();
  }
}
