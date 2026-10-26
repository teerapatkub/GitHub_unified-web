// Checks the round-kind data stored for every Arcade problem (ADR 0010) by
// running it again, not by trusting it.
//
//   node scripts/arcade-tests/verify-round-kinds.js
//
// Needs the database the server uses and Python. Fails when:
//   - a row's data was computed from different code or tests (stale hash): the
//     server recomputes these in the background after boot, so this means it
//     has not run since the problem changed;
//   - a fix round's AI answer does not pass at least one test, or passes all
//     of them, or its stored pass count differs from what the grader says now;
//   - a predict round's stored answer is not what Python prints for its code
//     and call, is not one of the options, or two options are the same;
//   - a review round does not have exactly one answer that passes every test.
const { Client } = require('pg');
const { databaseClientConfig } = require('../database-client-config');
const { gradeSubmission } = require('../../problemGrader');
const { sourceHash } = require('../../arcade/round-data');
const { asObject, printedBy, pyLiteral } = require('../../arcade/round-kinds');
const config = require('../../../shared/arcadeConfig.json');

(async () => {
  const client = new Client(databaseClientConfig());
  await client.connect();
  const { rows } = await client.query(
    `SELECT m.entry_id, m.round_kinds, m.round_data, p.title_en, p.test_kind, p.test_cases, p.solution_code, p.starter_code
     FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id WHERE m.mode = 'arcade' ORDER BY m.entry_id`
  );
  await client.end();
  const failures = [];
  const counts = {};
  for (const row of rows) {
    const kinds = Array.isArray(row.round_kinds) ? row.round_kinds : [];
    const data = asObject(row.round_data);
    const label = `#${row.entry_id} ${row.title_en}`;
    for (const kind of kinds) counts[kind] = (counts[kind] || 0) + 1;
    if (!kinds.includes('write')) failures.push(`${label}: every problem must stay playable as "write"`);
    if (data.source_hash !== sourceHash(row)) {
      failures.push(`${label}: round data is stale or missing (run: npm run round-kinds -- --apply)`);
      continue;
    }
    if (kinds.includes('predict')) {
      const predict = data.predict;
      const texts = (predict?.options || []).map(option => option.text);
      const printed = predict ? await printedBy(predict.code, predict.call) : null;
      if (printed !== predict?.answer) {
        failures.push(`${label}: predict answer is stored as ${JSON.stringify(predict?.answer)} but Python prints ${JSON.stringify(printed)}`);
      }
      if (!texts.includes(predict?.answer)) failures.push(`${label}: the predict answer is not one of the options`);
      // A worked example is shown with its result, so its call would give the answer away.
      const name = /^def\s+(\w+)\s*\(/m.exec(row.solution_code || '')?.[1];
      const shown = (Array.isArray(row.test_cases) ? row.test_cases : []).slice(0, Number(config.exampleCasesShown) || 0)
        .map(testCase => `print(${name}(${(testCase.args || []).map(pyLiteral).join(', ')}))`);
      if (shown.includes(predict?.call)) failures.push(`${label}: the predict call ${predict.call} is a worked example shown with its answer`);
      if (new Set(texts).size !== texts.length || texts.length < 3) failures.push(`${label}: predict needs at least three different options`);
    }
    if (kinds.includes('review')) {
      const codes = (data.review?.options || []).map(option => option.code);
      if (codes.length < 3 || new Set(codes).size !== codes.length) failures.push(`${label}: review needs at least three different answers`);
      let right = 0;
      for (const code of codes) {
        const verdict = await gradeSubmission({ problem: row, code });
        if (verdict.total > 0 && verdict.passed === verdict.total) right++;
      }
      if (right !== 1) failures.push(`${label}: ${right} review options pass every test; exactly one must`);
    }
    if (kinds.includes('fix')) {
      const fix = data.fix;
      if (!fix?.code) { failures.push(`${label}: listed as fix but has no AI answer`); continue; }
      const verdict = await gradeSubmission({ problem: row, code: fix.code });
      if (verdict.passed < 1 || verdict.passed >= verdict.total) {
        failures.push(`${label}: the AI answer passes ${verdict.passed}/${verdict.total}; it must pass at least one test and fail one`);
      }
      if (verdict.passed !== fix.passed || verdict.total !== fix.total) {
        failures.push(`${label}: stored ${fix.passed}/${fix.total} but the grader says ${verdict.passed}/${verdict.total}`);
      }
    }
  }
  console.log(`${rows.length} Arcade problems, by round kind:`, counts);
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log('Round-kind data matches what the grader says.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
