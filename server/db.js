const path = require('path');

let mysql;
try {
    mysql = require('mysql2/promise');
} catch (error) {
    mysql = require(path.resolve(__dirname, '../../game-test/server/node_modules/mysql2/promise'));
}

const DB_CONFIG = {
    host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'FullProjectPython',
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000,
};

const RECOVERABLE_ERROR_CODES = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'PROTOCOL_CONNECTION_LOST',
    'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
    'PROTOCOL_ENQUEUE_AFTER_QUIT',
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
            const nextPool = mysql.createPool(DB_CONFIG);
            await nextPool.execute('SELECT 1');
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

        console.warn('[db] Recoverable MySQL error, recreating pool:', {
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
                return client.execute(sql, values);
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
    const connection = await activePool.getConnection();

    try {
        await connection.ping();
    } catch (error) {
        connection.release();
        await closePool();
        const nextPool = await ensurePool();
        return db.getConnection(nextPool);
    }

    return {
        async execute(sql, values = []) {
            try {
                return await connection.execute(sql, values);
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
            await connection.beginTransaction();
        },
        async commit() {
            await connection.commit();
        },
        async rollback() {
            await connection.rollback();
        },
        release() {
            connection.release();
        },
    };
};

db.healthcheck = async () => {
    const activePool = await ensurePool();
    await activePool.execute('SELECT 1');
    return true;
};

(async () => {
    try {
        await db.healthcheck();
        console.log(`Connected to MySQL database "${DB_CONFIG.database}"`);
    } catch (err) {
        console.error('Database connection failed:', formatDbError(err));
    }
})();

module.exports = db;
