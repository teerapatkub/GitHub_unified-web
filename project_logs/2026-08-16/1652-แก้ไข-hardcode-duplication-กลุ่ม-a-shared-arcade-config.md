# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-16 16:52
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ผู้ใช้สั่งให้ทำ Hardcode Audit ก่อนเริ่ม Phase 8 (ดู `plan.md`) เนื่องจากสงสัยว่าบั๊ก UI ที่ "แก้แล้วไม่หายจริง" หลายรอบมีสาเหตุจาก (1) magic number ตกค้างจาก scaffold, (2) logic เดียวกัน duplicate หลายไฟล์แก้ไม่ครบ, (3) regression จาก Phase 6 rewrite ที่ยังไม่ถูกจับ ตรวจพบ 6 จุด duplicate-source-of-truth จริง (กลุ่ม A) ผู้ใช้ให้แก้กลุ่ม A ก่อนไปขั้นตอน re-verify (ยังไม่เริ่ม Step 2-5)

## สิ่งที่แก้ไข

### ใหม่: `shared/arcadeConfig.json`
ไฟล์ config กลาง (single source of truth) ที่ทั้ง `server/server.js` (CommonJS `require`) และไฟล์ฝั่ง client/bot ทุกไฟล์ (Vite ESM `import`) โหลดตรงจากไฟล์เดียวกัน แทนที่จะ hand-sync ค่าคงที่แยกกันในแต่ละไฟล์:
- `phaseDurations` — ระยะเวลาแต่ละ phase (60/5/20s)
- `roundCaseCounts` — จำนวน test case ต่อรอบ (ใช้ scale คะแนนบอท)
- `maxInventory` (3), `maxAoeHeld` (1)
- `cashSteal.flatAmount` (300), `cashSteal.taxPercent` (0.2)
- `maxPlayers.min/max` (2/5)
- `shopItems` — id/price/type ของไอเทมร้านค้าทั้ง 15 ชิ้น

### `server/server.js`
- `require('../shared/arcadeConfig.json')` แทนที่ `ARCADE_PHASE_DURATIONS`, `ARCADE_ROUND_CASE_COUNTS` (ตัวแปรชื่อเดิม ค่ามาจาก config แทน — จุดใช้งานเดิมไม่ต้องแก้)
- เพิ่มฟังก์ชัน `clampArcadeMaxPlayers(raw, fallback)` แทนที่ `Math.min(5, Math.max(2, parseInt(...) || 5))` ที่เคย duplicate ไว้ 2 จุด (room-create, settings-update) — **แถมแก้บั๊กเดิมไปในตัว**: สูตรเก่าใช้ `|| 5` ทำให้ `max_players: 0` ถูกตีความเป็น falsy แล้ว fallback เป็น 5 แทนที่จะ clamp เป็น 2 ตามที่ตั้งใจ ฟังก์ชันใหม่ใช้ `Number.isFinite()` เช็คแทน แก้ถูกต้องแล้ว (ยืนยันด้วยการยิง API จริง)
- แก้สูตร cashSteal/taxCollection (endpoint `/rooms/:id/attack`) ให้อ่านจาก `arcadeConfig.cashSteal` แทน hardcode `0.20`/`300`

### `client/src/pages/ArcadeBattleRoyale.jsx`
- `import arcadeConfig from '../../../shared/arcadeConfig.json'`
- `ROUND_TIMES = arcadeConfig.phaseDurations` (เดิม hardcode object แยกจาก server)
- `MAX_INVENTORY`/`MAX_AOE_HELD` อ่านจาก config
- `SHOP_ITEMS`: แยก UI-only metadata (icon/nameKey/descKey) ไว้ใน `SHOP_UI_META` แล้ว merge price/type จาก `arcadeConfig.shopItems` ตอน build array — เหลือจุดเดียวที่แก้ราคา/type ได้
- แก้สูตร cashSteal/taxCollection preview **3 จุด** ที่พบ (มากกว่าที่ audit ตอนแรกประเมินไว้ 1 จุด — เจอเพิ่มที่บรรทัด auto-target-richest-opponent branch ของ taxCollection ด้วย) ให้อ่านจาก `arcadeConfig.cashSteal`

### `client/src/bot/botAI.js`
- `MAX_INVENTORY`/`MAX_AOE_HELD` อ่านจาก `arcadeConfig` แทน local const

### `client/src/bot/shopCatalog.js`
- เขียนใหม่ให้ build `SHOP_CATALOG` จาก `arcadeConfig.shopItems` + local `DISPLAY_NAMES` map (emoji+ชื่ออังกฤษ ใช้เฉพาะ internal log string ของบอท) แทนการ hardcode price/type ซ้ำทั้ง array

### `client/src/bot/botManager.js`
- สูตร cashSteal/taxCollection ระหว่างบอทยิงกันเอง อ่านจาก `arcadeConfig.cashSteal` แทน `0.20`/`300`

