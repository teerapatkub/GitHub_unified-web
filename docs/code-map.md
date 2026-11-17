# แผนที่โค้ด PyArena: หน้าไหนมาจากไฟล์ไหน

เอกสารนี้ใช้ตอบคำถามเรื่องการเขียนโค้ด เรียงจากภาพรวม → หน้าเว็บทีละหน้า → ฝั่ง server → เส้นทางของข้อมูลที่ถูกถามบ่อย
(อัปเดต 2026-10-28)

---

## 1. ภาพรวมในหนึ่งนาที

```
เบราว์เซอร์ (React)  ──HTTP /api/*──▶  Express server (Node)  ──▶  PostgreSQL บน Supabase
   client/src/                        server/server.js + โมดูลย่อย     (ข้อมูลผู้ใช้, บทเรียน, โจทย์)
                                         │
                                         ├─▶ Python จริง (ตัดสินคำตอบ)   server/pythonRunner.js
                                         └─▶ Ollama (AI ในเครื่อง)        server/ai/llm.js
```

- **หน้าเว็บ:** React 19 + Vite อยู่ใน `client/`
  - ตอน deploy จะ build เป็นไฟล์นิ่งใน `client/dist` แล้ว server เสิร์ฟเอง ทำให้หน้าเว็บกับ API อยู่โดเมนเดียวกัน
- **server:** Node.js + Express อยู่ใน `server/` ไฟล์หลักคือ `server.js` และแยกงานใหญ่ออกเป็นโมดูล
- **หลักที่ต้องจำ:**
  - **server เป็นคนตัดสินคำตอบเสมอ** เบราว์เซอร์ส่งแค่โค้ด ไม่ได้ส่งผลว่าผ่าน (ADR 0001)
  - Python ในเบราว์เซอร์ (Pyodide) มีไว้ให้ลองรันดูผลเร็วๆ เท่านั้น ไม่ได้ใช้ตัดสินหรือให้รางวัล

**ไฟล์ตั้งต้นของหน้าเว็บ**

| ไฟล์ | หน้าที่ |
|---|---|
| `client/src/main.jsx` | จุดเริ่มต้นของ React เอา `<App/>` ลงหน้า HTML |
| `client/src/App.jsx` | **ตารางเส้นทาง (routing) ทั้งเว็บ**, ตรวจการล็อกอิน (`requireStudent`, `requireAdmin`, `requireGameModeRank` = ต้องเลเวล 10), แถบเมนู, ทัวร์ Lumi และ toast |
| `client/src/config/api.js` | ที่อยู่ของ API (`API_BASE`) |
| `client/src/i18n.js` + `public/locales/` | สองภาษา ไทย/อังกฤษ (react-i18next) |

---

## 2. หน้าของผู้เรียน (Person 1 เป็นเจ้าของหลัก)

