# รวมโปรเจคของ Person 1 เข้ากับ project2 และรวมฐานข้อมูล

**วันที่**: 2026-08-21 เวลา 17:28
**ผู้ทำ**: Person 3
**ขอบเขต**: ครั้งนี้แตะไฟล์นอกขอบเขต Person 3 เยอะมาก (หน้าเรียน, admin, server.js ทั้งไฟล์)
เพราะงานที่สั่งคือ "รวมโปรเจค" ซึ่งทำแบบอยู่ในเลนตัวเองไม่ได้

---

## 0. สำรองก่อน

| สิ่งที่สำรอง | ที่อยู่ |
|---|---|
| ไฟล์โปรเจคทั้งหมด + `.git` (785 ไฟล์ 429 MB, ไม่รวม node_modules) | `../unified-web-BACKUP-20260821/` |
| ฐานข้อมูล PostgreSQL ก่อนรวม (custom format + schema-only) | `../unified-web-BACKUP-20260821/db-backup/` |

ยืนยันแล้วว่า backup เป็น git repo ที่ใช้งานได้จริง (HEAD ตรงกัน, ไฟล์ที่ยังไม่ commit ครบ)

---

## 1. เรื่องที่ต้องรู้ก่อน: โฟลเดอร์ที่ได้มาคือ `origin/main` เป๊ะๆ

`preson 1 project/` **เหมือนกับ `origin/main` ทุกไบต์** (เช็คด้วย `git hash-object` ทุกไฟล์ ไม่ต่างเลยสักไฟล์)
แปลว่าไม่ต้องเดาว่าอะไรใหม่กว่า — เทียบผ่าน git ได้ตรงๆ

แต่มีปัญหา: **`project2` กับ `main` ไม่มีบรรพบุรุษร่วมกันใน git** (`git merge-base` คืนค่าว่าง)
`project2` ถูก commit ใหม่เป็น root แยกต่างหาก git จึง merge อัตโนมัติให้ไม่ได้

**วิธีแก้**: หาคอมมิตบน `main` ที่ใกล้จุดแยกที่สุด แล้วใช้เป็น base ทำ 3-way merge เอง
สแกนเทียบไฟล์ร่วม 47 ไฟล์กับทุกคอมมิตบน main พบว่า `b15381e` (2026-04-11) ตรงมากที่สุด (36/47)
→ `project2` แตกออกมาจากสภาพเดือนเมษายน ส่วน main เดินหน้าต่อถึงเดือนสิงหาคม

### กับดักที่เกือบทำให้อ่านผลผิดทั้งหมด
`core.autocrlf=true` — ไฟล์ในเครื่องเป็น CRLF แต่ blob ใน git เป็น LF
รอบแรกที่ผมแฮชไฟล์ดิบๆ มาเทียบ ทำให้ไฟล์ที่ **ไม่ได้แก้เลย** ดูเหมือนถูกแก้ทั้งไฟล์
(Dashboard.jsx, ThemeContext.jsx, FriendLogin.jsx ขึ้นว่า "แก้ทั้งคู่" ทั้งที่เราไม่เคยแตะ)
ต้องแฮชผ่าน `git hash-object --stdin-paths` ให้ git normalize ให้ ผลถึงจะเชื่อได้
หลังแก้: ไฟล์ที่ "เหมือนกันอยู่แล้ว" เพิ่มจาก 32 → 111 และไฟล์ที่ต้อง merge จริงลดจาก 12 → 8

---

## 2. ผลการจัดกลุ่มไฟล์ (หลังแก้เรื่อง CRLF แล้ว)

| กลุ่ม | จำนวน | ทำอะไร |
|---|---|---|
| มีแต่ของเรา | 178 | เก็บไว้ (Arcade, CompetitiveArena, PromotionExam, shared/, arcade-tests) |
| มีแต่ของเขา | 112 | เอาเข้ามา 64 ไฟล์ (ดูด้านล่าง) |
| เหมือนกันอยู่แล้ว | 111 | ไม่ต้องทำอะไร |
| เราไม่เคยแตะ เขาแก้ | 6 | เอาของเขา |
| เขาไม่เคยแตะ เราแก้ | 9 | เก็บของเรา |
| แก้ทั้งคู่ | 8 | merge จริง |

**ที่เอาเข้ามา 64 ไฟล์**: `MiNi_Game.jsx`, `MouseEffectLayer.jsx`, รูป/เสียงมินิเกม 11 ไฟล์,
gif บทเรียน 26 ไฟล์, สคริปต์มินิเกมฝั่ง server 11 ไฟล์, `server/uploads/` 13 ไฟล์, และ `20.8.2569.sql`

