# Handoff → Person 2: คะแนน Competitive มาจาก rubric ส่วน LLM ในเครื่องให้แค่คำแนะนำ

**ผู้แก้:** Person 3 · **วันที่:** 2026-10-22
**อ้างอิง:** Spec 0004 ticket 03 (`.scratch/self-hosted-local-llm/issues/03-competitive-rubric-score-llm-advice.md`)
**ไฟล์:** `server/server.js`

## ทำไมต้องแก้

อาจารย์กำหนดให้ใช้ LLM ที่รันในเครื่อง (Ollama) และห้ามใช้ API key ของ AI ภายนอก จึงย้ายตัวตรวจ Competitive ออกจาก NVIDIA

โมเดลขนาดเล็กที่รันบน GPU 4 GB มีปัญหาสองข้อ:
- **ช้า:** ผู้เล่นต้องรอนาน
- **ให้คะแนนไม่คงที่:** คำตอบเดียวกันอาจได้คะแนนไม่เท่ากัน

ถ้าปล่อยให้โมเดลตัดสินคะแนนต่อ คะแนนและรางวัลของผู้เล่นจะขึ้นกับว่าโมเดลตอบอะไรในรอบนั้น จึงใช้หลักเดียวกับ Arcade (ADR 0007): **ตัวเลขทุกตัวมาจากการวัดในเครื่อง ส่วนโมเดลเขียนแค่คำแนะนำ**

## แก้อะไร

| ส่วน | เดิม | ตอนนี้ |
|---|---|---|
| ตัวเรียกโมเดล | `callCodeJudgeChat` → NVIDIA (`NVIDIA_CODE_JUDGE_API_KEY/MODEL`) | `judgeLlm` → Ollama ผ่าน `server/ai/llm.js` (`LLM_BASE_URL` + `LLM_JUDGE_MODEL`) ขอผลเป็น JSON และรอไม่เกิน 12 วินาที (`COMPETITIVE_ADVICE_TIMEOUT_MS`) |
| ฟังก์ชัน | `reviewCompetitiveSubmissionWithAI` | `adviseOnFailedCompetitiveSubmission` |
| prompt | ให้โมเดลให้คะแนน correctness / complexity / cleanCode + approved | ให้เขียน**แค่คำแนะนำภาษาไทย** 2–4 ประโยค โดยห้ามให้คะแนนและห้ามเฉลยทั้งข้อ |
| `parseCompetitiveAiReview` | เอาคะแนนจากโมเดลมารวม | เปลี่ยนเป็น `parseCompetitiveAdvice` ซึ่งอ่านแค่ `feedback` |
| score / breakdown | มาจากโมเดล (ถ้าตอบได้) | มาจาก `scoreCompetitiveSubmission` (rubric) **เสมอ** |
| `aiApproved` | โมเดลบอก approved + ผ่านเทสครบ + คะแนน ≥ 70 | `false` เสมอสำหรับคำตอบที่ผ่านเทสไม่ครบ ไม่ถามโมเดล (ค่าคงที่ `COMPETITIVE_AI_REWARD_THRESHOLD` ไม่มีใครใช้แล้วจึงลบออก) |
| `aiReviewed` / `aiVerdict` | โมเดลรีวิวแล้ว / ผลของโมเดล | **บอกแค่ว่าโมเดลเขียนคำแนะนำได้หรือไม่**: ได้ = `true` / `needs_fix` · ไม่ได้ = `false` / `fallback` + `aiUnavailable: true` |
| feedback | ของโมเดล หรือของ rubric + ข้อความ "AI review is temporarily unavailable" | ของโมเดล หรือของ rubric ถ้าโมเดลล้มเหลว (มี `aiUnavailable: true`) |
| อีเมลผลลัพธ์ | "AI ตรวจแล้วต้องแก้ไข" | "ยังไม่ผ่านเกณฑ์รับรางวัล (ต้องผ่าน test cases ครบ)" + "คำแนะนำ:" |

field ใน `breakdown` ที่หน้า `CompetitiveArena.jsx` ใช้ยังอยู่ครบ (`aiReviewed`, `aiApproved`, `aiVerdict`, `aiUnavailable`) **ไม่ต้องแก้หน้าเว็บ** บรรทัด AI review ยังแสดงถูกต้อง: โมเดลตอบ → "needs fixes before reward" · โมเดลล่ม → "temporarily unavailable, fallback rubric used" แต่ชื่อ field ขึ้นต้นด้วย `ai` ไม่ได้แปลว่า AI ตัดสินแล้ว ถ้าจะเปลี่ยนชื่อต้องแก้พร้อมหน้าเว็บ

