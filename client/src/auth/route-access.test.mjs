import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessForRoute, leavesLoginPage, loginUrlFor, returnDestination } from './route-access.js';

test('the login page stays mounted on the return from Google, even for a bound player', () => {
  const player = { user_id: 142, level: 3, role: 'user' };
  assert.equal(leavesLoginPage({ user: player }), true);
  assert.equal(leavesLoginPage({ user: player, oauthReturn: true }), false, 'FriendLogin must still complete the OAuth sign-in');
  assert.equal(leavesLoginPage({ user: player, recovery: true }), false);
  assert.equal(leavesLoginPage({ user: { ...player, level: 0 } }), false);
  assert.equal(leavesLoginPage({ user: null }), false);
});

test('protected routes wait for authentication before redirecting', () => {
  assert.equal(accessForRoute({ ready: false, user: null, kind: 'student' }), 'waiting');
  assert.equal(accessForRoute({ ready: true, user: null, kind: 'student' }), 'login');
  assert.equal(accessForRoute({ ready: true, user: { isGuest: true }, kind: 'admin' }), 'login');
});

test('student, admin, and game routes share one access decision', () => {
  const student = { user_id: 1, level: 2, role: 'user' };
  const admin = { user_id: 2, level: 1, role: 'admin' };
  assert.equal(accessForRoute({ ready: true, user: student, kind: 'student' }), 'allow');
  assert.equal(accessForRoute({ ready: true, user: student, kind: 'admin' }), 'learn');
  assert.equal(accessForRoute({ ready: true, user: student, kind: 'game' }), 'locked');
  assert.equal(accessForRoute({ ready: true, user: admin, kind: 'student' }), 'admin');
  assert.equal(accessForRoute({ ready: true, user: admin, kind: 'admin' }), 'allow');
  assert.equal(accessForRoute({ ready: true, user: admin, kind: 'game' }), 'allow');
});

test('login URL retains the intended page after refresh and rejects external return paths', () => {
  const path = '/promotion-exam?stage=2#task';
  const loginUrl = loginUrlFor(path);
  assert.equal(returnDestination({ search: new URL(loginUrl, 'https://game.test').search }), path);
  assert.equal(returnDestination({ state: { from: '/achievements' }, search: '' }), '/achievements');
  assert.equal(returnDestination({ search: '?returnTo=https%3A%2F%2Fevil.test' }), null);
});
