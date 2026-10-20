const { randomUUID } = require('node:crypto');
const config = require('../../shared/arcadeConfig.json');
const profiles = require('../../shared/arcadeBotProfiles.json');
const { activeSelfEffects } = require('./self-effects');
const { activeAttackEffects } = require('./attacks');
const { useOwnedItem } = require('./use-item');
const { readPhaseClock } = require('./phase-clock');
const coder = require('./bot-coder');
const { loadArcadeProblem } = require('./round-problem');

// ---- Shopping and attacking with a plan --------------------------------------
//
// A bot reads the standings the way a player does: who is close to it around
// the next elimination line, whether it is leading, whether someone just hit
// it. It never looks at what a player cannot see (other players' shields).

// Items that stop or wreck typing are worth more than ones that only distract.
const ATTACK_WEIGHT = {
  inkFog: 1, timeFreeze: 1, blackout: 1, backspaceLock: 0.7, typoGenerator: 0.7, keyScrambler: 0.7,
  capsLockLock: 0.8, mirrorMode: 0.5, screenDimmer: 0.5, screenShake: 0.4,
};

function standingsFor(player, participants) {
  const alive = participants.filter(p => !p.is_eliminated);
  const ranked = alive.slice().sort((a, b) => b.score - a.score);
  const others = alive.filter(p => p.id !== player.id);
  const closest = others.reduce((best, p) => (!best || Math.abs(p.score - player.score) < Math.abs(best.score - player.score) ? p : best), null);
  return {
    alive: alive.length,
    leading: ranked[0]?.id === player.id,
    gap: closest ? Math.abs(closest.score - player.score) : Infinity,
    richest: others.reduce((max, p) => Math.max(max, p.cash), 0),
  };
}

function offerValue(item, { profile, standings, memory, state }) {
  const holds = id => state.inventory.some(i => i.id === id);
  const close = Math.max(0, 1 - standings.gap / 300); // 1 = neck and neck
  if (item.id === 'aiHelper') return 0; // a hint is no use to a bot
  if (item.id === 'shield') {
    if (holds('shield') || (state.self_effects || []).some(e => e.type === 'shield')) return 0;
    return profile.caution * ((standings.leading ? 0.6 : 0.2) + (memory.revengeTarget ? 0.6 : 0));
  }
  if (item.id === 'scoreMultiplier') return holds('scoreMultiplier') ? 0 : profile.greed * (0.4 + 0.6 * close);
  if (item.id === 'cashSteal' || item.id === 'taxCollection') return profile.greed * Math.min(1, standings.richest / 1500) * 0.6;
  const weight = ATTACK_WEIGHT[item.id] || 0.4;
  const crowd = item.type === 'aoe' ? Math.min(1, (standings.alive - 1) / 3) : 1;
  return profile.aggression * weight * (0.3 + 0.7 * close) * crowd;
}

function buyForBot(player, state, profile, random, { participants, memory, phase }) {
  if (state.inventory.length >= config.maxInventory) return;
  const finalShop = phase === 'SHOP_3';
  // Keep a little cash back for the next shop, unless this is the last one.
  const reserve = finalShop ? 0 : Math.round(300 * profile.caution);
  const standings = standingsFor(player, participants);
  const options = config.shopItems
    .filter(item => item.price <= player.cash - reserve
      && (item.type !== 'aoe' || state.inventory.filter(i => i.type === 'aoe').length < config.maxAoeHeld))
    .map(item => ({ item, value: offerValue(item, { profile, standings, memory, state }) * (0.8 + 0.4 * random()) }))
    .filter(option => option.value > 0.25)
    .sort((a, b) => b.value - a.value);
  if (!options.length) return;
  const { item } = options[0];
  player.cash -= item.price;
  state.inventory.push({ ...item, instance_id: randomUUID() });
}

// Who is worth hitting: a player near this bot's score (the elimination fight
// is with them, not with a runaway leader), someone who hit it if it holds a
// grudge, and only while they are still typing.
function pickTarget(player, opponents, memory, profile, now, phase) {
  const typing = opponents.filter(p => !p.has_submitted
    && !(p.participant_kind === 'bot' && (p.bot_state?.phase === phase) && (p.bot_state?.progress || 0) >= 85)
    && !activeAttackEffects(p.attack_effects, phase, now).length);
  const threat = p => 1 / (1 + Math.abs(p.score - player.score) / 100)
    + (memory.revengeTarget === p.user_name ? profile.vengeance : 0)
    + (p.score > player.score ? 0.2 : 0);
  return typing.sort((a, b) => threat(b) - threat(a) || a.id - b.id)[0] || null;
}