**รางวัลและ creator bonus ตัดสินจาก `aiApproved` ตัวเดียว** (`calculateCompetitiveSolverReward`, `sendCompetitiveResultMail` และเงื่อนไข creator bonus ใน submit) ไม่ดู `aiReviewed` แล้ว

## พฤติกรรมที่เปลี่ยน ต้องรู้ก่อน merge

1. **คำตอบที่ผ่านเทสไม่ครบได้ 0 เหรียญเสมอ**
   - เดิมถ้า AI ล่ม คำตอบที่ผ่านบางข้อได้รางวัลตามสัดส่วนคะแนน เช่น ผ่าน 1/3 ได้ 130 จาก 200
   - แต่ถ้า AI ทำงาน คำตอบเดียวกันได้ 0 เพราะโมเดลไม่ approve
   - ตอนนี้ใช้กติกาเดียวทุกกรณี ตามที่ระบบเคยทำตอน AI ทำงานปกติ: ต้องผ่านเทสครบจึงได้รางวัล
   - กรณีนี้ไม่ได้ creator bonus เช่นกัน
2. **คำตอบที่ผ่านเทสครบไม่เปลี่ยน:** ยังใช้ `buildCompetitivePerfectTestScore` (คะแนนปรับตามเวลา) และไม่ถามโมเดล
3. **ส่งเลยเวลาไม่เปลี่ยน:** ได้ 0
4. คำแนะนำจากโมเดลยาวไม่เกิน 1200 ตัวอักษร ถ้าโมเดลตอบว่าง JSON เสีย หรือเกิน 12 วินาที ใช้ feedback ของ rubric แทน
   - ผู้เล่นยังต้องรอคำแนะนำไม่เกิน 12 วินาทีก่อนเห็นผล ซึ่งยังไม่ตรงกับ user story 10 ("ได้คะแนนทันที") ถ้าจะให้ได้ทันทีต้องส่งคะแนนก่อนแล้วเติมคำแนะนำภายหลัง ซึ่งต้องแก้หน้าเว็บด้วย
5. **คำตอบที่ผ่านครบไม่ได้คำแนะนำจากโมเดล** ได้แค่ข้อความแสดงความยินดีเหมือนเดิม
6. **คำตอบที่ผ่านครบยังอนุมัติทุกกรณี** แม้คะแนนที่ปรับตามเวลาจะต่ำกว่า 70 (`buildCompetitivePerfectTestScore` เป็นแบบนี้มาก่อน ไม่ได้แก้ในรอบนี้)
7. **`force-summary`** (เฉพาะโจทย์ทดสอบ `is_test = 1`) จ่ายตามอันดับคะแนน ไม่ได้แก้ในรอบนี้

## ทดสอบแล้ว

`server/tests/local-llm-competitive.test.js` (อยู่ใน `npm test`) บูต server จริงกับ Ollama ปลอม แล้วยิง endpoint ตามลำดับ: สร้างโจทย์ → accept → submit

| กรณี | ผลที่ยืนยันแล้ว |
|---|---|
| โมเดลให้คะแนนเต็มและ approve / ให้ 0 / ตอบ 500 / ช้าเกิน timeout / ตอบไม่ใช่ JSON | ตัวเลขทุกตัวเท่ากันทั้งห้ากรณี: score, passed, total, breakdown, rewardCoins, aiApproved |
| คำตอบผ่าน 1/3 | ได้ 0 เหรียญ และไม่ approve แม้โมเดลบอกให้ผ่าน |
| คำแนะนำ | มาจากโมเดลเมื่อโมเดลตอบ (`aiReviewed: true`) และมาจาก rubric เมื่อโมเดลล้ม ช้า หรือตอบผิดรูป (`aiReviewed: false`, `aiVerdict: fallback`, `aiUnavailable: true`) |
| โมเดลช้า | submit ตอบภายในเวลา timeout ไม่รอโมเดล |
| การเรียกโมเดล | ใช้ `LLM_JUDGE_MODEL` และขอผลเป็น JSON |
| คำตอบที่ผ่านครบ | ได้รางวัล และไม่ถามโมเดลเลย |

## ถ้าอยากปรับต่อ

- เกณฑ์ rubric อยู่ใน `scoreCompetitiveSubmission` ส่วนการจ่ายรางวัลอยู่ที่ `calculateCompetitiveSolverReward`
- ถ้าต้องการให้ผ่านบางข้อแล้วได้รางวัลบางส่วน ต้องแก้สองจุดพร้อมกัน:
  - ค่า `aiApproved` ใน `adviseOnFailedCompetitiveSubmission`
  - สูตรใน `calculateCompetitiveSolverReward` ซึ่งตอนนี้จ่ายตามสัดส่วนคะแนนให้ทุกคำตอบที่ approve
  - creator bonus ก็จะได้ตามไปด้วย
