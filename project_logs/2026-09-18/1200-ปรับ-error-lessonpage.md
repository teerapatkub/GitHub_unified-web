วันที่และเวลา: 2026-09-18

สรุปการแก้ไข:
- ปรับ `client/src/pages/LessonPage.jsx` ให้แสดง error แบบเดียวกับ `CodingWorkspace` ที่ใช้ใน `AiTaskPage`.
- ยกเลิกการเติม `💡` หน้าข้อความภาษาไทย.
- ยกเลิกการเพิ่ม traceback ซ้ำจากผลลัพธ์การรัน.
- แสดง stderr เป็น `Error: ...` และตามด้วยคำอธิบายภาษาไทย.

เหตุผล:
- ให้รูปแบบข้อความ error ใน LessonPage เหมือนหน้า AiTaskPage ตามที่ต้องการ.

ผลกระทบ:
- เฉพาะการแสดงผล error ใน LessonPage เปลี่ยนแปลง ไม่กระทบตัวตรวจคำตอบหรือการรัน Python.

การตรวจสอบเพิ่มเติม:
- `node --test .\\src\\utils\\sanitizePyErrorText.test.js` ผ่าน 3 tests.
- ESLint ยังรายงาน unused variables เดิมใน LessonPage.jsx ที่ `motion` และ `preQuiz`.
