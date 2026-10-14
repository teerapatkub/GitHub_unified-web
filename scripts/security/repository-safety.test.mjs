import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  findSensitiveContent,
  isForbiddenRepositoryPath,
  requiredBackupIgnorePatterns,
} from './repository-safety.mjs';

test('rejects database backups and dumps at any directory depth', () => {
  const forbiddenPaths = [
    'database-backup.sql',
    'server/backup_python_coder_game.sql',
    'server/scripts/archive/fullproject_mysql_dump.sql',
    'exports/users.dump',
    'exports/users.sql.gz',
    'data/players.db',
    'data/players.sqlite',
    'data/players.sqlite3',
    'server/.env.backup',
    'server/node_modules/dotenv/index.js',
    'client/dist/assets/index.js',
  ];

  for (const path of forbiddenPaths) {
    assert.equal(isForbiddenRepositoryPath(path), true, path);
  }
});

test('allows versioned schema, migration, and seed sources', () => {
  const allowedPaths = [
    'server/schema.sql',
    'server/migration.sql',
    'server/seed-content.sql',
    'server/scripts/dump-schema.js',
    'client/.env.example',
  ];

  for (const path of allowedPaths) {
    assert.equal(isForbiddenRepositoryPath(path), false, path);
  }
});

test('detects credential material without reporting its value', () => {
  const bcrypt = ['$2b$', '10$', 'abcdefghijklmnopqrstuv12345678901234567890123456789'].join('');
  const accessToken = ['sbp', '_123456789012345678901234567890'].join('');
  const secretKey = ['sb', '_secret_123456789012345678901234567890'].join('');
  const googleApiKey = ['AI', 'za12345678901234567890123456789012345'].join('');
  const privateKeyHeader = ['-----BEGIN ', 'PRIVATE KEY-----'].join('');
  const findings = findSensitiveContent(
    'server/example.sql',
    [
      `INSERT INTO users VALUES (1, 'player', '${bcrypt}');`,
      `SUPABASE_ACCESS_TOKEN=${accessToken}`,
      `SUPABASE_SECRET_KEY=${secretKey}`,
      `GEMINI_API_KEY=${googleApiKey}`,
      privateKeyHeader,
    ].join('\n'),
  );

  assert.deepEqual(
    findings.map(({ type, line }) => ({ type, line })),
    [
      { type: 'password-hash', line: 1 },
      { type: 'account-data', line: 1 },
      { type: 'supabase-access-token', line: 2 },
      { type: 'credential-assignment', line: 2 },
      { type: 'supabase-secret-key', line: 3 },
      { type: 'google-api-key', line: 4 },
      { type: 'credential-assignment', line: 4 },
      { type: 'private-key', line: 5 },
    ],
  );
  assert.equal(JSON.stringify(findings).includes('abcdefghijklmnop'), false);
});

test('detects generic account dumps and secret assignments', () => {
  const argonHash = ['$argon2id$', 'v=19$m=65536,t=3,p=4$saltsaltsalt$hashhashhashhashhash'].join('');
  const mailPassword = ['EMAIL', '_PASS=abcd-efgh-ijkl-mnop'].join('');
  const databaseUrl = ['DATABASE_URL=postgresql', '://app:real-password@db.example.com/app'].join('');
  const findings = findSensitiveContent(
    '24.8.2569.sql',
    [
      `INSERT INTO public.users VALUES (1, 'player@example.com', '${argonHash}');`,
      'COPY public.player_accounts (id, email, password_hash) FROM stdin;',
      mailPassword,
      databaseUrl,
    ].join('\n'),
  );

  assert.deepEqual(
    findings.map(({ type, line }) => ({ type, line })),
    [
      { type: 'password-hash', line: 1 },
      { type: 'account-data', line: 1 },
      { type: 'account-data', line: 2 },
      { type: 'credential-assignment', line: 3 },
      { type: 'database-url-password', line: 4 },
    ],
  );
});

test('does not flag documentation placeholders or educational email examples', () => {
  const findings = findSensitiveContent(
    'server/seed-content.sql',
    [
      'VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...',
      'const email = "student@example.com";',
      'SUPABASE_ACCESS_TOKEN=your-access-token',
      'DATABASE_URL=postgresql://user:${DB_PASSWORD}@localhost/example',
    ].join('\n'),
  );

  assert.deepEqual(findings, []);
});

test('recognizes only exact historical fixture placeholders in their known files', () => {
  const fixture = ["AUTH_SMTP_", "PASS: 'smtp-password'; EMAIL_", "PASS: 'legacy-password';"].join('');
  const url = ['DATABASE_URL=postgresql', '://app:password@db.example.com:6543/postgres'].join('');
  assert.deepEqual(findSensitiveContent('server/tests/production-auth-settings.test.js', fixture), []);
  assert.deepEqual(findSensitiveContent('server/tests/production-environment.test.js', url), []);
  assert.deepEqual(findSensitiveContent('docs/deploy.md', url), []);
  assert.equal(findSensitiveContent('server/config.js', fixture).length, 2);
  assert.equal(findSensitiveContent('server/config.js', url).length, 1);
  assert.equal(findSensitiveContent('server/tests/production-environment.test.js',
    ['DATABASE_URL=postgresql', '://app:actual-password@db.example.com/app'].join('')).length, 1);
});

test('does not treat short semantic token constants in bundled code as credentials', () => {
  const findings = findSensitiveContent(
    'client/dist/assets/index.js',
    'NUMBER_TOKEN="number";COLOR_TOKEN="color";VAR_TOKEN="var";VAR_FUNCTION_TOKEN="var(";',
  );

  assert.deepEqual(findings, []);
});

test('rejects short authentication tokens in source code', () => {
  const shortToken = ['AUTH', '_TOKEN="abc123";'].join('');
  const findings = findSensitiveContent(
    'server/config.js',
    shortToken,
  );

  assert.deepEqual(
    findings.map(({ type, line }) => ({ type, line })),
    [{ type: 'credential-assignment', line: 1 }],
  );
});

test('checks every credential assignment on a minified source line', () => {
  const mixedAssignments = [
    'NUMBER_TOKEN="number";',
    ['AUTH', '_TOKEN="abc123"'].join(''),
  ].join('');
  const findings = findSensitiveContent('client/dist/assets/index.js', mixedAssignments);

  assert.deepEqual(
    findings.map(({ type, line }) => ({ type, line })),
    [{ type: 'credential-assignment', line: 1 }],
  );
});

test('keeps Git and Docker backup exclusions aligned with the scanner policy', () => {
  assert.equal(
    requiredBackupIgnorePatterns.every((pattern) => pattern.startsWith('**/')),
    true,
    'backup exclusions must match files below arbitrary directory depths',
  );

  for (const ignoreFile of ['.gitignore', '.dockerignore']) {
    const lines = new Set(
      readFileSync(ignoreFile, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    );

    for (const pattern of requiredBackupIgnorePatterns) {
      assert.equal(lines.has(pattern), true, `${ignoreFile} is missing ${pattern}`);
    }
  }
});
