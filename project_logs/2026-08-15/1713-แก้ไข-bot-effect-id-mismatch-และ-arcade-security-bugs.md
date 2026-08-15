# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-15 17:13
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ผลจากการรีวิวโค้ด (`/code-review`) ที่สโคปเฉพาะ `ArcadeBattleRoyale.jsx`, `client/src/bot/`, `server/db.js`, `server/server.js` พบบั๊ก 10 จุด ผู้ใช้ให้แก้ไขตามลำดับความรุนแรง โดยรอบนี้แก้ไข 4 จุดแรก (จุดที่ 3-4 เรื่อง bot effect id mismatch ก่อน แล้วตามด้วยจุดที่ 1-2 เรื่อง arcade_participants table หายไปและรหัสผ่านห้อง plaintext)

---

## สรุปสิ่งที่แก้ไข

### 1. Bot attack effect-id mismatch (จุดที่ 3-4 จากผลรีวิว)

ปัญหาต้นตอ: มี 3 จุดในระบบที่นิยาม "effect id" ของไอเทมแยกกันคนละชุด แล้วไม่ตรงกัน ทำให้ไอเทมโจมตี/ดีบัฟ (Ink Fog, Freeze, Mirror, Dimmer, Shake) ไม่ทำงานจริงระหว่างผู้เล่นกับบอท

- **`client/src/bot/botAI.js`**:
  - `availableItems` (แคตาล็อกไอเทมที่บอทซื้อ) เปลี่ยน id ให้ตรงกับ `SHOP_ITEMS` ใน `ArcadeBattleRoyale.jsx` ทุกตัว (`freeze`→`timeFreeze`, `mirror`→`mirrorMode`, `dimmer`→`screenDimmer`, `shake`→`screenShake`) และ `type` เปลี่ยนให้เป็นหมวดจริง (`attack`/`aoe`/`buff`) แทนที่จะซ้ำกับ id
  - `receiveAttack()`: เปลี่ยนจาก `type: item.type || item.id` เป็น `type: item.id` เพราะ `item.type` ของไอเทมที่ผู้เล่นยิงมาจาก `SHOP_ITEMS` เป็นแค่หมวด (`'attack'`) ไม่ใช่ชื่อเอฟเฟกต์ — เดิมทำให้บอทไม่โดนเอฟเฟกต์อะไรเลยไม่ว่าผู้เล่นจะซื้อไอเทมไหน
  - `update()`: แก้เช็ก isFrozen จาก `e.type === 'freeze'` เป็น `e.type === 'timeFreeze'` ให้สอดคล้องกับ id ใหม่
- **`client/src/bot/botManager.js`**: แก้ทางเดียวกันสำหรับฝั่งบอทยิงใส่ผู้เล่น — `newEffect.type` เปลี่ยนจาก `item.type || item.id` เป็น `item.id` เพื่อให้ตรงกับที่ `ArcadeBattleRoyale.jsx` เช็กด้วย `checkEffectActive('timeFreeze'|'mirrorMode'|'screenDimmer'|'screenShake')`
- **`client/src/bot/botProfiles.js`**: อัปเดต `favoriteItems` (เมทาดาต้า ยังไม่ถูกใช้งานจริงในระบบเลือกไอเทม) ให้ใช้ id เดียวกันเพื่อไม่ให้สับสนในอนาคต

ยืนยันด้วย `npx eslint` เฉพาะไฟล์ที่แก้ — ไม่มี error/warning ใหม่

### 2. ตาราง `arcade_participants` ไม่เคยถูกสร้าง (จุดที่ 1 จากผลรีวิว)

`server/db.js` มีแค่ `CREATE TABLE IF NOT EXISTS` สำหรับ `arcade_rooms` และ `arcade_tasks` แต่ `server/server.js` query/insert เข้า `arcade_participants` ตลอดทั้งไฟล์ (สร้างห้อง/เข้าห้อง/เตะ/ออก/เพิ่มบอท/โอนหัวห้อง) — ทำให้ทุก flow เหล่านี้พังทันทีบน PostgreSQL instance ใหม่

เพิ่ม `CREATE TABLE IF NOT EXISTS arcade_participants` ใน `server/db.js` (ก่อนตาราง `arcade_tasks`):

```sql
CREATE TABLE IF NOT EXISTS arcade_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES arcade_rooms(room_id) ON DELETE CASCADE,
    user_name VARCHAR(50) NOT NULL,
    is_host INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    cash INTEGER DEFAULT 1000,
    is_eliminated INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (room_id, user_name)
);
```

**หมายเหตุสำคัญ**: จงใจใช้ `INTEGER DEFAULT 0` แทน `TINYINT(1)`/`BOOLEAN` เพราะ `normalizeSql()` ใน `db.js` แปลงคำว่า `TRUE`/`FALSE` เป็น `1`/`0` แบบ blind regex ในทุก query รวมถึง `CREATE TABLE` ด้วย และ PostgreSQL ไม่มี implicit cast จาก integer เป็น boolean ใน `DEFAULT` clause — ทดสอบจริงแล้วพบว่า `BOOLEAN DEFAULT 0` จะ error: `column "x" is of type boolean but default expression is of type integer` ทันทีตอนสตาร์ทเซิร์ฟเวอร์ ส่วน `server.js` เองก็อ่าน/เขียนคอลัมน์เหล่านี้เป็น integer 0/1 อยู่แล้วทุกจุด จึงใช้ `INTEGER` ตรงกับการใช้งานจริงพอดี ไม่ต้องแก้โค้ดฝั่ง `server.js` เพิ่ม
- เพิ่ม `UNIQUE (room_id, user_name)` และ `ON DELETE CASCADE` เพื่อความสมบูรณ์ของข้อมูลระดับ DB (ผู้เล่นซ้ำในห้องเดียวกันไม่ได้ / ลบห้องแล้ว participant ถูกลบตามอัตโนมัติ)

