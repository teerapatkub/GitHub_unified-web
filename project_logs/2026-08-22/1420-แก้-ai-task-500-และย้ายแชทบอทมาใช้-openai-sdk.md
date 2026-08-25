# แก้ `/api/learning/ai-task` ที่ 500 เสมอ + ย้ายแชทบอทมาใช้ OpenAI SDK (คอนฟิกผ่าน .env)

**วันที่:** 2026-08-22 เวลา 14:20
**ผู้ทำ:** Person 3 (แก้ไฟล์ของ Person 1 ตามที่ผู้ใช้สั่งโดยตรง)

---

## 1. สรุปสิ่งที่แก้

| ไฟล์ | แก้อะไร |
|---|---|
| `server/server.js` | แก้บั๊ก `insertResult[0].task_id`, เขียน `callAiChat()` ใหม่ด้วย OpenAI SDK, ทำให้ error อ่านรู้เรื่อง, ลบ `require('axios')` ที่ไม่มีใครใช้แล้ว |
| `server/.env` | เพิ่ม `NVIDIA_API_KEY`, `NVIDIA_AI_MODEL`, `NVIDIA_AI_TIMEOUT_MS` (ไม่ commit — อยู่ใน .gitignore) |
| `server/.env.example` | เพิ่มสามคีย์เดียวกันแบบไม่มีค่าจริง |

---

## 2. บั๊กตัวจริงของ `/api/learning/ai-task`

รายงานว่า "AI ตอบ 410 แล้ว endpoint ล้มต่อด้วย `Cannot read properties of undefined (reading 'task_id')`"
— ทำซ้ำได้จริง และพบว่าเป็น **สองปัญหาที่ไม่เกี่ยวกัน** ที่บังเอิญพิมพ์ log ติดกัน

```
⚠️ AI learning task generation failed for exercise: Request failed with status code 410
❌ /api/learning/ai-task error: Cannot read properties of undefined (reading 'task_id')
```

**AI 410 ไม่ใช่สาเหตุของ crash** — `generateLearningTaskWithAI()` ดัก error ของตัวเองอยู่แล้ว
และคืนโจทย์สำรองให้ตามปกติ

สาเหตุจริงอยู่ที่ `createLearningTaskRecord()`:

```js
const [insertResult] = await executor.execute(`INSERT ... RETURNING task_id`, [...]);
const insertId = insertResult[0].task_id;   // ← พังตรงนี้
```

`server/db.js` คืน array ของแถวจริง **เฉพาะ SELECT เท่านั้น** (`db.js:410`) คำสั่งอื่นทุกคำสั่ง
ไม่ว่าจะมี `RETURNING` หรือไม่ จะถูกยุบเป็น object สรุปผล `{ command, rowCount, affectedRows, insertId }`
ดังนั้น `insertResult[0]` เป็น `undefined` เสมอ

**แปลว่า endpoint นี้ 500 ทุกครั้งที่ต้องสร้างโจทย์ใหม่ ไม่ว่า AI จะทำงานหรือไม่**
ถ้าไปแก้แค่เรื่อง AI อย่างเดียว บั๊กนี้จะยังอยู่ครบ

แก้เป็น `insertResult?.insertId || insertResult?.[0]?.task_id` (รูปแบบเดียวกับที่
`POST /api/arcade/rooms` ใช้อยู่แล้วที่ `server.js:3600`) พร้อม throw ข้อความที่บอกได้ว่าเกิดอะไร
ถ้าไม่ได้ id กลับมาจริงๆ

ตรวจแล้วว่าไม่มีจุดอื่นในไฟล์ที่พลาดแบบเดียวกัน (`grep RETURNING` เจอ 2 จุด อีกจุดเขียนถูกอยู่แล้ว)

---

## 3. เปลี่ยนโมเดลแชทบอท

ตามที่ผู้ใช้สั่ง: เปลี่ยนเฉพาะ **แชทบอท** (`callAiChat()` — ใช้โดย Lumi `/api/ai/chat`
และตัวสร้างโจทย์ AI) **ไม่แตะ `judgeCodeQuality()`** ที่ตรวจโค้ดใน Arcade
ทั้งสองมีคีย์และโมเดลของตัวเองแยกกัน และต้องแยกต่อไป

`callAiChat()` เดิมยิง `axios.post` ตรงๆ ไปที่ `z-ai/glm-5.2` — เขียนใหม่ให้ใช้ OpenAI SDK
ชี้ที่ `https://integrate.api.nvidia.com/v1` แบบเดียวกับ `judgeCodeQuality()` ที่มีอยู่แล้ว

สิ่งที่เปลี่ยนพร้อมกันเพราะเป็นต้นเหตุของปัญหาที่รายงานมา:

