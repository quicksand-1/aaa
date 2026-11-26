#!/usr/bin/env bash
# 上传后端代码到服务器
# 用法：
#   SERVER_HOST=example.com DEPLOY_BASE=/file/business-workbench ./deploy/backend-deploy.sh
#
# 说明：
#   - 只传输源码，不传输 node_modules / storage / logs / run / .env / 编译产物
#   - 服务器上的 .env 不会被本地覆盖或删除

set -euo pipefail

: "${SERVER_HOST:?请设置 SERVER_HOST}"
SERVER_PORT="${SERVER_PORT:-22}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_BASE="${DEPLOY_BASE:-/file/business-workbench}"
REMOTE_BASE="$DEPLOY_BASE/backend"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

EXCLUDES=(
  --exclude node_modules
  --exclude storage
  --exclude logs
  --exclude run
  --exclude '.env'
  --exclude '.env.*'
  --exclude '*.sqlite*'
  --exclude '*.js.map'
  --exclude 'app/**/*.js'
  --exclude 'config/**/*.js'
  --exclude 'test/**/*.js'
  --exclude 'database/**/*.js'
  --exclude 'scripts/**/*.js'
  --exclude 'app.js'
  --exclude 'knexfile.js'
  --exclude 'typings/app'
  --exclude 'typings/config'
)

rsync -avz --delete \
  "${EXCLUDES[@]}" \
  -e "ssh -p $SERVER_PORT" \
  "$ROOT/backend/" \
  "${DEPLOY_USER}@${SERVER_HOST}:${REMOTE_BASE}/"

rsync -avz \
  -e "ssh -p $SERVER_PORT" \
  "$ROOT/deploy/backend-install.sh" \
  "$ROOT/deploy/backend-restart.sh" \
  "${DEPLOY_USER}@${SERVER_HOST}:${DEPLOY_BASE}/"

ssh -p "$SERVER_PORT" "${DEPLOY_USER}@${SERVER_HOST}" \
  "chmod +x ${DEPLOY_BASE}/backend-install.sh ${DEPLOY_BASE}/backend-restart.sh"

echo "上传完成：${REMOTE_BASE}"
echo "首次安装：bash ${DEPLOY_BASE}/backend-install.sh"
echo "常规更新：bash ${DEPLOY_BASE}/backend-restart.sh"
