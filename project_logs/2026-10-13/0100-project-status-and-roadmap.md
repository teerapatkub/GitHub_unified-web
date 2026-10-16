# สถานะโครงการ PyArena และแผนก่อน Deploy

**อัปเดต:** 2026-10-13 01:00 (Asia/Bangkok)  
**สาขา:** `main`  
**เอกสารหลัก:** `specs/0001-one-verdict-and-deploy-readiness.md` และ `specs/0002-production-security-and-deploy-gate.md`

## ภาพรวม

PyArena มีสามโหมดหลัก ได้แก่บทเรียน, Competitive Arena และ Arcade โดยระบบคำตัดสินและ Arcade
ถูกย้ายมาให้ server เป็นเจ้าของข้อมูลสำคัญแล้ว ระบบ Supabase Email Auth ถูกเชื่อมกับบัญชีผู้เล่นเดิม
และงาน hardening สำหรับ production ส่วนใหญ่ของ D01-D08 เสร็จในโค้ด local แล้ว

โครงการยังไม่พร้อม deploy ให้ผู้ใช้ทั่วไปทันที เพราะยังมีงานปฏิบัติการด้าน incident response,
SMTP และ URL ของ production, dependency audit, regression ของ Arcade/rematch, route guard/API client
และ release gate บน production image ที่ต้องปิดให้ครบก่อน

สถานะ Git ปัจจุบันมี commit ใน `main` มากกว่า `origin/main` จำนวน 11 commit และมีไฟล์แก้ไขที่ยังไม่
commit อีกหนึ่งชุด จึงต้องรักษางาน local ชุดนี้ไว้ก่อน pull, rebase, rewrite history หรือ force-push

## ความคืบหน้าที่เสร็จแล้ว

### ระบบหลักและ Arcade

- รวม UI ของทั้งสามโหมดให้เป็นแบรนด์ PyArena และใช้ navigation ร่วมกัน โดยยังรักษาบรรยากาศของแต่ละโหมด
- เพิ่ม profile, leaderboard, ร้านค้า, ของตกแต่ง และการดู profile ของผู้เล่นอื่นจาก leaderboard
- ย้ายการตรวจคำตอบและคะแนนสำคัญไปฝั่ง server; Arcade รับโค้ดและใช้เวลา/คะแนนจาก server
- ทำ Arcade server-authoritative ครบชุด A01-A13 รวม room, match, submission, settlement, reward,
  shop, item, attack, bot, reconnect, rematch และ acceptance coverage
- แก้บั๊ก UI/Auth หลายจุด เช่นการโหลดข้อมูลถี่, ข้อความหน้า login, ร้านไอเทม, bot item flow,
  leaderboard เมื่อไม่ล็อกอิน และการคงสถานะหลัง refresh
- milestone สำคัญอยู่ใน commit `7045d70`, `7f95dbc` และ `159adf9`

### Supabase Authentication

- รองรับสมัคร, ยืนยันอีเมล, login ด้วยอีเมลหรือชื่อผู้ใช้, logout และ recovery โดยคงบัญชีผู้เล่นเดิม
- คง Google login เดิมและแปลงทั้ง Email/Google เป็น principal รูปแบบเดียวกันบน server
- D07: provisioning และ legacy linking มี durable ledger, compensation และ reconciliation ที่ retry ได้
  โดยไม่สร้างบัญชีซ้ำหรือลบบัญชี Auth ที่เชื่อมสำเร็จแล้ว
- D08: สิทธิ์ admin อ่านจาก principal และ role ปัจจุบันในฐานข้อมูล ไม่ใช้ `admin_token` รุ่นเดิม
- commit ที่เกี่ยวข้องคือ `fa02e73`, `6fbe99c`, `1ef2d3f` และ `ae32c0c`

### ความปลอดภัยและ production runtime

- D01-D02: ลบ database backup ที่มีข้อมูลบัญชีออกจาก working tree, เพิ่ม ignore rules,
  repository/history scanner, production-image scanner และ GitHub Actions security gates
- เตรียม sanitized repository mirror ในเครื่องและตรวจว่า secret/history scan ผ่าน
- D03: ใช้ migration แบบมีเวอร์ชัน, checksum, advisory lock และ fail-closed startup
- D04: production image รับ browser config ผ่าน build args, ตรวจ runtime environment, รันด้วย non-root,
  ใช้ persistent uploads volume และมี health check
