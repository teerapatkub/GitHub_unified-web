# แก้ 4 จุดจาก Code Review ก่อน D06

**วันที่:** 2026-10-13 (Asia/Bangkok)
**ขอบเขต:** Logout race, Arcade rematch roster, leaderboard API errors, protected routes

## ผลงาน

- Logout ยกเลิกผลคำขอ `auth/me` ที่เริ่มก่อนออกจากระบบทั้งบัญชีผู้เล่นและ admin และกันผล profile refresh ที่มาถึงหลัง logout ไม่ให้เติม cache กลับ
- Arcade lobby นับเฉพาะ bot และมนุษย์ที่เลือกอยู่ต่อเป็นที่นั่งหลังแมตช์จบ; ใช้เกณฑ์เดียวกันกับรายการห้อง การเข้าห้อง การอ่านสมาชิก การเพิ่ม bot และการเริ่มแมตช์; คนที่ยังไม่เลือกยังตอบภายหลังได้ แต่ถ้าห้องเต็มจะได้ 409; โอนหัวห้องให้มนุษย์ที่อยู่ต่อหรือผู้เข้าใหม่ที่ active
- Leaderboard ใช้ `API_BASE`, แยก loading, รายการว่าง, 401, server error และ network error; ป้องกันคำตอบเก่าของ tab ก่อนหน้าทับข้อมูลปัจจุบัน
- `/achievements` และ `/promotion-exam` ใช้ guard ที่รอ Auth พร้อม; การส่งไป login จำ path, query และ fragment เพื่อกลับหน้าที่ตั้งใจหลังเข้าสู่ระบบ

## ตรวจรับ

- Client unit tests: 17 ผ่าน รวม delayed `auth/me` หลัง logout สำหรับ user/admin, return path และ leaderboard 200/empty/401/500/network
- Client build ผ่าน; มี warning เดิมเรื่อง `eval` ใน `MiNi_Game.jsx`, Browserslist และ bundle size
- Arcade integration ที่เกี่ยวข้อง: 40 ผ่าน; membership ล่าสุด 10 ผ่าน รวมห้องสองที่นั่ง ผู้เล่นใหม่ คนเดิมขออยู่ต่อเมื่อเต็ม และหัวห้องออก
- เปิด `/promotion-exam` และ `/achievements` โดยตรงใน Chrome แล้วถูกส่งไป `/login` หลัง Auth พร้อม; refresh login และตรวจ viewport 390px แล้ว

## สถานะก่อน D06

- Server suite เต็มรอบสุดท้ายผ่าน 130/131; pretest 9/9 ผ่าน โดย regression test เก่าที่สมมติว่าผู้เล่นทุกคนอยู่ต่อโดยอัตโนมัติถูกปรับให้ทั้งสองคนเลือกอยู่ต่ออย่างชัดเจนแล้ว
- เคส AOE effect expiry ใน `arcade-attacks.test.js` ยังไม่ผ่านทั้งรอบเต็มและรอบเฉพาะ เพราะ `serverNow` ใน response อาจเก่ากว่าเวลาเริ่มเอฟเฟกต์จริงเมื่อฐานข้อมูลตอบช้า; เป็นปัญหานอก 4 จุดนี้และต้องติดตามก่อน D06
- Browser test การกลับหน้าที่ตั้งใจหลัง login จริงยังต้องใช้บัญชีทดสอบที่ล็อกอินได้; รอบนี้ยืนยันส่วน guard แบบไม่ล็อกอินและ pure return-path test
