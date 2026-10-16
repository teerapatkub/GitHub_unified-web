# ลบไฟล์และเอกสารเก่าที่ไม่ได้ใช้งาน

**วันที่:** 2026-10-13 เวลา 13:50 (Asia/Bangkok)

## รายการที่ลบ

- `_archive/GitHub_unified-web-Project2-tee/` — สำเนา handover ที่รวมเข้าระบบแล้ว
- `_archive/GitHub_unified-web-Project2-tee.zip` — archive ของ handover เดิม
- `_archive/GitHub_unified-web-main.zip` — สำเนา repository รุ่นเก่า
- `_archive/nothing/` — prototype และ dump รุ่นเก่าที่ถูกแทนที่แล้ว
- `_archive/env.backup-2026-08-25` — environment backup ที่ key ถูกเพิกถอนแล้ว
- `client/dist/` — production build output ที่สร้างใหม่ด้วย `npm run build` ได้
- `client/src/client.zip` — snapshot client เก่าที่ไม่มี runtime reference
- `เนื้อหาล่าสุด.md` — เอกสารสถานะชื่อ PySim ที่ถูกแทนด้วย Spec และ project status ปัจจุบัน

พื้นที่ที่คืนได้รวมประมาณ 638.7 MiB

## รายการที่ตั้งใจเก็บ

- `_archive/20.8.2569.sql` — PostgreSQL recovery dump ที่มีข้อมูลผู้ใช้จริง
- `.security-work/` — sanitized Git mirror ที่ยังต้องใช้ในขั้น publish ประวัติใหม่
- `project_logs/` — ประวัติการทำงานและหลักฐานการเปลี่ยนแปลง
- `specs/` และ `docs/` — เอกสารข้อกำหนด, deploy และ security ที่ยังใช้อ้างอิง
- `client/public/pyodide/` — runtime asset ที่ใช้ใน local browser execution
- `node_modules/` — dependency ที่สภาพแวดล้อมพัฒนาปัจจุบันใช้อยู่

## การปรับเอกสารประกอบ

- ปรับ `CLAUDE.md` และ `.gitignore` ให้บอกว่า `_archive/` เหลือเฉพาะ recovery backup
- ปรับ `_archive/README.md` ให้ตรงกับของที่เหลือและระบุวิธีเก็บข้อมูลผู้ใช้อย่างปลอดภัย

## ข้อสังเกตด้านความปลอดภัย

ระบบอนุมัติอัตโนมัติปฏิเสธการลบ `_archive/` ทั้งก้อน เพราะ PostgreSQL dump เป็นข้อมูลที่ย้อนคืนไม่ได้
จึงลบเฉพาะรายการที่ README เดิมระบุว่าลบได้ และเก็บ recovery dump ไว้โดยไม่แตะต้อง
