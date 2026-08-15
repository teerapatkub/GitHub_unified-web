# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-16 00:58
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ผู้ใช้ขอให้เพิ่มระบบตรวจโค้ดจริงของผู้เล่นแต่ละคนใน Arcade Battle Royale เพื่อใช้เป็นเกณฑ์จัดอันดับ เรียงความสำคัญ: 1) ผลลัพธ์ถูกต้อง 2) ความเข้าใจง่ายของโค้ด 3) เวลาที่ใช้ — ก่อนหน้านี้ระบบไม่เคยรัน/ตรวจโค้ดผู้เล่นจริงเลย (คะแนนคำนวณจากความยาวโค้ดเฉยๆ, ปุ่ม "ทดสอบโค้ด" แสดงผล PASS คงที่เสมอ)

---

## สรุปสิ่งที่แก้ไข

### 1) ตรวจผลลัพธ์จริง — รันโค้ดผู้เล่นผ่าน Pyodide (`client/src/pages/ArcadeBattleRoyale.jsx`)
- Import และใช้ `usePyodide()` ของ Person 1 (`client/src/hooks/usePyodide.js`) โดยตรง **ไม่แก้ไฟล์นั้น**
- เพิ่ม `TASK_TEST_CASES` (ชุด test case จริงของ 3 โจทย์ประจำรอบ: `fib`, `is_anagram`, `two_sum`) คู่กับ `TASKS` เดิม — ตัดสินใจไม่ผูกกับ `dbTasks`/`getTaskForRound` เพราะพบว่าฟังก์ชันนั้น **ไม่เคยถูกเรียกใช้จริงเลย** (dead code เดิม) หน้าจอผู้เล่นแสดง/แก้โค้ดจาก `TASKS.ROUND_N` เท่านั้น การผูก test case เข้ากับ `TASKS` โดยตรงจึงปลอดภัยกว่าและรับประกันว่าโจทย์ที่ตรวจตรงกับโจทย์ที่ผู้เล่นเห็นเสมอ (ไม่แตะ `dbTasks`/`getTaskForRound` ที่เหลือเป็น dead code เหมือนเดิม)
- เพิ่ม `buildTestHarness()` ครอบโค้ดผู้เล่นด้วย harness ที่เรียกฟังก์ชันเป้าหมายกับแต่ละ test case (test cases ฝัง base64 กันปัญหา quote/escape) แล้ว print ผลเป็น JSON บรรทัดเดียวมี marker เฉพาะ
- เพิ่ม `runCorrectnessCheck()` รันผ่าน Pyodide จริง อ่าน marker จาก stdout ที่ hook สตรีมออกมา คืน `passCount`/`totalCount`

### 2) ตรวจความเข้าใจง่าย — Claude API แยกเฉพาะจุด (`server/server.js`)
- เพิ่ม `callClaudeForReadability(code)` เรียก Anthropic Messages API ตรงผ่าน `axios` (ไม่เพิ่ม SDK ใหม่) **แยกจาก `callAiChat()`/NVIDIA เดิมโดยสิ้นเชิง** ตามที่ผู้ใช้ต้องการ (ไม่กระทบ Lumi/job generator/promotion exam ของ Person 1)
- มี `heuristicReadabilityScore()` เป็น fallback บังคับตามกติกา AI ใน CLAUDE.md (ต้องมี fallback ถ้า AI ไม่ตอบ) — ใช้เมื่อไม่มี `ANTHROPIC_API_KEY`, timeout (8s), หรือ API error
- เพิ่ม endpoint ใหม่ `POST /api/arcade/rooms/:id/judge-round` รับโค้ด คืน readability score
- เพิ่ม `ANTHROPIC_API_KEY=your_anthropic_api_key_here` ใน `server/.env.example` เท่านั้น (ไม่แตะ `.env` จริง ไม่ hardcode key ใดๆ)

### 3) รวมคะแนนแบบ priority order โดยไม่ต้องเขียน comparator ใหม่
```
roundScore = passCount * 10_000_000 + readabilityScore * 10_000 + (roundDuration - timeUsedSeconds)
```
เข้ารหัส "ผลลัพธ์ชนะเด็ดขาดก่อนเสมอ, ตามด้วยความเข้าใจง่าย, ตามด้วยเวลา" เป็นตัวเลขเดียวที่ปลอดภัยทาง lexicographic บวกเข้า `playerState.score` สะสมแบบเดิม — **ไม่ต้องแก้ `eliminateBottom()` เลย** เพราะฟังก์ชันนั้น sort จาก cumulative score อยู่แล้ว
- แทนที่ `calculateRoundScores()` (เดิมให้คะแนนจากความยาวโค้ดล้วนๆ) ด้วย `evaluateRound()` แบบ async: รัน Pyodide → ขอ readability จาก server → คำนวณ `roundScore`/`cashGain` → อัปเดต state
- `handlePhaseTransition()` เปลี่ยนเป็น `async`, รอ `evaluateRound()` ก่อนเปลี่ยนเฟส พร้อม state `isGrading` ปิดปุ่มส่งคำตอบระหว่างตรวจ + toast "🧪 กำลังตรวจโค้ด..." (ทั้งไทย/อังกฤษ) เป็น loader ตามกติกา AI ใน CLAUDE.md
- บอทไม่มีโค้ดจริง จึงสังเคราะห์ `passCount`/`readability`/`timeUsed` จากสุ่มที่ scale เดียวกับผู้เล่นจริง (ไม่แตะ `botAI.js`/`botManager.js`)

