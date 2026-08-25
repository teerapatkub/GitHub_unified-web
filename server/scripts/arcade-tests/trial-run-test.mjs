// Does the "test your code" button in an Arcade round tell the truth?
//
//   node scripts/arcade-tests/trial-run-test.mjs      (needs Python, no server, no DB)
//
// The button used to just execute the player's file. Arcade problems are
// answered by DEFINING a function, so a perfectly correct answer printed
// nothing and the player was told "your code ran but did not print anything" -
// reported from a real game on 2026-08-25.
//
// It now builds a harness that calls the function with the round's own cases.
// This drives that harness builder - the real one, imported from constants.js -
// through real Python and checks each outcome a player can produce. CPython
// rather than Pyodide: the harness uses nothing Pyodide-specific, and the
// alternative is not testing it at all.
//
// The last case is the one that matters most. Pyodide keeps ONE interpreter
// alive for a whole match, so a function defined by an earlier trial run is
// still in globals(); the first version of this harness read from globals() and
// therefore kept reporting a deleted or renamed function as passing.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const arcadeDir = path.resolve(here, '../../../client/src/pages/Arcade');
const config = JSON.parse(fs.readFileSync(path.resolve(here, '../../../shared/arcadeConfig.json'), 'utf8'));

// constants.js imports the shared JSON config, which Node will not load the way
// Vite does. Inlined here so the module under test is the real file.
const src = fs.readFileSync(path.join(arcadeDir, 'constants.js'), 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/^import\s+(\w+)\s+from\s+'[^']*\.json';$/gm, (_m, name) => `const ${name} = ${JSON.stringify(config)};`);
const { buildTrialHarness, TRIAL_MARKER, TRIAL_NO_FN, TRIAL_CODE_ERROR } =
    await import(`data:text/javascript;base64,${Buffer.from(src, 'utf8').toString('base64')}`);

let pass = 0, fail = 0;
const check = (ok, label, detail) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
    ok ? pass++ : fail++;
};

const PYTHON = process.env.PYSIM_PYTHON || 'python';

// Runs a harness the way the browser would, optionally after some other code
// has already run in the same interpreter - which is how a match actually
// behaves.
const runHarness = (harness, { previously = '' } = {}) => {
    const file = path.join(os.tmpdir(), `pysim-trial-${Date.now()}-${Math.random().toString(16).slice(2)}.py`);
    fs.writeFileSync(file, previously ? `${previously}\n${harness}` : harness, 'utf8');
    try {
        const run = spawnSync(PYTHON, [file], {
            encoding: 'utf8',
            timeout: 15000,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
        });
        const out = `${run.stdout || ''}${run.stderr || ''}`;
        const lines = out.split('\n').map((l) => l.trim());
        const marker = lines.find((l) => l.startsWith(TRIAL_MARKER));
        return {
            out,
            results: marker ? JSON.parse(marker.slice(TRIAL_MARKER.length)) : null,
            noFunction: lines.some((l) => l.startsWith(TRIAL_NO_FN)),
            codeError: lines.find((l) => l.startsWith(TRIAL_CODE_ERROR)) || null,
            printed: lines.filter((l) => l && !l.startsWith('__PYSIM')),
        };
    } finally {
        fs.unlinkSync(file);
    }
};

const CASES = [
    { input: [[1, 2, 2, 3]], output: 2 },
    { input: [[4]], output: 4 },
    { input: [[5, 5, 6, 6, 6]], output: 6 },
];
const CORRECT = 'def most_frequent(nums):\n    return max(nums, key=nums.count)\n';

const probe = spawnSync(PYTHON, ['-c', 'print(1)'], { encoding: 'utf8' });
if (probe.status !== 0) {
    console.error(`could not run ${PYTHON} — set PYSIM_PYTHON to a Python 3 interpreter`);
    process.exit(2);
}

// 1. A correct answer is reported as correct. This is the case that was broken:
//    it used to produce no output at all.
{
    const r = runHarness(buildTrialHarness(CORRECT, 'most_frequent', CASES));
    check(Array.isArray(r.results) && r.results.length === CASES.length && r.results.every((x) => x.ok),
        'คำตอบที่ถูกต้องต้องขึ้นว่าผ่านทุกเทสเคส',
        r.results ? `${r.results.filter((x) => x.ok).length}/${r.results.length}` : `ไม่มีผลลัพธ์: ${r.out.slice(0, 80)}`);
}

// 2. A wrong answer says which case failed AND what it returned instead - a
//    bare "failed" leaves a beginner with nowhere to go.
{
    const r = runHarness(buildTrialHarness('def most_frequent(nums):\n    return nums[0]\n', 'most_frequent', CASES));
    check(r.results && r.results[0].ok === false && r.results[1].ok === true,
        'คำตอบที่ผิดต้องบอกว่าเทสไหนไม่ผ่าน', JSON.stringify(r.results?.map((x) => x.ok)));
    check(r.results && r.results[0].got === '1',
        'ต้องบอกด้วยว่าได้ค่าอะไรออกมาแทน', `ได้ ${JSON.stringify(r.results?.[0]?.got)}`);
}

// 3. An exception inside the function fails only that case, and names itself.
{
    const r = runHarness(buildTrialHarness('def most_frequent(nums):\n    return nums[99]\n', 'most_frequent', CASES));
    check(r.results && r.results.every((x) => !x.ok && x.got.startsWith('IndexError')),
        'ข้อผิดพลาดตอนเรียกฟังก์ชันต้องบอกชนิดของมัน', JSON.stringify(r.results?.[0]?.got));
}

// 4. Code that cannot be loaded at all is reported as such, not as a silent
//    zero-out-of-three.
{
    const r = runHarness(buildTrialHarness('def most_frequent(nums)\n    return 1\n', 'most_frequent', CASES));
    check(Boolean(r.codeError) && r.codeError.includes('SyntaxError'),
        'โค้ดที่ผิดไวยากรณ์ต้องรายงานว่าโหลดไม่ได้', r.codeError || 'ไม่มีข้อความ');
    check(r.results === null, 'ไม่รายงานผลเทสเคสเมื่อโค้ดโหลดไม่ได้');
}

// 5. A missing function is a missing function.
{
    const r = runHarness(buildTrialHarness('def WRONG_NAME(nums):\n    return 1\n', 'most_frequent', CASES));
    check(r.noFunction, 'ตั้งชื่อฟังก์ชันไม่ตรงต้องบอกว่าไม่พบฟังก์ชัน');
}

// 6. THE ONE THAT MATTERS. The interpreter already has a working
//    most_frequent in it from a previous run; the player's current code does
//    not define one. The report must not resurrect the old definition.
{
    const r = runHarness(buildTrialHarness('def WRONG_NAME(nums):\n    return 1\n', 'most_frequent', CASES),
        { previously: CORRECT });
    check(r.noFunction && r.results === null,
        'ฟังก์ชันที่ค้างอยู่จากการรันครั้งก่อนต้องไม่ถูกนำมาใช้',
        r.results ? 'ยังเห็นผลเทสจากของเก่า' : 'ไม่พบฟังก์ชัน ถูกต้อง');
}

// 7. The player's own print() output survives alongside the report, so the
//    oldest debugging technique there is still works.
{
    const r = runHarness(buildTrialHarness(
        'def most_frequent(nums):\n    print("looking at", nums)\n    return max(nums, key=nums.count)\n',
        'most_frequent', CASES));
    check(r.results?.every((x) => x.ok) && r.printed.some((l) => l.startsWith('looking at')),
        'ข้อความที่ผู้เล่น print เองต้องยังเห็นอยู่', `${r.printed.length} บรรทัด`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
