# Spec 0003 — Deploy แบบฟรีบน Vercel + Render + Supabase ก่อนวันที่ 25

สถานะ: `ready-for-agent`

ศัพท์ในเอกสารนี้ใช้ตาม `CONTEXT.md` (โจทย์, โหมด, ทะเบียนโหมด, คำตัดสิน, รูปโปรไฟล์, บัญชีผู้เล่น, วิธีเข้าสู่ระบบ)
ต่อยอดจาก Spec 0002 และเคารพ ADR 0001 (server เป็นผู้ตัดสินคำตัดสิน) และ ADR 0003 (Supabase Email Auth รักษาบัญชีผู้เล่นเดิม)

---

## Problem Statement

PyArena เป็นโปรเจคจบมหาวิทยาลัยที่ต้องเปิดให้คนจริงใช้งานได้ก่อนวันที่ 25 (เหลือประมาณ 9–10 วันนับจาก 2026-10-15)
และอาจไม่มีการดูแลต่อหลังส่งงาน จึงต้องใช้บริการฟรีทั้งหมด

ตอนนี้ระบบรันได้เฉพาะในเครื่องพัฒนา และมีข้อจำกัดที่ทำให้ยกขึ้นบริการฟรีตรงๆ ไม่ได้

- Express server ต้องรันค้างไว้ตลอด (Arcade match ticker, ตัวเก็บกวาดผู้เล่นค้าง) และ spawn Python เพื่อตรวจคำตอบ
  จึงย้ายไปเป็น Vercel Functions หรือ Supabase Edge Functions ไม่ได้
- รูปที่อัปโหลดเก็บบนดิสก์ของ server แต่โฮสต์ฟรีไม่มีดิสก์ถาวร รูปจะหายทุกครั้งที่ restart หรือ deploy
- ระบบส่งอีเมลในตัวของ Supabase ส่งได้เฉพาะสมาชิกทีม และจำกัดประมาณ 2 ฉบับต่อชั่วโมง
  คนนอกทีมจึงสมัครและยืนยันอีเมลไม่ได้
- ประวัติ Git ของ repository สาธารณะยังมีไฟล์สำรองฐานข้อมูล ข้อมูลบัญชี และค่าแฮชรหัสผ่าน (D01)
  ถ้าเชื่อม Vercel/Render กับ repo นี้ ข้อมูลจะถูกเผยแพร่ซ้ำ
- Supabase project ที่ใช้อยู่ปนกันระหว่าง dev ทดสอบ และข้อมูลบัญชีทดสอบ
- เทส AOE expiry ใน Arcade ยังล้ม ทำให้ชุดเทส server ไม่ผ่านครบ
- release gate เต็มรูปแบบของ D13/D14 ยังไม่เคยรันจบ และใหญ่เกินกว่าจะทำทันในเวลาที่เหลือ

## Solution

แยก deploy เป็นสามส่วนที่ฟรีทั้งหมด

- **หน้าเว็บ** — Vercel ที่โดเมน `*.vercel.app` และตั้ง rewrite ให้ `/api/*` กับ `/uploads/*` ส่งต่อไปยัง Express
  ทำให้ browser เห็นเป็น origin เดียวกัน และ cookie ของ session ทำงานแบบ first-party
- **Express** — Docker image เดิมบน Render แบบฟรีที่ region Singapore และให้ cron ภายนอกฟรี
  เรียก liveness probe ทุก 10 นาทีเพื่อไม่ให้ process หลับ
- **ฐานข้อมูล, Auth และไฟล์** — Supabase project ใหม่แบบฟรีที่ region Singapore เริ่มจากฐานว่าง
  (มีบทเรียนและคลังโจทย์จาก seed) ใช้ Brevo เป็น custom SMTP และใช้ Supabase Storage เก็บไฟล์ที่ admin อัปโหลด

ผู้เล่นจะใช้งานได้ครบทั้งบทเรียน, Competitive Arena และ Arcade บน URL สาธารณะ สมัครและยืนยันอีเมลได้จริง
และเข้าสู่ระบบด้วย Google ได้ ส่วน admin ยังเพิ่มบทเรียน ไอเทมตกแต่ง และโจทย์ใหม่ได้ต่อเนื่อง
โดยรูปที่อัปโหลดไม่หายเมื่อ server restart

