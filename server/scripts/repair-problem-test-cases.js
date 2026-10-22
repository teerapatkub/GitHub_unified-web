/**
 * Put back the problem data that was overwritten in the shared test database.
 *
 *   node scripts/repair-problem-test-cases.js            (shows what it would change)
 *   node scripts/repair-problem-test-cases.js --apply    (writes, in one transaction)
 *   add --restore-registrations to also put back deleted problem_modes rows
 *
 * WHAT HAPPENED (project_logs/2026-10-22/2000-shared-test-db-problem-data-damage.md)
 * On 2026-10-20 20:40:18 UTC every row of `problems` had its `test_cases`
 * replaced by `{"isinstance": [], "code_checks": [], "correctness": []}` - an
 * object, not the `[{input, expected}]` / `[{args, expected}]` array the grader
 * reads - so every problem graded as 0/0. A minute later an admin-style save
 * keyed on `entry_id` without `mode` turned entry 1 of arcade, competitive and
 * minigame (problems 158, 140, 121) into the same "สวัสดี / print("Hello")"
 * problem and blanked their `problem_modes.extra`. The code that did both is in
 * no branch of this repository.
 *
 * The `correctness` list was emptied too, so nothing can be recovered from the
 * damaged rows themselves. The source is `server/seed-content.sql`: apart from
 * these columns it matches the damaged database row for row (only CRLF line
 * endings differ), and it already carries every later content fix.
 *
 * Only damaged values are written, so it is safe to run twice:
 *   - `test_cases` (and `test_kind`) where `test_cases` is not an array;
 *   - title/description/hints/code of the rows whose content was replaced;
 *   - `problem_modes.extra` where it is `{}` but the seed has more;
 *   - with --restore-registrations, `problem_modes` rows that were deleted.
 * `problem_id` and `entry_id` never change. The transaction is rolled back if
 * any problem is still left without an array of test cases.
 *
 * It connects to DATABASE_URL like the server does. It refuses to run against
 * the production project.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { databaseClientConfig } = require('./database-client-config');

const APPLY = process.argv.includes('--apply');
const RESTORE_REGISTRATIONS = process.argv.includes('--restore-registrations');
const PRODUCTION_PROJECT = 'lnijkucfutyekbxquliq';
const SEED_FILE = path.join(__dirname, '..', 'seed-content.sql');

// The pg_dump INSERT lines for one table, retargeted at a temporary table.
// Each statement starts at the beginning of a line; values may span lines.
function seedInserts(sql, table, target) {
    const start = sql.indexOf(`-- Data for Name: ${table}; Type: TABLE DATA`);
    const end = sql.indexOf('-- Data for Name:', start + 1);
    if (start < 0 || end < 0) throw new Error(`${table} not found in seed-content.sql`);
    return sql.slice(start, end)
        .replace(new RegExp(`^INSERT INTO public\\.${table} `, 'gm'), `INSERT INTO ${target} `);
}

const CONTENT_COLUMNS = ['title_th', 'title_en', 'desc_th', 'desc_en', 'hint_th', 'hint_en',
    'starter_code', 'solution_code'];

(async () => {
    const config = databaseClientConfig();
    if (JSON.stringify(config).includes(PRODUCTION_PROJECT)) {
        console.error('❌ DATABASE_URL points at production - this script is for the shared test database only');
        process.exit(1);
    }

    const c = new Client(config);
    await c.connect();
    const where = await c.query('SELECT current_database() AS db, inet_server_addr()::text AS host');
    console.log(`ฐานข้อมูล: ${where.rows[0].db} @ ${where.rows[0].host || 'local socket'} ${APPLY ? '(--apply)' : '(dry run)'}`);

    try {
        await c.query('BEGIN');
        await c.query('CREATE TEMP TABLE seed_problems (LIKE problems) ON COMMIT DROP');
        await c.query('CREATE TEMP TABLE seed_problem_modes (LIKE problem_modes) ON COMMIT DROP');
        const sql = fs.readFileSync(SEED_FILE, 'utf8');
        await c.query(seedInserts(sql, 'problems', 'seed_problems'));
        await c.query(seedInserts(sql, 'problem_modes', 'seed_problem_modes'));

        // Rows whose prose or code was replaced along with their test cases.
        // Compared without carriage returns: the shared database stores CRLF
        // where the seed has LF, and that difference is not damage.
        const changed = CONTENT_COLUMNS
            .map(col => `replace(coalesce(p.${col}, ''), E'\\r', '') <> replace(coalesce(s.${col}, ''), E'\\r', '')`)
            .join(' OR ');
        const content = await c.query(
            `SELECT p.problem_id, p.title_th AS now, s.title_th AS seed
               FROM problems p JOIN seed_problems s USING (problem_id)
              WHERE jsonb_typeof(p.test_cases) <> 'array' AND (${changed})
              ORDER BY p.problem_id`
        );
        for (const r of content.rows) {
            console.log(`  เนื้อหาโจทย์ #${r.problem_id}: "${r.now}" → "${r.seed}"`);
        }
        await c.query(
            `UPDATE problems p
                SET ${CONTENT_COLUMNS.map(col => `${col} = s.${col}`).join(', ')}, updated_at = NOW()
               FROM seed_problems s
              WHERE p.problem_id = s.problem_id
                AND p.problem_id = ANY($1::bigint[])`,
            [content.rows.map(r => r.problem_id)]
        );

        const cases = await c.query(
            `UPDATE problems p
                SET test_cases = s.test_cases, test_kind = s.test_kind, updated_at = NOW()
               FROM seed_problems s
              WHERE p.problem_id = s.problem_id
                AND jsonb_typeof(p.test_cases) <> 'array'
                AND jsonb_typeof(s.test_cases) = 'array'`
        );
        console.log(`  test_cases ที่คืนค่า: ${cases.rowCount} ข้อ`);

        const extra = await c.query(
            `UPDATE problem_modes m
                SET extra = s.extra, updated_at = NOW()
               FROM seed_problem_modes s
              WHERE m.mode = s.mode AND m.entry_id = s.entry_id AND m.problem_id = s.problem_id
                AND m.extra = '{}'::jsonb AND s.extra <> '{}'::jsonb
             RETURNING m.mode, m.entry_id`
        );
        for (const r of extra.rows) console.log(`  problem_modes.extra: ${r.mode} #${r.entry_id}`);

        // Registrations the seed has but the database lost, whose problem is
        // still there with no registration in that mode. On the shared test
        // database these are minigame #8-#19 (problems 128-139): 12 rows were
        // deleted from problem_modes and no code in the repository deletes
        // them. Whether that was deliberate is not known, so this is opt-in.
        const missing = await c.query(
            `SELECT s.mode, s.entry_id, s.problem_id FROM seed_problem_modes s
               JOIN problems p ON p.problem_id = s.problem_id
              WHERE NOT EXISTS (SELECT 1 FROM problem_modes m WHERE m.mode = s.mode AND m.entry_id = s.entry_id)
                AND NOT EXISTS (SELECT 1 FROM problem_modes m WHERE m.mode = s.mode AND m.problem_id = s.problem_id)
              ORDER BY s.mode, s.entry_id`
        );
        if (missing.rows.length > 0) {
            const list = missing.rows.map(r => `${r.mode} #${r.entry_id}`).join(', ');
            if (RESTORE_REGISTRATIONS) {
                await c.query(
                    `INSERT INTO problem_modes
                     SELECT s.* FROM seed_problem_modes s
                      WHERE (s.mode, s.entry_id) IN (SELECT * FROM unnest($1::text[], $2::int[]))`,
                    [missing.rows.map(r => r.mode), missing.rows.map(r => r.entry_id)]
                );
                console.log(`  ทะเบียนโหมดที่คืนให้: ${list}`);
            } else {
                console.log(`  ทะเบียนโหมดที่หายไป (ไม่แตะ ใส่ --restore-registrations เพื่อคืน): ${list}`);
            }
        }

        const left = await c.query(
            `SELECT problem_id FROM problems WHERE jsonb_typeof(test_cases) <> 'array' ORDER BY problem_id`
        );
        if (left.rows.length > 0) {
            throw new Error(`ยังมี ${left.rows.length} ข้อที่ test_cases ไม่ใช่ array: ${left.rows.map(r => r.problem_id).join(', ')}`);
        }

        await c.query(APPLY ? 'COMMIT' : 'ROLLBACK');
        console.log(APPLY ? '✅ บันทึกแล้ว' : 'ยังไม่ได้เขียนอะไร - ใส่ --apply เพื่อบันทึก');
    } catch (error) {
        await c.query('ROLLBACK');
        console.error(`❌ ${error.message} - ยกเลิกทั้งหมด ไม่มีอะไรถูกเขียน`);
        process.exitCode = 1;
    } finally {
        await c.end();
    }
})();
