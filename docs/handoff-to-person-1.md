# ไฟล์ของ Person 1 ที่ Person 3 เข้าไปแก้

## 2026-10-15 — แบบทดสอบเลื่อนขั้น: เพิ่ม route ฝั่ง server ที่ไม่เคยมี

`PromotionExamPage.jsx` เรียก `GET /api/learning/promotion-exam` และ `POST .../submit` มาตลอด
แต่ **ไม่เคยมี route นี้ใน server ของ repo** (ไม่ได้หายตอน merge — log รวมโปรเจค 2026-08-25
บันทึกไว้แล้วว่าขาด; โค้ดเดิมมีแค่ใน working copy เก่า เห็นร่องรอยใน error log ของ `fd94742`)
ผลคือหน้านี้ 404 และแสดง 0/0 ข้อ

- ใหม่ `server/promotionExamRoutes.js` mount ใน `server.js` ถัดจาก lesson router
- คลังข้อสอบแบบคงที่อยู่ในไฟล์นั้น: Beginner→Intermediate 10 ข้อ ผ่าน 7 · Intermediate→Advanced 12 ข้อ
  ผ่าน 9 (ตาม `project_discription.txt` ข้อ 13) — **เติม/แก้ข้อสอบได้ที่ `PROMOTION_STAGES`
  แล้วเพิ่ม `version`** เพื่อให้ข้อสอบที่เปิดค้างไว้ก่อนแก้ถูกปฏิเสธ แทนที่จะตรวจกับเฉลยใหม่
- เฉลยไม่ถูกส่งไป browser · server ตรวจเอง · ผ่านแล้ว server ตั้ง `users.level` เอง
  (UPDATE แบบมีเงื่อนไข level เดิม กันส่งซ้ำพร้อมกัน) · ผู้กระทำคือ `req.player` เสมอ
- ด่านคำนวณจาก `normalizePlayerLevel()` ตัวเดียวกับที่ระบบใช้: level 1 สอบขึ้น 2, level 2 สอบขึ้น 3,
  level 3+ ได้ 409 "อยู่ระดับสูงสุดแล้ว"; XP ไม่ถูกแตะ
- `PromotionExamPage.jsx` แก้ 3 จุด: แสดงข้อความ error จาก server ตอนโหลด, ซ่อนบรรทัด
  "ต้องผ่านอย่างน้อย 0 / 0" เมื่อไม่มีข้อสอบ, ข้อความโหลดไม่อ้าง "จาก AI" แล้ว

**ต้องตัดสินใจต่อ (ของ Person 1):**
1. ตอนนี้ข้อสอบเป็นทาง "สอบข้ามขั้น" ไม่ได้เป็นด่านกั้น — XP ยังเลื่อนเลเวลเองตามเดิม
   ถ้าต้องการ "cap จนกว่าจะสอบผ่าน" ตามสเปก ต้องแก้ `applyXpRewardToUser()` และเพิ่มสถานะ
   ผ่านด่านลงฐาน (ต้องทำผ่าน migration ใหม่)
2. server ยังไม่ส่ง `progression.promotionExamEligible` ให้ client → แบนเนอร์ใน `LearningPage.jsx`
   ไม่เคยขึ้น หน้าเข้าได้ทาง URL ตรงเท่านั้น
3. สอบซ้ำได้ไม่จำกัดและเห็นคะแนนรวม จึงไล่เดาได้ — ถ้าต้องการคูลดาวน์ต้องมีตารางเก็บประวัติสอบ

## 2026-10-02 — หน้าแอดมินเพิ่มของตกแต่ง (งาน Person 2 ตามคำขอผู้ใช้)

- เพิ่ม `server/themeRoutes.js` และเชื่อม `ThemePage.jsx` กับ `shop_items` เดิมทั้งสี่หมวด แก้ Cannot POST /api/themes
- เพิ่ม token จาก login ปกติ/Google สำหรับ API จัดการของตกแต่ง ตรวจ role ปัจจุบันในฐานข้อมูลซ้ำ ผู้ใช้ต้องล็อกอินใหม่หลังรีสตาร์ต
- การแก้รายการคง item_id, set_key, rarity และความเป็นเจ้าของเดิม ใช้ปิดแสดงในร้านค้าแทนปุ่มลบที่ไม่มี API
- แก้ seed ของชุดธีมให้เพิ่มเฉพาะชิ้นที่ไม่มี เพื่อไม่ทับรูป/ราคา/สถานะที่แอดมินหรือเพื่อนแก้ไว้
- `npm run test:themes`: 46 checks ผ่าน โดยใช้ PostgreSQL TEMP tables แยกจากข้อมูลจริง
- ทดสอบ browser เพิ่มธีม/เอฟเฟกต์ รีเฟรช และ viewport 390×844 / 1280×900; build และ lint เฉพาะ ThemePage ผ่าน
- หลังรีสตาร์ต API ตรวจ checksum ของ shop_items 24 รายการและ shop_sets 4 เซ็ตตรงกับก่อนรีสตาร์ต และบัญชีแอดมินจริง GET API ทั้งสี่หมวดได้ 200
- Upload ยังใช้ /api/upload และไฟล์บน server ตามเดิม งานนี้ไม่ได้เปลี่ยนเป็น Supabase Storage หรือเพิ่ม UI จัดชุด shop_sets

`CLAUDE.md` กำหนดให้แต่ละคนแก้เฉพาะไฟล์ในขอบเขตของตัวเอง และถ้าจำเป็นต้องข้ามเขต
ให้แจ้งก่อน หน้านี้คือที่รวมรายการนั้น เพื่อให้เจ้าของไฟล์รู้ตัวก่อน merge
ไม่ใช่มาเจอเอาตอนที่โค้ดของตัวเองเปลี่ยนไปแล้ว

**ทุกรายการในนี้เป็นงานที่ผู้ใช้สั่งโดยตรง** ไม่ใช่การเข้าไปแก้เอง
ถ้าเจ้าของไฟล์ไม่เห็นด้วยกับวิธีที่ทำ ให้คุยกันได้ — งานที่ต้องได้ผลคือพฤติกรรมที่อธิบายไว้
ไม่ใช่โค้ดชุดนี้โดยเฉพาะ







---

