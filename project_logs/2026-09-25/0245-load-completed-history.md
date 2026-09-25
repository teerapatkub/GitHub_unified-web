วันที่และเวลา: 2026-09-25 02:45

สรุปสิ่งที่แก้ไข:
- ปรับ `client/src/pages/MiNi_Game.jsx` ให้โหลดประวัติ progress ได้ทั้งจาก `user.user_id` และ `user.id`
- เพิ่มการ normalize สถานะ completion รองรับ `true`, `1`, `"1"`, `"true"` และ field สำรอง `completed`
- ปรับการ map progress ให้รองรับทั้ง `exercise_id` และ `mini_game_module_id`
- ใช้สถานะ normalized เดียวกันทั้งแผนที่และ current subtopic

เหตุผลของการเปลี่ยนแปลง:
- ประวัติด่านที่ผ่านยังไม่แสดงเมื่อ object ผู้ใช้ใช้ field `id` หรือ API ส่งค่า completion เป็น string/ตัวเลข
- ลดความเสี่ยงจากรูปแบบ response ที่ต่างกันระหว่างฐานข้อมูลและ client

ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ:
- เปลี่ยนเฉพาะการอ่าน progress history ฝั่ง client
- ไม่เปลี่ยนการบันทึก progress หรือกติกาการผ่านด่าน

การตรวจสอบ:
- VS Code diagnostics: ไม่พบ errors ใน `MiNi_Game.jsx`
- ต้อง refresh client และ restart server ที่รันอยู่เพื่อรับ route ที่เพิ่ม `is_completed`
