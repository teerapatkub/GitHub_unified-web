require('dotenv').config();

const path = require('path');

let pg;
try {
    pg = require('pg');
} catch (error) {
    pg = require(path.resolve(__dirname, '../../game-test/server/node_modules/pg'));
}

const { Pool } = pg;

const DB_CONFIG = {
    host: process.env.PGHOST || process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.PGUSER || process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
    password: String(process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? process.env.DB_PASSWORD ?? ''),
    database: process.env.PGDATABASE || process.env.POSTGRES_DB || process.env.DB_NAME || 'python_project2',
    port: Number(process.env.PGPORT || process.env.POSTGRES_PORT || process.env.DB_PORT || 5432),
    max: Number(process.env.DB_CONNECTION_LIMIT || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

const RECOVERABLE_ERROR_CODES = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    '57P01',
    '57P02',
    '57P03',
    '53300',
    '08000',
    '08003',
    '08006',
]);

let pool = null;
let poolInitPromise = null;

const formatDbError = (error) => {
    if (!error) return 'Unknown database error';
    if (typeof error.message === 'string' && error.message.trim()) return error.message;
    if (typeof error.code === 'string' && error.code.trim()) return `Database error (${error.code})`;

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
    return message.includes('ECONNRESET') || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT');
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

const replaceMysqlPlaceholders = (sql) => {
    let index = 0;
    let output = '';
    let quote = null;
    let dollarQuote = null;

    for (let i = 0; i < sql.length; i += 1) {
        const char = sql[i];
        const next = sql[i + 1];

        if (dollarQuote) {
            if (sql.startsWith(dollarQuote, i)) {
                output += dollarQuote;
                i += dollarQuote.length - 1;
                dollarQuote = null;
            } else {
                output += char;
            }
            continue;
        }

        if (!quote && char === '$') {
            const match = sql.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
            if (match) {
                dollarQuote = match[0];
                output += dollarQuote;
                i += dollarQuote.length - 1;
                continue;
            }
        }

        if (quote) {
            output += char;
            if (char === quote && next === quote) {
                output += next;
                i += 1;
            } else if (char === quote) {
                quote = null;
            }
            continue;
        }

        if (char === '\'' || char === '"') {
            quote = char;
            output += char;
            continue;
        }

        if (char === '?') {
            index += 1;
            output += `$${index}`;
            continue;
        }

        output += char;
    }

    return output;
};

const stripMysqlTableOptions = (sql) =>
    sql
        .replace(/\)\s*ENGINE\s*=\s*\w+[\s\S]*?(?=;|$)/gi, ')')
        .replace(/\s+DEFAULT\s+CHARSET\s*=\s*[\w\d_]+/gi, '')
        .replace(/\s+CHARSET\s*=\s*[\w\d_]+/gi, '')
        .replace(/\s+COLLATE\s*=\s*[\w\d_]+/gi, '');

const transformCreateTableIndexes = (sql) =>
    sql
        .split('\n')
        .filter((line) => !/^\s*KEY\s+/i.test(line))
        .map((line) => {
            const uniqueMatch = line.match(/^(\s*)UNIQUE\s+KEY\s+"?([A-Za-z0-9_]+)"?\s*\((.+)\)(,?)\s*$/i);
            if (uniqueMatch) {
                return `${uniqueMatch[1]}CONSTRAINT "${uniqueMatch[2]}" UNIQUE (${uniqueMatch[3]})${uniqueMatch[4]}`;
            }

            const anonymousUniqueMatch = line.match(/^(\s*)UNIQUE\s+KEY\s*\((.+)\)(,?)\s*$/i);
            if (anonymousUniqueMatch) {
                return `${anonymousUniqueMatch[1]}UNIQUE (${anonymousUniqueMatch[2]})${anonymousUniqueMatch[3]}`;
            }

            return line;
        })
        .join('\n')
        .replace(/,\s*\)/g, '\n)');

const transformOnDuplicateKey = (sql) =>
    sql.replace(
        /\s+ON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*?(?=;|$)/gi,
        ' ON CONFLICT DO NOTHING'
    );

