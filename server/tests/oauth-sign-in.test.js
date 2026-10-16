const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const { Pool } = require('pg');
const { installAuth } = require('../auth');

// Google sign-in goes through Supabase Auth. The browser returns from the
// OAuth redirect with a Supabase session and asks the server, once, to bind
// that Auth user to a player account. Real PostgreSQL, a fake Supabase admin
// client: the external token check is the only thing that is not real.
async function oauthFixture(t, { players = [], authUsers = {}, onOAuthSignIn } = {}) {
  if (!process.env.TEST_DATABASE_URL) throw new Error('Set TEST_DATABASE_URL to a disposable PostgreSQL database (not the application database).');
  const schema = `oauth_test_${crypto.randomBytes(8).toString('hex')}`;
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
  await pool.query(`CREATE SCHEMA "${schema}"`);
  t.after(async () => {
    await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
    await pool.end();
  });
  const wrap = (client) => {
    const execute = async (sql, args = []) => {
      let i = 0;
      const result = await client.query(sql.replace(/\?/g, () => `$${++i}`), args);
      return result.command === 'SELECT' ? [result.rows, result]
        : [{ affectedRows: result.rowCount, insertId: Number(result.rows?.[0]?.user_id || 0) }, result];
    };
    return { execute, query: execute, beginTransaction: () => client.query('BEGIN'), commit: () => client.query('COMMIT'), rollback: () => client.query('ROLLBACK'), release: () => client.release() };
  };
  const db = { ...wrap(pool), getConnection: async () => wrap(await pool.connect()) };
  await pool.query(`CREATE TABLE users (user_id serial PRIMARY KEY, username text UNIQUE, email text, password_hash text,
    role text DEFAULT 'user', level integer DEFAULT 0, xp integer DEFAULT 0, virtual_currency integer DEFAULT 0,
    is_deleted integer DEFAULT 0, is_banned integer DEFAULT 0, ban_until timestamptz)`);
  for (const player of players) {
    await pool.query('INSERT INTO users (user_id, username, email, level) VALUES ($1, $2, $3, $4)', [player.user_id, player.username, player.email, player.level ?? 10]);
  }
  await pool.query("SELECT setval('users_user_id_seq', 1000)");

  const admin = { auth: {
    getUser: async (token) => (authUsers[token] ? { data: { user: authUsers[token] } } : { data: {}, error: new Error('invalid') }),
    admin: {},
  } };
  const app = express();
  app.use(express.json());
  const auth = installAuth(app, db, admin, { AUTH_ALLOWED_ORIGINS: 'http://localhost:5174' }, { onOAuthSignIn });
  await auth.ready;
  app.get('/api/shop/items', (req, res) => res.json({ user_id: req.player.user_id }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, { token, method = 'POST', headers = {} } = {}) => {
    const response = await fetch(base + path, { method, headers: {
      'Content-Type': 'application/json', 'X-PyArena-Request': '1',
      ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers,
    } });
    return { status: response.status, body: await response.json() };
  };
  const complete = (token, options) => call('/api/auth/oauth/complete', { token, ...options });
  return { pool, call, complete };
}

const googleUser = (id, email, extra = {}) => ({
  id, email, email_confirmed_at: '2026-10-16T00:00:00Z',
  app_metadata: { provider: 'google', providers: ['google'] },
  user_metadata: { full_name: 'Mai Learner', avatar_url: 'https://lh3.googleusercontent.com/a/mai' },
  ...extra,
});
const AUTH_A = '11111111-1111-4111-8111-111111111111';
const AUTH_B = '22222222-2222-4222-8222-222222222222';

test('a Google user whose email matches one unbound player is bound to that player', async (t) => {
  const { complete, call, pool } = await oauthFixture(t, {
    players: [{ user_id: 141, username: 'max', email: 'Max@Example.com' }],
    authUsers: { tok: googleUser(AUTH_A, 'max@example.com') },
  });
  const before = await call('/api/shop/items', { token: 'tok', method: 'GET' });
  assert.equal(before.status, 401, 'an unbound Supabase user cannot use the API yet');
  const result = await complete('tok');
  assert.equal(result.status, 200);
  assert.equal(result.body.user_id, 141);
  assert.equal(result.body.created, false);
  const { rows } = await pool.query('SELECT user_id, auth_user_id::text AS auth, email FROM player_auth_identities');
  assert.deepEqual(rows, [{ user_id: 141, auth: AUTH_A, email: 'max@example.com' }]);
  assert.equal((await call('/api/shop/items', { token: 'tok', method: 'GET' })).body.user_id, 141);
});

test('completing twice, or concurrently, binds once and creates no extra player', async (t) => {
  const { complete, pool } = await oauthFixture(t, {
    authUsers: { tok: googleUser(AUTH_A, 'new@example.com') },
  });
  const results = await Promise.all([complete('tok'), complete('tok'), complete('tok')]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 200, 201], 'exactly one request creates the player');
  assert.equal(new Set(results.map((r) => r.body.user_id)).size, 1);
  assert.equal((await complete('tok')).body.user_id, results[0].body.user_id);
  assert.equal(Number((await pool.query('SELECT COUNT(*) FROM users')).rows[0].count), 1);
  assert.equal(Number((await pool.query('SELECT COUNT(*) FROM player_auth_identities')).rows[0].count), 1);
});

