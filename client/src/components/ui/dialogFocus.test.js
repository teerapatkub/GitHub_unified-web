import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapTabIndex } from './dialogFocus.js';

test('Tab on the last control wraps to the first, Shift+Tab on the first wraps to the last', () => {
  assert.equal(wrapTabIndex(2, 3, false), 0);
  assert.equal(wrapTabIndex(0, 3, true), 2);
});

test('Tab between inner controls is left to the browser', () => {
  assert.equal(wrapTabIndex(0, 3, false), null);
  assert.equal(wrapTabIndex(2, 3, true), null);
});

test('focus outside the dialog is pulled back in', () => {
  assert.equal(wrapTabIndex(-1, 3, false), 0);
  assert.equal(wrapTabIndex(-1, 3, true), 2);
});

test('a dialog with nothing focusable traps nothing', () => {
  assert.equal(wrapTabIndex(-1, 0, false), null);
});
