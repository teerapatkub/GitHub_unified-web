const { randomUUID } = require('node:crypto');
const config = require('../../shared/arcadeConfig.json');
const profiles = require('../../shared/arcadeBotProfiles.json');
const { activeSelfEffects } = require('./self-effects');
const { activeAttackEffects } = require('./attacks');
const { useOwnedItem } = require('./use-item');
const { readPhaseClock } = require('./phase-clock');

function buyForBot(player, state, profile, random) {
  if (state.inventory.length >= config.maxInventory || random() >= profile.attackChance) return;
  const affordable = config.shopItems.filter(item => item.price <= player.cash
    && (item.type !== 'aoe' || state.inventory.filter(i => i.type === 'aoe').length < config.maxAoeHeld));
  const favorites = affordable.filter(item => profile.favoriteItems.includes(item.id));
  const choices = favorites.length ? favorites : affordable;
  if (!choices.length) return;
  const item = choices[Math.floor(random() * choices.length)];
  player.cash -= item.price;
  state.inventory.push({ ...item, instance_id: randomUUID() });
}

async function useForBot(db, room, player, state, memory, now, phaseDeadlineMs, random) {
  if (random() >= 0.6) return;
  const [opponents] = await db.query(`SELECT p.*, s.attack_effects FROM arcade_participants p
    LEFT JOIN arcade_shop_states s ON s.match_id = p.match_id AND s.user_name = p.user_name
    WHERE p.room_id = ? AND p.match_id = ? AND p.id <> ? AND p.is_eliminated = 0 ORDER BY p.score DESC, p.id`,
  [room.room_id, room.current_match_id, player.id]);
  for (const item of state.inventory) {
    if (activeSelfEffects(state.self_effects, room.phase, now).some(e => e.type === item.id)) continue;
    let targetName;
    if (item.type === 'attack') {
      // A player who has submitted has a locked editor, so a debuff on them
      // is wasted. Aim at someone still typing.
      const eligible = opponents.filter(p => !p.has_submitted
        && !activeAttackEffects(p.attack_effects, room.phase, now).length);
      const revenge = memory.revengeTarget && random() < 0.8
        ? eligible.find(p => p.user_name === memory.revengeTarget) : null;
      targetName = (revenge || eligible[0])?.user_name;
      if (!targetName) continue;
    } else if ((item.type === 'aoe' || item.id === 'taxCollection') && !opponents.length) continue;
    await useOwnedItem({ db, room, player, state, instanceId: item.instance_id, targetName, now, phaseDeadlineMs });
    break;
  }
}

// A bot's progress bar is what its round score is read from (phase-finalizer):
// the moment it reaches 100% is the bot's "submission time", and a bar that
// never gets there passes only its share of the cases. Fog and Freeze stop the
// bar, so they now cost a bot points the way they cost a human.
//
// 14-24 typing steps per round (avg 19) puts an unattacked bot's finish near
// mid-round on average, which keeps its score where the old random submission
// time put it (uniform over the round). Pacing the old 22-34 steps against the
// bar would have made every bot ~10% weaker without anyone attacking it.
const BOT_MIN_STEPS = 14;
const BOT_STEP_SPREAD = 11;

// A Quick Mode round is half as long, so each typing step is too: the bar
// fills in the same share of the round either way. Paced at full length, a
// bot's bar almost never reached 100% in a 30-second round.
function roundPaceScale(room) {
  const durations = room.round_duration_mode === 'quick' ? config.quickModePhaseDurations : config.phaseDurations;
  return durations[room.phase] / config.phaseDurations[room.phase];
}

function advanceProgress(memory, stepMs, now) {
  const before = memory.progress || 0;
  if (before >= 100) return;
  const steps = Math.floor((now - memory.lastProgress) / stepMs);
  const startedAt = memory.lastProgress;
  memory.lastProgress += steps * stepMs;
  // Tolerate float drift: 22 steps of 100/22 must land on 100, not 99.999.
  if (before + steps * 100 / memory.stepsToFinish >= 100 - 1e-9) {
    memory.progress = 100;
    // Ticks are a second apart; stamp the step that actually filled the bar.
    memory.finishedAt = startedAt + Math.ceil((100 - before) * memory.stepsToFinish / 100 - 1e-9) * stepMs;
  } else {
    memory.progress = before + steps * 100 / memory.stepsToFinish;
  }
}

// Persist decision clocks under the same room lock as settlement and human
// commands. Extra workers, restarts and disconnected browsers cannot replay a turn.
async function tickArcadeBots(db, roomId, random = Math.random) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[room]] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [roomId]);
    const clock = await readPhaseClock(connection, roomId);
    if (!room || room.status !== 'PLAYING' || !clock?.isOpen || !/^(ROUND_[1-4]|SHOP_[1-3])$/.test(room.phase)) {
      await connection.rollback();
      return;
    }
    const [participants] = await connection.query('SELECT * FROM arcade_participants WHERE room_id = ? AND match_id = ? ORDER BY id FOR UPDATE', [roomId, room.current_match_id]);
    const now = clock.nowMs;
    for (const initial of participants.filter(p => p.participant_kind === 'bot' && !p.is_eliminated)) {
      // Earlier bots in this transaction may have stolen this bot's money or
      // removed its shield. Read each actor fresh before deciding its turn.
      const [[player]] = await connection.query('SELECT * FROM arcade_participants WHERE id = ?', [initial.id]);
      const profile = profiles.find(p => p.id === player.bot_profile);
      if (!profile) throw new Error('Unknown Arcade bot profile');
      await connection.query('INSERT INTO arcade_shop_states (match_id,user_name) VALUES (?,?) ON CONFLICT DO NOTHING', [room.current_match_id, player.user_name]);
      const [[state]] = await connection.query('SELECT * FROM arcade_shop_states WHERE match_id = ? AND user_name = ? FOR UPDATE', [room.current_match_id, player.user_name]);
      const memory = player.bot_state;
      if (memory.phase !== room.phase) {
        memory.phase = room.phase;
        memory.progress = 0;
        memory.stepsToFinish = BOT_MIN_STEPS + Math.floor(random() * BOT_STEP_SPREAD);
        memory.lastProgress = now;
        delete memory.finishedAt;
      }
      const effects = activeAttackEffects(state.attack_effects, room.phase, now);
      const frozen = effects.some(e => e.type === 'timeFreeze' || e.type === 'inkFog');
      if (frozen) memory.lastProgress = now;
      else {
        if (room.phase.startsWith('ROUND_')) advanceProgress(memory, profile.typingSpeedMs * roundPaceScale(room), now);
        if (room.phase.startsWith('SHOP_') && now - (memory.lastBuy || 0) >= config.botBuyAttemptIntervalMs) {
          memory.lastBuy = now;
          buyForBot(player, state, profile, random);
        }
        if (/^ROUND_[2-4]$/.test(room.phase) && now - (memory.lastUse || 0) >= config.botItemUseIntervalMs) {
          memory.lastUse = now;
          await useForBot(connection, room, player, state, memory, now, clock.deadlineMs, random);
        }
      }
      await connection.query('UPDATE arcade_shop_states SET inventory = ?, self_effects = ?, revision = revision + 1 WHERE match_id = ? AND user_name = ?',
        [JSON.stringify(state.inventory), JSON.stringify(state.self_effects), room.current_match_id, player.user_name]);
      await connection.query('UPDATE arcade_participants SET cash = ?, bot_state = ? WHERE id = ?', [player.cash, JSON.stringify(memory), player.id]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
module.exports = { tickArcadeBots };
