# Merge สอง branch ทดสอบ และแก้ server crash เมื่อโปรแกรมผู้เล่นจบก่อนอ่าน input

**วันที่:** 2026-10-22 20:19 (Asia/Bangkok) — Person 3 (สถาปัตยกรรมรวม)

## สิ่งที่ทำ

### 1. Merge เข้า main ตามที่ผู้ใช้สั่ง

- `refs/heads/claude/charming-hawking-e732c3` (`d267aca`): fast-forward
  - `test:score`, `test:draw`, `test:spectator` และ `test:bots` กลายเป็น node:test ที่บูต server เอง และล็อกอินผู้เล่นได้หลายคน
- `refs/heads/claude/wonderful-borg-952da0` (`52094af`), merge commit `266c2b0`
  - เพิ่มรายงานความเสียหายของฐานทดสอบ และสคริปต์ `server/scripts/repair-problem-test-cases.js`
  - **ยังไม่ได้รันสคริปต์กับฐานทดสอบ** ตามที่ผู้ใช้สั่ง

### 2. แก้ server crash (`server/pythonRunner.js`)

**อาการ**
- หลัง merge รัน `npm run test:arcade` แล้ว `test:bots` / `test:draw` ตกแบบสุ่มด้วย "fetch failed"
- ปรับ helper ให้แสดง log ของ server เมื่อ request ล้ม แล้วเห็นว่า server ตายด้วย `Error: write EPIPE` (Unhandled 'error' event)

**สาเหตุ**
- โปรแกรม Python ที่จบก่อนอ่าน stdin หมด (เช่น `exit()` หรือ crash ตั้งแต่บรรทัดแรก) ทำให้ pipe ปิด
- การเขียน input ที่ยังค้างอยู่จึงเกิด EPIPE (บน Windows เป็น EOF) เป็น event แบบ async บน `child.stdin`
- `try/catch` รอบ `write()` จับไม่ได้ และ Node จบทั้ง process เมื่อไม่มีใครรับ event นี้
- **production ก็โดน:** คำตอบของผู้เล่นแบบนี้ทำให้ server ล่มทั้งตัวได้ ส่วนการตรวจคำตอบของบอทใน Arcade เจอได้บ่อย

**วิธีแก้**
- เพิ่ม `child.stdin.on('error', () => {})` ก่อนเขียน
- ผลตรวจยังรายงานผ่าน handler `close` เหมือนเดิม

**เทสใหม่:** `tests/python-runner-closed-stdin.test.js` (อยู่ใน pretest)
- ส่ง input ขนาด 4 MB ให้โค้ด `sys.exit(0)` 5 ครั้ง
- fail ด้วย uncaught `write EOF` ก่อนแก้ และผ่านหลังแก้

**`tests/helpers/start-server.js`:** ถ้า request ไปไม่ถึง server ให้ error บอก code (`ECONNRESET` ฯลฯ) และว่า server ยังรันอยู่หรือจบไปแล้ว พร้อม log ท้ายสุดของ server

## ผลตรวจ

| ชุด | ผล |
|---|---|
| server `npm test` | pretest 74/74, ชุดหลัก 208/208 |
| `npm run lint` | ผ่าน |
| `npm run test:arcade` | ผ่านครบทุกชุด 2 รอบติด (ก่อนแก้ตกแบบสุ่ม 2 ใน 2 รอบ) |
| `npm run test:submit` | 7/7 |
| `npm run test:grader` | 17/17 บนฐานชั่วคราวที่บูตจาก seed |

## ผลกระทบ

- ไม่เปลี่ยนการตัดสินคำตอบ: ผลยังมาจาก exit code และ output เหมือนเดิม
- schema ไม่เปลี่ยน

## ยังไม่ได้ทำ

- **รันสคริปต์ซ่อมฐานทดสอบ:** รอผู้ใช้สั่ง และต้องรันก่อนบูต server กับฐานนั้นครั้งต่อไป
- **`sim:bots`:** ยังตกบนฐานทดสอบจนกว่าจะซ่อมข้อมูล
- **ถามทีมว่าใครต่อฐานทดสอบราว 03:40 วันที่ 21 ต.ค.:** โค้ดแก้โจทย์ที่ใช้ `code_checks` ต้องแก้ให้กรองโหมดก่อน merge
