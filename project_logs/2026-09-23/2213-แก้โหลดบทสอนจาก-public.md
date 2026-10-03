วันที่และเวลา: 2026-09-23 22:13

สรุปสิ่งที่แก้ไข/เพิ่มเข้ามา:
- เปลี่ยน `client/public/WebTutorialModal/webTutorials.js` จาก ES module เป็น classic script ที่เก็บข้อมูลใน `window.pysimWebTutorials`
- เพิ่ม script tag ใน `client/index.html` ให้โหลดข้อมูลบทสอนก่อน React
- ปรับ `client/src/data/webTutorials.js` ให้คืนข้อมูลจาก global window แทนการใช้ dynamic import

เหตุผลของการเปลี่ยนแปลง:
- Vite ไม่อนุญาตให้ import ไฟล์จาก public ผ่าน source code และแจ้ง `Failed to load url ... This file is in /public`

ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ:
- ข้อมูลบทสอนยังคงอยู่ใน public และยังรองรับการอ้างอิงรูปด้วย URL จาก public
- ไม่มีการเพิ่มตารางหรือ API

สิ่งที่ยังไม่เสร็จหรือต้องทดสอบเพิ่มเติม:
- ยังควรเปิด browser ตรวจว่าปุ่มบทสอนและรูปภาพจริงแสดงหลังเพิ่มไฟล์ใน `data_png`

ผลการตรวจสอบ:
- `npx eslint src/data/webTutorials.js src/pages/LearningPage.jsx src/components/WebTutorialModal.jsx` ผ่าน
- `npm run build` ผ่าน
- เหลือคำเตือนเดิมของโปรเจกต์เรื่อง `eval` และ bundle ขนาดใหญ่
