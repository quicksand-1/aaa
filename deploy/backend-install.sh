#!/usr/bin/env bash
# 在服务器上安装后端依赖并编译（CentOS 7 / glibc 2.17 专用）
#
# 背景：
#   better-sqlite3 自带 linux-x64 预编译包依赖 GLIBC 2.34，CentOS 7 只有 2.17，
#   无法加载，必须在服务器上源码编译出 glibc 2.17 兼容的版本。
#   编译需要：Python 3.8+（node-gyp 的 gyp 用了 walrus 语法）、支持 C++20 的 g++。
#
# 前置（一次性，已在本机执行过）：
#   yum install -y python3 devtoolset-11-gcc-c++
#   源码编译 Python 3.11 到 /usr/local/python311
#
# 用法（在服务器上执行）：
#   bash /file/business-workbench/backend-install.sh
#
# 环境变量（可覆盖）：
#   BACKEND_DIR   默认 /file/business-workbench/backend
#   DEVTOOLSET    默认 /opt/rh/devtoolset-11/root/usr/bin
#   PYTHON_BIN    默认 /usr/local/python311/bin/python3.11

set -euo pipefail

DEPLOY_BASE="${DEPLOY_BASE:-/file/business-workbench}"
BACKEND_DIR="${BACKEND_DIR:-$DEPLOY_BASE/backend}"
DEVTOOLSET="${DEVTOOLSET:-/opt/rh/devtoolset-11/root/usr/bin}"
PYTHON_BIN="${PYTHON_BIN:-/usr/local/python311/bin/python3.11}"

[[ -x "$DEVTOOLSET/g++" ]] || { echo "缺少 $DEVTOOLSET/g++，请先安装 devtoolset-11-gcc-c++"; exit 1; }
[[ -x "$PYTHON_BIN" ]] || { echo "缺少 $PYTHON_BIN，请先编译安装 Python 3.11"; exit 1; }

export PATH="$DEVTOOLSET:$PATH"
export CC="$DEVTOOLSET/gcc"
export CXX="$DEVTOOLSET/g++"
export npm_config_python="$PYTHON_BIN"
export npm_config_registry="https://registry.npmmirror.com"
export npm_config_replace_registry_host="always"

cd "$BACKEND_DIR"

echo "==> 安装依赖（跳过脚本，避免用系统 Python 3.6 触发 node-gyp）"
npm ci --ignore-scripts

echo "==> 打补丁：better-sqlite3 静态链接 libstdc++"
node - <<'NODE'
const fs = require('fs');
const file = 'node_modules/better-sqlite3/binding.gyp';
const needle = "'ldflags': ['-flto'],";
let src = fs.readFileSync(file, 'utf8');
if (!src.includes(needle)) {
  throw new Error('binding.gyp 结构与预期不符，请人工确认后再编译');
}
src = src.replace(needle, "'ldflags': ['-flto', '-static-libstdc++'],");
fs.writeFileSync(file, src);
NODE

echo "==> 源码编译 better-sqlite3（强制编译，不用自带预编译包）"
cd node_modules/better-sqlite3
GYP_BIN="$(npm root -g)/npm/node_modules/node-gyp/bin/node-gyp.js"
# 先 clean，避免上次编译被中断后留下空 stamp，导致 make 误判“已是最新”而不产出 .node
node "$GYP_BIN" clean
node "$GYP_BIN" configure
make -C build -j"$(nproc)" BUILDTYPE=Release
cd "$BACKEND_DIR"

echo "==> 删除不兼容的预编译包"
rm -f node_modules/better-sqlite3/prebuilds/linux-x64.node

echo "==> 验证 better-sqlite3"
node -e 'const D=require("better-sqlite3");const db=new D(":memory:");db.exec("create table t(a)");db.prepare("insert into t values (?)").run(1);if(db.prepare("select count(*) c from t").get().c!==1)throw new Error("selftest failed");db.close();console.log("better-sqlite3 OK")'

echo "==> 编译 TypeScript"
npm run tsc

echo "==> 完成"
