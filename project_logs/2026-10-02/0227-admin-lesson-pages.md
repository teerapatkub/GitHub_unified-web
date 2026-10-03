# 2026-10-02 02:27 — แยกหน้าเพิ่มบทเรียน

## สิ่งที่แก้และเหตุผล
แยกหน้าเดิมที่รวมทุกฟอร์มเป็น `/admin/add-lesson/info`, `/slides`, `/pre-test`, `/post-test` พร้อม nav และปุ่มบันทึกของแต่ละหน้า หน้าเดิมจำลองบันทึกด้วย console.log จึงเพิ่ม API บันทึกจริงและ validation

ไฟล์: client/src/admin/pages/AddLesson.jsx, client/src/App.jsx, client/src/admin/components/AdminNavbar.jsx, server/lessonAdminRoutes.js, server/server.js, server/package.json, server/scripts/lesson-admin-test.js, server/scripts/theme-test-app.js

## ผลกระทบ
ใช้ตาราง modules/lessons/lesson_slides/lesson_quizzes/quiz_questions/question_choices เดิม เพิ่มต่อท้ายอย่างเดียวและใช้ transaction พร้อม lock บทเรียนเพื่อจัดลำดับอย่างปลอดภัย ตรวจ signed admin token และ role จาก DB ทุกคำขอ ไม่เปลี่ยน schema, rewards, bot หรือเนื้อหาเดิม ข้อมูลใหม่ปรากฏในหลักสูตรทันทีตาม reader เดิม
เก็บร่างแยกหน้า/บทเรียน/ผู้ใช้ใน sessionStorage ของแท็บ ไม่เก็บรหัสผ่านหรือ token ใน draft
แจ้ง handoff ใน docs/handoff-to-person-1.md แล้ว

## การตรวจ
- npm run test:lesson-admin: ผ่าน 30 checks รวม validation, authentication, append บทเรียนเดิม, transaction rollback, checksum public และแถวเดิมไม่เปลี่ยน ใช้ TEMP tables เท่านั้น
- npm run test:themes: ผ่าน 46 checks
- npm run build: ผ่าน มีคำเตือน bundle size และ eval เดิม
- npx eslint src/admin/pages/AddLesson.jsx: ผ่าน
- npm test ทั้ง client/server: ไม่มี script นี้
- npm run lint ทั้ง client: ยังมีข้อผิดพลาดเดิม 53 errors/9 warnings ในไฟล์อื่น
- Browser: สร้างบทเรียน เพิ่มสไลด์ Pre-test และ Post-test (เติมคำ/ปรนัย) ในระบบ TEMP; สลับหน้า+refresh ร่างไม่หาย; refresh แล้ว counts ที่บันทึกถูกต้อง; จอ 390x844 ไม่มี overflow และตรวจ 1280x900

## ข้อจำกัด
ไม่ได้เพิ่มหน้าจัดการ module หรือแก้ไข/ลบเนื้อหาเดิมตามขอบเขตที่ขอให้เพิ่มแยกแต่ละหน้า การเลือกไฟล์ใช้ upload endpoint เดิม; ทดสอบบันทึกสไลด์เนื้อหาและ media URL ใน API แต่ไม่ได้อัปโหลดไฟล์จริงในรอบนี้