**ที่ไม่เอา**: `server/node_modules/` (main commit ไว้ 6,403 ไฟล์ แต่เรา gitignore),
log ทดสอบ 31 ไฟล์, `client.zip`

**ที่เป็นไฟล์เดียวกันแต่คนละที่**: ของเราย้าย `pages/*.jsx` และ `components/{app,os}/*` ไปไว้ใน
`old plan/` แล้ว ถ้าก๊อปของเขาเข้ามาตรงๆ จะได้ไฟล์ซ้ำ 16 คู่ จึงเทียบทีละไฟล์กับ base ว่าใครเดินหน้าไปกว่า:

| ไฟล์ | ผล |
|---|---|
| `ShopPage.jsx` | **ของเขาใหม่กว่า** (26 KB vs 8 KB) → เอาของเขาไปทับที่ `old plan/ShopPage.jsx` |
| `DesktopPage.jsx`, `JobPlatform.jsx`, `DraggableIcon.jsx` | ของเราใหม่กว่า → เก็บของเรา |
| อีก 12 ไฟล์ | เหมือนกัน (ต่างแค่ CRLF) → ไม่ต้องทำอะไร |

---

## 3. ไฟล์ที่ merge จริง 8 ไฟล์

`git merge-file` 3 ทาง ชนกันแค่ 9 จุดในฝั่ง client:

### `App.jsx` (2 จุด)
1. **การกู้ session** — ของเราอ่าน localStorage ตอน render แรกเพื่อกัน deep link เด้งไป `/login`
   ของเขาเพิ่ม `authReady` แล้ว `return null` จนกว่าจะกู้เสร็จ **แก้ปัญหาเดียวกันคนละชั้น เก็บทั้งคู่**
2. **รายชื่อ route** — ของเขาครอบคลุมกว่า เอาของเขา ตัดแค่ `/join-room` กับ `/lobby` ที่ระบบห้อง Arcade แทนที่ไปแล้ว

**การชนกันของ route ที่สำคัญ** (ไม่ใช่ conflict ทางข้อความ แต่เป็นความหมาย):

| route | ของเรา | ของเขา | ตัดสิน |
|---|---|---|---|
| `/online` | CompetitiveArena | OnlineMenu (ต้นแบบเก่า) | **ของเรา** |
| `/matchmaking` | ArcadeBattleRoyale | Matchmaking (ต้นแบบเก่า) | **ของเรา** |
| `/lesson`, `/exercise` | ไม่มี param | เปลี่ยนเป็น `/:lessonId` | **ของเขา** (เจ้าของหน้าเรียน) |
| `/mini-game/:lessonId` | ไม่มี | มี | **ของเขา** |

เหตุผล: ของเขาไม่ได้ "เลือก" OnlineMenu/Matchmaking — เขาแค่แยกสาขาไปก่อนที่ของใหม่จะเกิด

`/achievements` กับ `/simulation` **เก็บ route ไว้** (ชี้ไปที่สำเนาของเราใน `old plan/`)
เพราะฐานข้อมูลของเขามี `simulation_logs` 1,675 แถว = โหมดจำลองถูกใช้จริง ทิ้งไม่ได้
แต่ `MainMenu.jsx` ฉบับที่เราเขียนใหม่ไม่มีปุ่มไปสองหน้านี้แล้ว — **ถ้าอยากให้กดถึงต้องเพิ่มปุ่มเอง**

### `LearningPage.jsx` (1 จุด)
ของเราใช้ `user.progression` จาก server (มี `promotionExamEligible`), ของเขาคำนวณเองจาก `getLevelProgress` + `streak_days`
JSX ข้างล่างใช้ทั้งสองชุด → รวมเป็น "ใช้ค่าจาก server ก่อน ถ้าไม่มีค่อย fallback ไปสูตรฝั่ง client"

### `LessonPage.jsx` (5 จุด) — **เอาของเขาทั้งไฟล์**
เขาเขียนใหม่ทั้ง flow (เกณฑ์ผ่าน post-test 60%, modal สอบไม่ผ่าน, `quizStatusMessage`)
ของเราเปลี่ยน `showSummary` เป็น object `quizResult` แล้วเพิ่ม modal คะแนนรวม
เป็นสอง UX ของ modal เดียวกัน และไฟล์นี้อยู่ในความรับผิดชอบเขา จึงเอาของเขา
**สิ่งที่หายไป**: modal โชว์คะแนน pre-test ทันที และบรรทัด "คะแนนรวมทั้งหมด/ระดับพัฒนาการ" — ขอคืนได้ถ้าต้องการ

