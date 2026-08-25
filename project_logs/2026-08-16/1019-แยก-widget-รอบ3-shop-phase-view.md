# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-16 10:19
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ต่อจากการแยก widget รอบที่ 1-2 (modal/notification, Lobby views) — รอบนี้เป็น **รอบที่ 3** ตามแผน: แยกหน้าร้านค้า (Shop phase) ออกจาก `ArcadeBattleRoyale.jsx`

## สิ่งที่แก้ไข

### ไฟล์ใหม่ 2 ไฟล์ใน `client/src/pages/widget/`
1. `ShopItemCard.jsx` — การ์ดไอเทม 1 ชิ้นในร้านค้า (ไอคอน/ราคา/ชื่อ/คำอธิบาย/ป้าย SOLD OUT/ปุ่มซื้อ) เป็น pure presentational component รับ `item, onBuy, canBuy, t` — logic การซื้อ (เช็คเงิน/กระเป๋าเต็ม/ลิมิต AOE) ย้ายไปอยู่ใน `ShopPhaseView` แล้วส่ง `onBuy` callback ที่ผูก index ของไอเทมนั้นมาให้
2. `ShopPhaseView.jsx` — หน้าร้านค้าทั้งหน้า (header เวลา/เงินสะสม/ปุ่มสุ่มร้านใหม่, grid การ์ดไอเทมผ่าน `ShopItemCard`, ส่วนขายไอเทมคืน 50%) รับ prop: `timeLeft, playerState, setPlayerState, shopState, setShopState, rollShop, canBuyItem, sellItem, notify, MAX_INVENTORY, MAX_AOE_HELD, t`

ทั้งสองไฟล์แยกออกมาจาก JSX เดิมคำต่อคำ ไม่เปลี่ยนพฤติกรรม/สไตล์ (รวมถึง logic การซื้อ 3 เงื่อนไข: เงินไม่พอ/กระเป๋าเต็ม 3 ชิ้น/AOE เกิน 1 ชิ้น ที่ยกมาทั้งหมด)

### `client/src/pages/ArcadeBattleRoyale.jsx`
- เพิ่ม import `ShopPhaseView`
- แทนที่ JSX ของ Shop phase ที่เคยยาว ~118 บรรทัด (รวม logic การซื้อ inline) ด้วยการเรียกใช้ widget เดียว ~14 บรรทัด

## การทดสอบ
1. `npx eslint` — 16 ปัญหาเท่าเดิมจากหลังรอบ 2 (ไม่มีจุดใหม่จาก `ShopPhaseView.jsx`/`ShopItemCard.jsx`)
2. `npm run build` ผ่านสำเร็จ
3. **ทดสอบผ่านเบราว์เซอร์จริง**: สร้างห้อง เริ่มแมตช์ ส่งคำตอบ Round 1 จนเข้าสู่ Shop 1 จริง ยืนยัน `ShopPhaseView` แสดงผลครบ (เวลาที่เหลือ, เงินสะสม, ปุ่มสุ่มร้านใหม่, การ์ดไอเทม 4 ใบ, ส่วนขายคืน) กดปุ่ม "ซื้อไอเทม" บนการ์ดกำแพงไฟร์วอลล์ ยืนยัน `ShopItemCard`→`onBuy` ทำงานถูกต้อง: หักเงิน, แสดงป้าย "ขายแล้ว" (SOLD OUT) ทับการ์ด, ไอเทมไปโผล่ในส่วน "ไอเทมของคุณ — ขายคืน" ด้วยราคา 50% ถูกต้องเป๊ะ (700→350)

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- ไม่กระทบ logic การทำงานใดๆ — ย้ายโค้ด JSX + logic การซื้อคำต่อคำเข้า component แยก
- ไม่กระทบ schema ฐานข้อมูล หรือ Bot AI Engine

## สิ่งที่ยังไม่เสร็จ (แผนที่ตกลงกับผู้ใช้ไว้)
- **รอบที่ 4** (ซับซ้อนสุด แยกท้ายสุด): แยก Battle Royale gameplay view (Round phase — โค้ดเอดิเตอร์, ผลรัน, panel ผู้เล่น/บอท, กระเป๋าไอเทม) ออกเป็นชิ้นย่อย — ยังไม่ได้เริ่ม
