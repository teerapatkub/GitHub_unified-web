# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-16 10:27
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: **รอบที่ 4 (รอบสุดท้าย)** ของแผนแยก widget — แยกส่วนที่ซับซ้อนที่สุดออกจาก `ArcadeBattleRoyale.jsx`: หน้าเล่นเกมจริง (Round phase) ที่มี Monaco Editor, ระบบดีบัฟ/เอฟเฟกต์ภาพ, panel ผู้เล่น/บอท, และระบบเลือกเป้าหมายไอเทม ครบทั้ง 4 รอบตามแผนที่ตกลงกับผู้ใช้แล้ว

## สิ่งที่แก้ไข

### ไฟล์ใหม่ 1 ไฟล์ใน `client/src/pages/widget/`
`BattleRoyaleGameplayView.jsx` — หน้าเล่นเกมทั้งหน้า (ไม่แยกย่อยเพิ่มเติมตามที่ตกลงกับผู้ใช้ไว้ เพราะเป็นส่วนที่เสี่ยงสุด) ครอบคลุม:
- การ์ดโจทย์ปัจจุบัน + ตัวจับเวลา + เงินสะสม + คำใบ้ AI
- กรอบ Monaco Editor พร้อมเอฟเฟกต์ภาพจากดีบัฟทั้งหมด (inkFog, blackout, mirrorMode, screenDimmer, keyScrambler ฯลฯ)
- panel ผลรันโค้ด (console output)
- ปุ่มทดสอบโค้ด/ส่งคำตอบ
- panel สถานะผู้เล่น (การ์ดตัวเอง + รายชื่อคู่ต่อสู้พร้อมระบบเลือกเป้าหมาย/เกรย์เอาต์เป้าที่โดนดีบัฟอยู่)
- panel กระเป๋าไอเทม

รับ prop 20 ตัว (state + handler function ทั้งหมดที่ใช้ในส่วนนี้): `phase, PHASES, t, timeLeft, playerState, checkEffectActive, SHOP_ITEMS, handleCodeChange, editorRef, handleEditorKeyDown, consoleOutput, runCodeTests, handleManualSubmit, isGrading, targetingItem, opponents, handleTargetClick, initiateItemUse, setTargetingItem`

### `client/src/pages/ArcadeBattleRoyale.jsx`
- เพิ่ม import `BattleRoyaleGameplayView`
- แทนที่ JSX ของ Round phase ที่เคยยาว ~330 บรรทัด ด้วยการเรียกใช้ widget เดียว ~22 บรรทัด
- **ทำความสะอาด import ที่ไม่ใช้แล้ว**: ลบ `Shield`, `AlertTriangle`, `HelpCircle`, `RotateCcw` จาก `lucide-react` และลบ `import Editor from '@monaco-editor/react'` ทั้งหมด เนื่องจากย้ายไปอยู่ใน widget ต่างๆ ที่แยกไว้ตลอด 4 รอบแล้ว ไม่มีจุดไหนในไฟล์หลักใช้อีกต่อไป

## สรุปผลรวมทั้ง 4 รอบของงานแยก widget
| รอบ | Widget ที่แยก | บรรทัด JSX เดิมที่ลดไปจากไฟล์หลัก (โดยประมาณ) |
|---|---|---|
| 1 | CreateRoomModal, RoomSettingsModal, PasswordPromptModal, GlossaryModal, NotificationStack | ~230 |
| 2 | PublicRoomBrowser, RoomLobbyView | ~265 |
| 3 | ShopPhaseView, ShopItemCard | ~118 |
| 4 | BattleRoyaleGameplayView | ~330 |

รวมลดโค้ด JSX inline ออกจาก `ArcadeBattleRoyale.jsx` ไปประมาณ 940+ บรรทัด กระจายอยู่ใน 10 ไฟล์ widget ใหม่ที่ `client/src/pages/widget/`

## การทดสอบ
1. `npx eslint` — 16 ปัญหาเท่าเดิม (baseline เดิม + false-positive `motion` ที่มีอยู่แล้วซ้ำใน 4 modal widget ตั้งแต่รอบ 1) ไม่มีจุดใหม่แม้จะทำความสะอาด import
2. `npm run build` ผ่านสำเร็จ
3. **ทดสอบผ่านเบราว์เซอร์จริงแบบเต็มรูปแบบ**: สร้างห้อง เริ่มแมตช์ พิมพ์โค้ดใน Monaco Editor ผ่าน widget ที่แยกแล้วยืนยัน editor รับค่าและแสดงผลถูกต้อง กดส่งคำตอบเข้าสู่ Shop 1 สำเร็จ ซื้อไอเทมโจมตี เข้าสู่ Round 2 ยืนยัน panel ผู้เล่น/บอทแสดงสถานะถูกต้องตรงกับ state จริง (ตรวจผ่าน React fiber โดยตรง): การ์ด "pong (You)" แสดงป้าย "ตกรอบ" และพื้นหลังสีชมพูอ่อนถูกต้องตรงกับ `playerState.eliminated === true`, ปุ่มไอเทมในกระเป๋าถูก disable ถูกต้องตามเงื่อนไข

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- ไม่กระทบ logic การทำงานใดๆ — ย้ายโค้ด JSX คำต่อคำเข้า component เดียว ไม่ได้แยกย่อยเพิ่มเพื่อลดความเสี่ยง
- ไม่กระทบ schema ฐานข้อมูล หรือ Bot AI Engine

## ⚠️ ปัญหาที่พบระหว่างทดสอบ (นอกขอบเขตงานนี้ ยังไม่ได้แก้ — แจ้งผู้ใช้แยกต่างหาก)
ระหว่างทดสอบพบว่าห้องที่มีผู้เล่นรวมกันแค่ 2 คน (มนุษย์ 1 + บอท 1) หลัง Round 1 ผู้เล่นมนุษย์ถูกคัดออกด้วย (`eliminateBottom(2)` ตัดทั้ง 2 คนที่เหลือในสนามเมื่อสนามมีแค่ 2 คนพอดี) เพราะ `eliminateBottom()` ไม่ได้เช็คว่าจำนวนผู้เล่นที่เหลือหลังตัดต้องไม่ต่ำกว่า 1 — เป็นปัญหาการออกแบบเกม (game-balance) ที่มีอยู่ก่อนแล้ว ไม่เกี่ยวกับงานแยก widget ครั้งนี้ เกิดขึ้นเฉพาะห้องขนาดเล็กกว่า 5 คนเท่านั้น (การทดสอบก่อนหน้านี้ในเซสชันนี้ใช้ห้อง 5 คนเต็มเสมอเลยไม่เจอ) ควรแจ้งผู้ใช้แยกเป็นงานถัดไปถ้าต้องการรองรับห้องขนาดเล็ก
