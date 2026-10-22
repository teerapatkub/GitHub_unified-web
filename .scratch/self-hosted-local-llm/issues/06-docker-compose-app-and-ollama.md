# 06: Docker compose: app + Ollama บนเครื่องนี้

**What to build:**

ผู้ดูแลระบบสั่ง `docker compose up` คำสั่งเดียว แล้วได้ทั้ง app และ Ollama บนเครื่องนี้ (RTX 3050 Ti 4 GB) โดย app ต่อฐานข้อมูลบน Supabase project ใหม่

service ที่ต้องมี:
- **Postgres ในเครื่อง:** ถอดออก เก็บวิธีกลับไปใช้ไว้เป็นหมายเหตุ
- **`ollama`:**
  - volume เก็บโมเดล และ healthcheck
  - คำขอพร้อมกัน 1 ตัว และเก็บโมเดลไว้ในหน่วยความจำตลอด
- **ตัวดึงโมเดล:** รันครั้งเดียว ดึงโมเดลตาม env แล้วจบ
- **`app`:**
  - เริ่มหลังตัวดึงโมเดลเสร็จ
  - publish พอร์ตแค่ที่ loopback

GPU แยกเป็นไฟล์ override เครื่องที่ไม่มี GPU (เช่น VM ของ มข.) ใช้ไฟล์หลักไฟล์เดียว แล้ว Ollama ใช้ CPU

env ทั้งหมดของ deploy อยู่ในไฟล์เดียวที่ git ไม่ track

ถ้าใช้ GPU ใน Docker Desktop + WSL2 ไม่ได้ ให้ถอยไปรัน Ollama for Windows นอก Docker แล้วชี้ `LLM_BASE_URL` ไปที่ host แทน และบันทึกเหตุผลไว้

อ้างอิง: Spec 0004 ส่วน "Docker compose" และ user story 18–22, 24, 27, 31

**Blocked by:** 01

**Status:** done except 100% GPU (2026-10-22, see project_logs/2026-10-22/2130-ticket-06-docker-compose-app-and-ollama.md)

- [x] ติดตั้งและเปิด Docker Desktop (WSL2) บนเครื่องนี้ แล้วรัน container ที่เห็น GPU ได้ หรือบันทึกเหตุผลที่ต้องถอยไปรัน Ollama นอก Docker
- [x] compose ไม่มี service Postgres และ app ใช้ `DATABASE_URL` ของ Supabase
- [x] service `ollama` และตัวดึงโมเดลทำงาน: เปิดครั้งแรกโมเดลถูกดึงอัตโนมัติ ครั้งต่อไปไม่ดึงซ้ำ
- [x] `docker compose -f <ไฟล์หลัก> -f <ไฟล์ GPU> --env-file <ไฟล์ env> up --build` แล้ว `/api/health/ready` ตอบ 200 ที่ localhost
- [x] ใน container ของ app ตัวเรียก LLM ไปถึง Ollama ได้: Lumi ตอบจากโมเดลจริง
- [ ] `ollama ps` แสดงว่าโมเดลอยู่บน GPU 100%  ← 32%/68% CPU/GPU: VRAM ว่าง ~3.2 GiB < 3.4-3.5 GB ส่งให้ ticket 07 เลือกโมเดล
- [x] รันด้วยไฟล์หลักไฟล์เดียว (ไม่มี GPU) แล้วยังบูตได้
- [x] พอร์ต app ไม่เปิดออกนอกเครื่อง: ตรวจจากเครื่องอื่นในวงเดียวกันแล้วเข้าไม่ได้  ← ผูก 127.0.0.1 และ LAN IP ของเครื่องนี้ถูกปฏิเสธ ยังไม่ได้ลองจากเครื่องอื่นจริง
- [x] security check ของ image (`container-image-safety`) ยังผ่าน  ← สคริปต์รันบน Windows ไม่ได้ (symlink) ตรวจเทียบเท่าใน image แล้วผ่าน; ตัวสคริปต์รันใน CI
