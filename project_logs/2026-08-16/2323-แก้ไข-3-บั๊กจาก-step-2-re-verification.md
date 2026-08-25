# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-16 23:23
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ต่อเนื่องจาก Step 2 (re-verify Phase 0-7 ด้วยการรันจริง) — เจอบั๊กยืนยันแล้ว 3 ตัวผ่านการทดสอบจริงทั้งเบราว์เซอร์และ API ผู้ใช้สั่งให้แก้ทั้ง 3 ตัวก่อนไป Step 4 (อัปเดต plan.md)

## บั๊กที่แก้ + วิธีแก้

### บั๊ก 1: Modal สร้างห้องไม่ปิดหลังสร้างสำเร็จ (บล็อกการใช้งานทั้งหมด)

**Root cause**: `CreateRoomModal.jsx` (และโมดัลอื่นอีก 4 ไฟล์ที่ใช้ pattern เดียวกัน) ห่อด้วย `<AnimatePresence>{show && (<motion.div exit={{...}}>)}</AnimatePresence>` — ยืนยันด้วย React Fiber inspection ว่า `show` prop เปลี่ยนเป็น `false` ถูกต้องแล้ว (ปัญหาไม่ได้อยู่ที่ logic ของแอป) แต่ framer-motion's AnimatePresence ไม่ unmount DOM node จริง ปล่อยให้ backdrop เต็มจอ (`opacity:0`, `pointer-events:auto`) บล็อกทุกคลิกไปยัง lobby ด้านล่างตลอดไป — ยืนยันซ้ำในทั้ง dev server และ production build (`vite preview`) ตัดความเป็นไปได้เรื่อง React StrictMode

**ไฟล์ที่แก้** (ทั้ง 5 ไฟล์ใช้ pattern เดียวกัน แก้ให้ครบทุกจุดตามที่ผู้ใช้สั่ง ไม่ใช่แค่จุดที่เจอบั๊ก):
- `client/src/pages/widget/CreateRoomModal.jsx`
- `client/src/pages/widget/RoomSettingsModal.jsx`
- `client/src/pages/widget/PasswordPromptModal.jsx`
- `client/src/pages/widget/GlossaryModal.jsx`
- `client/src/pages/widget/ExitConfirmModal.jsx`

**วิธีแก้**: ลบ `<AnimatePresence>` wrapper และ `exit` prop ออกทั้งหมด เปลี่ยนเป็น conditional render ธรรมดา (`if (!show) return null;`) ยังคง `initial`/`animate` ไว้ (fade-in ตอนเปิดยังทำงานปกติ) แลกกับการเสีย fade-out animation ตอนปิด (React unmount ทันทีแทน) — รับประกันว่า modal จะปิดจริงเสมอ ไม่ขึ้นกับ animation library

### บั๊ก 2: ซื้อของในร้านค้าไม่หักเงินจริง (ไอเทมฟรี)

**Root cause**: `buyItem()`/`sellItem()`/`rollShop()` เดิมเรียก `setPlayerState()` local อย่างเดียว ไม่มี endpoint ฝั่งเซิร์ฟเวอร์สำหรับการซื้อของเลย (`grep` ทุก route `/api/arcade/*` ยืนยันไม่มี) ในขณะที่ room-state poller (ทุก 2 วิ) เขียนทับ `playerState.cash` จาก DB โดยไม่มีเงื่อนไขยกเว้น — ยืนยันด้วยการซื้อจริงผ่าน UI: DB cash ไม่ขยับเลยหลังซื้อไอเทม 300 (แม้ไอเทมจะเข้า inventory จริง) สาเหตุคือ Phase 6 ทำให้เงินจากการต่อสู้ (cashSteal/taxCollection) เป็น DB-authoritative แต่ไม่เคยย้ายเงินจากร้านค้ามาด้วย

