# คลังโจทย์ในฐานทดสอบที่ใช้ร่วมกันถูกเขียนทับ: สาเหตุ ผลกระทบ และสคริปต์ซ่อม

**วันที่:** 2026-10-22 20:00 (Asia/Bangkok) — Person 3 (สถาปัตยกรรมรวม)
**ฐานที่ตรวจ:** Supabase project เดิม `qfsrpupgxwsofdrzbwdw` (`DATABASE_URL` ใน `server/.env`)

ทุกคำสั่งที่ยิงไปฐานนี้รันใน `BEGIN TRANSACTION READ ONLY` และ `pg_dump` ก็อ่านอย่างเดียว
ไม่ได้เขียนอะไรลงฐานทดสอบหรือ production

## สรุป

- `test_cases` ของโจทย์ทั้ง 193 ข้อถูกเขียนทับเป็น object `{"isinstance": [], "code_checks": [], "correctness": []}`
  - `correctness` ว่างทุกข้อ ยกเว้น 3 ข้อด้านล่าง → **ข้อมูลเดิมไม่เหลือในแถวเลย** derive กลับจาก `correctness` ไม่ได้
  - ตัวตรวจจึงเห็น 0 test case ทุกข้อ: Competitive ขึ้น "ผ่าน test cases 0/0"
  - `sim:bots` ฟ้องว่า "reference answer does not pass its own tests"
  - `test:problems` และ `test:grader` crash ด้วย `cannot extract elements from an object`
- โจทย์ 3 ข้อถูกแทนเนื้อหาทั้งข้อเป็น "สวัสดี / Hello World / `print("Hello")`"
  - ข้อที่โดน: #121 minigame, #140 competitive, #158 arcade (ทั้งสามเป็น entry 1 ของโหมดตัวเอง)
  - `problem_modes.extra` ของสามแถวนี้กลายเป็น `{}`
    - arcade เสีย `work_chars`
    - minigame เสีย `rules` / `expected_format` ของทางแยกเรื่อง
    - competitive เสีย `is_test` / `expires_at`
- ทะเบียน minigame #8–#19 (problem 128–139) หายไป 12 แถว
  - `pg_stat_user_tables.n_tup_del` ของ `problem_modes` = 12
  - ตัวโจทย์ยังอยู่ แต่ไม่ได้ผูกกับโหมดไหน

## เกิดเมื่อไร

- `problems.updated_at` เก็บเป็น UTC (Supabase ตั้ง `TimeZone = UTC`)
- 190 แถว = `2026-10-20 20:40:18.195688` และ 3 แถว = `20:41:18.150611`
  - คือ **2026-10-21 03:40 และ 03:41 เวลาไทย** (ไม่ใช่ 20:40 ตามที่ brief เข้าใจ)
- 190 แถวมีเวลาเดียวกันถึงระดับไมโครวินาที แปลว่าเขียนใน transaction เดียว
- เหตุการณ์ก่อนหน้า:
  - 02:00 เวลาไทย: เพิ่งเล่นทดสอบบนฐานนี้ (`project_logs/2026-10-21/0200-playtest-medium-hard-on-test-db.md`)
    - ก่อนเล่นผู้ใช้รีเซ็ตรหัสฐาน และ `pg_stat_activity` ไม่มี connection อื่นทำงาน
  - `problem_modes.updated_at` ล่าสุด = 19:23:50 UTC (02:23 เวลาไทย)
    - คือครั้งสุดท้ายที่ server ของ repo นี้บูตกับฐานนี้ เพราะ seed Arcade ตอนบูตอัปเดตแถว arcade ทุกครั้ง
  - หลัง 03:40 ไม่มี server ของ repo นี้บูตกับฐานนี้อีก ถ้ามี โจทย์ arcade 40 ข้อจะถูกซ่อมเองแล้ว (ดูหัวข้อ "บูตแล้วซ่อมเองไหม")
- **ผู้ที่เขียนต้องมีรหัสผ่านใหม่ที่ตั้งตอน 02:00**

## ใครหรืออะไรเป็นคนเขียน — หาไม่เจอใน repo

