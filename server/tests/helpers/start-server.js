// Parent side of helpers/server-boot.js: a throwaway database on
// TEST_DATABASE_URL, and the whole server booted against it in a child process.
const crypto = require('node:crypto');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { Pool } = require('pg');

const databaseUrl = () => {
  const url = String(process.env.TEST_DATABASE_URL || '').trim();
  if (!url) throw new Error('TEST_DATABASE_URL must point to a disposable PostgreSQL server');
  return url;
};

// A database of its own, dropped when the test ends, so the test neither needs
// nor disturbs anything else on TEST_DATABASE_URL.
async function createTestDatabase(t, prefix = 'pyarena_boot') {
  const name = `${prefix}_${crypto.randomBytes(6).toString('hex')}_test`;
  const admin = new Pool({ connectionString: databaseUrl(), ssl: false });
  await admin.query(`CREATE DATABASE ${name}`);
  await admin.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
    END
    $$
  `);
  t.after(async () => {
    await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
    await admin.end();
  });
  const url = new URL(databaseUrl());
  url.pathname = `/${name}`;
  return url.toString();
}

// Boots server.js against `url` with `env` layered on top, and resolves once it
// listens. Returns `call(path, {method, body})` signed in as a probe player,
// plus `players[name].call` for each of `players` signed in beside it and
// `anonymous` for a request with no token at all. `backgroundJobs` starts the
// Arcade match tick, which a test needs for any round to close.
async function startServer(t, { url, env = {}, players = [], backgroundJobs = false }) {
  const child = spawn(process.execPath, [path.join(__dirname, 'server-boot.js')], {
    cwd: path.join(__dirname, '..', '..'),
    env: {
      ...process.env,
      DATABASE_URL: url,
      PGSSLMODE: process.env.TEST_DATABASE_SSLMODE || 'disable',
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://example.supabase.co',
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || 'sb_secret_server_boot_test_only',
      SERVER_BOOT_PLAYERS: JSON.stringify(players),
      SERVER_BOOT_BACKGROUND_JOBS: backgroundJobs ? '1' : '',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stderr.on('data', chunk => { output += chunk; });
  t.after(() => child.kill());

  const ready = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`server did not start in time:\n${output}`)), 300_000);
    child.stdout.on('data', chunk => {
      output += chunk;
      const line = output.split(/\r?\n/).find(entry => entry.startsWith('{"port"'));
      if (line) { clearTimeout(timer); resolve(JSON.parse(line)); }
    });
    child.on('exit', code => { clearTimeout(timer); reject(new Error(`server exited with ${code}:\n${output}`)); });
  });

  let exitCode = null;
  child.on('exit', code => { exitCode = code; });
  const callAs = token => async (route, { method = 'POST', body } = {}) => {
    let response;
    try {
      response = await fetch(`http://127.0.0.1:${ready.port}${route}`, {
        method,
        // x-pyarena-request is what the real client sends on every write (CSRF guard).
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
          'x-pyarena-request': '1',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      // A bare "fetch failed" says nothing; the server's own last words do.
      throw new Error(`${method} ${route} failed (${error.cause?.code || error.message}); server ${exitCode === null ? 'still running' : `exited with ${exitCode}`}:\n${output.slice(-3000)}`);
    }
    return { status: response.status, body: await response.json().catch(() => null) };
  };
  const signedIn = Object.fromEntries(Object.entries(ready.players || {})
    .map(([name, { token, userId }]) => [name, { call: callAs(token), userId }]));
  return {
    call: callAs(ready.token),
    userId: ready.userId,
    username: ready.username,
    players: signedIn,
    anonymous: callAs(null),
    logs: () => output,
  };
}

// The usual setup of a local-model test: a fake Ollama, a throwaway database,
// the server booted with `envFor(ollama)`, and a pool on that database for
// seeding and reading back.
async function startServerWithFakeOllama(t, { prefix, envFor }) {
  const { startFakeOllama } = require('./fake-ollama');
  const ollama = await startFakeOllama();
  t.after(() => ollama.close());
  const url = await createTestDatabase(t, prefix);
  const server = await startServer(t, { url, env: envFor(ollama) });
  const db = new Pool({ connectionString: url, ssl: false });
  // The database is dropped WITH (FORCE) at teardown, which ends idle clients.
  db.on('error', () => {});
  t.after(() => db.end());
  return { ollama, server, db };
}

module.exports = { createTestDatabase, startServer, startServerWithFakeOllama };
