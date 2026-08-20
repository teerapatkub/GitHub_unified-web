const { Pool } = require('pg');

const DB_CONFIG = {
    host: process.env.PGHOST || process.env.PG_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.PGUSER || process.env.PG_USER || process.env.DB_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.PG_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.PGDATABASE || process.env.PG_DATABASE || process.env.DB_NAME || 'FullProjectPython',
    port: Number(process.env.PGPORT || process.env.PG_PORT || process.env.DB_PORT || 5432),
    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
};

const normalizePostgresQuery = (sql) => {
    let parameterIndex = 0;
    let normalizedSql = sql
        .replace(/`([^`]+)`/g, '"$1"')
        .replace(/\bDATABASE\(\)/gi, 'current_database()')
        .replace(/\bIFNULL\s*\(/gi, 'COALESCE(')
        .replace(/\bJSON_ARRAY\s*\(/gi, 'json_build_array(')
        .replace(/\bint\(\d+\)/gi, 'integer')
        .replace(/\btinyint\(1\)/gi, 'boolean')
        .replace(/\blongtext\b/gi, 'text')
        .replace(/\bdouble\b/gi, 'double precision')
        .replace(/\bunsigned\b/gi, '')
        .replace(/\s+CHARACTER SET\s+\w+/gi, '')
        .replace(/\s+COLLATE\s+\w+/gi, '')
        .replace(/\s+ON UPDATE\s+CURRENT_TIMESTAMP(?:\(\))?/gi, '')
        .replace(/\s+ENGINE\s*=\s*\w+/gi, '')
        .replace(/\s+DEFAULT CHARSET\s*=\s*\w+/gi, '')
        .replace(/\s+COLLATE\s*=\s*\w+/gi, '')
        .replace(/\bAUTO_INCREMENT\b/gi, '')
        .replace(/\benum\s*\([^)]*\)/gi, 'varchar(50)')
        .replace(/,\s*(?:UNIQUE\s+)?KEY\s+[^,(]+\s*\([^)]*\)/gi, '')
        .replace(/,\s*CONSTRAINT\s+[^\n]+\s+FOREIGN KEY\s*\([^)]*\)\s+REFERENCES\s+[^,\n]+/gi, '')
        .replace(/\s+CHECK\s*\(\s*json_valid\([^)]*\)\s*\)/gi, '')
        .replace(/\bMODIFY\b/gi, 'ALTER COLUMN')
        .replace(/\bALTER TABLE\s+([^\s]+)\s+ALTER COLUMN\s+([^\s]+)\s+boolean\s+DEFAULT\s+(0|1)/gi, (_match, table, column, value) =>
            `ALTER TABLE ${table} ALTER COLUMN ${column} TYPE boolean USING ${column}::boolean; ALTER TABLE ${table} ALTER COLUMN ${column} SET DEFAULT ${value === '1' ? 'TRUE' : 'FALSE'}`
        )
        .replace(/(\b(?:is_active|is_plugged_in|is_ready|is_deleted|is_banned|is_completed|is_passed|is_resolved|auto_resolve|force_skip_day|is_available|is_verified)\s+boolean(?:\s+NOT NULL)?\s+DEFAULT\s+)([01])\b/gi, (_match, prefix, value) => `${prefix}${value === '1' ? 'TRUE' : 'FALSE'}`)
        .replace(/,\s*\)/g, ')')
        .replace(/current_timestamp\(\)/gi, 'CURRENT_TIMESTAMP')
        .replace(/table_schema\s*=\s*current_database\(\)/gi, 'table_schema = current_schema()')
        .replace(/\?/g, () => `$${++parameterIndex}`);

    const booleanColumns = '(?:is_active|is_plugged_in|is_ready|is_deleted|is_banned|is_completed|is_passed|is_resolved|auto_resolve|force_skip_day|is_available|is_verified)';
    normalizedSql = normalizedSql
        .replace(new RegExp(`\\b${booleanColumns}\\s*=\\s*1\\b`, 'gi'), (match) => match.replace(/=\s*1/i, '= TRUE'))
        .replace(new RegExp(`\\b${booleanColumns}\\s*=\\s*0\\b`, 'gi'), (match) => match.replace(/=\s*0/i, '= FALSE'));

    return normalizedSql;
};

const RECOVERABLE_ERROR_CODES = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    '57P01',
    '08000',
    '08003',
    '08006',
    '08001',
    'ETIMEDOUT',
]);

let pool = null;
let poolInitPromise = null;

const formatDbError = (error) => {
    if (!error) {
        return 'Unknown database error';
    }

    if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }

    if (typeof error.code === 'string' && error.code.trim()) {
        return `Database error (${error.code})`;
    }

    try {
        return JSON.stringify(error);
    } catch (_) {
        return String(error);
    }
};

const isRecoverableError = (error) => {
    if (!error) return false;
    if (RECOVERABLE_ERROR_CODES.has(error.code)) return true;

    const message = String(error.message || '').toUpperCase();
    return (
        message.includes('ECONNRESET') ||
        message.includes('ECONNREFUSED') ||
        message.includes('PROTOCOL_CONNECTION_LOST') ||
        message.includes('PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') ||
        message.includes('PROTOCOL_ENQUEUE_AFTER_QUIT')
    );
};

const closePool = async () => {
    if (!pool) return;
    try {
        await pool.end();
    } catch (_) {
        // ignore end failures during recovery
    } finally {
        pool = null;
    }
};

const ensurePool = async () => {
    if (pool) return pool;

    if (!poolInitPromise) {
        poolInitPromise = (async () => {
            const nextPool = new Pool(DB_CONFIG);
            await nextPool.query('SELECT 1');
            pool = nextPool;
            return pool;
        })().finally(() => {
            poolInitPromise = null;
        });
    }

    return poolInitPromise;
};

const runWithRecovery = async (operation, meta) => {
    try {
        return await operation();
    } catch (error) {
        if (!isRecoverableError(error)) {
            throw error;
        }

        console.warn('[db] Recoverable PostgreSQL error, recreating pool:', {
            code: error.code,
            message: formatDbError(error),
            context: meta?.context || 'query',
        });

        await closePool();
        await ensurePool();
        return operation();
    }
};

const createRunner = (clientFactory) => ({
    async execute(sql, values = []) {
        try {
            return await runWithRecovery(async () => {
                const client = await clientFactory();
                const result = await client.query(normalizePostgresQuery(sql), values);
                return [result.rows, result.fields];
            }, { context: 'execute' });
        } catch (error) {
            const message = formatDbError(error);
            console.error('[db.execute] Query failed:', {
                message,
                sql,
                values,
            });
            error.message = message;
            throw error;
        }
    },

    async query(sql, values = []) {
        return this.execute(sql, values);
    },
});

const db = createRunner(async () => ensurePool());

db.getConnection = async () => {
    const activePool = await ensurePool();
    const connection = await activePool.connect();

    try {
        await connection.query('SELECT 1');
    } catch (error) {
        connection.release();
        await closePool();
        return db.getConnection();
    }

    return {
        async execute(sql, values = []) {
            try {
                const result = await connection.query(normalizePostgresQuery(sql), values);
                return [result.rows, result.fields];
            } catch (error) {
                const message = formatDbError(error);
                console.error('[db.connection.execute] Query failed:', {
                    message,
                    sql,
                    values,
                });
                error.message = message;
                throw error;
            }
        },
        async query(sql, values = []) {
            return this.execute(sql, values);
        },
        async beginTransaction() {
            await connection.query('BEGIN');
        },
        async commit() {
            await connection.query('COMMIT');
        },
        async rollback() {
            await connection.query('ROLLBACK');
        },
        release() {
            connection.release();
        },
    };
};

db.healthcheck = async () => {
    const activePool = await ensurePool();
    await activePool.query('SELECT 1');
    return true;
};

(async () => {
    try {
        await db.healthcheck();
        console.log(`Connected to PostgreSQL database "${DB_CONFIG.database}"`);
    } catch (err) {
        console.error('Database connection failed:', formatDbError(err));
    }
})();

module.exports = db;
