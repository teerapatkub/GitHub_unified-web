# รายงานบันทึกการพัฒนาโปรเจกต์ (Project Development Log)
**วันที่บันทึก**: 15 สิงหาคม 2026 (2026-08-15)  
**โมดูล**: Arcade Battle Royale (โหมดประลองเอาตัวรอด Real-time 5 คน)  
**สถานะการพัฒนา**: เสร็จสมบูรณ์พร้อมทดสอบระบบ (Completed & Verified)

---

## 📋 1. สรุปภาพรวมสิ่งที่ได้รับการพัฒนา (Executive Summary)

ในรอบการพัฒนานี้ ได้ทำการพัฒนาและเชื่อมต่อระบบหลังบ้าน (Backend) ร่วมกับฐานข้อมูล **PostgreSQL (Port 5432)** และพัฒนาระบบ **Bot AI Engine** อัจฉริยะในไดเรกทอรี `client/src/bot/` เพื่อให้บอทสามารถต่อสู้ แข่งพิมพ์โค้ด ซื้อไอเทม และยิงไอเทมก่อกวนผู้เล่นได้จริงเรียบร้อยแล้ว

---

## 🗄️ 2. การจัดการฐานข้อมูล PostgreSQL (`server/db.js`)

* เพิ่มการสร้างตารางอัตโนมัติเมื่อเซิร์ฟเวอร์เริ่มต้นใช้งาน:
  1. **`arcade_rooms`**:
     * `room_id` (SERIAL PRIMARY KEY)
     * `room_code` (VARCHAR(10) UNIQUE) — รหัสสุ่มประจำห้อง 4 หลัก (เช่น `ARC-YLY4`)
     * `room_name` (VARCHAR(100)) — ชื่อห้องแข่งขัน
     * `host_name` (VARCHAR(100)) — ชื่อผู้สร้างห้อง (Host)
     * `password` (VARCHAR(100) NULL) — รหัสผ่านห้อง (หากเป็น NULL หมายถึงห้องสาธารณะ)
     * `max_players` (INTEGER, 2 ถึง 5 คน) — จำนวนผู้เล่นสูงสุด
     * `status` (VARCHAR(20)) — สถานะห้อง (`WAITING`, `PLAYING`, `FINISHED`)
  2. **`arcade_participants`**:
     * `id` (SERIAL PRIMARY KEY)
     * `room_id` (INTEGER REFERENCES arcade_rooms)
     * `user_name` (VARCHAR(100))
     * `is_host` (INTEGER DEFAULT 0)
     * `score` (INTEGER DEFAULT 0), `cash` (INTEGER DEFAULT 1000)
     * `is_elimination` / `is_eliminated` (INTEGER DEFAULT 0)

---

## 🔌 3. การพัฒนาระบบ Backend REST API (`server/server.js`)

ได้ทำการเพิ่ม 11 Endpoints ใน Express.js เพื่อบริหารจัดการห้องประลอง PostgreSQL:

1. `GET /api/arcade/rooms`: ดึงรายการห้องเปิดรับสมัครสาธารณะ (`status = 'WAITING'`)
2. `POST /api/arcade/rooms/create`: สร้างห้องประลองใหม่ สุ่มรหัส `room_code` ไม่ซ้ำ
3. `POST /api/arcade/rooms/join`: เข้าร่วมห้องประลองด้วยรหัสสุ่มห้องหรือ ID พร้อมตรวจรหัสผ่านและจำนวนคนเต็ม
4. `GET /api/arcade/rooms/:id`: ดึงสถานะห้องและรายชื่อผู้เล่นล่าสุด
5. `POST /api/arcade/rooms/:id/settings`: (สิทธิ์หัวห้อง) ปรับแต่งชื่อห้อง จำนวนผู้เล่น (2-5) หรือรหัสผ่านห้อง
6. `POST /api/arcade/rooms/:id/transfer-host`: (สิทธิ์หัวห้อง) โอนตำแหน่งหัวห้องให้ผู้เล่นอื่น (ป้องกันไม่ให้โอนให้บอท)
7. `POST /api/arcade/rooms/:id/kick`: (สิทธิ์หัวห้อง) เตะผู้เล่นหรือบอทที่ไม่ต้องการออกจากห้อง
8. `POST /api/arcade/rooms/:id/add-bot`: (สิทธิ์หัวห้อง) เพิ่มบอท AI แบบสุ่มชื่อเข้าร่วมห้อง
9. `POST /api/arcade/rooms/:id/start`: (สิทธิ์หัวห้อง) กดเริ่มการแข่งขัน (เปลี่ยนสถานะเป็น `PLAYING` และซ่อนห้องจากหน้ารายการสาธารณะ)
10. `POST /api/arcade/rooms/:id/leave`: ออกจากห้องประลอง (โอนหัวห้องอัตโนมัติหากหัวห้องเดิมออก)
11. `POST /api/arcade/rooms/:id/finish-choice`: เลือกร่วมสนุกต่อ (`REMAIN` - รีเซ็ตคะแนนรอแข่งรอบใหม่ในห้องเดิม) หรือ (`LEAVE` - ออกกลับหน้ารวม)

---

## 🤖 4. สถาปัตยกรรมระบบบอท AI อัจฉริยะ (`client/src/bot/`)

สร้างโครงสร้างโฟลเดอร์แยกต่างหากใน `client/src/bot/`:

