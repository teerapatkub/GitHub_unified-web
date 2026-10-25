# 05: debuff ทำงานกับการตั้งค่าลด animation

**What to build:** ถ้าผู้เล่นตั้งเครื่องให้ลด animation (`prefers-reduced-motion`) แล้วโดน Earthquake หรือ Screen Shake จอจะไม่ขยับ แต่จะเบลอหรือจางแทน
- อ่านยากพอๆ กับแบบเขย่า
- อยู่นานเท่ากัน
- ผลคือผู้เล่นไม่ได้เปรียบหรือเสียเปรียบ

ใน ticket นี้รวมอีกสองเรื่อง:
- การแจ้งเตือนและป้ายที่เด้ง (`animate-bounce`) เปลี่ยนเป็นค่อยๆ เข้าแบบนุ่ม
- ข้อความบน debuff ทุกตัว (เช่น Ink Fog) ย้ายไปอยู่ในตารางแปลของ Arcade เมื่อ UI เป็นไทย ข้อความก็เป็นไทย (แก้ A5)

อ้างอิง: Spec 0005 Track B, audit P1 ข้อ 4 และ P3 ข้อ 16, บั๊ก A5

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] เทส client (logic ล้วน): debuff ทุกตัวมีแบบแสดงผลสองแบบ และทั้งสองแบบอยู่นานเท่ากัน
- [ ] ทดสอบผ่าน dev server โดยเปิด reduced motion: โดน Earthquake แล้วจอไม่ขยับ แต่ยังบังการอ่านอยู่
- [ ] ไม่มี `animate-bounce` เหลือในหน้า Arcade
- [ ] ข้อความ debuff เป็นไทยเมื่อตั้ง UI เป็นไทย และเป็นอังกฤษเมื่อตั้ง EN
- [ ] `typing-debuffs.test.js` และ `npm run test:arcade` ผ่าน
