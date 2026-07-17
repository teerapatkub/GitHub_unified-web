const mysql = require('mysql2/promise');
const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'python_coder_game';
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: DB_NAME,
  multipleStatements: true
};

async function doBackup(fileSuffix) {
  const filename = path.join(__dirname, `backup_${DB_NAME}_${fileSuffix}.sql`);
  console.log(`🔄 เริ่มสำรองฐานข้อมูล: ${filename}`);

  try {
    execSync(`mysqldump -u ${DB_CONFIG.user} ${DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ''} ${DB_NAME} > "${filename}"`, {stdio: 'ignore'});
    console.log(`✅ สำรองสำเร็จ: ${filename}`);
  } catch (err) {
    console.warn('⚠️ ไม่สามารถเรียก mysqldump ได้, ใช้วิธีสำรองสำรองแบบต่อฐานข้อมูล: ', err.message);
    const conn = await mysql.createConnection(DB_CONFIG);
    const [tables] = await conn.query('SHOW TABLES');
    let dump = `-- Manual backup of ${DB_NAME}\n`;

    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [[createRow]] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
      dump += createRow['Create Table'] + ';\n\n';
      const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length === 0) continue;
      const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
      for (const r of rows) {
        const values = Object.values(r).map(v => (v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)).join(', ');
        dump += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
      }
      dump += '\n';
    }

    fs.writeFileSync(filename, dump);
    await conn.end();
    console.log(`✅ สำรองแบบ manual สำเร็จ: ${filename}`);
  }
}

async function ensureTableOrColumn(conn, checkSql, createSql, message) {
  const [rows] = await conn.query(checkSql);
  if (!rows || rows.length === 0) {
    console.log(`🛠️  ${message}`);
    await conn.query(createSql);
    console.log(`✅ เสร็จ: ${message}`);
  } else {
    console.log(`✅ มีอยู่แล้ว: ${message}`);
  }
}

