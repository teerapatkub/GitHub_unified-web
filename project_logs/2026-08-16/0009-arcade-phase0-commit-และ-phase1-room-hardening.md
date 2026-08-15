# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-16 00:09
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: เริ่มดำเนินการตามแผน "Arcade Battle Royale → ใช้งานได้จริง + Deploy" (Phase 0 และ Phase 1) หลังผู้ใช้ยืนยันให้จำกัดขอบเขตเฉพาะส่วนของ Person 3

---

## สรุปสิ่งที่แก้ไข

### Phase 0 — Repo Hygiene
- Commit งาน arcade ที่ค้างอยู่จากรอบก่อนหน้าเป็น 1 commit (`85f0f32`): `server/db.js`, `server/server.js` (arcade routes), `client/src/App.jsx`, `client/src/index.css`, `client/vite.config.js`, `client/src/bot/*`, `client/src/pages/ArcadeBattleRoyale.jsx`, `project_logs/*`, และลบไฟล์ log ทดสอบเก่าใน `server/`
- ไฟล์ที่ยังไม่ทราบที่มา (`postgres_dump_latest.sql`, `python_coder_game (2).sql`, `Prototype-1.html`) ปล่อยไว้ตามที่ผู้ใช้ต้องการ ไม่แตะ

### Phase 1 — Harden Room Backend สำหรับผู้เล่นจริง (commit `6c627e1`)
1. **Heartbeat/last_seen**: เพิ่มคอลัมน์ `last_seen` ใน `arcade_participants` (`server/db.js`, มี `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` แบบ idempotent สำหรับฐานข้อมูลที่มีตารางอยู่ก่อนแล้ว) — piggyback การอัปเดตไว้ใน `GET /api/arcade/rooms/:id` ผ่าน query param `user_name` (endpoint นี้ client poll ทุก 2 วินาทีอยู่แล้วตลอดช่วง lobby+match จึงไม่ต้องเพิ่ม network call ใหม่) แก้ `ArcadeBattleRoyale.jsx` ให้ส่ง `?user_name=` ไปด้วย
2. **Stale-connection sweep**: เพิ่ม `sweepStaleArcadeParticipants()` รันทุก 20 วินาทีใน `server.js` ลบผู้เล่นจริงที่ไม่ heartbeat เกิน 45 วินาที (ยกเว้นชื่อขึ้นต้น `Bot_` เพราะบอทจำลองฝั่ง client ไม่ได้ poll เอง) และลบห้องที่เหลือแต่บอทล้วน (ไม่มีมนุษย์เหลืออยู่)
3. **Refactor `/leave`**: ย้าย logic ลบผู้เล่น/โอนหัวห้อง/ลบห้องว่างเป็นฟังก์ชัน `leaveRoom(roomId, userName)` ใช้ร่วมกันระหว่าง route `/leave` ปกติ กับ stale sweep เพื่อไม่ให้ logic ซ้ำซ้อน
4. **Race condition fix**: `POST /api/arcade/rooms/join` เปลี่ยนมาใช้ transaction ผ่าน `db.getConnection()` พร้อม `SELECT ... FOR UPDATE` ล็อกแถวห้องระหว่างเช็คจำนวนผู้เล่น ป้องกันสองคนแย่งช่องสุดท้ายพร้อมกันแล้วเข้าได้ทั้งคู่
5. **Input sanitization**: เพิ่ม helper `sanitizeName(raw, maxLen)` (ตัดอักขระควบคุมและจำกัดความยาว) ใช้กับ `room_name`/`host_name` ใน `/rooms/create`, `user_name` ใน `/rooms/join`, และ `room_name` ใน `/rooms/:id/settings`

## การทดสอบ

ทดสอบผ่าน dev server จริงทั้งหมด (รัน `node server.js` + `npm run dev` พร้อมกัน ไม่ใช่แค่อ่านโค้ด) ตามกติกา CLAUDE.md:
1. `node --check` ทั้ง `server.js` และ `db.js` ผ่าน, `npx eslint` บนไฟล์ arcade (17 จุดเดิม ไม่มีจุดใหม่เพิ่ม ตรงกับ baseline ของรอบก่อน), `npm run build` ผ่านสำเร็จ
2. สร้างห้องจริงผ่าน `curl` แล้วยิง join แข่งกัน 2 คำขอพร้อมกันเพื่อแย่งช่องสุดท้าย (max_players=3, มีคนอยู่แล้ว 2) — ผลลัพธ์ถูกต้อง: คนหนึ่งเข้าได้ อีกคนได้ error "ห้องนี้มีผู้เล่นเต็มจำนวนแล้ว" ไม่มี overbooking
3. ยิง `GET /rooms/:id?user_name=Alice` แล้วตรวจว่า `last_seen` ของ Alice อัปเดตจริงโดยผู้เล่นคนอื่นไม่ถูกกระทบ
4. Backdate `last_seen` ของผู้เล่นทดสอบไปเป็น 90 วินาทีที่แล้วโดยตรงผ่าน DB แล้วรอ sweep (interval 20s) — ผู้เล่นถูกลบออกจากห้องอัตโนมัติภายในรอบถัดไป
5. สร้างห้อง → เพิ่มบอท → หัวห้องมนุษย์ leave (เหลือบอทอย่างเดียว) → รอ sweep — ห้องถูกลบทิ้งอัตโนมัติภายใน ~12 วินาที
6. ทดสอบผ่าน vite proxy จริง (`http://localhost:5174/api/...`) ยืนยันว่า heartbeat query param ทำงานถูกต้องผ่าน proxy เช่นกัน
7. ลบห้องทดสอบทั้งหมดหลังทดสอบเสร็จ (พบว่า sweep ลบให้อัตโนมัติไปแล้วส่วนใหญ่ ยืนยันว่าระบบทำงานจริงในสถานการณ์จริง)

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ

- เพิ่มคอลัมน์ `last_seen` ใน `arcade_participants` — เป็นการเพิ่มแบบ additive/idempotent ไม่กระทบข้อมูลเดิม ไม่กระทบ Bot AI Engine หรือ Room Management เดิม (บอทถูกยกเว้นจาก timeout logic โดยเจตนา)
- `/api/arcade/rooms/join` เปลี่ยนจาก query เดี่ยวเป็น transaction — ผลลัพธ์ response format เหมือนเดิมทุกประการ ไม่กระทบ client ที่เรียกอยู่
- ไม่ได้แตะ route หรือไฟล์ของ Person 1/2 เลย

## สิ่งที่ยังไม่เสร็จ (ต่อตามแผน)

- Phase 1 เหลือ: ทดสอบกับผู้เล่นจริง 5 คน (คนจริงล้วน ไม่ใช่บอท) อย่างน้อย 1 แมตช์เต็ม
- Phase 2: เพิ่ม static-serving ใน `server.js` สำหรับ production, เขียน `Dockerfile`/`docker-compose.yml`/CI
- Phase 3: เลือก hosting จริง (แนะนำ Railway) แล้ว deploy + smoke test
