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
        'import json as __json, base64 as __b64, time as __time',
        `__cases = __json.loads(__b64.b64decode("${b64}").decode("utf-8"))`,
        '__results = []',
        'for __case in __cases:',
        '    __start = __time.perf_counter()',
        '    try:',
        `        __actual = ${functionName}(*__case["args"])`,
        '        __ms = (__time.perf_counter() - __start) * 1000',
        '        __results.append({"ok": bool(__actual == __case["expected"]),',
        '                          "actual": repr(__actual), "error": "", "ms": __ms})',
        '    except Exception as __exc:',
        '        __results.append({"ok": False, "actual": "", "error": type(__exc).__name__ + ": " + str(__exc),',
        '                          "ms": (__time.perf_counter() - __start) * 1000})',
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
            // Time inside the call only, measured by Python itself.
            ms: Number(parsed[i]?.ms) || 0,
        };
    });

    const passed = results.filter((r) => r.passed).length;
    return { passed, total: results.length, allPassed: passed === results.length, results, error: '', runtimeMs: totalMs(results) };
}

// How long the cases took to run, added up. Nothing here decides pass or
// fail; the Arcade code judge compares it with the reference answer's time
// (arcade/code-judge.js).
const totalMs = (results) => results.reduce((sum, r) => sum + (Number(r.ms) || 0), 0);

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

async function gradeStdioProblem({ problem, code, timeoutMs, files = {} }) {
    const cases = asCases(problem.test_cases);
    if (cases.length === 0) {
        return { passed: 0, total: 0, allPassed: false, results: [], error: 'โจทย์ข้อนี้ยังไม่มี test case' };
    }

    const results = [];
    for (const c of cases) {
        // A case may list several acceptable outputs (mini-game branches do).
        const accepted = Array.isArray(c.expected_any) && c.expected_any.length > 0
            ? c.expected_any
            : [c.expected ?? c.expected_output];

        let best = null;
        for (const expected of accepted) {
            const started = process.hrtime.bigint();
            const outcome = await runPythonCase({
                code: RUN_WITH_INPUT_PATCHED,
                files: { ...files, 'solution.py': String(code || '') },
                mainFileName: '__pysim_run.py',
                input: c.input ?? '', expected: c.match_mode === 'contains' ? '' : expected, timeoutMs,
            });
            const actualText = normalizeOutput(outcome.actual).replace(/\s+/g, ' ');
            const expectedText = normalizeOutput(expected).replace(/\s+/g, ' ');
            const matchesPhrase = expectedText && (/^-?\d+(?:\.\d+)?$/.test(expectedText)
                ? actualText === expectedText : actualText.includes(expectedText));
            const forbidden = Array.isArray(c.forbidden_any) ? c.forbidden_any : [c.forbidden ?? c.not_expected];
            const hasForbiddenOutput = forbidden.some((item) => item && actualText.includes(normalizeOutput(String(item)).replace(/\s+/g, ' ')));
            const passed = (c.match_mode === 'contains'
                ? !outcome.error && Boolean(matchesPhrase) : outcome.passed) && !hasForbiddenOutput;
            // Wall-clock per process, so it includes starting Python: only
            // meaningful compared with another run on the same machine.
            const candidate = { ...outcome, passed, ms: Number(process.hrtime.bigint() - started) / 1e6 };
            if (passed) { best = candidate; break; }
            if (!best) best = candidate;
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
            ms: best.ms,
        });
    }

    const passed = results.filter((r) => r.passed).length;
    const verdict = { passed, total: results.length, allPassed: passed === results.length, results, error: '', runtimeMs: totalMs(results) };
    if (verdict.allPassed && casesCannotTellPrintingFromComputing(cases)
        && await printsAnswerWithoutComputing({ problem, code, input: cases[0].input ?? '', actual: results[0].actual, files, timeoutMs })) {
        return {
            ...verdict,
            passed: 0,
            allPassed: false,
            hardcoded: true,
            results: results.map((r) => ({ ...r, passed: false, hint: HARDCODED_MESSAGE })),
            error: HARDCODED_MESSAGE,
        };
    }
    return verdict;
}

