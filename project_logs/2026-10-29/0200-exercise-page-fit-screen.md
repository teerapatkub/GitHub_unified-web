# หน้าแบบฝึกหัด: ปุ่ม Run/ส่ง หายที่ซูม 100%

**วันที่:** 2026-10-29 (Asia/Bangkok), Person 3 (แก้ไฟล์ของ Person 1 ตามที่ผู้ใช้สั่ง)

- **อาการ:** หน้า `/exercise/:id` ต้องซูมเบราว์เซอร์ที่ 90% ถึงจะเห็นปุ่มคัดลอก/รีเซ็ต/Run/ส่งแบบฝึกหัด ส่วน Debug Lab และ Challenge แสดงปกติ
- **สาเหตุ:** editor ใน `ExercisePage.jsx` สูงตายตัว (`h-[190px]`…`xl:h-[280px]`) อยู่ในคอลัมน์ flex เดียวกับแถบปุ่มและ terminal (185px)
  - จอแล็ปท็อปที่สูงไม่พอทำให้ editor ล้นลงไปทับแถบปุ่ม
  - `CodingWorkspace.jsx` (Debug/Challenge) ให้ editor ยืดตามที่เหลือแทน จึงไม่เกิดปัญหานี้
- **แก้ (`client/src/pages/ExercisePage.jsx`):**
  - กล่อง editor เป็น `flex flex-col overflow-hidden`
  - แถบชื่อไฟล์เป็น `shrink-0`
  - editor ใช้ `flex-1 min-h-[160px]`
  - แถบปุ่มเป็น `shrink-0`
  - terminal สูง 150px (185px บนจอ xl)
- **ทดสอบ:**
  - eslint ผ่าน
  - build และ deploy แล้ว ตรวจว่า chunk `ExercisePage-*.js` ที่ server ส่งมีคลาสใหม่
  - **ยังไม่ได้ดูหน้าจริงด้วยตัวเอง:** หน้านี้ต้องล็อกอิน ให้ผู้ใช้ตรวจที่ซูม 100%
- **handoff:** ไฟล์ของ Person 1 ไม่เปลี่ยนการทำงาน เปลี่ยนแค่การจัดวาง
