# Google login ผ่าน Supabase Auth (ADR 0004)

**วันที่:** 2026-10-16 20:10 (Asia/Bangkok)

## เหตุผล

ผู้ใช้ต้องการให้ทั้งการเข้าสู่ระบบด้วยอีเมลและด้วย Google ผ่าน Supabase Auth ทางเดียว ซึ่งแผนฟรีรองรับ 50,000 MAU
ก่อนหน้านี้อีเมลใช้ Supabase อยู่แล้ว (ADR 0003) แต่ Google ยังใช้ระบบของ server เอง:
Google Identity Services → `POST /api/auth/google` → ตรวจ token ด้วย `google-auth-library` → cookie `pyarena_google_session`

## สิ่งที่แก้

### Server
- `server/auth/index.js`
  - เพิ่ม `POST /api/auth/oauth/complete` ผูกบัญชี Supabase Auth ที่มี Google identity กับบัญชีผู้เล่น
    - ผูกกับผู้เล่นคนเดียวที่อีเมล (ที่ Google ยืนยันแล้ว) ตรงกัน หรือสร้างผู้เล่นใหม่ที่เลเวล 0 ชื่อไม่ซ้ำ
    - ปฏิเสธเมื่ออีเมลซ้ำหลายบัญชี หรือผู้เล่นคนนั้นผูกกับบัญชี Auth อื่นแล้ว
    - ทำใน transaction เดียว พร้อม advisory lock ต่ออีเมล เรียกซ้ำหรือเรียกพร้อมกันก็ไม่สร้างบัญชีซ้ำ
  - `authenticate()` เหลือเส้นทางเดียวคือ bearer token ของ Supabase เอาการอ่าน cookie Google ออก
    `sign-out` ยังล้าง cookie เดิมให้
- `server/server.js`
  - ลบ `POST /api/auth/google` และ `google-auth-library` แล้ว
  - `/api/config/google` ถาม `/auth/v1/settings` ของ Supabase ว่าเปิด Google provider หรือไม่ (cache ไว้ 5 นาที)
  - callback `onOAuthSignIn` เก็บรูปจาก Google ตามกฎเดิมของ ADR 0002
- `server/auth/productionSettings.js` และ `scripts/configure-supabase-auth.js`
  - ถ้าตั้ง `AUTH_GOOGLE_CLIENT_ID` + `AUTH_GOOGLE_CLIENT_SECRET` (management env) จะเปิด Google provider
  - redirect allowlist เพิ่ม `/login?auth=google` แบบ exact
- `server/runtime/environment.js` — ห้ามมี `AUTH_GOOGLE_CLIENT_SECRET` ใน runtime
- ลบ `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` ออกจาก `.env.example`, `Dockerfile` และ `docker-compose.yml`

### Client
- `client/src/auth/session.js`
  - เพิ่ม `startGoogleSignIn()` (redirect ด้วย `signInWithOAuth`)
  - เพิ่ม `restoreOAuthReturn()` นำ `returnTo` ที่เก็บใน sessionStorage กลับเข้า URL
  - เพิ่ม `completeOAuthSignIn()` ถ้าถูกปฏิเสธจะ sign out Supabase บนเครื่องด้วย ไม่ค้างครึ่งๆ
  - ลบ `acceptGoogleSession` แล้ว
- `client/src/pages/FriendLogin.jsx` — ใช้ flow ใหม่ ปุ่ม Google แสดงตามค่าที่ Supabase รายงาน
- `client/src/main.jsx` เรียก `restoreOAuthReturn()` ก่อน render
- `client/index.html` เอา script ของ GIS ออก

### เอกสาร
- ADR 0004
- `docs/deploy.md` (ขั้นตอนตั้ง Google provider)
- Spec 0003 (หมายเหตุที่เปลี่ยน)
- `docs/handoff-to-person-1.md` และ `docs/handoff-to-person-2-google-avatar.md`

## ผลตรวจ

- เทสใหม่ `server/tests/oauth-sign-in.test.js` ใช้ PostgreSQL จริงกับ Supabase admin client ปลอม ได้ 8/8 ผ่านสามรอบติด
  ครอบคลุม: ผูกตามอีเมล, เรียกพร้อมกัน, สร้างบัญชีใหม่, อีเมลซ้ำ, ผูกกับบัญชีอื่นแล้ว, token ไม่ถูกต้อง/ยังไม่ยืนยัน/ไม่ใช่ Google, บัญชีถูกระงับ
