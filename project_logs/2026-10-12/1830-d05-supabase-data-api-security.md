# D05 — Supabase Data API security

**วันที่:** 2026-10-12 เวลา 18:30 (Asia/Bangkok)

## ผลลัพธ์

- เพิ่ม migration `202610120003 restrict_supabase_data_api` โดยไม่แก้ checksum ของ migration D03 ที่ใช้งานแล้ว
- revoke สิทธิ์ schema, table, view, sequence และ function จาก `PUBLIC`, `anon`, `authenticated`
- เปิด RLS ให้ทุก ordinary/partitioned table ใน `public` โดยไม่มี policy ที่ client ใช้ข้าม backend ได้
- ตั้ง ordinary view ทุกตัวเป็น `security_invoker=true`; materialized view ถูกปิดสิทธิ์อ่านโดยตรง
- revoke default privileges สำหรับ table, sequence และ function ที่ migration role จะสร้างในอนาคต
- migration หยุดและ rollback หากพบ relation/function ใน `public` ที่ migration role ไม่ได้เป็นเจ้าของ
- quote identifier ที่อ่านจาก catalog ก่อนประกอบ security DDL
- ปรับคู่มือให้ระบุว่า browser ใช้ Supabase Auth เท่านั้น ส่วนข้อมูลเกมเข้าผ่าน PyArena API

## การตรวจสอบ

- `node --test tests/data-api-security.test.js tests/migrations-startup.test.js` — ผ่าน 12/12
- `npm run test:migrations:postgres` กับ PostgreSQL 18 ที่ทิ้งได้ — ผ่าน fresh install/repeat/rollback 1/1
- PostgreSQL acceptance ตรวจ 71 ตารางเปิด RLS, 4 view ใช้ security invoker และป้องกัน 56 sequence
- `anon` และ `authenticated` อ่านและเขียน `public.users` ไม่ได้จริง
- PostgREST HTTP acceptance ส่ง anonymous GET/POST แล้วถูกปฏิเสธ 2/2 โดยไม่มีข้อมูลสำคัญใน response
- ไม่พบ table/view/function grants ของ `PUBLIC`, `anon`, `authenticated` ใน `public`
- `client npm test` — ผ่าน 8/8
- repository safety — ผ่าน 9/9
- production Docker image rebuild — ผ่าน

## Regression ที่อยู่นอก D04/D05

`server npm test` ผ่าน 112/118 และล้ม 6 รายการใน Arcade ที่มีการแก้ไขค้างจากงานอื่น:

- assertion เวลา AOE เดิมคลาดจาก `serverNow`
- remain/rematch 3 รายการคืน 400 หรือยังรวมผู้เล่นที่ไม่ได้เลือกอยู่ต่อ
- stale worker snapshot ยังใช้ match เดิม
- shop state หลัง rematch ไม่มี `inventory`

ไฟล์ D04/D05 ไม่แตะกติกาเหล่านี้ และ targeted migration/security tests ผ่านทั้งหมด จึงเก็บงาน Arcade
ที่ยังไม่ commit ไว้ตามเดิมเพื่อไม่ปะปนใน commit นี้