test('a new Google email creates a level 0 player with a unique name and reports it', async (t) => {
  const seen = [];
  const { complete, pool } = await oauthFixture(t, {
    players: [{ user_id: 5, username: 'Mai Learner', email: 'other@example.com' }],
    authUsers: { tok: googleUser(AUTH_A, 'mai@example.com') },
    onOAuthSignIn: async ({ user, created, picture }) => { seen.push({ id: user.user_id, created, picture }); return { avatar: 'resolved' }; },
  });
  const result = await complete('tok');
  assert.equal(result.status, 201);
  assert.equal(result.body.level, 0);
  assert.equal(result.body.created, true);
  assert.equal(result.body.avatar, 'resolved');
  assert.notEqual(result.body.username, 'Mai Learner', 'the name already taken is not reused');
  assert.match(result.body.username, /^Mai Learner/);
  const { rows } = await pool.query('SELECT email, level FROM users WHERE user_id = $1', [result.body.user_id]);
  assert.deepEqual(rows, [{ email: 'mai@example.com', level: 0 }]);
  assert.deepEqual(seen, [{ id: result.body.user_id, created: true, picture: 'https://lh3.googleusercontent.com/a/mai' }]);
});

test('an email shared by two players is refused instead of guessing', async (t) => {
  const { complete, pool } = await oauthFixture(t, {
    players: [{ user_id: 1, username: 'a', email: 'dup@example.com' }, { user_id: 2, username: 'b', email: 'DUP@example.com' }],
    authUsers: { tok: googleUser(AUTH_A, 'dup@example.com') },
  });
  assert.equal((await complete('tok')).status, 409);
  assert.equal(Number((await pool.query('SELECT COUNT(*) FROM player_auth_identities')).rows[0].count), 0);
});

test('a player already bound to another Auth user is not taken over by email', async (t) => {
  const { complete, pool } = await oauthFixture(t, {
    players: [{ user_id: 142, username: 'pong', email: 'pong@example.com' }],
    authUsers: { tok: googleUser(AUTH_A, 'pong@example.com') },
  });
  await pool.query('INSERT INTO player_auth_identities (user_id, auth_user_id, email) VALUES (142, $1, $2)', [AUTH_B, 'pong@example.com']);
  assert.equal((await complete('tok')).status, 409);
});

test('only verified Google identities may bind; other tokens are refused', async (t) => {
  const { complete, call } = await oauthFixture(t, {
    players: [{ user_id: 141, username: 'max', email: 'max@example.com' }],
    authUsers: {
      unconfirmed: googleUser(AUTH_A, 'max@example.com', { email_confirmed_at: null }),
      emailOnly: googleUser(AUTH_B, 'max@example.com', { app_metadata: { provider: 'email', providers: ['email'] } }),
    },
  });
  assert.equal((await complete()).status, 401);
  assert.equal((await complete('bogus')).status, 401);
  assert.equal((await complete('unconfirmed')).status, 401);
  assert.equal((await complete('emailOnly')).status, 403, 'an email/password user must not be bound by matching email');
  assert.equal((await complete('emailOnly', { headers: { 'X-PyArena-Request': '' } })).status, 403);
  assert.equal((await call('/api/auth/google', { token: 'tok' })).status, 401, 'the old Google route is no longer public');
});

test('a Google identity linked onto an already bound Auth user signs straight in', async (t) => {
  const { complete, pool } = await oauthFixture(t, {
    players: [{ user_id: 142, username: 'pong', email: 'pong@example.com' }],
    authUsers: { tok: googleUser(AUTH_A, 'pong@example.com', { app_metadata: { provider: 'email', providers: ['email', 'google'] } }) },
  });
  await pool.query('INSERT INTO player_auth_identities (user_id, auth_user_id, email) VALUES (142, $1, $2)', [AUTH_A, 'pong@example.com']);
  const result = await complete('tok');
  assert.equal(result.status, 200);
  assert.equal(result.body.user_id, 142);
});

test('a disabled player cannot sign in with Google', async (t) => {
  const { complete, pool } = await oauthFixture(t, {
    players: [{ user_id: 141, username: 'max', email: 'max@example.com' }],
    authUsers: { tok: googleUser(AUTH_A, 'max@example.com') },
  });
  await pool.query('UPDATE users SET is_banned = 1 WHERE user_id = 141');
  assert.equal((await complete('tok')).status, 403);
  assert.equal(Number((await pool.query('SELECT COUNT(*) FROM player_auth_identities')).rows[0].count), 0);
});
