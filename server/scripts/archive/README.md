# สคริปต์ที่ใช้ครั้งเดียวแล้วจบ

ไฟล์ในโฟลเดอร์นี้ถูกใช้ครั้งเดียวตอนย้ายข้อมูลหรือ seed เนื้อหาเข้าฐานข้อมูล
แล้วไม่ได้ถูกเรียกจากที่ไหนอีกเลย — ไม่มีใน `package.json`, ไม่มีใน `server.js`
และไม่มีใน `db.js`

**เก็บไว้ ไม่ลบ** เพราะเป็นบันทึกว่าเนื้อหาในฐานข้อมูลวันนี้มาจากไหน โดยเฉพาะ
เนื้อเรื่องมินิเกมและบทสนทนา ซึ่ง `db.js` ไม่ได้ seed ให้เองตอนบูต ถ้าต้องสร้าง
ฐานข้อมูลใหม่จากศูนย์ อาจต้องกลับมาอ่านไฟล์พวกนี้

| ไฟล์ | เคยใช้ทำอะไร |
|---|---|
| `seed_story_mini_games.js` · `mini_game_subtopics_seed.sql` | ใส่เนื้อเรื่องและด่านมินิเกมชุดแรก |
| `setup_mini_game_dialogue_branches.js` · `setup_mini_game_dialogue_choices.js` · `add_mini_game_branch_questions.js` | ใส่บทสนทนาและทางแยกของมินิเกม |
| `update_mini_game_thai_copy.js` · `reset_mini_game_print_only_lesson1.js` · `fix_mini_game_intro_expected_any.js` | แก้ข้อความและเทสเคสของมินิเกมย้อนหลัง |
| `inspect_mini_game_schema.js` | เครื่องมือดูโครงสร้างตารางตอนสำรวจ |
| `update_contract_solutions.js` | แก้เฉลยของโจทย์งานรับจ้าง |
| `migrate_mysql_dump_to_postgres.js` · `import_fullproject_dump.ps1` · `fullproject_mysql_dump.sql` · `mysql_fullproject_upgrade.sql` · `missing_from_fullprojectpython_27_6_69.sql` | ย้ายฐานข้อมูลจาก MySQL มา PostgreSQL ตอนรวมโปรเจคกับ Person 1 |
| `after_friend_db_import_keep_our_shop_theme.sql` | กู้ธีมร้านค้าของเราคืนหลัง import ฐานข้อมูลของเพื่อน |

**การแก้ schema วันนี้ต้องทำใน `server/db.js` หรือ `server/problemsSchema.js` เท่านั้น**
ห้ามรันไฟล์ในโฟลเดอร์นี้ใส่ฐานข้อมูลที่ใช้งานอยู่
