# Lumi ตอบตรงคำถามและทยอยขึ้น, คิว AI, คลังโจทย์ล่วงหน้า, เว็บโหลดเร็วขึ้น

**วันที่:** 2026-11-16 (Asia/Bangkok), Person 3
**อ้างอิง:** `สิ่งที่ต้องแก้ไข.md` ข้อ 2 และ 15
**แผน:** `C:\Users\ACER\.claude\plans\functional-riding-shore.md` (ผู้ใช้อนุมัติแล้ว)

## ปัญหา (ผู้ใช้เจอหลังย้ายเว็บไปเครื่อง มข. ซึ่งไม่มี GPU)

- Lumi ตอบแนะนำตัวทุกครั้ง ไม่สนคำถาม
- AI ตอบหรือสร้างโจทย์ช้าเป็นสิบวินาทีถึงหลายนาที
- หน้าเว็บโหลดช้า

## สาเหตุที่เจอ

**1. Lumi ไม่ได้รับคำถามเลย**
- `CodingWorkspace.jsx` (Debug Lab / Challenge) และ `MiNi_Game.jsx` ส่ง `{ message }`
- server อ่านเฉพาะ `messages` โมเดลจึงได้แค่ system prompt

**2. ไม่มีการ stream เลย และทุกงาน AI ต่อคิวเดียวกันของ Ollama**
- แชทจึงอาจติดหลังงานสร้างโจทย์ที่นานหลายนาที
- ทุกครั้งที่เปิดเว็บ `App.jsx` เรียก `/api/learning/ai-task` ซึ่งอาจสร้างโจทย์ด้วยโมเดล

**3. server ไม่บีบอัดไฟล์และไม่ให้ cache (`max-age=0`)**
- `first_print.gif` ขนาด 82.8 MB อยู่ในบทเรียนแรก
- เพลง 6.6 MB อยู่ในทุกหน้า
- sprite ของ Lumi รูปละ 1.3–3 MB

**4. query ไปฐานที่โตเกียวเรียงต่อกัน**
- achievements: 11 query
- course-content: 4 query
- `CREATE TABLE IF NOT EXISTS` ทุกครั้งที่ ping presence

## สิ่งที่แก้

**AI**
- **`client/src/utils/lumiChat.js` (ใหม่):** `buildLumiMessages()` ใช้ร่วมกันทั้งสามหน้า และ `streamLumi()` อ่าน SSE
- **`client/src/hooks/useLumiChat.js` (ใหม่):** ส่งได้ทีละคำถาม, อัปเดตฟองแชทระหว่างเขียน, ปุ่มหยุด
- **`ExercisePage.jsx`, `CodingWorkspace.jsx`, `MiNi_Game.jsx`:** ใช้ helper กับ hook ข้างบน และปุ่มส่งเปลี่ยนเป็นปุ่มหยุดระหว่างตอบ
- **`server/ai/llm.js`:**
  - **คิวต่อ model server สามระดับ:**
    - `interactive`: Lumi, คำแนะนำ Competitive
    - `normal`: สร้างโจทย์สด, คำแนะนำ Arcade
    - `idle`: เติมคลังโจทย์ ถูกยกเลิกทันทีเมื่อมีคนต้องใช้โมเดล
  - **`stream()`:**
    - ตัด `<think>` ที่ถูกหั่นข้ามชิ้นได้
    - จำกัดเวลารอตัวแรก (`LLM_FIRST_TOKEN_MS`, ค่าเริ่ม 30 วินาที) และเวลาที่เงียบระหว่างชิ้น แต่ไม่จำกัดความยาวคำตอบทั้งหมด
- **`server/server.js` `POST /api/ai/chat`:**
  - ไม่มีคำถามจาก user ตอบ 400
  - ถ้าขอ `text/event-stream` ส่ง SSE (`Cache-Control: no-transform`)
  - ถ้าผู้ใช้กดหยุดหรือปิดหน้า ยกเลิกคำขอที่ Ollama
- **prewarm `/api/learning/ai-task?prewarm=1`:** ถ้ายังไม่มีโจทย์ ตอบ `task: null` ไม่สร้างโจทย์และไม่เรียกโมเดล
- **`server/competitivePool.js` (ใหม่) + migration `202611160001`:**
  - สร้างตาราง `competitive_generated_pool`
  - เติมโจทย์หมวดละ 3 ข้อ (`COMPETITIVE_POOL_PER_TOPIC`, 0 = ปิด) เมื่อโมเดลว่าง
  - `POST /api/competitive/challenges/generate` หยิบจากคลังก่อน (`FOR UPDATE SKIP LOCKED` กันได้ข้อซ้ำ) คลังว่างค่อยสร้างสด
  - คำตอบมี `source: 'pool'`
- **`ai/localJson.js`, `competitiveAi.js`:** ส่ง `priority` ต่อไปให้คิว

**หน้าเว็บ**
- **`server/server.js`:**
  - เพิ่ม `compression`
  - `/assets/*-hash.*` ได้ `max-age=1y, immutable`
  - `/pyodide/*` ได้ 7 วัน
  - ไฟล์อื่นใน dist และ `/uploads` ได้ 1 วัน
  - `index.html` ได้ `no-cache`
