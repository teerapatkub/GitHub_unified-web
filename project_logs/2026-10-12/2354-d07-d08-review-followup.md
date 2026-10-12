# D07/D08 — Review follow-up and final verification

**วันที่:** 2026-10-12 เวลา 23:54 (Asia/Bangkok)

## ผลลัพธ์

- เพิ่ม migration `202610120004` สำหรับ `auth_provisioning_operations` เพื่อบันทึกสถานะการสร้างและเชื่อม Supabase Auth แบบถาวร โดยเก็บเฉพาะ hash, Auth user ID, สถานะ และรหัสข้อผิดพลาดที่ปลอดภัย
- การ retry หลัง transaction rollback, การลบ Auth user ชดเชยล้มเหลว หรือ process ขาดช่วงก่อนบันทึก Auth user ID จะค้นหาบัญชีใน Supabase แล้วตรวจรหัสผ่านก่อนนำกลับมาเชื่อม จึงไม่สร้างบัญชีกำพร้าหรือวนติดอีเมลซ้ำ
- หาก Supabase ลบบัญชีสำเร็จแต่การบันทึกสถานะขาดช่วง retry จะตรวจพบว่า Auth user ID เดิมหายไปและสร้าง identity ใหม่ได้อย่างปลอดภัย
- เมื่อพบ mapping ที่ commit แล้ว ระบบปรับ provisioning operation เป็น `committed`; เมื่อ cleanup สำเร็จเป็น `compensated`; กรณีผลไม่แน่นอนเป็น `reconcile_required`
- ตาราง provisioning เปิด RLS และถอนสิทธิ์จาก `PUBLIC`, `anon` และ `authenticated`
- เปลี่ยนชื่อ test helper ของ D08 จาก `get` เป็น `getThemes` ตามมาตรฐานชื่อที่สื่อความหมาย
- แยก provisioning state machine และ transaction cleanup ไปไว้ใน `auth/provisioning.js` เพื่อลดความซ้ำซ้อนใน route installer

## การตรวจสอบ

- `node --test tests/auth.test.js tests/admin-principal.test.js` — ผ่าน 23/23 หลัง review follow-up รอบสุดท้าย
- `npm run test:migrations:postgres` กับ PostgreSQL 18 ชั่วคราว — ผ่าน 1/1 รวมการรัน migration ซ้ำ, RLS และ Data API grants
- full server suite — D07/D08 และ migration tests ผ่านทั้งหมด; รวมผ่าน 120/126
- 6 failures ที่เหลืออยู่ใน Arcade tests และสัมพันธ์กับไฟล์ Arcade/rematch ที่มีการแก้ไขค้างจากงานอื่น: AOE expiry, remain/rematch 3 จุด, stale worker และ shop snapshot
- `node --check` สำหรับไฟล์ server ที่แก้ — ผ่าน
- `git diff --check` — ผ่าน

## หมายเหตุ

- PostgreSQL container ชั่วคราวถูกลบหลังทดสอบแล้ว
- ไม่ใช้บัญชีหรือข้อมูล production และไม่บันทึก credential ลง repository
