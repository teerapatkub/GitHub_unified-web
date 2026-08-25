/**
 * Can a learner still collect XP and coins without solving anything?
 *
 *   node scripts/submit-integrity-test.js      (from server/, needs the API up)
 *
 * Both learning submit endpoints used to say yes:
 *   POST /api/exercises/:id/submit   set is_passed = true for every request and
 *                                    never looked at the code
 *   POST /api/learning/ai-task/submit  read `passed` out of the request body
 *
 * so `{passed:true}` was worth a full reward. These checks fire the real HTTP
 * endpoints against a throwaway account and read the balance back out of the
 * database, because the thing worth protecting is what actually got paid.
 */
const { Client } = require('pg');

const HOST = process.env.ARCADE_TEST_BASE || 'http://localhost:3001';

const call = async (method, p, body) => {
    const r = await fetch(HOST + p, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(60000),
    });
    let d = null; try { d = await r.json(); } catch { /* not json */ }
    return { status: r.status, d };
};

let pass = 0, fail = 0;
const check = (ok, label, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
    ok ? pass++ : fail++;
};

(async () => {
    const c = new Client({
        host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await c.connect();

    const name = 'grade_probe_' + Date.now().toString().slice(-6);
    const { rows: [created] } = await c.query(
        `INSERT INTO users (username, email, password_hash, role, level, xp, virtual_currency)
         VALUES ($1, $2, 'x', 'user', 1, 0, 0) RETURNING user_id`,
        [name, name + '@example.invalid']);
    const userId = Number(created.user_id);

    const wallet = async () => {
        const { rows: [u] } = await c.query('SELECT xp, virtual_currency FROM users WHERE user_id = $1', [userId]);
        return { xp: Number(u.xp), coins: Number(u.virtual_currency) };
    };

    try {
        // A lesson exercise the server actually grades, with a known solution.
        const { rows: [ex] } = await c.query(`
            SELECT m.entry_id, p.solution_code, p.title_th
              FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
             WHERE m.mode = 'lesson' AND p.is_auto_gradable = 1
               AND p.solution_code IS NOT NULL AND btrim(p.solution_code) <> ''
               AND jsonb_array_length(p.test_cases) > 0
             ORDER BY m.entry_id LIMIT 1`);

        const before = await wallet();

        const blank = await call('POST', `/api/exercises/${ex.entry_id}/submit`,
            { user_id: userId, submitted_code: '' });
        check(blank.status >= 400, 'ส่งโค้ดว่างถูกปฏิเสธ', `HTTP ${blank.status} ${blank.d?.detail || ''}`);

        const junk = await call('POST', `/api/exercises/${ex.entry_id}/submit`,
            { user_id: userId, submitted_code: 'print("ไม่ใช่คำตอบ")' });
        check(junk.status >= 400, 'ส่งคำตอบผิดถูกปฏิเสธ',
            `HTTP ${junk.status} ผ่าน ${junk.d?.passed}/${junk.d?.total}`);

        const afterCheats = await wallet();
        check(afterCheats.xp === before.xp && afterCheats.coins === before.coins,
            'ส่งมั่วแล้วไม่ได้ XP หรือทองเลย',
            `xp ${before.xp}→${afterCheats.xp}, coins ${before.coins}→${afterCheats.coins}`);

        const { rows: [cheated] } = await c.query(
                        // is_passed is SMALLINT, not BOOLEAN - every flag in this schema is,
            // because the old database layer could not bind real booleans.
            'SELECT count(*)::int AS n FROM exercise_submissions WHERE user_id = $1 AND is_passed = 1', [userId]);
        check(cheated.n === 0, 'ไม่มีการบันทึกว่าผ่านจากการส่งมั่ว', `${cheated.n} แถว`);

        // The real answer must still work.
        const real = await call('POST', `/api/exercises/${ex.entry_id}/submit`,
            { user_id: userId, submitted_code: ex.solution_code });
        check(real.status === 200, 'ส่งคำตอบที่ถูกต้องผ่าน',
            `HTTP ${real.status} · ${String(ex.title_th).slice(0, 30)}`);

        const afterReal = await wallet();
        check(afterReal.xp > before.xp || afterReal.coins > before.coins,
            'ตอบถูกแล้วได้รางวัลจริง',
            `xp ${before.xp}→${afterReal.xp}, coins ${before.coins}→${afterReal.coins}`);

        // The 26 problems that cannot be auto-graded are the other half of this
        // hole, and the half this test used to miss entirely by selecting
        // `is_auto_gradable = 1` above. They are accepted WITHOUT a verdict, so
        // for a long time an empty string collected the full reward on them.
        const { rows: [ungraded] } = await c.query(`
            SELECT m.entry_id, p.title_th, p.starter_code
              FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
             WHERE m.mode = 'lesson' AND p.is_auto_gradable = 0
             ORDER BY m.entry_id LIMIT 1`);

        if (ungraded) {
            const walletBefore = await wallet();

            const blankUngraded = await call('POST', `/api/exercises/${ungraded.entry_id}/submit`,
                { user_id: userId, submitted_code: '' });
            check(blankUngraded.status >= 400, 'โจทย์ที่ตรวจอัตโนมัติไม่ได้: ส่งโค้ดว่างถูกปฏิเสธ',
                `HTTP ${blankUngraded.status} · ${String(ungraded.title_th).slice(0, 28)}`);

            const untouched = await call('POST', `/api/exercises/${ungraded.entry_id}/submit`,
                { user_id: userId, submitted_code: ungraded.starter_code || '' });
            check(untouched.status >= 400, 'โจทย์ที่ตรวจอัตโนมัติไม่ได้: ส่งโค้ดตั้งต้นเดิมถูกปฏิเสธ',
                `HTTP ${untouched.status} ${untouched.d?.detail || ''}`);

            const walletAfter = await wallet();
            check(walletAfter.xp === walletBefore.xp && walletAfter.coins === walletBefore.coins,
                'โจทย์ที่ตรวจอัตโนมัติไม่ได้: ส่งมั่วแล้วไม่ได้รางวัล',
                `xp ${walletBefore.xp}→${walletAfter.xp}, coins ${walletBefore.coins}→${walletAfter.coins}`);
        }

        // The AI-task endpoint must no longer take the client's word.
        const claimed = await call('POST', '/api/learning/ai-task/submit',
            { userId, taskId: 1, mode: 'exercise', passed: true });
        check(claimed.status >= 400, 'อ้าง {passed:true} โดยไม่ส่งโค้ดถูกปฏิเสธ',
            `HTTP ${claimed.status} ${claimed.d?.error || ''}`);
    } finally {
        await c.query('DELETE FROM exercise_submissions WHERE user_id = $1', [userId]);
        await c.query('DELETE FROM user_xp_log WHERE user_id = $1', [userId]);
        await c.query('DELETE FROM user_achievements WHERE user_id = $1', [userId]);
        await c.query('DELETE FROM user_progress WHERE user_id = $1', [userId]);
        await c.query('DELETE FROM users WHERE user_id = $1', [userId]);
        await c.end();
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
