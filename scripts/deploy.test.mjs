import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function run(env = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'kajok-entrypoint-'));
  try {
    const log = path.join(dir, 'calls');
    writeFileSync(path.join(dir, 'npm'), '#!/bin/sh\necho "$*" >> "$CALL_LOG"\nif [ "$*" = "run db:schema" ]; then exit "${SCHEMA_EXIT:-0}"; fi\n', { mode: 0o755 });
    const result = spawnSync('sh', ['scripts/docker-entrypoint.sh', 'npm', 'start'], {
      encoding: 'utf8',
      env: { PATH: `${dir}:${process.env.PATH}`, CALL_LOG: log, ...env },
    });
    let calls = '';
    try { calls = readFileSync(log, 'utf8'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    return { ...result, calls };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const configured = { DATABASE_URL: 'postgresql://example.invalid/db?sslmode=require', JWT_SECRET: 'test-only-secret' };

test('missing DATABASE_URL prevents startup', () => {
  const result = run({ JWT_SECRET: configured.JWT_SECRET });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DATABASE_URL/);
  assert.equal(result.calls, '');
});
test('missing JWT_SECRET prevents startup', () => {
  const result = run({ DATABASE_URL: configured.DATABASE_URL });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JWT_SECRET/);
  assert.equal(result.calls, '');
});
test('development JWT_SECRET is refused', () => {
  const result = run({ ...configured, JWT_SECRET: 'kajok-dev-secret-change-in-production' });
  assert.notEqual(result.status, 0);
  assert.equal(result.calls, '');
});
test('schema always runs before npm start', () => {
  const result = run(configured);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.calls, 'run db:schema\nstart\n');
});
test('schema failure prevents npm start and preserves exit code', () => {
  const result = run({ ...configured, SCHEMA_EXIT: '23' });
  assert.equal(result.status, 23);
  assert.equal(result.calls, 'run db:schema\n');
});
test('build includes schema beside compiled runner', () => {
  assert.equal(readFileSync('server/dist/db/schema.sql', 'utf8'), readFileSync('server/src/db/schema.sql', 'utf8'));
});