| URL | ไฟล์หน้า | ทำอะไร | API ที่เรียก → ไฟล์ฝั่ง server |
|---|---|---|---|
| `/login` | `pages/FriendLogin.jsx` | สมัคร / ล็อกอิน (อีเมล + Google ผ่าน Supabase Auth), แบบสำรวจตอนสมัคร, แบบวัดระดับ | Supabase Auth (ในเบราว์เซอร์), `/api/survey` → `server.js`, `/api/assessment/*` → `placementRoutes.js` |
| `/learn` | `pages/LearningPage.jsx` | หน้ารวม 9 หมวด 24 บท, ปลดล็อกตามลำดับ | `/api/course-content` → `lessonContentRoutes.js` |
| `/lesson/:lessonId` | `pages/LessonPage.jsx` | สไลด์บทเรียน + แบบทดสอบก่อน/หลังเรียน | `/api/lessons/:id/*` → `lessonContentRoutes.js`, ความคืบหน้า → `lessonProgress.js` |
| `/exercise/:lessonId` | `pages/ExercisePage.jsx` | แบบฝึกหัดประจำบท: editor, Run, ส่งคำตอบ, แชท Lumi | `/api/exercises/:lessonId`, `POST /api/exercises/:id/submit`, `/api/ai/chat` → `server.js` |
| `/mini-game/:lessonId` | `pages/MiNi_Game.jsx` | มินิเกมเนื้อเรื่อง (บทพูด NPC + โจทย์) | `/api/mini-game/*` → `server.js` + ตัวตรวจ `miniGameGrader.js` |
| `/debug` | `components/learning/AiTaskPage.jsx` (`mode="exercise"`) | Debug Lab: แก้โค้ดที่มีบั๊ก, ปุ่ม "เปลี่ยนโจทย์" | `/api/learning/ai-task*` → `server.js` |
| `/challenge` | `pages/ChallengePage.jsx` → `AiTaskPage` (`mode="challenge"`) | Hard Challenge | เหมือน `/debug` |
| (ใช้ร่วม) | `components/learning/CodingWorkspace.jsx` | หน้าจอเขียนโค้ดของ Debug/Challenge: editor, terminal, ปุ่มเปลี่ยนโจทย์, แผง Lumi | – |
| `/promotion-exam` | `pages/PromotionExamPage.jsx` | สอบเลื่อนระดับ | `/api/learning/promotion-exam*` → `promotionExamRoutes.js` |
| `/profile`, `/profile/:userId` | `pages/ProfilePage.jsx` | โปรไฟล์, ของตกแต่ง, ประวัติ Arcade/Competitive | `/api/profile/*` → `server.js`, รูปโปรไฟล์ → `avatar.js` |
| `/shop` | `pages/ShopPage.jsx` | ร้านค้าของตกแต่ง (ธีม, กรอบ, เคอร์เซอร์, เซ็ต) | `/api/shop/*` → `server.js` |
| `/achievements` | `pages/Achievements.jsx` | ความสำเร็จ 20 รายการ | `/api/achievements/:userId` → `server.js` |
| `/leaderboard` | `pages/LeaderboardPage.jsx` (+ `leaderboard-data.js`) | กระดานอันดับ 6 ประเภท | `/api/leaderboard` → `server.js` |

**การรัน Python ในเบราว์เซอร์ (ลองรันเท่านั้น)**
- `client/src/hooks/usePyodide.js`: hook ที่หน้าต่างๆ เรียกใช้
- `client/public/pyodideWorker.js`: รัน Python ใน Web Worker แยกจากหน้าเว็บ จึงหยุดลูปไม่รู้จบได้โดยหน้าไม่ค้าง
- error ของ Python แปลเป็นภาษาไทยด้วย `server/pythonErrorMessages.mjs` ซึ่งเป็นไฟล์เดียวกันกับที่ server ใช้

---

## 3. Competitive Arena (Person 2)

| URL | ไฟล์ | ทำอะไร |
|---|---|---|
| `/competitive-arena` (และ `/online`) | `pages/CompetitiveArena.jsx` | ฟีดโจทย์ที่โพสต์ไว้ (รายวัน/รายสัปดาห์/ทั่วไป), รับโจทย์, เขียนคำตอบ, ส่ง, ดูคะแนน 0–100 |
| (ในหน้าเดียวกัน) | `components/CompetitiveGenerator.jsx` | ปุ่ม "Generated โจทย์" ให้ AI ในเครื่องร่างโจทย์ |

**ฝั่ง server**
- **`server.js` ส่วน `/api/competitive/*`:**
  - สร้าง/รับ/ส่งโจทย์ และกระดานอันดับ
  - **คะแนนมาจาก rubric ในเครื่อง** (`scoreCompetitiveSubmission`)
  - คำตอบที่ผ่านไม่ครบได้คำแนะนำจาก AI ในเครื่อง (`adviseOnFailedCompetitiveSubmission`) แต่ AI ไม่มีผลกับคะแนน
- **`competitiveAi.js`:** ให้ AI ร่างโจทย์
  - expected ของแต่ละ test case คือสิ่งที่**โค้ดเฉลยพิมพ์ออกมาจริง**
  - โค้ดเฉลยรันในขอบเขตจำกัด: ห้าม import, ห้ามเปิดไฟล์

---

## 4. Arcade Battle Royale (Person 3)

| URL | ไฟล์ | ทำอะไร |
|---|---|---|
| `/matchmaking` | `pages/Arcade/ArcadeBattleRoyale.jsx` | ตัวคุมทั้งโหมด: ล็อบบี้ → ห้องรอ → เล่น → ร้านค้า → สรุป |
| `/matchmaking/history` | `pages/Arcade/ArcadeHistoryPage.jsx` | ประวัติแมตช์ทั้งหมด แบ่งหน้าและมีตัวกรอง |

