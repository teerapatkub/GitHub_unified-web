# ย้ายเว็บจริงไปเครื่องของ มข. (10.198.210.127)

**เขียนเมื่อ:** 2026-11-12

ตอนนี้เว็บจริง (`https://pyarena.tail45e95d.ts.net`) รันบนโน๊ตบุ๊ก คู่มือนี้ย้ายไปรันบนเครื่องของ มข. โดยใช้ที่อยู่เดิม
จึงไม่ต้องแก้ Supabase Auth, Google และลิงก์ในอีเมล

**สิ่งที่ตรวจแล้วเมื่อ 2026-11-12:**
- Ubuntu 24.04, SSH เปิด, 16 vCPU, RAM 15 GB, ไม่มี GPU
- ออกเน็ตได้ (GitHub, Docker Hub, Supabase, Ollama)
- ต่อพอร์ตฐานข้อมูล Supabase 5432/6543 ได้

**ข้อสำคัญ:**
- ใช้รหัสผ่านที่ได้จากอีเมลเท่านั้น **ห้ามเปลี่ยนรหัสผ่านของบัญชี `project`**
- คนที่มีรหัสนี้อ่านไฟล์ env บนเครื่องได้ทุกไฟล์ ถือว่าค่าลับในเครื่องนี้เป็นของที่แชร์กัน
- เครื่องนี้ไม่มี GPU **จึงไม่ใช้ `docker-compose.gpu.yml`** Lumi จะตอบช้ากว่าบนโน๊ตบุ๊ก

ช่องที่เขียนว่า **[โน๊ตบุ๊ก]** ให้รันใน PowerShell ที่โฟลเดอร์โปรเจค ช่องที่เขียนว่า **[มข.]** ให้รันบนเครื่อง มข. หลัง `ssh`

---

## 1. ส่งโค้ดและไฟล์ env ขึ้นเครื่อง

ใช้ `git archive` ซึ่งเอาเฉพาะไฟล์ที่อยู่ใน git **จึงไม่มีไฟล์ลับหลุดไปด้วย**
และไม่ต้องตั้งสิทธิ์ GitHub บนเครื่อง มข.

**[โน๊ตบุ๊ก]**

```bash
git archive --format=tar.gz -o deploy/kku/pyarena.tar.gz HEAD
scp deploy/kku/pyarena.tar.gz project@10.198.210.127:~/
scp server/.env.production.local project@10.198.210.127:~/
```

`*.tar.gz` ถูก gitignore ไว้แล้ว ไฟล์นี้จึงไม่เข้า git

**[มข.]** (เข้าด้วย `ssh project@10.198.210.127`)

```bash
mkdir -p ~/pyarena && tar -xzf ~/pyarena.tar.gz -C ~/pyarena && rm ~/pyarena.tar.gz
mv ~/.env.production.local ~/pyarena/server/.env.production.local
chmod 600 ~/pyarena/server/.env.production.local
```

> **ห้ามรัน `docker compose config` แบบไม่มี `--quiet`** เพราะจะพิมพ์ค่าลับทั้งหมดออกมา

---

## 2. ดาวน์โหลดทุกอย่างที่ต้องใช้ (สคริปต์เดียว)

**[มข.]**

```bash
cd ~/pyarena && bash deploy/kku/prepare-host.sh
```

`sudo` จะถามรหัสผ่านครั้งเดียว ใช้รหัสเดียวกับตอน ssh

สคริปต์ทำ 4 อย่าง:
1. ติดตั้ง Docker และ Compose จาก Ubuntu
   - Ubuntu 24.04 ให้ Compose 2.40.3 ซึ่งต้องการ 2.24 ขึ้นไป
2. ดึง image ที่ใช้: Ollama, busybox, Tailscale และ Node
3. ดาวน์โหลดโมเดล AI ประมาณ 3 GB เข้า volume ที่เว็บจะใช้จริง
4. build image ของ app (npm, pip และหน้าเว็บ) ใช้เวลา 5–15 นาที

**ยังไม่เปิดเว็บ** รันซ้ำได้ถ้าหยุดกลางทาง

**ต้องเห็นท้ายสุด:**
- `Done`
- รายการ image ทั้งหมด
- พื้นที่ดิสก์ที่เหลือ

จากนั้นให้ **`exit` แล้ว ssh เข้าใหม่ 1 ครั้ง** จะได้ใช้ `docker` ได้โดยไม่ต้อง sudo

---

## 3. เปิดแบบยังไม่มี Tailscale (ทดสอบในเครื่องก่อน)

**[มข.]**

```bash
cd ~/pyarena
docker compose -p pyarena --env-file server/.env.production.local up -d
```

ตรวจผล (รอจน app ขึ้น `healthy`):

