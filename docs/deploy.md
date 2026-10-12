# การติดตั้งใช้งานจริง

PySim ทั้งระบบทำงานเป็น **process เดียว port เดียว** — API เสิร์ฟหน้าเว็บที่ build แล้วด้วยตัวเอง
จึงไม่มีเรื่องข้ามโดเมนให้ตั้งค่า และไม่ต้องเลือกผู้ให้บริการโฮสต์ตอนนี้
ทุกอย่างที่ต้องมีอยู่ในไฟล์ container ไฟล์เดียว

```bash
docker compose --env-file server/.env up --build
```

เปิด http://localhost:3001 — ครั้งแรกจะสร้างตารางและใส่เนื้อหาบทเรียนให้เองทั้งหมด
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
| `PUBLIC_BASE_URL` | **ใช่** | URL เต็มที่ผู้ใช้เปิดจากภายนอก และต้องอยู่ใน `AUTH_ALLOWED_ORIGINS` |
| `AUTH_ALLOWED_ORIGINS` | **ใช่** | รายการ origin ที่อนุญาต คั่นด้วย comma และต้องมี origin ของ `PUBLIC_BASE_URL` |
| `UPLOADS_DIR` | compose ตั้งให้แล้ว | ที่เก็บไฟล์อัปโหลด ต้องอยู่บน volume |
| `NVIDIA_API_KEY` `NVIDIA_AI_MODEL` | ไม่ | แชทบอท Lumi ถ้าไม่ตั้งจะใช้เนื้อหาสำรองในตัว |
| `NVIDIA_CODE_JUDGE_API_KEY` `NVIDIA_CODE_JUDGE_MODEL` | ไม่ | ตัวตรวจคุณภาพโค้ด ถ้าไม่ตั้งจะให้คะแนนในเครื่องโดยไม่ส่งโค้ดออกนอก |
| `EMAIL_USER` `EMAIL_PASS` | ไม่ | อีเมลยืนยันและรีเซ็ตรหัสผ่าน |
| `GOOGLE_CLIENT_ID` | **ใช่ ถ้าต้องการปุ่มเข้าสู่ระบบด้วย Google** | OAuth **Web** Client ID ถ้าไม่ตั้ง ปุ่ม Google จะขึ้นว่ายังไม่เปิดให้ใช้และกดไม่ได้ ส่วนการเข้าสู่ระบบด้วยชื่อผู้ใช้ยังทำงานปกติ |

ตอนสร้าง production image, compose นำ `SUPABASE_URL` กับ
`SUPABASE_PUBLISHABLE_KEY` ไปเป็น `VITE_SUPABASE_URL` กับ
`VITE_SUPABASE_PUBLISHABLE_KEY` ให้ client โดยตรง ส่วน `VITE_API_BASE_URL` ปล่อยว่าง
เพื่อใช้ API แบบ same-origin ดูรายการฝั่ง browser ที่
[`client/.env.example`](../client/.env.example)

⚠️ `VITE_*` ทุกตัวถูกฝังลงในไฟล์ที่ผู้ใช้ดาวน์โหลด **ห้ามใส่ความลับ**

ก่อน build ระบบจะปฏิเสธ key ที่ไม่ได้ขึ้นต้นด้วย `sb_publishable_` และก่อนเปิดรับ traffic
server จะตรวจฐานข้อมูล, Supabase keys, public URL, CORS และตำแหน่ง uploads ทั้งหมด
ถ้าขาดหรือมี `SUPABASE_ACCESS_TOKEN` ปะปนใน runtime process จะหยุดทันที

`SUPABASE_ACCESS_TOKEN` ใช้เฉพาะ Management API เท่านั้น ให้เก็บใน
`server/.supabase-management.env` ตาม
[`server/.supabase-management.env.example`](../server/.supabase-management.env.example)
สคริปต์ `server/scripts/configure-supabase-auth.js --apply` จะอ่านไฟล์นี้ แต่ container
จะอ่านเฉพาะ `server/.env` จึงไม่มี management token อยู่ใน runtime

Production container รันด้วย user `node` ที่ไม่มีสิทธิ์ root และเขียนได้เฉพาะ
`/data/uploads` ซึ่ง compose ผูกกับ volume `pysim-uploads`

### เข้าสู่ระบบด้วย Google — ตั้งที่เดียวพอ

ใส่ `GOOGLE_CLIENT_ID` ใน `server/.env` **ที่เดียว** หน้าเข้าสู่ระบบขอค่านี้จาก
`/api/config/google` ตอนเปิดหน้า จึงไม่ต้องตั้ง `VITE_GOOGLE_CLIENT_ID` ตอน build
(ตั้งได้ถ้าอยากให้ฝังไว้ในบันเดิล แต่ค่าที่ server ให้มาจะถูกใช้ก่อนเสมอ)

**สองครึ่งนี้ต้องเป็น client id เดียวกัน** เบราว์เซอร์ใช้ค่าหนึ่งไปขอ token จาก Google
และ server ใช้อีกค่าหนึ่งไปตรวจ token นั้น ถ้าไม่ตรงกัน ผู้ใช้จะเลือกบัญชี Google ได้ตามปกติ
แล้วไปล้มเอาตอนสุดท้าย ซึ่งเป็นจุดที่หาสาเหตุยากที่สุด

