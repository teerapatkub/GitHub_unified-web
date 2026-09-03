# Handoff → Person 2: การแก้ `/api/auth/google` (ระบบรูปโปรไฟล์ ข้อ 5)

**ผู้แก้**: Person 3 · **วันที่**: 2026-09-03 · **ไฟล์**: `server/server.js` (`POST /api/auth/google`)

## แก้อะไร

ระบบรูปโปรไฟล์ (Plan2 ข้อ 5) กำหนดให้ Google เป็นหนึ่งใน 5 แหล่งของรูป จึงเพิ่มการเก็บ
`payload.picture` ที่ handler นี้ ซึ่งอยู่ในพื้นที่ auth ของ Person 2:

- destructure `picture` เพิ่มจาก payload ของ Google
- **ผู้ใช้ Google ใหม่**: เก็บ `google_picture_url` + ตั้ง `avatar_url`/`avatar_source='google'`
  เป็นรูปแรกของบัญชี (เพิ่มคอลัมน์ใน INSERT)
- **ผู้ใช้เดิม**: เก็บ `google_picture_url` ไว้ แต่ **ไม่ทับ** `avatar_url` ถ้าเขาเลือกรูปเองแล้ว
  (ทับเฉพาะเมื่อยังไม่มีรูปที่เลือก)
- response ของทั้งสองเส้นทางเพิ่ม field `avatar` ที่ resolve แล้ว

## สิ่งที่ Person 2 ควรรู้

- **ยังทดสอบ e2e ไม่ได้** เพราะ Google sign-in ถูกบล็อกภายนอก (ยังไม่มี `GOOGLE_CLIENT_ID`)
  โค้ดพร้อมทำงานเมื่อปลดบล็อกและตั้งค่าแล้ว
- ไม่ได้แตะ logic การยืนยัน token / การสร้างบัญชี เดิม — เพิ่มเฉพาะการเก็บรูปและ field `avatar`
- รูปที่แสดงตัดสินที่ `resolveAvatar()` ที่เดียว (ดู `docs/adr/0002`) ถ้าจะแก้เส้นทาง Google
  เพิ่มเติม ให้คงกติกา "avatar_url เป็นตัวเลือกเดียว" ไว้
- คอลัมน์ใหม่ `users.google_picture_url`, `users.uploaded_picture_url` เพิ่มผ่าน `server/db.js`
  (ADD COLUMN IF NOT EXISTS) แล้ว
