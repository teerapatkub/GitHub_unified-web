const assert = require('node:assert/strict');
const test = require('node:test');

const baseUrl = String(process.env.TEST_DATA_API_URL || '').trim();
if (!baseUrl) {
  throw new Error('TEST_DATA_API_URL must point to a disposable PostgREST endpoint');
}

const request = async (path, options = {}) => fetch(new URL(path, baseUrl), {
  ...options,
  headers: {
    apikey: 'sb_publishable_d05_test_only',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  },
});

const assertDeniedWithoutLeak = async (response) => {
  const body = await response.text();
  assert.equal(response.ok, false);
  assert.ok([401, 403, 404].includes(response.status), `unexpected status ${response.status}`);
  assert.doesNotMatch(body, /password_hash|forbidden@example\.com/i);
};

test('anonymous Data API request cannot read the users table', async () => {
  await assertDeniedWithoutLeak(await request('/users?select=user_id,email,password_hash&limit=1'));
});

test('anonymous Data API request cannot insert into the users table', async () => {
  await assertDeniedWithoutLeak(await request('/users', {
    method: 'POST',
    body: JSON.stringify({
      username: 'forbidden-user',
      email: 'forbidden@example.com',
      password_hash: 'forbidden',
    }),
  }));
});
