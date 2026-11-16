// Cosmetic shop prices, five new sets, and coin rewards x3 (fix list item 8,
// 2026-11-17).
//
// The four original sets and their prices are seeded inside the core
// migration, which is checksummed - editing that seed would stop every
// migrated database from booting. So the new prices and the new sets are this
// migration instead, and a fresh database gets the old seed first and this
// right after it.
//
// 1. Prices follow the item's type and rarity. The top of each type is what
//    the owner asked for (theme 10,000, frame 5,000, picture 8,000; the cursor
//    effect 4,000 was chosen with them); a lower rarity is a fixed share of it.
//    Only items that are on sale and cost something move: free starter items
//    and achievement-only pictures (price 0, not for sale) stay as they are,
//    and so does anything a player already bought - what they own is theirs.
// 2. A set costs the sum of its pieces less 20%, recomputed from the new
//    prices rather than typed in by hand, so the two cannot disagree.
// 3. Coins from lessons and mini-games x3. With a theme at 10,000 the old
//    payouts meant about 200 Arcade wins for one theme. Arcade, Debug Lab /
//    Challenge and the Competitive suggestions are x3 in code
//    (shared/arcadeConfig.json, server.js getLearningModeConfig,
//    competitiveAi.js SUGGESTED_TERMS). Achievements are not changed.
//
// New art lives in server/seed-assets and is served from /uploads like the
// rest. A theme's moving scene (falling leaves, snow, ...) and its colours are
// picked on the client by keyword in the art's file name (themes/shopPalette.js,
// fx/ambientScenes.js), the same way the four existing themes are.

const PRICE_BY_RARITY = {
  THEME: { COMMON: 2500, RARE: 5000, EPIC: 7500, LEGENDARY: 10000 },
  PROFILE_FRAME: { COMMON: 1250, RARE: 2500, EPIC: 3750, LEGENDARY: 5000 },
  PROFILE_PICTURE: { COMMON: 2000, RARE: 4000, EPIC: 6000, LEGENDARY: 8000 },
  MOUSE_EFFECT: { COMMON: 1000, RARE: 2000, EPIC: 3000, LEGENDARY: 4000 },
};
const SET_DISCOUNT = 0.8;
const REWARD_MULTIPLIER = 3;

const priceFor = (type, rarity) => PRICE_BY_RARITY[type]?.[String(rarity || 'COMMON').toUpperCase()]
  ?? PRICE_BY_RARITY[type]?.COMMON;

