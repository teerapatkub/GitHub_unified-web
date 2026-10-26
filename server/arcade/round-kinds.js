// Round kinds (Spec 0005 Track G, ADR 0010).
//
// A round is no longer always "write the function". In a mixed room some rounds
// ask the player to read, check and repair code instead - the skills a person
// needs to use an AI assistant well, and the ones that pasting the problem into
// one does not win inside a 60-second round under debuffs:
//
//   write    write the answer from the scaffold (the original round)
//   fix      the editor opens on an answer "the AI wrote" that looks right but
//            fails some tests; find the bug and make every test pass
//
// What each kind needs for a problem is in problem_modes.round_data, computed by
// computeRoundData() from the bot coder's graded wrong answers (arcade/bot-coder.js)
// - real code, really run - and never by asking a model.
const { buildBank } = require('./bot-coder');

const KINDS = ['write', 'fix'];

// What a mixed room plays, round by round. null is drawn at match start from
// every kind a mixed room can play. The first round is a short "predict" warm-up
// once that kind exists (ticket 22); until then it is a write round.
const MIXED_ORDER = ['predict', 'write', 'fix', null];

// Kinds a mixed room actually plays today.
const PLAYABLE = new Set(['write', 'fix']);

const ROUND_FORMATS = ['classic', 'mixed'];

const asArray = value => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') { try { return JSON.parse(value); } catch { return null; } }
  return null;
};

const asObject = value => {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string') { try { return JSON.parse(value); } catch { return {}; } }
  return {};
};

// The kind of one round of a room or match row. A match played before round
// kinds existed has none recorded and was all "write".
function roundKindOf(row, roundNum) {
  const kinds = asArray(row?.round_kinds);
  const kind = kinds?.[roundNum - 1];
  return KINDS.includes(kind) ? kind : 'write';
}

function planRoundKinds(format, random = Math.random) {
  if (format !== 'mixed') return ['write', 'write', 'write', 'write'];
  const playable = [...PLAYABLE];
  return MIXED_ORDER.map(kind => kind ?? playable[Math.floor(random() * playable.length)])
    .map(kind => (PLAYABLE.has(kind) ? kind : 'write'));
}

// Fit the drawn problems to the planned kinds. A round whose problem cannot be
// played as its kind swaps in another problem of the same difficulty that can;
// if none can, that round is a write round. Never fails the draw.
async function assignRoundKinds(db, room, taskIds, random = Math.random) {
  // No draw (an empty bank) means the built-in tasks, which only know "write".
  if (!Array.isArray(taskIds)) return { taskIds, kinds: planRoundKinds('classic') };
  const plan = planRoundKinds(room.round_format, random);
  if (plan.every(kind => kind === 'write')) return { taskIds, kinds: plan };
  const [rows] = await db.query(
    `SELECT entry_id, difficulty, round_kinds FROM problem_modes WHERE mode = 'arcade' AND is_active = 1`
  );
  const byId = new Map(rows.map(row => [row.entry_id, { ...row, round_kinds: asArray(row.round_kinds) || ['write'] }]));
  const ids = [...taskIds];
  const kinds = plan.map((kind, i) => {
    if (kind === 'write') return kind;
    const drawn = byId.get(ids[i]);
    if (drawn?.round_kinds.includes(kind)) return kind;
    const swaps = rows.filter(row => byId.get(row.entry_id).round_kinds.includes(kind)
      && !ids.includes(row.entry_id) && (!drawn || row.difficulty === drawn.difficulty));
    if (!swaps.length) return 'write';
    ids[i] = swaps[Math.floor(random() * swaps.length)].entry_id;
    return kind;
  });
  return { taskIds: ids, kinds };
}

// Which kinds a problem can be played as, and what each needs. Runs Python.
async function computeRoundData(problem) {
  const bank = await buildBank(problem);
  const kinds = ['write'];
  const data = {};
  // The AI's answer to fix: the wrong answer that passes the most tests while
  // still failing one. It has to pass at least one, or it is not "almost
  // right", and it must not be the scaffold, which is not anybody's answer.
  const almostRight = bank
    .filter(answer => answer.id.startsWith('mistake-') && answer.passed >= 1 && answer.passed < answer.total)
    .sort((a, b) => b.passed / b.total - a.passed / a.total);
  if (almostRight.length) {
    const [answer] = almostRight;
    kinds.push('fix');
    data.fix = { code: answer.code, passed: answer.passed, total: answer.total };
  }
  return { kinds, data };
}

// The round's problem as the grader, the judge and the bots see it. In a fix
// round the "starter" is the AI's answer, so an answer sent back untouched is
// recognised as untouched.
function problemForKind(problem, kind) {
  if (!problem) return problem;
  const data = asObject(problem.round_data);
  if (kind === 'fix' && data.fix?.code) return { ...problem, starter_code: data.fix.code, fix_passed: data.fix.passed };
  return problem;
}

// What a player's browser may see of a round beyond the problem itself.
function publicRoundView(kind, problem) {
  const data = asObject(problem?.round_data);
  if (kind === 'fix' && data.fix) {
    return { kind, fix: { starter_code: data.fix.code, passed: data.fix.passed, total: data.fix.total } };
  }
  return { kind: 'write' };
}

module.exports = {
  KINDS, PLAYABLE, MIXED_ORDER, ROUND_FORMATS,
  roundKindOf, planRoundKinds, assignRoundKinds, computeRoundData, problemForKind, publicRoundView, asObject,
};
