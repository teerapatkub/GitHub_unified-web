import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetsDirectory = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const maxChunkBytes = 500 * 1024;
const oversized = [];

for (const name of await readdir(assetsDirectory)) {
  if (!name.endsWith('.js')) continue;
  const size = (await stat(join(assetsDirectory, name))).size;
  if (size > maxChunkBytes) oversized.push(`${name}: ${Math.ceil(size / 1024)} KiB`);
}

if (oversized.length > 0) {
  console.error(`JavaScript chunks exceed 500 KiB:\n${oversized.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('JavaScript chunks are within the 500 KiB budget.');
}
