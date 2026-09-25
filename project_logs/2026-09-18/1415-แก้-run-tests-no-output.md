วันที่และเวลา: 2026-09-18

สรุปการแก้ไข:
- แก้ไข `client/src/pages/MiNi_Game.jsx` ใน `runCodeForCheck()`
- ลบ Python grading wrapper ที่สร้างซ้อนและเรียก `runCode()` แบบ non-interactive
- ใช้ `runCode(code, ..., { interactive: true })` โดยตรง
- ป้อนค่า test ผ่าน `onInput: () => testInput`
- จับผลลัพธ์จาก `onStdout` และ error จาก `onStderr`

เหตุผล:
- RUN TESTS แสดง `Got: (no output)` แม้โค้ดผู้เรียนมี `print()` เพราะ wrapper ซ้อนเดิมไม่ส่ง output กลับเข้าช่องจับผลลัพธ์อย่างถูกต้อง

ผลกระทบ:
- correctness test ใช้ worker runner เดียวกับ RUN ปกติ
- input จาก test case ถูกป้อนอัตโนมัติและ output ของผู้เรียนถูกจับตรงจาก worker

การตรวจสอบ:
- `npm run build` ผ่านสำเร็จ