* [client/src/bot/botProfiles.js](file:///z:/code/pythonGame/game-test/full_web/unified-web/client/src/bot/botProfiles.js):
  * นิยามบุคลิกของบอท 4 ประเภท:
    * **Speed Coder (`Bot_PyNinja`, `Bot_SyntaxPro`)**: เน้นพิมพ์โค้ดเร็ว ปั๊มคะแนนนำ
    * **Saboteur (`Bot_BugHunter`)**: เน้นเก็บเงินซื้อไอเทมป่วนจอ (หมึกบังตา, แช่แข็ง, โค้ดกลับหัว, สั่นหน้าจอ) ยิงใส่ผู้เล่น
    * **Revenge Seeker (`Bot_NullPointer`)**: จดจำและยิงไอเทมสวนคืนเฉพาะคนที่เคยโจมตีมัน
    * **Balanced Pro (`Bot_CodeMaster`)**: กางเกราะป้องกัน สมดุลการพิมพ์โค้ดและการซื้อไอเทม
* [client/src/bot/botAI.js](file:///z:/code/pythonGame/game-test/full_web/unified-web/client/src/bot/botAI.js):
  * คลาส `BotAIEngine` ควบคุมวงรอบสมองบอท (Coding Simulation, Money Management, Shop Purchases & Attack Targeting)
* [client/src/bot/botManager.js](file:///z:/code/pythonGame/game-test/full_web/unified-web/client/src/bot/botManager.js):
  * คลาส `BotManager` จัดการส่งผลกระทบเรียลไทม์ใส่ผู้เล่น: เมื่อบอทยิงไอเทมใส่ผู้เล่น หน้าจอผู้เล่นจะเกิด Effect ทันที (หมึกบังตา, แช่แข็ง Monaco Editor, ไฟสลัว ฯลฯ) พร้อมป๊อปอัปแจ้งเตือน

---

## 🎨 5. การปรับแต่ง Frontend UI & Navbar (`client/src/pages/ArcadeBattleRoyale.jsx`)

* **Navbar ด้านบน**: เพิ่มปุ่ม **`📖 คู่มือไอเทม 15 ชนิด`** เพื่อเปิดดูคู่มือไอเทมบัฟ/ดีบัฟได้ตลอดเวลา
* **หน้ารายการห้อง (Room Browser)**: แสดงรายการห้องจาก PostgreSQL, ช่องค้นหาด้วยรหัสสุ่ม `ARC-xxxx`, และปุ่ม `➕ สร้างห้องใหม่`
* **หน้าห้องรอ (Pre-Match Lobby)**:
  * ปุ่ม **`🤖 เพิ่มบอท`** (เฉพาะหัวห้อง)
  * ปุ่ม **`⚙️ ตั้งค่าห้อง`** (เฉพาะหัวห้อง)
  * ปุ่ม **`👑 โอนหัวห้อง`** และ **`👢 เตะผู้เล่น`** (ซ่อนปุ่มโอนหัวห้องสำหรับบอท เหลือเฉพาะเตะออก)
* **หน้าสรุปผล (Post-Match Result View)**:
  * ปุ่ม **`🚪 ออกจากห้อง (Leave Room)`**
  * ปุ่ม **`🔄 อยู่ในห้องเดิมต่อ (Remain in Room)`**

---

## 🧪 6. การทดสอบและความถูกต้อง (Verification & Tests)

1. **Vite API Proxy**: กำหนดค่าใน `client/vite.config.js` ให้ Proxy `/api` ไปยัง `http://localhost:3001` ป้องกันข้อผิดพลาด `SyntaxError: Unexpected token '<', "<!doctype "`
3. **Bot AI Engine Verification Test**: รันสคริปต์ `test_bot_engine.js` ทดสอบการกดเพิ่มบอท 3 ตัว ➔ การเตะบอทออก ➔ การจำลองสมองบอทสะสมคะแนน 🪙 Cash ซื้อไอเทม (`🪞 Mirror Code`, `🌫️ Ink Fog`, `📳 Shake Screen`, `❄️ Freeze Editor`) ยิงใส่ผู้เล่นจริง ➔ การกางเกราะป้องกันบอท ➔ ทำการเคลียร์และลบข้อมูลห้องทดสอบออกจาก PostgreSQL 100% (ผลการทดสอบผ่านสมบูรณ์แบบ)
4. **Task Database & Bilingual Seeding**: สร้างตาราง `arcade_tasks` ใน PostgreSQL พร้อมเพิ่มโจทย์การแข่งขัน 25 ข้อ (ง่าย 10, กลาง 10, ยาก 5) ที่รองรับ 2 ภาษา (`title_th`, `title_en`, `desc_th`, `desc_en`, `initial_code`, `test_cases`) เพื่อให้เมื่อผู้เล่นกดสลับภาษา ข้อความโจทย์จะเปลี่ยนตามภาษาไทย/อังกฤษทันที
5. **Cleanup Temporary Log Files**: ทำการลบไฟล์บันทึกการทดสอบชั่วคราว (`server/*.log`) ทั้งหมดในไดเรกทอรี `server/` เพื่อประหยัดพื้นที่ โดยคงโฟลเดอร์ `prototype/` และ `client/src/pages/old plan/` ไว้ตามที่ผู้ใช้ต้องการ
6. **Production Build Verification**: ทดสอบสั่ง `npm run build` ผ่านสมบูรณ์แบบไร้ข้อผิดพลาด (`✓ built in 20.42s`)
