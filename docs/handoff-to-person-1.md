# ไฟล์ของ Person 1 ที่ Person 3 เข้าไปแก้

`CLAUDE.md` กำหนดให้แต่ละคนแก้เฉพาะไฟล์ในขอบเขตของตัวเอง และถ้าจำเป็นต้องข้ามเขต
ให้แจ้งก่อน หน้านี้คือที่รวมรายการนั้น เพื่อให้เจ้าของไฟล์รู้ตัวก่อน merge
ไม่ใช่มาเจอเอาตอนที่โค้ดของตัวเองเปลี่ยนไปแล้ว

**ทุกรายการในนี้เป็นงานที่ผู้ใช้สั่งโดยตรง** ไม่ใช่การเข้าไปแก้เอง
ถ้าเจ้าของไฟล์ไม่เห็นด้วยกับวิธีที่ทำ ให้คุยกันได้ — งานที่ต้องได้ผลคือพฤติกรรมที่อธิบายไว้
ไม่ใช่โค้ดชุดนี้โดยเฉพาะ





---

## 2026-08-27 — เฟส A (1d): ExercisePage รันใน worker แล้ว

ไฟล์: `client/src/pages/ExercisePage.jsx` (ของ Person 1), `client/public/pyodideWorker.js`,
`client/src/hooks/usePyodide.js`

ExercisePage เดิมโหลด Pyodide บน main thread เอง (`ensurePyodideLoader` + `loadPyodide`) ลูปค้าง
= แท็บค้าง ตอนนี้ย้ายมารันผ่าน `usePyodide` (worker) — ลูปถูก interrupt แทนการค้าง

- **worker เพิ่ม interactive input()**: bridge `requestInputFromJS` (async, ไม่ใช้ Atomics) +
  wrapper `compile(PyCF_ALLOW_TOP_LEVEL_AWAIT)` แบบเดียวกับที่หน้านี้เคยทำบน main thread +
  ใส่ cwd ลง sys.path ให้ `import` ไฟล์พี่น้องได้
- **hook เพิ่ม**: options `interactive`, `onInput`, `onStdout`, `onStderr`, `mainFileName` และ
  **พัก watchdog ระหว่างรอ input** (พิมพ์ช้าไม่ถูกตัดว่าลูปค้าง)
- **ExercisePage**: ลบ init/ensurePyodideLoader/`window.requestInputFromJS` ทิ้ง; `handleRun`
  เรียก `runCode(mainCode, files, {interactive, onInput, onStdout, onStderr})`; `handleSubmit`
  รัน trial แต่ละ test case ใน worker (StringIO ป้อน input, จับ stdout) — trial ที่ลูปค้างก็ถูก
  หยุด ไม่ freeze; **ไม่แตะการตัดสิน** (verdict ยังมาจาก server เท่านั้น ตาม CONTEXT.md "ลองรันไม่ตัดสิน")

### ทดสอบแล้ว
- กลไก worker: `input("ชื่อ:")` → รับ "Pong", `int(input())`→25 ถูก; `while True` ใน interactive
  mode ถูกหยุดพร้อมข้อความไทย
- `npm run build` ผ่าน, `npm run lint` 57/9 เท่าเดิม (ExercisePage ไม่มี error ใหม่)
- **ยังไม่ได้ E2E บนหน้า ExercisePage จริง** เพราะ local Postgres ไม่ได้รันอยู่ตอนนี้ (หน้าโหลด
  รายการแบบฝึกหัดไม่ได้ + ต้องล็อกอิน) — route guard ทำงานถูก (redirect /login), แอปไม่ crash
  ต้องเปิด DB แล้วลองกด Run/Submit บนโจทย์ที่มี input() และโจทย์ที่ใส่ `while True` ให้ครบ

---

## 2026-08-27 — เฟส A: กันลูปค้างจริง (isolation + SharedArrayBuffer interrupt)

ต่อจาก self-host Pyodide รอบนี้เปิด cross-origin isolation แล้วใช้ SharedArrayBuffer หยุดลูปค้าง