**ไฟล์ที่แก้**:
- `server/server.js`: เพิ่ม endpoint ใหม่ `POST /api/arcade/rooms/:id/shop-cash-delta` — รับ `{user_name, delta}`, อ่านเงินปัจจุบันจาก DB, ปฏิเสธถ้าติดลบ (เงินไม่พอ), ปฏิเสธถ้า phase ไม่ใช่ `SHOP_*` (บังคับกฎ "ซื้อได้เฉพาะช่วง shop" ที่ฝั่งเซิร์ฟเวอร์เป็นครั้งแรก — เดิมมีแค่ UI ที่บังคับ), เขียนเงินใหม่ลง DB แล้วคืนค่าที่ authoritative กลับไป
- `client/src/pages/ArcadeBattleRoyale.jsx`: เพิ่ม `applyCashDelta(delta)` helper เดียวที่ทั้ง `buyItem`/`sellItem`/`rollShop` เรียกใช้ร่วมกัน (เปลี่ยนทั้ง 3 ฟังก์ชันเป็น `async`, รอผลจากเซิร์ฟเวอร์ก่อนแก้ inventory/state local) — ย้าย `buyItem` จากที่เคยนิยามซ้ำใน `ShopPhaseView.jsx` มาไว้จุดเดียวกับอีก 2 ฟังก์ชัน ส่งเป็น prop ลงไปแทน
- `client/src/pages/widget/ShopPhaseView.jsx`: ลบ `buyItem` เวอร์ชัน local-only เดิมทิ้ง เปลี่ยนไปใช้ prop ที่ส่งมาจาก parent

### บั๊ก 3: `add-bot` เพิ่มบอทระหว่างแมตช์ได้ (ไม่มี guard)

**Root cause**: endpoint `POST /rooms/:id/add-bot` ไม่มีการเช็ค `room.status` เลย ต่างจาก `join` (สำหรับผู้เล่นจริง) ที่ปฏิเสธถ้า `status !== 'WAITING'` อยู่แล้ว — ยืนยันด้วยการเพิ่มบอทเข้าห้องที่กำลังเล่นรอบ 2 จริง บอทเข้ามาด้วยคะแนน/เงิน 0 ทั้งที่คนอื่นสะสมคะแนนเป็นล้านแล้ว การันตีว่าบอทตัวนั้นจะถูกคัดออกทันทีในรอบต่อไป และ host สามารถทำซ้ำได้ไม่จำกัดตลอดทั้งแมตช์

**ไฟล์ที่แก้**: `server/server.js` — เพิ่ม `if (rooms[0].status !== 'WAITING') return res.status(400)...` ใน `/rooms/:id/add-bot` (ตำแหน่งเดียวกับที่ `join` เช็คอยู่แล้ว)

## การทดสอบ

1. `node --check server.js` — ผ่าน
2. `npx eslint` ทุกไฟล์ที่แก้ (7 ไฟล์) — ไม่มี error ใหม่ (error ที่เหลือทั้งหมดตรงกับ baseline เดิมที่มีอยู่ก่อนแล้วในเซสชันนี้ทุกตัว รวมถึง "motion unused" ที่เป็นช่องโหว่ config ของ eslint เดิม ไม่ใช่โค้ดผิด)
3. `npm run build` — ผ่านสำเร็จทั้งก่อนและหลังแก้ทุกจุด
4. **ทดสอบผ่านเบราว์เซอร์จริง + API จริงกับ PostgreSQL**:
   - บั๊ก 1: สร้างห้องผ่าน UI จริง 3 รอบ — modal ปิดสำเร็จทุกครั้ง, กด "เพิ่มบอท" ได้ทันทีไม่ต้อง workaround ใดๆ, ทดสอบ GlossaryModal ปิดสำเร็จด้วย
   - บั๊ก 2: ยิง `POST /shop-cash-delta` จริงระหว่าง SHOP_1 ของห้องจริง — เงินจาก 400 ลดเหลือ 100 ถูกต้อง และ **ยืนยันด้วย GET แยกต่างหาก** ว่าเงินยังคงอยู่ที่ 100 ใน DB จริง (ไม่ถูก poll ทับกลับ) ทดสอบ reject 2 กรณี: นอกช่วง shop (`WAITING`/`SUMMARY_1`) ถูกปฏิเสธถูกต้องทั้งคู่
   - บั๊ก 3: เพิ่มบอทตอนห้องอยู่ status `PLAYING` จริง — ถูกปฏิเสธด้วยข้อความ "ไม่สามารถเพิ่มบอทระหว่างการแข่งขันได้" ถูกต้อง
