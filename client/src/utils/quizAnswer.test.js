import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeQuizAnswer, isQuizAnswerCorrect } from './quizAnswer.js';

test('normalizeQuizAnswer trims whitespace but preserves case', () => {
  assert.equal(normalizeQuizAnswer('  PYTHON  '), 'PYTHON');
  assert.equal(normalizeQuizAnswer('Python   '), 'Python');
});

test('isQuizAnswerCorrect requires exact casing for fill answers', () => {
  assert.equal(isQuizAnswerCorrect({ answer: 'Python' }, 'Python'), true);
  assert.equal(isQuizAnswerCorrect({ answer: 'Python' }, 'python'), false);
  assert.equal(isQuizAnswerCorrect({ answer: 'Hello' }, 'hello'), false);
  assert.equal(isQuizAnswerCorrect({ answer: 'PRINT(42)' }, ' PRINT(42) '), true);
});

test('isQuizAnswerCorrect requires exact casing for choice answers', () => {
  assert.equal(isQuizAnswerCorrect({ answer: 'True' }, 'True'), true);
  assert.equal(isQuizAnswerCorrect({ answer: 'True' }, 'true'), false);
  assert.equal(isQuizAnswerCorrect({ answer: 'list' }, 'list'), true);
});
