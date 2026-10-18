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
require('dotenv').config({ path: require('path').join(__dirname, '../../.env'), quiet: true });
const { Client } = require('pg');
const config = require('../../../shared/arcadeConfig.json');
const profiles = require('../../../shared/arcadeBotProfiles.json');
const coder = require('../../arcade/bot-coder');

// Mean unattacked bot round score under the progress-bar scoring (Monte Carlo
// in project_logs/2026-10-18/0440-arcade-debuffs-cost-bots-points.md, 3 cases).
const BEFORE = { easy: 92.2, default: 133.4, medium: 164.8, hard: 184.1 };
const ROUND_SECONDS = 60;
const POOLS = { easy: ['easy'], default: ['easy', 'medium'], medium: ['medium'], hard: ['hard'] };

function simulateRound(bank, profile, skill, random) {
  const target = Math.min(1, Math.max(0, skill.passMin + random() * skill.passSpread));
  const answer = coder.chooseAnswer(bank, target, random);
  const plan = coder.typingPlan(bank.starter, answer.code);
  const steps = 14 + Math.floor(random() * 11);
  const chars = Math.max(1, plan.insert.length);
  const pauses = (plan.insert.match(/[\n:]/g) || []).length * (coder.PAUSE_FACTOR - 1);
  const lengthFactor = Math.min(1.6, Math.max(0.7, Math.sqrt(chars / config.botReferenceAnswerChars)));
  const charMs = profile.typingSpeedMs * steps * lengthFactor / (chars + pauses);
  let elapsed = 0;
  let finished = false;
  // Giving up leaves the scaffold for the deadline to send (bot-ticker.js).
  while (plan.insert && elapsed < ROUND_SECONDS * 1000) {
    elapsed += coder.stepCost(plan, charMs);
    if (coder.typingStep(plan, { accuracy: profile.accuracy, effects: new Set(), random }) === 'done') { finished = true; break; }
  }
  const code = coder.draftOf(plan);
  // A typo left in the answer means it is not the banked code; count it as failing.
  const graded = bank.find(a => a.code === code);
  const passRatio = graded ? graded.passed / graded.total : 0;
  const quality = skill.qualityMin + Math.floor(random() * skill.qualitySpread);
  const timeUsed = finished ? Math.min(ROUND_SECONDS, elapsed / 1000) : ROUND_SECONDS;
  return { score: passRatio * 100 + quality + passRatio * ((ROUND_SECONDS - timeUsed) / ROUND_SECONDS) * 100, finished, typo: finished && !graded };
}

(async () => {
  const rounds = Number(process.argv[2]) || 4000;
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const { rows } = await c.query(`SELECT m.entry_id, m.difficulty, p.test_kind, p.test_cases, p.solution_code, p.starter_code
    FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id WHERE m.mode = 'arcade'`);
  await c.end();
  const banks = {};
  for (const row of rows) (banks[row.difficulty] ??= []).push(await coder.buildBank(row));
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
})().catch(error => { console.error(error.message); process.exit(1); });
