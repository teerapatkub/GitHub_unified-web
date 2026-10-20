import test from 'node:test';
import assert from 'node:assert/strict';

import { placeBubble, unionRect, visibleSteps, TOUR_MARGIN, TOUR_GAP } from './tourLayout.js';

const viewport = { width: 1280, height: 800 };
const bubble = { width: 320, height: 200 };

test('the bubble sits below its target, centred on it', () => {
  const place = placeBubble({ left: 600, top: 20, width: 80, height: 40 }, bubble, viewport);
  assert.equal(place.side, 'bottom');
  assert.equal(place.top, 60 + TOUR_GAP);
  assert.equal(place.left, 640 - 160);
});

test('a target near the bottom edge gets its bubble above it', () => {
  const place = placeBubble({ left: 600, top: 700, width: 80, height: 40 }, bubble, viewport);
  assert.equal(place.side, 'top');
  assert.equal(place.top, 700 - TOUR_GAP - 200);
});

test('a target at the screen edge never pushes the bubble off screen', () => {
  assert.equal(placeBubble({ left: 0, top: 20, width: 40, height: 40 }, bubble, viewport).left, TOUR_MARGIN);
  assert.equal(placeBubble({ left: 1250, top: 20, width: 30, height: 40 }, bubble, viewport).left, 1280 - 320 - TOUR_MARGIN);
});

test('no target means the middle of the screen', () => {
  assert.deepEqual(placeBubble(null, bubble, viewport), { side: 'center', left: 480, top: 300 });
});

test('a tall target is flanked instead, and a phone-sized screen still fits', () => {
  assert.equal(placeBubble({ left: 100, top: 100, width: 200, height: 600 }, bubble, viewport).side, 'right');
  const phone = placeBubble({ left: 0, top: 100, width: 375, height: 600 }, bubble, { width: 375, height: 812 });
  assert.ok(phone.left >= TOUR_MARGIN && phone.top >= TOUR_MARGIN);
  assert.ok(phone.top + 200 <= 812 - TOUR_MARGIN);
});

test('steps whose element is missing or hidden are skipped; steps without a target stay', () => {
  const rects = { '#shown': { left: 0, top: 0, width: 10, height: 10 }, '#hidden': { left: 0, top: 0, width: 0, height: 0 } };
  const steps = [{ id: 'welcome' }, { id: 'a', target: '#shown' }, { id: 'b', target: '#hidden' }, { id: 'c', target: '#gone' },
    { id: 'pair', target: ['#gone', '#shown'] }];
  assert.deepEqual(visibleSteps(steps, (s) => rects[s] || null).map((s) => s.id), ['welcome', 'a', 'pair']);
});

test('two neighbouring buttons light up as one spot', () => {
  assert.deepEqual(unionRect([{ left: 10, top: 5, width: 20, height: 10 }, { left: 40, top: 0, width: 20, height: 20 }]),
    { left: 10, top: 0, width: 50, height: 20 });
});
