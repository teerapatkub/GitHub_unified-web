// Shared by the child-process boot scripts (arcade-boot.js, server-boot.js):
// boot the real server.js the way prepareApplication() does, minus its external
// Supabase probe and background jobs, with one probe player signed in.

// Player auth verifies bearer tokens with Supabase. Stand in for that one
// external call so probe players sign in without a network: each `token`
// belongs to the fixed Auth user `authUser` given with it. Must run before
// server.js is required.
function stubSupabaseAuth(...subjects) {
  const authUsers = new Map(subjects.map(({ token, authUser }) => [token, authUser]));
  const supabaseModule = require.resolve('@supabase/supabase-js');
  const realSupabase = require(supabaseModule);
  require.cache[supabaseModule].exports = {
    ...realSupabase,
    createClient: (...args) => {
      const client = realSupabase.createClient(...args);
      client.auth.getUser = async (given) => (authUsers.has(given)
        ? { data: { user: { id: authUsers.get(given), email_confirmed_at: '2026-10-16T00:00:00Z' } }, error: null }
        : { data: {}, error: new Error('invalid token') });
      return client;
    },
  };
}

async function bootMigrated() {
  const db = require('../../db');
  const { app, applicationMigrations, startupState } = require('../../server');
  const { runMigrations } = require('../../migrations');
  await db.ready;
  const status = await runMigrations(db, applicationMigrations);
  startupState.initialized = true;
  startupState.ready = status.ready;
  return { db, app, status };
}

// Player auth runs before every /api route, so requests must be signed in.
async function seedProbePlayer(db, { username, authUser }) {
  const email = `${username}@example.test`;
  await db.query(
    "INSERT INTO users (username, email, password_hash) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)",
    [username, email, 'not-a-password', username],
  );
  const [[player]] = await db.query('SELECT user_id FROM users WHERE username = ?', [username]);
  await db.query(
    'INSERT INTO player_auth_identities (user_id, auth_user_id, email) VALUES (?, ?, ?) ON CONFLICT DO NOTHING',
    [player.user_id, authUser, email],
  );
  return Number(player.user_id);
}

module.exports = { stubSupabaseAuth, bootMigrated, seedProbePlayer };
