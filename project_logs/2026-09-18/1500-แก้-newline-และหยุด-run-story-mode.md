วันที่และเวลา: 2026-09-18

สรุปการแก้ไข:
- เพิ่ม `stopRun()` ใน `client/src/hooks/usePyodide.js` เพื่อหยุด worker execution จริงและสร้าง worker ใหม่
- เพิ่ม `handleViewToggle()` ใน `client/src/pages/MiNi_Game.jsx`
- เมื่อสลับจาก Terminal ไป Story Mode ระหว่างโค้ดกำลังรัน จะหยุดโค้ด เคลียร์ input และยกเลิกสถานะกำลังรัน
- เพิ่ม `whitespace-pre-line` ให้ข้อความ Story Mode เพื่อแสดง output แยกบรรทัดตาม newline
- คงการแยก stdout เป็นบรรทัดใน Terminal

เหตุผล:
- ผลลัพธ์ prompt และ output แสดงติดกันใน Story Mode
- หลัง RUN แล้วสลับ Story Mode โค้ดยังทำงานและช่อง input ยังแสดงอยู่

การตรวจสอบ:
- `npm run build` ผ่านสำเร็จ
- มี warning เดิมจาก `eval` และ bundle size ไม่เกี่ยวกับการแก้ไขนี้
