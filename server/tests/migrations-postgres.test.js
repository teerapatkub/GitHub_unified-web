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

  await probe.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
      END IF;
    END
    $$
  `);

  const db = require('../db');
  const { applicationMigrations } = require('../server');
  const { defineMigration, getMigrationStatus, runMigrations } = require('../migrations');
  t.after(() => db.close());

  await db.ready;
  const initial = await runMigrations(db, applicationMigrations.slice(0, 2));

  // Reproduce the fingerprints already recorded by the existing hosted DB.
  // The migration runner must recognize them before applying 003/004, without
  // replaying either older schema migration.
  await db.query('UPDATE app_schema_migrations SET checksum = ? WHERE version = ?',
    ['510e97a03e7a71f55b55055336de1e859bfd2dc60faa8fed4f950837ee7ab36a', '202610120001']);
  await db.query('UPDATE app_schema_migrations SET checksum = ? WHERE version = ?',
    ['8c9265911bc8d2dadbade7190308d2ec791af3e441def0b2b480715ce09ea895', '202610120002']);
  const historical = await runMigrations(db, applicationMigrations);
  const second = await runMigrations(db, applicationMigrations);

  assert.equal(initial.ready, true);
  assert.equal(second.ready, true);
  assert.equal(historical.ready, true);
  assert.deepEqual(await getMigrationStatus(db, applicationMigrations), historical);

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
        'auth_provisioning_operations',
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
      'auth_provisioning_operations',
      'lesson_quiz_attempts',
      'lessons',
      'password_reset_tokens',
      'player_auth_identities',
      'player_google_sessions',
      'users',
    ],
  );

  const unsecuredTables = await probe.query(`
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND NOT c.relrowsecurity
    ORDER BY c.relname
  `);
  assert.deepEqual(unsecuredTables.rows, []);

  const unsafeViews = await probe.query(`
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'v'
      AND NOT COALESCE(c.reloptions, ARRAY[]::text[]) @> ARRAY['security_invoker=true']
    ORDER BY c.relname
  `);
  assert.deepEqual(unsafeViews.rows, []);

  const dataApiGrants = await probe.query(`
    SELECT grantee, table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND grantee IN ('anon', 'authenticated', 'PUBLIC')
    ORDER BY grantee, table_name, privilege_type
  `);
  assert.deepEqual(dataApiGrants.rows, []);

  const dataApiRoutineGrants = await probe.query(`
    SELECT grantee, routine_name, privilege_type
    FROM information_schema.role_routine_grants
    WHERE routine_schema = 'public'
      AND grantee IN ('anon', 'authenticated', 'PUBLIC')
    ORDER BY grantee, routine_name, privilege_type
  `);
  assert.deepEqual(dataApiRoutineGrants.rows, []);

  const schemaAccess = await probe.query(`
    SELECT has_schema_privilege('anon', 'public', 'USAGE') AS anon_usage,
           has_schema_privilege('authenticated', 'public', 'USAGE') AS authenticated_usage
  `);
  assert.deepEqual(schemaAccess.rows[0], {
    anon_usage: false,
    authenticated_usage: false,
  });

  const assertRoleCannotReadUsers = async (role) => {
    const client = await probe.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL ROLE ${role}`);
      await assert.rejects(
        client.query('SELECT user_id, email, password_hash FROM public.users LIMIT 1'),
        /permission denied/,
      );
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  };
  await assertRoleCannotReadUsers('anon');
  await assertRoleCannotReadUsers('authenticated');

  const assertRoleCannotWriteUsers = async (role) => {
    const client = await probe.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL ROLE ${role}`);
      await assert.rejects(
        client.query(`
          INSERT INTO public.users (username, email, password_hash)
          VALUES ('forbidden-user', 'forbidden@example.com', 'forbidden')
        `),
        /permission denied/,
      );
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  };
  await assertRoleCannotWriteUsers('anon');
  await assertRoleCannotWriteUsers('authenticated');

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