## 2026-08-27 — เฟส A (1d เสร็จ): CodingWorkspace รันใน worker แล้ว

ไฟล์: `client/src/components/learning/CodingWorkspace.jsx` (ของ Person 1, ใช้โดย AiTaskPage
ที่ `/debug` และ `/challenge`)

เดิมโหลด Pyodide เอง (main thread) `handleRun` (interactive) + `handleRunTests` (ตรวจทีละ
test case) ลูปค้าง = แท็บค้าง ตอนนี้ทั้งคู่รันผ่าน `usePyodide` (worker)

- ลบ `ensurePyodideLoader`/constants/`window.requestInputFromJS` ทิ้ง
- `handleRun` → `runCode(code, [], {interactive, onInput, onStdout, onStderr})`
- `handleRunTests` → รันแต่ละ test case ใน worker แบบ non-interactive (StringIO + print กลับเพื่อจับ
  stdout) — **ไม่แตะตรรกะการตรวจ** ยังใช้ `actual.includes(expected)` เดิม (แค่เปิดปุ่ม Submit
  ฝั่ง client เท่านั้น การตัดสินจริงยังอยู่ที่ server ผ่าน onSubmitTask)
- ถ้าโค้ดใน test ลูปค้าง จะถูก interrupt แล้วหยุด loop ไม่ freeze

### ทดสอบแล้ว (E2E บนหน้า /debug จริง, ล็อกอิน test1)
- Run + `input("เลข:")` → พิมพ์ "21" → terminal: `เลข: 21` / `42`
- Run + `while True` → พิมพ์ `start` แล้วถูกหยุด ~10 วิ ด้วยข้อความไทย **แท็บไม่ค้าง**
- Run Tests → รันครบ แสดง `FAIL Test Case 1 / Expected / Got` (เส้นตรวจทำงานผ่าน worker)
- `npm run build` ผ่าน, `npm run lint` 56/9 (ไม่มี error ใหม่; prop `user` ที่ไม่ได้ใช้เป็นของเดิม)

**สรุป 1d เสร็จครบ 3 หน้า** — ExercisePage, MiNi_Game, CodingWorkspace ย้ายเข้า worker แล้ว
รวมกับ LessonPage playground + Arcade trial ที่อยู่บน worker อยู่แล้ว → โค้ด Python ฝั่ง client
ทุกจุดกันลูปค้างได้หมด (เฟส A ข้อ 1 เสร็จสมบูรณ์)

---

## 2026-08-27 — เฟส A (1d): MiNi_Game รันใน worker แล้ว

ไฟล์: `client/src/pages/MiNi_Game.jsx` (ของ Person 1)

เดิม MiNi_Game โหลด Pyodide เอง (singleton `_pyodideInstance` บน main thread) มี 3 เส้นรัน
(`runCodeInTerminal`, `runCodeInStory`, `runCodeForCheck`) ลูปค้าง = แท็บค้าง ตอนนี้ทั้งหมดรันผ่าน
`usePyodide` (worker) — ลูปถูก interrupt แทน

- ลบ `getPyodideInstance`/singleton/`window.miniGameRequestInputFromJS`/`buildAsyncPythonBody` ทิ้ง
- 2 เส้น interactive (terminal/story) → `runCode(code, files, {interactive, onInput, onStdout, onStderr})`
  โดย `onStdout` เดินสายเดิม: สะสม `runOutputRef`, สตรีมเข้ากล่อง story dialogue, echo ลง terminal
- `runCodeForCheck` (ตรวจคำตอบ) → รันใน worker แบบ non-interactive ป้อน input ผ่าน StringIO
  แล้ว print กลับเพื่อจับ stdout — **ไม่แตะตรรกะการตรวจ** (ยังเทียบเหมือนเดิม)
- input() โต้ตอบใช้ bridge เดิมย้ายเข้า worker; watchdog พักระหว่างรอ input

### ทดสอบแล้ว (E2E บนหน้า MiNi_Game จริง, ล็อกอิน test1)
- `input("ชื่อ:")` → พิมพ์ "Mini" → terminal: `ชื่อ: Mini` / `สวัสดี Mini` / `--- Program finished ---`
- `while True` → พิมพ์ `start` แล้วถูกหยุดที่ ~10 วิ ด้วยข้อความไทย **แท็บไม่ค้าง**
- `npm run build` ผ่าน, `npm run lint` 56/9 (น้อยกว่า baseline 1 เพราะลบโค้ดตาย ไม่มี error ใหม่)

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

## 2026-10-02 — แยกหน้าจัดการบทเรียน (ยังไม่ commit)

ผู้ใช้ขอแยกข้อมูลบทเรียน, สไลด์สอน, Pre-test และ Post-test ให้เพิ่มแต่ละส่วนได้คนละหน้า

- `client/src/admin/pages/AddLesson.jsx`: หน้าแยกตาม route พร้อมเลือกบทเรียน บันทึกเฉพาะส่วน เก็บร่างใน sessionStorage แยกผู้ใช้/บทเรียน/หน้า และแจ้งผลบันทึกจริง
- `client/src/App.jsx`, `client/src/admin/components/AdminNavbar.jsx`: รองรับ `/admin/add-lesson/*`, เมนู active ของหน้าย่อย และซ่อน navbar ผู้เรียนเฉพาะหน้านี้เพื่อไม่ให้ซ้อนกัน
- `server/lessonAdminRoutes.js`, `server/server.js`: เพิ่ม `/api/admin/lessons` ใช้ signed admin token และตรวจ role ปัจจุบัน สร้าง lesson ภายใต้ module เดิม และเพิ่ม slides/pre/post ต่อท้ายใน transaction
- ใช้ schema เดิมทั้ง 6 ตาราง ไม่แก้ข้อมูลเดิม ไม่ลบ quiz attempts ไม่แตะตัวตรวจคำตอบหรือรางวัล; correct_answer แบบปรนัยเก็บข้อความตัวเลือกตามรูปแบบที่ LessonPage ใช้อยู่
- ระดับบทเรียนใหม่สืบทอด required_level จาก module; ลำดับซ้ำใน module ถูกปฏิเสธ ข้อมูลสไลด์ใหม่เก็บคำอธิบายใน slide_content ตามหน้าเรียนเดิม
- ปัจจุบันรองรับเพิ่มข้อมูล ยังไม่ใช่หน้าแก้ไข/ลบเนื้อหาเดิม; เนื้อหาที่บันทึกจะอยู่ในหลักสูตรทันทีตามระบบเดิม ไม่มีขั้นเผยแพร่

