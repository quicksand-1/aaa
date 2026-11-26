import fs from 'fs';
import path from 'path';
import knex, { Knex } from 'knex';
import { Application } from 'egg';

export function createDb(app: Application): Knex {
  const { file } = app.config.database;
  const busyTimeout = app.config.database.busyTimeout ?? 5000;
  fs.mkdirSync(path.dirname(file), { recursive: true });

  return knex({
    client: 'better-sqlite3',
    connection: { filename: file },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 1,
      afterCreate: (conn: any, done: (err: Error | null, conn?: any) => void) => {
        conn.pragma('journal_mode = WAL');
        // SQLite 默认关闭外键，不开则 CASCADE / SET NULL 都静默失效
        conn.pragma('foreign_keys = ON');
        conn.pragma(`busy_timeout = ${busyTimeout}`);
        conn.pragma('synchronous = NORMAL');
        done(null, conn);
      },
    },
  });
}