- **คีย์ย้ายเข้า `.env`** — ของเดิม hardcode คีย์จริงไว้ในโค้ดเป็น fallback
  (`process.env.NVIDIA_GLM_API_KEY || 'nvapi-JYuOpf...'`) ผิดกฎ Security ใน `CLAUDE.md` ตรงๆ
- **ชื่อโมเดลย้ายเข้า `.env`** — ของเดิมเป็น constant ในโค้ด นี่คือเหตุผลที่ 410 แก้ไม่ได้
  โดยไม่แก้โค้ด ตอนนี้เปลี่ยนโมเดล = แก้ `.env` บรรทัดเดียว
- **error บอกชื่อโมเดล** — ของเดิมพ่น `Request failed with status code 410` เฉยๆ
  ไม่มีทางรู้ว่าโมเดลไหนหาย ตอนนี้เป็น `AI model "xxx" failed (HTTP 410): ...`
- **`temperature` / `maxTokens` / `thinking` ถูกใช้จริงแล้ว** — ผู้เรียกส่งสามค่านี้มาตั้งแต่เดิม
  (เช่น Lumi ส่ง `temperature: 0.7`) แต่ body เก่า **ไม่รับเลย** ส่งค่าตายตัวของตัวเองแทน
- **`maxRetries: 0`** — SDK retry ตอน timeout ด้วย ถ้าโมเดลค้างแทนที่จะ error
  ผู้ใช้จะรอสองเท่าโดยไม่ได้อะไรเพิ่ม
- **ลบ `require('axios')`** — `callAiChat()` เป็นผู้ใช้ axios รายสุดท้ายในไฟล์

`callAiChat()` อ่านคำตอบจาก `message.content` เท่านั้น ไม่เอา `reasoning_content`
เพราะโมเดลสายคิดจะแยกความคิดตัวเองไว้อีก field — ถ้าเอามาปนจะทำให้ตัวสร้างโจทย์ parse JSON ไม่ผ่าน

---

## 4. ⚠️ ยังไม่ได้ตั้งโมเดล — รอผู้ใช้เลือก

โมเดล `deepseek-ai/deepseek-v4-flash-0731` ที่ให้มา **เรียกแล้วค้าง ไม่ตอบเลย**

ทดสอบแยกสาเหตุแล้ว:

| ทดสอบ | ผล |
|---|---|
| คีย์ใหม่ + `nvidia/nemotron-3.5-lightning-30b-a3b` | **OK 1,191 ms** |
| คีย์เดิม (code judge) + nemotron | **OK 704 ms** |
| คีย์ใหม่ + deepseek-v4-flash | **timeout** |
| คีย์เดิม + deepseek-v4-flash | **timeout** |
| deepseek + `stream: true`, `thinking: false` | ไม่มี token แรกใน 90 วิ |
| deepseek + `stream: true`, ไม่ส่ง kwargs | ไม่มี token แรกใน 90 วิ |
| deepseek + พารามิเตอร์ตามที่ผู้ใช้ให้ (`thinking: true`, `reasoning_effort: high`) | ไม่มี token แรกใน 90 วิ |

สรุป: **คีย์ใช้ได้ ตัวโมเดลไม่ตอบ** โมเดลมีอยู่ใน catalogue ของ NVIDIA จริง (เจอใน `models.list()`)
แต่ไม่เคยคืน token สักครั้ง ส่วน `z-ai/glm-5.2` ของเดิม **หายจาก catalogue แล้ว** — ตรงกับ 410 ที่เห็นใน log

เสนอให้ใช้ `nvidia/nemotron-3-super-120b-a12b` (ตอบไทย 1.3 วิ, JSON 1.8 วิ) ชั่วคราว
**ผู้ใช้ปฏิเสธ** เพราะไม่ต้องการให้โมเดลตระกูลที่ใช้ตรวจโค้ด Arcade มารับงานนี้ด้วย จะเปลืองโทเคน
และจะหาโมเดลใหม่มาเอง

**สถานะปัจจุบัน**: `.env` ตั้งไว้ที่ `deepseek-ai/deepseek-v4-flash-0731` ตามที่สั่ง
พร้อมคอมเมนต์บันทึกผลทดสอบไว้ในไฟล์ ระหว่างนี้:
- Lumi ตอบข้อความ error ที่เตรียมไว้ (พฤติกรรมเดิม ไม่ได้เปลี่ยน)
- หน้าแบบฝึกหัดใช้โจทย์สำรองที่ฝังไว้ในโค้ด **ทำงานได้ปกติ ไม่ error**
- แต่ละคำขอที่ต้องเรียก AI จะรอ 45 วินาทีก่อนตกไปใช้ fallback

พอได้โมเดลใหม่ → แก้ `NVIDIA_AI_MODEL` ใน `server/.env` บรรทัดเดียว ไม่ต้องแตะโค้ด

---

## 5. ผลกระทบต่อส่วนอื่น

