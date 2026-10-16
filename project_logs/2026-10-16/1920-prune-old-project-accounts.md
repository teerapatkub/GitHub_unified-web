# ใช้ Supabase project เดิมต่อ และล้างบัญชีทดสอบ

**วันที่:** 2026-10-16 19:20 (Asia/Bangkok)

## การตัดสินใจที่เปลี่ยน

ผู้ใช้เปลี่ยนจาก Spec 0003 (สร้าง project ใหม่แบบฐานว่าง) เป็น **ใช้ Supabase project เดิมต่อ**
และให้เก็บไว้เฉพาะ:
- ผู้เล่น 128 Teerapat (admin), 129 belmoth, 141 max, 142 pong
- บทเรียน, คลังโจทย์, ไอเทม และโจทย์ Competitive

Google login จะย้ายไปใช้ Supabase Auth ในงานถัดไป

## สิ่งที่ทำ

1. `pg_dump` ทั้งฐานอีกครั้งก่อนลบ ไปไว้ที่ `_archive/supabase-old-project-2026-10-16-pre-cleanup.sql`
   (SHA-256 `6f4df0df…3b51`) นอก Git
2. เพิ่ม `server/scripts/prune-player-accounts.js` (สคริปต์ครั้งเดียว)
   - หาตารางที่เก็บข้อมูลรายผู้เล่นจาก catalog จริง ทั้งคอลัมน์ `user_id`, `host_user_id`, `user_name` และ `host_name`
     ไม่ใช้รายการตายตัว เพราะหลายตารางไม่มี FK ไปที่ users และตาราง Arcade ผูกด้วยชื่อผู้เล่น
   - ลบ `arcade_reward_receipts` กับ `game_rooms` ก่อน เพราะ FK ของสองตารางนี้จะบล็อกการลบ
   - ทำทั้งหมดใน transaction เดียว มี `--dry` และ `--apply`
   - หลัง commit จึงลบบัญชี Supabase Auth ของผู้ที่ถูกลบ
3. ทดสอบบนสำเนาที่ restore จาก dump ก่อน: เนื้อหาที่ใช้ร่วมกันเท่าเดิม และรัน dry ซ้ำแล้วไม่เหลือแถวให้ลบ
4. ผู้ใช้ยืนยันแล้วจึงรันบนฐานจริง ลบบัญชี 124 test, 127 abc และ 143 pongpat
   - แถวที่ลบ: achievement 58, ai-task 11, presence 10, ร้านค้า Arcade 19, แบบสำรวจ 4, identity 3, email_verifications 2, inventory 1
   - บัญชี Auth ที่ผูกกับผู้เล่นที่ถูกลบ 3 รายการ
5. `DROP SCHEMA` ที่เหลือจากเทส ได้แก่ `arcade_test_*` 6 ชุด และ `fullprojectpython` หลังผู้ใช้ยืนยัน

## ผลหลังลบ (ตรวจบนฐานจริง)

- users: 128 (admin), 129, 141, 142
- `auth.users` เหลือ 1 บัญชี และ `player_auth_identities` เหลือ 1 แถว (ของ pong)
- problems 193, problem_modes 193, lessons 24, shop_items 25, achievements 20 เท่าเดิม
- migration ยังอยู่ครบทั้ง 4 รายการ และไม่เหลือ schema ของเทส

## ข้อสังเกต

- `npm run test:problems` ต่อ `localhost:5432` แบบตายตัว และไม่อ่าน `DATABASE_URL` สคริปต์นี้พังอยู่แล้วก่อนงานนี้
  จึงตรวจด้วยการนับจำนวนเนื้อหาแทน ควรแก้สคริปต์ให้อ่าน `DATABASE_URL` เป็นงานแยก
- 128, 129 และ 141 ไม่มีบัญชี Supabase Auth ต้องผูกครั้งแรกตอนเข้าด้วย Google ผ่าน Supabase (งานถัดไป)
  ถ้าเคยตั้งรหัสผ่านไว้ จะเข้าด้วยอีเมลผ่านการเชื่อมบัญชีเดิมของ ADR 0003 ได้
- ยังต้องหมุน database password และ secret key ของ project นี้ เพราะประวัติ Git เคยมีไฟล์ env (D01)
