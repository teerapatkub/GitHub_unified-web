วันที่และเวลา: 2026-09-18

สรุปการแก้ไข:
- แก้ไข `client/src/pages/MiNi_Game.jsx`
- หลัง DONE ผ่าน correctness tests แล้ว ไม่เรียก `runCodeInStory()` ซ้ำ
- ใช้ output จาก test ที่ผ่านแล้วแสดงใน Story Mode โดยตรง
- ป้องกันการเปิดช่องกรอก input ซ้ำหลังแสดง Story Mode
- ปรับ `handleWorkerStdout()` ให้แยก output ตาม newline ก่อนแสดงใน Terminal

เหตุผล:
- ผลลัพธ์เดิมแสดงต่อกันในบรรทัดเดียว เช่น prompt และ output VAT
- หลัง RUN/DONE ระบบเปิดช่อง input ใน Story Mode ทั้งที่ไม่ต้องการให้กรอกซ้ำ

การตรวจสอบ:
- `npm run build` ผ่านสำเร็จ
