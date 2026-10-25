// Hides shop items that were created while testing the admin panel and never
// meant for players (Spec 0005 ticket 12, user test bug U8: "he", price 0,
// MOUSE_EFFECT, only in the test project). "Heart" (item 12) was reported in
// the same breath but is part of seed-content.sql, the content set carried to
// production as a free double-click effect, so it is left alone until the team
// decides it is a leftover. Hiding sets is_active = 0, the flag GET /api/shop/items
// already filters on; nothing is deleted, so owned copies stay in inventories
// and the change is reversible.
//
//   node scripts/hide-test-shop-items.js                          # dry run, server/.env
//   node scripts/hide-test-shop-items.js --env-file .env.production.local
//   node scripts/hide-test-shop-items.js --apply [--env-file ...]
//
// Matches by exact name AND price 0, so a real item that happens to share a
// name is never touched. Prints the project host, never credentials.
const path = require('path');
const { Pool } = require('pg');

const NAMES = ['he'];

(async () => {
  const args = process.argv.slice(2);
  const envIndex = args.indexOf('--env-file');
  const envFile = envIndex >= 0 ? args[envIndex + 1] : '.env';
  const apply = args.includes('--apply');
  require('dotenv').config({ path: path.resolve(__dirname, '..', envFile), quiet: true });
  if (!process.env.DATABASE_URL) throw new Error(`DATABASE_URL is not set in ${envFile}`);

  const url = new URL(process.env.DATABASE_URL);
  const project = (url.username.split('.')[1] || url.hostname);
  console.log(`env file: ${envFile}  project: ${project}  mode: ${apply ? 'APPLY' : 'dry run'}`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const { rows } = await pool.query(
      `SELECT si.item_id, si.name, si.item_type, si.price, si.is_active,
              (SELECT COUNT(*)::int FROM user_inventory ui WHERE ui.item_id = si.item_id) AS owned_by
         FROM shop_items si
        WHERE si.name = ANY($1) AND si.price = 0
        ORDER BY si.item_id`,
      [NAMES]
    );
    if (rows.length === 0) {
      console.log('no matching test items');
      return;
    }
    console.table(rows);
    if (!apply) {
      console.log('dry run: nothing changed. Re-run with --apply to hide these items.');
      return;
    }
    const { rowCount } = await pool.query(
      'UPDATE shop_items SET is_active = 0 WHERE item_id = ANY($1) AND price = 0 AND is_active = 1',
      [rows.map(row => row.item_id)]
    );
    console.log(`hidden: ${rowCount}`);
  } finally {
    await pool.end();
  }
})().catch(error => {
  console.error(error.message);
  process.exit(1);
});
