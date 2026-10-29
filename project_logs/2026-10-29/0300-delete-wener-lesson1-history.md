# ลบประวัติการเรียนบทที่ 1 ของ wener0021 (production)

**วันที่:** 2026-10-29 (Asia/Bangkok), Person 3
**ผู้ใช้สั่ง:** ลบประวัติการเรียนของ `wener0021` และระบุภายหลังว่าเอาเฉพาะ**บทที่ 1**

- **ฐาน:** production `lnijkucfutyekbxquliq`, user_id 5
- **ตรวจก่อน (read-only):**
  - ประวัติของบทที่ 1 มีแค่ `lesson_quiz_attempts` 2 แถว: pre 4/5 และ post 3/5
  - ไม่มีแบบฝึกหัดที่ส่ง (`exercise_submissions` = 0)
- **ลบ:** `DELETE FROM lesson_quiz_attempts WHERE user_id = $1 AND lesson_id = $2` (5, 1) ใน transaction เดียว ตรวจว่าลบได้ 2 แถวก่อน commit
- **ที่เหลือ:** แบบทดสอบบทที่ 2 (pre/post) และข้อมูลอื่นของบัญชี (Arcade, Competitive, ร้านค้า, ความสำเร็จ, เลเวล, บัญชีล็อกอิน) ไม่ถูกแตะ
