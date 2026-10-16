# ไม่โหลดผู้เล่นซ้ำทุกครั้งที่กลับมาที่แท็บ

**วันที่:** 2026-10-16 21:30 (Asia/Bangkok)

## อาการ

หลัง login ด้วย Google หน้า `/learn` ยิง `/api/auth/me` สลับกับ `/api/course-content` ราว 15 คู่แล้วหยุดเอง
(ดู `2010-google-sign-in-through-supabase.md`)

## สาเหตุ (ยืนยันจากซอร์สและ browser)

- `@supabase/auth-js` 2.116: ทุกครั้งที่หน้ากลับมาแสดง (`_onVisibilityChanged` → `_recoverAndRefresh`)
  จะส่ง `SIGNED_IN` ใหม่ แม้ยังเป็นผู้ใช้คนเดิม และส่ง `TOKEN_REFRESHED` ทุกชั่วโมง
- `client/src/auth/session.js` แปลงทุก event (ยกเว้น `INITIAL_SESSION`) เป็น `pyarena:session-changed`
  App จึงยิง `/api/auth/me` ใหม่ทุกครั้ง
- `LearningPage.jsx` โหลด `course-content` ใหม่ตอน `visibilitychange`/`focus` อยู่แล้ว ซึ่งเป็นพฤติกรรมที่ตั้งใจ
- รอบที่เห็น 15 คู่ คือช่วงที่ใช้ browser pane ทดสอบ ซึ่งซ่อนแล้วแสดงหน้าเว็บหลายครั้ง
  ผู้ใช้จริงจะเจอ 1 คู่ต่อการสลับแท็บแต่ละครั้ง ไม่ได้วนไม่จบ
  ตอน reproduce ใหม่ด้วยการ login ด้วย Google อีกรอบโดยไม่สลับแท็บ ไม่เกิดการยิงซ้ำ

## สิ่งที่แก้

- `client/src/auth/session.js` — ยังเก็บ token ใหม่ทุก event แต่ส่ง `pyarena:session-changed` เฉพาะตอนที่ผู้ใช้เปลี่ยนคน
  (id ของ Supabase user ต่างจากเดิม) หรือ `SIGNED_OUT`
- `client/src/auth/session.test.mjs` — เทส `SIGNED_IN` ซ้ำของผู้ใช้เดิม และ `TOKEN_REFRESHED` ต้องไม่ส่ง event
  ส่วนผู้ใช้คนใหม่และ `SIGNED_OUT` ยังต้องส่ง

## ผลตรวจ

- เทสใหม่ล้มก่อนแก้ ผ่านหลังแก้; client `npm test` ผ่าน 39/39 และ ESLint ของสองไฟล์นี้ผ่าน
- browser (บัญชี pong ที่ login ด้วย Google): สลับแท็บจริง 2 ครั้ง ไม่มี `/api/auth/me` เลย
  มีแค่ `course-content` 2 ครั้งซึ่งเป็นการโหลดใหม่ตามที่ตั้งใจ

## ผลกระทบ

- การ login, logout และการเปลี่ยนบัญชียังส่ง event เหมือนเดิม
- token ที่ refresh แล้วยังถูกใช้กับคำขอถัดไปทันที
- ไม่กระทบ server, schema หรือ Arcade
