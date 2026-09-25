วันที่และเวลา: 2026-09-18

สรุปการแก้ไข:
- แก้ไข `client/src/pages/MiNi_Game.jsx`
- เพิ่ม state `submittedNextSubtopicIndex`
- บันทึก index ของด่านปลายทางทันทีเมื่อ DONE คำนวณ branch สำเร็จ
- ปุ่มไปด่านถัดไปใช้ index ที่บันทึกไว้โดยตรง ไม่คำนวณซ้ำจาก selectedBranchKey ที่อาจยังเป็น state เก่า
- reset index เมื่อเปลี่ยน subtopic

ผลกระทบ:
- branch `1A`, `1B`, `1A_2A` และ branch อื่น ๆ จะนำทางไป subtopic ที่ตรงกับ exercise_order โดยตรง

การตรวจสอบ:
- `npm run build` ผ่านสำเร็จ
- ต้อง restart server เพื่อให้การลบ LIMIT 3 ใน `server/server.js` มีผลกับ process ที่กำลังรันอยู่
