const config = require('../../shared/arcadeConfig.json');

// What a player's browser may see of an Arcade problem. The first
// exampleCasesShown test cases are public on purpose: they are the worked
// examples under the problem and what "ทดสอบโค้ด" runs. The remaining cases and
// the reference answer stay on the server, which grades every submission
// (ADR 0001).
function publicArcadeTask(row) {
  let cases = row.test_cases;
  if (typeof cases === 'string') {
    try { cases = JSON.parse(cases); } catch { cases = null; }
  }
  if (!Array.isArray(cases)) cases = [];
  const shown = Math.max(0, Number(config.exampleCasesShown) || 0);
  const { task_id, difficulty, title_th, title_en, desc_th, desc_en, starter_code, hint_th, hint_en } = row;
  return {
    task_id, difficulty, title_th, title_en, desc_th, desc_en, starter_code, hint_th, hint_en,
    example_cases: cases.slice(0, shown),
    example_count_hidden: Math.max(0, cases.length - shown),
  };
}

module.exports = { publicArcadeTask };
