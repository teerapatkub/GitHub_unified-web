# Ticket 03: Competitive ให้คะแนนจาก rubric และ LLM เขียนแค่คำแนะนำ

**วันที่:** 2026-10-22 19:10 (Asia/Bangkok) — Person 3 (แก้ไฟล์ของ Person 2 พร้อม handoff)
**อ้างอิง:**
- Spec 0004 (user story 9–13 และ 34)
- `.scratch/self-hosted-local-llm/issues/03-competitive-rubric-score-llm-advice.md`
- handoff: `docs/handoff-to-person-2-competitive-rubric.md` (มีหัวข้อชี้ไปจาก `docs/handoff-to-person-1.md`)

## สิ่งที่ทำ

**`server/server.js`**
- ตัวเรียกโมเดลของ Competitive เปลี่ยนจาก NVIDIA เป็น `judgeLlm` ผ่าน `server/ai/llm.js` (`LLM_BASE_URL` + `LLM_JUDGE_MODEL`)
  - ลบ `callCodeJudgeChat` (ส่งต่ออย่างเดียว) และลบ import `OpenAI` ที่ไม่มีใครใช้แล้ว
- `reviewCompetitiveSubmissionWithAI` เปลี่ยนเป็น `adviseOnFailedCompetitiveSubmission` ใช้กับคำตอบที่ผ่านเทสไม่ครบเท่านั้น
  - **คะแนน breakdown และการอนุมัติมาจาก rubric (`scoreCompetitiveSubmission`) เสมอ**
  - `aiApproved` เป็น `false` ตายตัว จึงได้ 0 เหรียญและไม่มี creator bonus
  - prompt ขอแค่คำแนะนำภาษาไทย 2–4 ประโยค ห้ามให้คะแนน ห้ามเฉลย และขอผลเป็น JSON
  - รอคำแนะนำไม่เกิน 12 วินาที (`COMPETITIVE_ADVICE_TIMEOUT_MS`) แล้วใช้ feedback ของ rubric แทน
  - `aiReviewed` บอกแค่ว่าโมเดลเขียนคำแนะนำได้หรือไม่ ถ้าไม่ได้: `aiReviewed: false`, `aiVerdict: 'fallback'`, `aiUnavailable: true`
- `parseCompetitiveAiReview` เปลี่ยนเป็น `parseCompetitiveAdvice` ซึ่งอ่านแค่ `feedback`
- ลบ `COMPETITIVE_AI_REWARD_THRESHOLD` เพราะไม่มีใครใช้แล้ว
- รางวัลและ creator bonus ตัดสินจาก `aiApproved` ตัวเดียว (`calculateCompetitiveSolverReward`, อีเมลผลลัพธ์, เงื่อนไข creator bonus)
- อีเมลผลลัพธ์: "AI ตรวจแล้วต้องแก้ไข" เปลี่ยนเป็น "ยังไม่ผ่านเกณฑ์รับรางวัล (ต้องผ่าน test cases ครบ)" + "คำแนะนำ:"

**`server/ai/llm.js`:** `call()` รับ `timeoutMs` ต่อครั้ง ใช้ได้แค่ลดเวลารอ ไม่เกิน `LLM_TIMEOUT_MS`

**เอกสาร**
- `CLAUDE.md`: แถว Competitive ในตาราง AI และหมายเหตุใต้ตาราง
- `server/.env.example`: เอา `NVIDIA_CODE_JUDGE_*` ออก ใส่ `LLM_JUDGE_MODEL` แทน

## เหตุผล

- โมเดลขนาดเล็กในเครื่องให้คะแนนโค้ดเดิมไม่เท่ากันในแต่ละรอบ
- รางวัลจึงต้องไม่ขึ้นกับโมเดล ใช้หลักเดียวกับ Arcade (ADR 0007)

## พฤติกรรมที่เปลี่ยน

- **คำตอบที่ผ่านเทสไม่ครบได้ 0 เหรียญเสมอ**
  - เดิมได้ 0 เฉพาะตอนที่ AI ทำงาน ถ้า AI ล่มจะได้ตามสัดส่วนคะแนน
  - ตอนนี้ใช้กติกาเดียวทุกกรณี
