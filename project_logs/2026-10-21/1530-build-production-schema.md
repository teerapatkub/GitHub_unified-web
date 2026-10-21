# สร้างตารางและ seed ในฐาน production (project ใหม่)

**วันที่:** 2026-10-21 ราว 15:30 (Asia/Bangkok) — Person 3 (สถาปัตยกรรมรวม)
**อ้างอิง:** ADR 0008, `docs/deploy-render.md` ข้อ 1

## สิ่งที่ทำ

- ผู้ใช้ใส่ค่าของ project ใหม่ (`lnijkucfutyekbxquliq`) ลง `server/.env.production.local`
  - ไฟล์นี้ git ไม่ track และ `.dockerignore` ไม่นำเข้า image
  - ใส่ DATABASE_URL, SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY
- บูต `server.js` ตัวจริงหนึ่งครั้งจากเครื่องนี้ (port 3099) โดยให้ค่าในไฟล์นั้นทับ `server/.env`
  - migration และ seed ของ server สร้างทุกอย่างเอง จึงไม่ต้องเขียน SQL เองหรือผ่าน MCP
  - พอ `/api/health/ready` ตอบ ready ก็ปิด server ทันที
  - ใช้เวลา 183 วินาที ได้ `migrationVersion` 202610200002
- ผู้ใช้ขอให้ `.mcp.json` กลับไปชี้ project เดิม (ฐานทดสอบ) จึงคืนไฟล์เป็นค่าเดิมแล้ว

## ปัญหาระหว่างทาง

- รอบแรก login ไม่ผ่าน (password authentication failed) ผู้ใช้รีเซ็ตรหัสฐาน แต่ pooler ต้องใช้เวลาสักพักกว่าจะรับรหัสใหม่
  - ตอนนี้สคริปต์ลอง login ก่อนบูต ถ้าไม่ผ่านจะหยุดทันที ไม่ค้าง
- สคริปต์รุ่นแรกเรียก `server.js` ด้วย `require` แต่ server จะบูตเฉพาะเมื่อถูกรันโดยตรง (`require.main === module`) เลยไม่สร้างอะไรเลย
  - แก้เป็น spawn `node server.js` เป็น process แยก

## เทียบกับฐานทดสอบ

| | ฐานทดสอบ | production |
|---|---|---|
| ตาราง (ไม่นับ `*_pre_merge`) | 69 | 68 |
| problems / ตรวจอัตโนมัติไม่ได้ | 193 / 26 | 193 / 26 |
| problem_modes | 181 | 193 |
| บทเรียน / สไลด์ | 24 / 220 | 24 / 220 |
| โจทย์ Arcade | 40 | 40 |
| ของในร้านที่เปิดขาย | 19 | 18 |
| ความสำเร็จ | 20 | 20 |
| ผู้ใช้ | 7 | 0 |

### ส่วนที่ต่างกัน

- **`mini_game_dialogue_choices` ไม่มีใน production:** โค้ดที่ใช้งานอยู่ไม่ได้ใช้ตารางนี้ มีแค่สคริปต์ใน `server/scripts/archive/` จึงไม่เป็นปัญหา
- **ของในร้านไม่ตรงกัน:** ชิ้นที่ฐานทดสอบมีแต่ production ไม่มีคือ item 59 "he" ซึ่งเป็นของทดสอบ
- **โจทย์มินิเกม production มี 19 ข้อ ฐานทดสอบมี 7 ข้อ:**
  - seed ลงทะเบียนโจทย์ 128–139 ("Mini 1: อธิบายโค้ดด้วยคอมเมนต์" ฯลฯ) ไว้ในโหมด minigame
  - ในฐานทดสอบ 12 ข้อนี้ไม่ได้ลงทะเบียนโหมดใดเลย
  - ยังไม่รู้ว่ามีคนลบออกโดยตั้งใจหรือไม่ เป็นส่วนของ Person 1 จึงต้องถามก่อน
- **ตรวจความสามารถในการตรวจโจทย์จบด้วยรหัส 1:** ไม่มีผลกับข้อมูลในฐาน เพราะค่า `is_auto_gradable` มาจาก seed และได้ 26 ข้อเท่าฐานทดสอบ

## ข้อสังเกต

- pooler ของ project ใหม่อยู่ที่ `ap-northeast-2` (Seoul) ไม่ใช่ Singapore ตามแผน
  - Render ไม่มี region Seoul ทุก query จะช้าเพิ่มราว 70–80 ms
  - ต้องวัดเวลาปิดรอบ Arcade ตอน smoke test

## ยังไม่ได้ทำ

- ถาม Person 1 เรื่องโจทย์มินิเกม 12 ข้อ
- ลบ `server/.env.production.local` หลังใส่ค่าบน Render เสร็จ
- ทำ `docs/deploy-render.md` ข้อ 2–6
