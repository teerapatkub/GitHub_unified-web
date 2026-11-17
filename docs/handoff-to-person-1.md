# ไฟล์ของ Person 1 ที่ Person 3 เข้าไปแก้

## 2026-11-17 — สูตรเลเวลใหม่ (ข้อ 11)

- **XP เป็นเลเวลคิดที่ `server/levels.js` ที่เดียวแล้ว:**
  - `users.xp` คือ XP สะสม ไม่รีเซ็ตเป็น 0 ตอนขึ้นเลเวลอีก
  - เลเวล L → L+1 ใช้ `100 + 60 × (L − 1)` XP
  - เพดานคือ Lv.100
- **ถ้าจ่าย XP จากที่ใหม่:** ใช้ `applyXpRewardToUser` หรือ `levels.addXp` ห้ามคำนวณเลเวลเอง
- **`LearningPage.jsx`:** ลบ `getLevelProgress` (เส้นโค้ง 120 × เลเวล) ออก แถบอ่าน `user.progression` ที่ `/api/user/profile` ส่งมา
- **migration `202611170006`:** แปลง XP ของผู้เล่นเดิมโดยคงเลเวลไว้

## 2026-11-17 — ราคาร้านค้าใหม่ เซ็ตใหม่ 5 ชุด และเหรียญรางวัล x3 (ข้อ 8)

**เหรียญจากการเรียน x3 (ผู้ใช้สั่ง):**
- **migration ใหม่ `202611170001 cosmetic_prices_sets_and_rewards` (`server/migrate-cosmetics-refresh.js`):**
  - คูณ `problem_modes.coin_reward` ของโหมด `lesson` และ `minigame` ด้วย 3
  - view `exercises` / `mini_game_exercises` จึงคืน `currency_reward` ใหม่เอง ไม่ได้แก้หน้าไหน
- **`server/server.js` `getLearningModeConfig`:** ช่วงเหรียญของ Debug Lab เป็น 60–180 และ Challenge 180–360 (เดิม 20–60 และ 60–120)
  - โจทย์สำรองในตัว (`buildFallbackLearningTask`) ก็ x3 ตามกัน
- **ความสำเร็จไม่ได้เปลี่ยน**
- **`npm run test:problems`:** มีกฎใหม่ "เหรียญบทเรียนและมินิเกม x3" ยอมให้ `currency_reward` ต่างจาก `*_pre_merge` ได้เฉพาะเท่ากับ 3 เท่าพอดี

**ไฟล์ของ Person 2: `server/competitiveAi.js`**
- `SUGGESTED_TERMS` x3: community 900, daily 2400, weekly 6000 เหรียญ (เวลาเท่าเดิม)

**Arcade (ไฟล์ของ Person 3 เอง):** `coinRewardByRank` ใน `shared/arcadeConfig.json` เป็น 150/105/75/45/30 และทายผู้รอดได้ 90

**ร้านค้า:**
- **ราคาตามประเภทและ rarity:** ธีม 2,500–10,000 · กรอบ 1,250–5,000 · รูปโปรไฟล์ 2,000–8,000 · เอฟเฟกต์เมาส์ 1,000–4,000
  - ของฟรีและรูปจากความสำเร็จ (ราคา 0) ไม่ถูกแตะ
  - **ราคาเซ็ต = ราคารวม × 0.8 เสมอ**
- **เซ็ตใหม่ 5 ชุด:** มอนสเตอร์, ป่าใบไม้ร่วง, หน้าหนาว, ใต้ทะเลลึก, เทศกาลโคมลอย
  - ธีมของเซ็ตใหม่มีฉากเคลื่อนไหว (`client/src/fx/ambientScenes.js`)
  - เอฟเฟกต์คลิกวาดบน canvas (`client/src/fx/clickBursts.js`) โดยระบุชื่อใน `effects[].fx`
  - เอฟเฟกต์ที่ไม่มี `fx` ยังเป็นอีโมจิแบบเดิมใน `MouseEffectLayer.jsx`
- **4 เซ็ตเดิม (อวกาศ ซากุระ พิกเซล ไซเบอร์):** ได้เอฟเฟกต์คลิกแบบ canvas และฉากเคลื่อนไหวด้วย
  - ผ่าน migration `202611170002 classic_set_click_effects`
- **ถ้าเพิ่มธีมใหม่ที่มีฉากเคลื่อนไหว:** ตั้งชื่อไฟล์รูปให้มีคำของฉากนั้น (`forest`, `winter`, …) แบบเดียวกับที่ `themes/shopPalette.js` เลือกสี

## 2026-11-16 — Debug Lab ได้โค้ดที่มีบั๊กจริง และ Generated โจทย์ Competitive ใช้ได้ครบ

**Debug Lab (โหมด `exercise`) ไม่ได้แก้ไฟล์ client ของ Person 1**
- server สุ่มโจทย์บทเรียนแล้วใส่บั๊ก 1 จุดลงในเฉลย (`server/debugLab.js`, `server/bug-mutator.py`)
- `starterCode` จึงเป็นโค้ดที่รันได้แต่ผลผิด และ `instructions[0]` คือ "โค้ดด้านล่างมีบั๊ก 1 จุด…"
- **ถ้าเขียนโจทย์บทเรียนใหม่:** เฉลยที่มีการคำนวณ เงื่อนไข หรือลูป จะถูกใช้ใน Debug Lab ได้เอง ส่วนโจทย์ที่แค่ `print("ข้อความ")` จะไม่ถูกเลือก

**ไฟล์ของ Person 2:** `client/src/components/CompetitiveGenerator.jsx`, `client/src/pages/CompetitiveArena.jsx`, `server/competitiveAi.js`
- **กล่องผลลัพธ์:**
  - แสดง test case ทั้งหมดและหมวดที่ใช้สร้าง
  - ปุ่ม "ใช้โจทย์นี้" ไม่ล็อกแล้วเมื่อเปลี่ยนหมวดระหว่างรอ
- **ตอนนำไปใช้:** เติมเหรียญและเวลาจาก `rewardCoins` / `timeLimitSec` ที่ server เสนอให้
- **ตัวอย่างในคำอธิบายมาจากผลรันเฉลยเสมอ:** ตัวอย่างที่โมเดลเขียนเองจะถูกตัดทิ้ง และคำว่า stdin/stdout ถูกแทนด้วยภาษาไทย
- **ตอนโพสต์:** ฟอร์มเช็คว่ามี test case อย่างน้อย 2 ชุดที่ input ต่างกัน ตรงกับที่ server บังคับ

## 2026-11-16 — พิมพ์คำตอบไว้ตรงๆ ไม่ผ่านโจทย์แล้ว (ทุกโหมดที่มีเฉลย)

**ไม่ได้แก้ไฟล์ฝั่ง client ของ Person 1** แต่กระทบผลตรวจของบทเรียน Debug Lab / Challenge และมินิเกม

- **ตัวตรวจ `server/problemGrader.js` + `server/hardcode-probe.py`:**
  - โจทย์ที่ทุก test case ใช้ input เดียวกัน (115 ข้อในคลัง ส่วนใหญ่ไม่มี input) แยกไม่ออกว่าคำนวณหรือพิมพ์คำตอบ
  - ตอนนี้ถ้าผ่านทุกเคส ตัวตรวจจะเปลี่ยนข้อมูลของโจทย์ (stdin และค่าคงที่ในเฉลย) แล้วรันทั้งเฉลยและโค้ดผู้เรียนซ้ำ
  - ถ้าคำตอบของเฉลยเปลี่ยนแต่ของผู้เรียนไม่เปลี่ยน → ไม่ผ่าน พร้อม hint ว่าโค้ดไม่ได้คำนวณจากข้อมูลของโจทย์
  - ใช้ได้เฉพาะโจทย์ที่มี `solution_code` ถ้าไม่มีเฉลย ผลเหมือนเดิมทุกอย่าง