## การทดสอบ

ทดสอบผ่าน dev server จริงทั้งหมด (ไม่ใช่แค่อ่านโค้ด) ตามกติกา CLAUDE.md:
1. **Harness sanity check นอก Pyodide**: generate harness ทั้ง 3 โจทย์ (เฉลยถูก/เฉลยผิด) รันผ่าน CPython จริงในเครื่อง → ผลลัพธ์ pass/fail ตรงตามคาดทุกกรณี
2. **`node --check` + eslint + `npm run build`**: ผ่านทั้งหมด, eslint บน `ArcadeBattleRoyale.jsx` เหลือ 12 ปัญหา (ลดจาก baseline เดิม 17 — ไม่มีปัญหาใหม่จากการแก้ครั้งนี้เลย)
3. **`/api/arcade/rooms/:id/judge-round` ผ่าน curl**: โค้ดสะอาดได้ 80/100, โค้ดบรรทัดยาว/ไม่มี comment ได้ 60/100, ไม่ส่ง code ได้ 400 — ยืนยัน fallback heuristic ทำงานถูกต้อง (ไม่มี `ANTHROPIC_API_KEY` ในเครื่อง dev)
4. **ทดสอบเต็ม flow ผ่านเบราว์เซอร์จริง** (Chrome automation): สร้างห้อง → เพิ่มบอท → เริ่มแมตช์ → พิมพ์เฉลย `fib` ที่ถูกต้องจริงลง Monaco → กด "ส่งคำตอบ" → เห็น toast "🧪 กำลังตรวจโค้ด..." ตามด้วย "✅ 4/4 tests | 📖 70/100 | ⏱ 0s" → เงินสะสมเปลี่ยนจาก 1000 → 1740 ตรงกับสูตร `cashGain = 4*150 + floor(70*2) = 740` เป๊ะ → เปลี่ยนเฟสไป Shop 1 สำเร็จ ไม่มี console error
5. ลบห้องทดสอบออกจาก PostgreSQL หลังทดสอบเสร็จ

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- ไม่แตะ `usePyodide.js`, `pyodideWorker.js`, `botAI.js`, `botManager.js`, `callAiChat()`/NVIDIA, หรือ route ใดๆ ของ Person 1/2
- `dbTasks`/`getTaskForRound` ใน `ArcadeBattleRoyale.jsx` ยังเป็น dead code เหมือนเดิม (ไม่ได้แก้ไข) — เป็นช่องว่างที่มีอยู่ก่อนแล้ว ถ้าจะเชื่อมโจทย์จาก DB เข้ากับหน้าจอจริงในอนาคตต้องวางแผนแยกต่างหาก เพราะกระทบจุดตั้งค่าโค้ดเริ่มต้นของรอบหลายจุด
- ต้องเพิ่ม `ANTHROPIC_API_KEY` ใน `server/.env` เองเพื่อให้ readability judge ใช้ AI จริง (ไม่ใส่ระบบยังทำงานได้ปกติผ่าน heuristic fallback)

## สิ่งที่ยังไม่เสร็จ / ควรทำต่อ
- ยังไม่ได้ทดสอบกับ `ANTHROPIC_API_KEY` จริง (มีแต่ path fallback ที่ยืนยันแล้ว)
- ยังไม่ได้ทดสอบ round 2/3 (`is_anagram`, `two_sum`) ผ่านเบราว์เซอร์จริงแบบเดียวกับ round 1 (harness ผ่านการยืนยันนอก Pyodide แล้วทั้งคู่)
- เดิมทีวางแผนไว้ (แผน Phase 2/3 ก่อนหน้า) ว่าจะทำ Docker/deploy ต่อ — งานรอบนี้เป็นการหยุดแทรกกลางทางเพื่อทำฟีเจอร์ตรวจโค้ดตามที่ผู้ใช้ขอเพิ่ม ยังไม่ได้กลับไปทำ Phase 2/3 deploy
