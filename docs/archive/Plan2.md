# แผนงาน 10 ข้อ — เตรียม deploy PySim ให้ใช้งานได้จริง

> เอกสารนี้เป็น **แผนสำหรับส่งต่อให้ทีม** ไม่ใช่แผนให้ implement ในรอบนี้
> ทุกข้อระบุ **เจ้าของงาน** ตามขอบเขตใน `CLAUDE.md` (Person 1 = ระบบเรียน/เกม/รันโค้ดฝั่ง client,
> Person 2 = Admin/Competitive Arena/เมล/ธีม, Person 3 = Arcade/สถาปัตยกรรมรวม/DB/บอท)
> ท้ายเอกสารมี **สรุปงานแยกรายคน** ไว้ก๊อปไปแจ้งแต่ละคนได้เลย

---

## Context — ทำไมต้องทำชุดนี้

PySim เป็นโปรเจคจบที่ต้อง deploy ขึ้นใช้จริง กับผู้ใช้ที่ไม่เคยเขียนโปรแกรม (ดู `specs/0001`)
จากการเล่นจริงและสำรวจโค้ด พบงานค้าง 10 เรื่องที่กระทบความปลอดภัย ความน่าเชื่อถือ และความพร้อม
สำหรับผู้ใช้จริง เอกสารนี้แปลงทั้ง 10 เป็นงานที่จ่ายให้แต่ละคนได้ พร้อมสถานะปัจจุบันของโค้ด
(อ้างอิงไฟล์:บรรทัด) เพื่อให้คนรับงานไม่ต้องเริ่มสำรวจใหม่

**การตัดสินใจที่ยืนยันกับผู้ใช้แล้ว (2026-08-27):**
- รอบนี้ **วางแผนอย่างเดียว** ยังไม่ลงมือ
- **OTP**: เขียนโค้ดสุ่มเลข 6 หลักส่งตรงไปอีเมลผู้สมัครผ่าน SMTP ของระบบเอง **ไม่ใช้บริการภายนอก**
- **Google sign-in**: บัญชี Google ของผู้ใช้ตอนนี้ **ถูกบล็อก client** ใช้ ID ไม่ได้ →
  วางแผนให้ "พร้อมเปิดเมื่อปลดบล็อก" ไม่สร้างเพิ่มในรอบนี้
- **รูปโปรไฟล์**: มาจาก 5 แหล่ง — รูปเริ่มต้น 2 รูปตามระดับ (ผู้เริ่มต้น/เชี่ยวชาญ), อัปโหลดเอง,
  ดึงจาก Google, ซื้อในร้านค้า, และรูปพิเศษจาก achievement
- **2v2**: เอาแค่เอกสารดีไซน์ + ไอเดียโหมดเพิ่ม ยังไม่สร้าง

---

## กลุ่มงาน (แนะนำลำดับทำ)

| เฟส | ข้อ | ธีม | เหตุผลที่จัดกลุ่มนี้ |
|---|---|---|---|
| **A — ความปลอดภัย/ถูกต้อง (ทำก่อน)** | 1, 2 | กันลูปค้าง + error เป็นคำแนะนำ | เป็น release blocker ตาม memory: กระทบผู้เรียนทุกคนและกันเบราว์เซอร์ค้าง |
| **B — ตัวตน/บัญชี** | 4, 5 | OTP + ระบบรูปโปรไฟล์ | ข้อ 5 เป็นฐานของ 6 และ 9 ต้องมาก่อน |
| **C — ร้านค้า/โปรไฟล์/รางวัล** | 6, 7, 9 | รูปในร้าน, ประวัติการเล่น, รางวัล achievement | ต่อยอดจากเฟส B |
| **D — ขัดเกลา Arcade** | 8 | แจ้งเตือนผู้ชมแก้โค้ดไม่ได้ | เล็ก อยู่ใน Arcade ล้วน |
| **E — งานดีไซน์ใหญ่ (คู่ขนานได้)** | 3, 10 | UI ให้เป็นทิศเดียวกัน + ดีไซน์ 2v2 | ใหญ่และข้ามขอบเขต ทำเป็นเอกสารดีไซน์ก่อนลงมือ |

---

# เฟส A — ความปลอดภัยและความถูกต้อง

## ข้อ 1 — กัน infinite loop และการรันที่หนักเกินไป
**เจ้าของ: Person 1** (เป็นเจ้าของ Pyodide client) · จุด Arcade trial = Person 3

### สถานะปัจจุบัน
- **ฝั่ง server ปลอดภัยแล้ว**: `server/pythonRunner.js:113-116` มี timeout 4 วินาที (`gradeSubmission`
  ตั้ง 6 วินาที) kill child process เมื่อครบเวลา — แต่ **ไม่มี** memory cap และ **ไม่มี** output cap
  (`stdout += chunk` สะสมไม่จำกัด `pythonRunner.js:118-119`)
