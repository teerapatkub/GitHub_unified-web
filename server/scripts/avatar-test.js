/**
 * Profile pictures: the right picture comes back for the right user, and the
 * images that ship with the app are actually served.
 *
 *   node scripts/avatar-test.js       (from server/, needs the API up)
 *
 * Two things are worth protecting here, both of which reach a real user's eyes:
 *
 *   1. resolveAvatar() decides the picture server-side. A user who has not
 *      chosen one falls to a level-based default (beginner below level 10,
 *      expert at or above it); a user who has chosen one shows exactly that.
 *      These checks read the avatar back out of GET /api/profile/:id, which is
 *      what the profile page actually renders.
 *
 *   2. Seed art (shop frames/themes, the default avatars) lives in seed-assets
 *      and is served through the /uploads fallback mount, because the uploads
 *      volume starts empty on a fresh deploy. A 404 there is a broken image on
 *      every page that shows it, so we fetch a couple of seed URLs for real.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

const HOST = process.env.ARCADE_TEST_BASE || 'http://localhost:3001';

// Connect the same way db.js does: a hosted provider hands out one URL (and
// needs TLS), a local Postgres uses the five PG* variables (and does not). This
// test used to hardcode localhost:5432, which stopped reaching the database the
// day it moved to a managed host.
const CONNECTION_URL = String(process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
const clientConfig = CONNECTION_URL
    ? { connectionString: CONNECTION_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres', password: String(process.env.PGPASSWORD ?? 'postgres'),
        database: process.env.PGDATABASE || 'postgres',
    };

const call = async (method, p) => {
    const r = await fetch(HOST + p, { method, signal: AbortSignal.timeout(30000) });
    let d = null; try { d = await r.json(); } catch { /* not json (e.g. an image) */ }
    return { status: r.status, d };
};

// A 1x1 transparent PNG - a real, valid image so the upload path is exercised
// end to end, not just the reject cases.
const PNG_1X1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64');

const callJson = async (method, p, body) => {
    const r = await fetch(HOST + p, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
    });
    let d = null; try { d = await r.json(); } catch { /* */ }
    return { status: r.status, d };
};

