#!/usr/bin/env bash
# 本地开发一键启动：按选择启动后端 (7001)、Web 前端 (8001) 和小程序编译监听
# 用法：
#   ./dev.sh                 # 选择要启动的应用，Ctrl+C 同时停止已启动的应用
#   BACKEND_PORT=7002 FRONTEND_PORT=8002 ./dev.sh   # 自定义 Web 端口
# 小程序启动后，请在微信开发者工具中打开 miniapp 目录。
# 未安装依赖的应用会在启动前自动执行 npm install。

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-7001}"
FRONTEND_PORT="${FRONTEND_PORT:-8001}"

# ---------- 选择应用 ----------
BACKEND_SELECTED=0
FRONTEND_SELECTED=0
MINIAPP_SELECTED=0

toggle_service() {
  case "$1" in
    1) BACKEND_SELECTED=$((1 - BACKEND_SELECTED)) ;;
    2) FRONTEND_SELECTED=$((1 - FRONTEND_SELECTED)) ;;
    3) MINIAPP_SELECTED=$((1 - MINIAPP_SELECTED)) ;;
  esac
}

while true; do
  echo
  echo "请选择要启动的应用（可多选，输入编号切换，直接回车确认）："
  if [ "$BACKEND_SELECTED" -eq 1 ]; then marker="✓"; else marker=" "; fi
  echo "  [$marker] 1) 后端      http://127.0.0.1:$BACKEND_PORT"
  if [ "$FRONTEND_SELECTED" -eq 1 ]; then marker="✓"; else marker=" "; fi
  echo "  [$marker] 2) Web 前端  http://localhost:$FRONTEND_PORT"
  if [ "$MINIAPP_SELECTED" -eq 1 ]; then marker="✓"; else marker=" "; fi
  echo "  [$marker] 3) 微信小程序编译监听"
  echo "      a) 全选    q) 退出"
  choices=""
  if ! read -r -p "> " choices; then
    echo
    echo "未完成选择，已退出。"
    exit 1
  fi

  if [ -z "$choices" ]; then
    break
  fi

  case "$choices" in
    [aA])
      BACKEND_SELECTED=1
      FRONTEND_SELECTED=1
      MINIAPP_SELECTED=1
      ;;
    [qQ])
      echo "已取消启动。"
      exit 0
      ;;
    *)
      valid=1
      normalized_choices="${choices//,/}"
      normalized_choices="${normalized_choices// /}"
      for ((index = 0; index < ${#normalized_choices}; index++)); do
        choice="${normalized_choices:index:1}"
        case "$choice" in
          1|2|3) toggle_service "$choice" ;;
          *) valid=0 ;;
        esac
      done
      if [ "$valid" -eq 0 ]; then
        echo "请输入 1、2、3，可用空格或逗号分隔，也可以输入 a 全选。"
      fi
      ;;
  esac
done

if [ "$BACKEND_SELECTED" -eq 0 ] && [ "$FRONTEND_SELECTED" -eq 0 ] && [ "$MINIAPP_SELECTED" -eq 0 ]; then
  echo "未选择任何应用，已退出。"
  exit 0
fi

# ---------- 依赖检查 ----------
install_dependencies() {
  local name="$1"
  local directory="$2"

  if [ -d "$ROOT/$directory/node_modules" ]; then
    return
  fi

  echo "$name 依赖未安装，正在执行 npm install ..."
  if ! (cd "$ROOT/$directory" && npm install); then
    echo "$name 依赖安装失败，已退出。"
    exit 1
  fi
}

if [ "$BACKEND_SELECTED" -eq 1 ]; then
  install_dependencies "后端" "backend"
fi
if [ "$FRONTEND_SELECTED" -eq 1 ]; then
  install_dependencies "Web 前端" "frontend"
fi
if [ "$MINIAPP_SELECTED" -eq 1 ]; then
  install_dependencies "小程序" "miniapp"
fi

if [ "$BACKEND_SELECTED" -eq 1 ] && [ ! -f "$ROOT/backend/storage/dev.sqlite" ]; then
  echo "提示：开发库尚未初始化，首次需先执行："
  echo "  cd backend && cp .env.example .env && npm run migrate"
  echo "  ADMIN_PASSWORD='<强密码>' npm run create-admin -- admin 系统管理员"
  echo
fi

# 由本脚本启动的服务 PID（用于退出时清理进程树，避免误杀启动前已占用的服务）
BACKEND_PID=""
FRONTEND_PID=""
MINIAPP_PID=""

# 递归 TERM 整棵进程树（子进程先杀，父进程后杀）
kill_tree() {
  local pid="$1" child
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

cleanup() {
  echo ""
  if [ -n "$BACKEND_PID" ]; then
    echo "停止后端 ..."
    kill_tree "$BACKEND_PID"
  fi
  if [ -n "$FRONTEND_PID" ]; then
    echo "停止 Web 前端 ..."
    kill_tree "$FRONTEND_PID"
  fi
  if [ -n "$MINIAPP_PID" ]; then
    echo "停止小程序编译监听 ..."
    kill_tree "$MINIAPP_PID"
  fi
  sleep 1
  echo "已退出"
}

handle_signal() {
  trap - EXIT INT TERM
  cleanup
  exit 130
}

trap cleanup EXIT
trap handle_signal INT TERM

# ---------- 后端 ----------
if [ "$BACKEND_SELECTED" -eq 1 ]; then
  if lsof -nP -iTCP:"$BACKEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "端口 $BACKEND_PORT 已被占用，跳过后端启动（请确认 127.0.0.1:$BACKEND_PORT 已有服务）"
  else
    echo "启动后端 http://127.0.0.1:$BACKEND_PORT ..."
    (
      cd "$ROOT/backend" || exit 1
      PORT="$BACKEND_PORT" npm run dev
    ) &
    BACKEND_PID=$!

    ready=""
    for i in $(seq 1 30); do
      if curl -sf -o /dev/null "http://127.0.0.1:$BACKEND_PORT/api/health" 2>/dev/null; then
        ready=1
        echo "后端就绪"
        break
      fi
      sleep 1
    done
    if [ -z "$ready" ]; then
      echo "后端 30 秒内未就绪，请查看上方日志；可 Ctrl+C 退出后检查依赖与数据库配置。"
    fi
  fi
fi

# ---------- Web 前端 ----------
if [ "$FRONTEND_SELECTED" -eq 1 ]; then
  if lsof -nP -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "端口 $FRONTEND_PORT 已被占用，跳过 Web 前端启动（请确认 localhost:$FRONTEND_PORT 已有服务）"
  else
    echo "启动 Web 前端 http://localhost:$FRONTEND_PORT ..."
    (
      cd "$ROOT/frontend" || exit 1
      # 用 sleep 保活 stdin，避免 tailwind 编译进程因 stdin 关闭而退出
      sleep 36000 | PORT="$FRONTEND_PORT" npm start
    ) &
    FRONTEND_PID=$!
  fi
fi

# ---------- 微信小程序 ----------
if [ "$MINIAPP_SELECTED" -eq 1 ]; then
  echo "启动小程序编译监听 ..."
  (
    cd "$ROOT/miniapp" || exit 1
    npm run dev:weapp
  ) &
  MINIAPP_PID=$!
fi

if [ "$FRONTEND_SELECTED" -eq 1 ]; then
  echo "浏览器访问 http://localhost:${FRONTEND_PORT}。"
fi
if [ "$MINIAPP_SELECTED" -eq 1 ]; then
  echo "小程序请在微信开发者工具中打开 miniapp 目录。"
fi
echo "按 Ctrl+C 同时停止已启动的应用。"

if [ -n "$FRONTEND_PID" ]; then
  wait "$FRONTEND_PID"
elif [ -n "$MINIAPP_PID" ]; then
  wait "$MINIAPP_PID"
elif [ -n "$BACKEND_PID" ]; then
  wait "$BACKEND_PID"
else
  echo "相关服务均已在运行，按 Ctrl+C 退出监听。"
  while true; do
    sleep 3600
  done
fi
