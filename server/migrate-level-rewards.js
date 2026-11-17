// Level rewards (fix list item 12, 2026-11-17), as achievements with the
// `level` metric - the same mechanism "เลเวลสิบ" (level 10, 600 coins) already
// used, so they unlock once, retroactively, wherever achievements are checked.
//
// The owner's rule: every 10 levels pays coins, and the "nice" levels - 25,
// 50, 75 and 100 - pay an exclusive cosmetic instead: a frame at each, plus a
// profile picture at 50 and 100. The cosmetics cannot be bought
// (is_available = 0) and cost nothing, like the achievement pictures before
// them.
//
// Two additions the rewards need:
//   - achievement_reward_items: an achievement could hand out one item
//     (achievements.reward_item_id). Levels 50 and 100 hand out two, so the
//     extra ones are listed here; evaluateAchievements grants both.
//   - user_achievements.seen_at: an unlock nobody was told about. Nothing on
//     screen ever announced an achievement; the client now shows a popup for
//     each unseen unlock and marks it seen. Unlocks from before this are
//     marked seen, so nobody is greeted by a pile of old ones.

const LEVEL_ITEMS = [
  { key: 'frame25', item_type: 'PROFILE_FRAME', name: 'กรอบทองแดง Lv.25', rarity: 'EPIC',
    description: 'กรอบทองแดงพร้อมโล่เลข 25 รางวัลเลเวล 25 เท่านั้น ซื้อไม่ได้', asset_url: '/uploads/frame-level-25.svg' },
  { key: 'frame50', item_type: 'PROFILE_FRAME', name: 'กรอบเงิน Lv.50', rarity: 'EPIC',
    description: 'กรอบเงินมีปีกและแสงวิ่งรอบวง รางวัลเลเวล 50 เท่านั้น ซื้อไม่ได้', asset_url: '/uploads/frame-level-50.svg' },
  { key: 'frame75', item_type: 'PROFILE_FRAME', name: 'กรอบทอง Lv.75', rarity: 'LEGENDARY',
    description: 'กรอบทองมีมงกุฎและช่อมะกอก รางวัลเลเวล 75 เท่านั้น ซื้อไม่ได้', asset_url: '/uploads/frame-level-75.svg' },
  { key: 'frame100', item_type: 'PROFILE_FRAME', name: 'กรอบเพชร Lv.100', rarity: 'LEGENDARY',
    description: 'กรอบเพชรสีรุ้งที่หมุนได้ มีเพชรโคจรรอบ รางวัลเลเวล 100 เท่านั้น ซื้อไม่ได้', asset_url: '/uploads/frame-level-100.svg' },
  { key: 'picture50', item_type: 'PROFILE_PICTURE', name: 'นักไพธอนครึ่งร้อย', rarity: 'EPIC',
    description: 'รูปโปรไฟล์งูไพธอนกับเหรียญ 50 รางวัลเลเวล 50 เท่านั้น ซื้อไม่ได้', asset_url: '/uploads/avatar-level-50.svg' },
  { key: 'picture100', item_type: 'PROFILE_PICTURE', name: 'ปรมาจารย์ไพธอน', rarity: 'LEGENDARY',
    description: 'รูปโปรไฟล์งูไพธอนทองสวมมงกุฎ รางวัลเลเวล 100 เท่านั้น ซื้อไม่ได้', asset_url: '/uploads/avatar-level-100.svg' },
];