- **ฝั่ง client คือช่องโหว่จริง**: มี Pyodide 4 ที่ แต่มีแค่ที่เดียวที่กันลูปได้
  - ✅ `client/src/hooks/usePyodide.js:94-116` — รันใน Web Worker มี watchdog 15 วิ แล้ว
    **terminate worker ทิ้ง** (ใช้ที่ LessonPage playground + Arcade trial ผ่าน `useRoundJudging.js`)
  - ❌ `client/src/pages/ExercisePage.jsx` — Pyodide บน main thread ไม่มี timeout
  - ❌ `client/src/pages/MiNi_Game.jsx` — main thread ไม่มี timeout
  - ❌ `client/src/components/learning/CodingWorkspace.jsx` (ใช้โดย AiTaskPage) — main thread ไม่มี timeout
  - ทั้งสามที่นี้ ถ้าผู้เรียนเขียน `while True:` **เบราว์เซอร์ค้างทั้งแท็บ** ต้องปิดแท็บทิ้ง
- **ไม่มี rate-limit/debounce** บนปุ่ม run/submit เลย (มีแค่ cooldown ของแชท `server.js:6985`)
  กันได้แค่ boolean `isRunning` ในแต่ละหน้า

### ต้องทำ
1. **ย้าย Pyodide ทั้ง 3 ที่ที่ยังรัน main thread ไปใช้ worker pattern เดียวกับ `usePyodide.js`**
   — นี่คืองานหลัก เพราะ worker คือทางเดียวที่ kill ลูปได้จริง (main thread ปิดตัวเองไม่ได้)
   เป้าหมาย: ให้ ExercisePage, MiNi_Game, CodingWorkspace รันผ่าน hook `usePyodide` (หรือ hook แฝดที่
   แชร์ worker เดียวกัน) แทนการ `loadPyodide()` ตรงๆ
2. เพิ่ม **output cap** ฝั่ง server ใน `pythonRunner.js` (เช่น ตัดที่ ~256KB แล้วแจ้ง "ผลลัพธ์ยาวเกินไป")
   กัน `print` ในลูปถล่มหน่วยความจำ — **Person 3** ทำจุดนี้ (เจ้าของ DB/สถาปัตยกรรม server) หรือมอบ Person 1
3. เพิ่ม **debounce/กันกดรัว** ที่ปุ่ม run/submit ทุกหน้า (กันสั่งรัน 20 ครั้งใน 2 วิ)
4. (ทางเลือก) ตั้ง timeout ฝั่ง client ให้ต่ำกว่านี้สำหรับโหมดเรียน (เช่น 8-10 วิ) เพื่อบอกผู้เรียนเร็วขึ้น

### ทดสอบ
เขียน `while True: pass` และ `while True: print(1)` ในทั้ง 4 หน้า → แท็บต้องไม่ค้าง เห็นข้อความ
"รันนานเกินไป" ภายในเวลาที่กำหนด และกดรันใหม่ได้ต่อ

### หมายเหตุข้ามขอบเขต
Arcade trial (`useRoundJudging.js`) ใช้ worker อยู่แล้ว — Person 3 แค่ยืนยันว่า output cap ฝั่ง server
ไม่กระทบการตัดสินรอบ

---

## ข้อ 2 — error ตอนเขียนผิด ให้เป็นคำแนะนำ ไม่ใช่ traceback ดิบ
**เจ้าของหลัก: Person 1** · Competitive = Person 2 · Arcade = Person 3 (แต่ละคนต่อสายในหน้าตัวเอง)

### สถานะปัจจุบัน — ตัวแปลมีอยู่แล้ว แค่ยังไม่ถูกใช้ทุกที่
- ✅ **มีตัวแปล error เป็นภาษาไทยที่ actionable แล้ว**: `server/pythonErrorMessages.js` →
  `explainPythonError(raw)` คืน `{ kind, message(ไทย), line, raw }` ครอบคลุม NameError, SyntaxError,
  IndentationError, TypeError, ValueError, IndexError ฯลฯ และดึงเลขบรรทัดของผู้เรียนให้ถูก
- ✅ ตัวตรวจแนบให้แล้ว: `problemGrader.js` ใส่ `results[].hint / errorLine / errorKind` ทุก case
- ❌ **แสดงจริงแค่ที่เดียว**: `ExercisePage.jsx:541` (และป้อนให้แชท Lumi) ที่เหลือโชว์ traceback ดิบ:
  - `LessonPage.jsx:505-519` — โชว์ stderr ดิบสีแดง (มาจาก worker) ไม่แปล
  - `CompetitiveArena.jsx:583` — โชว์ `result.error` ดิบ **ทั้งที่ server แนบ hint มาให้แล้ว** แค่ client ไม่อ่าน
  - `useRoundJudging.js` (Arcade trial) — โชว์ stderr ดิบ
  - `CodingWorkspace.jsx:237,286` — โชว์ `error.message` ดิบ