- **`client/public/gif/*.mp4` (ใหม่):** แปลงจาก GIF ทั้ง 5 ไฟล์ด้วย ffmpeg (H.264, CRF 28, 15 fps)
  - ขนาดรวมจาก 90 MB เหลือ 0.53 MB
  - ตัวอย่าง: `first_print` จาก 82.8 MB เหลือ 166 KB
- **`client/src/components/learning/SlideImage.jsx` (ใหม่):** สไลด์ที่ชี้ `/gif/*.gif` เล่น MP4 แบบวนเงียบ ถ้า MP4 พังกลับไปใช้ GIF
  - ไม่ต้องแก้ข้อมูลในฐาน
- **`client/public/data_MiNiGame/NPC_lumi/*.png`:** ย่อเหลือ 512 px และลดสีเหลือ 256 สี
  - ขนาดรวมจาก 12.3 MB เหลือ 0.33 MB
  - เป็นภาพ pixel art จึงดูไม่ต่าง
- **`App.jsx`:** เพลงพื้นหลังเป็น `preload="none"`
- **`index.html` / `index.css`:** Google Fonts เปลี่ยนเป็น `<link>` + preconnect แทน `@import`
- **server:**
  - `computeAchievementMetrics` และ `/api/course-content` ใช้ `Promise.all`
  - `schemaOnce()` ให้ `CREATE TABLE IF NOT EXISTS` ในทุก route รันครั้งเดียวต่อ process
  - ไม่ได้แก้ตัวฟังก์ชัน ensure* เพราะอยู่ใน checksum ของ migration ที่รันไปแล้ว
- **`LearningPage.jsx`:** กลับมาที่แท็บแล้ว refetch ไม่เกินนาทีละครั้ง
- **Pyodide lazy load:** session แยกทำ บันทึกอยู่ใน `docs/handoff-to-person-1.md`

**ไม่ได้ทำ (ตัดสินใจระหว่างทำ)**
- **ไม่ลด `OLLAMA_CONTEXT_LENGTH` เหลือ 2048 ตามแผน A4:**
  - ตัวสร้างโจทย์ขอ output สูงสุด 4096 token ถ้าลด context จะตัดโจทย์ขาด
  - context ใหญ่ไม่ได้ทำให้ช้าลง ความเร็วขึ้นกับความยาวของ prompt จริง
- **ไม่เปลี่ยนรูป `cat-logo.png` (admin) และไม่ลบ `hero-background.jpg`:** ไม่มีหน้าไหนของผู้เล่นโหลด

## ทดสอบ

**อัตโนมัติ:**
- **`server/tests/llm-queue.test.js` (ใหม่, 6 เคส):**
  - interactive แซง normal
  - idle ถูกยกเลิก แต่ normal ไม่ถูกยกเลิก
  - คนที่ยกเลิกระหว่างรอออกจากคิว
  - `<think>` ถูกหั่นข้ามชิ้นแล้วยังตัดออกได้
- **`server/tests/local-llm-chat.test.js` (+4 เคส):**
  - request ไม่มีคำถามได้ 400 และไม่เรียกโมเดล
  - stream ส่งหลายชิ้น ตัด `<think>` และมี `no-transform`
  - โมเดลล่มได้ error event
  - โมเดลเงียบกลางคำตอบถูกตัดที่ `LLM_TIMEOUT_MS` โดยเก็บส่วนที่เขียนแล้วไว้
- **`server/tests/competitive-pool.test.js` (ใหม่, 4 เคส):**
  - มีโจทย์ในคลังได้ทันทีโดยไม่เรียกโมเดล และบันทึก `used_by`
  - คลังว่างสร้างสด
  - 2 คนหยิบพร้อมกันได้ 1 ข้อ
  - refill ทำเฉพาะตอนโมเดลว่าง ใช้ `priority: 'idle'` และหยุดเมื่อเต็ม
- **`fake-ollama.js`:** ตอบแบบ stream ได้
- **`start-server.js`:** เปิดให้ใช้ `baseURL` และ `token`
- client `npm run lint` ผ่าน (0 error) และ `npm run build` ผ่าน
- server `npm test` ทั้งชุดบน Postgres ทดสอบในเครื่อง: **280/280 ผ่าน**

**วัดจริงบนโน๊ตบุ๊ก (Ollama 0.30.0 ใน container แบบ CPU อย่างเดียว คล้ายเครื่อง มข.):**
- โมเดลเพิ่งโหลด: ตัวอักษรแรก 17.1 วินาที ตอบจบ 25.1 วินาที
- โมเดลโหลดแล้ว: **ตัวอักษรแรก 0.45 วินาที** ตอบจบ 6.8 วินาที (144 ตัวอักษร)
- ไม่มี reasoning chunk และไม่มี `<think>` แปลว่า `reasoning_effort: 'none'` ใช้ได้กับ Ollama 0.30

