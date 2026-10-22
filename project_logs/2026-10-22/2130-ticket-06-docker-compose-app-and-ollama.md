# Ticket 06: Docker compose ที่มี app + Ollama บนเครื่องนี้

**วันที่:** 2026-10-22 ราว 21:30 (Asia/Bangkok) — Person 3 (สถาปัตยกรรมรวม)
**อ้างอิง:**
- Spec 0004
- `.scratch/self-hosted-local-llm/issues/06-docker-compose-app-and-ollama.md`

## ⚠️ เหตุการณ์ด้านความปลอดภัยระหว่างทำ ticket นี้

- **เกิดอะไรขึ้น:** ระหว่างตรวจ config ผมรัน `docker compose config` (ไม่มี `--quiet`)
  - ตอนนั้นการเขียน `docker-compose.yml` รอบใหม่ไม่สำเร็จ ไฟล์จึงยังเป็นรุ่นที่ตั้ง env file ค่าเริ่มต้นเป็น `server/.env.production.local`
  - ผลคือ**รหัสผ่านฐานข้อมูล production และ Supabase secret key ของ project ใหม่ ถูกพิมพ์ลงใน transcript ของ session Claude Code**
  - ไม่ได้อยู่ในไฟล์ใน repo, git หรือที่ไหนที่ push ขึ้นไป
- **ต้องทำ (ผู้ใช้ทำเอง):** หมุนทั้งสองค่าใน dashboard ของ project `lnijkucfutyekbxquliq` แล้วแก้ `server/.env.production.local`
  1. Database password (Project Settings → Database → Reset database password)
  2. Secret key (Project Settings → API Keys → สร้าง secret key ใหม่ แล้วลบอันเก่า)
- **กันไม่ให้เกิดซ้ำ:**
  - หัวไฟล์ `docker-compose.yml` เขียนเตือนไว้ว่าห้ามรัน `docker compose config` โดยไม่มี `--quiet`
  - การตรวจหลังจากนี้ใช้ `--quiet` และพิมพ์แค่ชื่อตัวแปร ไม่พิมพ์ค่า

## สิ่งที่ทำ

### `docker-compose.yml` (เขียนใหม่)

**บริการที่ถอดออก:** `db` (PostgreSQL) เพราะ production ใช้ Supabase ผ่าน `DATABASE_URL`

**`ollama`**
- image `ollama/ollama:0.30.0` (build 2026-06-01)
- volume `ollama-models`, healthcheck `ollama list`
- `OLLAMA_NUM_PARALLEL=1`, `OLLAMA_KEEP_ALIVE=-1`, context 4096
- KV cache แบบ `q8_0` + flash attention เพื่อลดหน่วยความจำ

**`ollama-pull`** (รันครั้งเดียวแล้วจบ)
- pull ทุกโมเดลที่ตั้งชื่อไว้ แล้วโหลดโมเดลแชทเข้าหน่วยความจำก่อน app เริ่ม
- งานไหนตั้งชื่อโมเดลว่าง (คือปิดงานนั้น) จะถูกข้าม
- ถ้าโหลดโมเดลค้างหรือไม่สำเร็จ จะเลิกรอใน 5 นาที โดยไม่กัน app ไว้
- ได้รับแค่ชื่อโมเดล 3 ตัว ไม่ได้รับทั้ง env file (ซึ่งมีรหัสผ่านฐาน)

**`app`**
- env file เดียว: `server/.env.production.local` (git ไม่ track) หรือไฟล์ที่ตั้งใน `PYARENA_ENV_FILE` ซึ่งต้องเป็นไฟล์เดียวกับ `--env-file`
- `LLM_BASE_URL` ค่าเริ่มต้นชี้ไปที่ ollama ถ้าตั้งเป็นค่าว่าง AI ทุกงานจะปิด
- พอร์ต `127.0.0.1:3001` เท่านั้น
- เริ่มหลัง `ollama-pull` จบ

### ไฟล์อื่น

- **`docker-compose.gpu.yml` (ใหม่):** จอง GPU NVIDIA ให้ ollama เครื่องที่ไม่มี GPU ใช้ไฟล์หลักไฟล์เดียว
- **`Dockerfile`:** แก้คำอธิบายบนหัวไฟล์
- **`docs/deploy.md`:** เพิ่มหมายเหตุบนหัวไฟล์ว่า compose เปลี่ยนแล้ว ส่วนคู่มือเต็มจะเขียนใน ticket 09

## ผลตรวจ

ตรวจบน Windows 11 + Docker Desktop 29.4 (WSL2), RTX 3050 Ti 4 GB, i5-12500H, RAM 16 GB

