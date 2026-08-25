// client/src/pages/Arcade/constants.js
// Match phases, timing, static round tasks, shop catalog, and other
// module-scope constants for Arcade Battle Royale. Split out of
// ArcadeBattleRoyale.jsx so the constants can be found/edited without
// scrolling through the whole component file.
import arcadeConfig from '../../../../shared/arcadeConfig.json';

// server/db.js's raw-socket Postgres client passes TIMESTAMP columns through
// as Postgres's bare text format ("YYYY-MM-DD HH:mm:ss.sss" — space
// separator, no zone), since it isn't in db.js's small set of specially-
// parsed OIDs. `new Date(...)` on a string like that is parsed as LOCAL
// time by the browser's JS engine, not UTC — on a machine whose timezone
// isn't UTC (e.g. Indochina Time, UTC+7) that silently shifts a real
// `phase_deadline` hours away from the true moment the server meant,
// making the round timer read as already-expired the instant a new phase
// starts. The value itself IS a UTC instant (the server always writes it via
// `new Date(...)` client-side math), it's just missing the marker telling
// JS to parse it that way — this puts that marker back.
export function parseUtcTimestamp(raw) {
  if (!raw) return NaN;
  const iso = raw.includes('T') ? raw : raw.replace(' ', 'T');
  return new Date(iso.endsWith('Z') ? iso : `${iso}Z`).getTime();
}

export const PHASES = {
  LOBBY: 'LOBBY',
  ROUND_1: 'ROUND_1',
  SUMMARY_1: 'SUMMARY_1',
  SHOP_1: 'SHOP_1',
  ROUND_2: 'ROUND_2',
  SUMMARY_2: 'SUMMARY_2',
  SHOP_2: 'SHOP_2',
  ROUND_3: 'ROUND_3',
  SUMMARY_3: 'SUMMARY_3',
  SHOP_3: 'SHOP_3',
  ROUND_4: 'ROUND_4',
  RESULT: 'RESULT'
};

export const ROUND_TIMES = arcadeConfig.phaseDurations;
export const QUICK_ROUND_TIMES = arcadeConfig.quickModePhaseDurations;
export const DIFFICULTIES = arcadeConfig.difficulties;
export const ROUND_DURATION_MODES = arcadeConfig.roundDurationModes;

// Phase 8.4 — a room's phase lengths follow its own round_duration_mode, the
// same lookup the server does in arcadePhaseDurations(). Anything that needs a
// round's real length (the time component of the round score, the auto-submit
// warning threshold) must go through this rather than ROUND_TIMES directly, or
// a Quick Mode match would be scored against standard-mode durations.
export function phaseDurationsFor(room) {
  return room?.round_duration_mode === 'quick' ? QUICK_ROUND_TIMES : ROUND_TIMES;
}

export const TASKS = {
  ROUND_1: { titleKey: "task1Title", descKey: "task1Desc", initialCode: "def fib(n):\n    # Write your python code here\n    pass" },
  ROUND_2: { titleKey: "task2Title", descKey: "task2Desc", initialCode: "def is_anagram(s, t):\n    # Write your python code here\n    pass" },
  ROUND_3: { titleKey: "task3Title", descKey: "task3Desc", initialCode: "def two_sum(nums, target):\n    # Write your python code here\n    pass" }
};

// Round 4 (the final elimination round) pulls a real task from the DB's hard-
// difficulty pool instead of a hardcoded one, per the arcade_tasks table
// server.js already exposes via GET /api/arcade/tasks (fetched into dbTasks
// below, previously dead code). This fallback is byte-identical to that
// pool's first hard task, so it's only ever visibly different from the DB
// version if the fetch hasn't completed or failed entirely.
export const ROUND_4_FALLBACK_TASK = {
  title_th: 'ผลรวมย่อยสูงสุด (Kadane Algorithm)',
  title_en: 'Maximum Subarray Sum',
  desc_th: 'เขียนฟังก์ชัน `max_sub_array(nums)` หาผลรวมของอาร์เรย์ย่อยที่มีค่ามากที่สุด (Kadane Algorithm)',
  desc_en: 'Write a function `max_sub_array(nums)` finding the maximum contiguous subarray sum.',
  initial_code: 'def max_sub_array(nums):\n    # Write your python code here\n    pass',
  test_cases: [{ input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], output: 6 }, { input: [[1, 2, 3, 4]], output: 10 }]
};

// Test cases for real correctness checking, one set per static TASKS entry
// above — kept in lockstep with those so the function graded is always
// exactly the one the player is looking at. Round 4 is handled separately
// (see getRound4Task in useRoundJudging.js) since its content comes from the
// DB pool.
export const TASK_TEST_CASES = {
  ROUND_1: {
    functionName: 'fib',
    cases: [{ input: [5], output: 5 }, { input: [7], output: 13 }, { input: [0], output: 0 }, { input: [1], output: 1 }]
  },
  ROUND_2: {
    functionName: 'is_anagram',
    cases: [
      { input: ["listen", "silent"], output: true },
      { input: ["hello", "world"], output: false },
      { input: ["aabbcc", "abcabc"], output: true }
    ]
  },
  ROUND_3: {
    functionName: 'two_sum',
    cases: [{ input: [[2, 7, 11, 15], 9], output: [0, 1] }, { input: [[3, 2, 4], 6], output: [1, 2] }]
  }
};

