// Attacks POST /rooms/:id/submit-round the way a cheating client would.
//
// The server has no Python runtime, so it cannot recompute a round score - it
// takes the client's word for it. That trust is unavoidable; what is avoidable
// is trusting it WITHOUT BOUNDS. The endpoint used to accept any finite number
// up to 999,999,999, which meant one hand-edited request won every match and
// wrote a permanent arcade_player_stats row to match. Every field below is now
// bounded to something the game can actually produce.
//
// Reads results back through the public API rather than the database, so it runs
// anywhere the server runs.
//
// Requires the server AND the database. Creates and removes its own room.
const fs = require('fs');
const path = require('path');

const BASE = process.env.ARCADE_TEST_BASE || 'http://localhost:3001';
const cfg = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'shared', 'arcadeConfig.json'), 'utf8'));
const CAP = cfg.maxSubmittableRoundScore;

const j = async (method, p, body) => {
  const r = await fetch(`${BASE}${p}`, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty body is fine */ }
  return { status: r.status, data };
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const results = [];
const check = (name, pass, detail) => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const USER = 'scoreboundstest';

(async () => {
  const created = await j('POST', '/api/arcade/rooms/create',
    { room_name: 'Score Bounds', host_name: USER, max_players: 2, password: '' });
  const id = created.data?.room?.room_id ?? created.data?.room_id;
  if (!id) {
    console.error(`could not create a room on ${BASE} — is the server running?`);
    process.exit(2);
  }
  await j('POST', `/api/arcade/rooms/${id}/add-bot`, { host_name: USER });
  await j('POST', `/api/arcade/rooms/${id}/start`, { host_name: USER });

  let phase = null;
  for (let i = 0; i < 20 && !String(phase).startsWith('ROUND_'); i++) {
    phase = (await j('GET', `/api/arcade/rooms/${id}?user_name=${USER}`)).data?.room?.phase;
    if (!String(phase).startsWith('ROUND_')) await sleep(1000);
  }

  const me = async () => {
    const res = (await j('GET', `/api/arcade/rooms/${id}?user_name=${USER}`)).data;
    return (res?.participants || []).find(p => p.user_name === USER);
  };

  // Every field here is a lie a client could tell.
  const attack = await j('POST', `/api/arcade/rooms/${id}/submit-round`, {
    user_name: USER, round_score: 999999999, code: 'cheat',
    pass_count: 7, total_count: 5, quality_score: 5000, time_used_seconds: 99999,
  });
  check('an inflated submission is accepted but bounded, not errored',
    attack.status === 200, `status ${attack.status}`);

  const after = await me();
  check(`round score capped at ${CAP}`,
    Number(after?.pending_round_score) === CAP, `stored ${after?.pending_round_score}`);

  const hist = (await j('GET', `/api/arcade/rooms/${id}/round-history?user_name=${USER}`)).data?.history || [];
  const row = hist[0];
  check('pass_count can no longer exceed total_count',
    row && row.pass_count <= row.total_count, row ? `${row.pass_count}/${row.total_count}` : 'no row');
  check('quality bounded to 0-100',
    row && row.quality_score >= 0 && row.quality_score <= 100, `quality ${row?.quality_score}`);
  check('time used cannot exceed the round length',
    row && row.time_used_seconds <= cfg.phaseDurations.ROUND_1, `time ${row?.time_used_seconds}`);

  const dup = await j('POST', `/api/arcade/rooms/${id}/submit-round`, { user_name: USER, round_score: CAP });
  const afterDup = await me();
  check('a second submission in the same round does not stack',
    dup.status === 200 && Number(afterDup?.pending_round_score) === CAP,
    `stored ${afterDup?.pending_round_score}`);

  const stranger = await j('POST', `/api/arcade/rooms/${id}/submit-round`,
    { user_name: 'not_in_this_room', round_score: 500 });
  check('a non-participant is refused', stranger.status === 404, `status ${stranger.status}`);

  await j('POST', `/api/arcade/rooms/${id}/leave`, { user_name: USER });

  const failed = results.filter(r => !r).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})();
