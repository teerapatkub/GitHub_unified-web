import {
  closeSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  findSensitiveContent,
  isForbiddenRuntimePath,
} from './repository-safety.mjs';

const maxScannableBytes = 5 * 1024 * 1024;
export const approvedRuntimeAssetHashes = new Map([
  ['client/dist/assets/music/Monplaisir.mp3', '77ef3597a3372abcda71ec380a15b073cc0b4313078a8d93f5f0707ad0cf6e1b'],
  ['client/dist/gif/first_print.gif', 'acf444b1cd729e9bdad1be2f4b3b73b07defa25524582c5850b116ddf33a969e'],
  ['client/dist/pyodide/pyodide.asm.wasm', 'a50dd1843f805a0b7c45b61037ee0d7b26dfe85efe0e18ef95a34ad24e401f5f'],
  ['client/dist/pyodide/python_stdlib.zip', '16611534726e5d8ac2bd8f926410b2dcb8d6f49aa24913463533b457a2115c16'],
]);

export function hashFile(path) {
  const hash = createHash('sha256');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  const descriptor = openSync(path, 'r');
  try {
    let bytesRead;
    do {
      bytesRead = readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytesRead > 0) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    closeSync(descriptor);
  }
  return hash.digest('hex');
}

export function isApprovedRuntimeAsset(path, sha256) {
  return approvedRuntimeAssetHashes.get(path) === sha256;
}

function runDocker(args) {
  const result = spawnSync('docker', args, {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.status !== 0) {
    const error = String(result.stderr || result.stdout || 'docker command failed').trim();
    throw new Error(`docker ${args.join(' ')} failed: ${error}`);
  }
  return result.stdout.trim();
}

function listFiles(root) {
  const files = [];
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') pending.push(path);
      } else if (entry.isFile()) {
        files.push(path);
      }
    }
  }
  return files;
}

// Setup-only credentials (spec 0002): the Supabase management token and the
// Auth SMTP password configure the project from a workstation or CI, and the
// game's runtime refuses to boot with either. Their name alone is a finding,
// whatever the value looks like.
export const setupOnlyEnvironmentNames = ['SUPABASE_ACCESS_TOKEN', 'AUTH_SMTP_PASS'];

export function inspectEnvironmentEntries(entries) {
  const findings = [];
  for (const [index, entry] of entries.entries()) {
    const separator = entry.indexOf('=');
    const name = (separator < 0 ? entry : entry.slice(0, separator)).trim();
    if (setupOnlyEnvironmentNames.includes(name)) {
      findings.push({ path: 'image-config.env', type: 'setup-only-environment', line: index + 1 });
    }
  }
  return [...findings, ...findSensitiveContent('image-config.env', entries.join('\n'))];
}

function inspectImageEnvironment(image) {
  const metadata = JSON.parse(runDocker(['image', 'inspect', image]));
  return inspectEnvironmentEntries(metadata[0]?.Config?.Env ?? []);
}

export function inspectApplicationDirectory(root, pathPrefix = '') {
  const findings = [];
  for (const path of listFiles(root)) {
    const relativePath = relative(root, path).replaceAll('\\', '/');
    const normalizedPrefix = pathPrefix.replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
    const imagePath = [normalizedPrefix, relativePath].filter(Boolean).join('/');
    const approvedHash = approvedRuntimeAssetHashes.get(imagePath);
    if (approvedHash && isApprovedRuntimeAsset(imagePath, hashFile(path))) continue;

    if (isForbiddenRuntimePath(imagePath)) {
      findings.push({ path: imagePath, type: 'forbidden-runtime-path' });
      continue;
    }

    const stats = statSync(path);
    if (stats.size > maxScannableBytes) {
      findings.push({ path: imagePath, type: 'oversized-runtime-file' });
      continue;
    }
    const content = readFileSync(path);
    if (content.includes(0)) continue;
    findings.push(...findSensitiveContent(imagePath, content.toString('utf8')));
  }
  return findings;
}

export function verifyContainerImage(image) {
  const workingDirectory = mkdtempSync(join(tmpdir(), 'pyarena-image-safety-'));
  let containerId = '';
  try {
    containerId = runDocker(['create', image]);
    const applicationDirectory = join(workingDirectory, 'app');
    runDocker(['cp', `${containerId}:/app`, applicationDirectory]);

    const findings = [
      ...inspectImageEnvironment(image),
      ...inspectApplicationDirectory(applicationDirectory),
    ];
    if (findings.length > 0) {
      console.error(`Container image safety check found ${findings.length} issue(s):`);
      for (const finding of findings) {
        const location = finding.line ? `${finding.path}:${finding.line}` : finding.path;
        console.error(`- ${finding.type}: ${location}`);
      }
      console.error('No matching secret values were printed.');
      return 1;
    }

    console.log('Container image safety check passed.');
    return 0;
  } finally {
    if (containerId) spawnSync('docker', ['rm', '-f', containerId], { windowsHide: true });
    rmSync(workingDirectory, { recursive: true, force: true });
  }
}

const isMain = process.argv[1]
  && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase();

if (isMain) {
  const image = process.argv[2];
  if (!image) {
    console.error('Usage: node scripts/security/container-image-safety.mjs <image>');
    process.exitCode = 2;
  } else {
    try {
      process.exitCode = verifyContainerImage(image);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 2;
    }
  }
}
