# สวนของ Lumi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** มินิเกมที่ผู้เล่นเขียน Python สั่งหุ่นของ Lumi ทำสวนบนกริด ประกอบด้วยด่านหลัก 9 ด่าน (หนึ่งด่านต่อหนึ่งโมดูล) และฟาร์มอิสระ server ตัดสินผลและจ่าย XP/ทองเอง

**Architecture:**
- กฎทั้งหมดอยู่ในไฟล์เดียวคือ `server/garden/engine/garden_engine.py`
- client ดึงไฟล์นี้ผ่าน API แล้วรันใน Pyodide worker เดิม เพื่อให้เห็นผลทันที
- server รันไฟล์เดียวกันผ่าน `runPythonScript` และตัดสินผลเป็นสองรอบ
  - รอบแรก รันโค้ดผู้เล่น ได้ **รายการคำสั่ง** (action log)
  - รอบสอง รัน engine ตัวใหม่ใน process ใหม่ที่ไม่มีโค้ดผู้เล่นเลย ให้เล่นซ้ำจากรายการคำสั่งแล้วสรุปผล
- ผลที่ตัดสินมาจากการเล่นซ้ำเท่านั้น

**Tech Stack:** Python 3 (stdlib), Node/Express 5 (CommonJS), PostgreSQL ผ่าน wrapper `db`, React 19 + Vite, Pyodide 0.27.7 (มีอยู่แล้วใน `client/package.json`), Monaco, react-i18next

**Spec:** `docs/superpowers/specs/2026-11-10-lumi-garden-design.md`

## ส่วนที่ต่างจาก spec (ตัดสินตอนวางแผน)
1. **ตำแหน่งไฟล์**: engine และนิยามด่านอยู่ที่ `server/garden/` ไม่ใช่ `shared/` เพราะไฟล์ด่านมีเฉลย จึงห้ามเสิร์ฟเป็น static
   - client ได้ engine จาก `GET /api/garden/engine`
   - client ได้ข้อมูลด่านแบบตัดเฉลยออกแล้วจาก `GET /api/garden/levels`
   - ไฟล์ยังมีที่เดียวเหมือนเดิม
2. **การตรวจสองรอบ (run → replay)**: โค้ดผู้เล่นรันใน process เดียวกับ engine จึงแก้สถานะสวนได้
   - การเล่นซ้ำทำให้การปลอมสถานะไม่มีผล
   - ถ้าปลอมรายการคำสั่ง รายการที่ปลอมต้องถูกกฎทุกข้อจึงจะผ่าน ซึ่งก็เท่ากับเป็นคำตอบที่ถูกอยู่แล้ว และจำนวน tick ก็นับจากการเล่นซ้ำ
3. **ด่าน 9 (OOP) ใช้หุ่นตัวเดียว**: ด่านบังคับให้นิยาม `class` และสร้าง instance (ตรวจด้วย AST)
   - หุ่นสองตัวต้องมีนาฬิกาขนานกัน ซึ่งทำให้กฎซับซ้อนเกินเวอร์ชันแรก
   - ถ้าผู้ใช้ยืนยันว่าต้องการสองตัว ให้แยกเป็นงานถัดไป
4. **ไฟล์ของด่าน 6–8 เป็นไฟล์จริง**: `garden.py` (สำหรับด่าน 6) และ `plan.txt` (สำหรับด่าน 8) ส่งผ่านพารามิเตอร์ `files` ของ runner ทั้งสองฝั่ง

## Global Constraints
- ห้ามเชื่อ trace, ดาว, tick หรือคะแนนจาก client ผลมาจากการเล่นซ้ำบน server เท่านั้น
- รางวัลเริ่มต้นของด่าน: ผ่านครั้งแรก (1 ดาว) ได้ **50 XP + 20 ทอง** ดาวที่ 2 และ 3 ได้ **+5 ทอง ต่อดาว** แต่ละดาวจ่ายครั้งเดียว ค่าจริงอยู่ใน JSON ของแต่ละด่าน
- ฟาร์มอิสระ: งบ **500 tick** เพดาน **50 ทองต่อวันต่อคน** และ cooldown **10 นาที**
  - อ่านจาก env `GARDEN_DAILY_GOLD_CAP` และ `GARDEN_SELL_COOLDOWN_SEC` ถ้าไม่ตั้งใช้ 50 และ 600
  - ไม่ใช่ key หรือชื่อโมเดล จึงมีค่า default ในโค้ดได้
