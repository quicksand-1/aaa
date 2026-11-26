#!/usr/bin/env node
'use strict';

/**
 * 删除 `npm run tsc` 在源码旁边生成的 .js。
 * Egg 在 ts-node 环境下会同时加载 *.js 和 *.ts，同一文件会报
 * "can't overwrite property"；构建产物留在源码目录时必须先清掉。
 * 只删除存在同名 .ts 的 .js，不会误删 scripts/backup-sqlite.js 这类纯 JS。
 */

const fs = require('fs');
const path = require('path');

const ROOTS = ['app', 'config', 'test', 'database', 'scripts'];

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walk(full, out);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts')) {
      out.push(full);
    }
  }
}

const files = [];
for (const root of ROOTS) walk(path.resolve(__dirname, '..', root), files);

let removed = 0;
for (const file of files) {
  const source = file.replace(/\.d\.ts$/, '.ts').replace(/\.js$/, '.ts');
  if (!fs.existsSync(source)) continue;
  fs.rmSync(file, { force: true });
  removed += 1;
}

console.log(`removed ${removed} compiled file(s) next to TypeScript sources`);
