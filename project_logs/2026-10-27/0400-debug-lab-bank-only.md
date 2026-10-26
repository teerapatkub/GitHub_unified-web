# Debug Lab ใช้โจทย์จากคลังอย่างเดียว ไม่เรียกโมเดล

**วันที่:** 2026-10-27 ราว 03:30–04:00 (Asia/Bangkok), Person 3
**ที่มา:**
- วัดซ้ำหลังแก้ตัวสร้างโจทย์ (`0330-generator-expected-from-solution.md`) แล้ว Debug Lab จากโมเดลผ่านแค่ 1/15
- โมเดลเขียน "บั๊ก" ที่ไม่ได้ทำให้ผลลัพธ์เปลี่ยน
- ผู้ใช้สั่งให้ Debug Lab ใช้คลังอย่างเดียว

## แก้อะไร

### `server/server.js`

- **`generateLearningTaskWithAI()`:** ถ้าไม่ใช่ Hard Challenge คืนโจทย์สำรองในระบบทันที (`normalizeGeneratedLearningTask({}, mode, level)`) โดยไม่เรียกโมเดล
  - สองจุดที่เรียกฟังก์ชันนี้ (สร้างงานแรก และ reroll) ลองคลังก่อนอยู่แล้ว
  - Debug Lab จึงได้โจทย์จากคลัง หรือโจทย์สำรองเมื่อคลังไม่มีเหลือ
- **ลบโค้ดที่ไม่มีใครใช้แล้ว:**
  - prompt ของ debug-lab
  - ค่า `starterMustFail`
  - การตรวจ "โค้ดตั้งต้นผ่านอยู่แล้ว" ใน `verifyGeneratedLearningTask()` ซึ่งไม่รับ `config` แล้ว

### `server/tests/local-llm-practice-tasks.test.js`

- เทสเส้นทางโมเดลทั้งหมดเปลี่ยนไปใช้ Hard Challenge โจทย์สำรองที่คาดคือ `Calculate VAT`
- เทส "Debug Lab whose starter already passes" ถูกแทนด้วย "a Debug Lab never asks the model, even with the bank empty"
  - ตรวจว่าได้ `Fix the Tax Calculator` และ fake Ollama ไม่ได้รับคำขอเลย
  - ล้มก่อนแก้ ผ่านหลังแก้

### `server/scripts/llm-benchmark.js`

- วัดเฉพาะ Hard Challenge แล้ว ตัด prompt debug-lab ออก

### เอกสาร

- `docs/llm-benchmark/2026-10-27-report.md`: หัวข้อ 8 และข้อเสนอข้อ 1

## ทดสอบ

- `tests/local-llm-practice-tasks.test.js` 15/15
- server `npm test`: pretest 79/79, ชุดหลัก 259/259
- lint: 0 error
- **ไม่ได้ทดสอบผ่าน dev server:**
  - dev server ไม่ได้ตั้ง `LLM_BASE_URL` จึงไม่เคยเรียกโมเดลอยู่แล้ว ผลบนหน้าจอเหมือนเดิม
  - เทสบูต server จริงกับ fake Ollama และยืนยันว่าไม่มีคำขอไปถึงโมเดล

## ผลกระทบ

- **Debug Lab ไม่รอโมเดลอีก:** เมื่อคลังว่าง ได้โจทย์สำรองทันทีแทนการรอ 20–45 วินาที
- Hard Challenge ไม่เปลี่ยน
- ไม่แตะ schema, client, Arcade หรือบอท
- `AiTaskPage.jsx` (ไฟล์ของ Person 1) ไม่ต้องแก้ เพราะ endpoint และรูปแบบข้อมูลเหมือนเดิม

## ยังไม่ได้ทำ

- ลด `maxTokens` หรือแยก timeout ของงานสร้างโจทย์ Hard Challenge: 4/30 ครั้งเกิน 45 วินาที
