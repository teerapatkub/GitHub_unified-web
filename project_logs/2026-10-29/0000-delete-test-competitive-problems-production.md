# ลบโจทย์ Competitive ที่เป็นของทดสอบออกจากฐาน production

**วันที่:** 2026-10-29 (Asia/Bangkok), Person 3
**ฐาน:** Supabase `PythonGameArcade` = production `lnijkucfutyekbxquliq`

**ผู้ใช้สั่ง:** "ลบข้อมูลทดสอบภายใน PythonGameArcade ทั้งหมด"
- ผู้ใช้ระบุเพิ่มว่าหมายถึง**โจทย์หรือเนื้อหาที่ใช้ทดสอบ ไม่เกี่ยวกับ user**
- ผู้ใช้เลือกทั้ง 4 ข้อ และเลือก**ลบถาวร**

## ตรวจก่อนลบ (read-only)

- **ค้นหาโจทย์ทดสอบ:** ค้นด้วย `extra->>'is_test'` และชื่อที่มีคำว่า test/ทดสอบ แล้วเจอโจทย์ Competitive 4 ข้อ
- **ที่ไม่ได้ลบ:**
  - บทเรียน Pytest ที่มีคำว่า "ทดสอบ" เป็นเนื้อหาจริงเรื่องการเขียนเทส
  - มินิเกม "ปิดโค้ดทดลอง" เป็นเนื้อหาจริงของบทเรียน
- **FK ที่ชี้มา:** `active_accepted_challenges` และ `multiplayer_submissions` (ON DELETE CASCADE) ไม่มีแถวของ 4 ข้อนี้

## ที่ลบ (transaction เดียว, parameterized)

| entry_id (competitive) | problem_id | ชื่อ |
|---|---|---|
| 4 | 143 | Test Challenge 1: Hello World (`is_test=1`) |
| 5 | 144 | Test Challenge 2: Number Adder (`is_test=1`) |
| 6 | 145 | ทดสอบระบบ1 |
| 21 | 200 | print hello world |

- **คำสั่ง:** `DELETE FROM problems WHERE problem_id = ANY($1)` ซึ่ง cascade ไปที่ `problem_modes`
- **ตรวจก่อน commit:** ลบได้ 4 แถว และ `problem_modes` ของ 4 entry เหลือ 0
- **หลังลบ:** โจทย์ Competitive เหลือ 10 ข้อ

## ผลกระทบ

- **ไม่แตะผู้ใช้หรือข้อมูลการเล่น:** บัญชี 6 บัญชียังอยู่ครบ
- **ไม่แก้ `seed-content.sql`:** ไฟล์นี้เป็น input ของ core migration ที่รันแล้ว
  - ฐานที่มีอยู่จะไม่ได้ 4 ข้อนี้กลับมา เพราะ seed ทำงานแค่ตอนสร้างฐานครั้งแรก
  - ถ้าสร้างฐานใหม่จาก seed 4 ข้อนี้จะกลับมา
- **ฐานทดสอบ (`qfsrpupgxwsofdrzbwdw`) ไม่ถูกแตะ**
