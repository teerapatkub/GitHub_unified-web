วันที่และเวลา: 2026-09-18

สรุปการแก้ไข:
- แก้ไข `client/src/pages/MiNi_Game.jsx`
- `DONE` รัน correctness tests อัตโนมัติก่อน
- correctness tests ทำหน้าที่ตรวจความถูกต้องเท่านั้น ไม่เลือก branch และไม่ mark progress สำเร็จ
- เมื่อ tests ผ่านทั้งหมด จึงเรียก `runCodeInStory()` แบบ interactive เพื่อให้ผู้ใช้กรอก input เอง
- คำนวณ branch จาก output ของการกรอกจริง แล้วจึงบันทึก progress และปลดล็อกทางแยก

เหตุผล:
- การใช้ input อัตโนมัติเป็น output สำหรับ branch ทำให้ผู้ใช้ไม่สามารถเลือกทางแยกของ Mini Game ได้

การตรวจสอบ:
- `npm run build` ผ่านสำเร็จ
