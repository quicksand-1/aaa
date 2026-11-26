#!/usr/bin/env bash
# 常规迭代更新：编译后端、执行数据库迁移、重启服务。
# 用法（在服务器上执行）：
#   bash /file/business-workbench/backend-restart.sh
#
# 环境变量（可覆盖）：
#   BACKEND_DIR   默认 /file/business-workbench/backend

set -euo pipefail

DEPLOY_BASE="${DEPLOY_BASE:-/file/business-workbench}"
BACKEND_DIR="${BACKEND_DIR:-$DEPLOY_BASE/backend}"

cd "$BACKEND_DIR"

echo "[1/3] 编译 TypeScript"
npm run tsc

echo "[2/3] 执行数据库迁移"
umask 077
npm run migrate

echo "[3/3] 重启后端服务"
systemctl restart business-workbench

echo "更新完成：business-workbench"
