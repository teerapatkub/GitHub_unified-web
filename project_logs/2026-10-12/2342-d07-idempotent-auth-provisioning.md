# D07 — Idempotent Auth provisioning

**วันที่:** 2026-10-12 เวลา 23:42 (Asia/Bangkok)

## ผลลัพธ์

- การสมัครใหม่และเชื่อมบัญชีเดิมตรวจ mapping ที่บันทึกถาวรก่อนชดเชยด้วยการลบ Supabase Auth user
- หากผล commit ไม่ชัดเจน ระบบเก็บ Auth user ไว้เมื่อพบ mapping แล้ว หรือเมื่อฐานข้อมูลไม่พร้อมให้ reconcile แทนการเสี่ยงลบบัญชีที่ commit สำเร็จ
- การสมัครซ้ำด้วยชื่อผู้ใช้ อีเมล และรหัสผ่านชุดเดิมตรวจรหัสผ่านกับ Supabase แล้วส่งอีเมลยืนยันซ้ำ โดยไม่สร้าง player หรือ Auth user เพิ่ม
- การ retry เชื่อมบัญชีเดิมกลับมาใช้ mapping เดิมและคง user ID, level, XP, coin และข้อมูลเกมเดิม
- ยังคงลบ Auth user ที่สร้างใหม่เมื่อพิสูจน์ได้ว่า transaction ฝั่งผู้เล่นล้มเหลวและไม่มี mapping ถาวร

## การตรวจสอบ

- เพิ่ม authenticated HTTP regressions สำหรับ signup และ legacy migration เมื่อ commit สำเร็จแต่ connection ขาด
- เพิ่ม regression ว่าฐานข้อมูลล้มระหว่าง reconcile จะไม่ลบ Auth user
- `node --test tests/auth.test.js tests/admin-principal.test.js` — ผ่าน 20/20
- client tests — ผ่าน 8/8
- production client build — ผ่าน
- full server suite กับ PostgreSQL 18 ชั่วคราวยังมี timing regression เดิมของ A08: `AOE ... expiresAt <= serverNow + 5000`; D07 tests ผ่านทั้งหมด

## ข้อจำกัด

- การส่ง confirmation/recovery ถึง mailbox ภายนอกและ Custom SMTP เป็นขอบเขต D09
- ไม่ใช้ข้อมูล production หรือสร้างผู้ใช้จริงใน Supabase ระหว่างการทดสอบนี้
