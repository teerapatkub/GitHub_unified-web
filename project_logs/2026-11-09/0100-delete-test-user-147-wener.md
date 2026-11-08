# ลบบัญชี user 147 `wener` ออกจากฐานทดสอบแบบถาวร

**วันที่:** 2026-11-09 (Asia/Bangkok), Person 3
**ผู้ใช้สั่ง:** ลบ user id 147 wener แบบถาวร เพื่อเอาอีเมลไปสมัครบัญชีใหม่ (ใช้แคปหน้าแบบสอบถามตอนสมัครสำหรับ prototype)

## ที่ไหน

- **ฐานทดสอบ** (Supabase project `qfsrpupgxwsofdrzbwdw`, ที่ `server/.env` ชี้) ไม่ใช่ production
  - บน production บัญชีนี้คือ user_id 5 คนละแถวกัน และไม่ได้แตะ

## ตรวจก่อนลบ (อ่านอย่างเดียว)

- `users.user_id = 147`, username `wener`, role `user`, สร้าง 2026-10-25
- แถวที่อ้างถึงบัญชีนี้: `arcade_reward_receipts` 12, `user_achievements` 7, `user_survey_responses` 4,
  `user_inventory` 3, `learning_ai_tasks` 2, `user_presence` 1, `player_auth_identities` 1
- ไม่มีห้องเกมที่บัญชีนี้เป็นเจ้าของ จึงไม่กระทบข้อมูลของผู้เล่นคนอื่น

## ลบ

- ทำใน transaction เดียว ตรวจซ้ำว่า id, username และ auth id ตรงก่อนลบ
- ลบเองจาก 4 ตารางที่ไม่ cascade (`arcade_reward_receipts`, `learning_ai_tasks`, `user_achievements`, `user_presence`)
  แล้วลบแถว `users` ซึ่ง cascade ไปตารางที่เหลือ
- ผล: `users` 1, receipts 12, achievements 7, ai tasks 2, presence 1 และนับซ้ำแล้วไม่เหลือแถวไหนอ้าง 147
- **Supabase Auth:** ลบด้วย admin API ได้ 404 เพราะ auth id นี้ไม่มีใน Auth ของ project ทดสอบอยู่แล้ว
  - ค้นทั้ง 7 บัญชีใน Auth ของ project ทดสอบ ไม่พบอีเมลนี้ อีเมลจึงสมัครใหม่บน localhost ได้

## ผลกระทบ

- ไม่แตะ schema, คลังโจทย์ หรือบอท
- ไม่มีการลบใดบน production
