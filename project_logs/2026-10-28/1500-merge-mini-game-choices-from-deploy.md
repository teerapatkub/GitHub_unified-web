# รวมงาน Mini Game ของเพื่อน (commit b4b14b2 จาก repo deploy) เข้า main

**วันที่:** 2026-10-28 ราว 14:00–15:00 (Asia/Bangkok), Person 3
**ที่มา:** ตอน deploy ชั่วคราวบนโน๊ตบุ๊ก (Tailscale Funnel) app ไม่ยอมบูตด้วย `Database migrations are incomplete` ผู้ใช้สั่งให้รวมงานเข้า main

## เกิดอะไรขึ้น

- **เพื่อนในทีม (suphachaikh-creator) push commit `b4b14b2` "แก้ไข MINI_GAME" ไปที่ remote `deploy` เมื่อ 07:18:**
  - remote นี้คือ repo private สำหรับ production
  - commit นี้ต่อจาก snapshot `2bdf285` ไม่ได้ต่อจาก main
- **มีคนรันโค้ดนั้นกับฐาน production:** ฐานจึงบันทึก migration `202610280001 mini_game_choices` ที่ main ไม่รู้จัก
  - server ของ main เจอเวอร์ชันที่ไม่รู้จัก จึงไม่ยอมบูต (fail-closed ตามที่ออกแบบไว้)
- **ฝั่ง Person 3 ก่อนหยุด app:** `up` ของ compose ได้รัน migration ของ main ที่ฐานยังไม่มีแล้ว คือ `202610260001`–`202610270001`
  - ทั้งหมดเป็นแบบเพิ่มอย่างเดียว
  - ผลคือฐาน production มี migration ของทั้งสองฝั่งครบ

## สิ่งที่ทำ

- `git cherry-pick --no-commit b4b14b2` ลง main แล้วแก้ conflict 5 ไฟล์:
  - **`server/migrations/versions.js`, `definitions.js`:** เก็บทั้ง migration ของ main และ `MINI_GAME_CHOICES_VERSION`
  - **`server/server.js`:** รายการ migration เรียงตามเวอร์ชัน: ของ main จนถึง `202610270001` แล้วต่อด้วย `202610280001`
  - **`server/package.json`:** ใช้รายการเทสของ main และเพิ่ม `tests/mini-game-choices-schema.test.js`
  - **`client/src/pages/Login.jsx`:** **ใช้ของ main**
    - ใน `b4b14b2` ไฟล์นี้ถูกเขียนทับด้วยโค้ดเกือบเหมือน `MiNi_Game.jsx` (มี `export default function MiNi_Game`) น่าจะบันทึกผิดไฟล์
    - ไฟล์นี้ไม่มีใคร import ใช้ จึงไม่กระทบหน้าเว็บ
- ไฟล์อื่นของ `b4b14b2` เข้ามาตามนั้น:
  - Mini Game: `MiNi_Game.jsx`, `miniGameGrader.js`, รูป NPC
  - schema: `problemsSchema.js`, `db.js`, `schema.sql`, `seed-content.sql`
  - `runtime/readiness.js`: timeout ตรวจ Auth จาก 3 เป็น 15 วินาที
  - `migrations/index.js`: fingerprint ของ core migration
  - บันทึกงาน 2026-10-28 ของเพื่อน
- คืนไฟล์ `server/.env.example` และ `server/.tailscale.env.example` ที่ถูกลบออกจาก working tree ระหว่างตั้งค่า Tailscale

## ตรวจ checksum กับฐาน production (อ่านอย่างเดียว)

- คำนวณ checksum ของ migration ทุกตัวจากโค้ดที่รวมแล้ว (ต่อฐาน Postgres ในเครื่อง ไม่ใช่ฐานจริง) แล้วเทียบกับ `app_schema_migrations` บน production
- **ตรงทุกตัว** รวม `202610280001` (`45554aae…`)
- `202610120001 core_schema`: โค้ดได้ `e9c63aa7…` ส่วนฐานบันทึก `a32e4337…`
  - ผ่านเพราะ fingerprint ที่เพื่อนเพิ่มไว้ใน `HISTORICAL_FINGERPRINTS`
  - **ข้อสังเกต:** การแก้ input ของ migration ที่รันไปแล้ว ขัดกฎ "ห้ามแก้ migration ที่รันแล้ว" แต่ทำแบบ fail-closed (รับเฉพาะ checksum ที่ระบุ) จึงเก็บไว้

## ทดสอบ

- server `npm test`: pretest 79/79, ชุดหลัก 265/265 (เพิ่มเทส mini-game 6 ข้อ)
- server lint: 0 error (29 warning ไม่เกินเพดาน 30)
- client: lint 0 error, `npm test` 99/99, `npm run build` ผ่าน

## ผลกระทบ

- **schema:** migration ใหม่ `202610280001` (view `mini_game_exercises` เพิ่ม `code_checks` / `isinstance` จาก `problem_modes.extra`) ซึ่งรันบน production ไปแล้ว
- **ไม่แตะตาราง `arcade_*` หรือบอท**
- ต่อไปควร deploy จาก main เท่านั้น ถ้าเพื่อนรันโค้ดจาก remote `deploy` อีก (ซึ่งไม่มี migration `2026102600xx`–`202610270001`) server ของเพื่อนจะไม่ยอมบูต ต้องแจ้งเพื่อนให้ใช้ main

## ยังไม่ได้ทำ

- `npm run test:problems` / `test:grader` / `test:bilingual`: ต้องใช้ฐานที่มีตาราง `*_pre_merge` ซึ่งเครื่องนี้ไม่มี
- แจ้งเพื่อนเรื่อง `Login.jsx`, การ deploy จาก main และการแก้ core migration (บันทึกใน `docs/handoff-to-person-1.md` แล้ว)
