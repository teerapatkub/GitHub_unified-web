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
const runPythonScript = ({ code, input = '', timeoutMs = 4000 }) => new Promise((resolve) => {
    const pythonBin = resolvePythonBin();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pysim-run-'));
    const filePath = path.join(tempDir, 'solution.py');
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
        resolve({ stdout: '', stderr: '', error: `Python runner failed (${pythonBin}): ${error.message}`, timedOut: false });
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
        finish({ stdout, stderr, error: 'Execution timed out', timedOut: true });
    }, timeoutMs);

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
        finish({ stdout, stderr, error: `Python runner failed (${pythonBin}): ${error.message}`, timedOut: false });
    });
    child.on('close', () => {
        finish({ stdout, stderr, error: stderr.trim(), timedOut: false });
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
const runPythonCase = async ({ code, input, expected, timeoutMs = 4000 }) => {
    const run = await runPythonScript({ code, input, timeoutMs });
    const actual = normalizeOutput(run.stdout);
    return {
        input,
        expected,
        actual,
        error: run.error || '',
        passed: !run.error && actual === normalizeOutput(expected),
    };
};

module.exports = { normalizeOutput, resolvePythonBin, runPythonScript, runPythonCase };
