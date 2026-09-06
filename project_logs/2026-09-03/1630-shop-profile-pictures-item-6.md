# ข้อ 6 — รูปโปรไฟล์ในร้านค้า

**วันที่/เวลา**: 2026-09-03 ~16:30 (ต่อจากข้อ 5 ที่ commit `aeb6552`)

## สรุปสิ่งที่ทำ

เพิ่มชนิดของตกแต่งใหม่ `PROFILE_PICTURE` ในร้านค้า ต่อยอดระบบรูปโปรไฟล์ (ข้อ 5):

- **`server/db.js`**: seed รูปโปรไฟล์ 3 แบบ (แมวส้ม/หุ่นยนต์/นักบินอวกาศ) เป็น `shop_items`
  ชนิด `PROFILE_PICTURE` ราคา 100 เหรียญ (idempotent คีย์ด้วย asset_url) + SVG 3 ไฟล์ใน `seed-assets/`
- **`server/server.js`**:
  - `selectShopAvatar()` — helper ตรวจว่าเป็นเจ้าของรูปนั้นจริง (จาก `user_inventory`) แล้วตั้ง
    `avatar_url` = asset_url, `avatar_source='shop'` (ตัวเลือกเดียวตาม ADR-0002 ไม่มี equipped_*)
  - `POST /api/profile/:userId/avatar/select` {source, itemId} — ตัวเลือกรูปสำหรับ picker
    (upload/google อ่านจากคอลัมน์ที่จำไว้, shop ตรวจ ownership)
  - `/api/shop/equip` เพิ่มสาขา `PROFILE_PICTURE` → เรียก `selectShopAvatar` เดียวกัน (ปุ่ม equip
    ในร้านทำงานได้โดยไม่ยุ่งกับ equipped_frame)
  - `/api/profile/:userId` คืน `avatar_options` — รูปทุกใบที่ผู้ใช้สลับได้ (default + upload +
    google + รูปร้านที่ครอบครอง) พร้อม flag `selected`
- **`client/src/pages/ShopPage.jsx`**: map `PROFILE_PICTURE` → หมวด 'avatars', slot แยกจาก frame,
  สาขา equip ที่ตั้งเป็น avatar ไม่ใช่ frame
- **`client/src/pages/ProfilePage.jsx`**: เปลี่ยนปุ่มเดิมเป็น **picker** — แถวรูปกลมทุกตัวเลือก
  (ไฮไลต์ตัวที่เลือกอยู่) + ปุ่มอัปโหลด กดรูปไหนก็สลับ avatar ทันที (profile + navbar)

## การตัดสินใจ

- รูปโปรไฟล์ **เป็นเจ้าของ**ผ่าน cosmetics inventory เดิม แต่ **เลือกแสดง**ผ่าน `avatar_url`
  จุดเดียว (ADR-0002) ไม่เพิ่ม `equipped_profile_picture_id`
- 3 แบบ/ราคา 100 เหรียญ เป็นค่าเริ่มต้นที่ปรับได้ (แก้ที่ `PROFILE_PICTURES` ใน `db.js`)

## ผลกระทบ

- `/api/profile` เพิ่ม field `avatar_options` (additive) · schema ไม่เพิ่มคอลัมน์ (ใช้ของข้อ 5)
- แตะ `/api/shop/equip` และ ShopPage (พื้นที่ร้าน) — เพิ่มสาขา `PROFILE_PICTURE` ไม่แตะ logic เดิม

## ทดสอบแล้ว (จริง)

- `npm run test:avatar` — **25/25 ผ่าน** (ซื้อ → เหรียญหักตามราคา, เลือกเป็น avatar source=shop,
  avatar_options ถูกต้อง, เลือกรูปที่ยังไม่ซื้อถูกปฏิเสธ 400)
- **dev server จริง**: ผู้ใช้ที่มีรูปแมว/หุ่นยนต์ → profile แสดง picker → กดแมว → avatar เปลี่ยนเป็นแมว
  ทั้ง profile และ navbar (ยืนยันด้วยภาพ)
- lint: ProfilePage สะอาด · ShopPage เหลือ warning เดิม 1 ตัว (บรรทัด 194 ที่ไม่ได้แตะ)

## หมายเหตุ

- ซื้อรูปแรกปลดล็อก achievement "แต่งตัวครั้งแรก" (+40 เหรียญ) — เป็นพฤติกรรมเดิมที่ถูกต้อง
- ไฮไลต์ "รูปที่เลือก" ในหน้าร้านยังไม่ผูกกับ avatar_url (ร้านใช้ equipped_*) — ใช้ picker ในโปรไฟล์
  เป็นที่เลือกหลัก ส่วนนี้ไม่ใช่บั๊กการทำงาน
