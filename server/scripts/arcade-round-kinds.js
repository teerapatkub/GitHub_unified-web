/**
 * Compute which round kinds each Arcade problem can be played as (ADR 0010).
 *
 *   node scripts/arcade-round-kinds.js            report only, nothing written
 *   node scripts/arcade-round-kinds.js --apply    write problem_modes.round_kinds / round_data
 *   node scripts/arcade-round-kinds.js --apply --force          recompute every row
 *   node scripts/arcade-round-kinds.js --ids 3,7  only these entry ids
 *
 * The server does the same in the background after it boots, for rows that are
 * missing or stale, so this is for checking the result or forcing a recompute.
 * Needs Python (it runs the grader on the bot coder's answers).
 */
const { Client } = require('pg');
const { databaseClientConfig } = require('./database-client-config');
const { refreshArcadeRoundData } = require('../arcade/round-data');

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force') || !APPLY;
const idsArg = process.argv[process.argv.indexOf('--ids') + 1];
const IDS = process.argv.includes('--ids') ? String(idsArg).split(',').map(Number).filter(Number.isInteger) : null;

(async () => {
  const client = new Client(databaseClientConfig());
  await client.connect();
  const db = {
    query: async (sql, args = []) => {
      let i = 0;
      const result = await client.query(sql.replace(/\?/g, () => `$${++i}`), args);
      return [result.rows, result];
    },
  };
  try {
    const report = await refreshArcadeRoundData(db, { force: FORCE, ids: IDS, apply: APPLY, log: line => console.log(line) });
    const counts = {};
    for (const row of report) for (const kind of row.kinds || []) counts[kind] = (counts[kind] || 0) + 1;
    const failed = report.filter(row => row.error);
    const unchanged = report.filter(row => !row.changed && !row.error).length;
    // Rows already up to date are not recomputed, so they are not in the counts.
    console.log(`\n${report.length} problems: ${report.length - unchanged - failed.length} computed, by kind:`, counts,
      `- ${unchanged} already up to date${failed.length ? `, ${failed.length} failed` : ''}`);
    console.log(APPLY ? 'Written.' : 'Report only. Add --apply to write.');
    process.exitCode = failed.length ? 1 : 0;
  } finally {
    await client.end();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
