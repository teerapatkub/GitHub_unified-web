// The four original cosmetic sets (Space, Sakura, Pixel Art, Cyber) get the
// canvas click effects the five new sets have (2026-11-17, asked for after fix
// list item 8). Their cursor items were seeded as plain emoji bursts.
//
// Only the `fx` name is added, beside the `visual` that is already there: the
// shop still shows that emoji as the icon, and a client from before this change
// still draws it. An entry that already names an `fx` - one an administrator
// set - is left as it is. Descriptions are rewritten only while they are still
// the seeded text, for the same reason.

const CLASSIC_EFFECTS = {
  space: {
    click: { fx: 'stardust', visual: '✨', color: '#7c3aed', size: 26, duration: 1500 },
    dblclick: { fx: 'planet-orbit', visual: '🪐', color: '#38bdf8', size: 34, duration: 1900 },
    seeded: 'คลิกแล้วมีประกายดาวกระจายตามเมาส์',
    description: 'คลิกแล้วดาวหลากสีกระจายพร้อมดาวตกพุ่งออกไป ดับเบิลคลิกมีดาวเคราะห์โผล่มาพร้อมดวงจันทร์โคจรรอบ',
  },
  sakura: {
    click: { fx: 'sakura', visual: '🌸', color: '#ec4899', size: 26, duration: 2400 },
    dblclick: { fx: 'sakura-bloom', visual: '🌸', color: '#f9a8d4', size: 38, duration: 2800 },
    seeded: 'คลิกแล้วมีกลีบซากุระร่วงตามเมาส์',
    description: 'คลิกแล้วกลีบซากุระพลิ้วกระจายแล้วค่อยๆ ร่วง ดับเบิลคลิกมีดอกซากุระบานแล้วปล่อยกลีบหมุนเป็นเกลียว',
  },
  pixel: {
    click: { fx: 'pixel-pop', visual: '💚', color: '#16a34a', size: 26, duration: 1000 },
    dblclick: { fx: 'pixel-levelup', visual: '👾', color: '#4ade80', size: 36, duration: 1300 },
    seeded: 'คลิกแล้วมีหัวใจกับเหรียญแบบเกม 8 บิตเด้งตามเมาส์',
    description: 'คลิกแล้วหัวใจ เหรียญ ดาว อัญมณีแบบ 8 บิตเด้งขึ้นสลับกันพร้อมคะแนน ดับเบิลคลิกขึ้น LEVEL UP!',
  },
  cyber: {
    click: { fx: 'cyber-spark', visual: '⚡', color: '#e11d8f', size: 26, duration: 900 },
    dblclick: { fx: 'cyber-scan', visual: '💠', color: '#22d3ee', size: 36, duration: 1600 },
    seeded: 'คลิกแล้วมีประกายไฟฟ้าและสัญญาณข้อมูลแล่นตามเมาส์',
    description: 'คลิกแล้วสายฟ้าแลบออกรอบเมาส์พร้อมเลข 0/1 กระจาย ดับเบิลคลิกเป็นวงสแกนหกเหลี่ยมที่ล็อกเป้าแล้วปล่อยไฟฟ้า',
  },
};

const parse = (value) => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

async function migrateClassicSetEffects(db) {
  for (const [setKey, plan] of Object.entries(CLASSIC_EFFECTS)) {
    const [rows] = await db.query(
      "SELECT item_id, effects, description FROM shop_items WHERE set_key = ? AND item_type = 'MOUSE_EFFECT'",
      [setKey],
    );
    for (const row of rows) {
      const effects = parse(row.effects);
      for (const trigger of ['click', 'dblclick']) {
        const entry = effects.find((e) => String(e?.trigger || 'click') === trigger);
        if (!entry) effects.push({ trigger, ...plan[trigger] });
        else if (!entry.fx) entry.fx = plan[trigger].fx;
      }
      const description = row.description === plan.seeded ? plan.description : row.description;
      await db.query(
        'UPDATE shop_items SET effects = ?, description = ? WHERE item_id = ?',
        [JSON.stringify(effects), description, row.item_id],
      );
    }
  }
}

module.exports = { migrateClassicSetEffects, CLASSIC_EFFECTS };
