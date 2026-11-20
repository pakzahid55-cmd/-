import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// This entry point is deliberately isolated from the production API entry point.
const dataDir = mkdtempSync(join(tmpdir(), 'kujuk-hosted-preview-'));
const children = [];
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  Promise.allSettled(children.map(child => child.exitCode !== null || child.signalCode !== null ? undefined : new Promise(resolve => {
    child.once('exit', resolve);
    child.once('error', resolve);
  }))).then(() => { rmSync(dataDir, { recursive: true, force: true }); process.exit(code); });
  setTimeout(() => { for (const child of children) child.kill('SIGKILL'); }, 4500).unref();
}
function run(args, cwd, env) {
  const child = spawn(process.execPath, args, { cwd, env, stdio: 'inherit' });
  children.push(child);
  child.once('error', error => { console.error(error.message); stop(1); });
  child.once('exit', code => { if (!stopping) stop(code || 1); });
}
process.once('SIGTERM', () => stop(0));
process.once('SIGINT', () => stop(0));
run(['dist/index.js'], 'server', {
  ...process.env, NODE_ENV: 'preview', PORT: '4400', KUJUK_API_HOST: '127.0.0.1',
  KUJUK_PREVIEW_DATA_FILE: join(dataDir, 'db.json'), JWT_SECRET: randomBytes(32).toString('hex'), JWT_EXPIRES_IN: '12h',
});
run(['../node_modules/next/dist/bin/next', 'start', '--hostname', '0.0.0.0', '--port', process.env.PORT || '3000'], 'web', {
  ...process.env, NODE_ENV: 'production', KUJUK_HOSTED_PREVIEW_BUILD: '1', KUJUK_API_ORIGIN: 'http://127.0.0.1:4400',
});