- **ปุ่ม Run Tests ใน `CodingWorkspace.jsx` ยังตรวจด้วย Pyodide แบบ `includes()` เหมือนเดิม** จึงยังขึ้น "Tests Passed" ได้ แต่ตอนกด Submit เซิร์ฟเวอร์จะปฏิเสธและแสดง `คำแนะนำ: ...` ใน Terminal
  - ถ้าอยากให้ปุ่ม Run บอกตรงกัน ต้องให้ปุ่ม Run เรียกตัวตรวจของเซิร์ฟเวอร์ (ยังไม่ได้ทำ)
- **ถ้าเขียนโจทย์ใหม่:** ให้ข้อมูลของโจทย์อยู่ในเฉลยเป็นค่าคงที่หรือ stdin ตัวตรวจจะใช้มันได้เอง
  - โจทย์ที่คำตอบคือข้อความตายตัว (เช่น `print("Hello, Python!")`) ยังพิมพ์ตรงๆ ผ่านได้ตามปกติ

## 2026-11-16 — Lumi ได้รับคำถามจริง และคำตอบทยอยขึ้นทีละส่วน

**ไฟล์ที่แก้:**
- `client/src/components/learning/CodingWorkspace.jsx`
- `client/src/pages/ExercisePage.jsx`
- `client/src/pages/MiNi_Game.jsx`
- `client/src/pages/LessonPage.jsx`: เปลี่ยนแค่ `<img>` ของสไลด์
- `client/src/pages/LearningPage.jsx`: ส่วนที่ refetch เมื่อกลับมาที่แท็บ

**ไฟล์ใหม่:**
- `client/src/utils/lumiChat.js`
- `client/src/hooks/useLumiChat.js`
- `client/src/components/learning/SlideImage.jsx`

**บั๊กที่แก้:**
- `CodingWorkspace` (Debug Lab / Challenge) และ `MiNi_Game` ส่ง `{ message }` แต่ `POST /api/ai/chat` อ่านแค่ `messages`
- โมเดลจึงได้แค่ system prompt ไม่มีคำถาม และตอบแนะนำตัวทุกครั้ง (ผู้ใช้เจอเมื่อ 2026-11-12)
- ตอนนี้ทั้งสามหน้าสร้าง request ด้วย `buildLumiMessages()` ตัวเดียวกัน ซึ่งยกมาจากของ ExercisePage ที่ถูกอยู่แล้ว
  - ส่งชื่อโจทย์, คำอธิบาย, ระดับ, โค้ด, ประวัติ 6 รอบ และคำถาม
- server ตอบ 400 ถ้าไม่มีข้อความจาก user

**คำตอบแบบ stream:**
- `useLumiChat().ask()` ขอ `Accept: text/event-stream` แล้วอัปเดตฟองแชทระหว่างที่โมเดลเขียน
- ปุ่มส่งเปลี่ยนเป็นปุ่มหยุด (■) ระหว่างตอบ
- เปลี่ยนโจทย์หรือออกจากหน้า = หยุดคำตอบเก่า
- **`setIsAiResponding` ไม่มีแล้ว:** ใช้ `isAiResponding = lumi.isResponding` แทน

**สไลด์ GIF:**
- `/gif/*.gif` ทั้ง 5 ไฟล์มี `.mp4` คู่กัน ขนาดรวมจาก 90 MB เหลือ 0.5 MB
- `SlideImage` เล่น MP4 แบบวนเงียบแทน GIF และถ้าโหลด MP4 ไม่ได้จะกลับไปใช้ GIF
- ข้อมูลสไลด์ในฐานยังชี้ `.gif` เหมือนเดิม

**ทดสอบแล้ว:**
- `server/tests/local-llm-chat.test.js`: เพิ่ม 4 เคส คือ request ที่ไม่มีคำถาม, stream, โมเดลล่ม, โมเดลเงียบกลางคำตอบ
- client `npm run lint` และ `npm run build`
- dev server: ดูหัวข้อ "ทดสอบ" ใน `project_logs/2026-11-16/`

## 2026-11-16 — โหลด Pyodide เมื่อรันโค้ดครั้งแรก และใช้ worker ตัวเดียวทั้งแอป

ไฟล์: `client/src/hooks/usePyodide.js` (เขียนใหม่ภายใน API เดิม) · `client/src/pages/Arcade/hooks/useRoundJudging.js` (เพิ่ม preload)

- **เดิม**: ทุกหน้าที่เรียก `usePyodide()` (LessonPage, ExercisePage, MiNi_Game, CodingWorkspace, Arcade) สร้าง worker
  ตอน mount และ terminate ตอน unmount — แค่เปิดหน้าอ่านบทเรียนก็โหลด Pyodide ~14 MB และทุกครั้งที่เปลี่ยนหน้าบูต Python ใหม่
- **ตอนนี้**: worker ถูกสร้างตอน `runCode()` ครั้งแรก (หรือ `preload()`) เป็น singleton ระดับ module ไม่ถูกฆ่าตอน unmount
- **API เดิมทุกตัว** (`status`, `runCode`, `stopRun`, `clearOutput`, `setOnOutput`) caller ไม่ต้องแก้ เพิ่ม `preload` และ export `preloadPyodide()`
- **ความหมายของ `status` ที่ต้องรู้**: ก่อนบูต hook รายงาน `'ready'` (= "กดรันได้" เพราะ `runCode` บูตให้เอง) — caller ทุกตัวเปิดปุ่ม Run
  เมื่อ `status === 'ready'` ตอนกดรันครั้งแรกจะเห็น `'loading'` → `'running'` → `'ready'` ข้อความ "⏳ Loading Python runtime" / "✅ Python 3.12 ready!"
  จึงขึ้นในเทอร์มินัลตอนรันครั้งแรกแทนตอนเปิดหน้า
- watchdog (interrupt 10 วิ / terminate 14 วิ) เริ่มนับ**หลัง**โหลด Python เสร็จ การโหลดครั้งแรกที่ช้าจึงไม่ถูกตัดว่าเป็นลูปค้าง
  การ kill + สร้าง worker ใหม่ตอน timeout / `stopRun` / output limit ยังเหมือนเดิม
- การรันจากหลายหน้าถูกต่อคิวทีละงาน (worker ตัวเดียว) ถ้าออกจากหน้าระหว่างรัน (เช่นค้าง `input()`) งานนั้นถูกหยุดเพื่อไม่ให้ค้างคิว
- โหลดไม่สำเร็จ → `status` เป็น `'error'` เหมือนเดิม และจะลองโหลดใหม่เมื่อมีหน้าใหม่ mount
- ไม่แตะการตรวจคำตอบ (ยังอยู่ที่ `server/problemGrader.js`) และไม่แตะ `public/pyodideWorker.js`
- ทดสอบ: mount hook ใน dev server จริง (StrictMode) → ไม่มีการสร้าง worker เลย · รันครั้งแรกโหลด ~3.5 วิ · unmount แล้ว mount ใหม่ รันได้ใน 15 ms
  โดยไม่สร้าง worker ใหม่ · ลูปไม่รู้จบถูกหยุดที่ 10 วิ · stopRun / input / unmount / สองหน้ารันพร้อมกัน ผ่าน · ยังไม่ได้กดผ่านหน้าบทเรียนจริงหลัง login

## 2026-10-28 — ลบปุ่มไปด่านถัดไปและเชื่อมแผนที่เข้าฉากจบ

- เอาปุ่มสีเขียว “ไปด่านถัดไป” ออกจาก Story Mode; คงการไปต่อด้วย Spacebar ตาม flow เดิม
- ในแผนที่ เชื่อมทุก leaf node ที่เป็นปลายทางของ choice เข้ากับ node `end`; โหนด `end` ไม่มีเส้นต่อ
- ตรวจ lesson 1 พบ choices ชี้ไปด่าน 1A/1B และ 1A_2A/1A_2B/1B_2A/1B_2B; ปลายสาขาจะเชื่อมไปฉากจบ
- ไม่เปลี่ยน API, schema, choices หรือ progress
- ESLint และ build ผ่าน; ยังควรตรวจการจัดวางแผนที่และ flow จริงหลัง login

