# ตรวจและเตรียมแก้ login 500

**วันที่:** 2026-10-13 (Asia/Bangkok)
**สถานะ:** แก้ไขและตรวจรับบน Supabase จริงแล้ว; login ผ่าน UI ด้วยบัญชีทดสอบสำเร็จ

## อาการและสาเหตุ

- หน้า `/login` บน Vite ได้ 500 ที่ `/api/auth/me` และ `/api/config/google` เพราะ backend `localhost:3001` ไม่ทำงาน
- `npm start` ของ backend หยุดระหว่าง startup: checksum ของ migration `202610120001` บนฐานจริงไม่ตรงกับโค้ดปัจจุบัน
- ฐานจริงบันทึก migration 001/002 แล้ว แต่ยังไม่มี 003/004; checksum ของ 001/002 มาจาก revision ก่อนโค้ด migration ถูกปิดงาน ส่วน signature ที่พึ่งพาบรรทัดใหม่ต่างกันระหว่าง Windows/Unix

## การแก้ในโค้ด

- ปรับ checksum ให้ normalize line endings ก่อน hash
- ยอมรับ checksum ประวัติศาสตร์ของ 001/002 เฉพาะเมื่อจับคู่กับชื่อและ checksum ปัจจุบันที่ทราบแน่นอน; การแก้ source ครั้งใหม่หรือ checksum อื่นยังถูกปฏิเสธ
- เพิ่ม regression สำหรับ checksum เดิม, source edit, line endings และ integration ที่จำลองฐาน 001/002 เดิมแล้ว apply 003/004 บน PostgreSQL container แยก

## ผลตรวจรับ

- Auth และ migration tests 34/34 ผ่าน
- Migration integration บนฐานทดสอบแยกผ่าน: ลง 001/002, เปลี่ยน metadata เป็น checksum ที่ฐานเดิมเคยบันทึก, apply 003/004, รันซ้ำได้โดยไม่ replay 001/002
- ตรวจฐานจริงแบบอ่านอย่างเดียว: มี migration 001/002, ตารางผู้เล่น/identity/session อยู่, ยังไม่มี `auth_provisioning_operations`; มี 132 relations กับ 1 function ใน `public` และ 2 Data API roles; ไม่พบตารางที่ปิด RLS อยู่, ไม่พบ grants ของ `anon`/`authenticated`/`PUBLIC`, view และ schema usage ที่ตรวจอยู่ในสถานะปิดแล้ว

## ตรวจรับกับ Supabase และ UI จริง

- ผู้ใช้อนุมัติให้ apply migration 003/004 และทดสอบบนฐานจริง จากนั้น `npm start` เริ่ม backend ที่พอร์ต 3001 และรายงาน `Database migrations completed; the application is ready`
- `GET /api/config/google` ผ่าน backend และ Vite proxy ตอบ 200; `GET /api/auth/me` เมื่อไม่มี session ตอบ 401 ตามปกติ จึงไม่มี 500 จาก backend ที่ไม่เริ่มทำงานอีก
- ทดสอบใน Chrome ที่ `http://localhost:5174/login`: กรอกชื่อผู้ใช้ `pong` และรหัสผ่านจาก `server/.env` แล้วเข้าสู่ `/learn` สำเร็จ หน้าเว็บแสดง `pong`, เลเวล 10 และข้อมูลเหรียญ
- รีเฟรช `/learn` แล้ว session ยังอยู่และหน้าแสดงข้อมูล `pong` เหมือนเดิม
- ไม่บันทึกหรือแสดงรหัสผ่านใน log; ล้าง clipboard ที่ใช้ระหว่างทดสอบแล้ว

Backend ยังรันอยู่ที่พอร์ต 3001 เพื่อให้ทดสอบหน้าเว็บต่อได้