### `ExercisePage.jsx`, `index.css` — merge อัตโนมัติได้ ไม่ชน
### `server/.env` — เก็บของเรา (เราเป็น PostgreSQL เขาเป็น MySQL)
### `package-lock.json` — client เอาของเขา, server เก็บของเรา (ของเรามี `scripts` + `openai` เพิ่ม)

### บั๊กที่เจอระหว่างทาง (มีอยู่ก่อนแล้ว ไม่ได้เกิดจากการรวม)
ไฟล์ที่ย้ายเข้า `old plan/` **ไม่เคยแก้ path import** — `../components/os/Window` ชี้ไปที่
`pages/components/` ที่ไม่มีอยู่จริง แก้ให้แล้ว 4 ไฟล์ ตอนนี้ import ทุกอันใน `client/src` resolve ได้หมด
(เรื่องนี้สำคัญเพราะ `/shop` เป็น route ที่ใช้งานจริงและชี้ไป `old plan/ShopPage`)

---

## 4. `server.js` — ตรงนี้ยากที่สุด

ของเรา 4,375 บรรทัด (PostgreSQL) ของเขา 6,750 บรรทัด (**MySQL**)
`git merge-file` ให้ conflict 20 จุด สามจุดใหญ่ 1,107 / 690 / 665 บรรทัด — merge ทางข้อความไม่ไหว

**เปลี่ยนวิธี: ดูว่า client ที่ merge แล้วเรียก endpoint อะไรบ้าง แล้วเติมเฉพาะที่ขาด**

เขียนเครื่องมือเทียบ URL ที่ client อ้างถึงกับ route ที่ server มีจริง → ขาดอยู่ 20 endpoint
(`/api/exercises/*`, `/api/lessons/:id/quiz-results`, `/api/mini-game/modules/*`,
`/api/dashboard/*`, `/api/admin/users/*`, `/api/presence`, `/api/upload`)

ย้ายเข้ามาพร้อม helper ที่มันเรียกถึงอีก 21 ตัว (~1,340 บรรทัด)

### เครื่องมือดึงโค้ดต้องเขียนใหม่ 3 รอบ
1. นับวงเล็บเอง → พังเพราะเจอ arrow function หลายบรรทัด (`normalizeLessonTitle` ได้มาแค่บรรทัดเดียว)
2. ใช้กฎ "บรรทัดที่เริ่มคอลัมน์ 0 คือ unit ใหม่" → พังเพราะไฟล์เขามี `const [rows] = await db.execute(`
   เขียนชิดซ้ายอยู่ **กลางตัว handler** ทำให้ตัด handler ขาดกลาง
3. **ใช้ acorn parse จริง** (มีอยู่แล้วใน `client/node_modules`) → ถูกต้อง

บทเรียน: อย่าแยกโค้ด JS ด้วย regex/นับวงเล็บ ในเมื่อมี parser จริงให้ใช้อยู่แล้ว

### SQL ที่ต้องแปลง MySQL → PostgreSQL
แปลงที่จุดเรียกใช้ (เพราะต้องระบุ conflict target ที่ regex เดาไม่ได้):
- `ON DUPLICATE KEY UPDATE` 5 จุด → `ON CONFLICT (...) DO UPDATE SET` (เช็ค unique constraint ทุกตัวแล้วว่ามีจริง)
- `SUBSTRING_INDEX(GROUP_CONCAT(x ORDER BY y DESC), ',', 1)` → `(array_agg(x ORDER BY y DESC))[1]`

แปลงแบบทั่วไปใน `normalizeSql()` ของ `db.js`:
- ตัด `ENGINE=`, `DEFAULT CHARSET=`, `COLLATE=`, `CHARACTER SET`, `KEY xxx (...)` ที่ติดมากับ DDL
- `DATE_ADD/DATE_SUB(x, INTERVAL n UNIT)` → `x ± INTERVAL 'n units'`
- `CURDATE()` → `CURRENT_DATE`
- `CAST(x AS UNSIGNED)` → ดึงตัวเลขนำหน้า (`mini_game_exercises.exercise_order` เก็บค่าอย่าง `'1A'`, `'START'`
  ถ้า cast ตรงๆ Postgres จะ error ส่วน MySQL คืน 0)
