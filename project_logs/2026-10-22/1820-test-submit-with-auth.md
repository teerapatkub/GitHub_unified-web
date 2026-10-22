# ซ่อม `npm run test:submit` ให้ทดสอบ endpoint จ่ายรางวัลได้จริงอีกครั้ง

**วันที่:** 2026-10-22 ~18:20

## ปัญหา
`server/scripts/submit-integrity-test.js` ยิง request โดยไม่มี token ตั้งแต่ย้ายไป Supabase Auth
(2026-10-08, ADR 0003) ทุก `/api` route ต้องมี Bearer token ทุก request จึงได้ 401
- ข้อ "ส่งมั่วถูกปฏิเสธ" ผ่านเพราะ 401 ไม่ใช่เพราะตัวตรวจปฏิเสธ — พิสูจน์อะไรไม่ได้เลย
- ข้อ "ตอบถูกได้รางวัล" ล้มทุกครั้ง

## สิ่งที่แก้
- **ใหม่** `server/tests/submit-integrity.test.js` — node:test บูต server จริงด้วย
  `createTestDatabase` + `startServer` (ฐานทิ้งได้บน `TEST_DATABASE_URL`, Supabase token ถูก stub
  ให้ probe player) ส่ง `Authorization` และ `x-pyarena-request` เหมือน client จริง อ่านยอด XP/ทองจากฐาน
- **ลบ** `server/scripts/submit-integrity-test.js` (แทนที่ด้วยไฟล์ข้างบน)
- `server/package.json` — `test:submit` ชี้ไปไฟล์ใหม่ และเพิ่มไฟล์ใหม่เข้า `npm test`

## Scenario ที่ครอบคลุม (ครบทุกข้อของสคริปต์เดิม + เพิ่ม)
1. ส่งโค้ดว่าง → 400, ไม่ได้ XP/ทอง, ไม่มีแถว `is_passed = 1`
2. ส่งคำตอบผิด → 400 พร้อม `passed < total` (ยืนยันว่าเป็นคำตัดสินของ grader ไม่ใช่ 401/validation)
3. `{passed:true}` ไม่มีโค้ด ที่ `/api/learning/ai-task/submit` → 400 โดยใช้ task ที่ดึงมาจริง
   (ไม่ใช่ `taskId: 1` ที่อาจไม่มีอยู่) และ task ยังเป็น `ACTIVE`
4. ตอบถูก → 200 และยอดเพิ่ม **ตรงเป๊ะ** `xp_reward` / `currency_reward` ของแบบฝึกหัด
   (+ ทองจาก achievement ที่ปลดล็อกในครั้งนั้น) — ตั้ง level ผู้เล่นเป็น 50 ก่อน
   เพื่อไม่ให้การเลื่อนเลเวลรีเซ็ต xp แล้วทำให้เทียบยอดไม่ได้
5. (ใหม่) ตอบถูกซ้ำ → `alreadyPassed`, ไม่จ่ายซ้ำ
6. โจทย์ที่ตรวจอัตโนมัติไม่ได้: โค้ดว่างและ starter code เดิมถูกปฏิเสธ ไม่ได้รางวัล ไม่มีแถวผ่าน

## ผลการทดสอบจริง
- `TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres npm run test:submit` → 6/6 ผ่าน
- Mutation check: แก้ `judgeLearnerSubmission` ชั่วคราวให้คืน `accepted: true` เสมอ → ล้ม 4 ข้อ
  (1, 2, 4, 6) แล้ว revert — ยืนยันว่าเทสจับการปล่อยผ่านได้จริง
- `npm test` ทั้งชุด (pretest 73 + test 194 รวมไฟล์ใหม่) → ผ่านทั้งหมด ไม่มีล้ม

## ผลกระทบ
- ไม่ได้แตะตัวตรวจหรือโค้ดจ่ายรางวัล ไม่พบบั๊ก
- `npm run test:submit` ตอนนี้ **ต้องมี `TEST_DATABASE_URL`** (ฐาน Postgres ทิ้งได้) ไม่ต้องรัน server เองแล้ว
  และไม่แตะฐาน dev อีกต่อไป