ไฟล์ของ Person 1 ที่แตะ:
- `client/src/hooks/usePyodide.js` — เขียนใหม่: สร้าง SharedArrayBuffer(1) ส่งให้ worker,
  watchdog สองชั้น (INTERRUPT_MS 10s เขียน SIGINT ลง buffer → Pyodide raise KeyboardInterrupt
  โค้ดหยุดเองอย่างสะอาด worker ยังใช้ต่อได้; TERMINATE_MS 14s ฆ่า worker ทิ้งถ้าชั้นแรกไม่ได้ผล)
  **แก้บั๊กเดิมด้วย**: การ recreate worker ตอน timeout เดิม copy `onmessage` จาก ref ที่ชี้ worker
  ตัวใหม่ (undefined) ทำให้ worker ที่สร้างใหม่ไม่มี handler — ตอนนี้เก็บ handler ไว้ใน ref
- `client/public/pyodideWorker.js` — รับ interruptBuffer ตอน init, `setInterruptBuffer`,
  เคลียร์ก่อนรันแต่ละครั้ง, แปลง KeyboardInterrupt เป็นข้อความไทย "โค้ดรันนานเกินไป อาจมีลูป..."

ไฟล์อื่น:
- `client/vite.config.js` — COOP `same-origin` + COEP `credentialless` (dev)
- `server/server.js` — COOP/COEP เดียวกันบน SPA ที่ build แล้ว (prod) วางก่อน static + fallback
- `server/pythonErrorMessages.js` → **`.mjs`** (ESM) เพื่อให้ client import ตรงๆ ได้ทั้ง dev+build
  โดยไม่ต้องพึ่ง CommonJS interop (dev esbuild ไม่ synth export ให้ไฟล์ .js นอก root) —
  server (CommonJS) ยัง `require()` ไฟล์เดียวกันได้เพราะ Node 22 รองรับ require(ESM);
  `problemGrader.js` และ `scripts/error-messages-test.js` อัปเดต path แล้ว
- `client/eslint.config.js` — ignore `public/pyodide` (ไฟล์ runtime ที่ก๊อปมา ไม่ให้ lint พัง)

### ทดสอบแล้ว (dev server จริง + isolation เปิด)
- `crossOriginIsolated === true`, `SharedArrayBuffer` ใช้ได้ · แอปเรนเดอร์ปกติ (Google Fonts
  ยังโหลดได้ใต้ COEP credentialless)
- `while True: x+=1` ถูกหยุดที่ 1233ms (watchdog เขียน SIGINT ตอน 1200ms) ได้ข้อความไทย
  `interrupted:true` และ worker ยังรันโค้ดถัดไปได้ (interrupt ไม่ใช่ terminate)
- server error-messages-test 15/15 ผ่าน (require(ESM) ทำงาน) · client build ผ่าน · lint 57/9 เท่าเดิม

### ยังไม่เสร็จ (เฟส A ต่อ)
- ย้าย 3 หน้า main-thread (ExercisePage, MiNi_Game, CodingWorkspace) เข้า worker + blocking
  input() ผ่าน SAB (ตอนนี้ยังรัน main thread — ลูปค้างในหน้าพวกนี้ยังไม่ถูกกัน) + แปล error ไทย
- ทดสอบ E2E บนหน้า LessonPage playground จริง (กลไก interrupt ผ่านแล้วระดับ worker)
---

## 2026-08-27 — เฟส A: self-host Pyodide (เตรียมกันลูปค้าง)

งานตาม `Plan2.md` ข้อ 1 ผู้ใช้เลือกทาง"self-host Pyodide + worker + cross-origin isolation"
รอบนี้ทำชั้นแรก: **ย้าย Pyodide จาก CDN มาเสิร์ฟเอง** (ยังไม่เปิด isolation ไม่เปลี่ยนพฤติกรรม)
จำเป็นเพราะ `<script>` จาก CDN ฝังใต้ COEP ไม่ได้ และ SharedArrayBuffer (ตัวที่จะใช้กันลูปค้าง +
ทำ input() ให้บล็อกใน worker) ต้องมี isolation

ไฟล์ของ Person 1 ที่แตะ (แค่เปลี่ยนที่มาของ Pyodide จาก CDN → `/pyodide/`):
- `client/public/pyodideWorker.js` — `importScripts('/pyodide/pyodide.js')` + `indexURL:'/pyodide/'`
  (เวอร์ชันขยับ 0.27.4 → 0.27.7 ให้ตรงกับหน้าอื่น)
