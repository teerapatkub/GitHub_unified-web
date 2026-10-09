const config = require('../../shared/arcadeConfig.json');
const { activeSelfEffects } = require('./self-effects');
const { readPhaseClock } = require('./phase-clock');

function rejectAttack(message) {
  throw Object.assign(new Error(message), { status: 409 });
}

function activeAttackEffects(effects, phase, now) {
  return (effects || []).filter(effect => effect.phase === phase && effect.expiresAt > now);
}

// The caller owns the room lock. Affected players are locked in ID order;
// no network or grading work occurs in this transaction.
async function applyArcadeAttack({ db, room, player, item, targetName }) {
  const definition = config.shopItems.find(candidate => candidate.id === item.id);
  const isTax = item.id === 'taxCollection';
  if (!definition || (!['attack', 'aoe'].includes(definition.type) && !isTax)) rejectAttack('ไอเทมโจมตีไม่ถูกต้อง');
  const [participants] = await db.query('SELECT * FROM arcade_participants WHERE room_id = ? AND match_id = ? ORDER BY id FOR UPDATE', [room.room_id, room.current_match_id]);
  const clock = await readPhaseClock(db, room.room_id);
  if (!clock?.isOpen) rejectAttack('หมดเวลาของรอบนี้แล้ว');
  const opponents = participants.filter(p => p.id !== player.id && !p.is_eliminated);
  let targets;
  if (isTax) {
    if (targetName != null) rejectAttack('เซิร์ฟเวอร์เป็นผู้เลือกเป้าหมายที่มีเงินมากที่สุด');
    targets = opponents.sort((a, b) => b.cash - a.cash || a.id - b.id).slice(0, 1);
  } else if (definition.type === 'aoe') {
    if (targetName != null) rejectAttack('เซิร์ฟเวอร์เป็นผู้เลือกเป้าหมายของไอเทมวงกว้าง');
    targets = opponents;
  } else {
    targets = opponents.filter(p => p.user_name === targetName);
  }
  if (!targets.length) rejectAttack('เป้าหมายไม่อยู่ในแมตช์หรือถูกคัดออกแล้ว');

  // All targets of one AOE share one activation instant. Capture it only after
  // validation/participant reads so hosted-database latency does not consume
  // most of the visible effect duration.
  const effectStartedAt = Date.now();
  const results = [];
  for (const target of targets) {
    // Keep one lifetime for every target hit by the same AOE activation.
    const effectNow = effectStartedAt;
    await db.query('INSERT INTO arcade_shop_states (match_id, user_name) VALUES (?, ?) ON CONFLICT DO NOTHING', [room.current_match_id, target.user_name]);
    const [[state]] = await db.query('SELECT * FROM arcade_shop_states WHERE match_id = ? AND user_name = ? FOR UPDATE', [room.current_match_id, target.user_name]);
    state.self_effects = activeSelfEffects(state.self_effects, room.phase, effectNow);
    state.attack_effects = activeAttackEffects(state.attack_effects, room.phase, effectNow);
    if (definition.type === 'attack' && state.attack_effects.length) rejectAttack('เป้าหมายกำลังติดเอฟเฟกต์ กรุณาเลือกคนอื่น');
    const shieldIndex = state.self_effects.findIndex(effect => effect.type === 'shield');
    const blocked = shieldIndex >= 0;
    let stolen = 0;
    if (blocked) {
      state.self_effects.splice(shieldIndex, 1);
    } else if (item.id === 'cashSteal' || isTax) {
      stolen = isTax ? Math.floor(Math.max(0, target.cash) * config.cashSteal.taxPercent)
        : Math.min(config.cashSteal.flatAmount, Math.max(0, target.cash));
      player.cash += stolen;
      await db.query('UPDATE arcade_participants SET cash = cash - ? WHERE id = ?', [stolen, target.id]);
    } else {
      const duration = config.effectDurations[item.id];
      if (!duration) rejectAttack('ไม่พบกติกาของไอเทมนี้');
      state.attack_effects = state.attack_effects.filter(effect => effect.type !== item.id);
      state.attack_effects.push({ type: item.id, phase: room.phase, instance_id: item.instance_id,
        attacker: player.user_name, expiresAt: Math.min(effectNow + duration, clock.deadlineMs) });
    }
    await db.query(`UPDATE arcade_shop_states SET self_effects = ?, attack_effects = ?, revision = revision + 1
      WHERE match_id = ? AND user_name = ?`, [JSON.stringify(state.self_effects), JSON.stringify(state.attack_effects), room.current_match_id, target.user_name]);
    if (target.participant_kind === 'bot' && !blocked) {
      await db.query("UPDATE arcade_participants SET bot_state = bot_state || ?::jsonb WHERE id = ?",
        [JSON.stringify({ revengeTarget: player.user_name }), target.id]);
    }
    results.push({ name: target.user_name, blocked, stolen });
  }
  return { item: item.id, targets: results };
}

module.exports = { applyArcadeAttack, activeAttackEffects };
