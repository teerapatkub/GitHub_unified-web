# เพิ่มของตกแต่งผ่านแอดมิน

วันที่: 2026-10-02 (Asia/Bangkok)

## เปลี่ยนแปลง

- `server/themeRoutes.js`: GET/POST/PUT ของเอฟเฟกต์ ธีม กรอบ และพื้นหลัง ใช้ shop_items เดิม ตรวจข้อมูลราคา URL เอฟเฟกต์ และหมวด
- `server/adminAccess.js`, `server/server.js`: token ลงนามหลังล็อกอินแอดมินสำหรับ API ใหม่ พร้อมตรวจ role/ban/delete จากฐานข้อมูล Token อายุ 8 ชั่วโมงและหมดผลหลังรีสตาร์ต
- `client/src/admin/pages/ThemePage.jsx`: ส่ง token แสดงผลบันทึก/ข้อผิดพลาดเป็นข้อความ ดูรูป relative URL ได้ แสดงสถานะโหลด และซ่อนผ่าน is_active แทนการลบ
- `server/db.js`: ไม่เขียนทับรายการในชุดธีมที่มีอยู่ระหว่าง seed
- เพิ่ม test:themes ใน server/package.json และ fixture/test scripts ที่ใช้ตาราง TEMP เท่านั้น

## เหตุผลและผลกระทบ

หน้าเดิมเรียก endpoint ที่ไม่มี ทำให้ได้ HTML Cannot POST /api/themes การเพิ่มผ่านหน้าแอดมินขณะนี้เขียนรายการใหม่ในตารางเดียวกับร้านค้า ไม่ย้ายตาราง ไม่เปลี่ยน id/set_key/ownership ของรายการเดิม ไม่สร้างข้อมูลทดสอบถาวร ผู้ใช้แอดมินต้องล็อกอินใหม่หลังรีสตาร์ต

## ผลตรวจ

- API integration tests 46 checks ผ่าน: สี่หมวด เพิ่ม/อ่าน/แก้/ซ่อน/คืนแสดง ราคา/URL ผิด การแก้ข้ามหมวด สิทธิ์ปลอม/หมดอายุ/ถูกถอน และการรักษารายการเดิม
- Browser ใช้ API จริงกับ TEMP tables: เพิ่มธีมและเอฟเฟกต์จากฟอร์ม ตรวจหลัง refresh และจอ 390×844 / 1280×900
- npm run build ผ่าน มี warning เดิมเรื่อง eval ใน MiNi_Game และขนาด bundle
- npx eslint src/admin/pages/ThemePage.jsx ผ่าน
- npm run lint ทั้ง client ยังไม่ผ่าน: 54 errors / 9 warnings ในโค้ดเดิมและไฟล์อื่น
- npm test ทั้ง client/server ไม่มี script ชื่อนี้
- รีสตาร์ต API จริงบนพอร์ต 3001 และล็อกอินบัญชีแอดมินเดิมเพื่อ GET สี่หมวด: 200 ทั้งหมด
- checksum ข้อมูล shop_items 24 รายการ + shop_sets 4 เซ็ตก่อน/หลังรีสตาร์ตตรงกันทั้งหมด

## ขอบเขตที่ยังคงเดิม

- /api/upload เก็บไฟล์บน server; ไม่ได้ย้ายไฟล์ไป Supabase Storage
- ยังไม่เพิ่มหน้าจอจัดชุด shop_sets และไม่ทดสอบซื้อจริงด้วยเงินผู้ใช้
- ไม่มีการแก้รหัสผ่านหรือสิทธิ์บัญชีจริงในการพัฒนานี้