const uploadAvatar = async (id, { bytes, type, name }) => {
    const form = new FormData();
    form.append('file', new Blob([bytes], { type }), name);
    const r = await fetch(`${HOST}/api/profile/${id}/avatar`, {
        method: 'POST', body: form, signal: AbortSignal.timeout(30000),
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
    const c = new Client(clientConfig);
    await c.connect();

    const madeIds = [];
    const makeUser = async (level) => {
        const name = 'avatar_probe_' + Date.now().toString().slice(-6) + '_' + Math.floor(Math.random() * 1000);
        const { rows: [u] } = await c.query(
            `INSERT INTO users (username, email, password_hash, role, level, xp, virtual_currency)
             VALUES ($1, $2, 'x', 'user', $3, 0, 0) RETURNING user_id`,
            [name, name + '@example.invalid', level]);
        const id = Number(u.user_id);
        madeIds.push(id);
        return id;
    };
    const avatarOf = async (id) => (await call('GET', `/api/profile/${id}`)).d?.user?.avatar;

    try {
        // --- 1. a new low-level user gets the beginner default ---------------
        const beginnerId = await makeUser(1);
        const a1 = await avatarOf(beginnerId);
        check(a1?.source === 'default', 'ผู้ใช้ใหม่ (ยังไม่เลือกรูป) source = default', JSON.stringify(a1));
        check(/avatar-beginner/.test(a1?.url || ''), 'level ต่ำได้รูปผู้เริ่มต้น', a1?.url);

        // --- 2. a high-level user gets the expert default --------------------
        const expertId = await makeUser(15);
        const a2 = await avatarOf(expertId);
        check(/avatar-expert/.test(a2?.url || ''), 'level สูงได้รูปเชี่ยวชาญ', a2?.url);

        // --- 3. the threshold is inclusive at level 10 -----------------------
        const edgeId = await makeUser(10);
        const a3 = await avatarOf(edgeId);
        check(/avatar-expert/.test(a3?.url || ''), 'level 10 พอดีนับเป็นเชี่ยวชาญ', a3?.url);

        const belowId = await makeUser(9);
        const a3b = await avatarOf(belowId);
        check(/avatar-beginner/.test(a3b?.url || ''), 'level 9 ยังเป็นผู้เริ่มต้น', a3b?.url);

        // --- 4. a chosen picture wins over the default -----------------------
        const chosen = '/uploads/chosen-by-user.png';
        await c.query('UPDATE users SET avatar_url = $1, avatar_source = $2 WHERE user_id = $3',
            [chosen, 'upload', beginnerId]);
        const a4 = await avatarOf(beginnerId);
        check(a4?.url === chosen && a4?.source === 'upload',
            'รูปที่ผู้ใช้เลือกชนะรูป default', JSON.stringify(a4));

        // --- 5. seed art is served through the /uploads fallback mount -------
        // These files live in seed-assets, NOT in the uploads volume, so a 200
        // proves the fallback mount works - the whole point of the fix.
        check((await call('GET', '/uploads/frame-space.svg')).status === 200,
            'รูป seed ของร้าน (frame-space.svg) เสิร์ฟได้ ไม่ 404');
        check((await call('GET', '/uploads/avatar-beginner.svg')).status === 200,
            'รูป default avatar เสิร์ฟได้ ไม่ 404');
        // Control: a name nothing ships must still 404, so the 200s above mean
        // something.
        check((await call('GET', '/uploads/definitely-not-a-real-seed-file.svg')).status === 404,
            'ไฟล์ที่ไม่มีจริงยัง 404 (กันผลบวกลวง)');

        // === ticket 3: upload your own picture, and reset ===================
        const uploadId = await makeUser(2);

        // The server enforces image-only and the size cap, not just the client.
        const vid = await uploadAvatar(uploadId, { bytes: Buffer.from('not a video'), type: 'video/mp4', name: 'clip.mp4' });
        check(vid.status === 400, 'อัปวิดีโอถูกปฏิเสธ (server บังคับ)', 'status ' + vid.status);
        const big = await uploadAvatar(uploadId, { bytes: Buffer.alloc(6 * 1024 * 1024, 1), type: 'image/png', name: 'big.png' });
        check(big.status === 400, 'ไฟล์รูป >5MB ถูกปฏิเสธ', 'status ' + big.status);

        const okUp = await uploadAvatar(uploadId, { bytes: PNG_1X1, type: 'image/png', name: 'me.png' });
        check(okUp.status === 200 && okUp.d?.avatar?.source === 'upload',
            'อัปรูป .png สำเร็จ + source=upload', JSON.stringify(okUp.d));
        const upAvatar = await avatarOf(uploadId);
        check(upAvatar?.source === 'upload' && /\/uploads\//.test(upAvatar?.url || ''),
            'โปรไฟล์แสดงรูปที่อัปโหลด', JSON.stringify(upAvatar));
        const { rows: [urow] } = await c.query(
            'SELECT uploaded_picture_url FROM users WHERE user_id = $1', [uploadId]);
        check(urow.uploaded_picture_url === upAvatar.url,
            'จำ uploaded_picture_url ไว้ให้สลับกลับได้ภายหลัง', urow.uploaded_picture_url);

        const reset = await call('POST', `/api/profile/${uploadId}/avatar/reset`);
        check(reset.status === 200 && reset.d?.avatar?.source === 'default',
            'reset กลับเป็นรูป default', JSON.stringify(reset.d));
        check((await avatarOf(uploadId))?.source === 'default',
            'หลัง reset โปรไฟล์เป็น default', '');
        // Reset clears the current choice but must NOT forget the upload, so a
        // later picture picker can switch back to it without re-uploading.
        const { rows: [afterReset] } = await c.query(
            'SELECT uploaded_picture_url FROM users WHERE user_id = $1', [uploadId]);
        check(afterReset.uploaded_picture_url === upAvatar.url,
            'reset ไม่ลบ uploaded_picture_url (สลับกลับได้ภายหลัง)', afterReset.uploaded_picture_url);

        // === ticket 4: the avatar shows everywhere ==========================
        const nav = (await call('GET', `/api/user/profile/${uploadId}`)).d;
        check(nav?.avatar?.url && nav?.avatar?.source,
            'navbar refresh endpoint คืน avatar ที่ resolve แล้ว', JSON.stringify(nav?.avatar));

        const lb = (await call('GET', '/api/leaderboard?board=xp')).d;
        if (lb?.rows?.length) {
            check(lb.rows.every(r => r.avatar && r.avatar.url),
                'ทุกแถว leaderboard มี avatar', `${lb.rows.length} แถว`);
        } else {
            console.log('SKIP  leaderboard ว่าง (ไม่มีผู้ใช้ผ่านเกณฑ์) — ข้ามเช็ค avatar');
        }

        // === ticket 5: Google picture column is ready (e2e blocked externally)
        const { rows: [gcol] } = await c.query(
            `SELECT 1 AS ok FROM information_schema.columns
              WHERE table_name = 'users' AND column_name = 'google_picture_url'`);
        check(!!gcol, 'คอลัมน์ google_picture_url พร้อมเก็บรูปจาก Google');

        // === item 6: buy a profile picture from the shop, then wear it =======
        const pics = (await call('GET', '/api/shop/items?type=PROFILE_PICTURE')).d;
        if (Array.isArray(pics) && pics.length) {
            const pic = pics[0];
            const buyerId = await makeUser(2);
            await c.query('UPDATE users SET virtual_currency = 500 WHERE user_id = $1', [buyerId]);

            const buy = await callJson('POST', '/api/shop/buy', { userId: buyerId, itemId: pic.item_id });
            check(buy.status === 200, 'ซื้อรูปโปรไฟล์จากร้านสำเร็จ', JSON.stringify(buy.d));
            // The endpoint's reported balance is after the price is deducted but
            // before any achievement reward, so it is the clean proof the price
            // was charged (the DB balance may then be higher: buying a first
            // cosmetic legitimately pays out an achievement).
            check(buy.d?.virtual_currency === 500 - pic.price,
                'ซื้อแล้วหักเหรียญตามราคา', `500 - ${pic.price} → ${buy.d?.virtual_currency}`);

            const sel = await callJson('POST', `/api/profile/${buyerId}/avatar/select`, { source: 'shop', itemId: pic.item_id });
            check(sel.status === 200 && sel.d?.avatar?.source === 'shop' && sel.d?.avatar?.url === pic.asset_url,
                'เลือกรูปร้านเป็น avatar (source=shop)', JSON.stringify(sel.d?.avatar));

            const prof = (await call('GET', `/api/profile/${buyerId}`)).d;
            const shopOpt = prof?.user?.avatar_options?.find(o => o.source === 'shop' && o.itemId === pic.item_id);
            check(shopOpt?.selected === true, 'avatar_options มีรูปร้านที่กำลังเลือกอยู่', JSON.stringify(shopOpt));

            const otherId = await makeUser(2);
            const bad = await callJson('POST', `/api/profile/${otherId}/avatar/select`, { source: 'shop', itemId: pic.item_id });
            check(bad.status === 400, 'เลือกรูปร้านที่ยังไม่ได้ซื้อ ถูกปฏิเสธ', 'status ' + bad.status);
        } else {
            console.log('SKIP  ไม่พบรูปโปรไฟล์ในร้าน — ข้ามเช็คข้อ 6');
        }

        // === item 9: exclusive achievement pictures =========================
        const { rows: exRows } = await c.query(
            `SELECT item_id, asset_url FROM shop_items
              WHERE item_type = 'PROFILE_PICTURE' AND is_available = 0 AND is_active = 1`);
        check(exRows.length >= 1, 'มีรูป exclusive ในระบบ (ซื้อไม่ได้)', `${exRows.length} รูป`);
        if (exRows.length >= 1) {
            const champ = exRows.find(r => /champion/.test(r.asset_url)) || exRows[0];

            const buyable = (await call('GET', '/api/shop/items?type=PROFILE_PICTURE')).d || [];
            check(!buyable.some(i => Number(i.item_id) === Number(champ.item_id)),
                'รูป exclusive ไม่โผล่ในรายการร้านที่ซื้อได้', '');

            const exBuyer = await makeUser(2);
            await c.query('UPDATE users SET virtual_currency = 500 WHERE user_id = $1', [exBuyer]);
            const exBuy = await callJson('POST', '/api/shop/buy', { userId: exBuyer, itemId: champ.item_id });
            check(exBuy.status >= 400, 'ซื้อรูป exclusive ด้วยเหรียญไม่ได้ (ถูกปฏิเสธ)', 'status ' + exBuy.status);

            const ach = (await call('GET', `/api/achievements/${exBuyer}`)).d || [];
            const tenWins = ach.find(a => a.code === 'ten_wins');
            check(tenWins?.reward_item_url === champ.asset_url,
                'achievement เจ้าสนาม ผูกกับรูปแชมป์ (endpoint บอกรางวัล)', tenWins?.reward_item_url);

            // Unlock it for real: 10 arcade wins, then a purchase runs the
            // achievement check, which should hand over the exclusive picture.
            const winnerId = await makeUser(2);
            const { rows: [wu] } = await c.query('SELECT username FROM users WHERE user_id = $1', [winnerId]);
            await c.query(
                `INSERT INTO arcade_player_stats (user_name, matches_played, wins, best_rank, total_score, total_cash_earned)
                 VALUES ($1, 10, 10, 1, 0, 0)
                 ON CONFLICT (user_name) DO UPDATE SET matches_played = 10, wins = 10`, [wu.username]);
            await c.query('UPDATE users SET virtual_currency = 500 WHERE user_id = $1', [winnerId]);
            await callJson('POST', '/api/shop/buy', { userId: winnerId, itemId: buyable[0]?.item_id });

            const { rows: ownEx } = await c.query(
                'SELECT 1 FROM user_inventory WHERE user_id = $1 AND item_id = $2', [winnerId, champ.item_id]);
            check(ownEx.length === 1, 'ปลดล็อก achievement แล้วได้รูปพิเศษเข้าคลังจริง', ownEx.length ? 'มี' : 'ไม่มี');

            const wprof = (await call('GET', `/api/profile/${winnerId}`)).d;
            const exOpt = wprof?.user?.avatar_options?.find(o => o.source === 'shop' && o.itemId === Number(champ.item_id));
            check(!!exOpt, 'รูปพิเศษอยู่ใน avatar_options เลือกใช้เป็น avatar ได้', JSON.stringify(exOpt));
        }
    } finally {
        if (madeIds.length) {
            await c.query('DELETE FROM users WHERE user_id = ANY($1::int[])', [madeIds]);
        }
        // Stats rows are keyed by username, not user_id, so deleting the users
        // does not take them; clean the probe rows up by their name pattern.
        await c.query(`DELETE FROM arcade_player_stats WHERE user_name LIKE 'avatar_probe_%'`);
        await c.end();
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
