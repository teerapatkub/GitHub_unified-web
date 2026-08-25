# รวมโปรเจคของ Person 2 (`GitHub_unified-web-Project2-tee`) เข้าเป็นก้อนเดียว

**วันที่:** 2026-08-25 เวลา 03:00
**ผู้ทำ:** Person 3

หลังจากรวมงานของ Person 1 ไปเมื่อ 2026-08-20 รอบนี้คือของ Person 2 (Admin Panel,
Competitive Arena, Leaderboard) **ทำให้ repo นี้เป็นตัวเต็มของทั้งสามคนเป็นครั้งแรก**

---

## 1. สำรวจก่อนแตะ

โฟลเดอร์ที่ส่งมาซ้อนกันสองชั้นและไม่มี `.git` จึงต้อง merge ด้วยมือ
เทียบไฟล์ด้วย hash ที่ normalize CRLF ก่อน (รอบที่แล้ว `core.autocrlf` ทำให้ไฟล์ที่ไม่ได้แก้
ดูเหมือนถูกเขียนใหม่ทั้งไฟล์):

| กลุ่ม | จำนวน |
|---|---|
| เหมือนกันเป๊ะ | 164 |
| ต่างกัน | 22 |
| มีแต่ของเขา | 53 (แต่ **35 เป็นไฟล์ log ขยะ**) |
| มีแต่ของผม | 54 |

Route: ของผม 87 · ของเขา 103 · ตรงกัน 57
ใน 46 route ที่มีแต่ของเขา **ส่วนใหญ่คือ simulation ที่ผู้ใช้สั่งลบไปแล้ว** — ไม่รวมกลับเข้ามา

---

## 2. เปลี่ยนชั้นฐานข้อมูลมาใช้ driver `pg` (ผู้ใช้เลือก)

ทั้งสองคนย้ายมา PostgreSQL เหมือนกันแต่เขียน `db.js` คนละแบบ ของผมเขียน wire protocol
คุยกับ socket เอง (1,227 บรรทัด) ของเขาใช้ `pg` Pool (407 บรรทัด) **ทั้งคู่มี interface เหมือนกันเป๊ะ**
(`?` placeholder, `db.execute()`, `getConnection()` + transaction) จึงสลับได้โดยไม่ต้องแก้ `server.js` เลย

**เหตุผลที่ของเขาดีกว่าจริง ไม่ใช่แค่สั้นกว่า**
- ของผม**ไม่มี connection pool** — ทุก query เปิด TCP + SASL handshake ใหม่ทั้งชุด
- ของผม**ใช้ bind parameter ไม่ได้** ต้อง escape ค่าแล้วต่อเข้าไปในสตริง SQL เอง
  ซึ่งเป็นทั้งความเสี่ยง injection และต้นตอของบั๊กเรื่อง type ทั้งตระกูล:
  boolean ต้อง render เป็น 1/0 → **ทั้ง schema ห้ามมีคอลัมน์ BOOLEAN จริงเลยสักตัว**
  และกฎ rewrite `TRUE`→`1` แบบเหมารวมเคยทำ JSON ใน seed พังมาแล้ว

ผลคือ `db.js` เหลือ 1,103 บรรทัด: transport เป็นของเขา, schema+seed ~640 บรรทัดเป็นของผม,
กฎแปลง SQL รวมสองชุดเข้าด้วยกัน (ของผมมี `TINYINT(1)`→`SMALLINT`, `DATE_ADD/SUB`,
`CAST(x AS UNSIGNED)`; ของเขามี `SHOW TABLES`, `GET_LOCK`, `GROUP_CONCAT`, `ON DUPLICATE KEY`)

**ตัดกฎ `TRUE`→`1` ทิ้งได้แล้ว** — grep ทั้งโปรเจคแล้วไม่มี SQL ไหนใช้ `TRUE`/`FALSE` เปล่าๆ เลย
กฎที่เคยทำ seed พังจึงหายไปพร้อมกับเหตุผลที่ต้องมีมัน

**สามจุดที่ต้องประคองไว้ ไม่งั้นโค้ดเดิมเปลี่ยนความหมายเงียบๆ**
1. `pg` คืน `int8`/`numeric` เป็น **string** — ตั้ง `types.setTypeParser` ให้เป็น Number
   ไม่งั้น `COUNT(*)` ที่เอาไปบวกลบจะกลายเป็นการต่อสตริง
2. boolean ที่ส่งเข้ามาต้องแปลงเป็น 1/0 เพราะคอลัมน์ flag เป็น SMALLINT
3. object/array ต้อง `JSON.stringify` เอง ไม่งั้น `pg` จะแปลง array เป็น Postgres ARRAY (`{1,2,3}`)

