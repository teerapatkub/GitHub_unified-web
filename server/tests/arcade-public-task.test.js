const { test } = require('node:test');
const assert = require('node:assert/strict');
const config = require('../../shared/arcadeConfig.json');
const { publicArcadeTask } = require('../arcade/public-task');

// Playtest 2026-10-17: after grading moved to the server (3b3521a) the task API
// stopped sending any test case, so the worked examples under each problem
// vanished and "ทดสอบโค้ด" could only say the code ran. The examples are meant
// to be public (exampleCasesShown); the rest of the cases must stay hidden.
const row = {
  task_id: 9, difficulty: 'easy', title_th: 'พาลินโดรม', title_en: 'Palindrome', desc_th: 'ไทย', desc_en: 'en',
  starter_code: 'def is_palindrome(s):\n    return None', hint_th: 'h', hint_en: 'h',
  solution_code: 'def is_palindrome(s): return s == s[::-1]', initial_code: 'secret',
  test_cases: [{ input: ['racecar'], output: true }, { input: ['python'], output: false }, { input: [''], output: true }],
};

test('a task sent to players carries only the configured example cases', () => {
  const task = publicArcadeTask(row);
  assert.equal(config.exampleCasesShown, 2);
  assert.deepEqual(task.example_cases, row.test_cases.slice(0, 2));
  assert.equal(task.example_count_hidden, 1);
  assert.equal(task.starter_code, row.starter_code);
});

test('a task sent to players never carries the answer or the hidden cases', () => {
  const task = publicArcadeTask(row);
  for (const key of ['solution_code', 'initial_code', 'test_cases']) assert.equal(Object.hasOwn(task, key), false, key);
  assert.equal(JSON.stringify(task).includes('""'), false);
});

test('a task whose cases are missing or malformed sends no examples', () => {
  assert.deepEqual(publicArcadeTask({ ...row, test_cases: null }).example_cases, []);
  assert.deepEqual(publicArcadeTask({ ...row, test_cases: '[not json' }).example_cases, []);
});