ผู้เล่นจะอัปโหลดรูปโปรไฟล์เองไม่ได้อีกต่อไป แต่ยังเลือกรูปจากร้านค้า, รางวัล achievement,
รูปจาก Google หรือรูปเริ่มต้นตามระดับได้

## User Stories

### ผู้เล่น

1. As a ผู้เล่นใหม่, I want เปิดเว็บจาก URL สาธารณะได้, so that ใช้งานได้โดยไม่ต้องติดตั้งอะไร
2. As a ผู้เล่นใหม่, I want สมัครด้วยอีเมลแล้วได้อีเมลยืนยันจริงในกล่องจดหมาย, so that ยืนยันบัญชีได้ แม้ไม่ได้เป็นสมาชิกทีม
3. As a ผู้เล่น, I want ลิงก์ยืนยันอีเมลพากลับมาที่โดเมน production ไม่ใช่ localhost, so that ยืนยันเสร็จแล้วใช้งานต่อได้ทันที
4. As a ผู้เล่น, I want ขอรีเซ็ตรหัสผ่านแล้วได้อีเมลจริง, so that กู้บัญชีได้ด้วยตัวเอง
5. As a ผู้เล่น, I want เข้าสู่ระบบด้วย Google บนโดเมน production ได้, so that ไม่ต้องจำรหัสผ่านใหม่
6. As a ผู้เล่น, I want ยังอยู่ในระบบหลัง refresh หน้า, so that ไม่ต้อง login ซ้ำบ่อยๆ
7. As a ผู้เล่นที่ใช้ Safari หรือ browser ที่บล็อก third-party cookie, I want login แล้วไม่หลุด, so that ใช้งานได้เหมือนคนอื่น
8. As a ผู้เล่น, I want หน้าแรกโหลดได้ภายในเวลาที่รับได้แม้ไม่มีใครใช้มาสักพัก, so that ไม่คิดว่าเว็บล่ม
9. As a ผู้เล่น, I want เรียนบทเรียน ทำแบบทดสอบ และส่งแบบฝึกหัดแล้วได้คำตัดสินจาก server, so that ความคืบหน้าและรางวัลถูกบันทึกอย่างถูกต้อง
10. As a ผู้เล่น, I want ลองรันโค้ดในเบราว์เซอร์ได้, so that เห็นผลเร็วก่อนส่งคำตอบ
11. As a ผู้เล่น, I want ทำแบบทดสอบเลื่อนขั้นและได้เลื่อนเลเวลจริง, so that ปลดล็อกโหมดแข่งขันได้
12. As a ผู้เล่นเลเวล 10 ขึ้นไป, I want เข้า Competitive Arena รับและส่งโจทย์ได้, so that แข่งชิงรางวัลได้
13. As a ผู้เล่นเลเวล 10 ขึ้นไป, I want สร้าง เข้าร่วม และเล่นห้อง Arcade จนจบแมตช์ได้, so that เล่นโหมด Battle Royale ได้
14. As a ผู้เล่น Arcade, I want แมตช์เดินต่อแม้ server เพิ่ง restart หรือ deploy ใหม่, so that ไม่ติดค้างอยู่ในห้อง
15. As a ผู้เล่น, I want เลือกรูปโปรไฟล์จากรูปที่ซื้อ ได้จาก achievement จาก Google หรือรูปเริ่มต้นได้, so that ยังปรับแต่งอวาตาร์ได้
16. As a ผู้เล่น, I want ไม่เห็นปุ่มอัปโหลดรูปโปรไฟล์ที่กดแล้วใช้ไม่ได้, so that ไม่สับสน
17. As a ผู้เล่นที่เคยตั้งรูปที่อัปโหลดเองไว้, I want ระบบแสดงรูปเริ่มต้นแทนเมื่อรูปเดิมไม่มีแล้ว, so that ไม่เห็นรูปแตก
18. As a ผู้เล่น, I want ซื้อและใช้ธีม กรอบโปรไฟล์ และเอฟเฟกต์เมาส์ได้, so that ได้ใช้รางวัลที่สะสมมา
19. As a ผู้เล่น, I want ดู leaderboard และโปรไฟล์ของผู้เล่นอื่นได้, so that เปรียบเทียบความก้าวหน้า
20. As a ผู้เล่นบนมือถือ, I want ใช้หน้าหลักได้โดยไม่ต้องเลื่อนแนวนอน, so that ใช้งานบนโทรศัพท์ได้

### ผู้ดูแล (admin)

