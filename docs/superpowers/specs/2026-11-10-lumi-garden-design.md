# สวนของ Lumi — มินิเกมเขียน Python สั่งหุ่นทำสวน (Design Spec)

> สถานะ: ออกแบบเสร็จ รอผู้ใช้ตรวจ spec ก่อนทำ implementation plan · 2026-11-10

## Context
ผู้ใช้อยากให้ PySim มีมินิเกมช่วยการเรียนรู้ แนว "เขียนโค้ดให้หุ่นทำฟาร์มอัตโนมัติ" ในแบบของตัวเอง
ไม่ลอกชื่อ ภาพ หรือด่านจากเกมใด ปัจจุบันมี `/mini-game/:lessonId` (`client/src/pages/MiNi_Game.jsx`)
ซึ่งเป็นเนื้อเรื่องที่ Lumi คุยกับผู้เล่นแล้วให้ตอบโจทย์ทีละข้อ มินิเกมใหม่ต่างจากของเดิมตรงที่ผู้เล่นเขียน
**โปรแกรม** สั่งหุ่นบนกริด และวัดผลจากสถานะสวนกับจำนวน tick ที่ใช้

**สิ่งที่ผู้ใช้เลือก**
- ผสมกัน: ด่านหลักผูกกับหลักสูตร และมีฟาร์มอิสระ
- ด่านหลักให้ XP/ทอง โดย server ตรวจซ้ำ
- ธีมสวนของ Lumi
- ด่านละ 1 ต่อโมดูล
- ใช้แนวทาง A (engine Python ไฟล์เดียว)
- ฟาร์มอิสระให้ทองด้วย มีเพดาน

**ข้อสังเกต**
- seed มีหลักสูตร **9 โมดูล** (โมดูล 9 คือ OOP) ไม่ใช่ 8 จึงทำ **9 ด่าน**
- งานนี้แตะระบบเรียนและ gamification ของ Person 1 → ต้องลงบันทึกใน `docs/handoff-to-person-1.md`

**เกณฑ์ความสำเร็จ**
- เฉลยของทั้ง 9 ด่านผ่าน
- server ตัดสินและจ่ายรางวัลเอง โกงด้วย trace หรือผลที่ client ส่งมาไม่ได้
- trace จากฝั่ง client และ server ตรงกัน
- ทดสอบผ่าน dev server จริงแล้ว

## กลไกเกม
**สวน**
- กริด 3×3 ถึง 6×6
- สถานะของแต่ละช่อง: ว่าง / ไถแล้ว / มีพืช (ชนิด, อายุ) / ความชื้น / หิน

**พืช**
- ข้าว: โตใน 3 tick
- พริก: ต้องรดน้ำก่อนจึงโต
- มะม่วง: โตช้า ราคาสูง

**หุ่น**
- ทำได้ทีละคำสั่ง แต่ละคำสั่งกิน tick ตามที่กำหนด
- engine เป็น deterministic ถ้ามีสุ่ม ใช้ seed ตายตัวที่ระบุในนิยามด่าน

**คำสั่ง (API ภาษาอังกฤษ)** ปลดล็อกตามด่าน
- `move(dir)`, `till()`, `plant(kind)`, `water()`, `harvest()`
- `can_harvest()`, `get_pos()`, `get_size()`, `get_tile()`, `inventory()`

**ดาว**
- ผ่านเป้าได้ 1 ดาว
- ได้ 2 และ 3 ดาวตามเกณฑ์ tick ที่กำหนดในนิยามด่าน

