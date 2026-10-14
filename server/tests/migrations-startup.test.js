const assert = require('node:assert/strict');
const { EventEmitter, once } = require('node:events');
const http = require('node:http');
const test = require('node:test');

const express = require('express');

const {
  defineMigration,
  getMigrationStatus,
  runMigrations,
} = require('../migrations');
const {
  createStartupState,
  installHealthRoutes,
  installStartupGate,
  startApplication,
} = require('../runtime/startup');
const { createSupabaseAuthCheck } = require('../runtime/readiness');

class MemoryMigrationDatabase {
  constructor() {
    this.applied = new Map();
    this.tableExists = false;
    this.transactionTail = Promise.resolve();
  }

  async query(sql, params = []) {
    if (/^\s*CREATE TABLE IF NOT EXISTS app_schema_migrations/i.test(sql)) {
      this.tableExists = true;
      return [{ affectedRows: 0 }, []];
    }
    if (/pg_advisory_xact_lock/i.test(sql)) {
      return [[{ locked: true }], []];
    }
    if (/^\s*SELECT version, name, checksum/i.test(sql)) {
      if (!this.tableExists) {
        const error = new Error('relation app_schema_migrations does not exist');
        error.code = '42P01';
        throw error;
      }
      const rows = [...this.applied.values()].sort((a, b) => a.version.localeCompare(b.version));
      return [rows, []];
    }
    if (/^\s*INSERT INTO app_schema_migrations/i.test(sql)) {
      const [version, name, checksum] = params;
      this.applied.set(version, { version, name, checksum });
      return [{ affectedRows: 1 }, []];
    }
    throw new Error(`Unexpected SQL in migration test: ${sql}`);
  }

  async transaction(work) {
    let release;
    const previous = this.transactionTail;
    this.transactionTail = new Promise((resolve) => { release = resolve; });
    await previous;
    const snapshot = new Map(this.applied);
    const tableExists = this.tableExists;
    try {
      return await work();
    } catch (error) {
      this.applied = snapshot;
      this.tableExists = tableExists;
      throw error;
    } finally {
      release();
    }
  }
}

const requestJson = (server, path, method = 'GET') => new Promise((resolve, reject) => {
  const address = server.address();
  const request = http.request({ host: '127.0.0.1', port: address.port, path, method }, (response) => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve({
      status: response.statusCode,
      headers: response.headers,
      body: JSON.parse(body),
    }));
  });
  request.on('error', reject);
  request.end();
});

test('versioned migrations apply in order once and report the required version', async () => {
  const database = new MemoryMigrationDatabase();
  const calls = [];
  const migrations = [
    defineMigration({ version: '202610120001', name: 'core_schema', signature: 'core-v1', up: async () => calls.push('core') }),
    defineMigration({ version: '202610120002', name: 'application_schema', signature: 'application-v1', up: async () => calls.push('application') }),
  ];

  await runMigrations(database, migrations);
  await runMigrations(database, migrations);

  assert.deepEqual(calls, ['core', 'application']);
  assert.deepEqual(await getMigrationStatus(database, migrations), {
    ready: true,
    currentVersion: '202610120002',
    requiredVersion: '202610120002',
    pendingVersions: [],
  });
});

test('a failed migration is not recorded and can be retried', async () => {
  const database = new MemoryMigrationDatabase();
  let shouldFail = true;
  const calls = [];
  const migrations = [
    defineMigration({ version: '202610120001', name: 'core_schema', signature: 'core-v1', up: async () => calls.push('core') }),
    defineMigration({
      version: '202610120002',
      name: 'application_schema',
      signature: 'application-v1',
      up: async () => {
        calls.push('application');
        if (shouldFail) throw new Error('migration failed');
      },
    }),
  ];

  await assert.rejects(runMigrations(database, migrations), /migration failed/);
  assert.deepEqual([...database.applied.keys()], ['202610120001']);

  shouldFail = false;
  await runMigrations(database, migrations);

  assert.deepEqual(calls, ['core', 'application', 'application']);
  assert.equal((await getMigrationStatus(database, migrations)).ready, true);
});

test('an applied migration cannot be edited in place', async () => {
  const database = new MemoryMigrationDatabase();
  const original = defineMigration({
    version: '202610120001',
    name: 'core_schema',
    signature: 'core-v1',
    up: async () => {},
  });
  await runMigrations(database, [original]);

  const edited = defineMigration({
    version: '202610120001',
    name: 'core_schema',
    signature: 'core-v2',
    up: async () => {},
  });

  await assert.rejects(
    getMigrationStatus(database, [edited]),
    /create a new migration instead of editing it/,
  );
});