21. As an admin, I want เข้าสู่ระบบบน production และเห็นแดชบอร์ดผู้ดูแล, so that จัดการระบบได้
22. As an admin, I want อัปโหลดรูปประกอบบทเรียนตอนเพิ่มหรือแก้บทเรียน, so that บทเรียนมีภาพประกอบ
23. As an admin, I want อัปโหลดรูปของไอเทมตกแต่งใหม่ในหน้าจัดการธีม, so that เพิ่มรางวัลให้ผู้เล่นได้เรื่อยๆ
24. As an admin, I want รูปที่อัปโหลดยังอยู่หลัง server restart หรือ deploy ใหม่, so that บทเรียนและไอเทมไม่มีรูปแตก
25. As an admin, I want ได้ข้อความชัดเจนเมื่ออัปโหลดไม่สำเร็จ (ไฟล์ใหญ่เกิน ชนิดไม่รองรับ Storage ล่ม), so that รู้ว่าต้องแก้อะไร
26. As an admin, I want โพสต์โจทย์ Competitive ได้ตามเดิม และโจทย์ถูกเก็บถาวรในคลังโจทย์, so that โจทย์ไม่หายเมื่อ deploy ใหม่
27. As an admin, I want ไม่มีใครที่ไม่ใช่ admin อัปโหลดไฟล์เข้า Storage ได้, so that พื้นที่ฟรีไม่ถูกใช้ในทางที่ผิด

### ผู้ดูแลโปรเจค (ผู้ deploy)

28. As the maintainer, I want สำรองฐานข้อมูลของ Supabase project เดิมทั้งก้อนก่อนสร้าง project ใหม่, so that กู้ข้อมูลเดิมได้ถ้าจำเป็น
29. As the maintainer, I want เก็บไฟล์สำรองไว้นอก Git สองที่ (`_archive/` และไดรฟ์ส่วนตัวที่ไม่แชร์), so that ข้อมูลผู้ใช้ไม่หลุดและไม่หายพร้อมเครื่อง
30. As the maintainer, I want ล้างประวัติ Git และ force-push ก่อนเชื่อม Vercel/Render, so that บริการภายนอกไม่ได้รับประวัติที่มีข้อมูลบัญชี
31. As the maintainer, I want หมุน credential ทุกตัวที่เคยอยู่ในประวัติ Git, so that ค่าที่รั่วไปแล้วใช้ไม่ได้
32. As a team member, I want ได้คู่มือ clone ใหม่หลัง force-push, so that งานของฉันไม่ชนกับประวัติเก่า
33. As the maintainer, I want รายการตัวแปรแวดล้อมที่ต้องตั้งบน Vercel และ Render แยกเป็น required/optional/ห้ามตั้ง, so that ตั้งค่าครบในครั้งเดียว
34. As the maintainer, I want server ไม่ยอมบูตถ้าตั้งค่า production ผิด (URL ไม่ใช่ HTTPS, ขาดคีย์ Storage, มี secret ที่ห้ามอยู่ใน runtime), so that ไม่เปิดเว็บที่พังครึ่งๆ กลางๆ
35. As the maintainer, I want health probe ตอบได้โดยไม่ต้อง login, so that Render และ cron ภายนอกตรวจและปลุก process ได้
36. As the maintainer, I want เห็นใน log ของ Render เมื่อ migration ไม่ผ่านหรือเชื่อมฐานไม่ได้, so that แก้ได้เร็ว
37. As the maintainer, I want รายการ URL ที่ต้องใส่ใน Google Cloud Console และ Supabase Auth ให้ครบ, so that ส่งให้เจ้าของ OAuth client แก้ได้ในครั้งเดียว
38. As the maintainer, I want ชุดเทส server และ client ผ่านทั้งหมดรวมเทส AOE, so that ตัดสินใจ deploy ได้ด้วยหลักฐาน
39. As the maintainer, I want checklist release gate แบบลดขอบเขตที่บันทึกไว้ชัดว่าตัดอะไรออก, so that กรรมการและทีมรู้ว่าตรวจอะไรไปแล้วบ้าง
40. As the maintainer, I want ผลทดสอบผ่าน browser ตาม matrix ของ D14 บน Vercel + Render จริง, so that มั่นใจว่าผู้ใช้จริงจะไม่เจอบั๊กที่เทสในเครื่องจับไม่ได้
41. As the maintainer, I want ขั้นตอน rollback ไปใช้ image รุ่นก่อนหน้าบน Render, so that กู้ระบบได้ถ้า deploy ใหม่พัง
42. As the maintainer, I want ใช้แต่บริการฟรีที่ไม่ต้องจ่ายรายเดือน, so that เว็บยังเปิดอยู่ได้หลังส่งงานโดยไม่มีค่าใช้จ่าย

