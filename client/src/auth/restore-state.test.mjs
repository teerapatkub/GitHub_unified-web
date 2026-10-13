import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthRestorer } from './restore-state.js';

for (const role of ['user', 'admin']) {
  test(`late auth response cannot restore a signed-out ${role}`, async () => {
    let completeRequest;
    const events = [];
    const restorer = createAuthRestorer({
      fetchPlayer: () => new Promise(resolve => { completeRequest = resolve; }),
      onPlayer: player => events.push(player),
      onError: () => {},
      onReady: () => {},
    });
    const pending = restorer.restore();
    restorer.signedOut();
    completeRequest({ username: 'pong', role });
    await pending;
    assert.deepEqual(events, [null]);
  });
}
