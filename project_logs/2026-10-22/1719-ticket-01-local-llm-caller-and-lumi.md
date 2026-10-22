# Ticket 01: ตัวเรียก LLM ตัวเดียว + Lumi ตอบผ่าน Ollama

**วันที่:** 2026-10-22 17:19 (Asia/Bangkok) — Person 3 (สถาปัตยกรรมรวม)
**อ้างอิง:**
- Spec 0004
- `.scratch/self-hosted-local-llm/issues/01-local-llm-caller-and-lumi.md`

## สิ่งที่ทำ

**`server/ai/llm.js` (ใหม่):** จุดเดียวที่ server คุยกับ LLM
- ใช้แพ็กเกจ `openai` ชี้ไปที่ `LLM_BASE_URL` (endpoint `/v1` ของ Ollama) ไม่ใช้ API key ของผู้ให้บริการ
- `createLlmCaller({ baseURL, model, timeoutMs, job })` คืนตัวเรียกที่มี shape เดียวกับ `callAiChat` เดิม
  - รองรับ `json: true` ซึ่งจะส่ง `response_format: json_object` ไว้ใช้ใน ticket 02–03
- ถ้า `LLM_BASE_URL` หรือชื่อโมเดลว่าง ตัวเรียกจะ throw ทันที แล้วคนเรียกใช้ fallback ของตัวเอง
- **ปิดการคิดของ Qwen3:** ส่ง `reasoning_effort: 'none'` ทุกคำขอ
  - ถ้า server ตอบ 400 ว่าไม่รู้จักค่านี้ จะส่งใหม่โดยไม่มีค่านี้ และไม่ส่งอีกเลยหลังจากนั้น
  - ส่วน `<think>...</think>` ที่ยังติดมาจะถูกตัดออกเสมอ
- timeout มาจาก `LLM_TIMEOUT_MS` (ค่าเริ่มต้น 45 วินาที) และไม่ retry

**`server/server.js`:**
- `callAiChat` ใช้ `ai/llm.js` ด้วย `LLM_CHAT_MODEL` และเลิกใช้ `NVIDIA_*` กับ `chat_template_kwargs` ในส่วนนี้
- log ตอนบูตบอกชื่อโมเดลและที่อยู่ ถ้าไม่ได้ตั้งค่าจะเตือนเป็นภาษาไทย
- คอมเมนต์ของตัวตรวจ Competitive ที่อ้างถึง `NVIDIA_API_KEY` ของแชทบอท แก้ให้ตรงกับความจริงแล้ว
- ตัวตรวจ Competitive ยังใช้ NVIDIA อยู่ จะย้ายใน ticket 03

**ชุดเทส (seam เดียวของ Spec 0004: Ollama ปลอมที่ `LLM_BASE_URL`):**
- `tests/helpers/fake-ollama.js`: HTTP server ที่ตอบ `/v1/chat/completions`
  - ตั้งได้ว่าจะตอบปกติ, ส่ง HTTP error หรือตอบช้า และบันทึก request ทุกตัว
- `tests/helpers/start-server.js`: สร้างฐานชั่วคราวบน `TEST_DATABASE_URL` แล้วบูต `server.js` ตัวจริงเป็น process แยก ใช้ยิง endpoint จริงผ่าน HTTP
- `tests/helpers/server-boot.js`: ฝั่ง child ของ start-server
- `tests/helpers/probe-boot.js`: ส่วนที่ `arcade-boot.js` กับ `server-boot.js` ใช้ร่วมกัน
  - stub Supabase, รัน migration และ seed ผู้เล่น probe
  - `arcade-restart-readiness.test.js` ใช้ `createTestDatabase` แทนโค้ดสร้างฐานที่เคยซ้ำกัน
