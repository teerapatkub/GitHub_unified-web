# D11 follow-up: API client and user test

## งานที่ทำ

- ย้ายคำขอที่เหลือของ Competitive Arena, หน้าแบบฝึกหัด, โปรไฟล์ และ Arcade ไปใช้ API client กลาง เพื่อให้ API ที่แยก origin ทำงานเหมือนกันทุกหน้าและตรวจ HTTP error ก่อนใช้ผลลัพธ์
- แยกสถานะกำลังโหลด, ไม่มีข้อมูล, 401, server error และ network error ใน Competitive; เพิ่มสถานะผิดพลาดและ retry ให้กล่องจดหมาย และไม่แสดงว่าบันทึกฉบับร่างสำเร็จเมื่อคำขอล้มเหลว
- แยกข้อความข้อผิดพลาดของ Dashboard และแบบฝึกหัด พร้อมรักษา feedback ของการตรวจคำตอบ เช่น hint และ error line
- เพิ่ม regression สำหรับ Dashboard, แบบฝึกหัด และ payload ข้อผิดพลาดของ API client

## การตรวจรับ

- `client/npm test`: ผ่าน 33/33
- `client/npm run build`: ผ่าน (มีคำเตือนเรื่อง bundle ขนาดใหญ่)
- ESLint เฉพาะไฟล์ที่แก้: ไม่มี error; มี warning ของ hook dependency เดิม 3 รายการ
- `git diff --check`: ผ่าน
- Full `client/npm run lint` ยังไม่ผ่าน เพราะ error เดิมในไฟล์อื่นและ generated `public/pyodideWorker.js`; ไม่ได้ขยายขอบเขตไปแก้ไฟล์เหล่านั้น
- User test บน production build ที่ localhost:3001 ต่อกับ Supabase จริง: เข้าระบบด้วยบัญชีทดสอบ pong, เปิด leaderboard, โปรไฟล์ผู้อื่น, Competitive, บทเรียน, แบบฝึกหัด และ Arcade; refresh แล้วยังอยู่ใน session; logout แล้ว protected route พาไป login; login อีกครั้งกลับไปยัง path/query/hash เดิม; ทดสอบ viewport แคบและการสลับภาษา Competitive; console ไม่มี error ในรอบสุดท้าย

## สถานะ

งานแก้และตรวจรับ D11 follow-up เสร็จแล้ว ยังไม่ได้เริ่มงาน deploy หรือ D12
