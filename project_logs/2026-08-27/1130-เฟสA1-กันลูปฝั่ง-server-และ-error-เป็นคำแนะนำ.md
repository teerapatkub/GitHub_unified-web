# 2026-08-27 11:30 — เฟส A (ส่วนที่ 1)

เริ่มงานตาม `Plan2.md` เฟส A (ความปลอดภัย/ถูกต้อง) ผู้ใช้อนุมัติให้ทำข้ามขอบเขตพร้อมบันทึก handoff
รอบนี้ทำ 2 ชิ้นแรก ยังเหลือการย้าย Pyodide ฝั่ง client ไป worker (ข้อ 1 ส่วนใหญ่)

## สิ่งที่แก้

| ไฟล์ | แก้อะไร | ของใคร |
|---|---|---|
| `server/pythonRunner.js` | เพิ่ม output cap 256KB — kill process ถ้าพิมพ์ทะลัก | Person 3 |
| `client/vite.config.js` | alias `@shared` → `../server` + commonjsOptions ให้ client import ตัวแปล error ไฟล์เดียวกับ server ได้ | Person 3 (build) |
| `client/src/utils/friendlyPyError.js` | util ใหม่ ห่อ `explainPythonError` ให้ฝั่ง client เรียก | Person 3 |
| `client/src/pages/LessonPage.jsx` | playground แสดงคำแนะนำไทยใต้ traceback ดิบ | Person 1 (handoff) |
| `client/src/pages/CompetitiveArena.jsx` | ผลรันเทสแสดง hint ไทยที่ server ส่งมาแล้ว แทน error ดิบ | Person 2 (handoff) |

## เหตุผล

**ข้อ 1 (บางส่วน) — output cap:** ฝั่ง server มี timeout 4 วิ กัน "เวลา" แต่ไม่กัน "หน่วยความจำ"
`while True: print(x)` สะสม stdout ไม่จำกัดจนกินแรมได้ในไม่กี่วินาทีก่อน timeout จะทำงาน
เพิ่มเพดาน 256KB ถ้าทะลุให้ kill แล้วรายงานเป็นข้อความไทยว่าอาจเป็นลูปไม่รู้จบ (ไม่ใช่คำตอบผิดเงียบๆ)

**ข้อ 2 — error เป็นคำแนะนำ:** ตัวแปล `explainPythonError` มีอยู่แล้วแต่ client เรียกไม่ได้
(อยู่ฝั่ง server เป็น CommonJS) รอบนี้ทำให้แชร์ไฟล์เดียวกันได้ผ่าน Vite alias — ผู้เรียนเห็นข้อความ
ไทยชุดเดียวกันทุกที่ ไม่ใช่ traceback อังกฤษ

## ผลกระทบ

- output cap: การรันปกติไม่กระทบ (โปรแกรมทั่วไปพิมพ์ไม่กี่บรรทัด) ตรวจแล้วว่าการตัดสินโจทย์
  function/stdio ยังทำงานถูก (ข้อความ cap ขึ้นเป็น top-level error ของ path function)
- ไม่แตะฐานข้อมูล — ทำก่อนย้าย Supabase ได้ตามที่ผู้ใช้ต้องการ
- `build.commonjsOptions.include` ต้องคงไว้ ไม่งั้น prod build พังเพราะ Rollup ไม่ synth
  named export จากไฟล์ CommonJS ที่แชร์

## ทดสอบแล้ว

- ทดสอบ `runPythonScript` กับ `while True: print('x'*200)` — หยุดที่ ~0.3MB ใน 428ms
  (ไม่รอครบ 4 วิ) รายงานข้อความไทย · โปรแกรมปกติ `print('hello')` ยังได้ output ถูก exit 0
- `explainPythonError` กับ traceback แบบ Pyodide (NameError/SyntaxError/ZeroDivision) → ไทยถูก
- `npm run build` (client) ผ่าน — ยืนยัน alias ไฟล์แชร์ resolve ทั้ง dev+prod
- `npm run lint` เท่า baseline 57/9

## ที่ยังไม่เสร็จ (เฟส A ต่อ)

- **ข้อ 1 หลัก:** ย้าย Pyodide 3 หน้า (ExercisePage, MiNi_Game, CodingWorkspace) จาก main thread
  ไป worker — จะพ่วงการแปล error ไทยของหน้าพวกนี้ + Arcade trial ไปพร้อมกัน (แตะไฟล์ครั้งเดียว)
- ยังไม่ทดสอบ E2E ในเบราว์เซอร์ของ hint หน้า LessonPage/Competitive
