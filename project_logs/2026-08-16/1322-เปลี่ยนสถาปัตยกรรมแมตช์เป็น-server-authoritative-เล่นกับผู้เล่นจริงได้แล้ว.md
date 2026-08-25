# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-16 13:22
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ผู้ใช้ขอ "พัฒนาขั้นต่อไปคือทำให้สามารถเล่นกับผู้ใช้คนอื่นได้จริงๆ" — ตรวจโค้ดพบว่า phase/timer/การตัดสินคะแนนของทั้งแมตช์คำนวณแยกกันอิสระในเบราว์เซอร์ของผู้เล่นแต่ละคน และที่ร้ายแรงกว่านั้นคือ `evaluateRound()` เดิมสุ่มคะแนนปลอมให้คู่แข่งที่เป็นผู้เล่นจริงด้วย (ไม่ตรวจโค้ดจริงของเขาเลย) ทำให้ไม่สามารถเล่นร่วมกันจริงได้ ผู้ใช้ยืนยันให้เปลี่ยนเป็นสถาปัตยกรรม **server-authoritative** (เซิร์ฟเวอร์คุมสถานะแมตช์ทั้งหมด แทนที่จะให้ host/client คนใดคนหนึ่งเป็นเจ้าของ) วางแผนผ่าน plan mode ก่อนเริ่มแก้จริง

## สถาปัตยกรรมใหม่

เพิ่ม server-side game loop (`tickArcadeMatches()`, เดินทุก 1 วินาทีเหมือน `sweepStaleArcadeParticipants` ที่มีอยู่แล้ว) เป็นผู้ตัดสิน phase/timer/คะแนน/การตัดคนแต่ผู้เดียว ผู้เล่นจริงแต่ละคนยังคงรันโค้ดผ่าน Pyodide ในเครื่องตัวเองเหมือนเดิม (เซิร์ฟเวอร์ไม่มี Python runtime) แต่ผลลัพธ์ต้อง **ส่งขึ้นไปเก็บที่เซิร์ฟเวอร์** แทนที่จะตัดสินอันดับเองในเครื่อง บอทก็ถูกย้ายไปสุ่มคะแนนบนเซิร์ฟเวอร์เช่นกัน (เดิมสุ่มในเบราว์เซอร์ ทำให้แต่ละ client เห็นผลบอทไม่ตรงกัน) — `botAI.js`/`botManager.js` ฝั่ง client เปลี่ยนบทบาทเป็นเครื่องมือแสดงผล/บรรยากาศอย่างเดียว (progress bar, การซื้อของ/ยิงไอเทมแบบวิชวล) คะแนน/เงิน/สถานะตกรอบจริงอ่านจาก DB participant row เสมอ

## สิ่งที่แก้ไข

### `server/db.js`
เพิ่มคอลัมน์ (idempotent migration ตามรูปแบบเดิมในไฟล์):
- `arcade_rooms`: `phase`, `phase_deadline`, `last_round_summary`
- `arcade_participants`: `pending_round_score`, `has_submitted`