- ฟาร์มอิสระเปิดเมื่อผ่านด่าน 4 ด่าน N เปิดเมื่อผ่านบทเรียนสุดท้ายของโมดูล N (`opensNext`) และผ่านด่าน N−1 แล้ว
- SQL ใช้ `?` placeholder เท่านั้น แก้ schema ผ่านระบบ migration (`server/migrations/`) ตามแบบ `migrateTutorialsSeen`
- server เป็น CommonJS (`require`) ตามไฟล์ข้างเคียง ส่วน client เป็น ES modules
- คำสั่งของ API เป็นภาษาอังกฤษ ข้อความใน UI มีสองภาษาผ่าน `public/locales/{th,en}/translation.json`
- ไม่ลอกชื่อ ภาพ หรือด่านจากเกมอื่น ภาพใช้ emoji หรือ CSS ส่วน Lumi ใช้ avatar ใน `client/public/data_MiNiGame/NPC_lumi`
- ไม่แตะ `problemGrader.js`, ตาราง `problems` และ `arcade_*`

## Review Focus
1. **โค้ดผู้เล่นปลอมผลด้วยการ print sentinel เองหรือแก้สถานะ engine** → รางวัลต้องมาจากการเล่นซ้ำเท่านั้น (เทสใน Task 3)
2. **ลูปไม่รู้จบที่ไม่เรียกคำสั่งสวนเลย** (`while True: pass`) → timeout ของ runner ตัด แล้วคืนข้อความว่า "หุ่นเหนื่อยแล้ว" ไม่ใช่ 500 (เทสใน Task 3)
3. **ส่งด่านพร้อมกันสองครั้ง** → จ่ายรางวัลครั้งเดียว (เทสใน Task 5)
4. **ขายในฟาร์มอิสระข้ามเที่ยงคืน** → `daily_gold` รีเซ็ตตามวันที่ของเวลาไทย (Asia/Bangkok) (เทสใน Task 6)
5. **โค้ดผู้เล่นใช้ชื่อที่ชนกับ API** (เช่น `def move(): ...`) หรือ `except Exception` ครอบทั้งหมด → ต้องไม่กลืน `TiredError` และสวนยังจบได้ถูกต้อง (เทสใน Task 1)

---

## File Structure
```
server/garden/engine/garden_engine.py   กฎ + API ของผู้เล่น + โหมด replay (CLI)
server/garden/engine/garden.py          โมดูลที่ผู้เล่น import ได้ในด่าน 6 (weather)
server/garden/engine/test_garden_engine.py   unittest ของ engine
server/garden/levels/01.json … 09.json, free.json
server/garden/levels.js                 โหลด/ตรวจนิยามด่าน, publicLevel()
server/garden/gardenGrader.js           run → replay → verdict
server/garden/progress.js               migrateGarden(), isModuleCleared(), อ่าน/เขียน progress
server/garden/routes.js                 createGardenRouter(db, deps)
server/tests/garden-*.test.js           เทส node
client/src/garden/trace.js              parseGardenOutput()
client/src/garden/useGardenRun.js       hook รันใน Pyodide
client/src/garden/GardenCanvas.jsx      วาดกริด + เล่น frame
client/src/pages/LumiGarden.jsx         /garden และ /garden/:levelId
client/src/garden/parity.test.mjs       เทียบ Pyodide กับ Python ของ server
```

---

### Task 1: Garden engine (Python)

**Files:**
- Create: `server/garden/engine/garden_engine.py`, `server/garden/engine/garden.py`, `server/garden/engine/test_garden_engine.py`

**Interfaces:**
- Produces (Python):
  - `setup(level: dict) -> None` รีเซ็ตสถานะจากนิยามด่าน
  - `player_api() -> dict` ชื่อที่ผู้เล่นเรียกได้ กรองตาม `level["commands"]`
  - `run_player(level: dict, source: str) -> dict` รันโค้ดผู้เล่นใน namespace ของ `player_api()` แล้วคืน `{"actions": [...], "frames": [...], "error": str|None, "error_line": int|None, "tired": bool}`
  - `replay(level: dict, actions: list, source: str) -> dict` คืน `{"goal_met": bool, "ticks": int, "stars": 0..3, "harvested": {kind: n}, "value": int, "violations": [str]}`
  - `main(argv: list) -> None` คือ entry point เดียวที่ทั้ง client และ server เรียก (`main(["run"])` / `main(["replay"])`) ส่วน `if __name__ == "__main__": main(sys.argv[1:])`
  - ทุก JSON ที่พิมพ์ออกใช้ `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)` เพื่อให้ไบต์ตรงกันทั้งสองฝั่ง
  - CLI รับสองแบบ
    - `python garden_engine.py run` อ่าน `level.json` กับ `player.py` จาก cwd แล้วพิมพ์ `@@GARDEN@@<json ของ run_player>` เป็นบรรทัดสุดท้าย
    - `python garden_engine.py replay` อ่าน stdin เป็น `{"level","actions","source"}` แล้วพิมพ์ JSON ของ `replay`
  - action คือ `{"op": "move"|"till"|"plant"|"water"|"harvest", "arg": str|None}`
  - frame คือ `{"tick": int, "pos": [x, y], "grid": [[tile]], "inv": {...}, "op": str, "ok": bool, "err": str|None}`
    - tile คือ `{"soil": "grass"|"tilled"|"rock", "crop": str|None, "age": int, "wet": int}`
    - เก็บ frame ไม่เกิน 2000 รายการ ส่วน action ไม่เกิน `tick_budget`