- คำตอบที่ผ่านเทสครบไม่เปลี่ยน: คะแนนปรับตามเวลา และไม่ถามโมเดล

## ผลตรวจ

**`tests/local-llm-competitive.test.js`** (เพิ่มใน `npm test`)
- บูต server จริงกับ Ollama ปลอม แล้วยิง create → accept → submit
- ตัวเลขทุกตัวเท่ากันในทั้ง 5 สถานการณ์ของโมเดล:
  - ให้คะแนนเต็มและ approve
  - ให้ 0
  - ตอบ HTTP 500
  - ช้าเกิน timeout
  - ตอบไม่ใช่ JSON
- ผ่าน 1/3: ได้ 0 เหรียญและไม่ approve
- คำแนะนำมาจากโมเดล หรือจาก rubric พร้อมป้ายที่ถูกต้อง
- โมเดลช้าแล้ว submit ยังตอบภายใน timeout
- เรียกโมเดลด้วย `LLM_JUDGE_MODEL` และขอผลเป็น JSON
- คำตอบที่ผ่านครบได้รางวัล และไม่ถามโมเดล
- เทสนี้ fail กับโค้ดเดิมก่อนแก้: ได้ 130 เหรียญ และคำแนะนำไม่ได้มาจากโมเดล

**ชุดอื่น**
- server `npm test`: pretest 73/73, ชุดหลัก 194/194
- `npm run lint`: ผ่าน

**dev server (ฐานทดสอบ, บัญชี pong LV.10, ยังไม่มี Ollama จึงใช้คำแนะนำของ rubric)**
- เปิด `/competitive-arena` ที่ 1440×900 แล้วรับ "โจทย์ทดสอบ 2: การบวกเลข"
- ส่งคำตอบผิด `print(a - b)`
- ผล:
  - หน้าแสดงผลปกติ และกระดานอันดับขึ้น "pong 94 คะแนน"
  - อีเมลขึ้น "ยังไม่ผ่านเกณฑ์รับรางวัล ... ได้รับ 0 เหรียญ คำแนะนำ: Rubric score ..."

**`/code-review` สองแกน แก้แล้ว:**
- ป้ายบนหน้าเว็บตอนโมเดลล่ม
- ให้รอโมเดลไม่เกินที่กำหนด
- โค้ดอนุมัติที่ไม่มีทางทำงาน และฟังก์ชันที่ส่งต่ออย่างเดียว
- ชื่อที่ทำให้เข้าใจผิด
- เพิ่มเทสกรณี timeout และกรณีตอบไม่ใช่ JSON
- `CLAUDE.md`, `.env.example` และคำแนะนำใน handoff ที่ผิด

## พบระหว่างตรวจ (มีอยู่ก่อนแล้ว ไม่ได้แก้)

- **โจทย์ทดสอบ #4 และ #5 บนฐานทดสอบไม่มี test case เลย** (อีเมลขึ้น "ผ่าน test cases 0/0")
  - คะแนนมาจาก rubric แบบเดาจากหน้าตาโค้ด คำตอบผิดอย่าง `a - b` จึงได้ 94/100 บนกระดานอันดับ
  - หลังการแก้รอบนี้ โจทย์ที่ไม่มี test case จะไม่จ่ายเหรียญอีกเลย
  - ต้องให้ Person 2 เพิ่ม test case ให้โจทย์ทดสอบ
- **หน้า Competitive ที่ความกว้าง 731 px ไม่แสดงช่องเขียนโค้ด** (กล่อง Monaco สูง 0) ต้องกว้าง 1440 จึงเห็น
- `force-summary` จ่ายตามอันดับคะแนน ไม่ดูผลเทส

## ยังไม่ได้ทำหรือต้องตรวจเพิ่ม

- **story 10 ยังไม่ครบ:** ผู้เล่นยังต้องรอคำแนะนำได้ถึง 12 วินาที ถ้าจะให้ได้คะแนนทันทีต้องเติมคำแนะนำภายหลัง ซึ่งต้องแก้หน้าเว็บด้วย
- คำตอบที่ผ่านครบยังไม่ได้คำแนะนำจากโมเดล
- ลองกับ Ollama จริงใน ticket 07
