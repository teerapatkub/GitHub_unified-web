# Spec 0004 — Deploy ด้วย Docker บนเครื่องที่ดูแลเอง และใช้ LLM ในเครื่อง

สถานะ: `ready-for-agent`

ศัพท์ในเอกสารนี้ใช้ตาม `CONTEXT.md` (โจทย์, โหมด, คำตัดสิน, บัญชีผู้เล่น, วิธีเข้าสู่ระบบ)

ความสัมพันธ์กับ ADR:
- แทน ADR 0008 ในส่วนที่ใช้ Render, cron ping และ Gemini
- เคารพ ADR 0001: server เป็นผู้ตัดสินคำตัดสิน
- เคารพ ADR 0007: คะแนนคุณภาพโค้ดของ Arcade วัดในเครื่อง ไม่ใช่จากโมเดล
- จะบันทึกการตัดสินใจครั้งนี้เป็น ADR 0009

---

## Problem Statement

อาจารย์ที่ปรึกษาเปลี่ยนข้อกำหนดของโครงงานเมื่อ 21 ต.ค. 2026 สามวันก่อนส่งงาน (25 ต.ค.) เป็นสองข้อ:
- ระบบต้อง deploy ด้วย Docker บนเครื่องที่ทีมดูแลเอง ไม่ใช่โฮสต์ภายนอกอย่าง Render
- งาน AI ทุกงานต้องใช้ LLM ที่รันในเครื่อง ไม่ดึง API key ของผู้ให้บริการ AI

แผนที่เตรียมไว้ (Render + Gemini + NVIDIA) จึงใช้ไม่ได้ และระบบตอนนี้ยังมีข้อจำกัดหลายข้อ:
- งาน AI ทุกจุดผูกกับผู้ให้บริการภายนอก
  - ที่อยู่ของ NVIDIA ถูกเขียนตายไว้ในโค้ดหลายที่
  - คำแนะนำหลังแมตช์ Arcade ผูกกับ SDK ของ Gemini
- คะแนนของ Competitive Arena มาจากโมเดล
  - โมเดลเล็กในเครื่องตอบช้าและให้คะแนนไม่คงที่
  - คำตอบเดียวกันจึงอาจได้คะแนนไม่เท่ากัน และผู้เล่นต้องรอนาน
- เครื่องในหอหรือบน KKU-WiFi ไม่มีที่อยู่สาธารณะ คนนอกจึงเข้าไม่ได้
  - Supabase Auth บังคับให้เว็บเป็น HTTPS ที่มีโดเมนคงที่
- `docker-compose.yml` ที่มีอยู่ยังรอ Postgres ในเครื่องและไม่มี LLM
- ทุกคนต้องเข้าใช้ได้ในช่วงที่กรรมการตรวจและวันสอบ

## Solution

รันทั้งระบบด้วยคำสั่ง `docker compose` เดียวบนโน๊ตบุ๊กของทีม (RTX 3050 Ti 4 GB, RAM 16 GB) ประกอบด้วย:
- **app:** server และหน้าเว็บเดิม
- **Ollama:** LLM ในเครื่อง ใช้โมเดลภาษาไทย Typhoon 2.5 (Qwen3 4B) ตัวเดียว
- **ทางเข้าสาธารณะ:** Tailscale Funnel ซึ่งให้ URL HTTPS คงที่ โดยไม่ต้องเปิดพอร์ต

ส่วนที่ยังอยู่ที่เดิม:
- ฐานข้อมูล, ระบบล็อกอิน และที่เก็บไฟล์ยังอยู่บน Supabase project ใหม่ ซึ่งสร้างตารางไว้แล้ว
- อีเมลยืนยันยังส่งผ่าน Gmail SMTP และยังล็อกอินด้วย Google ได้

งาน AI ทั้ง 4 งาน + สคริปต์แปลโจทย์ เรียก LLM ผ่านตัวเรียกเดียวกัน:
- ทุกงานใช้ endpoint ที่เข้ากับ OpenAI ของ Ollama
- แต่ละงานมีชื่อโมเดลของตัวเองใน env
- ถ้าปล่อยค่าว่าง งานนั้นปิด แล้วใช้ผลในเครื่องที่มีอยู่แล้วแทน

