/**
 * Prove the merged problem bank still serves exactly what the four original
 * tables served.
 *
 *   node scripts/problems-parity-check.js        (from server/, needs the DB up)
 *
 * The migration in server/problemsSchema.js replaced `exercises`,
 * `mini_game_exercises`, `multiplayer_challenges` and `arcade_tasks` with views
 * over `problems` + `problem_modes`, and kept the originals as `*_pre_merge`.
 * That makes an exact comparison possible: every row, every column, both sides.
 *
 * Row counts matching proves nothing on its own - the failure that matters is a
 * test case whose shape came back subtly different, because that marks correct
 * answers wrong without erroring anywhere. So test_cases are compared as parsed
 * structures, not as text.
 */
const { Client } = require('pg');

const PAIRS = [
    { view: 'exercises', legacy: 'exercises_pre_merge', key: 'exercise_id' },
    { view: 'mini_game_exercises', legacy: 'mini_game_exercises_pre_merge', key: 'exercise_id' },
    { view: 'multiplayer_challenges', legacy: 'multiplayer_challenges_pre_merge', key: 'challenge_id' },
    { view: 'arcade_tasks', legacy: 'arcade_tasks_pre_merge', key: 'task_id' },
];

// Columns whose value is allowed to differ, with the reason.
const IGNORE = {
    // The migration stamped fresh timestamps; nothing reads these for behaviour.
    created_at: 'migration timestamp',
    updated_at: 'migration timestamp',
};

let pass = 0, fail = 0;
const check = (ok, label, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
    ok ? pass++ : fail++;
};

// JSON that may arrive as text on one side and an object on the other.
const asStruct = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'object') return v;
    try { return JSON.parse(String(v)); } catch { return String(v); }
};

// Stable stringify: jsonb reorders object keys on the way in, so comparing the
// raw JSON text of a rebuilt object against the original reports differences
// that no consumer can observe - every reader parses before looking.
const canonical = (v) => {
    if (v === null || v === undefined) return 'null';
    if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
    if (typeof v === 'object') {
        return '{' + Object.keys(v).sort()
            .map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
    }
    return JSON.stringify(v);
};

// A stdin/stdout case's expected side is spelled `expected` in three of the four
// original tables and `output` in the fourth - and the competitive rows were
// inconsistent even with themselves. normalizeCompetitiveTestCases() in
// server.js reads `expected` and falls back to `output`, so both spellings mean
// the same thing to every consumer; compare on meaning, not on the key name.
const unifyCase = (c) => {
    if (!c || typeof c !== 'object') return c;
    const { output, expected, ...rest } = c;
    return { ...rest, expected: expected ?? output };
};
const unifyCases = (v) => (Array.isArray(v) ? v.map(unifyCase) : v);

// MiNi_Game.jsx accepts two shapes for test_cases_json: a bare array (older
// rows) and an object holding expected_format/rules/correctness. The merge
// stores one shape and the view emits the object form for every row, so the
// literal text differs for rows that used to be arrays. What matters is whether
// the client ends up with the same configuration either way - so compare the
// rows through a copy of the client's own parser, getTestConfig() in
// client/src/pages/MiNi_Game.jsx, rather than as text. (`legacy` is set by that
// function but never read anywhere, so it is not part of the comparison.)
const getTestConfig = (value) => {
    const parsed = asStruct(value);
    if (Array.isArray(parsed)) {
        return {
            expected_format: '',
            rules: parsed.filter((item) => item && (item.branch_key || item.crossroad)),
            correctness: parsed,
        };
    }
    if (parsed && typeof parsed === 'object') {
        return {
            expected_format: parsed.expected_format || '',
            rules: Array.isArray(parsed.rules) ? parsed.rules : [],
            correctness: Array.isArray(parsed.correctness) ? parsed.correctness : [],
        };
    }
    return { expected_format: '', rules: [], correctness: [] };
};

// Twelve mini-game rows arrived from Person 2's dump double-JSON-encoded, so the
// legacy table still holds `course = \"Python\"\nprint(course)` - text that is not
// valid Python and could never be completed. They were decoded during this work,
// which means the merged copy legitimately differs from the legacy one. Decoding
// the legacy side the same way before comparing keeps the check meaningful: it
// still catches any OTHER difference in those rows.
//
// The repaired columns are listed by name rather than detected from the
// content. Detection was wrong in both directions: one lesson is titled
// `ขึ้นบรรทัดใหม่ด้วย \n`, where the \n is the subject of the lesson and must stay
// two characters, while one mini-game's code was double-encoded without
// containing a single quote to give it away.
const REPAIRED_COLUMNS = new Set(['starter_code', 'solution_code', 'description', 'title']);