- **`TINYINT(1)` เปลี่ยนจาก `BOOLEAN` เป็น `SMALLINT`** — ดูหัวข้อถัดไป

---

## 5. เรื่อง boolean — ปัญหาเชิงสถาปัตยกรรมที่โผล่มาตอนรวม

`db.js` แปลง `TRUE`→`1`, `FALSE`→`0` ในตัว SQL และ `literal()` แปลง boolean ของ JS เป็น `1`/`0`
แปลว่า **ผ่าน layer นี้เขียน query ที่เทียบกับคอลัมน์ BOOLEAN ไม่ได้เลย** — `WHERE is_active = 1` จะได้
`operator does not exist: boolean = integer` (คอมเมนต์ใน `db.js` บรรทัด 474 ก็เขียนไว้แล้วว่า
arcade ใช้ INTEGER เพราะเหตุนี้)

ตารางที่ restore มาจาก dump ของเขาเป็น BOOLEAN จริง → แปลงคอลัมน์ boolean ทั้ง 15 ตัวใน `public` เป็น `smallint`
ให้ตรงกับที่ layer นี้ต้องการ

**เรื่องนี้กระทบโค้ดเดิมของเราด้วย ไม่ใช่แค่ของเขา**: เรามี `simulation_saves ... is_active = 1` อยู่กว่า 30 จุด
ซึ่งเป็นโค้ดที่ตายมาตลอดเพราะตาราง `simulation_saves` ไม่เคยมีในฐานข้อมูลเรา พอ import เข้ามาก็จะพังทันที

---

## 6. รวมฐานข้อมูล

`20.8.2569.sql` ไม่ใช่ MySQL dump — เป็น **PostgreSQL custom dump** (pg_dump 18.6, ฐาน `DB`, schema `fullprojectpython`)
ดูประวัติ git แล้วเข้าใจ: คอมมิต `0a47824` เขาลองย้ายไป Postgres เอง (เขียน `normalizePostgresQuery`)
แล้ว **ย้อนกลับเป็น MySQL** ใน `f100502` พร้อม commit dump ที่ได้จากตอนย้ายเข้ามา
→ โค้ดที่ส่งมาเป็น MySQL แต่ข้อมูลที่ส่งมาเป็น Postgres

**วิธีทำ**: restore dump เข้าเป็น schema `fullprojectpython` ใน **ฐานเดียวกับเรา** แล้ว merge ด้วย SQL ธรรมดา
ทั้งหมดรันใน transaction เดียว (rollback ไป 3 รอบระหว่างพัฒนา ไม่มีข้อมูลเสียหาย)

### ผลตรวจก่อนรวม: เนื้อหาบทเรียนของเรา**พังอยู่แล้ว**
`modules.title` ของเราเก็บเป็นตัว `?` ล้วน (0x3f) — ภาษาไทยหายตั้งแต่ import ครั้งไหนสักครั้ง

| ตาราง | แถวที่เป็น `???` |
|---|---|
| modules.title | 9/9 |
| lessons.title | 12/21 |
| exercises.title | 8/8 |
| quiz_questions.question_text | 19/19 |
| question_choices.choice_text | 22/68 |

ของ arcade / shop_items / cosmetics **ไม่พัง** (0 แถว) — เสียเฉพาะกลุ่มบทเรียน
ซึ่งเป็นกลุ่มเดียวกับที่จะแทนที่ด้วยของเขาพอดี → การรวมครั้งนี้ไม่ใช่แค่เพิ่มเนื้อหา แต่**ซ่อมข้อมูลที่พังอยู่**

### สิ่งที่ทำ (ตามที่ผู้ใช้เลือก: ใช้ DB เราเป็นฐาน + เก็บผู้ใช้ทั้งสองฝั่ง)

| ขั้น | ผล |
|---|---|
| users | 19 → 27 คน, ของเขาได้ id ใหม่ 28-35, remap FK ตามไป 1,721 แถว |
| เนื้อหาบทเรียน | lessons 21→24, slides 27→**220**, quizzes 10→38, questions 19→**190**, choices 68→**488**, exercises 8→**120** |
| ตารางใหม่ของเขา | ย้ายเข้า `public` 26 ตาราง (mini_game_*, simulation_*, contracts, assets ฯลฯ) |
| shop_items | 6 → 8 (id 12/13 ของเขาไม่ชนกับ 34-42 ของเรา) + เพิ่ม 5 คอลัมน์ที่โค้ดเขาอ่าน |
| foreign key | ถอด 17 เส้นที่ยังชี้ไป staging schema → remap id → ต่อกลับชี้ `public` ครบ 17/17 |
| sequence | reset 62 ตัวให้ตรงกับข้อมูลหลังรวม |
| enum type | ย้าย 9 type ที่ตารางใน public ยังอ้างถึงใน staging schema ตามมาด้วย |