ตรวจแล้ว: API 30 checks ด้วย PostgreSQL TEMP tables (ข้อมูล public และแถวเดิมในสำเนาตรงเดิม), theme regression 46 checks, production build และ lint ของ AddLesson ผ่าน; ทดสอบเบราว์เซอร์สร้างบทเรียน/สไลด์/pre/post ทั้ง fill และ choice, เปลี่ยนหน้า/refresh ยังมีร่าง, refresh หลังบันทึกมี counts ถูกต้อง, จอ 390x844 และ 1280x900
ข้อจำกัดชุดตรวจเดิม: npm test ไม่มี script ทั้ง client/server; lint ทั้ง client ยังมี 53 errors/9 warnings เดิมนอก AddLesson

## 2026-10-02 — หน้าสรุปความคืบหน้าผู้เรียนรายบุคคล (ยังไม่ commit)

ผู้ใช้ขอเพิ่มหน้าในแอดมินให้ติดตามผลเรียนรายคน จึงเพิ่ม `/admin/student-progress` และเมนูความคืบหน้าผู้เรียน พร้อมเมนูแอดมินแบบ select สำหรับจอแคบ

- Frontend: `StudentProgressPage.jsx`, `AdminNavbar.jsx`, route ใน `App.jsx`; ค้นหาชื่อ/อีเมล แบ่งหน้า เลือกรายคน ตัวชี้วัดความคืบหน้า คะแนนก่อน/หลัง พัฒนาการเฉพาะคู่บทเรียนเดียวกัน กราฟตามหมวด กรองบทเรียน/สถานะ และเวลา activity ล่าสุดที่บันทึก
- Backend: `studentProgressRoutes.js` และ mount ใน `server.js`; API GET `/api/admin/student-progress` และ `/:id` ตรวจ signed admin token + role/ban/deleted ปัจจุบันทุกครั้ง, no-store, เลือกเฉพาะคอลัมน์จำเป็น ไม่ส่ง password hash/reset token/answers/code
- ใช้ `evaluateLesson` เดิมเพื่อตัดสินผ่าน; บทที่ไม่มี post-test และไม่มีแบบฝึกหัดแยกเป็น `no_criteria` ไม่รวมตัวหาร เพื่อไม่อ้างว่าผู้เรียนใหม่ผ่านเนื้อหาว่างแล้ว
- คะแนนใช้ผลล่าสุดที่ระบบเก็บ ไม่ใช่ประวัติสอบทั้งหมด; คะแนนที่ยังไม่มีเป็น null ไม่ใช่ 0; การเปลี่ยนแปลงคะแนนใช้คู่ของบทเรียนเดียวกันเท่านั้น; แบบฝึกหัดนับ DISTINCT exercise_id ที่เคยผ่าน
- ไม่เปลี่ยน schema หรือเขียนข้อมูลผู้เรียนจริง ไม่เปลี่ยนระบบให้คะแนน/รางวัล และไม่ได้แก้เกณฑ์คำนวณของ dashboard เก่า

ทดสอบ: report API 30 checks ด้วย TEMP fixture (สิทธิ์, ค้นหา, pagination, invalid/missing IDs, zero-data learner, scores, duplicate submissions, paired gains, revoked access, DB failure), lesson progress 19 checks, lesson-admin regression 30 checks; production build ผ่าน; lint หน้าใหม่และ navbar ผ่าน แต่ lint ทั้ง repo ยังมี 52 errors/9 warnings เดิม; npm test ไม่มี script
Browser: desktop 1440x1000/mobile 390x844 เลือกรายคน, filter post-test ไม่ผ่าน, ค้นหาอีเมล/ไม่พบผล, สลับคน, refresh/direct URL, สลับเมนูแอดมินบนมือถือ และตรวจไม่มี overflow นอกตาราง

## 2026-10-03 — นำกิจกรรมล่าสุดออกจากแดชบอร์ด (ยังไม่ commit)
ผู้ใช้ขอเอาการ์ดกิจกรรมล่าสุดตามภาพออก แก้เฉพาะ Dashboard.jsx: ลบ section, state, fetch recent-activities และ metadata/imports ที่ไม่ใช้ ปรับคำอธิบายหน้า ไม่แก้ข้อมูลหรือ API ฝั่ง server
Build ผ่าน; lint ไม่มี errors มี warning onlineUsers เดิม 1 รายการ; npm test ไม่มี script; browser mock preview ตรวจ desktop, refresh และมือถือว่าหัวข้อกิจกรรมล่าสุดไม่มีแล้ว

## 2026-10-03 — ปรับโทนสีแอดมินให้ตรงกับเว็บ (ยังไม่ commit)
ใช้ชุดสี PySim ที่มีอยู่ใน tailwind.config.js กับหน้าจัดการทั้ง 7 หน้าและ AdminNavbar: น้ำเงิน #145D91/#3776AB พื้นเทาอ่อน การ์ดขาว และเงา whisper-shadow; เก็บสีสถานะและเหรียญอันดับตามความหมายเดิม ฟอร์มบทเรียนทั้งสี่ส่วนใช้หัวแถบ python-gradient แบบเดียวกัน

App.jsx ซ่อนเมนูผู้เรียนในทุก /admin/ route และใช้พื้นหลังแอดมินเดียวกัน แก้เมนูซ้อน/ระยะด้านบนซ้ำ งานนี้ไม่แก้ API หรือฐานข้อมูล และไม่เปลี่ยนสีเอฟเฟกต์/รูปธีมที่บันทึกไว้

Build ผ่าน; ตรวจเบราว์เซอร์ด้วยข้อมูลจำลองครบทุกหน้า รวม modal เอฟเฟกต์ รายงานผู้เรียน รีเฟรช และจอมือถือ 390x844; ไม่พบ console error; lint เทียบก่อนแก้มีปัญหาเดิม 4 errors/2 warnings ไม่มีเพิ่ม; npm test ไม่มี script รายละเอียดใน project_logs/2026-10-03/0418-admin-pysim-colors.md

