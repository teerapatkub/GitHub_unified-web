# Spec 0002 — ความปลอดภัยและประตูตรวจรับก่อน Deploy

สถานะ: `ready-for-agent`

ศัพท์ในเอกสารนี้ใช้ตามอภิธานศัพท์ของ PyArena และสอดคล้องกับ ADR เรื่องการแยกวิธีเข้าสู่ระบบออกจากบัญชีผู้เล่นเดิม

---

## Problem Statement

PyArena มีฟังก์ชันหลักของบทเรียน, Competitive Arena และ Arcade พร้อมใช้งานในเครื่องพัฒนาแล้ว แต่ยังไม่ควรเปิดให้ผู้ใช้ทั่วไป เพราะเส้นทางติดตั้งจริงยังมีความเสี่ยงที่กระทบข้อมูลผู้ใช้ การเข้าสู่ระบบ และความต่อเนื่องของเกม

ความเสี่ยงเร่งด่วนที่สุดคือ repository สาธารณะมีไฟล์สำรองฐานข้อมูลที่ถูกติดตามโดย Git และมีข้อมูลบัญชีจริงกับค่าแฮชรหัสผ่าน การลบเฉพาะไฟล์ปัจจุบันไม่เพียงพอ เพราะข้อมูลยังคงอยู่ในประวัติ Git และไฟล์เหล่านี้ยังอาจเข้าไปอยู่ใน Docker build context ได้

ระบบ Authentication ใช้ Supabase Auth ร่วมกับบัญชีผู้เล่นเดิมตามแนวทางที่ยอมรับไว้แล้ว แต่ production image ยังไม่ได้รับค่า Supabase ฝั่ง browser อย่างครบถ้วน, URL สำหรับอีเมลอาจย้อนกลับไปที่ localhost, SMTP สำหรับผู้ใช้ทั่วไปยังไม่ผ่านการตรวจจริง และกระบวนการสร้างหรือเชื่อมบัญชีมีกรณีที่ฐานข้อมูล commit สำเร็จแต่การตอบกลับขาดหาย ซึ่งอาจทำให้ลบ Supabase user ที่เชื่อมกับบัญชีผู้เล่นแล้วและเกิดบัญชีกำพร้า นอกจากนี้ผู้ดูแลที่เข้าสู่ระบบด้วยอีเมล Supabase ยังไม่สามารถใช้คำสั่งผู้ดูแลที่ผูกกับ token รุ่นเดิมได้ครบ

ขอบเขตความปลอดภัยของ API ยังไม่แน่นอนพอสำหรับอินเทอร์เน็ตสาธารณะ บาง endpoint ส่งเฉลยของโจทย์กลับไปโดยไม่ต้องยืนยันตัวตน และ public views ยังไม่ได้กำหนดสิทธิ์ให้ชัดเจน ระบบเริ่มรับ traffic ก่อนยืนยันว่าฐานข้อมูลและ schema พร้อมใช้งาน ขณะที่ health check อ้างอิง Supabase Data API ซึ่งอาจให้ผลลวงทั้งผ่านและไม่ผ่านตามการตั้งค่า exposure ของโครงการ ไม่ใช่ตามความพร้อมของแอป

ใน Arcade กระบวนการ rematch เคารพคำตอบ “อยู่ต่อ” แล้ว แต่ผู้เล่นที่ไม่อยู่ต่อยังถูกนับในความจุห้อง ทำให้ห้องขนาดเล็กติดสถานะเต็ม ทั้งที่เริ่มแมตช์ใหม่ไม่ได้ ส่วนหน้าเว็บยังมี route บางหน้าที่ตรวจ session ก่อน Auth พร้อมหรือไม่บังคับเข้าสู่ระบบ และตารางอันดับยังสมมติว่า API อยู่ origin เดียวกันพร้อมตีความ error เป็นรายการว่าง

ชุดทดสอบที่มีอยู่ยืนยันส่วนสำคัญหลายส่วนแล้ว แต่ยังไม่มีประตูตรวจรับ production ที่รวมการกำจัดข้อมูลลับจากประวัติ Git, Docker image จริง, schema migration, Supabase email flow, admin flow, browser refresh, จอแคบ และ dependency audit เข้าด้วยกัน จึงยังไม่มีหลักฐานเดียวที่ใช้ตัดสินใจ deploy ได้อย่างมั่นใจ

## Solution