- `client/src/pages/ExercisePage.jsx`, `client/src/pages/MiNi_Game.jsx`,
  `client/src/components/learning/CodingWorkspace.jsx` — `PYODIDE_SCRIPT_URL` และ `loadPyodide({indexURL})`
- ตรรกะการรัน/ตัดสินไม่แตะเลย

Pyodide (core 14MB) ก๊อปจาก `node_modules/pyodide` ไป `public/pyodide/` ด้วย
`client/scripts/sync-pyodide.mjs` (รันอัตโนมัติผ่าน `predev`/`prebuild`) และ gitignore ไว้
— `npm install` + build สร้างใหม่ได้เอง ไม่ commit ไฟล์ใหญ่

ทดสอบบน dev server จริง: assets เสิร์ฟจาก origin เราครบ (wasm = application/wasm),
โหลด+รัน `1+1`=2 ได้ใน 5.4s (main thread) และ worker ready+รันได้ใน 2.2s · prod:
`express.static` เสิร์ฟ `/pyodide/*` ก่อน SPA fallback · `npm run build` ผ่าน
---

## 2026-08-27 — เฟส A (ส่วนที่ 1): error เป็นคำแนะนำ แทน traceback ดิบ

งานตาม `Plan2.md` ข้อ 2 ผู้ใช้สั่งให้ error ตอนเขียนผิดเป็นคำแนะนำภาษาไทย ไม่ใช่ traceback
ดิบภาษาอังกฤษ ใช้ตัวแปลตัวเดียว `server/pythonErrorMessages.js` (`explainPythonError`)
ที่มีอยู่แล้ว โดยรอบนี้ทำให้ **client เรียกใช้ไฟล์เดียวกันกับ server ได้** (ผ่าน Vite alias
`@shared` + util `client/src/utils/friendlyPyError.js`) — ไฟล์แปลมีชุดกฎเดียว ข้อความที่ผู้เรียน
เห็นในเบราว์เซอร์จึงตรงกับที่ server ตัดสิน

### `client/src/pages/LessonPage.jsx` (ของ Person 1)
- ช่อง playground "Run Code" เดิมโชว์ stderr เป็น traceback อังกฤษดิบ ตอนนี้เพิ่มบรรทัด
  คำแนะนำไทย (สีเหลืองอำพัน ขึ้นต้น 💡) ต่อท้ายผลรัน โดย traceback ดิบยังอยู่ด้านบนตามเดิม
- **จงใจไม่โชว์เลขบรรทัด** ในจุดนี้ เพราะ worker รันโค้ดในเฟรม `<exec>` เลขบรรทัดไม่ตรงกับ
  ในเอดิเตอร์ (เลขผิดแย่กว่าไม่มีเลข ตาม CLAUDE.md เรื่องผู้เริ่มต้น)
- แก้ 3 จุด: import util, ต่อ `.then()` อ่านผลรัน, เพิ่มสไตล์ `type === "hint"` ในตัวเรนเดอร์เทอร์มินัล
- **ไม่แตะ** ตรรกะการรัน/ตัดสิน/quiz ใดๆ

### `client/src/pages/CompetitiveArena.jsx` (ของ Person 2)
- ช่องผลรันเทส (`run-tests`) เดิมโชว์ `result.error` ดิบ ทั้งที่ server แนบ `result.hint` /
  `result.errorLine` (ภาษาไทย จากตัวแปลตัวเดียวกัน) มาให้อยู่แล้ว — client แค่ไม่เคยอ่าน
- ตอนนี้โชว์ 💡 hint ไทยก่อน แล้วตามด้วย "รายละเอียด: <error ดิบ>" เยื้องเข้าไป
- แก้จุดเดียวใน `handleRunTests` (การ map ผลต่อ case) ไม่แตะการให้คะแนน/AI review

### ที่ทดสอบแล้ว
- `npm run build` ผ่าน — ยืนยันว่า Vite/Rollup แปลไฟล์ CommonJS ที่แชร์ได้ทั้ง dev และ prod
  (ต้องตั้ง `build.commonjsOptions.include` ให้ครอบไฟล์นี้ ไม่งั้น prod build จะพังเพราะ Rollup
  ไม่ synth named export จาก `module.exports`)
