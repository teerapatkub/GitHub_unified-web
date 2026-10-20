# ขึ้นใช้งานจริงบน Render + Supabase (ฟรี)

ตาม [ADR 0008](adr/0008-one-render-service-and-a-fresh-production-project.md):
**Render บริการเดียว** เสิร์ฟทั้งหน้าเว็บและ API จาก `Dockerfile` และใช้ **Supabase project ใหม่ (Singapore)** เป็น production

ส่วน project เดิมเป็นฐานทดสอบ: `server/.env` บนเครื่อง dev ทุกเครื่องยังชี้ไปที่ project เดิม **ห้ามเอาค่าของ production มาใส่ในไฟล์นั้น**

> ขั้นที่ต้องใช้บัญชี รหัสผ่าน หรือ dashboard เจ้าของบัญชีต้องทำเอง
> ห้ามวางรหัสผ่านหรือ key ลงในแชท, commit หรือบันทึกงาน

---

## 0. ก่อนเริ่ม

- [ ] รวมงานของทุกคนแล้ว และชุดทดสอบผ่าน (`server`: `npm test`, `client`: `npm test` / `npm run lint` / `npm run build`)
- [ ] สร้าง repo ใหม่แบบ **private** ที่มี commit เดียวจากไฟล์ปัจจุบัน และตั้ง repo เดิมเป็น private
- [ ] Gmail ของโปรเจกต์เปิด 2-Step Verification แล้ว และสร้าง **App Password** 16 ตัวไว้แล้ว

## 1. Supabase project ใหม่ (production)

1. **Project Settings → API Keys** คัดลอกค่าต่อไปนี้เก็บไว้ (อย่าแปะในแชท):
   - Project URL → `SUPABASE_URL`
   - Publishable key (`sb_publishable_...`) → `SUPABASE_PUBLISHABLE_KEY` และ `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Secret key (`sb_secret_...`) → `SUPABASE_SECRET_KEY`
2. **Connect → Session pooler** (port 5432) คัดลอก connection string แล้วใส่รหัสผ่านฐาน → `DATABASE_URL`
3. **ไม่ต้องสร้างตาราง และไม่ต้องสร้าง bucket เอง:** server ทำให้ตอนบูตครั้งแรก
   - สร้าง schema ทั้งหมด
   - seed บทเรียนและโจทย์
   - สร้าง bucket `ASSET_STORAGE_BUCKET`

## 2. Render Web Service

1. **New → Web Service** แล้วต่อ repo ใหม่ (private)
   - Runtime: **Docker**
   - Region: **Singapore**
   - Instance: **Free**
2. Health Check Path: `/api/health/ready`
3. **Environment** ใส่ค่าตามตารางด้านล่าง
   - ค่า `VITE_*` ต้องมีตั้งแต่ตอน build image
   - Render ส่ง env ของ service เข้า Docker build เป็น build arg ให้ แต่ถ้า build ฟ้องว่าไม่มี `VITE_SUPABASE_URL` ให้ตรวจข้อนี้เป็นอย่างแรก
4. ยังไม่ต้องรู้ URL ตอนสร้าง: กด Deploy ครั้งแรกก่อน แล้วค่อยเอา `https://<ชื่อ>.onrender.com` ไปใส่ 3 ค่าที่ต้องใช้ URL แล้ว deploy อีกครั้ง

### ตัวแปรสภาพแวดล้อม

| ตัวแปร | ค่า | |
|---|---|---|
| `DATABASE_URL` | Session pooler ของ project ใหม่ | **จำเป็น** |
| `SUPABASE_URL` | Project URL ของ project ใหม่ | **จำเป็น** |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` | **จำเป็น** |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | **จำเป็น** |
| `VITE_SUPABASE_URL` | เท่ากับ `SUPABASE_URL` | **จำเป็น** (ใช้ตอน build) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | เท่ากับ `SUPABASE_PUBLISHABLE_KEY` | **จำเป็น** (ใช้ตอน build) |
| `PUBLIC_BASE_URL` | `https://<ชื่อ>.onrender.com` | **จำเป็น** |
| `CLIENT_URL` | ต้องตรงกับ `PUBLIC_BASE_URL` ทุกตัวอักษร | **จำเป็น** |
| `AUTH_ALLOWED_ORIGINS` | `https://<ชื่อ>.onrender.com` | **จำเป็น** |
| `ASSET_STORAGE_BUCKET` | `uploads` | **จำเป็น** |
| `NVIDIA_API_KEY`, `NVIDIA_AI_MODEL` | คีย์ใหม่ (หลังหมุน) ของแชทบอท Lumi | ไม่บังคับ: ถ้าไม่ตั้ง แชทบอทจะปิด |
| `NVIDIA_CODE_JUDGE_API_KEY`, `NVIDIA_CODE_JUDGE_MODEL` | คีย์ใหม่ของตัวตรวจ Competitive | ไม่บังคับ: ถ้าไม่ตั้ง ระบบให้คะแนนในเครื่อง |
| `GEMINI_CODE_JUDGE_API_KEY`, `GEMINI_CODE_JUDGE_MODEL` | | **เว้นว่างไว้ก่อน** (ADR 0008 ข้อ 6) |
| `NODE_ENV`, `PORT`, `UPLOADS_DIR` | | ไม่ต้องตั้ง: Dockerfile และ Render ตั้งให้ |
| `SUPABASE_ACCESS_TOKEN`, `AUTH_SMTP_PASS`, `AUTH_GOOGLE_CLIENT_SECRET` | | **ห้ามตั้ง** (server ไม่ยอมบูต) ใช้ได้เฉพาะในขั้นที่ 3 |
| `PGHOST`, `PGPASSWORD` ฯลฯ | | ไม่ต้องตั้ง เพราะใช้ `DATABASE_URL` |