ค้นแล้ว ไม่พบโค้ดที่สร้างรูป `isinstance` / `code_checks` หรือคำสั่งที่เห็นใน `pg_stat_statements` เลย:

- `git log --all -S code_checks` ทุก branch และทุก remote
  - `origin`, `upstream`, `deploy` หลัง `git fetch --all`
  - รวม `origin/full_project-1` ที่มี commit ล่าสุดของทีม (2026-10-19)
  - เจอแค่ log ของ ticket 04 ที่บันทึกปัญหานี้
- grep ทั้ง `Z:\code\pythonGame` นอก `node_modules`
- view, function และ trigger ในฐาน: ไม่มีอะไรอ้าง `code_checks`

ร่องรอยที่ `pg_stat_statements` เก็บไว้ (รันในชื่อ role `postgres` นับตั้งแต่ reset 2026-09-28):

| คำสั่ง | calls / rows | อยู่ใน repo ไหม |
|---|---|---|
| `UPDATE problems p SET test_cases = $1::jsonb, updated_at = NOW() FROM problem_modes m WHERE p.problem_id = m.problem_id AND m.entry_id = $2` | 6 / 18 | ไม่มี |
| `UPDATE problem_modes SET extra = $1::jsonb WHERE entry_id = $2` | 2 / 6 | ไม่มี |
| `UPDATE problems SET title_th = $1, ... test_cases = $8::jsonb ...` | 2808 / 2808 | มี: seed Arcade ตอนบูตใน `server/db.js` (แตะเฉพาะ 40 ข้อ arcade และเขียน array ที่ถูกต้อง) |

- สองคำสั่งแรกมีบั๊กเดียวกัน: **กรองแค่ `entry_id` ไม่กรอง `mode`**
  - `entry_id` ไม่ซ้ำแค่ภายในโหมดเดียวกัน (CLAUDE.md "คลังโจทย์")
  - การบันทึก "แก้โจทย์ entry 1" ครั้งเดียวจึงไปโดน entry 1 ของ arcade, competitive และ minigame พร้อมกัน
  - ตรงกับ 3 ข้อที่กลายเป็น "สวัสดี" พอดี
  - ดูจากรูปแล้วเป็นหน้าแก้โจทย์ฝั่งแอดมิน ที่มีชนิดเทสใหม่ (`isinstance`, `code_checks`) เพิ่มจาก `correctness`
- คำสั่งที่เขียน 190 แถวไม่เหลือใน `pg_stat_statements`
  - ตารางนี้เต็มเกือบเพดาน (4892/5000) และมี dealloc ไปแล้ว 63 ครั้ง คำสั่งที่รันครั้งเดียวจึงถูกไล่ออกได้
  - คำสั่ง DELETE 12 แถวของ `problem_modes` ก็ไม่เหลือเช่นกัน
- ใน `pg_stat_statements` มีร่องรอย Table Editor ของ Supabase Studio เปิดดู `problems` และ `problem_modes` ด้วย
  แต่ไม่พบคำสั่งเขียนจาก Studio

**ข้อสรุป:**
- เป็นโค้ดที่ยังไม่ได้ commit หรือ push ของคนที่ต่อฐานนี้ด้วยรหัสผ่านใหม่ราว 03:40 เวลาไทยของวันที่ 21
- งานแก้โจทย์ในหน้าแอดมินเป็นขอบเขตของ Person 2 จึงน่าจะเป็นที่มา **แต่ยังยืนยันไม่ได้**
- ต้องถามทีมว่าใครรันอะไรช่วงนั้น
- ถ้าโค้ดนั้นจะถูก merge ต้องแก้สองเรื่อง ไม่อย่างนั้นจะทำซ้ำกับ production:
  - ใส่ `AND m.mode = ?` ในการเขียนแบบ by-entry
  - เขียน test case ในรูป array ตาม `server/problemsSchema.js` ไม่ใช่ object

## บูตแล้วซ่อมเองไหม (main ปัจจุบัน `da09420`)

