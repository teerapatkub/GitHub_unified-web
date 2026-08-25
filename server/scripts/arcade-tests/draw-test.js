// Checks how a match picks its four problems, against the live server.
//
// The draw has to satisfy three rules at once and they pull against each other,
// which is why this is a script and not a code review:
//   * every problem must fit the room's own clock (Quick Mode gets a smaller
//     pool than Standard - that is the intent, not a bug),
//   * Round 4 climbs with the room's difficulty instead of always being `hard`
//     (an easy room used to get a finale nobody in it could finish, so the
//     round scored everyone zero and decided nothing),
//   * and it must stay random - a filter tight enough to freeze the line-up
//     would pass the first two rules and ruin the mode.
//
// Requires the server AND the database to be running. Creates and then removes
// its own rooms; it never touches anything it did not create.
const fs = require('fs');
const path = require('path');

const BASE = process.env.ARCADE_TEST_BASE || 'http://localhost:3001';
const cfg = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'shared', 'arcadeConfig.json'), 'utf8'));

const j = async (method, p, body) => {
  const r = await fetch(`${BASE}${p}`, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty body is fine */ }
  return { status: r.status, data };
};

const results = [];
const check = (name, pass, detail) => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const budgetFor = (mode) => {
  const seconds = mode === 'quick'
    ? cfg.quickModePhaseDurations.ROUND_1
    : cfg.phaseDurations.ROUND_1;
  return (seconds - cfg.autoSubmitLeadSeconds) * cfg.beginnerCharsPerMinute / 60;
};

(async () => {
  const { data: tasks } = await j('GET', '/api/arcade/tasks');
  if (!tasks || !tasks.easy) {
    console.error(`could not reach ${BASE} — is the server running?`);
    process.exit(2);
  }
  const byId = new Map();
  for (const d of ['easy', 'medium', 'hard']) {
    for (const t of tasks[d] || []) byId.set(t.task_id, { ...t, pool: d });
  }

  const made = [];
  const mkRoom = async (user, opts) => {
    const created = await j('POST', '/api/arcade/rooms/create',
      { room_name: 'Draw Test', host_name: user, max_players: 2, password: '', ...opts });
    const id = created.data?.room?.room_id ?? created.data?.room_id;
    await j('POST', `/api/arcade/rooms/${id}/add-bot`, { host_name: user });
    await j('POST', `/api/arcade/rooms/${id}/start`, { host_name: user });
    made.push({ id, user });
    const room = await j('GET', `/api/arcade/rooms/${id}?user_name=${user}`);
    return room.data?.room;
  };

  for (const mode of ['quick', 'standard']) {
    const budget = budgetFor(mode);
    const overruns = [];
    const finalePools = new Set();
    for (let i = 0; i < 8; i++) {
      const room = await mkRoom(`drawtest_${mode}_${i}`, { round_duration_mode: mode, difficulty: 'easy' });
      const ids = room?.round_task_ids || [];
      for (const id of ids) {
        const t = byId.get(id);
        if (t && t.work_chars > budget) overruns.push(`${t.title_en}=${t.work_chars}`);
      }
      finalePools.add(byId.get(ids[3])?.pool);
    }
    check(`${mode}: every drawn problem fits the ${budget.toFixed(0)}-char typing budget (8 matches)`,
      overruns.length === 0, overruns.length ? overruns.join(', ') : 'no overruns');
    check(`${mode}: an easy room's Round 4 comes from the medium pool, not hard`,
      finalePools.size === 1 && finalePools.has('medium'), `pools seen: ${[...finalePools].join(',')}`);
  }

  const hardRoom = await mkRoom('drawtest_hard', { round_duration_mode: 'standard', difficulty: 'hard' });
  const hardIds = hardRoom?.round_task_ids || [];
  check('a hard room draws all four rounds from the hard pool',
    hardIds.length === 4 && hardIds.every(id => byId.get(id)?.pool === 'hard'),
    hardIds.map(id => byId.get(id)?.title_en).join(' | '));
  check('a hard room never repeats a problem across its four rounds',
    new Set(hardIds).size === 4);

  const lineups = new Set();
  for (let i = 0; i < 6; i++) {
    const room = await mkRoom(`drawtest_rand_${i}`, { difficulty: 'default' });
    lineups.add(JSON.stringify(room?.round_task_ids));
  }
  check('line-ups still differ between matches (the budget filter did not freeze the draw)',
    lineups.size > 1, `${lineups.size} distinct line-ups in 6 matches`);

  for (const r of made) await j('POST', `/api/arcade/rooms/${r.id}/leave`, { user_name: r.user });

  const failed = results.filter(r => !r).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})();