Server ตรวจค่าที่จำเป็นตอนบูต (`server/runtime/environment.js`) ถ้าค่าไหนผิด log ของ Render จะบอกชื่อตัวแปรนั้น

## 3. ตั้งค่า Supabase Auth ของ project ใหม่ (ทำครั้งเดียว)

ใช้สคริปต์ที่มีอยู่แล้ว เพื่อไม่ต้องกดใน dashboard ทีละช่อง

1. **Google Cloud Console → OAuth client เดิม:**
   - เพิ่ม Authorized redirect URI: `https://<project-ref-ใหม่>.supabase.co/auth/v1/callback`
   - เพิ่ม Authorized JavaScript origin: `https://<ชื่อ>.onrender.com`
2. สร้าง `server/.supabase-management.env` จาก `.supabase-management.env.example` (ไฟล์นี้ git ไม่ track อยู่แล้ว)
   - ใส่ค่าของ **project ใหม่**:
     - `SUPABASE_URL`, `PUBLIC_BASE_URL`, `CLIENT_URL`, `AUTH_ALLOWED_ORIGINS` (ค่าเดียวกับบน Render)
     - `SUPABASE_ACCESS_TOKEN` (Account → Access Tokens)
   - ใส่ค่า SMTP ของ Gmail:
     - `AUTH_SMTP_HOST=smtp.gmail.com`, `AUTH_SMTP_PORT=465`
     - `AUTH_SMTP_USER=<gmail>`, `AUTH_SMTP_PASS=<App Password>`, `AUTH_SMTP_SENDER=<gmail>`
   - ใส่ `AUTH_GOOGLE_CLIENT_ID` / `AUTH_GOOGLE_CLIENT_SECRET` ของ OAuth client เดิม
3. รันจาก `server/`:
   ```bash
   node scripts/configure-supabase-auth.js --check
   ```
   ```bash
   node scripts/configure-supabase-auth.js --verify-smtp
   ```
   ```bash
   node scripts/configure-supabase-auth.js --apply
   ```
   - `--check`: ตรวจค่าโดยไม่ส่งอะไรออกไป
   - `--verify-smtp`: ทดสอบล็อกอิน Gmail โดยไม่ส่งอีเมล
   - `--apply`: เขียน Site URL, Redirect URLs, SMTP และ Google provider ลง project ใหม่
4. **ลบ `server/.supabase-management.env` ทิ้งหลังใช้เสร็จ** ไฟล์นี้มี token ที่แก้ทั้ง project ได้

## 4. กันเครื่องหลับ

- cron-job.org → Create cronjob
  - URL: `https://<ชื่อ>.onrender.com/api/health/live`
  - ทุก 10 นาที
- ตรวจหน้า History ว่าได้ 200 ต่อเนื่อง

## 5. บัญชี admin

- สมัครบนเว็บจริงด้วยอีเมลหรือ Google ตามปกติ
- จากนั้นให้ผู้พัฒนาตั้ง `role = 'admin'` ให้บัญชีนั้นในฐาน production
  - ทำครั้งเดียว และต้องได้รับอนุญาตจากเจ้าของก่อน

## 6. ตรวจหลัง deploy

- `/api/health/live` และ `/api/health/ready` ตอบ 200
- smoke test ผ่าน browser:
  - สมัครด้วยอีเมลแล้วได้อีเมลยืนยันจริง
  - ล็อกอินด้วย Google
  - บทเรียนและแบบฝึกหัด
  - Competitive
  - Arcade ห้อง 5 คนพร้อมบอท (สรุปรอบมีที่มาของเงิน และประวัติรอบมีผลตรวจโค้ด)
  - บทแนะนำของ Lumi
- `pg_stat_activity` ของ project ใหม่ต้องมี connection จาก Render เท่านั้น

## อัปเดตเวอร์ชัน

- push ขึ้น repo ใหม่แล้ว Render จะ build และ deploy ให้เอง
- migration รันตอนบูต
- ถ้า `/api/health/ready` ไม่ผ่าน Render จะยังไม่ส่ง traffic ไปเวอร์ชันใหม่
