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
const { runPythonScript, runPythonCase, normalizeOutput } = require('./pythonRunner');

const MARKER = '__PYSIM_JUDGE__';

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
const buildFunctionHarness = (code, functionName, cases) => {
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
        `print("${MARKER}" + __json.dumps(__results))`,
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
    const run = await runPythonScript({
        code: buildFunctionHarness(code, functionName, cases),
        timeoutMs,
    });
    const line = String(run.stdout || '').split('\n').find((l) => l.startsWith(MARKER));

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
    try { parsed = JSON.parse(line.slice(MARKER.length)); } catch { parsed = []; }

    const results = cases.map((c, i) => ({
        args: c.args,
        expected: c.expected,
        actual: parsed[i]?.actual ?? '',
        passed: Boolean(parsed[i]?.ok),
        error: parsed[i]?.error || '',
    }));

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
const INPUT_PROMPT_PREAMBLE = [
    'import builtins as __pysim_builtins',
    '__pysim_real_input = __pysim_builtins.input',
    'def __pysim_input(*args, **kwargs):',
    '    return __pysim_real_input()',
    '__pysim_builtins.input = __pysim_input',
    '',
].join('\n');

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
                code: INPUT_PROMPT_PREAMBLE + String(code || ''),
                input: c.input ?? '', expected, timeoutMs,
            });
            if (outcome.passed) { best = outcome; break; }
            if (!best) best = outcome;
        }
        results.push({
            input: c.input ?? '',
            expected: accepted.length > 1 ? accepted : accepted[0],
            actual: best.actual,
            passed: best.passed,
            error: best.error || '',
        });
    }

    const passed = results.filter((r) => r.passed).length;
    return { passed, total: results.length, allPassed: passed === results.length, results, error: '' };
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
    targetFunctionName,
    buildFunctionHarness,
    normalizeOutput,
    MARKER,
};