## 2026-10-03 — เชื่อมการเพิ่มบทเรียนจากแอดมินถึงผู้เรียน
AddLesson มีรายการบทเรียนพร้อมจำนวนเนื้อหาและลิงก์เพิ่มแต่ละส่วน บันทึกลงตารางเดิมและแจ้งว่าแสดงฝั่งผู้เรียนแล้ว Pre-test เพิ่มได้ทั้งเติมคำและปรนัยเหมือน Post-test

ย้าย GET course-content/slides/quizzes จาก server.js ไป lessonContentRoutes.js เพื่อใช้ router เดียวกันในการทดสอบ เพิ่ม GET /api/lessons/:lessonId สำหรับรายละเอียดหลังรีเฟรช LearningPage เลิกตัดหมวดตามชื่อซ้ำ/รวมหมวดตามจำนวนตายตัวและโหลดรายการใหม่เมื่อกลับมาที่แท็บ LessonPage แสดงชื่อ คำอธิบาย และวิดีโอจากข้อมูลที่แอดมินบันทึก พร้อม normalize URL สื่อและยกเลิก request เก่า

คงเกณฑ์ปลดล็อกเลเวล/ลำดับและการวัดผลเดิม ไม่เปลี่ยนข้อมูลจริง ทดสอบ API 46 checks + progress 19 checks ผ่าน; build และ lint ไฟล์ที่แก้ผ่าน Browser ทดสอบเพิ่มจริงใน TEMP tables แล้วเข้าสู่ฝั่งผู้เรียน ทำ Pre-test → สไลด์ → Post-test ครบ รวม refresh และมือถือ การบันทึกผลสอบใน preview ใช้ fixture ไม่เรียก reward จริง รายละเอียดใน project_logs/2026-10-03/0500-admin-lesson-publishing.md

เซิร์ฟเวอร์เก่าที่เปิดค้างต้อง restart เพื่อโหลด router ใหม่ และเข้าสู่ระบบแอดมินใหม่หลัง restart


## 2026-10-03: Merge admin work with main
Combined main navigation and mode styling with admin lesson publishing and tutorial hooks in App.jsx/LearningPage.jsx. Build and 19 lesson-progress tests pass. Database integration test is blocked by SSL configuration; full lint still reports errors. See project_logs/2026-10-03/merge-admin-with-main.md.


## 2026-10-03: Dashboard progress threshold
Fixed undefined LESSON_PASS_PERCENT using POST_PASS_RATIO * 100. Read-only route validation returns 6 students and 24 lessons. No database changes; restart server to load fix.

## 2026-10-15 — แบบวัดระดับตอนสมัครตรวจบน server, ลบ `/api/user/update-level`
ปิดช่องที่ผู้เล่นยิง `POST /api/user/update-level` `{user_id: <ตัวเอง>, level: 10}` เพื่อปลดล็อก Competitive/Arcade ได้ และ `GET /api/advanced-validation` ที่ส่ง `correct_answer` ไปเบราว์เซอร์
- **ลบ** route เดิมสามตัวใน `server.js` ย้ายไป `server/placementRoutes.js` (แบบเดียวกับ `promotionExamRoutes.js`): GET ไม่มีเฉลย, `POST /api/assessment/submit` รับ `{option_id, answers: {question_id: choice}}` ตรวจบน server เลเวลอ่านจาก `survey_options.level_value`, `POST /api/assessment/beginner` สำหรับ "ยังไม่เคยเลย" (0 → 1)
- ทั้งสองทางใช้ได้เฉพาะบัญชีเลเวล 0 (ขั้นตอนสมัคร) — หลังจากนั้นเลเวลขึ้นผ่านบทเรียนและแบบทดสอบเลื่อนขั้นเท่านั้น
- `FriendLogin.jsx` เลิกตรวจคำตอบเอง ส่งคำตอบแล้วใช้เลเวลที่ server ตอบกลับ
- เทส `server/tests/placement.test.js` อยู่ใน `pretest`; ถ้าจะเพิ่มทางให้ตั้งเลเวลอีก ให้ทำฝั่ง server เท่านั้น ห้ามรับเลเวล/คะแนนจาก client
ยังไม่ได้ลองสมัครจริงผ่านเบราว์เซอร์ รายละเอียดใน project_logs/2026-10-15/1410-placement-level-lockdown.md

## 2026-10-15 — ปุ่ม "ย้อนกลับเลือกระดับใหม่" พากลับไปผิดข้อ
`goBackToExperience` ใน `FriendLogin.jsx` หาคำถามประสบการณ์ด้วย `s.id === 3` แต่ข้อ 3 คือคำถามเวลาเรียน (ประสบการณ์คือ id 4, key `experience`) ผู้ใช้ที่สอบวัดระดับไม่ผ่านหรือกด "✕ ออกจากการทดสอบ" จึงถูกพาไปข้อ 3 แทนข้อ 4 — มีมาตั้งแต่ `fd94742`
- แก้เป็น `s.key === "experience"` แบบเดียวกับ `handleSelectSurvey` บรรทัดเดียว ไม่แตะ server/schema
- ทดสอบในเบราว์เซอร์แล้ว (ทั้งปุ่มบนหน้าไม่ผ่าน และ ✕) รายละเอียดใน project_logs/2026-10-15/1428-placement-back-to-experience.md

## 2026-10-16 — Google login ย้ายไป Supabase Auth (แตะ `FriendLogin.jsx`, `session.js`, `main.jsx`, `index.html`)
- ปุ่ม Google เรียก `startGoogleSignIn()` ซึ่งเป็น redirect เต็มหน้าไปยัง Google provider ของ Supabase ไม่ใช้ Google Identity Services แล้ว จึงเอา script GIS ออกจาก `index.html`
- กลับมาที่ `/login?auth=google` แล้ว `completeOAuthSignIn()` เรียก `POST /api/auth/oauth/complete` เพื่อผูกกับบัญชีผู้เล่น จากนั้นใช้ flow เดิม (เลเวล 0 ไปทำแบบสำรวจ)
- `restoreOAuthReturn()` ใน `main.jsx` นำ `returnTo` กลับเข้า URL ก่อน router อ่าน เพราะ URL ที่กลับมาต้องตรงกับ allowlist ของ Supabase แบบ exact
- ลบ `acceptGoogleSession` และ `VITE_GOOGLE_CLIENT_ID` แล้ว เหตุผลอยู่ใน `docs/adr/0004-google-sign-in-through-supabase-auth.md`

