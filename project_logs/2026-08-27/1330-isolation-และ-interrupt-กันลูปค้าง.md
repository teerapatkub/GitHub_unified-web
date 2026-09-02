# 2026-08-27 13:30 — cross-origin isolation + interrupt (กันลูปค้าง)

เฟส A ข้อ 1 แกนหลัก: เปิด SharedArrayBuffer แล้วใช้หยุดลูปค้างใน worker

## แก้อะไร
- COOP `same-origin` + COEP `credentialless`: `client/vite.config.js` (dev) และ
  `server/server.js` (prod, บน SPA ที่ build แล้ว วางก่อน static/fallback)
- `client/public/pyodideWorker.js`: รับ interruptBuffer, `setInterruptBuffer`, เคลียร์ก่อนรัน,
  KeyboardInterrupt → ข้อความไทย
- `client/src/hooks/usePyodide.js`: เขียนใหม่ สร้าง SAB, watchdog 2 ชั้น (interrupt 10s /
  terminate 14s) + แก้บั๊ก recreate worker เดิมที่ handler หาย
- `server/pythonErrorMessages.js` → `.mjs` (ESM) ให้ client import ตรงได้ทั้ง dev+build,
  server require(ESM) ได้บน Node 22; อัปเดต `problemGrader.js`, `scripts/error-messages-test.js`,
  `client/src/utils/friendlyPyError.js`
- `client/eslint.config.js`: ignore `public/pyodide`

## เหตุผล
main thread ฆ่าลูปไม่ได้ (JS timer ไม่ทำงานถ้า Python บล็อกอยู่) ต้องมี SharedArrayBuffer เพื่อ
(ก) เขียน SIGINT ให้ Pyodide raise KeyboardInterrupt กลางลูป และ (ข) ทำ input() บล็อกใน worker
SAB มีก็ต่อเมื่อ cross-origin isolated → ต้อง self-host Pyodide (ทำแล้วรอบก่อน) + ตั้ง COOP/COEP
เลือก COEP credentialless เพราะ Google Fonts เป็น cross-origin ไม่มี CORP — credentialless ยังโหลดได้

## ทดสอบแล้ว (dev server จริง)
- crossOriginIsolated=true, SAB ใช้ได้, แอปเรนเดอร์ปกติ
- `while True: x+=1` หยุดที่ 1233ms ด้วยข้อความไทย, worker ยังใช้ต่อได้
- server error-messages-test 15/15, client build ผ่าน, lint 57/9

## ยังไม่เสร็จ
- ย้าย ExercisePage/MiNi_Game/CodingWorkspace เข้า worker + blocking input() ผ่าน SAB + แปล error
- E2E บนหน้า LessonPage จริง
