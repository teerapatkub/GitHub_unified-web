// client/src/pages/Arcade/bot/shopCatalog.js
// Canonical id/type/price data for every purchasable arcade shop item, used
// by the Bot AI Engine to shop from the same catalog real players buy from.
// price/type now come from shared/arcadeConfig.json (single source also read
// by server/server.js and client/src/pages/Arcade/ArcadeBattleRoyale.jsx) — this
// file only adds the emoji+English `name` used in bot attack/defense log
// strings, since icon/nameKey/descKey are otherwise UI-only concerns that
// stay in ArcadeBattleRoyale.jsx's SHOP_ITEMS.
import arcadeConfig from '../../../../../shared/arcadeConfig.json';

const DISPLAY_NAMES = {
    inkFog: '🌫️ Ink Fog',
    backspaceLock: '🔒 Backspace Lock',
    keyScrambler: '⌨️ Key Scrambler',
    aiHelper: '🤖 AI Helper',
    screenShake: '🌋 Screen Shake',
    typoGenerator: '🐛 Typo Generator',
    timeFreeze: '❄️ Time Freeze',
    blackout: '🔌 EMP Strike',
    shield: '🛡️ Shield',
    cashSteal: '🎭 Cash Steal',
    capsLockLock: '🔠 Caps Lock Trap',
    mirrorMode: '🪞 Mirror Mode',
    taxCollection: '💸 Tax Collection',
    scoreMultiplier: '⚡ Score Booster',
    screenDimmer: '🕶️ Screen Dimmer'
};

export const SHOP_CATALOG = arcadeConfig.shopItems.map(item => ({
    ...item,
    name: DISPLAY_NAMES[item.id]
}));