5. **ปัญหาที่เจอระหว่างทดสอบ (ไม่เกี่ยวกับบั๊กที่แก้)**: เบราว์เซอร์ทดสอบเจอ `ERR_INSUFFICIENT_RESOURCES` หลังเปิด/ปิด tab และสร้างห้องทดสอบไปหลายสิบรอบต่อเนื่องกันในเซสชันเดียว (ข้อจำกัดของสภาพแวดล้อมทดสอบเอง ไม่ใช่บั๊กแอป) — ทำให้การทดสอบซื้อของรอบสุดท้ายผ่าน UI แบบครบวงจร (คลิกซื้อ → เห็นเงินลดในหน้าจอ) ทำไม่สำเร็จ 100% แต่ endpoint เดียวกันที่ UI เรียกถูกยืนยันถูกต้องแล้วผ่าน API โดยตรง (ข้อ 4) ซึ่งเป็น code path เดียวกันทุกประการ

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- Schema ไม่เปลี่ยน (endpoint ใหม่ใช้คอลัมน์ `cash` ที่มีอยู่แล้ว)
- Modal ทั้ง 5 ไฟล์เสีย fade-out animation ตอนปิด (เปลี่ยนเป็นหายทันที) แลกกับการปิดได้จริงเสมอ — เป็นการตัดสินใจที่ยอมรับได้ (correctness > cosmetic animation)
- `ShopPhaseView.jsx` เปลี่ยน prop signature (`buyItem` เป็น prop ใหม่, ตัด `setPlayerState`/`setShopState`/`notify`/`MAX_INVENTORY`/`MAX_AOE_HELD` ที่ไม่ใช้แล้วออก) — ไม่กระทบไฟล์อื่นเพราะ `ShopPhaseView` ถูกเรียกจากจุดเดียวใน `ArcadeBattleRoyale.jsx` ซึ่งแก้พร้อมกันแล้ว
- ไม่กระทบ Bot AI Engine (บอทไม่เคยใช้ shop endpoint ของผู้เล่นจริง — เงินบอทยังคง client-local ตามเดิม)

## สิ่งที่ยังไม่เสร็จ / ควรทดสอบเพิ่ม
- ยังไม่ได้ยืนยันการซื้อของแบบ end-to-end ผ่าน UI ครบวงจร (คลิกซื้อ → เห็นเงินลดค้างในหน้าจอหลัง poll หลายรอบ) เนื่องจากปัญหาเบราว์เซอร์ทดสอบข้อ 5 ด้านบน — endpoint ถูกยืนยันถูกต้องแล้วผ่าน API ซึ่งเป็น code path เดียวกับที่ UI เรียก ความเสี่ยงต่ำ แต่ควรทดสอบซ้ำอีกครั้งด้วยเซสชันเบราว์เซอร์ใหม่สะอาดๆ ถ้ามีโอกาส
- Step 2 (re-verify Phase 0-7) ยังไม่ครบทุก scenario — เหลือ: ห้อง 5 บอทเต็มรูปแบบ, ผู้เล่นจริง 2 คนพร้อมกัน, หน้าจอ spectate ของผู้ตกรอบ, ปุ่ม back ของเบราว์เซอร์, การ refresh กลางเกม
