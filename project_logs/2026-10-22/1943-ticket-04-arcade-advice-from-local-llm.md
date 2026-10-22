# Ticket 04: คำแนะนำหลังแมตช์ Arcade ด้วย LLM ในเครื่อง

**วันที่:** 2026-10-22 19:43 (Asia/Bangkok) — Person 3 (Arcade)
**อ้างอิง:**
- Spec 0004 (user story 14–16)
- `.scratch/self-hosted-local-llm/issues/04-arcade-advice-from-local-llm.md`
- ADR 0007 (เพิ่มหมายเหตุแล้ว)

## สิ่งที่ทำ

**`server/arcade/code-judge.js`**
- เปลี่ยน `geminiGenerator` (`@google/genai`) เป็น `llmGenerator` ที่เรียก `server/ai/llm.js`
- `arcadeCodeJudgeFromEnv` อ่านค่า `LLM_BASE_URL`, `LLM_ADVICE_MODEL`, `LLM_ADVICE_RPM` (ค่าเริ่มต้น 10 เท่าเดิม) และ `LLM_TIMEOUT_MS`
- **ถ้าโมเดลไม่ว่าง** (Ollama ตอบ 503 เมื่อคิวเต็ม หรือ 429) ระบบรอ 5 วินาทีแล้วถามใหม่หนึ่งครั้ง
  - ส่วนที่อ่าน `retryDelay` / `RESOURCE_EXHAUSTED` ซึ่งเป็นรูปแบบของ Gemini ถูกลบออก
- พฤติกรรมเดิมยังอยู่ครบ:
  - rate limit
  - ขอคำแนะนำได้ครั้งเดียวต่อแถว (เก็บใน `quality_feedback`)
  - กันคำขอซ้ำที่กำลังทำงานอยู่ (`room-api.js`)
  - ถ้าใช้โมเดลไม่ได้ ให้ใช้ผลวัดแทน และไม่บันทึกผลวัดนั้นไว้
  - ไม่ส่งโค้ดที่แฝงคำสั่งถึงตัวตรวจไปให้โมเดล

**`server/ai/llm.js`:** error ที่โยนออกมาแนบ `status` ไปด้วย ให้คนเรียกรู้ว่าเป็น 503 หรือ 429

**ไฟล์อื่น**
- `server/package.json`: ลบ `@google/genai` และ `@google/generative-ai` ออก
- `server.js`: แก้ log ตอนบูตให้บอกโมเดลในเครื่อง
- `room-api.js` และ `RoundHistoryPanel.jsx`: แก้คอมเมนต์

**เอกสาร**
- `CLAUDE.md`: แก้แถว Arcade ในตาราง AI
- `.env.example`: ลบ `GEMINI_*` ออก แล้วเพิ่ม `LLM_ADVICE_MODEL` และ `LLM_ADVICE_RPM`
- `docs/arcade-map.md`: แก้ให้ตรงกับการเปลี่ยนแปลง
- ADR 0007: เพิ่มหมายเหตุ

**เทส**
- `tests/local-llm-arcade-advice.test.js` (อยู่ใน `npm test`) บูต server จริงกับ Ollama ปลอม แล้วยิง `POST /api/arcade/history/:id/advice` ตรวจ 6 กรณี:
  - คำแนะนำมาจาก `LLM_ADVICE_MODEL` ผลวัดถูกส่งไปให้โมเดลด้วย และคำแนะนำถูกเก็บไว้
  - ขอซ้ำจะได้ค่าที่เก็บไว้ โดยไม่เรียกโมเดลอีก
  - ขอพร้อมกันสองครั้ง โมเดลถูกเรียกครั้งเดียว
  - โมเดลตอบ 503 ระบบถามใหม่แล้วเก็บคำแนะนำ
  - โมเดลตอบ 500 หรือช้าเกิน ได้ผลวัดแทนและไม่บันทึก
  - ไม่ตั้ง `LLM_BASE_URL` ได้ผลวัด และไม่มีคำขอไปถึงโมเดล
- แก้ unit test ใน `arcade-code-judge.test.js` ให้ตรวจกรณี 503 แทน 429 แบบของ Gemini
- เพิ่ม `startServerWithFakeOllama` ใน `tests/helpers/start-server.js` แล้วให้เทส advice และ Competitive ใช้ร่วมกัน
- เทสใหม่ fail กับโค้ดเดิมก่อนแก้ เพราะโค้ดเดิมยังเรียก Gemini ด้วย key จาก `.env`