Competitive Arena เปลี่ยนให้คะแนนมาจาก rubric ในเครื่องเสมอ เหมือน Arcade ใน ADR 0007 ส่วน LLM เขียนแค่คำแนะนำภาษาไทย

ระหว่างนี้อาจารย์ยื่นขอ "บริการขอเปิดการใช้งานเว็บไซต์แบบสาธารณะ" กับสำนักเทคโนโลยีดิจิทัล มข. ถ้าได้ ให้เปลี่ยนทางเข้าและ URL ด้วยการแก้ env อย่างเดียว ถ้าต้องย้ายไปเครื่อง VM ของ มข. ที่ไม่มี GPU ก็ทำได้ด้วยการแก้ env เช่นกัน

## User Stories

### ผู้เล่นและผู้เรียน

1. As a ผู้เรียน, I want to open the site from any network through one fixed HTTPS link, so that I can use it from home or on mobile data, not only on campus
2. As a ผู้เรียน, I want to sign up with email and get a real verification email, so that my บัญชีผู้เล่น is confirmed as before
3. As a ผู้เรียน, I want to sign in with Google as before, so that I don't have to remember another password
4. As a ผู้เรียน, I want Lumi to answer my Python questions in Thai, so that I understand without switching languages
5. As a ผู้เรียน, I want Lumi's answers to stay in Thai the whole way through, not slip into English or Chinese halfway, so that the explanation is readable to the end
6. As a ผู้เรียน, I want Lumi to show a polite message when the LLM is busy or not running, instead of an error page, so that I can keep studying other parts
7. As a ผู้เรียน, I want the practice โจทย์ that AI generates to always have test cases that actually run, so that I'm not judged wrong on a broken โจทย์
8. As a ผู้เรียน, I want to get a prepared fallback โจทย์ when the LLM fails to produce one, so that I can always keep practising
9. As a ผู้เล่น Competitive, I want my score to come from a fixed rubric, so that the same answer always gets the same score
10. As a ผู้เล่น Competitive, I want my score immediately after submitting, without waiting for the LLM, so that the match isn't slow
11. As a ผู้เล่น Competitive, I want short advice in Thai about my code, so that I know how to improve it
12. As a ผู้เล่น Competitive, I want rubric advice when the LLM is unavailable, so that I always get some feedback
13. As a ผู้เล่น Competitive, I want the reward decision to depend only on the test results and the rubric, so that no model can deny me a reward I earned
14. As a ผู้เล่น Arcade, I want post-match advice from the local LLM, so that I learn from my code in each round
15. As a ผู้เล่น Arcade, I want my round score and the round's settlement time to be unchanged, so that the in-room experience is the same as before
16. As a ผู้เล่น Arcade, I want the measured findings when the advice can't be generated, so that the round history is never empty
17. As a ผู้เล่น, I want my code not to leave the machine for any AI provider, so that my work stays private

### ทีมพัฒนาและผู้ดูแลระบบ

