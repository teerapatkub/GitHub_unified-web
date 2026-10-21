# 02: สร้างโจทย์ฝึกด้วย LLM ในเครื่อง

**What to build:** เมื่อผู้เรียนขอโจทย์ฝึกหรือชาเลนจ์ที่ AI สร้าง ระบบจะสร้างโจทย์ด้วย LLM ในเครื่องผ่านตัวเรียกจาก ticket 01

- ขอผลเป็น JSON mode แล้ว server parse และ validate เองเหมือนเดิม
- โจทย์ที่ส่งถึงผู้เรียนต้องมี test case ที่รันได้จริง
- ถ้า JSON เสีย ไม่ผ่าน validate หรือ timeout ผู้เรียนได้โจทย์สำรองที่เตรียมไว้แทน ไม่ใช่ error

อ้างอิง: Spec 0004, user story 7–8

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] การสร้างโจทย์ฝึกเรียกผ่านโมดูลตัวเรียก LLM ด้วย `LLM_CHAT_MODEL` และขอ JSON mode
- [ ] เทสผ่าน Ollama ปลอม:
  - [ ] JSON ถูกต้อง → endpoint คืนโจทย์ที่สร้างจากคำตอบนั้น
  - [ ] JSON เสีย → ได้โจทย์สำรอง
  - [ ] JSON ผิดรูป เช่น ไม่มี test case → ได้โจทย์สำรอง
  - [ ] timeout → ได้โจทย์สำรอง
- [ ] ไม่ตั้ง `LLM_BASE_URL` แล้วได้โจทย์สำรอง
- [ ] `npm test` ของ server, `npm run test:grader` และ `npm run test:submit` ผ่าน