**hooks (`pages/Arcade/hooks/`):** แยก state ของเกมออกจากหน้าจอ

| ไฟล์ | หน้าที่ |
|---|---|
| `useRoomLifecycle.js` | สร้าง/เข้า/ออกห้อง, ถามสถานะห้องจาก server ทุก ~2 วินาที (polling), กลับเข้าห้องหลังรีเฟรช |
| `useRoundView.js` | ข้อมูลรอบปัจจุบัน (โจทย์, รูปแบบรอบ, เวลา) |
| `useRoundDraft.js` | บันทึกฉบับร่างโค้ดระหว่างรอบ |
| `useRoundJudging.js` | ส่งคำตอบ, ปุ่มทดสอบ, รับผลตรวจ |
| `useShopEconomy.js` | เงินในแมตช์, ซื้อ/ขาย/สุ่มร้าน |
| `useCombat.js` | ใช้ไอเทมโจมตี/ป้องกัน |
| `useProgression.js` | คะแนนสะสมและผลรางวัล |
| `useChat.js` | แชทในห้อง |

**widgets (`pages/Arcade/widgets/`):** ชิ้นส่วนหน้าจอ
- ล็อบบี้: `PublicRoomBrowser`, `CreateRoomModal`, `PastMatchesPanel`
- ห้องรอ: `RoomLobbyView`, `RoomSettingsModal`, `RoundFormatChoice`
- ระหว่างรอบ: `BattleRoyaleGameplayView`, `ChoiceRoundPanel` (รอบทาย/ตรวจ)
- ร้านค้า: `ShopPhaseView`, `ShopItemCard`
- สรุป: `RoundSummaryView`, `RoundHistoryPanel`
- ผู้ชม: `SpectatorPanel`
- อื่นๆ: `ChatPanel`, `NotificationStack`

**ไฟล์ช่วยฝั่งเว็บ**
- `debuffVisuals.js` / `typing-debuffs.js`: เอฟเฟกต์ไอเทมก่อกวน (หมึก, แช่แข็ง, สลับปุ่ม ฯลฯ)
- `roundKinds.js`: ข้อความของรูปแบบรอบ
- `spectatorView.js`: ข้อมูลที่ผู้ชมเห็น
- `translations.js`: ข้อความสองภาษาของ Arcade
- `pages/Arcade/bot/`: โปรไฟล์บอทที่แสดงบนจอ

**ฝั่ง server (`server/arcade/`): ตรรกะเกมอยู่ที่นี่ทั้งหมด**

| ไฟล์ | หน้าที่ |
|---|---|
| `lobby-api.js` | สร้างห้อง, ค้นด้วยรหัส `ARC-xxxx`, รหัสผ่านห้อง (bcrypt), ตั้งค่าห้อง |
| `room-api.js`, `room-membership.js` | อ่านสถานะห้อง, เข้า/ออก, สิทธิ์หัวห้อง, เตะ |
| `match-api.js` | เริ่มแมตช์, สุ่มโจทย์ตามความยาก |
| `phase-clock.js`, `match-ticker.js` | **นาฬิกาของแมตช์อยู่ที่ server และใช้เวลาของฐานข้อมูล** ทุก 1 วินาทีจะเลื่อนเฟส (รอบ → สรุป → ร้าน) |
| `phase-finalizer.js` | ปิดรอบ: คิดคะแนน, คัดคนออก, แจกเงิน |
| `submission-api.js` | รับคำตอบแล้วตรวจด้วยตัวตรวจกลาง |
| `code-metrics.js` + `quality-probe.py` | **วัดคุณภาพโค้ดในเครื่อง** (เวลา/ประสิทธิภาพ/มาตรฐาน PEP 8) ไม่ใช้ AI (ADR 0007) |
| `code-judge.js` | รวมคะแนนคุณภาพ + คำแนะนำหลังแมตช์จาก AI ในเครื่อง (ไม่มีผลกับคะแนน) |
| `round-cash.js` | เงินซื้อไอเทมต่อรอบ (พื้นฐาน + อันดับ + โบนัสพลิกเกม) |
| `shop-api.js`, `use-item.js`, `attacks.js`, `self-effects.js` | ร้านค้าและไอเทม 15 ชิ้น |
| `round-kinds.js`, `round-data.js`, `round-problem.js` | **รูปแบบรอบ** (เขียน / ทายผลลัพธ์ / แก้โค้ด AI / ตรวจคำตอบ AI) ข้อมูลคำนวณจากการรันโค้ดจริง (ADR 0010) |
| `bot-coder.js`, `bot-ticker.js`, `bot-api.js` | **บอทเขียนคำตอบจริง** พิมพ์ทีละตัว ซื้อของ เล็งเป้า และถูกตรวจด้วยตัวตรวจเดียวกับคน (ADR 0005) |
| `spectator-api.js` | คนที่ตกรอบดูผู้รอดและทายผู้ชนะ |
| `match-rewards.js` | ปิดแมตช์: จ่ายเหรียญเข้ากระเป๋าเดียวกับบทเรียน (กันจ่ายซ้ำด้วย receipt) |
| `migrate-*.js` | สร้าง/ปรับตารางของ Arcade (migration) |