18. As a ผู้ดูแลระบบ, I want to start the whole system with one `docker compose` command, so that preparing on exam day isn't complicated
19. As a ผู้ดูแลระบบ, I want the LLM model to download automatically on first start, so that I don't have to remember an extra command
20. As a ผู้ดูแลระบบ, I want the app to wait until the LLM is ready before accepting requests, so that the first users don't hit errors
21. As a ผู้ดูแลระบบ, I want the model kept in memory the whole time, so that the first question after a quiet spell doesn't take extra seconds to load
22. As a ผู้ดูแลระบบ, I want to run the system on a machine with or without a GPU by choosing the compose file, so that I can move to a KKU VM without editing code
23. As a ผู้ดูแลระบบ, I want to change the model of each AI job through env, so that I can switch to the backup model (Typhoon 2.1) if Thai or JSON quality isn't good enough
24. As a ผู้ดูแลระบบ, I want to switch off any single AI job by leaving its value empty, so that I can cut load during the exam without touching code
25. As a ผู้ดูแลระบบ, I want the public URL to be the same every time the machine restarts, so that I don't have to keep updating Supabase, Google and the links I've handed out
26. As a ผู้ดูแลระบบ, I want to switch from Tailscale to a kku.ac.th domain by editing env and rerunning the Auth setup script, so that moving to the university route is quick
27. As a ผู้ดูแลระบบ, I want the app port not open outside the machine except through the tunnel, so that there is only one route in
28. As a ผู้ดูแลระบบ, I want clear logs telling me which AI jobs are on, which model each uses, and where the LLM is, so that I can quickly check the setup is right
29. As a ผู้ดูแลระบบ, I want the server to refuse to start, or warn clearly, when the LLM URL is set but unreachable, so that I don't find out only after users complain
30. As a ผู้ดูแลระบบ, I want a startup guide I can follow before the exam (turn the machine on, start Docker, check health, check the URL), so that anyone on the team can do it
31. As a ผู้ดูแลระบบ, I want every env variable for this deploy in one file that git doesn't track, so that secrets don't leak into the repo
32. As a ผู้ดูแลระบบ, I want no external AI API key in the code, the examples or the env, so that the system meets the advisor's requirement and can be shown to examiners
33. As a ผู้ดูแลระบบ, I want the problem translation script to use the same local LLM, so that adding new problems later needs no external key
34. As a Person 2 (เจ้าของ Competitive), I want a handoff note explaining the change to how scores are decided, so that I know before merging my work
35. As a สมาชิกทีม, I want my dev server to keep pointing at the test DB as before, so that I don't interfere with production while working
36. As a สมาชิกทีม, I want to run the tests without Ollama installed, so that the test suite runs on every machine
37. As a ผู้ตรวจโครงงาน, I want documentation explaining the system architecture (Docker, local LLM, which external services are still used and why), so that I can see the design meets the requirements

## Implementation Decisions

### ตัวเรียก LLM ตัวเดียว

- สร้างโมดูลใหม่ฝั่ง server เป็นจุดเดียวที่คุยกับ LLM
  - ใช้แพ็กเกจ `openai` ที่มีอยู่แล้ว
  - ชี้ไปที่ `LLM_BASE_URL` (ใน compose คือ endpoint `/v1` ของ service ollama)
  - ส่ง API key เป็นค่าคงที่ไร้ความหมาย เพราะ Ollama ไม่ใช้
- interface คือฟังก์ชันสร้างตัวเรียกต่องาน
  - รับชื่อโมเดลและ timeout
  - คืนตัวเรียกที่รับ `messages` / `systemInstruction` / `temperature` / `maxTokens` / ตัวเลือก JSON แล้วคืนข้อความ
  - shape เดียวกับ `callAiChat` และ `callCodeJudgeChat` เดิม คนที่เรียกจึงไม่ต้องเปลี่ยน
- ถ้า `LLM_BASE_URL` หรือชื่อโมเดลของงานนั้นว่าง ตัวเรียกจะ throw ทันที
  - ทุกที่ที่เรียกมี fallback อยู่แล้วและต้องใช้ fallback นั้น
- env มีดังนี้:

  | ตัวแปร | ใช้กับ |
  |---|---|
  | `LLM_BASE_URL` | ที่อยู่ endpoint ของ Ollama |
  | `LLM_CHAT_MODEL` | Lumi, สร้างโจทย์ฝึก, สคริปต์แปลโจทย์ |
  | `LLM_JUDGE_MODEL` | คำแนะนำ Competitive |
  | `LLM_ADVICE_MODEL` | คำแนะนำหลังแมตช์ Arcade |
  | `LLM_TIMEOUT_MS` | timeout |

  - ตอนนี้ทั้งสามโมเดลตั้งเป็น `scb10x/typhoon2.5-qwen3-4b`
- เลิกใช้ `NVIDIA_*` และ `GEMINI_*` ทั้งหมด
  - เอา SDK ของ Gemini ออกจาก dependency
  - เอาพารามิเตอร์ที่เป็นของ NVIDIA (`chat_template_kwargs`) ออก
