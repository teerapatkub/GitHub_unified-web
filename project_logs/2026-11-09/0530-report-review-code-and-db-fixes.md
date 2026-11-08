# แก้โค้ดและฐานข้อมูลตามคอมเมนต์อาจารย์ (`แก้.docx`)

**วันที่:** 2026-11-09 (Asia/Bangkok), Person 3
**ผู้ใช้สั่ง:** ดูว่าคอมเมนต์ของอาจารย์มีอะไรที่ต้องแก้ในโค้ดและฐานข้อมูล แล้วแก้เลย (ส่วนเล่มให้ cowork ทำ)

## วิธีตรวจ

- เทียบ Data Dictionary ทั้ง 45 ตารางในเล่ม `WEB13_progress2 - แก้ไขแล้ว v2.docx` กับ schema จริงของฐานทดสอบ (อ่านอย่างเดียว)
- รันทุกสไลด์ประเภท code (125 สไลด์) ผ่าน `compile()` ของ Python

## แก้อะไร

| เรื่อง (จากคอมเมนต์) | แก้ที่ | ผล |
|---|---|---|
| สไลด์โค้ดรันไม่ได้ | `client/src/utils/codeSlide.js` (ใหม่), `client/src/pages/LessonPage.jsx` | แยกคำอธิบาย / โค้ด / ผลลัพธ์ที่ควรได้ รันเฉพาะโค้ด: compile ผ่าน 122/125 → เหลือ id 77 ที่ตั้งใจ Error, 216/217 แก้ด้วย migration |
| ชนิดข้อมูลเงินไม่สม่ำเสมอ | migration `202611090001` | `achievements.reward_money` เป็น `integer` (ผลรวมรางวัลเท่าเดิม 8060) |
| ใช้ `order` ซึ่งเป็นคำสงวน | migration + `server.js` (`GET /api/survey`) | `survey_questions`, `survey_options`, `level_config` ใช้ `sort_order` |
| อ้าง Gemini ทั้งที่ไม่ได้ใช้ | migration + `ARCADE_SHOP_ITEMS` ใน `server.js` | คำอธิบาย AI Helper เป็น "เปิดคำใบ้ของโจทย์รอบนี้" |
| (พบระหว่างแคปภาพ) input ของโจทย์ AI มี quote | `server/competitiveAi.js` | ตัด quote ที่ครอบทั้งบรรทัดก่อนรันเฉลย |
| (พบระหว่างตรวจ) สไลด์ไฟล์ 2 สไลด์ | migration | `\n` ใน `file.write()` ถูกเก็บเป็นขึ้นบรรทัดจริง แก้แล้ว |

- **migration ใหม่ `server/migrate-schema-cleanup.js`:**
  - เป็น migration แยก เพราะ seed เดิมอยู่ใน migration ที่ถูก checksum แล้ว
  - ทุกขั้นตรวจก่อนทำ จึงรันบนฐานที่มีหรือไม่มีตาราง `level_config` ก็ได้

## ไม่ได้แก้ (และเหตุผล)

- **0/1 เป็น `boolean` (is_read, is_claimed, is_test, is_eliminated):**
  - ทั้งระบบใช้ `smallint`/`integer` และ query เทียบ `= 1` อยู่หลายร้อยจุด เปลี่ยนแล้วเสี่ยงพังเงียบ
  - เล่ม v2 อธิบายเหตุผลไว้แล้ว ให้แก้ชนิดในตารางของเล่มให้ตรงฐาน (หลายตารางในเล่มยังเขียน `boolean`)
- **ตารางเก่าที่ไม่มีโค้ดใช้แล้ว:** `user_missions`, `virtual_emails`, `game_rooms`, `room_participants`, `session_players`, `multiplayer_sessions`, `email_verifications`, `level_config`, `user_progress`, `user_quiz_attempts`
  - การ DROP ลบข้อมูลจริงบน production ต้องถามผู้ใช้ก่อน
  - `game_sessions` ยังถูกสร้างใน `ensureLearningProgressSchema` ซึ่งอยู่ใน checksum ของ migration ที่ apply แล้ว จึงลบโค้ดนั้นไม่ได้
- **ฟีเจอร์ที่เล่มอ้างแต่ยังไม่มีในโค้ด:**
  - แอดมินแก้/ลบโจทย์ Competitive
  - ประวัติการแบน/เพิกถอนสถิติ
  - ตั้งค่ารางวัล/ตั้งค่าสถานะ
  - log แชท AI
  - เป็นงานใหม่ ต้องให้ผู้ใช้เลือกว่าจะทำ หรือตัดออกจากเล่ม

## ทดสอบ

- **client:**
  - `codeSlide.test.js` (ใหม่ 7 ข้อ ล้มก่อนเขียนโค้ด)
  - `npm test`: 106/106
  - `npm run lint`: 0 error
- **server:**
  - `competitive-ai.test.js` เพิ่ม 2 ข้อ (ข้อตัด quote ล้มก่อนแก้)
  - pretest: 98 ผ่าน + 1 skip (เทสเฉพาะ Linux)
- **migration บนฐานที่มีข้อมูล (`pyarena_playtest` ที่ 202610280001):**
  - บูต server แล้ว migration ขึ้นเป็น 202611090001
  - ตรวจในฐานแล้ว: `reward_money` เป็น integer, `sort_order` 3 ตาราง, คำอธิบาย aiHelper ใหม่, สไลด์ 216/217 ไม่มีบรรทัดหักแล้ว
- **บนหน้าเว็บจริง (dev server):** บทที่ 1 สไลด์ "โปรแกรมแรกของคุณ" กด Run Code ได้ทันที ขึ้น `Hello, Python!` และกล่อง "ผลลัพธ์ที่ควรได้"
  - แทนภาพ `PNG prototype/15-lesson-slide-run-code.png` ด้วยภาพใหม่
- **`tests/migrations-postgres.test.js` ล้มบน main อยู่แล้วก่อนแก้ (ไม่ใช่จาก migration นี้):**
  - ตาราง `mini_game_choices` (migration 28 ต.ค.) ไม่ได้เปิด RLS บนฐาน local
  - เพราะ `lockDownPublicSchema` ข้ามฐานที่ไม่ใช่ remote บน production (remote) จึงไม่กระทบ

## ผลกระทบ

- **ต้อง deploy image ใหม่:** migration จะรันเองตอนบูตบน production
- **query แบบสำรวจที่เขียนใหม่:** ต้องใช้ `sort_order`
- **ไม่แตะคลังโจทย์ ตัวตรวจคำตอบ หรือบอท**
