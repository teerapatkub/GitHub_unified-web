// client/src/pages/Arcade/bot/botProfiles.js
// Definitions of Bot AI Personas & Decision Weights for Arcade Battle Royale

export const BOT_PERSONALITIES = {
  SPEED: 'SPEED',         // High coding speed, focuses on pure points
  SABOTEUR: 'SABOTEUR',   // Focuses on buying attack items & annoying player
  REVENGE: 'REVENGE',     // Targets whoever attacked it recently
  BALANCED: 'BALANCED'    // Smart mix of coding, defense, and attacks
};

export const BOT_PROFILES = [
  {
    id: 'bot_pyninja',
    name: 'Bot_PyNinja',
    personality: BOT_PERSONALITIES.SPEED,
    avatar: '⚡',
    typingSpeedMs: 1200,      // Fast progress tick
    accuracy: 0.95,
    attackChance: 0.2,        // 20% chance to buy attack item
    favoriteItems: ['scoreMultiplier', 'inkFog'],
    description: 'สายสปีด พิมพ์โค้ดเร็วมาก มุ่งเน้นเก็บคะแนนนำก่อนใคร'
  },
  {
    id: 'bot_bughunter',
    name: 'Bot_BugHunter',
    personality: BOT_PERSONALITIES.SABOTEUR,
    avatar: '💣',
    typingSpeedMs: 2200,      // Average coding speed
    accuracy: 0.85,
    attackChance: 0.8,        // 80% chance to buy attack items
    favoriteItems: ['timeFreeze', 'inkFog', 'mirrorMode', 'screenShake'],
    description: 'สายก่อกวน ชอบซื้อไอเทมหมึกบังตา แช่แข็ง กลับหัวโค้ด ยิงใส่ผู้เล่น'
  },
  {
    id: 'bot_nullpointer',
    name: 'Bot_NullPointer',
    personality: BOT_PERSONALITIES.REVENGE,
    avatar: '🎯',
    typingSpeedMs: 1800,
    accuracy: 0.90,
    attackChance: 0.4,
    favoriteItems: ['blackout', 'screenDimmer', 'timeFreeze'],
    description: 'สายแก้แค้น จะจดจำและยิงไอเทมสวนคืนใส่คนที่เคยโจมตีมันเท่านั้น'
  },
  {
    id: 'bot_codemaster',
    name: 'Bot_CodeMaster',
    personality: BOT_PERSONALITIES.BALANCED,
    avatar: '👑',
    typingSpeedMs: 1500,
    accuracy: 0.98,
    attackChance: 0.5,
    favoriteItems: ['shield', 'scoreMultiplier', 'timeFreeze'],
    description: 'สายโปร บาลานซ์การพิมพ์โค้ด การกางเกราะป้องกัน และการยิงก่อกวน'
  },
  {
    id: 'bot_syntaxpro',
    name: 'Bot_SyntaxPro',
    personality: BOT_PERSONALITIES.SPEED,
    avatar: '🚀',
    typingSpeedMs: 1300,
    accuracy: 0.92,
    attackChance: 0.3,
    favoriteItems: ['scoreMultiplier', 'shield'],
    description: 'สายปั๊มคะแนน ซื้อ Score Booster และตั้งรับกางเกราะ'
  }
];

// Helper to get profile by bot name or random fallback
export function getBotProfile(name) {
  const profile = BOT_PROFILES.find(p => p.name === name);
  if (profile) return profile;
  
  // Random fallback if bot name is custom
  const randomIndex = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % BOT_PROFILES.length;
  return {
    ...BOT_PROFILES[randomIndex],
    name
  };
}
