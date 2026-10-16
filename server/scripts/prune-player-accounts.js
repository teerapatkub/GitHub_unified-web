// One-off cleanup: keep only the listed player accounts and remove every other
// player's rows, leaving shared content (lessons, problem bank, shop, themes,
// achievements, Competitive challenges) untouched.
//
//   node scripts/prune-player-accounts.js --keep 128,129,141,142          # dry run
//   node scripts/prune-player-accounts.js --keep 128,129,141,142 --apply  # delete
//
// Take a pg_dump first. Per-player tables are found from the live catalog
// rather than a hand-kept list: many of them have no foreign key to users, and
// the Arcade tables are keyed by user name. The dry run prints every table it
// would touch so the list can be reviewed before --apply.
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const { databaseClientConfig } = require('./database-client-config');
const { quoteIdentifier } = require('../security/data-api-security');

// Tables whose user_id / user_name columns describe shared content or are
// rewritten by the users delete itself.
const SHARED_TABLES = new Set(['users']);
// Columns that name a player, checked in this order. host_* columns pick the
// room a player owned; deleting the room cascades to its members.
const PLAYER_COLUMNS = [
  { column: 'user_id', by: 'id' },
  { column: 'host_user_id', by: 'id' },
  { column: 'user_name', by: 'name' },
  { column: 'host_name', by: 'name' },
];
// Delete order that respects blocking foreign keys (NO ACTION / RESTRICT).
const FIRST = ['arcade_reward_receipts', 'game_rooms'];

const parseKeep = () => {
  const index = process.argv.indexOf('--keep');
  const ids = String(process.argv[index + 1] || '').split(',').map(Number);
  if (index < 0 || !ids.length || ids.some((id) => !Number.isInteger(id) || id < 1)) {
    throw new Error('Pass the player ids to keep: --keep 128,129,141,142');
  }
  return ids;
};

const wrap = (client) => async (sql, params = []) => {
  let n = 0;
  return (await client.query(sql.replace(/\?/g, () => `$${++n}`), params)).rows;
};

async function planDeletes(query, keepIds, keepNames) {
  const columns = await query(`
    SELECT c.table_name, c.column_name
      FROM information_schema.columns c
      JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name
     WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
       AND c.column_name = ANY(?)`, [PLAYER_COLUMNS.map((entry) => entry.column)]);
  const byTable = new Map();
  for (const { table_name: table, column_name: column } of columns) {
    if (SHARED_TABLES.has(table)) continue;
    const rank = PLAYER_COLUMNS.findIndex((entry) => entry.column === column);
    const current = byTable.get(table);
    if (!current || rank < current.rank) byTable.set(table, { table, column, rank, by: PLAYER_COLUMNS[rank].by });
  }
  const plans = [...byTable.values()].sort((a, b) => {
    const order = (name) => (FIRST.includes(name) ? FIRST.indexOf(name) : FIRST.length);
    return order(a.table) - order(b.table) || a.table.localeCompare(b.table);
  });
  for (const plan of plans) {
    const keep = plan.by === 'id' ? keepIds : keepNames;
    const where = `${quoteIdentifier(plan.column)} IS NOT NULL AND NOT (${quoteIdentifier(plan.column)}::text = ANY(?))`;
    plan.where = where;
    plan.params = [keep.map(String)];
    [{ count: plan.count }] = await query(`SELECT COUNT(*)::int AS count FROM public.${quoteIdentifier(plan.table)} WHERE ${where}`, plan.params);
  }
  return plans;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const keepIds = parseKeep();
  const pool = new Pool(databaseClientConfig());
  const client = await pool.connect();
  const query = wrap(client);
  const deletedAuthUsers = [];
  try {
    await client.query('BEGIN');
    const kept = await query('SELECT user_id, username FROM users WHERE user_id = ANY(?) ORDER BY user_id', [keepIds]);
    if (kept.length !== keepIds.length) throw new Error(`Only found ${kept.map((row) => row.user_id).join(', ')} of the ids to keep`);
    const keepNames = kept.map((row) => row.username);
    const removed = await query('SELECT user_id, username FROM users WHERE NOT (user_id = ANY(?)) ORDER BY user_id', [keepIds]);
    const authRows = await query(`SELECT auth_user_id::text AS id FROM player_auth_identities
      WHERE NOT (user_id = ANY(?)) AND auth_user_id IS NOT NULL`, [keepIds]);

    console.log(`Keep: ${kept.map((row) => `${row.user_id} ${row.username}`).join(', ')}`);
    console.log(`Remove ${removed.length} accounts: ${removed.map((row) => `${row.user_id} ${row.username}`).join(', ') || 'none'}`);
    const plans = await planDeletes(query, keepIds, keepNames);
    for (const plan of plans) console.log(`  ${plan.table}.${plan.column}: ${plan.count} rows`);

    if (!apply) {
      await client.query('ROLLBACK');
      console.log('Dry run: nothing deleted. Re-run with --apply.');
      return;
    }
    for (const plan of plans) {
      if (plan.count) await query(`DELETE FROM public.${quoteIdentifier(plan.table)} WHERE ${plan.where}`, plan.params);
    }
    await query('DELETE FROM users WHERE NOT (user_id = ANY(?))', [keepIds]);
    const keptAuth = await query('SELECT auth_user_id::text AS id FROM player_auth_identities WHERE auth_user_id IS NOT NULL');
    await query(`DELETE FROM auth_provisioning_operations
      WHERE auth_user_id IS NULL OR NOT (auth_user_id::text = ANY(?))`, [keptAuth.map((row) => row.id)]);
    await client.query('COMMIT');
    deletedAuthUsers.push(...authRows.map((row) => row.id));
    console.log(`Deleted player data for ${removed.length} accounts.`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  // Supabase Auth users live outside this transaction. Remove the ones whose
  // player account is gone; a missing user (already deleted) is not an error.
  const url = String(process.env.SUPABASE_URL || '').trim();
  const key = String(process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!deletedAuthUsers.length) return;
  if (!url || !key) {
    console.log(`Supabase keys not set; remove these Auth users by hand: ${deletedAuthUsers.join(', ')}`);
    return;
  }
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const id of deletedAuthUsers) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (!error) console.log(`  Auth user ${id}: removed`);
    else if (error.status === 404) console.log(`  Auth user ${id}: already gone`);
    else console.log(`  Auth user ${id}: ${error.message}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
