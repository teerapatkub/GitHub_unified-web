/**
 * Does a timestamp written by the database come back as the same instant?
 *
 *   node scripts/timestamp-check.js        (from server/, needs the DB up)
 *
 * PostgreSQL runs with TimeZone = Etc/UTC here, so `current_timestamp` written
 * into a `timestamp without time zone` column stores UTC wall-clock digits. The
 * pg driver's default parser for that type builds a JS Date from those digits
 * as if they were LOCAL time, so on a UTC+7 machine every such value came back
 * seven hours in the past.
 *
 * That is not a cosmetic difference. Competitive Arena measures how long a
 * player has had a challenge by subtracting `accepted_at` from now, and every
 * challenge has a 300-second limit: a seven-hour head start meant the very
 * first submission was always ruled "time expired", scored 0, and never even
 * reached the AI review. The whole mode was unplayable.
 *
 * These checks compare instants rather than digits, which is the only way to
 * catch an offset bug - a test that reads back the string and compares it to
 * the string that was written passes happily while the mode stays broken.
 */
const { Client } = require('pg');
const db = require('../db');

let pass = 0, fail = 0;
const check = (ok, label, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
    ok ? pass++ : fail++;
};

const SKEW_MS = 5000;

(async () => {
    const c = new Client({
        host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await c.connect();

    try {
        // 1. The raw round trip, with no application code in the way.
        await c.query(`CREATE TEMP TABLE ts_probe (id int, plain timestamp, zoned timestamptz)`);
        const before = Date.now();
        await c.query(`INSERT INTO ts_probe VALUES (1, current_timestamp, current_timestamp)`);
        const { rows: [row] } = await c.query('SELECT plain, zoned FROM ts_probe WHERE id = 1');

        const plainSkew = Math.abs(new Date(row.plain).getTime() - before);
        check(plainSkew < SKEW_MS, 'timestamp (ไม่มีเขตเวลา) อ่านกลับได้เวลาเดิม',
            `ต่าง ${Math.round(plainSkew / 1000)} วินาที`);

        const zonedSkew = Math.abs(new Date(row.zoned).getTime() - before);
        check(zonedSkew < SKEW_MS, 'timestamptz อ่านกลับได้เวลาเดิม',
            `ต่าง ${Math.round(zonedSkew / 1000)} วินาที`);

        // 2. Through the application's own database layer, which is what every
        //    endpoint actually uses.
        const [appRows] = await db.query('SELECT current_timestamp::timestamp AS plain');
        const appSkew = Math.abs(new Date(appRows[0].plain).getTime() - Date.now());
        check(appSkew < SKEW_MS, 'อ่านผ่าน db.js ได้เวลาเดิม', `ต่าง ${Math.round(appSkew / 1000)} วินาที`);

        // 3. The bug as a player met it: accept a challenge, and the elapsed
        //    time must be seconds, not hours.
        const { rows: [u] } = await c.query(
            `INSERT INTO users (username, email, password_hash, role, level, xp, virtual_currency)
             VALUES ($1, $2, 'x', 'user', 1, 0, 0) RETURNING user_id`,
            ['ts_probe_' + Date.now().toString().slice(-6), 'ts_probe_' + Date.now() + '@example.invalid']);
        const userId = Number(u.user_id);
        const { rows: [ch] } = await c.query('SELECT challenge_id FROM multiplayer_challenges ORDER BY challenge_id LIMIT 1');

        try {
            await c.query(
                `INSERT INTO active_accepted_challenges (user_id, challenge_id, code_state)
                 VALUES ($1, $2, '')`, [userId, ch.challenge_id]);
            const { rows: [acc] } = await c.query(
                'SELECT accepted_at FROM active_accepted_challenges WHERE user_id = $1', [userId]);
            const elapsed = (Date.now() - new Date(acc.accepted_at).getTime()) / 1000;
            check(Math.abs(elapsed) < SKEW_MS / 1000,
                'เพิ่งกดรับโจทย์แล้วเวลาที่ใช้ต้องเกือบศูนย์',
                `${Math.round(elapsed)} วินาที (บั๊กเดิมคือ 25200)`);

            // 4. And therefore the challenge must not already be over.
            const { rows: [limit] } = await c.query(
                'SELECT time_limit FROM multiplayer_challenges WHERE challenge_id = $1', [ch.challenge_id]);
            const expired = elapsed >= Number(limit.time_limit || 0);
            check(!expired, 'โจทย์ที่เพิ่งรับมาต้องยังไม่หมดเวลา',
                `time_limit ${limit.time_limit} วินาที`);
        } finally {
            await c.query('DELETE FROM active_accepted_challenges WHERE user_id = $1', [userId]);
            await c.query('DELETE FROM users WHERE user_id = $1', [userId]);
        }
    } finally {
        await c.end();
        if (db.end) await db.end().catch(() => {});
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
