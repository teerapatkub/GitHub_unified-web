const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');

const databaseUrl = String(process.env.TEST_DATABASE_URL || '').trim();
if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL must point to a disposable PostgreSQL database');
}

const databaseName = new URL(databaseUrl).pathname.replace(/^\//, '');
if (!/^pyarena[_-].*test|^pyarena[_-]d03$/i.test(databaseName)) {
  throw new Error(`Refusing to migrate non-test database: ${databaseName}`);
}

process.env.DATABASE_URL = databaseUrl;
process.env.PGSSLMODE = process.env.TEST_DATABASE_SSLMODE || 'disable';
process.env.SUPABASE_URL ||= 'https://example.supabase.co';
process.env.SUPABASE_SECRET_KEY ||= 'sb_secret_d03_test_only';

test('fresh PostgreSQL installs the complete application schema repeatably', async (t) => {
  const probe = new Pool({ connectionString: databaseUrl, ssl: false });
  t.after(() => probe.end());
  const beforeResult = await probe.query(`
    SELECT COUNT(*)::int AS count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name NOT LIKE 'pg_%'
  `);
  assert.equal(beforeResult.rows[0].count, 0, 'the integration database must start empty');

  const db = require('../db');
  const { applicationMigrations } = require('../server');
  const { defineMigration, getMigrationStatus, runMigrations } = require('../migrations');
  t.after(() => db.close());

  await db.ready;
  const first = await runMigrations(db, applicationMigrations);
  const second = await runMigrations(db, applicationMigrations);

  assert.equal(first.ready, true);
  assert.equal(second.ready, true);
  assert.deepEqual(await getMigrationStatus(db, applicationMigrations), second);

  const [requiredTables] = await db.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'users',
        'lessons',
        'arcade_rooms',
        'arcade_matches',
        'lesson_quiz_attempts',
        'password_reset_tokens',
        'player_auth_identities',
        'player_google_sessions',
        'app_schema_migrations'
      )
    ORDER BY table_name
  `);
  assert.deepEqual(
    requiredTables.map((row) => row.table_name),
    [
      'app_schema_migrations',
      'arcade_matches',
      'arcade_rooms',
      'lesson_quiz_attempts',
      'lessons',
      'password_reset_tokens',
      'player_auth_identities',
      'player_google_sessions',
      'users',
    ],
  );

  let concurrentCalls = 0;
  const concurrentMigration = defineMigration({
    version: '209901010000',
    name: 'concurrent_start_test',
    signature: 'concurrent-start-v1',
    up: async () => {
      concurrentCalls += 1;
      await db.query('CREATE TABLE d03_concurrent_start (id INTEGER PRIMARY KEY)');
      await db.query('INSERT INTO d03_concurrent_start (id) VALUES (1)');
    },
  });
  await Promise.all([
    runMigrations(db, [...applicationMigrations, concurrentMigration]),
    runMigrations(db, [...applicationMigrations, concurrentMigration]),
  ]);
  const [[concurrentRows]] = await db.query('SELECT COUNT(*)::int AS count FROM d03_concurrent_start');
  assert.equal(concurrentCalls, 1);
  assert.equal(concurrentRows.count, 1);

  const failedMigration = defineMigration({
    version: '209901010001',
    name: 'forced_failure_test',
    signature: 'forced-failure-v1',
    up: async () => {
      await db.query('CREATE TABLE d03_must_rollback (id INTEGER PRIMARY KEY)');
      throw new Error('forced migration failure');
    },
  });
  await assert.rejects(
    runMigrations(db, [...applicationMigrations, failedMigration]),
    /forced migration failure/,
  );

  const [[rolledBackTable]] = await db.query(`
    SELECT to_regclass('public.d03_must_rollback') AS relation
  `);
  const [[rolledBackVersion]] = await db.query(`
    SELECT COUNT(*)::int AS count
    FROM app_schema_migrations
    WHERE version = ?
  `, [failedMigration.version]);
  assert.equal(rolledBackTable.relation, null);
  assert.equal(rolledBackVersion.count, 0);
});
