// How strong are bots that write real answers (ADR 0005)?
//
//   node scripts/arcade-tests/bot-balance-sim.js [rounds-per-difficulty]
//
// Needs the database (reads the 40 Arcade problems) and Python (grades each
// problem's answer bank once, about a minute). Then simulates unattacked bots,
// standard 60-second rounds, every persona equally often, with the real
// typing model from arcade/bot-coder.js, and prints the average round score per
// room difficulty next to the progress-bar scoring it replaced. A change to
// bot typing, the mutation rules or botSkillByDifficulty should keep each row
// within about 10% of the "before" column unless the change is meant to.
//
// Quality is measured the way rounds are scored (code-metrics.js, ADR 0007),
// scaled by the tests passed, as in phase-finalizer.js. No model is called.
require('dotenv').config({ path: require('path').join(__dirname, '../../.env'), quiet: true });
const { Client } = require('pg');
const config = require('../../../shared/arcadeConfig.json');
const profiles = require('../../../shared/arcadeBotProfiles.json');
const coder = require('../../arcade/bot-coder');
const { createArcadeCodeJudge } = require('../../arcade/code-judge');
const { problemForKind } = require('../../arcade/round-kinds');

// Mean unattacked bot round score under the progress-bar scoring (Monte Carlo
// in project_logs/2026-10-18/0440-arcade-debuffs-cost-bots-points.md, 3 cases).
const BEFORE = { easy: 92.2, default: 133.4, medium: 164.8, hard: 184.1 };
const ROUND_SECONDS = 60;
const POOLS = { easy: ['easy'], default: ['easy', 'medium'], medium: ['medium'], hard: ['hard'] };

// A fix round (ADR 0010) types from its own bank: the AI's wrong answer as the
// starter and give-up, edits of it as attempts (arcade/bot-coder.js buildFixBank).
const fixStart = bank => ({ starter: bank.fixBank.starter, answers: bank.fixBank, fix: true, writeStarter: bank.starter });

// Same as bot-ticker.js answerKeystrokeMs.
function keystrokeMs(profile, plan, steps) {
  const chars = Math.max(1, plan.insert.length);
  const pauses = (plan.insert.match(/[\n:]/g) || []).length * (coder.PAUSE_FACTOR - 1);
  const lengthFactor = Math.min(1.6, Math.max(0.7, Math.sqrt(chars / config.botReferenceAnswerChars)));
  return profile.typingSpeedMs * steps * lengthFactor / (chars + pauses);
}

function simulateRound(bank, profile, skill, random, start = { starter: bank.starter, answers: bank }) {
  const target = Math.min(1, Math.max(0, skill.passMin + random() * skill.passSpread));
  const answer = start.fix ? coder.chooseFixAnswer(start.answers, bank, target, random) : coder.chooseAnswer(start.answers, target, random);
  const plan = coder.typingPlan(start.starter, answer.code);
  const steps = 14 + Math.floor(random() * 11);
  let charMs = keystrokeMs(profile, plan, steps);
  if (start.fix) {
    const writePlan = coder.typingPlan(start.writeStarter, answer.code);
    charMs = keystrokeMs(profile, writePlan, steps) * coder.huntingFactor(writePlan, plan);
  }
  let elapsed = 0;
  let finished = false;
  // Giving up leaves the scaffold for the deadline to send (bot-ticker.js).
  while (plan.insert && elapsed < ROUND_SECONDS * 1000) {
    elapsed += coder.stepCost(plan, charMs);
    if (coder.typingStep(plan, { accuracy: profile.accuracy, effects: new Set(), random }) === 'done') { finished = true; break; }
  }
  const code = coder.draftOf(plan);
  // Sending the AI's answer back untouched scores nothing (phase-finalizer.js).
  if (start.fix && code === start.starter) return { score: 0, finished, typo: false };
  // A typo left in the answer means it is not the banked code; count it as failing.
  const graded = start.answers.find(a => a.code === code);
  let passRatio = graded ? graded.passed / graded.total : 0;
  if (start.fix && graded) {
    // Only the tests the AI's answer failed count (phase-finalizer.js scoredRatio).
    const base = start.answers.find(a => a.id === 'starter').passed;
    passRatio = Math.max(0, (graded.passed - base) / (graded.total - base));
  }
  // A typo left in the draft is judged as the answer the bot meant to type.
  const judged = answer.quality;
  const quality = !judged || judged.source === 'starter' ? 0 : Math.round(judged.score * (0.5 + 0.5 * passRatio));
  const timeUsed = finished ? Math.min(ROUND_SECONDS, elapsed / 1000) : ROUND_SECONDS;
  return { score: passRatio * 100 + quality + passRatio * ((ROUND_SECONDS - timeUsed) / ROUND_SECONDS) * 100, finished, typo: finished && !graded };
}

