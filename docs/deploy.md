# การติดตั้งใช้งานจริง

> **แก้ 2026-10-22 (Spec 0004):** `docker-compose.yml` ไม่มีบริการ PostgreSQL แล้ว ใช้ Supabase ผ่าน `DATABASE_URL` และมี Ollama (LLM ในเครื่อง) อยู่ด้วย
> ไฟล์ env คือ `server/.env.production.local` ส่วนคำสั่งและขั้นตอนข้างล่างบางส่วนยังเป็นของเดิม คู่มือฉบับใหม่จะเขียนใน ticket 09

PySim ทั้งระบบทำงานเป็น **process เดียว port เดียว** — API เสิร์ฟหน้าเว็บที่ build แล้วด้วยตัวเอง
จึงไม่มีเรื่องข้ามโดเมนให้ตั้งค่า และไม่ต้องเลือกผู้ให้บริการโฮสต์ตอนนี้
ทุกอย่างที่ต้องมีอยู่ในไฟล์ container ไฟล์เดียว

```bash
docker compose --env-file server/.env up --build
```

ก่อนรัน ต้องตั้ง `PUBLIC_BASE_URL` (และ `AUTH_ALLOWED_ORIGINS`) ใน `server/.env` เป็น origin HTTPS
สาธารณะของ deployment นี้ เพราะ image รันแบบ `NODE_ENV=production` ซึ่งไม่รับ `http://localhost`
แล้วเปิด origin นั้น (หรือ http://localhost:3001 จากเครื่องที่รัน) — ครั้งแรกจะสร้างตารางและใส่เนื้อหาบทเรียนให้เองทั้งหมด
เซิร์ฟเวอร์จะเปิดพอร์ตสำหรับ liveness ระหว่างเตรียมระบบ แต่จะตอบ `503` ต่อ traffic อื่น
จนกว่า PostgreSQL, Supabase Auth configuration และ migration ทุกเวอร์ชันสำเร็จ

---

## ทำไมต้องเป็น container

โปรเจคนี้ **ตัดสินคำตอบด้วยการรัน Python จริง** ([ADR-0001](adr/0001-server-owns-the-verdict.md))
เครื่องปลายทางจึงต้องมีทั้ง Node และ Python พร้อมไลบรารีที่โจทย์ใช้
ซึ่งโฮสต์ Node ทั่วไปไม่มีให้ `Dockerfile` คือคำตอบเดียวของทั้งสองเรื่องพร้อมกัน:
ความสามารถในการตรวจ และความสามารถในการติดตั้ง

ไลบรารีอยู่ใน [`server/requirements.txt`](../server/requirements.txt) — flask, pandas, requests,
matplotlib, pytest ซึ่งได้มาจากการอ่านเฉลยของโจทย์ทุกข้อในฐานข้อมูล ไม่ได้เดา

---

## ตอนบูตครั้งแรกระบบทำอะไรให้บ้าง

โครงสร้างตั้งต้นและการเปลี่ยน schema ถูกบันทึกใน `app_schema_migrations` ตามลำดับเวอร์ชัน
ฐานข้อมูลใหม่จะติดตั้ง schema กับ seed ภายใน transaction เดียว ถ้าขั้นใดล้มเหลวจะ rollback
และเริ่มซ้ำได้ ส่วนฐานข้อมูลเดิมจะรันเฉพาะ migration ที่ยังไม่มีในตารางนี้

| ขั้น | ไฟล์ | ได้อะไร |
|---|---|---|
| 1 | `server/schema.sql` | ตารางทั้งหมด 63 ตาราง + view 4 ตัว ดัชนี และ constraint |
| 2 | `server/seed-content.sql` | บทเรียน 24 บท สไลด์ 220 หน้า คำถาม 190 ข้อ คลังโจทย์ 192 ข้อ ร้านค้า ความสำเร็จ |
| 3 | `db.js` | ตารางที่ db.js ดูแลเอง (arcade_*, การ seed โจทย์ Arcade) |
| 4 | เบื้องหลัง | คำนวณใหม่ว่าโจทย์ข้อไหน **ตรวจอัตโนมัติได้บนเครื่องนี้** |

ตรวจสถานะ process และฐานข้อมูลแยกกันได้ดังนี้:

- `GET /api/health/live` ตอบเมื่อ process ยังทำงาน โดยไม่เรียก dependency
- `GET /api/health/ready` ตรวจ PostgreSQL และ migration version ที่โค้ดต้องการ
- `GET /api/health` เป็น alias ของ readiness สำหรับระบบเดิม

หาก migration ล้มเหลว process จะปิด HTTP listener และจบด้วย exit code ที่ไม่สำเร็จ
ระหว่างเริ่มระบบมีเพียง health endpoint ที่เข้าถึงได้ จึงไม่สามารถรับ application traffic
ด้วย schema ที่ติดตั้งไม่ครบได้

**ไม่มีบัญชีผู้ใช้ติดมาแม้แต่รายการเดียว** — `seed-content.sql` มีเฉพาะเนื้อหาที่เป็นตัวสินค้า
ไม่มี `users`, ไม่มีคำตอบที่เคยส่ง, ไม่มีอีเมล ไม่มีรหัสผ่าน
รายชื่อตารางที่ถูกดัมป์เป็น **whitelist ที่เขียนไว้ชัดเจน** ในสคริปต์ ไม่ใช่รายการยกเว้น
เพราะรายการยกเว้นที่พลาดไปหนึ่งตารางแปลว่าบัญชีจริงหลุดเข้า git

### ขั้นที่ 4 สำคัญกว่าที่เห็น

`problems.is_auto_gradable` คำนวณจาก **การรันเฉลยของทุกข้อจริง** ค่าที่ติดมากับ seed
คำนวณบนเครื่องพัฒนาที่ไม่มี flask, requests, pytest จึงบอกว่ามี 26 ข้อที่ตรวจไม่ได้
พอมาอยู่บน container ที่มีไลบรารีครบ เหลือจริงแค่ **15 ข้อ**
(ต้องต่ออินเทอร์เน็ต 5 · tkinter 5 · ต้องมีไฟล์อยู่ก่อน 3 · ผลลัพธ์สุ่ม 2)
อีก **11 ข้อกลับมาถูกตรวจจริง** แทนที่จะถูกปล่อยผ่านตลอดไปเพราะ import ที่ขาดตอนดัมป์

รันเองได้ทุกเมื่อ (เช่น หลังเพิ่มไลบรารีใน `requirements.txt`):

```bash
docker compose exec app node scripts/mark-auto-gradable.js --apply
```

---

## ตั้งค่าอะไรบ้าง

คีย์และรหัสผ่านอ่านจาก `server/.env` ซึ่ง **ไม่อยู่ใน image และไม่อยู่ใน git**
ดูรายการเต็มพร้อมคำอธิบายที่ [`server/.env.example`](../server/.env.example)

| ตัวแปร | ต้องตั้งไหม | ทำอะไร |
|---|---|---|
| `PGHOST` `PGPORT` `PGUSER` `PGPASSWORD` `PGDATABASE` | compose ตั้งให้แล้ว | ฐานข้อมูล |
| `DATABASE_URL` | **ใช่เมื่อใช้ Supabase/managed PostgreSQL** | connection string ฝั่ง server ใช้แทนตัวแปร `PG*` |
| `SUPABASE_URL` | **ใช่** | Project URL จาก Supabase Dashboard → Project Settings → Data API |
| `SUPABASE_SECRET_KEY` | **ใช่** | Secret key ฝั่ง server จาก Project Settings → API Keys ห้ามใส่ใน client หรือ image |
| `SUPABASE_PUBLISHABLE_KEY` | **ใช่** | Publishable key จาก Project Settings → API Keys ใช้สร้าง client สำหรับ Email Auth |
| `PORT` | ไม่ | พอร์ตที่ API ฟัง (ค่าเริ่มต้น 3001) |
| `PUBLIC_BASE_URL` | **ใช่** | URL เต็มที่ผู้ใช้เปิดจากภายนอก และต้องอยู่ใน `AUTH_ALLOWED_ORIGINS` ต้องเป็น origin HTTPS สาธารณะแบบ exact (ไม่ใช่ `localhost` ไม่มี path) compose ไม่มีค่าเริ่มต้นให้ ถ้าไม่ตั้ง `docker compose` จะหยุดพร้อมบอกชื่อตัวแปร แทนที่จะปล่อยให้ container ขึ้นแล้วล้มตอนบูต |
| `CLIENT_URL` | **ใช่** | URL ของหน้าเว็บ ต้องตรงกับ `PUBLIC_BASE_URL` ใน production; compose ตั้งให้จากค่าเดียวกัน |
| `AUTH_ALLOWED_ORIGINS` | **ใช่** | รายการ origin ที่อนุญาต คั่นด้วย comma และต้องมี origin ของ `PUBLIC_BASE_URL` |
| `UPLOADS_DIR` | compose ตั้งให้แล้ว | โฟลเดอร์ไฟล์ในเครื่อง ใช้เก็บไฟล์ที่ admin อัปโหลดเฉพาะตอน dev ที่ไม่ได้ตั้ง `ASSET_STORAGE_BUCKET` (ผู้เล่นอัปโหลดรูปโปรไฟล์เองไม่ได้แล้ว) |
| `ASSET_STORAGE_BUCKET` | **ใช่** (compose ตั้งค่าเริ่มต้นเป็น `uploads`) | ชื่อ bucket ใน Supabase Storage ที่เก็บไฟล์ที่ admin อัปโหลด (สื่อบทเรียน, รูปไอเทม) server สร้าง bucket แบบอ่านได้สาธารณะให้เองตอนอัปโหลดครั้งแรก |
| `NVIDIA_API_KEY` `NVIDIA_AI_MODEL` | ไม่ | แชทบอท Lumi ถ้าไม่ตั้งจะใช้เนื้อหาสำรองในตัว |
| `NVIDIA_CODE_JUDGE_API_KEY` `NVIDIA_CODE_JUDGE_MODEL` | ไม่ | ตัวตรวจคุณภาพโค้ด ถ้าไม่ตั้งจะให้คะแนนในเครื่องโดยไม่ส่งโค้ดออกนอก |
| `EMAIL_USER` `EMAIL_PASS` | ไม่ | ค่าอีเมลของระบบรุ่นเก่า ไม่ใช้แทน Custom SMTP ของ Supabase Auth |

ตอนสร้าง production image, compose นำ `SUPABASE_URL` กับ
`SUPABASE_PUBLISHABLE_KEY` ไปเป็น `VITE_SUPABASE_URL` กับ
`VITE_SUPABASE_PUBLISHABLE_KEY` ให้ client โดยตรง ส่วน `VITE_API_BASE_URL` ปล่อยว่าง
เพื่อใช้ API แบบ same-origin ดูรายการฝั่ง browser ที่
[`client/.env.example`](../client/.env.example)

⚠️ `VITE_*` ทุกตัวถูกฝังลงในไฟล์ที่ผู้ใช้ดาวน์โหลด **ห้ามใส่ความลับ**

ก่อน build ระบบจะปฏิเสธ key ที่ไม่ได้ขึ้นต้นด้วย `sb_publishable_` และก่อน bind พอร์ต
server จะตรวจฐานข้อมูล, Supabase keys, public/client URL, CORS และตำแหน่ง uploads ทั้งหมด
ถ้าขาดหรือมี `SUPABASE_ACCESS_TOKEN`/`AUTH_SMTP_PASS` ปะปนใน runtime process จะหยุดทันที

`SUPABASE_ACCESS_TOKEN` ใช้เฉพาะ Management API เท่านั้น ให้เก็บใน
`server/.supabase-management.env` ตาม
[`server/.supabase-management.env.example`](../server/.supabase-management.env.example)
สคริปต์ `server/scripts/configure-supabase-auth.js --apply` จะอ่านไฟล์นี้ แต่ container
จะอ่านเฉพาะ `server/.env` จึงไม่มี management token อยู่ใน runtime

### D09 — ตั้งอีเมล Auth สำหรับ production

ขั้นนี้ต้องมี URL ที่ผู้ใช้เปิดได้จริงผ่าน HTTPS และ SMTP จากผู้ให้บริการที่ยืนยัน
sender/domain แล้วก่อน จึงจะทดสอบกับ mailbox นอกทีมได้ ห้ามใช้ `localhost`
เป็น Site URL ของระบบเปิดใช้จริง และห้ามใช้ `EMAIL_USER`/`EMAIL_PASS` รุ่นเก่า
แทนค่า `AUTH_SMTP_*` โดยไม่ตรวจสอบผู้ส่ง

1. ตั้ง `PUBLIC_BASE_URL` และ `CLIENT_URL` เป็น origin HTTPS เดียวกัน เช่น
   `https://play.example.com` (ไม่ใส่ path/query) แล้วตั้ง
   `AUTH_ALLOWED_ORIGINS` เป็น origin HTTPS แบบ exact คั่นด้วย comma
   โดยมี origin หลักเสมอ เพิ่ม preview เฉพาะ URL ที่ใช้งานจริง
2. ตั้ง `AUTH_SMTP_HOST`, `AUTH_SMTP_PORT`, `AUTH_SMTP_USER`,
   `AUTH_SMTP_PASS`, `AUTH_SMTP_SENDER` กับ `SUPABASE_ACCESS_TOKEN` ใน
   `server/.supabase-management.env` ที่ Git ไม่ติดตามเท่านั้น ไฟล์นี้ใช้
   กับคำสั่ง setup นอก container และไม่ถูกส่งเข้า application runtime
3. จาก `server/` รัน `node scripts/configure-supabase-auth.js --check` เพื่อตรวจ
   URL/ค่าที่ต้องมี โดยไม่เชื่อมต่อ SMTP หรือเปลี่ยน Supabase; จากนั้นรัน
   `node scripts/configure-supabase-auth.js --verify-smtp` เพื่อตรวจการเชื่อมต่อ
   (ยังไม่ส่งอีเมล) เมื่อพร้อมจึงรัน `node scripts/configure-supabase-auth.js --apply`
4. สคริปต์ตั้ง Site URL และ allowlist ของ callback สำหรับ
   `/login?auth=confirm` กับ `/login?auth=recovery` แบบ exact แทนรายการเดิม
   ตรวจรายการ preview ทุกตัวก่อนรัน เพราะ redirect อื่นที่ไม่ได้อยู่ใน
   `AUTH_ALLOWED_ORIGINS` จะถูกลบจาก allowlist ของ Supabase
5. สมัครบัญชีทดสอบใหม่ด้วย mailbox **นอกทีมโครงการ**, เปิดอีเมลยืนยัน
   และตรวจว่าลิงก์ยังไม่หมดอายุ กลับ HTTPS production และเข้าสู่ระบบได้
   จากนั้นขอรีเซ็ตรหัสผ่านของบัญชีนั้น เปิดอีเมลกู้คืน เปลี่ยนรหัสผ่าน
   และยืนยันว่าใช้รหัสผ่านใหม่ได้ ทดสอบลิงก์หมดอายุและ URL ที่ไม่อยู่ใน
   allowlist ว่าถูกปฏิเสธ ตรวจว่าลิงก์ใดๆ ไม่กลับ localhost
6. หลังทดสอบจริงจึงพิจารณาปรับ Auth email rate limit ให้เหมาะกับปริมาณและ
   ข้อกำหนดของ SMTP provider; จดผลส่งถึง inbox/spam และเวลาส่งโดยไม่เก็บ
   token, รหัสผ่าน หรือ URL ยืนยันเต็มไว้ใน log

Custom SMTP ของ Supabase เป็นข้อกำหนดสำหรับการส่งถึงผู้ใช้นอกทีม เพราะ
ตัวส่งเริ่มต้นจำกัดผู้รับและไม่เหมาะกับ production
([Supabase Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp));
Site URL และ Redirect URLs ต้องชี้ production จริง
([Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)).

Production container รันด้วย user `node` ที่ไม่มีสิทธิ์ root และเขียนได้เฉพาะ
`/data/uploads` ซึ่ง compose ผูกกับ volume `pysim-uploads` service `uploads-init` จะปรับเจ้าของ
ไฟล์เดิมใน volume เป็น UID/GID 1000 ก่อนเริ่ม app จึงอัปเกรดจาก image รุ่นที่เคยสร้างไฟล์ด้วย root ได้

### เข้าสู่ระบบด้วย Google — ผ่าน Supabase Auth

ตั้งแต่ 2026-10-16 Google login ใช้ Google provider ของ Supabase (ADR 0004) นับรวมในโควตา
MAU ของ Supabase เหมือนผู้ใช้อีเมล ไม่ต้องตั้ง `GOOGLE_CLIENT_ID` ใน server หรือ client อีกแล้ว
หน้า login แสดงปุ่มเมื่อ Supabase รายงานว่าเปิด provider นี้ (`/api/config/google`
ถาม `/auth/v1/settings` ของ Supabase ไว้ 5 นาทีต่อครั้ง)

1. **Google Cloud Console** (เจ้าของ OAuth client ทำ) ใช้ OAuth client ชนิด *Web application*
   - Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Authorized JavaScript origins: origin ของเว็บ เช่น `https://<app>.vercel.app`
   - คัดลอก Client ID และ Client secret
2. ใส่ `AUTH_GOOGLE_CLIENT_ID` กับ `AUTH_GOOGLE_CLIENT_SECRET` ใน `server/.supabase-management.env`
   (ไฟล์นี้ไม่เข้า image และ runtime ห้ามมี secret นี้)
3. รัน `node scripts/configure-supabase-auth.js --check` แล้ว `--apply` สคริปต์จะเปิด Google provider
   และเพิ่ม `<PUBLIC_BASE_URL>/login?auth=google` ใน redirect allowlist แบบ exact
4. ทดสอบ: กด "เข้าสู่ระบบด้วย Google" แล้วกลับมาที่ `/login?auth=google`
   - ผู้เล่นเดิมที่อีเมลตรงกับบัญชี Google จะถูกผูกกับบัญชีเดิม
   - อีเมลใหม่จะได้บัญชีใหม่ที่เลเวล 0 และไปทำแบบสำรวจต่อ

## ย้ายฐานข้อมูลไปที่ Supabase (หรือ Postgres เจ้าอื่น)

แอปต่อฐานข้อมูลด้วย `pg` ธรรมดา จึงชี้ไปที่ Postgres ที่ไหนก็ได้ ตั้งค่าอย่างใดอย่างหนึ่ง

```
DATABASE_URL=postgres://postgres:<password>@<host>:6543/postgres
```

หรือใช้ตัวแปรแยกแบบเดิม (`PGHOST` `PGPORT` `PGUSER` `PGPASSWORD` `PGDATABASE`) ก็ได้

**TLS เปิดให้เองเมื่อ host ไม่ใช่เครื่องนี้** — ฐานข้อมูลแบบ managed ปฏิเสธการต่อที่ไม่เข้ารหัส
ส่วน Postgres ใน Docker บนเครื่องพัฒนาไม่รองรับ TLS เลย โค้ดจึงดูจากชื่อ host แล้วตัดสินเอง
สั่งทับได้ด้วย `PGSSLMODE=disable` และถ้าจะให้ตรวจใบรับรองจริงจัง ให้ชี้ `PGSSLROOTCERT`
ไปที่ไฟล์ CA

**เลือกพอร์ตให้ถูก** — Supabase มีสองทางเข้าที่ต่างกันแค่ตัวเลขพอร์ต
พอร์ต **6543** คือ connection pooler ใช้อันนี้ (รองรับ IPv4 และทนการเปิด-ปิดคอนเนกชันบ่อย)
ส่วนพอร์ต 5432 เป็นการต่อตรงซึ่งเป็น IPv6 อย่างเดียว โฮสต์หลายเจ้าต่อไม่ได้

### Data API ปิดโดยค่าเริ่มต้น

หน้าเว็บเรียก API ของ PyArena เท่านั้นและใช้ Supabase ฝั่ง browser เฉพาะ Auth จึงไม่มีตารางเกม
ใดที่ต้องเปิดตรงผ่าน Data API migration `202610120003` กำหนดขอบเขตนี้ใน PostgreSQL โดยตรง:

- revoke สิทธิ์ schema, table, view, sequence และ function จาก `PUBLIC`, `anon`, `authenticated`
- เปิด RLS ให้ทุก table ใน `public` โดยไม่มี policy สำหรับ Data API
- ตั้งทุก ordinary view เป็น `security_invoker=true`
- revoke default privileges ของ object ที่สร้างในอนาคต
- หยุด migration ทันทีถ้าพบ object ที่ migration role ไม่ได้เป็นเจ้าของ

บทบาทเจ้าของตารางที่ server ใช้ต่อ PostgreSQL โดยตรงยังทำงานตามเดิม และ `service_role`
ยังใช้ endpoint ฝั่ง server ที่กำหนดไว้ได้ การเปิด Data API ในอนาคตต้องทำเป็น migration ใหม่
พร้อม `GRANT`, RLS policy และการทดสอบ authorization ของ resource นั้น ห้ามปิด security migration
ทั้งชุดด้วย environment flag

ชุด acceptance `server/tests/data-api-http.test.js` ยิง anonymous GET/POST ผ่าน PostgREST จริง
และต้องได้ 401/403/404 ทั้งการอ่านและเขียน นอกเหนือจากการตรวจ grant/RLS ด้วย SQL โดยตรง

### ขั้นตอนย้าย

1. สร้างโปรเจคใน Supabase แล้วคัดลอก connection string (พอร์ต 6543), Project URL,
   secret key และ publishable key
2. ใส่ `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` และ
   `SUPABASE_PUBLISHABLE_KEY` ลงใน `server/.env` หรือ secret/runtime environment ของโฮสต์
3. บูตแอปหนึ่งครั้ง — ถ้าฐานข้อมูลยังว่าง migration แรกจะติดตั้ง
   `server/schema.sql` แล้วตามด้วย `server/seed-content.sql` (บทเรียน โจทย์ ของในร้านค้า
   ความสำเร็จ — ไม่มีข้อมูลผู้ใช้) ใน transaction เดียว จากนั้น migration ความปลอดภัยจะจำกัด Data API
4. ดูในล็อกว่ามีบรรทัด `🔒 Data API ปิดโดยค่าเริ่มต้น` และ migration จบครบทุกเวอร์ชัน
5. ถ้าต้องการย้ายข้อมูลผู้ใช้เดิมด้วย ให้ `pg_dump` เฉพาะตารางที่ต้องการแล้ว restore เอง
   — สคริปต์ `scripts/dump-schema.js` **จงใจไม่ดัมป์ข้อมูลผู้ใช้** เพื่อไม่ให้อีเมลจริง
   กับ bcrypt hash หลุดเข้า git

**เวอร์ชัน Postgres** — ไฟล์ดัมป์สร้างจาก Postgres 18 แต่ตัดคำสั่งที่มีเฉพาะเวอร์ชัน 17
ขึ้นไปออกแล้ว จึง restore ลงโปรเจค Supabase ที่ยังเป็น 15 หรือ 16 ได้

**สิ่งที่ Supabase ไม่ได้ช่วย** — ไฟล์ที่ผู้ใช้อัปโหลดยังอยู่บน volume ของเครื่องที่รันแอป
ตามหัวข้อถัดไป ไม่ได้ย้ายไป Supabase Storage

---

## ไฟล์ที่ผู้ใช้อัปโหลด

ไฟล์ที่ admin อัปโหลด (สื่อของบทเรียน, งานศิลป์ของเครื่องแต่งตัว) เก็บใน Supabase Storage
bucket `ASSET_STORAGE_BUCKET` ตั้งแต่ 2026-10-16 จึงไม่หายเมื่อ restart บนโฮสต์ที่ไม่มีดิสก์ถาวร
URL ในฐานข้อมูลยังเป็น `/uploads/<ชื่อไฟล์>` เหมือนเดิม ถ้าไม่พบไฟล์บนดิสก์ server จะ redirect ไปยัง Storage
ผู้เล่นอัปโหลดรูปโปรไฟล์เองไม่ได้แล้ว (2026-10-16) รูปมาจากรูปเริ่มต้นตามระดับ, Google, ร้านค้า หรือ achievement
ไฟล์ใน `UPLOADS_DIR` เป็นสถานะที่ไม่ได้อยู่ในฐานข้อมูล ใช้เฉพาะตอน dev
compose ผูก volume `pysim-uploads` ไว้ที่ `/data/uploads` แล้ว
ถ้าย้ายโฮสต์ ต้องยกโฟลเดอร์นี้ไปด้วย ไม่งั้นทุกคนเสียรูปโปรไฟล์

URL ของไฟล์เหล่านี้เก็บใน**รูปแบบ relative** (`/uploads/xxx.png`)
แถวเก่าที่เคยเก็บเป็น `http://localhost:3001/...` ถูกเขียนใหม่ให้ตอนบูต

---

## อัปเดตเวอร์ชันใหม่

```bash
git pull
docker compose --env-file server/.env up -d --build
```

ฐานข้อมูลจะใช้เฉพาะ migration เวอร์ชันที่ยังไม่เคยสำเร็จ
ไฟล์อัปโหลดไม่ถูกแตะ (อยู่บน volume) ส่วนการเปลี่ยนแปลง schema ใหม่ๆ
ต้องเพิ่ม migration เวอร์ชันใหม่ ห้ามแก้ migration ที่ถูกบันทึกแล้ว

---

## เวลาเปลี่ยน schema หรือเนื้อหาบทเรียน

`schema.sql` และ `seed-content.sql` เป็น baseline ของ migration แรกและถือว่าใช้งานแล้ว
จึง **ห้ามแก้หรือสร้างทับหลังเปิดระบบนี้** การเปลี่ยน schema หรือข้อมูลตั้งต้นครั้งถัดไป
ต้องเพิ่ม migration เวอร์ชันใหม่ใน `server/migrations/` เท่านั้น

สคริปต์ด้านล่างใช้สร้าง baseline สำหรับโครงการใหม่หรือ major version ใหม่ในไฟล์แยก:

```bash
cd server && node scripts/dump-schema.js
```

(ต้องมี Docker เพราะสคริปต์เรียก `pg_dump` ผ่าน image ของ postgres
จะได้ไม่ต้องติดตั้ง client tools บนเครื่อง)

หลังเตรียม migration เวอร์ชันใหม่ ให้ทดสอบด้วย:

```bash
cd server
npm run test:migrations

# ต้องชี้ไปฐาน PostgreSQL ที่ทิ้งได้และชื่อฐานขึ้นต้นด้วย pyarena_ พร้อมคำว่า test
$env:TEST_DATABASE_URL='postgresql://postgres:password@localhost:5432/pyarena_d03_test'
npm run test:migrations:postgres
```

การแก้ชื่อหรือ checksum ของ migration ที่ถูกใช้แล้วทำให้ readiness ล้มเหลวโดยตั้งใจ
ให้สร้างเวอร์ชันใหม่แทนเพื่อรักษาประวัติที่ตรวจสอบได้

---

## ประตูตรวจ dependency และ build (ส่วนของ D13)

CI ใช้ `npm ci` จาก lockfile ของ `client` และ `server` แยกกัน แล้วรัน production audit,
client/server lint, client test/build และตรวจทุก JavaScript chunk ไม่เกิน 500 KiB
server lint จำกัด warning เดิมไว้ไม่เกิน 30 รายการ ส่วน image ติดตั้ง server ด้วย
`npm ci --omit=dev` จึงไม่มี `nodemon` หรือ ESLint ใน runtime

เมื่อตรวจในเครื่อง ให้รันจากแต่ละโฟลเดอร์:

```bash
cd client
npm ci
npm audit --omit=dev --audit-level=low
npm run lint
npm test
npm run build
npm run check:bundle

cd ../server
npm ci
npm audit --omit=dev --audit-level=low
npm run lint
npm run pretest
```

ข้อยกเว้นสำหรับเครื่องมือพัฒนาและวันหมดอายุอยู่ใน
[`docs/security/dependency-exceptions.md`](security/dependency-exceptions.md) ส่วน integration tests
ที่ใช้ PostgreSQL ต้องรันกับฐานทดสอบที่ทิ้งได้ตาม D13

---

## ยังไม่ได้เลือกโฮสต์ และไม่ต้องเลือกตอนนี้

> **อัปเดต 2026-10-21:** เลือกแล้วเป็น Render บริการเดียว + Supabase project ใหม่ ([ADR 0008](adr/0008-one-render-service-and-a-fresh-production-project.md)) ขั้นตอนอยู่ที่ [`deploy-render.md`](deploy-render.md)

ไฟล์ในโฟลเดอร์นี้ไม่ผูกกับผู้ให้บริการรายใด สิ่งที่ต้องมีคือ
รันคอนเทนเนอร์ได้ · มี PostgreSQL · มี volume สำหรับไฟล์อัปโหลด
ซึ่งครอบคลุมโฮสต์แทบทุกเจ้า การเลือกเจ้าไหนเป็นการตัดสินใจแยกที่ทำทีหลังได้
โดยไม่ต้องแก้โค้ด
