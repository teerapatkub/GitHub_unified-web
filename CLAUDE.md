# CLAUDE.md

This file provides guidance to AI assistants when working with code in this repository.

## Project Overview

PySim (Python Coder Game) is a Thai-language web app for teaching Python to beginners. It combines a structured lesson curriculum with gamified progression (levels, XP, coins, promotion exams), AI-generated exercises/challenges, and an optional "developer life simulation" mode.

**Master Design Document**: Refer to `project_logs/project_discription.txt` before making structural changes. Note: the system uses PostgreSQL on port 5432 (see Database section below).

---

## 👥 Team Responsibilities & Task Scopes

The project is divided among three team members. **Always respect these boundaries:**

### Person 1 (คนแรก): Learning System & Gamification Core
- **Curriculum & Lessons**: 8 chapters / 24 sub-lessons (`LearningPage.jsx`, `LessonPage.jsx`).
- **Exercises & Challenges**: Practice workspace (`ExercisePage.jsx`, `ChallengePage.jsx`).
- **Promotion Exams**: Level progression exams (`PromotionExamPage.jsx`).
- **Gamification**: XP, level calculations, coin rewards from learning.
- **Client-side Execution**: Pyodide Web Worker (`usePyodide.js`, `pyodideWorker.js`).

### Person 2 (คนที่สอง): Admin Panel & Competitive Arena
**รวมเข้า repo นี้แล้วเมื่อ 2026-08-25** (พร้อมกับ Person 1 ที่รวมไปเมื่อ 2026-08-20)
- **Admin System**: Admin pages and components (`client/src/admin/*`, `AdminNavbar.jsx`)
  รวมหน้าใหม่ `admin/pages/CompetitiveChallengePage.jsx` ที่ `/admin/competitive-challenge`
- **Competitive Arena**: 1v1 ranked competitive mode (`CompetitiveArena.jsx`)
  เข้าได้ทั้ง `/online` (ของเดิม) และ `/competitive-arena` (path ที่ Person 2 ใช้)
  ตรวจคำตอบด้วยการรัน Python จริงผ่าน `child_process` แล้วให้ AI ให้คะแนนคุณภาพโค้ดต่อ
- **Global Leaderboard**: `GET /api/competitive/leaderboard`, `GET /api/competitive/admin/overview`
- **Mailbox & Password Reset**: `/api/mailbox/*` และ `/api/password/{forgot,reset}`
- **Theme Management**: Admin theme customization (`ThemePage.jsx`)

### Person 3 (คนที่สาม - Current Workspace Focus / User): Arcade Battle Royale & Overall System Architecture
- **Arcade Coding Battle Royale**: Real-time 5-player party survival mode (`client/src/pages/ArcadeBattleRoyale.jsx`).
- **PostgreSQL Database Integration**: Tables `arcade_rooms`, `arcade_participants`, and `arcade_tasks` in `server/db.js`.
- **Bot AI Engine**: Autonomous bot opponents in `client/src/bot/` (`botAI.js`, `botManager.js`, `botProfiles.js`).
- **Sabotage & Item Systems**: Real-time visual debuffs (Ink Fog, Freeze, Mirror Code, Screen Dimmer, Screen Shake, etc.).
- **Room Management & Host Controls**: Room creation, 4-character room code search (`ARC-xxxx`), password protection, host transfer, bot adding/kicking, and post-match choices (Leave vs. Remain).

---

## Repository Layout

- `client/` — React 19 + Vite frontend (port 5174, dev-proxies `/api` to `http://localhost:3001`).
- `server/` — Node/Express backend (port 3001), main API in `server/server.js`.
- `project_logs/` — Work logs and master project description doc (`project_logs/YYYY-MM-DD/`).
- `prototype/` — Historical prototype files (now fully migrated into `client/src/pages/ArcadeBattleRoyale.jsx`).

---

## Common Commands

Frontend (run from `client/`):
```bash
npm run dev       # Vite dev server on :5174, proxies /api to :3001
npm run build     # Production build
npm run lint      # ESLint (flat config in eslint.config.js)
npm run preview   # Preview production build
```

Backend (run from `server/`):
```bash
npm start                   # Start API on :3001
npm run dev                 # Start with auto-restart (nodemon)
npm run test:arcade         # Arcade regression suite (see server/scripts/arcade-tests/README.md)
```