test('migration signatures are stable across Windows and Unix line endings', () => {
  const details = { version: '202610120005', name: 'line_endings', up: async () => {} };
  assert.equal(
    defineMigration({ ...details, signature: 'first\r\nsecond' }).checksum,
    defineMigration({ ...details, signature: 'first\nsecond' }).checksum,
  );
});

test('the previously applied core schema fingerprint remains readable without accepting arbitrary edits', async () => {
  const { coreMigrations } = require('../db');
  const database = new MemoryMigrationDatabase();
  database.tableExists = true;
  database.applied.set('202610120001', {
    version: '202610120001',
    name: 'core_schema',
    checksum: '510e97a03e7a71f55b55055336de1e859bfd2dc60faa8fed4f950837ee7ab36a',
  });
  assert.equal((await getMigrationStatus(database, coreMigrations)).ready, true);

  database.applied.get('202610120001').checksum = 'incorrect-checksum';
  await assert.rejects(getMigrationStatus(database, coreMigrations), /create a new migration/);
});

test('the previously applied application schema fingerprint is accepted only for the known revision', async () => {
  const database = new MemoryMigrationDatabase();
  database.tableExists = true;
  database.applied.set('202610120002', {
    version: '202610120002',
    name: 'application_schema',
    checksum: '8c9265911bc8d2dadbade7190308d2ec791af3e441def0b2b480715ce09ea895',
  });
  const current = {
    version: '202610120002',
    name: 'application_schema',
    checksum: 'd8dc162c488575994f322131575bb72190fe8ee8770843fa099d2241467c86cc',
    up: async () => {},
  };
  assert.equal((await getMigrationStatus(database, [current])).ready, true);
  await assert.rejects(getMigrationStatus(database, [{ ...current, checksum: 'new-source-edit' }]), /create a new migration/);
});

test('an older binary is not ready against migration versions it does not know', async () => {
  const database = new MemoryMigrationDatabase();
  const core = defineMigration({
    version: '202610120001',
    name: 'core_schema',
    signature: 'core-v1',
    up: async () => {},
  });
  const application = defineMigration({
    version: '202610120002',
    name: 'application_schema',
    signature: 'application-v1',
    up: async () => {},
  });
  await runMigrations(database, [core, application]);

  assert.deepEqual(await getMigrationStatus(database, [core]), {
    ready: false,
    currentVersion: '202610120002',
    requiredVersion: '202610120001',
    pendingVersions: [],
    incompatibleVersions: ['202610120002'],
  });
  assert.equal((await getMigrationStatus(database, [core], { allowNewer: true })).ready, true);
});

test('readiness status stays read-only before the migration table exists', async () => {
  const database = new MemoryMigrationDatabase();
  const migration = defineMigration({
    version: '202610120001',
    name: 'core_schema',
    signature: 'core-v1',
    up: async () => {},
  });

  assert.deepEqual(await getMigrationStatus(database, [migration]), {
    ready: false,
    currentVersion: null,
    requiredVersion: '202610120001',
    pendingVersions: ['202610120001'],
  });
  assert.equal(database.tableExists, false);
});

test('concurrent starters serialize the first migration', async () => {
  const database = new MemoryMigrationDatabase();
  let calls = 0;
  const migration = defineMigration({
    version: '202610120001',
    name: 'core_schema',
    signature: 'core-v1',
    up: async () => {
      calls += 1;
      await new Promise((resolve) => setImmediate(resolve));
    },
  });

  const [first, second] = await Promise.all([
    runMigrations(database, [migration]),
    runMigrations(database, [migration]),
  ]);

  assert.equal(calls, 1);
  assert.equal(first.ready, true);
  assert.equal(second.ready, true);
});

test('startup closes its listener when preparation fails', async () => {
  const server = new EventEmitter();
  let closed = false;
  server.close = (callback) => {
    closed = true;
    callback();
  };
  const app = {
    listen(_port, callback) {
      queueMicrotask(callback);
      return server;
    },
  };
  const state = createStartupState();

  await assert.rejects(
    startApplication({
      app,
      port: 3001,
      prepare: async () => { throw new Error('database unavailable'); },
      state,
    }),
    /database unavailable/,
  );
  assert.equal(closed, true);
  assert.equal(state.ready, false);
  assert.equal(state.failed, true);
});