## Implementation Decisions

### โครงสร้างการ deploy

- Vercel build เฉพาะ client (Vite) และไม่มี serverless function ของเราเอง
- `vercel.json` rewrite `/api/*` และ `/uploads/*` ไปยัง URL ของ Render และส่งทุก path อื่นไปที่ `index.html` เพื่อให้ SPA route ทำงานเมื่อ refresh
- client ตั้ง `API_BASE` เป็นค่าว่าง (same-origin) บน Vercel ไม่ใช้ split-origin แม้ D11 จะรองรับไว้แล้วก็ตาม
- `PUBLIC_BASE_URL`, `CLIENT_URL` และ `AUTH_ALLOWED_ORIGINS` บน Render ตั้งเป็น origin ของ Vercel แบบ exact ใช้การตรวจ exact HTTPS origin ของ D09 ตามเดิม
- Express ต้องเชื่อถือ header จาก proxy ของ Vercel/Render เพื่อให้ IP ที่ใช้จำกัดความถี่การเข้าสู่ระบบและ protocol ของ cookie ถูกต้อง
- Render ใช้ Docker image จาก Dockerfile เดิม และใช้ `/api/health/ready` เป็น health check ของบริการ
- cron ฟรีภายนอกเรียก `/api/health/live` ทุก 10 นาที ซึ่งไม่แตะฐานข้อมูลและไม่ปิด traffic เมื่อล้ม
- Render และ Supabase ตั้งที่ region Singapore ทั้งคู่

### ฐานข้อมูลและ Auth

- สร้าง Supabase project ใหม่สำหรับ production และบูต migration จากฐานว่าง โดยไม่ย้ายบัญชีผู้เล่นเดิม
- ก่อนสร้าง ให้ `pg_dump` project เดิมทั้งก้อนเก็บนอก Git ตามกฎใน `_archive/README.md` แล้วเก็บอีกสำเนาในไดรฟ์ส่วนตัว
- Supabase Auth ของ project ใหม่ใช้ Brevo เป็น custom SMTP ตั้งค่าผ่านสคริปต์ D09 (`--check` → `--verify-smtp` → `--apply`) และเก็บ credential เฉพาะในไฟล์ management env ที่ไม่เข้า image
- Site URL และ redirect allowlist ของ Supabase เป็น URL ของ confirmation/recovery บนโดเมน Vercel แบบ exact
- Google OAuth client เพิ่ม authorized JavaScript origin และ redirect URI ของโดเมน Vercel โดยเจ้าของ OAuth client

### การอัปโหลดไฟล์

- เพิ่มโมดูลเก็บไฟล์หนึ่งตัวที่มี interface แคบ คือ "เก็บไฟล์นี้ แล้วคืน URL สาธารณะ" ทุกจุดที่ admin อัปโหลดต้องเรียกผ่านโมดูลนี้ ไม่เขียนลงดิสก์ตรงๆ
- บน production โมดูลนี้ใช้ Supabase Storage bucket สาธารณะแบบอ่านอย่างเดียว เขียนได้เฉพาะ server ด้วย secret key ส่วนในเทสใช้ตัวปลอมที่อยู่ในหน่วยความจำ
- route อัปโหลดของ admin (รูปบทเรียนและรูปไอเทมตกแต่ง) ยังต้องผ่านการเช็คสิทธิ์ admin จาก principal (D08) เหมือนเดิม จำกัดชนิดและขนาดไฟล์เท่าเดิม และคืน URL ของ Storage ซึ่งบันทึกลง `asset_url` หรือเนื้อหาบทเรียนตามเดิม
- ถ้า Storage ล่ม route ต้องตอบ error ที่ชัดเจน และไม่บันทึกแถวที่ชี้ไปยังไฟล์ที่ไม่มีอยู่จริง
- รูปใน `seed-assets` (ธีม กรอบ อวาตาร์จากร้านและ achievement รูปเริ่มต้นตามระดับ) ยังเสิร์ฟจาก image ผ่าน `/uploads` ตามเดิม และไม่ย้ายไป Storage
- ตัดการอัปโหลดรูปโปรไฟล์ของผู้เล่น: route อัปโหลดอวาตาร์ตอบว่าไม่รองรับแล้ว (410) และ client เอาปุ่มอัปโหลดออก ส่วน route reset/select อวาตาร์ยังทำงาน
- `resolveAvatar()` ฝั่ง server ยังเป็นที่เดียวที่ตัดสินรูปที่แสดง ถ้า `avatar_source` เป็นการอัปโหลดเอง ให้คืนรูปเริ่มต้นตามระดับแทน
- อภิธานศัพท์ "รูปโปรไฟล์" จะเหลือ 4 แหล่ง ต้องแก้ `CONTEXT.md` ในงานเดียวกัน