## 2026-10-16 — เอาปุ่ม "อัปโหลดรูป" ออกจาก `ProfilePage.jsx`
ผู้เล่นอัปโหลดรูปโปรไฟล์เองไม่ได้แล้ว เพราะโฮสต์ฟรีไม่มีดิสก์ถาวร (Spec 0003 ticket 5) ตัวเลือกรูปเดิม (ค่าเริ่มต้น / Google / ร้านค้า) ยังทำงานเหมือนเดิม และ server ตอบ 410 ถ้ามีคนเรียก route อัปโหลดเดิม

## 2026-10-16 — รูปจาก Google สำหรับบัญชีที่ผูกไว้แล้ว (แตะ `App.jsx`, `ProfilePage.jsx`, `LeaderboardPage.jsx`, `ModeEntryHeader.jsx`)
- route `/login` ไม่ redirect ระหว่างกลับจาก Google (`leavesLoginPage()` ใน `client/src/auth/route-access.js`) เพื่อให้ `FriendLogin` เรียก `completeOAuthSignIn()` ได้ทุกครั้ง ไม่ใช่แค่ครั้งแรกที่ผูกบัญชี
- `<img>` รูปโปรไฟล์ทุกจุดใส่ `referrerPolicy="no-referrer"` — โฮสต์รูปของ Google (`lh3.googleusercontent.com`) ปฏิเสธคำขอที่มี Referer รูปจึงขึ้นเป็นรูปเสีย ถ้าเพิ่มจุดแสดงรูปโปรไฟล์ใหม่ให้ใส่ด้วย
- รายละเอียดใน project_logs/2026-10-16/2104-google-picture-for-bound-players.md

## 2026-10-20 — บทแนะนำผู้ใช้ใหม่ (Lumi) แตะ `ModeEntryHeader.jsx`, `App.jsx` และ `CompetitiveArena.jsx` ของ Person 2

- `ModeEntryHeader.jsx` เพิ่ม `data-tour="..."` ที่แบรนด์, แท็บโหมดทั้ง 3, เหรียญ, ภาษา, ร้านค้า, อันดับ และโปรไฟล์
  - เพิ่มปุ่ม `?` (`data-tour="tour-help"`) ท้ายแถบ กดแล้วเปิดบทแนะนำของหน้าที่อยู่
- `App.jsx` วาง `<TourHost tourId="app-overview">` ใต้ header
  - เปิดเองครั้งแรกที่เข้า `/learn` หลังทำแบบสำรวจเสร็จ
- `CompetitiveArena.jsx` (Person 2): ใส่ `data-tour` แค่ 5 จุด (`competitive-intro`, `-scoring`, `-post`, `-card`, `-mailbox`) และวาง `<TourHost tourId="competitive-feed">`
  - ไม่ได้แก้ logic ใดๆ
- ระบบใหม่: `components/tour/GuidedTour.jsx` (สปอตไลต์), `TourHost.jsx`, `data/appTour.js` (เนื้อหา), `utils/tourLayout.js`
- server จำไว้ใน `users.tutorials_seen` (migration ใหม่ `202610200001`) ผ่าน `POST /api/user/tutorials/:id/seen`

**ถ้าเจ้าของไฟล์ย้ายหรือเปลี่ยนชื่อปุ่ม** ให้ย้าย `data-tour` ตามไปด้วย
- ถ้าหาเป้าไม่เจอ ขั้นนั้นจะถูกข้ามเงียบๆ ไม่ error

**เสนอ (Person 1):** บทสอน 6 ชุดเดิมใน `data/webTutorials.js` (`WebTutorialModal`) ย้ายมาใช้ `GuidedTour` ได้
- เพิ่ม tour ใน `data/appTour.js` แล้ววาง `<TourHost>` ในหน้านั้น จะได้สปอตไลต์ชี้จุดจริง
- ปัจจุบัน modal เดิมยังแสดง selector ดิบ `ส่วนที่แนะนำ: [data-tour=...]` ให้ผู้ใช้เห็นอยู่

---

## 2026-10-22 · Competitive: คะแนนมาจาก rubric และ LLM ในเครื่องให้แค่คำแนะนำ (ไฟล์ของ Person 2)

แก้ `server/server.js` ส่วนตัวตรวจ Competitive ตาม Spec 0004 ticket 03 รายละเอียดเต็มอยู่ที่ [`handoff-to-person-2-competitive-rubric.md`](handoff-to-person-2-competitive-rubric.md)

**สิ่งที่ต้องรู้ก่อน merge:** คำตอบที่ผ่านเทสไม่ครบได้ 0 เหรียญเสมอ ไม่ว่าโมเดลจะตอบหรือล่ม

หน้า `CompetitiveArena.jsx` ไม่ต้องแก้

---

## 2026-10-26 · Spec 0005: สิ่งที่ Person 1 ต้องแก้ และไฟล์ของ Person 1/2 ที่ Person 3 แตะ

ที่มา: user test 2026-10-25 (`project_logs/2026-10-25/2220-user-test-arcade-and-accounts.md`) และ UI audit (`project_logs/2026-10-25/2245-ui-audit-student-pages.md`) แต่ละข้อมีอาการ วิธีทำให้เกิด และข้อเสนอ

### ต้องแก้ (ไฟล์ของ Person 1 — Person 3 ไม่ได้แก้)

1. **XP ที่ต้องใช้ขึ้นเลเวลไม่ตรงกัน (U3)**
   - **อาการ:** บัญชีเลเวล 10 เดียวกัน หน้าบทเรียนบอก "0 / 120 XP" แต่หน้าโปรไฟล์บอก "0 / 1000 XP"
   - **วิธีทำให้เกิด:** ผ่านแบบวัดระดับให้ได้เลเวล 10 แล้วเปิด `/learn` เทียบกับ `/profile`
   - **สาเหตุ:**
     - `getLevelProgress()` ใน `LearningPage.jsx` คำนวณเลเวลเองจาก XP (120 × เลเวล) ไม่ได้ใช้เลเวลจริงของบัญชี
     - `server.js` ส่ง `xp_needed_this_level: 1000` คงที่
   - **เสนอ:** ให้ทั้งสองหน้าอ่านเลเวลและ XP ที่ต้องใช้จาก server ที่เดียว ไม่คำนวณเองที่ client
