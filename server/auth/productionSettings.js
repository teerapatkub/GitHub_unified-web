function exactHttpsOrigin(raw, name) {
  const text = String(raw || '').trim();
  let url;
  try { url = new URL(text); } catch { throw new Error(`${name} must be an exact HTTPS origin`); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/'
    || url.search || url.hash || (text !== url.origin && text !== `${url.origin}/`)
    || /^(localhost|127\.|\[::1\])/.test(url.host)) {
    throw new Error(`${name} must be an exact public HTTPS origin`);
  }
  return url.origin;
}

function required(env, name) {
  const value = String(env[name] || '').trim();
  if (!value) throw new Error(`${name} is required for production Auth`);
  return value;
}

// Google sign-in is Supabase's Google provider. Its credentials are setup-only
// (the management env file), set as a pair, or left out to keep the provider
// as it is.
function googleProvider(env) {
  const clientId = String(env.AUTH_GOOGLE_CLIENT_ID || '').trim();
  const secret = String(env.AUTH_GOOGLE_CLIENT_SECRET || '').trim();
  if (!clientId && !secret) return null;
  if (!/^[\w.-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
    throw new Error('AUTH_GOOGLE_CLIENT_ID must be an OAuth Web client id ending in .apps.googleusercontent.com');
  }
  if (!secret) throw new Error('AUTH_GOOGLE_CLIENT_SECRET is required with AUTH_GOOGLE_CLIENT_ID');
  return { clientId, secret };
}

function productionUrls(env) {
  const siteUrl = exactHttpsOrigin(required(env, 'PUBLIC_BASE_URL'), 'PUBLIC_BASE_URL');
  const clientUrl = exactHttpsOrigin(required(env, 'CLIENT_URL'), 'CLIENT_URL');
  if (clientUrl !== siteUrl) throw new Error('CLIENT_URL must exactly match PUBLIC_BASE_URL');

  const origins = [...new Set(required(env, 'AUTH_ALLOWED_ORIGINS').split(',')
    .map((value) => exactHttpsOrigin(value, 'AUTH_ALLOWED_ORIGINS')))];
  if (!origins.includes(siteUrl)) throw new Error('AUTH_ALLOWED_ORIGINS must include PUBLIC_BASE_URL');
  const google = googleProvider(env);
  const redirectUrls = origins.flatMap((origin) => [
    `${origin}/login?auth=confirm`, `${origin}/login?auth=recovery`,
    ...(google ? [`${origin}/login?auth=google`] : []),
  ]);
  return { siteUrl, origins, redirectUrls };
}

function buildProductionAuthSettings(env) {
  const { siteUrl, origins, redirectUrls } = productionUrls(env);
  const smtpHost = required(env, 'AUTH_SMTP_HOST');
  const smtpPort = Number(required(env, 'AUTH_SMTP_PORT'));
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error('AUTH_SMTP_PORT must be an integer from 1 to 65535');
  }
  const smtpUser = required(env, 'AUTH_SMTP_USER');
  const smtpPass = required(env, 'AUTH_SMTP_PASS');
  const sender = required(env, 'AUTH_SMTP_SENDER');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) throw new Error('AUTH_SMTP_SENDER must be an email address');
  const supabaseUrl = new URL(required(env, 'SUPABASE_URL'));
  if (supabaseUrl.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl.hostname)) {
    throw new Error('SUPABASE_URL must be the hosted Supabase project URL');
  }

  const patch = {
    site_url: siteUrl,
    uri_allow_list: redirectUrls.join(','),
    external_email_enabled: true,
    mailer_autoconfirm: false,
    mailer_secure_email_change_enabled: true,
    smtp_host: smtpHost,
    // A string: the Management API answers 400 "expected string" to a number.
    smtp_port: String(smtpPort),
    smtp_user: smtpUser,
    smtp_pass: smtpPass,
    smtp_admin_email: sender,
    smtp_sender_name: 'PyArena',
  };
  const google = googleProvider(env);
  if (google) {
    patch.external_google_enabled = true;
    patch.external_google_client_id = google.clientId;
    patch.external_google_secret = google.secret;
  }
  return { siteUrl, origins, redirectUrls, projectRef: supabaseUrl.hostname.split('.')[0], smtpPort, patch };
}

function matchesAppliedAuthSettings(actual, expected) {
  const receivedRedirects = String(actual.uri_allow_list || '').split(',').map((url) => url.trim()).filter(Boolean);
  const expectedRedirects = new Set(expected.redirectUrls);
  const receivedSet = new Set(receivedRedirects);
  return String(actual.site_url || '').replace(/\/$/, '') === expected.siteUrl
    && receivedSet.size === receivedRedirects.length
    && receivedSet.size === expectedRedirects.size
    && receivedRedirects.every((url) => expectedRedirects.has(url))
    && actual.external_email_enabled === true
    && actual.mailer_autoconfirm === false
    && actual.smtp_host === expected.patch.smtp_host
    && Number(actual.smtp_port) === expected.smtpPort
    && actual.smtp_admin_email === expected.patch.smtp_admin_email
    && (!expected.patch.external_google_enabled
      || (actual.external_google_enabled === true
        && actual.external_google_client_id === expected.patch.external_google_client_id));
}

module.exports = { productionUrls, buildProductionAuthSettings, matchesAppliedAuthSettings };