**ไฟล์ env ที่ใช้ตรวจ**
- อยู่ใน scratchpad นอก repo
- ชี้ไปที่ Postgres ชั่วคราวใน Docker กับ Supabase project ทดสอบ
- `PUBLIC_BASE_URL` เป็นค่า https สมมติ
- ไม่ได้ต่อ production

| ตรวจอะไร | ผล |
|---|---|
| `up -d --build` แบบมี GPU | ขึ้นครบ: pull โมเดล `scb10x/typhoon2.5-qwen3-4b` (2.5 GB) และ `/api/health/ready` = 200 (`migrationVersion` 202610200002) |
| Docker มองเห็น GPU | log ของ Ollama: CUDA พบ "NVIDIA GeForce RTX 3050 Ti Laptop GPU" ใช้ได้ 3.2 GiB |
| โมเดลอยู่บน GPU ทั้งตัว | **ไม่ผ่าน** `ollama ps` = 3.5 GB, 32%/68% CPU/GPU |
| app เรียกโมเดลจริง | จากใน container ของ app ผ่าน `server/ai/llm.js` ตอบภาษาไทยได้ 4–7.5 วินาทีต่อคำตอบ |
| เวลาบูตจากศูนย์ (cold) | ready ใน 98–135 วินาที รวมเวลาโหลดโมเดล |
| ไม่มี GPU (ใช้ไฟล์หลักไฟล์เดียว) | ready ใน 53 วินาที, 100% CPU, ตอบ 11–13 วินาที |
| พอร์ต | ผูกกับ `127.0.0.1:3001` · ผ่าน LAN IP ของเครื่องนี้ (192.168.0.102) ถูกปฏิเสธ · ยังไม่ได้ลองจากเครื่องอื่น |
| image safety | `container-image-safety.mjs` รันบน Windows ไม่ได้ (`docker cp` สร้าง symlink ไม่ได้) จึงตรวจใน image แทน: ไม่มีไฟล์ dotenv, ไม่มี uploads และไม่มี secret จริง (มีแค่ค่าปลอมในไฟล์เทส) · ตัวสคริปต์จริงรันใน CI (Linux) |

**ทดลองให้โมเดลอยู่บน GPU ทั้งตัว (ยังไม่สำเร็จ)**

| การตั้งค่า | สัดส่วน CPU |
|---|---|
| context 4096 | 38% |
| + KV q8_0 / flash attention | 32% |
| context 3072 | 30% |

- Windows กัน VRAM ไว้ส่วนหนึ่ง จึงเหลือให้ราว 3.2 GiB แต่โมเดลนี้ต้องใช้ 3.4–3.5 GB
- ทางแก้คือเปลี่ยนโมเดลหรือขนาด quantization ซึ่งเป็นงานของ ticket 07 (เลือกโมเดลด้วยการแก้ env)

**ความเร็ว**

| สถานะ | สร้างคำตอบ | อ่าน prompt |
|---|---|---|
| warm, context 4096 | 13.6 token/วินาที | 30 token/วินาที |
| warm, context 3072 | 16.3 token/วินาที | 44 token/วินาที |
| ครั้งแรกหลังโหลด | 5–6.6 token/วินาที | 0.6 token/วินาที |

**ปัญหาที่พบ (ส่งต่อให้ ticket 07)**
- **คำขอแรกผ่าน `/v1` หลังโหลดโมเดล timeout ที่ 45 วินาทีเสมอ** แม้ขั้นอุ่นโมเดลจะผ่านไปแล้ว คำขอต่อจากนั้นเร็วปกติ
  - คนแรกหลังเปิดระบบจึงได้คำตอบสำรองหนึ่งครั้ง
- **Docker Desktop engine restart เองหนึ่งครั้งระหว่างโหลดโมเดล**
  - container Postgres ที่ใช้ทดสอบหยุดไปด้วย และ app วนรีสตาร์ทจนฐานกลับมา
  - VM ของ Docker ได้ RAM 8 GB

## ผลกระทบ

- **วิธีรันเปลี่ยน:** ต้องใช้ `--env-file server/.env.production.local` แทน `server/.env` (ไฟล์ของ dev)
- dev server (`npm run dev`) ไม่ได้รับผลกระทบ

## ยังไม่ได้ทำ

- **ผู้ใช้:** หมุนรหัสผ่านฐานและ secret key ของ production (ดูหัวข้อแรก)
- **ticket 07:** เลือกโมเดล/quantization ให้อยู่บน GPU ทั้งตัว และแก้ timeout ของคำขอแรก
- **ticket 08:** ทางเข้าสาธารณะ (ตอนนี้ app เปิดแค่ 127.0.0.1)
- **ticket 09:** คู่มือ deploy ฉบับใหม่
- ยังไม่ได้รัน stack กับ env ของ production จริง
