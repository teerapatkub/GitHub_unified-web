# เพิ่ม route แบบทดสอบเลื่อนขั้นฝั่ง server

**วันที่:** 2026-10-15 13:30

## ปัญหา
`/promotion-exam` แสดง "ไม่สามารถโหลดแบบทดสอบเลื่อนขั้นได้" และ 0/0 ข้อ เพราะ
`GET /api/learning/promotion-exam` ได้ Express 404 — ไม่มี route นี้ใน `server/server.js`
(และไม่มีใน `origin/main`)

ค้นประวัติ: `git log -S promotion-exam --all` เจอแค่ฝั่ง client ทุก commit
route ฝั่ง server **ไม่เคยเข้า git เลย** ไม่ใช่หายตอน merge — log รวมโปรเจค 2026-08-25
บันทึกไว้ในหัวข้อ "endpoint ที่ client เรียกแต่ไม่มีใน server" แล้ว ร่องรอยของโค้ดเดิมมีแค่
error log ใน `fd94742` (`promotion_beginner_passed`, การสร้างข้อสอบด้วย AI ที่ timeout)
log D11 (2026-10-14) ทดสอบแค่ frontend จึงไม่เห็นว่า API ไม่มี

## สิ่งที่แก้
- **ใหม่** `server/promotionExamRoutes.js` — คลังข้อสอบ + router
  - Beginner→Intermediate 10 ข้อ ผ่าน 7 · Intermediate→Advanced 12 ข้อ ผ่าน 9 (ตามสเปกข้อ 13)
  - GET ส่งแค่ prompt/choices ไม่มีเฉลย; POST ตรวจบน server แล้ว UPDATE level บน server
  - ด่านมาจาก `normalizePlayerLevel()` (ส่งเข้ามา ไม่ได้ก๊อปเกณฑ์); ระดับเป้าหมายคือ level ต่ำสุดของ tier ถัดไป
  - ผู้กระทำ = `req.player`; ถ้า `userId` ใน body/query ไม่ตรงได้ 403 (middleware ก็ตรวจอยู่แล้ว)
  - `examId` มีเวอร์ชัน (`beginner_to_intermediate:v1`) ส่งข้อสอบผิดด่าน/หลังเลื่อนแล้วได้ 409
  - `UPDATE ... WHERE level = <ระดับที่ตรวจ>` ส่งพร้อมกันสองครั้งเลื่อนแค่ครั้งเดียว
- `server/server.js` — require + `app.use('/api', createPromotionExamRouter(...))` (2 จุด ไม่แตะส่วนอื่น)
- `client/src/pages/PromotionExamPage.jsx` — แสดงข้อความ error จาก server, ซ่อนบรรทัด 0/0
  เมื่อไม่มีข้อสอบ, ข้อความโหลดไม่อ้าง AI
- **เทสใหม่** `server/tests/promotion-exam.test.js` (อยู่ใน `pretest`, ไม่ต้องใช้ DB) — 6 เทส
  รวมเทสที่ยืนยันว่า `server.js` mount router จริง (ตัวที่จับบั๊กนี้ได้)
- **เทสใหม่** `server/tests/promotion-exam-http.test.js` (อยู่ใน `npm test`) — PostgreSQL จริง +
  Auth middleware จริง: 401 ไม่ล็อกอิน, 403 สวมรอยคนอื่น, ผ่านแล้ว level ใน DB เป็น 2, ส่งซ้ำ 409
- `docs/handoff-to-person-1.md` — บันทึกเพราะเป็นพื้นที่ของ Person 1

## ผลกระทบ
- ไม่มี schema/migration ใหม่ ไม่แตะ Arcade/Bot
- ข้อสอบเป็นทาง "สอบข้ามขั้น" — XP ยังเลื่อนเลเวลตามเดิม ไม่มี cap

## ทดสอบจริง
- `node --test tests/promotion-exam.test.js` 6/6 · `npm run pretest` 19/19
- `promotion-exam-http.test.js` กับ Postgres 18 ใน container ชั่วคราว: ผ่าน
- `npm test` ทั้งชุด (Postgres ชั่วคราวของตัวเอง พอร์ต 55437): 137/138 — ตัวที่ตกคือ
  `arcade-attacks` "AOE ... fixed effect expiry" (`expiresAt <= serverNow + 5000`) ตกซ้ำทุกครั้งเมื่อรันเดี่ยว
  เป็นโค้ด Arcade ที่งานนี้ไม่ได้แตะ น่าจะเป็นเรื่องนาฬิกา container เทียบกับ Node — ยังไม่ได้ตรวจต่อ
- `npm run lint` (server) 0 error · client `npm test` 35/35 · client `npm run lint` 0 error
- คำตอบที่เป็นผลของโค้ดทุกข้อรันเทียบกับ Python จริงแล้ว
- Browser: build client จริง เสิร์ฟผ่าน harness ชั่วคราว (router จริง + ผู้เรียนจำลอง เพราะการล็อกอินจริง
  ต้องผ่าน Supabase) ที่ `/promotion-exam`: โหลด 10 ข้อ → ตอบถูก 6 ได้ "6 / 10 ไม่ผ่าน" →
  แก้เป็นถูก 7 ได้ celebration "Promotion Cleared · LV 2, Beginner → Intermediate" → รีโหลดได้ข้อสอบ
  Intermediate 12 ข้อ ผ่าน 9 → level 3 เห็นข้อความ "อยู่ระดับสูงสุดแล้ว" · 375px ไม่มี horizontal scroll ·
  console error มีแค่ 409 ที่ตั้งใจ

## ยังไม่ได้ทำ / ต้องทดสอบเพิ่ม
- dev server ที่รันอยู่บนพอร์ต 3001 (`node server.js` ไม่ใช่ nodemon) ยังเป็นโค้ดเก่า — ต้องรีสตาร์ตจึงจะเห็น route
  ยังไม่ได้ทดสอบกับบัญชีจริงบนฐานข้อมูล dev
- cap เลเวล, `promotionExamEligible`, คูลดาวน์ — ดูหัวข้อ "ต้องตัดสินใจต่อ" ใน handoff
- ช่องโหว่ที่เจอระหว่างทาง (ไม่ได้แก้ อยู่นอกงานนี้): `POST /api/user/update-level` ให้ผู้เล่นตั้งเลเวลตัวเองได้
  และ `POST /api/assessment/submit` เชื่อ `score` จาก client
