# 2026-11-17 23:50 — เปลี่ยนฟอนต์ทั้งเว็บ (สิ่งที่ต้องแก้ไข.md ข้อ 10)

## สิ่งที่แก้
- **ฟอนต์ใหม่ (ผู้ใช้เลือก):**
  - หัวข้อ: **Mitr**
  - เนื้อความ: **IBM Plex Sans Thai Looped**
  - โค้ด: **IBM Plex Mono**
  - ทั้งสามตัวมีตัวไทยและอังกฤษในชุดเดียว
- `client/index.html`: โหลดเฉพาะน้ำหนักที่ใช้
  - Mitr 400–700
  - Plex Thai Looped 400–700
  - Plex Mono 400–600
  - เลิกโหลด Outfit และ Inter
- `client/src/index.css`:
  - ตัวแปรกลาง `--font-body`, `--font-display`, `--font-code`
  - body และ h1–h6 ใช้ตัวแปรเหล่านี้
  - ข้อความไทย (`html[lang="th"]`) ได้ระยะบรรทัด 1.65
  - คลาส tracking แบบกว้าง (`tracking-wide/wider/widest`, `tracking-[0.18em]` ถึง `[0.32em]`) ไม่ยืดระยะตัวอักษรเมื่อหน้าเป็นภาษาไทย
- `client/src/components/mode-entry.css`: header ใช้ตัวแปรเดียวกัน ระยะตัวอักษรของชื่อ PyArena ลดลงให้เข้ากับ Mitr
- `client/tailwind.config.js`: `font-sans` / `font-display` / `font-mono` ชี้ไปที่ตัวแปร
- `client/src/utils/editorFont.js` (ใหม่):
  - `EDITOR_FONT_FAMILY` ใช้กับ Monaco ทั้ง 5 ที่ (แบบฝึกหัด, Debug/Challenge, Mini Game, Arcade, Competitive)
  - `installEditorFontRemeasure()` (เรียกใน `main.jsx`) วัดขนาดตัวอักษรใหม่เมื่อฟอนต์โหลดเสร็จ ไม่ให้เคอร์เซอร์เพี้ยน และไม่ดึง Monaco มาโหลดเอง

## เหตุผล
- Outfit และ Inter ไม่มีตัวไทย ข้อความไทยจึงใช้ฟอนต์ของเครื่อง หน้าตาต่างกันทุกเครื่อง และไม่เข้ากับตัวอังกฤษในบรรทัดเดียวกัน

## ทดสอบจริง (Playwright 1366×768)
- `/learn`, `/debug`, `/online`, `/matchmaking`:
  - body ใช้ Plex Thai Looped, h1 และชื่อแบรนด์ใช้ Mitr, editor ใน `/debug` ใช้ Plex Mono
  - `document.fonts` โหลดฟอนต์ครบตามที่ตั้ง
  - ดูภาพหน้าจอแล้ว ข้อความไทยและอังกฤษเข้ากัน
- `eslint` 0 error, `npm run build` ผ่าน

## ผลกระทบ
- ทุกหน้า: ความกว้างของข้อความเปลี่ยน (Mitr กว้างกว่า Outfit)
  - ปุ่มหรือป้ายที่พอดีเป๊ะอาจขึ้นบรรทัดใหม่ ยังไม่ได้ไล่ดูทุกหน้า
- ไม่กระทบ schema หรือ Bot AI

## ยังไม่ได้ทำ
- ข้อความ `text-[10px]` ที่ควรขยายเป็นขั้นต่ำ 14px
- ป้ายอังกฤษพิมพ์ใหญ่ (ข้อ 9)
- `font-black` (900) ไม่มีในฟอนต์ใหม่ เบราว์เซอร์ใช้ 700 แทน

---

## แก้เพิ่ม 2026-11-18 00:10 — ใช้ฟอนต์เดียวทั้งเว็บ
- **ผู้ใช้:** ใช้หลายฟอนต์แล้วรู้สึกแปลกและไม่เข้ากับเว็บ
- **หัวข้อ:** `--font-display` ชี้ไป `--font-body` เลิกโหลด Mitr
  - หัวข้อใช้ IBM Plex Sans Thai Looped น้ำหนัก 700
  - ยังแยกตัวแปรไว้ เผื่ออยากแต่งหัวข้อแยกภายหลัง
- **ป้ายที่ไม่ใช่โค้ดแต่เคยใช้ `font-mono`:** เปลี่ยนเป็นฟอนต์ปกติ (ใช้ `tabular-nums` ให้ตัวเลขตรงกัน)
  - "ภาคปฏิบัติ 1/5" (`LearningPage.jsx`)
  - รหัสห้อง ARC-xxxx (`ProfilePage.jsx`)
  - แถบชื่อไฟล์ main.py (`CodeWorkbench.jsx`)
  - ข้อความว่างของช่องผลลัพธ์ (`OutputPanel.jsx`)
- **ที่ยังใช้ IBM Plex Mono:** เฉพาะโค้ดจริงและผลลัพธ์ของโปรแกรม
  - ต้องเป็นตัวกว้างเท่ากัน ไม่งั้นโค้ดเยื้องผิดและรูปดาวหรือตารางที่พิมพ์ออกมาเบี้ยว
  - เป็นครอบครัวเดียวกันจึงหน้าตาเข้ากัน
- **ต้องรีสตาร์ท dev server หลังแก้ `tailwind.config.js`:** ตัวที่รันอยู่ยังใช้ config เก่า (`font-sans` เป็น Inter)
- **ทดสอบ (Playwright 1366×768):**
  - นับฟอนต์ของทุกองค์ประกอบที่มีข้อความใน `/learn`, `/debug`, `/online`, `/matchmaking`, `/shop`, `/profile`
  - ทุกข้อความเป็น IBM Plex Sans Thai Looped ยกเว้น editor และผลลัพธ์โค้ด
  - eslint 0 error, build ผ่าน
