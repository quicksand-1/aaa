#!/usr/bin/env bash
# 构建前端并上传到服务器
# 用法：
#   SERVER_HOST=example.com ./deploy/frontend-deploy.sh
#   SKIP_BUILD=1 SERVER_HOST=example.com ./deploy/frontend-deploy.sh

set -euo pipefail

: "${SERVER_HOST:?请设置 SERVER_HOST}"
SERVER_PORT="${SERVER_PORT:-22}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_BASE="${DEPLOY_BASE:-/file/business-workbench}"
HTTP_PORT="${HTTP_PORT:-80}"
REMOTE_BASE="$DEPLOY_BASE/frontend"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT/frontend"

cd "$FRONTEND_DIR"

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  if [[ ! -x node_modules/.bin/max ]]; then
    echo "缺少 frontend/node_modules，请先执行：cd frontend && npm ci" >&2
    exit 1
  fi
  echo "==> 构建前端"
  npm run build
fi

if [[ ! -f dist/index.html ]]; then
  echo "dist/index.html 不存在，请先构建" >&2
  exit 1
fi

echo "==> 上传 dist 到 ${SERVER_HOST}:${REMOTE_BASE}"
rsync -avz --delete \
  -e "ssh -p $SERVER_PORT" \
  "$FRONTEND_DIR/dist/" \
  "${DEPLOY_USER}@${SERVER_HOST}:${REMOTE_BASE}/"

ssh -p "$SERVER_PORT" "${DEPLOY_USER}@${SERVER_HOST}" \
  "chmod -R a+rX ${REMOTE_BASE}"

echo "上传完成：http://${SERVER_HOST}:${HTTP_PORT}/"
