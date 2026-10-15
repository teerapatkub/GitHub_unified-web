import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  approvedRuntimeAssetHashes,
  hashFile,
  inspectApplicationDirectory,
  inspectEnvironmentEntries,
  isApprovedRuntimeAsset,
} from './container-image-safety.mjs';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('detects forbidden data files and secrets in an extracted application', () => {
  const root = mkdtempSync(join(tmpdir(), 'pyarena-image-test-'));
  try {
    mkdirSync(join(root, 'server'), { recursive: true });
    writeFileSync(join(root, 'server', 'players.sqlite'), 'database bytes');
    const mailPassword = ['EMAIL', '_PASS=real-mail-password'].join('');
    writeFileSync(join(root, 'server', 'config.js'), mailPassword);

    assert.deepEqual(
      inspectApplicationDirectory(root).map(({ path, type }) => ({ path, type })),
      [
        { path: 'server/config.js', type: 'credential-assignment' },
        { path: 'server/players.sqlite', type: 'forbidden-runtime-path' },
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects the Supabase management env file wherever it lands in the image', () => {
  const root = mkdtempSync(join(tmpdir(), 'pyarena-image-test-'));
  try {
    mkdirSync(join(root, 'server'), { recursive: true });
    // No secret-looking content on purpose: these are forbidden by path alone.
    writeFileSync(join(root, 'server', '.supabase-management.env'), '# setup only');
    writeFileSync(join(root, 'server', 'production.env'), '# setup only');

    assert.deepEqual(
      inspectApplicationDirectory(root).map(({ path, type }) => ({ path, type })),
      [
        { path: 'server/.supabase-management.env', type: 'forbidden-runtime-path' },
        { path: 'server/production.env', type: 'forbidden-runtime-path' },
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects setup-only credentials in the image environment by name', () => {
  const accessToken = ['sbp', '_0123456789abcdef0123456789abcdef01234567'].join('');
  const findings = inspectEnvironmentEntries([
    'NODE_ENV=production',
    `SUPABASE_ACCESS_TOKEN=${accessToken}`,
    'AUTH_SMTP_PASS=changeme',
    'PATH=/opt/pysim-venv/bin:/usr/local/bin',
  ]);

  assert.deepEqual(
    findings.map(({ type, line }) => ({ type, line })),
    [
      { type: 'setup-only-environment', line: 2 },
      { type: 'setup-only-environment', line: 3 },
      { type: 'supabase-access-token', line: 2 },
      { type: 'credential-assignment', line: 2 },
    ],
  );
  assert.equal(JSON.stringify(findings).includes('0123456789abcdef'), false);
  assert.deepEqual(inspectEnvironmentEntries(['NODE_ENV=production', 'PORT=3001']), []);
});

test('ignores installed dependencies while inspecting application-owned files', () => {
  const root = mkdtempSync(join(tmpdir(), 'pyarena-image-test-'));
  try {
    mkdirSync(join(root, 'server', 'node_modules', 'example'), { recursive: true });
    writeFileSync(join(root, 'server', 'node_modules', 'example', 'fixture.db'), 'fixture');
    writeFileSync(join(root, 'server', 'server.js'), 'console.log("ready");');

    assert.deepEqual(inspectApplicationDirectory(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects oversized application files instead of skipping their contents', () => {
  const root = mkdtempSync(join(tmpdir(), 'pyarena-image-test-'));
  try {
    mkdirSync(join(root, 'client', 'dist'), { recursive: true });
    writeFileSync(join(root, 'client', 'dist', 'large.js'), Buffer.alloc((5 * 1024 * 1024) + 1, 'x'));

    assert.deepEqual(inspectApplicationDirectory(root), [
      { path: 'client/dist/large.js', type: 'oversized-runtime-file' },
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('allows only the exact production binary assets required by the game', () => {
  const sourceByImagePath = new Map([
    ['client/dist/assets/music/Monplaisir.mp3', 'client/public/assets/music/Monplaisir.mp3'],
    ['client/dist/gif/first_print.gif', 'client/public/gif/first_print.gif'],
  ]);

  for (const [imagePath, sourcePath] of sourceByImagePath) {
    assert.equal(isApprovedRuntimeAsset(imagePath, hashFile(join(repositoryRoot, sourcePath))), true);
  }

  const wasmPath = 'client/dist/pyodide/pyodide.asm.wasm';
  const standardLibraryPath = 'client/dist/pyodide/python_stdlib.zip';
  assert.equal(
    isApprovedRuntimeAsset(wasmPath, approvedRuntimeAssetHashes.get(wasmPath)),
    true,
  );
  assert.equal(
    isApprovedRuntimeAsset(standardLibraryPath, approvedRuntimeAssetHashes.get(standardLibraryPath)),
    true,
  );
  assert.equal(isApprovedRuntimeAsset(standardLibraryPath, 'unexpected-hash'), false);
});
