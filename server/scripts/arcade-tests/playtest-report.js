// Turns a real person's playtest into a verdict you can act on.
//
// Every round a player submits already writes a full row to
// arcade_round_history — the code they wrote, how many test cases it passed,
// how long they took, what the room was set to. So a playtest needs no special
// instrumentation; it just needs someone to read that back and compare it with
// the bar we set. This does that.
//
// The bar (agreed 2026-08-19): a genuine beginner should finish at least
// 2 of the 4 rounds in an EASY room on STANDARD (60s) pacing. Below that the
// mode is still too hard and the levers are beginnerCharsPerMinute and
// botSkillByDifficulty in shared/arcadeConfig.json.
//
// What this CANNOT tell you, and why the human notes in
// PLAYTEST-PROTOCOL.md still matter: a round the player failed looks identical
// in the database whether they could not READ the problem, could not THINK of
// the answer, or knew it and could not TYPE it in time. Those three have
// completely different fixes. Only someone watching can tell them apart.
//
// Usage:
//   node playtest-report.js <user_name>            # their most recent match
//   node playtest-report.js <user_name> ARC-XXXX   # one specific match
//
// Requires the server running (reads through the public history API).
const fs = require('fs');
const path = require('path');

const BASE = process.env.ARCADE_TEST_BASE || 'http://localhost:3001';
const cfg = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'shared', 'arcadeConfig.json'), 'utf8'));

const ROUNDS_REQUIRED = 2;
const TOTAL_ROUNDS = 4;

const userName = process.argv[2];
const roomFilter = process.argv[3];

if (!userName) {
  console.error('usage: node playtest-report.js <user_name> [ARC-XXXX]');
  process.exit(2);
}

const bar = (n, of, width = 20) => {
  const filled = of > 0 ? Math.round((n / of) * width) : 0;
  return '█'.repeat(filled) + '·'.repeat(width - filled);
};

(async () => {
  const res = await fetch(`${BASE}/api/arcade/players/${encodeURIComponent(userName)}/history`);
  if (!res.ok) {
    console.error(`could not read history from ${BASE} — is the server running?`);
    process.exit(2);
  }
  const data = await res.json();
  const matches = data.matches || [];
  if (!matches.length) {
    console.error(`no finished matches recorded for "${userName}".`);
    console.error('A match only appears here once it reaches the RESULT screen.');
    process.exit(1);
  }

  const match = roomFilter
    ? matches.find(m => m.room_code === roomFilter)
    : matches[0];
  if (!match) {
    console.error(`no match ${roomFilter} for "${userName}". Recent: ${matches.map(m => m.room_code).join(', ')}`);
    process.exit(1);
  }

  const rounds = [...(match.rounds || [])].sort((a, b) => a.round_num - b.round_num);
  const difficulty = match.difficulty || rounds[0]?.difficulty || 'unknown';
  const mode = match.round_duration_mode || rounds[0]?.round_duration_mode || 'unknown';
  const roundSeconds = mode === 'quick'
    ? cfg.quickModePhaseDurations.ROUND_1
    : cfg.phaseDurations.ROUND_1;

  console.log(`\nPLAYTEST REPORT — ${userName}`);
  console.log(`match ${match.room_code} "${match.room_name}"   difficulty: ${difficulty}   pacing: ${mode} (${roundSeconds}s rounds)\n`);

  let solved = 0;
  let attempted = 0;
  for (let n = 1; n <= TOTAL_ROUNDS; n++) {
    const r = rounds.find(x => x.round_num === n);
    if (!r) {
      console.log(`  round ${n}:  — not reached (eliminated earlier, or the match ended)`);
      continue;
    }
    attempted += 1;
    const full = r.total_count > 0 && r.pass_count === r.total_count;
    if (full) solved += 1;
    const partial = r.total_count > 0 && r.pass_count > 0 && !full;
    const verdict = full ? 'SOLVED ' : partial ? 'PARTIAL' : 'NO PASS';
    // Time is only meaningful against the round it was played in.
    const usedPct = roundSeconds > 0 ? Math.round((r.time_used_seconds / roundSeconds) * 100) : 0;
    console.log(`  round ${n}:  ${verdict}  ${bar(r.pass_count, r.total_count)}  ${r.pass_count}/${r.total_count} tests`
      + `   ${r.time_used_seconds}s of ${roundSeconds}s (${usedPct}%)   quality ${r.quality_score}/100`);
    // Distinguishing "gave up" from "tried and missed" matters, and code LENGTH
    // cannot do it: a real five-line attempt and an untouched scaffold are the
    // same size (that heuristic flagged a genuine attempt on first use). The
    // scaffold's own TODO comment is the reliable signal — a player who wrote
    // anything replaces the line it sits on.
    const untouchedScaffold = /#\s*TODO/i.test(r.code || '');
    if (untouchedScaffold) {
      console.log(`             ↳ the starter was submitted with its TODO still in place — they gave up rather than got it wrong`);
    } else if (!full && !(r.code || '').trim()) {
      console.log(`             ↳ nothing was submitted at all`);
    }
  }

  console.log(`\n  rounds played: ${attempted}/${TOTAL_ROUNDS}   fully solved: ${solved}`);

  const easyStandard = difficulty === 'easy' && mode === 'standard';
  if (!easyStandard) {
    console.log(`\n⚠️  The bar (>=${ROUNDS_REQUIRED} of ${TOTAL_ROUNDS}) was set for an EASY room on STANDARD pacing.`);
    console.log(`   This match was ${difficulty}/${mode}, so treat the result as context, not a pass or fail.`);
    process.exit(0);
  }

  if (solved >= ROUNDS_REQUIRED) {
    console.log(`\n✅ PASS — solved ${solved}/${TOTAL_ROUNDS}, the bar is ${ROUNDS_REQUIRED}.`);
  } else {
    console.log(`\n❌ BELOW BAR — solved ${solved}/${TOTAL_ROUNDS}, the bar is ${ROUNDS_REQUIRED}.`);
    console.log('   Before changing anything, read the observer notes: a round can be lost to');
    console.log('   reading, to thinking, or to typing, and each has a different fix.');
    console.log('   - lost to TYPING     -> more scaffolding, or lower beginnerCharsPerMinute');
    console.log('                           so the draw picks shorter problems');
    console.log('   - lost to THINKING   -> hints, or easier problems in the easy pool');
    console.log('   - lost to READING    -> problem wording and the worked examples');
    console.log('   - lost to OPPONENTS  -> botSkillByDifficulty.easy');
  }
  process.exit(0);
})();
