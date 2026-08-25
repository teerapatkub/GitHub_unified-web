# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-17 15:42
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ผู้ใช้ขอให้แตกไฟล์ `ArcadeBattleRoyale.jsx` (~2025 บรรทัด) ออกเป็นระบบย่อยหลายไฟล์ในโฟลเดอร์ `Arcade/` ใหม่ (รวม widget และ bot files ที่ใช้เฉพาะโหมดนี้) เพื่อให้หา/อ่านโค้ดง่ายขึ้น พร้อมยืนยันขอบเขตเพิ่มเติมว่าจะทำ UI รองรับฟีเจอร์ Phase 8 ด้วย (แยกเป็นงานต่อเนื่องหลังจากนี้)

## สิ่งที่แก้ไข

### โครงสร้างโฟลเดอร์ใหม่: `client/src/pages/Arcade/`
```
Arcade/
  ArcadeBattleRoyale.jsx   (2025 → 591 บรรทัด)
  constants.js              (ใหม่ — PHASES, ROUND_TIMES, TASKS, TASK_TEST_CASES, SHOP_ITEMS ฯลฯ)
  translations.js           (ใหม่ — TRANSLATIONS TH/EN ~375 บรรทัด แยกออกจากไฟล์หลัก)
  hooks/
    useRoomLifecycle.js     (433 บรรทัด — room CRUD, resume-match, host controls)
    useRoundJudging.js      (215 บรรทัด — Pyodide correctness + NVIDIA quality judge + submit)
    useShopEconomy.js       (104 บรรทัด — cash delta, ซื้อ/ขาย/สุ่มร้าน)
    useCombat.js             (309 บรรทัด — ไอเทมโจมตี/effects poll/editor debuff handlers)
  widgets/                  (ย้าย 12 ไฟล์จาก client/src/pages/widget/ ทั้งหมด)
  bot/                       (ย้าย 4 ไฟล์จาก client/src/bot/ ทั้งหมด — botAI.js, botManager.js, botProfiles.js, shopCatalog.js)
```
`client/src/hooks/usePyodide.js` **ไม่ย้าย** — เป็นไฟล์ของ Person 1 (Pyodide Web Worker) ตาม `CLAUDE.md` แม้ปัจจุบันมีแค่ arcade ที่ใช้งานจริง ก็ยังคงไว้ในตำแหน่งเดิมที่ Person 1 เป็นเจ้าของ แค่แก้ relative import path ให้ชี้ถูก

### การออกแบบ hook (สำคัญ)
พบว่า logic เชื่อมโยงกันลึกมาก (room-state poller ตัวเดียวแตะทุก concern) จึงตัดสินใจ:
- **เก็บไว้ที่ไฟล์หลัก**: `phase`/`timeLeft`/`currentRoom`/`roomParticipants` (state ที่ทุก hook ต้องใช้ร่วมกัน), refs ที่เกี่ยวกับ phase transition, room-state poller effect, countdown/bot-tick effect, และ render ทั้งหมด — เพราะเป็น cross-cutting orchestration ที่ผูกทุกส่วนเข้าด้วยกัน ไม่ใช่ concern เดียว
- **แยกเป็น hook**: เฉพาะ logic ที่เป็น self-contained จริงๆ ต่อ concern หนึ่ง (room CRUD, judging, shop, combat)
- เรียก hook ตามลำดับ dependency: `useCombat` → `useRoundJudging` (ต้องการ `checkEffectActive`) → `useShopEconomy` → `useRoomLifecycle` (ต้องการ `getRound4Task`) เพื่อหลีกเลี่ยง circular hook-to-hook dependency

## การทดสอบ
1. `node --check` (server ไม่ถูกแตะ), `npm run build` — ผ่านทุกขั้นตอน (หลังย้ายไฟล์, หลังแยก constants/translations, หลังแยก hooks — ตรวจ 3 รอบแยกกัน)
2. `npx eslint src/pages/Arcade/` — error ที่เหลือคือ baseline เดิม (`motion` unused — bug เดิมของ eslint config ที่รู้อยู่แล้ว) บวก 1 error ใหม่จาก eslint-plugin-react-hooks v7 rule (`set-state-in-effect`) ที่ตรวจพบบน `fetchRooms()` — **ยืนยันแล้วว่าโค้ดตรงนี้ก็อปจากต้นฉบับที่ทำงานถูกต้อง/ผ่านการทดสอบมาแล้วมาเป๊ะๆ ไม่ได้แก้ logic** จึงไม่ใช่ regression แค่ linter เวอร์ชันใหม่ตรวจจับ pattern เดิมที่ไม่เคยถูกตรวจมาก่อน
3. **ทดสอบผ่านเบราว์เซอร์จริงครบวงจร**: สร้างห้อง (ผ่าน `useRoomLifecycle`) → เพิ่มบอท → เริ่มแมตช์ → เขียนโค้ด Fibonacci จริงใน Monaco editor → กดทดสอบ+ส่งคำตอบ (ผ่าน `useRoundJudging` — Pyodide ตรวจจริง + เรียก NVIDIA judge จริง) → ยืนยันคะแนนที่บันทึกจริงใน DB (`pending_round_score: 250` ตรงกับสูตร testScore+qualityScore+timeScore) → บังคับรอบต่อไปจนถึง RESULT → หน้าจอ RESULT แสดงคะแนนถูกต้องไม่มี error ใดๆ ตลอด pipeline

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- `App.jsx` แก้ import path เดียว (`./pages/Arcade/ArcadeBattleRoyale`) — ยืนยันแล้วว่าเป็นจุดเดียวที่ import ไฟล์นี้ทั้งระบบ
- `server/server.js` และ `shared/arcadeConfig.json` แก้แค่ comment path อ้างอิง (ไม่กระทบ logic)
- ไม่กระทบ Person 1/Person 2 (ทุกไฟล์ที่ย้าย/แก้อยู่ในขอบเขต arcade ทั้งหมด, ตรวจ import graph แล้วว่าไม่มีไฟล์นอกขอบเขตอ้างอิงถึง)

## สิ่งที่ยังไม่เสร็จ / ควรทดสอบเพิ่ม
- ยังไม่ได้ทดสอบ `useShopEconomy` hook ผ่านเบราว์เซอร์จริงหลังแยกไฟล์ (ห้องทดสอบ 2 คนจบแมตช์เร็วเกินไปข้ามช่วง shop ไป) — logic เป็นการก็อปจากที่ทดสอบผ่าน API อย่างละเอียดมาแล้วในงานก่อนหน้า (NVIDIA judge task) ความเสี่ยงต่ำ แต่ควรทดสอบซ้ำถ้ามีโอกาส
- Phase 8 feature UI (chat, round history, player stats, quick mode, difficulty select) ยังไม่ได้เริ่ม — เป็นงานถัดไป
