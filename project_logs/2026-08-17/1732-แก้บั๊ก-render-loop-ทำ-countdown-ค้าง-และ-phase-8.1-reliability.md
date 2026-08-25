# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-17 17:32
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ผู้ใช้สั่งให้ (1) ทดสอบ `useShopEconomy` ผ่านเบราว์เซอร์จริง (งานที่ค้างจากการแตกไฟล์รอบก่อน) และ (2) เริ่มสร้าง UI ของ Phase 8 — ระหว่างทดสอบข้อ (1) เจอบั๊ก render loop ที่รุนแรงกว่าที่คาด จึงแก้ก่อนแล้วต่อด้วย Phase 8.1

---

## 1. บั๊กใหญ่ที่พบ: render loop ทำให้ countdown ค้างและยิง request ท่วมเซิร์ฟเวอร์

### อาการที่เห็นตอนทดสอบจริง
- ตัวเลขเวลานับถอยหลังบนหน้าจอ **ค้างนิ่ง** ไม่ลดลงเลยทั้งรอบ (วัดจริง: อ่านค่าเดิม `20s` ซ้ำ 6 ครั้งห่างกัน 1.5 วินาที)
- กดซื้อของในร้านค้าแล้วขึ้น error `เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์` ทั้งที่เซิร์ฟเวอร์ปกติ
- console มี error **990 รายการ** เป็น `Failed to fetch` จาก room-state poller และ effects poller

### สาเหตุราก (ยืนยันด้วยการวัด ไม่ใช่เดา)
วัดด้วยการ patch `window.setTimeout` ในหน้าเว็บจริง: effect นับเวลา **ตั้ง timeout ใหม่ 328 ครั้งใน 2 วินาที** (~164 ครั้ง/วินาที) = render loop ชัดเจน

มี loop 3 จุดที่เกี่ยวพันกัน ทั้งหมดคือ effect ที่ dependency ของตัวเองถูกเขียนใหม่โดย effect ตัวเอง:

| จุด | ปัญหา |
|---|---|
| `ArcadeBattleRoyale.jsx` timer effect | deps มี `playerState` และ `opponents` (object) แต่ตัว effect เรียก `botManager.update()` ที่ `setPlayerState`/`setOpponents` ทุกครั้ง → effect re-run บนผลลัพธ์ตัวเอง → cleanup `clearTimeout` ยิงทิ้ง timeout 1 วินาทีก่อนมันได้ทำงาน **countdown จึงไม่เคยเดินเลย** |
| `ArcadeBattleRoyale.jsx` room-state poller | deps มี `currentRoom` (object) แต่ตัว poller เรียก `setCurrentRoom(data.room)` ทุกครั้ง → effect remount → `fetchRoomState()` ยิงใหม่ทันที ไม่รอ 2 วินาที = **loop ยิง request ไม่จำกัด** |
| `ArcadeBattleRoyale.jsx` `t` | `const t = (key) => ...` สร้าง function ใหม่ทุก render และอยู่ใน deps ของ poller ทั้งสองตัว → ทุก render = poller ถูกรีเซ็ต + ยิง fetch อีกครั้ง |
| `hooks/useCombat.js` effects poller | deps มี `currentRoom` object เหมือนกัน → remount ตามทุกครั้งที่ poller ตัวแม่ทำงาน |

### ผลกระทบต่อผู้เล่นจริง (ไม่ใช่แค่เรื่อง performance)
1. **ผู้เล่นไม่เห็นเวลานับถอยหลัง** เลยทั้งเกม — ตัวเลขค้างที่ค่าเริ่มต้นของ phase
2. **ระบบส่งคำตอบอัตโนมัติเมื่อหมดเวลาไม่ทำงาน** — เงื่อนไข `timeLeft === 0` ไม่มีทางเป็นจริงเพราะ `timeLeft` ไม่เคยถูกอัปเดต ใครไม่กดปุ่ม "ส่งคำตอบ" เองจะได้ **0 คะแนน** ทั้งรอบแบบเงียบๆ
3. **ยิง request ท่วมจน browser หมด connection pool** → `Failed to fetch` → ซื้อของในร้านค้าล้มเหลว
4. ข้อ 3 น่าจะเป็นสาเหตุจริงของอาการ `ERR_INSUFFICIENT_RESOURCES` ที่เจอในเซสชันก่อน — ตอนนั้นสรุปว่าเป็นเพราะสคริปต์ทดสอบของตัวเองกินทรัพยากร **ซึ่งเป็นการวิเคราะห์ที่ผิด** ต้นเหตุอยู่ในโค้ดแอปเอง

