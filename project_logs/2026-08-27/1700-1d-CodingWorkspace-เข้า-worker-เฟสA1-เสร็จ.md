# 2026-08-27 17:00 — เฟส A (1d) หน้าสุดท้าย: CodingWorkspace เข้า worker — เฟส A ข้อ 1 เสร็จ

## แก้อะไร
`client/src/components/learning/CodingWorkspace.jsx`: เลิกโหลด Pyodide เอง มาใช้ usePyodide
handleRun (interactive) + handleRunTests (ตรวจทีละ case, non-interactive) รันใน worker
ไม่แตะตรรกะการตรวจ

## ทดสอบแล้ว (E2E /debug จริง)
- Run + input("เลข:") → "21" → "42"
- Run + while True → หยุด ~10 วิ ข้อความไทย แท็บไม่ค้าง
- Run Tests → FAIL Test Case 1 / Expected / Got (เส้นตรวจทำงาน)
- build ผ่าน, lint 56/9 (ไม่มี error ใหม่)

## เฟส A ข้อ 1 (กันลูปค้าง) เสร็จสมบูรณ์
3 หน้า main-thread (ExercisePage, MiNi_Game, CodingWorkspace) ย้ายเข้า worker แล้ว รวมกับ
LessonPage playground + Arcade trial ที่อยู่บน worker เดิม → Python ฝั่ง client ทุกจุดกันลูปค้างได้

## เหลือในเฟส A
- ข้อ 2 (error เป็นคำแนะนำ) ทำแล้วบางส่วน: CompetitiveArena, LessonPage, และ 3 หน้าที่เพิ่งย้าย
  (ExercisePage/MiNi_Game/CodingWorkspace แสดง friendlyPyError แล้ว) — เหลือ Arcade trial
  (useRoundJudging) ที่ยังโชว์ traceback ดิบ
