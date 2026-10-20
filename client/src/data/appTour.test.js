import test from 'node:test';
import assert from 'node:assert/strict';

import { appTours, resolveTour, shouldAutoStartTour } from './appTour.js';

const learner = (level, seen = []) => ({ user_id: 1, role: 'user', level, tutorials_seen: seen });

test('a locked beginner hears the game modes are locked; an unlocked player is told to go in', () => {
  const locked = resolveTour('app-overview', learner(1), true).find((s) => s.id === 'game-modes');
  const open = resolveTour('app-overview', learner(10), true).find((s) => s.id === 'game-modes');
  assert.match(locked.body, /ปลดล็อกที่ LV\. 10/);
  assert.doesNotMatch(open.body, /ปลดล็อก/);
  assert.match(open.body, /กดเข้าไปดู/);
});

test('every step of every tour has text in both languages', () => {
  for (const id of Object.keys(appTours)) {
    for (const [user, isThai] of [[learner(1), true], [learner(10), false]]) {
      for (const step of resolveTour(id, user, isThai)) {
        assert.ok(step.title && step.body, `${id}/${step.id}`);
      }
    }
  }
});

test('the tour opens by itself only for a learner who finished the survey and has not seen it', () => {
  assert.equal(shouldAutoStartTour({ tourId: 'app-overview', user: learner(1) }), true);
  assert.equal(shouldAutoStartTour({ tourId: 'app-overview', user: learner(10, ['app-overview']) }), false);
  assert.equal(shouldAutoStartTour({ tourId: 'arcade-lobby', user: learner(10, ['app-overview']) }), true);
  assert.equal(shouldAutoStartTour({ tourId: 'app-overview', user: learner(0) }), false, 'survey still running');
  assert.equal(shouldAutoStartTour({ tourId: 'app-overview', user: { ...learner(5), role: 'admin' } }), false);
  assert.equal(shouldAutoStartTour({ tourId: 'app-overview', user: { user_id: 1, role: 'user', level: 3 } }), false,
    'profile not loaded yet');
  assert.equal(shouldAutoStartTour({ tourId: 'app-overview', user: null }), false);
});

test('a guest is remembered by this browser instead of the account', () => {
  const guest = { isGuest: true, level: 1 };
  assert.equal(shouldAutoStartTour({ tourId: 'app-overview', user: guest, seenLocally: [] }), true);
  assert.equal(shouldAutoStartTour({ tourId: 'app-overview', user: guest, seenLocally: ['app-overview'] }), false);
});
