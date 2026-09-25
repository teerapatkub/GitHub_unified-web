วันที่และเวลา: 2026-09-25

สรุปสิ่งที่แก้ไข/เพิ่มเข้ามา:
- สร้าง `client/src/data/webTutorials.js` กลับมา
- เพิ่ม `webTutorials` และ `getWebTutorial` เพื่อให้ LearningPage, LessonPage และ ExercisePage import ได้
- คง path รูปภาพไว้ที่ `/WebTutorialModal/data_png/learning-progress.png`

เหตุผลของการเปลี่ยนแปลง:
- ไฟล์ใน `src/data` ถูกลบ ทำให้ Vite resolve import `../data/webTutorials` ไม่ได้

ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ:
- หน้าบทเรียนและแบบฝึกหัดกลับมาโหลด tutorial ได้จาก ES module โดยตรง
- ไม่มีการเพิ่มตารางหรือ API

สิ่งที่ยังไม่เสร็จหรือต้องทดสอบเพิ่มเติม:
- ESLint ของ `ExercisePage.jsx` ยังมี error เดิม 5 จุดที่ไม่เกี่ยวกับงานนี้

ผลการตรวจสอบ:
- `npm run build` ผ่าน
- import ของ tutorial module ถูก resolve สำเร็จ