อย่าลืมเพิ่มโดเมนจริงเข้าไปใน **Authorized JavaScript origins** ของ client id นั้น
ใน Google Cloud Console ไม่งั้น Google จะตอบ 403 ทั้งที่ตั้งค่าฝั่งเราถูกหมดแล้ว

---

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

### ⚠️ Data API เปิดตาราง `users` ให้คนทั้งโลกอ่านโดยปริยาย

Supabase เอา schema `public` ไปเปิดเป็น REST API และให้สิทธิ์บทบาท anonymous อ่านตารางในนั้น
schema นี้มีตาราง `users` ที่เก็บอีเมลจริงและ bcrypt hash **ถ้าปล่อยไว้ ใครก็ตามที่มี
publishable key ของโปรเจค (ซึ่งอยู่ในหน้าเว็บ) จะดึงตารางผู้ใช้ทั้งตารางผ่าน HTTPS ได้**
และจะไม่มี request ไหนล้มเหลว ไม่มี log ที่ไหนผิดปกติเลย

**แอปปิดให้เองตอนบูต** — เมื่อ host ไม่ใช่เครื่องนี้ `lockDownPublicSchema()` ใน `server/db.js`
จะเปิด RLS ให้ทุกตารางใน `public` โดยไม่ผูก policy ไว้เลย ซึ่งเท่ากับปฏิเสธทุกบทบาทที่อยู่ใต้ RLS
(คือบทบาทของ API) ส่วน **เจ้าของตารางไม่อยู่ใต้ RLS** แอปจึงทำงานเหมือนเดิมทุกอย่าง
และด้วยเหตุผลเดียวกัน โค้ดจะแตะเฉพาะตารางที่บัญชีนี้เป็นเจ้าของ ตารางอื่นถูกข้ามพร้อมเตือนในล็อก
แทนที่จะเสี่ยงล็อกแอปออกจากข้อมูลของตัวเอง

ปิดพฤติกรรมนี้ได้ด้วย `SUPABASE_RLS_LOCKDOWN=off` ถ้าตั้งใจจะเปิด Data API จริงๆ

### ขั้นตอนย้าย

1. สร้างโปรเจคใน Supabase แล้วคัดลอก connection string (พอร์ต 6543), Project URL,
   secret key และ publishable key
2. ใส่ `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` และ
   `SUPABASE_PUBLISHABLE_KEY` ลงใน `server/.env` หรือ secret/runtime environment ของโฮสต์
3. บูตแอปหนึ่งครั้ง — ถ้าฐานข้อมูลยังว่าง migration แรกจะติดตั้ง
   `server/schema.sql` แล้วตามด้วย `server/seed-content.sql` (บทเรียน โจทย์ ของในร้านค้า
   ความสำเร็จ — ไม่มีข้อมูลผู้ใช้) ใน transaction เดียว จากนั้นเปิด RLS ให้ทุกตารางอัตโนมัติ
4. ดูในล็อกว่ามีบรรทัด `🔒 ปิดการเข้าถึงจาก Data API ให้ N ตาราง` และไม่มี ⚠️ ตามมา
5. ถ้าต้องการย้ายข้อมูลผู้ใช้เดิมด้วย ให้ `pg_dump` เฉพาะตารางที่ต้องการแล้ว restore เอง
   — สคริปต์ `scripts/dump-schema.js` **จงใจไม่ดัมป์ข้อมูลผู้ใช้** เพื่อไม่ให้อีเมลจริง
   กับ bcrypt hash หลุดเข้า git

**เวอร์ชัน Postgres** — ไฟล์ดัมป์สร้างจาก Postgres 18 แต่ตัดคำสั่งที่มีเฉพาะเวอร์ชัน 17
ขึ้นไปออกแล้ว จึง restore ลงโปรเจค Supabase ที่ยังเป็น 15 หรือ 16 ได้

**สิ่งที่ Supabase ไม่ได้ช่วย** — ไฟล์ที่ผู้ใช้อัปโหลดยังอยู่บน volume ของเครื่องที่รันแอป
ตามหัวข้อถัดไป ไม่ได้ย้ายไป Supabase Storage

---

## ไฟล์ที่ผู้ใช้อัปโหลด

รูปโปรไฟล์ สื่อของบทเรียน และงานศิลป์ของเครื่องแต่งตัวอยู่ใน `UPLOADS_DIR`
ซึ่งเป็น **สถานะเดียวของระบบที่ไม่ได้อยู่ในฐานข้อมูล**
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

## ยังไม่ได้เลือกโฮสต์ และไม่ต้องเลือกตอนนี้

ไฟล์ในโฟลเดอร์นี้ไม่ผูกกับผู้ให้บริการรายใด สิ่งที่ต้องมีคือ
รันคอนเทนเนอร์ได้ · มี PostgreSQL · มี volume สำหรับไฟล์อัปโหลด
ซึ่งครอบคลุมโฮสต์แทบทุกเจ้า การเลือกเจ้าไหนเป็นการตัดสินใจแยกที่ทำทีหลังได้
โดยไม่ต้องแก้โค้ด