- ตรวจ `explainPythonError` กับ traceback แบบ Pyodide จริง (NameError/SyntaxError/ZeroDivision)
  ได้ข้อความไทยถูกต้อง
- `npm run lint` เท่า baseline 57/9 ไม่มีของใหม่
- **ยังไม่ได้** ทดสอบ E2E ในเบราว์เซอร์จริงของ hint บนหน้า LessonPage/Competitive (ต้องล็อกอิน
  + เปิดสไลด์โค้ด) — ตรรกะเป็น React ตรงไปตรงมาและ build/lint ผ่าน แต่ยังไม่ถือว่า verified เต็ม
---

## 2026-08-26 — commit `61ed579`

### `client/src/pages/LearningPage.jsx` — บทเรียนย่อยปลดล็อกตามลำดับ

**ที่ผู้ใช้สั่ง:** "บทเรียนย่อยตอนนี้สามารถกดเรียนอันไหนก่อนก็ได้ แต่ความจริงต้องปลดล็อคไปตามลำดับ"

**ที่แก้:** ในลิสต์บทเรียนย่อยของแต่ละหมวด บทถัดไปจะกดไม่ได้จนกว่าบทก่อนหน้าจะมี
`post_quiz_completed` เป็นจริง ซึ่งเป็นสัญญาณเดียวกับที่ป้าย "เรียนเสร็จสิ้น" ใช้อยู่แล้ว
ไม่ได้เพิ่มฟิลด์ใหม่และไม่ได้แตะ API

- การล็อกด้วย `required_level` ของเดิมยังอยู่ครบ ทำงานคู่กัน ไม่ได้แทนที่กัน
- บทที่ล็อกเพราะลำดับจะขึ้นป้าย "ต้องเรียนบทก่อนให้จบ" และ tooltip ระบุชื่อบทที่ต้องเรียนก่อน
- ปุ่ม "เรียนต่อ" ที่เลือกบทถัดไปให้อัตโนมัติไม่ต้องแก้ เพราะมันเลือกบทแรกที่ยังไม่จบอยู่แล้ว
  ซึ่งตรงกับบทที่เพิ่งปลดล็อกพอดี

**สิ่งที่ยังไม่ได้ทำ และเป็นของเจ้าของไฟล์จะตัดสิน:** พิมพ์ `/lesson/3` ตรงๆ ยังเข้าได้
การกันที่ระดับ route ต้องให้หน้า `/lesson` รู้ความคืบหน้าของทั้งหมวดก่อนตัดสิน
ซึ่งตอนนี้มันยังไม่ได้โหลดข้อมูลนั้น ไม่กระทบความถูกต้องของรางวัลเพราะแบบฝึกหัด
ยังตรวจที่ server เหมือนเดิม

### `client/src/pages/ExercisePage.jsx` — ลดขนาด UI

**ที่ผู้ใช้สั่ง:** "ปรับ UI หน้า exercise ให้ไม่แออัดเหมือน debug และ challenge"

**ที่แก้:** ปรับเฉพาะขนาดและระยะห่าง (คลาส Tailwind) ให้เท่ากับที่หน้า challenge/debug
ใช้อยู่แล้ว **ไม่ได้แตะตรรกะ การรันโค้ด การส่งคำตอบ หรือ state ใดๆ**

คอลัมน์ซ้าย 300-320px → 248-276px · หัวข้อโจทย์ 30-32px → 18-20px ·
คำอธิบาย 16-18px → 13px · ปุ่มแถบล่าง 14px → 12px ·
กล่องความคืบหน้ากับกล่องรางวัลรวมเป็นแถวเดียว

---

## 2026-08-26 (รอบสอง) — สถานะการเรียน และการปลดล็อกที่กลายเป็นทางตัน

ผู้ใช้เล่นจริงแล้วรายงานว่า **"สถานะการเรียนไม่แสดงว่ากำลังเรียนอยู่ ทั้งที่ทำโจทย์ไปแล้ว"**
ตามไปดูแล้วเจอว่าเป็นอาการปลายทางของปัญหาที่ใหญ่กว่านั้น

### ต้นเหตุ: `pre_quiz_completed` / `post_quiz_completed` ไม่เคยมีอยู่จริง

