// server/levels.js
//
// The one place that turns XP into a level (fix list item 11, 2026-11-17).
//
// Before this there were three formulas and they disagreed: lesson rewards
// reset users.xp to 0 on every level-up and needed level x 1,000 for the next,
// Debug Lab rewards kept XP cumulative with 1,000 per level, the profile bar
// showed xp % 1,000, and the learning page drew its own 120 x level curve. So
// the bar a player saw rarely matched the level they had.
//
// Now:
//   - users.xp is the player's TOTAL XP, never reset;
//   - going from level L to L+1 costs 100 + 60 x (L - 1) XP, so each level is
//     a little longer than the one before (100, 160, 220, ...);
//   - level 100 is the top. XP still adds up past it - nothing is thrown
//     away - and the bar shows as full.
//
// Level 10, where the game modes open, is 3,060 XP: about what the lesson
// exercises pay in total. Level 100 is 299,880 XP.
//
// A level can also be raised without XP: placement at sign-up and the
// promotion exams set it directly. Levels never go down, so a player whose
// level is ahead of their XP is treated as having the XP that level starts at
// (effectiveXp); the next reward counts on from there.

const MAX_LEVEL = 100;
const BASE_XP = 100;
const STEP_XP = 60;

/** XP needed to go from `level` to `level + 1`; 0 at the top. */
const xpToNext = (level) => (level >= MAX_LEVEL ? 0 : BASE_XP + STEP_XP * (Math.max(1, level) - 1));

/** Total XP at which `level` begins (level 1 begins at 0). */
const xpForLevel = (level) => {
    const n = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level))) - 1;
    return BASE_XP * n + (STEP_XP * n * (n - 1)) / 2;
};

/** The level total XP reaches on its own, 1..MAX_LEVEL. */
const levelForXp = (xp) => {
    const total = Math.max(0, Number(xp) || 0);
    let level = 1;
    while (level < MAX_LEVEL && xpForLevel(level + 1) <= total) level += 1;
    return level;
};

/** Total XP, lifted to the start of a level that was granted without XP. */
const effectiveXp = (level, xp) => Math.max(Number(xp) || 0, xpForLevel(Math.max(1, Number(level) || 1)));

/**
 * The result of adding `xpDelta` to a player at `level` with total `xp`.
 * The level never goes down and never passes MAX_LEVEL.
 */
const addXp = ({ level, xp }, xpDelta) => {
    const currentLevel = Math.min(MAX_LEVEL, Math.max(1, Number(level) || 1));
    const nextXp = effectiveXp(currentLevel, xp) + Math.max(0, Number(xpDelta) || 0);
    const nextLevel = Math.max(currentLevel, levelForXp(nextXp));
    return { level: nextLevel, xp: nextXp, leveledUp: nextLevel > currentLevel };
};

/** What a progress bar shows for this player. */
const progressFor = (level, xp) => {
    const stored = Math.min(MAX_LEVEL, Math.max(1, Number(level) || 1));
    const total = effectiveXp(stored, xp);
    // A stored level behind its XP (it should not happen, but a bar reading
    // 500 / 340 would be worse than showing the level the XP has reached).
    const current = Math.max(stored, levelForXp(total));
    if (current >= MAX_LEVEL) {
        return { level: current, xp: total, xp_into_level: 0, xp_needed_this_level: 0, xp_percent: 100, max_level: true };
    }
    const into = total - xpForLevel(current);
    const needed = xpToNext(current);
    return {
        level: current,
        xp: total,
        xp_into_level: into,
        xp_needed_this_level: needed,
        xp_percent: Math.min(100, Math.floor((into / needed) * 100)),
        max_level: false,
    };
};

/**
 * The level to show and to gate on: the stored level, or the level the XP has
 * reached if that is higher (the same rule progressFor uses). Level 0 means the
 * sign-up placement is not done and stays 0. UI review 2026-11-18: the header
 * read the stored level and the pages read progressFor, so a stored level left
 * behind its XP showed two different levels on one screen.
 */
const currentLevel = (level, xp) => {
    if (!(Number(level) >= 1)) return 0;
    return progressFor(level, xp).level;
};

module.exports = { MAX_LEVEL, BASE_XP, STEP_XP, xpToNext, xpForLevel, levelForXp, effectiveXp, addXp, progressFor, currentLevel };