- งานที่ต้องได้ JSON (สร้างโจทย์, คำแนะนำ Competitive) ขอ JSON mode จาก endpoint
  - server ยัง parse และ validate ผลเองเหมือนเดิม
  - ถ้า validate ไม่ผ่านให้ใช้ fallback
- ปิดโหมดคิด (thinking) ของ Qwen3 เพราะทุกงานต้องการคำตอบสั้นและเร็ว
  - เลือกวิธีที่ใช้ได้จริงกับ Ollama ตอนทดสอบ

### Competitive: คะแนนจาก rubric และ LLM ให้แค่คำแนะนำ

- คะแนน, breakdown และสิทธิ์รับรางวัลมาจาก rubric และผลเทสในเครื่องเสมอ
  - ค่าที่ LLM ตอบมาไม่มีผลกับตัวเลขใดเลย
- LLM ถูกขอให้ตอบแค่คำแนะนำภาษาไทยสั้นๆ
  - ถ้าล้มเหลว ช้าเกิน หรือตอบผิดรูป ให้ใช้คำแนะนำของ rubric
- เก็บ field เดิมที่ client ใช้ไว้ครบ (`aiReviewed`, `aiApproved`, `aiVerdict`, `feedback`) เพื่อไม่ให้หน้า Competitive พัง
  - `aiApproved` ตัดสินจากการผ่านเทสครบและคะแนน rubric
- โค้ดส่วนนี้อยู่ในขอบเขตของ Person 2 จึงต้องเขียนบันทึกส่งต่อก่อน merge

### Arcade: คำแนะนำหลังแมตช์

- ตัวสร้างคำแนะนำเปลี่ยนจาก Gemini เป็นตัวเรียก LLM ใหม่
- คง interface `generate` ที่ judge รับเข้ามา
- คงพฤติกรรมเดิมทั้งหมด:
  - rate limit
  - ขอได้ครั้งเดียวต่อแถว
  - กันคำขอซ้ำที่ยังทำงานอยู่
  - fallback เป็นผลวัด
- คะแนนคุณภาพยังวัดในเครื่องตาม ADR 0007 ไม่เปลี่ยน

### Docker compose

- ลบ service Postgres ในเครื่องออก เพราะ production ใช้ `DATABASE_URL` ของ Supabase
  - เก็บวิธีกลับไปใช้ Postgres ในเครื่องไว้เป็นหมายเหตุ
- เพิ่ม service `ollama`:
  - มี volume เก็บโมเดล
  - healthcheck
  - คำขอพร้อมกัน 1 ตัว
  - เก็บโมเดลไว้ในหน่วยความจำตลอด
- เพิ่ม service ที่รันครั้งเดียวเพื่อดึงโมเดลตาม env แล้วจบ
  - app เริ่มหลังตัวนี้เสร็จ
- เพิ่ม service `tailscale`:
  - ใช้ auth key จาก env
  - เปิด Funnel ที่ 443 ส่งต่อไปที่ app
  - มี volume เก็บ state ทำให้ hostname และ URL คงที่
- GPU แยกเป็นไฟล์ compose override
  - เครื่องที่ไม่มี GPU ใช้ไฟล์หลักไฟล์เดียว และ Ollama ใช้ CPU
- app ไม่ publish พอร์ตออกนอกเครื่อง ยกเว้น loopback สำหรับตรวจในเครื่อง
- `PUBLIC_BASE_URL` เป็น URL ts.net ซึ่งผ่านการตรวจ "HTTPS สาธารณะ" ของ server อยู่แล้ว
  - ไม่ต้องผ่อนกฎนั้น
- ไฟล์ env ของ deploy ใช้ไฟล์ที่ git ไม่ track บนเครื่อง server
  - ไฟล์ตัวอย่างเอาตัวแปรของ AI ภายนอกออก และใส่ตัวแปร `LLM_*` กับ `TS_*` แทน

### บริการภายนอกที่ยังใช้ (ตั้งค่าครั้งเดียว ผู้ดูแลทำเองในบัญชีของตัวเอง)