**กฎ (ค่าที่ต้องตรง)**
- **พิกัดเริ่มต้น**: `(0,0)` คือมุมซ้ายล่าง `up` เพิ่มค่า y
- **คำสั่งที่กิน tick**: `move`, `till`, `plant`, `water`, `harvest` คำสั่งละ 1 tick
- **sensor ไม่กิน tick**: `can_harvest`, `get_pos`, `get_size`, `get_tile`, `inventory`
- **หลังแต่ละ tick** พืชทุกต้นอายุ +1 ตามกฎของแต่ละชนิด
  - rice: โตเสมอ พร้อมเก็บเมื่อ age ≥ 3
  - chili: โตเฉพาะ tick ที่ `wet > 0` พร้อมเก็บเมื่อ age ≥ 4
  - mango: พร้อมเก็บเมื่อ age ≥ 8
  - ความชื้น: `water()` ตั้ง `wet = 3` และ `wet` ลดลง 1 ต่อ tick
  - weather ของด่าน: ถ้า tick นั้นเป็น `"rain"` ทุกช่องได้ `wet = 3`
- **error ที่ไม่ raise** (บันทึก `ok: false` พร้อม `err` แต่ยังกิน tick)
  - `edge`: เดินออกนอกขอบ
  - `not_tilled`: ปลูกบนช่องที่ยังไม่ไถ
  - `occupied`: ปลูกบนช่องที่มีพืชอยู่แล้ว
  - `not_ready`: เก็บพืชที่ยังไม่โต
  - `nothing`: เก็บหรือรดน้ำช่องที่ไม่มีพืช
- **เดินชนหิน**: raise `BlockedError(Exception)` และหุ่นไม่ขยับ
- **เกินงบ tick**: raise `TiredError(BaseException)` เพื่อให้ `except Exception` ของผู้เล่นจับไม่ได้ แล้วตั้ง `tired = True`
- `garden.py` มี `weather() -> "rain"|"sun"` คืนค่าของ tick ปัจจุบันจาก `level["weather"]` (วนซ้ำ)
- `replay` ตรวจ `level["required"]` ด้วย `ast` ถ้าไม่ผ่าน เพิ่ม `"missing:<construct>"` ลง `violations`
  - construct ที่รองรับ: `for`, `while`, `if`, `def`, `call:<name>`, `try`, `import`, `open`, `class`, `instance`, `list`, `modulo`
  - `max_lines` นับเฉพาะบรรทัดที่ไม่ว่างและไม่ขึ้นต้นด้วย `#`
- **เกณฑ์ผ่านและดาว**
  - `goal_met` เป็นจริงเมื่อ `harvested[kind] ≥ goal[kind]` ครบทุกชนิด ภายใน `tick_budget` และไม่มี violation
  - ได้ 1 ดาวเมื่อ `goal_met`
  - ได้ 2 ดาวเมื่อ `ticks ≤ stars[0]`
  - ได้ 3 ดาวเมื่อ `ticks ≤ stars[1]`

- [ ] **Step 1: เขียนเทสที่ fail** ใน `test_garden_engine.py` (unittest)
  - `test_rice_ready_after_three_ticks`: กริด 1×1 ทำ till, plant rice แล้วตามด้วยคำสั่งอื่นให้ครบ 3 tick ก่อน harvest จากนั้น `replay(...)["harvested"] == {"rice": 1}`
  - `test_chili_only_grows_when_wet`: ปลูก chili แล้วไม่รดน้ำ ครบ 6 tick แล้ว `can_harvest()` ต้องเป็น False ส่วนกรณีรดน้ำทุก 3 tick ต้องเก็บได้
  - `test_edge_is_soft_error`: `move("left")` ที่ (0,0) ได้ frame ที่ `ok is False`, `err == "edge"` และ tick = 1
  - `test_rock_raises_blocked_error`: ผู้เล่นใช้ `try: move("up")` / `except BlockedError: ...` แล้วจับได้ ส่วนกรณีไม่จับ ต้องได้ `error` ที่มี `BlockedError` และ `error_line` = บรรทัดนั้น
  - `test_tired_escapes_except_exception`: โค้ด `while True:` ครอบ `try: move("up")` และ `except Exception: pass` ต้องจบด้วย `tired is True`
  - `test_player_shadowing_api_is_harmless`: ผู้เล่นนิยาม `def move(d): pass` เองแล้วเรียกใช้ ต้องได้ actions ว่าง ไม่ crash
  - `test_tampering_does_not_affect_replay`: ผู้เล่นแก้ตัวแปรภายใน engine ให้มี harvested สูง แล้ว `replay(level, run["actions"], src)["goal_met"] is False`
  - `test_required_construct_missing`: ด่านที่ `required: ["for"]` แต่ส่งโค้ดที่ไม่มี for ต้องได้ violations มี `"missing:for"`
  - `test_commands_filtered_by_level`: ด่านที่ `commands` ไม่มี `water` แล้วเรียก `water()` ต้องได้ `NameError`
  - `test_cli_run_prints_sentinel_last`: เรียก CLI แบบ subprocess แล้วบรรทัดสุดท้ายของ stdout ต้องขึ้นต้นด้วย `@@GARDEN@@` และ parse เป็น JSON ได้ แม้ผู้เล่นจะ `print("@@GARDEN@@{}")` เองก่อนหน้า