## 2026-10-28 — รอผลโจทย์ก่อนเปิด choices

- ซ่อน post-submit dialogue และ choices จนผู้เล่นส่งโจทย์ในรอบปัจจุบันผ่านและได้รับผลตรวจแล้ว (progress สำเร็จเก่าจะไม่เปิด choices ล่วงหน้า); ก่อนถึงจุดนั้น Spacebar ยังเลื่อนบทสนทนาได้ แม้ dialogue จะมี choices ผูกอยู่
- เมื่อผ่านโจทย์ จะเปิด dialogue ที่มี choices ด้วยข้อความเต็มทันที และคงปุ่ม choices ไว้ให้เลือก
- เมื่อโมดูลสำเร็จ แสดงหน้าต่าง `MISSION CLEAR!` เดิมพร้อมรางวัล แม้มี choices รออยู่; กด Continue แล้วจึงเลือกต่อได้
- ป้องกันการตั้ง skip-typing ref ค้างเมื่อ dialogue ที่เปิด choices เป็นบทสนทนาปัจจุบันอยู่แล้ว
- ไม่เปลี่ยน API/schema หรือข้อมูล dialogue/choices
- ESLint และ build ผ่าน; ยังควรทดสอบการทำโจทย์และเลือก branch จริงหลัง login

## 2026-10-28 — คืนหน้าต่างผ่านและเอากล่องผลตรวจออก

- ลบกล่องผลตรวจ/ stdout ที่เพิ่มใน Story Mode
- คืนการแสดง `MISSION CLEAR!` เมื่อ API ยืนยันว่าโมดูลจบแล้ว โดยไม่ซ่อนเพราะมี choices รออยู่
- ปุ่ม Continue ปิดหน้าต่างและกลับไปยัง choices ที่ปลดล็อกหลังส่งโจทย์ผ่าน
- เพิ่ม Spacebar เพื่อปิดหน้าต่างพร้อมคำแนะนำใน modal
- ไม่เปลี่ยน API, schema, grader หรือ progress
- ESLint และ build ผ่าน; ยังควรทดสอบหลัง login

## 2026-10-28 — ค้างผลลัพธ์ใน Story Mode จนกด Spacebar

- เมื่อส่งโจทย์ผ่านและมี choices ให้แสดง output กับข้อความสำเร็จใน Story Mode โดยไม่ใช้กล่อง “ผลการตรวจ”
- หลังปิด modal `MISSION CLEAR!` ผลลัพธ์ยังค้างอยู่; กด Spacebar จึงเปลี่ยนไปบทสนทนาเต็มและแสดง choices
- ปุ่ม choices ยังคงให้ผู้เล่นเลือกเอง และ Spacebar ไม่เลือกแทน
- ไม่เปลี่ยน API, schema, grader หรือ progress
- ESLint และ build ผ่าน; ยังควรทดสอบ flow จริงหลัง login

## 2026-10-28 — แสดงสถานะตรวจเป็นข้อความบทสนทนาปกติ

- แสดงเฉพาะ output ที่รันได้ใน story bubble; ไม่ต่อ success message หรือข้อความตรวจเสร็จเข้าไปใน output
- ระหว่าง API ตรวจคำตอบ แสดง “กำลังตรวจสอบผลลัพธ์” เป็นคำแนะนำบรรทัดปกติใต้ output
- เมื่อตรวจเสร็จ modal รางวัลทำงานตามเดิม; หลังปิด modal คง output และเปลี่ยนคำแนะนำเป็น “กด Spacebar เพื่อไปบทสนทนาถัดไป”
- กด Spacebar แล้วซ่อน output เพื่อแสดงบทสนทนาเต็มและ choices; Spacebar ไม่ปิด modal
- ESLint และ build ผ่าน; ยังควรทดสอบ flow หลัง login

## 2026-10-28 — แสดงโจทย์บนหน้าจอขนาดเล็ก

- สาเหตุที่โจทย์ไม่เห็นบนจอเล็กคือแผงข้อมูลเดิมใช้ `hidden lg:block`
- เพิ่มการ์ด responsive แสดงชื่อและคำสั่งโจทย์ในส่วน editor สำหรับจอเล็ก โดยใช้ข้อความ localized และ branch copy ชุดเดียวกับแผง desktop
- การ์ดไม่แสดงในด่าน `end` ซึ่งไม่มีโจทย์; ไม่เปลี่ยน API, schema, dialogue phase หรือข้อมูล progress
- `npx eslint src/pages/MiNi_Game.jsx` และ `npm run build` ผ่าน; ยังควรตรวจหน้าจอจริงหลัง login และที่ viewport เล็ก

## 2026-10-28 — ใช้ Spacebar แทนปุ่ม Next Dialogue

- เอาปุ่ม `Next Dialogue` ออกจากหน้า Mini Game; Spacebar ใช้แสดงข้อความที่กำลังพิมพ์ให้ครบ
  และการกดครั้งถัดไปจะเลื่อนไปบทสนทนาถัดไป
- หลังบทสนทนาสุดท้าย หากส่งโจทย์ผ่านและมีด่านถัดไป Spacebar จะพาไปด่านนั้น
- เพิ่มข้อความแนะนำ Spacebar ตามสถานะบทสนทนา ทั้งภาษาไทยและอังกฤษ
- choices ยังคงต้องเลือกด้วยปุ่มของตัวเลือก และ Spacebar ไม่ข้ามบทสนทนาที่มี choices
- ไม่เปลี่ยน API, schema, choices หรือ progress
- ESLint และ build ผ่าน; ยังต้องทดสอบ flow จริงหลัง login

## 2026-10-28 — ใช้ Spacebar แทนปุ่มไปด่านถัดไป

- ใน `client/src/pages/MiNi_Game.jsx` ผูก Spacebar ให้ทำงานเหมือนปุ่ม “ไปด่านถัดไป”
  เมื่อผลตรวจเสร็จและข้อความบทสนทนาแสดงครบแล้ว
- คงพฤติกรรมเดิมที่ Spacebar แสดงข้อความที่กำลังพิมพ์ให้ครบก่อน; การพิมพ์ใน editor และการกด choices
  ยังไม่ถูกดักเป็นการเปลี่ยนด่าน
- ไม่มีการเปลี่ยน API, schema, choices หรือ progress
- รอตรวจ lint/build หลังแก้; ควรทดสอบ flow จริงหลัง login

## 2026-10-28 — กู้หน้า Mini Game ที่จอดำ

- พบว่า `client/src/pages/MiNi_Game.jsx` มีเนื้อหา backend จาก `server.js` แทน React component
  ทำให้ `React.lazy()` โหลด default export ที่ไม่ใช่ component แม้ Vite build จะผ่าน
- ตามคำยืนยันผู้ใช้ กู้ไฟล์จาก Git แล้วใส่การแก้ typewriter, choices, dialogue order และ navigation ด้วย `dialogue_id` กลับเข้าไป
- ปรับภาพฉากจบให้ใช้ `classroom.png` และคง case ของชื่อ NPC asset ให้ตรงกับชื่อไฟล์
- `npm run build` ผ่าน; ตรวจ ESLint ไม่มี error (เหลือ warning dependency ของ useEffect เดิม)
- เปิด route ใน browser ได้ แต่ถูก redirect ไปหน้า login และไม่สามารถตรวจ flow หลังล็อกอินได้

## 2026-10-28 — ซิงก์แผนที่นำทางกับเส้นทางจริง

- แผนที่เดิมสร้างเส้นทางจาก `branch_key` แต่การเลือกบทสนทนาใช้ `next_dialogue_id` เป็นหลัก
  ทำให้เส้นเชื่อมบนแผนที่อาจชี้คนละด่านกับที่การกด choice นำไปจริง
