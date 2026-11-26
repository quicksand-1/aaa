/**
 * init-agent.cjs
 *
 * 多平台 AI Agent 配置同步脚本。
 * 将统一维护在 src/fintech/public/agents/ 下的 AGENTS.md 和 skills/ 目录
 * 同步到各 AI 编程工具约定的配置路径，实现「一次编写，多平台生效」。
 *
 * 用法：
 *   node scripts/init-agent.cjs [platform]
 *   AGENT_PLATFORM=cursor node scripts/init-agent.cjs
 *
 * platform 支持名称或数字序号，不传则自动检测。
 */

// Node.js 内置模块：文件系统操作和路径处理
const { cpSync, existsSync, mkdirSync, readdirSync } = require('fs');
const path = require('path');

// ─── 路径常量 ────────────────────────────────────────────────────────────────

/** 仓库根目录（脚本位于 public/scripts/，向上一级） */
const repoRoot = path.resolve(__dirname, '..');
/** fintech 子模块根目录 */
const fintechRoot = path.join(repoRoot, 'src/fintech');
/** AGENTS.md 源文件路径 */
const agentsSource = path.join(fintechRoot, 'public/agents/AGENTS.md');
/** skills 目录源路径 */
const skillsSource = path.join(fintechRoot, 'public/agents/skills');

// ─── 平台配置 ────────────────────────────────────────────────────────────────
// key:        平台标识
// skillsDir:  该平台约定的 skills 目录（相对于仓库根目录）
// agentsFile: 可选，指定不同的 AGENTS.md 目标文件名（默认 AGENTS.md）

const platformConfigs = {
  trae: {
    key: 'trae',
    skillsDir: '.trae/skills',
  },
  opencode: {
    key: 'opencode',
    skillsDir: '.opencode/skills',
  },
  claudecode: {
    key: 'claudecode',
    skillsDir: '.claude/skills',
    agentsFile: 'CLAUDE.md',
  },
  copilot: {
    key: 'copilot',
    skillsDir: '.github/skills',
  },
  cursor: {
    key: 'cursor',
    skillsDir: '.cursor/skills',
  },
  codex: {
    key: 'codex',
    skillsDir: '.codex/skills',
  },
  qoder: {
    key: 'qoder',
    skillsDir: '.qoder/skills',
  },
};

// ─── 平台别名映射 ────────────────────────────────────────────────────────────
// 支持通过数字序号或平台名称来指定目标平台，方便 CLI 交互选择。

const platformAliases = {
  1: 'trae',
  trae: 'trae',
  2: 'opencode',
  opencode: 'opencode',
  3: 'claudecode',
  claudecode: 'claudecode',
  4: 'copilot',
  copilot: 'copilot',
  5: 'cursor',
  cursor: 'cursor',
  6: 'codex',
  codex: 'codex',
  7: 'qoder',
  qoder: 'qoder',
};

// ─── 日志工具 ────────────────────────────────────────────────────────────────

/** 普通信息输出 */
function log(message) {
  console.log(`[init-agent] ${message}`);
}

/** 警告信息输出（不影响流程） */
function warn(message) {
  console.warn(`[init-agent] ${message}`);
}

/** 错误信息输出并终止进程 */
function fail(message) {
  console.error(`[init-agent] ${message}`);
  process.exit(1);
}

/**
 * 将用户输入（命令行参数或环境变量）解析为平台标识。
 * 支持数字序号（如 "1"）和平台名称（如 "trae"），不区分大小写。
 * @param {string|undefined} input - 用户输入的平台标识
 * @returns {string|null} 匹配到的平台标识，未匹配返回 null
 */
function resolvePlatform(input) {
  if (!input) {
    return null;
  }

  return platformAliases[String(input).trim().toLowerCase()] || null;
}

/**
 * 自动检测当前运行环境所属的 AI 平台。
 * 检测策略：
 *   1. 优先检查专属环境变量（Qoder: QODER_IDE, Codex: CODEX_HOME）
 *   2. 都未命中时默认回退到 codex
 * @returns {string} 检测到的平台标识
 */
function detectPlatform() {
  // Qoder 环境会注入 QODER_IDE 变量，可作为快速判据
  if (process.env.QODER_IDE) {
    return 'qoder';
  }

  // Codex 环境会注入 CODEX_HOME 变量，可作为快速判据
  if (process.env.CODEX_HOME) {
    return 'codex';
  }

  // 未检测到任何平台，默认回退到 codex
  return 'codex';
}

/**
 * 列出指定目录下所有子目录的名称（用于展示已同步的 skills 列表）。
 * @param {string} dirPath - 目标目录路径
 * @returns {string[]} 排序后的子目录名称数组
 */
function listSkillDirs(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }

  return readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

// ─── 主流程 ──────────────────────────────────────────────────────────────────

// 平台选择优先级：命令行参数 > 环境变量 AGENT_PLATFORM > 自动检测
const selectedPlatform =
  resolvePlatform(process.argv[2]) ||
  resolvePlatform(process.env.AGENT_PLATFORM) ||
  detectPlatform();

// 根据选中的平台获取对应配置
const platformConfig = platformConfigs[selectedPlatform];

// 校验平台是否合法
if (!platformConfig) {
  fail(`unsupported platform: ${selectedPlatform}`);
}

// 校验 fintech 子模块是否存在
if (!existsSync(fintechRoot)) {
  fail('src/fintech is missing, run init-submodules first');
}

log(`Selected platform: ${platformConfig.key}`);

// ─── 同步 AGENTS.md ──────────────────────────────────────────────────────────
// 将源 AGENTS.md 复制到目标平台的约定位置。
// 若平台配置了自定义 agentsFile（如 Claude Code 使用 CLAUDE.md），则使用自定义文件名。

if (existsSync(agentsSource)) {
  // 确定目标文件路径：使用平台自定义文件名或默认 AGENTS.md
  const agentsTarget = path.join(
    repoRoot,
    platformConfig.agentsFile || 'AGENTS.md'
  );
  // 确保目标目录存在
  mkdirSync(path.dirname(agentsTarget), { recursive: true });
  // 复制文件
  cpSync(agentsSource, agentsTarget);
  log(
    `Synced AGENTS.md to ${
      path.relative(repoRoot, agentsTarget) || path.basename(agentsTarget)
    }`
  );
} else {
  warn('AGENTS.md not found in submodule');
}

// ─── 同步 skills 目录 ────────────────────────────────────────────────────────
// 将源 skills/ 目录递归复制到目标平台的 skills 目录。

if (existsSync(skillsSource)) {
  const skillsTarget = path.join(repoRoot, platformConfig.skillsDir);
  // 确保目标目录存在
  mkdirSync(skillsTarget, { recursive: true });
  // 递归复制，force: true 表示覆盖已有文件
  cpSync(skillsSource, skillsTarget, { recursive: true, force: true });

  // 列出已同步的 skill 目录，用于日志展示
  const skillDirs = listSkillDirs(skillsTarget);

  if (skillDirs.length > 0) {
    log(
      `Synced skills to ${platformConfig.skillsDir}: ${skillDirs.join(', ')}`
    );
  } else {
    warn('No skills found to sync');
  }
} else {
  warn('skills directory not found in submodule');
}