ค่าคงที่ของเกม (เวลาแต่ละเฟส, ราคา, รางวัล) อยู่ใน `shared/arcadeConfig.json` ซึ่งหน้าเว็บและ server ใช้ไฟล์เดียวกัน

---

## 5. หน้าผู้ดูแล (Admin, Person 2)

| URL | ไฟล์ | ทำอะไร | ฝั่ง server |
|---|---|---|---|
| `/admin/dashboard` | `admin/pages/Dashboard.jsx` | ภาพรวมระบบ | `/api/dashboard/*` → `server.js` |
| `/admin/manage-account` | `admin/pages/ManageAccount.jsx` | จัดการบัญชีผู้ใช้ | `/api/admin/*` → `server.js`, สิทธิ์ → `adminAccess.js`, `auth/admin-principal.js` |
| `/admin/add-lesson/*` | `admin/pages/AddLesson.jsx` (+ `LessonQuizGenerator.jsx`) | เพิ่ม/แก้บทเรียนและสไลด์, ให้ AI ร่างข้อสอบก่อน/หลังเรียน | `lessonAdminRoutes.js`, `lessonQuizAi.js`, อัปโหลดรูป → `uploadRoutes.js` + `assetStore.js` |
| `/admin/theme` | `admin/pages/ThemePage.jsx` | จัดการธีม | `themeRoutes.js` |
| `/admin/student-progress` | `admin/pages/StudentProgressPage.jsx` | ดูความคืบหน้าผู้เรียน | `studentProgressRoutes.js` |
| `/admin/leaderboard` | `admin/pages/Leaderboard.jsx` | กระดานอันดับฝั่งแอดมิน | `server.js` |
| `/admin/competitive-challenge` | `admin/pages/CompetitiveChallengePage.jsx` | โพสต์โจทย์ Competitive รายวัน/รายสัปดาห์ | `/api/competitive/*` → `server.js` |

**สิทธิ์แอดมิน** ตรวจจาก `users.role` ในฐานข้อมูลทุกคำขอ ไม่เชื่อค่าที่เบราว์เซอร์ส่งมา

---

## 6. ฝั่ง server: ไฟล์ที่เป็น "แกน" ของระบบ

