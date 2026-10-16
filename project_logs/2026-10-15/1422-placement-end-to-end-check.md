# ตรวจแบบวัดระดับตอนสมัครแบบครบทาง หลังปิดช่องตั้งเลเวลเอง

**วันที่:** 2026-10-15 14:22
**ต่อจาก:** `1410-placement-level-lockdown.md` (ข้อ "ยังไม่ได้ทดสอบ" ทั้งสองข้อของบันทึกนั้น)

## สิ่งที่เพิ่ม
- **ใหม่** `server/tests/placement-http.test.js` — ทำแบบเดียวกับ `promotion-exam-http.test.js`
  (PostgreSQL จริง + `installAuth` จริง ผ่าน `tests/helpers/arcade-fixture.js` สตับแค่ตัวตรวจ token ของ Supabase)
  สร้างตาราง `survey_*` / `advanced_validation*` ตามรูปใน `schema.sql` และตัวเลือก 12/13/14 ตาม seed ใน `db.js`
  ครอบคลุม:
  - ไม่ได้ล็อกอิน → 401 ทั้ง `GET /api/advanced-validation`, `POST /api/assessment/submit`, `POST /api/assessment/beginner`
  - `GET /api/advanced-validation` ได้แค่ `id`, `question_text`, `choices` ไม่มี `correct_answer`
  - บัญชีเลเวล 0 ส่งคำตอบถูกพร้อม `score`/`level`/`selected_level` ปลอม → ผ่าน, ในฐานเป็นเลเวล 10, เรียก achievements ครั้งเดียว
  - บัญชีเลเวล 0 ถูก 1 จาก 3 (ต้อง 2) แต่อ้าง `score: 3` → ไม่ผ่าน, ในฐานยังเป็น 0
  - `POST /api/user/update-level` ด้วย `user_id` ตัวเอง → 404, เลเวลไม่เปลี่ยน
  - `POST /api/assessment/beginner` 0 → 1 แล้วบัญชีเดียวกันส่ง submit → 409, ยังเป็น 1
- `server/package.json` — เพิ่มเทสนี้ใน `npm test` ต่อจาก `promotion-exam-http.test.js`

ไม่ได้แก้โค้ดของแอปเลย (ไม่แตะ `placementRoutes.js`, `server.js`, `FriendLogin.jsx`, schema)

## ผลเทส (PostgreSQL 18 ใน container ชั่วคราว พอร์ต 55432, tmpfs, ลบแล้ว — ไม่ได้แตะฐานจริง/Supabase)
- `npm run pretest`: 28/28 ผ่าน
- `npm test`: 139/140 ผ่าน (pretest 28/28) — `placement-http` ผ่าน; ตัวที่ล้มคือ
  `AOE selects all live opponents once and stores fixed effect expiry for refresh` ใน `arcade-attacks.test.js`
  ล้มแบบเดิมตั้งแต่บันทึก D03 (2026-10-12) ไม่เกี่ยวกับงานนี้
- `npm run lint`: 0 errors, 30 warnings (เท่าเดิม); `npx eslint tests/placement-http.test.js` สะอาด

## ทดสอบในเบราว์เซอร์จริง
ไม่ได้ restart dev server :3001 ของ session อื่น และไม่ได้สมัครบัญชีผ่าน Supabase จริง แต่:
build client ไปไว้นอก repo แล้วบูต `node server.js` จริงบน **:3301** ด้วย `DATABASE_URL` ชี้ฐานใหม่เปล่าใน container
(บูตจาก `schema.sql` + `seed-content.sql` → แบบสำรวจ 4 ข้อ + แบบวัดระดับ 10 ข้อจริง) สร้างบัญชีเลเวล 0 สามบัญชี
พร้อม cookie session (`player_google_sessions` — ทางเดียวกับที่ Google login ใช้) แล้วกดผ่าน FriendLogin:

| บัญชี | ทาง | ผล |
|---|---|---|
| ui_beginner | ตอบ 3 ข้อแรก → "ยังไม่เคยเลย" | `POST /api/assessment/beginner` 200 → ไป `/learn` แสดง Lv 1, ในฐาน `level = 1` |
| ui_passer | "เคยเขียนภาษาอื่นมาบ้าง" → ตอบถูก 10/10 → กด "ส่งแบบทดสอบ" | `submit` 200 → `/learn`, ป้ายล็อก Competitive/Arcade หายไป, ในฐาน `level = 10` (ได้เหรียญ 600 จาก achievements) |
| ui_failer | "เขียน Python ได้อยู่แล้ว" → ถูก 6/10 | `submit` 200 `{score:6, passScore:7, passed:false}` → หน้า "ไม่ผ่านการทดสอบ" มีปุ่ม "ทำอีกครั้ง" (กลับข้อ 1 คำตอบว่าง) และ "ย้อนกลับเลือกระดับใหม่"; หลังย้อนกลับเลือก "ยังไม่เคยเลย" → `level = 1` |

เพิ่มเติมบนเซิร์ฟเวอร์จริงด้วย session ที่ล็อกอินอยู่: `POST /api/user/update-level {user_id, level:10}` → 404,
`GET /api/advanced-validation` 10 ข้อ คีย์ `id, question_text, choices` ไม่มี `correct_answer`
คำตอบแบบสำรวจถูกบันทึกลง `user_survey_responses` ครบ 4 ข้อทุกบัญชี
console error มีแค่ 401 ของ `/api/auth/me` ก่อนตั้ง cookie และ 404 ที่ยิงทดสอบเอง; log ของ server ไม่มี error

## พบระหว่างทดสอบ (ยังไม่ได้แก้ — นอกขอบเขตงานนี้)
- **ปุ่ม "ย้อนกลับเลือกระดับใหม่" พากลับไปคำถามที่ 3 (เวลาเรียน) ไม่ใช่คำถามที่ 4 (ประสบการณ์)**
  `goBackToExperience` ใน `client/src/pages/FriendLogin.jsx` หา `s.id === 3` แต่คำถาม experience คือ id 4
  (ควรหาด้วย `s.key === "experience"` แบบเดียวกับ `handleSelectSurvey`) ไม่ทำให้ติด — ผู้ใช้ตอบข้อ 3 ใหม่แล้วไปข้อ 4 ได้
  มีมาตั้งแต่ `fd94742` (2026-07-17) ไม่ได้เกิดจาก lockdown

## ผลกระทบ
- เพิ่มเทสหนึ่งไฟล์ใน `npm test` (ต้องมี `TEST_DATABASE_URL` เหมือนเทส HTTP ตัวอื่น) ไม่กระทบ schema, Bot AI, Arcade

## ยังไม่ได้ทดสอบ
- ยังไม่ได้ลองผ่าน dev server :3001 / Vite :5174 จริง (server ตัวนั้นต้อง restart ถึงจะโหลด router ใหม่) และยังไม่ได้ลองสมัครผ่าน Supabase Email จริง
  — การทดสอบใช้ build เดียวกันกับโค้ดปัจจุบัน แต่ล็อกอินด้วย cookie session แทน
