# 2026-08-27 16:00 — เฟส A (1d) หน้าที่สอง: MiNi_Game เข้า worker

## แก้อะไร
`client/src/pages/MiNi_Game.jsx`: เลิกโหลด Pyodide เอง (singleton main thread) มาใช้ usePyodide
ทั้ง 3 เส้นรัน (terminal/story interactive + check non-interactive) รันใน worker; onStdout เดินสายเดิม
(runOutputRef + story dialogue + terminal); ไม่แตะตรรกะการตรวจ

## ทดสอบแล้ว (E2E หน้าจริง)
- input("ชื่อ:") → "Mini" → "สวัสดี Mini"
- while True → หยุด ~10 วิ ด้วยข้อความไทย แท็บไม่ค้าง
- build ผ่าน, lint 56/9 (ไม่มี error ใหม่)

## ที่เหลือ (1d)
- CodingWorkspace (AI-task) — หน้าสุดท้าย
