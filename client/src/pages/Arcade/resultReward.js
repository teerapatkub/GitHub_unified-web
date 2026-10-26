// What the result screen says the account received for this match (A10).
// Prefers the server receipt (viewer_reward on the room poll), which adds the
// achievements the match unlocked and, for a player who was out, the coins for
// guessing the last survivor right (Spec 0005 #24); falls back to the
// participant row's coins_awarded until the receipt arrives.
export function resultCoinBreakdown(viewerReward, myRow) {
  const matchCoins = Number(viewerReward?.coins ?? myRow?.coins_awarded ?? 0) || 0;
  const guessCoins = Number(viewerReward?.guess_coins ?? 0) || 0;
  const achievements = (viewerReward?.achievements || [])
    .filter(a => Number(a.reward) > 0)
    .map(a => ({ name: a.name, reward: Number(a.reward) }));
  const total = matchCoins + guessCoins + achievements.reduce((sum, a) => sum + a.reward, 0);
  return { matchCoins, guessCoins, achievements, total, achievementsPending: Boolean(viewerReward) && viewerReward.achievements == null };
}