**header จาก server จริง (dist ที่ build แล้ว):**
- `/assets/index-*.js`: `immutable` + `Content-Encoding: br`
- `/pyodide/pyodide.asm.js`: 7 วัน + br
- `/gif/first_print.mp4`: 166 KB
- `/`: `no-cache`

**หน้าเว็บจริง:** รันบน dist ที่ build แล้ว กับฐาน `pyarena_playtest` ในเครื่อง และ Ollama แบบ CPU อย่างเดียว เข้าระบบด้วย probe player ของชุดเทส
- **Debug Lab ถาม "ช่วยอธิบายโจทย์ข้อนี้แบบเข้าใจง่ายหน่อย" (โจทย์นับความยาวข้อความ):**
  - ได้คำตอบที่พูดถึงโจทย์จริง: "รับข้อความ… ใช้ `len()`"
  - ไม่มีการแนะนำตัวอีกแล้ว
- **ถาม "ช่วยเขียนโค้ดข้อนี้ให้หน่อย":**
  - ตัวอักษรแรกขึ้นที่ **1.26 วินาที**
  - ข้อความยาวขึ้นทุก 0.25 วินาที (สุ่มอ่านจาก DOM)
  - ตอบว่าไม่เฉลยทั้งข้อ และให้แนวทางแทน
- **ปุ่มหยุด:**
  - คำตอบหยุดทันที ขึ้นข้อความ "หยุดคำตอบแล้ว…"
  - ปุ่มส่งกลับมา และไม่มีข้อความเพิ่มหลังกดหยุด
- **บั๊กเดิมที่เจอระหว่างทดสอบ:**
  - ปุ่ม "?" (เปิดวิธีใช้งานเว็บ, `fixed bottom-6 right-6 z-40`) ทับปุ่มส่งและปุ่มหยุดของแชท Lumi
  - เห็นได้ในภาพหน้าจอของผู้ใช้เมื่อ 2026-11-12 ด้วย
  - **แก้:** ย้ายปุ่มไปมุมซ้ายล่างใน `AiTaskPage.jsx` และ `ExercisePage.jsx`
  - หลังแก้ ตรวจด้วย `elementFromPoint` แล้วไม่มีอะไรทับปุ่มส่ง
- **เปิดหน้าบทเรียน 1:** ไม่มีการโหลด `pyodide`, `.wasm` หรือไฟล์สื่อใดๆ (ดูจาก resource timing)
- **MP4 ทั้ง 5 ไฟล์:** เล่นได้ใน Chromium (1280×720 ความยาวเท่า GIF เดิม และ `currentTime` เดินจริง)
  - ใส่ `slide_src` ให้สไลด์ 34 ชั่วคราวแล้ว **คืนค่าเดิมแล้ว**
  - **ยังไม่ได้เห็น `SlideImage` ในสไลด์จริง** เพราะหน้าบทเรียนบังคับทำแบบทดสอบก่อนเรียนก่อน
  - ฐานทดสอบและ `seed-content.sql` ไม่มีสไลด์ไหนชี้ `/gif/` เลย GIF เหล่านี้มาจาก `server/migration_friend.sql` เท่านั้น
- **Competitive กด List → Generated โจทย์:**
  - ได้โจทย์ใน **129 ms** (`source: 'pool'`) ปุ่ม "ใช้โจทย์นี้" กดได้
- **refill ใช้กับโมเดลจริงได้:** ตอนเปิด server ครั้งแรก มันเติมคลังเองจากโมเดลจริง 3 ข้อ (Loop, If-Else, List) ห่างกันประมาณ 1–5 นาทีบน CPU
- **ปัญหาคุณภาพโจทย์ที่ AI สร้าง (ข้อ 6):**
  - โจทย์ "นับจำนวนตัวอักษรในชื่อ-นามสกุล" เขียนในคำอธิบายว่า "สมชาย มีตรี" มี 10 ตัว
  - แต่ expected ที่ได้จากการรันเฉลยคือ 8 คำอธิบายกับเทสจึงไม่ตรงกัน

## ผลกระทบ

- **migration ใหม่ `202611160001`** จะรันบนฐาน production ตอน deploy ครั้งถัดไป เป็นการสร้างตารางใหม่อย่างเดียว ไม่แตะข้อมูลเดิม
- **โหลดของ Ollama:** เครื่อง มข. จะเริ่มเติมคลังโจทย์ Competitive เอง 8 หมวด × 3 ข้อ ใช้เวลาตอนว่าง และถูกยกเลิกทันทีเมื่อมีคนถาม Lumi
- **ไม่แตะ Bot AI, Arcade scoring, grader หรือ schema ของ `arcade_*`**

## ยังไม่ได้ทำ / ต้องทดสอบเพิ่ม

- **ยังไม่ได้ commit**
- **deploy ขึ้นเครื่อง มข. แล้ววัดซ้ำ:**
  - `tailscale netcheck` เพื่อดูว่า UDP ผ่านไหม
  - `ollama run --verbose` ดู eval rate บน CPU ของ มข.
