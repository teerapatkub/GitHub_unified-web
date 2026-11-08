// Schema and content fixes raised in the project report review (2026-11-09).
// Every seed and table below lives inside an applied, checksummed migration,
// so the corrections are their own migration instead of edits to those seeds.
//
// 1. achievements.reward_money was numeric(10,2) while every other coin amount
//    (users.virtual_currency, shop_items.price, rewards) is a whole integer.
//    The server already rounded it on payout (server.js awardAchievements).
// 2. survey_questions / survey_options / level_config had a column named
//    "order", an SQL reserved word that every query had to quote.
// 3. The aiHelper Arcade item said it asks "Gemini AI". It never calls a
//    model: it reveals the round's hint from the problem bank.
// 4. Two file-handling lesson slides stored the "\n" inside file.write("...")
//    as a real line break, so the example could never run.

const columnExists = async (db, table, column) => {
  const [rows] = await db.query(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ? AND column_name = ?`,
    [table, column],
  );
  return rows.length > 0;
};

const AI_HELPER_DESC_TH = 'เปิดคำใบ้ของโจทย์รอบนี้';
const AI_HELPER_DESC_EN = 'Reveals the hint for this round\'s problem.';

async function migrateSchemaCleanup(db) {
  if (await columnExists(db, 'achievements', 'reward_money')) {
    await db.query(`ALTER TABLE achievements
      ALTER COLUMN reward_money DROP DEFAULT,
      ALTER COLUMN reward_money TYPE INTEGER USING ROUND(COALESCE(reward_money, 0))::integer,
      ALTER COLUMN reward_money SET DEFAULT 0`);
  }

  for (const table of ['survey_questions', 'survey_options', 'level_config']) {
    if (await columnExists(db, table, 'order') && !(await columnExists(db, table, 'sort_order'))) {
      await db.query(`ALTER TABLE ${table} RENAME COLUMN "order" TO sort_order`);
    }
  }

  await db.query(
    `UPDATE arcade_items SET desc_th = ?, desc_en = ? WHERE item_code = 'aiHelper'`,
    [AI_HELPER_DESC_TH, AI_HELPER_DESC_EN],
  );

  // A line break directly before `")` can only be the broken "\n" escape:
  // a Python string literal in double quotes cannot span lines.
  await db.query(
    `UPDATE lesson_slides
        SET slide_content = REPLACE(REPLACE(slide_content, ?, ?), ?, ?)
      WHERE slide_type = 'code' AND slide_content LIKE ? AND slide_content LIKE ?`,
    ['\r\n")', '\\n")', '\n")', '\\n")', '%.write("%', '%\n")%'],
  );
}

module.exports = { migrateSchemaCleanup, AI_HELPER_DESC_TH, AI_HELPER_DESC_EN };