### ต้องทำ
งานส่วนใหญ่คือ **wiring ไม่ใช่เขียน logic ใหม่** — ใช้ `explainPythonError` เป็นแหล่งเดียว
1. **Person 2**: ที่ `CompetitiveArena.jsx` อ่าน `result.hint / errorLine` (server ส่งมาให้แล้ว) แทน `result.error`
   — ได้ผลเร็วสุด แก้จุดเดียว
2. **Person 1**: หน้า client-only ที่รัน Pyodide (LessonPage playground, MiNi_Game, CodingWorkspace)
   ต้องเรียก `explainPythonError` **ฝั่ง client** ด้วย → ย้าย/แชร์ตัวแปลให้ client เรียกได้
   (แยกเป็น util ที่ทั้งสองฝั่ง import ได้ หรือทำ endpoint เล็ก `POST /api/explain-error`)
   แล้วแสดงข้อความไทย + ปุ่ม "ดูรายละเอียด (สำหรับผู้รู้)" ที่กาง traceback ดิบ (`raw`) ไว้ให้กดเอง
3. **Person 3**: Arcade trial แสดง hint ไทยแบบเดียวกัน
4. ยึดหลักจาก memory: **ซ่อน traceback อังกฤษเป็นค่าเริ่มต้น** ผู้เริ่มต้นเห็นคำแนะนำไทยก่อน
   รายละเอียดดิบให้กางเอง

### ทดสอบ
พิมพ์ `prin("hi")` (NameError), ลืม `:` (SyntaxError), หาร 0 → ทุกหน้าต้องเห็นประโยคไทยที่บอกว่า
ผิดตรงไหนบรรทัดไหน ไม่ใช่ `Traceback (most recent call last)...`

---

# เฟส B — ตัวตน/บัญชี

## ข้อ 4 — ยืนยันอีเมลด้วย OTP + Google
**เจ้าของ: Person 2** (เจ้าของ Mailbox & Password Reset)

### สถานะปัจจุบัน
- ตอนนี้ register (`server.js:2093` `/api/register`) ส่ง **ลิงก์ยืนยัน 24 ชม.** และ **login ไม่ได้บังคับ
  ยืนยัน** (`server.js:2388` ไม่เช็ค `email_verified`) — คอลัมน์ `users.email_verified` มีอยู่ (`schema.sql:3132`)
  แต่ไม่มีใครอ่านเป็นเงื่อนไข
- OTP เคยทำแล้ว **revert ออกหมด** เพราะ Gmail ปฏิเสธรหัสผ่าน (ต้องใช้ App Password) — โค้ด OTP ที่ revert
  ยังกู้กลับได้ด้วย `git revert 11cb858` (มีของครบ: สุ่มเลข bcrypt-hash, TTL 10 นาที, จำกัด 5 ครั้ง, cooldown 60 วิ)
- Nodemailer ตั้งที่ `server.js:2058` service `gmail`, `EMAIL_USER`/`EMAIL_PASS`

### ต้องทำ (ตามที่ผู้ใช้ยืนยัน: สุ่มเลขส่งตรงเข้าเมล ไม่ใช้บริการภายนอก)
1. **เงื่อนไขก่อนเริ่ม (บล็อกอยู่)**: ต้องมี **Gmail App Password 16 หลัก** ใน `EMAIL_PASS`
   (เปิด 2-Step Verification ก่อน แล้วสร้างที่ myaccount.google.com/apppasswords) — ถ้ายังไม่มี
   OTP จะส่งไม่ออกเหมือนรอบก่อน "ส่งตรงไม่ผ่านตัวกลาง" = ใช้ SMTP ของ Gmail เอง ยังต้องมี App Password
2. กู้โค้ด OTP ที่ revert กลับ (`git revert 11cb858`) แล้วปรับ: สุ่มเลข 6 หลักด้วย `crypto.randomInt`,
   เก็บแบบ hash, ส่งเข้าเมลผู้สมัครโดยตรง, หน้า client กรอกเลข 6 หลัก
3. **บังคับยืนยันก่อน login** ตามที่ผู้ใช้ต้องการ — แต่ **ต้องไม่ล็อก 31 บัญชีเดิม** ที่ `email_verified=0`
   อยู่แล้ว วิธีที่ปลอดภัย: gate ด้วย "มีแถว OTP ที่ยังไม่ยืนยันค้างอยู่" (`hasPendingOtp`) ไม่ใช่
   `email_verified=0` ตรงๆ (เหตุผลนี้เจอมาแล้วรอบก่อน — บัญชีเก่าทั้งหมดมีค่านี้ 0 เพราะไม่เคยมีใครเขียน)
