/**
 * Repair four problems that cannot be solved as written.
 *
 *   node scripts/fix-broken-problems.js            (shows what it would change)
 *   node scripts/fix-broken-problems.js --apply    (writes)
 *
 * All four were found by running every reference solution through the grader.
 * They are content, not code, so each fix is stated here rather than applied by
 * hand: the change is reviewable, repeatable, and safe to run twice.
 *
 * THE REGEX THREE (lesson #212, #213, #214)
 * Their reference solutions lost every backslash somewhere in this project's
 * history - `r"d+"` where the lesson means `r"\d+"`. The stored expected output
 * is right; only the solution is wrong. A learner writing the correct pattern
 * gets the right answer and is marked correct, but the lesson's own worked
 * example prints garbage, and `npm run test:grader` flagged all three.
 *
 * THE TEMPERATURE ONE (competitive #20)
 * Its prompt and its test cases describe two different exercises. The prompt
 * asks for หนาว/ปกติ/ร้อน by temperature; the test cases expect เลขคู่/เลขคี่.
 * Nobody can pass it by following the instructions. The prompt is kept and the
 * test cases rewritten to match it - the title, the description and the problem
 * name all agree on temperature, and there is already a separate even/odd
 * problem (#142) which those cases evidently belong to.
 *
 * Writes go through `problems` directly because these are corrections to
 * existing rows; createProblem() is for new problems.
 */
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');

// problem_id -> the corrected solution. Only solution_code changes; the
// expected outputs were always right.
const SOLUTIONS = {
    104: 'import re\ntext = "Order ID: 12345, Amount: 500"\nprint(re.findall(r"\\d+", text))\n',
    105: 'import re\ntext = "Contact: 081-234-5678"\nprint(re.sub(r"\\d", "*", text))\n',
    106: 'import re\nemail = "test@example.com"\npattern = r"^[\\w.-]+@[\\w.-]+\\.\\w+$"\nif re.match(pattern, email):\n    print("True")\n',
};

// The temperature problem's cases, written from its own prompt: below 20 is
// หนาว, 20 to 30 inclusive is ปกติ, above 30 is ร้อน.
const TEMPERATURE_CASES = [
    { input: '15', expected: 'หนาว' },
    { input: '20', expected: 'ปกติ' },
    { input: '25', expected: 'ปกติ' },
    { input: '30', expected: 'ปกติ' },
    { input: '35', expected: 'ร้อน' },
];
const TEMPERATURE_SOLUTION =
    'temp = int(input())\n' +
    'if temp < 20:\n' +
    '    print("หนาว")\n' +
    'elif temp <= 30:\n' +
    '    print("ปกติ")\n' +
    'else:\n' +
    '    print("ร้อน")\n';

(async () => {
    const c = new Client({
        host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await c.connect();

    try {
        for (const [problemId, solution] of Object.entries(SOLUTIONS)) {
            const { rows: [row] } = await c.query(
                'SELECT title_th, solution_code FROM problems WHERE problem_id = $1', [problemId]);
            if (!row) { console.log(`#${problemId}: ไม่พบโจทย์ ข้าม`); continue; }
            if (row.solution_code === solution) { console.log(`#${problemId}: ถูกต้องอยู่แล้ว`); continue; }

            console.log(`#${problemId} ${row.title_th}`);
            console.log(`   เดิม: ${row.solution_code.replace(/\n/g, ' | ').slice(0, 90)}`);
            console.log(`   ใหม่: ${solution.replace(/\n/g, ' | ').slice(0, 90)}`);
            if (APPLY) {
                await c.query('UPDATE problems SET solution_code = $2, updated_at = NOW() WHERE problem_id = $1',
                    [problemId, solution]);
            }
        }

        // The temperature problem, addressed by its competitive entry id so the
        // right row is found even if problem ids ever differ.
        const { rows: [temp] } = await c.query(
            `SELECT p.problem_id, p.title_th, p.test_cases, p.solution_code
               FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
              WHERE m.mode = 'competitive' AND m.entry_id = 20`);
        if (!temp) {
            console.log('competitive #20: ไม่พบโจทย์ ข้าม');
        } else {
            const current = JSON.stringify(temp.test_cases);
            const wanted = JSON.stringify(TEMPERATURE_CASES);
            if (current === wanted && temp.solution_code === TEMPERATURE_SOLUTION) {
                console.log('competitive #20: ถูกต้องอยู่แล้ว');
            } else {
                console.log(`competitive #20 ${temp.title_th}`);
                console.log(`   เทสเดิม: ${current.slice(0, 110)}`);
                console.log(`   เทสใหม่: ${wanted.slice(0, 110)}`);
                if (APPLY) {
                    await c.query(
                        `UPDATE problems SET test_cases = $2::jsonb, solution_code = $3,
                                             test_kind = 'stdio', updated_at = NOW()
                          WHERE problem_id = $1`,
                        [temp.problem_id, wanted, TEMPERATURE_SOLUTION]);
                }
            }
        }
    } finally {
        await c.end();
    }

    console.log(APPLY ? '\nเขียนลงฐานข้อมูลแล้ว' : '\nยังไม่เขียนอะไร — ใส่ --apply เพื่อบันทึกจริง');
})();
