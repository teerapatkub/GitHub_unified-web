# รูปจาก Google ไม่ถูกจำไว้สำหรับบัญชีที่เชื่อมไว้แล้ว — 2026-10-16 21:04

## อาการ
ผู้เล่น pong (user_id 142) เข้าสู่ระบบด้วย Google ผ่าน Supabase (ADR 0004) แล้ว แต่ `google_picture_url` ยังว่าง
ตัวเลือกรูปโปรไฟล์จึงไม่มี "รูปจาก Google"

## สาเหตุ
รูปถูกบันทึกโดย `onOAuthSignIn` ใน `server/server.js` ซึ่งรันใน `POST /api/auth/oauth/complete` เท่านั้น
และ client เรียก endpoint นี้จาก effect ใน `FriendLogin.jsx` เท่านั้น

1. **(ยืนยันจากโค้ด)** ตอนกลับมาจาก Google ที่ `/login?auth=google` ตัว restorer ใน `App.jsx` เรียก `currentPlayer()`
   ก่อน — สำหรับ Auth user ที่ผูกกับผู้เล่นไว้แล้ว คำขอนี้ผ่าน จึงได้ `user.level > 0` แล้ว route `/login`
   `<Navigate>` ออกไปทันที `FriendLogin` ไม่เคย mount → ไม่เคยเรียก `completeOAuthSignIn()`
   รูปจึงถูกบันทึกได้แค่ครั้งแรกที่ผูกบัญชี (ตอนนั้น `currentPlayer()` ยัง 401 จึงอยู่หน้า login ได้)
2. **(กันไว้ ยังไม่ได้ยืนยันกับข้อมูลจริง)** บัญชีที่สมัครด้วยอีเมลแล้วค่อยเชื่อม Google อาจมี `user_metadata`
   ของตอนสมัครอีเมลซึ่งไม่มี `avatar_url`/`picture` — รูปอยู่ใน `identities[provider=google].identity_data`
   การอ่าน `auth.users` / `auth.identities` ของฐานจริงถูกปฏิเสธโดย permission ของ session นี้ จึงยังไม่รู้ว่าข้อ 2 เกิดกับ pong จริงไหม

## แก้
| ไฟล์ | แก้อะไร |
|---|---|
| `client/src/auth/route-access.js` | เพิ่ม `leavesLoginPage({ user, recovery, oauthReturn })` — ไม่ redirect ออกจาก `/login` ระหว่างกลับจาก Google |
| `client/src/App.jsx` | route `/login` ใช้ `leavesLoginPage(...)` แทนเงื่อนไขเดิม (import `isOAuthReturn`) |
| `server/auth/index.js` | `picture` fallback ไปที่ `identity_data.avatar_url/picture` ของ identity Google ถ้า `user_metadata` ไม่มี |
| `client/src/auth/route-access.test.mjs` | เทสว่า `/login` ไม่ redirect ตอน OAuth return แม้ผู้เล่นผูกไว้แล้ว |
| `server/tests/oauth-sign-in.test.js` | เทสผู้เล่นที่ผูกไว้แล้วและ metadata ไม่มีรูป ยังส่งรูป Google ให้ `onOAuthSignIn` |

กติกาเดิมของ `onOAuthSignIn` (ADR 0002, `server/avatar.js`) ไม่เปลี่ยน: มี `avatar_url` ที่ผู้เล่นเลือกอยู่แล้ว
→ อัปเดตแค่ `google_picture_url` ไม่ทับรูปที่เลือกไว้

## ทดสอบจริง
- `node --test src/auth/route-access.test.mjs src/auth/session.test.mjs` (client) — 10/10 ผ่าน
- `node --test tests/oauth-sign-in.test.js` บน PostgreSQL 16 ใน Docker ชั่วคราว (port 55432, ลบแล้ว) — 9/9 ผ่าน
  และเมื่อปิด fallback ชั่วคราว เทสใหม่ล้ม (`not ok 8`) ยืนยันว่าเทสจับบั๊กนี้ได้
- `eslint` ไฟล์ที่แก้ — 0 error (warning `exhaustive-deps` ที่ App.jsx:298 มีอยู่ก่อนแล้ว)

## ผลกระทบ
- ไม่แตะ schema, Bot AI, Arcade
- ผู้เล่นที่ผูกแล้วจะเห็นหน้า login (สถานะกำลังโหลด) ชั่วครู่ระหว่าง `completeOAuthSignIn()` ก่อนถูกส่งไปหน้าเดิม
  ผ่าน `handleLoginSuccess` — เหมือน flow ของผู้เล่นใหม่
- แตะ `App.jsx` และหน้าที่แสดงรูปโปรไฟล์ — บันทึกไว้ใน `docs/handoff-to-person-1.md`

## ทดสอบในเบราว์เซอร์ (21:10)
- รีสตาร์ต backend :3001 (ผู้ใช้อนุญาต) ผู้ใช้เข้าสู่ระบบ Google เป็น pong เองใน browser pane
- `POST /api/auth/oauth/complete` → 200 (ก่อนแก้ไม่ถูกเรียกเลยสำหรับบัญชีที่ผูกแล้ว) ไม่มี error ใน log ของ server
- หน้า `/profile` มีปุ่ม "รูปจาก Google" แล้ว รูปที่ pong เลือกไว้ไม่ถูกเปลี่ยน
- **เจอบั๊กที่สอง**: รูป Google ขึ้นเป็นรูปเสีย (`naturalWidth` 0) เพราะ `lh3.googleusercontent.com`
  ปฏิเสธคำขอที่มี Referer ลองโหลด URL เดียวกันด้วย `referrerPolicy = 'no-referrer'` แล้วได้รูป 96px
  → ใส่ `referrerPolicy="no-referrer"` ให้ `<img>` รูปโปรไฟล์ใน `ProfilePage.jsx` (2 จุด),
  `LeaderboardPage.jsx` (2 จุด), `ModeEntryHeader.jsx` หลัง HMR รูปในตัวเลือกโหลดได้ (96px) และแสดงจริง
- บันทึกลง `docs/handoff-to-person-1.md` แล้วเพราะแตะหน้าของคนอื่น

## ยังไม่เสร็จ
- ยังไม่รู้ว่ารูปของ pong มาจาก `user_metadata` หรือจาก fallback ไปที่ identity ของ Google
  (ไม่ได้รับอนุญาตให้อ่าน `auth.users` / `auth.identities` ของฐานจริง) — เทสฝั่ง server ครอบคลุมทั้งสองทาง
- `oauth/complete` ถูกเรียก 3 ครั้งต่อการเข้าสู่ระบบหนึ่งครั้ง (effect รันซ้ำ) ไม่มีผลเสียเพราะ idempotent
  แต่ควรดูภายหลัง
- ไม่ได้กดเลือก "รูปจาก Google" เพราะจะเปลี่ยนการตั้งค่าของบัญชีจริง