4. รายงานตรงๆ เมื่อส่งเมลไม่ออก ("ระบบส่งเมลใช้งานไม่ได้ตอนนี้") ไม่แกล้งบอกว่าส่งสำเร็จ
5. เพิ่ม `emailTransporter.verify()` ตอนบูต เพื่อรู้ทันทีว่า SMTP ใช้ได้ไหม

### Google sign-in — บล็อกภายนอก เลื่อนออก
- โครงมีครบแล้ว (`google-auth-library`, `/api/config/google`, `/api/auth/google` `server.js:2418`)
  และ ad975b5 ทำให้ปิดตัวเองสวยงามเมื่อไม่มี config แล้ว
- **ติดที่บัญชี Google ของผู้ใช้ถูกบล็อก client** → ยังตั้ง `GOOGLE_CLIENT_ID` ที่ใช้ได้ไม่ได้
- งานรอบนี้: **ไม่ต้องเขียนเพิ่ม** แค่บันทึกว่าเมื่อปลดบล็อกแล้วให้ตั้ง `GOOGLE_CLIENT_ID` ใน `server/.env`
  ค่าเดียว (client อ่านจาก `/api/config/google` อยู่แล้ว) — ดู `docs/deploy.md`

### ทดสอบ
สมัครใหม่ → ได้เลข 6 หลักในเมลจริง → กรอกผิด 5 ครั้งถูกบล็อกให้ขอใหม่ → กรอกถูกเข้าได้ ·
บัญชีเดิม 31 รายต้อง login ได้ตามเดิมไม่ถูกกัน

---

## ข้อ 5 — ระบบรูปโปรไฟล์ (ฐานของข้อ 6 และ 9)
**เจ้าของ: Person 3** (สถาปัตยกรรม + DB + seed) · จุด Google = Person 2

### สถานะปัจจุบัน — ยังไม่มีระบบรูปโปรไฟล์เลย
- คอลัมน์ `users.avatar_url` มีอยู่ (`schema.sql:3130`) แต่ **ไม่มีใครอ่านหรือเขียน** (dead column)
- ProfilePage วาดเป็น **ตัวอักษรแรกในวงกลม gradient** (`ProfilePage.jsx:199-208`) ไม่ใช่รูป
  มีแค่ overlay กรอบ (`profile_frame_url`) ที่ซ้อนอยู่
- มี endpoint อัปโหลดทั่วไปแล้ว: `/api/upload` multer (`server.js:8355`, limit 25MB, กรอง image/video)
  ตอนนี้ใช้แค่ใน admin — เอามาใช้ซ้ำได้
- ไฟล์เสิร์ฟที่ `app.use('/uploads', ...)` (`server.js:159-169`, `UPLOADS_DIR`)
- Google `payload.picture` **ไม่ถูกเก็บ** (`server.js:2444` destructure แค่ email,name,email_verified)

### ต้องทำ — วาง "ลำดับความสำคัญของรูป" ให้ชัด(resolution order)
สร้างฐานให้รูปโปรไฟล์มาจาก 5 แหล่งตามที่ผู้ใช้ต้องการ โดยกำหนดว่ารูปที่แสดงจริงเลือกจากอะไรก่อน:
1. **รูปเริ่มต้น 2 แบบตามระดับ** — ผู้เริ่มต้น (level ต่ำ) / เชี่ยวชาญ (level สูง) เป็น default
   เมื่อยังไม่ได้เลือกอะไร (ต้องนิยาม threshold ระดับ และเตรียมรูป 2 ใบใน `server/uploads/`)
2. **อัปโหลดเอง** — ปุ่มใน ProfilePage เรียก `/api/upload` แล้ว `UPDATE users SET avatar_url`
3. **ดึงจาก Google** — **Person 2** เพิ่มเก็บ `payload.picture` ตอน `/api/auth/google` (จุดเดียว)
4. **รูปที่ซื้อจากร้าน** — ดูข้อ 6
5. **รูปพิเศษจาก achievement** — ดูข้อ 9

ออกแบบคอลัมน์บน `users` ให้พอ: ใช้ `avatar_url` ที่มีอยู่เก็บรูปที่ "เลือกใช้ตอนนี้" +
อาจเพิ่ม `avatar_source` (default/upload/google/shop/achievement) และตารางคลังรูปที่ผู้ใช้ครอบครอง
(คล้าย `user_inventory` ของ cosmetics) แก้ schema ใน `server/db.js` เท่านั้นตามกฎ

### ทดสอบ
ผู้ใช้ level ต่ำเห็นรูปผู้เริ่มต้น, level สูงเห็นรูปเชี่ยวชาญ · อัปโหลดแล้วรูปเปลี่ยนทั้ง ProfilePage
navbar และ leaderboard · login Google ดึงรูปมาแสดง · รูปเก่ายังอยู่หลัง redeploy (ดูข้อควรระวัง uploads ล่าง)

---

# เฟส C — ร้านค้า / โปรไฟล์ / รางวัล

