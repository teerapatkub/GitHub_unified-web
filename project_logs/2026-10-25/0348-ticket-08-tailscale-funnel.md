# Ticket 08: ทางเข้าสาธารณะผ่าน Tailscale Funnel (ส่วนของโค้ด)

**วันที่:** 2026-10-25 03:48 (Asia/Bangkok) — Person 3 (สถาปัตยกรรมรวม)
**อ้างอิง:** Spec 0004, `.scratch/self-hosted-local-llm/issues/08-public-access-tailscale-funnel.md`

## สิ่งที่เพิ่ม/แก้

### `docker-compose.funnel.yml` (ใหม่) + `deploy/tailscale/serve.json` (ใหม่)
- service `tailscale` (`tailscale/tailscale:v1.90.9`) ใช้วางทับ compose หลักแบบเดียวกับไฟล์ GPU
- Funnel 443 ส่งต่อไป `http://app:3001` ผ่าน `TS_SERVE_CONFIG` (`${TS_CERT_DOMAIN}` ในไฟล์ container เติมให้เอง)
- `TS_USERSPACE=true` ไม่ต้องใช้ `/dev/net/tun` หรือสิทธิ์พิเศษ
- state อยู่ใน volume `tailscale-state` จึงได้ URL เดิมหลัง restart
- auth key อ่านจาก `server/.tailscale.env` (ไฟล์ใหม่ใน `.gitignore` มี `.example`)
  - ใช้แค่ครั้งแรก และ container ของ tailscale อ่านไฟล์นี้ตัวเดียว ไม่ใช่ app
  - `required: false` จึงลบไฟล์หลังเข้าร่วมแล้วได้
- ตั้ง `TRUST_PROXY=1` ให้ app เมื่อใช้ไฟล์นี้
- **ทำไมแยกเป็นไฟล์ override แทนใส่ในไฟล์หลัก:** ถ้าย้ายไป VM ของ มข. ที่มีโดเมน kku.ac.th แค่ไม่ใส่ไฟล์นี้ ไม่ต้องแก้ compose

### `TRUST_PROXY` (`server/runtime/proxy.js` ใหม่, `server/server.js` เพิ่ม 2 บรรทัด)
- **ปัญหาที่พบ:** rate limit ของ `/api/auth/*` (40 ครั้ง / 15 นาที) นับตาม `req.ip`
  - หลัง Funnel ทุกคำขอมาจาก IP ของ container tailscale ตัวเดียว
  - ถ้าทั้งห้องสมัคร/ล็อกอินพร้อมกันในวันสอบ คนที่ 41 เป็นต้นไปจะได้ 429 "ลองหลายครั้งเกินไป"
- **แก้:** `app.set('trust proxy', trustProxySetting(env))` รับเฉพาะจำนวน hop (ตัวเลข) ค่าอื่น server ไม่บูต
- ปล่อยว่าง = ไม่เชื่อ `X-Forwarded-For` (คนที่ยิงพอร์ตตรงปลอม IP ไม่ได้)
- **เทส (`tests/auth.test.js` 3 ข้อ):** หลัง proxy 1 hop คนละ IP ไม่ชนกัน / IP เดียวยังโดนจำกัด / ไม่ตั้งค่าแล้ว header ปลอมหลบไม่ได้

### `server/scripts/configure-supabase-auth.js`
- **ปัญหาที่พบ:** สคริปต์อ่าน `server/.env` ซึ่งชี้ไปที่ project **ทดสอบ** (`qfsrpupgxwsofdrzbwdw`)
  ถ้ารัน `--apply` ตามคู่มือเดิม จะเขียน Site URL / SMTP / Google ลงผิด project
- **แก้:** อ่านไฟล์เดียวกับ compose (`PYARENA_ENV_FILE` ค่าเริ่มต้น `server/.env.production.local`)
  แล้วค่อยอ่าน `server/.supabase-management.env` เหมือนเดิม
- เติม `CLIENT_URL` จาก `PUBLIC_BASE_URL` แบบเดียวกับที่ compose ทำให้ app
- พิมพ์ชื่อไฟล์ env และ project ref ก่อนทำอะไร ให้เห็นว่ากำลังตั้งค่า project ไหน
- **เทส (`tests/production-auth-settings.test.js`):** รันสคริปต์จริงด้วย `--check` กับไฟล์ env ชั่วคราว ต้องรายงาน project ของไฟล์นั้น

### `server/runtime/environment.js`
- `TS_AUTHKEY` อยู่ในรายการค่าที่ห้ามมีใน runtime ของ app แบบเดียวกับ `SUPABASE_ACCESS_TOKEN` (มีเทส)

### อื่นๆ
- `server/.env.example`: อธิบาย `TRUST_PROXY`
- หัว `docker-compose.yml`: บอกวิธีเพิ่มไฟล์ funnel

## ผลกระทบ
- ไม่แตะ schema, Bot AI หรือคลังโจทย์
- ไม่ตั้ง `TRUST_PROXY` = พฤติกรรมเดิมทุกอย่าง (dev, เทส)
- `docker compose config` กับไฟล์ env ปลอม ผ่านทั้งสามไฟล์รวมกัน

## ผลเทส
- server `npm test`: pretest 75/75, ชุดหลัก 212/212
- `npm run lint` (server): ผ่าน (30 warning เท่าเพดานเดิม)

## ยังไม่ได้ทำ — ผู้ใช้ต้องทำเอง (ในบัญชีของตัวเอง)
1. ถามอาจารย์ว่าใช้ Tailscale Funnel เป็นทางเข้าชั่วคราวได้ไหม
2. Tailscale: สมัคร, เปิด HTTPS certificates และ Funnel, สร้าง auth key ใส่ `server/.tailscale.env`
3. หลังได้ชื่อ ts.net: ใส่ `PUBLIC_BASE_URL` และ `AUTH_ALLOWED_ORIGINS` ใน `server/.env.production.local`
4. ใส่ `AUTH_SMTP_*` และ `AUTH_GOOGLE_*` ใน `server/.supabase-management.env` แล้วรันสคริปต์ `--check` → `--verify-smtp` → `--apply`
5. Google Cloud Console: callback `https://lnijkucfutyekbxquliq.supabase.co/auth/v1/callback` และ origin ts.net
6. ปิด key expiry ของเครื่องนี้ใน admin console ของ Tailscale
7. ทดสอบสมัครด้วยอีเมล / ล็อกอิน Google ผ่าน URL ts.net แล้วลบ `server/.supabase-management.env` และ `server/.tailscale.env`

ยังไม่ได้ทดสอบว่า proxy ส่ง `X-Forwarded-For` จริงจาก Funnel (ต้องมีเครื่องที่เข้าร่วม tailnet แล้ว) ตรวจได้ตอนข้อ 7 โดยดูว่าล็อกอินผิดหลายครั้งจากเครื่องหนึ่งไม่ทำให้อีกเครื่องโดน 429
