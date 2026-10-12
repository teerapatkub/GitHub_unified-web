const assert = require('node:assert/strict');
const test = require('node:test');

const {
  validateClientBuildEnvironment,
  validateRuntimeEnvironment,
} = require('../runtime/environment');

const validRuntime = () => ({
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://app:password@db.example.com:6543/postgres',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SECRET_KEY: 'sb_secret_server_only',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_browser_safe',
  PUBLIC_BASE_URL: 'https://pyarena.example.com',
  CLIENT_URL: 'https://pyarena.example.com',
  AUTH_ALLOWED_ORIGINS: 'https://pyarena.example.com',
  UPLOADS_DIR: '/data/uploads',
});

test('production runtime accepts complete server-only configuration', () => {
  assert.deepEqual(validateRuntimeEnvironment(validRuntime()), {
    clientUrl: 'https://pyarena.example.com/',
    publicBaseUrl: 'https://pyarena.example.com/',
    uploadsDir: '/data/uploads',
  });
});

test('production runtime rejects missing values and management credentials', () => {
  const missingDatabase = validRuntime();
  delete missingDatabase.DATABASE_URL;
  assert.throws(
    () => validateRuntimeEnvironment(missingDatabase),
    /DATABASE_URL or PGHOST, PGPORT, PGUSER, PGPASSWORD and PGDATABASE/,
  );

  assert.throws(
    () => validateRuntimeEnvironment({
      ...validRuntime(),
      SUPABASE_ACCESS_TOKEN: 'management-token-must-not-reach-runtime',
    }),
    /SUPABASE_ACCESS_TOKEN is forbidden/,
  );
});

test('production runtime requires its public origin in the CORS allowlist', () => {
  assert.throws(
    () => validateRuntimeEnvironment({
      ...validRuntime(),
      AUTH_ALLOWED_ORIGINS: 'https://admin.example.com',
    }),
    /AUTH_ALLOWED_ORIGINS must include PUBLIC_BASE_URL/,
  );
});

test('production runtime rejects a client URL from another origin', () => {
  assert.throws(
    () => validateRuntimeEnvironment({
      ...validRuntime(),
      CLIENT_URL: 'http://localhost:5174',
    }),
    /CLIENT_URL must exactly match PUBLIC_BASE_URL/,
  );
});

test('client build accepts only a publishable Supabase key', () => {
  assert.deepEqual(validateClientBuildEnvironment({
    VITE_SUPABASE_URL: 'https://project.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_browser_safe',
  }), {
    supabaseUrl: 'https://project.supabase.co/',
  });

  assert.throws(
    () => validateClientBuildEnvironment({
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_leaked',
    }),
    /VITE_SUPABASE_PUBLISHABLE_KEY must use an sb_publishable_ key/,
  );
});

test('client build rejects privileged values even under a Vite prefix', () => {
  assert.throws(
    () => validateClientBuildEnvironment({
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_browser_safe',
      VITE_SUPABASE_SECRET_KEY: 'sb_secret_leaked',
    }),
    /VITE_SUPABASE_SECRET_KEY is forbidden/,
  );
});
