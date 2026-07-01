-- Run this AFTER importing the friend's fullprojectpython 27_6_69.sql dump.
-- Purpose: keep the shop/theme/admin additions used by the current app code.
-- This file is safe to re-run on MariaDB/MySQL versions that support IF NOT EXISTS.

SET FOREIGN_KEY_CHECKS = 0;

-- Admin/user management additions.
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `is_banned` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `ban_until` timestamp NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `deleted_at` timestamp NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `equipped_theme_id` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `equipped_mouse_effect_id` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `equipped_profile_frame_id` int(11) DEFAULT NULL;

-- Shop/theme/cosmetic additions.
ALTER TABLE `shop_items`
  ADD COLUMN IF NOT EXISTS `item_type` varchar(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `asset_url` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `preview_image` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `effects` longtext DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_active` tinyint(1) NOT NULL DEFAULT 1;

-- Normalize old shop rows so the current frontend/backend can read them.
UPDATE `shop_items`
SET `item_type` = `type`
WHERE `item_type` IS NULL
  AND `type` IS NOT NULL;

UPDATE `shop_items`
SET `effects` = `preview_data`
WHERE (`effects` IS NULL OR `effects` = '')
  AND `preview_data` IS NOT NULL;

UPDATE `shop_items`
SET `is_active` = `is_available`
WHERE `is_active` IS NULL;

-- Keep compatibility for admin-created profile backgrounds.
-- The legacy `type` enum does not include PROFILE_BACKGROUND, so the app stores
-- PROFILE_BACKGROUND rows as type=PROFILE_FRAME and item_type=PROFILE_BACKGROUND.
UPDATE `shop_items`
SET `type` = 'PROFILE_FRAME'
WHERE `item_type` = 'PROFILE_BACKGROUND';

CREATE TABLE IF NOT EXISTS `user_inventory` (
  `inventory_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `purchased_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `uk_user_item` (`user_id`, `item_id`),
  KEY `idx_inventory_user` (`user_id`),
  KEY `idx_inventory_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Restore/create the admin account from the old database setup.
INSERT INTO `users` (
  `username`,
  `password_hash`,
  `email`,
  `role`,
  `level`,
  `xp`,
  `virtual_currency`,
  `is_deleted`,
  `is_banned`
)
SELECT
  'Teerapat boonmeeprasert',
  '$2b$10$Mn0nq74Hp4E5QQXgFICpteN9G5dbtJ4UoEIrQ9k28KuLmghLSBtn6',
  NULL,
  'admin',
  1,
  0,
  0,
  0,
  0
WHERE NOT EXISTS (
  SELECT 1
  FROM `users`
  WHERE `username` = 'Teerapat boonmeeprasert'
);

UPDATE `users`
SET
  `role` = 'admin',
  `password_hash` = '$2b$10$Mn0nq74Hp4E5QQXgFICpteN9G5dbtJ4UoEIrQ9k28KuLmghLSBtn6',
  `is_deleted` = 0,
  `is_banned` = 0,
  `ban_until` = NULL,
  `deleted_at` = NULL
WHERE `username` = 'Teerapat boonmeeprasert';

SET FOREIGN_KEY_CHECKS = 1;