// Level 10 already exists (600 coins) and is left as it is.
const LEVEL_ACHIEVEMENTS = [
  { code: 'level_twenty', level: 20, name: 'เลเวลยี่สิบ', icon: '⭐', difficulty: 'Hard', coins: 1000 },
  { code: 'level_twentyfive', level: 25, name: 'ทองแดงแห่งความเพียร', icon: '🥉', difficulty: 'Hard', items: ['frame25'] },
  { code: 'level_thirty', level: 30, name: 'เลเวลสามสิบ', icon: '⭐', difficulty: 'Hard', coins: 1500 },
  { code: 'level_forty', level: 40, name: 'เลเวลสี่สิบ', icon: '⭐', difficulty: 'Very Hard', coins: 2000 },
  { code: 'level_fifty', level: 50, name: 'ครึ่งทางสู่ร้อย', icon: '🥈', difficulty: 'Very Hard', items: ['frame50', 'picture50'] },
  { code: 'level_sixty', level: 60, name: 'เลเวลหกสิบ', icon: '🌟', difficulty: 'Very Hard', coins: 3000 },
  { code: 'level_seventy', level: 70, name: 'เลเวลเจ็ดสิบ', icon: '🌟', difficulty: 'Very Hard', coins: 3500 },
  { code: 'level_seventyfive', level: 75, name: 'มงกุฎทองคำ', icon: '🥇', difficulty: 'Very Hard', items: ['frame75'] },
  { code: 'level_eighty', level: 80, name: 'เลเวลแปดสิบ', icon: '💫', difficulty: 'Very Hard', coins: 4000 },
  { code: 'level_ninety', level: 90, name: 'เลเวลเก้าสิบ', icon: '💫', difficulty: 'Very Hard', coins: 5000 },
  { code: 'level_hundred', level: 100, name: 'ปรมาจารย์ไพธอน', icon: '💎', difficulty: 'Very Hard', items: ['frame100', 'picture100'] },
];

const describe = (a) => (a.items
  ? `ไต่ถึงเลเวล ${a.level} รับของตกแต่งพิเศษที่ซื้อในร้านไม่ได้`
  : `ไต่ถึงเลเวล ${a.level}`);

async function migrateLevelRewards(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS achievement_reward_items (
      achievement_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      PRIMARY KEY (achievement_id, item_id))`);
  await db.query('ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS seen_at TIMESTAMP NULL');
  await db.query('UPDATE user_achievements SET seen_at = COALESCE(unlocked_at, CURRENT_TIMESTAMP) WHERE seen_at IS NULL');

  // The reward items, keyed by their art so a second run finds them.
  const itemIds = {};
  for (const item of LEVEL_ITEMS) {
    const [found] = await db.query(
      'SELECT item_id FROM shop_items WHERE asset_url = ? AND item_type = ? LIMIT 1', [item.asset_url, item.item_type]);
    if (found.length > 0) {
      itemIds[item.key] = Number(found[0].item_id);
      continue;
    }
    await db.query(
      `INSERT INTO shop_items (name, description, type, item_type, rarity, price, asset_url, effects, is_active, is_available)
       VALUES (?, ?, ?, ?, ?, 0, ?, NULL, 1, 0)`,
      [item.name, item.description, item.item_type, item.item_type, item.rarity, item.asset_url]);
    const [created] = await db.query(
      'SELECT item_id FROM shop_items WHERE asset_url = ? AND item_type = ? LIMIT 1', [item.asset_url, item.item_type]);
    itemIds[item.key] = Number(created[0].item_id);
  }

  for (const a of LEVEL_ACHIEVEMENTS) {
    const [found] = await db.query('SELECT achievement_id FROM achievements WHERE code = ? LIMIT 1', [a.code]);
    let id = found.length > 0 ? Number(found[0].achievement_id) : null;
    if (!id) {
      // achievements.achievement_id has no default in this schema; the old
      // seed numbered them by hand, so the next free number is used.
      const [[{ next }]] = await db.query('SELECT COALESCE(MAX(achievement_id), 0) + 1 AS next FROM achievements');
      id = Number(next);
      await db.query(
        `INSERT INTO achievements (achievement_id, code, name, description, difficulty, reward_money, metric, threshold, icon, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 'level', ?, ?, 1)`,
        [id, a.code, a.name, describe(a), a.difficulty, a.coins || 0, a.level, a.icon]);
    }
    const items = (a.items || []).map((key) => itemIds[key]);
    // The first item is the one achievements.reward_item_id names (what the
    // achievements page has always shown); the rest go in the extra table.
    await db.query('UPDATE achievements SET reward_item_id = ? WHERE achievement_id = ?', [items[0] || null, id]);
    for (const itemId of items.slice(1)) {
      await db.query(
        `INSERT INTO achievement_reward_items (achievement_id, item_id)
         SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM achievement_reward_items WHERE achievement_id = ? AND item_id = ?)`,
        [id, itemId, id, itemId]);
    }
  }
}

module.exports = { migrateLevelRewards, LEVEL_ACHIEVEMENTS, LEVEL_ITEMS };