- D05: ปิด Supabase Data API สำหรับข้อมูลเกมด้วย grants/RLS/security-invoker migration และ acceptance test
- production build และ PostgreSQL migration integration เคยผ่านในการตรวจ D03-D08
- commit ที่เกี่ยวข้องคือ `d0059f7`, `c47c59d`, `ef8fb6c`, `c56a0d1`, `6fbb8b3` และ `c3b81b7`

## งานที่กำลังทำและยังไม่ commit

ไฟล์ที่แก้ค้างแบ่งได้เป็นสามกลุ่ม:

1. **Logout และ route guard**
   - ทำให้ logout ล้าง session/cache แม้ API หรือ Supabase ฝั่งใดฝั่งหนึ่งล้มเหลว
   - จด provider ที่ revoke ไม่สำเร็จไว้ retry และไม่ให้หน้าเว็บคืนบัญชีเดิมขึ้นมา
   - ให้ admin navbar ใช้ logout flow กลาง
   - ป้องกัน `/leaderboard` ด้วย Auth guard เดียวกับหน้าสำหรับผู้เล่น
   - เพิ่ม `client/src/auth/session.test.mjs` และ script `client npm test`

2. **Arcade rematch roster**
   - แยกผู้เล่นที่เลือกอยู่ต่อออกจากประวัติผู้เข้าร่วมแมตช์เดิม
   - ผู้เล่นมนุษย์ที่ไม่เลือกอยู่ต่อไม่ถูกดึงกลับเข้า rematch
   - host ต้องเลือกอยู่ต่อก่อนเริ่ม rematch และ participant ที่ออกถูกลบก่อนเริ่มแมตช์ใหม่
   - เพิ่ม `server/tests/rematch-roster.test.js` และ regression ใน `arcade-membership.test.js`

3. **Auth startup regression test**
   - เพิ่ม test ว่า Auth schema รอ core database bootstrap ก่อนเริ่มทำงาน

หลักฐานล่าสุดของงานค้าง:

- `client npm test` ผ่าน 8/8 เมื่อ 2026-10-13
- `node --test tests/rematch-roster.test.js` ผ่าน 2/2 เมื่อ 2026-10-13
- ยังต้องรัน integration suite กับ PostgreSQL และ browser flow จริงก่อนถือว่างานชุดนี้เสร็จ

## งานที่ยังไม่เสร็จหรือยังไม่มีหลักฐานปิด

### D01-D02 — งานปฏิบัติการหลังข้อมูลเคยอยู่ใน Git history

ตัวป้องกันใน repository เสร็จแล้ว แต่ incident response ยังต้องทำโดยผู้ดูแลโครงการ:

- หมุน credential ที่ได้รับผลกระทบและพิจารณาบังคับ reset รหัสผ่านผู้ใช้ที่เกี่ยวข้อง
- ตรวจ audit log และลบ artifact/cache/fork ที่ยังอาจมีประวัติเก่า
- ประสานสมาชิกทุกคนก่อน publish sanitized history
- force-push ประวัติที่เขียนใหม่ และให้ทุกคน clone ใหม่หรือ reset ตามคู่มือ

งานนี้เป็น release blocker เพราะ remote ปัจจุบันยังไม่ได้รับ sanitized history ที่เตรียมไว้ในเครื่อง

### D06 — API secrecy และ server-owned authorization

ไม่พบเอกสารปิด ticket D06 แยกต่างหาก จึงต้องตรวจจาก production API จริงอีกครั้งว่า:

- endpoint ของบทเรียน, Competitive และ Arcade ไม่ส่งเฉลย, test oracle หรือข้อมูลสร้างเฉลยให้ browser
- middleware Auth ทำงานก่อน router ที่อ่านหรือแก้ข้อมูลผู้เล่น/ผู้ดูแล
- client ส่งเฉพาะคำตอบหรือโค้ด และ server เป็นผู้ตัดสินผลกับรางวัล
- response และ log ไม่เปิดเผย secret หรือข้อมูลบัญชีเกินจำเป็น

### D09 — SMTP และ production Auth URLs

- ตั้ง custom SMTP ที่ยืนยัน sender แล้วและส่งถึงผู้ใช้นอกทีม Supabase ได้
- กำหนด production Site URL, redirect allowlist, `PUBLIC_BASE_URL`, `CLIENT_URL` และ CORS แบบ exact
- ทดสอบ signup confirmation และ password recovery จาก mailbox ภายนอก
- ยืนยันว่า confirmation/recovery link ใช้ได้ตามอายุและกลับโดเมนจริง ไม่กลับ localhost
- เก็บ `SUPABASE_ACCESS_TOKEN` เฉพาะ management/setup context และไม่ใส่ runtime หรือ image

