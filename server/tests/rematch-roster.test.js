const { test } = require('node:test');
const assert = require('node:assert/strict');
const { rematchRoster } = require('../arcade/match-api');

test('rematch roster includes only humans who explicitly chose to remain', () => {
  const participants = [
    { user_name: 'alice', participant_kind: 'human', match_id: null },
    { user_name: 'bob', participant_kind: 'human', match_id: 7 },
    { user_name: 'Bot_1', participant_kind: 'bot', match_id: 7 },
  ];

  assert.deepEqual(
    rematchRoster({ current_match_id: 7 }, { ended_at: new Date() }, participants)
      .map(participant => participant.user_name),
    ['alice', 'Bot_1']
  );
});

test('first match includes every room participant', () => {
  const participants = [
    { user_name: 'alice', participant_kind: 'human', match_id: null },
    { user_name: 'bob', participant_kind: 'human', match_id: null },
  ];

  assert.equal(rematchRoster({ current_match_id: null }, null, participants).length, 2);
});
