import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import type { Knex } from 'knex';

// SQLite 每个连接都必须显式开启外键；默认关闭，否则级联删除会静默失效
function applyPragmas(conn: any, done: (err: Error | null, conn?: any) => void) {
  conn.pragma('journal_mode = WAL');
  conn.pragma('foreign_keys = ON');
  conn.pragma('busy_timeout = 5000');
  conn.pragma('synchronous = NORMAL');
  done(null, conn);
}

// better-sqlite3 不会自动创建目录，首次迁移前必须自己建
function resolveFile(override?: string): string {
  const file = override || path.join(__dirname, 'storage', 'dev.sqlite');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return file;
}

const base: Knex.Config = {
  client: 'better-sqlite3',
  connection: { filename: resolveFile(process.env.DB_FILE) },
  useNullAsDefault: true,
  pool: { min: 1, max: 1, afterCreate: applyPragmas },
  migrations: {
    directory: './database/migrations',
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
};

const config: Record<string, Knex.Config> = {
  development: base,
  production: base,
  unittest: {
    ...base,
    connection: {
      filename: resolveFile(
        process.env.TEST_DB_FILE || path.join(__dirname, 'storage', 'test.sqlite'),
      ),
    },
  },
};

export default config;
