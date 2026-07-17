-- ==========================================
-- PySim Academy: Course Seeding Script
-- 7 Modules × 5 Lessons (35 Lessons Total)
-- ==========================================

-- Clear existing data (Optional, uncomment if needed)
-- DELETE FROM lessons;
-- DELETE FROM modules;
-- ALTER TABLE modules AUTO_INCREMENT = 1;
-- ALTER TABLE lessons AUTO_INCREMENT = 1;

-- -------------------------------------------------------------
-- MODULE 1: Hello World & Print (Required Level: 1)
-- -------------------------------------------------------------
INSERT INTO modules (module_id, title, description, order_index, required_level) VALUES
(1, 'Hello World & Print', 'เริ่มต้นการเขียนโปรแกรมด้วยภาษา Python ทำความรู้จักกับฟังก์ชัน print()', 1, 1);

INSERT INTO lessons (lesson_id, module_id, title, description, order_index, required_level, xp_reward) VALUES
(1, 1, 'Welcome to Python', 'ทำความรู้จักกับ Pythonเบื้องต้น', 1, 1, 100),
(2, 1, 'The Print Function', 'การใช้ฟังก์ชัน print() พื้นฐาน', 2, 1, 100),
(3, 1, 'Printing Strings', 'การแสดงข้อความ String', 3, 1, 100),
(4, 1, 'Printing Numbers', 'การแสดงตัวเลขและการคำนวณเบื้องต้น', 4, 1, 100),
(5, 1, 'Multiple Arguments', 'การพิมพ์หลายค่าบรรทัดเดียวกัน', 5, 1, 150);

-- -------------------------------------------------------------
-- MODULE 2: Variables & Data Types (Required Level: 2)
-- -------------------------------------------------------------
INSERT INTO modules (module_id, title, description, order_index, required_level) VALUES
(2, 'Variables & Data Types', 'อธิบายเรื่องตัวแปรและประเภทข้อมูล', 2, 2);

INSERT INTO lessons (lesson_id, module_id, title, description, order_index, required_level, xp_reward) VALUES
(6, 2, 'What are Variables?', 'ตัวแปรคืออะไร', 1, 2, 100),
(7, 2, 'String Data Type', 'ประเภทข้อมูลแบบข้อความ (str)', 2, 2, 100),
(8, 2, 'Integer & Float', 'ประเภทข้อมูลแบบตัวเลข (int, float)', 3, 2, 100),
(9, 2, 'Boolean (True/False)', 'ประเภทข้อมูลแบบตรรกะ (bool)', 4, 2, 100),
(10, 2, 'Type Casting', 'การแปลงประเภทข้อมูล', 5, 2, 150);

-- -------------------------------------------------------------
-- MODULE 3: Input & Output (Required Level: 3)
-- -------------------------------------------------------------
INSERT INTO modules (module_id, title, description, order_index, required_level) VALUES
(3, 'Input & Output', 'การรับค่าจากผู้ใช้งานด้วยฟังก์ชัน input()', 3, 3);

INSERT INTO lessons (lesson_id, module_id, title, description, order_index, required_level, xp_reward) VALUES
(11, 3, 'The Input Function', 'การใช้ input() พื้นฐาน', 1, 3, 100),
(12, 3, 'Processing Input', 'การนำข้อมูลที่รับมาประมวลผล', 2, 3, 100),
(13, 3, 'Input to Integer', 'การรับค่าเป็นตัวเลข (int)', 3, 3, 100),
(14, 3, 'String Formatting', 'การจัดรูปแบบข้อความด้วย f-string', 4, 3, 100),
(15, 3, 'A Simple Calculator', 'สร้างเครื่องคิดเลขอย่างง่าย', 5, 3, 150);

-- -------------------------------------------------------------
-- MODULE 4: Conditions (if/else) (Required Level: 4)
-- -------------------------------------------------------------
INSERT INTO modules (module_id, title, description, order_index, required_level) VALUES
(4, 'Conditions (if/else)', 'การควบคุมทิศทางโปรแกรมด้วยเงื่อนไข', 4, 4);

