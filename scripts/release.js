import { execFileSync, execSync } from 'node:child_process';
import readline from 'node:readline/promises';
import process from 'node:process';
import { stdin as input, stdout as output } from 'node:process';

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: 'inherit' });
}

function runFile(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit' });
}

function isWorkingTreeDirty() {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  return status.trim().length > 0;
}

async function promptCommitMessage() {
  const rl = readline.createInterface({ input, output });
  try {
    const message = await rl.question('Uncommitted changes detected. Enter commit message: ');
    return message.trim();
  } finally {
    rl.close();
  }
}

function commitChanges(message) {
  run('git add -A');
  runFile('git', ['commit', '-m', message]);
}

async function ensureCleanWorkingTree() {
  if (!isWorkingTreeDirty()) {
    return;
  }

  const message = await promptCommitMessage();
  if (!message) {
    throw new Error('Commit message is required when there are uncommitted changes.');
  }

  commitChanges(message);
}

async function main() {
  const branch = process.env.GIT_BRANCH || '';
  if (branch) {
    console.log(`Releasing from ${branch}`);
  }

  await ensureCleanWorkingTree();
  run('npm version patch');
  run('npm publish');
  run('git push --follow-tags');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