---

## Backend & Database Architecture

- **Backend Express Server**: `server/server.js` handles API routes for learning, simulation, and Arcade Battle Royale (`/api/arcade/rooms/*`, `/api/arcade/tasks`, `/api/arcade/evaluate`).
- **PostgreSQL Database Layer (`server/db.js`)**:
  - ใช้ driver `pg` (Pool) ต่อ PostgreSQL พอร์ต 5432 — **เปลี่ยนมาจากโค้ดที่คุย wire protocol
    กับ socket เองเมื่อ 2026-08-25** ตอนรวมโปรเจคของ Person 2 ที่เขียนชั้นนี้ไว้ดีกว่า
  - ยังคง interface แบบ mysql2 ไว้เหมือนเดิมทุกอย่าง: `const [rows] = await db.query(sql, params)`
    ด้วย `?` placeholder, `db.execute()`, และ `db.getConnection()` ที่มี
    `beginTransaction/commit/rollback/release` — โค้ดใน `server.js` จึงไม่ต้องแก้สักจุด
  - **ค่าพารามิเตอร์ถูกส่งเป็น bind parameter จริง** (`?` → `$1, $2, ...`) ไม่ได้ถูกแปลงเป็น
    literal แล้วต่อเข้าไปในสตริง SQL เหมือนของเดิมอีกแล้ว
  - ตั้ง type parser ให้ `int8` และ `numeric` คืนค่าเป็น Number ไม่ใช่ string
    (ค่าเริ่มต้นของ `pg` คืนเป็น string — โค้ดที่เอา `COUNT(*)` ไปบวกลบจะพังเงียบๆ ถ้าไม่ตั้ง)
  - สร้างและ seed ตารางทั้งหมดเองตอนบูต: `arcade_*` (คลังโจทย์ 40 ข้อจาก `server/arcadeTaskSeed.js`),
    เซ็ตเครื่องแต่งตัวในร้านค้า, ความสำเร็จ 20 รายการ และแบบสำรวจตอนสมัคร
  - ตาราง `multiplayer_*`, `active_accepted_challenges`, `user_mailbox` และ `password_reset_tokens`
    ของ Competitive Arena ถูกสร้างตอนบูตผ่าน `ensureMergedSchemas()` ใน `server/server.js`

