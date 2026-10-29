# กันโค้ดที่วนไม่รู้จบ พิมพ์ไม่หยุด และกินหน่วยความจำ ในทุก editor

**วันที่:** 2026-10-29 (Asia/Bangkok), Person 3
**ผู้ใช้สั่ง:** เช็คว่า editor ไหนยังไม่กัน `while True` และการรันที่ใหญ่มาก (เช่น n!) แล้วแก้

## ตรวจแล้วพบ

**editor ทั้ง 5 จุดรันโค้ดผ่านสองทางเท่านั้น**

| ทาง | ใครใช้ | ที่มีอยู่แล้ว | ช่องโหว่ |
|---|---|---|---|
| Pyodide ในเบราว์เซอร์ (`hooks/usePyodide.js` + `public/pyodideWorker.js`) | แบบฝึกหัด, Debug/Challenge, มินิเกม, Arcade (ปุ่มทดสอบ), สไลด์บทเรียน | สั่งหยุด (KeyboardInterrupt) ที่ 10 วินาที และ terminate worker ที่ 14 วินาที | **ไม่จำกัด output:** `while True: print(1)` ส่งข้อความทีละบรรทัดและหน้าเว็บ render log ใหม่ทุกบรรทัด แท็บค้างก่อนถึง 10 วินาที; `print("x"*10**7)` ส่งข้อความ 10 MB ก้อนเดียว |
| Python จริงที่ server (`server/pythonRunner.js`) | การส่งคำตอบทุกโหมด, ปุ่ม run-tests ของ Competitive, ตัววัดคุณภาพ Arcade | timeout และจำกัด output 256 KB | **ไม่จำกัดหน่วยความจำ:** `a=[]` + `while True: a.append(...)` กิน RAM ระดับ GB ได้ก่อน timeout ทำงาน เสี่ยงทำให้ server ทั้งตัวล่ม |

**ไม่ต้องกังวลเรื่อง n! ใหญ่:**
- **ลูปคูณ:** ถูกสั่งหยุดกลางลูปได้
- **`math.factorial`:** ทำงานในโค้ด C ทั้งก้อน จึงสั่งหยุดกลางทางไม่ได้ แต่ถูก terminate ที่ 14 วินาทีในเบราว์เซอร์ และถูก timeout ที่ server
- **การพิมพ์ตัวเลขที่ยาวเกิน 4,300 หลัก:** Python 3.11 ขึ้นไปปฏิเสธเองอยู่แล้ว

## แก้

### เบราว์เซอร์: `client/public/pyodideWorker.js`

- **จำกัด output ต่อการรันหนึ่งครั้ง:** 50,000 ตัวอักษร และ 2,000 บรรทัด
- **เมื่อเกินเพดาน:**
  - ส่งส่วนที่เหลือของโควตาแล้วหยุดส่ง
  - ขึ้นข้อความไทย "โปรแกรมพิมพ์ผลลัพธ์ออกมามากเกินไป…"
  - สั่งหยุดโปรแกรม**ทันที** ผ่าน interrupt buffer ไม่ต้องรอ 10 วินาที
- **หน้าที่ไม่มี SharedArrayBuffer:** ส่ง `output_limit` แล้ว `usePyodide.js` จะ terminate worker และสร้างตัวใหม่
- **`MemoryError`:** ขึ้นข้อความไทย

### server: `server/pythonRunner.js`

- **บน Linux (Docker image) รันผ่าน `prlimit --as=512MB`** และตั้ง `OPENBLAS_NUM_THREADS=1`
  - ถ้า OpenBLAS ใช้หลาย thread จะจองหน่วยความจำต่อ core จน import numpy/pandas ไม่ได้ภายใต้เพดาน
  - ตั้งค่าเพดานได้ด้วย `PYTHON_MEMORY_LIMIT_MB` (ตั้ง 0 = ปิด) และบน Windows ไม่มี prlimit จึงไม่จำกัด
- **`MemoryError`:** แปลเป็นข้อความไทย `MEMORY_LIMIT_MESSAGE`

## ทดสอบ

- **`tests/python-runner-limits.test.js` (ใหม่, อยู่ใน pretest):**
  - คำสั่ง prlimit, ข้อความ MemoryError และลิสต์ที่โตไม่หยุดถูกตัดภายใน 15 วินาที (ข้อสุดท้ายรันเฉพาะ Linux)
  - ล้มก่อนแก้
  - บน Windows ผ่าน 3 ข้อ และ skip 1
  - **รันใน container ของ image ที่ deploy (Linux) ผ่าน 4/4:** ลิสต์ที่โตไม่หยุดถูกตัดใน ~3 วินาที
- **ตรวจว่าเพดานไม่ทำให้ของจริงพัง (ใน container Linux):**
  - import pandas/matplotlib/flask/requests ได้ที่ 512 MB
  - `quality-calibration.js`: เฉลย 40/40 ได้ 95+ ทุกเกณฑ์
  - `test:tasks`: 40 ข้อ 458 assertion ผ่าน
- **worker จริงในเบราว์เซอร์ (dev server, cross-origin isolated):**

  | โค้ด | ผล |
  |---|---|
  | `while True: print(1)` | หยุดใน 42 ms หลัง 2,000 บรรทัด |
  | `print("x"*10_000_000)` | ส่งแค่ 50,000 ตัวอักษรแล้วหยุด |
  | ลูปคูณ n=10⁷ | ถูกสั่งหยุดตามกำหนด |
  | ลิสต์ที่โตไม่หยุด | ถูก watchdog หยุดที่ 10 วินาที |
  | `math.factorial(200000)` | เสร็จใน 1 วินาที |
  | โค้ดปกติหลังจากนั้น | รันต่อได้ |

- ชุดเต็ม: server pretest 96 ผ่าน + 1 skip (เทสเฉพาะ Linux), ชุดหลัก 265/265, client 99/99, lint 0 error

## ผลกระทบ

- **ไม่แตะ schema, คลังโจทย์ หรือบอท**
- **คำตอบที่พิมพ์เกิน 2,000 บรรทัดในเบราว์เซอร์จะถูกหยุด:** ไม่มีโจทย์ไหนต้องพิมพ์ขนาดนั้น การตัดสินจริงอยู่ที่ server ซึ่งจำกัด 256 KB เท่าเดิม
- **ต้อง build image ใหม่ก่อนเปิดเซิร์ฟเวอร์ครั้งหน้า** ของใหม่จึงจะมีผลบนเว็บจริง
