วันที่และเวลา: 2026-09-23 22:11

สรุปสิ่งที่แก้ไข/เพิ่มเข้ามา:
- ใช้ `client/public/WebTutorialModal/webTutorials.js` เป็นแหล่งข้อมูลบทสอนแทนไฟล์ใน `src`
- เพิ่ม loader ใน `client/src/data/webTutorials.js` เพื่อโหลด public module ตอน runtime
- เพิ่มการแสดงรูปภาพใน `WebTutorialModal.jsx` เมื่อ step มีค่า `image`
- เพิ่มช่อง `image` และ `imageAlt` ในข้อมูลบทสอนตัวอย่าง

เหตุผลของการเปลี่ยนแปลง:
- รองรับการจัดเก็บไฟล์ข้อมูลบทสอนและรูปภาพไว้ในโฟลเดอร์ public ตามโครงสร้างใหม่ของผู้ใช้

ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ:
- LearningPage โหลดบทสอนแบบ async จึงจะแสดงปุ่มหลังโหลดข้อมูลสำเร็จและพบ id ที่ตรงกัน
- รูปภาพสามารถวางไว้ใน `client/public/WebTutorialModal/data_png/` และอ้างอิงด้วย URL `/WebTutorialModal/data_png/...`
- ไม่มีการเพิ่มตารางหรือ API

สิ่งที่ยังไม่เสร็จหรือต้องทดสอบเพิ่มเติม:
- ยังไม่มีไฟล์รูปจริงใน `data_png` จึงยังไม่ได้ตรวจการแสดงรูปด้วย asset จริง
- ต้องเติมค่า `image` ในแต่ละ step เมื่อนำรูปไปวางในโฟลเดอร์

ผลการตรวจสอบ:
- `npx eslint src/pages/LearningPage.jsx src/components/WebTutorialModal.jsx src/data/webTutorials.js` ผ่าน
- `npm run build` ผ่าน
