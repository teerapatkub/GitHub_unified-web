// server/problemGrader.js
//
// The one place that decides whether a submitted answer is correct.
//
// Before this existed there were five: three in the client (CodingWorkspace,
// ExercisePage, MiNi_Game), one for the Arcade in Pyodide, and one on the
// server for the Competitive Arena. They disagreed on which key holds the
// expected value, and two of them compared with `actual.includes(expected)` -
// so a problem expecting `7` was marked correct when the program printed `17`.
// Comparison here is exact, after normalising line endings and trimming.
//
// It grades both shapes the merged problem bank stores (see
// server/problemsSchema.js):
//
//   test_kind 'stdio'    - feed `input` on stdin, compare stdout to `expected`
//   test_kind 'function' - call the problem's function with `args`, compare the
//                          returned value to `expected`
//
// Nothing here trusts the client. The caller passes the learner's code and the
// problem row; whether it passed is decided by actually running Python.
const crypto = require('crypto');
const { runPythonScript, runPythonCase, normalizeOutput } = require('./pythonRunner');
// One sentence a beginner can act on, attached to every failing case. See
// server/pythonErrorMessages.js - the audience for this whole project is
// people who have never written code, and a raw traceback tells them nothing.
const { explainPythonError } = require('./pythonErrorMessages.mjs');

const MARKER = '__PYSIM_JUDGE__';

// The marker cannot be a constant the learner could print themselves.
//
// The harness reports its results by printing one marker line, and the
// learner's own code runs FIRST, above it. With a fixed marker, submitting
// `print('__PYSIM_JUDGE__' + json.dumps([{"ok": True}, ...]))` produced a line
// the grader read as its own verdict: every case passed without the function
// being defined at all. Demonstrated on a real problem before this was fixed -
// it returned 5/5.
//
// A per-run random marker cannot be guessed from the problem, the starter code
// or a previous run, and the reply is read from the LAST marker line, so even a
// leaked marker cannot be shadowed by an earlier forged one.
const newRunMarker = () => `${MARKER}${crypto.randomBytes(12).toString('hex')}__`;

// Same expression the Arcade uses on the client to find the target function, so
// both sides always agree on which function a problem is about.
const targetFunctionName = (source = '') => {
    const match = /^def\s+(\w+)\s*\([^)]*\)\s*:/m.exec(String(source || ''));
    return match ? match[1] : null;
};

const asCases = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }
    return [];
};

/**
 * Wrap the learner's code so it calls the target function once per case and
 * prints one marker line of JSON.
 *
 * The cases are base64-embedded rather than interpolated: the learner's own
 * code is concatenated above this, and any quote or brace they wrote would
 * otherwise be able to break the harness itself and turn a wrong answer into a
 * crash - or a right answer into a failure.
 */
const buildFunctionHarness = (code, functionName, cases, marker = MARKER) => {
    const b64 = Buffer.from(JSON.stringify(cases), 'utf8').toString('base64');
    return [
        String(code || ''),
        '',
        'import json as __json, base64 as __b64',
        `__cases = __json.loads(__b64.b64decode("${b64}").decode("utf-8"))`,
        '__results = []',
        'for __case in __cases:',
        '    try:',
        `        __actual = ${functionName}(*__case["args"])`,
        '        __results.append({"ok": bool(__actual == __case["expected"]),',
        '                          "actual": repr(__actual), "error": ""})',
        '    except Exception as __exc:',
        '        __results.append({"ok": False, "actual": "", "error": type(__exc).__name__ + ": " + str(__exc)})',
        `print("${marker}" + __json.dumps(__results))`,
        '',
    ].join('\n');
};