2. **ผ่านแบบวัดระดับแล้วไม่เห็นคะแนน และยังต้องเริ่มบทที่ 1 (U6)**
   - **อาการ:** หน้าเด้งไป `/learn` ทันที และบทถัดไปยังขึ้น "ต้องเรียนบทก่อนให้จบ" ซึ่งไม่ตรงกับคำโปรย "เริ่มที่บทสูงขึ้น"
   - **เสนอ:** แสดงผลคะแนนก่อนพาไปหน้าบทเรียน และปลดล็อกบทให้ตรงกับเลเวลที่ได้
3. **เมนูย่อยของบทเรียนบนมือถือเป็นไอคอนล้วน (audit P2 ข้อ 5)**
   - **อาการ:** ที่จอเล็กกว่า 640px ลิงก์ `/learn`, `/debug`, `/challenge` ไม่มีข้อความกำกับ และไม่มี `aria-label`
   - **เสนอ:** ใส่ `aria-label` ที่ลิงก์ หรือแสดงข้อความสั้นใต้ไอคอน
4. **ปุ่มบทเรียนที่กดไม่ได้อ่านไม่ออก (audit P2 ข้อ 12)**
   - **อาการ:** "เริ่มโจทย์แบบเนื้อเรื่อง" และ "ไปทำแบบภาคปฏิบัติ" เป็นตัวขาวบน `slate-200` contrast 1.2:1
   - **เสนอ:** ใช้ตัวเข้มบนพื้นอ่อน และบอกว่าต้องทำอะไรก่อนจึงจะกดได้
5. **ช่องกรอกในแบบทดสอบของบทเรียนไม่มี label (audit P2 ข้อ 13)**
   - **อาการ:** ช่อง "พิมพ์คำตอบ..." 2 ช่องมีแค่ placeholder
   - **เสนอ:** ใส่ `<label htmlFor>` หรือ `aria-label` ให้ทั้งสองช่อง
6. **หน้าสอบเลื่อนขั้นที่เลเวลสูงสุด (audit P2 ข้อ 14)**
   - **อาการ:** ขึ้น "0 / 0" และ "คุณอยู่ระดับสูงสุดแล้ว" แต่ยังมีปุ่ม "ส่งตรวจ" และที่ 375px ปุ่มตัดคำเป็น "ส่ง / ตรวจ"
   - **เสนอ:** ซ่อนปุ่มเมื่อไม่มีข้อสอบ
7. **workspace บนมือถือ (audit P2 ข้อ 8)**
   - **อาการ:** ช่อง editor ในหน้าแบบฝึกหัดเหลือพื้นที่น้อย และปุ่ม Lumi ลอยทับมุมล่างขวาของ editor
8. **หัวข้อของหน้า (audit P2 ข้อ 10)**
   - **อาการ:**
     - `/learn` มี `h1` สองตัว ("เริ่มต้นเส้นทางการเรียนรู้" และ "เส้นทางการเรียนรู้ของคุณ")
     - `/lesson/1` ไม่มี `h1`
   - **เสนอ:** ให้แต่ละหน้ามี `h1` ตัวเดียว
9. **Lumi ตอบข้อความสำรองเสมอใน `MiNi_Game.jsx` และ `CodingWorkspace.jsx` (พบ 2026-10-25)**
   - **อาการ:** สองหน้านี้ส่ง `message` แทน `messages` ไป `/api/ai/chat` จึงได้ 500 ทุกครั้ง
   - **เสนอ:** แก้แบบเดียวกับ `ExercisePage.jsx` ที่ส่งถูกแล้ว

### ไฟล์ของคนอื่นที่ Person 3 แตะในรอบนี้ (ตรวจก่อน merge)

- **`LearningPage.jsx`, `LessonPage.jsx` (Person 1):** เปลี่ยน `<main>` เป็น `<div>` เท่านั้น (commit a8018eb)
  - เพราะ `App.jsx` ทำส่วนเนื้อหาของหน้าเป็น `<main>` ตัวเดียวให้ทุกหน้าแล้ว และเอกสารหนึ่งหน้ามี `<main>` ได้ตัวเดียว
- **`CompetitiveArena.jsx` (Person 2):** เปลี่ยน `alert()` จุดเดียวในปุ่มสรุปผลทันทีเป็น `toast()` (commit 02ec8f5) ไม่แตะ logic
- **ระบบกลางใหม่ที่ทุกหน้าใช้ได้:**
  - `components/ui/Dialog.jsx`: popup ที่ถูกต้องเรื่อง focus, Escape และชื่อ
  - `components/ui/toast.js` + `ToastHost`: แทน `alert()` ใช้ `toast('ข้อความ', 'error' | 'success' | 'info')`
  - `config/routeTitles.js`: ชื่อแท็บรายหน้า ถ้าเพิ่ม route ใหม่ให้เพิ่มชื่อที่นี่
- **`i18n.js`:**
  - จำภาษาที่ผู้ใช้เลือกไว้ใน localStorage และตั้ง `<html lang>` ตามภาษา
  - หน้าที่ใช้ `t('key', 'ค่าไทย')` ต้องมี key ใน `public/locales/en/translation.json` ด้วย ไม่อย่างนั้นโหมด EN จะเห็นภาษาไทย

## 2026-10-26 · Spec 0005 Track H: ย้ายหน้าของตัวเองมาใช้ token สี (Person 1 และ Person 2)

**ทำไม:** ธีมที่ผู้เล่นซื้อเขียนสีลง token ชุดเดียว (`client/src/styles/tokens.css`) แล้ว
หน้าไหนที่ยังใช้สีดิบของ Tailwind (`bg-slate-50`, `text-rose-600`, ...) จะไม่เปลี่ยนตามธีม
Arcade ย้ายครบแล้ว (ticket 18) ตอนนี้สวมธีมแล้วทั้งหน้า Arcade และแถบด้านบนเปลี่ยนสีตาม