| ไฟล์ | หน้าที่ |
|---|---|
| `server/server.js` | **จุดรวม:** สร้าง Express app, ต่อ middleware, ต่อ router ของทุกโมดูล, API ส่วนใหญ่ของบทเรียน/ร้านค้า/โปรไฟล์/Competitive/AI และรายการ migration |
| `server/db.js` | ต่อ PostgreSQL (driver `pg`) แบบเดียวกับ mysql2: `db.query(sql, params)` ใช้ `?` เป็น placeholder และส่งค่าเป็น bind parameter จริง **จึงกัน SQL injection** |
| `server/problemsSchema.js` | โครงคลังโจทย์กลาง: ตาราง `problems` + `problem_modes` (โจทย์ข้อเดียวใช้ได้หลายโหมด) |
| `server/problemGrader.js` | **ตัวตรวจคำตอบตัวเดียวของทั้งระบบ** แบบ `stdio` (ป้อน input เทียบ output) และแบบ `function` (เรียกฟังก์ชันเทียบค่าที่ return) |
| `server/pythonRunner.js` | สั่งรัน Python จริงแบบมี timeout และจำกัดความยาวผลลัพธ์ |
| `server/miniGameGrader.js` | ตัวตรวจของมินิเกม (อ่านกฎเพิ่มเติม เช่น `code_checks`) |
| `server/migrations/` | migration ที่มีเลขเวอร์ชัน + checksum ถ้าโค้ดกับฐานไม่ตรงกัน server จะไม่ยอมบูต |
| `server/auth/` | ล็อกอินผ่าน Supabase Auth, สร้างบัญชีผู้เล่น, ตรวจ origin, นโยบายสิทธิ์ |
| `server/runtime/` | ตรวจค่าตั้งค่าตอนบูต, health check (`/api/health/live`, `/ready`), proxy |
| `server/ai/llm.js` | **ตัวเรียก AI ตัวเดียว** (Ollama ในเครื่อง) แต่ละงานตั้งชื่อโมเดลของตัวเอง |
| `server/ai/localJson.js` | ให้ AI ตอบเป็น JSON (ใช้ตอนสร้างข้อสอบ/โจทย์) |
| `server/arcadeTaskSeed.js` | โจทย์ Arcade 40 ข้อ (สองภาษา) |
| `server/seed-content.sql` | เนื้อหาบทเรียน โจทย์ และแบบทดสอบที่ใส่ตอนสร้างฐานครั้งแรก |
| `server/tutorials.js` | จำว่าผู้ใช้ดูทัวร์ Lumi แล้ว |
| `server/avatar.js` | เลือกรูปโปรไฟล์ที่จะแสดง (ADR 0002) |

**AI ในระบบ: ทั้งหมดรันในเครื่องด้วย Ollama + Typhoon 2.5**

| งาน | ฟังก์ชัน / ไฟล์ |
|---|---|
| Lumi แชท | `POST /api/ai/chat` ใน `server.js` (`withLumiLengthRule`: บังคับตอบสั้นและเป็นผู้หญิง) |
| สร้างโจทย์ Hard Challenge | `generateLearningTaskWithAI` ใน `server.js` (expected มาจากการรันเฉลย) |
| คำแนะนำ Competitive | `adviseOnFailedCompetitiveSubmission` ใน `server.js` |
| คำแนะนำหลังแมตช์ Arcade | `advise()` ใน `arcade/code-judge.js` |
| ร่างข้อสอบ / ร่างโจทย์ Competitive | `lessonQuizAi.js`, `competitiveAi.js` |

**AI ไม่เคยเป็นคนให้คะแนน** คะแนนมาจากการรันเทสจริง + rubric / ตัววัดในเครื่องเสมอ

---

## 6.1 editor เขียนโค้ด Python ทั้งหมดในเว็บ

ทุกจุดใช้ **Monaco Editor** (`@monaco-editor/react`) ตัวเดียวกับ VS Code มีทั้งหมด 5 จุด (ค้นด้วย `<Editor` ในไฟล์)

| หน้า (URL) | ไฟล์ : บรรทัด | ปุ่มที่อยู่คู่กับ editor | ส่งโค้ดไปตรวจที่ |
|---|---|---|---|
| แบบฝึกหัดประจำบท (`/exercise/:id`) | `client/src/pages/ExercisePage.jsx:645` | Run (Pyodide), ส่งคำตอบ | `POST /api/exercises/:id/submit` |
| Debug Lab / Hard Challenge (`/debug`, `/challenge`) | `client/src/components/learning/CodingWorkspace.jsx:428` (หน้า `AiTaskPage.jsx` ใช้ร่วมกัน) | Run, Run Tests, Submit, เปลี่ยนโจทย์ | `POST /api/learning/ai-task/submit` |
| มินิเกม (`/mini-game/:id`) | `client/src/pages/MiNi_Game.jsx:1621` | รันและส่งคำตอบของฉาก | `/api/mini-game/*` → `miniGameGrader.js` |
| Competitive (`/competitive-arena`) | `client/src/pages/CompetitiveArena.jsx:1262` | ทดสอบ, ส่งคำตอบ (บันทึกฉบับร่างอัตโนมัติ) | `POST /api/competitive/challenges/:id/submit` |
| Arcade (`/matchmaking`) | `client/src/pages/Arcade/widgets/BattleRoyaleGameplayView.jsx:369` | ทดสอบโค้ด, ส่ง (เอฟเฟกต์ไอเทมก่อกวนเกิดที่ editor นี้) | `arcade/submission-api.js` |

