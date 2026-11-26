import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

const TABLES = [
  'users',
  'user_permissions',
  'sessions',
  'mobile_login_tickets',
  'user_identities',
];

describe('app/lib/db', () => {
  it('attaches knex to the application', () => {
    assert.ok(app.knex);
    assert.strictEqual(app.knex.client.config.client, 'better-sqlite3');
  });

  it('enables the sqlite pragmas the app depends on', async () => {
    const foreignKeys: any[] = await app.knex.raw('pragma foreign_keys');
    assert.strictEqual(foreignKeys[0].foreign_keys, 1);

    const journal: any[] = await app.knex.raw('pragma journal_mode');
    assert.strictEqual(journal[0].journal_mode, 'wal');

    // busy_timeout 是连接级设置，只有 afterCreate 会写入，默认是 0
    const busyTimeout: any[] = await app.knex.raw('pragma busy_timeout');
    assert.strictEqual(busyTimeout[0].timeout, 5000);
  });

  it('has every table created by the migrations', async () => {
    const rows: any[] = await app.knex.raw(
      "select name from sqlite_master where type='table'",
    );
    const names = rows.map((row) => row.name);
    for (const table of TABLES) {
      assert.ok(names.includes(table), `missing table ${table}`);
    }
  });

  it('enforces foreign keys', async () => {
    await assert.rejects(
      () =>
        app.knex('user_permissions').insert({
          user_id: 999999,
          module: 'demo',
          can_read: 1,
          can_edit: 0,
          can_download: 0,
          created_at: '2026-01-01 00:00:00',
          updated_at: '2026-01-01 00:00:00',
        }),
      /FOREIGN KEY/,
    );
  });
});
