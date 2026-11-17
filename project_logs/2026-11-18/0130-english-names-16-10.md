# ชื่อภาษาอังกฤษของบทเรียน หมวด ของตกแต่ง และความสำเร็จ (ข้อ 16.10)

**วันที่:** 2026-11-18 01:30

## ปัญหา
โหมด EN ยังแสดงชื่อหมวด ชื่อบทเรียน ชื่อของตกแต่ง และความสำเร็จเป็นภาษาไทย
เพราะตารางเหล่านี้เก็บแค่ภาษาไทย ไม่มีคอลัมน์ภาษาอังกฤษ (โจทย์มี `title_en`/`desc_en` อยู่แล้ว ไม่ได้แตะ)
และปุ่มในมินิเกมเป็นอังกฤษล้วนแม้ UI จะเป็นภาษาไทย

## สิ่งที่แก้

### ฐานข้อมูล — migration ใหม่ `202611180002 english_names_for_thai_only_content`
- `server/migrate-english-names.js` (ใหม่) ลงทะเบียนใน `server/migrations/versions.js`,
  `server/migrations/definitions.js` และรายการใน `server/server.js` แบบเดียวกับตัวอื่น
- เพิ่มคอลัมน์ (nullable ทั้งหมด):
  `modules.title_en`, `modules.description_en`, `lessons.title_en`, `lessons.description_en`,
  `shop_items.name_en`, `shop_items.description_en`, `shop_sets.description_en`,
  `achievements.name_en`, `achievements.description_en`
- เติมคำแปลให้ 9 หมวด 24 บท ของตกแต่ง 39 ชิ้น (+ `Heart` ที่ชื่อเป็นอังกฤษอยู่แล้ว) 9 เซ็ต และความสำเร็จ 31 รายการ
  คงคำศัพท์ Python ไว้ตามเดิม (`print()`, `input()`, `range`, `try...except`, ...)
- จับคู่ด้วยสิ่งที่เหมือนกันทุกฐาน ไม่ใช่ serial id: ชื่อไทยของหมวด/บท, `item_type` + ชื่อไทยของของตกแต่ง,
  `set_key`, และ `code` ของความสำเร็จ
- เขียนเฉพาะช่องที่ยังว่าง — คำแปลที่แอดมินใส่เองไม่ถูกทับ
- ไม่ได้แตะ migration เดิม `seed-content.sql` หรือ checksum ใดๆ

### API — ส่งฟิลด์ `_en` เพิ่ม ไม่ได้เปลี่ยนฟิลด์ไทยเดิม
- `server/lessonContentRoutes.js`: `/api/course-content` (หมวด + บท), `/api/lessons/:id`
- `server/server.js`: `/api/profile/:id` (หมวด บท ความสำเร็จ ชื่อของที่สวมอยู่),
  `/api/shop/items`, `/api/shop/inventory/:id`, `/api/shop/sets`, `/api/achievements/:id`
  (รวมชื่อของรางวัล), `/api/achievement-unlocks/unseen`
- `server/avatar.js`: ตัวเลือกรูปโปรไฟล์มี `label_en`

### Client
- `client/src/utils/contentText.js` (ใหม่): `contentTitle`, `contentName`, `contentDescription`
  ใช้ `pickLocalized` ของ `problemText.js` — ขอภาษาไหนได้ภาษานั้น ไม่มีก็ได้อีกภาษาแทน ไม่ใช่ช่องว่าง
- `LearningPage.jsx`, `LessonPage.jsx` (หัวบทเป็น "Lesson n ..." ในโหมด EN), `ProfilePage.jsx`,
  `AppearancePage.jsx`, `ShopPage.jsx` (ชื่อ คำอธิบายเซ็ต และค้นหาได้ทั้งสองภาษา), `Achievements.jsx`,
  `components/AchievementUnlockPopup.jsx`
