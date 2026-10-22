# 03: Competitive ให้คะแนนจาก rubric และ LLM เขียนแค่คำแนะนำ

**What to build:**

ผู้เล่น Competitive ส่งคำตอบแล้วได้คะแนน, breakdown และสิทธิ์รับรางวัลจาก rubric กับผลเทสในเครื่องเสมอ คำตอบเดียวกันจึงได้คะแนนเท่ากันทุกครั้ง และไม่ต้องรอโมเดล

LLM ในเครื่องเขียนแค่คำแนะนำภาษาไทยสั้นๆ:
- ใช้ตัวเรียกจาก ticket 01 ด้วย `LLM_JUDGE_MODEL`
- ถ้า LLM ล้มเหลว ช้าเกิน หรือตอบผิดรูป ให้ใช้คำแนะนำของ rubric แทน

field ที่หน้า Competitive ใช้อยู่ต้องคงไว้ครบทุกตัว (`aiReviewed`, `aiApproved`, `aiVerdict`, `feedback`) ส่วน `aiApproved` ตัดสินจากการผ่านเทสครบและคะแนน rubric

งานนี้เป็นโค้ดของ Person 2 จึงต้องเขียนบันทึกส่งต่อก่อน merge

อ้างอิง: Spec 0004, user story 9–13 และ 34 ใช้หลักเดียวกับ ADR 0007

**Blocked by:** 01

**Status:** done (2026-10-22, see project_logs/2026-10-22/1910-ticket-03-competitive-rubric-score-llm-advice.md; story 10 partly: advice wait capped at 12 s)

- [x] ตัวตรวจ Competitive เรียกผ่านโมดูลตัวเรียก LLM ด้วย `LLM_JUDGE_MODEL` และไม่ใช้ NVIDIA แล้ว
- [x] ตัวเลขทุกตัวในผลลัพธ์มาจาก rubric และผลเทส ไม่ใช่จาก LLM: คะแนน, breakdown, สิทธิ์รับรางวัล และจำนวนเงินรางวัล
- [x] เทสผ่าน Ollama ปลอม ยิง endpoint ส่งคำตอบ Competitive จริง:
  - [x] ตัวปลอมตอบคะแนนสูงผิดปกติ → คะแนนและรางวัลยังเท่ากับ rubric
  - [x] ตัวปลอมตอบคะแนนต่ำผิดปกติ → คะแนนและรางวัลยังเท่ากับ rubric
  - [x] ตัวปลอมตอบสำเร็จ → feedback มาจากตัวปลอม
  - [x] ตัวปลอมล้มเหลวหรือ timeout → feedback มาจาก rubric
- [x] หน้า Competitive ยังแสดงผลได้เหมือนเดิม ตรวจผ่าน dev server
- [x] บันทึกส่งต่อให้ Person 2 ใน handoff doc ว่าคะแนนเปลี่ยนไปมาจากไหน และทำไม
- [x] `npm test` ของ server และ `npm run test:submit` ผ่าน
