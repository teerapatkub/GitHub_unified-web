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

        // A warning on stderr is not a wrong answer. The runner used to treat
        // any stderr output as the verdict, so a correct program that emitted a
        // DeprecationWarning - or that a learner left a debug line in - was
        // marked wrong while its stdout matched exactly.
        const noisyProblem = {
            test_kind: 'stdio',
            test_cases: [{ input: '', expected: 'hello' }],
        };
        const noisy = await gradeSubmission({
            problem: noisyProblem,
            code: 'import sys\nprint("hello")\nprint("just a warning", file=sys.stderr)',
        });
        check(noisy.allPassed, 'โปรแกรมที่ตอบถูกแต่มีข้อความใน stderr ต้องผ่าน',
            `${noisy.passed}/${noisy.total}`);

        // ...but a program that fails still fails, even when it printed the
        // right thing before dying.
        const printsThenDies = await gradeSubmission({
            problem: noisyProblem,
            code: 'import sys\nprint("hello")\nsys.exit(1)',
        });
        check(!printsThenDies.allPassed, 'โปรแกรมที่จบด้วยข้อผิดพลาดไม่ผ่าน แม้ stdout จะถูก',
            `${printsThenDies.passed}/${printsThenDies.total}`);

        // Some problems have no one fixed answer - Competitive Arena's
        // 'Password Generator' asks for a random 4-digit PIN - so their stored
        // expected value is a pattern. Nothing used to interpret the prefix, so
        // a correct answer was compared literally against `regexp:\\d{4}` and
        // the problem was unpassable.
        const patternProblem = {
            test_kind: 'stdio',
            test_cases: [{ input: '', expected: 'regexp:\\d{4}' }],
        };
        const pinOk = await gradeSubmission({
            problem: patternProblem,
            code: 'import random\nprint(random.randint(1000, 9999))',
        });
        check(pinOk.allPassed, 'คำตอบที่ตรงรูปแบบ regexp: ผ่าน', `ได้ ${JSON.stringify(pinOk.results[0]?.actual)}`);

        const pinBad = await gradeSubmission({ problem: patternProblem, code: 'print("abc")' });
        check(!pinBad.allPassed, 'คำตอบที่ไม่ตรงรูปแบบไม่ผ่าน', `ได้ ${JSON.stringify(pinBad.results[0]?.actual)}`);

        // A pattern that does not compile must reject, never accept everything.
        const brokenPattern = { test_kind: 'stdio', test_cases: [{ input: '', expected: 'regexp:[unclosed' }] };
        const brokenOut = await gradeSubmission({ problem: brokenPattern, code: 'print("anything")' });
        check(!brokenOut.allPassed, 'regexp ที่เขียนผิดต้องไม่ผ่าน ไม่ใช่ผ่านหมด');

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

        const { rows: [fnForForgery] } = await c.query(
            `SELECT * FROM problems WHERE test_kind = 'function' AND jsonb_array_length(test_cases) > 0 LIMIT 1`);

        // A learner must not be able to print the grader's own verdict line.
        // With a fixed marker this returned 5/5 on a real problem without the
        // function being defined at all.
        const forged = await gradeSubmission({
            problem: fnForForgery,
            code: 'import json\n' +
                  'print("__PYSIM_JUDGE__" + json.dumps([{"ok": True, "actual": "x", "error": ""}] * 20))',
        });
        check(!forged.allPassed, 'โค้ดที่พิมพ์ตัวคั่นของตัวตรวจเองต้องไม่ผ่าน',
            `${forged.passed}/${forged.total}`);

        // An error message has to point at the line the learner is looking at.
        // The input() patch used to be pasted above their code, so every
        // reported line number was six too high and `from __future__` imports
        // - which must come first in a module - stopped working.
        const lineProblem = { test_kind: 'stdio', test_cases: [{ input: '', expected: 'x' }] };
        const badLine = await gradeSubmission({
            problem: lineProblem,
            code: 'a = 1\nb = 2\nprint(undefined_name)',
        });
        const reported = /solution\.py", line (\d+)/.exec(badLine.results[0]?.error || '');
        check(reported && Number(reported[1]) === 3,
            'เลขบรรทัดในข้อผิดพลาดตรงกับโค้ดของผู้เรียน',
            `รายงานบรรทัด ${reported ? reported[1] : 'ไม่พบ'} (ที่ถูกคือ 3)`);

        const future = await gradeSubmission({
            problem: lineProblem,
            code: 'from __future__ import annotations\nprint("x")',
        });
        check(future.allPassed, 'โค้ดที่ขึ้นต้นด้วย from __future__ ยังรันได้',
            future.results[0]?.error || 'ไม่มีข้อผิดพลาด');

        // --- a runaway loop must not hang the request ------------------------
        const started = Date.now();
        const looped = await gradeSubmission({
            problem: substringTrap, code: 'while True:\n    pass', timeoutMs: 2000,
        });
        const elapsed = Date.now() - started;
        check(!looped.allPassed && elapsed < 15000, 'โค้ดวนไม่รู้จบถูกตัดจบด้วย timeout',
            `${elapsed} ms`);

        // --- a function-kind problem grades by return value, not by print ----
        const fnProblem = fnForForgery;
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