- `tests/local-llm-chat.test.js` (เพิ่มใน `npm test`) ยิง `POST /api/ai/chat` จริง 6 กรณี:

  | กรณี | ผลที่ต้องได้ |
  |---|---|
  | ตอบปกติ | ได้คำตอบจากโมเดลที่ตั้งไว้ ไม่ส่งพารามิเตอร์ของ NVIDIA และส่ง `reasoning_effort: none` |
  | server ไม่รู้จัก `reasoning_effort` | ส่งใหม่โดยไม่มีค่านี้ ครั้งเดียว |
  | โมเดลคิดออกมาให้เห็น | เห็นแค่คำตอบ |
  | โมเดลตอบ 500 | ข้อความสุภาพ |
  | โมเดลช้าเกิน timeout | ข้อความสุภาพ และเลิกรอภายในเวลาที่กำหนด |
  | ไม่ตั้ง `LLM_BASE_URL` | server ยังบูตได้ และไม่มี request ไปที่โมเดลเลย |

**เอกสาร:**
- `server/.env.example` เพิ่มชุด `LLM_*` (ส่วนตัวแปรของ NVIDIA, Gemini และ Anthropic จะลบใน ticket 05)
- แถวแชทบอทในตาราง AI ของ `CLAUDE.md` แก้ให้ชี้ไป `ai/llm.js` และ `LLM_*`

## เหตุผล

อาจารย์กำหนดให้ใช้ LLM ที่รันในเครื่อง ไม่ใช้ API key ของ AI ภายนอก ticket นี้ทำจุดตั้งต้นที่ ticket 02–04 ใช้ต่อ

## ผลตรวจ

ใช้ PostgreSQL ใน Docker (`postgres:18-alpine`, container `pyarena-test-db`, พอร์ต 55432) เป็น `TEST_DATABASE_URL`

| ชุด | ผล |
|---|---|
| server `npm test` | pretest 73/73, ชุดหลัก 176/176 |
| server `npm run lint` | ผ่าน |
| client `npm test` | 58/58 |
| client `npm run lint` | ไม่มี error |

- เทสใหม่ fail กับโค้ดเดิมก่อนแก้ (server ยังเรียก NVIDIA จาก `.env`)
- `/code-review` สองแกน (Standards / Spec) แก้ตามที่พบแล้ว:
  - ปิดการคิดจริง ไม่ใช่แค่ซ่อนผล
  - แก้คอมเมนต์ที่ไม่ตรงความจริง
  - รวมโค้ด boot ที่ซ้ำกัน
  - เปลี่ยนชื่อตัวแปรให้สื่อความหมาย
  - log เป็นภาษาไทยทั้งสองข้อความ
  - แก้ CLAUDE.md และ .env.example

## ผลกระทบ

- **dev server ของทุกคน:** Lumi และการสร้างโจทย์จะใช้คำตอบสำรอง จนกว่าจะตั้ง `LLM_BASE_URL` / `LLM_CHAT_MODEL` ใน `server/.env` และมี Ollama รันอยู่ คีย์ NVIDIA ใน `.env` ไม่ถูกใช้กับสองงานนี้แล้ว
- **การสร้างโจทย์ (ticket 02):** ยังเรียก `callAiChat` ผ่านโมเดลในเครื่องและใช้โจทย์สำรองได้เหมือนเดิม แต่ยังไม่ได้ใช้ JSON mode
- schema และบอทไม่ถูกแตะ

## ยังไม่ได้ทำหรือต้องตรวจเพิ่ม

- **ยังไม่ได้ลองกับ Ollama จริง (ticket 07):**
  - ต้องยืนยันว่า Ollama รับ `reasoning_effort: 'none'` หรือถ้าไม่รับ ต้องเข้าทาง fallback
  - ต้องยืนยันว่าโมเดล Typhoon ตอบโดยไม่คิดจริง
- `/api/ai/chat` ยังส่งข้อความสุภาพมาพร้อม HTTP 500 เหมือนเดิม client แต่ละหน้าจัดการต่างกัน ไม่ได้แก้ในรอบนี้
- ticket 02–06 ทำต่อได้แล้ว
