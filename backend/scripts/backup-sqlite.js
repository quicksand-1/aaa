#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbFile =
  process.env.DB_FILE || path.join(__dirname, '..', 'storage', 'dev.sqlite');
const backupDir =
  process.env.BACKUP_DIR || path.join(__dirname, '..', 'storage', 'backups');
const retentionDays = Number(process.env.RETENTION_DAYS || 30);

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

async function main() {
  if (!fs.existsSync(dbFile)) {
    throw new Error(`数据库文件不存在：${dbFile}`);
  }
  fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });

  const target = path.join(backupDir, `app_${stamp()}.sqlite`);

  // 必须用 SQLite 的在线备份 API；WAL 模式下直接 cp 活文件可能拿到不一致快照
  const db = new Database(dbFile, { readonly: true, fileMustExist: true });
  try {
    await db.backup(target);
  } finally {
    db.close();
  }
  fs.chmodSync(target, 0o600);

  const check = new Database(target);
  // 备份文件切回 DELETE 模式：恢复时只需拷贝单个 .sqlite，不遗留 -wal/-shm
  check.pragma('journal_mode = DELETE');
  const result = check.pragma('integrity_check', { simple: true });
  check.close();
  if (result !== 'ok') {
    fs.rmSync(target, { force: true });
    throw new Error(`备份完整性校验失败：${result}`);
  }

  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(backupDir)) {
    if (!/^app_\d{8}_\d{6}\.sqlite$/.test(name)) continue;
    const full = path.join(backupDir, name);
    if (fs.statSync(full).mtimeMs < cutoff) fs.rmSync(full, { force: true });
  }

  console.log(`backup created: ${target}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
