# ข้อ 9 — รางวัล achievement (เหรียญ / รูปโปรไฟล์พิเศษ)

**วันที่/เวลา**: 2026-09-03 ~17:30 (ต่อจากข้อ 6 ที่ commit `7f14aab`)

## สรุปสิ่งที่ทำ

ขยาย achievement ให้ให้รางวัลได้มากกว่าเหรียญ — เพิ่ม "รูปโปรไฟล์พิเศษ" ที่ได้จากความสำเร็จเท่านั้น:

- **`server/db.js`**:
  - `ALTER achievements ADD COLUMN reward_item_id` (ชี้ `shop_items.item_id`, NULL = เหรียญอย่างเดียว)
  - seed **รูป exclusive 2 แบบ** (แชมป์สนาม/บัณฑิตไพธอน) เป็น `PROFILE_PICTURE` ที่ `is_active=1`
    แต่ **`is_available=0`** (มีให้ครอบครอง/สวมได้ แต่ร้านไม่ขาย) + SVG ใน `seed-assets/`
  - ผูก 2 achievement กับรูป: "จบหลักสูตร" (id 4) → บัณฑิต, "เจ้าสนาม" (id 15) → แชมป์
    (ผูกด้วย asset_url เพราะ item_id auto-increment)
- **`server/server.js`**:
  - `evaluateAchievements` — ตอนปลดล็อก ถ้ามี `reward_item_id` → INSERT `user_inventory`
    (รูปเข้าคลังเดียวกับที่ซื้อจากร้าน จึงโผล่ใน avatar_options และสวมได้ตามระบบข้อ 5/6)
  - `/achievements/:userId` + alias `/api/achievements/:userId` (ให้ dev proxy ผ่าน) — join
    รูปรางวัล, กรองเฉพาะ achievement ที่ใช้งานจริง 20 รายการ, คืน `reward_item_url`/`reward_item_name`
  - shop `/items` และ `/buy` เพิ่ม `AND is_available = 1` → รูป exclusive ไม่โผล่ในร้านและซื้อไม่ได้
- **`client/src/pages/Achievements.jsx`**: เขียนใหม่ทั้งหน้า จาก mock 6 รายการปลอม → ดึงจริง
  20 รายการ, แสดงสถานะปลดล็อก, รางวัลเหรียญ + ป้ายรูปพิเศษที่จะได้, สรุปปลดล็อก/ทั้งหมด/%

## ทดสอบแล้ว (จริง)

- `npm run test:avatar` — **31/31 ผ่าน** รวมข้อ 9:
  - รูป exclusive มีในระบบ 2 แบบ, ไม่โผล่ในรายการร้าน, ซื้อด้วยเหรียญไม่ได้ (404)
  - achievement "เจ้าสนาม" ผูกกับรูปแชมป์ (endpoint บอกรางวัล)
  - **ปลดล็อกจริง**: ตั้ง 10 arcade wins + ซื้อของ → evaluateAchievements มอบรูปแชมป์เข้าคลัง →
    โผล่ใน avatar_options เลือกใช้เป็น avatar ได้
- **dev server จริง**: หน้า Achievements แสดง 20 รายการจริง (2 ปลดล็อก/20/10%) พร้อมสถานะและรางวัล
- shop sanity: ธีมยังลิสต์ครบ (is_available=1), รูปซื้อได้ 3 (exclusive 2 ซ่อน) · lint สะอาด

## ผลกระทบ

- schema: +1 คอลัมน์ achievements · แตะ shop `/items`,`/buy` (เพิ่มเงื่อนไข is_available) —
  ไม่กระทบของที่ขายอยู่เพราะ seed ตั้ง is_available=1 หมดแล้ว
- รูป exclusive ใช้กลไก avatar เดียวกับข้อ 5/6 (owned via inventory, เลือกผ่าน avatar_url)