### Database Connection (Local Dev)
- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`

⚠️ นี่คือ credential สำหรับ local dev เท่านั้น — ห้าม hardcode ค่านี้ในโค้ดใหม่ ให้อ่านผ่าน environment variable (`.env`) เสมอ และห้าม commit ไฟล์ `.env` ลง git

### Database Rules
- **ห้ามรัน `DROP TABLE`, `TRUNCATE`, หรือคำสั่งที่ลบ/รีเซ็ตข้อมูลจริงในตาราง `arcade_rooms`, `arcade_participants`, `arcade_tasks` โดยไม่ถามยืนยันจากผู้ใช้ก่อนทุกครั้ง**
- การแก้ไข schema ต้องทำผ่านโค้ดใน `server/db.js` (จุดเริ่มต้นและ seed logic) เท่านั้น ห้ามแก้ตรงในฐานข้อมูลแบบ manual แล้วไม่สะท้อนกลับมาที่โค้ด
- Query ทั้งหมดต้องใช้ parameterized query ด้วย `?` placeholder ตาม MySQL-compatibility wrapper ที่มีอยู่แล้ว ห้าม string concatenation สร้างคำสั่ง SQL โดยเด็ดขาด (ป้องกัน SQL injection)
- ก่อนแก้ไขโครงสร้างตาราง `arcade_*` ให้ตรวจสอบผลกระทบกับ Bot AI Engine และ Room Management ก่อนเสมอ เพราะพึ่งพา schema เดิมอยู่มาก

---

## Frontend Architecture & Bot System

- **Routing**: Defined in `client/src/App.jsx` using React Router.
- **Arcade Battle Royale**: Located at `client/src/pages/ArcadeBattleRoyale.jsx`.
- **Bot AI Engine (`client/src/bot/`)**:
  - `botProfiles.js`: 4 Bot AI personas (`Speed Coder`, `Saboteur`, `Revenge Seeker`, `Balanced Pro`).
  - `botAI.js`: `BotAIEngine` class controlling coding progress simulation, cash management, shop purchases, and attack targeting.
  - `botManager.js`: `BotManager` class driving real-time attack callbacks, applying visual debuffs to the player, and handling shield defenses.
  - **Live & Fully Integrated**: Wired directly into `ArcadeBattleRoyale.jsx` timer loop and player interaction handlers.
- **i18n & Bilingual Support**: Uses `react-i18next`. Arcade tasks in PostgreSQL store both Thai (`title_th`, `desc_th`) and English (`title_en`, `desc_en`) rendered dynamically based on current language.

---

## Multiplayer / Real-time Mechanism

Arcade Battle Royale room state and participant updates run via REST polling endpoints under `/api/arcade/rooms/*` and internal state tick loops in `ArcadeBattleRoyale.jsx`.

---

## Code Style
- ใช้ ES modules (`import`/`export`) ไม่ใช้ `require`
- Component ตั้งชื่อแบบ PascalCase ตามที่มีอยู่แล้ว (`ArcadeBattleRoyale.jsx`, `ThemePage.jsx`)
- ให้ ESLint (`eslint.config.js`) เป็น source of truth เรื่อง formatting — ไม่ต้องเขียนกฎ spacing/quote ซ้ำที่นี่

## คลังโจทย์ — ตารางเดียว `problems` + `problem_modes`

โจทย์เขียนโค้ดทุกข้อของทั้งสามคนอยู่ในสองตารางนี้ (รวมเมื่อ 2026-08-25) โครงสร้างและเหตุผล
เต็มอยู่ที่หัวไฟล์ `server/problemsSchema.js` — **อ่านก่อนแก้อะไรที่เกี่ยวกับโจทย์**

| ตาราง | เก็บอะไร |
|---|---|
| `problems` | ตัวโจทย์ (สองภาษา, starter/solution, `test_kind`, `test_cases` ที่ normalize แล้ว) |
| `problem_modes` | ทะเบียนว่าโหมดไหนใช้โจทย์ข้อนั้น + ค่าเฉพาะโหมด (บทเรียน, ลำดับ, ความยาก, รางวัล, เวลา) |

เป็นความสัมพันธ์ **many-to-many โดยตั้งใจ** โจทย์ข้อเดียวลงทะเบียนได้หลายโหมด

**`test_kind` มีสองแบบ** — `stdio` (ป้อน stdin เทียบ stdout) และ `function` (เรียกฟังก์ชันด้วย `args`)
รูปแบบ test case ที่ normalize แล้วคือ `[{input, expected}]` และ `[{args, expected}]` ตามลำดับ

### กฎที่ต้องรู้
- **`exercises`, `mini_game_exercises`, `multiplayer_challenges`, `arcade_tasks` เป็น VIEW แล้ว
  ไม่ใช่ตาราง** — อ่านได้เหมือนเดิมทุกจุด แต่ **เขียนไม่ได้** ต้องใช้ `createProblem(mode, {...})`
  ใน `server.js` เท่านั้น (view ตั้งใจให้ไม่ updatable เพื่อให้โค้ดที่เผลอเขียนผ่านชื่อเก่า error ทันที
  แทนที่จะเงียบ)
- **ห้ามเปลี่ยนเลข `entry_id` ของโจทย์ที่มีอยู่** — มี FK 12 เส้นชี้อยู่ และ
  `arcade_rooms.round_task_ids` เก็บ id ของโจทย์ Arcade ไว้ในทุกห้องที่เคยเล่น
- ตารางเดิมถูกเก็บไว้เป็น `*_pre_merge` ยังไม่ลบ — เป็นทั้งของสำรองและตัวเทียบของ
  `npm run test:problems`
- แก้ schema ต้องทำใน `server/db.js` หรือ `server/problemsSchema.js` (ซึ่ง `db.js` เรียก) เท่านั้น
  โค้ดจะปรับฐานให้ตรงเองทุกครั้งที่บูต

```bash
npm run test:problems
```
เทียบทุกแถวทุกคอลัมน์ระหว่าง view กับตารางเดิม โดยเทียบ test case ผ่าน parser ตัวเดียวกับที่
client ใช้จริง ไม่ใช่เทียบข้อความดิบ

---

## การตรวจคำตอบ — ตัวเดียว อยู่ฝั่ง server

`server/problemGrader.js` คือที่เดียวที่ตัดสินว่าคำตอบถูกหรือผิด รันด้วย
`server/pythonRunner.js` (spawn Python จริง มี timeout) **ห้ามเขียนตัวตรวจใหม่ที่อื่น** —
ก่อนหน้านี้มีอยู่ 5 ตัวและไม่ตรงกันเลย สองตัวเทียบด้วย `includes()` ทำให้พิมพ์ `17`
ผ่านโจทย์ที่คาด `7`

**ตัดสินฝั่ง server เท่านั้น** — `POST /api/exercises/:id/submit` และ
`POST /api/learning/ai-task/submit` รับ *โค้ด* ไม่ใช่คำว่าผ่านหรือไม่ผ่าน
Pyodide ฝั่ง client ยังอยู่ แต่มีหน้าที่ให้ผู้เรียนลองรันดูผลเร็วๆ เท่านั้น ไม่ได้ตัดสินและไม่ได้จ่ายรางวัล

**สองแบบของการตรวจ**: `stdio` ป้อน stdin เทียบ stdout · `function` เรียกฟังก์ชันด้วย `args`
เทียบค่าที่ return (ไม่ใช่สิ่งที่ print)

**`input("คำถาม: ")` ถูกกลบ prompt ก่อนเทียบ** — Python พิมพ์ prompt ลง stdout ด้วย
แต่คำตอบที่เก็บไว้ไม่มี prompt นี่คือเหตุผลที่ตัวตรวจเดิมต้องใช้ `includes()` การกลบ prompt
ทำให้เทียบแบบตรงตัวได้โดยไม่ต้องผ่อนกฎ

**`problems.is_auto_gradable = 0`** คือข้อที่ตรวจอัตโนมัติไม่ได้จริง (Flask, matplotlib,
requests, ต้องมีไฟล์อยู่ก่อน, สุ่ม) — 26 ข้อ ระบบจะรับคำตอบไว้โดยไม่ตรวจ
ค่านี้ **คำนวณจากการรันจริง** ไม่ได้เดา: `npm run mark:gradable` เอาเฉลยของทุกข้อไปตรวจ
แล้วบันทึกผล ถ้าติดตั้งไลบรารีเพิ่มให้รันสคริปต์นี้ใหม่ ตัวเลขจะลดลงเอง

```bash
npm run test:grader   # เฉลยทุกข้อที่ตรวจได้ต้องผ่านเทสของตัวเอง + ตัวตรวจต้องปฏิเสธของผิด
npm run test:submit   # ยิง endpoint จริงว่าโกงเอา XP/ทองไม่ได้
npm run mark:gradable # (--apply) คำนวณ is_auto_gradable ใหม่
```

---

## สองภาษา — โจทย์ทุกข้อมีไทยและอังกฤษ

โจทย์ทั้ง 192 ข้อมี `title_en` / `desc_en` (และ `hint_en` ถ้ามี hint ไทย) ครบทุกแถวใน `problems`
เดิมมีแค่ Arcade 40 ข้อ อีก 152 ข้อสลับเป็น EN แล้วยังเป็นไทยอยู่

**เติมด้วย `npm run translate:problems`** (`--mode`, `--ids`, `--limit`, `--force`, `--dry`)
รันซ้ำได้และข้ามข้อที่แปลแล้ว ใช้โมเดลเดียวกับแชทบอท (`NVIDIA_API_KEY`/`NVIDIA_AI_MODEL`)
**ห้ามชี้ไปคีย์ของตัวตรวจโค้ด Arcade**

**แปลเฉพาะร้อยแก้ว** — title, description, hint เท่านั้น
**ห้ามแตะ `starter_code`, `solution_code`, `test_cases`** เพราะคือสิ่งที่ใช้ตัดสินคำตอบ

**13 ข้อที่คำตอบต้องพิมพ์ข้อความภาษาไทย** (เช่น `expected: "ยินดีต้อนรับสู่บทเรียน Python"`)
คำอธิบายภาษาอังกฤษต้องคงสตริงไทยนั้นไว้ตามตัวอักษร ถ้าแปลไปด้วยโจทย์จะพังทันที
และคนตอบถูกจะถูกตัดสินว่าผิดโดยไม่มี error ที่ไหนเลย สคริปต์จึงส่งสตริงพวกนี้ไปกับ prompt
ในชื่อ `MUST_PRINT` แล้วตรวจในคำตอบก่อนเขียนลงฐาน

```bash
npm run test:bilingual              # ตรวจว่าครบ + โค้ด/test case ไม่ถูกแตะ
node scripts/bilingual-check.js --snapshot   # บันทึก baseline ใหม่ (เมื่อเพิ่มโจทย์)
```
เทียบ hash ของ `starter_code`+`solution_code`+`test_kind`+`test_cases` กับ
`scripts/problem-code-baseline.json` ที่บันทึกไว้ก่อนแปลรอบแรก

**ฝั่ง client** ใช้ `client/src/utils/problemText.js` — ขอภาษาไหนได้ภาษานั้น
ถ้ายังไม่มีให้ได้อีกภาษาแทน **ไม่ใช่ช่องว่าง** (ของเดิมใน Arcade คืนช่องว่าง)
view `exercises`, `mini_game_exercises`, `multiplayer_challenges` เพิ่มคอลัมน์
`title_en` / `description_en` ให้แล้ว โดยคอลัมน์ไทยยังชื่อเดิมทุกตัว

---

## AI Models — แยกกัน 3 ที่ อย่ารวม

| ใช้ทำอะไร | ฟังก์ชัน | ตั้งค่าที่ |
|---|---|---|
| แชทบอท Lumi + สร้างโจทย์ฝึก | `callAiChat()` | `NVIDIA_API_KEY`, `NVIDIA_AI_MODEL` |
| ตรวจคุณภาพโค้ดใน Arcade | `judgeCodeQuality()` | `NVIDIA_CODE_JUDGE_API_KEY`, `NVIDIA_CODE_JUDGE_MODEL` |
| ให้คะแนนคำตอบใน Competitive Arena | `reviewCompetitiveSubmissionWithAI()` | ใช้ชุดเดียวกับตัวตรวจโค้ด ผ่าน `callCodeJudgeChat()` |

**สองแถวล่างใช้คีย์และโมเดลเดียวกัน** (ย้ายมาเมื่อ 2026-08-25) เพราะทั้งคู่คือการตรวจโค้ด
ในแมตช์ที่กำลังเล่นอยู่ ส่วนแถวบนแยกขาดจากสองแถวล่างเสมอ
**ถ้าปล่อยคีย์หรือชื่อโมเดลของตัวตรวจว่าง ทั้งสองที่จะให้คะแนนในเครื่องแทนโดยไม่ส่งโค้ดออกนอกเครื่อง**

**ห้ามชี้ตัวตรวจโค้ดไปที่โมเดลเดียวกับแชทบอท** — ตัวตรวจทำงานทุกครั้งที่จบรอบของทุกแมตช์
ที่กำลังเล่นอยู่ และทุกครั้งที่มีคนส่งคำตอบในโหมดแข่ง โควตาโทเคนของมันไม่ใช่ที่ว่างให้งานอื่นมาใช้ร่วม

ชื่อโมเดลและคีย์ต้องอ่านจาก `.env` เสมอ ห้าม hardcode เป็น fallback ในโค้ด (ทั้งโปรเจคของ Person 1
และ Person 2 เคยทำแบบนั้น ทำให้คีย์จริงหลุดเข้า git และเปลี่ยนโมเดลทีต้องแก้โค้ด)
เวลาผู้ให้บริการปลดระวางโมเดล จะเห็นเป็น HTTP 404/410 หรือค้างไม่ตอบ — เกิดมาแล้ว 3 ตัว
(`z-ai/glm-5.2`, `deepseek-ai/deepseek-v4-flash-0731`, `moonshotai/kimi-k2.6`)

---

## Security
- ห้าม commit ไฟล์ `.env` หรือ credential ฐานข้อมูลลง git
- รหัสผ่านห้อง (room password) ต้อง hash ก่อนบันทึกลงฐานข้อมูล ห้ามเก็บเป็น plain text
- Validate/sanitize input จากผู้เล่นทุกจุดที่รับข้อมูล (เช่น room code, chat, ชื่อผู้เล่น) ก่อนใช้งานหรือบันทึก

## Workflow
- รัน `npm run lint` ใน `client/` ก่อน commit ทุกครั้ง
- **รัน `npm run test:problems` ก่อน commit ทุกครั้งที่แตะคลังโจทย์หรือ view ทั้งสี่**
- **รัน `npm run test:grader` และ `npm run test:submit` ก่อน commit ทุกครั้งที่แตะการตรวจคำตอบ
  หรือ endpoint ที่จ่ายรางวัล**
- **รัน `npm run test:bilingual` ก่อน commit ทุกครั้งที่แตะข้อความของโจทย์หรือสคริปต์แปล**
- **รัน `npm run test:arcade` ใน `server/` ก่อน commit งานที่แตะคลังโจทย์ การสุ่มโจทย์ ระบบคะแนน หรือบอท**
  ชุดทดสอบอยู่ที่ `server/scripts/arcade-tests/` (มี README อธิบายว่าตัวไหนต้องมี server รันอยู่)
  ชุดนี้จับบั๊กที่ถึงมือผู้เล่นมาแล้ว 2 ตัว — test case ของ "Longest Word" ที่ตัดสินคนตอบถูกว่าผิด
  และ hint 6 ข้อที่เผลอเฉลยคำตอบ ถ้าแก้คลังโจทย์แล้วไม่รัน จะไม่มีอะไรจับให้เลย
- เมื่อแก้ไข Bot AI, Sabotage system หรือ real-time state ให้ทดสอบผ่าน dev server จริงก่อนถือว่าเสร็จ (state ซับซ้อน อ่านโค้ดอย่างเดียวไม่พอ)
- แก้ไขเฉพาะไฟล์ในขอบเขตความรับผิดชอบของตนเอง (ดูหัวข้อ Team Responsibilities) หากจำเป็นต้องแก้ไฟล์นอกขอบเขต ให้แจ้งเตือนผู้ใช้ก่อน
- **ห้ามทำเครื่องหมาย ✅ shipped & verified ให้ feature ใดใน `plan.md` (หรือที่อื่น) โดยไม่มีรายการ scenario ที่ทดสอบจริงแนบท้าย** — "อ่านโค้ดแล้วดูถูกต้อง" ไม่นับ ต้องระบุว่าทดสอบผ่านอะไรบ้าง (เช่น รันผ่าน dev server จริง, ยิง API จริง, เช็คค่าใน DB จริง) กฎนี้เกิดจากการตรวจสอบเมื่อ 2026-08-17 ที่พบว่าหลาย phase ที่เคยติด ✅ ไว้ มีบั๊กจริงที่ผู้เล่นจะเจอ (เช่น modal สร้างห้องไม่ปิด, ซื้อของในร้านค้าไม่หักเงินจริง) ทั้งที่โค้ดผ่านตาแล้วดูเหมือนถูกต้อง ดูรายละเอียดกฎเต็มที่ท้าย `plan.md`

### 📝 บันทึกการทำงาน (Work Log) — บังคับ
**หลังจากแก้ไขโค้ดเสร็จทุกครั้ง ต้องเขียนบันทึกสรุปการทำงานไว้ในโฟลเดอร์ `project_logs/YYYY-MM-DD/`** โดยไฟล์บันทึกควรมีหัวข้อดังนี้:
- วันที่และเวลา
- สรุปสิ่งที่แก้ไข/เพิ่มเข้ามา (ไฟล์ไหนบ้าง)
- เหตุผลของการเปลี่ยนแปลง
- ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ (เช่น กระทบ schema, กระทบ Bot AI)
- สิ่งที่ยังไม่เสร็จหรือต้องทดสอบเพิ่มเติม (ถ้ามี)

ตั้งชื่อไฟล์บันทึกในรูปแบบ: `project_logs/YYYY-MM-DD/HHMM-สรุปสั้นๆ.md`

## Agent skills

### Issue tracker

Issues live as GitHub Issues on the `origin` remote (`github.com/teerapatkub/GitHub_unified-web`), using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` live at the repo root. See `docs/agents/domain.md`.