### เป็น regression จากการแตกไฟล์รอบก่อนหรือไม่
**ไม่ใช่** — ตรวจกับ git แล้ว: เวอร์ชันที่ commit ไว้ (`HEAD`) ใช้ deps เป็น
`[timeLeft, phase, roomParticipants, playerState.name, setPlayerState, setOpponents, notify]`
คือใช้ `playerState.name` (string คงที่) และไม่มี `opponents` เลย
บั๊กเกิดตอนงาน Phase 6/7 ที่ยังไม่ commit (ตอนเพิ่ม `opponents` + `dispatchBotAttackOnPlayer` เข้า signature ของ `botManager.update`) แล้วเปลี่ยน deps เป็น object ทั้งก้อน การแตกไฟล์แค่ก็อปมาตามเดิม

### การแก้
- `t` → ห่อ `useCallback` ผูกกับ `[lang]` ให้ identity คงที่
- เพิ่ม `const roomId = currentRoom?.room_id ?? null` แล้วให้ poller ทั้งสองตัว (ในไฟล์หลัก และใน `useCombat.js`) ใช้ **primitive นี้** เป็น dep แทน object `currentRoom`
- timer effect → เขียนใหม่เป็น `setInterval` 1 วินาที อ่านค่าล่าสุดผ่าน `tickRef` (mirror ของ `playerState`/`opponents`/`roomParticipants` + callbacks) deps เหลือแค่ `[phase, setPlayerState, setOpponents]`
- ย้ายการอ่าน `phase_deadline` ขึ้น**ก่อน** early-return ของ "phase ไม่เปลี่ยน" — เดิมอ่าน deadline แค่ตอน phase เปลี่ยน ทำให้ถ้าเซิร์ฟเวอร์ปรับ deadline กลาง phase client จะนับจาก deadline เก่าค้างไว้

---

## 2. ผลการทดสอบ `useShopEconomy`

### ฝั่งเซิร์ฟเวอร์ — ผ่านครบ 10/10 (ทดสอบจริง)
สคริปต์ยิง HTTP จริงไปที่ server จริง + PostgreSQL จริง โดยสร้างห้อง เพิ่มบอท เริ่มแมตช์ และรอ server tick พาไปถึง `SHOP_1` จริง (ไม่ได้ mock):

| ข้อ | ผล |
|---|---|
| ปฏิเสธการใช้เงินนอกช่วง `SHOP_` | PASS (400 `ทำได้เฉพาะช่วงร้านค้าเท่านั้น`) |
| แมตช์เดินถึง `SHOP_1` จริง | PASS |
| ซื้อของหักเงินตรงราคาเป๊ะ | PASS (5000 → 4600) |
| เงินที่หักบันทึกลง DB จริง | PASS |
| ขายคืนได้เงินคืน | PASS (4600 → 4800) |
| ปฏิเสธถ้าเงินจะติดลบ | PASS (400 `เงินไม่พอ`) |
| การปฏิเสธไม่แตะยอดเงินเดิม | PASS |
| ปฏิเสธ user ที่ไม่ได้อยู่ในห้อง | PASS (404) |
| ปฏิเสธ delta ที่ไม่ใช่ตัวเลข | PASS (400) |

รันซ้ำอีกรอบหลังรีสตาร์ตเซิร์ฟเวอร์ก็ยังผ่าน 10/10

### ฝั่ง UI — ผ่านครบทุกข้อ (ทดสอบบนหน้าจอจริง ห้อง `ARC-9CQB`)
ทดสอบในแท็บที่เพิ่งโหลดใหม่ (timer ยังไม่ถูก Chrome freeze) ขยายเวลา shop phase ผ่าน DB และเติมเงินทดสอบเพื่อให้เข้าถึงทุก branch ได้ในหน้าต่างเวลาเดียว:

| ข้อ | ผล |
|---|---|
| ล็อกปุ่มตามเงินที่มี | PASS — ไอเทม 600 ถูก disable ตอนมีเงิน 500 |
| ซื้อหักเงินตรงราคา | PASS — 5000→4100 (−900), 4100→3500 (−600), 3500→3000 (−500) |
| ราคาขายคืน = ครึ่งราคา | PASS — ไอเทม 900 แสดง "ขาย 🪙 450" |
| ขายคืนได้เงินคืนจริง | PASS — 3000→3450 (+450) |
| ป้าย "ขายแล้ว" บนการ์ดที่ซื้อแล้ว | PASS — overlay ขึ้นถูกใบ และปุ่มถูก disable |
| **เพดานช่องเก็บ 3 ชิ้น** | PASS — ใบที่ 4 (ราคา 650, มีเงิน 3000 ซื้อไหวสบาย) ถูก disable เพราะกระเป๋าเต็ม |
| ขายแล้วช่องว่างคืน → ปุ่มกลับใช้ได้ | PASS — ขาย 1 ชิ้น (3→2) ใบที่ 4 กลับ enable ทันที |
| **เพดานไอเทม AoE 1 ชิ้น** | PASS — ทดสอบแบบแยกตัวแปรชัด: ถือ AoE 1 ชิ้น (EMP Strike) **เหลือช่องว่าง 2 ช่อง + มีเงิน 900,000** แล้ว AoE ใบที่สอง (Time Freeze) ถูก disable ขณะที่การ์ดที่ไม่ใช่ AoE ในชุดเดียวกัน (Earthquake, Screen Dimmer) ยัง enable → สาเหตุเดียวที่เป็นไปได้คือเพดาน AoE ไม่ใช่กระเป๋าเต็มหรือเงินไม่พอ |
| ราคาสุ่มร้านใหม่คูณสอง | PASS — 200 → หลังสุ่มเป็น 400 (และเงินถูกหัก 200 จริง: 3450→3250) |
| server ปฏิเสธ → ไม่เพิ่มไอเทมเข้ากระเป๋า | PASS |

## 4. ผลทดสอบการแก้บั๊ก render loop และ Phase 8.1 บนหน้าจอจริง

| สิ่งที่ทดสอบ | ผล |
|---|---|
| countdown เดินจริง | PASS — ROUND 1 นับจาก ~47s ลงมาถึง 5s (ก่อนแก้ค้างนิ่งสนิท) |
| loop หายจริง | PASS — probe นับการตั้ง `setTimeout(1000)` ได้ **0 ครั้ง**ใน 2 วินาที (เพราะเปลี่ยนเป็น `setInterval` แล้ว) เทียบกับ **328 ครั้ง**ก่อนแก้ |
| ไม่ยิง request ท่วมแล้ว | PASS — 4 requests ใน 6 วินาที (ก่อนแก้หลายร้อยครั้ง/วินาที) |
| อ่าน `phase_deadline` ใหม่ทุก poll | PASS — ขยาย deadline ใน DB กลาง shop phase แล้ว client แสดง `547s` ตามค่าใหม่ทันที (ก่อนแก้จะยังค้างที่ deadline เดิม) |
| `visibilitychange` poll ทันทีที่กลับมา | PASS — client ค้างอยู่ที่ ROUND_1 (เพราะ throttle) พอแท็บกลับมา active ก็กระโดดมา SHOP_1 + เงิน 5000 ทันทีในการ poll ครั้งเดียว |
| แบนเนอร์เชื่อมต่อหลุด | PASS — override `window.fetch` ให้ล้มเหลว แบนเนอร์ขึ้นหลัง poll ล้มติดกัน 3 ครั้ง และ**หายเองทันที**เมื่อ fetch กลับมาปกติ |
| ล้างห้องที่เหลือแต่บอทอัตโนมัติ | PASS — หลังออกจากห้อง sweep ลบห้องทิ้งเอง (rooms 0, participants 0) ยืนยันว่า query ที่เปลี่ยนมาอ่าน config ยังทำงานถูก |

## 5. แก้บั๊ก auth-hydration ใน `App.jsx` (ผู้ใช้อนุญาตแล้ว)
`useState(null)` ทำให้ render แรกยังไม่มี user → route guard ตีว่าไม่ได้ล็อกอิน → redirect ไป `/login` (URL เปลี่ยนไปแล้ว) → สุดท้ายเด้งไป `/learn` แทนหน้าที่ขอ
แก้เป็น seed ค่าเริ่มต้นจาก `localStorage` แบบ synchronous ใน initializer ของ `useState` (อ่าน key เดียวกับที่ effect เดิมอ่าน เพื่อให้ค่าตรงกัน) effect เดิมยังทำงานต่อตามปกติสำหรับ injected user / guest / refresh profile
**PASS — ทดสอบจริง**: โหลด `http://localhost:5174/matchmaking` ตรงๆ บน Chrome จริง แล้วอยู่ที่หน้า Arcade ไม่เด้งไป `/learn` อีก (ก่อนแก้เด้งทุกครั้ง)