async function gradeFunctionProblem({ problem, code, timeoutMs }) {
    const cases = asCases(problem.test_cases);
    const functionName = targetFunctionName(problem.solution_code || problem.starter_code || '');

    if (!functionName) {
        return {
            passed: 0, total: cases.length, allPassed: false, results: [],
            error: 'ไม่พบชื่อฟังก์ชันของโจทย์ข้อนี้ (โจทย์แบบเรียกฟังก์ชันต้องมี def ในเฉลย)',
        };
    }
    if (cases.length === 0) {
        return { passed: 0, total: 0, allPassed: false, results: [], error: 'โจทย์ข้อนี้ยังไม่มี test case' };
    }

    // One process for all the cases, not one per case: the whole point of the
    // harness is that starting Python is the expensive part.
    const marker = newRunMarker();
    const run = await runPythonScript({
        code: buildFunctionHarness(code, functionName, cases, marker),
        timeoutMs,
    });
    // Last, not first: the learner's own output is printed before the harness's.
    const markerLines = String(run.stdout || '').split('\n').filter((l) => l.startsWith(marker));
    const line = markerLines.length ? markerLines[markerLines.length - 1] : null;

    if (!line) {
        // No marker means the code never reached the harness - a syntax error,
        // an exception at import time, or a timeout.
        return {
            passed: 0, total: cases.length, allPassed: false,
            results: cases.map((c) => ({ args: c.args, expected: c.expected, actual: '', passed: false, error: '' })),
            error: run.error || 'โค้ดรันไม่จบ',
        };
    }

    let parsed = [];
    try { parsed = JSON.parse(line.slice(marker.length)); } catch { parsed = []; }

    const results = cases.map((c, i) => {
        const error = parsed[i]?.error || '';
        const explained = explainPythonError(error);
        return {
            args: c.args,
            expected: c.expected,
            actual: parsed[i]?.actual ?? '',
            passed: Boolean(parsed[i]?.ok),
            error,
            hint: explained.message,
            errorLine: explained.line,
            errorKind: explained.kind,
        };
    });

    const passed = results.filter((r) => r.passed).length;
    return { passed, total: results.length, allPassed: passed === results.length, results, error: '' };
}

// Python's input(prompt) writes the prompt to stdout before reading. Every
// stored expected output in this project is the answer WITHOUT those prompts -
// a problem whose solution is input("ชื่อ: ") then print("สวัสดี", name) stores
// just "สวัสดี Lumi". That mismatch is why the old client-side checkers compared
// with includes() instead of equality, and why they also passed 17 for 7.
//
// Suppressing the prompt instead keeps the comparison exact and still lets the
// learner write the prompt their problem asks for. The learner's code runs
// unchanged; only what input() does with its argument changes.
// Python's input(prompt) writes the prompt to stdout before reading. Every
// stored expected output in this project is the answer WITHOUT those prompts -
// a problem whose solution is input("ชื่อ: ") then print("สวัสดี", name) stores
// just "สวัสดี Lumi". That mismatch is why the old client-side checkers compared
// with includes() instead of equality, and why they also passed 17 for 7.
//
// The learner's code runs as its own file and this launcher imports it, rather
// than the two being concatenated. Concatenating shifted every reported line
// number by the length of the preamble - a syntax error on the learner's line 3
// was announced as line 9 of a file they see as six lines long - and it broke
// `from __future__` imports outright, since those must be the first statement
// in a module.
const RUN_WITH_INPUT_PATCHED = `import builtins, runpy
__pysim_real_input = builtins.input
def __pysim_input(*args, **kwargs):
    return __pysim_real_input()
builtins.input = __pysim_input
runpy.run_path("solution.py", run_name="__main__")
`;

// The launcher above appears in any traceback, along with the temp directory it
// runs from - noise a beginner cannot act on, and a path they should not see.
// Everything before the learner's own file is dropped, so the message starts at
// the line they wrote.
const trimLauncherFrames = (text) => {
    const raw = String(text || '');
    const own = raw.indexOf('File "solution.py"');
    if (own === -1) return raw;
    const head = raw.startsWith('Traceback') ? 'Traceback (most recent call last):\n' : '';
    return head + '  ' + raw.slice(own).trimStart();
};

async function gradeStdioProblem({ problem, code, timeoutMs }) {
    const cases = asCases(problem.test_cases);
    if (cases.length === 0) {
        return { passed: 0, total: 0, allPassed: false, results: [], error: 'โจทย์ข้อนี้ยังไม่มี test case' };
    }

    const results = [];
    for (const c of cases) {
        // A case may list several acceptable outputs (mini-game branches do).
        const accepted = Array.isArray(c.expected_any) && c.expected_any.length > 0
            ? c.expected_any
            : [c.expected];

        let best = null;
        for (const expected of accepted) {
            const outcome = await runPythonCase({
                code: RUN_WITH_INPUT_PATCHED,
                files: { 'solution.py': String(code || '') },
                mainFileName: '__pysim_run.py',
                input: c.input ?? '', expected, timeoutMs,
            });
            if (outcome.passed) { best = outcome; break; }
            if (!best) best = outcome;
        }
        const error = trimLauncherFrames(best.error || '');
        const explained = explainPythonError(error);
        results.push({
            input: c.input ?? '',
            expected: accepted.length > 1 ? accepted : accepted[0],
            actual: best.actual,
            passed: best.passed,
            error,
            // What to show the learner, and where to point them.
            hint: explained.message,
            errorLine: explained.line,
            errorKind: explained.kind,
        });
    }

    const passed = results.filter((r) => r.passed).length;
    return { passed, total: results.length, allPassed: passed === results.length, results, error: '' };
}