// UI-only metadata (icon/i18n key) per shop item — price and type are NOT
// duplicated here, they come from arcadeConfig.shopItems (shared with the
// server's authoritative pricing and the Bot AI Engine's shopCatalog.js) so
// there is exactly one place left to edit a price or item type.
export const SHOP_UI_META = [
  { id: 'inkFog', nameKey: 'inkFogName', icon: '🌫️', descKey: 'inkFogDesc' },
  { id: 'backspaceLock', nameKey: 'backspaceLockName', icon: '🔒', descKey: 'backspaceLockDesc' },
  { id: 'keyScrambler', nameKey: 'keyScramblerName', icon: '⌨️', descKey: 'keyScramblerDesc' },
  { id: 'aiHelper', nameKey: 'aiHelperName', icon: '🤖', descKey: 'aiHelperDesc' },
  { id: 'screenShake', nameKey: 'screenShakeName', icon: '🌋', descKey: 'screenShakeDesc' },
  { id: 'typoGenerator', nameKey: 'typoGeneratorName', icon: '🐛', descKey: 'typoGeneratorDesc' },
  { id: 'timeFreeze', nameKey: 'timeFreezeName', icon: '❄️', descKey: 'timeFreezeDesc' },
  { id: 'blackout', nameKey: 'blackoutName', icon: '🔌', descKey: 'blackoutDesc' },
  { id: 'shield', nameKey: 'shieldName', icon: '🛡️', descKey: 'shieldDesc' },
  { id: 'cashSteal', nameKey: 'cashStealName', icon: '🎭', descKey: 'cashStealDesc' },
  { id: 'capsLockLock', nameKey: 'capsLockLockName', icon: '🔠', descKey: 'capsLockLockDesc' },
  { id: 'mirrorMode', nameKey: 'mirrorModeName', icon: '🪞', descKey: 'mirrorModeDesc' },
  { id: 'taxCollection', nameKey: 'taxCollectionName', icon: '💸', descKey: 'taxCollectionDesc' },
  { id: 'scoreMultiplier', nameKey: 'scoreMultiplierName', icon: '⚡', descKey: 'scoreMultiplierDesc' },
  { id: 'screenDimmer', nameKey: 'screenDimmerName', icon: '🕶️', descKey: 'screenDimmerDesc' }
];
export const SHOP_ITEMS = SHOP_UI_META.map(meta => {
  const cfg = arcadeConfig.shopItems.find(i => i.id === meta.id) || {};
  return { ...meta, price: cfg.price, type: cfg.type };
});

// Inventory can hold at most `arcadeConfig.maxInventory` items total, and at
// most `arcadeConfig.maxAoeHeld` of those may be an `aoe` item (it's powerful
// enough to need its own scarcity, but it still counts toward the total cap
// rather than getting a separate quota). Same values used by the Bot AI
// Engine (client/src/pages/Arcade/bot/botAI.js).
export const MAX_INVENTORY = arcadeConfig.maxInventory;
export const MAX_AOE_HELD = arcadeConfig.maxAoeHeld;

// Lead time for the "player never pressed submit" auto-submit — see the
// explanatory comment beside autoSubmitLeadSeconds in shared/arcadeConfig.json
// for why this must never be 0.
export const AUTO_SUBMIT_LEAD_SECONDS = arcadeConfig.autoSubmitLeadSeconds;

// Countdown value at which the player is told their answer is about to be
// submitted for them. Larger than the lead above on purpose — see the
// comment beside autoSubmitWarnSeconds in shared/arcadeConfig.json.
export const AUTO_SUBMIT_WARN_SECONDS = arcadeConfig.autoSubmitWarnSeconds;

// Visual/gameplay debuff duration per effect id, shared by AOE dispatch and by
// the incoming-effects poll (the server only carries the effect id — the actual
// duration is applied client-side by whoever receives it).
export const EFFECT_DURATIONS = {
  inkFog: 15000,
  timeFreeze: 5000,
  blackout: 8000,
  screenShake: 8000,
  capsLockLock: 10000,
  mirrorMode: 12000,
  screenDimmer: 15000,
  backspaceLock: 10000,
  keyScrambler: 10000,
  typoGenerator: 10000,
};
export const DEFAULT_EFFECT_DURATION = 10000;

// Which difficulty Round 4 draws from, keyed by the room's own difficulty.
// The finale used to be hardcoded to `hard` for every room — see the comment
// beside finalePoolByDifficulty in shared/arcadeConfig.json. The server draws
// the real line-up; this is only for the fallback path where the draw is
// missing (a legacy room, or the task fetch not having landed yet), and it has
// to agree with the server or the two would disagree about Round 4.
export const FINALE_POOL_BY_DIFFICULTY = arcadeConfig.finalePoolByDifficulty;

// How many of a problem's test cases are shown to the player as worked
// examples. Fewer than the problem has, on purpose — see the comment beside
// exampleCasesShown in shared/arcadeConfig.json.
export const EXAMPLE_CASES_SHOWN = arcadeConfig.exampleCasesShown;

export const BOT_NAMES = ["Dev_Ninja", "Code_BotX", "SyntaxError", "NullPointer"];
