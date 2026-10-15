const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const test = require('node:test');
const { Pool } = require('pg');

const run = promisify(execFile);
const databaseUrl = String(process.env.TEST_DATABASE_URL || '').trim();
if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL must point to a disposable PostgreSQL server');
}

// Every boot is a separate process, so nothing in memory survives between
// them - only what the database remembers. That is the situation the hosted
// server is in after every restart or redeploy.
const boot = async (url) => {
  const { stdout } = await run(process.execPath, [path.join(__dirname, 'helpers', 'arcade-boot.js')], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      DATABASE_URL: url,
      PGSSLMODE: process.env.TEST_DATABASE_SSLMODE || 'disable',
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://example.supabase.co',
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || 'sb_secret_restart_test_only',
    },
    maxBuffer: 16 * 1024 * 1024,
    timeout: 300_000,
  });
  const line = stdout.trim().split(/\r?\n/).reverse().find((entry) => entry.startsWith('{'));
  assert.ok(line, `boot printed no result:\n${stdout}`);
  return JSON.parse(line);
};

test('Arcade stays available when the server restarts on an already-migrated database', { timeout: 600_000 }, async (t) => {
  // A database of its own, so this test neither needs nor disturbs an empty
  // public schema in TEST_DATABASE_URL (tests/migrations-postgres.test.js).
  const databaseName = `pyarena_restart_${crypto.randomBytes(6).toString('hex')}_test`;
  const admin = new Pool({ connectionString: databaseUrl, ssl: false });
  await admin.query(`CREATE DATABASE ${databaseName}`);
  await admin.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
      END IF;
    END
    $$
  `);
  t.after(async () => {
    await admin.query(`DROP DATABASE IF EXISTS ${databaseName} WITH (FORCE)`);
    await admin.end();
  });
  const url = new URL(databaseUrl);
  url.pathname = `/${databaseName}`;

  const first = await boot(url.toString());
  assert.equal(first.coreAppliedBeforeBoot, false, 'the first boot must run the core migration');
  assert.equal(first.migrationsReady, true);
  assert.equal(first.arcadeReady, true);
  assert.equal(first.roomsStatus, 200, JSON.stringify(first.roomsBody));

  const second = await boot(url.toString());
  assert.equal(second.coreAppliedBeforeBoot, true, 'the second boot must find the core migration already applied');
  assert.equal(second.migrationsReady, true);
  assert.notEqual(second.roomsStatus, 503, JSON.stringify(second.roomsBody));
  assert.equal(second.roomsStatus, 200, JSON.stringify(second.roomsBody));
  assert.deepEqual(second.roomsBody, { success: true, rooms: [] });
  assert.equal(second.arcadeReady, true, 'the Arcade ticker and sweeper are disabled while arcadeReady is false');
});
