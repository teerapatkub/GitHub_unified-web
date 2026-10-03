# 2026-10-03 — นำกิจกรรมล่าสุดออกจากแดชบอร์ดแอดมิน

แก้ client/src/admin/pages/Dashboard.jsx ตามภาพที่ผู้ใช้ระบุ: เอา section กิจกรรมล่าสุด พร้อม state, API fetch, activity metadata และ imports ที่ใช้เฉพาะส่วนนี้ออก ปรับคำอธิบายหน้าให้ตรงกับเนื้อหาที่เหลือ ไม่แก้ฐานข้อมูลหรือ backend endpoint

ตรวจ: npm run build ผ่าน; ESLint ไฟล์ที่แก้ 0 errors/1 warning เดิมเรื่อง onlineUsers; npm test ไม่มี script; browser ใช้ mock data ไม่เชื่อม DB ตรวจหัวข้อที่เหลือครบ กิจกรรมล่าสุดไม่มีหลังรีเฟรชและที่ viewport 390x844
