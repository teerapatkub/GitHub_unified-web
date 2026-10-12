# D04 — Production image configuration

**วันที่:** 2026-10-12 เวลา 18:23 (Asia/Bangkok)

## ผลลัพธ์

- production client build รับ Supabase URL และ publishable key ผ่าน Docker build arguments และปฏิเสธ key ฝั่ง server
- runtime ตรวจ database, Supabase URL/secret/publishable keys, public URL, CORS origins และ uploads path ก่อนเปิด application traffic
- ย้าย `SUPABASE_ACCESS_TOKEN` ออกจาก `server/.env` ไปยังไฟล์ management-only ที่ไม่เข้า Git และไม่เข้า container
- production image รันด้วย user `node` (UID/GID 1000) และเขียนได้เฉพาะ persistent uploads path
- compose มี init service ซ่อม ownership ของ uploads volume เดิมก่อนเริ่ม non-root app
- production ตรวจ `CLIENT_URL` ให้ตรง `PUBLIC_BASE_URL` และตรวจ environment ก่อน bind พอร์ต
- compose ผูก `/data/uploads` กับ named volume และระบุวิธีส่ง browser configuration ตอน build อย่างชัดเจน
- เพิ่ม shared Python error module ที่ Docker client build เคยขาด ทำให้ production bundle สร้างจาก clean context ได้จริง
- ปรับคู่มือ deploy ให้ใช้ `docker compose --env-file server/.env` และอธิบาย required/forbidden environment

## การตรวจสอบ

- `node --test tests/production-environment.test.js tests/migrations-startup.test.js` — ผ่าน 14/14
- `node scripts/security/repository-safety.test.mjs` — ผ่าน 9/9
- `npm run build` ใน `client` — ผ่าน
- `docker compose --env-file server/.env build app` — ผ่านด้วย production image จริง
- ตรวจ image config — `User=node`, ไม่มี local `.env` หรือ management token file ใน image
- รัน disposable container — UID/GID 1000 และ `/data/uploads` เขียนได้
- จำลอง volume รุ่นเดิมที่เป็น `root:root` — init service เปลี่ยนเจ้าของแล้ว user `node` เขียนไฟล์เดิมได้

## ข้อสังเกต

- Docker build รายงาน dependency audit เดิมจาก lockfiles: client 27 รายการ และ server 21 รายการ งานแก้ dependency เป็น release gate คนละ ticket
- Vite ยังมี warning เดิมเรื่อง `eval` ใน `MiNi_Game.jsx` และ bundle chunk ขนาดใหญ่