**ยืนยันแล้วทั้งสามข้อ**: `test_cases` คืนมาเป็น array ที่ decode แล้ว · `COUNT(*)` → `number 40` ·
`insertId` → `number 329`

`scripts/sql-dialect-check.js` ต้องแก้ตามเพราะดึง `normalizeSql` ออกจาก `db.js` แบบ text
เปลี่ยนไปยกทั้งบล็อกแปลง SQL มาแทนการ re-implement helper ขึ้นมาเอง
ผลพลอยได้: ตัวตรวจ**เข้มขึ้น** เพราะ PREPARE ได้เห็น `$1/$2` จริงแทนค่า `'1'` ที่ยัดเข้าไป
(statement ที่สรุปผลได้ 234 → 279)

---

## 3. รวม `server.js`

ของผม 5,657 บรรทัด ของเขา 9,717 (ใหญ่กว่าเพราะยังมี simulation ครบ) →
ใช้ของผมเป็นฐาน ตัดของเขามาด้วย AST (acorn) ไม่ใช้ regex หรือการนับวงเล็บ

**ดึงมา 18 route** (8 ใหม่ + 10 ทับของเดิมที่เขาพัฒนาไปไกลกว่า เช่น
`POST /api/competitive/challenges/:id/submit` 40 → 130 บรรทัด)
พร้อม **helper 25 ตัว** ที่หามาด้วยการไล่ dependency **แบบ transitive จนไม่มีอะไรใหม่โผล่**
— รอบที่แล้วพลาดเพราะดูแค่ชั้นเดียว แล้วเจอ `insertLedgerEntry is not defined` ตอนผู้ใช้กดซื้อจริง

**ที่จงใจไม่ยกมา**: `callNvidiaChat` + `NVIDIA_*` ของเขา ซึ่ง **hardcode API key ไว้ในโค้ด**
(`server.js:84`) เปลี่ยนไปเรียก `callAiChat()` ของเราแทน — signature เหมือนกันเป๊ะ
และอ่านคีย์/โมเดลจาก `.env` ตัวตรวจโค้ด Arcade (`judgeCodeQuality`) ไม่ถูกแตะเลยสักตัวอักษร

**ย้ายการสร้างตารางมาไว้ตอนบูต** — ของเขาสร้างตารางตอนมี request แรกที่บังเอิญต้องใช้
แปลว่า schema ขึ้นกับว่าใครเรียก endpoint ไหนก่อน ตอนนี้ `ensureMergedSchemas()` ทำตั้งแต่ boot

---

## 4. รวมฝั่ง client

**เอาของเขา**: `CompetitiveArena.jsx` (788→1,358), `admin/pages/Dashboard.jsx` (423→690),
`Leaderboard.jsx`, `AdminNavbar.jsx` และไฟล์ใหม่ `admin/pages/CompetitiveChallengePage.jsx`

**เอาของผม**: `vite.config.js` — ของเขา**ไม่มี `/api` proxy** ซึ่ง Arcade พึ่งอยู่
(`ArcadeBattleRoyale.jsx:144` ตั้ง `API_BASE = ''` ยิง relative ล้วน) ถ้าเอาของเขาจะพังทั้งโหมด

**`FriendLogin.jsx` — รวมสองฝั่ง**: ของเขามี UI ลืมรหัสผ่าน (คู่กับ 3 route ใหม่) แต่มี
**แบบสำรวจตัวที่พังเหมือนกันเป๊ะ** (เช็ค `currentQ.id === 3` ทั้งที่แถวจริงคือ id 1003 → สมัครไม่จบ)
จึงเอาไฟล์เขาเป็นฐานแล้วแปะ patch แก้แบบสำรวจที่เขียนไว้เมื่อ 22.8 ทับ — assertion ผ่านหมด
ได้ทั้งสองฟีเจอร์ (1,042 บรรทัด)

`App.jsx`: เพิ่ม `/competitive-arena` (เป็น path ที่สองของ CompetitiveArena ไม่ทับ `/online` ของเรา)
และ `/admin/competitive-challenge` — **ไม่เอา** `/simulation`, `/lobby/:roomId`, `/join-room`

`translation.json`: merge แล้วได้ **+0 คีย์** — ของเราเป็น superset อยู่แล้ว

---

## 5. รวมฐานข้อมูล (`24.8.2569.sql`)