/**
 * Screen a submission for a problem that cannot be auto-graded.
 *
 * 26 problems teach Flask, matplotlib, requests, reading a file that must
 * already exist, or randomness - none has one fixed correct output, so running
 * them against stored expectations would fail learners who wrote a perfectly
 * good answer. They are accepted without a verdict instead.
 *
 * "Accepted without a verdict" used to mean accepted unconditionally, so an
 * empty string collected the full XP and coin reward. It now means the
 * submission has to look like a real attempt:
 *
 *   1. not empty, and
 *   2. different from the starter code the problem handed the learner, and
 *   3. actually runs.
 *
 * Rule 3 has an escape hatch. If the code fails only because the library the
 * problem is about is not installed on this machine, that is the deployment's
 * gap and not the learner's mistake, so it falls back to checking the code
 * compiles. Without that, moving to a host without Flask would start rejecting
 * correct Flask answers - worse than the hole this closes.
 */
async function screenUnverifiedSubmission({ problem, code, timeoutMs = 6000 }) {
    const submitted = String(code || '').trim();
    if (!submitted) {
        return { accepted: false, reason: 'ยังไม่ได้เขียนโค้ด' };
    }

    const starter = String(problem?.starter_code || '').trim();
    if (starter && normalizeOutput(submitted) === normalizeOutput(starter)) {
        return { accepted: false, reason: 'ยังไม่ได้แก้โค้ดตั้งต้นเลย ลองเขียนคำตอบของตัวเองดู' };
    }

    const run = await runPythonScript({ code: submitted, timeoutMs });
    if (!run.timedOut && run.exitCode === 0) {
        return { accepted: true, reason: '' };
    }

    // The library the problem is about is missing here, not in the answer.
    if (/ModuleNotFoundError|ImportError/.test(String(run.stderr || ''))) {
        // Compiling the source proves it is valid Python without needing the
        // library. Passed in base64 so nothing the learner wrote can break out
        // of the checker, the same reason the function harness does it.
        const b64 = Buffer.from(submitted, 'utf8').toString('base64');
        const compileOnly = `import base64
compile(base64.b64decode("${b64}").decode("utf-8"), "solution.py", "exec")
`;
        const syntax = await runPythonScript({ code: compileOnly, timeoutMs });
        return syntax.exitCode === 0
            ? { accepted: true, reason: 'รับคำตอบไว้โดยไม่ได้รัน เพราะเครื่องนี้ยังไม่มีไลบรารีที่โจทย์ใช้' }
            : { accepted: false, reason: 'โค้ดมีข้อผิดพลาดทางไวยากรณ์' };
    }

    if (run.timedOut) {
        return { accepted: false, reason: 'โค้ดรันไม่จบภายในเวลาที่กำหนด' };
    }
    return { accepted: false, reason: run.error || 'โค้ดรันแล้วเกิดข้อผิดพลาด' };
}

/**
 * Grade one submission.
 *
 * @param {object} problem  a row from `problems` (test_kind, test_cases,
 *                          solution_code)
 * @param {string} code     what the learner wrote
 * @returns {{passed:number,total:number,allPassed:boolean,results:Array,error:string}}
 */
async function gradeSubmission({ problem, code, timeoutMs = 6000 }) {
    if (!problem) {
        return { passed: 0, total: 0, allPassed: false, results: [], error: 'ไม่พบโจทย์' };
    }
    // An empty submission is a failure, not an error - and checking here means
    // no Python process is started for it.
    if (!String(code || '').trim()) {
        const total = asCases(problem.test_cases).length;
        return { passed: 0, total, allPassed: false, results: [], error: 'ยังไม่ได้เขียนโค้ด' };
    }

    return problem.test_kind === 'function'
        ? gradeFunctionProblem({ problem, code, timeoutMs })
        : gradeStdioProblem({ problem, code, timeoutMs });
}

module.exports = {
    gradeSubmission,
    screenUnverifiedSubmission,
    targetFunctionName,
    buildFunctionHarness,
    normalizeOutput,
    MARKER,
};