- **ซ่อมเองบางส่วน:** seed Arcade ใน `server/db.js` upsert 40 ข้อจาก `arcadeTaskSeed.js` โดยจับคู่ด้วย `title_en`
  - เขียน `test_cases` แบบ array และ `problem_modes.extra = {work_chars}` ทับทุกครั้งที่บูต
  - แต่ #158 ถูกเปลี่ยน `title_en` เป็น "Hello World" จับคู่ไม่เจอ
  - seed จะ **INSERT "Fibonacci Number" เป็นโจทย์ใหม่ arcade entry 41** แล้วปล่อย entry 1 ไว้เป็น "สวัสดี"
  - การบูตก่อนซ่อมจึงทำให้ข้อมูลเพี้ยนเพิ่ม
- **ไม่ซ่อม:**
  - `migrateProblems()` ข้ามทุกโหมดที่ migrate แล้ว (ตารางเดิมเป็น view แล้ว)
  - ไม่มีโค้ดตอนบูตที่ตรวจหรือแก้ `test_cases` ของอีก 153 ข้อ, `extra` ของ competitive/minigame หรือทะเบียนที่หาย
- **ข้อควรรู้ไว้:** ตาราง `*_pre_merge` ในฐานนี้ว่างทั้งสี่ตาราง (0 แถว และไม่มีการลบใน stats)
  - ใช้เป็นแหล่งกู้ไม่ได้
  - `npm run test:problems` จะ fail บนฐานนี้เสมอ ไม่เกี่ยวกับเหตุครั้งนี้

## ผลกระทบ

- ใครเปิด dev server ต่อฐานนี้:
  - ตรวจคำตอบไม่ได้ทุกโหมด (0/0)
  - บทเรียนและ minigame ตัดสินว่าผ่านหรือไม่ผ่านผิด
  - `sim:bots` และชุดทดสอบที่อ่านคลังโจทย์ใช้ไม่ได้
- minigame entry 1 เสียกติกาทางแยก (`rules`) เรื่องจึงแยกทางไม่ได้
- minigame #8–#19 หายจากเกม
- production ไม่โดน: seed ใหม่จากโค้ดเมื่อ 2026-10-21 และ test case เป็น array

## สคริปต์ซ่อม: `server/scripts/repair-problem-test-cases.js`

**แหล่งข้อมูล:** `server/seed-content.sql`

- เทียบกับ dump ของฐานทดสอบแล้ว ทุกคอลัมน์ตรงกันทุกแถว ยกเว้น:
  - `test_cases`
  - 3 ข้อที่ถูกแทนเนื้อหา
  - line ending (ฐานทดสอบเก็บ CRLF, seed เก็บ LF) ซึ่งไม่ใช่ความเสียหายและสคริปต์ไม่แตะ
- seed มีงานแก้ภายหลังครบแล้ว: regex #104–106 และอุณหภูมิ competitive #20
- test case ของ arcade 40 ข้อใน seed ตรงกับ `normalizeFunctionCases(arcadeTaskSeed)` ทั้ง 40 ข้อ
  ตรงกับที่ตอนบูตจะเขียน

