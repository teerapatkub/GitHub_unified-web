# แก้ choices ของ Mini Game ไม่แสดงหลัง DONE

**วันที่และเวลา:** 2026-10-28 03:27 น.

## สรุปการเปลี่ยนแปลง

- เพิ่ม migration `mini_game_choices` โดยสร้างตาราง choice และดัชนีอ้างอิง dialogue/order ใน `server/db.js`, `server/migrations/definitions.js`, `server/migrations/versions.js` และลงทะเบียนใน `server/server.js`
- เอาการกลืน PostgreSQL `42P01` ออกจาก endpoint โหลด module เพื่อไม่คืน choices ว่างแบบเงียบ
- เพิ่ม `mini_game_choices` ใน content dump whitelist และเพิ่ม regression test ใน `server/tests/mini-game-choices-schema.test.js`
- บันทึก handoff ถึงเจ้าของ Mini Game ใน `docs/handoff-to-person-1.md`
- ปรับการแสดง choices ตาม `dialogue_id`/`dialogue_phase`: บทสนทนาจบหรือโจทย์ผ่านแล้วจะปลดล็อก choices; `post_submit` รอให้โจทย์ผ่านก่อน
- หลังผ่านโจทย์ ถ้าบทสนทนาที่เลือกมี choices จะไม่เปิด modal `MISSION CLEAR` ทับปุ่ม; modal ยังคงใช้เมื่อไม่มี choices

## เหตุผล

API อ่าน `mini_game_choices` แต่ schema สำหรับติดตั้งใหม่ไม่สร้างตารางนี้ และ route เดิมจับ error ตารางหายแล้วคืน choices ว่าง ทำให้หลังตรวจ DONE ไม่มีตัวเลือกปรากฏโดยไม่มี error ให้เห็น
อีกทั้ง UI เดิมซ่อน choices ทุกบทสนทนาไว้จนโจทย์ผ่าน แม้บทสนทนานั้นจะเป็น `pre_submit`; หลังแก้เงื่อนไขแล้วพบว่าการแสดงยังรอ typewriter จบเสมอแม้โจทย์ผ่านแล้ว จึงแก้ให้การผ่านโจทย์ปลดล็อก choices ได้ทันที
สุดท้าย reward modal ที่เปิดหลังการตรวจผ่านบัง choices ที่เพิ่งปลดล็อก จึงข้าม modal เมื่อมี choices ให้ผู้เรียนเลือกต่อ

## ผลกระทบที่อาจมีต่อส่วนอื่น

- เมื่อเริ่มระบบ จะมี migration สร้างตารางและดัชนี โดยไม่แก้หรือลบข้อมูลเดิม
- ข้อผิดพลาดจากตาราง/คอลัมน์ choices ที่ขาดจะไม่ถูกซ่อนอีกต่อไป
- migration สร้างโครงสร้างเท่านั้น ไม่ได้เติม choice rows ในฐานข้อมูลจริง
- งานแตะ backend/schema นอกขอบเขต Arcade จึงบันทึก handoff ให้ Person 1 ตรวจ

## ผลตรวจสอบ / สิ่งที่เหลือ

- Regression test ของ schema ผ่าน 1/1 และ `node --check` ของไฟล์ที่แก้ผ่าน
- ESLint เฉพาะไฟล์ไม่มี error; มี warning เดิมใน `server.js`
- `migrations-startup.test.js` ผ่าน 13/14; เคส fingerprint ของ core schema ล้มเหลวเพราะ `server/schema.sql` ใน worktree มีการแก้ `code_checks`/`isinstance` ค้างอยู่ก่อนงานนี้
- อ่านข้อมูล local แบบ read-only แล้วพบ choice 2 รายการผูกกับ `dialogue_id` 6 ของ exercise 1
- ยังไม่ได้ยืนยัน API/choices กับบัญชีจริงใน browser; endpoint local ตอบ 401 เมื่อตรวจโดยไม่มี session ผู้ใช้