## รายละเอียดสำคัญ: cashSteal/taxCollection duplicate มากกว่าที่ตรวจพบตอน audit
ตอน audit ขั้นแรกประเมินไว้ 3 จุด (server, client preview, botManager bot-vs-bot) แต่ระหว่างแก้จริงพบจุดที่ 4 ใน `ArcadeBattleRoyale.jsx` — taxCollection ที่ auto-target ผู้เล่นรวยที่สุด (บรรทัดแยกจาก manual-target branch) ก็มีสูตร `0.20` hardcode ของตัวเองอีกชุด ยืนยันสมมติฐานของผู้ใช้ว่า duplicate ในระบบนี้มักซ่อนอยู่มากกว่าที่มองเห็นตอนแรก

## การทดสอบ
1. `node --check server.js` — ผ่าน
2. `npm run build` (client) — ผ่านสำเร็จ ยืนยันว่า cross-package JSON import (`client/src/**` → `../../../shared/arcadeConfig.json`) resolve ได้ถูกต้องใน production build
3. `npx eslint` ไฟล์ที่แก้ทั้งหมด — ไม่มี error ใหม่ (error ที่เหลือเป็น baseline เดิมจากเซสชันก่อน — `motion` unused, `err` unused)
4. ทดสอบผ่าน dev server จริง (ตามข้อบังคับ CLAUDE.md):
   - เจอปัญหาระหว่างทดสอบ: มี process `node server.js` ค้างอยู่ 3 ตัวพร้อมกัน (จากการ `nohup ... &` ของตัวเองที่ `kill` ไม่ติดบน Windows ผ่าน Git Bash) ทำให้ผลทดสอบแรกดูเหมือนบั๊ก (`max_players: 0` คืนค่า 5 แทนที่จะเป็น 2) เพราะ request ไปโดน process เก่าที่ยังไม่มีโค้ดใหม่ แก้โดย `Stop-Process` ผ่าน PowerShell ให้เหลือ instance เดียว แล้ว retest ผ่านถูกต้อง — บันทึกไว้เผื่อเจอซ้ำ: **บน Windows/Git Bash ต้อง verify ด้วย `netstat`/`tasklist` ว่าเหลือ process เดียวจริงก่อนสรุปผลทดสอบ อย่าเชื่อ `kill <pid>` ของ bash เฉยๆ**
   - ยิง `POST /api/arcade/rooms/create` จริงด้วย `max_players: 0` → ได้ `max_players: 2` (clamp ถูกต้อง), `max_players: 99` → ได้ `max_players: 5` (clamp ถูกต้อง)
   - เปิดหน้าเว็บผ่าน Vite dev server จริง ตรวจ console ไม่มี error, ยืนยันด้วยการยิง request ตรงไปที่ Vite module transform endpoint ว่า `shared/arcadeConfig.json` ถูก serve ผ่าน `/@fs/...` สำเร็จ (HTTP 200) ทั้งใน dev mode และ production build — ไม่โดน Vite's `fs.allow` บล็อกเพราะ `.git` อยู่ที่ repo root ทำให้ workspace root ครอบคลุม `shared/` ด้วย
   - ยังไม่ได้ล็อกอินเข้าหน้า `/matchmaking` เต็มรูปแบบผ่าน browser เพื่อดู shop UI แสดงราคาถูกต้อง (ติด auth-redirect ที่เป็นบั๊กเดิมที่รู้อยู่แล้วใน `plan.md` Phase 7 ข้อ 5) — จะทดสอบเต็มรูปแบบในขั้นตอน Step 2 (re-verify Phase 0-7) ต่อไป

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- โฟลเดอร์ใหม่ `shared/` ที่ repo root — ไม่กระทบ Person 1/Person 2 เพราะใช้เฉพาะไฟล์ arcade เท่านั้น
- `server/server.js` require path ใหม่ (`../shared/arcadeConfig.json`) — ถ้าย้ายตำแหน่งไฟล์ `server.js` หรือ `shared/` ในอนาคตต้องแก้ path นี้ด้วย
- ไม่กระทบ schema ฐานข้อมูล (ไม่มีการแก้ `server/db.js`)
- แก้บั๊ก `max_players: 0` clamp เป็นผลพลอยได้ (ไม่ใช่เป้าหมายเดิมของงานนี้ แต่เป็นผลตรงจากการรวม logic)

## สิ่งที่ยังไม่เสร็จ / ควรทดสอบเพิ่ม
- ยังไม่ได้ยืนยัน UI จริงของหน้าร้านค้า (shop) ผ่านเบราว์เซอร์ที่ล็อกอินแล้วว่าราคาที่แสดงตรงกับ config ใหม่ (มีแผนทำใน Step 2)
- `roundCaseCounts` ใน config ยังเป็นตัวเลขที่ต้อง sync ด้วยมือกับ `TASK_TEST_CASES` ใน `ArcadeBattleRoyale.jsx` (เนื้อ test case จริงไม่ได้ย้ายเข้า shared config เพราะเป็น scope ใหญ่กว่าที่ตั้งใจแก้รอบนี้) — ยังมีความเสี่ยง drift เหลืออยู่แต่ต่ำกว่าเดิมมาก (เหลือแค่ตัวเลขเดียว ไม่ใช่ทั้งสูตร)
- ขั้นตอน Step 2 (re-verify Phase 0-7 ด้วยการรันจริงทุก scenario) ยังไม่ได้เริ่ม ตามที่ผู้ใช้สั่งให้แก้กลุ่ม A ก่อน
