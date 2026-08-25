require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'FullProjectPython',
  multipleStatements: true,
  charset: 'utf8mb4',
};

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function ensureSchema(connection) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS mini_game_dialogue_choices (
      choice_id int(11) NOT NULL AUTO_INCREMENT,
      mini_game_module_id int(11) NOT NULL,
      dialogue_id int(11) DEFAULT NULL,
      from_step_index int(11) DEFAULT NULL,
      choice_text varchar(500) NOT NULL,
      branch_key varchar(80) NOT NULL DEFAULT 'default',
      next_dialogue_phase enum('pre_submit','post_submit') NOT NULL DEFAULT 'pre_submit',
      next_step_index int(11) DEFAULT NULL,
      feedback_text text DEFAULT NULL,
      emotion varchar(50) DEFAULT NULL,
      ending_key varchar(80) DEFAULT NULL,
      effect_json longtext DEFAULT NULL,
      sort_order int(11) NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (choice_id),
      KEY idx_mini_game_dialogue_choices_module (mini_game_module_id, from_step_index, sort_order),
      KEY idx_mini_game_dialogue_choices_dialogue (dialogue_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS mini_game_dialogue_branches (
      branch_id int(11) NOT NULL AUTO_INCREMENT,
      mini_game_module_id int(11) NOT NULL,
      trigger_output varchar(255) NOT NULL,
      branch_key varchar(80) NOT NULL,
      next_dialogue_phase enum('pre_submit','post_submit') NOT NULL DEFAULT 'post_submit',
      next_step_index int(11) DEFAULT NULL,
      is_correct tinyint(1) NOT NULL DEFAULT 1,
      feedback_text text DEFAULT NULL,
      emotion varchar(50) DEFAULT NULL,
      sort_order int(11) NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (branch_id),
      KEY idx_mini_game_dialogue_branches_module (mini_game_module_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  if (!(await columnExists(connection, 'mini_game_module_progress', 'selected_branch_key'))) {
    await connection.execute(
      `ALTER TABLE mini_game_module_progress
       ADD COLUMN selected_branch_key varchar(80) DEFAULT NULL AFTER last_terminal_reply`
    );
  }

  if (!(await columnExists(connection, 'mini_game_module_progress', 'last_output'))) {
    await connection.execute(
      `ALTER TABLE mini_game_module_progress
       ADD COLUMN last_output text DEFAULT NULL AFTER selected_branch_key`
    );
  }

  if (!(await columnExists(connection, 'mini_game_module_progress', 'choice_history_json'))) {
    await connection.execute(
      `ALTER TABLE mini_game_module_progress
       ADD COLUMN choice_history_json longtext DEFAULT NULL AFTER last_output`
    );
  }

  if (!(await columnExists(connection, 'mini_game_module_progress', 'ending_key'))) {
    await connection.execute(
      `ALTER TABLE mini_game_module_progress
       ADD COLUMN ending_key varchar(80) DEFAULT NULL AFTER choice_history_json`
    );
  }
}

async function clearLessonOne(connection) {
  const [moduleRows] = await connection.execute(
    `SELECT mini_game_module_id FROM mini_game_modules WHERE module_id = ?`,
    [1]
  );
  const moduleIds = moduleRows.map((row) => row.mini_game_module_id);
  if (moduleIds.length === 0) return;

  const placeholders = moduleIds.map(() => '?').join(',');
  await connection.execute(
    `DELETE FROM mini_game_module_progress WHERE mini_game_module_id IN (${placeholders})`,
    moduleIds
  );
  await connection.execute(
    `DELETE FROM mini_game_dialogue_choices WHERE mini_game_module_id IN (${placeholders})`,
    moduleIds
  );
  await connection.execute(
    `DELETE FROM mini_game_dialogue_branches WHERE mini_game_module_id IN (${placeholders})`,
    moduleIds
  );
  await connection.execute(
    `DELETE FROM mini_game_terminal_logic WHERE mini_game_module_id IN (${placeholders})`,
    moduleIds
  );
  await connection.execute(
    `DELETE FROM mini_game_dialogues WHERE mini_game_module_id IN (${placeholders})`,
    moduleIds
  );
  await connection.execute(
    `DELETE FROM mini_game_modules WHERE mini_game_module_id IN (${placeholders})`,
    moduleIds
  );
}

async function seedLessonOneConversation(connection) {
  await clearLessonOne(connection);

  await connection.execute(
    `INSERT INTO mini_game_modules (
       mini_game_module_id, module_id, title, order_index, reward_xp, reward_coins,
       hint, starter_code, validation_mode, required_syntax_json, required_vars_json,
       test_cases_json, success_message, submit_unlock_step, scene_background_image, is_active
     ) VALUES
       (?, 1, ?, 1, 20, 5, ?, ?, 'print_only', '["print"]', '[]', '[]', ?, 3, 'scene_school.jpg', 1),
       (?, 1, ?, 2, 20, 5, ?, ?, 'print_only', '["print"]', '[]', '[]', ?, 3, 'scene_school.jpg', 1),
       (?, 1, ?, 3, 30, 10, ?, ?, 'print_only', '["print"]', '[]', '[]', ?, 3, 'scene_school.jpg', 1)`,
    [
      101,
      'ด่าน 1: ทักทาย Lumi ด้วย print()',
      'อ่านบทสนทนา แล้วเขียน print() เพื่อตอบ Lumi เช่น print("ฉันสบายดี")',
      'print("ฉันสบายดี")',
      'Lumi ได้ยินคำตอบแรกของคุณแล้ว',
      102,
      'ด่าน 2: เลือกวิธีเรียนกับ Lumi',
      'เขียน print() เพื่อบอก Lumi ว่าอยากเรียนแบบไหน',
      'print("ขอตัวอย่าง")',
      'Lumi ปรับวิธีสอนตามคำตอบของคุณแล้ว',
      103,
      'ด่าน 3: สรุปความเข้าใจเรื่อง print()',
      'เขียน print() เพื่อสรุปสิ่งที่เข้าใจ แล้วปลดล็อกฉากจบ',
      'print("print ใช้แสดงข้อความ")',
      'สรุปบทเรียนสำเร็จแล้ว',
    ]
  );

  await connection.execute(
    `INSERT INTO mini_game_dialogues (
       mini_game_module_id, step_index, speaker, dialogue_text, emotion, dialogue_phase, branch_key
     ) VALUES
       (101, 0, 'lumi', 'สวัสดีค่ะ ฉันชื่อ Lumi วันนี้เราจะเริ่มเรียน Python ด้วยการคุยกันผ่านโค้ดนะคะ', 'smile', 'pre_submit', 'default'),
       (101, 1, 'lumi', 'เป็นยังไงบ้างคะ พร้อมลองใช้คำสั่ง print() หรือยัง?', 'curious', 'pre_submit', 'default'),
       (101, 2, 'user', 'ฉันจะตอบ Lumi ด้วยการเขียนโค้ดใน editor ด้านบน', 'neutral', 'pre_submit', 'default'),
       (101, 3, 'lumi', 'เขียน print("ฉันสบายดี") หรือ print("ยังงงอยู่") แล้วกด DONE ได้เลยค่ะ', 'smile', 'pre_submit', 'default'),
       (101, 10, 'lumi', 'ดีใจที่ได้ยินแบบนั้นค่ะ! ข้อความที่คุณใส่ใน print() ถูกแสดงออกมาเป็นคำตอบของคุณแล้ว', 'smile', 'post_submit', 'mood_good'),
       (101, 11, 'system', 'เส้นทาง mood_good ถูกบันทึก: ผู้เล่นพร้อมเรียนต่อ', 'smile', 'post_submit', 'mood_good'),
       (101, 20, 'lumi', 'ไม่เป็นไรค่ะ ถ้ายังงงอยู่ Lumi จะค่อย ๆ พาไปทีละขั้นนะคะ', 'thinking', 'post_submit', 'mood_confused'),
       (101, 21, 'system', 'เส้นทาง mood_confused ถูกบันทึก: ผู้เล่นต้องการคำอธิบายเพิ่ม', 'smile', 'post_submit', 'mood_confused'),

       (102, 0, 'lumi', 'จากคำตอบเมื่อกี้ เรามาเลือกวิธีเรียนกันต่อนะคะ', 'smile', 'pre_submit', 'default'),
       (102, 1, 'lumi', 'ถ้าอยากเห็นตัวอย่าง ให้เขียน print("ขอตัวอย่าง")', 'smile', 'pre_submit', 'default'),
       (102, 2, 'lumi', 'ถ้าอยากลองทำเอง ให้เขียน print("ขอลองเอง")', 'curious', 'pre_submit', 'default'),
       (102, 3, 'user', 'ฉันจะเลือกวิธีเรียนด้วย output จากโค้ด', 'neutral', 'pre_submit', 'default'),
       (102, 10, 'lumi', 'ได้เลยค่ะ ตัวอย่างคือ print("Hello") จะแสดงคำว่า Hello บนหน้าจอ', 'smile', 'post_submit', 'learn_example'),
       (102, 11, 'system', 'เส้นทาง learn_example ถูกบันทึก: ผู้เล่นเลือกเรียนจากตัวอย่าง', 'smile', 'post_submit', 'learn_example'),
       (102, 20, 'lumi', 'เยี่ยมค่ะ งั้นลองทำเองได้เลย การลองผิดลองถูกเป็นวิธีเรียนที่ดีมาก', 'smile', 'post_submit', 'learn_try'),
       (102, 21, 'system', 'เส้นทาง learn_try ถูกบันทึก: ผู้เล่นเลือกฝึกเอง', 'smile', 'post_submit', 'learn_try'),

       (103, 0, 'lumi', 'ด่านสุดท้ายแล้วค่ะ ลองสรุปให้ Lumi ฟังว่า print() ใช้ทำอะไร', 'smile', 'pre_submit', 'default'),
       (103, 1, 'lumi', 'เขียน print("print ใช้แสดงข้อความ") ถ้าเข้าใจแล้ว', 'smile', 'pre_submit', 'default'),
       (103, 2, 'lumi', 'หรือเขียน print("ขอทบทวนอีกครั้ง") ถ้ายังอยากให้ Lumi อธิบายซ้ำ', 'thinking', 'pre_submit', 'default'),
       (103, 3, 'user', 'ฉันจะส่งคำตอบสุดท้ายด้วยโค้ด', 'neutral', 'pre_submit', 'default'),
       (103, 10, 'lumi', 'ถูกต้องค่ะ! คุณเข้าใจแล้วว่า print() ใช้แสดงข้อความออกมาบนหน้าจอ', 'smile', 'post_submit', 'ending_understood'),
       (103, 11, 'system', 'ฉากจบ: Understanding Ending - ผู้เล่นเข้าใจพื้นฐาน print()', 'smile', 'post_submit', 'ending_understood'),
       (103, 20, 'lumi', 'ไม่เป็นไรค่ะ Lumi จะทบทวนให้: print("ข้อความ") คือการสั่งให้โปรแกรมแสดงข้อความนั้นบนหน้าจอ', 'smile', 'post_submit', 'ending_review'),
       (103, 21, 'system', 'ฉากจบ: Review Ending - ผู้เล่นเลือกทบทวนเพื่อความมั่นใจ', 'smile', 'post_submit', 'ending_review')`
  );

  await connection.execute(
    `INSERT INTO mini_game_dialogue_branches (
       mini_game_module_id, trigger_output, branch_key, next_dialogue_phase,
       next_step_index, is_correct, feedback_text, emotion, sort_order
     ) VALUES
       (101, 'ฉันสบายดี', 'mood_good', 'post_submit', 10, 1, 'ผู้เล่นตอบว่าอารมณ์พร้อมเรียน', 'smile', 1),
       (101, 'ยังงงอยู่', 'mood_confused', 'post_submit', 20, 1, 'ผู้เล่นตอบว่ายังต้องการความช่วยเหลือ', 'thinking', 2),
       (102, 'ขอตัวอย่าง', 'learn_example', 'post_submit', 10, 1, 'ผู้เล่นเลือกเรียนจากตัวอย่าง', 'smile', 1),
       (102, 'ขอลองเอง', 'learn_try', 'post_submit', 20, 1, 'ผู้เล่นเลือกฝึกเอง', 'smile', 2),
       (103, 'print ใช้แสดงข้อความ', 'ending_understood', 'post_submit', 10, 1, 'ผู้เล่นสรุปหน้าที่ของ print() ได้ถูกต้อง', 'smile', 1),
       (103, 'ขอทบทวนอีกครั้ง', 'ending_review', 'post_submit', 20, 1, 'ผู้เล่นเลือกทบทวนก่อนจบ', 'thinking', 2)`
  );

  await connection.execute(
    `INSERT INTO mini_game_terminal_logic (
       mini_game_module_id, trigger_input, reply_text, emotion, sort_order
     ) VALUES
       (101, 'ฉันสบายดี', 'Lumi: ดีใจที่คุณพร้อมเรียนค่ะ', 'smile', 1),
       (101, 'ยังงงอยู่', 'Lumi: ไม่เป็นไรค่ะ เราจะค่อย ๆ เรียนด้วยกัน', 'thinking', 2),
       (102, 'ขอตัวอย่าง', 'Lumi: ได้ค่ะ เดี๋ยว Lumi ยกตัวอย่างให้', 'smile', 1),
       (102, 'ขอลองเอง', 'Lumi: ลุยเลยค่ะ การลองเองช่วยให้จำได้ดี', 'smile', 2),
       (103, 'print ใช้แสดงข้อความ', 'Lumi: ถูกต้องค่ะ', 'smile', 1),
       (103, 'ขอทบทวนอีกครั้ง', 'Lumi: ได้ค่ะ ทบทวนอีกครั้งก็เป็นการเรียนรู้ที่ดี', 'thinking', 2)`
  );
}

async function main() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    await ensureSchema(connection);
    await seedLessonOneConversation(connection);
    console.log('Mini game conversation branches are rebuilt.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
