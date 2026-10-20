# แผน deploy: Render บริการเดียว + Supabase project ใหม่

**วันที่:** 2026-10-21 00:12 (Asia/Bangkok) — Person 3 (สถาปัตยกรรมรวม)
**ADR:** `docs/adr/0008-one-render-service-and-a-fresh-production-project.md`

## เหตุผล

ผู้ใช้ขอแผนที่ทำให้โปรเจกต์ขึ้นใช้งานจริงได้ด้วยวิธีที่ง่าย เร็ว ฟรี และมีปัญหาตอน deploy น้อยที่สุด ก่อนวันที่ 25 ต.ค.

ผู้ใช้ถามด้วยว่า Render มาจากไหน คำตอบคือ Render มาจาก Spec 0003 ซึ่งผมเสนอเองตอนวางแผนเมื่อ 2026-10-15 เพราะ Express ต้องรันค้างไว้และต้องเรียก Python ได้ แต่ยังไม่เคยมีการ deploy จริง ส่วนที่ผมบอกว่า "Render ปิดรอบแทน" เป็นการสรุปผิด

ตัดสินใจร่วมกับผู้ใช้ในรอบถามตอบ (Q1–Q12) ดังนี้:
- เปิดใช้ครบ 3 โหมดบน URL สาธารณะ
- Render free บริการเดียวเสิร์ฟทั้งหน้าเว็บและ API (ไม่ใช้ Vercel)
- production ใช้ Supabase project ใหม่ (Singapore) ส่วน project เดิมเป็นฐานทดสอบ (ผู้ใช้เสนอเอง และยืนยันว่าไม่ต้องย้ายบัญชี)
- repo ใหม่แบบ private ที่มี commit เดียว
- อีเมลยืนยันใช้ Gmail SMTP
- ปิด Gemini ไว้ก่อน
- cron-job.org ping ทุก 10 นาที
- เล่นทดสอบบนฐานทดสอบก่อน แล้วค่อย smoke test
- ทีมส่งงานภายใน 22 ต.ค. เที่ยง

## สิ่งที่ทำ

- ADR 0008 (ใหม่) แทนส่วนโครงสร้าง deploy และฐานข้อมูลของ Spec 0003
- `docs/deploy-render.md` (ใหม่): ขั้นตอนทีละข้อ และตาราง env แยกเป็น จำเป็น / ไม่บังคับ / ห้ามตั้ง
  - ใช้ของที่มีอยู่แล้ว: `scripts/configure-supabase-auth.js` (`--check`, `--verify-smtp`, `--apply`), การสร้าง Storage bucket ตอนบูต และ `runtime/environment.js` ที่ไม่ยอมบูตถ้าค่าผิด
- Spec 0003 และ `docs/deploy.md` เพิ่มหมายเหตุชี้ไป ADR 0008
- commit `5f45bae` (แก้ข้อที่ review พบ)

## ข้อเท็จจริงที่ตรวจแล้ว

- repo เดิมเป็น public และยังไม่มีโฮสต์ตัวไหนต่ออยู่ (GitHub ไม่มี deployment)
- ในประวัติมี commit ที่ดูเหมือนเก็บ secret ไว้: `nvapi-` 12, `AIza` 2, `sb_secret_` 4, connection string ที่มีรหัสผ่าน 7, `EMAIL_PASS` 7
- มี server ที่ไม่รู้เจ้าของต่อฐานเดิมผ่าน pooler อยู่ (เห็นใน `pg_stat_activity` เมื่อ 2026-10-20 ราว 22:50 น.)

## ผลกระทบ

- ไม่แก้โค้ด
- บัญชีบนฐานเดิมไม่ย้ายไป production ผู้เล่นต้องสมัครใหม่
- คีย์ NVIDIA, Google API และ App Password เดิมต้องหมุนก่อนใส่ลง Render

## ยังไม่ได้ทำ

- เล่นทดสอบระดับปานกลางและระดับยากบนฐานทดสอบ (ต้องตรวจก่อนว่าไม่มี server อื่นต่ออยู่)
- งานในส่วนของผู้ใช้ตาม `docs/deploy-render.md` ข้อ 0–5
- ยังไม่ได้ push
