require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: String(process.env.PGPASSWORD ?? ''),
    database: process.env.PGDATABASE,
    port: Number(process.env.PGPORT || 5432),
});

const quoteIdent = (value) => `"${String(value).replace(/"/g, '""')}"`;
const quoteLiteral = (value) => `'${String(value).replace(/'/g, "''")}'`;
const nonGeneratedPrimaryKeys = new Set([
    'mini_game_current_conversations.user_id',
    'user_presence.user_id',
]);

const ensureAutoIncrementDefaults = async () => {
    const { rows } = await pool.query(`
        SELECT
            c.table_name,
            c.column_name,
            c.column_default,
            c.identity_generation
        FROM information_schema.columns c
        JOIN (
            SELECT
                tc.table_schema,
                tc.table_name,
                MIN(kcu.column_name) AS column_name,
                COUNT(*) AS key_column_count
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON kcu.table_schema = tc.table_schema
             AND kcu.table_name = tc.table_name
             AND kcu.constraint_name = tc.constraint_name
            WHERE tc.table_schema = 'public'
              AND tc.constraint_type = 'PRIMARY KEY'
            GROUP BY tc.table_schema, tc.table_name, tc.constraint_name
        ) pk
          ON pk.table_schema = c.table_schema
         AND pk.table_name = c.table_name
         AND pk.column_name = c.column_name
        WHERE c.table_schema = 'public'
          AND c.data_type IN ('integer', 'bigint')
          AND c.identity_generation IS NULL
          AND pk.key_column_count = 1
        ORDER BY c.table_name, c.column_name
    `);

    for (const row of rows) {
        if (nonGeneratedPrimaryKeys.has(`${row.table_name}.${row.column_name}`)) {
            if (row.column_default?.includes('nextval(')) {
                await pool.query(`ALTER TABLE ${quoteIdent(row.table_name)} ALTER COLUMN ${quoteIdent(row.column_name)} DROP DEFAULT`);
                console.log(`removed non-generated key default: ${row.table_name}.${row.column_name}`);
            }
            continue;
        }

        const table = quoteIdent(row.table_name);
        const column = quoteIdent(row.column_name);
        const sequence = quoteIdent(`${row.table_name}_${row.column_name}_seq`);
        const sequenceLiteral = quoteLiteral(`${row.table_name}_${row.column_name}_seq`);
        const sequenceName = `${row.table_name}_${row.column_name}_seq`;
        const activeSequence = row.column_default?.includes('nextval(')
            ? await pool.query('SELECT pg_get_serial_sequence($1, $2) AS sequence_name', [`public.${row.table_name}`, row.column_name])
            : null;
        const activeSequenceName = activeSequence?.rows?.[0]?.sequence_name || sequenceName;
        const activeSequenceLiteral = quoteLiteral(activeSequenceName);

        if (!row.column_default?.includes('nextval(')) {
            await pool.query(`CREATE SEQUENCE IF NOT EXISTS ${sequence}`);
            try {
                await pool.query(`ALTER SEQUENCE ${sequence} OWNED BY ${table}.${column}`);
            } catch (error) {
                if (error.code !== '0A000') throw error;
            }
            await pool.query(`ALTER TABLE ${table} ALTER COLUMN ${column} SET DEFAULT nextval(${sequenceLiteral})`);
        }

        await pool.query(`
            SELECT setval(
                ${activeSequenceLiteral},
                COALESCE((SELECT MAX(${column}) FROM ${table}), 0) + 1,
                false
            )
        `);
        console.log(`fixed auto increment: ${row.table_name}.${row.column_name}`);
    }
};

const dropAccidentalCompositeDefaults = async () => {
    const { rows } = await pool.query(`
        SELECT c.table_name, c.column_name
        FROM information_schema.columns c
        JOIN information_schema.key_column_usage kcu
          ON kcu.table_schema = c.table_schema
         AND kcu.table_name = c.table_name
         AND kcu.column_name = c.column_name
        JOIN information_schema.table_constraints tc
          ON tc.table_schema = kcu.table_schema
         AND tc.table_name = kcu.table_name
         AND tc.constraint_name = kcu.constraint_name
         AND tc.constraint_type = 'PRIMARY KEY'
        JOIN (
            SELECT table_schema, table_name, constraint_name, COUNT(*) AS key_column_count
            FROM information_schema.key_column_usage
            WHERE table_schema = 'public'
            GROUP BY table_schema, table_name, constraint_name
        ) pk
          ON pk.table_schema = tc.table_schema
         AND pk.table_name = tc.table_name
         AND pk.constraint_name = tc.constraint_name
        WHERE c.table_schema = 'public'
          AND pk.key_column_count > 1
          AND c.column_default LIKE 'nextval(%'
    `);

    for (const row of rows) {
        await pool.query(`ALTER TABLE ${quoteIdent(row.table_name)} ALTER COLUMN ${quoteIdent(row.column_name)} DROP DEFAULT`);
        console.log(`removed composite key default: ${row.table_name}.${row.column_name}`);
    }
};

const normalizeMergedColumns = async () => {
    await pool.query(`
        UPDATE shop_items
        SET item_type = COALESCE(NULLIF(item_type, ''), type, 'THEME'),
            effects = COALESCE(effects, preview_data),
            is_active = COALESCE(is_active, is_available, 1)
    `);
};

(async () => {
    await dropAccidentalCompositeDefaults();
    await ensureAutoIncrementDefaults();
    await normalizeMergedColumns();
    console.log('PostgreSQL compatibility fix complete.');
})()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
