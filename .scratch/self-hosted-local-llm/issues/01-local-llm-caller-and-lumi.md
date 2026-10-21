# 01: ตัวเรียก LLM ตัวเดียว + Lumi ตอบผ่าน Ollama

**What to build:** ผู้เรียนคุยกับ Lumi แล้วได้คำตอบภาษาไทยจาก LLM ที่รันในเครื่อง (Ollama) แทน NVIDIA

server คุยกับ LLM ผ่านโมดูลเดียวเท่านั้น โมดูลนี้ชี้ไปที่ `LLM_BASE_URL` (endpoint `/v1` แบบ OpenAI) และใช้ชื่อโมเดลแยกต่องาน ticket นี้ใช้ `LLM_CHAT_MODEL`

ถ้าไม่ได้ตั้งค่า หรือ LLM ล้มเหลว Lumi ต้องตอบข้อความสุภาพแทน และ server ต้องยังบูตได้

ticket นี้สร้าง seam เดียวที่ ticket อื่นใช้ต่อ คือ Ollama ปลอมสำหรับเทส:
- เป็น HTTP server ที่ตอบ `/v1/chat/completions`
- ตั้งได้ว่าจะตอบปกติ ช้า JSON เสีย หรือ 5xx
- บันทึก request ที่ได้รับไว้ตรวจ
- เทสบูต server ตัวจริงแบบเดียวกับ helper บูตของชุด Arcade แล้วชี้ `LLM_BASE_URL` มาที่ตัวปลอม

อ้างอิง: Spec 0004 (ส่วน "ตัวเรียก LLM ตัวเดียว" และ "Testing Decisions")

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] โมดูลตัวเรียก LLM:
  - คืนตัวเรียกที่มี shape เดียวกับ `callAiChat` เดิม
  - throw ทันทีเมื่อ `LLM_BASE_URL` หรือชื่อโมเดลว่าง
- [ ] `callAiChat` ใช้โมดูลนี้ และไม่มีที่อยู่ของ NVIDIA ถูกเขียนตายไว้ในส่วนนี้แล้ว
- [ ] ปิดโหมดคิดของ Qwen3 โดยใช้วิธีที่ Ollama รองรับ ส่วนพารามิเตอร์เฉพาะของ NVIDIA ต้องไม่ถูกส่งไปแล้ว
- [ ] มี Ollama ปลอมสำหรับเทส และ helper บูต server ที่ชี้ไปหาตัวปลอม
- [ ] เทส: endpoint แชทของ Lumi ได้ข้อความจากตัวปลอม และตัวปลอมเห็นชื่อโมเดลจาก `LLM_CHAT_MODEL`
- [ ] เทส: ตัวปลอมตอบ 5xx หรือช้าเกิน timeout แล้ว Lumi ตอบข้อความสุภาพ ไม่ใช่หน้า error
- [ ] เทส: ไม่ตั้ง `LLM_BASE_URL` แล้ว server ยังบูตได้ และตัวปลอมไม่ได้รับ request เลย
- [ ] `npm test` ของ server ผ่าน
