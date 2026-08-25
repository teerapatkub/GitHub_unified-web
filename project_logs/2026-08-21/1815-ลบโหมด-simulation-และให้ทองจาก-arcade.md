# ลบโหมด simulation ออกทั้งระบบ และทำให้ Arcade จ่ายทองเข้ากระเป๋ากลาง

**วันที่**: 2026-08-21 เวลา 18:15
**ผู้ทำ**: Person 3
**ที่มา**: ผู้ใช้สั่งลบตารางฐานข้อมูลที่เกี่ยวกับ simulation เพราะเป็นของโปรเจคเก่า
แล้วเลือกให้ลบโค้ดออกด้วย และให้ทองได้จากทุกโหมดรวมถึง Arcade เพื่อเอาไปซื้อของตกแต่งในร้านค้า

---

## 0. สำรองก่อน

`db-backup/postgres_before_drop_simulation.dump` (470 KB) — สำรองฐานข้อมูลเต็มก่อนลบ

---

## 1. ขอบเขตจริงกว้างกว่าชื่อตาราง

ไม่ได้มีแค่ตารางที่ขึ้นต้นด้วย `simulation_` — โหมดจำลองชีวิตนักพัฒนา (DesktopPage) ใช้ทั้งคลัสเตอร์:

| ตาราง | แถว | คืออะไร |
|---|---|---|
| `simulation_logs` | 1,675 | log เหตุการณ์ |
| `simulation_active_events` | 553 | เหตุการณ์ที่ยังไม่แก้ |
| `simulation_saves` | 11 | เซฟเกม |
| `contracts` | 11 | งานรับจ้าง (JobPlatform) |
| `user_contracts` | 3 | งานที่รับไว้ |
| `financial_ledger` | 8 | บัญชีรายรับรายจ่าย |
| `random_events` | 6 | เหตุการณ์สุ่ม |
| `locations` | 2 | สถานที่ในเกม |
| `assets` | 0 | ของที่ซื้อในเกม |

**หมายเหตุที่เกือบพลาด**: `locations` ไม่ใช่ `mini_game_locations` และ `assets` ไม่ใช่โฟลเดอร์ `client/src/assets`
ตอน grep เจอ `locations` ใน `MiNi_Game.jsx` กับ `assets` ใน `App.jsx` — ทั้งคู่เป็น**ผลบวกลวง**
(path รูป `/data_MiNiGame/locations/classroom.jpg` กับ path เพลง `/assets/music/...`) ไม่ใช่การใช้ตาราง

---

## 2. ลบโค้ดฝั่ง server

ตัด 24 route + 3 helper ที่อ่าน/เขียนตารางกลุ่มนี้ (ตัดตามช่วงบรรทัดที่ acorn บอก ไม่ได้เดาเอง)
รวมกับที่เก็บกวาดตามหลัง: **`server.js` 6,008 → 4,847 บรรทัด**

| ที่ลบ | รายการ |
|---|---|
| route | `/simulation/*` ทั้งหมด (14), `/jobs/*` (6), `/profile/:userId`, `/assets/:userId`, `/finance/*` (2), `/locations` |
| helper | `generateDailyJobs`, `startNewGame`, `startSimulationLoop` (loop เบื้องหลัง 224 บรรทัด) |
| เก็บกวาดตามหลัง | `POST /api/ai/generate-jobs` (เรียก `generateDailyJobs` ที่ถูกลบ — ตรวจ SQL อย่างเดียวจับไม่ได้เพราะตัว route ไม่มี SQL), คอมเมนต์หัวข้อที่เหลือค้าง 20 บรรทัด, บรรทัด `// startSimulationLoop();` ใน `app.listen` |

ฝั่ง client ลบ `pages/old plan/DesktopPage.jsx` + component ที่มีแต่มันเรียกใช้ 10 ตัว
(`CodeEditor`, `EmailClient`, `MyComputer`, `RecycleBin`, `Notepad`, `JobPlatform`, `Window`,
`DraggableIcon`, `Taskbar`, `Wallpaper`) — ตรวจกราฟ import แล้วว่าไม่มีไฟล์อื่นเรียกเลย
`components/old plan/` จึงหายไปทั้งโฟลเดอร์ ส่วน `pages/old plan/` ยังเหลือ Achievements / ShopPage /
Matchmaking / Lobby / JoinRoom / OnlineMenu ซึ่งไม่ใช่ simulation

`App.jsx` ตัด route `/simulation`, import `DesktopPage` และเปลี่ยนชื่อ `simulationRoutes` เป็น
`fullBleedRoutes` (ชื่อเดิมสื่อถึงโหมดที่ไม่มีแล้ว แต่หน้าที่จริงคือรายการหน้าที่ไม่มีขอบ)

---

## 3. สองจุดที่ลบดื้อๆ ไม่ได้

### 3.1 แดชบอร์ดแอดมิน
`/api/dashboard/stats` กับ `/api/dashboard/recent-activities` (ของ Person 1 ที่เพิ่ง merge เข้ามา)
อ่าน `simulation_saves` อยู่ 3 จุด ลบตารางแล้ว endpoint พังทั้งตัว ไม่ใช่แค่ตัวเลขหาย