- เปลี่ยนภาษาที่หัวเว็บแล้วชื่อเปลี่ยนทันทีโดยไม่ต้องโหลดหน้าใหม่ (เลือกตอน render ไม่ใช่ตอนโหลดข้อมูล)
- **`name` ของธีมยังเป็นไทยในทุก state** เพราะสีและฉากของธีมเลือกจากคำในชื่อ
  (`getShopThemePalette`, `ProfileAppearance`, `CosmeticTryButton`) หน้าแปลเฉพาะข้อความที่แสดง

### มินิเกม (`MiNi_Game.jsx`)
- UI ภาษาไทย: กลับ · แชทกับ Lumi · รันโค้ด · ส่งคำตอบ / ส่งอีกครั้ง · ดูเทอร์มินัล / โหมดเนื้อเรื่อง · คำใบ้
- UI อังกฤษ: เหมือนเดิม (Back, Lumi Chat, RUN, DONE, View Terminal, Hint)
- คำใบ้ภารกิจ 101 สองข้อ และทัวร์ `data/webTutorials.js` ที่บอกให้ "กด RUN / กด DONE"
  เปลี่ยนเป็นชื่อปุ่มภาษาไทยให้ตรงกับที่เห็น

### ทดสอบ
- `server/tests/english-names.test.js` (ใหม่ อยู่ใน `npm test`): บูต server จริงบนฐานใหม่ แล้วตรวจว่า
  ทุกแถวที่ seed มีภาษาอังกฤษ ชื่อไทยไม่ถูกแทน API ทุกตัวข้างบนส่ง `_en` และ migration ไม่ทับคำแปลที่มีอยู่
- `client/src/utils/contentText.test.mjs` (ใหม่): EN/TH และ fallback
- `server/tests/avatar.test.js`: เพิ่ม `label_en` ในค่าที่คาด

## ผลการทดสอบ (รันจริง)
- server `npm test` กับ `TEST_DATABASE_URL` = Postgres ใน Docker เครื่องนี้: 113 เทส ผ่าน 112 ไม่ผ่าน 0
  ข้าม 1 (เทส memory cap ที่รันได้เฉพาะ Linux)
- client `npm run lint`: error 0 (warning 7 ตัวมีอยู่ก่อนแล้ว) · `npm test`: 112/112 ผ่าน
- ลองในเบราว์เซอร์จริง: server ของ session นี้บนฐานที่สร้างใหม่ (ลบทิ้งหลังทดสอบ) + Vite แยกพอร์ต
  - EN: หน้าบทเรียน, บทเรียนที่ 9, โปรไฟล์, แต่งโปรไฟล์ (ธีม/รูป/กรอบ), ร้านค้า (ชื่อ + คำอธิบายเซ็ต),
    ความสำเร็จ (รวมของรางวัล) และ popup ปลดล็อก แสดงอังกฤษทั้งหมด
  - กดสลับเป็น TH ที่หัวเว็บ: ชื่อกลับเป็นไทยเดิมทันทีโดยไม่โหลดหน้าใหม่ ธีมอวกาศที่สวมอยู่ยังแสดงสีเดิม
  - มินิเกม: TH แสดง กลับ / แชทกับ Lumi / รันโค้ด / ส่งคำตอบ / ดูเทอร์มินัล / คำใบ้ · EN เหมือนเดิม

## ผลกระทบ
- Schema: คอลัมน์ใหม่ nullable เท่านั้น ไม่กระทบ `arcade_*` บอท หรือการตรวจคำตอบ
- ไฟล์ของ Person 1/2 ที่แตะ บันทึกไว้ใน `docs/handoff-to-person-1.md` แล้ว

## ยังไม่ได้ทำ
- หน้าแอดมินเพิ่ม/แก้บทเรียนและของตกแต่งยังไม่มีช่องกรอกภาษาอังกฤษ ของที่เพิ่มใหม่จะแสดงไทยในโหมด EN
- ข้อความอื่นในหน้าบทเรียน (สถานะ "ยังไม่เริ่ม", "เลเวล", สไลด์และแบบทดสอบ) ยังเป็นไทยในโหมด EN — ไม่อยู่ในขอบเขตข้อ 16.10