จัดทำกระบวนการ hardening และ release gate ที่ปิดความเสี่ยงตามลำดับผลกระทบ เริ่มจากตอบสนองเหตุข้อมูลบัญชีใน repository สาธารณะ จากนั้นทำให้ Authentication, สิทธิ์ฐานข้อมูล, startup, health check, Docker และ SMTP ใช้ค่าจริงของ production ได้อย่างตรวจสอบซ้ำได้ แล้วจึงแก้ regression ของ Arcade กับ route ฝั่งหน้าเว็บ

ผลลัพธ์ที่ต้องได้มีดังนี้:

- ประวัติ Git, working tree และ production image ไม่มีไฟล์สำรองฐานข้อมูล ข้อมูลบัญชี ค่าแฮชรหัสผ่าน หรือ secret ที่ไม่ควรเผยแพร่
- ผู้ใช้เดิมยังคงหมายเลขบัญชีผู้เล่น เลเวล เหรียญ ความคืบหน้า และของตกแต่งเดิมเมื่อเชื่อมวิธีเข้าสู่ระบบ Supabase
- การสมัคร ยืนยันอีเมล เข้าสู่ระบบด้วยอีเมลหรือชื่อผู้ใช้ ลืมรหัสผ่าน ออกจากระบบ และเข้าสู่ระบบด้วย Google ทำงานตามสัญญาเดียวกัน โดย server เป็นผู้ตัดสินตัวตนและสิทธิ์
- ผู้ดูแลที่ยืนยันตัวตนผ่านวิธีที่รองรับได้รับสิทธิ์จากบทบาทของบัญชีผู้เล่น ไม่ต้องพึ่ง token รุ่นเก่าที่ client ต้องเก็บเอง
- เนื้อหาโจทย์ที่ส่งให้ client ไม่มีเฉลย และการตรวจคำตอบเกิดบน server
- การเปิดเผยตารางและ view ผ่าน Supabase Data API ถูกปิดหรือจำกัดด้วยนโยบายที่ระบุชัด
- process จะพร้อมรับ traffic หลังเชื่อมต่อฐานข้อมูลและใช้ migration ครบเท่านั้น โดยแยก liveness ออกจาก readiness
- production build ได้รับเฉพาะ publishable Supabase configuration ที่ browser ต้องใช้ ส่วน secret และ management token อยู่เฉพาะบริบทที่จำเป็น
- ห้อง Arcade หลังจบแมตช์เปิดรับผู้เล่นตาม roster ที่เลือกอยู่ต่อจริง และสามารถเริ่มแมตช์ใหม่ได้โดยไม่ดึงผู้ที่ออกไปกลับมา
- route ที่ต้องเข้าสู่ระบบรอให้ Auth พร้อมก่อนตัดสิน และ API URL ทำงานได้ทั้ง same-origin กับ split-origin deployment
- release ผ่านชุดตรวจอัตโนมัติและ browser smoke test เดียวกันบน production build ก่อน deploy

## User Stories

### ข้อมูลบัญชีและ secret

1. As a ผู้เล่น, I want ข้อมูลอีเมลและรหัสผ่านของฉันไม่ปรากฏใน repository, so that บัญชีของฉันไม่ถูกนำไปใช้โดยบุคคลอื่น
2. As a ผู้ดูแลโครงการ, I want ไฟล์สำรองฐานข้อมูลถูกลบจากประวัติ Git ทั้งหมด, so that การ checkout commit เก่าไม่เปิดเผยข้อมูลเดิมอีก
3. As a ผู้ดูแลโครงการ, I want production image ไม่มีไฟล์สำรองหรือ environment file, so that ผู้ที่เข้าถึง image ไม่ได้ secret เพิ่มเติม
4. As a ผู้ดูแลโครงการ, I want มีรายชื่อประเภท credential ที่ได้รับผลกระทบโดยไม่คัดลอกค่าจริงลงเอกสาร, so that สามารถหมุนคีย์และสื่อสารกับผู้ใช้ได้ครบ
5. As a ทีมพัฒนา, I want CI ปฏิเสธไฟล์ฐานข้อมูลและรูปแบบ secret ที่หลุดเข้ามาใหม่, so that เหตุการณ์เดิมไม่เกิดซ้ำ
6. As a ทีมพัฒนา, I want คำสั่งสร้าง image มี build context ที่จำกัด, so that ไฟล์นอก artifact ที่ต้องใช้ไม่ถูกบรรจุโดยไม่ตั้งใจ

