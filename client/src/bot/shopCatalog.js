// client/src/bot/shopCatalog.js
// Canonical id/type/price data for every purchasable arcade shop item, used
// by the Bot AI Engine to shop from the same catalog real players buy from.
// Kept as a standalone data file (rather than importing SHOP_ITEMS from
// client/src/pages/ArcadeBattleRoyale.jsx) to avoid a circular import, since
// that page already imports botManager.js which imports botAI.js. Bots only
// need id/type/price — icon/nameKey/descKey are UI-only concerns that stay
// in ArcadeBattleRoyale.jsx's SHOP_ITEMS. Keep this list in sync with that
// one whenever items, prices, or types change there.
export const SHOP_CATALOG = [
    { id: 'inkFog', price: 400, type: 'attack', name: '🌫️ Ink Fog' },
    { id: 'backspaceLock', price: 500, type: 'attack', name: '🔒 Backspace Lock' },
    { id: 'keyScrambler', price: 450, type: 'attack', name: '⌨️ Key Scrambler' },
    { id: 'aiHelper', price: 600, type: 'buff', name: '🤖 AI Helper' },
    { id: 'screenShake', price: 300, type: 'attack', name: '🌋 Screen Shake' },
    { id: 'typoGenerator', price: 550, type: 'attack', name: '🐛 Typo Generator' },
    { id: 'timeFreeze', price: 1200, type: 'aoe', name: '❄️ Time Freeze' },
    { id: 'blackout', price: 900, type: 'aoe', name: '🔌 EMP Strike' },
    { id: 'shield', price: 700, type: 'buff', name: '🛡️ Shield' },
    { id: 'cashSteal', price: 600, type: 'attack', name: '🎭 Cash Steal' },
    { id: 'capsLockLock', price: 350, type: 'attack', name: '🔠 Caps Lock Trap' },
    { id: 'mirrorMode', price: 500, type: 'attack', name: '🪞 Mirror Mode' },
    { id: 'taxCollection', price: 800, type: 'buff', name: '💸 Tax Collection' },
    { id: 'scoreMultiplier', price: 650, type: 'buff', name: '⚡ Score Booster' },
    { id: 'screenDimmer', price: 400, type: 'attack', name: '🕶️ Screen Dimmer' }
];