### การตั้งค่าและการเริ่มทำงาน

- ตัวตรวจ runtime environment ของ production ต้องเพิ่มค่าของ Storage (URL ของ bucket) เป็นค่าที่ต้องมี และยังห้ามมี management token กับ SMTP password ใน runtime ตามเดิม
- เพิ่ม manifest ของตัวแปรแวดล้อมสำหรับ Vercel และ Render (required / optional / ห้ามตั้ง) ใน `docs/deploy.md` ให้ตรงกับตัวตรวจ

### คุณภาพและ release gate

- แก้เทส AOE expiry ให้ผ่านอย่างเสถียร โดยแก้ที่สาเหตุเรื่องเวลา `serverNow` ไม่ใช่การผ่อน assertion
- release gate แบบลดขอบเขต ประกอบด้วย:
  - เทส server/client/security และ lint ผ่านทั้งหมด
  - build Docker image ผ่าน
  - บูตกับฐานว่างได้
  - restart แล้ว Arcade ยังทำงาน
  - ทดสอบผ่าน browser ตาม matrix ของ D14 บน Vercel + Render จริง

  ส่วนที่ตัดออก (เช่น release workflow บน GitHub Actions แบบเต็ม หรือ Supabase project สำหรับทดสอบแยก) ให้บันทึกไว้ใน `docs/release-handoff.md`

### ลำดับงาน (ข้อ 1–6 คือขั้นต่ำที่ต้องมีจึงจะเปิดใช้ได้)

1. ล้างประวัติ Git (D01) และ force-push ภายใน 2 วัน หลังรวมงานที่ยังไม่ได้ push ของทุกคนแล้ว จากนั้นหมุน credential
2. สำรองฐานเดิมแล้วสร้าง Supabase project ใหม่
3. ตั้งค่า Render, Vercel, Brevo, Google OAuth และ cron ping
4. แก้เทส AOE
5. ทำโมดูลเก็บไฟล์ + Supabase Storage สำหรับ admin และตัดการอัปโหลดรูปโปรไฟล์ของผู้เล่น
6. รัน release gate แบบลดขอบเขตและทดสอบผ่าน browser บน production

## Testing Decisions

- เทสที่ดีตรวจพฤติกรรมที่มองเห็นจากภายนอกเท่านั้น คือ HTTP status, body และสิ่งที่ผู้ใช้เห็น ไม่ตรวจว่าเรียกฟังก์ชันภายในอะไรบ้าง
- **seam 1: HTTP ของแอปจริงจาก `server.js`** โหลด `app` ที่ประกอบจริงแล้วยิงคำขอ ไม่ประกอบแอปขึ้นเองในเทส เพราะบั๊ก health 401 กับ Arcade 503 เกิดจากลำดับการประกอบจริงที่เทสแบบประกอบเองมองไม่เห็น ครอบคลุม:
  - admin อัปโหลดสำเร็จแล้วได้ URL ของ Storage และแถวที่บันทึกชี้ไปยัง URL นั้น
  - ผู้เล่นทั่วไปอัปโหลดผ่าน route ของ admin ได้ 403
  - ไม่ login ได้ 401
  - ไฟล์ผิดชนิดหรือใหญ่เกินถูกปฏิเสธ
  - Storage ล่มได้ error และไม่มีแถวค้าง
  - route อัปโหลดรูปโปรไฟล์ของผู้เล่นตอบ 410
  - ผู้เล่นที่ `avatar_source` เป็นการอัปโหลดเองได้รูปเริ่มต้นตามระดับ
  - ตัวตรวจ environment ของ production ปฏิเสธเมื่อขาดค่าของ Storage
  - liveness ตอบ 200 โดยไม่แตะฐานข้อมูล
