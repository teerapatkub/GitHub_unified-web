import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const maxTextBlobBytes = 5 * 1024 * 1024;
export const requiredBackupIgnorePatterns = [
  '**/*.dump',
  '**/*.bak',
  '**/*.db',
  '**/*.sqlite',
  '**/*.sqlite3',
  '**/*.sql.gz',
  '**/*.zip',
  '**/*.tar.gz',
  '**/*backup*.sql',
  '**/*dump*.sql',
];
const textExtensions = new Set([
  '.cjs', '.env', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.ps1',
  '.sh', '.sql', '.ts', '.tsx', '.txt', '.yaml', '.yml',
]);

const sensitivePatterns = [
  { type: 'password-hash', pattern: /\$2[aby]\$\d{2}\$[./A-Za-z0-9]{20,}/g },
  { type: 'password-hash', pattern: /\$argon2(?:id|i|d)\$[^\s'"]{20,}/g },
  { type: 'password-hash', pattern: /\bpbkdf2_sha256\$\d+\$[^\s'",;]{20,}/g },
  { type: 'supabase-access-token', pattern: /\bsbp_[A-Za-z0-9_-]{20,}\b/g },
  { type: 'supabase-secret-key', pattern: /\bsb_secret_[A-Za-z0-9_-]{20,}\b/g },
  { type: 'google-api-key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { type: 'github-token', pattern: /\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g },
  { type: 'provider-api-key', pattern: /\b(?:sk-(?:proj-)?|sk-ant-)[A-Za-z0-9_-]{20,}\b/g },
  { type: 'aws-access-key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { type: 'private-key', pattern: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/g },
];

const secretAssignment = /\b([A-Z][A-Z0-9_]*(?:PASSWORD|PASS|SECRET|TOKEN|API_KEY|PRIVATE_KEY))\s*[:=]\s*["']?([^\s,"'#]+)/g;
const accountDataSql = /^\s*(?:INSERT\s+INTO|COPY)\s+(?:["`]?\w+["`]?\.)?["`]?(?:users?|players?|player_accounts?|user_accounts?|admins?)["`]?(?:\s|\()/i;
const databaseUrl = /\b(?:postgres(?:ql)?|mysql):\/\/[^:\s/]+:([^@\s/]+)@/i;
const harmlessCodeTokens = new Map([
  ['COLOR_TOKEN', 'color'],
  ['NUMBER_TOKEN', 'number'],
  ['VAR_FUNCTION_TOKEN', 'var('],
  ['VAR_TOKEN', 'var'],
]);

function isPlaceholderSecret(value) {
  const normalized = value.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  return normalized === ''
    || normalized === 'null'
    || normalized === 'undefined'
    || normalized.startsWith('process.env')
    || normalized.startsWith('import.meta.env')
    || normalized.startsWith('${')
    || normalized.startsWith('<')
    || normalized.startsWith('(')
    || normalized.startsWith('{')
    || normalized.startsWith('[')
    || normalized.startsWith('$')
    || /^(?:string|number|boolean)\(/.test(normalized)
    || normalized.startsWith('your-')
    || normalized.startsWith('your_')
    || normalized.startsWith('example')
    || normalized.startsWith('replace')
    || normalized.startsWith('changeme')
    || normalized === 'true'
    || normalized === 'false'
    || normalized === '...';
}

function isHarmlessCodeToken(path, name, value) {
  const codeExtensions = new Set(['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
  const normalized = value.trim().replace(/^['"]|['"]$/g, '');
  return codeExtensions.has(extensionOf(path))
    && harmlessCodeTokens.get(name) === normalized;
}

function normalizePath(path) {
  return path.replaceAll('\\', '/').replace(/^\.\//, '');
}

function extensionOf(path) {
  const normalized = normalizePath(path).toLowerCase();
  const basename = normalized.slice(normalized.lastIndexOf('/') + 1);
  if (basename === '.env') return '.env';
  const dot = basename.lastIndexOf('.');
  return dot >= 0 ? basename.slice(dot) : '';
}

export function isForbiddenRuntimePath(path) {
  const normalized = normalizePath(path).toLowerCase();
  const basename = normalized.slice(normalized.lastIndexOf('/') + 1);

  if (basename === '.env') return true;
  if (basename.startsWith('.env.') && basename !== '.env.example') return true;
  if (/\.env\.backup(?:\..*)?$/.test(basename)) return true;
  if (/\.(?:dump|bak|db|sqlite|sqlite3)$/.test(basename)) return true;
  if (/\.sql\.gz$/.test(basename)) return true;
  if (/\.(?:zip|tar\.gz)$/.test(basename)) return true;
  if (/\.sql$/.test(basename) && /(?:backup|dump)/.test(basename)) return true;

  return false;
}

export function isForbiddenRepositoryPath(path) {
  const normalized = normalizePath(path).toLowerCase();
  const segments = normalized.split('/');
  if (segments.includes('node_modules') || segments.includes('dist')) return true;
  return isForbiddenRuntimePath(path);
}

function forbiddenPathLabel(path) {
  const normalized = normalizePath(path);
  const segments = normalized.split('/');
  const generatedIndex = segments.findIndex((segment) => (
    segment.toLowerCase() === 'node_modules' || segment.toLowerCase() === 'dist'
  ));
  if (generatedIndex >= 0) {
    return `${segments.slice(0, generatedIndex + 1).join('/')}/**`;
  }
  return normalized;
}

export function findSensitiveContent(path, text) {
  if (text.includes('\0')) return [];

  const findings = [];
  const sqlFile = extensionOf(path) === '.sql';
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const { type, pattern } of sensitivePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        findings.push({ path: normalizePath(path), type, line: index + 1 });
      }
    }

    if (sqlFile && accountDataSql.test(line)) {
      findings.push({ path: normalizePath(path), type: 'account-data', line: index + 1 });
    }

    for (const assignment of line.matchAll(secretAssignment)) {
      if (!isPlaceholderSecret(assignment[2])
        && !isHarmlessCodeToken(path, assignment[1], assignment[2])) {
        findings.push({ path: normalizePath(path), type: 'credential-assignment', line: index + 1 });
      }
    }

    const databaseUrlMatch = line.match(databaseUrl);
    if (databaseUrlMatch && !isPlaceholderSecret(databaseUrlMatch[1])) {
      findings.push({ path: normalizePath(path), type: 'database-url-password', line: index + 1 });
    }
  }
  return findings;
}

function runGit(args, { encoding = 'utf8', input } = {}) {
  const result = spawnSync('git', args, {
    encoding,
    input,
    maxBuffer: 128 * 1024 * 1024,
    windowsHide: true,
  });

  if (result.status !== 0) {
    const error = String(result.stderr || result.stdout || 'git command failed').trim();
    throw new Error(`git ${args.join(' ')} failed: ${error}`);
  }

  return result.stdout;
}

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function readBlobBatch(objectIds) {
  if (objectIds.length === 0) return new Map();
  const output = runGit(['cat-file', '--batch'], {
    encoding: null,
    input: `${objectIds.join('\n')}\n`,
  });
  const blobs = new Map();
  let offset = 0;

  while (offset < output.length) {
    const headerEnd = output.indexOf(0x0a, offset);
    if (headerEnd < 0) throw new Error('Unexpected git cat-file batch output.');
    const header = output.subarray(offset, headerEnd).toString('utf8');
    const [objectId, type, sizeText] = header.split(' ');
    const size = Number.parseInt(sizeText, 10);
    if (type !== 'blob' || !Number.isFinite(size)) {
      throw new Error(`Unexpected git object metadata for ${objectId}.`);
    }

    const contentStart = headerEnd + 1;
    const contentEnd = contentStart + size;
    blobs.set(objectId, output.subarray(contentStart, contentEnd).toString('utf8'));
    offset = contentEnd + 1;
  }

  return blobs;
}

function listTrackedPaths() {
  return runGit(['ls-files', '-z'])
    .split('\0')
    .filter(Boolean)
    .map(normalizePath);
}

function listHistoricalObjects() {
  return runGit(['rev-list', '--objects', '--all'])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(' ');
      return separator < 0
        ? { objectId: line, path: '' }
        : { objectId: line.slice(0, separator), path: normalizePath(line.slice(separator + 1)) };
    })
    .filter(({ path }) => path);
}

function listHistoricalPaths() {
  return runGit(['log', '--all', '--format=', '--name-only', '-z'])
    .split('\0')
    .map((path) => normalizePath(path.trim()))
    .filter(Boolean);
}

function shouldScanContent(path) {
  return textExtensions.has(extensionOf(path));
}

function scanTrackedFiles() {
  const findings = [];
  for (const path of listTrackedPaths()) {
    if (isForbiddenRepositoryPath(path)) {
      findings.push({ scope: 'tracked', path: forbiddenPathLabel(path), type: 'forbidden-path' });
      continue;
    }
    if (!shouldScanContent(path)) continue;

    let content;
    try {
      content = readFileSync(path);
    } catch {
      continue;
    }
    if (content.byteLength > maxTextBlobBytes) {
      findings.push({ scope: 'tracked', path, type: 'oversized-text-file' });
      continue;
    }

    findings.push(
      ...findSensitiveContent(path, content.toString('utf8'))
        .map((finding) => ({ scope: 'tracked', ...finding })),
    );
  }
  return findings;
}

function scanHistory() {
  const findings = [];
  const pathsByObject = new Map();
  for (const path of listHistoricalPaths()) {
    if (isForbiddenRepositoryPath(path)) {
      findings.push({ scope: 'history', path: forbiddenPathLabel(path), type: 'forbidden-path' });
    }
  }

  for (const { objectId, path } of listHistoricalObjects()) {
    if (isForbiddenRepositoryPath(path)) continue;
    if (shouldScanContent(path) && !pathsByObject.has(objectId)) {
      pathsByObject.set(objectId, path);
    }
  }

  const objectIds = [...pathsByObject.keys()];
  const metadata = runGit(
    ['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'],
    { input: `${objectIds.join('\n')}\n` },
  );
  const objectMetadata = metadata
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(' '));
  for (const [objectId, type, sizeText] of objectMetadata) {
    const size = Number.parseInt(sizeText, 10);
    if (type === 'blob' && size > maxTextBlobBytes) {
      findings.push({
        scope: 'history',
        path: pathsByObject.get(objectId),
        type: 'oversized-text-file',
      });
    }
  }

  const scannableObjectIds = objectMetadata
    .filter(([, type, sizeText]) => (
      type === 'blob' && Number.parseInt(sizeText, 10) <= maxTextBlobBytes
    ))
    .map(([objectId]) => objectId);

  for (const objectIdChunk of chunks(scannableObjectIds, 20)) {
    const blobs = readBlobBatch(objectIdChunk);
    for (const [objectId, content] of blobs) {
      const path = pathsByObject.get(objectId);
      findings.push(
        ...findSensitiveContent(path, content)
          .map((finding) => ({ scope: 'history', objectId, ...finding })),
      );
    }
  }
  return findings;
}

function formatFinding(finding) {
  const location = finding.line ? `${finding.path}:${finding.line}` : finding.path;
  return `${finding.scope}: ${finding.type}: ${location}`;
}

function uniqueFindings(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = `${finding.scope}|${finding.type}|${finding.path}|${finding.line ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function runRepositorySafetyCheck(args = process.argv.slice(2)) {
  const trackedOnly = args.includes('--tracked-only');
  const historyOnly = args.includes('--history-only');
  if (trackedOnly && historyOnly) {
    throw new Error('Choose only one of --tracked-only or --history-only.');
  }

  const findings = uniqueFindings([
    ...(!historyOnly ? scanTrackedFiles() : []),
    ...(!trackedOnly ? scanHistory() : []),
  ]);

  if (findings.length === 0) {
    console.log('Repository safety check passed.');
    return 0;
  }

  console.error(`Repository safety check found ${findings.length} issue(s):`);
  for (const finding of findings) console.error(`- ${formatFinding(finding)}`);
  console.error('No matching secret values were printed.');
  return 1;
}

const isMain = process.argv[1]
  && fileURLToPath(import.meta.url).toLowerCase() === process.argv[1].toLowerCase();

if (isMain) {
  try {
    process.exitCode = runRepositorySafetyCheck();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
