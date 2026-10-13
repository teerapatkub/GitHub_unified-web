const test = require('node:test');
const assert = require('node:assert/strict');
const { gradeMiniGameSubmission } = require('../miniGameGrader');

test('the shared server verdict checks hidden story cases with provided files', async () => {
  const cases = [{ input: 'Ada', expected: 'สวัสดี Ada', forbidden_any: ['debug'] }];
  const files = { 'math_util.py': 'def greet(name):\n    return "สวัสดี " + name\n' };
  const accepted = await gradeMiniGameSubmission('from math_util import greet\nprint(greet(input()))', cases, files);
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.passed, 1);
  const missing = await gradeMiniGameSubmission('from math_util import greet\nprint(greet(input()))', cases);
  assert.equal(missing.accepted, false);
  const empty = await gradeMiniGameSubmission('', cases, files);
  assert.equal(empty.accepted, false);
});

test('forbidden output, a crash, and embedded numeric output cannot pass', async () => {
  const storyCase = [{ input: '', expected_any: ['พร้อม'], forbidden_any: ['debug'] }];
  assert.equal((await gradeMiniGameSubmission('print("พร้อม debug")', storyCase)).accepted, false);
  assert.equal((await gradeMiniGameSubmission('print("พร้อม")\nraise ValueError()', storyCase)).accepted, false);
  assert.equal((await gradeMiniGameSubmission('print(17)', [{ expected: '7' }])).accepted, false);
});