- **seam 2: โมดูลเก็บไฟล์** ในเทสใช้ตัวปลอมที่อยู่ในหน่วยความจำ ซึ่งจำลองได้ทั้งสำเร็จและล้ม บน production ใช้ Supabase Storage และมีการตรวจจริงหนึ่งครั้งใน smoke test
- **seam 3: smoke test ผ่าน browser ตาม matrix ของ D14** บน Vercel + Render จริง ครอบคลุม:
  - สมัคร → อีเมลจาก Brevo ถึงกล่องจดหมายภายนอก → ยืนยันแล้วกลับมาโดเมน production
  - รีเซ็ตรหัสผ่าน, Google login, logout, refresh
  - Safari หรือ browser ที่บล็อก third-party cookie
  - บทเรียน, แบบฝึกหัด, สอบเลื่อนขั้น, Competitive และแมตช์ Arcade จนจบ
  - Arcade หลัง Render restart
  - admin อัปโหลดรูปแล้ว redeploy รูปยังอยู่
  - viewport มือถือ
  - ปลุก process หลังหลับ
- prior art:
  - `server/tests/health-routes.test.js` (โหลด `server.js` จริงแล้วยิง HTTP)
  - `server/tests/arcade-restart-readiness.test.js` กับ `tests/helpers/arcade-boot.js` (บูตสองรอบกับฐานเดิม)
  - `server/tests/promotion-exam-http.test.js`
  - `server/tests/production-environment.test.js` (ตัวตรวจ environment)
  - `scripts/security/*.test.mjs` (ตัวสแกน image และ repository)
- เทสที่ต้องใช้ฐานข้อมูลใช้ PostgreSQL ที่ทิ้งได้ผ่าน `TEST_DATABASE_URL` ห้ามชี้ไป Supabase production

## Out of Scope

- การนำโจทย์ Competitive ไปลงทะเบียนใช้ในบทเรียนหรือ Arcade (ทะเบียนโหมดข้ามโหมด) ทำหลัง deploy ถ้าจำเป็นต้องมีในวันสอบ ให้ทำแค่ปุ่มติ๊กของ admin ที่รับเฉพาะโจทย์ที่เฉลยผ่านเทสของตัวเอง
- AI สร้างโจทย์ Competitive รายวัน เป็นงานของ Person 2 ทำแบบ admin กดสร้างร่างแล้วตรวจก่อนโพสต์ ใช้ `callAiChat()` และต้องรันเฉลยผ่านเทสของตัวเองก่อนโพสต์
- การย้ายบัญชีผู้เล่นเดิมไป project ใหม่
- โดเมนของตัวเอง, DNS และ TLS ที่ไม่ใช่ของ `*.vercel.app`
- ระบบ monitoring/alert แบบเต็ม และการสำรองฐานอัตโนมัติ (Supabase แผนฟรีไม่มี) ใช้การ `pg_dump` ด้วยมือก่อนวันสอบแทน
- release workflow บน GitHub Actions แบบเต็มและ Supabase project สำหรับทดสอบแยก
- บริการที่ต้องจ่ายเงิน (Railway, Render แบบเสียเงิน, Supabase Pro)

## Further Notes

- Render แบบฟรีหลับเมื่อไม่มีคนใช้ 15 นาที ปลุกครั้งแรกใช้เวลาประมาณ 30–60 วินาที cron ping ช่วยได้ แต่ชั่วโมงใช้งานฟรีของ Render มีโควตารายเดือน ต้องเช็คว่าพอเมื่อเปิดค้างไว้ตลอดเดือน
- แรมของ Render ฟรีมีจำกัด การ spawn Python พร้อมกันหลายครั้งในแมตช์ Arcade อาจทำให้ process ถูก kill ต้องดูใน smoke test
- Supabase แผนฟรีจะ pause project เมื่อไม่มีการใช้งาน 7 วัน cron ping ที่ไปถึงฐานผ่าน readiness ช่วยได้ หรือต้องเข้าไป resume เองหลังส่งงาน
- ข้อ 1 (ล้างประวัติ Git) ต้องประสาน Person 1 และ 2 และทำก่อนเชื่อม Vercel/Render กับ repo
- ADR ที่ควรเขียนคู่กับ spec นี้: "หน้าเว็บบน Vercel + Express บน Render + Supabase" เพราะคนที่มาอ่านทีหลังจะสงสัยว่าทำไมไม่ใช้ Vercel ทั้งหมด
