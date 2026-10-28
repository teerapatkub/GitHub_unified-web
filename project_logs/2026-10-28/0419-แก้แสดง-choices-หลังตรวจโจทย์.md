# แก้แสดง choices หลังตรวจโจทย์

**วันที่และเวลา:** 2026-10-28 04:19 น.

## สรุปการเปลี่ยนแปลง

- `client/src/pages/MiNi_Game.jsx` — resolve choices ของบทสนทนาจาก `dialogue.choices` หรือ `dialogue_choices` ด้วย `dialogue_id`
- หลังตรวจโจทย์ผ่าน จะให้ choices ของบทสนทนาที่กำลังแสดงอยู่มี priority ก่อน choices อื่นในลำดับบทสนทนา
- `docs/handoff-to-person-1.md` — บันทึกการเปลี่ยนแปลงที่เกี่ยวกับหน้า Mini Game

## เหตุผล

การอ่าน choices เฉพาะจาก nested `dialogue.choices` อาจทำให้ไม่พบตัวเลือก แม้ API ส่งรายการ choices แยกมาใน `dialogue_choices` ซึ่งผูกด้วย `dialogue_id` อยู่แล้ว เมื่อหาไม่พบ flow จะเดินต่อไปแสดงข้อความบทสนทนาแทนปุ่มตัวเลือก

## ผลกระทบที่อาจมีต่อส่วนอื่น

การ render และตรวจการมี choices ของทั้งโมดูลใช้ lookup ด้วย `dialogue_id` สอดคล้องกัน; ลำดับ dialogue เดิมไม่เปลี่ยน

## ผลตรวจสอบ / สิ่งที่เหลือ

- ESLint เฉพาะ `MiNi_Game.jsx` ผ่านโดยไม่มี error; มี warning dependency ของ `useEffect` เดิม
- `npm run build` ผ่าน
- ยังไม่ได้ทดสอบ flow กับบัญชีผู้ใช้ใน browser จริง