- [ ] **Step 2: รันให้เห็นว่า fail**: `cd server/garden/engine && python -m unittest -v` ต้อง ERROR ด้วย `ModuleNotFoundError: garden_engine`
- [ ] **Step 3: เขียน engine ตามกฎข้างบน** stdlib เท่านั้น
  - สถานะเก็บใน object `_Garden` ตัวเดียว
  - `player_api()` คืน closure ที่ห่อ instance นั้น
  - `run_player` จับ exception ของผู้เล่น แล้วหา `error_line` จาก traceback frame ที่ filename เป็น `"player.py"`
  - การ compile ใช้ `compile(source, "player.py", "exec")`
- [ ] **Step 4: รันเทสให้ผ่าน**: `python -m unittest -v` ต้อง OK 10 tests
- [ ] **Step 5: Commit**: `git add server/garden/engine && git commit -m "Add the Lumi Garden rules engine"`

### Task 2: นิยามด่าน 9 ด่าน + ฟาร์มอิสระ + ตัวโหลด

**Files:**
- Create: `server/garden/levels/01.json`…`09.json`, `server/garden/levels/free.json`, `server/garden/levels.js`
- Test: `server/tests/garden-levels.test.js`

**Interfaces:**
- รูปของไฟล์ด่าน:
  ```
  {id, module_id, size:[w,h], start:[x,y], rocks:[[x,y]], weather:[...]|null,
   commands:[...], goal:{kind:n}, tick_budget, stars:[t2,t3], required:[...], max_lines|null,
   files:{name:content}|null, reward:{xp,coins,star_coins},
   title_th,title_en,story_th,story_en,hint_th,hint_en, starter_code, solution_code, wrong_code}
  ```
- Produces (`levels.js`)
  - `loadLevels(): Map<number, Level>`: โหลดครั้งเดียวแล้ว cache ตรวจ field ครบ ถ้าไม่ครบ throw
  - `getLevel(id): Level|null`
  - `getFreeLevel(): Level`
  - `publicLevel(level): object`: ตัด `solution_code` และ `wrong_code` ออก
  - `ENGINE_DIR: string`

**เนื้อหาด่าน** (คำสั่งสะสมขึ้นตามด่าน ค่าตั้งต้นของ reward คือ `{xp:50, coins:20, star_coins:5}`)

| id | module | size | goal | required | ตัวอย่างเงื่อนไขพิเศษ |
|---|---|---|---|---|---|
| 1 | 1 | 1×2 | rice 1 | — | คำสั่ง: move, till, plant, harvest |
| 2 | 2 | 3×1 | rice 1, chili 1 (+water) | list | `starter_code` มี `crops = [...]` |
| 3 | 3 | 3×3 | rice 8 (ขอบ) | modulo | |
| 4 | 4 | 3×3 | rice 9 | for, if, call:can_harvest | |
| 5 | 5 | 4×4 | rice 6 กระจายจุด | def | `max_lines: 25`, `get_pos` |
| 6 | 6 | 3×3 | chili 6 | import | `weather` + `files: garden.py` |
| 7 | 7 | 4×4 | rice 10 | try | มีหิน 3 ก้อน |
| 8 | 8 | 4×3 | ตาม plan.txt | open | `files: plan.txt` |
| 9 | 9 | 4×4 | rice 8, mango 2 | class, instance | |
| free | — | 6×6 | — | — | tick 500, คำสั่งครบทุกตัว |

- [ ] **Step 1: เขียนเทสที่ fail**
  - `every level loads and has both languages`: `loadLevels().size === 9` และทุกด่านมี `title_en` กับ `story_en` ไม่ว่าง
  - `publicLevel hides solutions`: ไม่มี key `solution_code` หรือ `wrong_code`
  - `every solution earns three stars`: วนทุกด่าน รัน `python garden_engine.py run` แล้วตามด้วย `replay` ผ่าน `runPythonScript` (ไม่ผ่าน grader) แล้วต้องได้ `stars === 3`
  - `every wrong_code fails`: `goal_met === false`