## ผลตรวจ

| ชุด | ผล |
|---|---|
| server `npm test` | pretest 73/73, ชุดหลัก 208/208 |
| server `npm run lint` / client `npm run lint` | ผ่านทั้งสองฝั่ง |
| calibration | เฉลย 40/40 ได้ 95+ ทุกเกณฑ์ และคำตอบผิดในคลังบอท 78 แบบได้คุณภาพเฉลี่ย 98.7 |
| `npm run test:arcade` (บนฐานชั่วคราว) | `test:tasks`, `test:bot-progress`, `test:targeting`, `test:trialrun` ผ่าน · `test:score`, `test:draw`, `test:spectator`, `test:bots` ตก **เพราะสคริปต์ไม่ส่ง token** ทุก request ได้ 401 ตั้งแต่ย้ายไปใช้ Supabase Auth ปัญหาเดียวกับที่ `test:submit` เคยเป็น (แก้แล้วใน f068c70 แต่แก้เฉพาะสคริปต์นั้น) |
| `npm run sim:bots` | ตก (ดูหัวข้อถัดไป) โค้ดที่ commit ไว้ก่อนแก้ก็ตกแบบเดียวกัน |

**เล่นจริงบน dev server**
- ใช้ฐานชั่วคราวใน Docker เพราะฐานทดสอบมีปัญหา (ดูหัวข้อถัดไป)
- คัดลอกเฉพาะแถวผู้เล่น pong กับ auth identity มา และตั้งเลเวลเป็น 10
- เล่นห้อง 5 คน (บอท 4 ตัว) โหมดเร็ว ระดับง่าย ไม่มี Ollama รันอยู่
- รอบ 1 ส่ง `myList = [n * n for n in nums]`: ผ่าน 4/4 คุณภาพ 97
- เปิดรอบ 1 ใน "ย้อนดูโค้ดของคุณ" ขึ้นคำแนะนำ "จากผลตรวจโค้ด — บรรทัด 2: ชื่อ myList ควรเป็น snake_case" ซึ่งเป็นผลวัดที่ใช้แทนเมื่อไม่มีโมเดล
- ลบฐานชั่วคราวทิ้งหลังทดสอบ

## พบระหว่างตรวจ (มีอยู่ก่อนแล้ว ไม่ได้แก้)

- **ฐานทดสอบ (project เดิม `qfsrpupgxwsofdrzbwdw`) เก็บ test case ผิดรูป**
  - `problems.test_cases` ของโจทย์ทั้ง 193 ข้อเป็น object `{isinstance, code_checks, correctness}` แทน array ปกติ
  - ตัวตรวจจึงเห็น 0 เทส ผลคือ `sim:bots` ตก และหน้า Competitive ขึ้น 0/0
  - `updated_at` ล่าสุดคือ 2026-10-20 13:41 UTC
  - ฐาน production ปกติ (array ครบ)
  - ยังไม่ได้แก้ข้อมูล เพราะต้องรู้ก่อนว่าใครหรือโค้ดเวอร์ชันไหนเป็นคนเขียนลงไป
- **สคริปต์ Arcade ที่ต้องต่อ server ทั้ง 4 ตัวยังไม่ล็อกอิน** ต้องแก้แบบเดียวกับ f068c70

## ผลกระทบ

- คะแนน Arcade ไม่เปลี่ยน (ADR 0007)
- เวลาปิดรอบไม่เปลี่ยน
- schema ไม่เปลี่ยน
- บอทไม่ถูกแตะ

## ยังไม่ได้ทำหรือต้องตรวจเพิ่ม

- ยังไม่ได้ลองกับ Ollama ตัวจริง (ticket 07) การเล่นจริงรอบนี้เห็นแค่กรณีที่ใช้ผลวัดแทน
- เวลาที่คำขอรอในคิวของ Ollama ถูกนับรวมใน `LLM_TIMEOUT_MS` ถ้ามีคนขอพร้อมกันมาก คำขอหลังๆ อาจได้ผลวัดแทน
- หน้าเว็บจำคำแนะนำแบบผลวัดไว้ในหน่วยความจำ ต้อง reload หน้าจึงจะขอคำแนะนำจากโมเดลใหม่ได้
- `sim:bots` และสคริปต์ Arcade 4 ตัวต้องรอแก้ฐานทดสอบและการล็อกอินของสคริปต์ก่อน
