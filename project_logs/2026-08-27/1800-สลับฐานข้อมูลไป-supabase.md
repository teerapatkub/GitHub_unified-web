# 2026-08-27 18:00 — สลับฐานข้อมูลจาก local ไป Supabase

## ทำอะไร
ชี้ backend ไปใช้ Supabase (session pooler) แทน local Postgres โดยตั้ง `DATABASE_URL` ใน
`server/.env` (ผู้ใช้ใส่รหัสเอง ไม่ผ่านแชท) — **ไม่มีการแก้โค้ด** เพราะ `server/db.js` รองรับ
`DATABASE_URL` + SSL อัตโนมัติสำหรับ host remote อยู่แล้ว (ทำไว้รอบก่อน)

- connection: `postgres.qfsrpupgxwsofdrzbwdw` @ `aws-0-ap-northeast-1.pooler.supabase.com:5432`
  (session pooler — เข้ากันได้กับ pg.Pool + transaction/prepared statements เต็มที่)
- direct host (`db.<ref>.supabase.co`) ใช้ไม่ได้เพราะ IPv6-only → ต้องใช้ pooler
- ปัญหาที่เจอตอนตั้ง: template `<PASSWORD>` ที่ให้ไป ผู้ใช้เผลอเก็บวงเล็บ `< >` ติดมาด้วย
  ทำให้ auth ไม่ผ่าน — แก้โดยเอาวงเล็บออก

## ผลทดสอบ (ทุกอย่างผ่าน)
- ต่อได้: PostgreSQL 17.6, 68 public tables
- เนื้อหาครบ: problems 193, lessons 24, exercises 120, lesson_slides 220, shop_items 19,
  achievements 20, arcade_tasks 40
- **users 0** (inventory/history 0) — ตั้งใจเริ่มสะอาดสำหรับ deploy จริง (ผู้ใช้ตัดสินใจ)
- RLS: เปิดทุกตาราง (default Supabase) แต่ role postgres มี `bypassrls=true` → ไม่บล็อกแอป
- boot backend: สะอาด ไม่มี error (seed arcade/shop/achievement/survey + ensureMergedSchemas +
  lockDownPublicSchema รันผ่านหมด)
- read: exercises/lessons/shop/arcade/profile(join) → 200
- write+auth: สมัคร (INSERT) + login (bcrypt) + profile → ผ่าน (ลบบัญชีทดสอบทิ้งแล้ว users=0)
- เว็บจริง (dev :5174 → :3001 → Supabase) เรนเดอร์ + อ่านได้

## สถานะ
- backend ชี้ Supabase (คงไว้สำหรับ dev ต่อไป ตามที่ผู้ใช้เลือก)
- ข้อมูล local เดิมไม่ถูกแตะ — กลับไป local ได้แค่ comment `#` หน้า `DATABASE_URL`
- `.env` ไม่ถูก commit (gitignore) — รหัสไม่หลุด git

## ที่ยังค้าง (ก่อน deploy จริง)
- ปัญหา uploads path บน Docker (พบตอน code-review): Dockerfile คัดลอกไป `/app/uploads` แต่ server
  เสิร์ฟจาก `/data/uploads` (volume เปล่า) → รูป default/ร้าน/achievement จะ 404 บน Docker
- reset รหัส Supabase ที่เคยหลุดในแชทรอบก่อน (ถ้ายังไม่ได้ทำ)