- [ ] **Step 2: รันให้ fail**: `cd server && node --test tests/garden-levels.test.js` ต้อง fail เพราะยังไม่มีโมดูล
- [ ] **Step 3: เขียน JSON 10 ไฟล์ และ `levels.js`**
  - เขียน `solution_code` ก่อน แล้วรัน replay ดูจำนวน tick จริง
  - ตั้ง `stars[1]` ให้เท่ากับ tick ของเฉลย และ `stars[0]` ประมาณ 1.5 เท่า
  - ตั้ง `tick_budget` ประมาณ 3 เท่า
  - `wrong_code` ต้องเป็นความผิดที่ผู้เรียนมักทำจริง เช่น เก็บก่อนพืชโต หรือลืมไถ
  - `story_*` เป็นบทพูดของ Lumi 1–2 ประโยค
- [ ] **Step 4: รันให้ผ่าน**: คำสั่งเดิม ต้อง pass ครบ 4 เทส
- [ ] **Step 5: Commit**

### Task 3: Grader (run → replay)

**Files:**
- Create: `server/garden/gardenGrader.js`
- Test: `server/tests/garden-grader.test.js`

**Interfaces:**
- Consumes: `runPythonScript` (`server/pythonRunner.js`), `getLevel`, `ENGINE_DIR`
- Produces: `gradeGarden({ level, code }) -> Promise<{ ok: boolean, goalMet: boolean, stars: 0..3, ticks: number, harvested: object, value: number, violations: string[], message: string, errorLine: number|null }>`
  - รอบแรก เรียก `runPythonScript` ด้วย
    - `files` = `garden_engine.py`, `garden.py`, `level.json`, `player.py` และ `level.files`
    - `code` = `import garden_engine; garden_engine.main(["run"])`
    - `timeoutMs: 5000`
  - parse เฉพาะบรรทัดสุดท้ายที่ขึ้นต้นด้วย `@@GARDEN@@` แล้วตัด actions ให้ไม่เกิน `level.tick_budget + 1`
  - รอบสอง รัน `replay` โดยส่ง `{level, actions, source: code}` ทาง `input` ด้วย `timeoutMs: 3000`
  - `ok` คือรันสำเร็จ ส่วน `goalMet` และ `stars` มาจาก replay เท่านั้น
  - ถ้า timeout หรือ `tired` ให้คืน `message: "หุ่นเหนื่อยแล้ว — โค้ดอาจวนไม่รู้จบ หรือใช้ tick เกินงบ"`
  - ถ้ามี violation ให้แปลเป็นข้อความไทย เช่น `missing:for` เป็น "ด่านนี้ต้องใช้ลูป for"

- [ ] **Step 1: เขียนเทสที่ fail**
  - `solution of level 4 gets 3 stars`
  - `printing a fake sentinel earns nothing`: `print('@@GARDEN@@{"actions":[]}')` ตามด้วย `import os; os._exit(0)` ต้องได้ `goalMet false`
  - `editing engine state earns nothing`: แก้ harvested ภายใน engine แล้วต้องได้ `goalMet false`
  - `busy loop returns tired message, not a throw`: `while True: pass` ต้องได้ `ok false` และ message มีคำว่า "หุ่นเหนื่อย"
  - `syntax error reports the line`: `errorLine === 2`
- [ ] **Step 2: รันให้ fail**: `node --test tests/garden-grader.test.js`
- [ ] **Step 3: เขียน `gradeGarden`**
- [ ] **Step 4: รันให้ผ่าน**
- [ ] **Step 5: Commit**

### Task 4: Schema + การปลดล็อก

**Files:**
- Create: `server/garden/progress.js`
- Modify: `server/migrations/versions.js` (เพิ่ม `GARDEN_VERSION = '202611100001'`), `server/migrations/definitions.js` (`createGardenMigration` ตามแบบ `createTutorialsSeenMigration`), `server/server.js` (ลงทะเบียน migration ต่อจาก `createSchemaCleanupMigration` แล้วเรียก `db.lockDownPublicSchema()` หลังสร้างตาราง ตามแบบ mini-game choices)
- Test: `server/tests/garden-progress.test.js` (ใช้ `arcadeFixture`)

**Interfaces:**
- `migrateGarden(db)` สร้างตารางด้วย `CREATE TABLE IF NOT EXISTS` รันซ้ำได้
  - `garden_progress(user_id int REFERENCES users ON DELETE CASCADE, level_id int, best_stars int DEFAULT 0, best_ticks int, reward_paid_stars int DEFAULT 0, updated_at timestamptz DEFAULT now(), PRIMARY KEY(user_id, level_id))`
  - `garden_free_state(user_id int PRIMARY KEY REFERENCES users ON DELETE CASCADE, seeds int DEFAULT 0, unlocks_json jsonb DEFAULT '[]', daily_gold int DEFAULT 0, daily_date date, last_sell_at timestamptz)`