### บัญชีผู้เล่นและ Authentication

7. As a ผู้เล่นเดิม, I want เชื่อม Supabase Auth กับบัญชีผู้เล่นเดิม, so that เลเวล เหรียญ ความคืบหน้า และของตกแต่งของฉันไม่หาย
8. As a ผู้เล่นเดิม, I want เข้าสู่ระบบได้ทั้งชื่อผู้ใช้และอีเมล, so that การเปลี่ยนระบบไม่ทำให้ฉันจำวิธีใหม่ทันที
9. As a ผู้ใช้ใหม่, I want สมัครด้วยอีเมลและได้รับข้อความยืนยันจริง, so that ฉันเปิดใช้งานบัญชีได้ด้วยตนเอง
10. As a ผู้ใช้, I want ลิงก์ยืนยันอีเมลกลับมายังโดเมน production ที่ถูกต้อง, so that ฉันไม่ถูกส่งไป localhost
11. As a ผู้ใช้, I want ขอเปลี่ยนรหัสผ่านและตั้งรหัสผ่านใหม่ได้จากลิงก์อีเมล, so that ฉันกู้บัญชีได้โดยไม่ต้องติดต่อผู้ดูแล
12. As a ผู้ใช้, I want ออกจากระบบแล้ว token ทั้งฝั่งแอปและ Supabase ใช้งานต่อไม่ได้, so that คนที่ใช้เครื่องต่อจากฉันเข้าเกมในชื่อฉันไม่ได้
13. As a ผู้ใช้ Google เดิม, I want ยังเข้าสู่ระบบด้วย Google ได้, so that การเพิ่ม Email Auth ไม่ตัดวิธีเดิมของฉัน
14. As a ผู้เล่น, I want ระบบไม่สร้างบัญชีผู้เล่นซ้ำเมื่อ network ขาดหลัง commit, so that ข้อมูลเกมของฉันไม่แยกเป็นหลายบัญชี
15. As a ผู้เล่น, I want การสมัครหรือเชื่อมบัญชีที่ retry ใช้ผลเดิมอย่างปลอดภัย, so that การกดซ้ำไม่สร้าง user หรือ mapping ซ้ำ
16. As a ผู้ดูแลระบบ, I want ตรวจพบและซ่อม provisioning ที่ค้างได้, so that ปัญหาชั่วคราวไม่ทิ้งบัญชีกำพร้าถาวร
17. As a ผู้ดูแล, I want เข้าสู่ระบบด้วยอีเมล Supabase แล้วใช้หน้าผู้ดูแลตามบทบาทของฉันได้, so that ไม่ต้องย้อนกลับไปใช้ credential รุ่นเก่า
18. As a ผู้เล่นทั่วไป, I want คำขอผู้ดูแลถูกปฏิเสธจากบทบาทที่ server ตรวจแล้ว, so that การแก้ค่าใน browser ไม่เพิ่มสิทธิ์ให้ฉัน
19. As a ผู้ดูแลโครงการ, I want SMTP production ส่งอีเมลถึงผู้ใช้นอกทีมได้, so that การสมัครและกู้รหัสผ่านใช้งานจริงได้
20. As a ผู้ดูแลโครงการ, I want management access token ไม่อยู่ใน runtime ของเกม, so that สิทธิ์จัดการ Supabase ไม่รั่วผ่าน service ที่ไม่จำเป็น

### API และฐานข้อมูล

