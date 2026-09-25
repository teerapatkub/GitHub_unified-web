วันที่และเวลา: 2026-09-23 22:28

สรุปสิ่งที่แก้ไข/เพิ่มเข้ามา:
- เพิ่มปุ่มไอคอนบทสอนลอยมุมขวาล่างใน `client/src/pages/LessonPage.jsx`
- โหลด tutorial จาก public data ด้วย `loadWebTutorials()` และเลือก id `lesson-page`
- เพิ่ม `data-tour="lesson-content"` ให้พื้นที่เนื้อหาบทเรียน
- เพิ่ม `data-tour="lesson-exercise"` ให้ปุ่มไปทำแบบภาคปฏิบัติ
- เพิ่ม state สำหรับเปิด/ปิด `WebTutorialModal`
- แก้ alias Framer Motion และลบตัวแปร `preQuiz` ที่ไม่ได้ใช้งานเพื่อให้ lint ผ่าน

เหตุผลของการเปลี่ยนแปลง:
- หน้าอ่านบทเรียนไม่มีปุ่มบทสอน เพราะก่อนหน้านี้เชื่อมไว้เฉพาะ LearningPage

ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ:
- เฉพาะหน้า LessonPage ฝั่ง client
- ไม่มีการเพิ่มตารางหรือ API
- ปุ่มจะแสดงเมื่อ public data มี tutorial id `lesson-page`

สิ่งที่ยังไม่เสร็จหรือต้องทดสอบเพิ่มเติม:
- ควรเปิดหน้า `/lesson/:lessonId` ใน browser และตรวจปุ่มมุมขวาล่าง
- tutorial step `lesson-content` และ `lesson-exercise` ยังไม่มีรูปภาพกำหนดไว้ใน data

ผลการตรวจสอบ:
- `npx eslint src/pages/LessonPage.jsx src/components/WebTutorialModal.jsx src/data/webTutorials.js` ผ่าน
- `npm run build` ผ่านก่อนแก้ lint และควรรันซ้ำเมื่อรวมงานทั้งหมด
