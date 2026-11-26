#!/bin/bash

set -eo pipefail

build_args=("$@")
platform_arg=""

if [[ "$#" -gt 0 ]]; then
  for arg in "${build_args[@]}"; do
    if [[ "$arg" == plf=* ]]; then
      platform_arg="$arg"
      break
    fi
  done
fi

if [[ -z "$platform_arg" ]]; then
  if [[ ! -t 0 ]]; then
    echo "Non-interactive mode requires a platform argument like plf=tj." >&2
    exit 1
  fi

  platform_list="$(
    node - <<'NODE'
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = path.join(process.cwd(), 'config', 'platform.ts');
const source = fs.readFileSync(filePath, 'utf8');
const compiled = source.replace(/export\s+default/, 'module.exports =');
const sandbox = { module: { exports: [] }, exports: {} };

try {
  vm.runInNewContext(compiled, sandbox, { filename: filePath });
} catch (error) {
  console.error(`Failed to load ${filePath}: ${error.message}`);
  process.exit(1);
}

const platforms = sandbox.module.exports;

if (!Array.isArray(platforms) || platforms.length === 0) {
  console.error(`No platforms found in ${filePath}.`);
  process.exit(1);
}

for (const item of platforms) {
  if (!item || typeof item.key !== 'string' || typeof item.name !== 'string') {
    continue;
  }
  console.log(`${item.key}\t${item.name}`);
}
NODE
  )"

  if [[ -z "$platform_list" ]]; then
    echo "No selectable platforms found in config/platform.ts." >&2
    exit 1
  fi

  platform_keys=()
  platform_names=()

  while IFS=$'\t' read -r key name; do
    if [[ -z "$key" ]]; then
      continue
    fi
    platform_keys+=("$key")
    platform_names+=("$name")
  done <<< "$platform_list"

  if [[ "${#platform_keys[@]}" -eq 0 ]]; then
    echo "No selectable platforms found in config/platform.ts." >&2
    exit 1
  fi

  echo "请选择平台："
  for i in "${!platform_keys[@]}"; do
    echo "$((i + 1)). ${platform_keys[$i]} - ${platform_names[$i]}"
  done

  while true; do
    printf "输入序号或 key: "
    read -r selection

    if [[ "$selection" =~ ^[0-9]+$ ]]; then
      index=$((selection - 1))
      if (( index >= 0 && index < ${#platform_keys[@]} )); then
        platform_arg="plf=${platform_keys[$index]}"
        break
      fi
    fi

    for i in "${!platform_keys[@]}"; do
      if [[ "$selection" == "${platform_keys[$i]}" ]]; then
        platform_arg="plf=${platform_keys[$i]}"
        break 2
      fi
    done

    echo "无效选择，请重新输入。"
  done

  build_args+=("$platform_arg")
fi

if [[ "${#build_args[@]}" -gt 0 ]]; then
  npm run build -- "${build_args[@]}"
else
  npm run build
fi

sleep 5

if [[ "${#build_args[@]}" -gt 0 ]]; then
  node ./zip/index.js "${build_args[@]}"
else
  node ./zip/index.js
fi
