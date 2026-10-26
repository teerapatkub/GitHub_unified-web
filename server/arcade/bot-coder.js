// Bots write real answers (ADR 0005).
//
// For each Arcade problem a bot can submit the reference answer or a realistic
// mistake made from it: an off-by-one, a flipped comparison, a wrong constant.
// Every candidate is graded once by the real grader and cached, so a bot that
// "aims" for a pass ratio picks an answer that really scores that, and the
// round is settled by the same grader as a human's code.
//
// A bot types its answer into the editor one character at a time (typingStep),
// with typos it may or may not notice, and debuffs that slow it, stop it or
// corrupt what it types. The text it has typed so far is a real draft other
// players can watch once they have submitted.
const { gradeSubmission } = require('../problemGrader');
const { arcadeCodeJudge, heuristicCodeQualityScore } = require('./code-judge');

// Text rules that turn a correct line into a plausible wrong one.
const MUTATIONS = [
  [/ <= /, ' < '], [/ < /, ' <= '], [/ >= /, ' > '], [/ > /, ' >= '],
  [/ == /, ' != '], [/ != /, ' == '], [/ and /, ' or '], [/ or /, ' and '],
  [/ \+ 1\b/, ''], [/ - 1\b/, ''], [/range\(1, /, 'range('], [/range\(([^,()]+)\)/, 'range(1, $1)'],
  [/\[::-1\]/, ''], [/\.lower\(\)/, ''], [/ \+= /, ' = '], [/ \* /, ' + '], [/ \/\/ /, ' / '],
  [/return True/, 'return False'], [/return False/, 'return True'], [/return 0\b/, 'return 1'],
  [/\bmax\(/, 'min('], [/\bmin\(/, 'max('], [/\.upper\(\)/, '.lower()'], [/\.swapcase\(\)/, '.upper()'],
  [/ not in /, ' in '], [/ in (?!range)/, ' not in '], [/\.split\(\)/, '.split(" ")'], [/\[0\]/, '[-1]'],
  [/\[-1\]/, '[0]'], [/ % 2 == 0/, ' % 2 == 1'], [/\*\* 2/, '* 2'], [/ \+ /, ' - '], [/ - /, ' + '],
  [/\bset\(/, 'list('], [/\bsorted\(/, 'list('], [/ \+= 1\b/, ' += 2'], [/\[-k:\]/, '[k:]'], [/\[:-k\]/, '[:k]'],
  [/return len\(/, 'return -1 + len('], [/\bsum\(/, 'len('], [/ \/ len\(/, ' // len('],
];

const lines = text => String(text || '').replace(/\r\n/g, '\n').split('\n');

// Lines of the answer that the starter does not already contain: the part a
// player actually writes. Mutating the given scaffold would not be a mistake a
// player makes.
function answerLineIndexes(starter, solution) {
  const given = new Set(lines(starter).map(line => line.trim()));
  return lines(solution).map((line, i) => (given.has(line.trim()) || !line.trim() ? -1 : i)).filter(i => i >= 0);
}

function candidateAnswers({ starter_code: starter, solution_code: solution }) {
  const solutionLines = lines(solution);
  const seen = new Set([solutionLines.join('\n')]);
  const out = [];
  for (const index of answerLineIndexes(starter, solution)) {
    for (const [pattern, replacement] of MUTATIONS) {
      if (!pattern.test(solutionLines[index])) continue;
      const mutated = solutionLines.slice();
      mutated[index] = solutionLines[index].replace(pattern, replacement);
      const code = mutated.join('\n');
      if (!seen.has(code)) { seen.add(code); out.push(code); }
    }
  }
  return out;
}

// One graded bank per problem, shared by every room in this process.
const banks = new Map();

async function buildBank(problem) {
  const graded = async (id, code) => {
    const verdict = await gradeSubmission({ problem, code });
    return { id, code, passed: verdict.passed, total: verdict.total, verdict };
  };
  const solution = await graded('solution', lines(problem.solution_code).join('\n'));
  if (!solution.total || solution.passed !== solution.total) throw new Error('reference answer does not pass its own tests');
  const mistakes = [];
  // Running out of ideas and sending the scaffold unchanged is a real outcome too.
  const starter = await graded('starter', lines(problem.starter_code).join('\n'));
  if (starter.passed < starter.total) mistakes.push(starter);
  for (const [i, code] of candidateAnswers(problem).entries()) {
    const answer = await graded(`mistake-${i}`, code);
    if (answer.passed < answer.total) mistakes.push(answer);
    if (mistakes.length >= 8) break;
  }
  const bank = [solution, ...mistakes];
  bank.starter = starter.code; // where a bot starts typing
  return bank;
}

// A fix round's bank (ADR 0010). The editor opens on the AI's wrong answer
// (problem.starter_code here, see round-kinds.js problemForKind). Sending it
// back unchanged is giving up and scores nothing, so it is the 'starter'
// answer. A wrong attempt is another edit of the AI's
// answer - the bug left in, something else changed - graded for real.
// writeStarter is the scaffold the write round would have opened on.
async function buildFixBank(problem, writeStarter) {
  const graded = async (id, code) => {
    const verdict = await gradeSubmission({ problem, code });
    return { id, code, passed: verdict.passed, total: verdict.total, verdict };
  };
  const solution = await graded('solution', lines(problem.solution_code).join('\n'));
  const fixCode = lines(problem.starter_code).join('\n');
  const giveUp = await graded('starter', fixCode);
  const attempts = [];
  for (const [i, code] of candidateAnswers({ starter_code: '', solution_code: fixCode }).entries()) {
    if (code === solution.code) continue;
    attempts.push(await graded(`attempt-${i}`, code));
    if (attempts.length >= 8) break;
  }
  const bank = [solution, giveUp, ...attempts];
  bank.starter = fixCode;
  bank.writeStarter = lines(writeStarter).join('\n');
  return bank;
}

// Load and grade a problem's bank once; later calls share the same promise.
// `build` makes a fix round's bank instead (buildFixBank).
function warmBank(key, loadProblem, build = buildBank) {
  if (!banks.has(key)) {
    const pending = Promise.resolve().then(loadProblem).then(async problem => {
      if (!problem) throw new Error('problem not found');
      const bank = await build(problem);
      // Bots type as soon as the tests are graded; each answer's quality is
      // measured behind them (code-metrics.js).
      bank.qualityReady = judgeBank(key, problem, bank);
      return bank;
    });
    const entry = { ready: null, failed: false, promise: pending };
    entry.promise = pending.then(bank => { entry.ready = bank; return bank; },
      error => { entry.failed = true; console.error(`Arcade bot answer bank ${key} failed:`, error.message); });
    banks.set(key, entry);
  }
  return banks.get(key).promise;
}

// Each answer in the bank gets the same quality verdict a player sending that
// code would get (ADR 0007). Shared cache, so this happens once per process.
function judgeBank(key, problem, bank) {
  const judge = arcadeCodeJudge();
  return Promise.all(bank.map(async answer => {
    answer.quality = await judge.judge({ taskId: key, problem, code: answer.code });
  })).catch(error => { console.error(`Arcade bot answer quality ${key} failed:`, error.message); });
}

// The quality verdict of the answer a bot set out to type. Waits briefly for
// the measurement; if it is somehow not done, the answer is scored locally.
async function answerQuality(key, answerId, waitMs = 3000) {
  const bank = readyBank(key);
  const answer = bank?.find(a => a.id === answerId);
  if (!answer) return null;
  if (!answer.quality && bank.qualityReady) {
    let timer;
    await Promise.race([bank.qualityReady, new Promise(resolve => { timer = setTimeout(resolve, waitMs); })]);
    clearTimeout(timer);
  }
  return answer.quality || { score: heuristicCodeQualityScore(answer.code), rubric: null, reason: '', feedback: '', source: 'fallback' };
}

// Synchronous: a ticker holding a room lock must never wait on Python.
function readyBank(key) {
  const entry = banks.get(key);
  return entry?.ready || null;
}

function bankFailed(key) {
  return Boolean(banks.get(key)?.failed);
}

// The answer whose real pass ratio is closest to what this bot's skill rolled.
function chooseAnswer(bank, targetRatio, random) {
  let best = [];
  let bestDistance = Infinity;
  for (const answer of bank) {
    // A weak player usually sends a wrong attempt rather than nothing, so
    // giving up only wins when no attempt comes reasonably close.
    const giveUpPenalty = answer.id === 'starter' ? 0.2 : 0;
    const distance = Math.abs(answer.passed / answer.total - targetRatio) + giveUpPenalty;
    if (distance < bestDistance - 1e-9) { best = [answer]; bestDistance = distance; }
    else if (Math.abs(distance - bestDistance) <= 1e-9) best.push(answer);
  }
  return best[Math.floor(random() * best.length)];
}

function gradedFromBank(key, code) {
  return readyBank(key)?.find(answer => answer.code === code) || null;
}

// The part of the editor the bot has to replace: everything between the
// longest shared start and end of the starter and its answer.
function typingPlan(starter, answer) {
  const from = lines(starter).join('\n');
  const to = answer;
  let start = 0;
  while (start < from.length && start < to.length && from[start] === to[start]) start++;
  let end = 0;
  while (end < from.length - start && end < to.length - start
    && from[from.length - 1 - end] === to[to.length - 1 - end]) end++;
  return { prefix: to.slice(0, start), insert: to.slice(start, to.length - end), suffix: to.slice(to.length - end),
    text: '', next: 0 };
}

const draftOf = plan => plan.prefix + plan.text + plan.suffix;

function correctLength(plan) {
  let n = 0;
  while (n < plan.text.length && plan.text[n] === plan.insert[n]) n++;
  return n;
}

const PAUSE_FACTOR = 4; // thinking at the end of a line or after ':'
const NEIGHBOURS = 'qwertyuiopasdfghjklzxcvbnm';
const SCRAMBLE = { a: 'q', e: 'w', i: 'r', o: 't', u: 'y', s: 'd', t: 'f' };
const GLITCH = 'xyz1!#';

// How long the next action takes: a pause to think at the end of a line.
function stepCost(plan, charMs) {
  const prev = plan.insert[plan.next - 1];
  return prev === '\n' || prev === ':' ? charMs * PAUSE_FACTOR : charMs;
}

// One keystroke. Returns 'done' once the bot considers its answer finished.
//   effects: Set of active debuff types on this bot.
function typingStep(plan, { accuracy, effects, random }) {
  const correct = correctLength(plan);
  const hasError = plan.text.length > correct;
  // Noticing a wrong character costs a keystroke to delete it - unless
  // Backspace Lock is on, when the bot can only keep going.
  if (hasError && !effects.has('backspaceLock') && random() < accuracy) {
    plan.text = plan.text.slice(0, -1);
    if (plan.text.length <= correct) plan.next = plan.text.length;
    return 'fixing';
  }
  if (plan.next >= plan.insert.length) {
    // Typed to the end. A careful bot reads it over before sending.
    if (hasError && !effects.has('backspaceLock') && random() < accuracy) return 'fixing';
    return 'done';
  }
  let ch = plan.insert[plan.next];
  plan.next++;
  if (/[a-z]/i.test(ch) && random() > accuracy + (1 - accuracy) * 0.7) {
    ch = NEIGHBOURS[Math.floor(random() * NEIGHBOURS.length)];
  }
  if (effects.has('keyScrambler') && SCRAMBLE[ch.toLowerCase()]) ch = SCRAMBLE[ch.toLowerCase()];
  if (effects.has('capsLockLock')) ch = ch.toUpperCase();
  plan.text += ch;
  if (effects.has('typoGenerator') && random() < 0.15) plan.text += GLITCH[Math.floor(random() * GLITCH.length)];
  return 'typing';
}

// A fix round is won by finding the bug; tests the AI already passed earn
// nothing (phase-finalizer.js scoredRatio). The skill roll that would pick an
// answer in the write round of the same problem (writeBank) picks one here
// too, and the bot finds the bug with the share of tests that answer passes,
// so a bot is as strong in either kind of round. Missing it, the bot gives up
// one time in five and otherwise sends one of its own wrong edits.
function chooseFixAnswer(bank, writeBank, target, random) {
  const written = chooseAnswer(writeBank, target, random);
  if (random() < written.passed / written.total) return bank.find(answer => answer.id === 'solution');
  const misses = bank.filter(answer => answer.id.startsWith('attempt-') && answer.passed < answer.total);
  if (!misses.length || random() < 0.2) return bank.find(answer => answer.id === 'starter');
  return misses[Math.floor(random() * misses.length)];
}

// Finding the bug takes a person about as long as writing the answer would;
// the edit itself is a few characters. A bot therefore spends the time the
// write round would have taken, spread over the shorter edit.
function huntingFactor(writePlan, fixPlan) {
  const effort = plan => plan.insert.length + (plan.insert.match(/[\n:]/g) || []).length * (PAUSE_FACTOR - 1);
  return Math.max(1, effort(writePlan)) / Math.max(1, effort(fixPlan));
}

const progressOf = plan => (plan.insert.length ? Math.min(100, (correctLength(plan) / plan.insert.length) * 100) : 100);

module.exports = {
  MUTATIONS, PAUSE_FACTOR, candidateAnswers, buildFixBank, chooseFixAnswer, huntingFactor, buildBank, warmBank, readyBank, bankFailed, chooseAnswer, gradedFromBank,
  answerQuality,
  typingPlan, typingStep, stepCost, draftOf, progressOf, correctLength,
};