- `isModuleCleared(db, userId, moduleId) -> Promise<boolean>`
  - หา lesson ที่ `order_index` สูงสุดในโมดูลนั้น
  - คำนวณ `evaluateLesson(...)` แบบเดียวกับ `lessonContentRoutes.js:94` แล้วคืน `opensNext`
  - ถ้าโมดูลไม่มีบทเรียน ให้ถือว่าผ่าน (true)
- `levelStatus(db, userId, { isModuleCleared }) -> Promise<Array<{level_id, unlocked, best_stars, best_ticks}>>` และ `freeFarmUnlocked(statuses) -> boolean` (true เมื่อด่าน 4 มี `best_stars ≥ 1`)

- [ ] **Step 1: เขียนเทสที่ fail**
  - fixture สร้างตาราง `lessons`, `exercises`, `exercise_submissions`, `lesson_quizzes` และ `lesson_quiz_attempts` แบบย่อ
  - `migration runs twice`
  - `level 1 locked until module 1 last lesson post-quiz passed`
  - `level 2 needs level 1 stars ≥ 1 too`
  - `free farm opens after level 4`
- [ ] **Step 2: รันให้ fail** (ต้องตั้ง `TEST_DATABASE_URL`)
- [ ] **Step 3: เขียน `progress.js` และลงทะเบียน migration**
- [ ] **Step 4: รันให้ผ่าน** และรัน `npm run test:migrations` ด้วย
- [ ] **Step 5: Commit**

### Task 5: Routes ของด่านหลัก + การจ่ายรางวัล

**Files:**
- Create: `server/garden/routes.js`
- Modify: `server/server.js` (`app.use('/api/garden', createGardenRouter(db, { applyReward: applyXpRewardToUser, evaluateAchievements }))` วางใกล้ `createPromotionExamRouter`), `server/package.json` (เพิ่ม `garden` ใน `lint` และเพิ่ม script `"test:garden": "cd garden/engine && python -m unittest -q && cd ../.. && node --test --test-concurrency=1 tests/garden-*.test.js"`)
- Test: `server/tests/garden-routes.test.js`

**Interfaces:**
- `createGardenRouter(db, { applyReward(executor, userId, xp, coins), evaluateAchievements(userId), grade = gradeGarden, isModuleCleared = progress.isModuleCleared, now = () => new Date() })`
- ใช้ `req.player.user_id` เท่านั้น (ดูแบบ `loadPlayer` ใน `promotionExamRoutes.js`) ถ้าไม่มี player ตอบ 401
- `GET /engine`: ตอบเป็น `text/plain` เป็นเนื้อหา `garden_engine.py` และ `GET /engine/garden.py` ทำแบบเดียวกัน
- `GET /levels` คืน `{ levels: publicLevel[] พร้อม unlocked/best_stars, free: { unlocked, seeds, daily_gold, cap } }`
- `POST /levels/:id/submit` รับ body `{ code }` ที่ยาวไม่เกิน 20000 ตัวอักษร
  - ถ้าด่านยังล็อก ตอบ 403
  - เรียก `grade`
  - จากนั้นใน transaction เดียว
    1. `INSERT ... ON CONFLICT DO NOTHING`
    2. `SELECT ... FOR UPDATE`
    3. อัปเดต best
    4. คำนวณรางวัลที่ยังไม่จ่าย ด่านที่เพิ่งผ่านครั้งแรกได้ xp+coins ดาวที่เพิ่มได้ `star_coins` ต่อดาว
    5. เรียก `applyReward(conn, ...)`
    6. ตั้ง `reward_paid_stars`
  - คืน `{ verdict, reward:{xp,coins}, user }`
  - body field อื่น เช่น `stars`, `trace` ถูกละเลย

- [ ] **Step 1: เขียนเทสที่ fail** (fixture เพิ่มคอลัมน์ `xp int DEFAULT 0` ให้ users และ stub `isModuleCleared` ให้ผ่าน)
  - `first pass pays 50 xp 20 coins once`: ส่งเฉลยสองครั้ง ครั้งที่สองต้องได้ `reward.coins === 0`
  - `improving to 3 stars pays +10 coins`: ส่งโค้ดที่ได้ 1 ดาวก่อน แล้วส่งเฉลย
  - `two simultaneous submits pay once`: `Promise.all` สองคำขอ แล้ว `virtual_currency` ต้องเพิ่มเพียง 20
  - `body stars/trace are ignored`: ส่ง `wrong_code` พร้อม `{stars:3}` ต้องได้ reward 0
  - `locked level is 403`, `missing session is 401`, `code over 20000 chars is 400`
  - `GET /levels never contains solution_code`
