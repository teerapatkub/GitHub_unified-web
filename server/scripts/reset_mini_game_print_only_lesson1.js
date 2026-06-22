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

async function main() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.beginTransaction();

    await connection.execute(`
      UPDATE mini_game_modules
      SET title = 'INTRO: เลือกคำทักทาย',
          hint = 'เลือกคำตอบด้วย print(): print("ยินดีที่ได้รู้จัก") หรือ print("ฉันไม่ได้อยากรู้จักเธอ")',
          starter_code = 'print("ยินดีที่ได้รู้จัก")',
          validation_mode = 'print_only',
          required_syntax_json = '["print"]',
          required_vars_json = '[]',
          test_cases_json = '[]',
          success_message = 'Lumi รับคำตอบของคุณแล้ว บทสนทนาจะเปลี่ยนตามสิ่งที่คุณเลือกค่ะ',
          submit_unlock_step = 3,
          scene_background_image = 'scene_school.jpg',
          is_active = 1
      WHERE mini_game_module_id = 101
    `);

    await connection.execute(`
      UPDATE mini_game_modules
      SET title = 'PRINT_NAME: แนะนำตัวด้วย print()',
          hint = 'พิมพ์ข้อความแนะนำตัว เช่น print("ฉันชื่อ Lumi")',
          starter_code = 'print("ฉันชื่อ Lumi")',
          validation_mode = 'print_only',
          required_syntax_json = '["print"]',
          required_vars_json = '[]',
          test_cases_json = '[{"input":"","expected":"ฉันชื่อ"}]',
          success_message = 'แนะนำตัวได้ดีมากค่ะ ต่อไปลองพิมพ์สิ่งที่ชอบด้วย print() กัน',
          submit_unlock_step = 3,
          scene_background_image = 'scene_school.jpg',
          is_active = 1
      WHERE mini_game_module_id = 102
    `);

    await connection.execute(`
      UPDATE mini_game_modules
      SET title = 'PRINT_FAVORITE: บอกสิ่งที่ชอบ',
          hint = 'พิมพ์สิ่งที่ชอบด้วย print() เช่น print("ฉันชอบ Python")',
          starter_code = 'print("ฉันชอบ Python")',
          validation_mode = 'print_only',
          required_syntax_json = '["print"]',
          required_vars_json = '[]',
          test_cases_json = '[{"input":"","expected":"ฉันชอบ"}]',
          success_message = 'เย้! คุณใช้ print() สื่อสารกับ Lumi ได้ครบแล้วค่ะ',
          submit_unlock_step = 3,
          scene_background_image = 'scene_school.jpg',
          is_active = 1
      WHERE mini_game_module_id = 103
    `);

    await connection.execute(
      `DELETE FROM mini_game_dialogue_branches WHERE mini_game_module_id IN (101, 102, 103)`
    );
    await connection.execute(
      `DELETE FROM mini_game_dialogues WHERE mini_game_module_id IN (101, 102, 103)`
    );
    await connection.execute(
      `DELETE FROM mini_game_terminal_logic WHERE mini_game_module_id IN (101, 102, 103)`
    );

    await connection.execute(`
      INSERT INTO mini_game_dialogue_branches (
        mini_game_module_id, trigger_output, branch_key, next_dialogue_phase,
        next_step_index, is_correct, feedback_text, emotion, sort_order
      ) VALUES
        (101, 'ยินดีที่ได้รู้จัก', 'friendly', 'post_submit', 10, 1, 'เลือกคำทักทายแบบเป็นมิตร', 'smile', 1),
        (101, 'ฉันไม่ได้อยากรู้จักเธอ', 'cold', 'post_submit', 20, 1, 'เลือกคำตอบแบบเย็นชา', 'anxious', 2)
    `);

    await connection.execute(`
      INSERT INTO mini_game_dialogues (
        mini_game_module_id, step_index, speaker, dialogue_text, emotion, dialogue_phase, branch_key
      ) VALUES
        (101, 0, 'lumi', 'ฮัลโหล! ยินดีที่ได้พบกันนะคะ ฉันชื่อ Lumi เป็นไกด์สอน Python ของคุณค่ะ', 'smile', 'pre_submit', 'default'),
        (101, 1, 'user', 'สวัสดีครับ/ค่ะ Lumi พร้อมลุยแล้ว!', 'neutral', 'pre_submit', 'default'),
        (101, 2, 'lumi', 'วันนี้เราจะเริ่มจากคำสั่งที่ง่ายที่สุดก่อน นั่นคือ print() ค่ะ', 'smile', 'pre_submit', 'default'),
        (101, 3, 'lumi', 'ลองเลือกคำตอบด้วยโค้ดนะคะ: print("ยินดีที่ได้รู้จัก") หรือ print("ฉันไม่ได้อยากรู้จักเธอ")', 'smile', 'pre_submit', 'default'),
        (101, 10, 'lumi', 'ยินดีที่ได้รู้จักเหมือนกันค่ะ! คำทักทายแบบนี้ทำให้ Lumi มีกำลังใจขึ้นเยอะเลย', 'smile', 'post_submit', 'friendly'),
        (101, 11, 'user', 'ผม/ฉัน ก็อยากเรียน Python กับ Lumi เหมือนกัน', 'neutral', 'post_submit', 'friendly'),
        (101, 12, 'lumi', 'ดีมากค่ะ ต่อไปเราจะใช้ print() แนะนำตัวแบบง่าย ๆ กันนะคะ', 'smile', 'post_submit', 'friendly'),
        (101, 20, 'lumi', 'โอ๊ะ... คำตอบแรงนิดนึงนะคะ แต่ไม่เป็นไร Lumi ยังอยากช่วยคุณเรียนอยู่ดีค่ะ', 'shock', 'post_submit', 'cold'),
        (101, 21, 'user', 'ขอโทษนะ แค่ลองเลือกอีกทางดูเฉย ๆ', 'neutral', 'post_submit', 'cold'),
        (101, 22, 'lumi', 'เข้าใจค่ะ เกมที่ดีต้องมีทางเลือกหลายแบบ ต่อไปเราจะใช้ print() แนะนำตัวกันนะคะ', 'anxious', 'post_submit', 'cold'),

        (102, 0, 'lumi', 'ตอนนี้คุณส่งข้อความออกจอได้แล้วค่ะ', 'smile', 'pre_submit', 'default'),
        (102, 1, 'lumi', 'ต่อไปลองใช้ print() แนะนำตัวเองให้ Lumi รู้จักหน่อยนะคะ', 'smile', 'pre_submit', 'default'),
        (102, 2, 'user', 'ต้องพิมพ์ประมาณไหนเหรอ?', 'neutral', 'pre_submit', 'default'),
        (102, 3, 'lumi', 'พิมพ์แบบนี้ได้เลยค่ะ print("ฉันชื่อ Lumi") หรือเปลี่ยนชื่อเป็นชื่อของคุณก็ได้', 'smile', 'pre_submit', 'default'),
        (102, 10, 'lumi', 'เยี่ยมมากค่ะ! ตอนนี้ Lumi รู้จักคุณผ่านข้อความที่พิมพ์ออกมาแล้ว', 'smile', 'post_submit', 'default'),
        (102, 11, 'lumi', 'ต่อไปเราจะลองบอกสิ่งที่ชอบด้วย print() กันนะคะ', 'smile', 'post_submit', 'default'),

        (103, 0, 'lumi', 'คำสั่ง print() ใช้บอกข้อความอะไรก็ได้ที่เราอยากแสดงค่ะ', 'smile', 'pre_submit', 'default'),
        (103, 1, 'lumi', 'ลองบอกสิ่งที่คุณชอบให้ Lumi ฟังหน่อยนะคะ', 'smile', 'pre_submit', 'default'),
        (103, 2, 'user', 'เช่นบอกว่าชอบ Python ใช่ไหม?', 'neutral', 'pre_submit', 'default'),
        (103, 3, 'lumi', 'ใช่เลยค่ะ ลองพิมพ์ print("ฉันชอบ Python") หรือเปลี่ยนเป็นสิ่งที่คุณชอบก็ได้ค่ะ', 'smile', 'pre_submit', 'default'),
        (103, 10, 'lumi', 'ดีมากค่ะ! คุณใช้ print() เพื่อสื่อสารกับโปรแกรมได้แล้ว', 'smile', 'post_submit', 'default'),
        (103, 11, 'user', 'เริ่มเข้าใจแล้วว่า print() เอาไว้แสดงข้อความ', 'neutral', 'post_submit', 'default'),
        (103, 12, 'lumi', 'วันนี้เก่งมากค่ะ บทต่อไปค่อยเพิ่มเรื่องใหม่ ๆ ทีละขั้นนะคะ', 'smile', 'post_submit', 'default')
    `);

    await connection.execute(`
      INSERT INTO mini_game_terminal_logic (
        mini_game_module_id, trigger_input, reply_text, emotion, sort_order
      ) VALUES
        (101, 'ยินดีที่ได้รู้จัก', 'เลือกคำทักทายแบบเป็นมิตร', 'smile', 1),
        (101, 'ฉันไม่ได้อยากรู้จักเธอ', 'เลือกคำตอบแบบเย็นชา', 'anxious', 2),
        (102, 'ฉันชื่อ', 'Lumi รับข้อความแนะนำตัวแล้วค่ะ', 'smile', 1),
        (103, 'ฉันชอบ', 'Lumi รับข้อความสิ่งที่ชอบแล้วค่ะ', 'smile', 1)
    `);

    await connection.commit();
    console.log('Lesson 1 mini game is now print-only.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