งานนี้ต้องรอโดเมน/URL เป้าหมายและ SMTP credential ที่จะใช้จริง

### D10-D11 — Arcade rematch, Auth guard และ API client

- ทำงานค้างที่ระบุในหัวข้อก่อนหน้าให้ผ่าน integration suite และ browser test
- ทดสอบห้องสองคน: หนึ่งคนอยู่ต่อ หนึ่งคนออก ผู้เล่นใหม่เข้าห้องและเริ่ม rematch ได้
- ทดสอบ retry ของ remain/leave/start, host transfer, capacity และ refresh ทุกช่วง
- ใช้ Auth guard กลางกับทุก protected route โดยรอ Auth initialization และรักษา destination หลัง login
- ให้ leaderboard และหน้าอื่นใช้ API client กลาง รองรับ same-origin/split-origin
- แยก UI ระหว่าง 401, 500, network error และรายการว่าง

### D12 — Dependency และ clean-checkout quality gates

- รัน production dependency audit ทั้ง client/server
- อัปเดตช่องโหว่ระดับ high/critical หรือบันทึก exception ที่มีเจ้าของ, mitigation และวันหมดอายุ
- ใช้ lockfile และ deterministic install ใน CI/image
- ทำให้ lint ของ application source ผ่าน โดย exclude เฉพาะ generated/vendor artifact ที่เหมาะสม
- แก้ warning ที่มีผลต่อ release เช่น bundle ขนาดใหญ่หรือ `eval` หากยังอยู่ใน production path

### D13 — Release acceptance และหลักฐาน Deploy

- รัน secret/history scan, dependency audit, lint, client/server tests และ migration tests จาก clean checkout
- build production image แล้วตรวจ filesystem, environment, non-root user และ persistent uploads
- start container กับฐานข้อมูลใหม่และทดสอบ liveness/readiness รวม failure ของ DB/migration
- ทำ browser smoke test บน production build ครบ Email Auth, Google, logout, recovery, admin,
  บทเรียน, Competitive, Arcade, profile และ leaderboard
- ทดสอบ refresh และ viewport มือถือ รวม Arcade rematch และ network interruption
- เก็บ release evidence ที่ผูกกับ commit, image digest, migration version และ environment class เดียวกัน

## ปัญหาและข้อจำกัดที่ทราบ

- full server suite ล่าสุดที่บันทึกหลัง D07-D08 ผ่าน 120/126; 6 failure อยู่ใน Arcade/rematch work
  ที่แยกจาก D07-D08 ได้แก่ AOE expiry timing, remain/rematch, stale worker snapshot และ shop inventory
- งาน rematch บางส่วนถูกแก้ใน working tree แล้ว แต่ยังไม่มีผล full integration suite รอบใหม่
- client production build เคยผ่าน แต่มี warning เดิมเรื่อง Browserslist, `eval` ใน `MiNi_Game.jsx`
  และ bundle chunk ขนาดใหญ่
- production SMTP, domain, DNS, TLS, backup, monitoring และ rollback ยังไม่มีหลักฐานใช้งานจริง
- `main` local นำ `origin/main` อยู่ 11 commit และยังมี uncommitted changes; ยังไม่ควร deploy จาก remote เดิม

## แผนดำเนินงานตามลำดับ

### ระยะ 1 — ปิดงานใน working tree

1. รัน server integration suite กับ PostgreSQL ทดสอบสำหรับ logout, Auth bootstrap และ rematch
2. แก้ regression ที่ยังเหลือ โดยรักษาผลแมตช์เก่าและไม่ยืดอายุ effect หลัง refresh
3. ทดสอบ UI จริง: logout จาก Email/Google/admin, เปิด protected route โดยไม่ login, leaderboard error states,
   remain/leave/rematch และ refresh บนจอแคบ
4. review diff แล้ว commit งาน Auth/route กับ Arcade/rematch เป็น commit ที่แยกขอบเขตชัดเจน

### ระยะ 2 — ปิด security และ Auth production blockers

1. ตรวจและปิด D06 API secrecy ทุกโหมด
2. เลือก production domain/preview URLs และตั้งค่า Supabase redirect/CORS
3. ตั้ง custom SMTP และทดสอบ confirmation/recovery ด้วย mailbox ภายนอก
4. หมุน credential, จัดการผู้ใช้ที่ได้รับผลกระทบ และ publish sanitized Git history หลังประสานทีม

### ระยะ 3 — ทำ release candidate

