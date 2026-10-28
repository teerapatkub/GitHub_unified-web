// Setup-only command. No Management API token or SMTP password enters app runtime.
const path = require('node:path');
const nodemailer = require('nodemailer');
const { buildProductionAuthSettings, matchesAppliedAuthSettings } = require('../auth/productionSettings');

// The same env file docker compose gives the app (PYARENA_ENV_FILE, relative to
// the repository root), so this configures the project the app will run on.
// Not server/.env: that one points at the test project.
const envFile = path.resolve(__dirname, '../..', process.env.PYARENA_ENV_FILE || 'server/.env.production.local');
require('dotenv').config({ path: envFile, quiet: true });
require('dotenv').config({ path: path.join(__dirname, '../.supabase-management.env'), quiet: true, override: true });
// Compose sets the app's CLIENT_URL from PUBLIC_BASE_URL; do the same here.
process.env.CLIENT_URL ||= process.env.PUBLIC_BASE_URL;

async function main() {
  const args = new Set(process.argv.slice(2));
  if ([...args].some((arg) => !['--check', '--verify-smtp', '--apply'].includes(arg)) || args.size > 1) {
    throw new Error('Use --check, --verify-smtp, or --apply');
  }
  console.log(`Env file: ${path.relative(path.resolve(__dirname, '../..'), envFile)}`);
  const settings = buildProductionAuthSettings(process.env);
  console.log(`Supabase project: ${settings.projectRef}`);
  console.log('Production Auth configuration is valid.');
  console.log(`Site URL: ${settings.siteUrl}`);
  console.log(`Exact callback URLs: ${settings.redirectUrls.join(', ')}`);
  if (!args.has('--verify-smtp') && !args.has('--apply')) return;

  const transport = nodemailer.createTransport({
    host: settings.patch.smtp_host,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465,
    auth: { user: settings.patch.smtp_user, pass: settings.patch.smtp_pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
  try {
    await transport.verify();
    console.log('SMTP connection and authentication verified; no message was sent.');
  } catch {
    throw new Error('SMTP verification failed; check host, port, account, password and sender settings.');
  } finally {
    transport.close();
  }
  if (!args.has('--apply')) return;

  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error('SUPABASE_ACCESS_TOKEN is required in the setup-only management environment.');
  const url = `https://api.supabase.com/v1/projects/${settings.projectRef}/config/auth`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const currentResponse = await fetch(url, { headers });
  if (!currentResponse.ok) throw new Error(`Cannot inspect Auth configuration (HTTP ${currentResponse.status}).`);
  const response = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(settings.patch) });
  if (!response.ok) throw new Error(`Auth configuration update failed (HTTP ${response.status}); response omitted to protect secrets.`);
  const check = await fetch(url, { headers });
  if (!check.ok) throw new Error(`Auth configuration saved but verification failed (HTTP ${check.status}).`);
  if (!matchesAppliedAuthSettings(await check.json(), settings)) {
    throw new Error('Auth settings differ from the requested production URLs, SMTP or Google configuration.');
  }
  console.log(`Supabase production Auth URLs and SMTP settings saved and verified${settings.patch.external_google_enabled ? ', Google provider enabled' : ''}.`);
  console.log('External mailbox signup and recovery still require a separate end-to-end test.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
