// client/src/pages/Arcade/bot/botAI.js
// Autonomous Bot AI Agent Logic for Arcade Battle Royale

import { getBotProfile, BOT_PERSONALITIES } from './botProfiles.js';
import { SHOP_CATALOG } from './shopCatalog.js';
import arcadeConfig from '../../../../../shared/arcadeConfig.json';

// Inventory caps — mirrors the real shop rules (client/src/pages/Arcade/ArcadeBattleRoyale.jsx):
// at most arcadeConfig.maxInventory items held at once, and at most
// arcadeConfig.maxAoeHeld of those may be an `aoe` item (destructive enough
// to need its own scarcity, but it still eats one of the total slots, not a
// separate quota).
const MAX_INVENTORY = arcadeConfig.maxInventory;
const MAX_AOE_HELD = arcadeConfig.maxAoeHeld;

// How often a bot is allowed to CONSIDER buying / using an item, in real time.
// See the _botPacingComment in shared/arcadeConfig.json: these decisions used
// to be per-update()-call, which tied bot aggression directly to the tick rate.
const BOT_BUY_ATTEMPT_INTERVAL_MS = arcadeConfig.botBuyAttemptIntervalMs;
const BOT_ITEM_USE_INTERVAL_MS = arcadeConfig.botItemUseIntervalMs;

export class BotAIEngine {
  constructor(name) {
    this.name = name;
    this.profile = getBotProfile(name);

    // Game State
    this.score = 0;
    this.cash = 0;
    this.eliminated = false;
    this.progress = 0; // 0 to 100% coding completion
    this.inventory = [];
    this.activeEffects = [];
    this.revengeTarget = null;
    this.lastActionTime = Date.now();
    // Staggered by a random fraction of one interval so five bots added in the
    // same instant don't all buy and fire on exactly the same beat.
    this.lastBuyAttempt = Date.now() - Math.random() * BOT_BUY_ATTEMPT_INTERVAL_MS;
    this.lastItemUseAttempt = Date.now() - Math.random() * BOT_ITEM_USE_INTERVAL_MS;
    this.hasShield = false;
  }

  // Reset bot state for new match/round
  resetState() {
    this.score = 0;
    this.cash = 0;
    this.eliminated = false;
    this.progress = 0;
    this.inventory = [];
    this.activeEffects = [];
    this.revengeTarget = null;
    this.hasShield = false;
    this.lastActionTime = Date.now();
  }

  // Called at the start of every new coding round (not a whole new match —
  // see resetState above for that) so the visual progress bar starts back at
  // 0% instead of carrying over whatever it reached at the end of the
  // previous round. Cash/score/inventory/shield persist across rounds within
  // the same match, only progress is per-round.
  resetRoundProgress() {
    this.progress = 0;
    // Must be re-based, not left alone. The coding tick now advances by every
    // typingSpeedMs interval that elapsed since lastActionTime, so carrying a
    // timestamp from before the summary+shop intermission (~25s) would hand
    // the bot ~16 intervals' worth of progress the instant the next round
    // opened — its bar would jump straight to full. Every round starts the
    // clock fresh.
    this.lastActionTime = Date.now();
  }

  isDebuffed() {
    return this.activeEffects.some(e => e.expiresAt > Date.now());
  }

  // Register when another player attacks this bot
  receiveAttack(attackerName, item) {
    if (this.hasShield) {
      this.hasShield = false;
      return { blocked: true, msg: `🛡️ ${this.name} กางเกราะป้องกันไอเทม ${item.name || item.type} ได้สำเร็จ!` };
    }

    // Set revenge target so bot attacks back
    this.revengeTarget = attackerName;

    // Apply debuff to bot — id is the effect identifier (shared with SHOP_ITEMS
    // ids), item.type is only the shop category ('attack'/'aoe'/'buff') and must
    // not be used here.
    this.activeEffects.push({
      type: item.id,
      expiresAt: Date.now() + 6000
    });

    return { blocked: false, msg: `💥 ${this.name} โดนโจมตีด้วยไอเทม ${item.name || item.type}!` };
  }

