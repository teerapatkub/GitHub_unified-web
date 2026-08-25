# บันทึกการทำงาน (Work Log)

**วันที่และเวลา**: 2026-08-16 03:18
**ผู้ทำงาน**: Person 3 (Arcade Battle Royale & Overall System Architecture)
**บริบท**: ต่อเนื่องจาก Phase A ของแผนพัฒนาที่เสนอไว้ — แก้บั๊กชื่อคู่แข่งเป็น placeholder ที่เจอตอนทดสอบรอบก่อน แล้วทดสอบเต็มแมตช์จนจบ Round 3 จริงเป็นครั้งแรกของ session นี้ ระหว่างทดสอบพบบั๊กใหม่ที่ร้ายแรงกว่าเดิมในระบบคัดผู้เล่นออก จึงแก้ไขทันที

## ปัญหาที่ 1: ชื่อคู่แข่งแสดงเป็น placeholder เมื่อ host กดเริ่มแมตช์เอง

### สาเหตุ
`handleHostStartMatch()` ใน `client/src/pages/ArcadeBattleRoyale.jsx` ไม่เคยเรียก `setOpponents()` ด้วยข้อมูลผู้เล่นจริงจาก `roomParticipants` เลย ต่างจาก flow อีกฝั่ง (รอ poll สถานะห้อง) ที่ตั้งชื่อจริงให้ถูกต้อง ทำให้ opponents ค้างค่าเริ่มต้น placeholder (Dev_Ninja, Code_BotX, SyntaxError, NullPointer)

### สิ่งที่แก้ไข
เพิ่ม `setOpponents(others.map(...))` ใน `handleHostStartMatch()` โดยกรอง `roomParticipants` ไม่เอาตัวเอง แปลงเป็นรูปแบบเดียวกับ flow อีกฝั่ง (name/score/cash/eliminated/isBot)

### ผลการทดสอบ
สร้างห้อง 5 คน (ผู้เล่น+บอท 4 ตัว) กด "เริ่มการแข่งขัน" จากฝั่ง host เอง ยืนยันแผงคู่แข่งแสดงชื่อจริง (Bot_LogicCraft, Bot_Pythonic, Bot_BugHunter, Bot_SyntaxPro) ตั้งแต่ Round 1 ทันที ไม่มี placeholder อีกต่อไป

## ปัญหาที่ 2 (พบใหม่ระหว่างทดสอบ): การคัดผู้เล่นออกใช้คะแนนเก่าก่อนจบรอบ ไม่ใช่คะแนนที่เพิ่งตัดสิน

### สาเหตุ
`eliminateBottom()` อ่านค่า `playerState.score` และ `opponents` จาก closure ของ component render — แต่ `handlePhaseTransition()` เรียก `eliminateBottom()` ทันทีหลัง `await evaluateRound(roundNum)` ซึ่งอัปเดตคะแนนผ่าน `setState` เท่านั้น (asynchronous, ยังไม่ reflect กลับเข้า closure variable ในการเรียกครั้งเดียวกัน) ผลคือ `eliminateBottom` เปรียบเทียบคะแนน "ก่อนรอบนี้จบ" เสมอ ไม่ใช่คะแนนที่เพิ่งคำนวณจริง

ตรวจพบจากการทดสอบสด: ผู้เล่น (คะแนนจริงหลังรอบ 1 = 40,700,060 ซึ่งสูงที่สุดในสนาม) กลับถูกคัดออกแทนที่จะเป็นบอทợคะแนนต่ำสุดจริง เพราะตอนเปรียบเทียบ ระบบยังใช้ `playerState.score` เดิม (0, ก่อนรอบ 1 จะถูกบวกเข้า state) ทำให้ผู้เล่นดูเหมือนคะแนนต่ำที่สุดเสมอในทุกการเปรียบเทียบหลังรอบ 1