## ข้อ 6 — เพิ่มสินค้าร้านค้าเป็น "รูปโปรไฟล์"
**เจ้าของ: Person 3** (เจ้าของ seed cosmetics ใน `db.js`) · ขึ้นกับข้อ 5

### สถานะปัจจุบัน
- ชนิด cosmetic ที่มี: `THEME`, `PROFILE_FRAME`, `MOUSE_EFFECT` (seed ใน `db.js:1101+`)
  — **ไม่มีชนิดรูปโปรไฟล์** (`PROFILE_FRAME` คือกรอบโปร่งกลาง วาดรอบตัวอักษร ไม่ใช่รูป)
- equip ผ่าน `columnMap` (`server.js:5500-5529`) → `equipped_*_id` (`schema.sql:3127-3129`)
- มี `PROFILE_BACKGROUND` โผล่ใน columnMap แต่ไม่เคย seed

### ต้องทำ
1. เพิ่มชนิดใหม่ `PROFILE_PICTURE` (หรือชื่อที่ตกลงใน `CONTEXT.md` ก่อนตั้ง) ใน seed `db.js`
   พร้อมรูปตัวอย่างใน `server/uploads/`
2. ต่อเข้าระบบรูปข้อ 5: ซื้อแล้วรูปเข้าคลังรูปของผู้ใช้ เลือกใช้เป็น avatar ได้
3. เพิ่ม `equipped_*` / mapping ให้รองรับ แก้ `ShopPage.jsx` ให้มีหมวดรูปโปรไฟล์
4. ราคาเป็นเหรียญตามที่ผู้ใช้ระบุ

### ทดสอบ
ซื้อรูปในร้าน → เหรียญหักถูก → รูปเข้าคลัง → เลือกใช้แล้วแสดงเป็น avatar จริง

---

## ข้อ 7 — ย้ายประวัติการเล่น Arcade + Competitive ไปโปรไฟล์ พร้อมปุ่มเลือกดูแต่ละโหมด
**เจ้าของ: Person 3** (ProfilePage/สถาปัตยกรรม) · ประวัติ Competitive = Person 2

### สถานะปัจจุบัน
- **Arcade มีประวัติถาวรแล้ว**: ตาราง `arcade_round_history` (`schema.sql:1363-1380`),
  `arcade_player_stats`; endpoint `/api/arcade/players/:name/history` (`server.js:6877`) และ
  `/api/profile/:userId` คืน `arcade.recent_matches` (`server.js:1585`)
- ProfilePage **แสดงประวัติ Arcade อยู่แล้ว** (`ProfilePage.jsx:322-358`) แต่ **ไม่มีแท็บ** เป็นหน้ายาวเดียว
- **Competitive ไม่มีตารางประวัติต่อผู้ใช้เลย** — มีแค่ `multiplayer_submissions` (การส่งคำตอบ)
  ไม่มี "แมตช์นี้ใครแพ้ชนะ" และ **ไม่มี endpoint** คืนประวัติ Competitive ของผู้ใช้

### ต้องทำ
1. **Person 2**: สร้างประวัติ Competitive ต่อผู้ใช้ (ตาราง + endpoint `GET /api/competitive/players/:id/history`)
   ให้มีข้อมูลเทียบเคียง Arcade (โจทย์, คะแนน 0-100, ผ่านกี่เคส, เมื่อไร)
2. **Person 3**: ปรับ ProfilePage เป็น **แท็บ/ปุ่มสลับ**: "ประวัติ Arcade" | "ประวัติ Competitive"
   ดึงจาก endpoint ของแต่ละโหมด
3. ยึด UI ตาม pysim (ProfilePage on-system อยู่แล้ว)

### ทดสอบ
เล่น Arcade 1 แมตช์ + Competitive 1 ข้อ → โปรไฟล์มีปุ่มสองปุ่ม กดแล้วเห็นประวัติแต่ละโหมดถูกต้อง

---

## ข้อ 9 — achievement ปลดล็อกแล้วได้รางวัล (เงิน / รูปโปรไฟล์ / ของตกแต่งพิเศษ)
**เจ้าของ: Person 3** (seed achievements ใน `db.js` + compute ใน `server.js`) · ขึ้นกับข้อ 5, 6

### สถานะปัจจุบัน — จ่ายเหรียญอยู่แล้ว
- ปลดล็อก achievement **จ่ายเหรียญให้แล้ว**: `evaluateAchievements` (`server.js:913-966`) →
  `applyXpRewardToUser` เติม `reward_money` เป็นเหรียญ (`server.js:953-958`) เรียกจาก 6 จุด
- ตาราง `achievements` มีคอลัมน์ `reward_money` (`schema.sql:1052`), 20 รายการ seed ใน `db.js:1327-1379`
- ⚠️ **หน้า `Achievements.jsx` เป็น mock ตายตัว** (6 รายการปลอม `Achievements.jsx:13-19`) ไม่เรียก API จริง
  — ต้องแก้ให้ดึง 20 รายการจริงด้วย