21. As a ผู้เรียน, I want เนื้อหาโจทย์ที่โหลดเข้า browser ไม่มีเฉลย, so that การเรียนและการแข่งขันไม่ถูกข้ามด้วยการดู network response
22. As a ผู้เรียน, I want server ตรวจคำตอบของฉันและคืนเฉพาะผลที่จำเป็น, so that กติกาการตรวจเหมือนกันสำหรับทุกคน
23. As a ผู้ดูแลข้อมูล, I want ตารางและ view ทุกตัวมีสิทธิ์และนโยบายที่ระบุชัด, so that Data API ไม่เปิดข้อมูลเพราะค่าเริ่มต้นของแพลตฟอร์มเปลี่ยน
24. As a ผู้ดูแลข้อมูล, I want view ที่จำเป็นต้องเปิดใช้สิทธิ์ของผู้เรียก, so that view ไม่ข้ามข้อจำกัดของตารางต้นทาง
25. As a ผู้ดูแลการติดตั้ง, I want schema ถูกเปลี่ยนด้วย migration ที่มีลำดับและตรวจเวอร์ชันได้, so that การ deploy ซ้ำให้ผลเหมือนเดิม
26. As a ผู้ดูแลการติดตั้ง, I want migration ที่ล้มเหลวหยุดการเปิด service, so that traffic ไม่เข้าสู่ schema ครึ่งหนึ่ง
27. As a ผู้ดูแลการติดตั้ง, I want readiness ตรวจ PostgreSQL และ schema version โดยตรง, so that สถานะพร้อมสะท้อนความพร้อมของแอปจริง
28. As a ผู้ดูแลการติดตั้ง, I want liveness แยกจาก readiness, so that orchestrator แยก process ค้างออกจาก dependency ที่ยังไม่พร้อมได้
29. As a ผู้ดูแลการติดตั้ง, I want health check ไม่พึ่งการเปิดตารางผ่าน Supabase Data API, so that การปิด Data API ไม่ทำให้แอปที่สมบูรณ์ถูกมองว่าพัง

### Production runtime และ supply chain

30. As a ผู้ใช้ Email Auth, I want production bundle มี URL และ publishable key ที่ถูกต้อง, so that หน้า login, callback และ recovery ติดต่อ Supabase ได้
31. As a ผู้ดูแลการติดตั้ง, I want server secret ถูกส่งตอน runtime และค่าฝั่ง browser ถูกส่งตอน build อย่างแยกกัน, so that ไม่มี secret ถูกฝังใน JavaScript
32. As a ผู้ดูแลการติดตั้ง, I want URL สาธารณะและ allowed origins ถูกกำหนดชัดใน environment ของ deployment, so that redirect และ CORS ไม่ย้อนกลับไปค่าพัฒนา
33. As a ผู้ดูแลการติดตั้ง, I want environment file ผ่านการตรวจรูปแบบก่อนเริ่ม Compose, so that ชื่อตัวแปรที่พิมพ์ผิดไม่หยุดการ deploy กลางทาง
34. As a ผู้ดูแลระบบ, I want container ทำงานด้วยผู้ใช้ที่ไม่มีสิทธิ์ root, so that ผลกระทบจากช่องโหว่ runtime ถูกจำกัด
35. As a ผู้ดูแลระบบ, I want ไฟล์อัปโหลดอยู่บน persistent storage, so that deploy รุ่นใหม่ไม่ลบข้อมูลผู้ใช้
36. As a ทีมพัฒนา, I want dependency ที่มีช่องโหว่ระดับสูงหรือวิกฤตถูกอัปเดตหรือมีข้อยกเว้นที่บันทึกเหตุผล, so that release ไม่มีความเสี่ยงที่ทราบแล้วโดยไม่มีเจ้าของ
37. As a ทีมพัฒนา, I want lockfile เป็นตัวกำหนด dependency ที่ deploy, so that local, CI และ production ใช้เวอร์ชันเดียวกัน
38. As a ผู้ดูแลการติดตั้ง, I want rollback ใช้ image และ schema ที่เข้าคู่กัน, so that สามารถย้อนรุ่นเมื่อเกิดเหตุโดยไม่ทำข้อมูลเสียหาย

### Arcade และประสบการณ์หน้าเว็บ

39. As a ผู้เล่น Arcade ที่เลือกอยู่ต่อ, I want ห้องนับเฉพาะผู้เล่นที่อยู่ใน roster ของแมตช์ใหม่, so that ผู้เล่นใหม่เข้าร่วมได้เมื่อมีที่ว่างจริง
40. As a ผู้เล่น Arcade ที่เลือกออก, I want ไม่ถูกนับในความจุและไม่ถูกดึงเข้าแมตช์ใหม่, so that การตัดสินใจออกของฉันมีผลครบวงจร
41. As a หัวห้อง Arcade, I want เริ่ม rematch ได้เมื่อมีผู้เล่นที่ยืนยันครบขั้นต่ำ, so that ห้องไม่ค้างเพราะสมาชิกจากแมตช์เก่า
42. As a ผู้เล่น Arcade, I want retry คำสั่งอยู่ต่อหรือเริ่มเกมไม่เพิ่มสมาชิกซ้ำ, so that network retry ไม่เปลี่ยน roster
43. As a ผู้ใช้ที่ยังไม่เข้าสู่ระบบ, I want route ที่ป้องกันไว้ส่งฉันไปหน้า login หลัง Auth ตรวจเสร็จ, so that ฉันไม่เห็นหน้า error ที่ตีความว่าไม่มีข้อมูล
44. As a ผู้ใช้ที่มี session, I want refresh หน้าสอบเลื่อนระดับแล้วกลับมาหน้าเดิม, so that การโหลด session ช้าไม่ทำให้ฉันหลุดจากงาน
45. As a ผู้ใช้ที่ยังไม่เข้าสู่ระบบ, I want หน้า achievement ใช้พฤติกรรมเดียวกับ route ที่ป้องกันอื่น, so that การนำทางของเว็บคาดเดาได้
46. As a ผู้ใช้ตารางอันดับ, I want หน้าเว็บเรียก API จากฐานที่กำหนดไว้และแสดง error จริง, so that split-origin deployment ไม่แสดงรายการว่างแทนปัญหาเชื่อมต่อ
47. As a ผู้ใช้มือถือ, I want Authentication, ตารางอันดับ, โปรไฟล์ และ Arcade rematch ใช้งานได้บนจอแคบ, so that flow สำคัญไม่ขึ้นกับหน้าจอ desktop

