/**
 * Decide, by running them, which problems can be graded automatically.
 *
 *   node scripts/mark-auto-gradable.js            (report only)
 *   node scripts/mark-auto-gradable.js --apply    (write problems.is_auto_gradable)
 *
 * A problem is auto-gradable when its own reference solution passes its own
 * test cases. If the reference answer cannot pass, no learner's answer can
 * either, and grading it would punish correct work.
 *
 * The ones that fail are mostly not broken problems - they teach Flask,
 * matplotlib, requests, reading a file that must already exist, or random.
 * Those have no fixed expected output, so they stay on the honour system: the
 * learner runs the code themselves and the submission is accepted. Everything
 * else is judged on the server.
 *
 * Re-run this after changing the problem bank, or after installing a library
 * that some problems needed (several would become gradable if pandas,
 * matplotlib, requests and flask were available to the runner).
 */
const { Client } = require('pg');
const { gradeSubmission } = require('../problemGrader');

const APPLY = process.argv.includes('--apply');

const reason = (result, problem) => {
    const err = [result.error, ...(result.results || []).map((r) => r.error)].filter(Boolean).join(' ');
    const mod = (err.match(/No module named '([^']+)'/) || [])[1];
    if (mod) return `ต้องใช้ไลบรารี ${mod}`;
    if (/FileNotFoundError|No such file/i.test(err)) return 'ต้องมีไฟล์ข้อมูลอยู่ก่อน';
    if (/timed out/i.test(err)) return 'รันไม่จบเอง (เซิร์ฟเวอร์/ลูปรอ)';
    if (/ConnectionError|urlopen|Max retries|getaddrinfo/i.test(err)) return 'ต้องต่ออินเทอร์เน็ต';
    if (/\b(random|shuffle|choice|uuid|now\(\)|time\(\))/.test(problem.solution_code || '')) return 'ผลลัพธ์ไม่คงที่ (สุ่ม/เวลา)';
    if (err) return 'error: ' + err.split('\n')[0].slice(0, 70);
    return 'ผลลัพธ์ที่ได้ไม่ตรงกับที่เก็บไว้';
};

(async () => {
    const c = new Client({
        host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await c.connect();

    const { rows } = await c.query(`
        SELECT p.problem_id, p.title_th, p.test_kind, p.test_cases, p.solution_code, p.starter_code,
               p.is_auto_gradable,
               (SELECT string_agg(m.mode, ',') FROM problem_modes m WHERE m.problem_id = p.problem_id) AS modes
          FROM problems p ORDER BY p.problem_id`);

    const gradable = [];
    const notGradable = [];
    const noReference = [];

    for (const p of rows) {
        const hasSolution = p.solution_code && String(p.solution_code).trim();
        const hasCases = Array.isArray(p.test_cases) && p.test_cases.length > 0;

        if (!hasCases) { noReference.push([p, 'ไม่มี test case']); continue; }
        if (!hasSolution) { noReference.push([p, 'ไม่มีเฉลยให้ตรวจสอบ']); continue; }

        const result = await gradeSubmission({ problem: p, code: p.solution_code });
        (result.allPassed ? gradable : notGradable).push([p, result.allPassed ? '' : reason(result, p)]);
    }

    console.log(`ตรวจอัตโนมัติได้      ${String(gradable.length).padStart(4)} ข้อ`);
    console.log(`ตรวจอัตโนมัติไม่ได้   ${String(notGradable.length).padStart(4)} ข้อ`);
    console.log(`ไม่มีเฉลย/เทสให้ตรวจ  ${String(noReference.length).padStart(4)} ข้อ  (เช่น โจทย์แข่งที่แอดมินสร้างเอง)`);

    const grouped = new Map();
    for (const [p, why] of notGradable) {
        if (!grouped.has(why)) grouped.set(why, []);
        grouped.get(why).push(p);
    }
    console.log('\nเหตุผลที่ตรวจอัตโนมัติไม่ได้:');
    for (const [why, list] of [...grouped].sort((a, b) => b[1].length - a[1].length)) {
        console.log(`  ${String(list.length).padStart(3)}  ${why}`);
        console.log(`       ${list.slice(0, 3).map((p) => `#${p.problem_id} ${String(p.title_th).slice(0, 26)}`).join(' · ')}`);
    }

    if (APPLY) {
        await c.query('BEGIN');
        // Problems with no reference to check against keep the benefit of the
        // doubt: an admin-authored challenge has real test cases and is graded,
        // it simply has no stored solution for this script to try.
        await c.query('UPDATE problems SET is_auto_gradable = 1');
        if (notGradable.length > 0) {
            await c.query('UPDATE problems SET is_auto_gradable = 0 WHERE problem_id = ANY($1::bigint[])',
                [notGradable.map(([p]) => p.problem_id)]);
        }
        await c.query('COMMIT');
        console.log(`\nเขียนลงฐานแล้ว: ${notGradable.length} ข้อถูกทำเครื่องหมายว่าตรวจอัตโนมัติไม่ได้`);
    } else {
        console.log('\n(ยังไม่เขียนลงฐาน — ใส่ --apply เพื่อบันทึก)');
    }

    await c.end();
})();