  // Main AI Tick update called inside game interval loop
  update(phase, playerState, allOpponents, onBotAttackCallback) {
    if (this.eliminated) return;

    const now = Date.now();

    // 1. Check if frozen or delayed by debuffs
    const isFrozen = this.activeEffects.some(e => (e.type === 'timeFreeze' || e.type === 'inkFog') && e.expiresAt > now);
    if (isFrozen) return;

    // Clean expired debuffs
    this.activeEffects = this.activeEffects.filter(e => e.expiresAt > now);

    // 2. CODING SIMULATION TICK (During coding rounds)
    if (phase.startsWith('ROUND_')) {
      const timePassed = now - this.lastActionTime;
      if (timePassed >= this.profile.typingSpeedMs) {
        // Advance by however many typing intervals actually elapsed, and keep
        // the leftover remainder, rather than one step per call. With one step
        // per call the bot's real pace was set by the tick rate, not by
        // typingSpeedMs: a 1s tick quantized every profile up to the next whole
        // second (typingSpeedMs 1200 effectively became 2000 — 67% slower),
        // and a throttled background tab slowed them further still. This keeps
        // the profile's stated pace no matter how often update() is called.
        const steps = Math.floor(timePassed / this.profile.typingSpeedMs);
        this.lastActionTime += steps * this.profile.typingSpeedMs;
        this.progress += steps * (Math.floor(Math.random() * 25) + 15);

        // When bot completes coding task — this.score only feeds the bot's
        // own mid-round "who's leading" targeting heuristic (pickAttackTarget
        // below), so a synthetic bump here is harmless. Cash is NOT bumped
        // here: it's the bot's real spending power and must match what the
        // player sees on screen, both of which come solely from the rank-
        // based reward evaluateRound() credits via botManager.awardCash()
        // once the round's actual outcome is known.
        if (this.progress >= 100) {
          this.progress = 0;
          const scoreGain = Math.floor(400 * this.profile.accuracy) + 100;
          this.score += scoreGain;
        }
      }
    }

    // 3. SHOP TICK — maybeBuyItem no-ops itself outside SHOP_* phases, so it's
    // safe to call every tick regardless of phase.
    this.maybeBuyItem(phase);

    // 4. SABOTAGE TICK — items can only be used during actual gameplay
    // (ROUND_2/3/4), matching the human player's own inventory buttons which
    // only render inside the Round view. Explicitly excluding SUMMARY_*/
    // SHOP_*/ROUND_1 here (rather than just "not ROUND_1") stops bots from
    // firing items during the round-summary auto-advance screen or the shop.
    if (phase.startsWith('ROUND_') && phase !== 'ROUND_1') {
      this.maybeUseItem(phase, playerState, allOpponents, onBotAttackCallback);
    }
  }

  // Purchases can only happen during a shop intermission — same as a real
  // player, who can only click "buy" on the shop screen. This is what stops
  // bots from re-stocking mid-round off their own coding income and feeling
  // like they have an endless supply of items.
  maybeBuyItem(phase) {
    if (phase !== 'SHOP_1' && phase !== 'SHOP_2' && phase !== 'SHOP_3') return;
    if (this.inventory.length >= MAX_INVENTORY) return;
    // One purchase decision per botBuyAttemptIntervalMs of real time. Without
    // this the `attackChance` roll below happened once per update() call, so
    // the number of chances a bot got was decided by the tick rate: at ~164Hz
    // every bot filled its bag within the first moments of a shop regardless
    // of its profile, which made attackChance meaningless.
    if (Date.now() - this.lastBuyAttempt < BOT_BUY_ATTEMPT_INTERVAL_MS) return;
    this.lastBuyAttempt = Date.now();
    if (Math.random() >= this.profile.attackChance) return;

    const aoeHeld = this.inventory.filter(i => i.type === 'aoe').length;
    const affordable = SHOP_CATALOG.filter(item => {
      if (item.price > this.cash) return false;
      if (item.type === 'aoe' && aoeHeld >= MAX_AOE_HELD) return false;
      return true;
    });
    if (affordable.length === 0) return;

    // Prefer this persona's favoriteItems when one is affordable/allowed;
    // otherwise fall back to whatever's within reach. This is what makes
    // purchases vary by bot personality and by how much cash they're
    // actually carrying round to round, instead of a fixed pool every time.
    const favoriteChoices = affordable.filter(item => this.profile.favoriteItems.includes(item.id));
    const pool = favoriteChoices.length > 0 ? favoriteChoices : affordable;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    this.cash -= chosen.price;
    this.inventory.push({ ...chosen });
  }

