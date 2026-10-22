// One server boot, run as its own Node process so every module-level flag
// (db.arcadeReady, the cached db.ready promise) starts fresh - exactly like a
// restart. Prints a single JSON line for tests/arcade-restart-readiness.test.js.
const http = require('node:http');

const { stubSupabaseAuth, bootMigrated, seedProbePlayer } = require('./probe-boot');

const PROBE_TOKEN = 'restart-probe-token';
const PROBE_AUTH_USER = '33333333-3333-4333-8333-333333333333';
stubSupabaseAuth({ token: PROBE_TOKEN, authUser: PROBE_AUTH_USER });

const main = async () => {
  const db = require('../../db');
  const { CORE_SCHEMA_VERSION } = require('../../migrations/versions');

  let coreAppliedBeforeBoot = false;
  try {
    const [rows] = await db.query('SELECT 1 FROM app_schema_migrations WHERE version = ?', [CORE_SCHEMA_VERSION]);
    coreAppliedBeforeBoot = rows.length > 0;
  } catch (error) {
    if (error?.code !== '42P01') throw error;
  }

  const { app, status } = await bootMigrated();
  await seedProbePlayer(db, { username: 'restart_probe', authUser: PROBE_AUTH_USER });

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
