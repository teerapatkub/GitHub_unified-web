# 04: popup ตัวกลาง และย้าย popup ของ Arcade มาใช้

**What to build:** ผู้เล่นที่ใช้คีย์บอร์ดหรือโปรแกรมอ่านหน้าจอต้องใช้ popup สร้างห้อง, ตั้งค่าห้อง และคู่มือไอเทมได้ครบ:
- **เปิด:** focus ย้ายเข้า popup และ Tab วนอยู่ข้างในเท่านั้น
- **ปิด:** กด Escape ปิดได้ (แก้ A6) และ focus กลับไปที่ปุ่มที่เปิด popup
- **โปรแกรมอ่านหน้าจอ:** ประกาศชื่อหน้าต่าง
- **ปุ่มเลือก:** ปุ่มจำนวนผู้เล่น จังหวะ และความยาก บอกได้ว่าตัวไหนถูกเลือกอยู่
- **ช่องกรอก:** ทุกช่องมี label ผูกกับช่อง

ทำเป็น component popup ตัวเดียว โดยใช้ทัวร์ Lumi เป็นแบบ เพราะทำถูกอยู่แล้ว (บทบาท dialog, `aria-modal`, ชื่อจากหัวข้อ, focus trap) ticket 17 จะเอา component นี้ไปใช้ทั้งเว็บ

อ้างอิง: Spec 0005 Track B, audit P1 ข้อ 3

**Blocked by:** None (can start immediately)

**Status:** done (2026-10-26, see project_logs/2026-10-26/ — Arcade phase 1 log)

- [x] มี component popup กลางตัวเดียว และ popup ของ Arcade ทั้ง 3 ตัวใช้ตัวนี้
- [x] ปุ่มเลือกแบบกลุ่มมี `aria-pressed` (หรือเป็น radio group) และ label ใช้ `htmlFor`
- [x] ทดสอบในเบราว์เซอร์จริงกับ popup ทั้ง 3 ตัว:
  - เปิดด้วยคีย์บอร์ดได้
  - Tab ไม่หลุดออกนอก popup
  - Escape ปิดได้
  - focus กลับไปที่ปุ่มเดิม
- [x] accessibility tree เห็น dialog ที่มีชื่อ และปุ่มที่เลือกอยู่มีสถานะ pressed
- [x] สร้างห้องและบันทึกตั้งค่าผ่าน popup ใหม่ได้เหมือนเดิม
- [x] `npm run lint` ของ client ผ่าน