- server `npm test`: pretest 29/29 และชุดหลัก 150/150 บน PostgreSQL ชั่วคราว
  เทสที่เคยใช้ cookie Google (auth, admin-principal, arcade restart) ย้ายมาใช้ bearer แล้ว
- server `npm run lint`: 0 error (warning 30 เท่าเพดานเดิม) และ `npm run check:undef` ผ่าน
- client `npm test` 38/38 (เพิ่ม 3 เทสของ flow Google), `npm run lint` 0 error และ `npm run build` ผ่าน
- เทส security 20/20
- browser บน localhost:5174 (backend :3001 ยังเป็นโค้ดเก่า):
  - กดปุ่ม Google แล้ว client ใหม่ redirect ผ่าน Supabase ไปถึง Google ได้
  - แต่ Google ตอบ **Error 401 invalid_client** เพราะ Google provider ใน Supabase project นี้เปิดอยู่แล้ว
    แต่ตั้ง Client ID เป็น `Python.Game` ซึ่งไม่ใช่ OAuth Client ID จริง

## ยังต้องทำ

1. เจ้าของ OAuth client ใน Google Cloud Console:
   - ใช้ client ชนิด Web application
   - redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback`
   - ส่ง Client ID (ลงท้าย `.apps.googleusercontent.com`) และ Client secret มาให้
2. ใส่ค่าใน `server/.supabase-management.env` แล้วรัน `configure-supabase-auth.js --apply`
   หรือแก้ใน Supabase Dashboard → Authentication → Providers → Google
3. restart backend ที่ :3001 แล้วทดสอบ login ด้วย Google จริง (ผู้ใช้กดเอง) กับบัญชี 128/141 ที่เคยเข้าด้วย Google
4. ภายหลัง ลบตาราง `player_google_sessions` ด้วย migration ใหม่

## ผลทดสอบจริงหลังตั้งค่า Google provider (2026-10-16 ช่วงค่ำ)

ผู้ใช้แก้ค่าใน Supabase แล้ว: Client ID/secret ชนิด Web จริง, redirect URI ของ Supabase callback และ redirect URL `http://localhost:5174/login?auth=google`

- restart backend :3001 ด้วยโค้ดใหม่ ได้ผลดังนี้
  - `/api/health/live` → 200 `alive`
  - `/api/health/ready` → 200 `ready` ไม่ต้อง login (ยืนยันการแก้ health route บน server จริงด้วย)
  - `/api/config/google` → `{"enabled":true}`
- กดปุ่ม Google แล้วถึงหน้า "Sign in with Google" จริง (redirect_uri = Supabase callback, redirect_to = `/login?auth=google`)
- ผู้ใช้กรอกบัญชี Google เอง ผลบนฐานจริง (อ่านอย่างเดียว):
  - บัญชี Google ที่อีเมลตรงกับ pong: Supabase เชื่อม Google เข้ากับบัญชี Auth เดิมเอง (providers `email`, `google`) จึงเข้าผู้เล่น **142** เดิมทันที
  - บัญชี Google อีกบัญชีที่ไม่มีผู้เล่นมาก่อน: ได้ผู้เล่นใหม่ **144** พร้อมแถวใน `player_auth_identities`
- จำลองการกลับจาก Google พร้อม `returnTo=/leaderboard` ที่เก็บไว้ ได้ไปที่ `/leaderboard` ถูกต้อง
- refresh แล้วยังอยู่ในระบบ (`/api/auth/me` 200) กด logout แล้วกลับไป `/login?returnTo=...`, `/api/auth/me` 401 และ session ของ Supabase ใน localStorage ถูกลบ

## ข้อสังเกตเพิ่ม

- หลัง login ด้วย Google หน้า `/learn` ยิง `course-content` สลับกับ `auth/me` ราว 15 คู่ติดกันแล้วหยุดเอง 10 วินาทีต่อมาไม่มีคำขอใหม่
  น่าจะมาจาก event ของ Supabase (`SIGNED_IN`/`TOKEN_REFRESHED`) ที่ทำให้โปรไฟล์ถูกโหลดซ้ำ ไม่วนต่อเนื่อง แต่ควรลดเป็นงานแยก
