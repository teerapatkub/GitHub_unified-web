# 2026-08-27 12:30 — self-host Pyodide

เฟส A ข้อ 1 ชั้นแรก ตามที่ผู้ใช้เลือกทาง self-host + worker + isolation

## แก้อะไร
- ติดตั้ง `pyodide@0.27.7` เป็น dependency ของ client
- `client/scripts/sync-pyodide.mjs` ก๊อป core runtime (5 ไฟล์ ~14MB) จาก node_modules ไป
  `public/pyodide/` รันผ่าน `predev`/`prebuild` และ gitignore ปลายทาง
- repoint loader 4 จุด (worker + ExercisePage/MiNi_Game/CodingWorkspace) จาก CDN → `/pyodide/`
  พร้อม `indexURL:'/pyodide/'`

## เหตุผล
CDN `<script>` ฝังใต้ COEP ไม่ได้ ต้อง self-host ก่อนถึงจะเปิด cross-origin isolation เพื่อให้ได้
SharedArrayBuffer ซึ่งเป็นตัวเดียวที่จะ (ก) kill infinite loop และ (ข) ทำ input() บล็อกใน worker ได้

## ทดสอบแล้ว (dev server จริง)
- HEAD /pyodide/* → 200 ครบ, wasm เป็น application/wasm
- โหลด+รัน Python `1+1`=2 จาก origin เรา (5.4s main thread), worker ready+run 2.2s
- `npm run build` ผ่าน, dist/pyodide ครบ, prod static เสิร์ฟก่อน SPA fallback

## ยังไม่เสร็จ
- เปิด COOP/COEP (credentialless) + worker ใหม่ที่ใช้ SAB interrupt กันลูป + blocking stdin
- ย้าย 3 หน้า main-thread ไป worker + พ่วงแปล error ไทย