**สิ่งที่เขียน** (transaction เดียว, เขียนเฉพาะค่าที่เสีย, ไม่เปลี่ยน `problem_id` / `entry_id`):
1. `test_cases` + `test_kind` ทุกข้อที่ `test_cases` ไม่ใช่ array (193)
2. title / desc / hint / starter / solution ของข้อที่ test_cases เสียและเนื้อหาต่างจาก seed (#121, #140, #158)
3. `problem_modes.extra` ที่เป็น `{}` แต่ seed มีค่า (entry 1 ของสามโหมด)
4. เฉพาะเมื่อใส่ `--restore-registrations`: ทะเบียนที่หายไป (minigame #8–#19)
   - แยกเป็นตัวเลือกเพราะไม่รู้ว่ามีคนลบโดยตั้งใจหรือเปล่า

**ตัวป้องกัน:**
- ไม่ใส่ `--apply` = dry run แล้ว ROLLBACK
- ถ้าหลังซ่อมยังมีข้อที่ `test_cases` ไม่ใช่ array จะ ROLLBACK ทั้งหมด
- ปฏิเสธถ้า connection ชี้ไปที่ project production (`lnijkucfutyekbxquliq`)

## ทดสอบแล้วอย่างไร (บนสำเนาใน Docker เท่านั้น)

ขั้นตอน:
- `pg_dump --schema=public` จากฐานทดสอบ (อ่านอย่างเดียว)
- restore ลง `pyarena-test-db` (127.0.0.1:55432) เป็นสองฐาน: `shared_raw` (ไม่แตะ) และ `shared_copy` (ซ่อม)
- รันสคริปต์ dry run → `--apply --restore-registrations` → `--apply` ซ้ำ
  - รอบสองเขียน 0 ข้อ (idempotent)
- หลังซ่อม: `test_cases` ตรงกับ seed 193/193 และ `extra` ต่างจาก seed 0 แถว
- รันชุดทดสอบด้วย `PGHOST=127.0.0.1 PGPORT=55432 PGDATABASE=<ฐาน>`
  - `server/.env` ของ worktree ไม่มี จึงไม่มีทางไปโดนฐานจริง

| ชุดทดสอบ | `shared_raw` (ก่อนซ่อม) | `shared_copy` (หลังซ่อม) |
|---|---|---|
| `test:grader` | crash `cannot get array length of a non-array` | **17/17 ผ่าน** รวม "เฉลยทุกข้อที่ตรวจอัตโนมัติผ่าน test case ของตัวเอง — 148 ข้อ (stdio 108, function 40)" |
| `test:problems` | crash `cannot extract elements from an object` | 10 ผ่าน / 7 fail ทั้ง 7 มาจาก `*_pre_merge` ว่าง (ดูด้านล่าง) · "test_cases ไม่ใช่ array 0" ผ่าน · ครบ 193 ข้อ |
| `test:bilingual` | 2 ผ่าน / 4 fail (192 ข้อ hash ไม่ตรง) | 3 ผ่าน / 3 fail (ดูด้านล่าง) |

**fail ที่เหลือมีอยู่ก่อนแล้ว และไม่ได้เกิดจากเหตุครั้งนี้:**
- `test:problems`:
  - "จำนวนแถวเท่าเดิม ×4"
  - "รายการแก้ไขที่ตั้งใจ"
  - "กฎยกเว้น"
  - "ตารางเดียวมีโจทย์ครบ" (193 ข้อตรงกับ seed แล้ว แต่ไปเทียบกับ `*_pre_merge` ที่มี 0 แถว)
- `test:bilingual`:
  - 133 ข้อที่ hash ไม่ตรงคือข้อที่โค้ดเป็น CRLF (baseline บันทึกจากฐานที่เป็น LF)
  - 79 ข้อยังไม่มีคำแปลอังกฤษในฐานนี้ (ไม่เคยรัน `translate:problems` กับฐานนี้)
  - #193 ไม่อยู่ใน baseline

## ยังไม่ได้ทำ หรือรอผู้ใช้ตัดสินใจ

- **ยังไม่ได้รันกับฐานทดสอบจริง** ถ้าจะรัน ให้รันจาก `server/` ที่มี `.env` ชี้ฐานทดสอบ:
  1. `node scripts/repair-problem-test-cases.js` ดูรายการก่อน
  2. `node scripts/repair-problem-test-cases.js --apply` (เติม `--restore-registrations` ถ้าต้องการคืน minigame #8–#19)
  3. ค่อยบูต server หลังซ่อมแล้ว เพื่อไม่ให้ seed Arcade INSERT "Fibonacci Number" ซ้ำ
- ถามทีมว่าใครต่อฐานนี้ราว 03:40 เวลาไทยของ 2026-10-21 และเอาโค้ดแก้โจทย์ (`code_checks`) ไปแก้ก่อน merge
  - ถ้ายังรันอยู่ จะเขียนทับซ้ำได้ทุกเมื่อ
- CRLF ในโค้ดโจทย์ของฐานนี้และ `*_pre_merge` ที่ว่าง เป็นเรื่องแยก ไม่ได้แตะ
- ไม่ได้รัน `npm run sim:bots` บนสำเนา (ต้องมี server รันอยู่)
  - ใช้ `test:grader` ที่ตรวจเงื่อนไขเดียวกัน (เฉลยต้องผ่านเทสของตัวเอง) แทน