---

## 3. Phase 8.1 — Reliability & Continuity (ทำเสร็จ)

ทั้ง 3 ข้อมาจากปัญหาที่เจอเองระหว่างทดสอบวันนี้ ไม่ใช่การเดาล่วงหน้า

1. **แบนเนอร์แจ้งเตือนการเชื่อมต่อหลุด** — นับ poll ที่ล้มเหลวติดกันใน `failedPollsRef` ครบ 3 ครั้ง (~6 วินาที) จึงโชว์แบนเนอร์สีเหลืองด้านบนสุด, poll สำเร็จครั้งเดียวก็เคลียร์ทิ้ง
   ตั้งใจใช้ conditional render ธรรมดา **ไม่ใช้ `AnimatePresence`** เพราะ element นี้ครอบทับ UI แมตช์ — เป็นรูปแบบเดียวกับบั๊ก modal สร้างห้องที่เคยทำให้เกิด click-blocker มองไม่เห็น
2. **ตรวจจับห้องหายจากเซิร์ฟเวอร์** — เดิมถ้าห้องถูกลบ (host ออกจนห้องว่าง หรือถูก stale sweep) client จะค้างอยู่หน้าแมตช์ที่ไม่มีทางเดินต่อได้ ต้อง reload เอง (เจอเคสนี้จริงตอนทดสอบ) ตอนนี้ `GET /rooms/:id` ตอบ 404 → `handleRoomVanished()` เคลียร์ state ทั้งหมด กลับหน้าล็อบบี้ พร้อมข้อความอธิบาย (ยืนยันแล้วว่า endpoint ตอบ 404 จริง)
3. **แก้ heartbeat ให้ทนแท็บที่อยู่เบื้องหลัง** — เดิม stale window hardcode ไว้ 45 วินาที ซึ่ง**ต่ำกว่าที่เบราว์เซอร์รับประกัน**: Chrome throttle timer ในแท็บ background เหลือ ~1 ครั้ง/นาที ผู้เล่นที่แค่สลับแท็บระหว่างรอบจะหยุดส่ง heartbeat แล้วถูกลบออกจากแมตช์ตัวเอง (เกิดขึ้นจริงวันนี้ — ห้องทดสอบถูกลบกลางรอบ) แก้เป็นค่า `staleParticipantSeconds: 150` ใน `shared/arcadeConfig.json` และเพิ่ม listener `visibilitychange` ให้ poll ทันทีเมื่อกลับมาเห็นหน้าจอ

---

## ไฟล์ที่แก้

| ไฟล์ | สิ่งที่แก้ |
|---|---|
| `client/src/pages/Arcade/ArcadeBattleRoyale.jsx` | `t` เป็น `useCallback`; เพิ่ม `roomId`; เขียน timer effect ใหม่เป็น interval + `tickRef`; ย้าย deadline refresh ขึ้นก่อน early return; เพิ่ม `connectionLost`/`failedPollsRef`/`handleRoomVanished` + แบนเนอร์; เพิ่ม `visibilitychange` |
| `client/src/pages/Arcade/hooks/useCombat.js` | poller ใช้ `roomId` primitive แทน object `currentRoom`; อ่านชื่อผู้เล่นจาก `playerStateRef` |
| `client/src/pages/Arcade/translations.js` | เพิ่ม `connectionLostBanner`, `roomClosedByServer` (TH/EN) |
| `shared/arcadeConfig.json` | เพิ่ม `staleParticipantSeconds: 150` + คอมเมนต์อธิบายเหตุผล |
| `server/server.js` | `sweepStaleArcadeParticipants()` อ่าน window จาก config ผ่าน parameterized query แทน hardcode 45s |

## การตรวจสอบ
- `node --check server.js` ผ่าน, `npm run build` ผ่าน
- `npx eslint src/pages/Arcade/` เหลือแต่ baseline เดิม (`motion` unused — ปัญหา eslint config ที่รู้อยู่แล้ว, และ warning `exhaustive-deps` เดิมที่ตั้งใจเว้นไว้เพราะมี ref กันซ้ำอยู่)
- ทดสอบ interval cast ใน psql จริงก่อนใช้: `SELECT CURRENT_TIMESTAMP - (150 || ' seconds')::interval` ผ่าน
- รีสตาร์ตเซิร์ฟเวอร์แล้วรัน sweep หลายนาที ไม่มี `sweep error` ใน log เลย
- ยืนยัน request ไม่ท่วมอีกแล้ว: วัดในหน้าเว็บจริงหลังแก้ ได้ **4 requests ใน 6 วินาที** (จากเดิมหลายร้อยครั้งต่อวินาที)