// `fx` names a click effect the client draws itself (client/src/fx). `visual`
// is still filled in: the shop shows it as the item's icon, and a client from
// before this change draws it as the plain emoji burst it already knows.
const NEW_SETS = [
  {
    set_key: 'monster',
    name_th: 'เซ็ตมอนสเตอร์จอมป่วน',
    name_en: 'Little Monsters Set',
    description_th: 'ธีมเมืองมอนสเตอร์ตัวกลมน่ารัก กรอบมอนสเตอร์กะพริบตา และเอฟเฟกต์คลิกที่เปลี่ยนหน้ามอนสเตอร์ไปเรื่อยๆ',
    rarity: 'EPIC',
    items: [
      {
        item_type: 'THEME', name: 'ธีมเมืองมอนสเตอร์',
        description: 'มอนสเตอร์ตัวจิ๋วแอบโผล่มาทักจากขอบจอเป็นระยะ มีละอองเรืองแสงลอยไปมา',
        asset_url: '/uploads/monster-theme.svg', effects: null,
      },
      {
        item_type: 'PROFILE_FRAME', name: 'กรอบมอนสเตอร์กะพริบตา',
        description: 'กรอบวงกลมสีม่วงมีเขา ตาโตที่กะพริบได้ และเขี้ยวจิ๋ว',
        asset_url: '/uploads/frame-monster.svg', effects: null,
      },
      {
        item_type: 'MOUSE_EFFECT', name: 'มอนสเตอร์โผล่',
        description: 'ทุกคลิกจะมีมอนสเตอร์หน้าใหม่เด้งออกมา ไม่ซ้ำกันไปเรื่อยๆ ดับเบิลคลิกแล้วมาเป็นขบวน',
        asset_url: '',
        effects: [
          { trigger: 'click', fx: 'monster', visual: '👾', color: '#8b5cf6', size: 64, duration: 1200 },
          { trigger: 'dblclick', fx: 'monster-parade', visual: '👻', color: '#22c55e', size: 54, duration: 1600 },
        ],
      },
    ],
  },
  {
    set_key: 'forest',
    name_th: 'เซ็ตป่าใบไม้ร่วง',
    name_en: 'Whispering Forest Set',
    description_th: 'ธีมป่าที่ใบไม้ร่วงตลอดเวลาและมีลมพัดเป็นช่วงๆ กรอบเถาวัลย์ และเอฟเฟกต์คลิกใบไม้ปลิว',
    rarity: 'EPIC',
    items: [
      {
        item_type: 'THEME', name: 'ธีมป่าใบไม้ร่วง',
        description: 'ใบไม้ร่วงลงมาเรื่อยๆ และทุกครึ่งนาทีจะมีลมกระโชกพัดใบไม้ปลิวข้ามจอ',
        asset_url: '/uploads/forest-theme.svg', effects: null,
      },
      {
        item_type: 'PROFILE_FRAME', name: 'กรอบเถาวัลย์',
        description: 'กรอบเถาวัลย์สีเขียวพันรอบรูป มีใบไม้แกว่งตามลม เห็ด และดอกไม้ป่า',
        asset_url: '/uploads/frame-forest.svg', effects: null,
      },
      {
        item_type: 'MOUSE_EFFECT', name: 'ใบไม้ปลิว',
        description: 'คลิกแล้วใบไม้หลายสีหมุนกระจายออกแล้วค่อยๆ ร่วงลง ดับเบิลคลิกเป็นลมหมุน',
        asset_url: '',
        effects: [
          { trigger: 'click', fx: 'leaves', visual: '🍃', color: '#16a34a', size: 40, duration: 2200 },
          { trigger: 'dblclick', fx: 'leaf-whirl', visual: '🍂', color: '#ea580c', size: 40, duration: 2600 },
        ],
      },
    ],
  },
  {
    set_key: 'winter',
    name_th: 'เซ็ตหน้าหนาว',
    name_en: 'Winter Wonderland Set',
    description_th: 'ธีมหิมะตกเป็นช่วงๆ มีตุ๊กตาหิมะเป็นพื้นหลัง กรอบเกล็ดหิมะ และเอฟเฟกต์คลิกหิมะโปรยปราย',
    rarity: 'EPIC',
    items: [
      {
        item_type: 'THEME', name: 'ธีมหน้าหนาว',
        description: 'ตุ๊กตาหิมะ ต้นสนและบ้านไม้ หิมะโปรยเบาๆ และมีพายุหิมะลูกเล็กพัดผ่านเป็นช่วงๆ',
        asset_url: '/uploads/winter-theme.svg', effects: null,
      },
      {
        item_type: 'PROFILE_FRAME', name: 'กรอบเกล็ดหิมะ',
        description: 'กรอบน้ำแข็งสีฟ้า เกล็ดหิมะหมุนช้าๆ และหิมะเกาะขอบด้านบน',
        asset_url: '/uploads/frame-winter.svg', effects: null,
      },
      {
        item_type: 'MOUSE_EFFECT', name: 'หิมะโปรยปราย',
        description: 'คลิกแล้วเกล็ดหิมะพุ่งขึ้นแล้วโปรยลงอย่างช้าๆ พร้อมประกายเย็น ดับเบิลคลิกเป็นวงพายุหิมะ',
        asset_url: '',
        effects: [
          { trigger: 'click', fx: 'snow', visual: '❄️', color: '#38bdf8', size: 36, duration: 2400 },
          { trigger: 'dblclick', fx: 'snow-storm', visual: '☃️', color: '#0ea5e9', size: 40, duration: 2800 },
        ],
      },
    ],
  },
  {
    set_key: 'ocean',
    name_th: 'เซ็ตใต้ทะเลลึก',
    name_en: 'Deep Sea Set',
    description_th: 'ธีมโลกใต้ทะเลที่ฟองอากาศลอยขึ้นและฝูงปลาว่ายผ่านเป็นช่วงๆ กรอบเปลือกหอย และเอฟเฟกต์คลิกฟองอากาศ',
    rarity: 'EPIC',
    items: [
      {
        item_type: 'THEME', name: 'ธีมใต้ทะเลลึก',
        description: 'ปะการัง สาหร่ายแกว่ง ฟองอากาศลอยขึ้นตลอด และฝูงปลาว่ายข้ามจอเป็นระยะ',
        asset_url: '/uploads/ocean-theme.svg', effects: null,
      },
      {
        item_type: 'PROFILE_FRAME', name: 'กรอบปะการังและเปลือกหอย',
        description: 'กรอบสีฟ้าน้ำทะเล ประดับปะการัง เปลือกหอย ปลาดาว และฟองอากาศลอยขึ้น',
        asset_url: '/uploads/frame-ocean.svg', effects: null,
      },
      {
        item_type: 'MOUSE_EFFECT', name: 'ฟองอากาศแตก',
        description: 'คลิกแล้วเกิดคลื่นวงกลมและฟองอากาศลอยขึ้นไปแตก ดับเบิลคลิกแล้วมีปลาพุ่งออกมา',
        asset_url: '',
        effects: [
          { trigger: 'click', fx: 'bubbles', visual: '🫧', color: '#0891b2', size: 36, duration: 2000 },
          { trigger: 'dblclick', fx: 'fish-dash', visual: '🐠', color: '#f97316', size: 40, duration: 2200 },
        ],
      },
    ],
  },
  {
    set_key: 'lantern',
    name_th: 'เซ็ตเทศกาลโคมลอย',
    name_en: 'Lantern Festival Set',
    description_th: 'ธีมฟ้ายามเย็นที่โคมลอยค่อยๆ ลอยขึ้นและมีพลุโชว์เป็นช่วงๆ กรอบโคมทอง และเอฟเฟกต์คลิกพลุ',
    rarity: 'LEGENDARY',
    items: [
      {
        item_type: 'THEME', name: 'ธีมเทศกาลโคมลอย',
        description: 'ฟ้าสีส้มอมม่วงยามเย็น โคมลอยขึ้นฟ้าตลอดเวลา และมีพลุชุดใหญ่จุดขึ้นเป็นระยะ',
        asset_url: '/uploads/lantern-theme.svg', effects: null,
      },
      {
        item_type: 'PROFILE_FRAME', name: 'กรอบโคมทอง',
        description: 'กรอบทองลายไทย มีโคมแขวนแกว่งไปมาและประกายไฟระยิบระยับ',
        asset_url: '/uploads/frame-lantern.svg', effects: null,
      },
      {
        item_type: 'MOUSE_EFFECT', name: 'พลุเฉลิมฉลอง',
        description: 'คลิกแล้วพลุแตกกระจายเป็นประกายหลายสีพร้อมแสงระยิบ ดับเบิลคลิกเป็นพลุรูปหัวใจซ้อนสองชั้น',
        asset_url: '',
        effects: [
          { trigger: 'click', fx: 'firework', visual: '🎆', color: '#f59e0b', size: 40, duration: 2000 },
          { trigger: 'dblclick', fx: 'firework-heart', visual: '🎇', color: '#ec4899', size: 44, duration: 2600 },
        ],
      },
    ],
  },
];