**สิ่งที่เจอและเปลี่ยนขอบเขตงานไปเลย**: dump ของ Person 1 กับ Person 2 **สืบมาจากฐานเดียวกัน**
— ผู้ใช้ 5 ใน 9 คนของเขาถูกนำเข้าไปแล้วตอนรวมกับ Person 1 (ได้ id ใหม่ 28–32)
ถ้าเติมแบบไม่ดูจะได้ผู้ใช้ซ้ำทันที จึง **match ด้วย username+email ก่อน แล้วค่อยเติมเฉพาะที่ไม่มี**

| ตาราง | นำเข้า | หมายเหตุ |
|---|---|---|
| `users` | 4 | อีก 5 คนมีอยู่แล้ว |
| `mini_game_exercises` | 12 | ids 8–19 (บทเรียน 2,3,4,15) — ของเขา 1–7 เหมือนของเราเป๊ะ |
| `mini_game_dialogues` | 24 | อีก 16 มีอยู่แล้ว (match ด้วย exercise+order+branch) |
| `multiplayer_challenges` | 7 | โจทย์แข่งภาษาไทยของ Person 2 (ของเราเดิมเป็นโจทย์ทดสอบ) |
| `multiplayer_submissions` | 6 | remap user_id + challenge_id |
| `user_mailbox` | 7 | |
| `active_accepted_challenges` | 1 | |

**ไม่นำเข้า**: ตาราง simulation ทั้งหมด (`simulation_logs` 1,675 แถว, `simulation_saves`,
`contracts`, `financial_ledger`, `locations`, `random_events`, `assets`, `user_contracts`)
และข้อมูลกิจกรรมของผู้ใช้ทดสอบ (`lesson_quiz_attempts`, `exercise_submissions`,
`mini_game_*_progress`, `learning_ai_tasks`) — เป็นร่องรอยการเล่นของบัญชีทดสอบ ไม่ใช่เนื้อหา

**เพิ่ม `password_reset_tokens`** เข้ามาใหม่ (คู่กับฟีเจอร์ลืมรหัสผ่าน)

รอบแรกรัน **ล้มแล้ว rollback ทั้งก้อน** เพราะ `active_accepted_challenges` ของเราใช้
composite key `(user_id, challenge_id)` ไม่มีคอลัมน์ `id` แบบของเขา — ตรวจแล้วว่าไม่มีอะไร
เขียนลงไปเลย จากนั้นแก้ให้สคริปต์เช็คคอลัมน์ก่อนแล้วรันใหม่ผ่าน

---

## 6. ทดสอบ

| ชุด | ผล |
|---|---|
| `check:sql` | **291 statement · 0 rejected** (ก่อนรวม 244) |
| `check:undef` | ผ่าน — ไม่มี helper ที่ถูกเรียกแต่ไม่ได้ยกมา |
| `test:arcade` | 14 PASS · 0 FAIL (รวม 458 assertions ของคลังโจทย์) |
| `test:achievements` | 8/8 |
| `test:shop` | 11/11 |
| GET sweep | **43/43 route · 0 ตัวคืน 5xx** |
| `npm run build` | ผ่าน |
| `npm run lint` | 61 error (เท่า baseline) · 9 warning (+1 จากไฟล์ที่รับมาของ Person 2) |

**self-test ของตัวตรวจ SQL** — ผมผ่อนกฎให้ยอมรับ `already exists` (ALTER ที่มี guard
เช็ค `information_schema` อยู่ก่อนแล้ว) จึงต้องพิสูจน์ว่ามันยังจับของจริงได้:
ปลูก `SELECT no_such_column FROM users` เข้าไป → จับได้ 1 rejected ชี้บรรทัดถูก แล้วคืนไฟล์สะอาด

**สแกน mojibake ทุกคอลัมน์ข้อความ** — 175 คอลัมน์ใน 55 ตาราง (50 คอลัมน์มีภาษาไทยจริง)
**ไม่พบข้อความเสียเลย** ทำแบบสแกนทุกคอลัมน์เพราะรอบที่แล้วผมเดาชื่อคอลัมน์ที่จะตรวจ
(`achievements.title` ซึ่งไม่มีอยู่จริง) แล้วสรุปว่าสะอาด ทั้งที่ `achievements.description` พังไป 61 ค่า

**ตรวจ FK หลังนำเข้า**: mailbox→users 0 orphan, submissions→challenges 0 orphan,
dialogues→exercises 0 dangling (ที่นับได้ 13 คือแถวเดิมที่ `exercise_id` เป็น NULL อยู่แล้ว)

**endpoint ใหม่คืนข้อมูลจริง**: `/api/competitive/leaderboard` คำนวณอันดับจาก submission
ที่เพิ่งนำเข้าได้ถูกต้อง (user 32 = ปุณยภา สกุลคู, 4 โจทย์, best 98) ซึ่งพิสูจน์ว่า
การ remap id ระหว่างสองฐานทำงานจริง ไม่ใช่แค่ insert ผ่าน

