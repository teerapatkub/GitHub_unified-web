ALTER TABLE mini_game_modules
  ADD COLUMN IF NOT EXISTS submit_unlock_step int(11) NOT NULL DEFAULT 0 AFTER success_message;

ALTER TABLE mini_game_dialogues
  ADD COLUMN IF NOT EXISTS dialogue_phase enum('pre_submit','post_submit') NOT NULL DEFAULT 'pre_submit' AFTER emotion;

DROP PROCEDURE IF EXISTS drop_mini_game_module_unique_index;
DELIMITER //
CREATE PROCEDURE drop_mini_game_module_unique_index()
BEGIN
  IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'mini_game_modules'
      AND COLUMN_NAME = 'module_id'
      AND REFERENCED_TABLE_NAME = 'modules'
      AND CONSTRAINT_NAME = 'fk_mini_game_modules_module'
  ) THEN
    ALTER TABLE mini_game_modules DROP FOREIGN KEY fk_mini_game_modules_module;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'mini_game_modules'
      AND INDEX_NAME = 'uq_mini_game_modules_module_id'
  ) THEN
    ALTER TABLE mini_game_modules DROP INDEX uq_mini_game_modules_module_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'mini_game_modules'
      AND COLUMN_NAME = 'module_id'
      AND REFERENCED_TABLE_NAME = 'modules'
      AND CONSTRAINT_NAME = 'fk_mini_game_modules_module'
  ) THEN
    ALTER TABLE mini_game_modules
      ADD CONSTRAINT fk_mini_game_modules_module
      FOREIGN KEY (module_id) REFERENCES modules (module_id)
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END//
DELIMITER ;
CALL drop_mini_game_module_unique_index();
DROP PROCEDURE IF EXISTS drop_mini_game_module_unique_index;

ALTER TABLE mini_game_modules
  ADD INDEX IF NOT EXISTS idx_mini_game_modules_module_order (module_id, order_index);

DELETE FROM mini_game_module_progress;
DELETE FROM mini_game_terminal_logic;
DELETE FROM mini_game_dialogues;
DELETE FROM mini_game_modules;

INSERT INTO mini_game_modules (
  mini_game_module_id,
  module_id,
  title,
  order_index,
  reward_xp,
  reward_coins,
  hint,
  starter_code,
  validation_mode,
  required_syntax_json,
  required_vars_json,
  test_cases_json,
  success_message,
  submit_unlock_step,
  is_active
) VALUES
  (101, 1, 'INTRO: เช็คระบบสื่อสาร', 1, 15, 5,
   'ลองพิมพ์คำว่า: print("Hello")',
   'print("Hello, Lumi")',
   'syntax',
   '["print","Hello"]',
   '[]',
   '[{"expected":"Hello"}]',
   'ข้อความขึ้นแล้ว! ระบบของเราทำงานได้สมบูรณ์แบบค่ะ',
   3,
   1),
  (102, 1, 'ASK_NAME: แนะนำชื่อให้ Lumi', 2, 15, 5,
   'ลองพิมพ์: name = input("ชื่อของคุณ: ")',
   'name = input("ชื่อของคุณ: ")',
   'syntax',
   '["input"]',
   '["name"]',
   '[{"expected":"ชื่อของคุณ"}]',
   'เป็นชื่อที่เพราะมากเลยค่ะ! Lumi จะบันทึกไว้ใน Database หัวใจเลย',
   3,
   1),
  (103, 1, 'ASK_JOB: อาชีพและของกินที่ชอบ', 3, 30, 10,
   'สร้างตัวแปร work แล้วพิมพ์ print("ชอบมาก") เช่น work = "นักเรียน"',
   'work = "นักเรียน"\nprint("ชอบมาก")',
   'syntax',
   '["=","print","ชอบมาก"]',
   '["work"]',
   '[{"expected":"ชอบมาก"}]',
   'เย้! ในที่สุดเราก็ทำภารกิจวันนี้สำเร็จแล้วนะคะ',
   7,
   1),
  (201, 2, 'บทที่ 2.1: ทบทวนการแสดงผล', 1, 25, 10,
   'ใช้ print() แสดงข้อความที่อยากบอก Lumi',
   'print("พร้อมเรียนต่อ")',
   'syntax',
   '["print"]',
   '[]',
   '[{"expected":"พร้อมเรียนต่อ"}]',
   'พร้อมแล้ว ไปต่อบทถัดไปกันค่ะ',
   1,
   1);