| ด่าน | โมดูล | งานในสวน |
|---|---|---|
| 1 | พื้นฐาน/print | เขียนคำสั่งเรียงกันเพื่อปลูกและเก็บข้าว 1 ช่อง |
| 2 | ตัวแปร/list | ปลูกพืชตามลำดับที่เก็บไว้ใน list |
| 3 | ตัวดำเนินการ | คำนวณพิกัดและก้าว ใช้ `%` เดินวนรอบขอบสวน |
| 4 | if/loop | ใช้ลูปซ้อนเดินทั่วกริด และใช้ `if can_harvest()` |
| 5 | ฟังก์ชัน | เขียน `def go_to(x, y)` (นิยามด่านมี `max_lines` นับเฉพาะบรรทัดที่ไม่ว่างและไม่ใช่ comment) |
| 6 | โมดูล | `from garden import weather` |
| 7 | Exception | หินขวาง → `BlockedError` ต้อง `try/except` |
| 8 | ไฟล์ | `open("plan.txt")` ที่ engine จำลองไว้ แล้วปลูกตามแผน |
| 9 | OOP | `class Planner` คุมหุ่น 2 ตัวในสวนเดียวกัน |

**ฟาร์มอิสระ**
- เปิดเมื่อผ่านด่าน 4
- **เมล็ดสวน** (สกุลเงินในเกม): ใช้ขยายสวนหรือซื้อพืชในเกม ไม่จำกัด
- **ส่งผลผลิตขาย**: server รันโค้ดซ้ำในสวนและ seed ที่ server กำหนด ด้วยงบ 500 tick แล้วให้ทองตามมูลค่าผลผลิต
  - เพดาน **50 ทองต่อวันต่อคน**
  - ส่งขายได้ไม่เกิน 1 ครั้งต่อ 10 นาที
  - ตัวเลขทั้งสองอ่านจาก config

## สถาปัตยกรรม (แนวทาง A)
```
shared/garden/garden_engine.py      กฎทั้งหมด ไฟล์เดียว → ผลลัพธ์คือ trace JSON + สรุปสถานะสุดท้าย
shared/garden/levels/01..09.json    ขนาดสวน, ของขวาง, seed, เป้า, เกณฑ์ tick ของ 1–3 ดาว, คำสั่งที่ปลดล็อก, รางวัล, เฉลย
client/src/pages/LumiGarden.jsx     /garden (แผนที่ด่าน + ประตูฟาร์มอิสระ) และ /garden/:levelId
client/src/garden/GardenCanvas.jsx  วาดกริด + เล่น trace (1x/4x/ข้าม)
client/src/garden/useGardenRun.js   ใช้ Pyodide worker เดิม (usePyodide.js) รัน engine + โค้ดผู้เล่น
server/garden/gardenGrader.js       ห่อ engine + โค้ด → runPythonScript() ของ server/pythonRunner.js → ตัดสิน
server/garden/gardenRoutes.js       POST /api/garden/levels/:id/submit · POST /api/garden/free/sell · GET /api/garden/progress
```

**ใช้ของที่มีอยู่แล้ว**
- `runPythonScript` ใน `server/pythonRunner.js` (timeout และ memory limit)
- `usePyodide.js` ใช้รันโค้ดฝั่ง client
- `friendlyPyError` แปล error ของ Python เป็นภาษาคน
- `problemText` และ i18next สำหรับสองภาษา
- Monaco editor ตัวเดียวกับหน้าอื่น
- avatar ของ Lumi ใน `client/public/data_MiNiGame/NPC_lumi`

**การไหลของข้อมูล**
1. **รัน** เกิดใน client อย่างเดียว ได้ trace แล้วแสดงเป็นแอนิเมชัน
2. **ส่งด่าน** server ทำตามลำดับนี้
   - โหลดนิยามด่านจากดิสก์ของ server
   - ตรวจว่าปลดล็อกแล้ว
   - รัน engine เอง
   - ใน transaction เดียว: บันทึกดาวที่ดีที่สุด และจ่าย XP/ทองเฉพาะดาวที่ยังไม่เคยจ่าย ค่าเริ่มต้น: ผ่านครั้งแรก (1 ดาว) ได้ 50 XP + 20 ทอง ดาวที่ 2 และ 3 ได้ดาวละ +5 ทอง จ่ายครั้งเดียวต่อดาว (ค่าจริงอยู่ในไฟล์นิยามด่านของแต่ละด่าน)
3. server **ไม่รับ** trace, ดาว หรือคะแนนจาก client ส่วน route สำหรับขายตรวจ cooldown และเพดานรายวันใน transaction เดียวกับการจ่ายทอง