### การตรวจรับ release

48. As a ทีมพัฒนา, I want lint แยก generated artifacts ออกจาก source ที่ต้องแก้และให้ source จริงผ่านทั้งหมด, so that error สำคัญไม่ถูกกลบด้วยไฟล์ที่ไม่ควรถูก lint
49. As a ทีมพัฒนา, I want client และ server test ผ่านบนฐานข้อมูลทดสอบที่ทิ้งได้, so that การตรวจไม่แตะข้อมูล production
50. As a ทีมพัฒนา, I want production image ถูก build และเปิดจริงใน CI หรือ staging, so that เราไม่ได้อาศัยเฉพาะ dev server
51. As a ผู้ตรวจรับ, I want browser smoke test ครอบคลุม signup, login, logout, recovery, admin, refresh และ rematch, so that flow ที่ผู้ใช้พบจริงได้รับการพิสูจน์
52. As a ผู้ดูแลโครงการ, I want มีรายงาน release gate ที่เก็บ command, รุ่น image และผลตรวจ, so that การตัดสินใจ deploy ตรวจสอบย้อนหลังได้
53. As a ผู้ดูแลโครงการ, I want release ถูกปฏิเสธเมื่อ security scan, migration, audit หรือ browser smoke test ล้มเหลว, so that ความเร่งไม่ข้ามเงื่อนไขสำคัญ

## Implementation Decisions

### การตอบสนองเหตุข้อมูลใน repository

- จัดการไฟล์สำรองที่มีข้อมูลบัญชีเป็น security incident ก่อนงาน deploy อื่น ตรวจเฉพาะชนิดและขอบเขตของข้อมูลโดยไม่คัดลอกค่าจริงเข้า issue, log หรือ test fixture
- ลบไฟล์จาก working tree และเขียนประวัติ Git ใหม่ให้ทุก commit ไม่มีข้อมูลดังกล่าว จากนั้นประสานการ force-push, clone ใหม่ และการยกเลิก cache หรือ artifact ที่เกี่ยวข้อง
- ประเมิน credential ที่ได้รับผลกระทบและหมุนคีย์หรือบังคับ reset ตามชนิดข้อมูล แฮชรหัสผ่านที่เปิดเผยถือเป็นข้อมูลที่ต้องตอบสนอง แม้ไม่ใช่รหัสผ่านแบบ plain text
- ป้องกันการเกิดซ้ำทั้ง ignore rules, Docker ignore, secret scanning และ repository policy โดยครอบคลุมไฟล์สำรองในทุก subdirectory

### ตัวตนและสิทธิ์