- เปลี่ยน map ให้หา subtopic ปลายทางจาก `dialogue_id` ด้วย index ชุดเดียวกับ flow เลือก choice
- ชื่อ node ปัจจุบันใช้ `currentMissionCopy.title` ให้ตรงกับหัวข้อโจทย์ปัจจุบัน; node ที่ยังไม่ถึงจะแสดงชื่อพร้อมไอคอนล็อกแทนการซ่อนชื่อทั้งหมด
- Build ผ่าน; ยังต้องทดสอบ flow จริงหลัง login

## 2026-10-28 — อัปเดตโจทย์บท 1 จาก CSV

- นำข้อมูลจาก `Downloads/mini_game_exercises_rows.csv` ไปอัปเดตเนื้อหาโจทย์ canonical ใน `problems`
  สำหรับ Mini Game `entry_id` 1–7 (คง `problem_id` และ `problem_modes` registration ไว้)
- ลบ `rules` และ `expected_format` เก่าที่เป็นของโจทย์ VAT ออกจาก `problem_modes.extra`
  ตามการยืนยันของผู้ใช้; คงค่าอื่นและตาราง `mini_game_dialogues`, `mini_game_choices`,
  files, progress และ submissions ไว้
- ตรวจ view `mini_game_exercises` แล้วชื่อ/คำอธิบาย/โค้ด/เทสเคสเป็นชุด Doki Doki ครบ 7 ด่าน
  และเฉลยทั้ง 7 ข้อผ่าน `miniGameGrader`
- `test:problems`/`test:bilingual` รันตามสคริปต์ไม่ได้ในสภาพแวดล้อมนี้ เพราะใช้ PGHOST localhost
  แทน DATABASE_URL ที่ `db.js` ใช้; direct view/grader verification ผ่าน
- `seed-content.sql` เป็น generated snapshot และยังไม่ถูก regenerate; fresh database ที่ติดตั้งจาก snapshot
  นี้อาจยังได้โจทย์ชุดเดิม จึงควรส่งออก snapshot ใหม่จากฐานข้อมูลต้นทางเมื่อมีการทำ release
- progress เดิมยังคงอยู่ตามที่ผู้ใช้เลือก; ผู้ที่ผ่านโจทย์ชุดเดิมอาจยังถูกแสดงว่าผ่านชุดใหม่

## 2026-10-28 — กด Spacebar แล้วบทสนทนายังพิมพ์ต่อ

ไฟล์: `client/src/pages/MiNi_Game.jsx` (ของ Person 1; แก้ตามคำขอผู้ใช้)

- เมื่อกด Spacebar ระหว่างข้อความกำลังพิมพ์ จะยกเลิก interval ทันที ก่อนแสดงข้อความครบ
  ป้องกัน timer เดิมเขียนข้อความบางส่วนกลับมาทับหลังจากข้ามแล้ว
- หยุดเสียงพิมพ์ประกอบเมื่อแสดงข้อความครบด้วย Spacebar
- ตรวจ `eslint` เฉพาะไฟล์แล้วไม่มี error (มี warning dependency ของ useEffect เดิมที่บรรทัด 732)
  และ `npm run build` ผ่าน

ไม่เปลี่ยนลำดับบทสนทนา การเลือกคำตอบ หรือการส่งคำตอบ

## 2026-10-28 — choices ของมินิเกมไม่ขึ้นหลังส่ง DONE

ไฟล์ที่เกี่ยวข้อง: `client/src/pages/MiNi_Game.jsx` และเส้นทาง API/schema ของมินิเกม

- เส้นทาง API ที่อ่าน `mini_game_choices` เคยกลืน PostgreSQL `42P01` แล้วคืนรายการ choices ว่าง
  ทั้งที่ตารางไม่มีใน schema bootstrap ทำให้ระบบไม่แจ้งว่าฐานข้อมูลยังขาดตาราง
- เพิ่ม migration สร้างตาราง `mini_game_choices` และดัชนีเรียง choices ตามบทสนทนา
  โดยไม่ลบหรือเปลี่ยนข้อมูลตารางที่มีอยู่แล้ว และให้ migration เปิดใช้ RLS ตามแนวทางเดิม
- ลบ fallback ที่ซ่อนข้อผิดพลาดใน API; ถ้าตาราง/คอลัมน์หาย startup หรือ endpoint จะแจ้ง error แทนการสำเร็จแบบ choices ว่าง
- เพิ่ม `mini_game_choices` ใน whitelist สำหรับข้อมูลเนื้อหาที่ dump เป็น seed
- เพิ่ม regression test ตรวจ schema helper
- ใช้ `dialogue_id` เป็นตัวผูก choices กับบทสนทนา: บทสนทนา `pre_submit` แสดง choices เมื่อพิมพ์ข้อความครบ;
  ถ้าโจทย์ผ่านก่อนข้อความพิมพ์จบก็ปลดล็อก choices ได้ทันที; บทสนทนา `post_submit` ยังต้องรอให้โจทย์ผ่าน
  ก่อน เพราะถูกกรองออกจากรายการบทสนทนาจนกว่าจะสำเร็จ
- เมื่อผลตรวจผ่านและมีบทสนทนาที่มี choices จะไม่เปิด modal `MISSION CLEAR` มาทับปุ่มเหล่านั้น;
  modal รางวัลยังแสดงเมื่อไม่มี choices รออยู่
- หลังผลตรวจผ่านจะกลับไปยังบทสนทนาที่ผูก choices โดยแสดงข้อความที่อ่านจบแล้วทันที ไม่พิมพ์ข้อความโจทย์ซ้ำ
- lookup choices รองรับทั้ง `dialogue.choices` และรายการ `dialogue_choices` ที่ match ด้วย `dialogue_id`;
  เมื่อผลตรวจผ่านจะเลือก choices ของบทสนทนาปัจจุบันก่อน เพื่อไม่ข้ามไปข้อความโจทย์/บทสนทนาอื่น

เปลี่ยนแปลง `server/server.js`, schema helper และ migration files ซึ่งอยู่นอกขอบเขต Arcade ของ Person 3
แต่จำเป็นเพื่อให้ API ที่ serve MiNi_Game สร้างและอ่านตาราง choices ได้; ส่งต่อให้เจ้าของส่วนนี้ตรวจ
การมีข้อมูล choice rows ใน environment จริงหลัง migration (migration สร้าง schema ไม่ได้แต่ง/เติมเนื้อหาใหม่)

### ตรวจสอบลำดับบทสนทนาและ choices (04:09)

- อ่านข้อมูล local แบบ read-only: API เรียงด่าน active ของบท 1 เป็น `START → 1A → 1A_2A → 1A_2B → 1B → 1B_2A → 1B_2B`
- บทสนทนาในแต่ละด่านเรียงตาม `dialogue_order`; choices อยู่ท้ายลำดับ (`dialogue_order = 5`) ในด่าน START, 1A และ 1B
- `choice_order` และ `next_dialogue_id` ตรงกับเส้นทาง: START → dialogue 7/13, 1A → 19/23, 1B → 27/31
- ปรับ `getVisibleDialogues()` ให้กรองตาม branch/phase โดยคงลำดับต้นฉบับจาก API แทนการต่อ pre-submit แล้ว post-submit แยกก้อน

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

## 2026-10-26 · Spec 0005 Track G: รูปแบบรอบของ Arcade (แตะไฟล์กลาง)

- **`server/problemsSchema.js`:** เพิ่มฟังก์ชันใหม่ `migrateArcadeRoundKinds` (migration 202610260003) เพิ่มคอลัมน์ `problem_modes.round_kinds` และ `round_data`
  - ไม่แตะ `migrateProblems`, view และตารางเดิม
  - ค่าเริ่มต้นของทุกแถวคือ `["write"]` / `{}` บทเรียนและ Competitive ไม่ได้รับผล
  - **ถ้าแก้โจทย์ Arcade ใน `arcadeTaskSeed.js`:** server จะคำนวณ `round_data` ของข้อนั้นใหม่เองตอนบูต และ `npm run test:round-kinds` ตรวจซ้ำ
