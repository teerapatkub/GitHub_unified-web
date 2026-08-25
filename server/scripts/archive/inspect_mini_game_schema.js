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
    const [tables] = await connection.execute("SHOW TABLES LIKE '%mini_game%'");
    const tableNames = tables.map((row) => Object.values(row)[0]);

    for (const tableName of tableNames) {
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [tableName]
      );
      const [indexes] = await connection.execute(
        `SELECT INDEX_NAME, NON_UNIQUE, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
         GROUP BY INDEX_NAME, NON_UNIQUE
         ORDER BY INDEX_NAME`,
        [tableName]
      );
      const [countRows] = await connection.query(`SELECT COUNT(*) AS row_count FROM \`${tableName}\``);
      const [sampleRows] = await connection.query(`SELECT * FROM \`${tableName}\` LIMIT 5`);

      console.log(`\n=== ${tableName} (${countRows[0].row_count} rows) ===`);
      console.table(columns);
      console.log('Indexes:');
      console.table(indexes);
      console.log('Sample:');
      console.log(JSON.stringify(sampleRows, null, 2));
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
