# กัน `server/.supabase-management.env` ไม่ให้เข้า image + compose `PUBLIC_BASE_URL`

**วันที่**: 2026-10-15 13:16
**อ้างอิง**: `specs/0002-production-security-and-deploy-gate.md` (story 3, 20 และข้อ "management access token … ไม่รวมใน image")

## ปัญหาที่พบ

1. `.dockerignore` กันแค่ `**/.env` กับ `**/.env.*` ชื่อ `.supabase-management.env` ไม่ตรงทั้งสองแบบ
   และ Dockerfile ทำ `COPY server/ ./` ดังนั้น `docker compose up --build` บนเครื่องที่มีไฟล์นี้
   จะอบ `SUPABASE_ACCESS_TOKEN` กับ `AUTH_SMTP_PASS` เข้า image ไปด้วย
   **ยืนยันด้วยการ build จริง** โดยใช้ `.dockerignore` ของ HEAD: ใน image เจอ
   `/ctx/server/.supabase-management.env` และ `.supabase-management.env.example`
2. ตัวสแกน image (`isForbiddenRuntimePath`) ก็ไม่รู้จักชื่อนี้ ถ้าไฟล์หลุดเข้าไปจะไม่ถูกจับด้วยชื่อไฟล์
3. `docker-compose.yml` ตั้ง `PUBLIC_BASE_URL` เริ่มต้นเป็น `http://localhost:3001` แต่ image รัน
   `NODE_ENV=production` ซึ่ง `exactHttpsOrigin()` ปฏิเสธ localhost/HTTP — compose จึง "ขึ้น"
   แล้ว app ล้มตอนบูตทุกครั้งที่ไม่ได้ตั้งค่านี้

## สิ่งที่แก้

| ไฟล์ | แก้อะไร |
|---|---|
| `.dockerignore` | เพิ่ม `**/*.env`, `**/*.env.*`, `**/.supabase-management.env*` พร้อมเหตุผล (ตัวอย่าง `.env.example` ก็ไม่เข้า image เช่นเดิม — runtime ไม่ได้อ่าน) |
| `scripts/security/repository-safety.mjs` | `isForbiddenRuntimePath` ห้ามทุกไฟล์ที่ลงท้าย `.env` หรือมี `.env.` ในชื่อ ยกเว้นที่ลงท้าย `.env.example` · เพิ่มตัวตรวจ `smtp-url-password` (`smtp(s)://user:pass@`) และ `smtp-password` (key แบบตัวเล็ก/camelCase เช่น `"smtp_pass": "..."`, `smtpPassword: '...'` ซึ่ง regex เดิมจับแค่ชื่อตัวใหญ่) · export `requiredEnvironmentFileDockerIgnorePatterns` |
| `scripts/security/container-image-safety.mjs` | แยก `inspectEnvironmentEntries()` ออกมา (export) และรายงาน `setup-only-environment` เมื่อ ENV ของ image มี `SUPABASE_ACCESS_TOKEN` หรือ `AUTH_SMTP_PASS` ไม่ว่าค่าจะหน้าตาเป็นอะไร |
| `scripts/security/*.test.mjs` | เทสใหม่ 6 ตัว: ชื่อไฟล์ env ทุกแบบ (รวม `.supabase-management.env` ทุกความลึก, `.example` ยังผ่าน), SMTP/Supabase token ถูกจับโดยไม่พิมพ์ค่า, ไม่ false-positive กับโค้ดที่อ้างตัวแปร, `.dockerignore` มีครบและไม่มี `!` re-include, ไฟล์ management env ใน image ถูกจับด้วย path, ENV ของ image ถูกจับด้วยชื่อ |
| `docker-compose.yml` | `PUBLIC_BASE_URL`/`CLIENT_URL` เปลี่ยนจาก default localhost เป็น `${PUBLIC_BASE_URL:?...}` — compose หยุดพร้อมบอกว่าต้องตั้งอะไร แทนที่จะปล่อย container ล้มตอนบูต |
| `docs/deploy.md` | ระบุว่าต้องตั้ง `PUBLIC_BASE_URL` เป็น origin HTTPS สาธารณะก่อน `docker compose up` |

