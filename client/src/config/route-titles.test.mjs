import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleForPath } from './routeTitles.js';

test('each page gets its own title ending in PyArena', () => {
  assert.equal(titleForPath('/learn', 'th'), 'บทเรียน · PyArena');
  assert.equal(titleForPath('/shop', 'en'), 'Shop · PyArena');
  assert.notEqual(titleForPath('/leaderboard', 'th'), titleForPath('/achievements', 'th'));
});

test('the most specific route wins', () => {
  assert.equal(titleForPath('/matchmaking/history', 'th'), 'ประวัติการเล่น Arcade · PyArena');
  assert.equal(titleForPath('/matchmaking', 'th'), 'Arcade · PyArena');
  assert.equal(titleForPath('/lesson/3', 'en'), 'Lesson · PyArena');
});

test('a prefix only matches whole path segments, and unknown pages fall back to the site name', () => {
  assert.equal(titleForPath('/learning-extra', 'th'), 'PyArena');
  assert.equal(titleForPath('/', 'th'), 'PyArena');
  assert.doesNotMatch(titleForPath('/learn', 'th'), /Python Coder Game/);
});