`LearningPage.jsx` อ่านสองฟิลด์นี้จากข้อมูลบทเรียน แต่ `GET /api/course-content`
**ไม่เคยส่งฟิลด์นี้มาเลยสักครั้ง** ส่งมาแค่ `completed_count` / `total_count`
ผลคือทุกบทขึ้นป้าย "ยังไม่เริ่ม" ตลอดไป ไม่ว่าผู้เรียนจะทำอะไรไปแล้วก็ตาม

และเมื่อรอบที่แล้วเอาฟิลด์เดียวกันนี้ไปใช้เป็นเงื่อนไขปลดล็อกบทถัดไป (ตามที่ผู้ใช้สั่ง)
มันจึงกลายเป็น **ทางตัน**: บทที่ 2 เป็นต้นไปจะไม่มีวันเปิด ไม่มี error ที่ไหนเลย
หน้าเว็บดูปกติทุกอย่าง — ขออภัยด้วย รอบนั้นตรวจจากโค้ดฝั่งหน้าจอเพียงอย่างเดียว
โดยไม่ได้ยิง API ดูว่าฟิลด์ที่โค้ดอ่านอยู่นั้นมีจริงหรือไม่

### ที่แก้

**`server/lessonProgress.js` (ไฟล์ใหม่)** — นิยามเดียวของ "เรียนถึงไหนแล้ว" ของทั้ง server
เดิมมีสามชุดที่ไม่ตรงกัน (ตัวนับความสำเร็จ, หน้าโปรไฟล์, และป้ายในหน้าบทเรียน)

**`server/server.js`** — `GET /api/course-content` ส่ง `status`, `is_started`,
`is_completed`, `opens_next`, `pre_quiz_completed`, `post_quiz_completed`,
`has_post_quiz`, `percent` เพิ่ม (ของเดิมทุกฟิลด์ยังอยู่ครบ ชื่อเดิม ความหมายเดิม)
`GET /api/profile/:userId` กับตัวนับความสำเร็จเปลี่ยนมาเรียกโมดูลเดียวกัน
ผลลัพธ์เท่าเดิมทุกค่า ยกเว้นบทที่ไม่มีแบบทดสอบท้ายบท ซึ่งเดิมนับ % จากขั้นตอนที่ไม่มีอยู่จริง

**`client/src/pages/LearningPage.jsx`** — ป้ายสถานะอ่าน `is_started` / `is_completed`
แทนฟิลด์ที่ไม่มีจริง และการปลดล็อกใช้ `opens_next`

### เกณฑ์ที่ใช้ และเหตุผล

- **"กำลังเรียน"** = แตะบทนี้แล้วอย่างใดอย่างหนึ่ง — ทำแบบทดสอบก่อน/หลังเรียน
  หรือส่งคำตอบแบบฝึกหัดแล้ว **แม้จะยังไม่ผ่าน** (ลองแล้วผิดก็คือการเรียน)
- **"เรียนเสร็จสิ้น"** = ผ่านแบบทดสอบท้ายบท **และ** ทำแบบฝึกหัดผ่านครบทุกข้อ
  (เหมือนเดิม ตรงกับหน้าโปรไฟล์และเงื่อนไขความสำเร็จ)
- **เปิดบทถัดไป** = ผ่านแบบทดสอบท้ายบท **เท่านั้น** ไม่ต้องรอแบบฝึกหัดครบ
  จงใจให้เบากว่า "เรียนเสร็จสิ้น" เพราะคนที่ติดแบบฝึกหัดข้อเดียวไม่ควรถูกล็อกทั้งหลักสูตร
- **บทที่ไม่มีแบบทดสอบท้ายบท** (บทที่ 6 และทั้งบทที่ 8-9 รวม 5 บท) ใช้แบบฝึกหัดครบแทน
  ข้อนี้คือสิ่งที่กันไม่ให้เกิดทางตันซ้ำอีก

### ทดสอบ

`npm run test:lessons` (ใหม่ 18 เคส) ครอบคลุมทุกเกณฑ์ข้างบน รวมเคสทางตันโดยเฉพาะ
และทดสอบบนหน้าจอจริงด้วยสองบัญชี — บัญชีที่ผ่านแบบทดสอบท้ายบทที่ 1 แล้วเห็นบทที่ 2 เปิด
กับบัญชีที่ทำแบบฝึกหัดไป 1 ข้อแล้วเห็น "กำลังเรียน" โดยบทที่ 2 ยังล็อกอยู่