- คงบัญชีผู้เล่นเป็นเจ้าของข้อมูลเกม และเก็บวิธีเข้าสู่ระบบเป็นตัวตนที่เชื่อมกับบัญชีเดิมตาม ADR ที่ยอมรับแล้ว ห้ามใช้ข้อมูลอีเมลจาก client เป็นหลักฐานเชื่อมบัญชีเพียงอย่างเดียว
- รองรับ Email Auth ของ Supabase และ Google เดิมในช่วงเปลี่ยนผ่าน แต่ทั้งสองวิธีต้องจบที่ principal รูปเดียวกันบน server ซึ่งมีหมายเลขบัญชีผู้เล่นและบทบาทที่ตรวจแล้ว
- เปลี่ยนสิทธิ์ผู้ดูแลให้ใช้บทบาทจาก principal ที่ยืนยันแล้ว เลิกให้ client ส่ง token ผู้ดูแลรุ่นเดิมเป็นแหล่งสิทธิ์หลัก
- ทำ account provisioning เป็นขั้นตอนที่บันทึกสถานะและ reconcile ได้ การ retry ต้อง idempotent และการชดเชยด้วยการลบ Supabase user ทำได้เฉพาะเมื่อพิสูจน์ได้ว่าไม่มี mapping ที่ commit แล้ว
- จำกัด management access token ให้อยู่ในเครื่องมือ setup หรือ CI ที่ต้องใช้เท่านั้น ไม่ส่งเข้า application runtime และไม่รวมใน image
- กำหนด production Site URL, allowed redirect URLs, public base URL, client URL และ allowed origins เป็นค่า exact ของ environment เป้าหมาย รองรับ preview URL ด้วยกฎที่แคบเท่าที่จำเป็น
- ใช้ custom SMTP ที่ยืนยันผู้ส่งแล้ว และปรับ rate limit ให้สอดคล้องกับปริมาณจริงหลังผ่านการทดสอบส่งถึง mailbox ภายนอก

### API และฐานข้อมูล

- middleware ยืนยันตัวตนต้องทำงานก่อน router ที่อ่านหรือเปลี่ยนข้อมูลผู้เล่น ผู้ดูแล และเนื้อหาที่ไม่ควรเป็นสาธารณะ
- API โหลดโจทย์ส่งเฉพาะข้อความ โค้ดตั้งต้น และ metadata ที่ผู้เรียนต้องใช้ ไม่ส่งเฉลยหรือข้อมูลที่ใช้สร้างเฉลย การตรวจคำตอบเรียก server endpoint ที่เป็นเจ้าของคำตัดสิน
- ตรวจทุก table, view และ function ใน public schema แล้วกำหนด grants, Row Level Security และ `security_invoker` ตามการใช้งานจริง ค่าเริ่มต้นของแพลตฟอร์มไม่ถือเป็น policy ของแอป
- เปลี่ยน schema ด้วย migration ที่มีหมายเลขเวอร์ชันและตรวจผลได้ การเริ่ม server ต้องรอการเชื่อมต่อและ migration สำเร็จ ถ้าล้มเหลว process ต้องไม่ประกาศ readiness
- แยก liveness endpoint ที่ไม่พึ่ง dependency ออกจาก readiness endpoint ที่ตรวจ PostgreSQL, migration version และ dependency จำเป็น ห้ามใช้ Data API exposure เป็นตัวแทนความพร้อมของฐานข้อมูล
- ใช้ transaction กับการเปลี่ยน schema และ provisioning เท่าที่ฐานข้อมูลรองรับ พร้อมบันทึกขั้นตอนที่ย้อนกลับไม่ได้และวิธี recover

### Build, runtime และ configuration

- production client build รับ Supabase URL และ publishable key ผ่าน build arguments ที่ประกาศชัด ส่วน service secret, database credential และ SMTP credential รับเฉพาะ runtime ฝั่ง server
- ให้ deployment ใช้ environment manifest ที่ระบุ required, optional และ forbidden variables และตรวจชื่อกับค่าที่จำเป็นก่อน build หรือ start
- ใช้ same-origin API เป็นค่าหลักสำหรับ image รวม แต่คงการกำหนด API base URL สำหรับ deployment ที่แยก origin ทุกหน้าเรียกผ่าน client API abstraction เดียวกัน
- ลด Docker build context ให้เหลือไฟล์ที่ต้อง build, รันด้วย non-root user และ mount พื้นที่อัปโหลดเป็น persistent volume
- อัปเดต dependency ที่มีช่องโหว่ตามเส้นทางที่ใช้งานจริงก่อน หากยังแก้ไม่ได้ต้องมีเจ้าของ วันหมดอายุ และ mitigation ที่ตรวจได้ จึงจะอนุญาต exception
- ใช้ lockfile และคำสั่งติดตั้งแบบ deterministic ใน CI กับ production image

### Arcade และ routing

