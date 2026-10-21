# 05: ลบร่องรอย AI ภายนอกให้หมด

**What to build:**

ระบบไม่มี API key หรือที่อยู่ของผู้ให้บริการ AI ภายนอกเหลืออยู่เลย ทั้งในโค้ด ไฟล์ตัวอย่าง และ env จึงตรงกับข้อกำหนดของอาจารย์ และเปิดให้กรรมการดูได้

สคริปต์แปลโจทย์ใช้ LLM ในเครื่อง ผ่านตัวเรียกจาก ticket 01 ด้วย `LLM_CHAT_MODEL` โดยกฎเดิมทุกข้อยังใช้อยู่:
- แปลเฉพาะร้อยแก้ว
- ห้ามแตะโค้ดและ test case
- ตรวจ `MUST_PRINT`

ตอนบูต server ต้องพิมพ์ log ที่บอกว่าแต่ละงาน AI เปิดหรือปิด ใช้โมเดลอะไร และ LLM อยู่ที่ไหน ถ้าตั้ง `LLM_BASE_URL` ไว้แต่ติดต่อไม่ได้ ต้องเตือนให้ชัด

อ้างอิง: Spec 0004, user story 17, 28–29, 32–33

**Blocked by:** 02, 03, 04

**Status:** ready-for-agent

- [ ] สคริปต์แปลโจทย์เรียกผ่านโมดูลตัวเรียก LLM
- [ ] `npm run translate:problems -- --dry --limit 1` รันกับ Ollama ปลอมหรือ Ollama จริงได้
- [ ] `npm run test:bilingual` ผ่าน
- [ ] `git grep -nE "NVIDIA_|GEMINI_|integrate.api.nvidia|@google/genai"` เหลือแค่ในบันทึกงานเก่า, ADR และ spec
- [ ] ไฟล์ตัวอย่าง env ของ server ไม่มีตัวแปรของ AI ภายนอก (รวม `ANTHROPIC_API_KEY`) และมี `LLM_*` แทน
- [ ] log ตอนบูตบอกว่างานไหนเปิด ใช้โมเดลอะไร และ LLM อยู่ที่ไหน
- [ ] log ตอนบูตเตือนชัดเมื่อตั้ง `LLM_BASE_URL` แต่ติดต่อไม่ได้
- [ ] `npm test` ของ server และ client, `npm run lint` และ `npm run build` ผ่าน
