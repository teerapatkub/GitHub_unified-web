// Copy the Pyodide runtime we depend on out of node_modules and into public/,
// so the app serves Python from its OWN origin instead of a CDN.
//
// Self-hosting is not about speed here - it is what lets the page be
// cross-origin isolated (COOP/COEP). Isolation is what gives us SharedArrayBuffer,
// and SharedArrayBuffer is the only way to (a) make input() block inside the
// Web Worker and (b) interrupt an infinite loop instead of freezing the tab.
// A CDN <script> cannot be embedded under COEP without extra headers we do not
// control, so the runtime has to be local.
//
// The copy under public/pyodide is generated, not committed (see .gitignore).
// `npm install` restores node_modules/pyodide and this script reproduces it, so
// a fresh checkout + build is self-contained and offline-safe.
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'node_modules', 'pyodide');
const dest = join(here, '..', 'public', 'pyodide');

// The base runtime only. Not the hundreds of package wheels - beginner Python
// needs none of them, and pulling ~200MB into public/ would be absurd. If a
// lesson ever needs a package, add its wheel name here.
const FILES = [
  'pyodide.js',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
];

if (!existsSync(src)) {
  console.error('sync-pyodide: node_modules/pyodide not found - run `npm install` first.');
  process.exit(1);
}

await mkdir(dest, { recursive: true });
let copied = 0;
for (const name of FILES) {
  const from = join(src, name);
  const to = join(dest, name);
  // Skip the 10MB wasm copy when it is already current - keeps dev startup fast.
  if (existsSync(to)) {
    const [a, b] = await Promise.all([stat(from), stat(to)]);
    if (a.size === b.size) continue;
  }
  await copyFile(from, to);
  copied += 1;
}
console.log(`sync-pyodide: ${copied} file(s) synced to public/pyodide (from pyodide ${JSON.parse(await import('node:fs').then(fs => fs.promises.readFile(join(src, 'package.json'), 'utf8'))).version}).`);
