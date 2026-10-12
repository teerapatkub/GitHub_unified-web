const path = require('node:path');

const value = (env, name) => String(env[name] || '').trim();

const parseHttpUrl = (raw, name) => {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`${name} must be an absolute HTTP(S) URL`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error(`${name} must be an absolute HTTP(S) URL without credentials`);
  }
  return parsed;
};

const requireValue = (env, name) => {
  const result = value(env, name);
  if (!result) throw new Error(`${name} is required in production`);
  return result;
};

const assertNoPrivilegedBrowserValues = (env) => {
  const forbidden = Object.keys(env).filter((name) => (
    /^VITE_.*(?:SECRET|SERVICE_ROLE|ACCESS_TOKEN)/i.test(name)
    && value(env, name)
  ));
  if (forbidden.length > 0) {
    throw new Error(`${forbidden.sort().join(', ')} is forbidden in a browser build`);
  }
};

const validateClientBuildEnvironment = (env = process.env) => {
  assertNoPrivilegedBrowserValues(env);
  const supabaseUrl = parseHttpUrl(
    requireValue(env, 'VITE_SUPABASE_URL'),
    'VITE_SUPABASE_URL',
  );
  const publishableKey = requireValue(env, 'VITE_SUPABASE_PUBLISHABLE_KEY');
  if (!publishableKey.startsWith('sb_publishable_')) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY must use an sb_publishable_ key');
  }
  return { supabaseUrl: supabaseUrl.href };
};

const validateDatabaseEnvironment = (env) => {
  const databaseUrl = value(env, 'DATABASE_URL');
  if (databaseUrl) {
    let parsed;
    try {
      parsed = new URL(databaseUrl);
    } catch {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL');
    }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname) {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL');
    }
    return;
  }

  const required = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'];
  if (required.some((name) => !value(env, name))) {
    throw new Error('Set DATABASE_URL or PGHOST, PGPORT, PGUSER, PGPASSWORD and PGDATABASE');
  }
  const port = Number(value(env, 'PGPORT'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PGPORT must be an integer from 1 to 65535');
  }
};

const validateRuntimeEnvironment = (env = process.env) => {
  if (value(env, 'NODE_ENV') !== 'production') return null;

  validateDatabaseEnvironment(env);
  parseHttpUrl(requireValue(env, 'SUPABASE_URL'), 'SUPABASE_URL');
  const secretKey = requireValue(env, 'SUPABASE_SECRET_KEY');
  if (!secretKey.startsWith('sb_secret_')) {
    throw new Error('SUPABASE_SECRET_KEY must use an sb_secret_ key');
  }
  const publishableKey = requireValue(env, 'SUPABASE_PUBLISHABLE_KEY');
  if (!publishableKey.startsWith('sb_publishable_')) {
    throw new Error('SUPABASE_PUBLISHABLE_KEY must use an sb_publishable_ key');
  }

  if (value(env, 'SUPABASE_ACCESS_TOKEN')) {
    throw new Error('SUPABASE_ACCESS_TOKEN is forbidden in the application runtime');
  }
  assertNoPrivilegedBrowserValues(env);

  const publicBaseUrl = parseHttpUrl(
    requireValue(env, 'PUBLIC_BASE_URL'),
    'PUBLIC_BASE_URL',
  );
  const allowedOrigins = value(env, 'AUTH_ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => parseHttpUrl(origin, 'AUTH_ALLOWED_ORIGINS').origin);
  if (!allowedOrigins.includes(publicBaseUrl.origin)) {
    throw new Error('AUTH_ALLOWED_ORIGINS must include PUBLIC_BASE_URL');
  }

  const uploadsDir = requireValue(env, 'UPLOADS_DIR');
  if (!path.posix.isAbsolute(uploadsDir) && !path.win32.isAbsolute(uploadsDir)) {
    throw new Error('UPLOADS_DIR must be an absolute path in production');
  }

  return { publicBaseUrl: publicBaseUrl.href, uploadsDir };
};

module.exports = {
  validateClientBuildEnvironment,
  validateRuntimeEnvironment,
};
