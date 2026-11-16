// server/debugLab.js
//
// Turns a bank problem into a Debug Lab task: the learner gets the reference
// solution with one real bug in it, and has to find and fix it (fix list
// item 3, 2026-11-12).
//
// bug-mutator.py writes the candidate bugs. A candidate is handed out only if
// it runs to the end without an error AND prints a wrong answer on the
// problem's own test cases - a bug that crashes is a traceback to read, not a
// logic slip to find, and one that changes nothing is not a bug at all (the
// failure the model-written bugs had: 14 of 15 changed nothing, 2026-10-27).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { runPythonScript } = require('./pythonRunner');
const { gradeSubmission } = require('./problemGrader');

const MUTATOR_SOURCE = fs.readFileSync(path.join(__dirname, 'bug-mutator.py'), 'utf8');

const writeCandidateBugs = async (solution) => {
    const marker = `__PYSIM_BUGS_${crypto.randomBytes(12).toString('hex')}__`;
    const b64 = Buffer.from(JSON.stringify({ solution: String(solution || ''), marker }), 'utf8').toString('base64');
    const run = await runPythonScript({ code: `__PAYLOAD = "${b64}"\n${MUTATOR_SOURCE}`, timeoutMs: 5000 });
    const line = String(run.stdout || '').split('\n').filter((l) => l.startsWith(marker)).pop();
    try {
        const parsed = line ? JSON.parse(line.slice(marker.length)) : null;
        return parsed?.ok ? parsed : null;
    } catch {
        return null;
    }
};

const shuffled = (items, random) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

/**
 * One buggy version of `solution` that runs cleanly and fails `testCases`.
 *
 * @returns {Promise<{code:string, kind:string}|null>} null when no bug of the
 *          kinds the mutator knows changes this problem's answer.
 */
async function plantBug({ solution, testCases, random = Math.random, maxTries = 8 }) {
    const planned = await writeCandidateBugs(solution);
    if (!planned || planned.mutants.length === 0) return null;

    const problem = { test_kind: 'stdio', test_cases: testCases };
    // The mutator re-prints the solution, so the learner's fix is checked
    // against the same formatting the bug arrived in. It must still pass.
    const fixed = await gradeSubmission({ problem, code: planned.original, timeoutMs: 3000 });
    if (!fixed.allPassed) return null;

    for (const mutant of shuffled(planned.mutants, random).slice(0, maxTries)) {
        const verdict = await gradeSubmission({ problem, code: mutant.code, timeoutMs: 3000 });
        const ranCleanly = !verdict.error && (verdict.results || []).every((r) => !r.error);
        if (ranCleanly && !verdict.allPassed) return { code: mutant.code, kind: mutant.kind };
    }
    return null;
}

module.exports = { plantBug };