- เมื่อจบแมตช์ แยกประวัติผู้เข้าร่วมเดิมออกจาก roster ที่มีสิทธิ์เริ่มแมตช์ใหม่ การนับความจุ การ join และการ start ใช้ roster ใหม่เดียวกัน
- คำสั่งอยู่ต่อ ออก และเริ่ม rematch ต้องตรวจสมาชิก สถานะเกม และ idempotency ฝั่ง server ผู้เล่นที่ไม่ได้ยืนยันอยู่ต่อไม่ถูกเพิ่มกลับโดย client
- route ที่ป้องกันทั้งหมดใช้ guard เดียวกันซึ่งรอ Auth initialization ก่อนตัดสิน redirect และรักษา destination เพื่อกลับมาหลัง login ได้
- ตารางอันดับและหน้าอื่นใช้ API client กลาง ตรวจสถานะ HTTP ก่อนอ่านข้อมูล และแยก empty state ออกจาก error state

### ประตูตรวจรับ release

- release candidate ต้องผ่าน secret/history scan, dependency audit, lint, unit/integration tests, migration test, production image build, container startup และ browser smoke test
- lint configuration สามารถ exclude generated vendor artifact ที่ไม่ได้แก้ด้วยมือ แต่ source ของแอปต้องไม่มี lint error ก่อนผ่านประตู
- ทุก test ที่ใช้ฐานข้อมูลหรือ Supabase Auth รันกับ environment ที่ทิ้งได้ ห้ามใช้ production project หรือข้อมูลผู้ใช้จริง
- เก็บ release evidence ที่ระบุ commit, image digest, migration version, environment class และผลแต่ละ gate โดยไม่เก็บ secret

## Testing Decisions

ทดสอบพฤติกรรมที่สังเกตจากภายนอก ไม่ผูกกับชื่อฟังก์ชันหรือลำดับเรียกภายใน การผ่านต้องตรวจทั้งผลตอบกลับ สถานะที่บันทึกจริง และพฤติกรรมหลัง refresh หรือ retry เทสที่ไม่สามารถยืนยัน assertion เพราะ fixture ไม่มีข้อมูลต้องล้มเหลวแทนการผ่านเงียบ

ใช้ seam หลักสี่จุด:

1. **Authenticated HTTP กับ PostgreSQL/Supabase test environment ที่ทิ้งได้** — ครอบคลุม signup, confirmation, username/email login, recovery, logout, Google compatibility, admin role, provisioning ที่ขาดการตอบกลับ, quiz secrecy, grants และ migration readiness ใช้แนวทางเดียวกับ integration tests ของ Auth ที่มีอยู่
2. **Arcade HTTP fixture ที่มีอยู่** — ครอบคลุม remain/leave, capacity, join, host transfer, start rematch และ retry โดยทดสอบห้องขนาดสองคนที่มีหนึ่งคนอยู่ต่อ หนึ่งคนออก และผู้เล่นใหม่เข้าร่วมเป็น regression หลัก
3. **Production container seam** — build image ด้วยค่า browser configuration แบบ production, start กับฐานข้อมูลใหม่, ตรวจ liveness/readiness, migration, non-root runtime, persistent upload และยืนยันว่า image ไม่มี backup, environment file หรือ management token
4. **Browser UI บน production build** — ใช้ผู้ใช้ทดสอบจริงกับ Email Auth และ Google ครอบคลุม login, confirmation callback, recovery, logout, admin, หน้าบทเรียน, หน้าสอบเลื่อนระดับ, achievement, leaderboard, โปรไฟล์ผู้เล่นอื่น และ Arcade rematch จากนั้นทำซ้ำด้วย refresh และ viewport มือถือ

การตรวจ repository และ supply chain เป็น gate เพิ่มเติมที่ทำก่อน seam อื่น:

- scan tracked files และประวัติ Git เต็มรูปแบบ ต้องไม่พบข้อมูลบัญชี ค่าแฮชรหัสผ่าน secret หรือไฟล์สำรองที่กำหนดห้าม
- ตรวจ Docker context และ filesystem ของ image ที่ build แล้ว ไม่อาศัย ignore rule เพียงอย่างเดียว
- dependency audit ของ production dependencies ต้องไม่มีระดับ high หรือ critical ที่ไม่ได้รับ exception ตามนโยบาย
- client tests, server tests, lint และ production build ต้องผ่านจาก clean checkout ด้วยคำสั่งที่เอกสารระบุ
- จำลอง database connection failure กับ migration failure แล้ว readiness ต้องไม่ผ่านและ traffic ของแอปต้องไม่เปิด
- ทดสอบ redirect ด้วย URL production และ URL ที่ไม่ได้อนุญาต โดย URL หลังต้องถูกปฏิเสธ
- ทดสอบ email delivery ถึง mailbox ที่ไม่ใช่สมาชิกทีม Supabase พร้อม confirmation และ recovery link ที่ใช้ได้ครั้งเดียวตามอายุที่กำหนด
- ทดสอบ ambiguous provisioning failure โดยทำให้การตอบกลับหลัง database commit ขาดหาย แล้ว retry ต้องกลับสู่บัญชีผู้เล่นเดิมโดยไม่ลบ Supabase user ที่เชื่อมแล้ว
- ทดสอบ leaderboard เมื่อ API แยก origin, ได้ 401, ได้ 500 และได้รายการว่าง เพื่อยืนยันว่า UI แสดงแต่ละสถานะแตกต่างกัน