1. ปิด dependency audit/lint และสร้าง clean checkout จาก sanitized remote
2. build image เดียวที่จะ deploy พร้อมค่าฝั่ง browser ที่ถูกต้อง
3. รัน migration, startup, health, persistence และ security acceptance กับ environment ที่ทิ้งได้
4. รัน browser smoke test ครบสามโหมดบน production image
5. สร้าง release evidence และให้ผลทุก gate เป็นสีเขียวบน commit/image เดียวกัน

### ระยะ 4 — วางแผนและดำเนินการ Deploy

1. เลือก hosting และรูปแบบเชื่อม PostgreSQL/Supabase ให้เหมาะกับ runtime
2. กำหนด domain, DNS, TLS, secrets, persistent storage และ backup/restore
3. กำหนด monitoring, alert, log retention และ owner เมื่อระบบมีปัญหา
4. ทดสอบ rollback ด้วย image รุ่นก่อนและฐานข้อมูลที่เข้ากันได้
5. กำหนดวัน cutover, ผู้รับผิดชอบ และ checklist หลังเปิดใช้งาน

## เกณฑ์ที่ถือว่าพร้อม Deploy

โครงการพร้อม deploy เมื่อครบทุกข้อ:

- remote history ไม่มีข้อมูลบัญชี, backup หรือ secret ที่ห้ามเก็บ และ credential ที่เกี่ยวข้องถูกหมุนแล้ว
- working tree สะอาดและ release commit อยู่บน remote ที่ทีมใช้งานร่วมกัน
- custom SMTP กับ production redirect URLs ผ่านการทดสอบจริง
- server/client tests, lint, migration, security scan และ dependency audit ผ่านตาม policy
- production image เดียวกันผ่าน startup, readiness, persistence และ browser smoke test ครบสามโหมด
- ไม่มี known P1/P2 ที่กระทบ Auth, สิทธิ์, ข้อมูลเกม, คะแนน, rematch หรือการกู้ระบบ
- มีหลักฐาน backup/restore, monitoring และ rollback พร้อมก่อน cutover

## เอกสารอ้างอิงใน repository

- `specs/0001-one-verdict-and-deploy-readiness.md` — สถาปัตยกรรมคำตัดสินและความพร้อมพื้นฐาน
- `specs/0002-production-security-and-deploy-gate.md` — ขอบเขต security/release gate ปัจจุบัน
- `docs/deploy.md` — ตัวแปรและขั้นตอน production runtime
- `project_logs/2026-10-11/2235-d01-d02-repository-security.md` — D01-D02
- `project_logs/2026-10-12/1309-d03-versioned-migrations-fail-closed-startup.md` — D03
- `project_logs/2026-10-12/1823-d04-production-image-configuration.md` — D04
- `project_logs/2026-10-12/1830-d05-supabase-data-api-security.md` — D05
- `project_logs/2026-10-13/0002-d07-d08-complete.md` — D07-D08

## วิธีอัปเดตเอกสารนี้

หลังจบ ticket ให้ย้ายรายการจาก “งานที่กำลังทำ/ยังไม่เสร็จ” ไปยัง “ความคืบหน้าที่เสร็จแล้ว”
พร้อมระบุ commit และผลตรวจที่รันจริง หากผลตรวจเป็นข้อมูลจากรอบก่อนให้ระบุว่าเป็นผลล่าสุดที่บันทึกไว้
อย่าเปลี่ยนสถานะเป็นเสร็จจาก targeted unit test เพียงอย่างเดียวเมื่อ acceptance criteria ต้องใช้ PostgreSQL,
Supabase, production image หรือ browser flow จริง

## Git snapshot ตอนจัดทำเอกสาร

ไฟล์ tracked ที่แก้แต่ยังไม่ commit:

- `client/package.json`
- `client/src/App.jsx`
- `client/src/admin/components/AdminNavbar.jsx`
- `client/src/auth/session.js`
- `server/arcade/match-api.js`
- `server/arcade/room-membership.js`
- `server/package.json`
- `server/tests/arcade-membership.test.js`
- `server/tests/auth.test.js`

ไฟล์ใหม่ที่ยังไม่ถูกติดตามก่อนสร้างเอกสารนี้:

- `client/src/auth/session.test.mjs`
- `server/tests/rematch-roster.test.js`
- `specs/0002-production-security-and-deploy-gate.md`

ใช้รายการนี้เป็นจุดอ้างอิงก่อนทำคำสั่ง Git ที่เปลี่ยนประวัติหรือดึงงานจาก remote
