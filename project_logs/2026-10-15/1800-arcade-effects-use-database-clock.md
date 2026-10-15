# เวลาของเอฟเฟกต์ Arcade ใช้นาฬิกาฐานข้อมูลตัวเดียว (Spec 0003 ticket 3)

**วันที่:** 2026-10-15 18:00 (Asia/Bangkok)

## อาการ

- เทส "AOE selects all live opponents…" ใน `server/tests/arcade-attacks.test.js` ล้มทุกครั้ง
  ล้มแม้กับ PostgreSQL ในเครื่อง จึงไม่ใช่เรื่องความหน่วงของ hosted database อย่างที่เคยสันนิษฐาน
- `expiresAt` ของเอฟเฟกต์เกิน `serverNow + 5000` ที่ส่งกลับไปใน response

## สาเหตุ

server ใช้นาฬิกาสองตัวปนกัน

- `serverNow`, phase deadline และทุกการเช็คว่าเอฟเฟกต์หมดอายุหรือยัง ใช้นาฬิกาของฐานข้อมูล
  (`clock_timestamp()` ผ่าน `readPhaseClock`)
- เวลาเริ่มของเอฟเฟกต์โจมตีกลับใช้ `Date.now()` ของ Node และอ่านทีหลัง `serverNow`

ผลคือเอฟเฟกต์ยาวเกินกำหนดเสมอ และถ้านาฬิกาของเครื่องแอปกับฐานข้อมูลคลาดกัน
(เช่น Render กับ Supabase บน production) เอฟเฟกต์จะยาวหรือสั้นผิดไปตามระยะที่คลาด
ไอเทมใช้กับตัวเองใน `use-item.js` ก็ใช้ `Date.now()` แบบเดียวกัน

## สิ่งที่แก้

- `server/arcade/attacks.js` — เวลาเริ่มของเอฟเฟกต์ใช้ `clock.nowMs` ที่อ่านจากฐานหลังล็อกผู้เล่น
  ยังเป็นเวลาเดียวสำหรับทุกเป้าหมายของ AOE และยังจับหลังการอ่านข้อมูลผู้เล่นตามเจตนาเดิม
- `server/arcade/use-item.js` — รับ `now` ที่ caller ส่งมาอยู่แล้ว (เวลาจากฐานข้อมูล ทั้งจาก shop API และ bot ticker)
  แทน `Date.now()`
- `server/arcade/shop-api.js` — คำสั่งที่เขียนข้อมูลจะอ่านเวลาจากฐานอีกครั้งก่อนตอบ แล้วใช้เป็น `serverNow`
  และเป็นเวลาที่ใช้กรองเอฟเฟกต์ client จึงไม่เห็นเวลาที่เหลือมากกว่าระยะเวลาเต็มของเอฟเฟกต์
- `server/tests/arcade-attacks.test.js` — เพิ่มเทสที่จำลองให้นาฬิกาของแอปคลาดไป 2 นาที
  แล้วตรวจว่าอายุของเอฟเฟกต์ยังอิงนาฬิกาฐานข้อมูล assertion เดิมของเทส AOE ไม่ได้ผ่อนลง

## ผลตรวจ (PostgreSQL 18 ใน container ชั่วคราว ลบแล้ว)

- เทสใหม่และเทส AOE ล้มก่อนแก้ ผ่านหลังแก้
- `tests/arcade-attacks.test.js`: 23/23 ผ่าน สามรอบติด
- `npm test` ทั้งหมด: pretest 28/28, ชุดหลัก 141/141
- `npm run lint`: 0 error (warning 30 เท่าเพดานเดิม); `npm run check:undef` ผ่าน
- `test:arcade`: `test:tasks`, `test:bot-progress`, `test:targeting` และ `test:trialrun` ผ่าน
  ส่วน `test:score` (ต้องมีฐานบนพอร์ต 5432) และ `test:draw` / `test:spectator` / `test:bots`
  (ต้องมี server รันที่ :3001) ไม่ได้รัน เพราะไม่มี server ทดสอบที่ไม่ใช่ Supabase ที่ใช้ร่วมกัน

## ผลกระทบ

- กระทบ Sabotage และ Bot: ทั้งคนและบอทใช้เวลาเริ่มของเอฟเฟกต์จากฐานข้อมูลเหมือนกัน
- เพิ่ม query อ่านเวลาหนึ่งครั้งต่อคำสั่งร้านค้าที่เขียนข้อมูล
- ไม่กระทบ schema

## ยังต้องทำ

- ยังไม่ได้ทดสอบผ่าน dev server จริงตามกฎของ CLAUDE.md ต้องตรวจตอนทดสอบผ่าน browser ใน ticket 9
- phase deadline ใน `match-api.js` และ `phase-finalizer.js` ยังคำนวณจาก `Date.now()` แล้วนำไปเทียบกับ
  `clock_timestamp()` ของฐาน ถ้านาฬิกาของ Render กับ Supabase คลาดกัน ความยาวของแต่ละเฟสจะเพี้ยนตามระยะที่คลาด
  ควรแก้ให้ใช้นาฬิกาฐานข้อมูลเช่นกันเป็นงานแยก