// ---------------------------------------------------------------------------
// "Did they just print the answer?"
//
// Most lesson and mini-game problems read no input, so every test case expects
// the same output and `print("<expected output>")` passed them all - on the
// live site, a Debug Lab problem asking for re.split() paid out 90 XP for
// printing the list it should have built (fix list item 1, 2026-11-12).
//
// More test cases cannot fix that: with no input, there is nothing to vary. So
// the question becomes: when the problem's DATA changes, does the answer change
// with it? The data is the stdin and the literals in the reference solution.
// hardcode-probe.py writes copies of the solution and of the learner's code with
// one literal changed; both run here through the same sandboxed runner as
// grading. If the solution's output moves and the learner's does not, the
// learner printed a constant.
//
// It errs toward passing. Any single change that moves the learner's output (or
// makes it crash, which also shows it used the data) clears them. Only a problem
// whose reference solution is known can be checked; without one, nothing
// changes.
// ---------------------------------------------------------------------------
const HARDCODED_MESSAGE = 'ผลลัพธ์ตรงกับคำตอบ แต่โค้ดไม่ได้คำนวณจากข้อมูลของโจทย์ (เหมือนพิมพ์คำตอบไว้ตรงๆ) ลองเขียนโค้ดที่ทำตามโจทย์ดูนะ';
const HARDCODE_PROBE_SOURCE = require('fs').readFileSync(require('path').join(__dirname, 'hardcode-probe.py'), 'utf8');
const MAX_HARDCODE_RUNS = 32;

// With different inputs, a constant output already fails a case. Only when
// every case feeds the same stdin is a printed constant indistinguishable.
const casesCannotTellPrintingFromComputing = (cases) => new Set(cases.map((c) => String(c.input ?? ''))).size <= 1;

const flatOutput = (text) => normalizeOutput(text).replace(/\s+/g, ' ');

// Several different inputs, because one is often not enough: `if x > 0` gives
// the same answer for 5 and 8, so a printed "Positive" would survive +3 but not
// a negative number. Numbers shift, flip sign and drop to zero; words gain a
// letter or reverse. Each stays ordinary enough not to crash int() or split().
const INPUT_CHANGES = [
    { int: (n) => n + 3, float: (n) => n + 1.5, text: (s) => `${s}Q` },
    { int: (n) => -n - 1, float: (n) => -n - 1, text: (s) => [...s].reverse().join('') },
    { int: () => 0, float: () => 0, text: (s) => s.toUpperCase() === s ? s.toLowerCase() : s.toUpperCase() },
    // `score >= 50` with 45: +3, a flipped sign and zero all still fail.
    { int: (n) => n * 2 + 10, float: (n) => n * 2 + 10, text: (s) => `${s}${s}` },
];
const changedInputs = (input) => INPUT_CHANGES.map((change) => String(input ?? '').split('\n').map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;
    // Several numbers on one line (`3 4`, read with split()) change one by one.
    if (/^-?\d+(?:\.\d+)?(?:\s+-?\d+(?:\.\d+)?)*$/.test(trimmed)) {
        return trimmed.split(/\s+/).map((token) => (token.includes('.')
            ? String(change.float(Number(token)))
            : String(change.int(Number(token))))).join(' ');
    }
    return change.text(line);
}).join('\n')).filter((changed, i, all) => changed !== String(input ?? '') && all.indexOf(changed) === i);

const runForOutput = async ({ source, input, files, timeoutMs }) => {
    const run = await runPythonScript({
        code: RUN_WITH_INPUT_PATCHED,
        files: { ...files, 'solution.py': source },
        mainFileName: '__pysim_run.py',
        input,
        timeoutMs,
    });
    return { ok: !run.timedOut && run.exitCode === 0, output: flatOutput(run.stdout) };
};