- **Supabase Auth ของ project ใหม่:** ตั้ง Site URL / Redirect URLs เป็น URL ts.net และตั้ง custom SMTP เป็น Gmail ผ่านสคริปต์ตั้งค่า Auth ที่มีอยู่
- **Google OAuth:** เพิ่ม callback ของ project ใหม่ และเพิ่ม origin ts.net
- **Tailscale:** สร้างบัญชี เปิด HTTPS และ Funnel แล้วสร้าง auth key

### เอกสาร

- **ADR 0009:** deploy ด้วย Docker บนเครื่องที่ดูแลเอง และใช้ LLM ในเครื่อง
- คู่มือ deploy ใหม่แทนคู่มือ Render มีหัวข้อ:
  - ติดตั้งครั้งแรก
  - เปิดเครื่องก่อนวันสอบ
  - ย้ายไป VM ของ มข.
  - เปลี่ยนไปใช้โดเมน kku.ac.th
- CLAUDE.md:
  - ตาราง AI เปลี่ยนเป็น Ollama 3 งาน แต่ละงานมี env ของตัวเอง
  - กฎ "แยกโมเดล" เปลี่ยนเป็น "ตั้งชื่อโมเดลแยกต่องาน, ห้าม hard-code, ห้ามใช้ API key ของ AI ภายนอก"

## Testing Decisions

- **เทสที่ดีคือเทสพฤติกรรมที่ผู้ใช้หรือ API เห็น** ไม่ใช่รายละเอียดภายใน
  - เช่น endpoint ตอบอะไร คะแนนเท่าไร และใช้ fallback เมื่อไร
  - ไม่เทสว่าเรียกฟังก์ชันภายในกี่ครั้ง
- **มี seam เดียว:** Ollama ปลอมที่ `LLM_BASE_URL`
  - เทสบูต server ตัวจริงแบบเดียวกับ helper บูต server ที่ชุด Arcade ใช้อยู่
  - ตั้ง `LLM_BASE_URL` ให้ชี้ไป HTTP server ปลอมในเทส ซึ่งตอบ `/v1/chat/completions` แบบ OpenAI
  - ตัวปลอมเลือกได้ว่าจะตอบปกติ ตอบช้าเกิน timeout ตอบ JSON เสีย หรือตอบ 5xx
  - ตัวปลอมบันทึก request ที่ได้รับ เพื่อตรวจว่าแต่ละงานส่งชื่อโมเดลของตัวเอง
  - ไม่ต้องเปิดช่องฉีด dependency ใหม่ในโค้ด
- **endpoint ที่ต้องเทส:**
  - **แชท Lumi:** ตอบข้อความจากตัวปลอม และตอบข้อความสุภาพเมื่อ LLM ล้มเหลวหรือปิดอยู่
  - **สร้างโจทย์ฝึก:** JSON ที่ถูกต้องได้โจทย์ ส่วน JSON เสียหรือ timeout ได้โจทย์สำรอง
  - **ส่งคำตอบ Competitive:**
    - คะแนนและสิทธิ์รับรางวัลเท่ากับ rubric ทุกกรณี แม้ตัวปลอมจะตอบคะแนนสูงหรือต่ำผิดปกติ
    - คำแนะนำมาจากตัวปลอมเมื่อสำเร็จ และมาจาก rubric เมื่อล้มเหลว
  - **คำแนะนำหลังแมตช์ Arcade:** ได้ข้อความจากตัวปลอม และได้ผลวัดเมื่อล้มเหลว
    - ยังขอได้ครั้งเดียว และกันคำขอซ้ำ
  - **ปิดงาน:** ไม่ตั้ง `LLM_BASE_URL` แล้ว server ยังบูตและทุกงานใช้ fallback ตัวปลอมต้องไม่ได้รับ request เลย
- **prior art:**
  - helper บูต server ของชุดเทส Arcade (`arcade-restart-readiness`, `arcade-acceptance`)
  - เทส judge ของ Arcade ที่ใช้ generate ปลอม
  - ตัวแทน Supabase ปลอมใน helper เดียวกัน
