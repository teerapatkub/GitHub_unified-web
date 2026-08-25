/**
 * Achievements: does the unlock engine award the right things, exactly once, and
 * does the showcase only accept what a player has actually earned?
 *
 *   node scripts/achievements-test.js        (from server/, needs the API up)
 *
 * Uses a throwaway account it creates and deletes itself, so it never disturbs a
 * real player's unlocks.
 */
const path = require('path');
const { Client } = require('pg');

const HOST = process.env.ARCADE_TEST_BASE || 'http://localhost:3001';

const call = async (method, p, body) => {
    const r = await fetch(HOST + p, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30000),
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
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await c.connect();

    const name = 'achv_probe_' + Date.now().toString().slice(-6);
    const { rows: [created] } = await c.query(
        `INSERT INTO users (username, email, password_hash, role, level, xp, virtual_currency)
         VALUES ($1, $2, 'x', 'user', 1, 0, 1000) RETURNING user_id`,
        [name, name + '@example.invalid']
    );
    const userId = Number(created.user_id);

    const coins = async () => Number(
        (await c.query('SELECT virtual_currency FROM users WHERE user_id = $1', [userId])).rows[0].virtual_currency);
    const unlockedIds = async () => (await c.query(
        'SELECT achievement_id FROM user_achievements WHERE user_id = $1 ORDER BY achievement_id', [userId]
    )).rows.map(r => Number(r.achievement_id));

    try {
        check((await unlockedIds()).length === 0, 'บัญชีใหม่ยังไม่มีความสำเร็จ');

        // --- buying a cosmetic should unlock exactly the cosmetics achievement
        const [cheapest] = (await c.query(
            `SELECT item_id, price FROM shop_items WHERE is_active = 1 AND set_key IS NOT NULL
             ORDER BY price ASC LIMIT 1`)).rows;
        const before = await coins();
        const buy = await call('POST', '/shop/buy', { userId, itemId: Number(cheapest.item_id) });
        const awarded = (buy.d?.new_achievements || []);
        const rewardTotal = awarded.reduce((sum, a) => sum + Number(a.reward || 0), 0);

        check(buy.status === 200 && awarded.some(a => a.code === 'first_cosmetic'),
            'ซื้อของตกแต่งชิ้นแรกปลดล็อก first_cosmetic', awarded.map(a => a.code).join(', ') || 'ไม่มี');
        check((await coins()) === before - Number(cheapest.price) + rewardTotal,
            'จ่ายรางวัลเข้ากระเป๋าตามที่ประกาศ', `รางวัลรวม ${rewardTotal}`);

        // --- a second purchase must not re-award anything already held
        const held = await unlockedIds();
        const [second] = (await c.query(
            `SELECT item_id FROM shop_items WHERE is_active = 1 AND set_key IS NOT NULL AND item_id <> $1
             ORDER BY price ASC LIMIT 1`, [Number(cheapest.item_id)])).rows;
        const again = await call('POST', '/shop/buy', { userId, itemId: Number(second.item_id) });
        const repeats = (again.d?.new_achievements || []).filter(a => held.includes(a.achievement_id));
        check(repeats.length === 0, 'ไม่ปลดล็อกซ้ำของที่มีอยู่แล้ว', `ซ้ำ ${repeats.length} รายการ`);

        // --- the showcase only accepts what has been earned
        const mine = await unlockedIds();
        // However many this throwaway account managed to earn — asserting a fixed
        // number here would only be asserting how the seed happens to be tuned.
        const chosen = mine.slice(0, 2);
        const ok = await call('PUT', `/api/profile/${userId}/showcase`, { achievement_ids: chosen });
        check(ok.status === 200, 'บันทึกความสำเร็จที่เลือกได้', JSON.stringify(ok.d?.achievement_ids));

        const [locked] = (await c.query(
            `SELECT achievement_id FROM achievements
              WHERE is_active = 1 AND achievement_id NOT IN (
                    SELECT achievement_id FROM user_achievements WHERE user_id = $1)
              LIMIT 1`, [userId])).rows;
        const bad = await call('PUT', `/api/profile/${userId}/showcase`,
            { achievement_ids: [Number(locked.achievement_id)] });
        check(bad.status === 400, 'เลือกความสำเร็จที่ยังไม่ปลดล็อกไม่ได้', bad.d?.error);

        const tooMany = await call('PUT', `/api/profile/${userId}/showcase`,
            { achievement_ids: [1, 2, 3, 4, 5, 6, 7] });
        check(tooMany.status === 400, 'เลือกเกินจำนวนสูงสุดไม่ได้', tooMany.d?.error);

        // --- the profile reports the choice back
        const profile = await call('GET', `/api/profile/${userId}`);
        check(profile.status === 200 && profile.d?.achievements?.showcase?.length === chosen.length,
            'โปรไฟล์ส่งรายการที่เลือกกลับมาครบ',
            `${profile.d?.achievements?.showcase?.length} จาก ${chosen.length} ที่เลือกไว้`);
    } finally {
        await c.query('DELETE FROM user_profile_showcase WHERE user_id = $1', [userId]);
        await c.query('DELETE FROM user_achievements WHERE user_id = $1', [userId]);
        await c.query('DELETE FROM user_inventory WHERE user_id = $1', [userId]);
        await c.query('DELETE FROM user_xp_log WHERE user_id = $1', [userId]);
        await c.query('DELETE FROM users WHERE user_id = $1', [userId]);
        await c.end();
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