### `server/server.js`
- เพิ่ม `ARCADE_PHASE_DURATIONS`/`ARCADE_ELIMINATE_COUNT`/`ARCADE_RANK_CASH_REWARDS`/`ARCADE_ROUND_CASE_COUNTS` (mirror ค่าเดิมจาก client's `ROUND_TIMES`/`RANK_CASH_REWARDS`)
- `synthesizeBotRoundScore()` — สูตรสุ่มคะแนนบอทที่ย้ายมาจาก client เดิม
- `finalizeArcadePhase(room)` — ตัดสินผลของ phase ที่หมดเวลาแล้ว 1 ก้าว: `ROUND_N` → ให้คะแนน/เหรียญ/ตัดคน (คำนวณจากคะแนนสะสมจริง) → `SUMMARY_N` (หรือ `RESULT` ถ้าเป็นรอบ 4), `SUMMARY_N` → `SHOP_N`, `SHOP_N` → `ROUND_{N+1}`
- `tickArcadeMatches()` (`setInterval` 1s) — หาห้องที่ `phase_deadline` ผ่านไปแล้วแล้วเรียก `finalizeArcadePhase()`
- `POST /rooms/:id/start` — เพิ่ม set `phase='ROUND_1'`, `phase_deadline`, reset participant fields ทั้งหมด
- ใหม่: `POST /rooms/:id/submit-round` — ผู้เล่นจริงส่งคะแนนที่ตรวจแล้ว (Pyodide+readability ฝั่งเครื่องเอง) มาเก็บเป็น `pending_round_score`
- `POST /rooms/:id/attack` — เพิ่มการรองรับ `taxCollection` เป็นการโอนเงินจริงเหมือน `cashSteal` (เดิมมีแต่ cashSteal เท่านั้นที่โอนเงินจริงฝั่งเซิร์ฟเวอร์)
- `POST /rooms/:id/finish-choice` REMAIN — reset `phase`/`phase_deadline`/`last_round_summary`/`has_submitted`/`pending_round_score` เพิ่มเติมให้ตรงกับ schema ใหม่

### `client/src/pages/ArcadeBattleRoyale.jsx`
- ลบ `handlePhaseTransition`/`isTransitioningRef`/`eliminateBottom` ทั้งก้อน (เซิร์ฟเวอร์ตัดสินแทน)
- `evaluateRound()` เดิม → เปลี่ยนเป็น `submitMyRound()` (ตรวจแค่โค้ดตัวเอง แล้ว POST ไป `/submit-round`)
- Poller หลัก (`fetchRoomState`, ทุก 2s) เปลี่ยนเป็นจุดเดียวที่เลื่อน phase — เทียบ `data.room.phase` กับ `appliedPhaseRef` แล้วรัน side-effect ตาม phase ใหม่ (reset โค้ด, roll shop ครั้งเดียว, ตั้ง roundSummary จาก `data.room.last_round_summary`) แทน switch-case เดิม พร้อม merge คะแนน/เงิน/ตกรอบจริงจาก DB เข้า `opponents`/`playerState` ทุก poll (คง field cosmetic อย่าง progress/isDebuffed ไว้ไม่ให้กระพริบ)
- เพิ่ม auto-submit: ถ้าเวลาในเครื่องหมดแต่ยังไม่ได้กดส่ง จะยิง `submitMyRound()` อัตโนมัติกันคนลืมกด
- `handleHostStartMatch` เหลือแค่เรียก `/start` แล้วรอ poll เหมือนผู้เล่นทุกคน (ลบโค้ด host-only ที่ตั้ง state เองทิ้ง)
- `dispatchAttack`/`executeItem`'s taxCollection, `pollEffects` — ขยายให้รองรับ taxCollection ผ่านเซิร์ฟเวอร์เหมือน cashSteal
- **บั๊กที่เจอระหว่างทดสอบเบราว์เซอร์จริง (สำคัญ)**: `new Date(data.room.phase_deadline)` พังเพราะ `server/db.js`'s raw-socket Postgres client ส่ง TIMESTAMP กลับมาเป็น string แบบ Postgres ("YYYY-MM-DD HH:mm:ss.sss" ไม่มี timezone marker) เบราว์เซอร์ (timezone Indochina Time, UTC+7) ตีความ string นี้เป็นเวลา local แทนที่จะเป็น UTC ทำให้ deadline เพี้ยนไป 7 ชั่วโมง (ดูเหมือนหมดเวลาไปแล้วทันทีที่รอบเริ่ม) ผู้เล่นเลยโดน auto-submit ทันทีโดยไม่มีโอกาสเขียนโค้ดเลย แก้ด้วยฟังก์ชัน `parseUtcTimestamp()` ใหม่ที่แปลง string ให้มี `Z` suffix ก่อน parse ยืนยันผ่านเบราว์เซอร์จริงแล้วว่านาฬิกานับถอยหลังจริงหลังแก้ (60s → 58s ตามเวลาจริงที่ผ่านไป)

### `client/src/bot/botManager.js` / `botAI.js`
- `update()` รับ `opponents`(React state, DB-authoritative) เพิ่ม — ดึงสถานะ `eliminated` ลงมาใส่ instance บอทให้หยุดทำงานเมื่อถูกคัดออกจริง (ย้อนทิศทางจากเดิมที่ sync คะแนน/เงินขึ้นไป)
- Sync กลับไปที่ `opponents` เหลือแค่ field cosmetic (`progress`, `isDebuffed`) — คะแนน/เงิน/ตกรอบจริงมาจาก DB poll เท่านั้น
- ลบ `awardCash`/`markEliminated` (ไม่ใช้แล้ว เซิร์ฟเวอร์อัปเดต DB ตรงแทน)
- เพิ่ม `resetRoundProgress()` ให้ progress bar เริ่มที่ 0% ทุกรอบใหม่ (คะแนน/เงิน/กระเป๋าไอเทมยังคงอยู่ข้ามรอบในแมตช์เดียวกัน)
- Economic effect จากบอท (cashSteal/taxCollection) ยิงใส่ผู้เล่นจริง เปลี่ยนจากคำนวณ local เป็นยิงผ่าน `/attack` เซิร์ฟเวอร์เดียวกับที่ผู้เล่นจริงใช้ (เพราะเงินผู้เล่นตอนนี้ DB-authoritative แล้ว ถ้าคำนวณ local อย่างเดียวจะถูก poll ทับกลับ)

### `client/src/pages/widget/BattleRoyaleGameplayView.jsx`
- แสดง badge "ส่งคำตอบแล้ว" (เขียว, 100%) แทน progress bar ปกติเมื่อคู่แข่ง (บอทหรือคนจริง) submit แล้ว — ใช้ข้อมูล `has_submitted` ที่เพิ่งมีจาก DB

## การทดสอบ

1. `npx eslint` ไฟล์ที่แก้ — ไม่มีปัญหาใหม่จากโค้ดที่เพิ่ม (error ที่เหลือทั้งหมดเป็น baseline เดิมที่มีอยู่ก่อนแล้ว — `motion` unused, `err` unused ใน catch เดิม)
2. `npm run build` ผ่านสำเร็จ
3. `node --check` ผ่านทั้ง `server.js`/`db.js`
4. **ทดสอบผ่าน API โดยตรง (Node script, ไม่ผ่านเบราว์เซอร์)**: จำลองผู้เล่นจริง 2 คน + บอท 2 ตัว สร้างห้อง/เริ่มแมตช์/ส่งคำตอบ ยืนยัน:
   - รอบ 1 (60s) → SUMMARY_1 (5s) → SHOP_1 (20s) ตรงเวลาเป๊ะทุกจุด (ไม่มี client ไหนขับเคลื่อนเลย)
   - อันดับ/เหรียญตามคะแนนรอบนั้นถูกต้อง (ผู้เล่นที่ส่งคะแนนสูงสุดได้อันดับ 1 เหรียญ 500)
   - **ทดสอบ fast-forward การตัดคน**: บังคับ deadline ให้หมดเร็ว ยืนยันรอบ 2 (eliminate=2 จาก 3 คนที่รอด) เหลือผู้รอด 1 คนพอดี และเป็นคนที่ได้คะแนนสูงสุดจริง — ตรงตามสเปก
   - ผู้เล่นที่ไม่ได้ poll ด้วยชื่อตัวเอง (จำลองแท็บไม่ active) ถูก stale-sweep เตะออกจากห้องถูกต้องตามกลไกเดิมที่มีอยู่แล้ว (ไม่ใช่บั๊กใหม่)
5. **ทดสอบผ่านเบราว์เซอร์จริง**: สร้างห้อง 2 คน (ผู้เล่น+บอท) ผ่าน UI จริง เริ่มแมตช์ พบบั๊ก timezone ตามที่อธิบายข้างบน แก้แล้วยืนยันนาฬิกานับถอยหลังจริงในเบราว์เซอร์ (60s→58s ตามเวลาจริง), โจทย์รอบ 4 จาก DB พร้อมโค้ดตั้งต้นว่างถูกต้อง (ฟีเจอร์เดิมจากเซสชันก่อนยังทำงานถูกต้องกับสถาปัตยกรรมใหม่)

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- Schema `arcade_rooms`/`arcade_participants` เพิ่มคอลัมน์ใหม่ (ไม่กระทบคอลัมน์เดิม, migration idempotent)
- `botAI.js`/`botManager.js` คะแนน/เงิน internal ตอนนี้เป็น cosmetic ล้วนสำหรับ targeting heuristic/shop affordability ของบอทเท่านั้น ไม่ใช่แหล่งความจริงอีกต่อไป — ถ้าใครแก้ไฟล์นี้ในอนาคตต้องรู้ว่าเลข cash/score ใน `BotAIEngine` ไม่ตรงกับที่ผู้เล่นเห็นบนจอเป๊ะๆ เสมอไป (เป็นการจำลองในเครื่องนั้นๆ)
- ไม่กระทบ `usePyodide.js`/`pyodideWorker.js`, route ของ Person 1/2

## สิ่งที่ยังไม่เสร็จ / ควรทดสอบเพิ่ม
- ยังไม่ได้ทดสอบ 2 คนจริงพร้อมกันผ่าน 2 แท็บเบราว์เซอร์แยกกัน (มีปัญหา native "Leave site?" dialog ของเบราว์เซอร์บล็อกการทดสอบอัตโนมัติระหว่างทาง) — ทดสอบ 2-human ผ่าน API โดยตรงแล้วเท่านั้น (ข้อ 4 ด้านบน) ยังไม่ได้ยืนยันภาพ UI จริงของทั้งสองฝั่งพร้อมกัน ควรทดสอบเพิ่มด้วยเบราว์เซอร์ 2 โปรไฟล์แยกกันจริง (ไม่ใช่ 2 แท็บ session เดียวกัน)
- `taxCollection`/`cashSteal` จากบอทยิงใส่กันเอง (bot-vs-bot) ยังคงเป็น cosmetic local ต่อ client ไม่ sync ผ่านเซิร์ฟเวอร์ (ยอมรับได้เพราะเงินบอทไม่กระทบผู้เล่นจริงและ converge ใหม่ทุกรอบตอน finalize) — ถ้าต้องการความแม่นยำเป๊ะระหว่างบอทในอนาคตค่อยพิจารณาเพิ่ม
- ยังไม่ได้เล่นครบ 4 รอบเต็มรูปแบบผ่านเบราว์เซอร์จริงหลังแก้บั๊ก timezone (ตรวจสอบจนถึงรอบ 4 ผ่านการ resume ของ session เก่าที่มีข้อมูลปนเปื้อนจากก่อนแก้บั๊ก ไม่ใช่การเล่นสะอาดตั้งแต่ต้น) ควรเล่นครบรอบใหม่สะอาดๆ อีกครั้งเพื่อยืนยันขั้นสุดท้าย