ทดสอบจริงผ่าน `db.js` โดยตรง (ไม่ใช่ mock): เชื่อมต่อ PostgreSQL จริง สร้างตารางสำเร็จ ตรวจ schema ผ่าน `information_schema.columns` ตรงตามที่ออกแบบ

### 3. รหัสผ่านห้องเก็บเป็น plain text (จุดที่ 2 จากผลรีวิว — ละเมิดกฎ CLAUDE.md โดยตรง)

`server/server.js` เดิมเก็บรหัสผ่านห้อง (`arcade_rooms.password`) เป็น plain text และเทียบด้วย `room.password !== password` ตรงๆ ซึ่งขัดกับกฎที่ระบุไว้ใน CLAUDE.md ว่า "รหัสผ่านห้อง (room password) ต้อง hash ก่อนบันทึกลงฐานข้อมูล ห้ามเก็บเป็น plain text" แก้ไขโดยใช้ `bcryptjs` (มี dependency อยู่แล้ว และใช้ pattern เดียวกับระบบ auth ผู้ใช้ที่มีอยู่แล้ว, salt rounds 10):

- `POST /api/arcade/rooms/create`: hash รหัสผ่านด้วย `bcrypt.hash(password.trim(), 10)` ก่อนบันทึก
- `POST /api/arcade/rooms/join`: เทียบรหัสผ่านด้วย `bcrypt.compare(password, room.password)` แทนการเทียบ string ตรงๆ
- `POST /api/arcade/rooms/:id/settings` (หัวห้องแก้ไขรหัสผ่านห้อง): hash รหัสผ่านใหม่ก่อนบันทึกเช่นกัน
- Bonus fix ที่พบระหว่างแก้ (เกี่ยวเนื่องกัน): endpoint `join` และ `GET /api/arcade/rooms/:id` เดิมส่ง `room` object ทั้งก้อนกลับไปที่ client ซึ่งรวม field `password` (แม้จะเป็น hash แล้วก็ไม่ควรส่งออกไปโดยไม่จำเป็น) — เพิ่มการ strip field `password` ออกก่อนส่ง response ทั้งสอง endpoint

ทดสอบจริงด้วยการรัน `node server.js` แล้วยิง request จริงผ่าน `curl`:
1. สร้างห้องพร้อมรหัสผ่าน → ตรวจใน DB ว่าค่าที่บันทึกเป็น bcrypt hash (`$2b$10$...`) ไม่ใช่ plain text
2. เข้าห้องด้วยรหัสผ่านผิด → ได้ error 401 ตามที่ควร
3. เข้าห้องด้วยรหัสผ่านถูก → เข้าได้สำเร็จ, response ไม่มี field `password` หลุดออกมา, `arcade_participants` บันทึกผู้เล่นทั้ง host และผู้เข้าร่วมถูกต้อง
4. ลบห้องทดสอบออกจาก DB แล้ว (cascade ลบ participants ตามไปด้วยอัตโนมัติ ยืนยันว่า FK constraint ทำงานถูกต้อง)

---

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ

- **Schema**: เพิ่มตาราง `arcade_participants` ใหม่ในฐานข้อมูลจริง (ผ่าน `CREATE TABLE IF NOT EXISTS` ตอนสตาร์ทเซิร์ฟเวอร์ — ไม่กระทบข้อมูลเดิมเพราะไม่เคยมีตารางนี้มาก่อน)
- **Bot AI Engine**: การเปลี่ยน effect id ใน `botAI.js`/`botManager.js`/`botProfiles.js` ทำให้พฤติกรรมบอทเปลี่ยนจริง (บอทจะเริ่มโดนเอฟเฟกต์จากไอเทมผู้เล่น และผู้เล่นจะโดนเอฟเฟกต์จากบอทถูกต้องตามภาพ/ระยะเวลาที่ตั้งใจไว้ — ก่อนหน้านี้เอฟเฟกต์เหล่านี้ไม่เคยทำงานจริงเลย) ควรทดสอบเกมเพลย์จริงผ่าน dev server อีกครั้งเพื่อดูภาพ UI ตอนโดนเอฟเฟกต์
- **Room Management**: ห้องเก่าที่อาจถูกสร้างไว้ก่อนหน้านี้ (ถ้ามี) จะยังมีรหัสผ่านเป็น plain text ในฐานข้อมูล เพราะ fix นี้มีผลเฉพาะห้องที่สร้าง/แก้ไขใหม่หลังจากนี้เท่านั้น ไม่ได้ migrate ข้อมูลเก่า

## สิ่งที่ยังไม่เสร็จ / ยังไม่ได้แก้ (เหลือจากผลรีวิวเดิม)

จุดที่ 5-10 จากผลรีวิวยังไม่ได้แก้ไข ได้แก่: ไอเทม AOE (Time Freeze/Blackout) ยังไม่มีผลจริง, ระบบโจมตีใช้ไม่ได้กับเป้าหมายที่เป็นผู้เล่นจริง (ใช้ได้เฉพาะบอท), `API_BASE` hardcode `localhost:3001`, การ mutate opponent object ตรงๆ ใน `cashSteal`/`eliminateBottom`, ฟังก์ชัน `simulateBotAttack` ที่ไม่ถูกเรียกใช้ (dead code), และ CSS effect classes ~118 บรรทัดที่ไม่ถูกอ้างอิงใน `index.css`
