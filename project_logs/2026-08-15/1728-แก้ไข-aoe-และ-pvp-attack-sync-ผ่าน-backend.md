# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-15 17:28
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ต่อจากรอบก่อนหน้า (แก้ไขจุดที่ 1-4 จากผลรีวิว) รอบนี้แก้ไขจุดที่ 5-6 คือ (5) ไอเทม AOE ยิงแล้วไม่มีผลจริง และ (6) ระบบโจมตีใช้ไม่ได้กับผู้เล่นจริง (ใช้ได้เฉพาะบอท) ผู้ใช้เลือกให้แก้ข้อ 6 แบบสร้างระบบ sync การโจมตีจริงผ่าน backend แทนการปิดปุ่มเฉยๆ

---

## สรุปสิ่งที่แก้ไข

### สถาปัตยกรรมใหม่: คิวส่งมอบเอฟเฟกต์ระหว่างผู้เล่นจริง (`arcade_effects`)

ระบบเดิมเป็น REST polling ล้วน ไม่มี WebSocket และไม่มี endpoint ใดเลยที่ให้ผู้เล่นคนหนึ่งส่งผลกระทบไปยังหน้าจอของผู้เล่นอีกคนได้จริง (บอทใช้ได้เพราะ state ของบอทอยู่ใน browser ของผู้โจมตีเองทั้งหมด) จึงออกแบบกลไกใหม่:

