require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const tables = [
    'users',
    'shop_items',
    'user_inventory',
    'simulation_saves',
    'random_events',
    'simulation_active_events',
    'lessons',
    'modules',
    'exercises',
    'exercise_submissions',
];

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: String(process.env.PGPASSWORD ?? ''),
    database: process.env.PGDATABASE,
    port: Number(process.env.PGPORT || 5432),
});

(async () => {
    for (const table of tables) {
        const result = await pool.query(
            `SELECT column_name, data_type, column_default, is_nullable
             FROM information_schema.columns
             WHERE table_schema = $1 AND table_name = $2
             ORDER BY ordinal_position`,
            ['public', table]
        );

        console.log(`\n[${table}]`);
        for (const row of result.rows) {
            console.log(`${row.column_name} | ${row.data_type} | default=${row.column_default || ''} | null=${row.is_nullable}`);
        }
    }
})()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