- **Arcade code judge ไม่ถูกแตะเลย** — `nvidiaCodeJudgeClient` (`server.js:3088`) และโมเดล
  `nvidia/nemotron-3.5-lightning-30b-a3b` (`server.js:3099`) คงเดิมทุกตัวอักษร ยืนยันด้วย grep
- **ไม่กระทบ schema** ไม่มีการแก้ตาราง
- **ไม่กระทบ Bot AI / Room Management**
- ผู้เรียกอื่นของ `callAiChat()` (Lumi, ตัวสร้างโจทย์) จะได้ค่า `temperature`/`maxTokens`
  ตามที่ตัวเองส่งมาจริงๆ แล้ว ซึ่งต่างจากเดิม — คำตอบของ Lumi อาจสั้นลง/นิ่งขึ้นกว่าเดิม
  เพราะเดิมถูกบังคับเป็น `temperature: 1.0, max_tokens: 4096` ทุกครั้ง

---

## 6. ทดสอบอะไรไปบ้าง

**ทำซ้ำบั๊กก่อนแก้** — ยิง `GET /api/learning/ai-task?userId=26&mode=exercise` บนเซิร์ฟเวอร์จริง
ได้ `{"error":"Failed to prepare AI task"}` พร้อม log สองบรรทัดตามที่รายงานมาเป๊ะ

**หลังแก้ (โมเดลตายตามคอนฟิกจริง)**

| ทดสอบ | ผล |
|---|---|
| `GET /ai-task` สร้างโจทย์ใหม่ | **HTTP 200** ได้โจทย์ใช้งานได้ (เดิม 500) — ใช้เวลา 45 วิ = timeout เดียว ไม่ใช่สองรอบ |
| `GET /ai-task` ซ้ำ (มีโจทย์ active แล้ว) | 200 ใน 0.2 วิ อ่านจาก DB |
| `POST /ai-task/reroll` | 200 สุ่มโจทย์ใหม่ได้ `rerollsUsed: 1` |
| `POST /api/ai/chat` (Lumi) | 500 พร้อมข้อความไทยที่เตรียมไว้ (พฤติกรรมเดิม) log บอกชื่อโมเดลแล้ว |

**พิสูจน์ว่าเส้นทาง AI ใหม่ทำงานจริง ไม่ใช่แค่ตกไปใช้ fallback ตลอด** — สลับ `NVIDIA_AI_MODEL`
ไปที่โมเดลที่ตอบได้ชั่วคราวแล้วยิงซ้ำ:

- `GET /ai-task` → `source: "generated"` ใน **6.6 วินาที** ได้โจทย์ที่ AI แต่งเองจริง
  (`"Fix the Broken Calculator"`, 4 test case, starter code ที่จงใจผิด)
- `POST /api/ai/chat` → ได้คำตอบภาษาไทยกลับมา ตรวจไบต์จริงแล้วเป็น UTF-8 สะอาด ไม่ใช่ mojibake
  (ที่เห็นเป็น `????` ในเทอร์มินัลคือ codepage ของ console ไม่ใช่ข้อมูลเสีย)

จากนั้นคืนค่า `.env` กลับเป็นโมเดลที่ผู้ใช้สั่ง

**ชุดทดสอบอัตโนมัติ** — ผ่านหมด ไม่มีอะไรถอยหลัง

```
check:sql            244 statements · 0 rejected
check:undef          every called function is defined
test:tasks           40 tasks · 458 assertions · ALL PASS
test:draw            7/7
test:bots            PASS
score-bounds         7/7
test:achievements    8/8
test:shop            11/11
node --check         OK
```

**เก็บกวาด** — ลบแถวทดสอบใน `learning_ai_tasks` ของ user 26 ออกหมด (เหลือ 0) ปิดเซิร์ฟเวอร์ทดสอบแล้ว

---

## 7. ที่ยังค้าง

- **ยังไม่ได้ตั้งโมเดลแชทบอทที่ใช้งานได้** — รอผู้ใช้เลือก (ข้อ 4)
- คีย์ NVIDIA ที่ถูก hardcode ไว้ในโค้ดเดิม (`nvapi-JYuOpf...`) **อยู่ใน git history ของ branch นี้แล้ว**
  ถึงจะลบออกจากโค้ดปัจจุบันก็ควรถือว่ารั่วและ revoke ทิ้ง
  (เรื่องเดียวกับที่เคยแจ้งไว้ว่า `origin/main` commit ไฟล์ `.env` ของ Person 1 ลง git)
- SMTP ยังปฏิเสธ login (`535-5.7.8`) อีเมลยืนยันยังส่งไม่ได้
- หน้าเว็บยังไม่แจ้งเตือนตอนปลดล็อกความสำเร็จ (server ส่ง `new_achievements` กลับไปแล้ว)
- **ยังไม่มีอะไร commit ลง git เลยตลอดหลาย session ที่ผ่านมา**
