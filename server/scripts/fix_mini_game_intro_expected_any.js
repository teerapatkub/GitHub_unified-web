require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'FullProjectPython',
    charset: 'utf8mb4',
  });

  try {
    await connection.execute(
      `UPDATE mini_game_modules
       SET test_cases_json = ?
       WHERE mini_game_module_id = 101`,
      [
        JSON.stringify([
          {
            input: '',
            expected_any: ['ยินดีที่ได้รู้จัก', 'ฉันไม่ได้อยากรู้จักเธอ'],
          },
        ]),
      ]
    );
    console.log('Intro mini game accepts either dialogue choice now.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