- **`shared/arcadeConfig.json`:** เพิ่ม `predictRoundSeconds`, `typingOnlyItems`, `spectatorGuessReward`, `spectatorCheerIntervalMs`
- **`server/server.js`:**
  - เพิ่ม migration 202610260003–0004
  - งานเบื้องหลังหลังบูต `refreshArcadeRoundKinds`
  - route ของผู้ชม (`arcade/spectator-api.js`)
- **ที่พบแต่ไม่ได้แก้:** `POST /api/arcade/rooms/:id/chat` (ใน `server.js`) ยังเชื่อ `user_name` จาก body แทนผู้ใช้ที่ล็อกอินอยู่ ใครที่รู้ชื่อคนในห้องจะส่งแชทในนามคนนั้นได้ ส่วน endpoint เชียร์ใหม่ใช้ผู้ใช้ที่ล็อกอินแล้ว
- เหตุผลและรายละเอียดของรูปแบบรอบอยู่ใน ADR 0010

## 2026-10-28 · รวม commit `b4b14b2` (แก้ไข MINI_GAME) จาก remote `deploy` เข้า main

**ถึง:** ผู้ที่ push `b4b14b2` (suphachaikh-creator)

- **งาน Mini Game เข้า main แล้ว:** รวมด้วย cherry-pick พร้อม migration `202610280001 mini_game_choices`
  - ครั้งหน้าให้ทำงานบน main แล้ว push ไป `origin`
  - **ห้ามรัน server จาก remote `deploy` กับฐาน production อีก:** `deploy` ไม่มี migration `202610260001`–`202610270001` ซึ่งฐาน production มีแล้ว server จะไม่ยอมบูต
- **`client/src/pages/Login.jsx`:** ใน `b4b14b2` ไฟล์นี้ถูกเขียนทับด้วยโค้ดของ `MiNi_Game.jsx` (มี `export default function MiNi_Game`) น่าจะบันทึกผิดไฟล์
  - main เก็บ `Login.jsx` เดิมไว้ (ไม่มีใคร import ใช้)
  - ถ้ามีงานที่ตั้งใจจะใส่ใน `Login.jsx` จริง ให้ตรวจอีกครั้ง
- **migration ที่รันแล้วถูกแก้:** `problemsSchema.js` / `schema.sql` / `seed-content.sql` ที่แก้ทำให้ checksum ของ core migration `202610120001` เปลี่ยน แล้วแก้ด้วยการเพิ่ม fingerprint ใน `migrations/index.js`
  - ใช้ได้เพราะยังรับเฉพาะ checksum ที่ระบุ
  - แต่ตามกฎของ repo ถ้าจะเปลี่ยน schema ให้เพิ่ม migration ใหม่แทนการแก้ input ของ migration เดิม
- ฐาน production ตอนนี้มี migration ครบทั้งสองฝั่ง และ checksum ตรงกับโค้ดบน main ทุกตัว (ตรวจแล้ว 2026-10-28)

## 2026-10-28 · Lumi เป็นผู้หญิง, ปุ่ม "เปลี่ยนโจทย์" และงาน AI ของ Person 2

**ถึง Person 1:**
- **ไฟล์ของคุณที่ Person 3 แก้ (ผู้ใช้สั่ง):**
  - `components/learning/CodingWorkspace.jsx`: ปุ่ม "รีโจทย์" เป็น "เปลี่ยนโจทย์"
  - `components/learning/AiTaskPage.jsx`: "เปลี่ยนโจทย์ได้อีก n ครั้ง" และคำทักทายของ Lumi ลงท้าย "ค่ะ"
  - `pages/ExercisePage.jsx`, `pages/MiNi_Game.jsx`: คำทักทายของ Lumi ลงท้าย "ค่ะ"
- **Lumi เป็นผู้หญิงแล้ว:** server เติมกฎนี้ใน system message ทุกครั้ง หน้าใหม่ที่เรียก `/api/ai/chat` ไม่ต้องเขียนเอง
- **ยังค้าง (ของคุณ):** บทพูด Lumi (npc_id 1) ใน `seed-content.sql` 1 ประโยคยังลงท้าย "ครับ"
  - ห้ามแก้ไฟล์ seed ตรงๆ เพราะเป็น input ของ core migration ที่รันแล้ว
  - ให้เพิ่ม migration ใหม่ที่ `UPDATE mini_game_dialogues` แทน

**ถึง Person 2 (teerapatkub):**
- **งาน `d07b4e7` เข้า main แล้ว:** ทั้งสร้างข้อสอบก่อน/หลังเรียน และ Generated โจทย์ Competitive
- **ย้ายจาก Gemini ไปใช้โมเดลในเครื่อง:** อาจารย์ห้ามใช้ API key ของ AI ภายนอก (Spec 0004)
  - `server/ai/localJson.js` ใช้ `LLM_CHAT_MODEL` และ `LLM_GENERATE_TIMEOUT_MS`
  - ไม่ต้องตั้ง `GEMINI_*` แล้ว
- **expected ของโจทย์ Competitive ที่ AI สร้าง:** มาจากการรันโค้ดเฉลยจริง
- **คำตอบ Competitive ยังตรวจด้วย rubric ในเครื่อง:** ทางที่ส่งโค้ดผู้เล่นไปให้ Gemini ถูกตัดออก
- **การแก้ใน `server.js` ที่เก็บไว้ทั้งหมด:** สิทธิ์แอดมิน, `createdBy`, 503 เมื่อ Python runner ล่ม, ไม่จ่ายรางวัลถ้าผ่านไม่ครบ
- **ครั้งหน้าให้ทำงานบน main ของ `origin`:** อย่าทำบน remote `deploy`

## 2026-11-09 · แก้ตามคอมเมนต์อาจารย์ (ส่วนโค้ดและฐานข้อมูล) แตะไฟล์ของ Person 1 และ Person 2

**ไฟล์ของ Person 1: `client/src/pages/LessonPage.jsx`**
- **สไลด์แบบ code รันเฉพาะส่วนที่เป็นโค้ด:** ตัวแยกใหม่อยู่ที่ `client/src/utils/codeSlide.js`
  - เดิมส่งข้อความทั้งสไลด์ (คำอธิบายภาษาไทย + `ตัวอย่างโค้ด:` + `ผลลัพธ์:`) ไปให้ Pyodide จึงขึ้น SyntaxError 106 จาก 125 สไลด์
  - ตอนนี้แสดงคำอธิบายเหนือกล่องโค้ด, รันเฉพาะโค้ด และแสดง "ผลลัพธ์ที่ควรได้" ใต้ผลรัน
  - ไม่ได้แก้เนื้อหาบทเรียนในฐาน รูปแบบที่รองรับ: บล็อก ```` ```python ````, ป้าย `ตัวอย่างโค้ด:` / `ผลลัพธ์:` และประโยคไทยตามด้วยโค้ด
  - เหลือสไลด์เดียวที่ยังรันไม่ผ่าน คือ "ตั้งชื่อตัวแปรผิดกฎ" (id 77) ซึ่งตั้งใจให้ Error
- **ถ้าเขียนสไลด์ใหม่:** ใส่โค้ดใน ```` ```python ```` จะแยกได้แน่นอนที่สุด

**ไฟล์ของ Person 2: `server/competitiveAi.js`**
- **ตัด quote ที่ครอบทั้งบรรทัดของ input ที่ AI สร้าง:** เช่น `"Python"` เป็น `Python` ก่อนรันเฉลย
  - เดิม expected นับเครื่องหมายคำพูดไปด้วย (`"Python"` → 8)
  - quote ที่อยู่กลางบรรทัดหรือมีข้างเดียวไม่ถูกแตะ มีเทสครอบทั้งสองกรณี

