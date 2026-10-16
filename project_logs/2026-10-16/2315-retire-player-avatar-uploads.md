# ตัดการอัปโหลดรูปโปรไฟล์ของผู้เล่น (Spec 0003 ticket 5)

**วันที่:** 2026-10-16 23:15 (Asia/Bangkok)

## เหตุผล

Render แบบฟรีไม่มีดิสก์ถาวร รูปโปรไฟล์ที่ผู้เล่นอัปโหลดจะหายตอน restart แต่บัญชียังชี้ไปที่ไฟล์นั้น จึงขึ้นเป็นรูปแตก
ผู้ใช้ตัดสินใจตัดฟีเจอร์นี้ออก และให้ใช้รูปที่มีในเว็บแทน ได้แก่ รูปเริ่มต้นตามระดับ, Google, ร้านค้า และ achievement

## สิ่งที่แก้

- `server/avatar.js` (ใหม่) — ย้าย `AVATAR_SOURCE`, `resolveAvatar` และ `avatarOptions` (รายการรูปให้เลือก) ออกจาก `server.js` มาไว้ที่เดียว (ADR 0002)
  - `avatar_source = 'upload'` หรือมี `avatar_url` แต่ไม่มี source (ซึ่งเป็นรูปอัปโหลดรุ่นเก่า) จะได้รูปเริ่มต้นตามระดับแทน
  - รายการรูปให้เลือกไม่มีรูปที่อัปโหลดแล้ว
- `server/server.js`
  - `POST /api/profile/:userId/avatar` ตอบ 410 พร้อมข้อความบอกทางเลือก
  - `avatar/select` รับเฉพาะ `google` กับ `shop`
  - เอา multer ของรูปโปรไฟล์ (`avatarUpload`, `uploadStorage`) และ `require('multer')` ที่ไม่ได้ใช้แล้วออก
- `client/src/pages/ProfilePage.jsx` — เอาปุ่ม "อัปโหลดรูป" และ `handleAvatarUpload` ออก ส่วนตัวเลือกรูปเดิมยังทำงาน
- `CONTEXT.md` แก้รูปโปรไฟล์เป็น 4 แหล่ง, `docs/deploy.md`, handoff ถึง Person 1 และ Person 2

## ผลตรวจ

- `server/tests/avatar.test.js` (ใหม่) 5/5 ล้มก่อนแก้ (ไม่มีโมดูล) และผ่านหลังแก้
- server `npm test` (PostgreSQL ชั่วคราว): pretest 41/41, ชุดหลัก 150/150; lint 0 error; `check:undef` ผ่าน
- client `npm test` 39/39, lint 0 error, build ผ่าน
- browser หลัง restart backend (ผู้ใช้ login เป็น pong):
  - หน้า `/profile` ไม่มีปุ่มอัปโหลดและไม่มีช่องเลือกไฟล์
  - รูปของ pong ซึ่งเคยเป็นรูปที่อัปโหลดเอง กลายเป็น `avatar-expert.svg` (เลเวล 10) ทั้งในหน้าโปรไฟล์และ navbar
  - `POST /api/profile/142/avatar` ตอบ 410 และ `avatar/select` แบบ `upload` ตอบ 400

## ข้อสังเกต

- ตัวเลือกรูปของ pong ไม่มี "รูปจาก Google" ทั้งที่ login ด้วย Google แล้ว
  - callback `onOAuthSignIn` ที่เก็บ `google_picture_url` ทำงานเฉพาะตอน `POST /api/auth/oauth/complete` ทำงานจริง
  - บัญชีที่ผูกแล้ว App จะพาไปหน้าอื่นทันที จึงอาจไม่ทันเรียก หรือ Supabase ไม่ได้ส่ง `avatar_url` มา
  - ควรตรวจเป็นงานแยก
- คอลัมน์ `uploaded_picture_url` ยังอยู่ในฐานข้อมูลแต่ไม่ได้ใช้แล้ว
