import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyTypingDebuffs, blocksKey } from './typing-debuffs.js';

const code = 'def f(n):\n    return n';

// Playtest 2026-10-17: Caps Lock Trap upper-cased the player's WHOLE file on the
// first keystroke ("def" -> "DEF"), so ten seconds of debuff broke Python for
// the rest of the round. It should only affect what is typed while it is on.
test('caps lock trap upper-cases only the text typed while it is active', () => {
  const next = 'def f(n):\n    return n + x';
  assert.equal(applyTypingDebuffs(code, next, ['capsLockLock']), 'def f(n):\n    return n + X');
});

test('caps lock trap applies to text typed in the middle of the file', () => {
  const next = 'def f(n):\n    y = 1\n    return n';
  assert.equal(applyTypingDebuffs(code, next, ['capsLockLock']), 'def f(n):\n    Y = 1\n    return n');
});

test('deleting text under caps lock trap leaves the rest of the file alone', () => {
  assert.equal(applyTypingDebuffs(code, 'def f(n):\n    return', ['capsLockLock']), 'def f(n):\n    return');
});

test('key scrambler swaps the typed character wherever the cursor is', () => {
  const next = 'def f(n):\n    a\n    return n';
  assert.equal(applyTypingDebuffs(code, next, ['keyScrambler']), 'def f(n):\n    q\n    return n');
});

test('typo glitch inserts its stray character next to what was typed, not at the end of the file', () => {
  const next = 'def f(n):\n    z\n    return n';
  assert.equal(applyTypingDebuffs(code, next, ['typoGenerator'], () => 0), 'def f(n):\n    zx\n    return n');
});

test('without a typing debuff the code is unchanged', () => {
  const next = 'def f(n):\n    return n + x';
  assert.equal(applyTypingDebuffs(code, next, []), next);
});

// Backspace Lock listened on a hidden textarea that never has focus while the
// player types in Monaco, so it blocked nothing.
test('backspace lock blocks Backspace and Delete but not other keys', () => {
  assert.equal(blocksKey('Backspace', ['backspaceLock']), true);
  assert.equal(blocksKey('Delete', ['backspaceLock']), true);
  assert.equal(blocksKey('KeyA', ['backspaceLock']), false);
  assert.equal(blocksKey('Backspace', []), false);
});
