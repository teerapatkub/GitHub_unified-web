// End-to-end check of the cosmetic sets: the bundle is cheaper than the pieces,
// partial ownership is charged fairly, and the guards hold.
const path = require('path');
const BASE = require("path").join(__dirname, "..", "..");
const { Client } = require("pg");
const HOST = 'http://localhost:3001';
const USER_ID = 26; // qatester1

const call = async (method, p, body) => {
    const r = await fetch(HOST + p, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30000),
    });
    let d = null; try { d = await r.json(); } catch { /* */ }
    return { status: r.status, d };
};

let pass = 0, fail = 0;
const check = (ok, label, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
    ok ? pass++ : fail++;
};

(async () => {
    const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'postgres' });
    await c.connect();
    const reset = async (coins) => {
        await c.query('DELETE FROM user_inventory WHERE user_id = $1', [USER_ID]);
        await c.query('DELETE FROM user_profile_showcase WHERE user_id = $1', [USER_ID]);
        await c.query('DELETE FROM user_achievements WHERE user_id = $1', [USER_ID]);
        await c.query('UPDATE users SET virtual_currency = $1, equipped_theme_id = NULL, equipped_profile_frame_id = NULL, equipped_mouse_effect_id = NULL WHERE user_id = $2', [coins, USER_ID]);
    };
    const coins = async () => Number((await c.query('SELECT virtual_currency FROM users WHERE user_id = $1', [USER_ID])).rows[0].virtual_currency);
    const invCount = async () => Number((await c.query('SELECT count(*) n FROM user_inventory WHERE user_id = $1', [USER_ID])).rows[0].n);

    // --- 1. the bundle really is cheaper than buying the three pieces
    let sets = (await call('GET', `/shop/sets?userId=${USER_ID}`)).d;
    const space = sets.find(s => s.set_key === 'space');
    check(space.price < space.individual_total,
        'ราคาเซ็ตถูกกว่าซื้อแยก', `${space.price} < ${space.individual_total} (ประหยัด ${space.savings})`);

    // --- 2. buy a whole set from scratch
    await reset(500);
    let before = await coins();
    let r = await call('POST', '/shop/buy-set', { userId: USER_ID, setKey: 'space' });
    let after = await coins();
    // Buying can also unlock achievements, and those pay out in the same request,
    // so the balance moves by the price minus whatever was awarded. Measure the
    // price itself rather than the raw balance change.
    const reward = (d) => (d?.new_achievements || []).reduce((sum, a) => sum + Number(a.reward || 0), 0);
    check(r.status === 200 && (before - after) + reward(r.d) === space.price,
        'ซื้อเซ็ตทั้งชุดหักเงินตามราคาเซ็ต', `หัก ${(before - after) + reward(r.d)} (คาด ${space.price})`);
    check(await invCount() === 3, 'ได้ของครบ 3 ชิ้น', `ได้ ${await invCount()} ชิ้น`);

    // --- 3. buying it again is refused
    r = await call('POST', '/shop/buy-set', { userId: USER_ID, setKey: 'space' });
    check(r.status === 400 && /ครบแล้ว/.test(r.d?.error || ''), 'ซื้อเซ็ตซ้ำถูกปฏิเสธ', r.d?.error);

    // --- 4. owning one piece already: charged for the rest, still discounted
    await reset(500);
    const theme = space.items.find(i => i.type === 'THEME');
    r = await call('POST', '/shop/buy', { userId: USER_ID, itemId: theme.item_id });
    check(r.status === 200, 'ซื้อชิ้นเดียวก่อนได้', `จ่าย ${theme.price}`);
    before = await coins();
    sets = (await call('GET', `/shop/sets?userId=${USER_ID}`)).d;
    const spaceNow = sets.find(s => s.set_key === 'space');
    r = await call('POST', '/shop/buy-set', { userId: USER_ID, setKey: 'space' });
    after = await coins();
    const charged = (before - after) + reward(r.d);
    const remainingRetail = space.items.filter(i => i.type !== 'THEME').reduce((s, i) => s + i.price, 0);
    check(r.status === 200 && charged === spaceNow.price_for_user,
        'ซื้อเซ็ตทั้งที่มีของอยู่แล้ว 1 ชิ้น หักตามสัดส่วน', `หัก ${charged} (ที่ /shop/sets บอกไว้ ${spaceNow.price_for_user})`);
    check(charged < remainingRetail,
        'ยังถูกกว่าซื้อสองชิ้นที่เหลือแบบแยก', `${charged} < ${remainingRetail}`);
    check(await invCount() === 3, 'ไม่ได้ของซ้ำ รวมยังเป็น 3 ชิ้น', `${await invCount()} ชิ้น`);

    // --- 5. not enough coins
    await reset(10);
    r = await call('POST', '/shop/buy-set', { userId: USER_ID, setKey: 'sakura' });
    check(r.status === 400 && r.d?.error === 'เงินไม่พอ', 'เงินไม่พอถูกปฏิเสธ', `${r.d?.error} (ราคา ${r.d?.price})`);
    check(await coins() === 10 && await invCount() === 0, 'เงินไม่ถูกหักและไม่ได้ของ');

    // --- 6. unknown set
    r = await call('POST', '/shop/buy-set', { userId: USER_ID, setKey: 'nope' });
    check(r.status === 404, 'เซ็ตที่ไม่มีอยู่ถูกปฏิเสธ', r.d?.error);

    await reset(0);
    console.log(`\n${pass} passed, ${fail} failed`);
    await c.end();
    process.exitCode = fail ? 1 : 0;
})();
