const express = require('express');
const { verifyAdminToken } = require('./adminAccess');

const categories = {
  '/': 'MOUSE_EFFECT',
  '/themes': 'THEME',
  '/frames': 'PROFILE_FRAME',
  '/backgrounds': 'PROFILE_BACKGROUND',
};

const assetPath = (value) => {
  if (typeof value !== 'string' || value.length > 255) return false;
  if (!value) return true;
  if (/^\/(?!\/)/.test(value)) return !/[\\\r\n]/.test(value);
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
};

function validateItem(body, type) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const price = body.price;
  if (!name || name.length > 100) return 'กรุณากรอกชื่อไม่เกิน 100 ตัวอักษร';
  if (!Number.isInteger(price) || price < 0 || price > 2147483647) return 'ราคาต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป';
  if (typeof body.description !== 'string' || body.description.length > 10000) return 'คำอธิบายไม่ถูกต้อง';
  if (!assetPath(body.asset_url) || !assetPath(body.preview_image)) return 'กรุณาใช้ URL รูปภาพแบบ http/https หรือ path ภายในเว็บ ไม่เกิน 255 ตัวอักษร';
  if (type !== 'MOUSE_EFFECT' && !body.asset_url) return 'กรุณาใส่รูปภาพของรายการ';
  if (typeof body.is_active !== 'boolean') return 'สถานะการแสดงในร้านค้าไม่ถูกต้อง';
  if (!Array.isArray(body.effects) || body.effects.length > 30) return 'รายการเอฟเฟกต์ไม่ถูกต้อง';
  if (type === 'MOUSE_EFFECT' && !body.effects.length) return 'กรุณาเพิ่มเอฟเฟกต์อย่างน้อยหนึ่งรายการ';
  for (const effect of body.effects) {
    if (!effect || !['click', 'hover', 'load', 'dblclick'].includes(effect.trigger)
      || typeof effect.visual !== 'string' || !effect.visual.trim() || effect.visual.length > 255
      || (/^(?:https?:|\/)/i.test(effect.visual) && !assetPath(effect.visual))
      || !/^#[\da-f]{6}$/i.test(effect.color)
      || !Number.isFinite(effect.size) || effect.size < 12 || effect.size > 160
      || !Number.isFinite(effect.duration) || effect.duration < 200 || effect.duration > 5000) {
      return 'เอฟเฟกต์ต้องมีภาพหรืออีโมจิ สี ขนาด 12–160 และเวลา 200–5000 มิลลิวินาที';
    }
  }
  return null;
}

// Require a signed login token AND the current database role.
function createThemeRouter(db) {
  const router = express.Router();
  router.use(async (req, res, next) => {
    const userId = verifyAdminToken((req.get('Authorization') || '').replace(/^Bearer /, ''));
    if (!Number.isSafeInteger(userId) || userId <= 0) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบแอดมินใหม่' });
    try {
      const [users] = await db.execute(
        "SELECT user_id FROM users WHERE user_id = ? AND role = 'admin' AND COALESCE(is_deleted, 0) = 0 AND COALESCE(is_banned, 0) = 0",
        [userId]
      );
      if (!users.length) return res.status(403).json({ error: 'เฉพาะแอดมินเท่านั้นที่จัดการรายการได้' });
      next();
    } catch (error) { next(error); }
  });

  // Register collection paths before /:id so /themes, /frames and /backgrounds
  // cannot accidentally be interpreted as an effect id.
  for (const [route, type] of Object.entries(categories)) {
    router.get(route, async (_req, res, next) => {
      try {
        const [items] = await db.execute('SELECT * FROM shop_items WHERE item_type = ? ORDER BY item_id DESC', [type]);
        res.json(items);
      } catch (error) { next(error); }
    });
    router.post(route, async (req, res, next) => {
      const body = req.body || {};
      const error = validateItem(body, type);
      if (error) return res.status(400).json({ error });
      try {
        const [items] = await db.query(
          `INSERT INTO shop_items (name, description, item_type, type, price, asset_url, preview_image, effects, is_active, is_available, rarity)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, 'common') RETURNING *`,
          [body.name.trim(), body.description, type, type, body.price, body.asset_url, body.preview_image,
            JSON.stringify(body.effects), Number(body.is_active), Number(body.is_active)]
        );
        res.status(201).json(items.rows[0]);
      } catch (error) { next(error); }
    });
  }
  for (const [route, type] of Object.entries(categories)) {
    const itemRoute = `${route === '/' ? '' : route}/:id`;
    router.put(itemRoute, async (req, res, next) => {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'หมายเลขรายการไม่ถูกต้อง' });
      const body = req.body || {};
      const error = validateItem(body, type);
      if (error) return res.status(400).json({ error });
      try {
        // Preserve set_key, rarity, ownership and all unrelated fields.
        const [items] = await db.query(
          `UPDATE shop_items SET name = ?, description = ?, price = ?, asset_url = ?, preview_image = ?,
           effects = CASE WHEN item_type = 'MOUSE_EFFECT' THEN ?::jsonb ELSE effects END,
           is_active = ?, is_available = ? WHERE item_id = ? AND item_type = ? RETURNING *`,
          [body.name.trim(), body.description, body.price, body.asset_url, body.preview_image, JSON.stringify(body.effects),
            Number(body.is_active), Number(body.is_active), id, type]
        );
        if (!items.rows.length) return res.status(404).json({ error: 'ไม่พบรายการในหมวดนี้' });
        res.json(items.rows[0]);
      } catch (error) { next(error); }
    });
  }
  router.use((error, _req, res, _next) => {
    console.error('Theme API error:', error.code || error.name);
    res.status(500).json({ error: 'บันทึกหรือโหลดรายการไม่สำเร็จ กรุณาลองใหม่' });
  });
  return router;
}

module.exports = { createThemeRouter, validateItem };
