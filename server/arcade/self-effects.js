const SELF_ITEM_IDS = ['shield', 'scoreMultiplier', 'aiHelper'];

function activeSelfEffects(effects, phase, now) {
  if (phase === 'LOBBY' || phase === 'RESULT') return [];
  return (effects || []).filter(effect => effect.expiresAt > now
    && (effect.type === 'shield' || effect.phase === phase));
}

// Both the shop and submission callers hold the room lock before reading state.
async function verifiedMultiplier(db, matchId, username, phase, receivedAt) {
  const [[state]] = await db.query('SELECT self_effects FROM arcade_shop_states WHERE match_id = ? AND user_name = ?', [matchId, username]);
  return activeSelfEffects(state?.self_effects, phase, new Date(receivedAt).getTime())
    .some(effect => effect.type === 'scoreMultiplier') ? 1 : 0;
}

module.exports = { SELF_ITEM_IDS, activeSelfEffects, verifiedMultiplier };
