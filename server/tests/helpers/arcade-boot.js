// One server boot, run as its own Node process so every module-level flag
// (db.arcadeReady, the cached db.ready promise) starts fresh - exactly like a
// restart. Prints a single JSON line for tests/arcade-restart-readiness.test.js.
const http = require('node:http');

// Player auth verifies bearer tokens with Supabase. Stand in for that one
// external call so the probe signs in without a network: this token belongs to
// the fixed Auth user bound to the probe player below.
const PROBE_TOKEN = 'restart-probe-token';
const PROBE_AUTH_USER = '33333333-3333-4333-8333-333333333333';
const supabaseModule = require.resolve('@supabase/supabase-js');
const realSupabase = require(supabaseModule);
require.cache[supabaseModule].exports = {
  ...realSupabase,
  createClient: (...args) => {
    const client = realSupabase.createClient(...args);
    client.auth.getUser = async (token) => (token === PROBE_TOKEN
      ? { data: { user: { id: PROBE_AUTH_USER, email_confirmed_at: '2026-10-16T00:00:00Z' } }, error: null }
      : { data: {}, error: new Error('invalid token') });
    return client;
  },
};

const main = async () => {
  const db = require('../../db');
  const { app, applicationMigrations, startupState } = require('../../server');
  const { runMigrations } = require('../../migrations');
  const { CORE_SCHEMA_VERSION } = require('../../migrations/versions');

  let coreAppliedBeforeBoot = false;
  try {
    const [rows] = await db.query('SELECT 1 FROM app_schema_migrations WHERE version = ?', [CORE_SCHEMA_VERSION]);
    coreAppliedBeforeBoot = rows.length > 0;
  } catch (error) {
    if (error?.code !== '42P01') throw error;
  }

  // The same migration steps prepareApplication() runs, without its external
  // Supabase probe and background jobs.
  await db.ready;
  const status = await runMigrations(db, applicationMigrations);
  startupState.initialized = true;
  startupState.ready = status.ready;

  // Player auth runs before the Arcade gate, so the request has to be signed in.
  await db.query(
    "INSERT INTO users (username, email, password_hash) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)",
    ['restart_probe', 'restart_probe@example.test', 'not-a-password', 'restart_probe'],
  );
  const [[player]] = await db.query('SELECT user_id FROM users WHERE username = ?', ['restart_probe']);
  await db.query(
    'INSERT INTO player_auth_identities (user_id, auth_user_id, email) VALUES (?, ?, ?) ON CONFLICT DO NOTHING',
    [player.user_id, PROBE_AUTH_USER, 'restart_probe@example.test'],
  );

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/arcade/rooms`, {
    headers: { Authorization: `Bearer ${PROBE_TOKEN}` },
  });
  const body = await response.json().catch(() => null);
  await new Promise((resolve) => server.close(resolve));

  process.stdout.write(`${JSON.stringify({
    coreAppliedBeforeBoot,
    migrationsReady: status.ready,
    arcadeReady: db.arcadeReady === true,
    roomsStatus: response.status,
    roomsBody: body,
  })}\n`);
  await db.close();
};

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
