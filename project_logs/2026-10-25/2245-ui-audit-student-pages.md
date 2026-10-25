# Audit UI ฝั่งผู้เรียน (Impeccable audit)

**วันที่:** 2026-10-25 22:30–22:45 (Asia/Bangkok) — Person 3
**วิธีตรวจ:**
- dev server ในเครื่อง ชี้ฐานทดสอบ ใช้บัญชีทดสอบ 147 `wener` (เลเวล 10)
- ตรวจ 11 หน้า: `/learn` `/lesson/1` `/exercise/1` `/challenge` `/promotion-exam` `/profile` `/shop` `/achievements` `/leaderboard` `/matchmaking` `/online`
- ทุกหน้าตรวจที่ 375×812 (Chromium จำลองมือถือ) และบางหน้าตรวจที่ความกว้าง desktop ของ pane
- สคริปต์ตรวจในหน้า: เลื่อนแนวนอน, ขนาดปุ่ม, ชื่อปุ่ม/ลิงก์, label ของช่องกรอก, ลำดับหัวข้อ, landmark, contrast และตัวอักษรเล็ก
- กด Tab จริงเพื่อดู focus
- ทดสอบ Escape กับหน้าต่าง popup
- สแกนโค้ดด้วย `impeccable detect` และ grep

**ไม่ได้แก้โค้ด** รอบนี้เป็นรายงานอย่างเดียว ไม่ได้ทดสอบด้วยโปรแกรมอ่านหน้าจอจริงหรือมือถือจริง

## คะแนน

| # | ด้าน | คะแนน | ปัญหาหลัก |
|---|---|---|---|
| 1 | Accessibility | 2 | ปุ่มหลักในร้านค้า contrast 2.1:1, `<html lang="en">` ทั้งที่เนื้อหาเป็นไทย, popup ของ Arcade ไม่ใช่ dialog |
| 2 | Performance | 2 | หน้าโหลด 5–7 วินาที และเรียก API ซ้ำ 3 รอบ |
| 3 | Theming | 2 | สีแบบ Tailwind ดิบ 1,423 จุด เทียบกับ token `pysim-*` 410 จุด และมี token 4 ระบบปนกัน |
| 4 | Responsive | 3 | ไม่มีหน้าไหนเลื่อนแนวนอนที่ 375px แต่มีปุ่มเล็กและข้อความ 8–10px |
| 5 | Implementation Integrity | 2 | แต่ละโหมดใช้ชุด component และสีคนละชุด ข้อความภาษาไทย/อังกฤษปนกันในหน้าเดียว |
| **รวม** | | **11/20** | **Acceptable** ยังต้องแก้อีกมาก |

## Implementation Integrity: **ไม่ผ่าน (ยังไม่เป็นระบบเดียว)**
- **มี token สี 4 ระบบ:**
  - `--color-*` และ `--t-*` (`index.css:11-36`)
  - Tailwind `pysim-*`
  - `--shop-theme-*` (`ThemeContext.jsx`)
- **ไฟล์ที่ใช้สีดิบเยอะที่สุด** (`slate/rose/emerald-*`) แทบไม่ใช้ token เลย:
  - `CompetitiveArena.jsx` 225 จุด
  - `BattleRoyaleGameplayView.jsx` 144 จุด
  - `MiNi_Game.jsx` 139 จุด
  - `ExercisePage.jsx` 113 จุด
  - `CodingWorkspace.jsx` 99 จุด
- **ผลที่ผู้เล่นเห็น:** ธีมที่ซื้อจากร้านเปลี่ยนแค่ `.bg-pysim-surface` และแถบเมนู (`index.css:402-411`) หน้า Arcade, Competitive และแบบฝึกหัดจึงไม่เปลี่ยนตาม ผู้เล่นจ่ายเหรียญแล้วเห็นผลแค่บางหน้า
- **ผลจากตัวตรวจ 8 ข้อ (ยืนยันแล้ว):**
  - `side-tab` stripe ที่ `BattleRoyaleGameplayView.jsx:586`
  - `animate-bounce` 2 จุด
  - border ล่าง 3px บนการ์ดมุมโค้ง `mode-entry.css:103`
  - ฟอนต์ Inter 3 จุด
  - พื้นหลังลายตาราง `index.css:203` (หน้า login)
  - ทั้งหมดเป็นเรื่องรูปลักษณ์ ไม่ทำให้ใช้งานไม่ได้

