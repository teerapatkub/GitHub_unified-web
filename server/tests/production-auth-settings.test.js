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