INSERT INTO mini_game_dialogues (
  mini_game_module_id,
  step_index,
  speaker,
  dialogue_text,
  emotion,
  dialogue_phase
) VALUES
  (101, 0, 'lumi', 'ฮัลโหล! ยินดีที่ได้พบกันนะคะ ฉันชื่อ Lumi เป็นไกด์สอน Python ของคุณค่ะ', 'smile', 'pre_submit'),
  (101, 1, 'user', 'สวัสดีครับ/ค่ะ Lumi พร้อมลุยแล้ว!', 'neutral', 'pre_submit'),
  (101, 2, 'lumi', 'ว้าว พลังล้นเหลือมากค่ะ! งั้นก่อนอื่นลองเช็คระบบสื่อสารกันหน่อยนะ', 'smile', 'pre_submit'),
  (101, 3, 'lumi', 'ช่วยลองพิมพ์คำสั่ง print("Hello") ให้ Lumi ดูหน่อยนะคะ', 'smile', 'pre_submit'),
  (102, 0, 'lumi', 'ข้อความขึ้นแล้ว! ระบบของเราทำงานได้สมบูรณ์แบบค่ะ', 'smile', 'pre_submit'),
  (102, 1, 'lumi', 'จริงด้วย เราคุยกันมาตั้งนาน Lumi ยังไม่รู้ชื่อคุณเลยนะคะ', 'shock', 'pre_submit'),
  (102, 2, 'user', 'นั่นสินะ ผม/ฉัน ยังไม่ได้แนะนำตัวเลย', 'neutral', 'pre_submit'),
  (102, 3, 'lumi', 'ช่วยบอกชื่อผ่านโค้ดหน่อยได้ไหมคะ? ใช้ name = input("ชื่อของคุณ: ") นะ', 'anxious', 'pre_submit'),
  (103, 0, 'lumi', 'เป็นชื่อที่เพราะมากเลยค่ะ! Lumi จะบันทึกไว้ใน Database หัวใจเลย', 'smile', 'pre_submit'),
  (103, 1, 'user', 'ฮั่นแน่... มี Database หัวใจด้วยเหรอเนี่ย? (หัวเราะ)', 'neutral', 'pre_submit'),
  (103, 2, 'lumi', 'แน่นอนค่ะ! แล้วตอนนี้คุณทำอะไรอยู่เหรอคะ? เรียนอยู่หรือทำงานอะไรเอ่ย?', 'neutral', 'pre_submit'),
  (103, 3, 'lumi', 'ลองสร้างตัวแปรเก็บอาชีพดูนะคะ เช่น work = "Programmer"', 'smile', 'pre_submit'),
  (103, 4, 'lumi', 'โห... พิมพ์โค้ดคล่องแบบนี้ Lumi เริ่มกดดันแล้วนะเนี่ย!', 'angry', 'pre_submit'),
  (103, 5, 'user', 'โกรธจริงหรือเปล่าเนี่ย Lumi? ผม/ฉัน ขอโทษนะ', 'neutral', 'pre_submit'),
  (103, 6, 'lumi', 'อิอิ ล้อเล่นค่ะ! Lumi แค่ดีใจที่เจอคนเก่งๆ แบบคุณต่างหาก', 'smile', 'pre_submit'),
  (103, 7, 'lumi', 'เรียนมาพักใหญ่แล้ว เริ่มหิวหรือยังคะ? ถ้าชอบกินเหมือนกัน พิมพ์ print("ชอบมาก") มานะ!', 'smile', 'pre_submit'),
  (103, 8, 'lumi', 'เย้! ในที่สุดเราก็ทำภารกิจวันนี้สำเร็จแล้วนะคะ', 'smile', 'post_submit'),
  (103, 9, 'user', 'ขอบคุณ Lumi มากนะ สอนสนุกมากเลย!', 'neutral', 'post_submit'),
  (103, 10, 'lumi', 'Lumi ก็สนุกเหมือนกันค่ะ คุณเรียนรู้ไวมากจน Lumi แอบตกใจเลย', 'smile', 'post_submit'),
  (103, 11, 'lumi', 'วันนี้เราได้เรียนพื้นฐานไปเยอะเลย เก่งมากค่ะ!', 'smile', 'post_submit'),
  (103, 12, 'user', 'ผม/ฉัน จะกลับมาทบทวนบ่อยๆ นะ แล้วเจอกันใหม่นะ Lumi', 'neutral', 'post_submit'),
  (103, 13, 'lumi', 'สัญญาแล้วนะ! ไว้เจอกันใหม่นะคะ บ๊ายบายค่ะ! ✨', 'smile', 'post_submit'),
  (201, 0, 'lumi', 'บทที่ 2 เราจะทบทวนคำสั่ง print() กันอีกครั้งนะคะ', 'smile', 'pre_submit'),
  (201, 1, 'lumi', 'พิมพ์ข้อความว่า print("พร้อมเรียนต่อ") แล้วส่งให้ Lumi ดูได้เลยค่ะ', 'smile', 'pre_submit'),
  (201, 2, 'lumi', 'เยี่ยมมากค่ะ บทที่ 2 พร้อมสำหรับการต่อยอดแล้ว', 'smile', 'post_submit');

INSERT INTO mini_game_terminal_logic (
  mini_game_module_id,
  trigger_input,
  reply_text,
  emotion,
  sort_order
) VALUES
  (101, 'Hello', 'Lumi: ข้อความขึ้นแล้ว! ระบบของเราทำงานได้สมบูรณ์แบบค่ะ', 'smile', 1),
  (102, 'ชื่อของคุณ', 'Lumi: รับสัญญาณชื่อเรียบร้อยค่ะ', 'smile', 1),
  (103, 'นักเรียน', 'Lumi: บันทึกอาชีพไว้ใน Database หัวใจแล้วค่ะ', 'smile', 1),
  (103, 'Programmer', 'Lumi: Programmer เท่มากค่ะ', 'smile', 2),
  (103, 'ชอบมาก', 'Lumi: งั้นเราเป็นทีมของกินเดียวกันแล้วค่ะ', 'smile', 3),
  (201, 'พร้อมเรียนต่อ', 'Lumi: พร้อมเรียนต่อแล้ว ไปกันเลยค่ะ', 'smile', 1);
