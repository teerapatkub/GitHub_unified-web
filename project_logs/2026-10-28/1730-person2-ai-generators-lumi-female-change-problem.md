# รวมงาน AI ของ Person 2 (ย้ายไปใช้โมเดลในเครื่อง), Lumi เป็นผู้หญิง, "เปลี่ยนโจทย์"

**วันที่:** 2026-10-28 ราว 16:30–17:30 (Asia/Bangkok), Person 3
**ผู้ใช้สั่ง:**
1. ให้ Lumi เป็นผู้หญิง
2. เปลี่ยนคำว่า "รีโจทย์" เป็น "เปลี่ยนโจทย์" (Debug Lab / Challenge ในโหมดเรียน)
3. นำไฟล์ที่สมาชิกอัปเดตบน GitHub เข้าโปรเจคแล้ว deploy

## 1. งานของ Person 2 (commit `d07b4e7` บน remote `deploy`)

- **เนื้องาน:**
  - สร้างข้อสอบก่อน/หลังเรียนด้วย AI ในหน้าแอดมิน (`LessonQuizGenerator.jsx`, `lessonQuizAi.js`)
  - ปุ่ม "Generated โจทย์" Competitive (`CompetitiveGenerator.jsx`, `competitiveAi.js`)
- **commit `8fd587f`:** เป็นแค่ merge งาน Mini Game ที่ main มีอยู่แล้ว จึงนำมาแค่ `d07b4e7`
- **ปัญหา:** เดิมเรียก **Gemini ด้วย API key** และส่งโค้ดผู้เล่น Competitive ไปให้ Gemini ตรวจ
  - ขัดข้อกำหนดอาจารย์ (Spec 0004: ห้ามใช้ API key ของ AI ภายนอก)
  - ขัดหลัก "คะแนน Competitive มาจาก rubric ในเครื่อง"
- **ผู้ใช้เลือก:** รวมแล้วย้ายไปใช้โมเดลในเครื่อง
- **ที่แก้ตอนรวม:**
  - **`server/ai/localJson.js` (ใหม่):** ถามโมเดลในเครื่องให้ตอบ JSON
    - ใช้ `LLM_CHAT_MODEL` ตัวเดียวกับที่สร้างโจทย์ฝึก
    - timeout แยก `LLM_GENERATE_TIMEOUT_MS` (ค่าเริ่มต้น 240 วินาที) เพราะงานสร้างใช้เวลานานกว่าแชท
    - error แปลงเป็นสถานะที่ชัด: ไม่ได้ตั้งค่า → 503, โมเดลไม่ว่าง → 429, ช้าเกิน → 504, JSON เสีย → 422
  - **`competitiveAi.js`:**
    - เลิกใช้ `geminiJson` แล้วใช้ตัวถามในเครื่อง
    - **expected ของ test case คือสิ่งที่โค้ดเฉลยพิมพ์จริง** ไม่ใช้ค่าที่โมเดลเขียน (บทเรียนจาก benchmark)
    - ปฏิเสธเฉลยที่ error / ไม่พิมพ์ / พิมพ์ค่าเดียวทุก input
    - ลบ `reviewSubmission` (ตรวจด้วย Gemini) ออก
  - **`lessonQuizAi.js`:** `generatePair` ใช้ตัวถามในเครื่อง โดยยังใช้ `validatePair`, การสุ่มลำดับ และร่างที่เซ็นด้วย HMAC เหมือนเดิม
  - **`server.js`:**
    - ไม่รับทางตรวจ Competitive ผ่าน Gemini และไม่ข้าม rubric
    - **เก็บส่วนที่ดีของ Person 2 ไว้:**
      - สร้างโจทย์ daily/weekly ได้เฉพาะแอดมิน
      - `createdBy` มาจากผู้ที่ล็อกอิน
      - 503 เมื่อ Python runner ล่ม
      - 400 เมื่อโจทย์ไม่มีเทส
      - ไม่จ่ายรางวัลถ้าผ่านเทสไม่ครบ
  - **`.env.example`:** ลบ `GEMINI_*` และเพิ่ม `LLM_GENERATE_TIMEOUT_MS`
  - **`docs/competitive-ai.md`, `docs/lesson-quiz-ai.md`:** เขียนส่วนตั้งค่าใหม่สำหรับโมเดลในเครื่อง
  - **เทส:** แทนเทสของ Gemini ด้วยเทสของตัวถามในเครื่อง และเพิ่มเทสว่า expected มาจากการรันเฉลย
