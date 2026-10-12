const assert = require('node:assert/strict');
const test = require('node:test');

const { applyDataApiSecurity } = require('../security/data-api-security');

class SecurityDatabase {
  constructor({ relations, roles = ['anon', 'authenticated'] }) {
    this.relations = relations;
    this.roles = roles;
    this.statements = [];
  }

  async query(sql) {
    if (/FROM pg_roles/.test(sql)) {
      return [this.roles.map((name) => ({ name })), []];
    }
    if (/FROM pg_class/.test(sql)) return [this.relations, []];
    if (/FROM pg_proc/.test(sql)) return [[], []];
    throw new Error(`Unexpected query: ${sql}`);
  }

  async raw(sql) {
    this.statements.push(sql.trim());
  }
}

test('locks tables, views, sequences, schema and future objects for Data API roles', async () => {
  const database = new SecurityDatabase({
    relations: [
      { name: 'users', kind: 'r', owned: true },
      { name: 'lesson summary', kind: 'v', owned: true },
      { name: 'users_user_id_seq', kind: 'S', owned: true },
    ],
  });

  const result = await applyDataApiSecurity(database);
  const sql = database.statements.join('\n');

  assert.deepEqual(result, { tables: 1, views: 1, sequences: 1, roles: 2 });
  assert.match(sql, /ALTER TABLE public\."users" ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON TABLE public\."users" FROM PUBLIC/);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON TABLE public\."users" FROM "anon"/);
  assert.match(sql, /ALTER VIEW public\."lesson summary" SET \(security_invoker = true\)/);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON SEQUENCE public\."users_user_id_seq" FROM "authenticated"/);
  assert.match(sql, /REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC/);
  assert.match(sql, /ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM "authenticated"/);
});

test('fails closed when the migration role does not own a public relation', async () => {
  const database = new SecurityDatabase({
    relations: [
      { name: 'users', kind: 'r', owned: true },
      { name: 'foreign_view', kind: 'v', owned: false },
    ],
  });

  await assert.rejects(
    applyDataApiSecurity(database),
    /Cannot secure public relations not owned by the migration role: foreign_view/,
  );
  assert.deepEqual(database.statements, []);
});

test('quotes catalog identifiers before using them in security DDL', async () => {
  const database = new SecurityDatabase({
    relations: [{ name: 'odd"table', kind: 'r', owned: true }],
    roles: [],
  });

  await applyDataApiSecurity(database);
  assert.match(
    database.statements.join('\n'),
    /public\."odd""table"/,
  );
});
