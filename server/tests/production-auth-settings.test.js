const assert = require('node:assert/strict');
const test = require('node:test');
const { buildProductionAuthSettings, matchesAppliedAuthSettings } = require('../auth/productionSettings');
const { authOrigins } = require('../auth/origins');

const valid = () => ({
  SUPABASE_URL: 'https://project.supabase.co',
  PUBLIC_BASE_URL: 'https://play.example.com',
  CLIENT_URL: 'https://play.example.com',
  AUTH_ALLOWED_ORIGINS: 'https://play.example.com,https://preview.example.com',
  AUTH_SMTP_HOST: 'smtp.example.com',
  AUTH_SMTP_PORT: '587',
  AUTH_SMTP_USER: 'smtp-user',
  AUTH_SMTP_PASS: 'smtp-password',
  AUTH_SMTP_SENDER: 'no-reply@example.com',
});

test('production Auth settings use only exact HTTPS callbacks and explicit SMTP', () => {
  const settings = buildProductionAuthSettings(valid());
  assert.equal(settings.siteUrl, 'https://play.example.com');
  assert.deepEqual(settings.redirectUrls, [
    'https://play.example.com/login?auth=confirm',
    'https://play.example.com/login?auth=recovery',
    'https://preview.example.com/login?auth=confirm',
    'https://preview.example.com/login?auth=recovery',
  ]);
  assert.equal(settings.patch.smtp_admin_email, 'no-reply@example.com');
  // The Management API rejects a number here: "smtp_port: expected string" (HTTP 400, 2026-10-28).
  assert.equal(settings.patch.smtp_port, '587');
  assert.equal(settings.smtpPort, 587);
  assert.equal(matchesAppliedAuthSettings({ ...settings.patch, uri_allow_list: settings.redirectUrls.join(','), smtp_port: 587 }, settings), true);
  assert.equal(settings.patch.uri_allow_list.includes('localhost'), false);
  assert.equal(settings.patch.mailer_autoconfirm, false);
  assert.equal(matchesAppliedAuthSettings({
    ...settings.patch,
    uri_allow_list: settings.redirectUrls.join(','),
  }, settings), true);
  assert.equal(matchesAppliedAuthSettings({ ...settings.patch, site_url: 'http://localhost:5174' }, settings), false);
  assert.equal(matchesAppliedAuthSettings({ ...settings.patch, uri_allow_list: `${settings.patch.uri_allow_list},http://localhost:5174/login?auth=confirm` }, settings), false);
  assert.equal(matchesAppliedAuthSettings({ ...settings.patch, uri_allow_list: [settings.redirectUrls[0], settings.redirectUrls[0], ...settings.redirectUrls.slice(1, 3)].join(',') }, settings), false);
});

test('production Auth settings reject localhost, mismatched URLs, and implicit Gmail fallback', () => {
  assert.throws(() => buildProductionAuthSettings({ ...valid(), CLIENT_URL: 'http://localhost:5174' }), /CLIENT_URL/);
  assert.throws(() => buildProductionAuthSettings({ ...valid(), PUBLIC_BASE_URL: 'http://localhost:5174', CLIENT_URL: 'http://localhost:5174' }), /PUBLIC_BASE_URL/);
  assert.throws(() => buildProductionAuthSettings({ ...valid(), AUTH_ALLOWED_ORIGINS: 'https:\/\/play.example.com,localhost:5174' }), /AUTH_ALLOWED_ORIGINS/);
  assert.throws(() => buildProductionAuthSettings({ ...valid(), AUTH_ALLOWED_ORIGINS: 'https://play.example.com/**' }), /AUTH_ALLOWED_ORIGINS/);
  assert.throws(() => buildProductionAuthSettings({ ...valid(), AUTH_SMTP_PASS: '', EMAIL_PASS: 'legacy-password' }), /AUTH_SMTP_PASS/);
});

test('production CORS origins never include implicit development ports', () => {
  const origins = authOrigins({ ...valid(), NODE_ENV: 'production', PORT: '3001' });
  assert.deepEqual([...origins], ['https://play.example.com', 'https://preview.example.com']);
  assert.equal(origins.has('http://localhost:3001'), false);
});

test('Google sign-in is enabled through Supabase only with both setup-only credentials', () => {
  const google = { ...valid(), AUTH_GOOGLE_CLIENT_ID: '123-abc.apps.googleusercontent.com', AUTH_GOOGLE_CLIENT_SECRET: 'google-secret' };
  const settings = buildProductionAuthSettings(google);
  assert.ok(settings.redirectUrls.includes('https://play.example.com/login?auth=google'));
  assert.equal(settings.patch.external_google_enabled, true);
  assert.equal(settings.patch.external_google_client_id, '123-abc.apps.googleusercontent.com');
  assert.equal(settings.patch.external_google_secret, 'google-secret');
  const applied = { ...settings.patch, uri_allow_list: settings.redirectUrls.join(',') };
  assert.equal(matchesAppliedAuthSettings(applied, settings), true);
  assert.equal(matchesAppliedAuthSettings({ ...applied, external_google_enabled: false }, settings), false);
  assert.equal(matchesAppliedAuthSettings({ ...applied, external_google_client_id: 'other.apps.googleusercontent.com' }, settings), false);

  // Without Google credentials the patch leaves the provider alone.
  assert.equal('external_google_enabled' in buildProductionAuthSettings(valid()).patch, false);
  assert.throws(() => buildProductionAuthSettings({ ...valid(), AUTH_GOOGLE_CLIENT_ID: '123-abc.apps.googleusercontent.com' }), /AUTH_GOOGLE_CLIENT_SECRET/);
  assert.throws(() => buildProductionAuthSettings({ ...valid(), AUTH_GOOGLE_CLIENT_ID: 'not-a-client-id', AUTH_GOOGLE_CLIENT_SECRET: 's' }), /AUTH_GOOGLE_CLIENT_ID/);
});

// The setup script once read server/.env, which points at the test project, so
// --apply would have rewritten the wrong project's Auth. It reads the same env
// file as docker compose (PYARENA_ENV_FILE, from the repository root).
test('the Auth setup script configures the project in the compose env file', async t => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { execFile } = require('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyarena-auth-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const envFile = path.join(dir, 'compose.env');
  fs.writeFileSync(envFile, [
    'SUPABASE_URL=https://prodref.supabase.co',
    'PUBLIC_BASE_URL=https://pyarena.example.ts.net',
    'AUTH_ALLOWED_ORIGINS=https://pyarena.example.ts.net',
  ].join('\n'));
  const { AUTH_SMTP_HOST, AUTH_SMTP_PORT, AUTH_SMTP_USER, AUTH_SMTP_PASS, AUTH_SMTP_SENDER } = valid();
  const run = () => new Promise(resolve => execFile(process.execPath, [path.join(__dirname, '../scripts/configure-supabase-auth.js'), '--check'], {
    env: { PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, PYARENA_ENV_FILE: envFile, AUTH_SMTP_HOST, AUTH_SMTP_PORT, AUTH_SMTP_USER, AUTH_SMTP_PASS, AUTH_SMTP_SENDER },
  }, (error, stdout, stderr) => resolve({ code: error ? error.code : 0, stdout, stderr })));
  const result = await run();
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Supabase project: prodref\b/);
  // CLIENT_URL is filled from PUBLIC_BASE_URL, as compose does for the app.
  assert.match(result.stdout, /Site URL: https:\/\/pyarena\.example\.ts\.net/);
});
