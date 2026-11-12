# ตรวจเครื่อง มข. ใหม่ (10.198.210.127) และเขียนคู่มือ deploy

**วันที่:** 2026-11-12 (Asia/Bangkok), Person 3

## ที่มา

หลังส่งเมลขอ HTTPS เจ้าหน้าที่ มข. ตอบกลับมาพร้อม IP ใหม่ 10.198.210.127 (บัญชี `project` เดิม)
ส่วนชื่อโดเมนให้ติดต่อ sutoch@kku.ac.th

## ตรวจอะไรแล้วบ้าง

- **จากโน๊ตบุ๊ก (ไม่ได้ล็อกอิน):**
  - SSH เปิดอยู่ (OpenSSH 9.6p1, Ubuntu 24.04) รับ publickey และ password
  - พอร์ต 80/443 ยังปิด
  - IP เก่า 10.198.200.127 ไม่ตอบแล้ว
- **ผู้ใช้ล็อกอินแล้วรันเอง:**
  - curl: github 200, Docker registry 401 (ปกติ), supabase.com 200, ollama.com 200
  - pooler ของ Supabase (ap-northeast-1/2) พอร์ต 5432 และ 6543 เปิดหมด
  - แปลว่าเครื่องนี้ออกเน็ตได้แล้ว ต่างจากเมื่อ 28 ต.ค. ที่ถูกบล็อก

## สิ่งที่เพิ่ม

- `docs/deploy-kku.md`: ขั้นตอนย้ายเว็บจากโน๊ตบุ๊กไปเครื่อง มข. โดยใช้ที่อยู่ ts.net เดิม
  - ติดตั้ง Docker จาก apt ของ Ubuntu
  - ส่งโค้ดด้วย `git archive` ไม่ผ่าน GitHub ไฟล์ลับจึงไม่ติดไปด้วย
  - เปิดโดยไม่มีไฟล์ GPU
  - ย้ายชื่อเครื่อง `pyarena` ใน Tailscale

## ตรวจคู่มือ

- **`git archive HEAD`:** ได้ 1,081 ไฟล์ ขนาด 136 MB
  - มีไฟล์ที่ build ต้องใช้ครบ 7/7 ไฟล์
  - ไฟล์ env ที่ติดไปมีแค่ `.env.example`
- **`docker compose ... -f docker-compose.funnel.yml config --quiet`:** ผ่านโดยไม่ใช้ไฟล์ GPU

## ผลกระทบ

- **เมื่อผู้ใช้ทำตามคู่มือ:** บูตครั้งแรกบนเครื่อง มข. จะรัน migration `202611090001` บนฐาน production
- **ที่อยู่เว็บ:** ย้ายจากโน๊ตบุ๊กไปเครื่อง มข. ต้องลบเครื่อง `pyarena` เดิมใน Tailscale ก่อน

## ยังไม่ได้ทำ

- ยังไม่ได้ติดตั้งหรือรันอะไรบนเครื่อง มข. เพราะ Claude ไม่ล็อกอินด้วยรหัสผ่านแทนผู้ใช้
- ยังไม่รู้เวอร์ชัน compose บนเครื่อง ต้องได้ 2.24 ขึ้นไป
- ยังไม่ได้วัดว่า Lumi ตอบเร็วแค่ไหนบน CPU 16 core

## เพิ่มเติม: สคริปต์เตรียมเครื่อง (commit a60fab6)

- **`deploy/kku/prepare-host.sh`:** ทำ 4 อย่างในครั้งเดียว
  - ติดตั้ง Docker และ Compose จาก apt ของ Ubuntu
  - ดึง image ทุกตัว: ollama 0.30.0, busybox 1.37.0, tailscale v1.104.2, node:22-bookworm-slim
  - ดาวน์โหลดโมเดลที่ระบุใน env เข้า volume `pyarena_ollama-models`
  - build image ของ app
  - ยังไม่เปิดเว็บ รันซ้ำได้
- **`.gitattributes`:** `*.sh` ใช้ LF เพื่อให้ไฟล์ที่ pack บน Windows รันบน Ubuntu ได้
- **`docs/deploy-kku.md`:** ขั้นที่ 1–2 ใช้สคริปต์นี้
- **`deploy/kku/pyarena.tar.gz`:** ไฟล์ archive ขนาด 136 MB จาก a60fab6 ถูก gitignore ไว้

**ตรวจแล้ว:**
- `bash -n` ผ่าน
- ทดสอบตรรกะเทียบเวอร์ชัน compose และการอ่านชื่อโมเดลแล้ว
- ใน archive สคริปต์ไม่มี CR และไม่มีไฟล์ env จริง
- packages.ubuntu.com: noble-updates มี docker-compose-v2 2.40.3 และ docker.io 29.1.3

**ยังไม่ได้รันสคริปต์จริงบนเครื่อง มข.:** Docker Desktop บนโน๊ตบุ๊กปิดอยู่ จึงไม่ได้ลองใน container Ubuntu ด้วย
