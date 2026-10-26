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
//   predict  a short round: read a piece of code and one call, and tap what it
//            prints
//   review   three or four answers "from the AI"; pick the one that passes
//            every test
//
// What each kind needs for a problem is in problem_modes.round_data, computed by
// computeRoundData() from the bot coder's graded wrong answers (arcade/bot-coder.js)
// - real code, really run - and never by asking a model.
const crypto = require('node:crypto');
const config = require('../../shared/arcadeConfig.json');
const { buildBank } = require('./bot-coder');
const { gradeSubmission } = require('../problemGrader');
const { runPythonScript, normalizeOutput } = require('../pythonRunner');

const KINDS = ['write', 'fix', 'predict', 'review'];

// Kinds answered by picking an option instead of sending code.
const CHOICE_KINDS = new Set(['predict', 'review']);

// What a mixed room plays, round by round. null is drawn at match start from
// every kind a mixed room can play.
const MIXED_ORDER = ['predict', 'write', 'fix', null];

// Kinds a mixed room actually plays today.
const PLAYABLE = new Set(['write', 'fix', 'predict', 'review']);

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

const isChoiceKind = kind => CHOICE_KINDS.has(kind);

// The kind of one round of a room or match row. A match played before round
// kinds existed has none recorded and was all "write".
function roundKindOf(row, roundNum) {
  const kinds = asArray(row?.round_kinds);
  const kind = kinds?.[roundNum - 1];
  return KINDS.includes(kind) ? kind : 'write';
}

