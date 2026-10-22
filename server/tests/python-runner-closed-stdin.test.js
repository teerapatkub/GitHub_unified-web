// A program that exits without reading its input must not take the server
// down. Writing stdin to a process that has already gone fails with EPIPE as an
// asynchronous 'error' event on the pipe, which no try/catch around the write
// can catch; unhandled, Node ends the whole process. This crashed the test
// server mid-run on 2026-10-22, and would do the same to the real one for any
// answer like `exit()` sent against a test case with a long input.
const assert = require('node:assert/strict');
const test = require('node:test');
const { runPythonCase } = require('../pythonRunner');

test('an answer that exits before reading a long input is graded, not fatal', async () => {
  const input = 'x'.repeat(4 * 1024 * 1024);
  for (let i = 0; i < 5; i++) {
    const result = await runPythonCase({ code: 'import sys\nsys.exit(0)', input, expected: 'anything' });
    assert.equal(result.passed, false);
  }
});
