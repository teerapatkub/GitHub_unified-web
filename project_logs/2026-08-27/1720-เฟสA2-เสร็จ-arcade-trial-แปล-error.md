# 2026-08-27 17:20 — เฟส A ข้อ 2 เสร็จ: Arcade trial แปล error เป็นไทย

## แก้อะไร
`client/src/pages/Arcade/hooks/useRoundJudging.js` (ไฟล์ของ Person 3 / Arcade):
กรณี "โค้ดโหลดไม่ได้" (syntax error ฯลฯ) เดิมโชว์ error ดิบ ตอนนี้ผ่าน `friendlyPyError`
(ตัวแปลตัวเดียวกับหน้าเรียน) แสดงข้อความไทย fallback เป็นข้อความดิบถ้าแปลไม่ได้

## เฟส A ข้อ 2 (error เป็นคำแนะนำ) ครบทุกจุดที่รัน Python แล้ว
- CompetitiveArena (อ่าน hint จาก server)
- LessonPage playground
- ExercisePage, MiNi_Game, CodingWorkspace (friendlyPyError ในผลรัน)
- Arcade trial (useRoundJudging) — จุดนี้

## ทดสอบ
- build ผ่าน, lint 56/9 (ไม่มี error ใหม่)
- ตัวแปล friendlyPyError ผ่าน E2E มาแล้วบน ExercisePage/MiNi_Game/CodingWorkspace

## เฟส A เสร็จสมบูรณ์ทั้งข้อ 1 และ 2