// How long a round lasts. A predict round is a short read-and-tap round
// (arcadeConfig.predictRoundSeconds); every other kind keeps the room's pace.
function roundSeconds(room, roundNum) {
  const pace = room?.round_duration_mode === 'quick' ? 'quick' : 'standard';
  if (roundKindOf(room, roundNum) === 'predict') return config.predictRoundSeconds[pace];
  const durations = pace === 'quick' ? config.quickModePhaseDurations : config.phaseDurations;
  return durations[`ROUND_${roundNum}`];
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

// A JSON test argument written as Python, for the call shown on screen.
function pyLiteral(value) {
  if (value === null || value === undefined) return 'None';
  if (value === true) return 'True';
  if (value === false) return 'False';
  if (typeof value === 'number' || typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(pyLiteral).join(', ')}]`;
  return `{${Object.entries(value).map(([k, v]) => `${JSON.stringify(k)}: ${pyLiteral(v)}`).join(', ')}}`;
}

// An option has to fit on one line of a phone screen.
const MAX_OPTION_CHARS = 60;
const fitsOption = text => typeof text === 'string' && text.length > 0 && text.length <= MAX_OPTION_CHARS && !text.includes('\n');

// What `code` prints for `call`, or null when it fails to run cleanly.
async function printedBy(code, call) {
  const run = await runPythonScript({ code: `${code}\n\n${call}\n`, timeoutMs: 4000 });
  return run.exitCode === 0 && !run.timedOut ? normalizeOutput(run.stdout) : null;
}

// A predict round: the reference answer and one call from the tests. The right
// option is what Python really prints; the wrong ones are what the bot coder's
// wrong answers print for the same call, so every option is an output some
// plausible code produces. The call kept is the one with the most distinct
// wrong outputs (up to three); fewer than two and the problem cannot be a
// predict round.
async function computePredict(problem, bank) {
  if (problem.test_kind !== 'function') return null;
  const name = /^def\s+(\w+)\s*\(/m.exec(problem.solution_code || '')?.[1];
  if (!name) return null;
  const solution = bank.find(answer => answer.id === 'solution').code;
  let best = null;
  // Never a worked example: those are shown under the problem with their
  // results (public-task.js), which would put the answer on screen.
  const hidden = (asArray(problem.test_cases) || []).slice(Math.max(0, Number(config.exampleCasesShown) || 0));
  for (const testCase of hidden) {
    const call = `print(${name}(${(testCase.args || []).map(pyLiteral).join(', ')}))`;
    const answer = await printedBy(solution, call);
    if (!fitsOption(answer)) continue;
    const wrong = [];
    for (const attempt of bank) {
      if (attempt.id === 'solution') continue;
      const printed = await printedBy(attempt.code, call);
      if (fitsOption(printed) && printed !== answer && !wrong.includes(printed)) wrong.push(printed);
      if (wrong.length >= 3) break;
    }
    if (!best || wrong.length > best.wrong.length) best = { call, answer, wrong };
    if (wrong.length >= 3) break;
  }
  if (!best || best.wrong.length < 2) return null;
  // The order players see is fixed here, at random, so the answer is not always first.
  const texts = [best.answer, ...best.wrong];
  for (let i = texts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [texts[i], texts[j]] = [texts[j], texts[i]];
  }
  return {
    code: solution,
    call: best.call,
    answer: best.answer,
    options: texts.map((text, i) => ({ id: 'abcd'[i], text })),
  };
}

// A review round: the reference answer and up to three wrong ones, the wrong
// ones that pass the most tests first - the convincing kind of wrong. Only the
// code is kept, never which is right: the server finds that out by grading the
// option a player picks (gradeChoice), and npm run test:round-kinds checks
// exactly one option passes everything.
function computeReview(bank) {
  const solution = bank.find(answer => answer.id === 'solution');
  const wrong = bank
    .filter(answer => answer.id.startsWith('mistake-') && answer.passed < answer.total)
    .sort((a, b) => b.passed / b.total - a.passed / a.total)
    .slice(0, 3);
  if (wrong.length < 2) return null;
  const codes = [solution.code, ...wrong.map(answer => answer.code)];
  return { options: withReviewIds(codes.map(code => ({ code }))) };
}

// A review option's id is a hash of its code, never its place in the list: the
// reference answer is built first, so a positional id ('a') named the right
// answer to anyone reading the round view. Derived again on every read, so
// rows stored with letters before this change are covered too.
const reviewOptionId = code => crypto.createHash('sha256').update(code).digest('hex').slice(0, 8);
const withReviewIds = options => options
  .map(option => ({ id: reviewOptionId(option.code), code: option.code }))
  .sort((a, b) => (a.id < b.id ? -1 : 1));

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
  const review = computeReview(bank);
  if (review) {
    kinds.push('review');
    data.review = review;
  }
  const predict = await computePredict(problem, bank);
  if (predict) {
    kinds.push('predict');
    data.predict = predict;
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

// The options of a choice round, or null.
function choiceOptions(kind, problem) {
  const data = asObject(problem?.round_data);
  if (kind === 'predict') return data.predict?.options || null;
  if (kind === 'review') return data.review?.options ? withReviewIds(data.review.options) : null;
  return null;
}

// The tests an answer fails, said in a line a player can act on.
const failedTests = verdict => (verdict?.results || []).filter(result => !result.passed)
  .map(result => `${JSON.stringify(result.args ?? result.input)} → ${JSON.stringify(result.expected)}`).slice(0, 3);

// Marks an answer to a choice round.
// - predict: right when the option picked is what the code really prints
//   (stored at compute time, re-run by npm run test:round-kinds). One "test".
// - review: the picked answer is run by the real grader, and it is right only
//   if it passes every test. passed/total are that answer's real counts, and
//   `failed` names the tests a wrong pick fails, for the history.
async function gradeChoice(kind, problem, choice) {
  const data = asObject(problem?.round_data);
  const option = (choiceOptions(kind, problem) || []).find(candidate => candidate.id === choice);
  if (kind === 'review') {
    if (!option) return { correct: false, passed: 0, total: 0, picked: '', failed: [] };
    const verdict = await gradeSubmission({ problem, code: option.code });
    const correct = verdict.total > 0 && verdict.passed === verdict.total;
    return { correct, passed: verdict.passed, total: verdict.total, picked: option.code, failed: failedTests(verdict) };
  }
  const correct = Boolean(option) && kind === 'predict' && option.text === data.predict.answer;
  return { correct, passed: correct ? 1 : 0, total: 1, picked: option?.text ?? '', failed: [] };
}

// The right option, read from graded answers already in hand - for a bot
// deciding under the room lock, where Python must not run. A review option is
// a bank answer (computeReview), so its grade is in the bank.
function rightOption(kind, problem, bank) {
  const data = asObject(problem?.round_data);
  const options = choiceOptions(kind, problem) || [];
  if (kind === 'predict') return options.find(option => option.text === data.predict?.answer) || null;
  if (kind === 'review') {
    return options.find(option => bank?.some(answer => answer.code === option.code && answer.total > 0
      && answer.passed === answer.total)) || null;
  }
  return null;
}

// A review round shows each player the options in their own order, so a
// neighbour's "the second one" means nothing. Stable for one player in one
// match, so a reload shows the same order.
function orderFor(options, viewerKey) {
  const rank = option => crypto.createHash('sha256').update(`${viewerKey}:${option.id}`).digest('hex');
  return [...options].sort((a, b) => (rank(a) < rank(b) ? -1 : 1));
}

// What a player's browser may see of a round beyond the problem itself. Never
// which option is right.
function publicRoundView(kind, problem, viewerKey = '') {
  const data = asObject(problem?.round_data);
  if (kind === 'fix' && data.fix) {
    return { kind, fix: { starter_code: data.fix.code, passed: data.fix.passed, total: data.fix.total } };
  }
  if (kind === 'predict' && data.predict) {
    return { kind, predict: { code: data.predict.code, call: data.predict.call, options: data.predict.options } };
  }
  if (kind === 'review' && data.review) {
    return { kind, review: { options: orderFor(choiceOptions(kind, problem), viewerKey) } };
  }
  return { kind: 'write' };
}

module.exports = {
  KINDS, PLAYABLE, MIXED_ORDER, ROUND_FORMATS, CHOICE_KINDS,
  roundKindOf, roundSeconds, isChoiceKind, planRoundKinds, assignRoundKinds, computeRoundData, problemForKind,
  choiceOptions, gradeChoice, rightOption, publicRoundView, pyLiteral, printedBy, asObject,
};