## ผลกระทบต่อส่วนอื่นของระบบ
- ไม่กระทบ schema ตาราง `arcade_*` (ไม่มีการเปลี่ยนโครงสร้าง) — แก้แค่เงื่อนไขเวลาใน query ของ sweep
- กระทบ Bot AI: `botManager.update()` เดิมถูกเรียก ~164 ครั้ง/วินาที ตอนนี้เรียก 1 ครั้ง/วินาทีตามที่ออกแบบไว้จริง — **พฤติกรรมบอท (ความเร็วความคืบหน้า/ความถี่การโจมตี) จะเปลี่ยนไปจากที่เคยเห็น** ควรลองเล่นดูว่าจังหวะเกมยังสนุก/สมดุลอยู่ไหม
- `staleParticipantSeconds` 45 → 150 วินาที: ผู้เล่นที่หลุดจริงจะค้างอยู่ในห้องนานขึ้น (แลกกับการไม่เตะผู้เล่นที่แค่สลับแท็บออก)

## สิ่งที่ยังไม่เสร็จ / ต้องทำต่อ
- **ยังไม่ได้ทดสอบบนหน้าจอ**: การกลับหน้าล็อบบี้เมื่อห้องหายจากเซิร์ฟเวอร์ (`handleRoomVanished`) — ยืนยันได้แค่ว่า endpoint ตอบ 404 จริงตามที่โค้ดคาดไว้ ยังไม่ได้ทดสอบเต็มรูปแบบเพราะต้องลบห้องออกจาก DB ตรงๆ ซึ่งติดกฎใน `CLAUDE.md` ที่ห้ามลบข้อมูลในตาราง `arcade_*` โดยไม่ถามก่อน
- **ยังไม่ได้ทดสอบ**: resume-match หลังปิด-เปิดเบราว์เซอร์จริง (ตอนนี้บั๊ก `App.jsx` แก้แล้ว เส้นทางนี้จึงเปิดให้ทดสอบได้)
- **ตรวจสมดุลบอทใหม่** — สำคัญ: `botManager.update()` เดิมถูกเรียก ~164 ครั้ง/วินาที ตอนนี้เรียก 1 ครั้ง/วินาทีตามที่ออกแบบ พฤติกรรมบอทจะเปลี่ยนไปจากที่เคยเห็นแน่นอน ควรลองเล่นจริงว่าจังหวะเกมยังสนุก/สมดุลอยู่ไหม
- Phase 8.2 (chat + emoji), 8.3 (round history + player stats), 8.4 (Quick Mode + เลือกระดับความยาก) **ยังไม่เริ่ม**
- ข้อสังเกตเล็กน้อยที่เจอระหว่างทาง (ยังไม่แก้): ป้าย "🛡️ โหมดผู้สังเกตการณ์" ค้างอยู่บน header แม้กลับมาหน้าล็อบบี้แล้ว

## ข้อควรระวังเรื่องการทดสอบในสภาพแวดล้อมนี้
Chrome จะ throttle timer ของแท็บที่อยู่ background เหลือ ~1 ครั้ง/นาที และ **freeze renderer ทั้งแท็บ** หลังซ่อนไปประมาณ 5 นาที (อาการ: CDP `Runtime.evaluate` timeout) ผลคือ heartbeat หยุดส่งแล้วห้องถูก stale sweep ลบกลางแมตช์ — เสียห้องทดสอบไป 3 ห้องเพราะเรื่องนี้ก่อนจะเข้าใจสาเหตุ
วิธีที่ใช้ได้: เปิดแท็บใหม่แล้วทดสอบให้จบภายในไม่กี่นาที (แท็บที่เพิ่งโหลด timer ยังเดินปกติ) และเรียก screenshot เพื่อปลุกแท็บเมื่อจำเป็น อาการทั้งหมดนี้เป็นข้อจำกัดของเครื่องมือทดสอบ **ไม่ใช่บั๊กของแอป** — แต่มันชี้ให้เห็นบั๊กจริงข้อ 3 ใน Phase 8.1 (stale window 45 วินาทีสั้นเกินไปสำหรับผู้เล่นที่สลับแท็บ)
