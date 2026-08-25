require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'FullProjectPython',
  charset: 'utf8mb4',
};

async function main() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();

    await connection.execute(
      `DELETE FROM mini_game_dialogues
       WHERE mini_game_module_id = 102
         AND dialogue_phase = 'pre_submit'
         AND branch_key IN ('friendly', 'cold')`
    );

    await connection.execute(`
      INSERT INTO mini_game_dialogues (
        mini_game_module_id, step_index, speaker, dialogue_text, emotion, dialogue_phase, branch_key
      ) VALUES
        (102, 0, 'lumi', 'เมื่อกี้คุณทักทายได้น่ารักมากค่ะ งั้น Lumi อยากรู้จักคุณมากขึ้นอีกนิดนะคะ', 'smile', 'pre_submit', 'friendly'),
        (102, 1, 'lumi', 'ใช้ print() แนะนำตัวเองแบบเป็นมิตรให้ Lumi ฟังหน่อยค่ะ', 'smile', 'pre_submit', 'friendly'),
        (102, 2, 'user', 'ได้เลย งั้นลองแนะนำตัวผ่านข้อความบนจอดูนะ', 'neutral', 'pre_submit', 'friendly'),
        (102, 3, 'lumi', 'พิมพ์ประมาณนี้ได้เลยค่ะ print("ฉันชื่อ Lumi") หรือเปลี่ยนเป็นชื่อของคุณก็ได้', 'smile', 'pre_submit', 'friendly'),

        (102, 0, 'lumi', 'เมื่อกี้คำตอบคุณเย็นชานิดนึงนะคะ แต่ Lumi ยังอยากเข้าใจคุณให้มากขึ้นค่ะ', 'anxious', 'pre_submit', 'cold'),
        (102, 1, 'lumi', 'ถ้าไม่อยากคุยเยอะก็ไม่เป็นไร ลองใช้ print() บอกชื่อตัวเองสั้น ๆ ให้ระบบรู้จักก่อนนะคะ', 'anxious', 'pre_submit', 'cold'),
        (102, 2, 'user', 'โอเค งั้นบอกชื่อแบบสั้น ๆ ก็ได้', 'neutral', 'pre_submit', 'cold'),
        (102, 3, 'lumi', 'พิมพ์แบบนี้ได้ค่ะ print("ฉันชื่อ Lumi") หรือเปลี่ยนเป็นชื่อของคุณก็ได้', 'smile', 'pre_submit', 'cold')
    `);

    await connection.commit();
    console.log('Branch-specific questions were added to subtopic 102.');
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
