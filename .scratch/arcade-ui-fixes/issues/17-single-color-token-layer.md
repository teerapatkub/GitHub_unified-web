# 17: รวม token สีเป็นชุดเดียว ให้ธีมที่ซื้อเขียนค่าลง token (expand)

**What to build:** ผู้เล่นที่ซื้อธีม ต้องเห็นสีเปลี่ยนทุกจุดที่ใช้ token ไม่ใช่แค่พื้นหลังกับแถบเมนูเหมือนตอนนี้

ตอนนี้มีระบบ token ซ้อนกันอยู่ 4 ชุด การย้ายใช้แบบ expand–contract และ ticket นี้คือขั้น **expand**:
- เพิ่ม token สีชุดเดียว ใช้เป็นแหล่งสีที่เดียวของทั้งเว็บ
- ธีมที่ซื้อเขียนค่าลง token ชุดนี้
- ชื่อเดิมของทั้ง 4 ชุดชี้มาที่ token ใหม่ หน้าเดิมจึงไม่พัง

นอกจากนี้:
- popup กลางจาก ticket 04 ใช้ token ชุดนี้
- กำหนดเป็น token ด้วย:
  - ขนาดตัวอักษรขั้นต่ำของป้ายกำกับ (12px)
  - สีป้ายที่ contrast ผ่าน 4.5:1

อ้างอิง: Spec 0005 Track H, audit หัวข้อปัญหาที่เป็นระบบ

**Blocked by:** 04, 11, 12 (ticket เหล่านี้แก้ไฟล์ CSS/ธีมกลางและ popup ที่ ticket นี้ต้องแตะ)

**Status:** done (2026-10-26, see project_logs/2026-10-26/0700-tickets-17-20-tokens-and-mobile-header.md)

- [x] มี token สีชุดเดียว และชื่อเดิมของทั้ง 4 ชุดเป็น alias ของ token ใหม่
  - token: `--c-*` ใน `client/src/styles/tokens.css` (ค่าเป็น RGB channel เพื่อให้ `/opacity` ของ Tailwind ใช้ได้)
  - `pysim-*`, `t-*`, `cyber-*`/`neon-*`/`cat-*` ใน Tailwind และ `--color-*` ใน `index.css` ชี้มาที่ `--c-*` ทั้งหมด
  - `--t-*` ที่ธีมในตัว (`themes.js`) เขียนและ class อย่าง `glass-panel` อ่าน ยังเป็นค่าของตัวเอง ไม่ได้ alias — เก็บไว้ให้ขั้น contract
- [x] สวมธีมที่ซื้อแล้วค่า token เปลี่ยน: ธีมอวกาศทำให้ `--c-primary` เปลี่ยนจาก `20 93 145` เป็น `109 40 217` ถอดธีมแล้วกลับเป็นค่าเดิม (ThemeContext ลบตัวแปรของธีมก่อนหน้า) หน้า `/learn` ทั้งหน้าเปลี่ยนเป็นโทนม่วง
- [x] ใช้ธีมเริ่มต้นแล้ว 7 หน้า (`/learn`, `/matchmaking`, `/matchmaking/history`, `/shop`, `/profile`, `/leaderboard`, `/achievements`) หน้าตาเหมือนเดิม — เทียบสีที่คำนวณได้ (color, background, border, background-image, box-shadow) ของทุก element ก่อนและหลังแก้ ต่างกันแค่ปุ่ม "ซื้อ" ในร้านที่ตั้งใจเปลี่ยนจาก sky-700 เป็น `pysim-primary` ให้ตามธีม
  - การเทียบรอบแรกใช้ไม่ได้ เพราะ dev server ยังเสิร์ฟ CSS จาก config เก่า ต้องรีสตาร์ตแล้วเทียบใหม่
- [x] `npm run build` และ `npm run lint` ของ client ผ่าน (lint 0 error 7 warning เท่าเดิม), `npm test` 94/94 รวมเทสใหม่ `themes/shop-palette.test.js`
- **ข้อจำกัด:** `--c-outline` (#717880) ได้ 4.47:1 บนพื้นขาว ต่ำกว่า 4.5 นิดหน่อย คงไว้เพื่อไม่ให้หน้าเดิมเปลี่ยน ข้อความเล็กควรใช้ `pysim-label`