### ต้องทำ — เพิ่ม "รางวัลที่ไม่ใช่เหรียญ"
1. ขยาย schema achievement ให้ผูกรางวัลได้มากกว่าเหรียญ: อ้าง `shop_items.item_id` (ของตกแต่ง/รูป)
   หรือ flag "รูปพิเศษ/ของพิเศษที่ไม่มีในร้าน" — แก้ `db.js`/`problemsSchema` เท่านั้น
2. ตอนปลดล็อก ถ้ามีรางวัลของตกแต่ง/รูป → ใส่เข้าคลังผู้ใช้ (ผูกกับระบบรูปข้อ 5 และร้านข้อ 6)
3. เตรียม cosmetic/รูป **exclusive** ที่ซื้อในร้านไม่ได้ ได้จาก achievement เท่านั้น
4. แก้ `Achievements.jsx` ให้แสดงของจริง + สถานะปลดล็อก + รางวัลที่จะได้

### ทดสอบ
ปลดล็อก achievement ที่ให้รูปพิเศษ → รูปเข้าคลัง เลือกใช้ได้ และร้านค้าไม่มีขาย ·
achievement ที่ให้เหรียญยังจ่ายถูกเหมือนเดิม

---

# เฟส D — ขัดเกลา Arcade

## ข้อ 8 — Arcade: ผู้ชมแก้โค้ดไม่ได้ ให้แจ้งเตือนชัดขึ้น
**เจ้าของ: Person 3** (Arcade ล้วน)

### สถานะปัจจุบัน
- มี 2 สถานะผู้ชม: (ก) ส่งคำตอบรอบนี้แล้ว (`hasSubmittedThisRound`) (ข) ถูกคัดออก (`eliminated`)
- editor ถูกล็อกด้วย `readOnly`/`domReadOnly` (`BattleRoyaleGameplayView.jsx:334-342`,
  `editorLocked` `:71-72`)
- แจ้งเตือนตอนนี้: แบนเนอร์ indigo เล็กเหนือ editor (`:238-243`), badge บน top bar (`:658-661`),
  และจอ takeover เต็มเมื่อถูกคัดออก (`ArcadeBattleRoyale.jsx:843-856`) — **ไม่มี toast**
- ปัญหา: กรณี "ส่งแล้วรอบนี้" ผู้เล่นพิมพ์แล้ว editor เงียบ ไม่รับคีย์ แบนเนอร์เล็กเกินจนไม่ทันเห็น

### ต้องทำ
ทำให้ "แก้ไม่ได้ตอนนี้" ชัดขึ้นเมื่อผู้เล่นพยายามพิมพ์: เช่น overlay จางทับ editor + ข้อความกลางจอ,
หรือ toast เด้งเมื่อกดพิมพ์ในสถานะล็อก, หรือเปลี่ยนสีขอบ editor ให้เห็นชัดว่า "อ่านอย่างเดียว"
ยึด pysim tokens

### ทดสอบ
ส่งคำตอบแล้วลองพิมพ์ต่อ → เห็นการแจ้งเตือนชัดทันทีว่าทำไมพิมพ์ไม่ได้

---

# เฟส E — งานดีไซน์ใหญ่ (ทำเป็นเอกสารก่อนลงมือ)

## ข้อ 3 — ปรับ UI ทุกโหมดให้เป็นทิศทางเดียวกัน
**เจ้าของ: Person 3 นำ** (สถาปัตยกรรมรวม) · แต่ละคนปรับหน้าของตัวเอง

### สถานะปัจจุบัน
- **มี design system อยู่แล้ว**: pysim palette (`tailwind.config.js:66-93`), CSS tokens + ธีม +
  shop themes (`index.css`), คลาสร่วม `.python-gradient` `.whisper-shadow` `.glass-panel`
  (เพิ่งประกาศครบเมื่อ fcee9f1)
- **navbar ร่วม 1 อัน** เขียน inline ใน `App.jsx:388-404` แต่ **ซ่อนบน fullBleedRoutes**
  (`App.jsx:348`: `/menu, /online, /competitive-arena, /matchmaking, /achievements`) →
  MainMenu, Arcade, Competitive จึง roll navbar เอง
- **หน้าที่ต่างจาก core มากสุด**:
  - **Arcade** (`ArcadeBattleRoyale.jsx`) — identity rose→orange (`:648`), ใช้ raw slate/rose แทบไม่แตะ pysim
  - **Competitive** (`CompetitiveArena.jsx`) — blue/indigo + slate-900, navbar เอง (`:740`)
  - MainMenu — ครึ่งบน pysim ครึ่งล่างเป็น gradient ดิบต่อการ์ด
- ที่เป็น on-system แล้ว: ProfilePage, LearningPage, ShopPage, Achievements, Leaderboard

