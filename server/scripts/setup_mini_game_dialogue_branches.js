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

async function indexExists(connection, tableName, indexName) {
  const [rows] = await connection.execute(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?`,
    [tableName, indexName]
  );
  return rows.length > 0;
}

async function ensureSchema(connection) {
  if (!(await columnExists(connection, 'mini_game_dialogues', 'branch_key'))) {
    await connection.execute(
      `ALTER TABLE mini_game_dialogues
       ADD COLUMN branch_key varchar(80) NOT NULL DEFAULT 'default' AFTER dialogue_phase`
    );
  }

  if (!(await indexExists(connection, 'mini_game_dialogues', 'idx_mini_game_dialogues_branch'))) {
    await connection.execute(
      `ALTER TABLE mini_game_dialogues
       ADD INDEX idx_mini_game_dialogues_branch (mini_game_module_id, branch_key, dialogue_phase, step_index)`
    );
  }

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
    )
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
}

async function seedLessonOneBranches(connection) {
  await connection.execute(`
    UPDATE mini_game_modules
    SET hint = 'เลือกคำตอบด้วยโค้ด: print("ยินดีที่ได้รู้จัก") หรือ print("ฉันไม่ได้อยากรู้จักเธอ")',
        starter_code = 'print("ยินดีที่ได้รู้จัก")',
        required_syntax_json = '["print"]',
        required_vars_json = '[]',
        test_cases_json = '[]',
        success_message = 'Lumi รับคำตอบของคุณแล้ว บทสนทนาจะเปลี่ยนตามสิ่งที่คุณเลือกค่ะ',
        submit_unlock_step = 3,
        scene_background_image = 'scene_school.jpg'
    WHERE mini_game_module_id = 101
  `);

  await connection.execute(
    `DELETE FROM mini_game_dialogue_branches WHERE mini_game_module_id = ?`,
    [101]
  );
  await connection.execute(
    `DELETE FROM mini_game_dialogues
     WHERE mini_game_module_id = ?
       AND dialogue_phase = 'post_submit'`,
    [101]
  );

  await connection.execute(
    `INSERT INTO mini_game_dialogue_branches (
       mini_game_module_id, trigger_output, branch_key, next_dialogue_phase,
       next_step_index, is_correct, feedback_text, emotion, sort_order
     ) VALUES
       (?, ?, ?, 'post_submit', 10, 1, ?, 'smile', 1),
       (?, ?, ?, 'post_submit', 20, 1, ?, 'anxious', 2)`,
    [
      101,
      'ยินดีที่ได้รู้จัก',
      'friendly',
      'เลือกทางทักทายแบบเป็นมิตร',
      101,
      'ฉันไม่ได้อยากรู้จักเธอ',
      'cold',
      'เลือกทางตอบแบบเย็นชา',
    ]
  );

  await connection.execute(
    `INSERT INTO mini_game_dialogues (
       mini_game_module_id, step_index, speaker, dialogue_text, emotion, dialogue_phase, branch_key
     ) VALUES
       (?, 10, 'lumi', ?, 'smile', 'post_submit', 'friendly'),
       (?, 11, 'user', ?, 'neutral', 'post_submit', 'friendly'),
       (?, 12, 'lumi', ?, 'smile', 'post_submit', 'friendly'),
       (?, 20, 'lumi', ?, 'shock', 'post_submit', 'cold'),
       (?, 21, 'user', ?, 'neutral', 'post_submit', 'cold'),
       (?, 22, 'lumi', ?, 'anxious', 'post_submit', 'cold')`,
    [
      101,
      'ยินดีที่ได้รู้จักเหมือนกันค่ะ! น้ำเสียงแบบนี้ทำให้ Lumi มีกำลังใจขึ้นเยอะเลย',
      101,
      'ผม/ฉัน ก็อยากเรียน Python กับ Lumi เหมือนกัน',
      101,
      'งั้นเราไปต่อกันนะคะ ต่อไป Lumi จะให้ลองใช้ input() เพื่อรับข้อมูลจากผู้เล่นค่ะ',
      101,
      'โอ๊ะ... คำตอบแรงนิดนึงนะคะ แต่ไม่เป็นไร Lumi ยังอยากช่วยคุณเรียนอยู่ดีค่ะ',
      101,
      'ขอโทษนะ แค่ลองเลือกอีกทางดูเฉยๆ',
      101,
      'เข้าใจค่ะ เกมที่ดีต้องมีทางเลือกหลายแบบ งั้นเราไปต่อที่การรับค่าด้วย input() กันนะคะ',
    ]
  );
}

async function main() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    await ensureSchema(connection);
    await seedLessonOneBranches(connection);
    console.log('Mini game dialogue branches are ready.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