### วิธีย้าย

1. รันสคริปต์กับโฟลเดอร์ของตัวเอง ดูผลก่อนด้วย `--dry`:
   ```bash
   python client/scripts/migrate-raw-colors.py client/src/pages --dry
   ```
   สคริปต์แก้ทุกไฟล์ในโฟลเดอร์ที่ให้ไป ถ้าโฟลเดอร์มีไฟล์ของคนอื่นด้วย ให้รันแล้ว commit เฉพาะไฟล์ของตัวเอง (`git checkout -- <ไฟล์>` คืนไฟล์ที่ไม่ใช่ของตัวเอง)
2. **แก้ด้วยมือ:** บนพื้นมืด (คอนโซลโค้ด, overlay ที่ทำให้จอมืด) สคริปต์จะได้ตัวอักษรมืดบนพื้นมืด ให้เปลี่ยนเป็น `inverse-*` เอง (ดูแถวสุดท้ายของตาราง)
3. ตัวอักษรที่เล็กกว่า 12px (`text-[8px]` ถึง `text-[11px]`) เปลี่ยนเป็น `text-label`
4. ปุ่มที่เล็กกว่า 32×32px ใส่ `min-h-target` (และ `min-w-target` ถ้าเป็นปุ่มไอคอน) ปุ่มหลักของหน้าใช้ `min-h-target-primary` (44px)
5. ตรวจด้วย `client/scripts/audit-page.js` ที่ความกว้าง 375px (ดูหัวข้อถัดไป)

### ตารางแปลงสี (สิ่งที่สคริปต์ทำ)

ทุกชื่อในตารางขึ้นต้นด้วย `pysim-` เช่น `text-pysim-label`, `bg-pysim-surface`

| สีดิบ | ตัวอักษร (`text-`) | เส้นขอบ (`border-`, `ring-`, `divide-`) | พื้น (`bg-`, `from-`, `to-`) |
|---|---|---|---|
| `white` | `on-primary` | `card` | `card` |
| slate/gray 50–300 | `label` | `outline-variant` | 50 `surface`, 100 `surface-container`, 200 `surface-high`, 300 `surface-dim` |
| slate/gray 400–600 | `label` | 400–500 `outline`, 600 `on-surface-variant` | 400–500 `outline`, 600 `on-surface-variant` |
| slate/gray 700 | `on-surface-variant` | `on-surface-variant` | `on-surface-variant` |
| slate/gray 800–950, `black` | `on-surface` | `on-surface-variant` | `on-surface` |
| rose/pink | ≤400 `accent`, 500+ `accent-strong` | ≤300 `accent-border`, 400–500 `accent`, 600+ `accent-strong` | ≤100 `accent-container`, ≤300 `accent-border`, 400 `accent`, 500+ `accent-strong` |
| emerald/green/teal | 400+ `success-strong` | ≤300 `success-border` | ≤100 `success-container`, ≤300 `success-border`, 400–500 `success`, 600+ `success-strong` |
| amber/yellow/orange | 400+ `warning-strong` | ≤300 `warning-border` | ≤100 `warning-container`, ≤300 `warning-border`, 400–500 `warning`, 600+ `warning-strong` |
| red | `error` | ≤300 `error-border` | ≤100 `error-container`, ≤300 `error-border`, 400+ `error` |
| indigo/blue/sky/violet/purple | 600 `info`, 700+ `info-strong` | ≤300 `info-border` | ≤100 `info-container`, ≤300 `info-border`, 400–500 `info`, 600+ `info-strong` |
| **พื้นมืด (แก้เอง)** | `on-inverse`, รอง `on-inverse-muted`, โค้ด `inverse-code` | `inverse-outline` | `inverse-surface`, `inverse-surface-high` |

- ทุกตัวต่อด้วย `/opacity` ได้เหมือนเดิม เช่น `bg-pysim-accent-container/50`
- **ไม่เปลี่ยนตามธีม:** สีสถานะ (error, success, warning, info) และ `inverse-*` เพราะสีเขียวต้องยังแปลว่า "ผ่าน" และคอนโซลต้องมืดเสมอ
- **`accent`:** สีประจำโหมด (Arcade ใช้ชมพู) ธีมเขียนทับได้ ส่วน `primary` คือสีน้ำเงินหลักของเว็บ
- **หน้าที่มีสีประจำของตัวเอง** (เช่น Competitive ใช้ indigo) ใช้ `info` แทน `accent` ได้ แต่ `info` ไม่ตามธีม

### ขนาดขั้นต่ำ

- **ตัวอักษร:** อย่างน้อย 12px คือ `text-label` หรือ `text-xs` ห้ามใช้ `text-[8px]` ถึง `text-[11px]`
- **สีป้ายกำกับเล็ก:** `text-pysim-label` (9.4:1 บนพื้นขาว) แทน `text-slate-400` (2.6:1)
  - `text-pysim-outline` ได้ 4.47:1 ต่ำกว่าเกณฑ์นิดหน่อย อย่าใช้กับตัวอักษรเล็ก
- **ปุ่ม:** อย่างน้อย 32×32px (`min-h-target`, `min-w-target`) และปุ่มหลัก 44px (`min-h-target-primary`)

### ตรวจผลด้วย audit-page

1. เปิดหน้าใน Chrome DevTools แบบ device toolbar ที่ 375×812
2. พิมพ์ `window.AUDIT_SCOPE = 'main'` ใน Console เพื่อไม่ให้นับแถบด้านบน
3. วางเนื้อหาของ `client/scripts/audit-page.js` ใน Console
4. `tinyText`, `lowContrastCount`, `smallCount` ต้องเป็น 0 ทั้งหมด ถ้าไม่ใช่ `tinySamples`, `lowContrast` และ `smallTargets` จะบอกว่าตัวไหน
   - `hScroll` อ่านได้ 0 เสมอเพราะ `html` ตั้ง `overflow-x: hidden` ให้ดูด้วยตาว่ามีอะไรล้นขอบขวา
5. **สวมธีมที่ซื้อ** แล้วดูว่าหน้าเปลี่ยนสีทั้งหน้า