test('startup validates configuration before binding a port', async () => {
  let listened = false;
  const app = {
    listen() {
      listened = true;
      throw new Error('must not listen');
    },
  };
  const state = createStartupState();

  await assert.rejects(
    startApplication({
      app,
      port: 3001,
      validate: () => { throw new Error('invalid production environment'); },
      prepare: async () => {},
      state,
    }),
    /invalid production environment/,
  );
  assert.equal(listened, false);
  assert.equal(state.ready, false);
});

test('only health traffic is served until preparation succeeds', async (t) => {
  const app = express();
  const state = createStartupState();
  installStartupGate(app, state);
  installHealthRoutes(app, {
    state,
    checkReadiness: async () => {
      return { currentVersion: '202610120002', requiredVersion: '202610120002' };
    },
  });
  app.get('/api/data', (_req, res) => res.json({ value: 42 }));

  let releasePreparation;
  const preparation = new Promise((resolve) => { releasePreparation = resolve; });
  let server;
  const originalListen = app.listen.bind(app);
  app.listen = (...args) => {
    server = originalListen(...args);
    return server;
  };
  const startup = startApplication({
    app,
    port: 0,
    host: '127.0.0.1',
    prepare: () => preparation,
    state,
  });
  if (!server.listening) await once(server, 'listening');
  t.after(() => {
    if (!server.listening) return undefined;
    return new Promise((resolve) => server.close(resolve));
  });

  const live = await requestJson(server, '/api/health/live');
  assert.equal(live.status, 200);
  assert.deepEqual(live.body, { status: 'alive' });
  assert.equal(live.headers['cache-control'], 'no-store');

  const unavailable = await requestJson(server, '/api/health/ready');
  assert.equal(unavailable.status, 503);
  assert.deepEqual(unavailable.body, { status: 'not-ready', error: 'Dependencies are not ready' });

  const gated = await requestJson(server, '/api/data');
  assert.equal(gated.status, 503);
  assert.deepEqual(gated.body, { error: 'Application is starting' });
  const preflight = await requestJson(server, '/api/data', 'OPTIONS');
  assert.equal(preflight.status, 503);
  assert.deepEqual(preflight.body, { error: 'Application is starting' });

  releasePreparation();
  await startup;
  const available = await requestJson(server, '/api/health');
  assert.equal(available.status, 200);
  assert.deepEqual(available.body, {
    status: 'ready',
    migrationVersion: '202610120002',
  });
  const data = await requestJson(server, '/api/data');
  assert.equal(data.status, 200);
  assert.deepEqual(data.body, { value: 42 });
});

test('failed dependency readiness closes application traffic until recovery', async (t) => {
  const app = express();
  const state = createStartupState();
  let healthy = true;
  installStartupGate(app, state);
  installHealthRoutes(app, {
    state,
    checkReadiness: async () => {
      if (!healthy) throw new Error('database unavailable');
      return { currentVersion: '202610120004' };
    },
  });
  app.get('/api/data', (_req, res) => res.json({ value: 42 }));
  const server = await startApplication({
    app, port: 0, host: '127.0.0.1', prepare: async () => {}, state,
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  assert.equal((await requestJson(server, '/api/data')).status, 200);
  healthy = false;
  assert.equal((await requestJson(server, '/api/health/ready')).status, 503);
  assert.equal((await requestJson(server, '/api/data')).status, 503);
  healthy = true;
  assert.equal((await requestJson(server, '/api/health/ready')).status, 200);
  assert.equal((await requestJson(server, '/api/data')).status, 200);
});

test('Supabase Auth readiness requires complete configuration and probes Auth directly', async () => {
  const incomplete = createSupabaseAuthCheck({
    url: 'https://example.supabase.co',
    secretKey: 'sb_secret_test',
    publishableKey: '',
    fetchImpl: async () => ({ ok: true }),
  });
  await assert.rejects(incomplete(), /configuration is incomplete/);

  const requests = [];
  let now = 1000;
  const check = createSupabaseAuthCheck({
    url: 'https://example.supabase.co',
    secretKey: 'sb_secret_test',
    publishableKey: 'sb_publishable_test',
    fetchImpl: async (url, options) => {
      requests.push({ url: String(url), options });
      return { ok: true, status: 200 };
    },
    now: () => now,
  });

  await Promise.all([check(), check()]);
  await check();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://example.supabase.co/auth/v1/health');
  assert.equal(requests[0].options.headers.apikey, 'sb_secret_test');

  now += 10001;
  await check();
  assert.equal(requests.length, 2);
});
