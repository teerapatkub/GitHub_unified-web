import { test } from 'node:test';
import assert from 'node:assert/strict';
import { returnPath } from './return-path.js';

test('returns to a protected path with its query and fragment after login', () => {
  assert.equal(returnPath('/promotion-exam?stage=2#task'), '/promotion-exam?stage=2#task');
  assert.equal(returnPath('/achievements'), '/achievements');
});

test('ignores external destinations and the login page', () => {
  for (const value of ['https://example.test', '//example.test', '/\\example.test', '/login', '/login?next=/', null]) {
    assert.equal(returnPath(value), null);
  }
});