async function printsAnswerWithoutComputing({ problem, code, input, actual, files = {}, timeoutMs = 6000 }) {
    const solution = String(problem?.solution_code || '');
    if (!solution.trim() || problem?.check_hardcoding === false) return false;

    const marker = newRunMarker();
    const b64 = Buffer.from(JSON.stringify({ solution, code: String(code || ''), marker }), 'utf8').toString('base64');
    const planRun = await runPythonScript({ code: `__PAYLOAD = "${b64}"\n${HARDCODE_PROBE_SOURCE}`, timeoutMs });
    const planLine = String(planRun.stdout || '').split('\n').filter((l) => l.startsWith(marker)).pop();
    let plan = null;
    try { plan = planLine ? JSON.parse(planLine.slice(marker.length)) : null; } catch { plan = null; }
    if (!plan?.ok) return false;

    const runTimeout = Math.min(timeoutMs, 3000);
    const original = await runForOutput({ source: solution, input, files, timeoutMs: runTimeout });
    if (!original.ok) return false;
    const learnerOriginal = flatOutput(actual);

    const candidates = [];
    if (String(input ?? '').trim()) {
        for (const changed of changedInputs(input)) candidates.push({ solution, code: String(code || ''), input: changed });
    }
    for (const variant of plan.variants || []) candidates.push({ ...variant, input });

    // What one change says: 'skip' (the solution's answer did not move, or it
    // broke), 'unshared' (it moved, but the learner's code has no such
    // literal), 'moved' (the learner's answer followed), 'stuck' (it did not).
    const judge = async (candidate) => {
        const changed = await runForOutput({ source: candidate.solution, input: candidate.input, files, timeoutMs: runTimeout });
        if (!changed.ok || changed.output === original.output) return 'skip';
        if (candidate.code == null) return 'unshared';
        const learner = await runForOutput({ source: candidate.code, input: candidate.input, files, timeoutMs: runTimeout });
        // Crashing on the changed data also shows the code reads the data.
        if (!learner.ok) return 'moved';
        // The literal itself is what got printed, so the change came straight
        // back out: `print(1)` ... `print(5)` shares the solution's 1. When
        // that is also what the solution does (`print("Hello, Python!")`) it
        // proves nothing either way.
        const echoed = candidate.from != null
            && learner.output === learnerOriginal.split(flatOutput(candidate.from)).join(flatOutput(candidate.to));
        if (learner.output === changed.output) return echoed ? 'echo' : 'moved';
        return learner.output !== learnerOriginal && !echoed ? 'moved' : 'stuck';
    };

    // A few at a time: each is two short Python processes, and this runs on
    // the same machine as the local model.
    const verdicts = [];
    const queue = candidates.slice(0, MAX_HARDCODE_RUNS / 2);
    await Promise.all(Array.from({ length: 3 }, async () => {
        while (queue.length) verdicts.push(await judge(queue.shift()));
    }));

    // One change the answer ignored outweighs the ones it followed: printing
    // "Positive" follows a change to the word "Positive" just as the real
    // answer does, but only the real answer notices the input turning negative.
    if (verdicts.includes('stuck')) return true;
    if (verdicts.includes('moved') || !verdicts.includes('unshared')) return false;

    // The answer depends on data the learner's code never mentions. That is
    // printing a constant only if the constant is the answer itself.
    const literals = new Set((plan.literals || []).map(flatOutput));
    const expectedLines = normalizeOutput(actual).split('\n').map(flatOutput).filter(Boolean);
    return literals.has(learnerOriginal) || expectedLines.some((line) => literals.has(line));
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
async function gradeSubmission({ problem, code, timeoutMs = 6000, files = {} }) {
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
        : gradeStdioProblem({ problem, code, timeoutMs, files });
}

module.exports = {
    gradeSubmission,
    screenUnverifiedSubmission,
    targetFunctionName,
    buildFunctionHarness,
    normalizeOutput,
    printsAnswerWithoutComputing,
    HARDCODED_MESSAGE,
    MARKER,
};