**ทำ**: ชี้ไปที่ Arcade แทน เพราะเป็นโหมดที่มาแทนที่ simulation พอดี
- นับผู้เล่นโหมดเดี่ยว → `arcade_player_stats` join `users`
- แถว activity `'solo'` → `arcade_round_history` join `users`
- รายการล่าสุด `'simulation'` → แสดงรอบ Arcade พร้อมผลเทสต์

**แตะไฟล์นอกขอบเขต**: `client/src/admin/pages/Dashboard.jsx` (ของ Person 2) เปลี่ยนการ์ด
"โหมดเดี่ยว" เป็น "โหมดอาร์เคด" ให้ตรงกับข้อมูลที่ส่งมาจริง และลบ import `Monitor` ที่ไม่ได้ใช้แล้ว
ถ้าไม่แก้ การ์ดจะขึ้น 0 ตลอดไปเพราะ server ไม่ส่ง key เดิมแล้ว

### 3.2 ร้านค้า — จุดที่ทับซ้อนกับของที่ยังใช้อยู่
หน้า `/shop` ที่ใช้งานจริง **จ่ายด้วย `sim_money` จาก `simulation_saves`** ลบแล้วซื้อของไม่ได้เลย

พอไปดู `origin/main` พบว่า Person 1 เขียน `/shop/buy` ใหม่ให้จ่ายด้วย `users.virtual_currency` แล้ว
(ตรงกับคอมมิต "ร้านค้าให้ซื้อธีมด้วยทองที่เรามีได้") จึงดึงมาทั้ง 4 เส้น:
`/shop/items`, `/shop/inventory/:userId`, `/shop/buy`, `/shop/equip`

**ช่องโหว่ของการ merge รอบก่อนที่เจอตอนนี้**: รอบที่แล้วผมเติมเฉพาะ endpoint ที่**ขาดหายไป**
ส่วนที่มีทั้งสองฝั่งเก็บของเดิมไว้หมด ทำให้ 3 เส้นที่เขาแก้ใหม่ (`/shop/equip`, `/api/login`,
`/api/auth/google`) และ 9 เส้นที่แก้ทั้งคู่ (รวม `/shop/buy`, `/api/user/profile`, `/api/course-content`)
ยังเป็นเวอร์ชันเก่าอยู่ — รอบนี้แก้เฉพาะกลุ่มร้านค้า **ที่เหลือยังค้าง**

---

## 4. ทองจาก Arcade

เพิ่ม `awardArcadeMatchCoins()` เรียกใน `recordArcadePlayerStats()` ซึ่งทำงาน**ครั้งเดียวต่อแมตช์**
ตอนห้องถึง RESULT และคำนวณอันดับไว้อยู่แล้ว

จ่ายผ่าน **`applyXpRewardToUser()` ตัวเดียวกับที่โหมดเรียนใช้** ตั้งใจให้เป็นทางเดียวกันจริงๆ ตามที่ผู้ใช้ต้องการ
(ทองเป็นสกุลเดียวทั้งเว็บ) ไม่ได้เขียน UPDATE เอง

ค่ารางวัลอยู่ใน `shared/arcadeConfig.json` ตามธรรมเนียมโปรเจค (ไม่ hardcode):

```
coinRewardByRank      { "1": 50, "2": 35, "3": 25, "4": 15, "5": 10 }
coinRewardParticipation  10
```

เทียบเคียงจากโหมดเรียนที่ให้ 5-10 ทองต่อข้อ → ชนะหนึ่งแมตช์ (4 รอบ) ≈ ทำแบบฝึกหัด 5 ข้อ

รายละเอียดที่ตั้งใจ:
- **บอทไม่ได้ทอง** และชื่อที่ไม่มีบัญชีจริงจะข้ามไปเงียบๆ (arcade ใช้ `user_name`, ต้อง join `users.username`)
- **Survival Cash ในแมตช์ไม่ถูกแปลงเป็นทอง** — เป็นคนละอย่าง จ่ายตามอันดับสุดท้ายเท่านั้น
- **ห้าม throw** — ถ้ากระเป๋าของคนหนึ่งมีปัญหา ต้องไม่ทำให้คนอื่นไม่ได้ทองและต้องไม่ทำให้แมตช์จบไม่ได้

---

## 5. ลบตาราง

ลบ 9 ตารางใน transaction เดียว **69 → 60 ตาราง** ตรวจแล้วว่า CASCADE ไม่ได้พาตารางอื่นหายไปด้วย
(`mini_game_locations` ยังอยู่ครบ — คนละตารางกับ `locations`)

---

## 6. ทดสอบ

