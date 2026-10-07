const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Exercise the actual routes without importing db.js, whose startup seeds data.
const source = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
const block = source.slice(
  source.indexOf("const { createClient } = require('@supabase/supabase-js');"),
  source.indexOf("const db = require('./db');"),
);

async function request(route, { missing = false, fail = false, network = false } = {}) {
  const handlers = {};
  const calls = {};
  const query = {
    select(columns, options) { calls.columns = columns; calls.options = options; return this; },
    order() { return this; },
    limit(value) { calls.limit = value; return this; },
    async abortSignal() {
      if (network) throw new Error('sensitive upstream detail');
      return fail ? { error: { message: 'sensitive upstream detail' } } : { data: [{ item_id: 1 }] };
    },
  };
  vm.runInNewContext(block, {
    require: () => ({ createClient: () => ({ from(table) { calls.table = table; return query; } }) }),
    app: { get: (url, handler) => { handlers[url] = handler; } },
    process: { env: missing ? {} : { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_test' } },
    console: { warn() {} }, URL, AbortSignal,
  });
  const result = { status: 200 };
  const response = {
    set() { return this; },
    status(value) { result.status = value; return this; },
    json(value) { result.body = JSON.parse(JSON.stringify(value)); return this; },
  };
  await handlers[route]({ path: route }, response);
  return { ...result, calls };
}

test('health confirms a successful table query without returning rows', async () => {
  const result = await request('/api/health');
  assert.deepEqual(result.body, { connected: true });
  assert.equal(result.calls.table, 'arcade_items');
  assert.equal(result.calls.options.head, true);
});
test('table endpoint returns bounded public item metadata', async () => {
  const result = await request('/api/your-table');
  assert.deepEqual(result.body, [{ item_id: 1 }]);
  assert.equal(result.calls.limit, 20);
  assert.equal(result.calls.columns, 'item_id,item_code,name_th,name_en,price,icon,type');
});
test('missing configuration returns 503 without crashing other routes', async () => {
  const result = await request('/api/health', { missing: true });
  assert.equal(result.status, 503);
  assert.equal(result.body.connected, false);
});
for (const failure of ['fail', 'network']) {
  test(failure + ' returns 502 without leaking upstream details', async () => {
    const result = await request('/api/health', { [failure]: true });
    assert.equal(result.status, 502);
    assert.equal(result.body.connected, false);
    assert.ok(!JSON.stringify(result.body).includes('sensitive'));
  });
}
