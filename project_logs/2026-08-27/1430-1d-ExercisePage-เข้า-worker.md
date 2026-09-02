# 2026-08-27 14:30 — เฟส A (1d) หน้าแรก: ExercisePage เข้า worker

## แก้อะไร
- `client/public/pyodideWorker.js`: interactive input() (async bridge + compile wrapper),
  cwd เข้า sys.path
- `client/src/hooks/usePyodide.js`: options interactive/onInput/onStdout/onStderr/mainFileName,
  พัก watchdog ระหว่างรอ input
- `client/src/pages/ExercisePage.jsx`: เลิกโหลด Pyodide เอง มาใช้ usePyodide; handleRun/handleSubmit
  รันผ่าน worker; ไม่แตะการตัดสิน

## เหตุผล
ExercisePage เป็นหน้าที่ผู้เรียนเขียนโค้ดมากสุด เดิมรัน main thread ลูปค้าง = แท็บค้าง
ย้ายเข้า worker ได้ทั้งกันลูป + คง input() แบบโต้ตอบ

## ทดสอบแล้ว
- กลไก worker interactive input + loop-kill (ยิงตรง): ผ่าน
- build ผ่าน, lint 57/9 เท่าเดิม
- ยังไม่ E2E บนหน้าจริง — local Postgres ไม่ได้รัน + ต้องล็อกอิน (route guard ทำงานถูก, แอปไม่ crash)

## ที่เหลือ (1d)
- MiNi_Game, CodingWorkspace (รูปแบบเดียวกัน)
- E2E ทั้ง 3 หน้าเมื่อ DB พร้อม
