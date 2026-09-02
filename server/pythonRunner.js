// server/pythonRunner.js
//
// Running a learner's Python in a child process, with a timeout and a temp
// directory that always gets cleaned up.
//
// This was written for the Competitive Arena and lived inline in server.js. It
// is a module now because the merged problem grader needs the same thing, and
// two copies of "spawn python, feed stdin, kill it after N seconds" is exactly
// how the five different answer-checkers in this project came about.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

// Trailing whitespace and \r\n differences are not wrong answers.
const normalizeOutput = (value = '') => String(value ?? '').replace(/\r\n/g, '\n').trim();

// Most problems state one exact answer. A few cannot: Competitive Arena's
// "Password Generator" asks for a random 4-digit PIN, so its stored expected
// value is the pattern `regexp:\d{4}` instead of a literal. The prefix is a
// convention the data has used since before the merge, and nothing in the code
// had ever implemented it - so those problems compared a real answer against
// the literal string "regexp:..." and could never be passed.
//
// Lives here rather than in the grader because BOTH callers need it: the lesson
// and mini-game grader goes through runPythonCase, and so does Competitive
// Arena's own test runner.
const EXPECTED_PATTERN_PREFIX = 'regexp:';

const matchesExpected = (actual, expected) => {
    const want = String(expected ?? '');
    if (!want.startsWith(EXPECTED_PATTERN_PREFIX)) {
        return actual === normalizeOutput(want);
    }
    const source = want.slice(EXPECTED_PATTERN_PREFIX.length).trim();
    try {
        return new RegExp(source).test(actual);
    } catch {
        // A pattern that does not compile is a broken problem. Reject, so it
        // shows up as a problem nobody can pass rather than one everybody
        // passes without writing anything.
        return false;
    }
};

const resolvePythonBin = () => {
    const configuredPython = process.env.PYTHON_BIN || process.env.PYTHON;
    if (configuredPython) return configuredPython;

    const bundledPython = path.join(
        os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime',
        'dependencies', 'python', 'python.exe'
    );

    if (fs.existsSync(bundledPython)) return bundledPython;
    return 'python';
};

/**
 * Run a script and hand back whatever it printed. Never rejects: a crash, a
 * syntax error and a timeout all come back as a resolved result with `error`
 * set, because every caller here wants to score the attempt rather than fail
 * the request.
 */
const runPythonScript = ({ code, input = '', timeoutMs = 4000, files = {}, mainFileName = 'solution.py' }) => new Promise((resolve) => {
    const pythonBin = resolvePythonBin();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pysim-run-'));
    // Extra files let a caller run the learner's code as its OWN module rather
    // than pasted into a bigger script. That is what keeps the line numbers in
    // an error message the same as the ones in the learner's editor.
    for (const [name, contents] of Object.entries(files || {})) {
        fs.writeFileSync(path.join(tempDir, path.basename(name)), String(contents ?? ''), 'utf8');
    }
    const filePath = path.join(tempDir, mainFileName);
    fs.writeFileSync(filePath, String(code || ''), 'utf8');

    const cleanup = () => fs.rm(tempDir, { recursive: true, force: true }, () => {});

    let child;
    try {
        child = spawn(pythonBin, [filePath], {
            cwd: tempDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
            env: {
                ...process.env,
                // Without this, Python encodes stdout with the console codepage,
                // and on Windows that cannot represent Thai: every problem whose
                // answer prints Thai died with UnicodeEncodeError and produced
                // empty output, which grades as a wrong answer. This project's
                // problems are largely Thai, so it is not an edge case.
                PYTHONIOENCODING: 'utf-8',
                PYTHONUTF8: '1',
            },
        });
    } catch (error) {
        cleanup();
        resolve({ stdout: '', stderr: '', exitCode: null, error: `Python runner failed (${pythonBin}): ${error.message}`, timedOut: false });
        return;
    }

    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve(result);
    };

    const timer = setTimeout(() => {
        child.kill();
        finish({ stdout, stderr, exitCode: null, error: 'Execution timed out', timedOut: true });
    }, timeoutMs);

    // A correct answer prints a handful of lines. Output anywhere near this size
    // is a runaway `print` loop, and letting the buffers grow without a ceiling
    // lets one submission exhaust the server's memory in the few seconds before
    // the timeout fires - the timeout bounds TIME, not memory. When the ceiling
    // is hit we stop the program early rather than wait it out, and report it as
    // a beginner-readable Thai message, not a wrong answer with silent empty
    // output.
    const MAX_OUTPUT_BYTES = 256 * 1024;
    let outputBytes = 0;
    let outputCapped = false;
    const appendOutput = (stream, chunk) => {
        if (outputCapped) return;
        const text = chunk.toString();
        outputBytes += Buffer.byteLength(text, 'utf8');
        if (stream === 'out') stdout += text; else stderr += text;
        if (outputBytes >= MAX_OUTPUT_BYTES) {
            outputCapped = true;
            try { child.kill(); } catch { /* already gone; close/error reports it */ }
            finish({
                stdout,
                stderr,
                exitCode: null,
                error: 'โปรแกรมพิมพ์ผลลัพธ์ออกมามากเกินไป อาจเกิดจากลูปที่ทำงานวนไม่รู้จบ',
                timedOut: true,
            });
        }
    };

    child.stdout.on('data', (chunk) => appendOutput('out', chunk));
    child.stderr.on('data', (chunk) => appendOutput('err', chunk));
    child.on('error', (error) => {
        finish({ stdout, stderr, exitCode: null, error: `Python runner failed (${pythonBin}): ${error.message}`, timedOut: false });
    });
    child.on('close', (code) => {
        // Whether the program FAILED is the exit status, not whether it wrote
        // anything to stderr. Python puts warnings there too, and a learner may
        // print their own debugging there, neither of which makes a correct
        // answer wrong. `error` still carries the traceback when the program
        // really did fail, because that is what the learner needs to read.
        const exitCode = Number.isInteger(code) ? code : 0;
        finish({
            stdout,
            stderr,
            exitCode,
            error: exitCode === 0 ? '' : (stderr.trim() || `โปรแกรมจบด้วยรหัส ${exitCode}`),
            timedOut: false,
        });
    });

    try {
        child.stdin.write(String(input || ''));
        if (!String(input || '').endsWith('\n')) child.stdin.write('\n');
        child.stdin.end();
    } catch {
        // The process can already be gone; the close/error handler reports it.
    }
});

/**
 * One stdin/stdout test case. Kept with the exact result shape the Competitive
 * Arena already builds its feedback from.
 */
const runPythonCase = async ({ code, input, expected, timeoutMs = 4000, files, mainFileName }) => {
    const run = await runPythonScript({ code, input, timeoutMs, files, mainFileName });
    const actual = normalizeOutput(run.stdout);
    // A case passes when the program finished cleanly AND printed the expected
    // output. Both halves matter: `passed` used to be gated on stderr being
    // empty, which failed correct answers that emitted a warning, and it never
    // looked at the exit status at all, so a program that printed the right
    // thing and then crashed was counted as passing.
    const ranCleanly = !run.timedOut && run.exitCode === 0;
    return {
        input,
        expected,
        actual,
        stderr: run.stderr || '',
        error: run.error || '',
        passed: ranCleanly && matchesExpected(actual, expected),
    };
};

module.exports = { normalizeOutput, matchesExpected, resolvePythonBin, runPythonScript, runPythonCase };
