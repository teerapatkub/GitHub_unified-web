// When a player counts as a spectator, kept pure so it can be tested.
//
// `is_eliminated` on the participant row stays 1 after the match ends (the
// final ranking marks everyone below the winner) and until the player picks
// "remain", so the raw flag alone lit "โหมดผู้สังเกตการณ์" on the result screen
// of a player who finished second, and in the lobby afterwards (bug A3,
// user test 2026-10-25). Spectating only means something while the match is
// still being played: a coding round, its summary, or the shop between rounds.
const LIVE_MATCH_PHASE = /^(ROUND|SUMMARY|SHOP)_\d+$/;

export function isLiveMatchPhase(phase) {
  return LIVE_MATCH_PHASE.test(String(phase || ''));
}

export function isSpectating({ phase, eliminated }) {
  return Boolean(eliminated) && isLiveMatchPhase(phase);
}
