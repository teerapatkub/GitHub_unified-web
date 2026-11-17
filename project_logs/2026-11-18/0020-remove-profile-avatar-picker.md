# 2026-11-18 00:20 — เอาตัวเลือกรูปโปรไฟล์ออกจากหน้าโปรไฟล์

## สิ่งที่แก้
- `client/src/pages/ProfilePage.jsx`:
  - เอาแถวรูปโปรไฟล์ให้เลือก (`avatar_options`) ใต้รูปหลักออก
  - ลบ state `avatarBusy` / `avatarError` และฟังก์ชัน `runAvatarChange`, `handleAvatarReset`, `handleSelectOption`
  - ไม่รับ prop `onUserRefresh` แล้ว
  - ปุ่ม "แต่งโปรไฟล์" ยังอยู่ กดแล้วไปหน้า `/profile/appearance`
- `client/src/App.jsx`: เลิกส่ง `onUserRefresh` ให้ `ProfilePage`

## เหตุผล
- ผู้ใช้บอกว่าเลือกรูปได้ที่หน้าแต่งโปรไฟล์อยู่แล้ว ตัวเลือกซ้ำในหน้าโปรไฟล์จึงไม่จำเป็น

## ผลกระทบ
- ไม่แตะ API: `/api/profile/:id/avatar/select` และ `/reset` ยังอยู่ หน้าแต่งโปรไฟล์ใช้ต่อ
- `avatar_options` ยังส่งมากับข้อมูลโปรไฟล์ หน้านี้แค่ไม่ได้ใช้

## ทดสอบจริง
- Playwright เปิด `/profile` ที่ 1366×768:
  - ไม่มีปุ่มรูปเล็กเหลือ
  - ปุ่ม "แต่งโปรไฟล์" ยังอยู่ใต้รูป
- eslint: 0 error
