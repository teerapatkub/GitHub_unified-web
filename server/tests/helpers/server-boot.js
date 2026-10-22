// Boots the whole server (server.js, every migration) in its own process and
// keeps it listening, so a test can drive real endpoints over HTTP. Prints one
// JSON line, {port, token}, once ready; the parent (start-server.js) kills it.
const http = require('node:http');
const { stubSupabaseAuth, bootMigrated, seedProbePlayer } = require('./probe-boot');

const PROBE_TOKEN = 'server-boot-probe-token';
const PROBE_AUTH_USER = '44444444-4444-4444-8444-444444444444';
stubSupabaseAuth({ token: PROBE_TOKEN, authUser: PROBE_AUTH_USER });

const main = async () => {
  const { db, app } = await bootMigrated();
  const userId = await seedProbePlayer(db, { username: 'boot_probe', authUser: PROBE_AUTH_USER });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  process.stdout.write(`${JSON.stringify({ port: server.address().port, token: PROBE_TOKEN, userId })}\n`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
