// Boots the whole server (server.js, every migration) in its own process and
// keeps it listening, so a test can drive real endpoints over HTTP. Prints one
// JSON line, {port, token, userId, username, players}, once ready; the parent
// (start-server.js) kills it.
//
// SERVER_BOOT_PLAYERS (a JSON list of usernames) signs in more players beside
// the probe, for checks that need two people in one room. SERVER_BOOT_BACKGROUND_JOBS=1
// also starts the jobs prepareApplication() would - the Arcade match tick that
// closes rounds and moves the bots, and the stale-room sweep.
const crypto = require('node:crypto');
const http = require('node:http');
const { stubSupabaseAuth, bootMigrated, seedProbePlayer } = require('./probe-boot');

const PROBE_USERNAME = 'boot_probe';
const PROBE_TOKEN = 'server-boot-probe-token';
const PROBE_AUTH_USER = '44444444-4444-4444-8444-444444444444';
const extraPlayers = JSON.parse(process.env.SERVER_BOOT_PLAYERS || '[]').map(username => ({
  username,
  token: `server-boot-${crypto.randomBytes(12).toString('hex')}`,
  authUser: crypto.randomUUID(),
}));
stubSupabaseAuth({ token: PROBE_TOKEN, authUser: PROBE_AUTH_USER }, ...extraPlayers);

const main = async () => {
  const { db, app } = await bootMigrated();
  const userId = await seedProbePlayer(db, { username: PROBE_USERNAME, authUser: PROBE_AUTH_USER });
  const players = {};
  for (const { username, token, authUser } of extraPlayers) {
    players[username] = { token, userId: await seedProbePlayer(db, { username, authUser }) };
  }
  if (process.env.SERVER_BOOT_BACKGROUND_JOBS === '1') require('../../server').startBackgroundJobs();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  process.stdout.write(`${JSON.stringify({ port: server.address().port, token: PROBE_TOKEN, userId, username: PROBE_USERNAME, players })}\n`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