หลังรวม: **0 แถวที่เป็น `???`** ทุกตาราง ภาษาไทยแสดงถูกต้อง

### สิ่งที่ไม่ได้เอาเข้า และเหตุผล
1. **exercise 251-255 (5 ข้อ)** ชี้ไป `lesson_id = 25` ที่ **ไม่มีอยู่จริงในฝั่งเขาด้วย**
   (ตาราง exercises ของเขาไม่มี FK ไป lessons ของจึงหลุดมาได้)
   เป็นชุดงานที่ดูตั้งใจทำ: สร้างเมนู CLI / บันทึก JSON / เพิ่มรายการ / ค้นหา / Manager Class
   **ไม่สร้าง lesson 25 ปลอมขึ้นมาเอง** — ยังอยู่ใน schema `fullprojectpython` ถ้าจะเอากลับ ให้สร้าง lesson 25 ก่อน
2. **exercise 164** (`ดึงข้อมูลจากตาราง`) `test_cases` เป็น JSON ที่ปิดวงเล็บไม่ครบ
   ข้อนี้จะตรวจคำตอบไม่ได้บนเครื่องเขาเหมือนกัน — ซ่อมให้แล้วตอน import

### `simulation_saves` — เลี่ยงการลบข้อมูล
โค้ดเรามีระบบ 3 ช่องเซฟ (`slot_number`, `is_locked`) แต่ตารางของเขาไม่มีสองคอลัมน์นี้
`server/db_migration_saves.js` ของเราเองมีไว้แก้เรื่องนี้ แต่มัน **ลบเซฟที่เกินช่องที่ 3 ทิ้ง**
ซึ่ง user 28 มีเซฟอยู่ 7 อัน → ไม่รันสคริปต์นั้น แต่ให้ slot กับ 3 อันล่าสุด
อีก 4 อันปล่อย `slot_number` เป็น NULL (มองไม่เห็นใน UI แต่ข้อมูลยังอยู่ครบ)

---

## 7. ทดสอบอะไรบ้าง

| การทดสอบ | ผล |
|---|---|
| `node --check` ทั้ง server.js และ db.js | ผ่าน |
| ไม่มี declaration หรือ route ซ้ำหลัง merge (ตรวจด้วย acorn) | ไม่มีเลย |
| import ทุกอันใน `client/src` resolve ได้ | ผ่าน (แก้ไป 4 ไฟล์) |
| `npm run build` (client) | ผ่าน |
| `npm run lint` | 90 ปัญหา เทียบ baseline 77 — ที่เพิ่มมาจากไฟล์ใหม่ของเขา (MiNi_Game 7, ExercisePage 5) **ไม่มี error ใหม่จากการ merge เอง** (App.jsx เพิ่มแค่ warning ของ hook ที่ติดมากับโค้ดเขา) |
| ยิง **ทุก GET route** (50 เส้น) | **0 เส้นพัง** (200×44, 400×4, 404×2) |
| ยิง POST ที่เป็น upsert 3 เส้น × 2 รอบ | ผ่านทั้งหมด รอบสองเข้า ON CONFLICT จริง — ไม่เกิดแถวซ้ำ และไม่แจก XP ซ้ำ |
| **ตรวจ SQL ทุกคำสั่งแบบ static** (285 คำสั่ง ผ่าน `normalizeSql` แล้ว `PREPARE` กับฐานจริง) | **270 ผ่าน, 9 สรุปไม่ได้, 6 ที่ถูกปฏิเสธเป็น artifact ของการแทน placeholder ทั้งหมด** |
| `npm run test:arcade` | ผ่านทั้งชุด (458 assertions + 7 score-bounds + 7 draw + bot skill) |
| log ตอน server บูตและระหว่างยิง | ไม่มี error |

**ตัว static SQL check สำคัญ** เพราะมันไปถึง code path ที่ต้อง POST ถึงจะเจอ ซึ่งยิงมือเปล่าไม่ครบ
เก็บเข้า repo แล้วที่ `server/scripts/sql-dialect-check.js` (รันด้วย `npm run check:sql`)
มันดึง `normalizeSql()` ออกมาจาก `db.js` ตรงๆ จึงไม่มีทางหลุดจากของจริงเวลามีคนแก้ db.js