- **ชุดเดิมต้องผ่าน:** `npm test` ของ server และ client, `npm run lint`, `npm run build`, `test:arcade`, `test:grader`, `test:submit`, calibration ของ Arcade และ sim ของบอท
- **ตรวจด้วยมือกับ Ollama จริง** (ไม่อยู่ในชุดอัตโนมัติ):
  - วัด tokens/sec และยืนยันว่าโมเดลอยู่บน GPU ทั้งตัว
  - ถาม Lumi 10 คำถามภาษาไทย
  - สร้างโจทย์ 5 ข้อ
  - ขอคำแนะนำ Competitive และ Arcade
- **ตรวจจากภายนอก:** เปิด URL ts.net จากมือถือที่ใช้ 4G แล้วทำครบทุกขั้น
  - สมัคร + อีเมลยืนยัน
  - Google login
  - บทเรียน
  - Competitive
  - Arcade ห้อง 5 คนพร้อมบอท
  - Lumi

## Out of Scope

- **ย้ายฐานข้อมูล ระบบล็อกอิน หรือที่เก็บไฟล์ออกจาก Supabase:** ตัดสินใจแล้วว่ายังใช้ Supabase cloud
- **ยื่นคำขอกับ มข. และขอโดเมน kku.ac.th:** อาจารย์เป็นผู้ยื่น spec นี้แค่ทำให้เปลี่ยนไปใช้ได้ด้วยการแก้ env
- **ตั้ง VM ของ มข.:** ตอนนี้ใช้โน๊ตบุ๊กก่อน
- **เปิดระบบตลอด 24 ชั่วโมง:** เปิดเฉพาะช่วงตรวจและวันสอบ
- **streaming คำตอบของ Lumi:** ยังตอบทีเดียวเหมือนเดิม
- **โมเดลที่สองหรือ GPU ที่ใหญ่กว่า:** env รองรับการแยกโมเดลไว้แล้ว แต่ยังไม่ทำ
- **เปลี่ยนวิธีวัดคุณภาพของ Arcade:** ยังใช้ ADR 0007
- **ตัดของที่ client โหลดจาก CDN** (Google Fonts, Monaco, canvas-confetti): ข้อกำหนดใหม่ห้ามแค่โฮสต์ภายนอกและ API key ของ AI
- **ลบ repo ส่วนตัวหรือ Supabase project ใหม่ที่สร้างไว้:** ยังใช้ต่อ

## Further Notes

- **ข้อมูลการขอกับ มข. (ค้นเมื่อ 2026-10-21):**
  - สำนักเทคโนโลยีดิจิทัลมีบริการ VM, ขอเปิดเว็บไซต์แบบสาธารณะ และจดโดเมน kku.ac.th ทั้งหมดยื่นที่ e-service.kku.ac.th
  - ยื่นได้เฉพาะบุคลากร นักศึกษาจึงต้องให้อาจารย์ยื่น
  - ติดต่อชั้น 1 โทร 043-009700 ต่อ 42055
  - ยังไม่รู้รายละเอียดแบบฟอร์มและระยะเวลา
- **ต้องถามอาจารย์ว่า Tailscale Funnel ใช้เป็นทางเข้าชั่วคราวได้ไหม** เพราะยังเป็นบริการภายนอกด้านเครือข่าย และ Funnel ยังเป็น beta และจำกัด bandwidth
- **ความเร็ว:**
  - โมเดล 3–4B ที่อยู่บน GPU ทั้งตัวคาดว่าได้ราว 25–45 tokens/sec ตัวเลขนี้เป็นค่าประมาณ ต้องวัดจริง
  - คำตอบ Lumi ยาว 300 tokens จึงใช้เวลาราว 7–12 วินาที
- **ระยะทางถึงฐานข้อมูล:** Supabase project ใหม่อยู่ที่ Seoul ทุก query จากเครื่องในไทยจึงต้องข้ามไป Seoul ต้องวัดเวลาปิดรอบ Arcade ตอน smoke test
- **ลำดับเวลา:**
  - 21 ต.ค.: ตัวเรียก LLM และ Competitive
  - 22 ต.ค.: รวมงานของทีม แล้วทำ compose ให้เสร็จ
  - 23 ต.ค.: smoke test จากภายนอก
  - 24 ต.ค.: เผื่อแก้ปัญหา
  - 25 ต.ค.: ส่งงาน