### สีดิบที่ยังเหลือ (นับเมื่อ 2026-10-26 หลัง ticket 18)

นับด้วย regex เดียวกับสคริปต์ ไม่รวมไฟล์เทส ช่อง "เล็ก" คือจำนวน `text-[<12px]`

**Person 1 — 627 สีดิบ, 40 ตัวอักษรเล็ก**

| ไฟล์ | สีดิบ | เล็ก |
|---|---:|---:|
| `pages/MiNi_Game.jsx` | 183 | 19 |
| `pages/ExercisePage.jsx` | 144 | 8 |
| `components/learning/CodingWorkspace.jsx` | 121 | 11 |
| `pages/LessonPage.jsx` | 77 | 0 |
| `pages/PromotionExamPage.jsx` | 42 | 0 |
| `components/learning/ProgressCelebration.jsx` | 28 | 0 |
| `pages/LearningPage.jsx` | 22 | 2 |
| `components/learning/AiTaskPage.jsx` | 10 | 0 |

`MiNi_Game.jsx` และ `ExercisePage.jsx` มี hex ใน class อย่างละ 1 จุด (`[#...]`) ให้แปลงด้วยมือ

**Person 2 — 505 สีดิบ, 40 ตัวอักษรเล็ก**

| ไฟล์ | สีดิบ | เล็ก |
|---|---:|---:|
| `pages/CompetitiveArena.jsx` | 283 | 30 |
| `admin/pages/Dashboard.jsx` | 44 | 9 |
| `admin/pages/ManageAccount.jsx` | 43 | 0 |
| `admin/pages/CompetitiveChallengePage.jsx` | 29 | 0 |
| `admin/pages/ThemePage.jsx` | 29 | 0 |
| `admin/pages/Leaderboard.jsx` | 28 | 0 |
| `admin/pages/StudentProgressPage.jsx` | 25 | 0 |
| `admin/pages/AddLesson.jsx` | 19 | 0 |
| `admin/components/AdminNavbar.jsx` | 5 | 1 |

หน้า admin ไม่จำเป็นต้องตามธีมของผู้เล่น ถ้าทีมตกลงว่า admin คงสีเดิม ให้ย้ายเฉพาะ `CompetitiveArena.jsx`

**ไฟล์กลาง / Person 3 — ยังไม่ได้ย้ายในรอบนี้ (347 สีดิบ, 15 ตัวอักษรเล็ก)**

`FriendLogin.jsx` 56, `LeaderboardPage.jsx` 56, `ProfilePage.jsx` 44, `SettingsModal.jsx` 37,
`WebTutorialModal.jsx` 26, `shop/PurchaseSuccessPopup.jsx` 26, `tour/GuidedTour.jsx` 20,
`GameModeLocked.jsx` 20, `ShopPage.jsx` 20, `Achievements.jsx` 12, `ui/tubelight-navbar.jsx` 10,
`App.jsx` 6, `ui/Skeleton.jsx` 6, `ui/the-infinite-grid.jsx` 4, `Login.jsx` 3, `ui/typewriter-text.jsx` 1

### ขั้น contract (ยังไม่ทำ)

- **ลบชื่อเดิม:** ทั้ง 4 ชุดใน `tailwind.config.js` และ `index.css` (`t-*`, `cyber-*`/`neon-*`/`cat-*`, `--color-*`)
- **`--t-*`:** เปลี่ยนให้ธีมในตัวเขียนค่าจาก token
- **ทำได้หลังทุกคนย้ายเสร็จเท่านั้น:** ถ้าลบก่อน หน้าที่ยังใช้ชื่อเดิมจะไม่มีสีเลย และ Tailwind ไม่เตือนเรื่อง class ที่ไม่รู้จัก

### ไฟล์กลางที่ Person 3 แตะใน ticket 17–19 (ตรวจก่อน merge)

- **`tailwind.config.js`:** สีทุกตระกูลอ่านจาก `--c-*`
  - เพิ่ม `text-label`, `min-h-target`, `min-h-target-primary`, `min-w-target`
  - **ค่าเริ่มต้นเท่าเดิม:** เทียบสีที่คำนวณได้ของทุก element ใน 7 หน้าแล้วไม่เปลี่ยน
- **`index.css`:** import `styles/tokens.css`
  - `--color-*` เป็น alias
  - ลบบล็อก `[data-theme="sakura"]` และ `[data-theme="ocean"]` ที่ไม่เคยถูกใช้
  - `.python-gradient` อ่านจาก token
- **`contexts/ThemeContext.jsx`:** ตอนเปลี่ยนธีม ลบตัวแปร CSS ของธีมก่อนหน้า (เดิมสีของธีมร้านค้าจะค้างหลังถอดธีม)
- **`themes/shopPalette.js`:** ธีมร้านค้าเขียน `--c-*` ด้วย และมี guard ให้ตัวอักษรผ่าน 4.5:1 เสมอ (เทสอยู่ใน `themes/shop-palette.test.js`)
- **`components/ModeEntryHeader.jsx` และ `components/mode-entry.css`** (แถบด้านบนของทุกหน้า):
  - บนมือถือ (< 640px) เหลือแถวเดียว สูง 105px
  - ภาษา ร้านค้า ตารางอันดับ และวิธีใช้ ย้ายไปอยู่ในเมนู ⋯
  - ที่ 1366px ตำแหน่งและขนาดของทุก element เท่าเดิม
  - **ปุ่มที่หน้าส่งเข้ามาเป็น `children`** (เช่นกล่องจดหมายของ Competitive) ยังอยู่ในแถวหลัก ถ้าจะเพิ่มปุ่มให้ลองที่ความกว้าง 375px ด้วย ตอนนี้เหลือที่ประมาณ 1 ปุ่ม
- **`data/appTour.js`:** เพิ่มขั้น "เมนูเพิ่มเติม" ที่ขึ้นเฉพาะบนมือถือ
- **`components/ui/Dialog.jsx`, `components/ui/ToastHost.jsx`, `pages/ShopPage.jsx`:** ใช้ token
  - ปุ่ม "ซื้อ" ในร้านเปลี่ยนจาก sky-700 เป็น `pysim-primary` ให้ตามธีม
