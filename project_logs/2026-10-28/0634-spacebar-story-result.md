# ค้างผลลัพธ์ใน Story Mode จนกด Spacebar

- วันที่และเวลา: 2026-10-28 06:34 (+07:00)
- ไฟล์ที่แก้:
  - `client/src/pages/MiNi_Game.jsx`
  - `docs/handoff-to-person-1.md`
- เหตุผล: ผู้ใช้ต้องการให้ผลลัพธ์ยังแสดงใน Story Mode หลังปิดหน้าต่างผ่าน และค้างจนกด Spacebar
- การเปลี่ยนแปลง: เมื่อผลตรวจผ่านและมี choices ให้ Story Mode แสดง output กับข้อความสำเร็จ; Spacebar ปิดสถานะผลลัพธ์และเปิดบทสนทนาเต็มพร้อม choices
- ผลกระทบ: เฉพาะ UI/flow Mini Game; modal ยังปิดด้วย Continue หรือ Spacebar; choices ต้องเลือกเอง
- สิ่งที่ยังต้องทดสอบ: รัน ESLint/build และทดสอบหลัง login