## ทดสอบจริง

- `node --test scripts/security/repository-safety.test.mjs scripts/security/container-image-safety.test.mjs` → 20/20 ผ่าน
- `node scripts/security/repository-safety.mjs --tracked-only` → เหลือ 1 finding ที่มีอยู่ก่อนแล้ว
  (`server/tests/health-routes.test.js:9` database-url-password จาก commit `8ef945a` ไม่ใช่ของงานนี้)
- `--history-only` → ผลก่อน/หลังแก้ **เหมือนกันทุกบรรทัด** (diff ว่าง, 37 รายการเดิมของงานล้างประวัติ) กฎใหม่ไม่เพิ่ม false positive
- `docker compose --env-file <scratch> config --quiet`: ไม่ตั้ง `PUBLIC_BASE_URL` → exit 1 พร้อมข้อความ;
  ตั้งเป็น `https://play.example.com` → exit 0 และ `CLIENT_URL` ได้ค่าเดียวกัน
- build context: image ทดสอบที่ `COPY server/ client/` ด้วย `.dockerignore` ใหม่ → ไม่มีไฟล์ env เลย;
  ด้วย `.dockerignore` ของ HEAD → เจอ `server/.supabase-management.env` (ยืนยันว่าบั๊กมีจริงและแก้แล้ว)
- production image เต็ม (`docker build` ด้วย build arg ฝั่ง browser แบบ placeholder, Docker 29.4.3):
  build ผ่าน · `find /app` ใน container ไม่เจอไฟล์ env เลย · รัน `inspectEnvironmentEntries` +
  `inspectApplicationDirectory` กับ `/app` ที่ export ออกมา (ไม่รวม `node_modules`) → เจอแค่
  `server/tests/health-routes.test.js:9` ตัวเดียวกับที่ repo scan เจอ ไม่มี `setup-only-environment`
  ลบ image ทดสอบแล้ว

## ผลกระทบ

- ไม่แตะ schema, Bot AI, หรือโค้ด runtime ของ server
- ใครที่เคยรัน `docker compose up` โดยไม่ตั้ง `PUBLIC_BASE_URL` จะเจอ error ตอน `compose` แทนที่จะเจอตอน boot
- image ที่เคย build จากเครื่องที่มี `server/.supabase-management.env` ก่อนแก้นี้ **มี token อยู่ข้างใน**
  ถ้าเคย push image แบบนั้นไปที่ไหน ให้ลบ image และหมุนเวียน (rotate) `SUPABASE_ACCESS_TOKEN` กับ SMTP password

## ยังไม่เสร็จ / ข้อสังเกต

- `node scripts/security/container-image-safety.mjs <image>` **ใช้บน Windows ไม่ได้** (มีมาก่อนงานนี้):
  `docker cp <ctr>:/app <dir>` ล้มเพราะสร้าง symlink ใน `node_modules/.bin` ไม่ได้ถ้าไม่มีสิทธิ์ admin
  (exit 2) ควรเปลี่ยนเป็น `docker cp <ctr>:/app -` แล้วแตก tar โดยข้าม `node_modules` ซึ่งตัวสแกนข้ามอยู่แล้ว
- `server/tests/` ถูก copy เข้า image ด้วย (`COPY server/ ./`) และทำให้ image scan ไม่ผ่านจาก
  `health-routes.test.js:9` — ควรแก้ fixture ให้เป็น placeholder ที่รู้จัก หรือกัน `server/tests` ออกจาก image

- `.security-work/` (สำเนา repo หลาย commit) อยู่ใน build context แต่ไม่อยู่ใน `.dockerignore`
  ไม่หลุดเข้า image เพราะ Dockerfile copy แค่ `client/ shared/ server/` แต่ทำให้ context ใหญ่ขึ้นเปล่าๆ