- **`server/db.js`**: เพิ่มตาราง `arcade_effects` เป็นคิวส่งมอบ
  ```sql
  CREATE TABLE IF NOT EXISTS arcade_effects (
      id SERIAL PRIMARY KEY,
      room_id INTEGER NOT NULL REFERENCES arcade_rooms(room_id) ON DELETE CASCADE,
      attacker_name VARCHAR(50) NOT NULL,
      target_name VARCHAR(50) NOT NULL,
      effect_type VARCHAR(30) NOT NULL,
      item_name VARCHAR(100),
      amount INTEGER DEFAULT NULL,
      delivered INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
  ผู้โจมตี insert แถวใหม่ → เป้าหมาย poll แล้วรับไปครั้งเดียว (`delivered` กันไม่ให้รับซ้ำ) ห้องที่ถูกลบจะ cascade ลบ effect ค้างอยู่ไปด้วยอัตโนมัติ

- **`server/server.js`**: เพิ่ม 2 endpoints ใหม่
  - `POST /api/arcade/rooms/:id/attack` — ตรวจว่า attacker/target เป็น participant ของห้องนั้นจริง และ target ยังไม่ถูกคัดออก; ถ้า `effect_type === 'cashSteal'` จะโอนเงินใน `arcade_participants` ทันที (authoritative) แล้ว insert แถวลง `arcade_effects` ด้วยเพื่อแจ้งเหยื่อ; นอกนั้น insert แถวลงคิวอย่างเดียว
  - `GET /api/arcade/rooms/:id/effects?user_name=X` — ดึงเอฟเฟกต์ที่ค้างส่งถึง `X` แล้ว mark `delivered=1`

  **บั๊กที่เจอระหว่างพัฒนา (แก้แล้ว)**: ตอนแรกเขียน `UPDATE arcade_effects SET delivered=1 ... RETURNING ...` โดยหวังว่าจะได้แถวที่อัปเดตกลับมา แต่ `db.js`'s `query()` คืนค่าแถวจริงเป็น array เฉพาะ query ที่ขึ้นต้นด้วย `SELECT/WITH/SHOW` เท่านั้น — สำหรับ `UPDATE`/`INSERT`/`DELETE` (แม้จะมี `RETURNING`) จะถูกแปลงเป็น object สรุปผลแบบ mysql2 (`{command, rowCount, insertId, ...}`) เสมอ ทำให้ `data.effects` ที่ส่งกลับ client เป็น object ก้อนเดียวแทนที่จะเป็น array — client เรียก `.forEach()` แล้วพัง แก้โดยเปลี่ยนเป็น `SELECT` เอาแถวที่ยังไม่ส่งก่อน แล้วค่อย `UPDATE ... WHERE id IN (...)` แยกอีก query เพื่อ mark delivered (ยืนยันด้วยการทดสอบจริงผ่าน curl ก่อน/หลังแก้)

- **`client/src/pages/ArcadeBattleRoyale.jsx`**:
  - เพิ่ม `EFFECT_DURATIONS`/`DEFAULT_EFFECT_DURATION` (ตาราง duration ต่อ effect id ใช้ร่วมกันตอนรับเอฟเฟกต์ที่ส่งเข้ามา)
  - เพิ่ม `dispatchAttack(target, item)` เป็นจุดกลางจ่ายไอเทมโจมตีไปยังเป้าหมายเดียว — เช็กก่อนว่าเป้าหมายเป็นบอท (ใช้ `botManager` เหมือนเดิม, client-local ล้วน) หรือผู้เล่นจริง (ยิง `POST /attack` ไปที่ server) รวม logic cashSteal (ทั้งฝั่งบอทที่หัก `bot.cash` ตรงบน instance และฝั่งคนจริงที่รอ response จาก server) ไว้ที่เดียว
  - แก้ **ข้อ 5 (AOE)**: จากเดิม `else if (item.type === 'aoe') { notify(...) }` (ไม่มีผลอะไรเลย) เปลี่ยนเป็นวนลูป opponent ที่ยังไม่ถูกคัดออกทุกคนแล้วเรียก `dispatchAttack` ให้แต่ละคน
  - แก้ **ข้อ 6 (โจมตีคนจริง)**: จากเดิม branch `attack` เช็ก `botManager.botMap.has()` แล้ว fallback เป็น notify เฉยๆถ้าไม่ใช่บอท เปลี่ยนเป็นเรียก `dispatchAttack` เดียวที่จัดการทั้งบอทและคนจริงถูกต้อง
  - เพิ่ม `playerStateRef` (useRef mirror ของ `playerState`) เพื่อให้ poller ใหม่อ่านสถานะ shield ล่าสุดได้โดยไม่ต้องใส่ `playerState` เต็มก้อนใน dependency array ของ `useEffect` (ซึ่งจะเปลี่ยนทุกครั้งที่พิมพ์โค้ด ทำให้ interval ถูกสร้างใหม่รัวๆ)
  - เพิ่ม `useEffect` ใหม่ที่ poll `GET /effects?user_name=` ทุก 2 วินาทีระหว่างอยู่ในห้อง/รอบแข่ง แล้วนำเอฟเฟกต์ที่ได้มา apply เข้า `playerState.activeEffects` (เช็ก shield ก่อนแบบเดียวกับที่ `botManager.js` ทำตอนบอทโจมตีผู้เล่น) หรือถ้าเป็น `cashSteal` จะหักเงินผู้เล่นเองตามยอดที่ server คำนวณมา

  **ผลพลอยได้**: การรวม logic cashSteal เข้า `dispatchAttack` ทำให้เลิก mutate `opponents` array ตรงๆแบบเดิม (`newOpp[targetIndex].cash -= stolen`) ซึ่งเป็นหนึ่งในจุดที่ผลรีวิวรอบก่อนเคยพบ (ไม่ได้ตั้งใจแก้ข้อนั้นโดยตรง แต่แก้ไปพร้อมกันเพราะโค้ดจุดเดียวกัน) — ก็ยังเหลือจุดเดิมใน `taxCollection` ที่ยังไม่ถูกแตะ

## การทดสอบ (ผ่าน dev server จริงตาม CLAUDE.md)

รันเซิร์ฟเวอร์จริง (`node server.js`) แล้วทดสอบผ่าน `curl` ทีละ endpoint:
1. สร้างห้อง 2 ผู้เล่น (Alice เป็นหัวห้อง, Bob เข้าร่วม)
2. Alice ยิง `mirrorMode` ใส่ Bob → `POST /attack` สำเร็จ → Bob poll `/effects` ได้แถวเอฟเฟกต์จริง (ไม่ใช่ object สรุปผลที่พังตอนแรก) → poll ซ้ำได้ array ว่าง (ไม่ส่งซ้ำ)
3. Bob ยิง `cashSteal` ใส่ Alice → เงินโอนจริงใน `arcade_participants` (Alice 1000→700, Bob 1000→1300) → Alice poll `/effects` ได้แถว `cashSteal` พร้อม `amount: 300`
4. ยิงใส่ตัวเอง → ถูกปฏิเสธด้วย error ตามที่ตั้งใจ
5. ตรวจสอบ `npx eslint` เฉพาะไฟล์ `ArcadeBattleRoyale.jsx` แบบเทียบก่อน/หลัง (ไม่พบปัญหาใหม่จากส่วนที่แก้ — ปัญหา lint ที่มีอยู่ 18 จุดเป็นของเดิมทั้งหมด อยู่นอกส่วนที่แก้ในรอบนี้)
6. รัน `npm run build` ที่ `client/` ผ่านสำเร็จไม่มี error
7. ลบห้องทดสอบทั้งหมดออกจาก DB แล้วตรวจว่า `arcade_effects`/`arcade_participants`/`arcade_rooms` เหลือ 0 แถว (cascade delete ทำงานถูกต้อง)

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ

- **Schema**: เพิ่มตาราง `arcade_effects` ใหม่ (ไม่กระทบตารางเดิม)
- **Network load**: เพิ่ม polling ใหม่ทุก 2 วินาทีต่อผู้เล่น 1 คนระหว่างอยู่ในห้อง (`GET /effects`) นอกเหนือจาก polling เดิม (`fetchRooms` 3s, `fetchRoomState` 2s) — ยังอยู่ในระดับที่ยอมรับได้สำหรับห้องขนาด 5 คน แต่ถ้าจะขยายเป็นห้องใหญ่ขึ้นควรพิจารณาย้ายไป WebSocket ในอนาคต
- **Bot AI**: ไม่กระทบ — เส้นทางบอทยังคง client-local ทั้งหมดผ่าน `botManager` เหมือนเดิม
- **Room Management**: ไม่กระทบ endpoint เดิม เพิ่มใหม่ 2 endpoint ต่อท้ายเท่านั้น

## สิ่งที่ยังไม่เสร็จ / ยังไม่ได้แก้ (เหลือจากผลรีวิวเดิม)

จุดที่ 7-10 ยังไม่ได้แก้: `API_BASE` hardcode `localhost:3001` (ไม่ใช้ vite proxy), การ mutate object ตรงๆที่เหลือใน `taxCollection`, ฟังก์ชัน `simulateBotAttack` dead code, และ CSS effect classes ~118 บรรทัดที่ไม่ถูกอ้างอิงใน `index.css`
