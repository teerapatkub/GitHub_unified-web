// Do the measured quality rules (arcade/code-metrics.js, ADR 0007) treat the
// reference answers fairly?
//
//   node scripts/arcade-tests/quality-calibration.js
//
// Reads the 40 Arcade problems (read-only) and measures every reference answer
// and every mistake in the bots' answer banks. A reference answer is the
// yardstick, so it must score 95+ on all three criteria; if one does not, a
// rule is wrong for that problem - fix the rule, not the answer. Exits 1 when
// any reference answer falls short.
require('dotenv').config({ path: require('path').join(__dirname, '../../.env'), quiet: true });
const { Client } = require('pg');
const metrics = require('../../arcade/code-metrics');
const { candidateAnswers } = require('../../arcade/bot-coder');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const { rows } = await c.query(`SELECT m.entry_id, p.title_en, p.test_kind, p.test_cases, p.solution_code, p.starter_code
    FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id WHERE m.mode = 'arcade' ORDER BY m.entry_id`);
  await c.end();

  let short = 0;
  const mistakeScores = [];
  for (const problem of rows) {
    const reference = await metrics.probe({ problem, code: problem.solution_code });
    const own = metrics.scoreQuality(reference, reference);
    const low = metrics.CRITERIA.filter(key => own.rubric[key] < 95);
    if (low.length || !reference.ok) {
      short += 1;
      console.log(`✗ #${problem.entry_id} ${problem.title_en}: ${low.map(k => `${k} ${own.rubric[k]}`).join(', ') || reference.error}`);
      for (const f of own.rubric.findings) console.log(`    line ${f.line ?? '-'}: ${f.en}`);
    }
    for (const code of candidateAnswers(problem).slice(0, 4)) {
      mistakeScores.push(metrics.scoreQuality(await metrics.probe({ problem, code }), reference).score);
    }
  }
  const mean = list => (list.reduce((a, b) => a + b, 0) / Math.max(1, list.length)).toFixed(1);
  console.log(`\nreference answers: ${rows.length - short}/${rows.length} score 95+ on every criterion`);
  console.log(`bank mistakes: ${mistakeScores.length} measured, mean quality ${mean(mistakeScores)}`);
  process.exit(short ? 1 : 0);
})().catch(error => { console.error(error.message); process.exit(1); });