async function useForBot(db, room, player, state, memory, now, phaseDeadlineMs, random, profile) {
  if (random() >= 0.35 + 0.5 * profile.aggression) return;
  // A debuff landing with a few seconds left changes nothing.
  if (phaseDeadlineMs - now < 8000) return;
  const [opponents] = await db.query(`SELECT p.*, s.attack_effects FROM arcade_participants p
    LEFT JOIN arcade_shop_states s ON s.match_id = p.match_id AND s.user_name = p.user_name
    WHERE p.room_id = ? AND p.match_id = ? AND p.id <> ? AND p.is_eliminated = 0 ORDER BY p.score DESC, p.id`,
  [room.room_id, room.current_match_id, player.id]);
  for (const item of state.inventory) {
    if (activeSelfEffects(state.self_effects, room.phase, now).some(e => e.type === item.id)) continue;
    if (item.id === 'aiHelper') continue;
    // A bot writing a real answer saves its booster for the moment it submits.
    if (item.id === 'scoreMultiplier' && memory.plan) continue;
    let targetName;
    if (item.type === 'attack') {
      targetName = pickTarget(player, opponents, memory, profile, now, room.phase)?.user_name;
      if (!targetName) continue;
    } else if (item.type === 'aoe') {
      if (opponents.filter(p => !p.has_submitted).length < 2) continue;
    } else if (item.id === 'taxCollection' && !opponents.length) continue;
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

// ---- Typing a real answer (ADR 0005) ----------------------------------------

// Debuffs that stop the keyboard, and ones that make typing slower.
const STOPS_TYPING = new Set(['inkFog', 'timeFreeze', 'blackout']);
const SLOWS_TYPING = new Set(['mirrorMode', 'screenShake', 'screenDimmer']);

const roundTaskId = room => {
  const ids = Array.isArray(room.round_task_ids) ? room.round_task_ids : null;
  const round = Number(String(room.phase).split('_')[1]);
  return ids && Number.isInteger(round) ? ids[round - 1] : undefined;
};

// Start grading every drawn problem's answer bank, Round 1 first. Never awaited
// under a room lock: a bot simply keeps reading the problem until it is ready.
function warmRoundAnswers(db, taskIds) {
  return (taskIds || []).reduce((chain, id) => chain.then(() => coder.warmBank(id, () => loadArcadeProblem(db, id))), Promise.resolve());
}

// Milliseconds per keystroke for this answer. The whole answer takes about as
// long as the old progress bar did (stepsToFinish typing steps), so bot
// strength stays where botSkillByDifficulty puts it; a longer answer takes
// longer, but only by the square root of its length, within 0.7-1.6x. Pauses
// at line ends count against the same budget.
function answerKeystrokeMs(profile, plan, steps) {
  const chars = Math.max(1, plan.insert.length);
  const pauses = (plan.insert.match(/[\n:]/g) || []).length * (coder.PAUSE_FACTOR - 1);
  const lengthFactor = Math.min(1.6, Math.max(0.7, Math.sqrt(chars / config.botReferenceAnswerChars)));
  return profile.typingSpeedMs * steps * lengthFactor / (chars + pauses);
}

// Being hit rattles a bot for a few seconds after the debuff itself; a calm
// (cautious) persona shakes it off faster.
const TILT_MS = 8000;

function keystrokeMs(room, memory, effects, profile, now) {
  const slow = effects.some(e => SLOWS_TYPING.has(e.type)) ? 2 : 1;
  const tilt = memory.hitAt && now - memory.hitAt < TILT_MS ? 1 + 0.6 * (1 - profile.caution) : 1;
  return memory.charMs * roundPaceScale(room) * slow * tilt;
}

// ---- Talking between rounds --------------------------------------------------
// Chat is closed while a round runs, so a bot speaks once per shop break, about
// the round that just ended: a win, a hit it took, or a close finish.
const CHAT_EMOJI = { win: ['😎', '🔥', '👏'], hit: ['😮', '😕'], close: ['😢', '🔥', '👍'] };

function chatFor(player, room, profile, memory, random) {
  const entries = room.last_round_summary?.entries || [];
  const mine = entries.find(e => e.name === player.user_name);
  if (!mine) return null;
  const mood = mine.rank === 1 ? 'win'
    : memory.revengeTarget && memory.hitRound === room.last_round_summary.roundNum ? 'hit'
      : mine.rank >= entries.length - 1 ? 'close' : null;
  if (!mood || random() > 0.7) return null;
  const options = profile.chatLines?.[mood] || [];
  if (random() < 0.35 || !options.length) {
    const emoji = CHAT_EMOJI[mood];
    return { emoji: emoji[Math.floor(random() * emoji.length)] };
  }
  const line = options[Math.floor(random() * options.length)];
  return { message: line.replace('{name}', memory.revengeTarget || '').slice(0, 300) };
}

// Returns the DB-clock time the bot finished, or null while it is still typing.
function typeAnswer({ room, profile, memory, effects, now, random }) {
  if (effects.some(e => STOPS_TYPING.has(e.type))) { memory.lastProgress = now; return null; }
  const plan = memory.plan;
  // Nothing to write means the bot gave up on this one. Like a stuck player it
  // leaves the scaffold in place and lets the deadline send it - never at once.
  if (!plan.insert) { memory.progress = 0; memory.lastProgress = now; return null; }
  const typingEffects = new Set(effects.map(e => e.type));
  const charMs = keystrokeMs(room, memory, effects, profile, now);
  for (;;) {
    const cost = coder.stepCost(plan, charMs);
    if (now - memory.lastProgress < cost) break;
    memory.lastProgress += cost;
    if (coder.typingStep(plan, { accuracy: profile.accuracy, effects: typingEffects, random }) === 'done') {
      memory.progress = 100;
      return memory.lastProgress;
    }
  }
  memory.progress = coder.progressOf(plan);
  return null;
}

// Persist decision clocks under the same room lock as settlement and human
// commands. Extra workers, restarts and disconnected browsers cannot replay a turn.
async function tickArcadeBots(db, roomId, random = Math.random) {
  const pool = db;
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
        delete memory.plan;
        delete memory.answerId;
        delete memory.taskId;
      }
      const effects = activeAttackEffects(state.attack_effects, room.phase, now);
      const taskId = roundTaskId(room);
      // A drawn problem means the bot writes and submits a real answer. Rooms
      // without one, or whose answers could not be graded, keep the progress
      // bar (phase-finalizer synthesizes that bot's score) so a match never stalls.
      const writesCode = room.phase.startsWith('ROUND_') && taskId !== undefined && !coder.bankFailed(taskId);
      if (writesCode && !player.has_submitted) {
        const bank = coder.readyBank(taskId);
        if (!bank) {
          warmRoundAnswers(pool, [taskId]);
          memory.lastProgress = now; // still reading the problem
        } else {
          if (!memory.plan) {
            const skill = config.botSkillByDifficulty[room.difficulty] || config.botSkillByDifficulty.default;
            const target = Math.min(1, Math.max(0, skill.passMin + random() * skill.passSpread));
            const answer = coder.chooseAnswer(bank, target, random);
            memory.taskId = taskId;
            memory.answerId = answer.id;
            memory.plan = coder.typingPlan(bank.starter, answer.code);
            memory.charMs = answerKeystrokeMs(profile, memory.plan, memory.stepsToFinish);
          }
          const finishedAt = typeAnswer({ room, profile, memory, effects, now, random });
          const draft = coder.draftOf(memory.plan);
          if (finishedAt !== null) {
            // Press the booster just before sending, so it covers this answer.
            const booster = state.inventory.find(i => i.id === 'scoreMultiplier');
            if (booster && !activeSelfEffects(state.self_effects, room.phase, finishedAt).some(e => e.type === 'scoreMultiplier')) {
              await useOwnedItem({ db: connection, room, player, state, instanceId: booster.instance_id, now: finishedAt, phaseDeadlineMs: clock.deadlineMs });
            }
            const multiplier = activeSelfEffects(state.self_effects, room.phase, finishedAt)
              .some(e => e.type === 'scoreMultiplier') ? 1 : 0;
            await connection.query(`UPDATE arcade_participants SET has_submitted = 1, submitted_code = ?, draft_code = ?,
              submitted_at = to_timestamp(?::double precision / 1000), score_multiplier_active = ? WHERE id = ?`,
            [draft, draft, finishedAt, multiplier, player.id]);
          } else {
            await connection.query('UPDATE arcade_participants SET draft_code = ?, draft_updated_at = clock_timestamp() WHERE id = ?', [draft, player.id]);
          }
        }
      }
      const frozen = effects.some(e => e.type === 'timeFreeze' || e.type === 'inkFog');
      if (frozen) memory.lastProgress = now;
      else {
        if (room.phase.startsWith('ROUND_') && !writesCode) advanceProgress(memory, profile.typingSpeedMs * roundPaceScale(room), now);
        if (room.phase.startsWith('SHOP_') && memory.chatPhase !== room.phase) {
          memory.chatPhase = room.phase;
          const said = chatFor(player, room, profile, memory, random);
          if (said) {
            await connection.query(`INSERT INTO arcade_chat_messages (room_id, user_name, kind, message, emoji)
              VALUES (?, ?, ?, ?, ?)`, [room.room_id, player.user_name, said.emoji ? 'emoji' : 'text', said.message || null, said.emoji || null]);
          }
        }
        if (room.phase.startsWith('SHOP_') && now - (memory.lastBuy || 0) >= config.botBuyAttemptIntervalMs) {
          memory.lastBuy = now;
          buyForBot(player, state, profile, random, { participants, memory, phase: room.phase });
        }
        if (/^ROUND_[2-4]$/.test(room.phase) && now - (memory.lastUse || 0) >= config.botItemUseIntervalMs) {
          memory.lastUse = now;
          await useForBot(connection, room, player, state, memory, now, clock.deadlineMs, random, profile);
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
module.exports = { tickArcadeBots, warmRoundAnswers, loadArcadeProblem, roundTaskId };