**ฐานข้อมูล: migration ใหม่ `202611090001 schema_cleanup_report_review` (`server/migrate-schema-cleanup.js`)**
- `achievements.reward_money`: `numeric(10,2)` เป็น `integer` ให้ตรงกับเหรียญที่อื่นทั้งหมด
- คอลัมน์ `"order"` (คำสงวนของ SQL) ใน `survey_questions`, `survey_options`, `level_config` เปลี่ยนเป็น `sort_order`
  - **ถ้าเขียน query แบบสำรวจใหม่ ให้ใช้ `sort_order`**
- คำอธิบายไอเทม `aiHelper` ไม่อ้าง Gemini แล้ว (ไอเทมนี้เปิดคำใบ้จากคลังโจทย์ ไม่ได้เรียก AI)
- สไลด์บทจัดการไฟล์ 2 สไลด์ที่ `\n` ใน `file.write("...")` ถูกเก็บเป็นการขึ้นบรรทัดจริง แก้ให้เป็น `\n`

## 2026-11-17 · ปรับ UI ให้ผู้เริ่มต้นเข้าใจง่าย รอบที่ 1 (Gridgeist ทิศทาง A "ขั้นต่อไปมาก่อน") แตะไฟล์ของ Person 1 และ Person 2

**ไฟล์ของ Person 1**
- **`WebTutorialModal.jsx` เปลี่ยนจากการ์ดกลางจอเป็น spotlight ชี้ของจริง:** ใช้ `GuidedTour` ตัวเดียวกับทัวร์ของ Lumi
  - ไม่แสดง selector (`ส่วนที่แนะนำ: [data-tour=…]`) อีก และไม่ใช้รูปใน `public/WebTutorialModal/data_png/` แล้ว (ไฟล์ยังอยู่)
  - **เปิดจากปุ่ม "?" บน header แทนปุ่มลอยมุมจอ:** ปุ่มลอยถูกลบจาก `LearningPage`, `LessonPage`, `ExercisePage`, `MiNi_Game`, `AiTaskPage` เพราะเดิมมี "?" สองปุ่มที่เปิดคนละอย่าง
  - ส่ง `onOpen` ให้ `WebTutorialModal` ถ้าอยากให้หน้าใหม่ตอบปุ่ม "?" ของ header
- **`data/webTutorials.js`:** ชื่อ PySim → PyArena และข้อความตรงกับชื่อปุ่มใหม่
- **`LearningPage.jsx`:** แบนเนอร์คำขวัญด้านบนถูกแทนด้วยบล็อก "ขั้นต่อไป" (ชื่อบทถัดไป + ปุ่ม "เรียนต่อ" ปุ่มเดียว) ปุ่มเรียนต่อในการ์ดโปรไฟล์ด้านข้างถูกเอาออก ป้าย `ACTIVE` เป็น "กำลังเรียน"
- **`CodingWorkspace.jsx` / `AiTaskPage.jsx` (Debug Lab, Challenge):** ป้ายเป็นไทย (มีภาษาอังกฤษเมื่อสลับภาษา)
  - Run → ลองรัน, Run Tests → ตรวจคำตอบ, Terminal → ผลลัพธ์, Instructions → โจทย์
  - log ตรวจคำตอบขึ้นต้นด้วย ✓ / ✗ แทน PASS / FAIL (สีอ่านจากเครื่องหมายนี้)
- **`ExercisePage.jsx`:** Run → ลองรัน, Terminal → ผลลัพธ์, Practice Exercise → แบบฝึกหัด
- **`components/ui/tubelight-navbar.jsx`:** แท็บย่อย (บทเรียน / แก้ไขโค้ด / ความท้าทาย) แสดงไอคอนพร้อมคำบนมือถือด้วย

**ไฟล์ของ Person 2: `CompetitiveArena.jsx`**
- หัวหน้าเป็น "กระดานโจทย์" + คำอธิบายไทย, เกณฑ์คะแนนเป็น "คะแนนถูกต้อง 50%" ฯลฯ, ป้ายการ์ดโจทย์/อันดับ/เวลาเป็นไทย (อังกฤษเมื่อสลับภาษา)
- ไม่ได้แก้ตรรกะหรือ API

**ไฟล์กลาง: `components/mode-entry.css`:** แถบแท็บโหมดมี scrollbar แนวตั้งโผล่ทุกหน้า (เส้นสีฟ้าเขียวขวาบน) แก้ด้วย `overflow-y: hidden`

## 2026-11-17 · ปรับ UI รอบที่ 2: Competitive และล็อบบี้ Arcade (แตะไฟล์ของ Person 2)

**`client/src/pages/CompetitiveArena.jsx` (Person 2)** — เปลี่ยนแค่การจัดวางและข้อความ ไม่แตะ API หรือตรรกะ
- **กล่องโพสต์:** เป็นแถว "มีโจทย์อยากให้คนอื่นลอง?" กับปุ่มรองว่า "โพสต์โจทย์ใหม่" แทนช่องที่หน้าตาเหมือนช่องพิมพ์ ฟอร์มเดิมยังเปิดจากปุ่มนี้เหมือนเดิม
- **อันดับ:** จากการ์ดใหญ่หลายใบ เหลือการ์ด "ผู้นำตอนนี้" ใบเดียวที่มีแถวไม่เกิน 3 แถว
- **หัวข้อเหนือรายการโจทย์:** "โจทย์ที่เปิดให้ทำ · n ข้อ"
- **เกณฑ์คะแนน:** แสดงครั้งเดียวบนหัวหน้า ไม่ซ้ำในทุกการ์ดแล้ว

## 2026-11-17 · หน้าเขียนโค้ดของแบบฝึกหัด, Debug Lab และ Challenge ใช้โครงเดียวกัน (แตะไฟล์ของ Person 1)

**ทำไม:** ผู้ใช้อยากให้สามหน้านี้หน้าตาเหมือนกัน ยึดหน้าแบบฝึกหัดเป็นหลัก (ใช้ Codédex เป็นภาพอ้างอิง) และให้แชท Lumi เป็นแถบที่เปิดจากด้านข้าง ไม่ใช่ป๊อปอัปที่ลอยทับโค้ด

**ส่วนกลางใหม่ `client/src/components/workbench/`**
- `CodeWorkbench.jsx`: โครงหน้า
  - ซ้าย: โจทย์และส่วนช่วยเหลือ
  - ขวา: แท็บไฟล์, editor, แถบปุ่ม และช่องผลลัพธ์
  - ล่าง: แถบ footer
  - Lumi เป็นคอลัมน์ที่สามที่ดัน editor ไปด้านข้าง บนมือถือจะเต็มพื้นที่โค้ดและมีปุ่มปิด กด Esc ก็ปิดได้
  - บนมือถือมีปุ่มสลับ "โจทย์ / เขียนโค้ด" แทนการวางซ้อนกัน
- `WorkbenchMenu.jsx`: ปุ่ม "⋯" มีคัดลอกโค้ด, เริ่มโค้ดใหม่, ถาม Lumi
- `LumiPanel.jsx`: หน้าแชท (หน้าเจ้าของเป็นคนส่งคำถามเอง)
- `OutputPanel.jsx`: ช่องผลลัพธ์และช่องป้อน input()
- `WorkbenchFooter.jsx`: รายการโจทย์ ข้อที่ / ทั้งหมด ป้ายผ่านแล้ว และปุ่มย้อนกลับ / ถัดไป
- `accents.js`: สีหลัก (Challenge ใช้สีชมพูแดง)