### สิ่งที่แก้ไข
`client/src/pages/ArcadeBattleRoyale.jsx`:
- `evaluateRound()` เปลี่ยนจากแค่เรียก `setState` ภายใน เป็น **return ค่า `{ newPlayerScore, newOpponents }`** ที่คำนวณสดในฟังก์ชันเดียวกัน (ไม่ต้องรอ re-render)
- `eliminateBottom(count, freshPlayerScore, freshOpponents)` เปลี่ยน signature ให้รับค่าคะแนนสดจากผู้เรียกโดยตรง แทนการอ่านจาก closure `playerState`/`opponents` เดิม
- จุดเรียกทั้ง 3 จุดใน `handlePhaseTransition()` (ROUND_1→SHOP_1, ROUND_2→SHOP_2, ROUND_3→RESULT) เปลี่ยนเป็น `const { newPlayerScore, newOpponents } = await evaluateRound(N); eliminateBottom(count, newPlayerScore, newOpponents);`

### การทดสอบ
1. `npx eslint` — 12 ปัญหาเท่าเดิม (baseline เดิม) ไม่มีจุดใหม่
2. `npm run build` ผ่านสำเร็จ
3. **ทดสอบเต็มแมตช์ผ่านเบราว์เซอร์จริงจนจบ Round 3 เป็นครั้งแรกของ session นี้**: สร้างห้อง 5 คน (ผู้เล่น+บอท 4 ตัว) เล่นครบทั้ง 3 รอบ ตรวจสอบคะแนนดิบผ่าน React fiber ทุกจุดคัดออก ยืนยันตรงสเปกทั้งหมด:
   - หลัง Round 1 (5→3): คะแนน pong=40,700,060 / BugHunter=20,840,019 / PyNinja=40,830,018 / Pythonic=30,590,045 / StackOverflow=30,460,047 → คัดออกถูกต้อง 2 ตัวต่ำสุดจริง (BugHunter, StackOverflow) pong ไม่โดนคัดออกทั้งที่คะแนนสูงเป็นอันดับ 2
   - หลัง Round 2 (3→2): คะแนน pong=71,400,120 / PyNinja=71,300,027 / Pythonic=61,430,083 → คัดออกถูกต้อง Pythonic (ต่ำสุด) เหลือ pong กับ PyNinja พอดี 2 คน
   - Round 3 (2→1 ตัดสินด้วยคะแนนโค้ดล้วนๆ): จบแมตช์ผลลัพธ์สุดท้าย #1 pong 92,100,177 pt / #2 Bot_PyNinja 81,790,038 pt / #3 Bot_Pythonic 61,430,083 pt — อันดับตรงกับคะแนนจริงทุกจุด
   - หน้าจอ "จบการแข่งขันในห้อง" (Final Arena Placements) และปุ่ม "ออกจากห้อง / อยู่ในห้องเดิมต่อ" แสดงผลถูกต้องครบ

## ผลกระทบที่อาจมีต่อส่วนอื่นของระบบ
- ไม่กระทบ Bot AI Engine หรือ Sabotage system โดยตรง (แก้เฉพาะจุดคำนวณ/เปรียบเทียบคะแนนตอนคัดออก)
- ไม่กระทบ schema ฐานข้อมูล (state ทั้งหมดเป็น client-side)
- `evaluateRound()` เปลี่ยนจาก `async () => {...}` (ไม่ return ค่า) เป็น return object — จุดเรียกอื่นถ้ามีในอนาคตต้องระวัง ตอนนี้มีแค่ 3 จุดใน `handlePhaseTransition()` เท่านั้นที่เรียกและถูกอัปเดตให้ใช้ return value แล้วครบ

## สิ่งที่ยังไม่เสร็จ / ควรทดสอบเพิ่ม
- ยังไม่ได้ทดสอบ edge case ที่ผู้เล่นมนุษย์ถูกคัดออกกลางแมตช์แล้วเข้าสู่โหมดผู้ชม (spectator) ต่อจนจบแมตช์แบบเต็มรูปแบบ (ทดสอบนี้ผู้เล่นชนะตลอด ไม่เคยถูกคัดออก)
- ยังไม่ได้ทดสอบ AOE/ไอเทมโจมตีระหว่าง Round 2/3 ผสมกับบั๊กคัดออกที่เพิ่งแก้ (ทดสอบรอบนี้เน้นยืนยันความถูกต้องของคะแนน/การคัดออกเป็นหลัก ไม่ได้ซื้อ/ใช้ไอเทมโจมตีระหว่างทดสอบ)
