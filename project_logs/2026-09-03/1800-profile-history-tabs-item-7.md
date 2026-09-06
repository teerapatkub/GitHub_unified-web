# ข้อ 7 — แท็บประวัติ Arcade / Competitive ในโปรไฟล์

**วันที่/เวลา**: 2026-09-03 ~18:00 (ต่อจากข้อ 9 ที่ commit `41ac7e9`)

## สรุปสิ่งที่ทำ

- **`server/server.js`**: เพิ่ม `GET /api/competitive/players/:userId/history` — ประวัติ
  Competitive ต่อผู้ใช้ (โจทย์, คะแนน 0-100, ผ่านกี่เคส, เมื่อไร) **ดึงจาก `multiplayer_submissions`
  เดิม** (หนึ่งแถวต่อผู้ใช้ต่อโจทย์) join `multiplayer_challenges` เอา title/difficulty —
  ไม่ต้องสร้างตารางประวัติใหม่
- **`client/src/pages/ProfilePage.jsx`**: การ์ดประวัติเดิม (Arcade อย่างเดียว) เปลี่ยนเป็น
  **สองแท็บ** "ประวัติ Arcade" | "ประวัติ Competitive" · Arcade ใช้ข้อมูลเดิมจาก `/api/profile`,
  Competitive fetch จาก endpoint ใหม่ **แบบ lazy** (โหลดเมื่อกดแท็บครั้งแรกเท่านั้น)

## เหตุผล / การตัดสินใจ

- ไม่สร้างตารางประวัติ Competitive ใหม่ตามที่แผนเผื่อไว้ เพราะ `multiplayer_submissions`
  เก็บข้อมูลครบอยู่แล้ว (score, passed_cases, total_cases, submitted_at) — derive จากของเดิมเบากว่า
- `multiplayer_challenges` เป็น VIEW (ตามคลังโจทย์รวม) เขียนไม่ได้ — endpoint แค่อ่าน join

## ทดสอบแล้ว (จริง)

- `npm run test:avatar` — **33/33 ผ่าน** รวมข้อ 7:
  - endpoint ตอบเป็น array (ว่างสำหรับผู้เล่นใหม่)
  - ใส่ submission กับโจทย์จริง → history คืนชื่อโจทย์ (Password Generator) + คะแนน 88 + เทสต์ 4/5 ถูกต้อง
- **dev server จริง**: กดแท็บ "ประวัติ Competitive" → ตารางแสดง 2 แมตช์ (VAT Calculator 72 5/5,
  Password Generator 71 4/5) ถูกต้อง (ยืนยันผ่าน DOM; screenshot pane มี glitch ดำชั่วคราวไม่เกี่ยวโค้ด)
- lint ProfilePage สะอาด

## ผลกระทบ

- ไม่แตะ schema · endpoint ใหม่ additive · การ์ดประวัติเดิมของ Arcade ยังทำงานเหมือนเดิม (แค่ย้ายเข้าแท็บ)
- แตะพื้นที่ Competitive (Person 2) เฉพาะ endpoint อ่านอย่างเดียว — ดู handoff ถ้าจำเป็น
