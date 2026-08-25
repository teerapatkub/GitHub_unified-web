-- Patch: add schema/content needed by friend mini-game DB without replacing your current DB
-- Run this on the existing project database in phpMyAdmin. Backup first.
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

-- Existing project tables: columns needed by your current shop/theme/admin code
ALTER TABLE `shop_items`
  ADD COLUMN IF NOT EXISTS `item_type` varchar(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `asset_url` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `preview_image` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `effects` longtext DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_active` tinyint(1) NOT NULL DEFAULT 1;

UPDATE `shop_items` SET `item_type` = `type` WHERE `item_type` IS NULL AND `type` IS NOT NULL;
UPDATE `shop_items` SET `effects` = `preview_data` WHERE (`effects` IS NULL OR `effects` = '') AND `preview_data` IS NOT NULL;
UPDATE `shop_items` SET `is_active` = `is_available` WHERE `is_active` IS NULL;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `is_banned` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `ban_until` timestamp NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `deleted_at` timestamp NULL DEFAULT NULL;

-- Tables that may be missing entirely in the old DB
CREATE TABLE IF NOT EXISTS `exercises` (`exercise_id` int(11) NOT NULL AUTO_INCREMENT, `lesson_id` int(11) DEFAULT NULL, `title` varchar(100) DEFAULT NULL, `description` text DEFAULT NULL, `starter_code` longtext DEFAULT NULL, `solution_code` longtext DEFAULT NULL, `test_cases` longtext DEFAULT NULL, `xp_reward` int(11) DEFAULT 10, `currency_reward` int(11) DEFAULT 5, PRIMARY KEY (`exercise_id`), KEY `idx_exercises_lesson` (`lesson_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `exercise_submissions` (`submission_id` int(11) NOT NULL AUTO_INCREMENT, `user_id` int(11) DEFAULT NULL, `exercise_id` int(11) DEFAULT NULL, `submitted_code` longtext NOT NULL, `is_passed` tinyint(1) NOT NULL DEFAULT 0, `score` int(11) DEFAULT 0, `execution_time_ms` int(11) DEFAULT NULL, `error_message` text DEFAULT NULL, `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`submission_id`), KEY `idx_exercise_submissions_user_exercise` (`user_id`,`exercise_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `game_sessions` (`session_id` int(11) NOT NULL AUTO_INCREMENT, `user_id` int(11) DEFAULT NULL, `mode` varchar(20) NOT NULL, `started_at` timestamp NOT NULL DEFAULT current_timestamp(), `ended_at` timestamp NULL DEFAULT NULL, PRIMARY KEY (`session_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `lesson_quiz_attempts` (`attempt_id` int(11) NOT NULL AUTO_INCREMENT, `user_id` int(11) NOT NULL, `lesson_id` int(11) NOT NULL, `quiz_type` varchar(10) NOT NULL, `score` int(11) NOT NULL DEFAULT 0, `total_questions` int(11) NOT NULL DEFAULT 0, `answers_json` longtext DEFAULT NULL, `completed_at` timestamp NOT NULL DEFAULT current_timestamp(), `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (`attempt_id`), UNIQUE KEY `uk_lesson_quiz_attempt` (`user_id`,`lesson_id`,`quiz_type`), KEY `idx_lesson_quiz_attempt_lesson` (`lesson_id`,`quiz_type`), KEY `idx_lesson_quiz_attempt_user` (`user_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Mini-game tables. These include columns needed by the current merged server code.
CREATE TABLE IF NOT EXISTS `mini_game_locations` (`location_id` int(11) NOT NULL AUTO_INCREMENT, `location_key` varchar(50) NOT NULL, `name` varchar(100) NOT NULL, `description` text DEFAULT NULL, `bg_image_url` varchar(255) DEFAULT NULL, `created_at` timestamp NOT NULL DEFAULT current_timestamp(), `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (`location_id`), UNIQUE KEY `uq_mini_game_locations_key` (`location_key`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `mini_game_npcs` (`npc_id` int(11) NOT NULL AUTO_INCREMENT, `npc_key` varchar(50) NOT NULL, `name` varchar(100) NOT NULL, `avatar_asset_url` varchar(255) DEFAULT NULL, `default_emotion` varchar(50) NOT NULL DEFAULT 'neutral', `description` text DEFAULT NULL, `created_at` timestamp NOT NULL DEFAULT current_timestamp(), `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (`npc_id`), UNIQUE KEY `uq_mini_game_npcs_key` (`npc_key`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `mini_game_exercises` (`exercise_id` int(11) NOT NULL AUTO_INCREMENT, `lesson_id` int(11) DEFAULT NULL, `exercise_order` varchar(20) DEFAULT NULL, `title` varchar(150) NOT NULL, `description` text DEFAULT NULL, `starter_code` longtext DEFAULT NULL, `solution_code` longtext DEFAULT NULL, `test_cases_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`test_cases_json`)), `xp_reward` int(11) NOT NULL DEFAULT 10, `currency_reward` int(11) NOT NULL DEFAULT 5, `is_active` tinyint(1) NOT NULL DEFAULT 1, `created_at` timestamp NOT NULL DEFAULT current_timestamp(), `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (`exercise_id`), KEY `idx_mini_game_exercises_lesson` (`lesson_id`), KEY `idx_mini_game_exercises_order` (`exercise_order`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `mini_game_dialogues` (`dialogue_id` int(11) NOT NULL AUTO_INCREMENT, `lesson_id` int(11) NOT NULL DEFAULT 1, `exercise_id` int(11) DEFAULT NULL, `dialogue_order` int(11) NOT NULL DEFAULT 0, `exercise_order` varchar(20) DEFAULT NULL, `dialogue_text` text NOT NULL, `npc_id` int(11) DEFAULT NULL, `npc_emotion` varchar(50) NOT NULL DEFAULT 'neutral', `location_id` int(11) DEFAULT NULL, `dialogue_phase` enum('pre_submit','post_submit') NOT NULL DEFAULT 'pre_submit', `branch_key` varchar(80) NOT NULL DEFAULT 'default', `created_at` timestamp NOT NULL DEFAULT current_timestamp(), `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (`dialogue_id`), KEY `idx_mini_game_dialogues_exercise_order` (`exercise_id`,`dialogue_order`), KEY `idx_mini_game_dialogues_npc` (`npc_id`), KEY `idx_mini_game_dialogues_location` (`location_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `mini_game_current_conversations` (`user_id` int(11) NOT NULL, `exercise_id` int(11) DEFAULT NULL, `dialogue_id` int(11) NOT NULL, `current_npc_id` int(11) DEFAULT NULL, `current_location_id` int(11) DEFAULT NULL, `branch_key` varchar(80) NOT NULL DEFAULT 'default', `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (`user_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `mini_game_exercise_submissions` (`submission_id` int(11) NOT NULL AUTO_INCREMENT, `user_id` int(11) NOT NULL, `exercise_id` int(11) NOT NULL, `submitted_code` longtext NOT NULL, `is_passed` tinyint(1) NOT NULL DEFAULT 0, `score` int(11) NOT NULL DEFAULT 0, `passed_test_count` int(11) NOT NULL DEFAULT 0, `total_test_count` int(11) NOT NULL DEFAULT 0, `selected_branch_key` varchar(80) DEFAULT NULL, `reward_granted` tinyint(1) NOT NULL DEFAULT 0, `execution_time_ms` int(11) DEFAULT NULL, `error_message` text DEFAULT NULL, `submitted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (`submission_id`), UNIQUE KEY `uq_user_exercise_submission` (`user_id`,`exercise_id`), KEY `idx_mini_game_submissions_exercise` (`exercise_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `mini_game_user_exercise_progress` (`progress_id` int(11) NOT NULL AUTO_INCREMENT, `user_id` int(11) NOT NULL, `exercise_id` int(11) NOT NULL, `is_completed` tinyint(1) NOT NULL DEFAULT 0, `completed_at` timestamp NULL DEFAULT NULL, `reward_claimed` tinyint(1) NOT NULL DEFAULT 0, `best_score` int(11) NOT NULL DEFAULT 0, `selected_branch_key` varchar(80) NOT NULL DEFAULT 'default', `last_submission_id` int(11) DEFAULT NULL, `xp_reward` int(11) NOT NULL DEFAULT 0, `currency_reward` int(11) NOT NULL DEFAULT 0, `created_at` timestamp NOT NULL DEFAULT current_timestamp(), `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (`progress_id`), UNIQUE KEY `uq_mini_game_progress_user_exercise` (`user_id`,`exercise_id`), KEY `idx_mini_game_progress_exercise` (`exercise_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Compatibility for old mini-game tables that already existed before this patch
ALTER TABLE `mini_game_exercises` ADD COLUMN IF NOT EXISTS `is_active` tinyint(1) NOT NULL DEFAULT 1;
ALTER TABLE `mini_game_dialogues` ADD COLUMN IF NOT EXISTS `lesson_id` int(11) NOT NULL DEFAULT 1 AFTER `dialogue_id`;
ALTER TABLE `mini_game_dialogues` ADD COLUMN IF NOT EXISTS `dialogue_phase` enum('pre_submit','post_submit') NOT NULL DEFAULT 'pre_submit';
ALTER TABLE `mini_game_dialogues` ADD COLUMN IF NOT EXISTS `branch_key` varchar(80) NOT NULL DEFAULT 'default';
ALTER TABLE `mini_game_npcs` ADD COLUMN IF NOT EXISTS `default_emotion` varchar(50) NOT NULL DEFAULT 'neutral';
ALTER TABLE `mini_game_exercise_submissions` ADD COLUMN IF NOT EXISTS `is_passed` tinyint(1) NOT NULL DEFAULT 0;
ALTER TABLE `mini_game_exercise_submissions` ADD COLUMN IF NOT EXISTS `score` int(11) NOT NULL DEFAULT 0;
ALTER TABLE `mini_game_exercise_submissions` ADD COLUMN IF NOT EXISTS `selected_branch_key` varchar(80) DEFAULT NULL;
ALTER TABLE `mini_game_exercise_submissions` ADD UNIQUE KEY IF NOT EXISTS `uq_user_exercise_submission` (`user_id`,`exercise_id`);
ALTER TABLE `mini_game_user_exercise_progress` ADD COLUMN IF NOT EXISTS `xp_reward` int(11) NOT NULL DEFAULT 0;
ALTER TABLE `mini_game_user_exercise_progress` ADD COLUMN IF NOT EXISTS `currency_reward` int(11) NOT NULL DEFAULT 0;

-- Seed/content rows from the friend DB. Runtime progress/session rows are intentionally skipped.
INSERT IGNORE INTO `exercises` (`exercise_id`, `lesson_id`, `title`, `description`, `starter_code`, `solution_code`, `test_cases`, `xp_reward`, `currency_reward`) VALUES
(1, 1, 'ทักทายด้วย Python', 'เขียนโปรแกรมแสดงข้อความ \"Hello, Python!\" ออกทางหน้าจอ 1 บรรทัด', 'print(\"Hello, Python!\")', 'print(\"Hello, Python!\")', '[{\"input\":\"\",\"expected\":\"Hello, Python!\"}]', 15, 5),
(2, 2, 'สร้างตัวแปรเก็บชื่อ', 'สร้างตัวแปรชื่อ name เก็บคำว่า \"PySim\" แล้วแสดงค่าตัวแปรออกทางหน้าจอ', 'name = \"PySim\"\nprint(name)', 'name = \"PySim\"\nprint(name)', '[{\"input\":\"\",\"expected\":\"PySim\"}]', 20, 6),
(3, 3, 'รับชื่อแล้วทักทาย', 'รับชื่อจากผู้ใช้ 1 ค่า แล้วแสดงข้อความในรูปแบบ \"สวัสดี <ชื่อ>\"', 'name = input()\nprint(\"สวัสดี\", name)', 'name = input()\nprint(\"สวัสดี\", name)', '[{\"input\":\"สมชาย\",\"expected\":\"สวัสดี สมชาย\"},{\"input\":\"Lumi\",\"expected\":\"สวัสดี Lumi\"}]', 25, 8),
(4, 4, 'ผ่านหรือไม่ผ่าน', 'รับคะแนน 1 ค่า ถ้าคะแนนตั้งแต่ 50 ขึ้นไปให้แสดง \"ผ่าน\" ถ้าน้อยกว่า 50 ให้แสดง \"ไม่ผ่าน\"', 'score = int(input())\nif score >= 50:\n    print(\"ผ่าน\")\nelse:\n    print(\"ไม่ผ่าน\")', 'score = int(input())\nif score >= 50:\n    print(\"ผ่าน\")\nelse:\n    print(\"ไม่ผ่าน\")', '[{\"input\":\"80\",\"expected\":\"ผ่าน\"},{\"input\":\"42\",\"expected\":\"ไม่ผ่าน\"}]', 30, 10),
(5, 5, 'นับเลข 1 ถึง n', 'รับจำนวนเต็ม n แล้วแสดงตัวเลขตั้งแต่ 1 ถึง n ทีละบรรทัด', 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)', 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)', '[{\"input\":\"3\",\"expected\":\"1\\n2\\n3\"},{\"input\":\"1\",\"expected\":\"1\"}]', 35, 12),
(6, 6, 'สร้างฟังก์ชันบวกเลข', 'เขียนฟังก์ชัน add(a, b) ที่คืนค่าผลบวกของตัวเลขสองจำนวน แล้วแสดงผลจากค่าที่รับเข้ามา', 'def add(a, b):\n    return a + b\n\na = int(input())\nb = int(input())\nprint(add(a, b))', 'def add(a, b):\n    return a + b\n\na = int(input())\nb = int(input())\nprint(add(a, b))', '[{\"input\":\"2\\n3\",\"expected\":\"5\"},{\"input\":\"10\\n7\",\"expected\":\"17\"}]', 40, 15);

INSERT IGNORE INTO `mini_game_locations` (`location_id`, `location_key`, `name`, `description`, `bg_image_url`, `created_at`, `updated_at`) VALUES
(1, 'python_lab', 'ห้องเรียน', 'ห้องเรียนปกติธรรมดาไม่มีอะไรเป็นพิเศษ', '/data_MiNiGame/locations/classroom.jpg', '2026-06-20 22:00:56', '2026-06-24 16:28:24');

INSERT IGNORE INTO `mini_game_npcs` (`npc_id`, `npc_key`, `name`, `avatar_asset_url`, `description`, `created_at`, `updated_at`) VALUES
(1, 'lumi', 'Lumi', '/data_MiNiGame/NPC_lumi', 'lumi แสนน่ารักที่สุดในโลก', '2026-06-20 22:00:56', '2026-06-25 16:36:40'),
(2, 'system', 'System', NULL, 'ระบบจัดการสถานการณ์ของเกม', '2026-06-20 22:00:56', '2026-06-20 22:00:56');

INSERT IGNORE INTO `mini_game_exercises` (`exercise_id`, `lesson_id`, `exercise_order`, `title`, `description`, `starter_code`, `solution_code`, `test_cases_json`, `xp_reward`, `currency_reward`, `created_at`, `updated_at`) VALUES
(1, 1, 'START', 'จุดเริ่มต้นของทางแยก', 'เขียนคำสั่งคำนวณภาษีมูลค่าเพิ่ม 7% (VAT 7%) จากซื้อสินค้าที่ป้อนเข้ามา แล้วแสดงราคารวมทั้งหมดออกทางหน้าจอ\r\n(ระบบจะตรวจสอบจากราคารวมภาษี: หากราคารวมภาษีมากกว่า 500 จะไปทางเลือก 1A, ถ้าน้อยกว่าหรือเท่ากับ 500 จะไปทางเลือก 1B)', 'price = float(input(\"ซื้อสินค้าราคา: \"))\r\n\r\n# คำนวณราคารวมภาษี\r\nvat_total = price * 1.07\r\n\r\n# TODO: แสดงผลราคารวมทั้งหมดให้ถูกต้องตามรูปแบบ\r\nprint(\"ราคารวมทั้งหมดคือ:\", vat_total)', 'price = float(input(\"ซื้อสินค้าราคา: \"))\r\n\r\n# คำนวณราคารวมภาษี\r\nvat_total = price * 1.07\r\n\r\n# TODO: แสดงผลราคารวมทั้งหมดให้ถูกต้องตามรูปแบบ\r\nprint(\"ราคารวมทั้งหมดคือ:\", vat_total)', '{\"expected_format\": \"ราคารวมทั้งหมดคือ: {total}\",\"rules\": [{ \"condition\": \"float > 500\", \"branch_key\": \"1A\" },{ \"condition\": \"float <= 500\", \"branch_key\": \"1B\" }],\"correctness\": [{ \"input\": \"100\", \"expected\": \"ราคารวมทั้งหมดคือ: 107.0\" },{ \"input\": \"250\", \"expected\": \"ราคารวมทั้งหมดคือ: 267.5\" },{ \"input\": \"500\", \"expected\": \"ราคารวมทั้งหมดคือ: 535.0\" },{ \"input\": \"700\", \"expected\": \"ราคารวมทั้งหมดคือ: 749.0\" },{ \"input\": \"1000\", \"expected\": \"ราคารวมทั้งหมดคือ: 1070.0\" }]}', 15, 5, '2026-06-20 15:00:56', '2026-06-25 17:37:34'),
(2, 1, '1A', 'เส้นทางวิทยาศาสตร์ 1A', 'ยินดีต้อนรับสู่เส้นทาง 1A พิมพ์ 1A_2A หรือ 1A_2B เพื่อไปต่อ', 'print(\"\")', 'print(\"\")', '{\"expected_format\": \"{value}\", \"rules\": [{\"condition\": \"value == \'1A_2A\'\", \"branch_key\": \"1A_2A\"}, {\"condition\": \"value == \'1A_2B\'\", \"branch_key\": \"1A_2B\"}]}', 20, 10, '2026-06-20 15:00:56', '2026-06-26 22:47:58'),
(3, 1, '1B', 'เส้นทางเวทมนตร์ 1B', 'ยินดีต้อนรับสู่เส้นทาง 1B พิมพ์ 1B_2A หรือ 1B_2B เพื่อไปต่อ', 'print(\"\")', 'print(\"\")', '{\"expected_format\": \"{value}\", \"rules\": [{\"condition\": \"value == \'1B_2A\'\", \"branch_key\": \"1B_2A\"}, {\"condition\": \"value == \'1B_2B\'\", \"branch_key\": \"1B_2B\"}]}', 20, 10, '2026-06-20 15:00:56', '2026-06-26 22:48:09'),
(4, 1, '1A_2A', 'บทสรุปสายวิชาการ 1A_2A', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1A_2A แล้ว พิมพ์ print(\"success\") เพื่อจบด่าน', 'print(\"\")', 'print(\"success\")', '{\"expected_format\": \"{value}\", \"rules\": [{\"condition\": \"value == \'success\'\", \"branch_key\": \"end\"}]}', 30, 15, '2026-06-20 15:00:56', '2026-06-25 08:00:00'),
(5, 1, '1A_2B', 'บทสรุปสายวิชาการ 1A_2B', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1A_2B แล้ว พิมพ์ print(\"success\") เพื่อจบด่าน', 'print(\"\")', 'print(\"success\")', '{\"expected_format\": \"{value}\", \"rules\": [{\"condition\": \"value == \'success\'\", \"branch_key\": \"end\"}]}', 30, 15, '2026-06-20 15:00:56', '2026-06-25 08:00:00'),
(6, 1, '1B_2A', 'บทสรุปสายเวทมนตร์ 1B_2A', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1B_2A แล้ว พิมพ์ print(\"success\") เพื่อจบด่าน', 'print(\"\")', 'print(\"success\")', '{\"expected_format\": \"{value}\", \"rules\": [{\"condition\": \"value == \'success\'\", \"branch_key\": \"end\"}]}', 30, 15, '2026-06-20 15:00:56', '2026-06-25 08:00:00'),
(7, 1, '1B_2B', 'บทสรุปสายเวทมนตร์ 1B_2B', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1B_2B แล้ว พิมพ์ print(\"success\") เพื่อจบด่าน', 'print(\"\")', 'print(\"success\")', '{\"expected_format\": \"{value}\", \"rules\": [{\"condition\": \"value == \'success\'\", \"branch_key\": \"end\"}]}', 30, 15, '2026-06-20 15:00:56', '2026-06-25 08:00:00');

INSERT IGNORE INTO `mini_game_dialogues` (`dialogue_id`, `lesson_id`, `exercise_id`, `dialogue_order`, `exercise_order`, `dialogue_text`, `npc_id`, `npc_emotion`, `location_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 0, 'START', 'สวัสดีค่ะ ยินดีต้อนรับสู่ห้องเรียนเขียนโปรแกรม Python ลำดับแรกมาเรียนรู้ระบบกันก่อนนะคะ', 1, 'smile', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(2, 1, 1, 1, 'START', 'ในด่านนี้เราจะมาฝึกคำนวณภาษีมูลค่าเพิ่ม (VAT 7%) กันค่ะ ลองเขียนโค้ดตามโจทย์ดูนะคะ', 1, 'neutral', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(3, 1, 2, 0, '1A', 'ยินดีต้อนรับเข้าสู่ด่านเส้นทางวิทยาศาสตร์ 1A ค่ะ!', 1, 'smile', 1, '2026-06-24 02:19:03', '2026-06-25 08:00:00'),
(4, 1, 2, 1, '1A', 'ภารกิจของด่านนี้คือฝึกฝนการใช้คำสั่งพิมพ์คำว่า 1A_2A หรือ 1A_2B เพื่อไปต่อค่ะ', 1, 'happy', 1, '2026-06-24 02:19:03', '2026-06-25 17:57:41'),
(5, 1, 3, 0, '1B', 'ยินดีต้อนรับสู่ห้องแล็บฝั่งเวทมนตร์ 1B ครับผม', 2, 'neutral', 1, '2026-06-24 02:19:03', '2026-06-25 08:00:00'),
(6, 1, 3, 1, '1B', 'ภารกิจของด่านนี้คือฝึกฝนการใช้คำสั่งพิมพ์คำว่า 1B_2A หรือ 1B_2B เพื่อไปต่อครับ', 2, 'smile', 1, '2026-06-24 02:19:03', '2026-06-25 08:00:00'),
(7, 1, 4, 0, '1A_2A', 'ยินดีต้อนรับเข้าสู่ด่านสรุป 1A_2A ค่ะ คุณทำคะแนนได้ดีมาก!', 1, 'smile', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(8, 1, 4, 1, '1A_2A', 'พิมพ์คำสั่ง print(\"success\") เพื่อส่งงานและสรุปผลรับรางวัลชิ้นแรกกันเลย', 1, 'smile', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(9, 1, 5, 0, '1A_2B', 'เดินทางมาถึงด่านสรุป 1A_2B แล้วครับ เก่งมากเลย', 2, 'neutral', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(10, 1, 5, 1, '1A_2B', 'พิมพ์ส่งคำตอบ print(\"success\") เพื่อตรวจสอบความถูกต้องขั้นสุดท้ายกันนะครับ', 2, 'smile', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(11, 1, 6, 0, '1B_2A', 'ในที่สุดคุณก็ฝ่าฟันมาถึงหอคอยเวทมนตร์สาย 1B_2A ได้สำเร็จแล้วค่ะ!', 1, 'smile', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(12, 1, 6, 1, '1B_2A', 'รวบรวมมานาแล้วพิมพ์ print(\"success\") เพื่อปลดล็อครางวัลของด่านนี้กันเลย', 1, 'curious', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(13, 1, 7, 0, '1B_2B', 'ยินดีต้อนรับสู่โรงงานผลิตอาวุธเวทมนตร์ 1B_2B ครับ อุปกรณ์ทุกอย่างพร้อมแล้ว', 2, 'neutral', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(14, 1, 7, 1, '1B_2B', 'มาเปิดสวิตช์เดินเครื่องจักรด้วยคำสั่ง print(\"success\") เพื่อจบการทำงานกันเถอะครับ', 1, 'smile', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(15, 1, NULL, 0, 'end', 'ยินดีด้วยค่ะ! แบบทดสอบทั้งหมดได้จบลงเป็นที่เรียบร้อยแล้ว', 1, 'smile', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03'),
(16, 1, NULL, 1, 'end', 'คุณได้ผ่านการเรียนรู้และทำภารกิจครบถ้วนแล้ว เก่งมากๆ เลยไว้เจอกันใหม่นะคะ!', 1, 'smile', 1, '2026-06-24 02:19:03', '2026-06-24 02:19:03');

SET FOREIGN_KEY_CHECKS = 1;

