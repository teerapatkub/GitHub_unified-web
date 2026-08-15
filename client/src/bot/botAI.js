// client/src/bot/botAI.js
// Autonomous Bot AI Agent Logic for Arcade Battle Royale

import { getBotProfile, BOT_PERSONALITIES } from './botProfiles.js';
import { SHOP_CATALOG } from './shopCatalog.js';

// Inventory caps — mirrors the real shop rules: at most 3 items held at
// once, and at most 1 of those may be an `aoe` item (destructive enough to
// need its own scarcity, but it still eats one of the 3 slots, not a
// separate quota).
const MAX_INVENTORY = 3;
const MAX_AOE_HELD = 1;

export class BotAIEngine {
  constructor(name) {
    this.name = name;
    this.profile = getBotProfile(name);

    // Game State
    this.score = 0;
    this.cash = 1000;
    this.eliminated = false;
    this.progress = 0; // 0 to 100% coding completion
    this.inventory = [];
    this.activeEffects = [];
    this.revengeTarget = null;
    this.lastActionTime = Date.now();
    this.hasShield = false;
  }

  // Reset bot state for new match/round
  resetState() {
    this.score = 0;
    this.cash = 1000;
    this.eliminated = false;
    this.progress = 0;
    this.inventory = [];
    this.activeEffects = [];
    this.revengeTarget = null;
    this.hasShield = false;
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
        this.lastActionTime = now;
        this.progress += Math.floor(Math.random() * 25) + 15;

        // When bot completes coding task
        if (this.progress >= 100) {
          this.progress = 0;
          const scoreGain = Math.floor(400 * this.profile.accuracy) + 100;
          const cashGain = 250;
          this.score += scoreGain;
          this.cash += cashGain;
        }
      }
    }

    // 3. SHOP & SABOTAGE TICK — there is no shop phase before Round 1, so a
    // bot can't have bought anything yet; skipping this during ROUND_1 means
    // bots start the match with an empty inventory just like a real player.
    if (phase !== 'ROUND_1') {
      this.maybeBuyItem(phase);
      this.maybeUseItem(phase, playerState, allOpponents, onBotAttackCallback);
    }
  }

  // Purchases can only happen during a shop intermission — same as a real
  // player, who can only click "buy" on the shop screen. This is what stops
  // bots from re-stocking mid-round off their own coding income and feeling
  // like they have an endless supply of items.
  maybeBuyItem(phase) {
    if (phase !== 'SHOP_1' && phase !== 'SHOP_2') return;
    if (this.inventory.length >= MAX_INVENTORY) return;
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