### ต้องทำ (รอบนี้: เขียนเอกสารดีไซน์ ไม่ลงมือ)
1. **Person 3 เขียน design spec** 1 หน้า: กำหนดโครงหน้ามาตรฐาน (พื้น `bg-pysim-surface`, การ์ด
   `whisper-shadow`, ปุ่ม `python-gradient`, ตัวอักษร pysim tokens), navbar/นำทางร่วม, สีประจำโหมด
   (ให้ Arcade/Competitive มี accent ได้แต่ต้องอยู่ในระบบ ไม่ใช่ rose ดิบ)
2. แยกงานปรับจริงเป็นเฟสต่อไป โดย **แต่ละคนปรับหน้าในขอบเขตตน**: Person 3 = Arcade + MainMenu,
   Person 2 = Competitive, Person 1 = หน้าเรียนที่ยังหลุด
3. พิจารณาสกัด navbar/page-shell ร่วมเป็น component เดียว แทน inline ใน App.jsx

### ข้อควรระวัง
เป็นงานข้ามขอบเขตทุกคน — **ต้องมี design spec ที่ตกลงร่วมกันก่อน** ไม่งั้นแก้ทับกัน
Arcade/Competitive เป็นโค้ดที่ merge มาจากคนอื่น เปลี่ยน UI เยอะเสี่ยง regression ต้องทดสอบ real-time

---

## ข้อ 10 — ดีไซน์โหมด 2v2 (เอกสาร + ไอเดียโหมดเพิ่ม)
**เจ้าของ: Person 3 เขียนเอกสาร** (สถาปัตยกรรม) · Competitive Arena = Person 2 ร่วมรีวิว

### สถานะปัจจุบัน
- **ไม่มีโหมด team/2v2/co-op เลย** Competitive Arena เป็น **async shared-challenge feed**
  (หลายคน accept โจทย์เดียวกันแล้วส่งแยก) ไม่ใช่ 1v1 ด้วยซ้ำ
- Real-time = **REST polling ล้วน** (Arcade `setInterval(fetchRoomState, 2000)` `:422`;
  Competitive polling เบา) — **ไม่มี WebSocket, ไม่มี yjs/socket.io, ไม่มี collaborative editor**
- มีแค่ read-only spectating: server เก็บ `draft_code` ต่อผู้เล่น แล้ว watcher อ่านมาแสดงใน `<pre>`

### ต้องทำ (รอบนี้: เอกสารดีไซน์อย่างเดียว)
เขียน design doc ครอบคลุม:
1. **2 โหมดที่ผู้ใช้คิดไว้** พร้อมประเมินความหนักทางเทคนิค:
   - โหมด A "editor เดียวกันจริงๆ" — **หนักสุด** ต้อง collaborative editing (yjs/CRDT + WebSocket)
     ซึ่งตอนนี้ไม่มีเลย polling 2 วิ ไม่พอ ต้องวาง WebSocket ใหม่ทั้งชั้น
   - โหมด B "คนเห็นโจทย์+ผลเทส / อีกคนพิมพ์" (driver/navigator) — **เบากว่ามาก** ทำบน polling +
     `draft_code` ที่มีอยู่ได้ แชร์ buffer ทางเดียว ไม่ต้อง CRDT
2. **เสนอโหมดเพิ่มอีกหลายแบบ** (ผู้ใช้อยากได้มากกว่า 2) เช่น:
   - **ผลัดกันเขียน (relay)** — สลับคนพิมพ์ทุก N วินาที อีกคนห้ามแตะ
   - **แบ่งงาน (แยกฟังก์ชัน)** — โจทย์แตกเป็น 2 ส่วน คนละครึ่ง แล้วรวมรัน
   - **โจทย์คนละข้อ คะแนนรวมทีม** — ต่างคนต่างเขียน เอาคะแนนมารวมเป็นทีม (เบาสุด ทำบนของเดิมได้เลย)
   - **บอด-เพียร์** — คนหนึ่งเห็น error/ผลรัน อีกคนเห็นแต่โจทย์ ต้องสื่อสารกัน
3. **สุ่มรูปแบบทุกแมตช์** ตามที่ผู้ใช้ต้องการ — ระบุว่าโหมดไหนพร้อมทำก่อน (เริ่มจากที่ทำบน polling ได้)
4. ระบุ schema/endpoint ที่ต้องเพิ่ม (ตาราง team, จับคู่ทีม, ประวัติผลทีม — ตอนนี้ไม่มี)

### ทดสอบ
รอบนี้ไม่มี — ส่งมอบเป็นเอกสารให้ทีมรีวิว

---

# 📋 สรุปงานแยกรายคน (ก๊อปไปแจ้งได้เลย)