---

## 2026-08-26 — ปุ่มซื้อในร้านค้ามองไม่เห็น

ไฟล์ที่แก้: `client/src/index.css` (ไฟล์กลาง) และ `client/src/pages/ShopPage.jsx`

ผู้ใช้แจ้งว่า "ปุ่มซื้อของในร้านค้าล่องหน" พร้อมภาพหน้าจอที่เห็นแต่ราคา ไม่มีปุ่ม

### สาเหตุจริงอยู่ที่ CSS ไม่ใช่ที่หน้าร้านค้า

คลาส `.python-gradient` และ `.whisper-shadow` **ไม่เคยถูกประกาศไว้ในไฟล์ CSS ไหนเลย**
ทั้งที่ถูกใช้อยู่ 14 จุดใน 6 หน้า และ 8 ไฟล์ตามลำดับ Tailwind ปล่อยคลาสที่ไม่รู้จักผ่านไป
เฉยๆ ไม่เตือน จึงไม่มีอะไรรายงานเรื่องนี้เลย

ผลคือปุ่มที่ใช้ `python-gradient` คู่กับ `text-white` กลายเป็น **ตัวอักษรขาวบนพื้นขาว**
ไม่ใช่แค่ในร้านค้า แต่รวมถึงปุ่มเข้าสู่ระบบใน `Login.jsx` และปุ่มบันทึกใน `ProfilePage.jsx`
ทั้งสามจุดกดได้อยู่ตลอด เพียงแต่มองไม่เห็น

ประกาศทั้งสองคลาสไว้ใน `@layer components` ของ `index.css` โดยใช้สี
`pysim.primary` / `pysim.primary-container` จาก `tailwind.config.js`
เพื่อให้กลืนกับปุ่มที่มองเห็นได้อยู่แล้ว

### ปุ่มซื้อรายชิ้นก็ซ่อนอยู่ แต่คนละสาเหตุ

ปุ่มซื้อของการ์ดสินค้าถูกตั้งเป็น `hidden` จนกว่าเมาส์จะชี้ที่การ์ด และซ้อนทับกันสามชั้น
ด้วย `absolute inset-0` — ป้าย "มีแล้ว" จึงถูกปุ่ม "สวมใส่" บังไว้ตลอด ไม่เคยแสดงเลย

เปลี่ยนเป็นแถวเดียว ราคาอยู่ซ้าย ปุ่มอยู่ขวา **แสดงตลอดเวลา** เหตุผลคือกลุ่มผู้ใช้จริง
คือคนที่ไม่เคยเขียนโปรแกรม และบนจอสัมผัสไม่มี hover ให้ใช้ ปุ่มซื้อที่ต้องเอาเมาส์ไปชี้ก่อน
จึงจะรู้ว่ามีอยู่ ไม่ใช่ทางเลือกที่ใช้ได้ พร้อมกันนั้นลบป้าย "มีแล้ว" ที่เป็นโค้ดตายออก
และตัด state `hoveredItemId` ที่ไม่มีที่ใช้แล้วทิ้ง

### ที่จงใจไม่แตะ

ปุ่ม "ถอดออก" ตรรกะการซื้อ การสวมใส่ และการเรียก API ทั้งหมด ไม่ได้เปลี่ยนแม้แต่จุดเดียว
งานนี้เป็นเรื่องการมองเห็นล้วนๆ

### ทดสอบ

วัดค่า computed style บน dev server จริงที่ `:5174` — ปุ่ม "ซื้อยกเซ็ต" เดิมได้
`background-image: none` บนพื้นขาว ตอนนี้ได้ `linear-gradient(135deg, rgb(20,93,145), rgb(55,118,171))`
คู่กับตัวอักษรสีขาว · ปุ่มซื้อรายชิ้นได้ `display: flex` โดยไม่ต้อง hover (เดิมเป็น `hidden`)
· `npm run lint` เท่าเดิมที่ 57 errors / 9 warnings · `npm run build` ผ่าน

---

## เวลาจะเพิ่มรายการใหม่

เขียนต่อท้ายด้วยหัวข้อวันที่และเลข commit ระบุว่าผู้ใช้สั่งอะไรมา แก้อะไรจริง
และอะไรที่จงใจไม่แตะ