INSERT INTO lessons (lesson_id, module_id, title, description, order_index, required_level, xp_reward) VALUES
(16, 4, 'Boolean Expressions', 'นิพจน์ตรรกะและการเปรียบเทียบ', 1, 4, 100),
(17, 4, 'The if Statement', 'การใช้เงื่อนไข if', 2, 4, 100),
(18, 4, 'The else Statement', 'การใช้เงื่อนไข else', 3, 4, 100),
(19, 4, 'The elif Statement', 'เงื่อนไขหลายทางเลือกด้วย elif', 4, 4, 100),
(20, 4, 'Nested Conditions', 'เงื่อนไขซ้อนเงื่อนไข', 5, 4, 150);

-- -------------------------------------------------------------
-- MODULE 5: Loops (for/while) (Required Level: 5)
-- -------------------------------------------------------------
INSERT INTO modules (module_id, title, description, order_index, required_level) VALUES
(5, 'Loops (for/while)', 'การทำซ้ำด้วยคำสั่ง for และ while', 5, 5);

INSERT INTO lessons (lesson_id, module_id, title, description, order_index, required_level, xp_reward) VALUES
(21, 5, 'Introduction to Loops', 'ทำไมเราต้องใช้ Loop?', 1, 5, 100),
(22, 5, 'The while Loop', 'การใช้งาน while loop', 2, 5, 100),
(23, 5, 'The for Loop', 'การใช้งาน for loop กับอินเด็กซ์', 3, 5, 100),
(24, 5, 'Break and Continue', 'การข้ามและออกจากการทำซ้ำ', 4, 5, 100),
(25, 5, 'Nested Loops', 'Loop ซ้อน Loop', 5, 5, 150);

-- -------------------------------------------------------------
-- MODULE 6: Functions (Required Level: 6)
-- -------------------------------------------------------------
INSERT INTO modules (module_id, title, description, order_index, required_level) VALUES
(6, 'Functions', 'การสร้างฟังก์ชันเพื่อจัดการและนำโค้ดกลับมาใช้ใหม่', 6, 6);

INSERT INTO lessons (lesson_id, module_id, title, description, order_index, required_level, xp_reward) VALUES
(26, 6, 'What is a Function?', 'ฟังก์ชันคืออะไร?', 1, 6, 100),
(27, 6, 'Defining Functions', 'การสร้างฟังก์ชัน (def)', 2, 6, 100),
(28, 6, 'Arguments & Parameters', 'การส่งค่าเข้าไปในฟังก์ชัน', 3, 6, 100),
(29, 6, 'Return Values', 'การคืนค่าผลลัพธ์จากฟังก์ชัน', 4, 6, 100),
(30, 6, 'Variable Scope', 'ขอบเขตของตัวแปร (Local vs Global)', 5, 6, 150);

-- -------------------------------------------------------------
-- MODULE 7: Lists & Strings (Required Level: 7)
-- -------------------------------------------------------------
INSERT INTO modules (module_id, title, description, order_index, required_level) VALUES
(7, 'Lists & Strings', 'โครงสร้างเก็บข้อมูลแบบ List และการจัดการข้อความขั้นสูง', 7, 7);

INSERT INTO lessons (lesson_id, module_id, title, description, order_index, required_level, xp_reward) VALUES
(31, 7, 'Introduction to Lists', 'ทำความรู้จักกับ List', 1, 7, 100),
(32, 7, 'List Methods', 'ฟังก์ชันการจัดการ List (append, pop, etc.)', 2, 7, 100),
(33, 7, 'String Manipulation', 'การตัดและจัดการคำ String Methods', 3, 7, 100),
(34, 7, 'Iterating Through Items', 'พาทัวร์ List ด้วย Loop', 4, 7, 100),
(35, 7, 'Basic Dictionary', 'แถม: รู้จักกับ Dictionary สั้นๆ', 5, 7, 150);

-- ==========================================
-- END OF SCRIPT
-- ==========================================
