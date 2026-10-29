// A learner's program must not be able to take the server's memory. The
// timeout bounds TIME: `a = []` + `while True: a.append(...)` reached gigabytes
// inside the few seconds before it fired. On Linux (the Docker image) each run
// goes through `prlimit --as`, so it dies with MemoryError instead.
const assert = require('node:assert/strict');
const test = require('node:test');
const { pythonCommand, runPythonScript, MEMORY_LIMIT_MESSAGE } = require('../pythonRunner');

test('on Linux with prlimit a run is capped in memory and BLAS runs single-threaded', () => {
  const linux = pythonCommand({ pythonBin: '/venv/bin/python3', filePath: '/tmp/x/solution.py', platform: 'linux', prlimitPath: '/usr/bin/prlimit', memoryLimitMb: 512 });
  assert.equal(linux.command, '/usr/bin/prlimit');
  assert.deepEqual(linux.args, [`--as=${512 * 1024 * 1024}`, '/venv/bin/python3', '/tmp/x/solution.py']);
  assert.equal(linux.env.OPENBLAS_NUM_THREADS, '1');

  const windows = pythonCommand({ pythonBin: 'python', filePath: 'C:\\t\\solution.py', platform: 'win32', prlimitPath: null, memoryLimitMb: 512 });
  assert.equal(windows.command, 'python');
  assert.deepEqual(windows.args, ['C:\\t\\solution.py']);

  const off = pythonCommand({ pythonBin: 'python3', filePath: '/tmp/s.py', platform: 'linux', prlimitPath: '/usr/bin/prlimit', memoryLimitMb: 0 });
  assert.equal(off.command, 'python3', 'a limit of 0 turns the cap off');
});

test('a MemoryError is reported in plain Thai', async () => {
  const result = await runPythonScript({ code: 'raise MemoryError()' });
  assert.equal(result.error, MEMORY_LIMIT_MESSAGE);
});

test('a growing list is stopped by the memory cap, not left to eat the server (Linux only)', { skip: process.platform !== 'linux' }, async () => {
  const started = Date.now();
  const result = await runPythonScript({ code: 'a = []\nwhile True:\n    a.append("x" * 1000)', timeoutMs: 20000 });
  assert.equal(result.error, MEMORY_LIMIT_MESSAGE);
  assert.ok(Date.now() - started < 15000, 'stopped by memory, well before the timeout');
});
