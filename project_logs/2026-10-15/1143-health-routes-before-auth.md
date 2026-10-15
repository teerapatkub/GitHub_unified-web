# Health probes ตอบ 401 — ย้ายไปติดตั้งก่อน Auth

**วันที่:** 2026-10-15 11:43 (Asia/Bangkok)

## อาการและสาเหตุ

- `/api/health/live`, `/api/health/ready` และ `/api/health` ตอบ 401 เมื่อไม่มี session
  (บันทึกไว้ใน `project_logs/2026-10-14/2225-start-local-project.md`)
- `installAuth()` ติดตั้ง middleware ตรวจ login แบบ global ที่ต้นไฟล์ `server/server.js`
  ส่วน `installHealthRoutes()` ถูกเรียกเกือบท้ายไฟล์ คำขอทุกเส้นที่ขึ้นต้น `/api/` จึงต้องผ่านตัวตรวจ login ก่อนถึง health route
- startup gate ยกเว้น health path ไว้ถูกต้องแล้ว แต่ Auth ไม่ได้ยกเว้น
- เทสเดิมใน `tests/migrations-startup.test.js` ประกอบแอปขึ้นเองโดยไม่มี Auth จึงไม่เคยเห็นปัญหานี้

## สิ่งที่แก้

- `server/server.js` — เรียก `installHealthRoutes()` ต่อจาก `installStartupGate()` ทันที ก่อน CORS/Auth
  และส่ง `checkReadiness` แบบ lazy (`() => checkReadiness()`) เพราะฟังก์ชันนี้ประกาศไว้ด้านล่างของไฟล์
- `server/tests/health-routes.test.js` (ใหม่) — โหลด `app` จริงจาก `server.js` โดยให้ DB ชี้ไปพอร์ตที่ปิดอยู่
  แล้วยิงแบบไม่มี session: live → 200, ready และ `/api/health` → 503 not-ready, `/api/auth/me` ยังถูก gate (503)
- `server/package.json` — เพิ่มเทสใหม่ใน `pretest` (ไม่ต้องใช้ฐานข้อมูล)

## ผลตรวจ

- เทสใหม่ล้มก่อนแก้ (401) และผ่านหลังแก้
- pretest ทั้งชุด + `tests/migrations-startup.test.js`: 28/28 ผ่าน
- `npm run lint`: 0 error, 30 warning (เท่าเพดานเดิม); `npm run check:undef` ผ่าน; `git diff --check` ผ่าน

## ผลกระทบ

- health route ไม่ผ่าน Auth และ CORS แล้ว ทั้งสามเส้นเป็น GET อ่านอย่างเดียว คืนแค่สถานะกับเวอร์ชัน migration ไม่มีข้อมูลผู้เล่น
- ไม่กระทบ schema, Bot AI หรือ Arcade

## ยังต้องทำ

- backend ที่รันค้างไว้ตั้งแต่ 2026-10-14 (port 3001) ยังเป็นโค้ดเก่า และต่อกับ Supabase จริง
  จึงไม่ได้ restart ให้ ต้อง restart แล้ว `curl` health ทั้งสองเส้นเพื่อยืนยัน
- ยังไม่ได้รัน container smoke ของ D13 ซึ่งใช้ `/api/health/ready` เป็น healthcheck (Docker engine ไม่พร้อม)
