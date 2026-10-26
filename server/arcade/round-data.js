// Keeps problem_modes.round_kinds / round_data in step with the Arcade problems
// (round-kinds.js, ADR 0010).
//
// The data is computed by running code - the grader on the bot coder's wrong
// answers, Python on the predict snippets - so it is never typed in by hand and
// never asked of a model. Each row remembers a hash of the problem's code and
// tests; a problem edited in arcadeTaskSeed.js gets new data on the next run.
//
// Run by the server in the background after boot (about a second of Python per
// problem, only for rows that are missing or stale) and by
// scripts/arcade-round-kinds.js on demand.
const crypto = require('node:crypto');
const { computeRoundData, asObject } = require('./round-kinds');

// Bump to recompute every row, e.g. after changing how a kind is built.
const DATA_VERSION = 1;

function sourceHash(problem) {
  const cases = typeof problem.test_cases === 'string' ? problem.test_cases : JSON.stringify(problem.test_cases);
  return crypto.createHash('sha256')
    .update([DATA_VERSION, problem.test_kind, problem.starter_code, problem.solution_code, cases].join('\u0000'))
    .digest('hex').slice(0, 16);
}

async function arcadeRows(db, ids) {
  const [rows] = await db.query(
    `SELECT m.entry_id, m.round_data, p.test_kind, p.test_cases, p.solution_code, p.starter_code, p.title_en
     FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
     WHERE m.mode = 'arcade' ORDER BY m.entry_id`
  );
  return ids ? rows.filter(row => ids.includes(row.entry_id)) : rows;
}

// Returns [{ entry_id, title_en, kinds, changed }] for every row looked at.
async function refreshArcadeRoundData(db, { force = false, ids = null, apply = true, log = () => {} } = {}) {
  const report = [];
  for (const row of await arcadeRows(db, ids)) {
    const hash = sourceHash(row);
    const stored = asObject(row.round_data);
    if (!force && stored.source_hash === hash) {
      report.push({ entry_id: row.entry_id, title_en: row.title_en, kinds: null, changed: false });
      continue;
    }
    try {
      const { kinds, data } = await computeRoundData(row);
      if (apply) {
        await db.query(
          `UPDATE problem_modes SET round_kinds = ?, round_data = ?, updated_at = CURRENT_TIMESTAMP
           WHERE mode = 'arcade' AND entry_id = ?`,
          [JSON.stringify(kinds), JSON.stringify({ ...data, source_hash: hash }), row.entry_id]
        );
      }
      report.push({ entry_id: row.entry_id, title_en: row.title_en, kinds, changed: true });
      log(`#${row.entry_id} ${row.title_en}: ${kinds.join(', ')}`);
    } catch (error) {
      // One broken problem must not stop the rest; it stays a write-only problem.
      report.push({ entry_id: row.entry_id, title_en: row.title_en, kinds: null, changed: false, error: error.message });
      log(`#${row.entry_id} ${row.title_en}: failed - ${error.message}`);
    }
  }
  return report;
}

module.exports = { refreshArcadeRoundData, sourceHash, DATA_VERSION };
