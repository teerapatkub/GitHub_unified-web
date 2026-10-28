# บันทึกการทำงาน

- วันที่และเวลา: 2026-10-28 04:50 (+07:00)
- สรุปการแก้ไข:
  - `server/migrations/index.js`: เพิ่ม fingerprint ปัจจุบันของ core migration ที่ตรงกับ revision ใน workspace นี้ โดยยังยอมรับเฉพาะ checksum ที่ระบุไว้
  - `server/db.js` และ `server/server.js`: ให้ migration `202610280001` สร้าง/อัปเดต view `mini_game_exercises` ด้วย เพื่อให้ฐานข้อมูลที่มี migration เดิมแล้วได้รับ schema ล่าสุด
  - `server/tests/mini-game-choices-schema.test.js`: เพิ่มการตรวจว่ามีการอัปเดต view และข้อมูล validation ที่เกี่ยวข้อง
- เหตุผล: การเปลี่ยน `problemsSchema.js`, `schema.sql` และ `seed-content.sql` ทำให้ checksum ของ migration `202610120001` เปลี่ยนเป็น `e9c63aa7...` และทำให้ startup ปฏิเสธฐานข้อมูลที่บันทึก checksum รุ่นที่รู้จักไว้
- ผลกระทบ: เมื่อเริ่มระบบ migration ใหม่จะอัปเดต view `mini_game_exercises`; ไม่มีการแก้ไขข้อมูลหรือ schema ของ Arcade
- ผลตรวจสอบ: `node --test tests\migrations-startup.test.js tests\mini-game-choices-schema.test.js` ผ่าน 15/15; `npm run lint` ผ่านโดยมี warning เดิม 30 รายการ; checksum ที่คำนวณได้ตรงกับ fingerprint ที่ลงทะเบียน
- สิ่งที่ยังไม่เสร็จ/ต้องทดสอบเพิ่ม: ยังไม่ได้ทดสอบ migration กับ PostgreSQL deployment จริง

## ติดตามผล 04:57 (+07:00)

- ผลตรวจจากฐานข้อมูลจริงที่ผู้ใช้ส่งมา: migration `202610120001` บันทึก checksum `a32e4337...` ไม่ใช่ `510e97a0...`
- แก้ `server/migrations/index.js` ให้รับ checksum `a32e4337...` เป็น fingerprint ที่รู้จักของ revision ก่อนหน้า โดยยังต้องตรงชื่อ migration และ fingerprint ปัจจุบันแบบ exact match
- เพิ่ม regression test ครอบคลุม checksum ที่ฐานข้อมูลใช้อยู่ และยืนยันว่าค่า checksum ที่ไม่รู้จักยังถูกปฏิเสธ

## ติดตามผล 04:59 (+07:00)

- สาเหตุ error เพิ่มเติม: ในฐานข้อมูลจริง `mini_game_exercises` ยังเป็นตาราง legacy การใช้ `CREATE OR REPLACE VIEW` แทนตารางทำไม่ได้ใน PostgreSQL
- ปรับ migration ให้ตรวจ relation ก่อน หากยังเป็นตารางให้เรียก `migrateProblems` ซึ่งเก็บข้อมูลเดิมไว้ใน `_pre_merge` และสร้าง view ตาม flow เดิมก่อนอัปเดต view
- เพิ่ม regression test สำหรับกรณี relation เป็นตาราง legacy
- ผลตรวจสอบ: migration และ mini-game tests ผ่าน 16/16; lint ผ่านโดยมี warning เดิม 30 รายการ

## ติดตามผล 05:01 (+07:00)

- สาเหตุ error เพิ่มเติม: มีแถว `(mode, entry_id)` อยู่ใน `problem_modes` แล้ว ขณะที่ตาราง legacy ยังมีแถว id เดียวกัน ทำให้การ insert ซ้ำชน primary key
- ปรับการย้ายแถวให้ตรวจ canonical registration ก่อนเพิ่ม `problems` และ `problem_modes`; ถ้ามีอยู่แล้วจะคง canonical entry และข้าม insert ซ้ำ ส่วนตาราง legacy จะยังถูกเก็บเป็น `_pre_merge`
- เพิ่ม regression tests สำหรับทั้งกรณีแถวซ้ำและแถวที่ยังไม่เคยย้าย
- ผลตรวจสอบ: migration และ mini-game tests ผ่าน 18/18; lint ผ่านโดยไม่มี error และมี warning เดิม 30 รายการ

## ติดตามผล 05:04 (+07:00)

- สาเหตุ error เพิ่มเติม: ชื่อตารางสำรอง `mini_game_exercises_pre_merge` ถูกใช้อยู่แล้ว จึง rename ตาราง legacy ปัจจุบันไปชื่อนี้ไม่ได้
- ปรับ migration ให้เก็บตารางสำรองเดิมโดยย้ายไปชื่อ `_pre_merge_previous_N` ที่ยังไม่ถูกใช้ ก่อนย้ายตาราง legacy ปัจจุบันไปชื่อสำรองมาตรฐาน
- เพิ่ม regression test ตรวจว่าชื่อสำรองเดิมและชื่อสำรองที่มีอยู่แล้วไม่ถูกเขียนทับ
- ผลตรวจสอบ: migration และ mini-game tests ผ่าน 19/19; lint ผ่านโดยไม่มี error และมี warning เดิม 30 รายการ
- ไม่ได้รัน startup กับฐานข้อมูลที่ตั้งค่าไว้ เพราะเป็นฐานข้อมูล remote ที่ไม่ใช่ test database; การทดสอบ migration กับฐานข้อมูลนั้นจะเปลี่ยน schema และข้อมูลจริง

## ติดตามผล 05:07 (+07:00)

- สาเหตุ error เพิ่มเติม: ตาราง `mini_game_current_conversations` ในฐานข้อมูลจริงไม่มี `exercise_id` แม้ schema และ legacy table ที่คาดไว้มีคอลัมน์ nullable นี้
- ให้ migration เติม `exercise_id BIGINT` แบบ nullable หากขาด ก่อนเพิ่ม foreign key; แถวเดิมไม่ถูกเปลี่ยนและจะได้ค่า `NULL`
- เพิ่ม regression test ยืนยันว่าคอลัมน์ถูกเติมเฉพาะตารางที่ต้องใช้ และตรวจ migration signature ให้รวม helper ใหม่
- ผลตรวจสอบ: migration และ mini-game tests ผ่าน 20/20; lint ผ่านโดยไม่มี error และมี warning เดิม 30 รายการ
