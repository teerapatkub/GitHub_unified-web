require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: String(process.env.PGPASSWORD ?? ''),
    database: process.env.PGDATABASE,
    port: Number(process.env.PGPORT || 5432),
});

(async () => {
    await pool.query('BEGIN');
    const result = await pool.query(
        'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING user_id',
        ['codex_smoke_user', 'x', 'codex_smoke@example.com']
    );
    console.log(`insert user_id=${result.rows[0].user_id}`);
    await pool.query('ROLLBACK');
})()
    .catch(async (error) => {
        console.error(error.message);
        try {
            await pool.query('ROLLBACK');
        } catch (_) {
            // ignore rollback failures during smoke test cleanup
        }
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
