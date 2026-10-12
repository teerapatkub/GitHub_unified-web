# D03 — Versioned migrations และ fail-closed startup

**วันที่:** 2026-10-12 เวลา 13:09 (Asia/Bangkok)

## ผลลัพธ์

- เพิ่มทะเบียน `app_schema_migrations` พร้อม version, name, SHA-256 checksum และเวลาที่ใช้ migration
- serialize การเริ่มพร้อมกันด้วย PostgreSQL advisory transaction lock และใช้ transaction เดียวกับ metadata
- รองรับ nested transaction ของ migration เดิมด้วย savepoint บน connection เดียวกัน
- fresh database ติดตั้ง schema, seed, Arcade, Learning, Competitive และ Auth schema แบบ atomic
- migration ที่ล้มเหลว rollback ทั้ง schema change และทะเบียน สามารถ retry ได้
- readiness เป็น read-only และปฏิเสธ migration ที่ขาด, checksum เปลี่ยน หรือมี version ที่ binary ไม่รู้จัก
- แยก `/api/health/live` ออกจาก `/api/health/ready`; ระหว่าง startup เปิดเฉพาะ health traffic และคืน 503 ให้ API, SPA และ CORS preflight อื่น
- เริ่ม Arcade ticker, stale-room sweep และ history cleanup หลัง migration สำเร็จเท่านั้น
- readiness ตรวจ PostgreSQL, migration version, Supabase URL/secret/publishable configuration และ Supabase Auth health โดยตรง พร้อม timeout/cache
- runtime environment มีลำดับสูงกว่า `server/.env` เพื่อให้ค่าจาก deploy platform ไม่ถูกไฟล์ local เขียนทับ
- เพิ่ม Docker HEALTHCHECK และเอกสารตัวแปร/วิธีทดสอบ migration

## การตรวจสอบ

- `npm run test:migrations` — ผ่าน 9/9
- `node --test --test-concurrency=1 tests/auth.test.js tests/migrations-startup.test.js` — ผ่าน 24/24
- `npm run test:migrations:postgres` กับ PostgreSQL 16 container ที่ทิ้งได้ — ผ่าน fresh install, repeat, concurrent starters, Auth tables และ forced rollback 1/1
- Supabase Auth readiness probe กับ project จริงแบบ read-only — ผ่าน
- `client npm test` — ผ่าน 8/8
- `client npm run build` — ผ่าน; มี warning เดิมเรื่อง Browserslist, `eval` ใน `MiNi_Game.jsx` และ bundle ขนาดใหญ่
- syntax checks และ `git diff --check` — ผ่าน
- code/spec review รอบสุดท้าย — ไม่พบข้อผิดพลาด D03 ที่ต้องแก้เพิ่ม

## ข้อสังเกตนอกขอบเขต D03

`server npm test` ทั้งชุดต้องใช้ `TEST_DATABASE_URL`; เมื่อรันกับ PostgreSQL ทดสอบ พบ regression เดิมใน
`AOE selects all live opponents once and stores fixed effect expiry for refresh`: ค่า `serverNow` ถูกเก็บก่อน
เวลาเริ่มเอฟเฟกต์ `timeFreeze` ทำให้ assertion 5 วินาทีเกินเล็กน้อย งาน D03 ไม่แก้กติกา Arcade จุดนี้
และชุดทดสอบเฉพาะ D03/Auth รวมถึง PostgreSQL acceptance ผ่านทั้งหมด