  // Applies a buff item to the bot itself, immediately — matches the real
  // player flow where buff items execute on self the moment they're used,
  // never requiring a target pick.
  applyBuffToSelf(item, playerState, allOpponents, onBotAttackCallback) {
    if (item.id === 'shield') {
      this.hasShield = true;
    } else if (item.id === 'scoreMultiplier') {
      this.score += 300;
    } else if (item.id === 'taxCollection') {
      // Picks the richest live rival (bot or human) and routes the actual
      // cash transfer through the same attack callback botManager.js already
      // uses — that's the single place that knows current live cash and
      // whether a shield blocks it, so the 20% is computed fresh there
      // instead of risking a stale amount / double-crediting on a block.
      const rivals = allOpponents.filter(b => b !== this && !b.eliminated);
      const candidates = playerState.eliminated ? rivals : [...rivals, { name: playerState.name, cash: playerState.cash }];
      if (candidates.length === 0) return;
      const richest = candidates.reduce((max, c) => (c.cash > max.cash ? c : max), candidates[0]);
      onBotAttackCallback(this.name, richest.name, item);
    }
    // aiHelper: no-op for bots — they don't need code hints.
  }

  // Picks a live, currently-undebuffed target to fire an `attack`-type item
  // at. Debuffed targets are excluded entirely (can't even be selected) so a
  // player only ever has one debuff active at a time — matching how the
  // human player's own target picker grays out anyone already hit. Priority:
  // an active revenge grudge first, otherwise whoever currently has the
  // highest score (the actual leader), not a hardcoded human target.
  pickAttackTarget(playerState, allOpponents) {
    const candidates = [];
    if (!playerState.eliminated && !(playerState.activeEffects || []).some(e => e.expiresAt > Date.now())) {
      candidates.push({ name: playerState.name, score: playerState.score });
    }
    allOpponents.forEach(bot => {
      if (bot === this || bot.eliminated || bot.isDebuffed()) return;
      candidates.push({ name: bot.name, score: bot.score });
    });
    if (candidates.length === 0) return null;

    if (this.revengeTarget && Math.random() < 0.8) {
      const revengeMatch = candidates.find(c => c.name === this.revengeTarget);
      if (revengeMatch) return revengeMatch;
    }
    return candidates.reduce((best, c) => (c.score > best.score ? c : best), candidates[0]);
  }

  // AOE is the deliberate exception to the "one debuff at a time" rule — it
  // lands on every live opponent regardless of what's already active on
  // them, same as when a real player fires one.
  fireAoe(item, playerState, allOpponents, onBotAttackCallback) {
    if (!playerState.eliminated) {
      onBotAttackCallback(this.name, playerState.name, item);
    }
    allOpponents.forEach(bot => {
      if (bot !== this && !bot.eliminated) {
        onBotAttackCallback(this.name, bot.name, item);
      }
    });
  }

  // Tries to use one item out of the current inventory. Walks the inventory
  // in order and uses the first item that's actually usable right now —
  // buffs and AOE are always usable, but an `attack` item is skipped (left
  // in the bag for later) if no eligible, undebuffed target exists yet,
  // instead of being wasted on a blocked target.
  maybeUseItem(phase, playerState, allOpponents, onBotAttackCallback) {
    if (phase === 'ROUND_1' || this.inventory.length === 0) return;
    // Same reasoning as maybeBuyItem: this used to be a bare per-call roll, so
    // at ~164 calls/second a bot dumped its entire inventory on the player
    // within milliseconds of a round opening. Pacing the attempts in real time
    // spreads sabotage across the round the way it was designed to feel.
    if (Date.now() - this.lastItemUseAttempt < BOT_ITEM_USE_INTERVAL_MS) return;
    this.lastItemUseAttempt = Date.now();
    if (Math.random() >= 0.6) return;

    for (let idx = 0; idx < this.inventory.length; idx++) {
      const item = this.inventory[idx];

      if (item.type === 'buff') {
        this.inventory.splice(idx, 1);
        this.applyBuffToSelf(item, playerState, allOpponents, onBotAttackCallback);
        return;
      }

      if (item.type === 'aoe') {
        this.inventory.splice(idx, 1);
        this.fireAoe(item, playerState, allOpponents, onBotAttackCallback);
        return;
      }

      const target = this.pickAttackTarget(playerState, allOpponents);
      if (target) {
        this.inventory.splice(idx, 1);
        onBotAttackCallback(this.name, target.name, item);
        return;
      }
      // No eligible target for this attack item right now — try the next
      // item in the bag instead of giving up for the whole tick.
    }
  }
}