- **commit:** `f3dd45c` (author: teerapatkub)

## 2. Lumi เป็นผู้หญิง

- **`server.js`:** `LUMI_PERSONA_RULE` ต่อเข้ากับ system message ของทุกหน้าที่ใช้แชท (เหมือนกฎความยาว)
  - "เป็นผู้หญิง แทนตัวว่าลูมี่/เรา ลงท้ายค่ะ/คะ ห้ามครับ/ผม"
- **`arcade/code-judge.js`:** คำแนะนำหลังแมตช์บอกให้พูดแบบผู้หญิง
- **ข้อความทักทายของ Lumi:** เติม "ค่ะ/นะคะ" และแก้ "ครับ" ใน `AiTaskPage.jsx`, `ExercisePage.jsx`, `MiNi_Game.jsx` (ไฟล์ของ Person 1)
- **เทส:** `tests/local-llm-chat.test.js` ตรวจว่า system message มี "ผู้หญิง" และ "ค่ะ" (ล้มก่อนแก้ ผ่านหลังแก้)
- **ไม่ได้แก้:** บทพูดของ Lumi 1 ประโยคใน `seed-content.sql` ที่ลงท้าย "ครับ"
  - ไฟล์นี้เป็น input ของ core migration การแก้จะทำให้ checksum เปลี่ยน
  - ต้องแก้ผ่าน migration ใหม่ (แจ้ง Person 1 ใน handoff)

## 3. "รีโจทย์" → "เปลี่ยนโจทย์"

- **`CodingWorkspace.jsx`:** ปุ่ม `เปลี่ยนโจทย์ (n)` และ tooltip "เปลี่ยนเป็นโจทย์ใหม่"
- **`AiTaskPage.jsx`:** "เปลี่ยนโจทย์ได้อีก n ครั้ง"

## ทดสอบ

- server `npm test`: pretest 94/94 (เพิ่มเทส AI generator), ชุดหลัก 265/265
- lint: server 0 error, ไฟล์ใหม่ (`competitiveAi.js`, `lessonQuizAi.js`, `ai/localJson.js`) ผ่าน; client 0 error
- client `npm test` 99/99, `npm run build` ผ่าน

## ผลกระทบ

- **ไม่แตะ schema หรือ migration:** checksum ทุกตัวยังตรงกับ production
- **งานสร้างโจทย์/ข้อสอบใช้ Ollama ตัวเดียวกับ Lumi** (`OLLAMA_NUM_PARALLEL=1`)
  - การสร้างหนึ่งครั้งใช้เวลา 1–4 นาที ระหว่างนั้นแชทและคำแนะนำของคนอื่นต้องรอคิว
  - คำแนะนำ Competitive จะเลยกำหนด 12 วินาที แล้วใช้คำแนะนำของ rubric แทน
  - ผู้เล่นเลเวล 10 กดสร้างโจทย์ community ได้ (1 ครั้ง/60 วินาที/บัญชี, พร้อมกันไม่เกิน 2) ถ้ามีคนกดบ่อย ควรจำกัดเพิ่ม
- **ไฟล์นอกขอบเขต:** ไฟล์ของ Person 1 (`AiTaskPage`, `CodingWorkspace`, `ExercisePage`, `MiNi_Game`) และไฟล์ของ Person 2 (`competitiveAi.js`, `lessonQuizAi.js`) บันทึกใน handoff แล้ว

## ยังไม่ได้ทำ

- ทดสอบสร้างข้อสอบ/โจทย์จริงกับ Ollama ผ่านหน้าเว็บ (ตอนนี้ทดสอบกับโมเดลจำลองเท่านั้น)
- บทพูด Lumi ใน seed ที่ยังลงท้าย "ครับ"
