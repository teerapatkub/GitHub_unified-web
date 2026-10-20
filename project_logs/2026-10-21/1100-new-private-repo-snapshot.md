# สร้าง repo ใหม่แบบ private และเตรียม snapshot commit เดียว

**วันที่:** 2026-10-21 (Asia/Bangkok) — Person 3 (สถาปัตยกรรมรวม)
**อ้างอิง:** ADR 0008 ข้อ 3, `docs/deploy-render.md` ข้อ 0

## สิ่งที่ทำ

- ตกลงกับผู้ใช้ว่าจะ deploy โค้ดปัจจุบันขึ้นไปก่อน (ยังไม่แจก URL) แล้วค่อยรวมงานของทีมและ push ตามไป
  - เพื่อแยกปัญหาการตั้งค่าออกจากปัญหาการรวมโค้ด
- สร้าง repo `MiKiKung1015/pyarena` แบบ **private** ด้วย `gh repo create`
- สร้าง branch `deploy` ในเครื่อง:
  - เป็น commit เดียว (`git commit-tree` จาก tree ของ main `ded47a9`) ไม่มี parent
  - ไฟล์ตรงกับ main ทุกไฟล์ (`git diff main deploy` ว่าง)
  - push ขึ้นไปจะไม่มีประวัติเก่าติดไปด้วย
- เพิ่ม remote `deploy` ชี้ไปที่ repo ใหม่ โดย `origin` ยังเป็น repo เดิม

## ผลตรวจก่อน push

- `node scripts/security/repository-safety.mjs`:
  - ไฟล์ปัจจุบันเจอ 5 จุด ทั้งหมดเป็นค่าปลอมในไฟล์เทส (`health:health@127.0.0.1`, `google-secret`, `restart-probe-token`)
  - อีก 41 จุดอยู่ในประวัติ git เก่า (ไฟล์สำรองฐานที่มี password hash) ซึ่ง repo ใหม่ไม่มี
- grep หา `nvapi-`, `AIza`, `sb_secret_`, token ของ GitHub/Slack, private key และ connection string ที่มีรหัสผ่าน:
  - เจอแต่ค่าตัวอย่างในเทส, workflow และ `docs/deploy.md`
- ไม่มี `.env` ไฟล์สำรองฐาน หรือไฟล์ zip ถูก track
- ข้อมูลส่วนตัวที่ติดไป:
  - อีเมลของบัญชี AdminPong ใน `docs/admin.md`
  - รูปที่ admin อัปโหลด 29 ไฟล์ใน `server/uploads`, `server/seed-assets`
  - ยอมรับได้เพราะ repo เป็น private

## วิธีอัปเดต repo ใหม่ครั้งต่อไป

ต่อ commit ใหม่บน `deploy` โดยใช้ tree ของ main จะส่งขึ้นไปแค่ไฟล์ที่เปลี่ยน และไม่มีประวัติเก่าติดไป:

```bash
git branch -f deploy $(git commit-tree 'main^{tree}' -p deploy -m "Update from main")
git push deploy deploy:main
```

## ผลกระทบ

- ไม่แก้โค้ด
- `origin` และงานของทีมบน repo เดิมไม่ถูกแตะ

## ยังไม่ได้ทำ

- push `deploy` ขึ้น repo ใหม่ (รอผู้ใช้ยืนยัน)
- ผู้ใช้: เชิญสมาชิกเป็น collaborator, ตั้ง repo เดิมเป็น private, ทำขั้นที่ 1–4 ของ `docs/deploy-render.md`