- [ ] **Step 2: รันให้ fail**
- [ ] **Step 3: เขียน router และ mount**
- [ ] **Step 4: รันให้ผ่าน** แล้วรัน `npm run lint` และ `npm run test:submit` ด้วย (เพราะแตะ endpoint ที่จ่ายรางวัล)
- [ ] **Step 5: Commit**

### Task 6: ฟาร์มอิสระ (ขาย + ปลดล็อกของในเกม)

**Files:**
- Modify: `server/garden/routes.js`
- Test: `server/tests/garden-free.test.js`

**Interfaces:**
- ราคาของผลผลิตเป็นเมล็ดสวน: rice 1, chili 3, mango 8
- ทอง = `floor(value / 10)` แต่ไม่เกินโควตาที่เหลือของวันนั้น
- เมล็ดได้เต็ม `value` เสมอ
- `POST /free/sell` รับ `{ code }`
  - ถ้ายังไม่ปลดล็อก ตอบ 403
  - ถ้า `now - last_sell_at < cooldown` ตอบ 429 พร้อม `retry_after_sec`
  - grade กับ `getFreeLevel()` โดยปรับขนาดสวนตาม unlocks
  - ใน transaction ที่มี `FOR UPDATE`
    - รีเซ็ต `daily_gold` เมื่อ `daily_date` ไม่ใช่วันนี้ตาม Asia/Bangkok (หาวันที่ด้วย `new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(now())`)
    - บวก seeds และทอง
    - ตั้ง `last_sell_at`
  - คืน `{ verdict, seeds, gold, daily_gold, cap }`
- `POST /free/unlock` รับ `{ item }`
  - item มี `"size5"` (100 เมล็ด), `"size6"` (300 เมล็ด ต้องมี size5 ก่อน) และ `"mango"` (200 เมล็ด)
  - หักเมล็ด ถ้าไม่พอตอบ 409
- `free.json` เริ่มที่ 4×4 ใช้ได้แค่ rice/chili และ mango ใช้ได้เมื่อปลดล็อกแล้ว

- [ ] **Step 1: เขียนเทสที่ fail**
  - `gold is capped at 50 per day`: ฉีด `now` ให้ขยับครั้งละ 11 นาที แล้วขายด้วยโค้ดที่ได้ 300 เมล็ดหลายรอบ ทองรวมต้องเป็น 50 ส่วนเมล็ดยังเพิ่มต่อไป
  - `cooldown returns 429`
  - `cap resets at Bangkok midnight`: ตั้ง `now` เป็น 23:55 แล้วขยับไป 00:06 ตามเวลา +07:00
  - `unlock deducts seeds and is idempotent`
  - `env overrides cap`: `GARDEN_DAILY_GOLD_CAP=5`
- [ ] **Step 2: รันให้ fail**, **Step 3: เขียน**, **Step 4: รันให้ผ่าน** (`npm run test:garden`), **Step 5: Commit**

### Task 7: ฝั่ง client รันใน Pyodide + parity

**Files:**
- Create: `client/src/garden/trace.js`, `client/src/garden/useGardenRun.js`, `client/src/garden/parity.test.mjs`

**Interfaces:**
- `parseGardenOutput(stdout: string) -> { actions, frames, error, error_line, tired } | null`: อ่านเฉพาะบรรทัด `@@GARDEN@@` บรรทัดสุดท้าย
- `useGardenRun() -> { status, run(level, code) -> Promise<RunResult>, stop() }`
  - ดึง `/api/garden/engine` และ `/api/garden/engine/garden.py` ครั้งเดียว
  - เรียก `usePyodide().runCode(bootstrap, files, { mainFileName: 'main.py', onStdout })`
  - `files` = `[{name:'garden_engine.py'}, {name:'garden.py'}, {name:'level.json'}, {name:'player.py'}, ...level.files]` ในรูป `{name, type:'file', content}`
  - `bootstrap` คือ `import garden_engine; garden_engine.main(["run"])`
  - ผล `RunResult` ที่ได้ไว้แสดงผลเท่านั้น ไม่ได้ใช้ตัดสิน

- [ ] **Step 1: เขียนเทสที่ fail** ใน `parity.test.mjs`
  - ใช้ `loadPyodide` จากแพ็กเกจ `pyodide` (มีอยู่แล้ว) เขียนไฟล์ลง `pyodide.FS`
  - รันเฉลยของทุกด่านด้วย `runPythonAsync`
  - เทียบกับ stdout ของ `python server/garden/engine/garden_engine.py run` (ผ่าน `child_process`)
  - บรรทัด `@@GARDEN@@` ต้องเท่ากันทุกไบต์
  - เพิ่มเทส `parseGardenOutput ignores fake earlier sentinel`