- **ปุ่ม Run / ทดสอบ:** รัน Python ในเบราว์เซอร์ผ่าน `hooks/usePyodide.js` → `public/pyodideWorker.js` เพื่อดูผลเร็วๆ เท่านั้น
- **การส่งคำตอบ:** ทุกจุดส่ง*โค้ด*ไปให้ server ตรวจด้วย `problemGrader.js` (มินิเกมใช้ `miniGameGrader.js`)
- เลขบรรทัดอาจขยับเมื่อแก้ไฟล์ ถ้าไม่ตรงให้ค้น `<Editor`

---

## 7. เส้นทางข้อมูลที่อาจารย์น่าจะถาม

**ก) ผู้เรียนกด "ส่งคำตอบ" ในแบบฝึกหัด**
1. `ExercisePage.jsx` ส่งโค้ดไปที่ `POST /api/exercises/:id/submit` (ส่งแค่โค้ด ไม่ได้ส่งผลว่าผ่าน)
2. `server.js` ดึงโจทย์และเทสจาก `problems`
3. `problemGrader.gradeSubmission()` เรียก `pythonRunner` รัน Python จริงทีละเทส
4. ถ้าผ่านครบ บันทึกความคืบหน้าและจ่าย XP/เหรียญ (`applyXpRewardToUser`)
   - ข้อที่เคยผ่านแล้ว (`alreadyPassed`) ส่งซ้ำได้รางวัล 0 จึงปั๊มรางวัลไม่ได้
   - `npm run test:submit` ยิง endpoint จริงเพื่อพิสูจน์ข้อนี้
5. ส่งผลแต่ละเทสกลับให้หน้าเว็บแสดง

**ข) หนึ่งรอบของ Arcade**
1. `match-ticker.js` เลื่อนเฟสทุก 1 วินาทีตามเวลาฐานข้อมูล
2. ผู้เล่นพิมพ์ใน `BattleRoyaleGameplayView` แล้ว `useRoundDraft` บันทึกร่างไว้
3. กดส่ง → `useRoundJudging` → `submission-api.js` → `problemGrader` + `code-metrics.js`
4. หมดเวลา → `phase-finalizer.js` รวมคะแนน (เทส + คุณภาพ + เวลา) แล้วคัดคนออกและแจกเงินผ่าน `round-cash.js`
5. ทุกคนเห็นผลผ่าน polling ของ `useRoomLifecycle`

**ค) ทำไมไม่ใช้ WebSocket:** ใช้ REST polling ทุก ~2 วินาที เพราะ deploy ง่ายและรอดการ restart ของ server (state อยู่ในฐานข้อมูล ไม่อยู่ในหน่วยความจำ)

**ง) ทำไมนาฬิกาอยู่ที่ server:** ถ้านับเวลาในเบราว์เซอร์ ผู้เล่นแก้เวลาเองได้ หรือปิดแท็บแล้วเกมค้าง จึงใช้เวลาของฐานข้อมูลเป็นนาฬิกากลาง

**จ) กันโกงยังไง**
- server ตัดสินคำตอบเอง
- เฉลยและเทสที่ใช้ตัดสินไม่ถูกส่งไปเบราว์เซอร์
- query ทุกตัวใช้ parameter (`?`)
- รหัสผ่านห้องเก็บแบบ hash (bcrypt)
- ตัววัดคุณภาพตรวจว่ามีคนพยายามปิดตัวนับหรือไม่

---

## 8. เอกสารอ้างอิงในโปรเจค

- `CLAUDE.md`: กฎของโปรเจคและการแบ่งงาน
- `CONTEXT.md`: อภิธานศัพท์
- `docs/adr/`: เหตุผลของการตัดสินใจสำคัญ (0001 server ตัดสิน, 0005 บอทเขียนจริง, 0007 คุณภาพวัดในเครื่อง, 0010 รูปแบบรอบ)
- `docs/arcade-map.md`: แผนผัง Arcade
- `docs/llm-benchmark/`: ผลทดสอบ AI
- `เนื้อหาล่าสุด.md`: สรุปทั้งโครงงานสำหรับทำรูปเล่ม