## Person 1 — ระบบเรียน / รันโค้ดฝั่ง client
- **ข้อ 1 (สำคัญ)**: ย้าย Pyodide 3 ที่ (`ExercisePage`, `MiNi_Game`, `CodingWorkspace`) จาก main thread
  ไปใช้ worker แบบ `usePyodide.js` เพื่อกันลูปค้างเบราว์เซอร์ + debounce ปุ่มรัน
- **ข้อ 2**: ทำให้ตัวแปล error ไทย (`explainPythonError`) เรียกได้ฝั่ง client แล้วแสดงในหน้าเรียนที่รัน
  Pyodide เอง (ซ่อน traceback ดิบ ให้กางเอง)
- **ข้อ 3 (ภายหลัง)**: ปรับหน้าเรียนที่ยังหลุด pysim ตาม design spec ของ Person 3

## Person 2 — Competitive Arena / เมล / ธีม
- **ข้อ 4 (สำคัญ, บล็อกที่ Gmail App Password)**: ทำ OTP สุ่มเลข 6 หลักส่งตรงเข้าเมล + บังคับยืนยัน
  ก่อน login โดยไม่ล็อก 31 บัญชีเดิม (gate ด้วย `hasPendingOtp`) · Google = แค่รอปลดบล็อกแล้วตั้ง
  `GOOGLE_CLIENT_ID`
- **ข้อ 2**: แก้ `CompetitiveArena.jsx:583` ให้อ่าน `result.hint/errorLine` ที่ server ส่งมาแล้ว
  (แก้จุดเดียว ได้ผลเร็ว)
- **ข้อ 5 (จุดเดียว)**: เก็บ `payload.picture` ตอน `/api/auth/google`
- **ข้อ 7**: สร้างตาราง + endpoint ประวัติ Competitive ต่อผู้ใช้ (ตอนนี้ไม่มี)
- **ข้อ 3 (ภายหลัง)**: ปรับ UI Competitive Arena ตาม design spec

## Person 3 — Arcade / สถาปัตยกรรมรวม / DB / บอท (งานของผู้ใช้)
- **ข้อ 5 (ฐานของ 6, 9)**: ออกแบบระบบรูปโปรไฟล์ 5 แหล่ง (default ตามระดับ, อัปโหลด, Google, ร้าน,
  achievement) — schema + resolution order ใน `db.js`
- **ข้อ 6**: เพิ่มชนิด cosmetic รูปโปรไฟล์ในร้าน (ต่อจากข้อ 5)
- **ข้อ 9**: ขยาย achievement ให้ให้รางวัลรูป/ของพิเศษที่ไม่มีในร้าน + แก้ `Achievements.jsx` (mock) ให้ดึงจริง
- **ข้อ 7**: ทำแท็บประวัติ Arcade/Competitive ใน ProfilePage
- **ข้อ 8**: แจ้งเตือนผู้ชม Arcade แก้โค้ดไม่ได้ให้ชัดขึ้น
- **ข้อ 1**: output cap ฝั่ง server (`pythonRunner.js`)
- **ข้อ 3**: เขียน design spec UI รวม + ปรับ Arcade/MainMenu
- **ข้อ 10**: เขียนเอกสารดีไซน์ 2v2 + ไอเดียโหมดเพิ่ม

---

# ⚠️ เงื่อนไข/ความเสี่ยงข้ามงาน

1. **Gmail App Password** เป็น prerequisite ของข้อ 4 (และของระบบลืมรหัสผ่านที่มีอยู่) — ถ้าไม่มี OTP
   ส่งไม่ออก เหมือนที่ revert รอบก่อน
2. **Google sign-in บล็อกภายนอก** — รอผู้ใช้ปลดบล็อก client ก่อน จึงตั้ง `GOOGLE_CLIENT_ID` ได้
3. **uploads หายตอน redeploy** — Dockerfile คัดลอกไฟล์ไป `/app/uploads` แต่ server เสิร์ฟจาก
   `/data/uploads` (volume เปล่า) รูป default/ร้าน/achievement (ข้อ 5,6,9) จะ 404 บน Docker
   ต้องแก้เส้นทาง uploads ก่อน deploy จริง (พบตอน code-review — ยังไม่แก้)
4. **ข้อ 3 และ 10 ข้ามขอบเขตทุกคน** — ต้องมี design spec ตกลงร่วมกันก่อนลงมือ
5. ทุกงานที่แตะคลังโจทย์/ตัวตรวจ/schema ต้องรัน test suite ตาม `CLAUDE.md` และเขียน work log +
   handoff ถ้าแตะไฟล์นอกขอบเขต

---

# การส่งมอบ
รอบนี้ **ไม่แตะโค้ด** ส่งมอบเป็นแผนนี้ให้ทีม เมื่อผู้ใช้อนุมัติแล้ว แนะนำแปลงเป็นเอกสารใน `docs/`
(หรือแตกเป็น GitHub Issues รายข้อด้วย `/to-tickets`) เพื่อให้แต่ละคนหยิบไปทำได้
