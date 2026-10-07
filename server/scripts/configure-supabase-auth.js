// Run locally; secrets are read from server/.env and never printed.
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const nodemailer = require('nodemailer');

async function main() {
  const env = process.env;
  const site = env.CLIENT_URL || 'http://localhost:5174';
  const origins = [...new Set([site, ...(env.AUTH_ALLOWED_ORIGINS || 'http://localhost:5174,http://127.0.0.1:5174').split(',')].map(v => new URL(v.trim()).origin))];
  const host = env.AUTH_SMTP_HOST || 'smtp.gmail.com';
  const port = Number(env.AUTH_SMTP_PORT || 465);
  const user = env.AUTH_SMTP_USER || env.EMAIL_USER;
  const pass = env.AUTH_SMTP_PASS || env.EMAIL_PASS;
  const sender = env.AUTH_SMTP_SENDER || user;
  if (!user || !pass || !sender) throw new Error('Set AUTH_SMTP_USER/PASS/SENDER or the existing EMAIL_USER/EMAIL_PASS locally.');
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000 });
  try { await transport.verify(); console.log('SMTP connection/authentication verified (no email sent).'); }
  catch { throw new Error('SMTP verification failed. Gmail requires an App Password and 2-Step Verification. Check local credentials.'); }
  finally { transport.close(); }
  if (!process.argv.includes('--apply')) {
    console.log('Dry run only. Callback URLs:', origins.flatMap(origin => [`${origin}/login?auth=confirm`, `${origin}/login?auth=recovery`]));
    console.log('Use --apply after setting SUPABASE_ACCESS_TOKEN locally to configure Supabase Auth.');
    return;
  }
  if (!env.SUPABASE_ACCESS_TOKEN) throw new Error('SUPABASE_ACCESS_TOKEN is required for Management API configuration; never paste it into chat.');
  const ref = new URL(env.SUPABASE_URL).hostname.split('.')[0];
  const url = `https://api.supabase.com/v1/projects/${ref}/config/auth`;
  const headers = { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' };
  const currentResponse = await fetch(url, { headers });
  if (!currentResponse.ok) throw new Error(`Cannot inspect Auth configuration (HTTP ${currentResponse.status}).`);
  const current = await currentResponse.json();
  const redirects = [...new Set([...(current.uri_allow_list || '').split(',').filter(Boolean), ...origins.flatMap(origin => [`${origin}/login?auth=confirm`, `${origin}/login?auth=recovery`])])];
  const patch = { site_url: site, uri_allow_list: redirects.join(','), external_email_enabled: true,
    mailer_autoconfirm: false, smtp_host: host, smtp_port: String(port), smtp_user: user, smtp_pass: pass,
    smtp_admin_email: sender, smtp_sender_name: 'PyArena' };
  const response = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(patch) });
  if (!response.ok) throw new Error(`Auth configuration update failed (HTTP ${response.status}); response omitted to protect secrets.`);
  const check = await fetch(url, { headers });
  if (!check.ok) throw new Error('Auth configuration saved but could not be verified.');
  const result = await check.json();
  if (result.mailer_autoconfirm || result.smtp_host !== host || !result.external_email_enabled) throw new Error('Auth settings do not match expected configuration.');
  console.log('Supabase email confirmation, SMTP and callback URLs configured and verified.');
  console.log('Local URLs work only on this computer. Set CLIENT_URL to the real hosted URL before inviting public users.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