const transformMysqlSyntax = (rawSql) => {
    let sql = String(rawSql || '').trim();

    if (/^SELECT\s+GET_LOCK\s*\(/i.test(sql)) return 'SELECT 1 AS lock_result';
    if (/^SELECT\s+RELEASE_LOCK\s*\(/i.test(sql)) return 'SELECT 1 AS release_result';
    if (/^SHOW\s+TABLES/i.test(sql)) {
        return "SELECT tablename AS table_name FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename";
    }

    sql = sql
        .replace(/`/g, '"')
        .replace(/\bDATABASE\s*\(\s*\)/gi, 'current_database()')
        .replace(/\bNOW\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP')
        .replace(/\bCURDATE\s*\(\s*\)/gi, 'CURRENT_DATE')
        .replace(/\bcurrent_timestamp\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP')
        .replace(
            /SUBSTRING_INDEX\s*\(\s*GROUP_CONCAT\s*\(\s*([A-Za-z0-9_."()]+)\s+ORDER\s+BY\s+([A-Za-z0-9_."()]+)\s+DESC\s+SEPARATOR\s+'([^']*)'\s*\)\s*,\s*'([^']*)'\s*,\s*1\s*\)/gi,
            "split_part(string_agg($1::text, '$3' ORDER BY $2 DESC), '$4', 1)"
        )
        .replace(/\bJSON_ARRAY\s*\(/gi, 'json_build_array(')
        .replace(/DATE_ADD\s*\(\s*CURRENT_TIMESTAMP\s*,\s*INTERVAL\s+(\?)\s+HOUR\s*\)/gi, "(CURRENT_TIMESTAMP + ($1 * INTERVAL '1 hour'))")
        .replace(/DATE_ADD\s*\(\s*CURRENT_TIMESTAMP\s*,\s*INTERVAL\s+(\d+)\s+HOUR\s*\)/gi, "CURRENT_TIMESTAMP + INTERVAL '$1 hours'")
        .replace(/DATE_SUB\s*\(\s*CURRENT_TIMESTAMP\s*,\s*INTERVAL\s+(\d+)\s+MINUTE\s*\)/gi, "CURRENT_TIMESTAMP - INTERVAL '$1 minutes'")
        .replace(/table_schema\s*=\s*current_database\s*\(\s*\)/gi, "table_schema = 'public'")
        .replace(/\bint\s*\(\s*\d+\s*\)/gi, 'integer')
        .replace(/\btinyint\s*\(\s*1\s*\)/gi, 'integer')
        .replace(/\blongtext\b/gi, 'text')
        .replace(/\bdatetime\b/gi, 'timestamp')
        .replace(/\s+CHARACTER\s+SET\s+\w+(?:\s+COLLATE\s+\w+)?/gi, '')
        .replace(/\s+COLLATE\s+\w+/gi, '')
        .replace(/\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '')
        .replace(/\bjson_valid\s*\(\s*([^)]+)\s*\)/gi, '$1 IS NOT NULL')
        .replace(/\benum\s*\(([^)]+)\)/gi, 'varchar(50)');

    sql = sql.replace(
        /"([A-Za-z0-9_]+)"\s+integer\s+NOT\s+NULL\s+AUTO_INCREMENT/gi,
        '"$1" SERIAL'
    );
    sql = sql.replace(
        /\b([A-Za-z0-9_]+)\s+integer\s+NOT\s+NULL\s+AUTO_INCREMENT/gi,
        '$1 SERIAL'
    );
    sql = sql.replace(/\s+AUTO_INCREMENT/gi, '');

    sql = transformOnDuplicateKey(sql);
    sql = sql.replace(/\bVALUES\s*\(\s*"?([A-Za-z0-9_]+)"?\s*\)/gi, 'EXCLUDED."$1"');
    sql = stripMysqlTableOptions(sql);

    if (/^\s*CREATE\s+TABLE/i.test(sql)) {
        sql = transformCreateTableIndexes(sql);
    }

    sql = sql
        .replace(/\s+AFTER\s+"?[A-Za-z0-9_]+"?/gi, '')
        .replace(/\bADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\b/gi, 'ADD COLUMN IF NOT EXISTS');

    return replaceMysqlPlaceholders(sql);
};

const appendReturningForInsert = (sql) => {
    if (!/^\s*INSERT\b/i.test(sql)) return sql;
    if (/\bRETURNING\b/i.test(sql)) return sql;
    if (/\bON\s+CONFLICT\s+DO\s+NOTHING\b/i.test(sql)) return `${sql} RETURNING *`;
    return `${sql} RETURNING *`;
};

const buildMysqlLikeResult = (result) => {
    const command = String(result.command || '').toUpperCase();
    const rows = result.rows || [];

    if (command === 'SELECT' || command === 'SHOW') {
        return [rows, result.fields || []];
    }

    if (command === 'INSERT') {
        const firstRow = rows[0] || {};
        const idKey = Object.keys(firstRow).find((key) => /(^id$|_id$)/i.test(key));
        return [{
            insertId: idKey ? firstRow[idKey] : 0,
            affectedRows: result.rowCount || rows.length || 0,
            rowCount: result.rowCount || 0,
            rows,
        }, result.fields || []];
    }

    return [{
        affectedRows: result.rowCount || 0,
        changedRows: result.rowCount || 0,
        rowCount: result.rowCount || 0,
        rows,
    }, result.fields || []];
};

const runSpecialQuery = async (client, sql, values) => {
    if (/FROM\s+information_schema\.statistics/i.test(sql)) {
        const tableMatch = sql.match(/table_name\s*=\s*'([^']+)'/i);
        const indexMatch = sql.match(/index_name\s*=\s*'([^']+)'/i);
        if (tableMatch && indexMatch) {
            const result = await client.query(
                `SELECT COUNT(*)::integer AS count
                 FROM pg_indexes
                 WHERE schemaname = 'public'
                   AND tablename = $1
                   AND indexname = $2`,
                [tableMatch[1], indexMatch[1]]
            );
            return [result.rows, result.fields || []];
        }
    }

    return null;
};

const executeWithClient = async (client, sql, values = []) => {
    const transformedSql = appendReturningForInsert(transformMysqlSyntax(sql));
    const specialResult = await runSpecialQuery(client, transformedSql, values);
    if (specialResult) return specialResult;

    const result = await client.query(transformedSql, values);
    return buildMysqlLikeResult(result);
};

const runWithRecovery = async (operation, meta) => {
    try {
        return await operation();
    } catch (error) {
        if (!isRecoverableError(error)) throw error;

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
                return executeWithClient(client, sql, values);
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
    const client = await activePool.connect();

    return {
        async execute(sql, values = []) {
            try {
                return executeWithClient(client, sql, values);
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
            await client.query('BEGIN');
        },
        async commit() {
            await client.query('COMMIT');
        },
        async rollback() {
            await client.query('ROLLBACK');
        },
        release() {
            client.release();
        },
    };
};

db.healthcheck = async () => {
    const activePool = await ensurePool();
    await activePool.query('SELECT 1');
    return true;
};

db.config = {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    user: DB_CONFIG.user,
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
