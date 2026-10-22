# ทำให้ `npm run test:arcade` รันผ่านได้อีกครั้งหลังย้ายไป Supabase Auth

**วันที่**: 2026-10-22 ~21:30

## ปัญหา

สี่สคริปต์ใน `test:arcade` ที่ต้องคุยกับ server (`test:score`, `test:draw`, `test:spectator`,
`test:bots`) ยิงไปที่ `http://localhost:3001/api/arcade/*` โดยไม่ส่ง token
หลังย้าย auth ของผู้เล่นไป Supabase Auth (2026-10-08) ทุก request ได้ 401
`npm run test:arcade` จึงพังที่ `test:score` ทุกครั้ง และกฎใน CLAUDE.md ที่บังคับให้รันก่อน commit
ทำตามไม่ได้

## สิ่งที่แก้

ทำตามแบบเดียวกับ `test:submit` (commit f068c70): ย้ายแต่ละสคริปต์ไปเป็นไฟล์ `node:test` ใน
`server/tests/` ที่บูต server จริงของตัวเองบนฐานข้อมูลที่สร้างแล้วลบทิ้งเอง (`TEST_DATABASE_URL`)

| เดิม (ลบแล้ว) | ใหม่ | npm script |
|---|---|---|
| `scripts/arcade-tests/server-scoring-test.js` | `tests/arcade-server-scoring.test.js` | `test:score` |
| `scripts/arcade-tests/draw-test.js` | `tests/arcade-draw.test.js` | `test:draw` |
| `scripts/arcade-tests/spectator-test.js` | `tests/arcade-spectator.test.js` | `test:spectator` |
| `scripts/arcade-tests/bot-skill-test.js` | `tests/arcade-bot-skill.test.js` | `test:bots` |

ตัวช่วยที่ขยาย:
- `tests/helpers/probe-boot.js` — `stubSupabaseAuth()` รับผู้เล่นได้หลายคน (token → Auth user)
- `tests/helpers/server-boot.js` — `SERVER_BOOT_PLAYERS` seed ผู้เล่นที่ล็อกอินแล้วเพิ่มจาก probe;
  `SERVER_BOOT_BACKGROUND_JOBS=1` เปิด background jobs ตัวจริง (match tick ที่ปิดรอบและขยับบอท)
- `tests/helpers/start-server.js` — `startServer(t, { players, backgroundJobs })` คืน
  `players[name].call`, `username` ของ probe และ `anonymous` (request ไม่มี token)
- `server.js` — export `startBackgroundJobs` เพิ่ม (บรรทัดเดียว ไม่เปลี่ยนพฤติกรรม)

`scripts/arcade-tests/README.md` อัปเดตแล้วว่าสี่ตัวนี้ไม่ต้องเปิด server แยกไว้ก่อน ต้องมีแค่ `TEST_DATABASE_URL`

## เช็กที่ต้องปรับตาม API ปัจจุบัน (เจตนาเดิมครบ ไม่มีเช็กไหนอ่อนลง)

API ของ Arcade เปลี่ยนไปตั้งแต่สคริปต์เดิมถูกเขียน ไม่ใช่บั๊กของเกม:
- ตัวตนมาจาก token (`req.player.username`) ไม่ใช่ `user_name`/`viewer` ใน body/query;
  ถ้าส่งชื่ออื่นมา middleware ตอบ 403 — "คนนอกห้อง" จึงเป็นผู้เล่นที่ล็อกอินจริงคนที่สาม
- `submit-round`/`code-draft` ต้องมี `match_id` + `round_num`
- ส่งคำตอบซ้ำด้วยโค้ดอื่น และร่างที่ส่งหลังส่งคำตอบแล้ว ได้ 409 (เดิม 200 แล้วเงียบ) —
  เทสตรวจทั้ง 409 และว่าคำตอบเดิมยังอยู่จริงในฐาน (เข้มกว่าเดิม)
- คนนอกห้องส่งคำตอบได้ 403 (เดิม 404)
- `pending_round_score` ไม่อยู่ใน response สาธารณะแล้ว เทสอ่านจากฐานแทน (เดิมผ่านเพราะ `undefined`)
- "ไม่บอกว่าใครขอดู" กลายเป็น request ไม่มี token → 401
- `work_chars` ไม่ส่งออกทาง `/api/arcade/tasks` แล้ว เทส draw อ่านจาก view `arcade_tasks`
- บอทระบุด้วย `participant_kind === 'bot'` แทนการขึ้นต้นด้วย `Bot_`
- ผู้เล่นที่ seed ต้องตั้ง level 10 เพราะ Arcade ปลดล็อกที่เลเวล 10

## ผลทดสอบ

รันจริงกับ Postgres ทิ้งได้ (`pyarena-test-db`, 127.0.0.1:55432):
- `TEST_DATABASE_URL=… npm run test:arcade` — exit 0 ครบทั้ง 8 ตัว:
  test:tasks ALL PASS · test:score 11/11 · test:draw 7/7 · test:bot-progress 18/18 ·
  test:targeting 10/10 · test:trialrun ผ่าน · test:spectator 8/8 ·
  test:bots ผ่าน (บอทห้อง easy เฉลี่ย 120.8 vs ห้อง hard 170.0, n=18 ต่อฝั่ง)
- `npm test` — exit 0 (pretest 73/73, test 208/208)

## ผลกระทบ

- ไม่แตะ schema, Bot AI หรือกฎของเกม
- `server.js` เพิ่ม export หนึ่งตัว
- ตัวช่วย `startServer` ยังเข้ากันได้กับเทสเดิม (`submit-integrity`, `local-llm-*`)

## ยังไม่ได้ทำ

- ไม่ได้เพิ่มสี่ไฟล์นี้เข้า `npm test` (bot-skill ใช้ ~40 วินาที) — รันผ่าน `npm run test:arcade`
