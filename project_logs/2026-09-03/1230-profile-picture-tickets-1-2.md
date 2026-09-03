# ระบบรูปโปรไฟล์ — ข้อ 5 ตั๋วที่ 1–2

**วันที่/เวลา**: 2026-09-03 ~12:30

## สรุปสิ่งที่ทำ

ทำตาม `docs/archive/Plan2.md` ข้อ 5 (ระบบรูปโปรไฟล์) ต่อจากเฟส A โดยแตกเป็นตั๋ว vertical slice
และลงมือ **ตั๋วที่ 1–2**:

**ตั๋วที่ 1 — รูป seed ไม่หายตอน redeploy (dual-mount uploads)**
- `.dockerignore` ตัด `server/uploads` ทั้งก้อน รูป seed ของร้าน (ธีม/กรอบ) จึง **ไม่เคยเข้าอิมเมจ**
  เลย + volume `/data/uploads` เริ่มว่าง → 404 บน prod ตั้งแต่ deploy แรก
- ย้ายรูป seed 8 ไฟล์ (`space-theme.png`, `frame-space.svg`, `1782844342595-474510254.png`,
  `frame-sakura.svg`, `pixel-theme.svg`, `frame-pixel.svg`, `cyber-theme.svg`, `frame-cyber.svg`)
  จาก `server/uploads/` → `server/seed-assets/` (ไม่อยู่ใน `.dockerignore` จึง bundle ในอิมเมจ)
- `server/server.js`: เพิ่ม `express.static(seedAssetsDir)` เป็น mount ที่สองใต้ `/uploads`
  (volume ชนะสำหรับไฟล์ผู้ใช้ · seed-assets เป็น fallback) — **ไม่แก้ `asset_url` ใน seed สักตัว**

**ตั๋วที่ 2 — รูปเริ่มต้นตามระดับ resolve ฝั่ง server + แสดงเป็น avatar**
- `server/db.js`: `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url / avatar_source`
- `server/server.js`: เพิ่ม `resolveAvatar()` (`avatar_url ?? รูปตามเลเวล`, เส้นแบ่งเลเวล 10)
  + ค่าคงที่ `AVATAR_SOURCE` · `/api/profile/:userId` คืน `user.avatar = { url, source }`
- รูปเริ่มต้น 2 ใบ `server/seed-assets/avatar-beginner.svg`, `avatar-expert.svg` (SVG placeholder)
- `client/src/pages/ProfilePage.jsx`: วาด `<img>` รูปที่ resolve แล้ว (ผ่าน `assetUrl()`)
  แทนตัวอักษรแรกในวงกลม คงกรอบโปรไฟล์เดิมที่ซ้อนอยู่
- `server/scripts/avatar-test.js` + `npm run test:avatar`: seam ทดสอบระดับ HTTP (ตามแบบ `test:submit`)

## เหตุผล

memory ระบุว่าโปรเจคต้อง deploy ใช้จริง — รูปที่ 404 บน prod คือหน้าพังของผู้ใช้ และรูปโปรไฟล์
เป็นฐานของข้อ 6 (รูปในร้าน) และข้อ 9 (รางวัล achievement เป็นรูป) จึงทำก่อน การตัดสินใจ
"ตัวเลือกรูปตัวเดียวผ่าน `avatar_url`" บันทึกไว้ที่ `docs/adr/0002-avatar-url-is-the-single-selector.md`
คำศัพท์ (รูปโปรไฟล์ / กรอบ / อวาตาร์) เพิ่มใน `CONTEXT.md`

## ผลกระทบต่อส่วนอื่น

- **schema**: เพิ่ม 2 คอลัมน์บน `users` (idempotent, ADD COLUMN IF NOT EXISTS) ไม่กระทบตารางอื่น
- **ร้านค้า (Person 2 ใช้งาน)**: dual-mount ทำให้รูปธีม/กรอบที่เคย 404 บน prod กลับมาแสดง —
  เป็นผลบวก ไม่ได้แก้โค้ดร้าน แค่เพิ่ม static mount + ย้ายไฟล์รูป
- **navbar / leaderboard**: ยังแสดงตัวอักษรอยู่ (ตั๋วที่ 4 ยังไม่ทำ) — ตั้งใจตามขอบเขตรอบนี้

## ทดสอบแล้ว (จริง ไม่ใช่แค่ดูโค้ด)

- `npm run test:avatar` — 9/9 ผ่าน: default beginner (<10), expert (≥10), เส้นแบ่งที่ 10 นับเป็น
  expert, รูปที่ผู้ใช้เลือกชนะ default, seed serve 200, ไฟล์ไม่มีจริง 404
- รัน dev server จริง → เปิด `/profile/:id` ของผู้ใช้เลเวล 3 → เห็นรูปผู้เริ่มต้นเป็นวงกลมจริง
  (แทนตัวอักษร) · ยืนยัน `/api/profile` คืน `{source:'default', url:'/uploads/avatar-beginner.svg'}`
- `npx eslint ProfilePage.jsx` — ผ่าน (error 56 ตัวที่เหลือเป็นของเดิมในไฟล์ที่ไม่ได้แตะ)

## ยังไม่เสร็จ / ต้องทำต่อ

- ตั๋วที่ 3 (อัปโหลดรูป + reset), 4 (navbar/leaderboard), 5 (Google `payload.picture`)
- **พบระหว่างทาง**: `seed-content.sql` อ้างรูป 3 ไฟล์ (`177xxx...jpg/png`) ที่ **ไม่มีในโปรเจคเลย**
  → shop items เหล่านั้นรูปพังอยู่แล้วโดยไม่มีไฟล์ต้นฉบับให้ bundle เป็นบั๊กเดิมนอกขอบเขตข้อ 5
- test script เดิม (`test:shop`, `test:problems` ฯลฯ) hardcode `localhost:5432` จึงพังหลังย้ายไป
  Supabase — `avatar-test.js` อ่าน `DATABASE_URL` แล้ว ตัวอื่นยังไม่ได้แก้ (คนละงาน)
