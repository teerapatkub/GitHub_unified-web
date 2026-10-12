const assert = require('node:assert/strict');
const test = require('node:test');

const baseUrl = String(process.env.TEST_DATA_API_URL || '').trim();
if (!baseUrl) {
  throw new Error('TEST_DATA_API_URL must point to a disposable PostgREST endpoint');
}
const apiKey = String(process.env.TEST_DATA_API_KEY || '').trim();
if (!apiKey) {
  throw new Error('TEST_DATA_API_KEY must be a valid key for the disposable Data API endpoint');
}

const dataApiUrl = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

const request = async (path, options = {}) => fetch(new URL(path, dataApiUrl), {
  ...options,
  headers: {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  },
});

const assertDeniedWithoutLeak = async (response) => {
  const body = await response.json();
  assert.equal(response.ok, false);
  assert.ok([401, 403].includes(response.status), `unexpected status ${response.status}`);
  assert.equal(body.code, '42501');
  assert.match(body.message, /permission denied/i);
  assert.doesNotMatch(JSON.stringify(body), /password_hash|forbidden@example\.com/i);
};

test('Data API credentials reach the disposable PostgREST endpoint', async () => {
  const response = await request('');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /openapi|json/i);
});

test('anonymous Data API request cannot read the users table', async () => {
  await assertDeniedWithoutLeak(await request('users?select=user_id,email,password_hash&limit=1'));
});

test('anonymous Data API request cannot insert into the users table', async () => {
  await assertDeniedWithoutLeak(await request('users', {
    method: 'POST',
    body: JSON.stringify({
      username: 'forbidden-user',
      email: 'forbidden@example.com',
      password_hash: 'forbidden',
    }),
  }));
});
