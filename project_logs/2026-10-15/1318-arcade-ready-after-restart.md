# Arcade ตอบ 503 ทุกครั้งหลัง restart — ให้ความพร้อมของ Arcade ตามสถานะ migration

**วันที่:** 2026-10-15 13:18 (Asia/Bangkok)

## อาการและสาเหตุ

- หลัง restart server บนฐานที่ migrate แล้ว `/api/arcade/*` ทุกเส้นตอบ
  503 `Arcade is unavailable until its database migration succeeds.` (เจอจริงตอนทดสอบกับผู้ใช้ 2026-10-15:
  `GET /api/arcade/rooms` → 503) และ `tickArcadeMatches` / `sweepStaleArcadeParticipants` ไม่ทำงานเลย
- `db.arcadeReady = true` ถูกตั้งไว้ใน `initializeCoreSchema` (`server/db.js`) เท่านั้น ตั้งแต่ D03 (c47c59d)
  ฟังก์ชันนี้คือ core migration `202610120001` ซึ่ง `runMigrations` ข้ามเมื่อเคย apply แล้ว
  บูตครั้งที่สองเป็นต้นไปค่านี้จึงไม่เคยถูกตั้ง

## สิ่งที่แก้

- `server/db.js` — `db.initialize()` ตั้ง `db.arcadeReady` จากผลของ `runMigrations` (`status.ready`)
  ทุกครั้งที่บูต ถ้า migration ล้มจะตั้งเป็น `false` (กันกรณีรอบแรกตั้ง `true` ไปแล้วก่อน transaction rollback)
- **ไม่ได้แก้คอมเมนต์ "Upserted ... on every boot" ภายใน `initializeCoreSchema` ตามที่ขอไว้** เพราะ source ของฟังก์ชันนี้
  ถูกนำไปคำนวณ checksum ของ migration `202610120001` และค่า checksum ตอนนี้ (`a32e4337…`) ถูก pin ไว้ใน
  `HISTORICAL_FINGERPRINTS` ถ้าแก้แม้แต่ตัวอักษรเดียว ฐานที่ migrate แล้วทุกฐาน (รวมฐานบน host) จะบูตไม่ขึ้นด้วย
  `Applied migration 202610120001 differs from the repository` แทนที่จะแก้ในฟังก์ชัน จึงเขียนคอมเมนต์ที่ถูกต้องไว้ข้าง
  `db.initialize()` ซึ่งไม่อยู่ใน checksum (ตรวจแล้วว่า checksum ยังเป็นค่าเดิมหลังแก้) บรรทัด `db.arcadeReady = true`
  ในฟังก์ชันก็ยังอยู่ด้วยเหตุผลเดียวกัน (ไม่มีผลเสียอะไร)
- `server/server.js` — export `startupState` เพิ่ม เพื่อให้เทสเปิด startup gate ได้เหมือนตอน `startApplication()`
- `server/tests/arcade-restart-readiness.test.js` (ใหม่) + `server/tests/helpers/arcade-boot.js` — สร้างฐานข้อมูลใหม่ชั่วคราว
  (`pyarena_restart_<hex>_test`) บน `TEST_DATABASE_URL` แล้วบูตสองครั้ง **คนละ process** (สถานะในหน่วยความจำเริ่มใหม่ทั้งหมด
  เหมือน restart จริง) แต่ละรอบจะ `await db.ready` → `runMigrations(applicationMigrations)` → ยิง `GET /api/arcade/rooms`
  ด้วย cookie session ที่ seed ลงฐานเอง (Auth ทำงานก่อน Arcade gate และ cookie session ไม่ต้องเรียก Supabase)
  ยืนยันว่ารอบสองพบ core migration ถูก apply ไว้แล้ว, ไม่ใช่ 503, ได้ 200 `{success:true, rooms:[]}`
  และ `db.arcadeReady === true` (ticker/sweeper จะทำงาน) จบแล้ว `DROP DATABASE`
- `server/package.json` — เพิ่มเทสใหม่ใน `npm test`

## ผลตรวจ (PostgreSQL 18 container ที่ทิ้งได้ พอร์ต 55432 — ไม่ได้แตะ Supabase)

- เทสใหม่ล้มก่อนแก้ด้วยข้อความ 503 เดียวกับที่ผู้ใช้เจอ และผ่านหลังแก้
- `npm test`: 137/138 ผ่าน (pretest 14/14 ผ่าน) ตัวที่ล้มคือ
  `AOE selects all live opponents once and stores fixed effect expiry for refresh`
  (`expiresAt <= serverNow + 5000`) ล้มเหมือนเดิมตั้งแต่บันทึก D03 2026-10-12 ใช้ fixture ของตัวเอง
  ไม่ได้โหลด `db.js` จึงไม่เกี่ยวกับงานนี้
- `npm run test:migrations:postgres`: 1/1 ผ่าน
- `npm run lint`: exit 0 (0 error, 30 warning เท่าเพดานเดิม)
- `npm run test:arcade`: **ไม่ผ่านทั้งชุด** — `test:tasks` ผ่าน แล้ว chain หยุดที่ `test:score` (ECONNREFUSED :5432)
  รันขั้นที่ไม่ต้องใช้ server แยกทีละตัว: `test:bot-progress` 18/18, `test:targeting` 10/10, `test:trialrun` 9/9 ผ่าน
  ส่วน `test:score`, `test:draw`, `test:spectator`, `test:bots` ต้องมี server ที่ :3001 และส่งคำขอแบบไม่ login
  ซึ่ง middleware Auth ปฏิเสธ (401) ตั้งแต่ระบบ Auth ใหม่ (ดู `server/tests/README.md`: legacy scripts
  "are not part of this authenticated suite") — ไม่ได้รัน

## ผลกระทบ

- ไม่เปลี่ยน schema, ไม่มี migration ใหม่, checksum ของ migration เดิมไม่เปลี่ยน
- Bot AI / ห้อง / ticker ทำงานหลัง restart ได้อีกครั้ง ถ้า core migration ยังไม่สำเร็จ Arcade ยังคงตอบ 503 (fail-closed เหมือนเดิม)

## ยังต้องทำ

- restart backend ที่รันอยู่ (port 3001) ด้วยโค้ดนี้แล้วยืนยันว่า `GET /api/arcade/rooms` ไม่ใช่ 503 — ยังไม่ได้ทำ
  เพราะ backend ตัวนั้นต่อ Supabase จริง
- สคริปต์ `scripts/arcade-tests/` ที่ต้องใช้ server (score/draw/spectator/bots) ต้องทำให้ส่ง session ได้
  ถึงจะใช้เป็น gate ของ `npm run test:arcade` ได้อีกครั้ง
- คอมเมนต์ที่ผิดภายใน `initializeCoreSchema` จะแก้ได้ก็ต่อเมื่อ checksum ของ migration รองรับการแก้แค่คอมเมนต์
  (เช่น normalize คอมเมนต์ออกก่อนคำนวณ hash พร้อมเพิ่ม fingerprint ใน `HISTORICAL_FINGERPRINTS`)
