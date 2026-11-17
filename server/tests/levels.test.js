// The level curve (fix list item 11): one formula, total XP, top level 100.
const assert = require('node:assert/strict');
const test = require('node:test');
const levels = require('../levels');

// UI review 2026-11-18 (P0): the header showed the stored level (12) while the
// lesson and profile pages showed the level the XP had reached (52). One rule
// now: the higher of the two, and level 0 (placement not done) stays 0.
test('currentLevel is the stored level or the level the XP reached, whichever is higher', () => {
  assert.equal(levels.currentLevel(12, levels.xpForLevel(52) + 15), 52);
  assert.equal(levels.currentLevel(30, 0), 30, 'a level won by an exam is kept');
  assert.equal(levels.currentLevel(0, 5000), 0, 'placement not done yet');
  assert.equal(levels.currentLevel(150, 0), 100);
  assert.equal(levels.currentLevel(5, 10_000_000), 100);
});

test('each level costs 60 XP more than the one before', () => {
  assert.deepEqual([1, 2, 3, 10].map(levels.xpToNext), [100, 160, 220, 640]);
  assert.equal(levels.xpToNext(100), 0);
});

test('level 10 (game modes) is 3,060 XP and level 100 is the top', () => {
  assert.equal(levels.xpForLevel(1), 0);
  assert.equal(levels.xpForLevel(2), 100);
  assert.equal(levels.xpForLevel(10), 3060);
  assert.equal(levels.levelForXp(3059), 9);
  assert.equal(levels.levelForXp(3060), 10);
  assert.equal(levels.levelForXp(10_000_000), 100);
});

test('xpForLevel and levelForXp agree at every boundary', () => {
  for (let level = 1; level <= 100; level += 1) {
    assert.equal(levels.levelForXp(levels.xpForLevel(level)), level);
    if (level > 1) assert.equal(levels.levelForXp(levels.xpForLevel(level) - 1), level - 1);
  }
});

test('adding XP keeps the total and can cross several levels at once', () => {
  assert.deepEqual(levels.addXp({ level: 1, xp: 0 }, 50), { level: 1, xp: 50, leveledUp: false });
  assert.deepEqual(levels.addXp({ level: 1, xp: 50 }, 300), { level: 3, xp: 350, leveledUp: true });
});

test('a level granted without XP counts on from where that level starts', () => {
  // A promotion exam moved this player to level 3 with 40 XP in hand.
  const after = levels.addXp({ level: 3, xp: 40 }, 10);
  assert.equal(after.xp, levels.xpForLevel(3) + 10);
  assert.equal(after.level, 3);
});

test('levels never go down and never pass 100; XP past 100 is kept', () => {
  assert.equal(levels.addXp({ level: 40, xp: 0 }, 5).level, 40);
  const top = levels.addXp({ level: 100, xp: levels.xpForLevel(100) }, 5000);
  assert.equal(top.level, 100);
  assert.equal(top.xp, levels.xpForLevel(100) + 5000);
});

test('the progress bar shows XP into the level and MAX at the top', () => {
  assert.deepEqual(levels.progressFor(2, 130),
    { level: 2, xp: 130, xp_into_level: 30, xp_needed_this_level: 160, xp_percent: 18, max_level: false });
  const max = levels.progressFor(100, 0);
  assert.equal(max.max_level, true);
  assert.equal(max.xp_percent, 100);
  // A stored level behind its XP shows the level the XP has reached.
  assert.equal(levels.progressFor(1, 400).level, 3);
});
