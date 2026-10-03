# 2026-10-02 04:35 — สรุปความคืบหน้าผู้เรียนรายบุคคล

## สิ่งที่ทำและเหตุผล
เพิ่มหน้าแอดมิน `/admin/student-progress` ตามคำขอให้ดูรายบุคคลว่าเรียนถึงไหนและผลเป็นอย่างไร พร้อมค้นหา/แบ่งหน้ารายชื่อ, ตัวชี้วัด, กราฟหมวด, คะแนนรายบท, กรองสถานะและข้อสอบที่ยังไม่ผ่าน

ไฟล์: client/src/admin/pages/StudentProgressPage.jsx, client/src/admin/components/AdminNavbar.jsx, client/src/App.jsx, server/studentProgressRoutes.js, server/server.js, server/package.json, server/scripts/theme-test-app.js, server/scripts/student-progress-test-app.js, server/scripts/student-progress-test.js

## ผลกระทบและหลักการข้อมูล
API read-only ตรวจ signed admin token และสถานะ admin ในฐานข้อมูล; จำกัดรายงานเฉพาะ user/student ที่ไม่ถูกลบ; ไม่คืน secret หรือคำตอบ/โค้ดที่ไม่เกี่ยวข้อง
ใช้ evaluateLesson เดิม, แยกบทที่ไม่มีเกณฑ์จบออกจากอัตราสำเร็จ, นับข้อที่ผ่านแบบไม่ซ้ำ, คำนวณพัฒนาการจากเปอร์เซ็นต์ pre/post บทเดียวกัน, แสดงไม่มีข้อมูลเป็นขีด
ไม่แก้ schema ไม่เขียนข้อมูลผู้เรียนจริง ไม่ปรับ scoring, rewards, bot หรือผลเรียน
ปรับ navbar ให้เข้าหน้าใหม่บนจอแคบได้ และซ่อน navbar ผู้เรียนเฉพาะหน้ารายงานเพื่อไม่ให้ซ้อนกัน

## ตรวจแล้ว
- npm run test:student-progress ผ่าน 30 checks โดยใช้ข้อมูลจำลองใน TEMP tables
- npm run test:lessons ผ่าน 19 checks
- npm run test:lesson-admin ผ่าน 30 checks
- npm run build ผ่าน (warnings bundle/eval เดิม)
- npx eslint src/admin/pages/StudentProgressPage.jsx src/admin/components/AdminNavbar.jsx ผ่าน
- npm test ทั้ง client/server ไม่มี script; npm run lint ทั้ง client ยังมี 52 errors/9 warnings เดิม
- Browser 1440x1000, 390x844: เลือกดูข้อมูล/ผู้เรียนยังไม่เริ่ม, ค้นหาอีเมล/ไม่พบ, filter post-test ไม่ผ่าน, refresh คงผู้เรียนจาก URL, mobile admin navigation, ไม่มี page overflow

## ข้อจำกัด
ระบบต้นทางเก็บผลสอบล่าสุดต่อบทเรียน จึงไม่มีประวัติการสอบทุกครั้งหรือจำนวนครั้งสอบ และยังไม่มีเวลาอ่านสไลด์ให้รายงาน ไม่สร้างค่าประมาณแทนข้อมูลที่ไม่ได้เก็บ