- [ ] **Step 2: รันให้ fail**: `cd client && node --test src/garden/`
- [ ] **Step 3: เขียน `trace.js` และ `useGardenRun.js`**
  - ถ้า parity ไม่ตรง ให้หาสาเหตุใน engine (เช่น การวนลูปบน dict ที่ไม่ได้เรียงลำดับ) ห้ามแก้ที่ตัวเทียบ
- [ ] **Step 4: รันให้ผ่าน**
- [ ] **Step 5: Commit**

### Task 8: หน้าเกม

**Files:**
- Create: `client/src/garden/GardenCanvas.jsx`, `client/src/pages/LumiGarden.jsx`
- Modify: `client/src/App.jsx` (route `/garden` และ `/garden/:levelId` ห่อด้วย `requireStudent` วางใกล้ `/mini-game`), เมนูที่ลิงก์ไป `/mini-game` (เพิ่มลิงก์ "สวนของ Lumi"), `client/public/locales/{th,en}/translation.json` (key อยู่ใต้ `garden.*`)

**Interfaces:**
- `<GardenCanvas frames={Frame[]} size={[w,h]} speed={1|4} onDone() />`
  - เป็น CSS grid เล่น frame ทุก 300ms ตาม `speed` และมีปุ่มข้ามไปจบ
  - ใช้ emoji 🌾 🌶️ 🥭 🪨 หุ่น 🤖 และแสดง frame ที่ `ok:false` ด้วยกรอบสีแดงพร้อมข้อความของ `err`
- `LumiGarden`
  - **`/garden`**: แผนที่ 9 ด่านพร้อมดาวและสถานะล็อก และมีการ์ดฟาร์มอิสระที่แสดงเมล็ด, `daily_gold/cap` และปุ่มปลดล็อก
  - **`/garden/:levelId`** (`levelId` เป็นตัวเลขหรือ `free`)
    - บนสุด: กล่องคำพูดของ Lumi แสดง story/hint ผ่าน `problemTitle`/`problemDescription` หรือ helper เลือกภาษาตัวเดียวกัน
    - ซ้าย: canvas
    - ขวา: Monaco editor พร้อมปุ่ม รัน, หยุด, 1x/4x และส่งด่าน (หรือส่งขายในฟาร์มอิสระ)
    - error ของ Python แปลด้วย `friendlyPyError` แล้วไฮไลต์ `error_line`
    - ถ้าส่งไม่สำเร็จเพราะเครือข่าย แสดงว่า "ยังไม่ได้บันทึกและยังไม่ได้รับรางวัล"
    - เมื่อได้รางวัล เรียก `onUserRefresh()`

- [ ] **Step 1: เขียน UI ตาม Interfaces**
- [ ] **Step 2: `cd client && npm run lint`** ต้องไม่มี error ใหม่
- [ ] **Step 3: ทดสอบผ่าน dev server จริง** (`preview_start`) บันทึก scenario ไว้ใน work log
  1. ด่าน 1 ล็อกสำหรับบัญชีที่ยังไม่ผ่านโมดูล 1
  2. ในบัญชีที่ผ่านแล้ว รันเฉลยของด่าน 1 แล้วเห็นแอนิเมชัน
  3. ส่งด่านแล้วดาวขึ้น ทองและ XP เพิ่มใน DB หนึ่งครั้ง
  4. ส่งซ้ำแล้วไม่ได้รางวัลเพิ่ม
  5. โค้ด `while True: pass` แสดงข้อความ "หุ่นเหนื่อย"
  6. ฟาร์มอิสระ: ขายหนึ่งครั้ง แล้วขายซ้ำทันทีได้ 429
  7. สลับภาษาเป็น EN แล้วข้อความเปลี่ยน
- [ ] **Step 4: Commit**

### Task 9: เอกสาร

**Files:**
- Create: `docs/adr/00NN-garden-grader-separate-from-problem-grader.md` (ใช้เลขถัดไปใน `docs/adr/`), `project_logs/2026-11-10/HHMM-สร้างสวนของ-Lumi.md`
- Modify: `docs/handoff-to-person-1.md` (แจ้งว่าแตะระบบเรียน, XP และเมนู), `CLAUDE.md` (เพิ่มหัวข้อสั้นๆ ว่าสวนของ Lumi อยู่ที่ไหน, ใช้ `npm run test:garden` และห้ามย้ายการตัดสินไปฝั่ง client), `docs/superpowers/specs/2026-11-10-lumi-garden-design.md` (บันทึกสี่ข้อที่ต่างจาก spec)

- [ ] **Step 1: เขียนเอกสาร** ADR อธิบาย (1) ทำไมไม่ใช้ `problems/test_kind` และ (2) ทำไมต้องตรวจสองรอบแบบ run → replay
- [ ] **Step 2: รันชุดตรวจก่อน commit**: `cd server && npm run test:garden && npm run lint && npm run test:submit` และ `cd client && npm run lint` ทุกตัวต้องผ่าน
- [ ] **Step 3: Commit**