const decodeIfDoubleEncoded = (v) => {
    if (typeof v !== 'string' || !v.includes('\\')) return v;
    try {
        const decoded = JSON.parse(`"${v}"`);
        return typeof decoded === 'string' ? decoded : v;
    } catch {
        return v;
    }
};

const sameValue = (a, b) => {
    if (a === null || a === undefined) return b === null || b === undefined;
    if (b === null || b === undefined) return false;
    if (a instanceof Date || b instanceof Date) return String(a) === String(b);
    const sa = asStruct(a), sb = asStruct(b);
    if (typeof sa === 'object' || typeof sb === 'object') {
        return canonical(unifyCases(sa)) === canonical(unifyCases(sb));
    }
    return String(a) === String(b);
};

(async () => {
    const c = new Client({
        host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await c.connect();

    try {
        for (const { view, legacy, key } of PAIRS) {
            const [a, b] = await Promise.all([
                c.query(`SELECT * FROM ${view} ORDER BY ${key}`),
                c.query(`SELECT * FROM ${legacy} ORDER BY ${key}`),
            ]);

            check(a.rows.length === b.rows.length,
                `${view}: จำนวนแถวเท่าเดิม`, `${a.rows.length} vs ${b.rows.length}`);

            const viewCols = new Set(a.fields.map((f) => f.name));
            const missing = b.fields.map((f) => f.name).filter((n) => !viewCols.has(n));
            check(missing.length === 0, `${view}: view มีคอลัมน์ครบทุกตัวที่โค้ดเดิมอ่าน`,
                missing.length ? 'ขาด: ' + missing.join(', ') : `${viewCols.size} คอลัมน์`);

            const mismatches = [];
            for (let i = 0; i < Math.min(a.rows.length, b.rows.length); i++) {
                const rowA = a.rows[i], rowB = b.rows[i];
                if (String(rowA[key]) !== String(rowB[key])) {
                    mismatches.push(`${key} ${rowB[key]}: id ไม่ตรงกัน (view ให้ ${rowA[key]})`);
                    continue;
                }
                for (const col of Object.keys(rowB)) {
                    if (col in IGNORE) continue;
                    if (!(col in rowA)) continue; // reported by the column check above
                    const equal = col === 'test_cases_json'
                        ? canonical(getTestConfig(rowA[col])) === canonical(getTestConfig(rowB[col]))
                        : sameValue(rowA[col],
                            view === 'mini_game_exercises' && REPAIRED_COLUMNS.has(col)
                                ? decodeIfDoubleEncoded(rowB[col]) : rowB[col]);
                    if (!equal) {
                        mismatches.push(
                            `${key} ${rowB[key]} .${col}: ` +
                            `เดิม=${JSON.stringify(rowB[col])?.slice(0, 60)} ` +
                            `ใหม่=${JSON.stringify(rowA[col])?.slice(0, 60)}`);
                    }
                }
            }
            check(mismatches.length === 0, `${view}: ทุกแถวทุกคอลัมน์ตรงกับของเดิม`,
                mismatches.length ? `${mismatches.length} จุดต่าง` : 'ตรงทั้งหมด');
            for (const m of mismatches.slice(0, 8)) console.log(`        ${m}`);
            if (mismatches.length > 8) console.log(`        ... อีก ${mismatches.length - 8} จุด`);
        }

        // The point of merging: one query reaches every mode's problems.
        const { rows: byMode } = await c.query(
            `SELECT mode, count(*)::int AS n FROM problem_modes GROUP BY mode ORDER BY mode`);
        const total = byMode.reduce((s, r) => s + r.n, 0);
        check(total === 192, 'ตารางเดียวมีโจทย์ครบทุกส่วน',
            byMode.map((r) => `${r.mode} ${r.n}`).join(' · ') + ` = ${total}`);

        // Every registration must resolve to a problem, and the shape must say
        // how to run it.
        const { rows: [orphan] } = await c.query(
            `SELECT count(*)::int AS n FROM problem_modes m
              WHERE NOT EXISTS (SELECT 1 FROM problems p WHERE p.problem_id = m.problem_id)`);
        check(orphan.n === 0, 'ไม่มีทะเบียนโหมดที่ชี้ไปยังโจทย์ที่ไม่มีอยู่', `${orphan.n} แถว`);

        const { rows: [kinds] } = await c.query(
            `SELECT count(*) FILTER (WHERE test_kind NOT IN ('stdio','function'))::int AS bad,
                    count(*) FILTER (WHERE jsonb_typeof(test_cases) <> 'array')::int AS notarray
               FROM problems`);
        check(kinds.bad === 0 && kinds.notarray === 0, 'test_kind และ test_cases อยู่ในรูปที่ตัวตรวจใช้ได้',
            `test_kind แปลก ${kinds.bad} · test_cases ไม่ใช่ array ${kinds.notarray}`);
    } finally {
        await c.end();
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
