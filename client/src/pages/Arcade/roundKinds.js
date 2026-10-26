// Round kinds on the client (server/arcade/round-kinds.js, ADR 0010). The room
// carries the kind of each of its four rounds; a match from before round kinds
// has none and every round was "write".
export const ROUND_KINDS = ['write', 'fix', 'predict', 'review'];
// Answered by tapping an option instead of sending code.
export const isChoiceKind = kind => kind === 'predict' || kind === 'review';
export const ROUND_FORMATS = ['mixed', 'classic'];

const LABEL_KEYS = { write: 'roundKindWrite', fix: 'roundKindFix', predict: 'roundKindPredict', review: 'roundKindReview' };

export function roundKindOf(room, roundNum) {
  const kind = Array.isArray(room?.round_kinds) ? room.round_kinds[roundNum - 1] : undefined;
  return ROUND_KINDS.includes(kind) ? kind : 'write';
}

export const roundKindLabelKey = kind => LABEL_KEYS[kind] || LABEL_KEYS.write;

// The round about to start while a room is between rounds (SUMMARY_n, SHOP_n),
// so players can plan their shopping around it. null at any other time.
export function nextRoundKind(room) {
  const match = /^(SUMMARY|SHOP)_([1-3])$/.exec(room?.phase || '');
  return match ? roundKindOf(room, Number(match[2]) + 1) : null;
}

// The round being played (ROUND_n), or 0.
export function playingRound(phase) {
  const match = /^ROUND_([1-4])$/.exec(phase || '');
  return match ? Number(match[1]) : 0;
}
