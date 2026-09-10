# Code-review follow-up — ระบบรูปโปรไฟล์ (Plan2 ข้อ 5–9)

**วันที่/เวลา**: 2026-09-10 ~14:00 (ตามหลัง `/code-review` ของทั้งฟีเจอร์ `aaf5053..HEAD`)

## บริบท

รัน `/code-review` สองแกน (Standards + Spec) บนทั้งฟีเจอร์รูปโปรไฟล์ 7 commit
พบประเด็นที่ต้องแก้ 3 จุด (2 จาก Standards, 1 จาก Spec) — commit นี้แก้ทั้งหมด

## สิ่งที่แก้

1. **`server/db.js`** (Standards) — เดิม set `reward_item_id` ด้วย template literal ที่ interpolate
   ternary เข้าไปในสตริง SQL แม้ค่าที่ฝังเป็น literal คงที่ (ไม่มีข้อมูลผู้เล่น = ไม่มีช่อง injection)
   แต่กฎ CLAUDE.md เขียนห้าม string concatenation SQL แบบไม่มีข้อยกเว้น → แยกเป็นสอง query
   คงที่ที่เลือกด้วย `if (a.reward_asset)`
2. **`server/server.js` `/avatar/select`** (Standards) — เดิม `SELECT ${column} AS url` interpolate
   ชื่อคอลัมน์ → เปลี่ยนเป็น SELECT ทั้งสองคอลัมน์แล้วเลือกใน JS ตาม source
3. **`server/server.js` `/api/profile/:userId`** (Spec, บั๊กจริงถึงมือผู้เล่น) — query ผู้ใช้ไม่ได้
   SELECT `uploaded_picture_url, google_picture_url` แต่โค้ดสร้าง `avatar_options` อ่านสองค่านี้
   (บรรทัด ~1524-1525) → ทั้งคู่เป็น `undefined` เสมอ ตัวเลือก "รูปที่อัปโหลด"/"รูปจาก Google"
   จึงไม่เคยแสดง ผู้ใช้ที่อัปรูปแล้วสลับไปรูปอื่น **สลับกลับมารูปที่อัปไม่ได้ผ่าน UI**
   ทั้งที่ `/avatar/select` รองรับ `source:'upload'` → เพิ่มสองคอลัมน์เข้า SELECT

## เทสต์ที่เพิ่ม

- **`server/scripts/avatar-test.js`** — เพิ่ม assertion ว่า `/api/profile` คืนตัวเลือก
  `source:'upload'` ใน `avatar_options` จริง (ช่องโหว่ที่ทำให้บั๊กข้อ 3 หลุด: เดิมเทสต์เช็ค
  แค่คอลัมน์ใน DB กับตัวเลือก shop ไม่เคยเช็คตัวเลือก upload ที่หน้า picker เห็น)

## ทดสอบแล้ว (จริง)

- `npm run test:avatar` — **34/34 ผ่าน** (เดิม 33 + assertion ใหม่ 1)
  - assertion ใหม่ผ่าน = ตัวเลือก "รูปที่อัปโหลด" แสดงใน avatar_options แล้ว (ยืนยันแก้บั๊กข้อ 3)
  - ซื้อรูป/หักเหรียญ/เลือกรูป shop/exclusive/ปลดล็อก achievement/ประวัติ Competitive ยังผ่านครบ
    = สองการแก้ SQL (ข้อ 1-2) ไม่เปลี่ยนพฤติกรรม

## ผลกระทบ

- แตะ `server/db.js`, `server/server.js`, `server/scripts/avatar-test.js` เท่านั้น — ไม่แตะ client
- ไม่แตะ schema · ไม่แตะ VIEW · query ทั้งหมด parameterized ตามกฎ
- ยังค้าง (แนะนำ ไม่บังคับ): live visual check ของ overlay ข้อ 8 ในแมตช์ Arcade จริง
