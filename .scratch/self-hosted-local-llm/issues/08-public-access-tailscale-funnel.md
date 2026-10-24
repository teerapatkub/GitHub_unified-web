# 08: ทางเข้าสาธารณะผ่าน Tailscale Funnel

**What to build:**

คนจากเครือข่ายไหนก็ได้ เปิดเว็บผ่าน URL HTTPS คงที่ `https://<เครื่อง>.<tailnet>.ts.net` ได้ โดยไม่ต้องเปิดพอร์ตบนเครื่องหรือบนเครือข่าย มข. URL ต้องไม่เปลี่ยนแม้เครื่องจะ restart

งานใน compose: เพิ่ม service `tailscale`
- ใช้ auth key จาก env
- เปิด Funnel ที่ 443 ส่งต่อไปที่ app
- มี volume เก็บ state

งานตั้งค่าที่ผู้ใช้ทำเองในบัญชีของตัวเอง:
- **Tailscale:** สร้างบัญชี เปิด HTTPS และ Funnel แล้วสร้าง auth key
- **Supabase Auth ของ project ใหม่:** ใช้สคริปต์ตั้งค่า Auth ที่มีอยู่ (`--check` / `--verify-smtp` / `--apply`) ตั้ง Site URL / Redirect URLs เป็น URL ts.net และตั้ง Gmail SMTP
- **Google OAuth:** เพิ่ม callback ของ project ใหม่ และเพิ่ม origin ts.net

ถ้าอาจารย์ได้โดเมน kku.ac.th ภายหลัง ต้องย้ายไปได้ด้วยการแก้ env และรัน `--apply` ใหม่เท่านั้น

อ้างอิง: Spec 0004, user story 1–3, 25–26

**Blocked by:** 06

**Status:** ส่วนของโค้ดเสร็จแล้ว (2026-10-25) รอผู้ใช้ตั้งค่าบัญชี Tailscale / Supabase / Google — ดู `project_logs/2026-10-25/0348-ticket-08-tailscale-funnel.md`

- [ ] ถามอาจารย์แล้วว่าใช้ Tailscale Funnel เป็นทางเข้าชั่วคราวได้ และบันทึกคำตอบไว้
- [x] service `tailscale` อยู่ใน compose (`docker-compose.funnel.yml`)
- [ ] restart เครื่องแล้ว URL ts.net ยังเหมือนเดิม
- [ ] `PUBLIC_BASE_URL`, `CLIENT_URL` และ `AUTH_ALLOWED_ORIGINS` เป็น URL ts.net แล้ว server ผ่านการตรวจ production ตอนบูต
- [ ] ผู้ใช้รันสคริปต์ตั้งค่า Auth ครบทั้ง `--check`, `--verify-smtp` และ `--apply`
- [ ] ผู้ใช้เพิ่ม callback และ origin ใน Google แล้ว
- [ ] จากเครื่องนี้ผ่าน URL ts.net: สมัครด้วยอีเมลแล้วได้อีเมลยืนยันจริง
- [ ] จากเครื่องนี้ผ่าน URL ts.net: ล็อกอิน Google ได้
- [ ] ลบไฟล์ env สำหรับตั้งค่า Supabase management หลังใช้เสร็จ
