# ปิดช่องให้ผู้เล่นตั้งเลเวลตัวเอง (update-level + แบบวัดระดับตอนสมัคร)

**วันที่:** 2026-10-15 14:10

## ปัญหา
ผู้เล่นที่ล็อกอินอยู่ขึ้นเลเวล 10 เองได้โดยไม่ต้องเรียน แล้วปลดล็อก Competitive/Arcade
(`server/auth/index.js` ล็อกทั้งสองโหมดไว้ที่เลเวล 10)

1. `POST /api/user/update-level` รัน `UPDATE users SET level = ?` ด้วย `level` จาก body
   middleware (`actorMatches`) เช็คแค่ว่า `user_id` เป็นของคนเรียก → ยิง `{user_id: <ตัวเอง>, level: 10}` ได้เลย
2. `POST /api/assessment/submit` เชื่อ `score`, `total_questions`, `selected_level` ที่ client ส่งมา
   (client ไม่ได้เรียก route นี้ แต่ใครก็ยิงได้)
3. `GET /api/advanced-validation` ทำ `SELECT *` → ส่ง `correct_answer` ทุกข้อไปที่เบราว์เซอร์
   `FriendLogin.jsx` ตรวจคำตอบเองในเบราว์เซอร์ แล้วเรียก update-level ด้วยเลเวลที่อยากได้

ผู้เรียก: มีแค่ `client/src/pages/FriendLogin.jsx` (แบบสำรวจตอนสมัคร) ที่เรียก
`update-level` และ `advanced-validation` ไม่มีใครเรียก `assessment/submit`

## สิ่งที่แก้
- **ใหม่** `server/placementRoutes.js` — ทำตามแบบ `promotionExamRoutes.js`
  - `GET /api/advanced-validation` ส่งแค่ `id`, `question_text`, `choices` ไม่มีเฉลย
    (ดึงตัวเลือกด้วย query เดียว แทน N+1 query แบบเดิม)
  - `POST /api/assessment/submit` body `{ option_id, answers: {question_id: choice} }`
    ตรวจบน server กับ `advanced_validation.correct_answer`; เลเวลที่ได้อ่านจาก
    `survey_options.level_value` ของคำถาม `experience` (ไม่รับเลเวลจาก client);
    เกณฑ์ผ่าน `ceil(n*2/3)` = เกณฑ์ `n/1.5` เดิมของ client (10 ข้อ → 7)
  - `POST /api/assessment/beginner` — ตัวเลือก "ยังไม่เคยเลย" 0 → 1
  - ใช้ได้เฉพาะบัญชีที่ยังเลเวล 0 (บัญชีใหม่ถูกสร้างด้วยเลเวล 0 และ FriendLogin โชว์แบบสำรวจเฉพาะตอนนั้น)
    `UPDATE ... WHERE level = 0` → ผู้เล่นที่ออกจากขั้นตอนสมัครแล้วใช้แบบวัดระดับกระโดดไป 10 ไม่ได้
    และส่งซ้ำ/พร้อมกันไม่เปลี่ยนอะไร
  - ผู้กระทำ = `req.player` ไม่อ่าน `user_id` จาก body
- `server/server.js` — **ลบ** `update-level`, `GET advanced-validation`, `POST assessment/submit` เดิม
  และ mount `createPlacementRouter` ต่อจาก promotion exam (แก้เฉพาะสามจุดนี้)
- `client/src/pages/FriendLogin.jsx` — เลิกตรวจคำตอบในเบราว์เซอร์ ส่ง `option_id` + คำตอบ
  แล้วใช้เลเวลที่ server ตอบกลับ; ทางเริ่มต้นเรียก `/api/assessment/beginner`;
  ถ้า server ปฏิเสธ แสดง `alert()` แบบเดียวกับตอนโหลดข้อสอบไม่ได้ (เดิมเงียบ)
- **เทสใหม่** `server/tests/placement.test.js` (อยู่ใน `pretest`, ไม่ต้องใช้ DB) — 8 เทส:
  server.js ไม่มี route เดิมแล้ว, GET ไม่มีเฉลย, score/level จาก client ถูกเมิน,
  ผ่านแล้วได้เลเวลจาก survey option, ขาด 1 ข้อไม่ผ่าน, เลเวล > 0 ได้ 409,
  option ที่ไม่ใช่ experience/เลเวล ≤ 1 ได้ 400, beginner เปลี่ยนแค่ 0 → 1

## ผลกระทบ
- ไม่แตะ schema ไม่เขียนข้อมูล; ไม่กระทบ Bot AI / Arcade
- client เก่าที่ยังเปิดค้างจะเรียก `update-level` ไม่ได้ (404) ต้องรีเฟรชหน้า
- เซิร์ฟเวอร์ที่รันอยู่ต้อง restart ถึงจะโหลด router ใหม่

## ทดสอบแล้ว
- server `npm run pretest` 28/28 ผ่าน (รวม placement 8 เทส)
- server `npm run lint` 0 errors (30 warnings เดิมใน server.js ไม่เพิ่ม); eslint ไฟล์ใหม่สองไฟล์ผ่าน
- client `npm test` 35/35 ผ่าน; `npm run lint` 0 errors (7 warnings เดิม); FriendLogin.jsx ไม่มี warning
- รัน SELECT ทั้งสามของ router กับฐานจริงใน `BEGIN READ ONLY` (Postgres ในเครื่องไม่ได้เปิด จึงใช้
  `DATABASE_URL` ที่ dev server ใช้): 10 ข้อ 40 ตัวเลือก เฉลยทุกข้ออยู่ในตัวเลือก,
  option 13/14 → 10, 12 → 1, option 1 ไม่คืนแถว (→ 400)

## ยังไม่ได้ทดสอบ
- ยังไม่ได้ลองสมัครบัญชีใหม่ผ่านเบราว์เซอร์จนจบแบบสำรวจ: ต้อง restart dev server ที่ session อื่นเปิดไว้
  และสมัครบัญชี Supabase ใหม่ — ควรลองทั้งสามทาง (ยังไม่เคย → 1, ทำแบบวัดผ่าน → 10, ไม่ผ่าน → ทำใหม่/ย้อนกลับ)
- ยังไม่มีเทส HTTP ที่ใช้ Postgres + auth middleware จริงแบบ `promotion-exam-http.test.js`
