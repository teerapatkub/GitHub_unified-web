# ระบบรูปโปรไฟล์ — ข้อ 5 ตั๋วที่ 3–4–5

**วันที่/เวลา**: 2026-09-03 ~15:00 (ต่อจากตั๋วที่ 1–2 ที่ commit `c6153d0`)

## สรุปสิ่งที่ทำ

**ตั๋วที่ 3 — อัปโหลดรูปเอง + ใช้รูปเริ่มต้น**
- `server/db.js`: เพิ่มคอลัมน์ `uploaded_picture_url`, `google_picture_url` (ADD COLUMN IF NOT EXISTS)
- `server/server.js`: multer เฉพาะ avatar (`avatarUpload` — รับเฉพาะ png/jpg/webp, เพดาน 5MB,
  บังคับฝั่ง server) + `POST /api/profile/:userId/avatar` (เซ็ต avatar_url+source='upload'+uploaded_picture_url)
  + `POST /api/profile/:userId/avatar/reset` (avatar_url=NULL → กลับ default, ไม่ลบ uploaded_picture_url)
- `client/src/pages/ProfilePage.jsx`: ปุ่ม "เปลี่ยนรูป" (อัปโหลด) + "ใช้รูปเริ่มต้น" แสดงเฉพาะเจ้าของ,
  validate ชนิด/ขนาดฝั่ง client ก่อนยิง แล้ว refresh navbar ผ่าน `onUserRefresh`

**ตั๋วที่ 4 — avatar แสดงทุกจุด (navbar + leaderboard)**
- `server/server.js`: `/api/user/profile/:userId` (navbar refresh) คืน `avatar {url,source}` ·
  `/api/leaderboard` เติม avatar ต่อแถวด้วย query เดียวคีย์ด้วย username (ไม่แตะ SQL ของ 6 บอร์ด
  ซึ่งสองบอร์ดมี GROUP BY)
- `client/src/App.jsx`: navbar วาด avatar image (`user.avatar.url`) แทนตัวอักษร คงกรอบซ้อน +
  ส่ง `onUserRefresh` ให้ ProfilePage
- `client/src/pages/LeaderboardPage.jsx`: วาด avatar ต่อแถว

**ตั๋วที่ 5 — เก็บรูปจาก Google**
- `server/server.js` `/api/auth/google`: destructure `picture`, เก็บ `google_picture_url` ·
  ผู้ใช้ Google ใหม่ → รูป Google เป็นรูปแรก (avatar_url+source='google') · ผู้ใช้เดิม → จำไว้
  แต่**ไม่ทับ**รูปที่เขาเลือกเองแล้ว
- **ทดสอบ e2e ไม่ได้** เพราะ Google sign-in ถูกบล็อกภายนอก (ยังไม่มี GOOGLE_CLIENT_ID) — โค้ดพร้อม

## เหตุผล / การตัดสินใจสำคัญ

- **ไม่มีชั้น auth ฝั่ง server**: ทุก mutation ในแอปเชื่อ `userId` จาก URL (เช่น showcase) —
  endpoint avatar ทำตาม pattern เดิม ไม่ได้สร้าง auth ครึ่งใบเฉพาะจุดนี้ **auth จริงต่อผู้ใช้
  เป็นงานของ Plan2 ข้อ 4 (OTP/บัญชี) ไม่ใช่ตรงนี้** — validate ชนิด/ขนาดไฟล์บังคับที่ server แล้ว
- resolveAvatar เป็นแหล่งเดียวที่ตัดสินรูป (ADR-0002) navbar/leaderboard/profile เรียกตัวเดียวกัน

## ผลกระทบต่อส่วนอื่น

- แตะ `/api/auth/google` (พื้นที่ Person 2) → ดู `docs/handoff-to-person-2-google-avatar.md`
- `/api/leaderboard`, `/api/user/profile` เพิ่ม field `avatar` — เป็น additive ไม่ลบของเดิม
- schema: +2 คอลัมน์บน users (idempotent)

## ทดสอบแล้ว (จริง)

- `npm run test:avatar` — **19/19 ผ่าน** (รวมของตั๋ว 1–2): อัป .png สำเร็จ+source=upload,
  จำ uploaded_picture_url, ปฏิเสธวิดีโอ/ไฟล์>5MB, reset→default, navbar endpoint คืน avatar,
  ทุกแถว leaderboard (5 แถว) มี avatar, คอลัมน์ google_picture_url พร้อม
- **dev server จริง**: อัปรูป (สีแดง) → profile และ navbar เปลี่ยนเป็นรูปแดงพร้อมกัน →
  กด "ใช้รูปเริ่มต้น" → กลับเป็น default ทั้งสองที่ (ยืนยันด้วยภาพ)
- `npx eslint` ไฟล์ที่แก้: ProfilePage/LeaderboardPage สะอาด · App.jsx มี error 3 ตัวเดิม
  (บรรทัด 3/51/295 ที่ไม่ได้แตะ) ไม่ใช่ของงานนี้

## ยังไม่เสร็จ / หมายเหตุ

- Google e2e รอปลดบล็อก + ตั้ง `GOOGLE_CLIENT_ID`
- picker เต็ม (สลับ default/upload/google/ร้าน/achievement) รอตั๋วข้อ 6/9 — `uploaded_picture_url`
  กับ `google_picture_url` เตรียมไว้ให้แล้ว
- test script เดิมของทีมอื่นยัง hardcode localhost:5432 (พังบน Supabase) — เป็นงานแยก
