# D08 — Unified admin principal

**วันที่:** 2026-10-12 เวลา 23:43 (Asia/Bangkok)

## ผลลัพธ์

- คำสั่งจัดการ theme, เนื้อหาบทเรียน และรายงานผู้เรียนใช้ `req.player` ที่ server ยืนยันจาก Supabase access token หรือ Google HttpOnly session
- สิทธิ์ admin อ่านจากบทบาทปัจจุบันในตาราง `users`; ข้อมูล role จาก browser และ `admin_token` รุ่นเดิมไม่สามารถเพิ่มสิทธิ์ได้
- ย้าย admin routers ไปอยู่หลัง authentication middleware เพื่อไม่ให้ route เฉพาะทางข้าม principal กลาง
- หยุดส่ง `admin_token` จาก login responses และหยุดให้หน้า Add Lesson, Theme และ Student Progress อ่าน token ดังกล่าวจาก `localStorage`
- client transport กลางเป็นผู้แนบ Supabase bearer token และ Google cookie ตามวิธีเข้าสู่ระบบปัจจุบัน

## การตรวจสอบ

- เพิ่ม HTTP regression ว่า Supabase admin และ Google admin เรียก admin command เดียวกันได้
- ผู้ใช้ role ปกติถูกปฏิเสธด้วย 403 และคำขอที่ไม่มี principal ถูกปฏิเสธด้วย 401
- `node --test tests/auth.test.js tests/admin-principal.test.js` — ผ่าน 20/20
- syntax checks ของ server files ที่แก้ — ผ่าน
- ESLint ของหน้า admin ที่แก้ — ผ่าน
- client tests — ผ่าน 8/8 และ production build ผ่าน

## ข้อจำกัด

- ไฟล์ `adminAccess.js` และ QA scripts รุ่นเก่ายังคงอยู่เพื่อไม่ทำลายเครื่องมือย้อนหลัง แต่ production server และ client ไม่อ้าง `admin_token` แล้ว
