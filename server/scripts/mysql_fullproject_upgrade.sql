USE `FullProjectPython`;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `is_banned` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `ban_until` timestamp NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `deleted_at` timestamp NULL DEFAULT NULL;

ALTER TABLE `shop_items`
  ADD COLUMN IF NOT EXISTS `item_type` varchar(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `asset_url` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `preview_image` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `effects` longtext DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_active` tinyint(1) NOT NULL DEFAULT 1;

UPDATE `shop_items`
SET `item_type` = `type`
WHERE `item_type` IS NULL AND `type` IS NOT NULL;

UPDATE `shop_items`
SET `effects` = `preview_data`
WHERE (`effects` IS NULL OR `effects` = '') AND `preview_data` IS NOT NULL;

UPDATE `shop_items`
SET `is_active` = `is_available`
WHERE `is_active` IS NULL;

ALTER TABLE `user_contracts`
  ADD COLUMN IF NOT EXISTS `accepted_day` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `carried_days` int(11) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `status_reason` varchar(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `completed_day` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `failed_day` int(11) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS `exercise_submissions` (
  `submission_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `exercise_id` int(11) DEFAULT NULL,
  `submitted_code` longtext NOT NULL,
  `is_passed` tinyint(1) NOT NULL DEFAULT 0,
  `score` int(11) DEFAULT 0,
  `execution_time_ms` int(11) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`submission_id`),
  KEY `idx_exercise_submissions_user` (`user_id`),
  KEY `idx_exercise_submissions_exercise` (`exercise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `exercises` (
  `exercise_id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `starter_code` longtext DEFAULT NULL,
  `solution_code` longtext DEFAULT NULL,
  `test_cases` longtext DEFAULT NULL,
  `xp_reward` int(11) DEFAULT 10,
  `currency_reward` int(11) DEFAULT 5,
  PRIMARY KEY (`exercise_id`),
  KEY `idx_exercises_lesson` (`lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `game_sessions` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `mode` varchar(20) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ended_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `idx_game_sessions_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `learning_ai_tasks` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `mode` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `section_label` varchar(100) DEFAULT NULL,
  `subtitle` varchar(100) DEFAULT NULL,
  `accent` varchar(20) DEFAULT NULL,
  `instructions_json` longtext NOT NULL,
  `example_input` text DEFAULT NULL,
  `example_output` text DEFAULT NULL,
  `starter_code` longtext NOT NULL,
  `test_cases_json` longtext NOT NULL,
  `reward_xp` int(11) NOT NULL DEFAULT 100,
  `reward_coins` int(11) NOT NULL DEFAULT 20,
  `rerolls_used` int(11) NOT NULL DEFAULT 0,
  `max_rerolls` int(11) NOT NULL DEFAULT 3,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `ai_payload` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  KEY `idx_learning_ai_tasks_user_mode_status` (`user_id`, `mode`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
