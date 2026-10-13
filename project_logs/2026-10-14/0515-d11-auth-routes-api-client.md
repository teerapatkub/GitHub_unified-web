# D11 — Auth routes and API client

## งานที่ทำ

- รวมการตัดสินสิทธิ์ของ protected routes ไว้ที่ `accessForRoute` โดยรอ Auth initialization ก่อน redirect; ครอบคลุม learner, admin, game mode และ route alias ที่เคย redirect เอง
- เก็บปลายทางหลัง login ใน `returnTo` query ที่ตรวจว่าเป็น path ภายในเว็บ ทำให้ลิงก์เดิม รวม query/hash ยังอยู่หลัง refresh; หน้า `/achievements` รับผู้ใช้ที่ผ่าน guard แล้ว
- เพิ่ม `requestJson` สำหรับ API JSON ที่ใช้ `API_BASE` เดียวกัน ตรวจ HTTP ก่อนอ่านข้อมูล และแยก 401, server, network กับ response ผิดรูปแบบ
- ย้าย leaderboard, achievements, profile/history และ promotion exam มาใช้ `requestJson`; ประวัติ Competitive แสดง error กับปุ่มลองใหม่แทนข้อมูลว่างเมื่อ API ล้มเหลว
- Arcade ใช้ `API_BASE` กลางแทนค่าคงที่ว่าง เพื่อให้ API คนละ origin ทำงานได้

## ผลตรวจ

- `client`: `npm test` ผ่าน 26/26; `npm run build` ผ่าน
- ESLint เฉพาะไฟล์ D11: 0 errors, 1 warning เดิมที่ `App.jsx:299` เรื่อง dependency ของ effect
- Browser smoke test ด้วย Vite แบบ frontend-only: เปิด `/promotion-exam?stage=2#task`, `/achievements` และ `/leaderboard` โดยไม่ login แล้วกลับ `/login?returnTo=...` ถูกต้อง; refresh หน้า login แล้วยังคงปลายทาง; ตรวจ viewport 390 × 844
- ทดสอบ unit ของ API client สำหรับ 200 ที่ไม่มีแถว, 401, 500, network และ invalid JSON รวมถึง URL แบบ split-origin

## ข้อจำกัดและงานต่อ

- Browser smoke test รอบนี้ไม่มี backend หรือบัญชีทดสอบ จึงยังไม่ได้ยืนยันการ login จริงและการกลับไปยังหน้าปลายทางหลัง login ด้วย browser; ต้องตรวจใน release browser gate ด้วย environment สำหรับทดสอบที่ทิ้งได้
- Code review พบว่ายังมีหน้าอื่นที่ใช้ `fetch`/`axios` ตรงผ่าน Auth transport เดิม เช่น Competitive, Exercise และ Admin Dashboard การย้ายทุก call site ไป `requestJson` พร้อมปรับ error state ยังเป็นงานต่อ; D11 รอบนี้ครอบคลุมหน้าที่เดิมมีปัญหา empty/error และเส้นทางที่ตรวจรับ
- ไฟล์ Profile/Achievements เดิมใช้ย่อหน้า 4 ช่อง; ส่วนที่แก้ยังตามรูปแบบไฟล์เดิม แม้แนวทางรากของ repo ระบุ 2 ช่อง ควรจัด format ทั้งไฟล์พร้อมงาน cleanup แยกเพื่อลด diff ที่ไม่เกี่ยวข้อง
