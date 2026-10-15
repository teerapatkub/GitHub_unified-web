# เส้นตายของแต่ละช่วงใน Arcade ใช้นาฬิกาของฐานข้อมูล

**วันที่:** 2026-10-15 22:24

## สรุปสิ่งที่แก้
- `server/arcade/match-api.js` — ตอนเริ่มแมตช์ `phase_deadline` ของ ROUND_1 คำนวณใน SQL ด้วย
  `clock_timestamp() + make_interval(secs => ?)` แทน `new Date(Date.now() + ...)`
- `server/arcade/phase-finalizer.js` — การเลื่อนไป SUMMARY_n, SHOP_n, ROUND_n+1 ใช้นิพจน์ SQL เดียวกัน
  (ค่าคงที่ `NEXT_DEADLINE_SQL`) ภายใน transaction เดิมที่ล็อกห้องไว้อยู่แล้ว
- `server/tests/arcade-settlement.test.js` — เทสใหม่ "phase deadlines follow the database clock when the
  app clock drifts" stub `Date.now` ให้เร็วไป 10 นาที แล้วเริ่มแมตช์และเลื่อนช่วงไป SUMMARY_1 → SHOP_1 → ROUND_2
  ตรวจว่าเวลาที่เหลือ (วัดด้วยนาฬิกาฐานข้อมูล) อยู่ในช่วง (0, ระยะเวลาที่ตั้งไว้]

## เหตุผล
เส้นตายถูกตั้งด้วยนาฬิกาของ app server แต่การตัดสินว่าช่วงเปิด/ปิดและเวลาที่เหลือ (`arcade/phase-clock.js`,
`match-ticker.js`, `submission-api.js`) ใช้ `clock_timestamp()` ของ PostgreSQL บน production
app อยู่ที่ Render และฐานอยู่ที่ Supabase คนละเครื่อง นาฬิกาที่ต่างกันจะยืดหรือหดทุกรอบ ร้านค้า และหน้าสรุปตามนั้น
เป็นเรื่องเดียวกับที่ commit 446aac6 แก้ไปแล้วสำหรับเวลาของเอฟเฟกต์

ก่อนแก้ เทสใหม่ล้มด้วย ROUND_1 เหลือ ~25,860 วินาทีจาก 60 — ไม่ใช่แค่ 600 วินาทีที่ stub ไว้
อีก 7 ชั่วโมงมาจาก timezone: `pg` ส่ง `Date` เป็นเวลาท้องถิ่นของ Node (+07:00) ลงคอลัมน์ `timestamp`
ที่ไม่มี timezone ขณะที่ session ของฐานเป็น UTC จึงเป็นบั๊กอีกตัวที่การคำนวณใน SQL ปิดไปพร้อมกัน
(บน production ทั้งคู่น่าจะเป็น UTC แต่ไม่ควรต้องพึ่งข้อนั้น)

## ผลกระทบ
- ไม่แตะ schema, ไม่แตะ Bot AI — บอทอ่านเส้นตายผ่าน `readPhaseClock` อยู่แล้ว
- ไม่มีที่อื่นใน `server/arcade/` ที่ตั้ง `phase_deadline` จาก `Date.now()` อีก (ตรวจด้วย grep)

## ทดสอบแล้ว
- `npm test` ใน `server/` กับ PostgreSQL 18 ทิ้งได้ (container `postgres:18-alpine` ที่ 127.0.0.1:55432
  ลบทิ้งแล้ว) — 28 + 142 ผ่านทั้งหมด รวมเทสใหม่ (ล้มก่อนแก้ ผ่านหลังแก้)
- `npm run lint` — 0 error, 30 warning (ทั้งหมดอยู่ใน `server.js` เดิม ไม่มีใน `arcade/`)
- `test:tasks`, `test:bot-progress`, `test:targeting`, `test:trialrun` ผ่าน

## ยังไม่ได้ทดสอบ
- `test:score`, `test:draw`, `test:spectator`, `test:bots` ต้องมี server ที่ :3001 และฐานจริง ไม่ได้รัน
- ยังไม่ได้ลองเล่นผ่าน dev server จริง
