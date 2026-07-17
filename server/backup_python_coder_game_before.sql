-- Manual backup of python_coder_game
CREATE TABLE `achievements` (
  `achievement_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `difficulty` enum('Medium','Hard','Very Hard') NOT NULL,
  `reward_money` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`achievement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('1', 'Hello World', 'หาเงินจากการเขียนโค้ดได้ครบ 500 บาทแรก', 'Medium', '50.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('2', 'First Bill Paid', 'จ่ายค่าใช้จ่ายงวดแรกสำเร็จทันเวลา', 'Medium', '100.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('3', 'Syntax Hero', 'เขียนโค้ดงานระดับง่ายโดยไม่มี Error เลย 1 ครั้ง', 'Medium', '50.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('4', 'Coffee Lover', 'ซื้อไอเทมกาแฟ/เครื่องดื่มชูกำลังครบ 5 ครั้ง', 'Medium', '20.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('5', 'Junior Developer', 'ทำงานรับจ้างสำเร็จครบ 10 งาน', 'Medium', '150.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('6', 'Bug Squasher', 'แก้ไขบั๊กในโค้ดสำเร็จรวม 20 ตัว', 'Medium', '100.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('7', 'Survivor Week', 'เอาชีวิตรอดผ่านสัปดาห์แรก (7 วัน) โดยไม่เกมโอเวอร์', 'Medium', '200.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('8', 'Night Owl', 'ทำงานโต้รุ่ง (ช่วงเวลากลางคืนในเกม) ติดต่อกัน 3 วัน', 'Medium', '50.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('9', 'Fast Typer', 'ทำงานเสร็จก่อนเวลาที่กำหนด 30% ในงานระดับใดก็ได้', 'Medium', '80.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('10', 'Savings Starter', 'มีเงินเก็บในบัญชีคงเหลือครบ 5,000 บาท', 'Medium', '100.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('11', 'Full Stack Master', 'อัปเกรดทักษะ (Skill) ครบทุกด้านจนเลเวลเต็ม', 'Hard', '500.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('12', 'Deadline Fighter', 'ส่งงานและรับเงินใน 5 วินาทีสุดท้ายก่อน Deadline', 'Hard', '300.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('13', 'Crisis Manager', 'จ่ายค่าใช้จ่ายงวดใหญ่โดยเหลือเงินติดตัวน้อยกว่า 10 บาท', 'Hard', '500.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('14', 'Senior Developer', 'ทำงานรับจ้างสำเร็จครบ 50 งาน', 'Hard', '1000.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('15', 'No StackOverflow', 'ทำงานระดับยาก (Hard Task) สำเร็จโดยไม่ใช้ตัวช่วย', 'Hard', '800.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('16', 'High Roller', 'มีเงินเก็บสะสมครบ 100,000 บาท', 'Hard', '2000.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('17', 'Arena Champion', 'ชนะการแข่งขันในโหมดออนไลน์ 5 ครั้งติดต่อกัน', 'Hard', '1500.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('18', 'Month Survivor', 'เอาชีวิตรอดผ่านเดือนแรก (30 วัน) ได้สำเร็จ', 'Hard', '1000.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('19', 'Python God', 'จบเกมด้วยเงินคงเหลือมากกว่า 10,000,000 บาท', 'Very Hard', '10000.00');
INSERT INTO `achievements` (`achievement_id`, `name`, `description`, `difficulty`, `reward_money`) VALUES ('20', 'Immortal Coder', 'เล่นจนจบเกมโดยไม่เคยส่งงานพลาด (Fail) เลยแม้แต่ครั้งเดียว', 'Very Hard', '5000.00');

CREATE TABLE `advanced_validation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_text` text NOT NULL,
  `correct_answer` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('1', 'ผลลัพธ์ของ len([1, 2, 3]) คืออะไร?', '3');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('2', 'คำสั่งใดใช้สร้าง Dictionary ว่าง?', '{}');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('3', 'ผลลัพธ์ของ "Hello"[1] คืออะไร?', 'e');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('4', 'คำสั่ง for i in range(3) จะวนลูปกี่รอบ?', '3');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('5', 'ผลลัพธ์ของ type(3.14) คืออะไร?', 'float');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('6', 'try-except ใช้ทำอะไร?', 'จัดการ Error');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('7', 'ฟังก์ชัน def greet(): return "Hi" เรียกใช้อย่างไร?', 'greet()');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('8', 'list.append(x) ทำอะไร?', 'เพิ่ม x ต่อท้าย list');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('9', 'ผลลัพธ์ของ 10 // 3 คืออะไร?', '3');
INSERT INTO `advanced_validation` (`id`, `question_text`, `correct_answer`) VALUES ('10', 'คำสั่ง import ใช้ทำอะไร?', 'นำเข้าโมดูล');

CREATE TABLE `advanced_validation_choices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `choice_text` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_adv_choices_question` (`question_id`),
  CONSTRAINT `fk_adv_choices_question` FOREIGN KEY (`question_id`) REFERENCES `advanced_validation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('1', '1', '3');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('2', '1', '2');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('3', '1', '4');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('4', '1', 'Error');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('5', '2', '{}');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('6', '2', '[]');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('7', '2', '()');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('8', '2', 'dict[]');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('9', '3', 'e');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('10', '3', 'H');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('11', '3', 'l');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('12', '3', 'Error');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('13', '4', '3');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('14', '4', '2');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('15', '4', '4');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('16', '4', '1');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('17', '5', 'float');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('18', '5', 'int');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('19', '5', 'str');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('20', '5', 'double');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('21', '6', 'จัดการ Error');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('22', '6', 'วนลูป');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('23', '6', 'สร้างตัวแปร');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('24', '6', 'นำเข้าไฟล์');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('25', '7', 'greet()');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('26', '7', 'call greet');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('27', '7', 'run greet');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('28', '7', 'def greet');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('29', '8', 'เพิ่ม x ต่อท้าย list');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('30', '8', 'ลบ x ออกจาก list');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('31', '8', 'แทนที่ค่าใน list');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('32', '8', 'สร้าง list ใหม่');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('33', '9', '3');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('34', '9', '3.33');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('35', '9', '1');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('36', '9', '10');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('37', '10', 'นำเข้าโมดูล');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('38', '10', 'สร้างฟังก์ชัน');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('39', '10', 'ลบไฟล์');
INSERT INTO `advanced_validation_choices` (`id`, `question_id`, `choice_text`) VALUES ('40', '10', 'แสดงผล');

CREATE TABLE `assets` (
  `asset_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('HARDWARE','SOFTWARE') NOT NULL,
  `battery_capacity_minutes` int(11) DEFAULT 180,
  `power_consumption_rate` decimal(5,2) DEFAULT 1.00,
  `condition_percent` int(11) DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`asset_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `contracts` (
  `contract_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `difficulty` enum('Easy','Medium','Hard') NOT NULL,
  `reward` decimal(10,2) NOT NULL,
  `penalty` decimal(10,2) DEFAULT 0.00,
  `ai_requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_requirements`)),
  `status` enum('OFFERED','ACTIVE','COMPLETED','FAILED') DEFAULT 'OFFERED',
  `deadline_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`contract_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `contracts` (`contract_id`, `user_id`, `title`, `difficulty`, `reward`, `penalty`, `ai_requirements`, `status`, `deadline_at`, `created_at`) VALUES ('1', NULL, 'Help! My login page is broken!', 'Easy', '500.00', '100.00', '{"clientName": "Sarah Jenkins", "clientRole": "Bakery Owner", "story": "สวัสดีค่ะทุกคน! ฉันเพิ่งเปิดตัวเว็บไซต์ร้านเบเกอรี่ของฉัน แต่ลูกค้าบ่นว่าพวกเขาไม่สามารถเข้าสู่ระบบได้ มันขึ้น Error 500 แปลกๆ ฉันไม่รู้เรื่องโค้ดเลย และต้องการให้มีคนช่วยแก้ด่วนก่อนช่วงลดราคาสุดสัปดาห์นี้ค่ะ!", "desc": "1. Debug the login.py script.\n2. Fix the indentation and database connection error.\n3. Ensure session token is returned.", "tests": 3}', 'OFFERED', NULL, 'Sat Feb 21 2026 11:03:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `contracts` (`contract_id`, `user_id`, `title`, `difficulty`, `reward`, `penalty`, `ai_requirements`, `status`, `deadline_at`, `created_at`) VALUES ('2', NULL, 'Need data for my research project', 'Medium', '1500.00', '300.00', '{"clientName": "Dr. Aris Thorne", "clientRole": "Data Researcher", "story": "สวัสดีครับ ผมกำลังทำงานวิจัยเกี่ยวกับแนวโน้มราคาสินค้าอีคอมเมิร์ซ ผมต้องการสคริปต์ Python เพื่อดึงข้อมูลราคาสินค้าจากเว็บไซต์เป้าหมาย ขอคนที่เขียนโค้ดดึงข้อมูลแบบหลบระบบป้องกันบอทพื้นฐานได้นะครับ", "desc": "1. Write a Beautifulsoup/Selenium script.\n2. Extract Product Name, Price, and Rating.\n3. Export to a clean CSV file.", "tests": 5}', 'OFFERED', NULL, 'Sat Feb 21 2026 11:03:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `contracts` (`contract_id`, `user_id`, `title`, `difficulty`, `reward`, `penalty`, `ai_requirements`, `status`, `deadline_at`, `created_at`) VALUES ('3', NULL, 'Urgent: Mobile App API needed', 'Medium', '2500.00', '500.00', '{"clientName": "Marko Dev", "clientRole": "Lead Developer", "story": "เฮ้ พวก เรามีปัญหาใหญ่! นักพัฒนา Backend ของเราป่วยกะทันหันและเรามีกำหนดส่งแอปมือถือสัปดาห์หน้า ผมต้องการคนมาช่วยเขียน REST API สำหรับระบบจัดการโปรไฟล์ผู้ใช้ด่วนมาก ค่าจ้างงามๆ เลย", "desc": "1. Create Flask/FastAPI endpoints (GET/POST/PUT).\n2. Implement JWT authentication.\n3. Write basic unit tests.", "tests": 8}', 'OFFERED', NULL, 'Sat Feb 21 2026 11:03:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `contracts` (`contract_id`, `user_id`, `title`, `difficulty`, `reward`, `penalty`, `ai_requirements`, `status`, `deadline_at`, `created_at`) VALUES ('4', NULL, 'Database is too slow, losing customers', 'Hard', '4000.00', '800.00', '{"clientName": "TechCorp CEO", "clientRole": "Enterprise Client", "story": "ระบบฐานข้อมูลหลักของเราเกิดคอขวดหนักมากในช่วงเวลาเร่งด่วน การค้นหาข้อมูลที่เคยใช้เวลาเสี้ยววินาที ตอนนี้ปาไป 5 วินาทีแล้ว เรากำลังเสียลูกค้าและรายได้มหาศาล ผมต้องการผู้เชี่ยวชาญมาจัดการเรื่องนี้ด่วนที่สุด", "desc": "1. Analyze the slow query log.\n2. Implement proper indexing strategies.\n3. Refactor the ORM calls to avoid N+1 problems.\n4. Reduce query time to < 0.1s.", "tests": 10}', 'OFFERED', NULL, 'Sat Feb 21 2026 11:03:00 GMT+0700 (เวลาอินโดจีน)');

CREATE TABLE `email_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `email_verifications` (`id`, `user_id`, `token`, `expires_at`, `verified_at`, `created_at`) VALUES ('1', '5', 'f3a24b47bcbc4d6ef3dea6471934186dcf24dd7976a223e7e6173f4473002ea7', 'Sat Mar 07 2026 00:42:55 GMT+0700 (เวลาอินโดจีน)', NULL, 'Fri Mar 06 2026 00:42:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `email_verifications` (`id`, `user_id`, `token`, `expires_at`, `verified_at`, `created_at`) VALUES ('2', '6', 'b41438f97329edff3de65882c298ced4fb5e2e4e9e92d5b9c5de4921a223e471', 'Sat Mar 07 2026 01:19:40 GMT+0700 (เวลาอินโดจีน)', NULL, 'Fri Mar 06 2026 01:19:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `email_verifications` (`id`, `user_id`, `token`, `expires_at`, `verified_at`, `created_at`) VALUES ('3', '7', 'e1ae250e32a4ee11d7e679fca95caebffa202de2bdb05317017cc6d823f08cfa', 'Sun Mar 08 2026 13:39:05 GMT+0700 (เวลาอินโดจีน)', NULL, 'Sat Mar 07 2026 13:39:05 GMT+0700 (เวลาอินโดจีน)');

CREATE TABLE `financial_ledger` (
  `transaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('INCOME','EXPENSE') NOT NULL,
  `category` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`transaction_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `financial_ledger_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `game_rooms` (
  `room_id` int(11) NOT NULL AUTO_INCREMENT,
  `room_name` varchar(50) NOT NULL,
  `host_user_id` int(11) NOT NULL,
  `room_password` varchar(50) DEFAULT NULL,
  `status` enum('WAITING','PLAYING','FINISHED') DEFAULT 'WAITING',
  `max_players` int(11) DEFAULT 2,
  `current_players` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`room_id`),
  KEY `host_user_id` (`host_user_id`),
  CONSTRAINT `game_rooms_ibfk_1` FOREIGN KEY (`host_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `lesson_quizzes` (
  `quiz_id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) NOT NULL,
  `quiz_type` varchar(10) NOT NULL DEFAULT 'pre',
  PRIMARY KEY (`quiz_id`),
  KEY `idx_quizzes_lesson` (`lesson_id`),
  CONSTRAINT `fk_quizzes_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`lesson_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `lesson_quizzes` (`quiz_id`, `lesson_id`, `quiz_type`) VALUES ('1', '1', 'pre');
INSERT INTO `lesson_quizzes` (`quiz_id`, `lesson_id`, `quiz_type`) VALUES ('2', '1', 'post');
INSERT INTO `lesson_quizzes` (`quiz_id`, `lesson_id`, `quiz_type`) VALUES ('3', '2', 'pre');
INSERT INTO `lesson_quizzes` (`quiz_id`, `lesson_id`, `quiz_type`) VALUES ('4', '2', 'post');
INSERT INTO `lesson_quizzes` (`quiz_id`, `lesson_id`, `quiz_type`) VALUES ('5', '3', 'pre');
INSERT INTO `lesson_quizzes` (`quiz_id`, `lesson_id`, `quiz_type`) VALUES ('6', '3', 'post');

CREATE TABLE `lesson_slides` (
  `slide_id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) NOT NULL,
  `slide_order` int(11) NOT NULL DEFAULT 0,
  `slide_title` varchar(200) DEFAULT NULL,
  `slide_content` text DEFAULT NULL,
  `slide_src` varchar(500) DEFAULT NULL,
  `slide_type` varchar(20) DEFAULT 'text',
  PRIMARY KEY (`slide_id`),
  KEY `idx_slides_lesson` (`lesson_id`),
  CONSTRAINT `fk_slides_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`lesson_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('1', '1', '1', 'Python คืออะไร?', 'Python เป็นภาษาโปรแกรมที่ใช้งานง่าย เหมาะสำหรับผู้เริ่มต้น
สร้างโดย Guido van Rossum ในปี 1991', '/gif/first_print.gif', 'text');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('2', '1', '2', 'คำสั่ง print()', 'ใช้คำสั่ง print() เพื่อแสดงผลลัพธ์
ตัวอย่าง: print("Hello World!")', NULL, 'text');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('3', '1', '3', 'ลองเขียนโค้ด', 'print("Hello World!")
print("สวัสดีชาว Python!")', NULL, 'code');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('4', '2', '1', 'Comments คืออะไร?', 'Comments คือข้อความอธิบายโค้ดที่ Python จะข้ามไม่ประมวลผล
ใช้เครื่องหมาย # นำหน้า', '/gif/comments.gif', 'text');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('5', '2', '2', 'ตัวอย่าง Comment', '# นี่คือ Comment
print("Hello") # Comment ท้ายบรรทัด

# หลายบรรทัด
# ใช้ # หลายตัว', NULL, 'code');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('6', '3', '1', 'รับข้อมูลจากผู้ใช้', 'ใช้คำสั่ง input() เพื่อรับข้อมูลจาก keyboard
ข้อมูลที่ได้จะเป็น string เสมอ', '/gif/input.gif', 'text');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('7', '3', '2', 'ลองเขียน Input', 'name = input("ชื่ออะไร: ")
print("สวัสดี", name)', NULL, 'code');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('8', '4', '1', 'ตัวแปรคืออะไร?', 'ตัวแปร (Variable) คือ "กล่อง" เก็บข้อมูล
ใน Python ไม่ต้องประกาศชนิดล่วงหน้า', '/gif/python4.gif', 'text');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('9', '4', '2', 'การตั้งชื่อตัวแปร', 'x = 10
name = "John"
my_list = [1, 2, 3]

# กฎการตั้งชื่อ:
# - เริ่มด้วยตัวอักษรหรือ _
# - ห้ามเริ่มด้วยตัวเลข
# - case-sensitive', NULL, 'code');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('10', '6', '1', 'Type Conversion', 'การแปลงชนิดข้อมูล เช่น str เป็น int
ใช้ int(), float(), str()', '/gif/typeconversion.gif', 'text');
INSERT INTO `lesson_slides` (`slide_id`, `lesson_id`, `slide_order`, `slide_title`, `slide_content`, `slide_src`, `slide_type`) VALUES ('11', '6', '2', 'ตัวอย่าง Type Conversion', 'x = "100"
y = int(x)  # แปลง str เป็น int
print(y + 50)  # ผลลัพธ์ 150

z = float("3.14")
print(z)  # 3.14', NULL, 'code');

CREATE TABLE `lessons` (
  `lesson_id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `required_level` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`lesson_id`),
  KEY `idx_lessons_module` (`module_id`),
  CONSTRAINT `fk_lessons_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`module_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('1', '1', 'Hello World & print()', '1', '0');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('2', '1', 'Comments และการเขียนโค้ด', '2', '0');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('3', '1', 'Input จากผู้ใช้', '3', '0');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('4', '2', 'ตัวแปร (Variables)', '1', '0');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('5', '2', 'ชนิดข้อมูล (Data Types)', '2', '0');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('6', '2', 'Type Conversion', '3', '0');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('7', '3', 'If-Else', '1', '2');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('8', '3', 'For Loop', '2', '2');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('9', '3', 'While Loop', '3', '3');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('10', '4', 'การสร้างฟังก์ชัน', '1', '4');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('11', '4', 'Parameters & Return', '2', '5');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('12', '5', 'List', '1', '6');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('13', '5', 'Dictionary', '2', '7');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('14', '6', 'อ่าน/เขียนไฟล์', '1', '8');
INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `order_index`, `required_level`) VALUES ('15', '6', 'Try-Except', '2', '9');

CREATE TABLE `level_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `option_description` varchar(500) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `level` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_level_config_question` (`question_id`),
  CONSTRAINT `fk_level_config_question` FOREIGN KEY (`question_id`) REFERENCES `survey_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `level_config` (`id`, `question_id`, `title`, `option_description`, `order`, `level`) VALUES ('1', '3', 'Beginner', 'ไม่เคยเขียนโปรแกรมมาก่อนเลย', '1', '1');
INSERT INTO `level_config` (`id`, `question_id`, `title`, `option_description`, `order`, `level`) VALUES ('2', '3', 'Advanced', 'เคยเขียน Python หรือภาษาอื่นมาบ้าง ต้องการข้ามบทพื้นฐาน', '2', '10');

CREATE TABLE `locations` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `entry_fee` decimal(10,2) DEFAULT 0.00,
  `power_reliability` int(11) DEFAULT 100,
  `internet_speed` decimal(3,2) DEFAULT 1.00,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `locations` (`location_id`, `name`, `entry_fee`, `power_reliability`, `internet_speed`) VALUES ('1', 'Home (My Room)', '0.00', '70', '1.00');
INSERT INTO `locations` (`location_id`, `name`, `entry_fee`, `power_reliability`, `internet_speed`) VALUES ('2', 'Starbugs Cafe', '150.00', '95', '2.00');

CREATE TABLE `modules` (
  `module_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `required_level` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`module_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `modules` (`module_id`, `title`, `order_index`, `required_level`) VALUES ('1', 'พื้นฐาน Python', '1', '0');
INSERT INTO `modules` (`module_id`, `title`, `order_index`, `required_level`) VALUES ('2', 'ตัวแปรและชนิดข้อมูล', '2', '0');
INSERT INTO `modules` (`module_id`, `title`, `order_index`, `required_level`) VALUES ('3', 'เงื่อนไขและลูป', '3', '2');
INSERT INTO `modules` (`module_id`, `title`, `order_index`, `required_level`) VALUES ('4', 'ฟังก์ชัน', '4', '4');
INSERT INTO `modules` (`module_id`, `title`, `order_index`, `required_level`) VALUES ('5', 'โครงสร้างข้อมูล', '5', '6');
INSERT INTO `modules` (`module_id`, `title`, `order_index`, `required_level`) VALUES ('6', 'ไฟล์และ Exception', '6', '8');

CREATE TABLE `music_tracks` (
  `track_id` int(11) NOT NULL AUTO_INCREMENT,
  `track_name` varchar(100) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `question_choices` (
  `choice_id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `choice_text` varchar(500) NOT NULL,
  PRIMARY KEY (`choice_id`),
  KEY `idx_choices_question` (`question_id`),
  CONSTRAINT `fk_choices_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('1', '1', 'print()');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('2', '1', 'echo()');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('3', '1', 'write()');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('4', '1', 'console.log()');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('5', '4', 'print("สวัสดี")');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('6', '4', 'echo("สวัสดี")');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('7', '4', 'say "สวัสดี"');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('8', '4', 'output("สวัสดี")');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('9', '5', 'Compiled');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('10', '5', 'Interpreted');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('11', '5', 'Assembly');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('12', '5', 'Machine Language');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('13', '6', '#');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('14', '6', '//');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('15', '6', '/*');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('16', '6', '--');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('17', '7', 'ไม่มีผล');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('18', '7', 'ทำให้โปรแกรมเร็วขึ้น');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('19', '7', 'ทำให้เกิด Error');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('20', '7', 'แสดงผลบนหน้าจอ');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('21', '8', 'Comment');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('22', '8', 'ตัวแปร');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('23', '8', 'ฟังก์ชัน');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('24', '8', 'Operator');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('25', '9', '# This is a comment');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('26', '9', '// This is a comment');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('27', '9', '/* This is a comment */');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('28', '9', '-- This is a comment');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('29', '10', 'input()');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('30', '10', 'read()');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('31', '10', 'scanf()');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('32', '10', 'get()');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('33', '11', 'str');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('34', '11', 'int');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('35', '11', 'float');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('36', '11', 'bool');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('37', '12', 'str');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('38', '12', 'int');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('39', '12', 'float');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('40', '12', 'list');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('41', '13', 'ใช้ int(input())');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('42', '13', 'ใช้ input(int)');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('43', '13', 'ใช้ number(input())');
INSERT INTO `question_choices` (`choice_id`, `question_id`, `choice_text`) VALUES ('44', '13', 'ไม่ต้องทำอะไร');

CREATE TABLE `quiz_questions` (
  `question_id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` varchar(20) NOT NULL DEFAULT 'choice',
  `correct_answer` text NOT NULL,
  `question_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`question_id`),
  KEY `idx_questions_quiz` (`quiz_id`),
  CONSTRAINT `fk_questions_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `lesson_quizzes` (`quiz_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('1', '1', 'คำสั่งใดใช้แสดงผลข้อความใน Python?', 'choice', 'print()', '1');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('2', '1', 'ผลลัพธ์ของ print("Hello") คืออะไร?', 'fill', 'Hello', '2');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('3', '2', 'print("Python") จะแสดงผลอะไร?', 'fill', 'Python', '1');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('4', '2', 'คำสั่งใดถูกต้อง?', 'choice', 'print("สวัสดี")', '2');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('5', '2', 'Python เป็นภาษาแบบใด?', 'choice', 'Interpreted', '3');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('6', '3', 'Comment ใน Python ใช้เครื่องหมายอะไร?', 'choice', '#', '1');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('7', '3', 'Comment มีผลต่อการทำงานของโปรแกรมหรือไม่?', 'choice', 'ไม่มีผล', '2');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('8', '4', 'เครื่องหมาย # ใน Python มีความหมายว่าอะไร?', 'choice', 'Comment', '1');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('9', '4', 'บรรทัดใดเป็น Comment ที่ถูกต้อง?', 'choice', '# This is a comment', '2');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('10', '5', 'คำสั่งใดใช้รับข้อมูลจากผู้ใช้?', 'choice', 'input()', '1');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('11', '5', 'ผลลัพธ์ของ input() มีชนิดข้อมูลเป็นอะไร?', 'choice', 'str', '2');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('12', '6', 'name = input("ชื่อ: ") ค่าของ name เป็นชนิดใด?', 'choice', 'str', '1');
INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `correct_answer`, `question_order`) VALUES ('13', '6', 'ถ้าต้องการรับตัวเลขจาก input ต้องทำอย่างไร?', 'choice', 'ใช้ int(input())', '2');

CREATE TABLE `random_events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_key` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `effect_type` enum('POWER_CUT','INTERNET_CUT','BATTERY_DRAIN','SPEED_BOOST','MONEY_LOSS') NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'LOW',
  `base_chance_percent` int(11) NOT NULL DEFAULT 5,
  `duration_minutes` int(11) DEFAULT NULL COMMENT 'NULL = ถาวรจนจบวัน',
  `force_skip_day` tinyint(1) NOT NULL DEFAULT 0,
  `auto_resolve` tinyint(1) NOT NULL DEFAULT 0,
  `affected_systems` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`affected_systems`)),
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `uk_event_key` (`event_key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `random_events` (`event_id`, `event_key`, `name`, `description`, `effect_type`, `severity`, `base_chance_percent`, `duration_minutes`, `force_skip_day`, `auto_resolve`, `affected_systems`) VALUES ('1', 'BLACKOUT', '⚡ ไฟฟ้าดับ', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'POWER_CUT', 'CRITICAL', '0', NULL, '1', '0', '["charging","save_warning"]');
INSERT INTO `random_events` (`event_id`, `event_key`, `name`, `description`, `effect_type`, `severity`, `base_chance_percent`, `duration_minutes`, `force_skip_day`, `auto_resolve`, `affected_systems`) VALUES ('2', 'INTERNET_DOWN', '🌐 อินเทอร์เน็ตขัดข้อง', 'อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว', 'INTERNET_CUT', 'MEDIUM', '8', '30', '0', '1', '["job_browse","job_submit","job_accept"]');
INSERT INTO `random_events` (`event_id`, `event_key`, `name`, `description`, `effect_type`, `severity`, `base_chance_percent`, `duration_minutes`, `force_skip_day`, `auto_resolve`, `affected_systems`) VALUES ('3', 'HEAVY_RAIN', '🌧️ ฝนตกหนัก', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'INTERNET_CUT', 'LOW', '15', '15', '0', '1', '["job_browse","job_submit"]');
INSERT INTO `random_events` (`event_id`, `event_key`, `name`, `description`, `effect_type`, `severity`, `base_chance_percent`, `duration_minutes`, `force_skip_day`, `auto_resolve`, `affected_systems`) VALUES ('4', 'LAPTOP_OVERHEAT', '🔥 โน๊ตบุ๊คร้อนจัด', 'โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า', 'BATTERY_DRAIN', 'MEDIUM', '5', '20', '0', '1', '["battery_drain_rate"]');
INSERT INTO `random_events` (`event_id`, `event_key`, `name`, `description`, `effect_type`, `severity`, `base_chance_percent`, `duration_minutes`, `force_skip_day`, `auto_resolve`, `affected_systems`) VALUES ('5', 'ELECTRICITY_BILL', '💸 ค่าไฟเพิ่มขึ้น', 'ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม', 'MONEY_LOSS', 'LOW', '3', '0', '0', '1', '["money"]');
INSERT INTO `random_events` (`event_id`, `event_key`, `name`, `description`, `effect_type`, `severity`, `base_chance_percent`, `duration_minutes`, `force_skip_day`, `auto_resolve`, `affected_systems`) VALUES ('6', 'CAFE_DISCOUNT', '☕ โปรโมชั่นร้านกาแฟ', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'SPEED_BOOST', 'LOW', '10', '30', '0', '1', '["work_speed"]');

CREATE TABLE `room_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `score` int(11) DEFAULT 0,
  `is_ready` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `room_participants_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `game_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `room_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `shop_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('THEME','MOUSE_EFFECT','PROFILE_FRAME') NOT NULL,
  `rarity` enum('COMMON','RARE','EPIC','LEGENDARY') NOT NULL DEFAULT 'COMMON',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `preview_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preview_data`)),
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('1', 'Default Theme', 'ธีมเริ่มต้นของเกม', 'THEME', 'COMMON', '0.00', '{"css_class": "theme-default"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('2', 'Neon Cyberpunk', 'ธีมสีนีออนสไตล์ Cyberpunk', 'THEME', 'RARE', '500.00', '{"css_class": "theme-neon-cyberpunk"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('3', 'Hacker Terminal', 'ธีมสไตล์ Terminal สีเขียว', 'THEME', 'EPIC', '1500.00', '{"css_class": "theme-hacker"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('4', 'Default Cursor', 'เคอร์เซอร์เมาส์ปกติ', 'MOUSE_EFFECT', 'COMMON', '0.00', '{"effect": "none"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('5', 'Sparkle Trail', 'เมาส์มีประกายแวววาว', 'MOUSE_EFFECT', 'RARE', '300.00', '{"effect": "sparkle", "color": "#FFD700"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('6', 'Fire Trail', 'เมาส์มีเปลวไฟตามหลัง', 'MOUSE_EFFECT', 'EPIC', '800.00', '{"effect": "fire", "color": "#FF4500"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('7', 'Matrix Rain', 'ตัวอักษรตกลงมาตามเมาส์', 'MOUSE_EFFECT', 'LEGENDARY', '2500.00', '{"effect": "matrix", "color": "#00FF00"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('8', 'Basic Frame', 'กรอบโปรไฟล์พื้นฐาน', 'PROFILE_FRAME', 'COMMON', '0.00', '{"border": "2px solid #888"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('9', 'Gold Frame', 'กรอบโปรไฟล์สีทอง', 'PROFILE_FRAME', 'RARE', '400.00', '{"border": "3px solid #FFD700", "glow": true}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('10', 'Diamond Frame', 'กรอบโปรไฟล์เพชร', 'PROFILE_FRAME', 'EPIC', '1200.00', '{"border": "3px solid #00BFFF", "glow": true, "animation": "shimmer"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `shop_items` (`item_id`, `name`, `description`, `type`, `rarity`, `price`, `preview_data`, `is_available`, `created_at`) VALUES ('11', 'Legendary Frame', 'กรอบโปรไฟล์ตำนาน — เปลี่ยนสีอัตโนมัติ', 'PROFILE_FRAME', 'LEGENDARY', '3000.00', '{"border": "4px solid", "glow": true, "animation": "rainbow-cycle"}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)');

CREATE TABLE `simulation_active_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `save_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_resolved` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_active_events_save` (`save_id`,`is_resolved`),
  KEY `fk_active_events_event` (`event_id`),
  CONSTRAINT `fk_active_events_event` FOREIGN KEY (`event_id`) REFERENCES `random_events` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_active_events_save` FOREIGN KEY (`save_id`) REFERENCES `simulation_saves` (`save_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('1', '1', '4', 'Thu Mar 05 2026 01:47:54 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:07:54 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('2', '1', '1', 'Thu Mar 05 2026 01:47:57 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('3', '1', '3', 'Thu Mar 05 2026 01:50:09 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:05:09 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('4', '1', '1', 'Thu Mar 05 2026 01:50:10 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('5', '1', '5', 'Thu Mar 05 2026 01:52:19 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('6', '1', '1', 'Thu Mar 05 2026 01:52:19 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('7', '1', '3', 'Thu Mar 05 2026 01:54:25 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:09:25 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('8', '1', '1', 'Thu Mar 05 2026 01:54:30 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('9', '1', '3', 'Thu Mar 05 2026 01:56:45 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:11:45 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('10', '1', '1', 'Thu Mar 05 2026 01:56:45 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('11', '1', '3', 'Thu Mar 05 2026 01:58:55 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:13:55 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('12', '1', '1', 'Thu Mar 05 2026 01:58:56 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('13', '1', '1', 'Thu Mar 05 2026 02:01:05 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('14', '1', '1', 'Thu Mar 05 2026 02:03:11 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('15', '1', '6', 'Thu Mar 05 2026 02:05:25 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:35:25 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('16', '1', '1', 'Thu Mar 05 2026 02:05:25 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('17', '1', '1', 'Thu Mar 05 2026 02:07:31 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('18', '1', '2', 'Thu Mar 05 2026 02:09:41 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:39:41 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('19', '1', '1', 'Thu Mar 05 2026 02:09:42 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('20', '1', '1', 'Thu Mar 05 2026 02:11:52 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('21', '1', '4', 'Thu Mar 05 2026 02:14:01 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:34:01 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('22', '1', '1', 'Thu Mar 05 2026 02:14:02 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('23', '1', '6', 'Thu Mar 05 2026 02:16:32 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 19:46:32 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('24', '1', '1', 'Thu Mar 05 2026 02:16:37 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('25', '1', '1', 'Thu Mar 05 2026 02:18:47 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('26', '1', '2', 'Thu Mar 05 2026 03:03:36 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 04 2026 20:33:36 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('27', '1', '1', 'Thu Mar 05 2026 03:03:41 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('28', '1', '1', 'Fri Mar 06 2026 00:39:04 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('29', '1', '1', 'Fri Mar 06 2026 00:41:39 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('30', '1', '6', 'Fri Mar 06 2026 00:43:50 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:13:50 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('31', '1', '1', 'Fri Mar 06 2026 00:43:59 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('32', '1', '1', 'Fri Mar 06 2026 00:46:14 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('33', '1', '3', 'Fri Mar 06 2026 00:48:20 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:03:20 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('34', '1', '1', 'Fri Mar 06 2026 00:48:30 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('35', '1', '3', 'Fri Mar 06 2026 00:50:40 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:05:40 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('36', '1', '1', 'Fri Mar 06 2026 00:50:41 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('37', '1', '3', 'Fri Mar 06 2026 00:52:51 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:07:51 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('38', '1', '1', 'Fri Mar 06 2026 00:52:55 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('39', '1', '3', 'Fri Mar 06 2026 00:55:01 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:10:01 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('40', '1', '1', 'Fri Mar 06 2026 00:55:01 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('41', '1', '1', 'Fri Mar 06 2026 00:57:11 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('42', '1', '3', 'Fri Mar 06 2026 00:59:21 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:14:21 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('43', '1', '1', 'Fri Mar 06 2026 00:59:26 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('44', '1', '1', 'Fri Mar 06 2026 01:01:32 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('45', '1', '5', 'Fri Mar 06 2026 01:03:41 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('46', '1', '1', 'Fri Mar 06 2026 01:03:42 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('47', '1', '1', 'Fri Mar 06 2026 01:05:52 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('48', '1', '1', 'Fri Mar 06 2026 01:08:06 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('49', '1', '1', 'Fri Mar 06 2026 01:10:17 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('50', '1', '1', 'Fri Mar 06 2026 01:12:23 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('51', '1', '1', 'Fri Mar 06 2026 01:14:32 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('52', '1', '4', 'Fri Mar 06 2026 01:16:38 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:36:38 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('53', '1', '1', 'Fri Mar 06 2026 01:16:38 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('54', '1', '1', 'Fri Mar 06 2026 01:18:43 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('55', '1', '6', 'Fri Mar 06 2026 01:20:52 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:50:52 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('56', '1', '1', 'Fri Mar 06 2026 01:20:52 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('57', '1', '3', 'Fri Mar 06 2026 01:23:03 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:38:03 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('58', '1', '1', 'Fri Mar 06 2026 01:23:13 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('59', '1', '5', 'Fri Mar 06 2026 01:25:19 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('60', '1', '1', 'Fri Mar 06 2026 01:25:19 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('61', '1', '3', 'Fri Mar 06 2026 01:27:29 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:42:29 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('62', '1', '1', 'Fri Mar 06 2026 01:27:34 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('63', '1', '1', 'Fri Mar 06 2026 01:29:48 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('64', '1', '3', 'Fri Mar 06 2026 01:31:55 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:46:55 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('65', '1', '1', 'Fri Mar 06 2026 01:31:55 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('66', '1', '6', 'Fri Mar 06 2026 01:34:19 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 19:04:19 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('67', '1', '1', 'Fri Mar 06 2026 01:34:20 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('68', '1', '4', 'Fri Mar 06 2026 01:36:29 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:56:29 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('69', '1', '1', 'Fri Mar 06 2026 01:36:50 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('70', '1', '3', 'Fri Mar 06 2026 01:39:00 GMT+0700 (เวลาอินโดจีน)', 'Thu Mar 05 2026 18:54:00 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('71', '1', '1', 'Fri Mar 06 2026 01:39:30 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('72', '1', '1', 'Sat Mar 07 2026 13:37:35 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('73', '1', '6', 'Sat Mar 07 2026 13:41:50 GMT+0700 (เวลาอินโดจีน)', 'Sat Mar 07 2026 07:11:50 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('74', '1', '1', 'Sat Mar 07 2026 13:42:40 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('75', '1', '3', 'Sat Mar 07 2026 13:46:56 GMT+0700 (เวลาอินโดจีน)', 'Sat Mar 07 2026 07:01:56 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('76', '1', '1', 'Sat Mar 07 2026 13:47:11 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('77', '1', '1', 'Sat Mar 07 2026 13:51:31 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('78', '1', '4', 'Sat Mar 07 2026 13:55:46 GMT+0700 (เวลาอินโดจีน)', 'Sat Mar 07 2026 07:15:46 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('79', '1', '1', 'Sat Mar 07 2026 13:55:51 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('80', '1', '5', 'Sat Mar 07 2026 14:00:07 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('81', '1', '1', 'Sat Mar 07 2026 14:00:22 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('82', '1', '1', 'Sat Mar 07 2026 14:04:42 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('83', '1', '2', 'Sat Mar 07 2026 14:09:03 GMT+0700 (เวลาอินโดจีน)', 'Sat Mar 07 2026 07:39:03 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('84', '1', '1', 'Sat Mar 07 2026 14:09:08 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('85', '1', '4', 'Wed Mar 11 2026 15:01:21 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 08:21:21 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('86', '1', '1', 'Wed Mar 11 2026 15:01:51 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('87', '1', '2', 'Wed Mar 11 2026 15:06:11 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 08:36:11 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('88', '1', '1', 'Wed Mar 11 2026 15:06:11 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('89', '1', '5', 'Wed Mar 11 2026 15:10:32 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('90', '1', '1', 'Wed Mar 11 2026 15:10:32 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('91', '2', '3', 'Wed Mar 11 2026 16:08:31 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 09:23:31 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('92', '2', '1', 'Wed Mar 11 2026 16:08:31 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('93', '2', '1', 'Wed Mar 11 2026 16:13:01 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('94', '2', '2', 'Wed Mar 11 2026 16:17:16 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 09:47:16 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('95', '2', '1', 'Wed Mar 11 2026 16:17:26 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('96', '2', '2', 'Wed Mar 11 2026 16:21:47 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 09:51:47 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('97', '2', '1', 'Wed Mar 11 2026 16:22:07 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('98', '2', '3', 'Wed Mar 11 2026 16:26:32 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 09:41:32 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('99', '2', '1', 'Wed Mar 11 2026 16:27:02 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('100', '2', '3', 'Wed Mar 11 2026 16:31:28 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 09:46:28 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('101', '2', '1', 'Wed Mar 11 2026 16:31:48 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('102', '2', '2', 'Wed Mar 11 2026 16:36:08 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 10:06:08 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('103', '2', '1', 'Wed Mar 11 2026 16:36:23 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('104', '3', '3', 'Wed Mar 11 2026 16:38:33 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 09:53:33 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('105', '3', '1', 'Wed Mar 11 2026 16:38:38 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('106', '2', '6', 'Wed Mar 11 2026 16:40:44 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 10:10:44 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('107', '2', '1', 'Wed Mar 11 2026 16:40:59 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('108', '3', '3', 'Wed Mar 11 2026 16:42:54 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 09:57:54 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('109', '3', '1', 'Wed Mar 11 2026 16:42:54 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('110', '2', '6', 'Wed Mar 11 2026 16:45:14 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 10:15:14 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('111', '2', '1', 'Wed Mar 11 2026 16:45:14 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('112', '3', '6', 'Wed Mar 11 2026 16:47:14 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 10:17:14 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('113', '3', '1', 'Wed Mar 11 2026 16:47:24 GMT+0700 (เวลาอินโดจีน)', NULL, '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('114', '2', '6', 'Wed Mar 11 2026 16:49:29 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 10:19:29 GMT+0700 (เวลาอินโดจีน)', '1');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('115', '2', '1', 'Wed Mar 11 2026 16:49:34 GMT+0700 (เวลาอินโดจีน)', NULL, '0');
INSERT INTO `simulation_active_events` (`id`, `save_id`, `event_id`, `started_at`, `expires_at`, `is_resolved`) VALUES ('116', '3', '1', 'Wed Mar 11 2026 16:51:45 GMT+0700 (เวลาอินโดจีน)', NULL, '0');

CREATE TABLE `simulation_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `save_id` int(11) DEFAULT NULL,
  `event_id` int(11) DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_sim_logs_save` (`save_id`),
  KEY `fk_sim_logs_event` (`event_id`),
  CONSTRAINT `fk_sim_logs_event` FOREIGN KEY (`event_id`) REFERENCES `random_events` (`event_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sim_logs_save` FOREIGN KEY (`save_id`) REFERENCES `simulation_saves` (`save_id`) ON DELETE SET NULL,
  CONSTRAINT `simulation_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=755 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('1', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('2', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('3', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('4', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('5', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('6', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('7', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('8', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('9', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('10', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('11', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:55:53 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('12', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('13', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('14', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('15', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('16', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('17', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('18', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('19', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('20', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('21', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('22', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('23', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('24', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:56:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('25', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('26', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('27', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('28', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('29', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('30', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('31', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('32', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('33', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:57:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('34', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('35', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('36', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('37', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('38', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('39', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('40', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('41', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('42', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('43', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('44', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('45', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:58:53 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('46', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('47', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('48', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('49', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('50', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('51', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('52', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('53', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:47 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('54', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:56 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('55', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 15:59:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('56', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('57', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('58', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('59', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('60', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('61', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('62', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('63', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('64', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('65', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:00:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('66', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('67', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('68', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('69', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('70', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('71', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('72', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('73', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('74', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('75', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('76', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:39 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('77', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('78', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('79', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:01:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('80', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('81', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:15 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('82', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('83', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('84', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('85', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('86', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('87', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('88', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:02:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('89', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('90', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('91', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('92', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('93', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('94', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('95', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('96', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('97', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('98', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:03:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('99', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('100', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('101', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('102', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('103', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('104', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('105', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('106', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('107', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('108', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('109', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('110', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('111', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('112', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('113', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:04:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('114', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('115', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('116', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('117', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('118', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('119', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('120', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:39 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('121', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('122', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('123', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('124', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:05:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('125', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('126', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('127', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('128', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('129', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('130', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('131', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('132', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('133', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:45 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('134', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('135', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('136', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:06:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('137', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:07:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('138', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:07:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('139', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:07:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('140', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:07:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('141', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:07:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('142', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:07:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('143', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:07:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('144', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:07:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('145', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('146', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('147', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('148', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('149', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('150', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('151', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('152', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('153', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('154', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('155', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('156', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('157', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:08:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('158', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('159', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('160', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('161', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('162', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('163', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('164', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:39 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('165', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('166', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('167', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:09:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('168', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('169', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('170', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('171', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('172', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('173', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('174', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('175', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('176', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('177', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('178', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('179', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('180', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('181', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('182', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:10:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('183', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('184', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('185', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('186', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('187', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('188', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('189', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('190', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('191', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('192', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('193', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:47 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('194', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('195', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('196', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:11:56 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('197', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('198', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('199', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('200', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('201', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('202', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('203', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('204', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('205', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:12:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('206', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('207', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('208', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('209', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:16 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('210', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('211', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('212', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('213', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('214', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('215', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('216', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:13:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('217', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('218', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('219', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('220', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:15 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('221', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('222', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('223', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('224', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('225', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('226', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('227', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:47 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('228', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('229', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:14:56 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('230', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('231', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('232', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('233', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('234', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('235', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('236', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('237', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('238', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('239', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('240', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('241', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('242', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:15:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('243', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('244', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('245', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('246', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('247', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('248', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('249', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('250', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('251', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('252', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('253', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('254', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('255', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:16:53 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('256', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('257', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('258', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('259', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('260', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('261', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:16 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('262', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('263', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:39 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('264', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:45 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('265', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:17:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('266', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('267', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('268', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('269', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('270', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('271', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('272', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('273', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('274', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('275', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:18:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('276', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('277', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('278', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('279', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('280', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('281', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('282', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('283', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('284', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('285', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('286', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:47 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('287', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('288', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('289', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:19:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('290', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('291', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('292', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('293', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('294', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('295', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('296', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('297', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('298', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('299', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('300', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('301', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:53 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('302', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:20:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('303', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:21:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('304', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:21:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('305', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:21:15 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('306', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Wed Feb 18 2026 16:21:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('307', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:10:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('308', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('309', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('310', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('311', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('312', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('313', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('314', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('315', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('316', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:39 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('317', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('318', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('319', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('320', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('321', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:11:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('322', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('323', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('324', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('325', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:15 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('326', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('327', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('328', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('329', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('330', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:12:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('331', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:13:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('332', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:13:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('333', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:13:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('334', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:13:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('335', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:13:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('336', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:13:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('337', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:13:53 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('338', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:13:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('339', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('340', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('341', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('342', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('343', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('344', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('345', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('346', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:45 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('347', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('348', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('349', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:14:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('350', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('351', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('352', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('353', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('354', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('355', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('356', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('357', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('358', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('359', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:15:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('360', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('361', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('362', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('363', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('364', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('365', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('366', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('367', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('368', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('369', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:16:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('370', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('371', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('372', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('373', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('374', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('375', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('376', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('377', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('378', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:17:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('379', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('380', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('381', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('382', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('383', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('384', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('385', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('386', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('387', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('388', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:18:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('389', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('390', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('391', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:15 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('392', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('393', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('394', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('395', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('396', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('397', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('398', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('399', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('400', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:19:56 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('401', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('402', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('403', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:16 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('404', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('405', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('406', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('407', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('408', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('409', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('410', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('411', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:20:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('412', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('413', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('414', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('415', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('416', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('417', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('418', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:45 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('419', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('420', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:21:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('421', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:22:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('422', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:22:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('423', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:22:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('424', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:22:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('425', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:22:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('426', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:22:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('427', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:22:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('428', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:22:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('429', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:23:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('430', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:23:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('431', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:23:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('432', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:23:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('433', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:23:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('434', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:23:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('435', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:23:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('436', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:23:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('437', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('438', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('439', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('440', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('441', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('442', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('443', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('444', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('445', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('446', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('447', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:45 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('448', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('449', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('450', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:53 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('451', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:56 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('452', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:24:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('453', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('454', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('455', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('456', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('457', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('458', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('459', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('460', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('461', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('462', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:25:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('463', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('464', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('465', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('466', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:15 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('467', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('468', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('469', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('470', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('471', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('472', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('473', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('474', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('475', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:26:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('476', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('477', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('478', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('479', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('480', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('481', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('482', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('483', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('484', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:27:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('485', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:28:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('486', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:28:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('487', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 04:28:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('488', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:09:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('489', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:10:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('490', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:11:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('491', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:11:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('492', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:12:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('493', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:12:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('494', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:12:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('495', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:12:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('496', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:12:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('497', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:13:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('498', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:14:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('499', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:14:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('500', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:15:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('501', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:15:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('502', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:16:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('503', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Fri Feb 20 2026 12:16:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('504', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:55:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('505', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:55:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('506', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:56:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('507', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:56:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('508', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:57:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('509', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:57:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('510', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:57:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('511', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:58:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('512', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:58:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('513', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:58:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('514', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:59:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('515', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 10:59:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('516', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:00:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('517', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:00:39 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('518', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:01:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('519', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:01:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('520', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:01:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('521', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:02:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('522', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:03:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('523', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:03:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('524', '1', NULL, NULL, 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง', 'Sat Feb 21 2026 11:04:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('525', '1', '1', '4', 'LAPTOP_OVERHEAT', 'โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า', 'Thu Mar 05 2026 01:47:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('526', '1', '1', '4', 'LAPTOP_OVERHEAT_RESOLVED', 'เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 01:47:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('527', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 01:47:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('528', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 01:50:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('529', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Thu Mar 05 2026 01:50:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('530', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 01:50:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('531', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 01:50:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('532', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 01:52:15 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('533', '1', '1', '5', 'ELECTRICITY_BILL', 'ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม', 'Thu Mar 05 2026 01:52:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('534', '1', '1', NULL, 'MONEY_DEDUCTED', 'ถูกหักเงิน 128 ฿', 'Thu Mar 05 2026 01:52:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('535', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 01:52:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('536', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 01:54:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('537', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Thu Mar 05 2026 01:54:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('538', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 01:54:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('539', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 01:54:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('540', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 01:56:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('541', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Thu Mar 05 2026 01:56:45 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('542', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 01:56:45 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('543', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 01:56:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('544', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 01:58:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('545', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Thu Mar 05 2026 01:58:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('546', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 01:58:56 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('547', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 01:58:56 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('548', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:01:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('549', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:01:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('550', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:03:10 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('551', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:03:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('552', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:05:16 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('553', '1', '1', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Thu Mar 05 2026 02:05:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('554', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:05:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('555', '1', '1', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 02:05:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('556', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:07:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('557', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:07:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('558', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:09:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('559', '1', '1', '2', 'INTERNET_DOWN', 'อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว', 'Thu Mar 05 2026 02:09:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('560', '1', '1', '2', 'INTERNET_DOWN_RESOLVED', 'เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 02:09:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('561', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:09:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('562', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:11:47 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('563', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:11:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('564', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:13:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('565', '1', '1', '4', 'LAPTOP_OVERHEAT', 'โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า', 'Thu Mar 05 2026 02:14:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('566', '1', '1', '4', 'LAPTOP_OVERHEAT_RESOLVED', 'เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 02:14:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('567', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:14:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('568', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:16:27 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('569', '1', '1', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Thu Mar 05 2026 02:16:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('570', '1', '1', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 02:16:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('571', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:16:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('572', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 02:18:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('573', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 02:18:47 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('574', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Thu Mar 05 2026 03:03:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('575', '1', '1', '2', 'INTERNET_DOWN', 'อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว', 'Thu Mar 05 2026 03:03:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('576', '1', '1', '2', 'INTERNET_DOWN_RESOLVED', 'เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว', 'Thu Mar 05 2026 03:03:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('577', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Thu Mar 05 2026 03:03:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('578', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:38:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('579', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:39:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('580', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:41:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('581', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:41:39 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('582', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:43:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('583', '1', '1', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Fri Mar 06 2026 00:43:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('584', '1', '1', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 00:43:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('585', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:43:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('586', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:46:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('587', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:46:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('588', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:48:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('589', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 00:48:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('590', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 00:48:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('591', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:48:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('592', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:50:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('593', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 00:50:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('594', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 00:50:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('595', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:50:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('596', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:52:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('597', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 00:52:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('598', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 00:52:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('599', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:52:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('600', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:55:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('601', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 00:55:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('602', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:55:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('603', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 00:55:05 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('604', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:57:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('605', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:57:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('606', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 00:59:16 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('607', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 00:59:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('608', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 00:59:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('609', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 00:59:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('610', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:01:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('611', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:01:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('612', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:03:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('613', '1', '1', '5', 'ELECTRICITY_BILL', 'ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม', 'Fri Mar 06 2026 01:03:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('614', '1', '1', NULL, 'MONEY_DEDUCTED', 'ถูกหักเงิน 134 ฿', 'Fri Mar 06 2026 01:03:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('615', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:03:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('616', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:05:47 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('617', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:05:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('618', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:07:57 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('619', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:08:06 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('620', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:10:12 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('621', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:10:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('622', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:12:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('623', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:12:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('624', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:14:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('625', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:14:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('626', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:16:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('627', '1', '1', '4', 'LAPTOP_OVERHEAT', 'โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า', 'Fri Mar 06 2026 01:16:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('628', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:16:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('629', '1', '1', '4', 'LAPTOP_OVERHEAT_RESOLVED', 'เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 01:16:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('630', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:18:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('631', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:18:43 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('632', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:20:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('633', '1', '1', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Fri Mar 06 2026 01:20:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('634', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:20:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('635', '1', '1', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 01:20:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('636', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:22:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('637', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 01:23:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('638', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 01:23:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('639', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:23:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('640', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:25:18 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('641', '1', '1', '5', 'ELECTRICITY_BILL', 'ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม', 'Fri Mar 06 2026 01:25:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('642', '1', '1', NULL, 'MONEY_DEDUCTED', 'ถูกหักเงิน 259 ฿', 'Fri Mar 06 2026 01:25:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('643', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:25:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('644', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:27:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('645', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 01:27:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('646', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 01:27:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('647', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:27:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('648', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:29:39 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('649', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:29:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('650', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:31:53 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('651', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 01:31:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('652', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:31:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('653', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 01:31:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('654', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:34:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('655', '1', '1', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Fri Mar 06 2026 01:34:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('656', '1', '1', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 01:34:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('657', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:34:20 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('658', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:36:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('659', '1', '1', '4', 'LAPTOP_OVERHEAT', 'โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า', 'Fri Mar 06 2026 01:36:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('660', '1', '1', '4', 'LAPTOP_OVERHEAT_RESOLVED', 'เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 01:36:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('661', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:36:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('662', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Fri Mar 06 2026 01:38:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('663', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Fri Mar 06 2026 01:39:00 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('664', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Fri Mar 06 2026 01:39:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('665', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Fri Mar 06 2026 01:39:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('666', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Sat Mar 07 2026 13:37:30 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('667', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Sat Mar 07 2026 13:37:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('668', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Sat Mar 07 2026 13:41:45 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('669', '1', '1', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Sat Mar 07 2026 13:41:50 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('670', '1', '1', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Sat Mar 07 2026 13:41:55 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('671', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Sat Mar 07 2026 13:42:40 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('672', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Sat Mar 07 2026 13:46:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('673', '1', '1', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Sat Mar 07 2026 13:46:56 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('674', '1', '1', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Sat Mar 07 2026 13:47:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('675', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Sat Mar 07 2026 13:47:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('676', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Sat Mar 07 2026 13:51:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('677', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Sat Mar 07 2026 13:51:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('678', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Sat Mar 07 2026 13:55:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('679', '1', '1', '4', 'LAPTOP_OVERHEAT', 'โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า', 'Sat Mar 07 2026 13:55:46 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('680', '1', '1', '4', 'LAPTOP_OVERHEAT_RESOLVED', 'เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว', 'Sat Mar 07 2026 13:55:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('681', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Sat Mar 07 2026 13:55:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('682', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Sat Mar 07 2026 14:00:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('683', '1', '1', '5', 'ELECTRICITY_BILL', 'ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม', 'Sat Mar 07 2026 14:00:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('684', '1', '1', NULL, 'MONEY_DEDUCTED', 'ถูกหักเงิน 146 ฿', 'Sat Mar 07 2026 14:00:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('685', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Sat Mar 07 2026 14:00:22 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('686', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Sat Mar 07 2026 14:04:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('687', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Sat Mar 07 2026 14:04:42 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('688', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Sat Mar 07 2026 14:08:53 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('689', '1', '1', '2', 'INTERNET_DOWN', 'อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว', 'Sat Mar 07 2026 14:09:03 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('690', '1', '1', '2', 'INTERNET_DOWN_RESOLVED', 'เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว', 'Sat Mar 07 2026 14:09:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('691', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Sat Mar 07 2026 14:09:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('692', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 15:01:16 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('693', '1', '1', '4', 'LAPTOP_OVERHEAT', 'โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า', 'Wed Mar 11 2026 15:01:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('694', '1', '1', '4', 'LAPTOP_OVERHEAT_RESOLVED', 'เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 15:01:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('695', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 15:01:51 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('696', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 15:06:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('697', '1', '1', '2', 'INTERNET_DOWN', 'อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว', 'Wed Mar 11 2026 15:06:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('698', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 15:06:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('699', '1', '1', '2', 'INTERNET_DOWN_RESOLVED', 'เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 15:06:16 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('700', '1', '1', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 15:10:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('701', '1', '1', '5', 'ELECTRICITY_BILL', 'ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม', 'Wed Mar 11 2026 15:10:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('702', '1', '1', NULL, 'MONEY_DEDUCTED', 'ถูกหักเงิน 173 ฿', 'Wed Mar 11 2026 15:10:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('703', '1', '1', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 15:10:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('704', '1', '1', NULL, 'NEW_DAY', 'เริ่มวันที่ 56', 'Wed Mar 11 2026 15:49:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('705', '4', '2', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Wed Mar 11 2026 16:08:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('706', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:08:31 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('707', '4', '2', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:08:36 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('708', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:12:41 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('709', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:13:01 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('710', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:17:11 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('711', '4', '2', '2', 'INTERNET_DOWN', 'อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว', 'Wed Mar 11 2026 16:17:16 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('712', '4', '2', '2', 'INTERNET_DOWN_RESOLVED', 'เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:17:21 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('713', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:17:26 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('714', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:21:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('715', '4', '2', '2', 'INTERNET_DOWN', 'อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว', 'Wed Mar 11 2026 16:21:47 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('716', '4', '2', '2', 'INTERNET_DOWN_RESOLVED', 'เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:21:52 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('717', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:22:07 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('718', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:26:17 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('719', '4', '2', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Wed Mar 11 2026 16:26:32 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('720', '4', '2', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:26:37 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('721', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:27:02 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('722', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:31:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('723', '4', '2', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Wed Mar 11 2026 16:31:28 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('724', '4', '2', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:31:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('725', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:31:48 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('726', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:35:58 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('727', '4', '2', '2', 'INTERNET_DOWN', 'อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว', 'Wed Mar 11 2026 16:36:08 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('728', '4', '2', '2', 'INTERNET_DOWN_RESOLVED', 'เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:36:13 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('729', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:36:23 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('730', '6', '3', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Wed Mar 11 2026 16:38:33 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('731', '6', '3', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:38:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('732', '6', '3', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:38:38 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('733', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:40:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('734', '4', '2', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Wed Mar 11 2026 16:40:44 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('735', '4', '2', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:40:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('736', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:40:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('737', '6', '3', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:42:49 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('738', '6', '3', '3', 'HEAVY_RAIN', 'ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง', 'Wed Mar 11 2026 16:42:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('739', '6', '3', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:42:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('740', '6', '3', '3', 'HEAVY_RAIN_RESOLVED', 'เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:42:59 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('741', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:45:09 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('742', '4', '2', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Wed Mar 11 2026 16:45:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('743', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:45:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('744', '4', '2', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:45:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('745', '6', '3', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:47:04 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('746', '6', '3', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Wed Mar 11 2026 16:47:14 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('747', '6', '3', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:47:19 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('748', '6', '3', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:47:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('749', '4', '2', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:49:24 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('750', '4', '2', '6', 'CAFE_DISCOUNT', 'ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%', 'Wed Mar 11 2026 16:49:29 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('751', '4', '2', '6', 'CAFE_DISCOUNT_RESOLVED', 'เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว', 'Wed Mar 11 2026 16:49:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('752', '4', '2', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:49:34 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('753', '6', '3', NULL, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว', 'Wed Mar 11 2026 16:51:35 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_logs` (`log_id`, `user_id`, `save_id`, `event_id`, `event_type`, `message`, `created_at`) VALUES ('754', '6', '3', '1', 'BLACKOUT', 'ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป', 'Wed Mar 11 2026 16:51:45 GMT+0700 (เวลาอินโดจีน)');

CREATE TABLE `simulation_saves` (
  `save_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `save_name` varchar(50) NOT NULL DEFAULT 'Save 1',
  `sim_money` decimal(15,2) NOT NULL DEFAULT 0.00,
  `sim_reputation` int(11) NOT NULL DEFAULT 10,
  `battery_percent` int(11) NOT NULL DEFAULT 100,
  `is_plugged_in` tinyint(1) NOT NULL DEFAULT 1,
  `current_location_id` int(11) DEFAULT 1,
  `current_day` int(11) NOT NULL DEFAULT 1,
  `current_hour` decimal(4,1) NOT NULL DEFAULT 8.0,
  `jobs_completed` int(11) NOT NULL DEFAULT 0,
  `jobs_failed` int(11) NOT NULL DEFAULT 0,
  `total_earned` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_spent` decimal(15,2) NOT NULL DEFAULT 0.00,
  `environment_status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`environment_status`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`save_id`),
  KEY `idx_sim_saves_user` (`user_id`),
  KEY `idx_sim_saves_active` (`user_id`,`is_active`),
  KEY `fk_sim_saves_location` (`current_location_id`),
  CONSTRAINT `fk_sim_saves_location` FOREIGN KEY (`current_location_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sim_saves_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `simulation_saves` (`save_id`, `user_id`, `save_name`, `sim_money`, `sim_reputation`, `battery_percent`, `is_plugged_in`, `current_location_id`, `current_day`, `current_hour`, `jobs_completed`, `jobs_failed`, `total_earned`, `total_spent`, `environment_status`, `is_active`, `created_at`, `updated_at`) VALUES ('1', '1', 'Auto Save', '0.00', '10', '100', '1', '1', '56', '8.0', '0', '0', '0.00', '840.00', '{"is_blackout":false,"events_today_count":2,"last_event_time":"2026-03-11T08:10:32.009Z","critical_today":true}', '1', 'Thu Mar 05 2026 01:47:52 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 15:49:54 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_saves` (`save_id`, `user_id`, `save_name`, `sim_money`, `sim_reputation`, `battery_percent`, `is_plugged_in`, `current_location_id`, `current_day`, `current_hour`, `jobs_completed`, `jobs_failed`, `total_earned`, `total_spent`, `environment_status`, `is_active`, `created_at`, `updated_at`) VALUES ('2', '4', 'Auto Save', '0.00', '10', '8', '1', '1', '10', '8.0', '0', '0', '0.00', '0.00', '{"events_today_count":2,"last_event_time":"2026-03-11T09:49:34.927Z","critical_today":true,"is_blackout":true}', '1', 'Wed Mar 11 2026 16:08:28 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 16:53:25 GMT+0700 (เวลาอินโดจีน)');
INSERT INTO `simulation_saves` (`save_id`, `user_id`, `save_name`, `sim_money`, `sim_reputation`, `battery_percent`, `is_plugged_in`, `current_location_id`, `current_day`, `current_hour`, `jobs_completed`, `jobs_failed`, `total_earned`, `total_spent`, `environment_status`, `is_active`, `created_at`, `updated_at`) VALUES ('3', '6', 'Auto Save', '0.00', '10', '60', '1', '1', '4', '8.0', '0', '0', '0.00', '0.00', '{"is_blackout":true,"events_today_count":1,"last_event_time":"2026-03-11T09:51:45.164Z","critical_today":true}', '1', 'Wed Mar 11 2026 16:38:22 GMT+0700 (เวลาอินโดจีน)', 'Wed Mar 11 2026 16:53:25 GMT+0700 (เวลาอินโดจีน)');

CREATE TABLE `survey_options` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `option_text` varchar(200) NOT NULL,
  `option_description` varchar(500) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_survey_opts_question` (`question_id`),
  CONSTRAINT `fk_survey_opts_question` FOREIGN KEY (`question_id`) REFERENCES `survey_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `survey_options` (`id`, `question_id`, `option_text`, `option_description`, `order`) VALUES ('1', '1', 'ดูวิดีโอ', 'เรียนรู้ผ่านวิดีโอและตัวอย่าง', '1');
INSERT INTO `survey_options` (`id`, `question_id`, `option_text`, `option_description`, `order`) VALUES ('2', '1', 'ลงมือทำ', 'เรียนรู้ผ่านการฝึกเขียนโค้ดจริง', '2');
INSERT INTO `survey_options` (`id`, `question_id`, `option_text`, `option_description`, `order`) VALUES ('3', '1', 'อ่านบทความ', 'เรียนรู้ผ่านเนื้อหาและเอกสาร', '3');
INSERT INTO `survey_options` (`id`, `question_id`, `option_text`, `option_description`, `order`) VALUES ('4', '2', 'พัฒนาเว็บไซต์', 'สร้างเว็บแอปพลิเคชัน', '1');
INSERT INTO `survey_options` (`id`, `question_id`, `option_text`, `option_description`, `order`) VALUES ('5', '2', 'วิเคราะห์ข้อมูล', 'Data Science & Analytics', '2');
INSERT INTO `survey_options` (`id`, `question_id`, `option_text`, `option_description`, `order`) VALUES ('6', '2', 'สร้างเกม', 'Game Development', '3');
INSERT INTO `survey_options` (`id`, `question_id`, `option_text`, `option_description`, `order`) VALUES ('7', '2', 'ทั่วไป', 'เรียนรู้พื้นฐานเพื่อใช้งานทั่วไป', '4');

CREATE TABLE `survey_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `survey_questions` (`id`, `title`, `description`, `image`) VALUES ('1', 'คุณเรียนรู้ได้ดีที่สุดด้วยวิธีใด?', 'เราจะปรับเส้นทางการเรียนรู้ให้เหมาะกับคุณ', 'cat-coding.png');
INSERT INTO `survey_questions` (`id`, `title`, `description`, `image`) VALUES ('2', 'คุณอยากเรียน Python ไปทำอะไร?', 'เป้าหมายจะช่วยให้เราแนะนำเนื้อหาที่เหมาะกับคุณ', 'cat-mascot.png');
INSERT INTO `survey_questions` (`id`, `title`, `description`, `image`) VALUES ('3', 'ประสบการณ์ของคุณ', 'เลือกระดับที่ตรงกับคุณมากที่สุด', 'cat-logo.png');

CREATE TABLE `user_achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `achievement_id` int(11) NOT NULL,
  `unlocked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `achievement_id` (`achievement_id`),
  CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`achievement_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_contracts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `contract_id` int(11) NOT NULL,
  `status` enum('ACTIVE','COMPLETED','FAILED') DEFAULT 'ACTIVE',
  `accepted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `user_contracts` (`id`, `user_id`, `contract_id`, `status`, `accepted_at`) VALUES ('1', '1', '12', 'ACTIVE', 'Sat Feb 21 2026 10:56:00 GMT+0700 (เวลาอินโดจีน)');

CREATE TABLE `user_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `purchased_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_item` (`user_id`,`item_id`),
  KEY `idx_inventory_user` (`user_id`),
  KEY `fk_inventory_item` (`item_id`),
  CONSTRAINT `fk_inventory_item` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`item_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_profile_showcase` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `achievement_id` int(11) NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_achievement_showcase` (`user_id`,`achievement_id`),
  KEY `idx_showcase_user` (`user_id`),
  KEY `fk_showcase_achievement` (`achievement_id`),
  CONSTRAINT `fk_showcase_achievement` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`achievement_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_showcase_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reputation` int(11) DEFAULT 10,
  `equipped_theme_id` int(11) DEFAULT NULL,
  `equipped_mouse_effect_id` int(11) DEFAULT NULL,
  `equipped_profile_frame_id` int(11) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'user',
  `level` int(11) DEFAULT 1,
  `xp` int(11) DEFAULT 0,
  `virtual_currency` int(11) DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_theme` (`equipped_theme_id`),
  KEY `fk_users_mouse_effect` (`equipped_mouse_effect_id`),
  KEY `fk_users_profile_frame` (`equipped_profile_frame_id`),
  CONSTRAINT `fk_users_mouse_effect` FOREIGN KEY (`equipped_mouse_effect_id`) REFERENCES `shop_items` (`item_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_profile_frame` FOREIGN KEY (`equipped_profile_frame_id`) REFERENCES `shop_items` (`item_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_theme` FOREIGN KEY (`equipped_theme_id`) REFERENCES `shop_items` (`item_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `created_at`, `reputation`, `equipped_theme_id`, `equipped_mouse_effect_id`, `equipped_profile_frame_id`, `avatar_url`, `bio`, `role`, `level`, `xp`, `virtual_currency`) VALUES ('1', 'test', '$2b$10$.g6mWLu5/itUWztGvhusv.WsNSmJMVtge7eMCapzPUDulm0cHiqVW', NULL, 'Wed Feb 18 2026 15:55:06 GMT+0700 (เวลาอินโดจีน)', '10', NULL, NULL, NULL, NULL, NULL, 'user', '1', '0', '0');
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `created_at`, `reputation`, `equipped_theme_id`, `equipped_mouse_effect_id`, `equipped_profile_frame_id`, `avatar_url`, `bio`, `role`, `level`, `xp`, `virtual_currency`) VALUES ('2', 'testuser', '$2b$10$n17fLyNBMm.ayTFuap.oUOmsjEbL38V3buli4cIAHSvHQ9cEuPPAq', 'test@test.com', 'Thu Mar 05 2026 01:49:15 GMT+0700 (เวลาอินโดจีน)', '10', NULL, NULL, NULL, NULL, NULL, 'user', '1', '0', '0');
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `created_at`, `reputation`, `equipped_theme_id`, `equipped_mouse_effect_id`, `equipped_profile_frame_id`, `avatar_url`, `bio`, `role`, `level`, `xp`, `virtual_currency`) VALUES ('3', 'test1', '$2b$10$wH/NPiv4vnqoftpn7wANZupeXiBUdl7/c3cf5rEghWUCAvVkvIIoS', 'test123@gmail.com', 'Thu Mar 05 2026 01:53:02 GMT+0700 (เวลาอินโดจีน)', '10', NULL, NULL, NULL, NULL, NULL, 'user', '1', '0', '0');
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `created_at`, `reputation`, `equipped_theme_id`, `equipped_mouse_effect_id`, `equipped_profile_frame_id`, `avatar_url`, `bio`, `role`, `level`, `xp`, `virtual_currency`) VALUES ('4', 'user01', '$2b$10$gQKpKghk7gDy3.RFMPT.deKmLHKx6gbJhbrYNLCbbRIW0rY2C4CTe', 'pungpatpp100@gmail.com', 'Thu Mar 05 2026 02:18:50 GMT+0700 (เวลาอินโดจีน)', '10', NULL, NULL, NULL, NULL, NULL, 'user', '1', '0', '0');
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `created_at`, `reputation`, `equipped_theme_id`, `equipped_mouse_effect_id`, `equipped_profile_frame_id`, `avatar_url`, `bio`, `role`, `level`, `xp`, `virtual_currency`) VALUES ('5', 'demo123', '$2b$10$NwKlbUp1vYIFtEyhSqlHKeDKSHRGQJ8iNQRoEKopRQyAitbqIRjhS', 'demo@test.com', 'Fri Mar 06 2026 00:42:55 GMT+0700 (เวลาอินโดจีน)', '10', NULL, NULL, NULL, NULL, NULL, 'user', '0', '0', '0');
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `created_at`, `reputation`, `equipped_theme_id`, `equipped_mouse_effect_id`, `equipped_profile_frame_id`, `avatar_url`, `bio`, `role`, `level`, `xp`, `virtual_currency`) VALUES ('6', 'testuser123', '$2b$10$sPAwzomuyawCvedRBXYNYOrrRS4uWPAsfAQlpdpScNYzdfxRTM5M2', 'testuser123@example.com', 'Fri Mar 06 2026 01:19:40 GMT+0700 (เวลาอินโดจีน)', '10', NULL, NULL, NULL, NULL, NULL, 'user', '1', '0', '0');
INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `created_at`, `reputation`, `equipped_theme_id`, `equipped_mouse_effect_id`, `equipped_profile_frame_id`, `avatar_url`, `bio`, `role`, `level`, `xp`, `virtual_currency`) VALUES ('7', 'miki', '$2b$10$/AtuqB6y0TUyJSt/WJP4..BTzbZCm.sg2Kb9bnWuhVg10MyVKwm/a', 'pungpatpp10@gmail.com', 'Sat Mar 07 2026 13:39:05 GMT+0700 (เวลาอินโดจีน)', '10', NULL, NULL, NULL, NULL, NULL, 'user', '0', '0', '0');