**ไฟล์ของ Person 1 ที่เปลี่ยนเฉพาะส่วนแสดงผล (ตรรกะรัน ส่ง และแชทเหมือนเดิม)**
- `pages/ExercisePage.jsx`:
  - ย้ายรายการโจทย์ไปที่ปุ่ม ☰ ใน footer
  - ปุ่มรีเซ็ตแยกเป็นฟังก์ชัน `resetCode`
  - "คัดลอกโค้ด" คัดลอกไฟล์ที่เปิดอยู่ (เดิมคัดลอกตัวแปร `code` ที่ไม่ได้ผูกกับ editor)
  - ข้อความผลตรวจขึ้นต้นด้วย ✓ / ✗
  - **บั๊กที่หายไปด้วย:** เดิมแชท Lumi ซ่อนไว้ทุกจอที่แคบกว่า 1280px ทำให้กดปุ่ม AI แล้วไม่มีอะไรเกิดขึ้น
- `components/learning/CodingWorkspace.jsx`:
  - ใช้ workbench เหมือนกัน
  - ปุ่มทึบมีทีละปุ่ม: "ตรวจคำตอบ" ก่อน ผ่านแล้วจึงเปลี่ยนเป็น "ส่งคำตอบ"
  - เอาปุ่มกล้องที่ไม่ทำงานออก
  - ไม่รับ prop `subtitle`, `progressLabel`, `progressMeta`, `nextLabel` แล้ว
- `components/learning/AiTaskPage.jsx`: เลิกส่ง prop ที่ไม่ใช้แล้ว

## 2026-11-17 22:08 — ธีมทำให้ปุ่มและการ์ดเล็กๆ ดูโปร่งใส (`client/src/index.css`, ไฟล์ร่วม / Theme ของ Person 2)

- กฎ `html[data-theme^="shop-theme-"] .bg-pysim-surface` เดิมวาดภาพพื้นหลังธีม (fixed) ลงใน**ทุก**องค์ประกอบที่ใช้สี `bg-pysim-surface`
  ไม่ใช่แค่พื้นหน้าเว็บ ชิปราคา ปุ่มรอง แถบชื่อไฟล์ และการ์ดผู้เล่นใน Arcade จึงกลายเป็นหน้าต่างมองทะลุไปเห็นภาพธีม
- ตอนนี้จำกัดให้ภาพธีมลงเฉพาะองค์ประกอบที่เป็นพื้นของทั้งหน้า (`min-h-screen` หรือ `h-dvh` คู่กับ `bg-pysim-surface`)
  ส่วนที่เหลือได้สีพื้นทึบตามโทเคนเหมือนตอนไม่ได้ใส่ธีม
- ถ้าหน้าใหม่อยากได้ภาพธีมเป็นพื้นหลัง ให้ใส่ `bg-pysim-surface` คู่กับ `min-h-screen` หรือ `h-dvh` ที่ตัวนอกสุดของหน้า

## 2026-11-17 22:40 — แถบย่อย บทเรียน / แก้ไขโค้ด / ความท้าทาย ย้ายเข้า header (`App.jsx`, `ModeEntryHeader.jsx`)

- **เดิม:**
  - `BottomNavBarSimple` ใน `App.jsx` เป็นการ์ดแยกใต้ header วางบนพื้นตารางเปล่า ไม่ตามธีม
  - ซ่อนไว้ในหน้าเขียนโค้ด (`/debug`, `/challenge`, `/exercise`, …) ทำให้ย้ายไปโหมดอื่นจากหน้านั้นไม่ได้ (สิ่งที่ต้องแก้ไข.md ข้อ 4)
- **ตอนนี้:**
  - `ModeEntryHeader` รับ prop `subnav` (`[{ path, label, icon, active }]`) แล้ววาดเป็นแถวที่สองของ header
  - `App.jsx` ส่งรายการนี้ในทุกเส้นทางของโหมดบทเรียน
  - หน้าเขียนโค้ดจะสูงลดลงประมาณ 46px ปรับเองอัตโนมัติผ่าน `--app-navbar-height`
- **ลบแล้ว:** `BottomNavBarSimple` และ import ของ `NavBar`
  - `components/ui/tubelight-navbar.jsx` ไม่มีที่ใช้แล้ว แต่ยังไม่ลบไฟล์
  - CSS `.mode-entry-shortcuts` ไม่มีที่ใช้แล้ว แต่ยังไม่ลบ

## 2026-11-17 23:10 — Competitive เลือกหมวดบทเรียนได้หลายหมวด (ไฟล์ของ Person 2)

- **ไฟล์:** `client/src/pages/CompetitiveArena.jsx`, `client/src/components/CompetitiveGenerator.jsx`, `server/competitiveAi.js`
- **ฝั่ง client:**
  - เลือกหมวดได้ 1-3 หมวด
  - กดหมวดไม่ล้างฟอร์มอีกแล้ว (เดิม `applyChallengeTemplate` ล้างชื่อ คำอธิบาย และ test case ทุกครั้ง)
  - `CompetitiveGenerator` รับ `topics` (array) แทน `topic`
- **ฝั่ง server:**
  - `POST /api/competitive/challenges/generate` รับ `topics: []`
  - ยังรับ `topic` แบบเดิมได้
  - หมวดเดียวยังหยิบจากคลังโจทย์ที่สร้างไว้ล่วงหน้า หลายหมวดสร้างสดทุกครั้ง

## 2026-11-18 00:20 — หน้าโปรไฟล์ไม่มีตัวเลือกรูปแล้ว (`ProfilePage.jsx`)
- เอาแถวรูปให้เลือกใต้รูปโปรไฟล์ออก ผู้ใช้เลือกรูปที่หน้าแต่งโปรไฟล์ (`/profile/appearance`) แทน
- `ProfilePage` ไม่รับ prop `onUserRefresh` แล้ว
- API เลือกและรีเซ็ตรูปไม่ได้เปลี่ยน

## 2026-11-18 02:00 — แก้ P0 + P1 จากผลตรวจ UI (ไฟล์ของ Person 1 และ 2)
- **`pages/ShopPage.jsx`:**
  - ปุ่ม "ซื้อ" และ "ซื้อเซ็ต" เปิดหน้าต่างยืนยัน (`components/shop/PurchaseConfirmDialog.jsx`) ก่อนส่งคำสั่งซื้อ
  - หัวหน้าร้านและหัวข้อ "เซ็ตธีม" ใช้คลาส `on-art`
- **`pages/CompetitiveArena.jsx`:**
  - ปุ่ม "สรุปผลทันที" แสดงเฉพาะแอดมิน (server กันไว้อยู่แล้ว)
  - ไม่มีเอฟเฟกต์ธีมตอนเปิด editor
  - หัวข้อรายการโจทย์ใช้ `on-art`
- **`pages/LessonPage.jsx`:** แถบความคืบหน้า หัวข้อ และคำอธิบายรวมอยู่ในกล่อง `on-art` เดียว
- **`pages/LeaderboardPage.jsx`, `pages/Achievements.jsx`, `pages/ProfilePage.jsx`:**
  - ปุ่มย้อนกลับ หัวข้อ และคำบรรยายใช้ `on-art`
  - ปุ่มย้อนกลับสูงขั้นต่ำ 40px
- **`App.jsx`:** ปิดเอฟเฟกต์ธีม (กลีบไม้ หิมะ ฯลฯ) ในหน้าเขียนโค้ดและหน้าบทเรียน ผ่าน `fx/usePauseThemeScene.js`
- **`.on-art` (`index.css`):** มีผลเฉพาะตอนใส่ธีมร้านค้า ถ้าไม่ใส่ธีม หน้าตาเหมือนเดิม

## 2026-11-18 04:00 — แก้ P2 จากผลตรวจ UI (หลายไฟล์ของ Person 1 และ 2)
- **ตัวหนังสือเล็กกว่า 12px:** `text-[9px]`, `text-[10px]`, `text-[11px]` เปลี่ยนเป็น `text-label` (12px) ใน 14 ไฟล์ฝั่งผู้เรียน (ไม่แตะ admin)
  - ไฟล์ที่แตะมาก: `CompetitiveArena.jsx` 28 จุด, `MiNi_Game.jsx` 20, `BattleRoyaleGameplayView.jsx` 9, `ShopPage.jsx` 6