async function migrateCosmeticsRefresh(db) {
  // 1. New sets and their pieces. Keyed by set_key and (set_key, item_type),
  //    like the original seed, so a set an administrator already made by hand
  //    under the same key is left alone.
  for (const set of NEW_SETS) {
    const [existingSet] = await db.query('SELECT set_key FROM shop_sets WHERE set_key = ?', [set.set_key]);
    if (existingSet.length === 0) {
      await db.query(
        `INSERT INTO shop_sets (set_key, name_th, name_en, description_th, price)
         VALUES (?, ?, ?, ?, 0)`,
        [set.set_key, set.name_th, set.name_en, set.description_th],
      );
    }
    for (const item of set.items) {
      const [existing] = await db.query(
        'SELECT item_id FROM shop_items WHERE set_key = ? AND item_type = ? LIMIT 1',
        [set.set_key, item.item_type],
      );
      if (existing.length > 0) continue;
      await db.query(
        `INSERT INTO shop_items
            (name, description, type, item_type, rarity, price, asset_url, effects,
             is_active, is_available, set_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
        [item.name, item.description, item.item_type, item.item_type, set.rarity,
          priceFor(item.item_type, set.rarity), item.asset_url,
          item.effects ? JSON.stringify(item.effects) : null, set.set_key],
      );
    }
  }

  // 2. Prices by type and rarity, for everything on sale that costs something.
  for (const [type, byRarity] of Object.entries(PRICE_BY_RARITY)) {
    for (const [rarity, price] of Object.entries(byRarity)) {
      await db.query(
        `UPDATE shop_items SET price = ?
          WHERE item_type = ? AND UPPER(COALESCE(rarity, 'COMMON')) = ?
            AND is_active = 1 AND is_available = 1 AND price > 0`,
        [price, type, rarity],
      );
    }
  }

  // 3. Every set: the sum of its pieces less 20%.
  const [sets] = await db.query('SELECT set_key FROM shop_sets');
  for (const { set_key: setKey } of sets) {
    const [rows] = await db.query(
      'SELECT COALESCE(SUM(price), 0) AS total FROM shop_items WHERE set_key = ? AND is_active = 1',
      [setKey],
    );
    const total = Number(rows[0]?.total || 0);
    if (total > 0) {
      await db.query('UPDATE shop_sets SET price = ? WHERE set_key = ?', [Math.round(total * SET_DISCOUNT), setKey]);
    }
  }

  // 4. Lesson and mini-game coins x3 (the exercises and mini_game_exercises
  //    views read problem_modes.coin_reward).
  await db.query(
    `UPDATE problem_modes SET coin_reward = coin_reward * ?
      WHERE mode IN ('lesson', 'minigame') AND coin_reward > 0`,
    [REWARD_MULTIPLIER],
  );
}

module.exports = { migrateCosmeticsRefresh, PRICE_BY_RARITY, SET_DISCOUNT, REWARD_MULTIPLIER, NEW_SETS };
