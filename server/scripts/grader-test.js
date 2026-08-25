/**
 * Does the one grader actually grade every kind of problem correctly?
 *
 *   node scripts/grader-test.js          (from server/, needs the DB up + Python)
 *
 * The headline check runs each problem's own reference solution against its own
 * test cases through server/problemGrader.js. A solution that fails its own
 * tests means either the problem is broken or the merge reshaped its test cases
 * wrongly - and the visible symptom of that is a learner being told a correct
 * answer is wrong, which is exactly the bug this project has already shipped
 * once ("Longest Word", 2026-08-19).
 *
 * The rest check the grader says NO when it should, including the specific
 * mistake the old checkers made: comparing with `includes()`, which passed `17`
 * for an expected `7`.
 */
const { Client } = require('pg');
const { gradeSubmission } = require('../problemGrader');

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

    try {
        // --- every reference solution must satisfy its own tests -------------
        const { rows: problems } = await c.query(`
            SELECT p.problem_id, p.title_th, p.test_kind, p.test_cases,
                   p.solution_code, p.starter_code,
                   (SELECT string_agg(m.mode, ',') FROM problem_modes m WHERE m.problem_id = p.problem_id) AS modes
              FROM problems p
             WHERE p.solution_code IS NOT NULL AND btrim(p.solution_code) <> ''
               AND jsonb_array_length(p.test_cases) > 0
               -- Only the problems the server actually judges. The ones flagged
               -- 0 cannot be judged by running them (Flask, matplotlib,
               -- requests, a file that must exist, random) and are accepted on
               -- submission instead; scripts/mark-auto-gradable.js decides that
               -- by running each reference solution, and prints the full list.
               AND p.is_auto_gradable = 1
             ORDER BY p.problem_id`);

        const broken = [];
        const byKind = {};
        for (const p of problems) {
            byKind[p.test_kind] = (byKind[p.test_kind] || 0) + 1;
            const result = await gradeSubmission({ problem: p, code: p.solution_code });
            if (!result.allPassed) {
                const firstBad = result.results.find((r) => !r.passed);
                broken.push(
                    `#${p.problem_id} [${p.modes}] ${String(p.title_th).slice(0, 40)} ` +
                    `— ${result.passed}/${result.total}` +
                    (result.error ? ` (${result.error})` : '') +
                    (firstBad ? ` | คาด ${JSON.stringify(firstBad.expected)?.slice(0, 40)} ได้ ${JSON.stringify(firstBad.actual)?.slice(0, 40)}` : ''));
            }
        }

        check(broken.length === 0,
            `เฉลยของทุกข้อที่ตรวจอัตโนมัติผ่าน test case ของตัวเอง`,
            `${problems.length} ข้อ (${Object.entries(byKind).map(([k, n]) => `${k} ${n}`).join(', ')})` +
            (broken.length ? ` · ตก ${broken.length}` : ''));
        for (const b of broken.slice(0, 15)) console.log(`        ${b}`);
        if (broken.length > 15) console.log(`        ... อีก ${broken.length - 15} ข้อ`);

        // --- and it must say no when the answer is wrong ---------------------
        const { rows: [stdioProblem] } = await c.query(
            `SELECT * FROM problems WHERE test_kind = 'stdio' AND jsonb_array_length(test_cases) > 0
               AND solution_code IS NOT NULL AND btrim(solution_code) <> '' LIMIT 1`);
        const wrong = await gradeSubmission({ problem: stdioProblem, code: 'print("definitely not the answer")' });
        check(!wrong.allPassed, 'คำตอบผิดถูกตัดสินว่าผิด', `${wrong.passed}/${wrong.total}`);

        const empty = await gradeSubmission({ problem: stdioProblem, code: '   ' });
        check(!empty.allPassed && empty.error, 'ส่งโค้ดว่างไม่ผ่าน', empty.error);

        const crashes = await gradeSubmission({ problem: stdioProblem, code: 'raise SystemError("boom")' });
        check(!crashes.allPassed, 'โค้ดที่ crash ไม่ผ่าน', `${crashes.passed}/${crashes.total}`);

        const syntax = await gradeSubmission({ problem: stdioProblem, code: 'def (' });
        check(!syntax.allPassed, 'โค้ดที่ syntax ผิดไม่ผ่าน', `${syntax.passed}/${syntax.total}`);

        // --- the exact bug the old client-side checkers had -------------------
        // CodingWorkspace.jsx and ExercisePage.jsx both compared with
        // `actual.includes(expected)`, so printing 17 satisfied an expected 7.
        const substringTrap = {
            test_kind: 'stdio',
            test_cases: [{ input: '', expected: '7' }],
            solution_code: 'print(7)',
        };
        const trapped = await gradeSubmission({ problem: substringTrap, code: 'print(17)' });
        check(!trapped.allPassed, 'พิมพ์ 17 ไม่ผ่านโจทย์ที่คาด 7 (บั๊ก includes() ของตัวตรวจเดิม)',
            `ได้ ${JSON.stringify(trapped.results[0]?.actual)}`);

        const trapOk = await gradeSubmission({ problem: substringTrap, code: 'print(7)' });
        check(trapOk.allPassed, 'พิมพ์ 7 ผ่านโจทย์เดียวกัน');

        // --- a runaway loop must not hang the request ------------------------
        const started = Date.now();
        const looped = await gradeSubmission({
            problem: substringTrap, code: 'while True:\n    pass', timeoutMs: 2000,
        });
        const elapsed = Date.now() - started;
        check(!looped.allPassed && elapsed < 15000, 'โค้ดวนไม่รู้จบถูกตัดจบด้วย timeout',
            `${elapsed} ms`);

        // --- a function-kind problem grades by return value, not by print ----
        const { rows: [fnProblem] } = await c.query(
            `SELECT * FROM problems WHERE test_kind = 'function' AND jsonb_array_length(test_cases) > 0 LIMIT 1`);
        const printed = await gradeSubmission({
            problem: fnProblem,
            // Defines the right name but returns nothing, only prints.
            code: String(fnProblem.solution_code).replace(/\breturn\b/g, 'print'),
        });
        check(!printed.allPassed, 'โจทย์แบบเรียกฟังก์ชันตัดสินจากค่าที่ return ไม่ใช่สิ่งที่ print',
            `${printed.passed}/${printed.total}`);
    } finally {
        await c.end();
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
