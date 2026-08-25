/**
 * Can a player read someone else's code before they have committed to an answer?
 *
 *   node scripts/arcade-tests/spectator-test.js      (needs the server AND the DB)
 *
 * Watching other players is only safe because of one rule: a viewer who can
 * still change their own answer is refused. Get that rule wrong and the feature
 * turns into a copy button - open the match, click the strongest player, paste.
 * So the refusals are what this file mostly tests; the happy path is one case
 * out of several.
 *
 * Everything here goes through the HTTP endpoints, not the database, because
 * the permission check lives in the endpoint and that is what a browser would
 * reach.
 *
 * Creates its own room and removes it afterwards.
 */
const BASE = process.env.ARCADE_TEST_BASE || 'http://localhost:3001';

let pass = 0, fail = 0;
const check = (ok, label, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
    ok ? pass++ : fail++;
};

const j = async (method, path, body) => {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let data = null;
    try { data = await res.json(); } catch { /* an empty body is fine */ }
    return { status: res.status, data };
};

const A = `spec_a_${Date.now().toString().slice(-6)}`;
const B = `spec_b_${Date.now().toString().slice(-6)}`;
const A_DRAFT = '# A is still thinking\n';
const B_DRAFT = '# B is halfway there\ndef solve():\n    pass\n';
const A_ANSWER = 'def solve():\n    return 42\n';

const watch = (roomId, target, viewer) =>
    j('GET', `/api/arcade/rooms/${roomId}/code/${encodeURIComponent(target)}?viewer=${encodeURIComponent(viewer)}`);

(async () => {
    const probe = await j('GET', '/api/arcade/tasks');
    if (probe.status !== 200) {
        console.error(`could not reach ${BASE} — is the server running?`);
        process.exit(2);
    }

    const created = await j('POST', '/api/arcade/rooms/create', {
        room_name: 'Spectator Test', host_name: A, max_players: 5,
    });
    const roomId = created.data?.room?.room_id;
    const roomCode = created.data?.room?.room_code;
    if (!roomId) {
        console.error('could not create a room:', JSON.stringify(created.data));
        process.exit(2);
    }

    try {
        await j('POST', '/api/arcade/rooms/join', { room_code_or_id: roomCode, user_name: B });
        const started = await j('POST', `/api/arcade/rooms/${roomId}/start`, { host_name: A });
        if (!started.data?.success) {
            console.error('could not start the match:', JSON.stringify(started.data));
            process.exit(2);
        }

        // Both players type for a while.
        await j('POST', `/api/arcade/rooms/${roomId}/code-draft`, { user_name: A, code: A_DRAFT });
        await j('POST', `/api/arcade/rooms/${roomId}/code-draft`, { user_name: B, code: B_DRAFT });

        // 1. THE RULE. Neither has submitted, so neither may look at the other.
        const peekAtB = await watch(roomId, B, A);
        check(peekAtB.status === 403, 'ยังไม่ส่งคำตอบ ดูโค้ดคนอื่นไม่ได้',
            `HTTP ${peekAtB.status}`);
        check(!String(JSON.stringify(peekAtB.data)).includes('halfway'),
            'คำตอบที่ถูกปฏิเสธต้องไม่มีโค้ดติดมาด้วย', 'ไม่มีเนื้อโค้ดใน response');

        // 2. Reading your own row back is always allowed — that is what lets a
        //    player who lost their connection pick up where they left off.
        const ownRow = await watch(roomId, A, A);
        check(ownRow.status === 200 && ownRow.data?.code === A_DRAFT,
            'อ่านฉบับร่างของตัวเองกลับมาได้เสมอ', `HTTP ${ownRow.status}`);

        // 3. Once the answer is in, the round is no longer editable for A, so
        //    watching costs nothing.
        await j('POST', `/api/arcade/rooms/${roomId}/submit-round`, { user_name: A, code: A_ANSWER });
        const watched = await watch(roomId, B, A);
        check(watched.status === 200 && watched.data?.code === B_DRAFT,
            'ส่งคำตอบแล้วดูโค้ดที่คนอื่นกำลังเขียนได้', `HTTP ${watched.status}`);
        check(watched.data?.has_submitted === false,
            'บอกได้ว่าคนที่ดูอยู่ยังไม่ได้ส่งคำตอบ', `has_submitted=${watched.data?.has_submitted}`);

        // 4. ...and it is one-directional. B is still writing.
        const stillRefused = await watch(roomId, A, B);
        check(stillRefused.status === 403, 'คนที่ยังเขียนอยู่ยังคงดูของคนอื่นไม่ได้',
            `HTTP ${stillRefused.status}`);

        // 5. A submitted answer is final. A draft arriving afterwards must not
        //    change what a spectator sees, or the answer being graded.
        await j('POST', `/api/arcade/rooms/${roomId}/code-draft`, { user_name: A, code: 'CHANGED AFTER SUBMITTING' });
        const afterSubmit = await watch(roomId, A, A);
        check(afterSubmit.data?.code === A_ANSWER,
            'ฉบับร่างที่ส่งมาหลังส่งคำตอบแล้วไม่มีผล', `ได้ ${JSON.stringify(afterSubmit.data?.code)}`);

        // 6. A name that is not in this room gets nothing, whichever side it is on.
        const strangerViewing = await watch(roomId, B, 'not_in_this_room');
        check(strangerViewing.status === 404, 'คนนอกห้องขอดูไม่ได้', `HTTP ${strangerViewing.status}`);
        const strangerTarget = await watch(roomId, 'not_in_this_room', A);
        check(strangerTarget.status === 404, 'ขอดูคนที่ไม่ได้อยู่ในห้องไม่ได้', `HTTP ${strangerTarget.status}`);

        // 7. Asking without saying who is asking is refused rather than
        //    defaulting to "allowed".
        const noViewer = await j('GET', `/api/arcade/rooms/${roomId}/code/${encodeURIComponent(B)}`);
        check(noViewer.status === 400, 'ไม่บอกว่าใครขอดู ถูกปฏิเสธ', `HTTP ${noViewer.status}`);
    } finally {
        await j('POST', `/api/arcade/rooms/${roomId}/leave`, { user_name: A });
        await j('POST', `/api/arcade/rooms/${roomId}/leave`, { user_name: B });
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
