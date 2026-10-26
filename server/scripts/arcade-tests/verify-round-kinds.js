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
//     of them, or its stored pass count differs from what the grader says now.
const { Client } = require('pg');
const { databaseClientConfig } = require('../database-client-config');
const { gradeSubmission } = require('../../problemGrader');
const { sourceHash } = require('../../arcade/round-data');
const { asObject } = require('../../arcade/round-kinds');

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
