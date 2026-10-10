const { installArcadeSubmissions } = require('../../arcade/submission-api');
const { migrateArcadeMatches } = require('../../arcade/migrate-matches');
const { Pool } = require('pg');
const crypto = require('node:crypto');
const express = require('express');
const { installAuth } = require('../../auth');
const { installArcadeMatchStart } = require('../../arcade/match-api');
const { installArcadeRoomReads } = require('../../arcade/room-api');

// Never load server/.env. Tests require an explicit disposable PostgreSQL target.
async function arcadeFixture(t, { beforeMigration, beforeShopMigration } = {}) {
  if (!process.env.TEST_DATABASE_URL) throw new Error('Set TEST_DATABASE_URL to a disposable PostgreSQL database (not the application database).');
  const schema = `arcade_test_${crypto.randomBytes(8).toString('hex')}`;
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
  await pool.query(`CREATE SCHEMA "${schema}"`);
  t.after(async () => {
    await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
    await pool.end();
  });
  const wrap = client => {
    const query = async (sql, args = []) => {
      let i = 0;
      const result = await client.query(sql.replace(/\?/g, () => `$${++i}`), args);
      return result.command === 'SELECT' ? [result.rows, result] : [{ affectedRows: result.rowCount, insertId: Number(result.rows?.[0]?.match_id || 0) }, result];
    };
    return { query, execute: query, beginTransaction: () => client.query('BEGIN'), commit: () => client.query('COMMIT'), rollback: () => client.query('ROLLBACK'), release: () => client.release() };
  };
  const db = { ...wrap(pool), getConnection: async () => wrap(await pool.connect()) };
  await pool.query(`
    CREATE TABLE users (user_id serial PRIMARY KEY, username text UNIQUE, email text, role text DEFAULT 'user', level integer DEFAULT 10, virtual_currency integer DEFAULT 0, is_deleted integer DEFAULT 0, is_banned integer DEFAULT 0, ban_until timestamptz);
    CREATE TABLE arcade_rooms (room_id serial PRIMARY KEY, room_code varchar(10), room_name varchar(100), host_name varchar(50), password text, max_players integer DEFAULT 5, status text DEFAULT 'WAITING', phase text DEFAULT 'LOBBY', phase_deadline timestamp, current_round integer DEFAULT 0, last_round_summary jsonb, round_task_ids jsonb, difficulty text DEFAULT 'default', round_duration_mode text DEFAULT 'standard', created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now());
    CREATE TABLE arcade_participants (id serial PRIMARY KEY, room_id integer REFERENCES arcade_rooms(room_id) ON DELETE CASCADE, user_name varchar(50), is_host integer DEFAULT 0, has_submitted integer DEFAULT 0, is_eliminated integer DEFAULT 0, draft_code text, submitted_code text, draft_updated_at timestamp, submitted_at timestamp, last_seen timestamp DEFAULT now(), joined_at timestamp DEFAULT now(), score integer DEFAULT 0, cash integer DEFAULT 0, coins_awarded integer DEFAULT 0, pending_round_score integer, score_multiplier_active integer DEFAULT 0, UNIQUE(room_id,user_name));
    CREATE TABLE arcade_round_history (id serial PRIMARY KEY, room_id integer NOT NULL, room_code varchar(10), room_name varchar(100), user_name varchar(50), round_num integer, code text, pass_count integer DEFAULT 0, total_count integer DEFAULT 0, quality_score integer DEFAULT 0, time_used_seconds integer DEFAULT 0, round_score integer DEFAULT 0, difficulty text, round_duration_mode text, match_ended_at timestamp, created_at timestamp DEFAULT now(), UNIQUE(room_id,user_name,round_num));
    CREATE TABLE arcade_effects (id serial PRIMARY KEY, room_id integer REFERENCES arcade_rooms(room_id) ON DELETE CASCADE);
    CREATE TABLE arcade_tasks (task_id serial PRIMARY KEY, work_chars integer, difficulty text, test_cases jsonb);
    CREATE TABLE arcade_player_stats (user_name varchar(50) PRIMARY KEY, matches_played integer DEFAULT 0, wins integer DEFAULT 0, best_rank integer, total_score integer DEFAULT 0, total_cash_earned integer DEFAULT 0, updated_at timestamp DEFAULT now());
    INSERT INTO users (username) VALUES ('alice'), ('bob'), ('outsider');
    INSERT INTO arcade_rooms (room_code,room_name,host_name) VALUES ('ARC-TEST','Test room','alice');
    INSERT INTO arcade_participants (room_id,user_name,is_host,draft_code) VALUES (1,'alice',1,'alice draft'),(1,'bob',0,'bob secret');
  `);
  if (beforeMigration) await beforeMigration(db);
  await migrateArcadeMatches(db);
  await require('../../arcade/migrate-rewards').migrateArcadeRewards(db);
  if (beforeShopMigration) await beforeShopMigration(db);
  await require('../../arcade/migrate-shop').migrateArcadeShop(db);
  await require('../../arcade/migrate-self-effects').migrateArcadeSelfEffects(db);
  await require('../../arcade/migrate-attacks').migrateArcadeAttacks(db);
  await require('../../arcade/migrate-bots').migrateArcadeBots(db);
  await require('../../arcade/migrate-drafts').migrateArcadeDrafts(db);
  await require('../../arcade/migrate-score-breakdown').migrateArcadeScoreBreakdown(db);
  const authSubjects = new Map();
  const authAdmin = { auth: {
    getUser: async token => {
      const user = authSubjects.get(token);
      return user
        ? { data: { user }, error: null }
        : { data: { user: null }, error: new Error('invalid token') };
    }
  } };
  const app = express();
  app.use(express.json());
  // Exercise the production Supabase bearer branch of installAuth. The
  // external token verifier is the only boundary stub; identity lookup,
  // confirmation, account status, actor checks and route middleware are real.
  const auth = installAuth(app, db, authAdmin, { AUTH_ALLOWED_ORIGINS: 'http://127.0.0.1' });
  await auth.ready;
  const authTokens = {};
  const bindAuth = async name => {
    const [[user]] = await db.query('SELECT user_id FROM users WHERE username = ?', [name]);
    if (!user) throw new Error(`Unknown fixture user: ${name}`);
    const authId = crypto.randomUUID();
    const email = `${name.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}.${user.user_id}@example.test`;
    const token = `arcade-test-${crypto.randomBytes(24).toString('hex')}`;
    await db.query('UPDATE users SET email = ? WHERE user_id = ?', [email, user.user_id]);
    await db.query(
      'INSERT INTO player_auth_identities (user_id,auth_user_id,email) VALUES (?,?,?)',
      [user.user_id, authId, email]
    );
    authSubjects.set(token, { id: authId, email, email_confirmed_at: '2026-01-01T00:00:00.000Z' });
    authTokens[name] = token;
  };
  const addUsers = async names => {
    for (const name of names) {
      await db.query('INSERT INTO users (username,level) VALUES (?,10)', [name]);
      await bindAuth(name);
    }
  };
  for (const name of ['alice', 'bob', 'outsider']) await bindAuth(name);
  require('../../arcade/bot-api').installArcadeBots(app, db);
  installArcadeSubmissions(app, db);
  require('../../arcade/shop-api').installArcadeShop(app, db);
  installArcadeRoomReads(app, db);
  require('../../arcade/room-membership').installArcadeRoomMembership(app, db);
  installArcadeMatchStart(app, db);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (url, { user = 'alice', body } = {}) => {
    const response = await fetch(base + url, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'X-PyArena-Request': '1', ...(user ? { Authorization: `Bearer ${authTokens[user]}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const raw = await response.text();
    let bodyValue;
    try { bodyValue = JSON.parse(raw); } catch { bodyValue = raw; }
    return { status: response.status, body: bodyValue };
  };
  return { db, pool, app, base, authTokens, addUsers, call };
}
module.exports = { arcadeFixture };