async function main() {
  console.log('🔧 ตรวจสอบและปรับ schema ของฐานข้อมูล');
  await doBackup('before');

  const conn = await mysql.createConnection(DB_CONFIG);

  const tableChecks = [
    {
      table: 'shop_items',
      create: `CREATE TABLE IF NOT EXISTS \`shop_items\` (
        \`item_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`type\` enum('THEME','MOUSE_EFFECT','PROFILE_FRAME') NOT NULL,
        \`rarity\` enum('COMMON','RARE','EPIC','LEGENDARY') NOT NULL DEFAULT 'COMMON',
        \`price\` decimal(10,2) NOT NULL DEFAULT 0.00,
        \`preview_data\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
        \`is_available\` tinyint(1) NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`item_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'simulation_saves',
      create: `CREATE TABLE IF NOT EXISTS \`simulation_saves\` (
        \`save_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`save_name\` varchar(50) NOT NULL DEFAULT 'Save 1',
        \`sim_money\` decimal(15,2) NOT NULL DEFAULT 0.00,
        \`sim_reputation\` int(11) NOT NULL DEFAULT 10,
        \`battery_percent\` int(11) NOT NULL DEFAULT 100,
        \`is_plugged_in\` tinyint(1) NOT NULL DEFAULT 1,
        \`current_location_id\` int(11) DEFAULT 1,
        \`current_day\` int(11) NOT NULL DEFAULT 1,
        \`current_hour\` decimal(4,1) NOT NULL DEFAULT 8.0,
        \`jobs_completed\` int(11) NOT NULL DEFAULT 0,
        \`jobs_failed\` int(11) NOT NULL DEFAULT 0,
        \`total_earned\` decimal(15,2) NOT NULL DEFAULT 0.00,
        \`total_spent\` decimal(15,2) NOT NULL DEFAULT 0.00,
        \`environment_status\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`save_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'random_events',
      create: `CREATE TABLE IF NOT EXISTS \`random_events\` (
        \`event_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`event_key\` varchar(50) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`effect_type\` enum('POWER_CUT','INTERNET_CUT','BATTERY_DRAIN','SPEED_BOOST','MONEY_LOSS') NOT NULL,
        \`severity\` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'LOW',
        \`base_chance_percent\` int(11) NOT NULL DEFAULT 5,
        \`duration_minutes\` int(11) DEFAULT NULL,
        \`force_skip_day\` tinyint(1) NOT NULL DEFAULT 0,
        \`auto_resolve\` tinyint(1) NOT NULL DEFAULT 0,
        \`affected_systems\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
        PRIMARY KEY (\`event_id\`),
        UNIQUE KEY (\`event_key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'simulation_active_events',
      create: `CREATE TABLE IF NOT EXISTS \`simulation_active_events\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`save_id\` int(11) NOT NULL,
        \`event_id\` int(11) NOT NULL,
        \`started_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`expires_at\` timestamp NULL DEFAULT NULL,
        \`is_resolved\` tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'user_inventory',
      create: `CREATE TABLE IF NOT EXISTS \`user_inventory\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`item_id\` int(11) NOT NULL,
        \`purchased_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'user_profile_showcase',
      create: `CREATE TABLE IF NOT EXISTS \`user_profile_showcase\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`achievement_id\` int(11) NOT NULL,
        \`display_order\` int(11) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'modules',
      create: `CREATE TABLE IF NOT EXISTS \`modules\` (
        \`module_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`title\` varchar(200) NOT NULL,
        \`order_index\` int(11) NOT NULL DEFAULT 0,
        \`required_level\` int(11) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`module_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'lessons',
      create: `CREATE TABLE IF NOT EXISTS \`lessons\` (
        \`lesson_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`module_id\` int(11) NOT NULL,
        \`title\` varchar(200) NOT NULL,
        \`order_index\` int(11) NOT NULL DEFAULT 0,
        \`required_level\` int(11) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`lesson_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'lesson_slides',
      create: `CREATE TABLE IF NOT EXISTS \`lesson_slides\` (
        \`slide_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`lesson_id\` int(11) NOT NULL,
        \`slide_order\` int(11) NOT NULL DEFAULT 0,
        \`slide_title\` varchar(200) DEFAULT NULL,
        \`slide_content\` text DEFAULT NULL,
        \`slide_src\` varchar(500) DEFAULT NULL,
        \`slide_type\` varchar(20) DEFAULT 'text',
        PRIMARY KEY (\`slide_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'lesson_quizzes',
      create: `CREATE TABLE IF NOT EXISTS \`lesson_quizzes\` (
        \`quiz_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`lesson_id\` int(11) NOT NULL,
        \`quiz_type\` varchar(10) NOT NULL DEFAULT 'pre',
        PRIMARY KEY (\`quiz_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'quiz_questions',
      create: `CREATE TABLE IF NOT EXISTS \`quiz_questions\` (
        \`question_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`quiz_id\` int(11) NOT NULL,
        \`question_text\` text NOT NULL,
        \`question_type\` varchar(20) NOT NULL DEFAULT 'choice',
        \`correct_answer\` text NOT NULL,
        \`question_order\` int(11) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`question_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'question_choices',
      create: `CREATE TABLE IF NOT EXISTS \`question_choices\` (
        \`choice_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`question_id\` int(11) NOT NULL,
        \`choice_text\` varchar(500) NOT NULL,
        PRIMARY KEY (\`choice_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    },
    {
      table: 'survey_questions',
      create: `CREATE TABLE IF NOT EXISTS \`survey_questions\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`title\` varchar(200) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`image\` varchar(200) DEFAULT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
    }
  ];

  for (const row of tableChecks) {
    await ensureTableOrColumn(conn, `SHOW TABLES LIKE '${row.table}'`, row.create, `สร้างตาราง ${row.table}`);
  }

  const userColumns = [
    {name: 'email', col: 'varchar(100) DEFAULT NULL'},
    {name: 'role', col: "varchar(20) DEFAULT 'user'"},
    {name: 'level', col: 'int DEFAULT 1'},
    {name: 'xp', col: 'int DEFAULT 0'},
    {name: 'virtual_currency', col: 'int DEFAULT 0'},
    {name: 'equipped_theme_id', col: 'int(11) DEFAULT NULL'},
    {name: 'equipped_mouse_effect_id', col: 'int(11) DEFAULT NULL'},
    {name: 'equipped_profile_frame_id', col: 'int(11) DEFAULT NULL'},
    {name: 'avatar_url', col: 'varchar(255) DEFAULT NULL'},
    {name: 'bio', col: 'varchar(500) DEFAULT NULL'}
  ];

  const [existingUsers] = await conn.query("SHOW TABLES LIKE 'users'");
  if (existingUsers.length === 0) {
    console.warn('⚠️ ตาราง users ไม่มีในฐานข้อมูล');
  } else {
    for (const c of userColumns) {
      const [colResult] = await conn.query(`SHOW COLUMNS FROM \`users\` LIKE '${c.name}'`);
      if (colResult.length === 0) {
        console.log(`🛠️  เพิ่มคอลัมน์ users.${c.name}`);
        await conn.query(`ALTER TABLE \`users\` ADD COLUMN \`${c.name}\` ${c.col}`);
      } else {
        console.log(`✅ มีคอลัมน์ users.${c.name} อยู่แล้ว`);
      }
    }
  }

  // Ensure simulation_logs has fields for save and events
  const logColumns = [
    {name: 'save_id', col: 'int(11) DEFAULT NULL'},
    {name: 'event_id', col: 'int(11) DEFAULT NULL'}
  ];

  const [simLogExists] = await conn.query("SHOW TABLES LIKE 'simulation_logs'");
  if (simLogExists.length > 0) {
    for (const c of logColumns) {
      const [colResult] = await conn.query(`SHOW COLUMNS FROM \`simulation_logs\` LIKE '${c.name}'`);
      if (colResult.length === 0) {
        console.log(`🛠️  เพิ่มคอลัมน์ simulation_logs.${c.name}`);
        await conn.query(`ALTER TABLE \`simulation_logs\` ADD COLUMN \`${c.name}\` ${c.col}`);
      } else {
        console.log(`✅ มีคอลัมน์ simulation_logs.${c.name} อยู่แล้ว`);
      }
    }
  } else {
    console.warn('⚠️ ตาราง simulation_logs ไม่มีในฐานข้อมูล');
  }

  await conn.end();

  await doBackup('after');

  console.log('🎉 สำเร็จ: ตรวจสอบและสร้างตาราง/คอลัมน์ที่ขาดเสร็จแล้ว');
}

main().catch(err => {
  console.error('❌ เกิดข้อผิดพลาด:', err);
  process.exit(1);
});
