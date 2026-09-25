วันที่และเวลา: 2026-09-25

สรุปสิ่งที่แก้ไข/เพิ่มเข้ามา:
- ลบ `client/public/WebTutorialModal/webTutorials.js`
- คงข้อมูลบทสอนไว้ที่ `client/src/data/webTutorials.js`
- คงรูปภาพไว้ที่ `client/public/WebTutorialModal/data_png/`

เหตุผลของการเปลี่ยนแปลง:
- ระบบ React import ข้อมูลบทสอนจาก `src/data` โดยตรงแล้ว ไฟล์ใน public เป็นข้อมูลซ้ำและอาจทำให้แก้ไขผิดไฟล์

ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ:
- ไม่มีผลกับปุ่มหรือ modal เพราะไม่มี source code อ้างอิงไฟล์ public แล้ว
- ไม่มีการเพิ่มตารางหรือ API

ผลการตรวจสอบ:
- `npm run build` ผ่าน
- ตรวจแล้วไฟล์ซ้ำไม่ถูกสร้างใน `dist`
