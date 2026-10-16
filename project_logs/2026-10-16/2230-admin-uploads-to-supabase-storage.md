# ไฟล์ที่ admin อัปโหลดเก็บใน Supabase Storage (Spec 0003 ticket 4)

**วันที่:** 2026-10-16 22:30 (Asia/Bangkok)

## เหตุผล

Render แบบฟรีไม่มีดิสก์ถาวร ไฟล์ที่ admin อัปโหลด (รูปบทเรียนใน `AddLesson.jsx` และรูปไอเทมใน `ThemePage.jsx`) จะหายทุกครั้งที่ restart หรือ deploy
แต่ฐานข้อมูลยังชี้ไปที่ไฟล์เหล่านั้น ผู้ใช้กำหนดว่าการอัปโหลดของ admin สำคัญ ต้องเพิ่มบทเรียนและไอเทมได้ต่อเนื่อง

## สิ่งที่แก้

- `server/assetStore.js` (ใหม่) โมดูลเก็บไฟล์ตัวเดียว คืน URL `/uploads/<ชื่อไฟล์>` แบบ relative เหมือนที่ฐานข้อมูลเก็บมาตลอด
  - Supabase Storage: สร้าง bucket แบบอ่านได้สาธารณะให้เองครั้งแรก เขียนได้เฉพาะ server ที่มี secret key และมี `publicUrl(name)`
  - ดิสก์ในเครื่อง: สำหรับเครื่อง dev ที่ไม่ตั้ง bucket
- `server/uploadRoutes.js` (ใหม่)
  - `POST /api/upload` รับไฟล์ไว้ในหน่วยความจำแล้วส่งต่อให้ store
    - รับเฉพาะภาพหรือวิดีโอ ขนาดไม่เกิน 25 MB ตามเดิม
    - Storage ล่มให้ตอบ 503 และไม่คืน URL ที่เปิดไม่ได้
  - `redirectUploadsToStore`: ถ้า `/uploads/<ชื่อไฟล์>` ไม่มีบนดิสก์ ให้ redirect 302 ไปยัง Storage และปฏิเสธชื่อไฟล์แปลกๆ
- `server/server.js` — เลือก store จาก `ASSET_STORAGE_BUCKET`, ใช้ router ใหม่แทน route เดิม และเอา multer ตัวเดิมที่ไม่มีใครใช้แล้วออก
  การตรวจสิทธิ์ admin ยังเป็น middleware เดิมใน `server/auth/index.js`
- `server/runtime/environment.js` — production ต้องมี `ASSET_STORAGE_BUCKET` และต้องเป็นชื่อ bucket ที่ถูกต้อง
- ค่า config ใน `docker-compose.yml` (ค่าเริ่มต้น `uploads`), `scripts/release/container-smoke.sh`, `server/.env.example` และ `docs/deploy.md`
- `server/.env` ในเครื่อง (ไม่อยู่ใน Git) เพิ่ม `ASSET_STORAGE_BUCKET=uploads`

client ไม่ต้องแก้ เพราะ URL ที่ได้ยังเป็น `/uploads/...` เหมือนเดิม
ส่วนรูปโปรไฟล์ที่ผู้เล่นอัปโหลดยังอยู่บนดิสก์ จะตัดออกใน ticket 5

## บัญชี admin สำหรับทดสอบ

- ผู้ใช้สมัครบัญชี AdminPong (user_id 145) เอง แล้วยกสิทธิ์เป็น `admin` เฉพาะแถวนั้น ตามคำขอของผู้ใช้
- บันทึกใน `docs/admin.md` โดยไม่มีรหัสผ่าน เพราะ repo เป็น public

## ผลตรวจ

- เทสใหม่ `server/tests/asset-uploads.test.js` 6/6 ทดสอบผ่าน HTTP จริงคู่กับ store ปลอม และ store ของ Supabase กับ client ปลอม
  ครอบคลุม: อัปโหลดแล้วได้ URL, ไฟล์ผิดชนิดหรือไม่มีไฟล์, Storage ล่ม, redirect และชื่อไฟล์แปลก, สร้าง bucket ครั้งเดียว, อัปโหลดล้ม
- `production-environment.test.js` เพิ่มกรณีขาดหรือตั้งชื่อ bucket ผิด
- server `npm test` (PostgreSQL ชั่วคราว): pretest 36/36, ชุดหลัก 150/150; lint 0 error, `check:undef` ผ่าน; security 20/20
- **Supabase Storage จริง:**
  - server สร้าง bucket `uploads` เองในการอัปโหลดครั้งแรก
  - อัปโหลด PNG แล้วเปิดตรงได้ 200 `image/png`
  - `/uploads/<ชื่อไฟล์>` บน backend :3001 ตอบ 302 และตามไปได้ 200
  - ลบไฟล์ทดสอบออกแล้ว

## ทดสอบผ่าน browser (ผู้ใช้ login เอง)

- บัญชี pong (ผู้เล่นทั่วไป) เรียก `POST /api/upload` ได้ 403 "ต้องใช้สิทธิ์ผู้ดูแล"
- บัญชี AdminPong (admin) อัปโหลด PNG ผ่าน transport ของหน้าเว็บ (ตัวเดียวกับที่ ThemePage/AddLesson ใช้)
  ได้ 200 พร้อม `/uploads/1792158304129-91192225.png` และรูปโหลดใน `<img>` ได้
- หน้า `/admin/theme` เปิดได้ แต่ browser pane เลือกไฟล์จากเครื่องผ่านช่องอัปโหลดไม่ได้ จึงยังไม่ได้กดช่องเลือกไฟล์ในหน้านี้จริง
- restart backend แล้ว ไฟล์ไม่ได้อยู่บนดิสก์ในเครื่อง แต่ `/uploads/...` ยังตอบ 302 → Storage → 200 `image/png`
- ลบไฟล์ทดสอบออกจาก bucket แล้ว (bucket ว่าง ถ้าเลี่ยง cache จะได้ 400)
  - CDN ของ Supabase ยังส่งไฟล์ที่ลบไปแล้วอยู่ชั่วครู่ ถ้าลบรูปที่ไม่เหมาะสม รูปอาจยังเปิดได้อีกสักพัก

## ยังต้องทำ

- ตอน deploy ให้ตั้ง `ASSET_STORAGE_BUCKET` บน Render
