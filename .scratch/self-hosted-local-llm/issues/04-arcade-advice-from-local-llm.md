# 04: คำแนะนำหลังแมตช์ Arcade ด้วย LLM ในเครื่อง

**What to build:** หลังแมตช์จบ ผู้เล่น Arcade เปิดประวัติรอบแล้วได้คำแนะนำที่ LLM ในเครื่องเขียน แทน Gemini

- เรียกผ่านตัวเรียกจาก ticket 01 ด้วย `LLM_ADVICE_MODEL`
- พฤติกรรมเดิมต้องคงไว้ทั้งหมด:
  - rate limit
  - ขอได้ครั้งเดียวต่อแถวประวัติ
  - กันคำขอซ้ำที่ยังทำงานอยู่
  - ถ้า LLM ล้มเหลว ใช้ผลวัดในเครื่องแทน
- คะแนนคุณภาพและเวลาปิดรอบไม่เปลี่ยน ยังเป็นไปตาม ADR 0007
- เอา SDK ของ Gemini ออกจาก dependency ของ server

อ้างอิง: Spec 0004, user story 14–16

**Blocked by:** 01

**Status:** done except the test:arcade/sim:bots line (2026-10-22, see project_logs/2026-10-22/1943-ticket-04-arcade-advice-from-local-llm.md)

- [x] judge ของ Arcade สร้างคำแนะนำผ่านโมดูลตัวเรียก LLM และไม่มีโค้ดของ Gemini เหลือ
- [x] เทสของ judge Arcade ที่มีอยู่ปรับให้ใช้ generator ใหม่ แล้วผ่าน
- [x] เทสผ่าน Ollama ปลอม ยิง endpoint คำแนะนำของประวัติรอบจริง:
  - [x] ตัวปลอมตอบสำเร็จ → ได้ข้อความจากตัวปลอม
  - [x] ตัวปลอมล้มเหลว → ได้ผลวัด
  - [x] ขอซ้ำ → ได้ค่าที่เก็บไว้ และตัวปลอมไม่ถูกเรียกอีก
- [ ] `npm run test:arcade`, calibration (40/40 ได้ 95+) และ `npm run sim:bots` ผ่าน  ← test:arcade ผ่านครบหลัง merge d267aca + แก้ EPIPE (2026-10-22 20:19); calibration 40/40; sim:bots ยังตกเพราะ test_cases ในฐานทดสอบเสีย (มีมาก่อน รอรันสคริปต์ซ่อม)
- [x] เล่นทดสอบ Arcade 1 แมตช์บน dev server แล้วประวัติรอบโหลดคำแนะนำได้
