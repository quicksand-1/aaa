const { existsSync, readFileSync } = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const gitmodulesPath = path.join(repoRoot, '.gitmodules');
const packageJsonPath = path.join(repoRoot, 'package.json');
const submoduleKey = 'fintech';
const submoduleName = 'src/fintech';
const submodulePath = path.join(repoRoot, submoduleName);

function log(message) {
  console.log(`[init-submodules] ${message}`);
}

function warn(message) {
  console.warn(`[init-submodules] ${message}`);
}

function fail(message) {
  console.error(`[init-submodules] ${message}`);
  process.exit(1);
}

function execGit(args, options = {}) {
  const { capture = false, cwd = repoRoot } = options;

  return spawnSync('git', args, {
    cwd,
    stdio: capture ? 'pipe' : 'inherit',
    encoding: capture ? 'utf8' : undefined,
  });
}

function runGit(args, options = {}) {
  const result = execGit(args, options);

  if (result.error) {
    fail(`git command failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`git ${args.join(' ')} exited with code ${result.status}`);
  }
}

function readGit(args) {
  const result = execGit(args, { capture: true });

  if (result.error) {
    fail(`git command failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`git ${args.join(' ')} exited with code ${result.status}`);
  }

  return result.stdout.trim();
}

function tryReadGit(args) {
  const result = execGit(args, { capture: true });

  if (result.error || result.status !== 0) {
    return '';
  }

  return result.stdout.trim();
}

function readFintechVersion() {
  let packageJson;

  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    fail(`failed to read package.json: ${error.message}`);
  }

  const version = packageJson?.submodules?.fintech;

  if (typeof version !== 'string' || !version.trim()) {
    fail('package.json must define submodules.fintech as a non-empty string');
  }

  return version.trim();
}

function readFintechRemoteUrl() {
  return readGit([
    'config',
    '--file',
    gitmodulesPath,
    '--get',
    `submodule.${submoduleKey}.url`,
  ]);
}

function hasGitRepo() {
  const topLevel = tryReadGit([
    '-C',
    submoduleName,
    'rev-parse',
    '--show-toplevel',
  ]);

  // An uninitialized submodule has no .git metadata of its own. In that
  // case Git walks up to the parent repository, so rev-parse still succeeds.
  // Only treat the directory as initialized when Git resolves it as the
  // repository root itself.
  return Boolean(topLevel) && path.resolve(topLevel) === submodulePath;
}

function ensureSubmoduleRepo(remoteUrl) {
  runGit(['submodule', 'sync', '--', submoduleName]);
  runGit(['submodule', 'init', '--', submoduleName]);

  if (hasGitRepo()) {
    runGit(['-C', submoduleName, 'remote', 'set-url', 'origin', remoteUrl]);
    return;
  }

  log(`Cloning ${submoduleName} from ${remoteUrl}...`);
  runGit(['clone', remoteUrl, submodulePath]);
}

if (!existsSync(gitmodulesPath)) {
  log('No .gitmodules found, skipping submodule initialization.');
  process.exit(0);
}

const fintechVersion = readFintechVersion();
const fintechRemoteUrl = readFintechRemoteUrl();

log(`Syncing ${submoduleName}...`);
ensureSubmoduleRepo(fintechRemoteUrl);

log(`Ensuring fintech version ${fintechVersion}...`);
runGit([
  '-C',
  submoduleName,
  'fetch',
  '--force',
  'origin',
  `refs/tags/${fintechVersion}:refs/tags/${fintechVersion}`,
  '--no-tags',
]);

runGit(['-C', submoduleName, 'checkout', '-q', fintechVersion]);
runGit(['-C', submoduleName, 'submodule', 'update', '--init', '--recursive']);

const targetCommit = readGit(['-C', submoduleName, 'rev-parse', 'HEAD']);
const targetDescription = readGit([
  '-C',
  submoduleName,
  'describe',
  '--tags',
  '--always',
]);
const gitLinkEntry = readGit(['ls-tree', 'HEAD', submoduleName]);
const gitLinkCommit = gitLinkEntry.split(/\s+/)[2] || '';

if (gitLinkCommit && gitLinkCommit !== targetCommit) {
  warn(
    `Configured tag ${fintechVersion} resolves to ${targetCommit.slice(
      0,
      7
    )}, but HEAD records ${gitLinkCommit.slice(
      0,
      7
    )} for ${submoduleName}. Parent git status will show this submodule as modified.`
  );
}

log(
  `${submoduleName} is ready at ${targetDescription} (${targetCommit.slice(
    0,
    7
  )}).`
);
