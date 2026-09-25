วันที่และเวลา: 2026-09-25 02:35

สรุปสิ่งที่แก้ไข:
- แก้ `server/server.js` ใน endpoint GET `/api/mini-game/modules/:moduleId/progress/:userId`
- เพิ่ม `p.is_completed` ใน SELECT เพื่อส่งสถานะผ่านจากประวัติ progress กลับไปยัง client

เหตุผลของการเปลี่ยนแปลง:
- แผนที่ฝั่ง client ตรวจ `is_completed` อยู่แล้ว แต่ API ไม่ได้ส่ง field นี้กลับมา ทำให้ทุกด่านถูกแสดงว่าไม่ผ่าน

ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ:
- เพิ่ม field ใน response เดิมเท่านั้น ไม่เปลี่ยน schema หรือการบันทึก progress
- ช่วยให้ client อื่นที่ใช้ endpoint นี้เห็นสถานะ completion ได้ชัดเจนขึ้น

การตรวจสอบ:
- `node --check ..\\server\\server.js` ผ่าน
- ยังไม่ได้ยิง endpoint จริง เนื่องจากยังไม่ได้รัน server/database ในรอบนี้