Release ผ่านเมื่อ gate ทั้งหมดเป็นสีเขียวบน commit และ image เดียวกัน ไม่ใช้ผลจาก dev server แทน production image และไม่มีขั้นตอน manual ที่ยังไม่ได้บันทึกผล

## Out of Scope

- การเลือกผู้ให้บริการ hosting ขั้นสุดท้าย การซื้อโดเมน และการกด deploy production จริง
- การเปลี่ยนจาก Email + Password เป็น Passwordless OTP
- การย้าย Google sign-in ไป Supabase ในรอบนี้
- รูปแบบเกมใหม่ เช่น Arcade 2v2 โจทย์ใหม่ หรือการเปลี่ยนสูตรคะแนน
- การออกแบบ UI ใหม่ทั้งระบบ นอกเหนือจากสถานะ loading, error, redirect และ responsive behavior ที่จำเป็นต่อ flow ที่ตรวจรับ
- การย้ายไฟล์อัปโหลดไป object storage ใหม่ หาก persistent volume ที่เลือกผ่านข้อกำหนดการสำรองและกู้คืน
- การเพิ่มขนาดรองรับเกินขอบเขตปัจจุบันของโครงการ งานนี้ตรวจความถูกต้องและความพร้อมสำหรับผู้ใช้เป้าหมาย ไม่ใช่การออกแบบระบบขนาดใหญ่ใหม่
- การนำข้อมูล production จริงมาใช้เป็น test fixture

## Further Notes

- สเปกนี้ต่อยอดและแทนส่วน deploy-readiness ที่ยังค้างใน Spec 0001 โดยไม่เปลี่ยนการตัดสินคำตอบฝั่ง server ที่ทำไปแล้ว
- การคงบัญชีผู้เล่นเดิมและการเชื่อม Supabase Auth ต้องรักษาการตัดสินใจใน ADR เรื่องการแยกตัวตนสำหรับเข้าสู่ระบบออกจากบัญชีผู้เล่น
- ห้ามใส่อีเมล ค่าแฮชรหัสผ่าน token หรือรายละเอียดระบุตัวผู้ได้รับผลกระทบลง GitHub issue ให้เก็บ incident inventory ในช่องทางจำกัดสิทธิ์
- ก่อนเขียนประวัติ Git ใหม่ ให้ประสานสมาชิกทุกคนและรักษางานที่ยังไม่ commit ไว้ หลัง force-push ทุก clone ต้องทำตามขั้นตอน recovery ที่กำหนด ห้าม merge ประวัติเก่ากลับเข้า repository
- Supabase custom SMTP ต้องถือเป็นข้อกำหนด production เพราะ SMTP เริ่มต้นเหมาะสำหรับการทดสอบแบบจำกัดเท่านั้น: https://supabase.com/docs/guides/auth/auth-smtp
- Redirect URL ต้องกำหนด production Site URL แบบ exact และรายการ preview ที่ตั้งใจรองรับ: https://supabase.com/docs/guides/auth/redirect-urls
- การเลือก direct, session pooler หรือ transaction pooler ต้องตรงกับข้อจำกัดของ runtime และการใช้ prepared statements: https://supabase.com/docs/guides/database/connecting-to-postgres
- การตรวจสิทธิ์ Data API ต้องไม่สมมติค่าเริ่มต้นเดิม เพราะ Supabase เปลี่ยนนโยบายการ expose ตารางใหม่: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
- หลัง implementation ผ่าน release gate จึงจัดทำ deployment plan ที่ระบุ hosting, domain, DNS, TLS, backup, monitoring, rollback และวัน cutover จริง