**ทดสอบตัวเครื่องมือเองด้วย**: แอบใส่ query ที่ SELECT คอลัมน์ที่ไม่มีอยู่จริงเข้าไป
มันจับได้ทันทีพร้อมเลขบรรทัด แล้วคืนไฟล์กลับสภาพเดิม (diff แล้วเหมือนเป๊ะ)
ถ้าไม่ลองแบบนี้ ตัวตรวจที่พังจะให้ผลหน้าตาเหมือนโค้ดที่ไม่มีบั๊กเป๊ะ

### บั๊กที่ตัวเองทำแล้วจับได้
ตอนแรกใส่กฎ `"" → ''` ลงใน `normalizeSql` แบบเหมารวม ผลคือมันไปแก้ JSON ที่อยู่ใน string literal ด้วย
ทำให้ **การ seed คลังโจทย์ arcade ตอนบูตพัง** (`invalid input syntax for type json`)
จับได้จาก log ตอนบูต ไม่ใช่จากการยิง endpoint → ถอดกฎออก แล้วแก้ที่จุดเดียวที่ต้องแก้จริง (`"" AS last_output`)
บทเรียน: การ replace ทั้งสตริง SQL แบบไม่ดูว่าอยู่ใน literal หรือเปล่า อันตราย
(`.replace(/\bTRUE\b/g,'1')` ที่มีอยู่เดิมก็มีความเสี่ยงแบบเดียวกัน — ยังไม่ได้แก้)

---

## 8. เรื่องที่ต้องตัดสินใจต่อ / ยังค้าง

1. **ความปลอดภัย (เร่งด่วน)**: `origin/main` **commit `client/.env` และ `server/.env` เข้า git**
   มี API key และรหัสผ่าน Gmail ของ Person 1 อยู่ในประวัติ repo ที่แชร์กัน
   → ควรเปลี่ยนรหัส/คีย์ทั้งหมด และเอาออกจาก tracking (branch เรา gitignore ถูกอยู่แล้ว)
2. **endpoint ที่ client เรียกแต่ไม่มีใน server ทั้งสองฝั่ง** (มีมาก่อนแล้ว ไม่ใช่ผลจากการรวม):
   - `/api/learning/promotion-exam` + `/submit` — `PromotionExamPage.jsx` เรียกอยู่
   - `/api/themes` — `ThemePage.jsx` (Person 2)
   - `/api/mini-game/modules/:id/end-dialogues` — `MiNi_Game.jsx`
3. `MainMenu.jsx` ไม่มีปุ่มไป `/achievements` และ `/simulation` แล้ว (route ยังอยู่ เข้าตรงได้)
4. modal สรุปคะแนนแบบเดิมของเราใน `LessonPage` หายไป — ขอคืนได้
5. schema `fullprojectpython` ยังอยู่ในฐานข้อมูลเป็นข้อมูลอ้างอิง (ไม่มีตารางใน `public` พึ่งพาแล้ว) ลบได้เมื่อพร้อม
6. `NVIDIA_GLM_API_KEY` ถูกอ่านในโค้ดแต่ไม่มีใน `.env`
7. ยังไม่ได้ commit — ตามที่ตกลงไว้ก่อนหน้านี้
8. **ยังไม่ได้ทดสอบบนหน้าจอจริง** — ที่ทำคือระดับ API และ build เท่านั้น
   หน้าเรียน/มินิเกม/dashboard ที่รวมเข้ามาควรกดดูจริงก่อนถือว่าเสร็จ

---

## 9. ไฟล์ที่ลบ

`preson 1 project/` (223 MB) — ตรวจแล้วว่าทุกไฟล์ตรงกับ `origin/main` ทุกไบต์
กู้คืนได้ด้วย `git checkout origin/main -- .`

สแกนหาไฟล์เนื้อหาซ้ำในทรีที่รวมแล้ว: **การรวมไม่ได้สร้างไฟล์ซ้ำขึ้นมาใหม่เลย**
ที่ซ้ำอยู่มีมาก่อนแล้วทั้งหมด — `client/.agent/` กับ `client/.agents/` (เหมือนกันทั้งโฟลเดอร์),
`backup_python_coder_game_before/after.sql` (ไฟล์เดียวกัน), และรูปใน `server/uploads/` ที่อัปซ้ำหลายชื่อ
(อันหลังนี้ **ห้ามลบมั่ว** เพราะ `shop_items.asset_url` อ้างชื่อไฟล์ตรงๆ)