(async () => {
  const rounds = Number(process.argv[2]) || 4000;
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const { rows } = await c.query(`SELECT m.entry_id, m.difficulty, m.round_data, p.title_th, p.desc_th, p.test_kind, p.test_cases, p.solution_code, p.starter_code
    FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id WHERE m.mode = 'arcade'`);
  await c.end();
  const banks = {};
  const judge = createArcadeCodeJudge();
  for (const row of rows) {
    const bank = await coder.buildBank(row);
    await Promise.all(bank.map(async answer => {
      answer.quality = await judge.judge({ taskId: row.entry_id, problem: row, code: answer.code });
    }));
    const fixProblem = problemForKind(row, 'fix');
    if (fixProblem !== row) {
      bank.fixBank = await coder.buildFixBank(fixProblem, row.starter_code);
      await Promise.all(bank.fixBank.map(async answer => {
        answer.quality = await judge.judge({ taskId: `${row.entry_id}:fix`, problem: fixProblem, code: answer.code });
      }));
    }
    (banks[row.difficulty] ??= []).push(bank);
  }
  const sources = {};
  for (const answer of Object.values(banks).flat(2)) sources[answer.quality.source] = (sources[answer.quality.source] || 0) + 1;
  console.log('judged answers by source:', sources);
  const random = Math.random;
  console.log('difficulty  before  after   change  finished  sent-with-typo');
  for (const difficulty of Object.keys(BEFORE)) {
    const pool = POOLS[difficulty].flatMap(d => banks[d]);
    const skill = config.botSkillByDifficulty[difficulty];
    let total = 0; let finished = 0; let typos = 0;
    for (let i = 0; i < rounds; i++) {
      const r = simulateRound(pool[Math.floor(random() * pool.length)], profiles[i % profiles.length], skill, random);
      total += r.score; finished += r.finished; typos += r.typo;
    }
    const after = total / rounds;
    const change = ((after / BEFORE[difficulty] - 1) * 100).toFixed(1);
    console.log(`${difficulty.padEnd(10)}  ${BEFORE[difficulty].toFixed(1).padStart(6)}  ${after.toFixed(1).padStart(6)}  ${change.padStart(5)}%  ${(finished / rounds * 100).toFixed(0).padStart(6)}%  ${(typos / rounds * 100).toFixed(1).padStart(8)}%`);
  }

  // Each round kind against write, on the same problems (ADR 0010): a kind
  // whose average is more than 15% from write makes that round a lottery.
  console.log('\nround kind  difficulty  write   kind    change');
  let outOfBand = 0;
  for (const difficulty of Object.keys(BEFORE)) {
    const pool = POOLS[difficulty].flatMap(d => banks[d]).filter(bank => bank.fixBank);
    const skill = config.botSkillByDifficulty[difficulty];
    let write = 0; let fix = 0;
    for (let i = 0; i < rounds; i++) {
      const bank = pool[Math.floor(random() * pool.length)];
      const profile = profiles[i % profiles.length];
      write += simulateRound(bank, profile, skill, random).score;
      fix += simulateRound(bank, profile, skill, random, fixStart(bank)).score;
    }
    const change = (fix / write - 1) * 100;
    if (Math.abs(change) > 15) outOfBand++;
    console.log(`fix         ${difficulty.padEnd(10)}  ${(write / rounds).toFixed(1).padStart(6)}  ${(fix / rounds).toFixed(1).padStart(6)}  ${change.toFixed(1).padStart(5)}%`);
  }
  if (outOfBand) {
    console.log(`\n${outOfBand} row(s) more than 15% from write.`);
    process.exitCode = 1;
  }
})().catch(error => { console.error(error.message); process.exit(1); });
