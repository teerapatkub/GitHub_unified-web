# สำรองฐานข้อมูล Supabase project เดิม (Spec 0003 ticket 2 ส่วนแรก)

**วันที่:** 2026-10-15 17:25 (Asia/Bangkok)

## สิ่งที่ทำ

- `pg_dump` ทั้งฐานของ Supabase project ที่ใช้อยู่ (PostgreSQL 17.6, region ap-northeast-1)
  ด้วย `pg_dump` จาก image `postgres:18-alpine` แบบ `--no-owner --no-privileges` รูปแบบ plain SQL
- เก็บไว้ที่ `_archive/supabase-old-project-2026-10-15.sql` (1.1 MB) ซึ่ง Git ignore และไม่อยู่ใน Docker build context
- ได้ทั้ง schema `public` (72 ตาราง), `auth` (27) และ `storage` (8) รวม 206 คำสั่ง COPY
- บันทึก SHA-256 ไว้ใน `_archive/README.md` ในเครื่อง ไม่ได้ commit เพราะโฟลเดอร์นี้ถูก ignore

## ตรวจว่ากู้คืนได้จริง

- restore ใส่ PostgreSQL ชั่วคราว (สร้าง role ของ Supabase ไว้ก่อน)
- ได้ข้อมูลครบ: ผู้เล่น 7 บัญชี, บัญชีใน `auth.users` 2 บัญชี, โจทย์ 193 ข้อ, migration 4 รายการ
- error 3 รายการ เป็นของ extension `supabase_vault` ที่มีเฉพาะบน Supabase เท่านั้น
- ลบ container และ anonymous volume ของการทดสอบแล้ว ส่วน volume เดิม 14 ตัวไม่ได้แตะ

## ข้อสังเกต

- ฐานเดิมยังมี schema ที่เหลือจากเทส (`arcade_test_*`, `fullprojectpython`) อยู่ใน dump ด้วย
  ไม่มีผลกับ project ใหม่ เพราะ project ใหม่จะบูตจากฐานว่าง
- connection string อ่านจาก `server/.env` ส่งเข้า container ผ่านตัวแปรแวดล้อม และไม่ได้แสดงใน log

## ยังต้องทำ (ส่วนที่เหลือของ ticket 2)

- ผู้ใช้ต้องคัดลอกไฟล์ dump ไปเก็บอีกสำเนาในไดรฟ์ส่วนตัวที่ไม่แชร์
- สร้าง Supabase project ใหม่ที่ region Singapore ใน dashboard ซึ่งต้องทำด้วยบัญชีของผู้ใช้
  แล้วบูต server ในเครื่องกับฐานว่างนั้นให้ migration ครบ