| การทดสอบ | ผล |
|---|---|
| `node --check` | ผ่าน |
| ไม่มี route/declaration ซ้ำ | ไม่มี |
| import ทุกอันใน `client/src` resolve ได้ | ผ่าน |
| **เล่นแมตช์จริงผ่าน API จนถึง RESULT** | ผ่านครบทุก phase `ROUND_1 → ... → RESULT` |
| ทองเข้าจริง | **0 → 50 ทอง** (อันดับ 1) log ขึ้น `🪙 arcade: paid 50 coins to qatester1 (rank 1)` |
| ซื้อของด้วยทองนั้น | ซื้อธีม Sakura 30 ทอง → เหลือ 20, ของเข้ากระเป๋า |
| ซื้อซ้ำ | ถูกปฏิเสธ `คุณมีไอเทมนี้อยู่แล้ว` |
| เงินไม่พอ (ของ 999 ทอง ด้วยทอง 20) | ถูกปฏิเสธ `เงินไม่พอ` และ**ไม่หักทอง** |
| ยิงทุก GET route (37 เส้น) | 0 เส้นพัง |
| `npm run check:sql` | 210 คำสั่ง, 0 rejected |
| `npm run test:arcade` | ผ่านทั้งชุด |
| `npm run build` | ผ่าน |
| `npm run lint` | 61 errors (ลดจาก 78 เพราะไฟล์ simulation ที่ลบไปมี 17) — Dashboard.jsx สะอาด, App.jsx เท่าเดิม |
| log ตอนบูตและระหว่างยิง | ไม่มี error |

ล้างข้อมูลทดสอบแล้ว: คืนราคาของในร้านเป็น 0, ลบของที่ซื้อ, รีเซ็ตทอง/xp ของ `qatester1` เป็น 0,
ลบ `arcade_round_history` ของ `qatester1` 27 แถว (เป็นข้อมูลจากการทดสอบอัตโนมัติทั้งหมด)

### บั๊กที่ตัวเองทำแล้วจับได้ และเครื่องมือที่ได้มาจากมัน
ตอนดึง 4 route ของร้านค้ามา **ผมย้ายมาแต่ route ไม่ได้เอา helper มาด้วย** ทำให้ซื้อของแล้วขึ้น
`insertLedgerEntry is not defined` — และ**ไม่มีอะไรจับได้เลย** เพราะ `node --check` ผ่าน
(ReferenceError เกิดตอนรัน) และ `check:sql` ก็ผ่าน (ตัว route ไม่มี SQL ตรงนั้น)
เจอตอนกดซื้อจริงเท่านั้น

ระหว่างไล่ ผมสรุปผิดไปก่อนหนึ่งจังหวะว่า "ฝั่งเขาก็พังอยู่แล้ว" เพราะ grep หา `const insertLedgerEntry`
แต่ของจริงประกาศเป็น `async function` — ของเขาไม่ได้พัง ผมเองที่ย้ายมาไม่ครบ

แก้โดย**ตัดการเขียน ledger ทิ้ง** (ไม่ใช่ตามไปเอา helper มา) เพราะ `financial_ledger` ถูกลบไปกับ simulation แล้ว

เขียน `undef_check.js` ไว้จับบั๊กชนิดนี้: เดินทั้ง AST หาฟังก์ชันที่ถูก**เรียก**แต่ไม่มีที่**ประกาศ**
ในไฟล์ รันแล้วเหลือ 0 ตัว ควรย้ายเข้า `server/scripts/` ถ้าจะย้ายโค้ดข้ามสาขาอีก

---

## 7. ยังค้าง

1. **หน้า RESULT ยังไม่โชว์ว่าได้ทองเท่าไร** — ทองเข้าจริงแต่ผู้เล่นไม่เห็นตอนจบแมตช์
   ต้องแก้ฝั่ง client เพิ่ม (ยังไม่ได้ทำ)
2. **ยังไม่ได้กดดูบนหน้าจอจริง** — ที่ทดสอบคือระดับ API ทั้งหมด
3. ของในร้านตอนนี้**ราคา 0 ทุกชิ้น** (8 ชิ้น) ทองยังไม่มีที่ใช้จนกว่าจะตั้งราคา
4. endpoint ที่ Person 1 แก้ใหม่แล้วเรายังใช้ของเก่า — เหลือ `/api/login`, `/api/auth/google`
   และกลุ่ม "แก้ทั้งคู่" อีก 8 เส้น (`/api/user/profile/:userId`, `/api/course-content`,
   `/api/register`, `/api/ai/chat`, `/api/learning/ai-task/submit` ฯลฯ)
5. `/rooms/*`, `/achievements/:userId` และตาราง `game_rooms`, `game_sessions`, `room_participants`
   ยังอยู่ — เป็นต้นแบบมัลติเพลเยอร์เก่า **ไม่ใช่ simulation** จึงไม่แตะ (ถ้าจะลบด้วยบอกได้)
   หมายเหตุ: `/api/dashboard/stats` นับ "โหมดออนไลน์" จาก `room_participants` ซึ่งมี 0 แถว
6. Arcade ให้แต่ทอง ไม่ให้ XP — ถ้าอยากให้ XP ด้วยเปลี่ยนที่ `awardArcadeMatchCoins` จุดเดียว
7. ยังไม่ได้ commit
