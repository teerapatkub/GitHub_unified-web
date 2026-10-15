// One server boot, run as its own Node process so every module-level flag
// (db.arcadeReady, the cached db.ready promise) starts fresh - exactly like a
// restart. Prints a single JSON line for tests/arcade-restart-readiness.test.js.
const crypto = require('node:crypto');
const http = require('node:http');

const main = async () => {
  const db = require('../../db');
  const { app, applicationMigrations, startupState } = require('../../server');
  const { runMigrations } = require('../../migrations');
  const { CORE_SCHEMA_VERSION } = require('../../migrations/versions');
  const { hashToken } = require('../../auth/policy');

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

  // Player auth runs before the Arcade gate, so the request has to be signed
  // in. A cookie session is resolved from the database alone - no Supabase.
  await db.query(
    "INSERT INTO users (username, email, password_hash) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)",
    ['restart_probe', 'restart_probe@example.test', 'not-a-password', 'restart_probe'],
  );
  const [[player]] = await db.query('SELECT user_id FROM users WHERE username = ?', ['restart_probe']);
  const sessionToken = crypto.randomBytes(32).toString('hex');
  await db.query(
    'INSERT INTO player_google_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    [hashToken(sessionToken), player.user_id, new Date(Date.now() + 3600000)],
  );

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/arcade/rooms`, {
    headers: { cookie: `pyarena_google_session=${sessionToken}` },
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