**ฐานข้อมูล** (สร้างใน `server/db.js` ตอนบูต ใช้ `?` placeholder)
- `garden_progress(user_id, level_id, best_stars, best_ticks, reward_paid_stars, updated_at)` PK (user_id, level_id)
- `garden_free_state(user_id PK, seeds, unlocks_json, daily_gold, daily_date, last_sell_at)`

**เหตุผลที่ไม่ใช้ `problems` และ `problem_modes`**
ด่านสวนตัดสินจากสถานะของสวน ไม่ได้ตัดสินจาก stdout หรือค่าที่ return จึงเข้ากับ `test_kind` สองแบบที่มีอยู่ไม่ได้
`gardenGrader.js` ตัดสินคนละเรื่องกับ `problemGrader.js` แต่ใช้ตัวรัน Python ตัวเดียวกัน
จะบันทึกเหตุผลนี้เป็น ADR ใหม่ใน `docs/adr/`

**การปลดล็อก**
- ด่าน N เปิดเมื่อผ่านบทเรียนสุดท้ายของโมดูล N (ใช้ข้อมูลความคืบหน้าบทเรียนที่มีอยู่) และผ่านด่าน N−1 แล้ว
- server ตรวจซ้ำตอนส่งด่าน

## Error handling
- **error ของ Python**: แปลด้วย `friendlyPyError` แล้วไฮไลต์บรรทัดที่ผิด
- **error ของสวน** (ชนหิน, ปลูกบนช่องที่ยังไม่ไถ, เก็บพืชที่ยังไม่โต): บันทึกลงใน trace หุ่นหยุดตรงจุดนั้น แล้ว Lumi อธิบายว่าเกิดอะไรขึ้น
- **เกินงบ tick หรือลูปไม่รู้จบ**: engine หยุดเอง และมี timeout ของ runner เป็นชั้นสำรอง แล้วแจ้งว่า "หุ่นเหนื่อยแล้ว" trace ที่ส่งกลับถูกตัดความยาว
- **server ไม่ตอบ**: แสดงผลจากการรันในเครื่อง แต่แจ้งว่ายังไม่ได้บันทึกและยังไม่ได้รับรางวัล

## การทดสอบ (`npm run test:garden` ใน `server/`)
1. เฉลยของทั้ง 9 ด่านต้องผ่านและได้ 3 ดาว ส่วนโค้ดที่ผิดโดยตั้งใจต้องไม่ผ่าน
2. trace จาก Python ของ server และจาก Pyodide (รันผ่าน node ด้วยแพ็กเกจ `pyodide` ที่ใส่เป็น devDependency) ต้องตรงกันทุกไบต์
3. ยิง endpoint จริงเพื่อพิสูจน์ว่า
   - ส่ง trace หรือดาวปลอมไม่ได้ผล
   - ส่งซ้ำไม่ได้รางวัลซ้ำ
   - ขายเกินเพดานหรือเร็วกว่า cooldown ไม่ได้
   - ส่งด่านที่ยังไม่ปลดล็อกไม่ได้
4. ทดสอบผ่าน dev server จริง (รัน, ส่งด่าน, ดูดาว, ขายในฟาร์มอิสระ) และตรวจค่าใน DB
5. รัน `npm run lint` ใน `client/`

## นอกขอบเขตของเวอร์ชันแรก
หุ่นหลายตัวในฟาร์มอิสระ, leaderboard ของสวน, ด่านที่ admin สร้างเอง, ด่านละเอียดระดับบทย่อย 24 ด่าน

## ขั้นตอนถัดไปหลังอนุมัติ
1. เขียน spec ลง `docs/superpowers/specs/2026-11-10-lumi-garden-design.md` แล้ว commit
2. ให้ผู้ใช้ตรวจ spec ที่เป็นไฟล์
3. เรียก writing-plans เพื่อทำ implementation plan
4. บันทึก `docs/handoff-to-person-1.md` และ work log ใน `project_logs/2026-11-10/`
