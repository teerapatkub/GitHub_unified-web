วันที่และเวลา: 2026-09-18

สรุปการแก้ไข:
- แก้ไข `client/src/pages/MiNi_Game.jsx`
- เพิ่มปุ่ม `RUN TESTS` สำหรับรัน correctness cases อัตโนมัติ
- แยกการตรวจ test ออกจากการส่ง `DONE`
- `DONE` จะปลดล็อกเมื่อ test ล่าสุดผ่านทุกข้อและยังไม่มีการแก้โค้ดหลังจากนั้น
- เมื่อแก้โค้ดหรือเปลี่ยน subtopic จะล้างสถานะ test ที่ผ่านและต้อง Run Tests ใหม่
- `runDoneChecks()` ไม่ mark progress สำเร็จล่วงหน้าอีกต่อไป
- `DONE` ใช้ผล test ล่าสุดในการส่ง progress โดยไม่รันโค้ดซ้ำหรือถาม input ซ้ำ

ลำดับการใช้งาน:
1. `RUN` ใช้ทดลองรันโค้ดและรับ input แบบ interactive
2. `RUN TESTS` ใช้ input จาก correctness และตรวจ expected ทุกกรณี
3. เมื่อผ่านทุก test ปุ่ม `DONE` จึงกดได้
4. `DONE` ส่งผลไปยัง API และปลดล็อกขั้นตอนถัดไป

การตรวจสอบ:
- `npm run build` ผ่านสำเร็จ
- มี warning เดิมจากการใช้ eval และ bundle size ไม่เกี่ยวกับ flow นี้