- **ป้ายภาษาไทยแทนอังกฤษใน `CompetitiveArena.jsx` / `CompetitiveGenerator.jsx`:**
  - "สร้างโจทย์อัตโนมัติ", "ชุดทดสอบ", "ข้อมูลที่รับเข้า", "ผลลัพธ์ที่ต้องแสดง"
  - ตัวอย่างชุดทดสอบ: "ชุดที่ / รับเข้า / ต้องได้"
- **Arcade:**
  - "Survival Cash" ในภาษาไทยเปลี่ยนเป็น "เงินในแมตช์"
  - ระดับ "ดั้งเดิม" เปลี่ยนเป็น "ผสมง่าย-กลาง" (EN: "Mixed easy–medium" เพราะ "Classic" ชนกับรูปแบบห้องคลาสสิก)
- **`ProfilePage.jsx`:**
  - ประวัติ Arcade แปลระดับและความเร็วเป็นคำไทย (`profile.history.difficultyValue.*`, `paceValue.*`)
  - ปุ่ม "เปลี่ยน" และแท็บประวัติสูงขั้นต่ำ 32px
- **`LessonPage.jsx`:**
  - สีน้ำเงินตายตัวเปลี่ยนเป็นสีธีม (`pysim-primary`)
  - ตัวเลือกในแบบทดสอบเป็น radio (`role="radiogroup"` / `role="radio"` + `aria-checked`)
  - มีหมายเหตุว่าแบบทดสอบก่อนเรียนไม่มีผลต่อคะแนน
  - บอกเหตุผลใต้ลูกศรถัดไปและปุ่มด้านล่างที่ยังล็อกอยู่
- **`LearningPage.jsx`:** หมวดที่ 0% ขึ้น "ยังไม่เริ่ม" แทน "กำลังเรียน"
- **`server/lessonProgress.js`:**
  - บทที่ไม่มีทั้งแบบทดสอบและแบบฝึกหัด ไม่นับว่า "เรียนจบ" แล้ว (เดิมขึ้นเรียนจบแล้ว 0%)
  - ยังไม่ขวางบทถัดไป (`opensNext` ยังเป็น true)
- **ปุ่มเล็ก:** `CosmeticTryButton`, แถบชื่อไฟล์และลิงก์ย้อนกลับในหน้าเขียนโค้ด สูงขั้นต่ำ 32px

## 2026-11-18 05:30 — P3 จากผลตรวจ UI และหัวหน้า Competitive (ไฟล์ของ Person 1 และ 2)
- **`pages/CompetitiveArena.jsx` (ผู้ใช้ขอ):**
  - หัว "กระดานโจทย์" คำบรรยาย และเกณฑ์คะแนน รวมอยู่ในการ์ดเดียวกับ "โพสต์โจทย์ใหม่"
  - เอากล่อง "ผู้นำตอนนี้" และหัวข้อ "โจทย์ที่เปิดให้ทำ · n ข้อ" ออก
    - การเรียก `/api/competitive/leaderboard` ในหน้านี้ถูกลบด้วย endpoint ยังอยู่ และหน้าตารางอันดับรวมยังมีแท็บ Competitive
  - `data-tour="competitive-intro"`, `competitive-scoring`, `competitive-post` ย้ายตามเนื้อหา ทัวร์ยังชี้ถูก
- **`components/ui/Dialog.jsx`:** dialog ที่ overlay เป็น `fixed` ถูก render ผ่าน portal ไปที่ `<body>` เดิมพื้นหลังมืดของหน้าต่างสร้างห้อง Arcade คลุมไม่ถึงขอบบน
- **`components/ui/InlineCodeText.jsx` + `utils/inlineCode.js`:** แสดง `` `โค้ด` `` ในโจทย์เป็นโค้ด ใช้ใน `CodingWorkspace`, `ExercisePage`, การ์ดโจทย์ Competitive และโจทย์ Arcade
- **`pages/LeaderboardPage.jsx`:** เหลือ 4 แท็บ (เอา "เลเวล" และ "ไอเทมตกแต่ง" ออก) endpoint ฝั่ง server ยังอยู่
- **`pages/ShopPage.jsx` บนมือถือ:**
  - แท็บหมวดเป็นแถวเลื่อนแนวนอน และช่องค้นหาขึ้นก่อน
  - เซ็ตธีมเป็นแถวปัดแนวนอน
  - การ์ดของเป็น 2 คอลัมน์ ส่วนท้ายการ์ดเรียงลงล่าง
  - จอใหญ่เหมือนเดิม
- **`pages/ProfilePage.jsx`:** อัตราการชนะแสดง "—" ถ้ายังไม่เคยแข่ง

## 2026-11-18 — ชื่อภาษาอังกฤษของบทเรียน หมวด ของตกแต่ง และความสำเร็จ (ข้อ 16.10)
- **migration ใหม่ `202611180002 english_names_for_thai_only_content` (`server/migrate-english-names.js`):**
  - เพิ่มคอลัมน์ `modules.title_en/description_en`, `lessons.title_en/description_en`,
    `shop_items.name_en/description_en`, `shop_sets.description_en`, `achievements.name_en/description_en`
  - เติมคำแปลให้ 9 หมวด 24 บท ของตกแต่งทุกชิ้นที่ seed 9 เซ็ต และความสำเร็จ 31 รายการ
  - จับคู่ด้วยชื่อไทย (หมวด/บท), `item_type` + ชื่อไทย (ของตกแต่ง), `set_key`, `code` — ไม่ใช้ id
  - ไม่ทับคำแปลที่มีอยู่แล้ว ถ้าแอดมินแก้ชื่อไทยเอง แถวนั้นจะไม่มีอังกฤษและแสดงไทยต่อ
- **คอลัมน์ไทยเดิมไม่ได้เปลี่ยนชื่อหรือความหมาย** — `title`, `name`, `description` ยังเป็นไทยทุกที่
- **API (ส่งฟิลด์ `_en` เพิ่ม ไม่ได้ลบอะไร):**
  - `server/lessonContentRoutes.js`: `/api/course-content`, `/api/lessons/:id`
  - `server/server.js`: `/api/profile/:id`, `/api/shop/items`, `/api/shop/inventory/:id`, `/api/shop/sets`,
    `/api/achievements/:id`, `/api/achievement-unlocks/unseen`
  - `server/avatar.js`: ตัวเลือกรูปโปรไฟล์มี `label_en`
- **ฝั่ง client:** `client/src/utils/contentText.js` (`contentTitle/contentName/contentDescription`)
  ใช้กฎเดียวกับ `problemText.js` — ไม่มีอังกฤษก็ได้ไทย ไม่ใช่ช่องว่าง
  - ไฟล์ที่แก้: `LearningPage.jsx`, `LessonPage.jsx`, `ProfilePage.jsx`, `AppearancePage.jsx`, `ShopPage.jsx`,
    `Achievements.jsx`, `components/AchievementUnlockPopup.jsx`
  - **`name` ของธีมต้องเป็นไทยต่อไป** — `getShopThemePalette` / `ProfileAppearance` / `CosmeticTryButton`
    เลือกสีและฉากจากคำในชื่อนั้น หน้าจึงแปลเฉพาะข้อความที่แสดง ไม่ได้แทนค่า `name`
- **`MiNi_Game.jsx`:** ปุ่ม Back, Lumi Chat, RUN, DONE, View Terminal / Story Mode และหัว Hint เป็นไทยตอน UI ภาษาไทย
  - คำใบ้ภารกิจ 101 และทัวร์ใน `data/webTutorials.js` ที่เขียนว่า "กด RUN/DONE" เปลี่ยนเป็น "กด รันโค้ด/ส่งคำตอบ" ให้ตรงปุ่ม
- **ยังไม่ได้ทำ:** หน้าแอดมินเพิ่มบทเรียนยังไม่มีช่องกรอกชื่ออังกฤษ บทที่เพิ่มใหม่จึงแสดงไทยในโหมด EN