---

## 7. โมเดลแชทบอท — เปลี่ยนเป็น `moonshotai/kimi-k3`

ผู้ใช้เลือกใช้ `moonshotai/kimi-k2.6` ตามที่เซิร์ฟเวอร์ของ Person 2 ใช้อยู่ **แต่ทดสอบแล้ว
โมเดลนี้คืน HTTP 404 ทั้งกับคีย์ของเราและคีย์ของ Person 2 เอง** (มีชื่อใน catalogue แต่ไม่ถูกเสิร์ฟแล้ว)
แปลว่าแชทบอทของ Person 2 เสียมาสักพักแล้ว โดยโค้ดของเขา fallback เงียบๆ จึงไม่มีใครสังเกต
ผู้ใช้จึงเลือก `moonshotai/kimi-k3` (รุ่นถัดมา ค่ายเดียวกัน)

นี่เป็นโมเดลตัวที่ **3** ที่ถูกปลดระวางระหว่างทำโปรเจคนี้ (`z-ai/glm-5.2` → 410,
`deepseek-ai/deepseek-v4-flash-0731` → ค้างไม่ตอบ, `moonshotai/kimi-k2.6` → 404)
ทั้งสามตัว **ยังมีชื่ออยู่ใน `models.list()` ตอนที่ใช้ไม่ได้แล้ว** — การเช็คว่ามีชื่อในรายการ
จึงพิสูจน์อะไรไม่ได้ ต้องยิง request จริงเท่านั้น

### บทเรียนที่เกือบสรุปผิด

ทดสอบ Lumi ด้วย `curl` จาก Git Bash บน Windows แล้วได้ผลแย่มาก — ครั้งหนึ่งตอบเป็น
**ภาษารัสเซีย** เรื่อง "วิธี print เครื่องหมายคำถาม" อีกสองครั้ง timeout ที่ 90 วินาที
เกือบสรุปว่า kimi-k3 ใช้เป็นแชทบอทไม่ได้

คำว่า "เครื่องหมายคำถาม" คือเบาะแส: **`curl` ทำภาษาไทยเพี้ยนเป็น `?????` ก่อนส่งออกไป**
โมเดลจึงได้รับแต่เครื่องหมายคำถามจริงๆ พอเปลี่ยนไปส่งด้วย UTF-8 จริงจาก Node:

| ครั้ง | เวลา | ผล |
|---|---|---|
| 1 | 7.4 วิ | ตอบไทยถูกต้อง |
| 2 | 1.4 วิ | ตอบไทยถูกต้อง |
| 3 | 14.1 วิ | ตอบไทยถูกต้อง |

3/3 ผ่าน และตัวสร้างโจทย์ AI ได้ `source: generated` ใน 5.3 วินาที (โจทย์ที่ AI แต่งเอง 4 test case)

**ข้อควรจำสำหรับครั้งหน้า**: อย่าทดสอบ endpoint ที่รับข้อความไทยด้วย `curl -d` บน Windows
ผลลัพธ์จะโทษโมเดลทั้งที่ผิดที่เครื่องมือทดสอบ ให้ยิงจาก Node ด้วย `fetch` แทน

ขยับ `NVIDIA_AI_TIMEOUT_MS` 45s → 90s เพราะเวลาตอบแกว่งจริง (1.4–14.1 วิ ในสามครั้งติดกัน
และเคยวัดได้ 26 วิ) การแกว่งมาจากภาระฝั่งผู้ให้บริการ ไม่ใช่ token budget ของเรา
— request ที่ขอ token มากที่สุดกลับเร็วที่สุดในชุดทดสอบ

## 8. ค้างอื่นๆ

- **ยังไม่ commit อะไรลง git เลยตลอดหลาย session** — งานทั้งหมดอยู่ใน working tree
- โฟลเดอร์ `GitHub_unified-web-Project2-tee/` ยังอยู่ (ยังไม่ลบ รอผู้ใช้ยืนยัน)
- คีย์ NVIDIA ที่ hardcode ไว้ในโค้ดของทั้ง Person 1 และ Person 2 ควรถือว่ารั่วและ revoke ทิ้ง
- SMTP ยังปฏิเสธ login — ฟีเจอร์ลืมรหัสผ่านสร้าง token ได้แต่ **อีเมลยังส่งไม่ออก**
- ยังไม่ได้ทดสอบ Competitive Arena และหน้า admin บนหน้าจอจริง (ยืนยันแค่ระดับ API)
