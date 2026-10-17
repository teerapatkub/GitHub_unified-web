// Typing debuffs act on what the player types while the debuff is on, never on
// the code that was already in the editor. The editor reports the whole file on
// every change, so the typed text is the part between the unchanged start and
// the unchanged end of the old and new file.
const SCRAMBLE = { a: 'q', e: 'w', i: 'r', o: 't', u: 'y', s: 'd', t: 'f' };
const TYPO_CHARS = 'xyz1!#';
const TYPO_CHANCE = 0.15;

function typedRange(prev, next) {
  let start = 0;
  const shortest = Math.min(prev.length, next.length);
  while (start < shortest && prev[start] === next[start]) start++;
  let end = 0;
  while (end < shortest - start && prev[prev.length - 1 - end] === next[next.length - 1 - end]) end++;
  return { start, end: next.length - end };
}

export function applyTypingDebuffs(prev, next, activeTypes, random = Math.random) {
  const active = new Set(activeTypes);
  if (!active.has('keyScrambler') && !active.has('typoGenerator') && !active.has('capsLockLock')) return next;
  const { start, end } = typedRange(prev || '', next || '');
  let typed = next.slice(start, end);
  if (!typed) return next;
  if (active.has('keyScrambler')) {
    typed = [...typed].map(ch => {
      const swapped = SCRAMBLE[ch.toLowerCase()];
      if (!swapped) return ch;
      return ch === ch.toUpperCase() ? swapped.toUpperCase() : swapped;
    }).join('');
  }
  if (active.has('typoGenerator') && random() < TYPO_CHANCE) {
    // Right after the last visible character typed, so a typed newline and
    // its indentation stay where the editor put them.
    const visibleEnd = typed.trimEnd().length;
    typed = typed.slice(0, visibleEnd) + TYPO_CHARS[Math.floor(random() * TYPO_CHARS.length)] + typed.slice(visibleEnd);
  }
  if (active.has('capsLockLock')) typed = typed.toUpperCase();
  return next.slice(0, start) + typed + next.slice(end);
}

export function blocksKey(key, activeTypes) {
  return activeTypes.includes('backspaceLock') && (key === 'Backspace' || key === 'Delete');
}