## ปัญหาตามระดับ

### P1: ควรแก้ก่อนเปิดให้คนจริงใช้

1. **ปุ่มหลักในร้านค้าอ่านยาก**
   - ปุ่ม "ซื้อ": ตัวขาวบน `sky-400` (#38BDF8) ได้ **2.1:1**
   - ปุ่ม "กำลังสวมใส่": ตัวขาวบน `emerald-500` ได้ **2.5:1**
   - ป้าย "มีแล้ว": ตัวขาว 10px บน emerald
   - เกณฑ์ WCAG 1.4.3 คือ 4.5:1 → `ShopPage.jsx` → `/impeccable colorize`
2. **`<html lang="en">` ในขณะที่หน้าเป็นภาษาไทย**
   - โปรแกรมอ่านหน้าจออ่านไทยด้วยเสียงอังกฤษ (WCAG 3.1.1)
   - `index.html` ควรตั้ง `lang` ตาม `i18n.language`
   - เกี่ยวกับบั๊ก U1 เดิม (`i18n.js:14` บังคับ `th`) → `/impeccable harden`
3. **popup ของ Arcade ไม่ใช่ dialog**
   - หน้าต่างที่เป็นปัญหา: สร้างห้อง, ตั้งค่าห้อง, คู่มือไอเทม
   - ไม่มี `role="dialog"` หรือ `aria-modal` และ focus ไม่ย้ายเข้าไปในหน้าต่าง
   - กด Escape แล้วไม่ปิด
   - `<label>` ไม่ผูกกับช่องกรอก (ไม่มี `htmlFor`)
   - ปุ่มเลือก "2/3/4/5 คน", จังหวะ และความยาก ไม่มี `aria-pressed` คนที่ใช้โปรแกรมอ่านหน้าจอจึงไม่รู้ว่าเลือกอะไรอยู่ (WCAG 4.1.2, 2.1.2)
   - ไฟล์: `widgets/CreateRoomModal.jsx`, `RoomSettingsModal.jsx` และคู่มือไอเทม
   - **ตัวอย่างที่ดีอยู่แล้ว:** ทัวร์ Lumi ทำถูกครบทั้ง `aria-modal`, focus อยู่ในหน้าต่าง และ Escape ปิดได้ ใช้แบบเดียวกันได้ → `/impeccable harden`
4. **debuff Earthquake / Screen Shake ไม่มีทางเลือกสำหรับ `prefers-reduced-motion`**
   - ทั้ง client มีแค่ `mode-entry.css` และ `useModeTransition.js` ที่ดูค่านี้
   - การเขย่าจอรุนแรง 8 วินาทีอาจทำให้ผู้เล่นบางคนเวียนหัว (WCAG 2.3.3)
   - ควรเปลี่ยนเป็นแบบที่ไม่ขยับ เช่นเบลอหรือลด opacity แต่ให้ผลเกมเท่าเดิม → `/impeccable animate`

### P2

5. **เมนูย่อยของหน้าบทเรียนบนมือถือเป็นไอคอนล้วน ไม่มีชื่อ**
   - ลิงก์ `/learn`, `/debug`, `/challenge` ซ่อนข้อความที่ <640px และไม่มี `aria-label`
   - ผู้ใช้ทั่วไปต้องเดาความหมายของไอคอน หนังสือ / ขวดทดลอง / เป้า → `/impeccable clarify`
6. **ข้อความเล็กและสีจางเกินไป**
   - ป้ายสถิติใน Arcade ("แมตช์ / ชนะ / อัตราชนะ") เป็น 10px สี `slate-400` บนพื้นขาว ได้ **2.6:1**
   - ป้ายความยากของความสำเร็จ 10px
   - Competitive มีข้อความ 8px ("CHALLENGE #5 • …") และหลายจุดได้ 2.5–2.6:1 → `/impeccable typeset`
7. **ปุ่มเล็กกว่า 32px บนมือถือ**
   - ลิงก์ "← กลับหน้าหลัก" สูง 20px ใน 4 หน้า
   - "🔄 รีเฟรชรายการ" ใน Arcade สูง 16px
   - "ข้าม" ในทัวร์ Competitive ขนาด 23×16
   - ปุ่ม Run/Submit ใน workspace สูง 28–30px → `/impeccable adapt`
8. **แถบด้านบนบนมือถือกินพื้นที่ ~245px จาก 812**
   - แถบมี 3 ชั้น: โลโก้, ปุ่ม 6 ตัว, แท็บโหมด
   - หน้าบทเรียนมีแถบย่อยอีกชั้น
   - ใน Arcade ปุ่ม "?" ตกลงไปบรรทัดใหม่ทำให้มี 4 ชั้น
   - หน้าแบบฝึกหัดเหลือที่ให้เขียนโค้ดน้อยมาก และปุ่ม Lumi ลอยทับมุมล่างขวาของ editor → `/impeccable adapt`
9. **ทุกหน้ามีชื่อแท็บเดียวกันคือ "Python Coder Game"**
   - เป็นชื่อเก่า (ตาม PRODUCT.md ชื่อปัจจุบันคือ PyArena)
   - ชื่อแท็บไม่เปลี่ยนตามหน้า ประวัติเบราว์เซอร์และโปรแกรมอ่านหน้าจอจึงแยกหน้าไม่ได้ (WCAG 2.4.2) → `/impeccable harden`
10. **landmark และหัวข้อไม่ครบ**
    - มีแค่ `/learn` และ `/lesson/1` ที่มี `<main>` อีก 9 หน้าไม่มี
    - หน้า Arcade เริ่มหัวข้อที่ `h3` และไม่มี `h1`
    - หน้า `/challenge` มีแค่ `h2` ตัวเดียว (WCAG 1.3.1) → `/impeccable harden`
11. **ใช้ `alert()` 14 จุดแทน toast ที่มีอยู่แล้ว**
    - ในร้านค้า มีข้อความ error อังกฤษปนอยู่ เช่น "Unable to equip item" ที่ `ShopPage.jsx:335,371`
    - ในหน้าแบบวัดระดับ ใช้ `alert(err.message)` ที่ `FriendLogin.jsx:369,383` → `/impeccable clarify`
12. **ปุ่มที่กดไม่ได้มองไม่เห็นตัวหนังสือ**
    - ปุ่ม "เริ่มโจทย์แบบเนื้อเรื่อง" และ "ไปทำแบบภาคปฏิบัติ" ในหน้าบทเรียน เป็นตัวขาวบน `slate-200` ได้ **1.2:1**
    - WCAG ยกเว้นปุ่มที่กดไม่ได้ แต่ผู้เรียนควรอ่านออกว่าเป็นปุ่มอะไร และต้องทำอะไรก่อนจึงจะกดได้ → `/impeccable colorize`
13. **ช่องกรอกที่ไม่มี label**
    - ช่องค้นหาในร้านค้า (มีแค่ placeholder)
    - ช่อง "พิมพ์คำตอบ..." 2 ช่องในแบบทดสอบของบทเรียน → `/impeccable harden`
14. **หน้าสอบเลื่อนขั้นตอนเลเวล 10**
    - ขึ้น "0 / 0" พร้อมข้อความ "คุณอยู่ระดับสูงสุดแล้ว" แต่ยังโชว์ปุ่ม "ส่งตรวจ"
    - ที่ 375px ปุ่มนั้นตัดคำเป็น "ส่ง / ตรวจ" → `/impeccable harden`

### P3

15. **ไม่มีโหมดมืด:** เครื่องที่ตั้ง dark ไว้ (เครื่องทดสอบนี้ `prefers-color-scheme: dark` = true) ยังได้หน้าสว่าง ถือว่ารับได้ถ้าตั้งใจไม่ทำ
16. **ใช้ Tailwind `animate-bounce`:** ใน toast ของ Arcade (`NotificationStack.jsx:5`) และ `BattleRoyaleGameplayView.jsx:256` ควรเปลี่ยนเป็น ease-out แบบนุ่ม

## ปัญหาที่เป็นระบบ
- **สีดิบแทน token:** ส่วนใหญ่อยู่ในไฟล์ของ Person 1 และ 2 เช่น `MiNi_Game.jsx`, `ExercisePage.jsx`, `CompetitiveArena.jsx` ส่วนของ Person 3 คือ widgets ของ Arcade
- **ข้อความ 10px สี slate-400 ใช้เป็นป้ายกำกับทั่วเว็บ:** ทั้งสถิติ, ป้ายความยาก และหัวข้อเล็กตัวพิมพ์ใหญ่
- **popup แต่ละตัวทำเองคนละแบบ:** ทัวร์ Lumi ทำถูก แต่ popup ของ Arcade ไม่ถูก ควรมี component `Dialog` ตัวเดียวแล้วใช้ร่วมกัน

## สิ่งที่ทำได้ดี
- ไม่มีหน้าไหนเลื่อนแนวนอนที่ 375px รวมหน้า workspace ที่มี Monaco
- แท็บตัวกรองของหน้าอันดับเลื่อนแนวนอนได้อย่างตั้งใจ
- focus มองเห็นชัด: กด Tab แล้วได้ outline 2.4px สี #145D91 บนปุ่มของแถบเมนู (`:focus-visible` ทำงาน)
- ทัวร์ Lumi เป็น dialog ที่ถูกต้อง: `aria-modal`, focus อยู่ข้างใน และ Escape ปิดได้
- รูปทุกรูปมี `alt` และปุ่มไอคอนบนแถบเมนูมี `aria-label` ครบ (ร้านค้า, อันดับ, ภาษา, วิธีใช้)
- แยก route และ vendor ออกเป็นหลาย bundle แล้ว (main 372 KB, Arcade 142 KB, Supabase 224 KB ก่อน gzip)
- ปุ่ม "เรียนต่อ" เป็นสีน้ำตาลบนพื้นเหลือง contrast ~5.6:1 ผ่าน

## ลำดับที่แนะนำ
1. [P1] `/impeccable colorize`: ปุ่มร้านค้า, ป้ายสถานะ และปุ่มที่กดไม่ได้ ให้ได้ ≥4.5:1
2. [P1] `/impeccable harden`: popup ของ Arcade (dialog, focus, Escape, label, `aria-pressed`), `lang`, ชื่อแท็บ, `<main>`/`h1`
3. [P1] `/impeccable animate`: แบบสำรองของ Shake/Earthquake เมื่อเปิด reduced motion และเลิกใช้ bounce
4. [P2] `/impeccable typeset`: เลิกใช้ป้าย 8–10px สีจาง
5. [P2] `/impeccable adapt`: แถบด้านบนบนมือถือ, ขนาดปุ่ม และตำแหน่งปุ่ม Lumi ในหน้า workspace
6. [P2] `/impeccable clarify`: ชื่อของเมนูไอคอน และเปลี่ยน `alert()` เป็น toast ภาษาไทย
7. `/impeccable polish` เป็นขั้นสุดท้าย

## ข้อสังเกตเรื่องขอบเขตทีม
- **ไฟล์ของ Person 1:** ข้อ 5, 8 (workspace), 12, 13 (บทเรียน), 14 และสีดิบใน `MiNi_Game`/`ExercisePage`/`CodingWorkspace`
- **ไฟล์ของ Person 2:** ข้อ 6 (Competitive) และสีดิบใน `CompetitiveArena.jsx`
- **ต้องตกลงร่วมกันก่อนแก้:** ส่วนกลางคือ `index.html`, `index.css`, แถบเมนู และ `ThemeContext`
- ถ้า Person 3 จะแก้ไฟล์ของคนอื่น ต้องบันทึกใน `docs/handoff-to-person-1.md` ก่อน
