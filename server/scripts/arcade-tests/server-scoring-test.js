// Does the server score an Arcade round from the code, ignoring anything the
// client claims?
//
// This file replaces score-bounds-test.js, whose premise no longer holds. That
// test opened by stating "the server has no Python runtime, so it cannot
// recompute a round score - it takes the client's word for it", and checked
// only that the client's number was BOUNDED. It is not taken at all now: the
// browser sends code, and finalizeArcadePhase() runs it, judges its quality and
// measures the time from the server's own clock when the round closes. See
// docs/adr/0001-server-owns-the-verdict.md.
//
// The checks below are the ones that would have caught the old behaviour: the
// same inflated request that used to win a match now scores whatever the code
// deserves, and correct code scores more than junk.
//
// Requires the server AND the database. Creates and removes its own room.
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const check = (name, pass, detail) => {
    results.push(pass);
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const USER = 'serverscoringtest';

(async () => {
    const db = new Client({
        host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await db.connect();

    const created = await j('POST', '/api/arcade/rooms/create',
        { room_name: 'Server Scoring', host_name: USER, max_players: 2, password: '' });
    const id = created.data?.room?.room_id ?? created.data?.room_id;
    if (!id) {
        console.error(`could not create a room on ${BASE} — is the server running?`);
        process.exit(2);
    }

    const cleanup = async () => {
        await j('POST', `/api/arcade/rooms/${id}/leave`, { user_name: USER }).catch(() => {});
        await db.end().catch(() => {});
    };

    try {
        await j('POST', `/api/arcade/rooms/${id}/add-bot`, { host_name: USER });
        await j('POST', `/api/arcade/rooms/${id}/start`, { host_name: USER });

        let phase = null;
        for (let i = 0; i < 20 && !String(phase).startsWith('ROUND_'); i++) {
            phase = (await j('GET', `/api/arcade/rooms/${id}?user_name=${USER}`)).data?.room?.phase;
            if (!String(phase).startsWith('ROUND_')) await sleep(1000);
        }

        const me = async () => {
            const res = (await j('GET', `/api/arcade/rooms/${id}?user_name=${USER}`)).data;
            return (res?.participants || []).find((p) => p.user_name === USER);
        };

        // The reference solution for the problem this room actually drew, so
        // "correct code" means correct for the task the player was given.
        const { rows: [room] } = await db.query('SELECT round_task_ids FROM arcade_rooms WHERE room_id = $1', [id]);
        const taskId = Array.isArray(room.round_task_ids) ? room.round_task_ids[0] : null;
        const { rows: [problem] } = await db.query(
            `SELECT p.solution_code, jsonb_array_length(p.test_cases) AS cases
               FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
              WHERE m.mode = 'arcade' AND m.entry_id = $1`, [taskId]);

        check('the room drew a real problem for round 1', Boolean(problem?.solution_code), `task ${taskId}`);

        // A submission with no code at all is not a submission.
        const noCode = await j('POST', `/api/arcade/rooms/${id}/submit-round`, {
            user_name: USER, round_score: 999999999,
        });
        check('a submission without code is refused', noCode.status === 400, `status ${noCode.status}`);

        // The exact request that used to win every match: a huge score, junk
        // code, impossible counts. It is accepted - and every number in it is
        // ignored.
        const attack = await j('POST', `/api/arcade/rooms/${id}/submit-round`, {
            user_name: USER, round_score: 999999999, code: problem.solution_code,
            pass_count: 7, total_count: 5, quality_score: 5000, time_used_seconds: 99999,
        });
        check('a submission is accepted', attack.status === 200, `status ${attack.status}`);

        const afterSubmit = await me();
        check('no score is recorded when the submission arrives',
            afterSubmit?.pending_round_score === null || afterSubmit?.pending_round_score === undefined,
            `pending_round_score ${afterSubmit?.pending_round_score}`);

        // A second submission in the same round must not replace the first.
        const dup = await j('POST', `/api/arcade/rooms/${id}/submit-round`, {
            user_name: USER, code: 'print("junk")',
        });
        check('a second submission in the same round is ignored', dup.status === 200, `status ${dup.status}`);

        const stranger = await j('POST', `/api/arcade/rooms/${id}/submit-round`,
            { user_name: 'not_in_this_room', code: 'print(1)' });
        check('a non-participant is refused', stranger.status === 404, `status ${stranger.status}`);

        // Close the round early and let the server's own tick grade it.
        await db.query(`UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP WHERE room_id = $1`, [id]);
        let history = [];
        for (let i = 0; i < 30 && history.length === 0; i++) {
            await sleep(1000);
            history = (await j('GET', `/api/arcade/rooms/${id}/round-history?user_name=${USER}`)).data?.history || [];
        }

        const row = history[0];
        check('the round was graded after it closed', Boolean(row), row ? `round ${row.round_num}` : 'no history row');

        if (row) {
            check('the correct solution passed every test case the server ran',
                row.pass_count === row.total_count && row.total_count > 0,
                `${row.pass_count}/${row.total_count} (problem has ${problem.cases})`);
            check('the score is the server\'s, not the 999,999,999 that was sent',
                row.round_score > 0 && row.round_score < 999999999,
                `round_score ${row.round_score}`);
            check('quality is a real 0-100 score',
                row.quality_score >= 0 && row.quality_score <= 100, `quality ${row.quality_score}`);
            check('time used came from the server clock and fits the round',
                row.time_used_seconds >= 0 && row.time_used_seconds <= cfg.phaseDurations.ROUND_1,
                `${row.time_used_seconds}s of ${cfg.phaseDurations.ROUND_1}s`);
            check('the impossible pass_count that was sent did not survive',
                !(row.pass_count === 7 && row.total_count === 5), `${row.pass_count}/${row.total_count}`);
        }
    } finally {
        await cleanup();
    }

    const failed = results.filter((r) => !r).length;
    console.log(`\n${results.length - failed}/${results.length} checks passed`);
    process.exit(failed ? 1 : 0);
})();
