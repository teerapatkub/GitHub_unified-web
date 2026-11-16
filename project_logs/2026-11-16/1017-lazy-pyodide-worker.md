# โหลด Pyodide แบบ lazy + worker ตัวเดียวทั้งแอป

**วันที่**: 2026-11-16 10:17 (ICT)

## สรุปสิ่งที่แก้

- `client/src/hooks/usePyodide.js` — เขียนใหม่ภายใน API เดิม
  - worker ย้ายไปอยู่ระดับ module (`runtime`) สร้างครั้งแรกตอน `runCode()` หรือ `preload()` ไม่ใช่ตอน mount
  - ไม่ terminate ตอน unmount ย้ายหน้าแล้วใช้ Python ตัวเดิมต่อ
  - สถานะของ runtime กระจายให้ทุก hook ผ่าน `useSyncExternalStore`; ก่อนบูต `status` = `'ready'` (กดรันได้)
  - ข้อความของ worker ส่งเข้า hook ที่กำลังรันอยู่ตัวเดียว (`runtime.sink`) และการรันต่อคิวผ่าน `runtime.queue`
  - watchdog เริ่มหลังโหลดเสร็จ; timeout / `stopRun` / output limit ยัง kill แล้วสร้าง worker ใหม่ทันทีเหมือนเดิม
  - `stopRun` ระหว่างที่ยังโหลดอยู่ หยุดงานแต่ปล่อยให้โหลดต่อ (ไม่ทิ้งไฟล์ 14 MB ที่ดาวน์โหลดไปแล้ว)
  - unmount ระหว่างรัน → หยุดงานของหน้านั้น ไม่ให้ `input()` ที่ไม่มีใครตอบค้างคิวของหน้าอื่น
  - เพิ่ม `preload` ในค่าที่ hook คืน และ export `preloadPyodide()`
- `client/src/pages/Arcade/hooks/useRoundJudging.js` — เรียก `preload()` เมื่อ phase เป็น `ROUND_1`–`ROUND_4`
  รอบที่จับเวลาจะได้ไม่เสียเวลาโหลด Python ตอนกด trial run ครั้งแรก
- `docs/handoff-to-person-1.md` — บันทึกให้ Person 1 (เจ้าของ `usePyodide.js`)

## เหตุผล

ผู้ใช้บน VM ของมหาวิทยาลัยบ่นว่าหน้าเว็บโหลดช้า ทุกหน้าที่ใช้ hook (รวม LessonPage ที่ส่วนใหญ่แค่อ่าน)
ดาวน์โหลดและบูต Pyodide ~14 MB ตอนเปิดหน้า และบูตใหม่ทุกครั้งที่เปลี่ยนหน้า

## ผลกระทบ

- ไม่มี caller ต้องแก้ (ทุกตัวเช็ค `status === 'ready'` ซึ่งยังใช้ได้)
- ข้อความ "Loading Python runtime" ย้ายไปขึ้นตอนรันครั้งแรก
- ถ้ามีสองหน้ารันพร้อมกัน จะรันทีละงานแทนพร้อมกัน (ก่อนหน้านี้แต่ละหน้ามี worker ของตัวเอง)
- ไม่แตะ schema, server, grader, Bot AI หรือ `public/pyodideWorker.js`

## ทดสอบแล้ว

- `npm run lint` (client): 0 errors (warning 7 ตัวเดิมในไฟล์อื่น) · `npm run build`: ผ่าน
- `npm run test:arcade` (server, `TEST_DATABASE_URL` → `pyarena-test-db`): ผ่านทุกตัว exit 0
- dev server จริง (Vite :5174 + `server-scratch`) โดย import `usePyodide.js` จาก Vite แล้ว mount ด้วย React ในหน้า:
  - mount ใน StrictMode 3 วิ: ไม่มีการโหลด `pyodideWorker.js` / สร้าง worker เลย
  - รันครั้งแรก `print(6*7)` → 42 ใช้ 3.5 วิ (status ready → loading → running)
  - unmount แล้ว mount hook ใหม่ ("หน้าใหม่") รันได้ใน 15 ms ไม่สร้าง worker ใหม่ · `input()` แบบ interactive ได้ `n: 42`
  - `while True: pass` หยุดที่ 10 วิด้วย interrupt (หน้าเป็น cross-origin isolated) worker เดิมรันต่อได้
  - `stopRun` ระหว่างลูป → สร้าง worker ใหม่ 1 ตัว รันต่อได้ · `stopRun` ระหว่างรอ `input()` → Stopped
  - unmount ระหว่างรอ `input()` → Stopped และหน้าใหม่รันต่อได้ · สองหน้ารันพร้อมกัน → ต่อคิว output ไม่ปนกัน
  - หลัง reload: `preload()` สองครั้งสร้าง worker ตัวเดียว รันหลัง preload ใช้ 16 ms

## ยังไม่ได้ทดสอบ

- ยังไม่ได้เปิดหน้า LessonPage / ExercisePage / Arcade จริงหลัง login (pane ไม่ได้ล็อกอิน) — ทดสอบระดับ hook ใน
  เบราว์เซอร์จริงแทน ควรเปิด `/lesson/1` แล้วดู DevTools Network ว่าไม่มี `pyodide.asm.wasm` จนกว่าจะกด Run
- เส้นทาง terminate ชั้นที่สอง (14 วิ) ไม่ได้ถูกกระตุ้นตรงๆ เพราะหน้าเป็น cross-origin isolated ชั้นแรกจึงหยุดลูปได้ก่อน
  (โค้ด restart เป็นตัวเดียวกับ `stopRun` ซึ่งทดสอบแล้ว)

## หมายเหตุ

ตอนเริ่มทดสอบได้บูต config `server` (ซึ่งใช้ `.env` → Supabase test DB) ไปหนึ่งครั้ง มันล้มที่
`migrateProblems` (`cannot drop columns from view mini_game_exercises`) ก่อนถึง Arcade seed จึงไม่ได้ insert อะไร
แล้วเปลี่ยนไปใช้ `server-scratch` (DB ในเครื่อง) แทน — ข้อผิดพลาด view นั้นอยู่นอกขอบเขตงานนี้
