วันที่และเวลา: 2026-09-25

สรุปสิ่งที่แก้ไข/เพิ่มเข้ามา:
- เพิ่ม tutorial data สำหรับ `debug-page`, `challenge-page` และ `mini-game-page` ใน `client/src/data/webTutorials.js`
- เพิ่ม launcher และ modal บทสอนใน `AiTaskPage.jsx` โดยเลือกบทสอนตาม mode ทำให้ใช้ได้ทั้ง Debug และ Challenge
- เพิ่ม marker `ai-task-editor`, `ai-task-tests`, `ai-task-submit` ใน `CodingWorkspace.jsx`
- เพิ่ม launcher และ modal ใน `MiNi_Game.jsx`
- เพิ่ม marker `mini-game-editor`, `mini-game-run`, `mini-game-submit` ใน `MiNi_Game.jsx`

เหตุผลของการเปลี่ยนแปลง:
- ให้หน้า Debug, Challenge และ MiNi Game มีปุ่มบทสอนมุมขวาล่างและแสดงเฉพาะเมื่อมีข้อมูล tutorial

ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ:
- Debug และ Challenge ใช้ component กลางเดียวกัน จึงไม่ต้องสร้างปุ่มซ้ำใน route
- ไม่มีการเพิ่มตารางหรือ API

สิ่งที่ยังไม่เสร็จหรือต้องทดสอบเพิ่มเติม:
- ควรเปิด browser ตรวจ `/debug`, `/challenge` และ `/mini-game/:lessonId`
- รูปภาพยังไม่ได้เพิ่มให้ tutorial ทั้งสามชุด
- ESLint พบ error เดิมใน `CodingWorkspace.jsx` และ `MiNi_Game.jsx` ที่ไม่เกี่ยวกับงานบทสอน

ผลการตรวจสอบ:
- `npm run build` ผ่าน
- JSX และ imports ของส่วนที่เพิ่ม compile ได้
