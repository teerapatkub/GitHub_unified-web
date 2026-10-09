const { SELF_ITEM_IDS, activeSelfEffects } = require('./self-effects');
const { applyArcadeAttack } = require('./attacks');

// Both authenticated commands and bot decisions own the room lock and commit
// inventory, effects and money together. This is the shared item rule boundary.
async function useOwnedItem({ db, room, player, state, instanceId, targetName, phaseDeadlineMs }) {
  const index = state.inventory.findIndex(item => item.instance_id === instanceId);
  if (index < 0) throw Object.assign(new Error('คุณไม่มีไอเทมชิ้นนี้'), { status: 409 });
  const item = state.inventory[index];
  let result = null;
  if (SELF_ITEM_IDS.includes(item.id)) {
    const effectNow = Date.now();
    if (targetName != null) throw Object.assign(new Error('ไอเทมนี้ใช้กับตนเองเท่านั้น'), { status: 409 });
    state.self_effects = activeSelfEffects(state.self_effects, room.phase, effectNow);
    if (state.self_effects.some(effect => effect.type === item.id)) throw Object.assign(new Error('เอฟเฟกต์นี้กำลังทำงานอยู่'), { status: 409 });
    state.self_effects.push({ type: item.id, instance_id: item.instance_id, phase: room.phase,
      expiresAt: item.id === 'shield' ? effectNow + 99999999 : phaseDeadlineMs });
  } else {
    result = await applyArcadeAttack({ db, room, player, item, targetName });
  }
  state.inventory.splice(index, 1);
  return result;
}
module.exports = { useOwnedItem };