```bash
docker ps --format '{{.Names}}: {{.Status}}'
curl -s http://127.0.0.1:3001/api/health/ready; echo
```

**ต้องได้:** `"status":"ready"`

**ถ้าไม่ได้:** ดู log แล้วส่งให้ Claude ดู

```bash
docker logs --tail 40 pyarena-app-1
```

> บูตครั้งนี้จะรัน migration `202611090001` บนฐาน production ด้วย (แก้ `reward_money`, `sort_order` และสไลด์โค้ดตามที่อาจารย์คอมเมนต์)

---

## 4. ย้ายที่อยู่ `pyarena.tail45e95d.ts.net` มาที่เครื่อง มข.

ชื่อ `pyarena` ตอนนี้เป็นของโน๊ตบุ๊ก ถ้าไม่เอาออกก่อน เครื่อง มข. จะได้ชื่อ `pyarena-1` ซึ่งเป็นที่อยู่ใหม่ ทำให้ Auth และ Google ใช้ไม่ได้

1. **[โน๊ตบุ๊ก]** ปิดเว็บบนโน๊ตบุ๊ก (ใช้ `stop` **ห้ามใช้ `down -v`**):

   ```bash
   docker compose -p pyarena -f docker-compose.yml -f docker-compose.gpu.yml -f docker-compose.funnel.yml --env-file server/.env.production.local stop
   ```

2. **[Tailscale admin console]** ไปที่ Machines แล้วกด **Remove** ที่เครื่อง `pyarena` (ตัวโน๊ตบุ๊ก)
3. **[Tailscale admin console]** ไปที่ Settings → Keys → **Generate auth key** เลือกแบบใช้ครั้งเดียว และไม่ใช่ ephemeral
4. **[มข.]** ใส่ key แล้วเปิด Tailscale:

   ```bash
   cd ~/pyarena
   nano server/.tailscale.env      # ใส่บรรทัดเดียว: TS_AUTHKEY=<key ที่ได้>
   chmod 600 server/.tailscale.env
   docker compose -p pyarena -f docker-compose.yml -f docker-compose.funnel.yml --env-file server/.env.production.local up -d
   ```

5. **[Tailscale admin console]** หาเครื่องใหม่ (ต้องชื่อ `pyarena`) แล้วกด **Disable key expiry**
   ถ้าไม่ปิด อีก 180 วันเว็บจะหลุด
6. **[มข.]** เครื่องเข้า tailnet แล้ว ลบ key ทิ้ง:

   ```bash
   rm ~/pyarena/server/.tailscale.env
   ```

---

## 5. ตรวจจากภายนอก

เปิดจากมือถือที่ใช้ 4G (ไม่ใช่ Wi-Fi มหาลัย):

- **https://pyarena.tail45e95d.ts.net/api/health/ready** ต้องขึ้น `"status":"ready"`
- เข้าสู่ระบบด้วยอีเมล และด้วย Google
- ถาม Lumi 1 คำถาม: คำถามแรกจะช้าเพราะโหลดโมเดล รอได้ถึง 1–2 นาที

---

## เปิด / ปิด / อัปเดตครั้งต่อไป

ทุกคำสั่งรันที่ `~/pyarena` บนเครื่อง มข. คำสั่งยาวเหมือนกันทุกครั้ง ตั้งเป็นตัวแปรไว้ก่อน:

```bash
cd ~/pyarena
C="docker compose -p pyarena -f docker-compose.yml -f docker-compose.funnel.yml --env-file server/.env.production.local"
$C stop       # ปิด
$C start      # เปิด
```

**อัปเดตโค้ด:**
1. **[โน๊ตบุ๊ก]** ทำขั้นที่ 1 ซ้ำ เฉพาะ `git archive` และ `scp deploy/kku/pyarena.tar.gz`
2. **[มข.]** แตกไฟล์ทับ แล้ว build และเปิดใหม่:

```bash
tar -xzf ~/pyarena.tar.gz -C ~/pyarena && rm ~/pyarena.tar.gz
$C build && $C up -d
```

ไฟล์ `server/.env.production.local` ไม่อยู่ใน tar จึงไม่ถูกทับ

**ห้ามทำ:**
- `docker compose down -v`: ลบโมเดลและตัวตน Tailscale ทำให้ที่อยู่เว็บอาจเปลี่ยน
- `passwd`: บัญชีนี้เป็นของอาจารย์

**ถ้าวันหนึ่งได้โดเมน `kku.ac.th` (ติดต่อ sutoch@kku.ac.th):**
1. แก้ `PUBLIC_BASE_URL` และ `AUTH_ALLOWED_ORIGINS`
2. รัน `server/scripts/configure-supabase-auth.js --apply`
3. เปิดโดยไม่ใช้ `docker-compose.funnel.yml`
