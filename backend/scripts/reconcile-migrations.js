#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbFile =
  process.env.DB_FILE || path.join(__dirname, '..', 'storage', 'dev.sqlite');
const migrationDir = path.join(__dirname, '..', 'database', 'migrations');

if (!fs.existsSync(dbFile)) {
  console.log(`database not found, skip migration reconciliation: ${dbFile}`);
  process.exit(0);
}

const currentMigrations = new Set(
  fs
    .readdirSync(migrationDir)
    .filter((name) => name.endsWith('.ts'))
    .sort(),
);

const db = new Database(dbFile);
try {
  const hasMigrationTable = db
    .prepare(
      "select name from sqlite_master where type='table' and name='knex_migrations'",
    )
    .get();
  if (!hasMigrationTable) {
    console.log('knex_migrations not found, skip migration reconciliation');
    process.exit(0);
  }

  const rows = db.prepare('select id, name from knex_migrations').all();
  const staleRows = rows.filter((row) => !currentMigrations.has(row.name));

  if (staleRows.length === 0) {
    console.log('migration history is up to date');
    process.exit(0);
  }

  const remove = db.prepare('delete from knex_migrations where id = ?');
  const removeStaleRows = db.transaction((items) => {
    for (const item of items) remove.run(item.id);
  });
  removeStaleRows(staleRows);

  console.log(`removed ${staleRows.length} stale migration record(s):`);
  for (const row of staleRows) {
    console.log(`  - ${row.name}`);
  }
} finally {
  db.close();
}
