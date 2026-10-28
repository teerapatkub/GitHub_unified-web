# Deploy ชั่วคราวบนโน๊ตบุ๊กผ่าน Tailscale Funnel และตั้งค่า Auth ของ production

**วันที่:** 2026-10-28 ราว 13:30–16:00 (Asia/Bangkok), Person 3

## ที่มา

เครื่องของ มข. ออกอินเทอร์เน็ตไม่ได้ (ดู `pysim-kku-host` ใน memory) ผู้ใช้จึงให้ใช้โน๊ตบุ๊กเป็นตัว deploy ชั่วคราวก่อน

## สิ่งที่ทำ

- **Docker Desktop:**
  - หลัง Docker อัปเดต ที่เก็บดิสก์กลับไปเป็นค่าเริ่มต้นบน C: เอง
  - ย้ายไป `Z:\Docker\pyarcade` ด้วยปุ่มในหน้า Settings ของ Docker
    - การสลับดิสก์ด้วยมือพังสองรอบ และผู้ใช้เผลอกด factory reset หนึ่งครั้ง
    - ข้อมูลเก่ายังอยู่ครบที่ `Z:\Docker\project`
  - สร้างฐานทดสอบ `pyarena-test-db` (พอร์ต 55432) ใหม่
- **`server/.env.production.local`:** เพิ่ม `PUBLIC_BASE_URL` / `AUTH_ALLOWED_ORIGINS` = `https://pyarena.tail45e95d.ts.net`
  - ย้ายค่า Google และ SMTP ที่ผู้ใช้ใส่ผิดไฟล์ไปไว้ที่ `server/.supabase-management.env` โดยไม่พิมพ์ค่าออกมา
  - ถ้าค่าลับเหล่านี้อยู่ในไฟล์ของ app ตอนทำงาน app จะไม่ยอมบูต
- **compose:** `-p pyarena` + `docker-compose.gpu.yml` + `docker-compose.funnel.yml`
  - บูตครั้งแรกไม่ผ่าน เพราะฐาน production มี migration จาก remote `deploy`
  - แก้โดยรวมงานเข้า main (`1500-merge-mini-game-choices-from-deploy.md`)
- **Tailscale:** เพิ่ม `nodeAttrs` `funnel` ใน policy (ผู้ใช้ทำ) แล้วรีสตาร์ท container
  - `https://pyarena.tail45e95d.ts.net/api/health/ready` ตอบ `ready` จากภายนอก
- **`auth/productionSettings.js` + `scripts/configure-supabase-auth.js`:** ส่ง `smtp_port` เป็นสตริง
  - Management API ตอบ 400 "smtp_port: expected string, received number"
  - การเทียบค่าหลังบันทึก และ nodemailer ใช้ `settings.smtpPort` ที่เป็นตัวเลข
  - เพิ่มเทสใน `tests/production-auth-settings.test.js` ซึ่งล้มก่อนแก้และผ่านหลังแก้
- **`configure-supabase-auth.js --apply` สำเร็จ:**
  - Site URL / Redirect URLs เป็น ts.net
  - ส่งอีเมลผ่าน Gmail SMTP
  - เปิด Google provider
  - อ่านค่ากลับมาตรวจแล้ว

## ทดสอบ

- `tests/production-auth-settings.test.js` 5/5
- ESLint ผ่าน
- `--verify-smtp` ผ่าน (ล็อกอิน SMTP ได้ ไม่ได้ส่งอีเมล)
- `--apply` ผ่าน และอ่านค่ากลับมาตรงกับที่ตั้ง

## ยังไม่ได้ทำ / ต้องทดสอบ

- สมัครด้วยอีเมลจริง → ลิงก์ยืนยันพากลับมาที่ ts.net → ล็อกอิน
- ล็อกอินด้วย Google: ผู้ใช้ต้องเพิ่ม redirect URI `https://lnijkucfutyekbxquliq.supabase.co/auth/v1/callback` ใน Google Cloud Console
- หลังทดสอบผ่าน:
  - ลบ `server/.supabase-management.env` และ `server/.tailscale.env`
  - ลบ access token ที่ supabase.com/dashboard/account/tokens
- smoke test จากมือถือ 4G (ticket 10)

## ติดตามผล 16:50: เว็บเปิดได้บ้างไม่ได้บ้าง → อัปเกรด Tailscale

- **อาการ:** ผู้ใช้เปิดหน้าเว็บได้ แต่ API ขึ้น `ERR_CONNECTION_CLOSED` / `Failed to fetch` และบางครั้ง timeout ทั้งหน้า
  - ส่วน `localhost:3001` ตอบปกติ
- **สาเหตุ (จาก log ของ tailscale):** ingress ของ Funnel ต่อเข้า PeerAPI ของเครื่อง (`:65273`) แล้วได้ `CreateEndpoint error ... connection was refused` ทุกครั้ง
  - เกิดบน `tailscale/tailscale:v1.90.9` ในโหมด `TS_USERSPACE=true`
- **แก้:** `docker-compose.funnel.yml` ใช้ `tailscale/tailscale:v1.104.2` (stable ล่าสุดตอนนี้)
  - state อยู่ใน volume เดิม จึงได้ที่อยู่เดิม
- **ผลตรวจ:**
  - ยิงซ้ำ 16 ครั้ง: 2 ครั้งแรกล้มระหว่าง container บูต จากนั้นได้ 200 ต่อเนื่อง 14 ครั้ง
  - ไฟล์เพลง 6.6 MB โหลดครบผ่าน Funnel (11 วินาที)
  - POST `/api/auth/sign-in` ถึง app (400 จาก body ว่าง ซึ่งเป็นผลที่ถูก)
  - ไม่มี `CreateEndpoint` error หลังอัปเกรด
