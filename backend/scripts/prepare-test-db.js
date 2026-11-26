#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file =
  process.env.TEST_DB_FILE ||
  path.join(__dirname, '..', 'storage', 'test.sqlite');

for (const suffix of ['', '-wal', '-shm']) {
  fs.rmSync(`${file}${suffix}`, { force: true });
}

console.log(`test database cleared: ${file}`);
