// client/src/bot/botAI.js
// Autonomous Bot AI Agent Logic for Arcade Battle Royale

import { getBotProfile, BOT_PERSONALITIES } from './botProfiles.js';

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

    // 3. SHOP & SABOTAGE TICK (During shop phases or round)
    this.evaluateItemPurchasesAndAttacks(playerState, allOpponents, onBotAttackCallback);
  }

  // AI evaluates cash and uses items against player or rivals
  evaluateItemPurchasesAndAttacks(playerState, allOpponents, onBotAttackCallback) {
    // A. Buy items if bot has cash
    if (this.cash >= 300 && Math.random() < this.profile.attackChance) {
      // ids must match SHOP_ITEMS ids in ArcadeBattleRoyale.jsx — the UI's
      // checkEffectActive() and botManager.js key off item.id as the effect type.
      const availableItems = [
        { id: 'inkFog', type: 'attack', price: 300, name: '🌫️ Ink Fog' },
        { id: 'timeFreeze', type: 'aoe', price: 450, name: '❄️ Time Freeze' },
        { id: 'mirrorMode', type: 'attack', price: 350, name: '🪞 Mirror Mode' },
        { id: 'screenDimmer', type: 'attack', price: 250, name: '🕶️ Screen Dimmer' },
        { id: 'screenShake', type: 'attack', price: 300, name: '🌋 Screen Shake' },
        { id: 'shield', type: 'buff', price: 500, name: '🛡️ Shield' },
        { id: 'scoreMultiplier', type: 'buff', price: 600, name: '🚀 Score Booster' }
      ];

      // Filter affordable items
      const affordable = availableItems.filter(item => item.price <= this.cash);
      if (affordable.length > 0) {
        const chosenItem = affordable[Math.floor(Math.random() * affordable.length)];
        this.cash -= chosenItem.price;

        if (chosenItem.type === 'shield') {
          this.hasShield = true;
        } else if (chosenItem.type === 'scoreMultiplier') {
          this.score += 300;
        } else {
          this.inventory.push(chosenItem);
        }
      }
    }

    // B. Use attack item in inventory
    if (this.inventory.length > 0 && Math.random() < 0.6) {
      const attackItem = this.inventory.shift();

      // Determine Victim (Target Player if player leads or revenge target)
      let targetName = playerState.name;
      if (this.revengeTarget && Math.random() < 0.8) {
        targetName = this.revengeTarget;
      } else {
        // Attack player if player score is higher
        targetName = playerState.name;
      }

      if (onBotAttackCallback && typeof onBotAttackCallback === 'function') {
        onBotAttackCallback(this.name, targetName, attackItem);
      }
    }
  }
}
