const { migrateArcadeMatches } = require('../../arcade/migrate-matches');
const { Pool } = require('pg');
const crypto = require('node:crypto');
const express = require('express');
const { installAuth } = require('../../auth');
const { installArcadeMatchStart } = require('../../arcade/match-api');
const { installArcadeRoomReads } = require('../../arcade/room-api');

// Never load server/.env. Tests require an explicit disposable PostgreSQL target.
async function arcadeFixture(t, { beforeMigration } = {}) {
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
    CREATE TABLE users (user_id serial PRIMARY KEY, username text UNIQUE, role text DEFAULT 'user', level integer DEFAULT 10, is_deleted integer DEFAULT 0, is_banned integer DEFAULT 0, ban_until timestamptz);
    CREATE TABLE arcade_rooms (room_id serial PRIMARY KEY, room_code varchar(10), room_name varchar(100), host_name varchar(50), password text, max_players integer DEFAULT 5, status text DEFAULT 'WAITING', phase text DEFAULT 'LOBBY', phase_deadline timestamp, current_round integer DEFAULT 0, last_round_summary jsonb, round_task_ids jsonb, difficulty text DEFAULT 'default', round_duration_mode text DEFAULT 'standard', created_at timestamp DEFAULT now());
    CREATE TABLE arcade_participants (id serial PRIMARY KEY, room_id integer REFERENCES arcade_rooms(room_id) ON DELETE CASCADE, user_name varchar(50), is_host integer DEFAULT 0, has_submitted integer DEFAULT 0, is_eliminated integer DEFAULT 0, draft_code text, submitted_code text, draft_updated_at timestamp, submitted_at timestamp, last_seen timestamp DEFAULT now(), joined_at timestamp DEFAULT now(), score integer DEFAULT 0, cash integer DEFAULT 0, coins_awarded integer DEFAULT 0, pending_round_score integer, score_multiplier_active integer DEFAULT 0, UNIQUE(room_id,user_name));
    CREATE TABLE arcade_round_history (id serial PRIMARY KEY, room_id integer NOT NULL, room_code varchar(10), room_name varchar(100), user_name varchar(50), round_num integer, code text, pass_count integer DEFAULT 0, total_count integer DEFAULT 0, quality_score integer DEFAULT 0, time_used_seconds integer DEFAULT 0, round_score integer DEFAULT 0, difficulty text, round_duration_mode text, match_ended_at timestamp, created_at timestamp DEFAULT now(), UNIQUE(room_id,user_name,round_num));
    CREATE TABLE arcade_effects (id serial PRIMARY KEY, room_id integer REFERENCES arcade_rooms(room_id) ON DELETE CASCADE);
    CREATE TABLE arcade_tasks (task_id serial PRIMARY KEY, work_chars integer, difficulty text);
    INSERT INTO users (username) VALUES ('alice'), ('bob'), ('outsider');
    INSERT INTO arcade_rooms (room_code,room_name,host_name) VALUES ('ARC-TEST','Test room','alice');
    INSERT INTO arcade_participants (room_id,user_name,is_host,draft_code) VALUES (1,'alice',1,'alice draft'),(1,'bob',0,'bob secret');
  `);
  if (beforeMigration) await beforeMigration(db);
  await migrateArcadeMatches(db);
  const app = express();
  app.use(express.json());
  const auth = installAuth(app, db, null, {});
  await auth.ready;
  const cookies = {};
  for (const [index, name] of ['alice', 'bob', 'outsider'].entries()) {
    const token = crypto.randomBytes(32).toString('hex');
    await db.query('INSERT INTO player_google_sessions (token_hash,user_id,expires_at) VALUES (?,?,?)', [crypto.createHash('sha256').update(token).digest('hex'), index + 1, new Date(Date.now() + 3600000)]);
    cookies[name] = `pyarena_google_session=${token}`;
  }
  installArcadeRoomReads(app, db);
  installArcadeMatchStart(app, db);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (url, { user = 'alice', body } = {}) => {
    const response = await fetch(base + url, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'X-PyArena-Request': '1', ...(user ? { Cookie: cookies[user] } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const raw = await response.text();
    let bodyValue;
    try { bodyValue = JSON.parse(raw); } catch { bodyValue = raw; }
    return { status: response.status, body: bodyValue };
  };
  return { db, pool, app, base, cookies, call };
}
module.exports = { arcadeFixture };
