// server/db.js — PostgreSQL access layer with a MySQL-compatible surface.
//
// Every call site in server.js was written against mysql2's shape:
//   const [rows]   = await db.query('SELECT ... WHERE id = ?', [id]);
//   const [result] = await db.execute('INSERT ...', [...]);   // result.insertId
//   const conn     = await db.getConnection();                // beginTransaction/commit/rollback/release
// so this module keeps that surface exactly, and translates MySQL SQL to
// Postgres on the way through.
//
// The transport is the `pg` driver, adopted from Person 2's branch during the
// 2026-08-25 three-way merge, replacing a hand-written implementation of the
// Postgres wire protocol that had grown here. Two things that implementation
// could not do are the reason for the switch:
//
//   * It had no connection pool - every query opened and tore down its own TCP
//     connection and SASL handshake.
//   * It could not use bind parameters. Values were escaped and spliced into
//     the SQL string as literals, which is both a standing injection risk and
//     the root of a whole family of type bugs: JS booleans had to render as
//     1/0, so no column in this schema could be a real BOOLEAN, and a blanket
//     TRUE->1 rewrite once corrupted JSON inside a seed string.
//
// Values now travel out-of-band as real bind parameters, so that entire class
// of problem is gone. Two compatibility shims below preserve the exact
// behaviour the rest of the codebase already depends on - read their comments
// before removing either.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { Pool, types } = require('pg');

// pg returns int8 and numeric as STRINGS, because they can exceed the range a
// JS number represents exactly. The previous layer converted them to numbers,
// and callers rely on that: `COUNT(*)` comes back as int8, and code like
// `remaining > 0` or `total - used` would silently do string comparison and
// concatenation instead of arithmetic. Nothing in this schema stores integers
// beyond 2^53, so converting is safe here.
types.setTypeParser(20, (value) => (value === null ? null : Number(value)));   // int8
types.setTypeParser(1700, (value) => (value === null ? null : Number(value))); // numeric

// `timestamp without time zone` is read back as UTC, not as this machine's
// local time.
//
// PostgreSQL runs here with TimeZone = Etc/UTC, so every value written by
// `current_timestamp` - which is how this schema fills its 54 plain timestamp
// columns - holds UTC wall-clock digits. pg's default parser for this type
// builds a JS Date from those digits as if they were local, so on a UTC+7
// machine every timestamp came back seven hours in the past.
//
// It surfaced as a mode nobody could play: Competitive Arena measures how long
// a player has held a challenge by subtracting `accepted_at` from now, against
// a 300-second limit. A seven-hour head start meant the first submission was
// always ruled "time expired", scored 0, and never reached the AI review.
//
// Fixed here rather than at each call site because all 54 columns share the
// fault, and the ones nobody has tested yet would keep it. `timestamptz`
// columns already round-trip correctly and are untouched. Anything writing a
// JS Date into one of these columns must write UTC too, which is what an ISO
// string with a Z does.
types.setTypeParser(1114, (value) => {
    if (value === null) return null;
    // '2026-08-25 10:15:52.673' -> '2026-08-25T10:15:52.673Z'
    return new Date(`${String(value).replace(' ', 'T')}Z`);
});

const DB_CONFIG = {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: String(process.env.PGPASSWORD ?? 'postgres'),
    database: process.env.PGDATABASE || 'postgres',
    max: Number(process.env.DB_CONNECTION_LIMIT || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

// Errors that mean "the connection died", not "the query was wrong". Only these
// are worth rebuilding the pool and retrying once for.
const RECOVERABLE_ERROR_CODES = new Set([
    'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT',
    '57P01', '57P02', '57P03', '53300', '08000', '08003', '08006',
]);

const isRecoverableError = (error) => {
    if (!error) return false;
    if (RECOVERABLE_ERROR_CODES.has(error.code)) return true;
    const message = String(error.message || '').toUpperCase();
    return message.includes('ECONNRESET') || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT');
};

const formatDbError = (error) => {
    if (!error) return 'Unknown database error';
    if (typeof error.message === 'string' && error.message.trim()) return error.message;
    if (typeof error.code === 'string' && error.code.trim()) return `Database error (${error.code})`;
    try { return JSON.stringify(error); } catch { return String(error); }
};

let pool = null;
let poolInitPromise = null;

const ensurePool = async () => {
    if (pool) return pool;
    if (!poolInitPromise) {
        poolInitPromise = (async () => {
            const nextPool = new Pool(DB_CONFIG);
            // An idle client erroring out must not take the process down.
            nextPool.on('error', (err) => {
                console.warn('[db] idle client error:', formatDbError(err));
            });
            await nextPool.query('SELECT 1');
            pool = nextPool;
            return pool;
        })().finally(() => { poolInitPromise = null; });
    }
    return poolInitPromise;
};

const closePool = async () => {
    if (!pool) return;
    try { await pool.end(); } catch { /* already going away */ }
    finally { pool = null; }
};

// ---------------------------------------------------------------------------
// SQL translation
// ---------------------------------------------------------------------------

function stripTrailingSemicolon(sql) {
    return sql.replace(/;\s*$/, '');
}

// `?` -> `$1, $2, ...`, skipping anything inside a string literal or a
// dollar-quoted block, so a question mark that is part of DATA is left alone.
function replaceMysqlPlaceholders(sql) {
    let index = 0;
    let out = '';
    let quote = null;
    let dollarQuote = null;

    for (let i = 0; i < sql.length; i += 1) {
        const ch = sql[i];
        const next = sql[i + 1];

        if (dollarQuote) {
            if (sql.startsWith(dollarQuote, i)) {
                out += dollarQuote;
                i += dollarQuote.length - 1;
                dollarQuote = null;
            } else {
                out += ch;
            }
            continue;
        }

        if (!quote && ch === '$') {
            const match = sql.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
            if (match) {
                dollarQuote = match[0];
                out += dollarQuote;
                i += dollarQuote.length - 1;
                continue;
            }
        }

        if (quote) {
            out += ch;
            if (ch === quote && next === quote) { out += next; i += 1; }
            else if (ch === quote) { quote = null; }
            continue;
        }

        if (ch === '\'' || ch === '"') { quote = ch; out += ch; continue; }

        if (ch === '?') { index += 1; out += `$${index}`; continue; }

        out += ch;
    }

    return out;
}

// MySQL's `KEY foo (...)` inside CREATE TABLE has no Postgres equivalent inline;
// UNIQUE KEY becomes a named constraint, plain KEY is dropped (it is only an index).
const transformCreateTableIndexes = (sql) =>
    sql
        .split('\n')
        .filter((line) => !/^\s*KEY\s+/i.test(line))
        .map((line) => {
            const named = line.match(/^(\s*)UNIQUE\s+KEY\s+"?([A-Za-z0-9_]+)"?\s*\((.+)\)(,?)\s*$/i);
            if (named) return `${named[1]}CONSTRAINT "${named[2]}" UNIQUE (${named[3]})${named[4]}`;
            const anon = line.match(/^(\s*)UNIQUE\s+KEY\s*\((.+)\)(,?)\s*$/i);
            if (anon) return `${anon[1]}UNIQUE (${anon[2]})${anon[3]}`;
            return line;
        })
        .join('\n')
        .replace(/,\s*\)/g, '\n)');

function normalizeSql(sql) {
    let out = String(sql || '').trim();

    // MySQL admin statements that have no meaning here but are cheap to satisfy.
    if (/^SELECT\s+GET_LOCK\s*\(/i.test(out)) return 'SELECT 1 AS lock_result';
    if (/^SELECT\s+RELEASE_LOCK\s*\(/i.test(out)) return 'SELECT 1 AS release_result';
    if (/^SHOW\s+TABLES/i.test(out)) {
        return "SELECT tablename AS table_name FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename";
    }

    out = out
        .replace(/`([^`]+)`/g, '"$1"')
        .replace(/\bDATABASE\s*\(\s*\)/gi, "'public'")
        .replace(/table_schema\s*=\s*current_database\s*\(\s*\)/gi, "table_schema = 'public'")
        .replace(/\bNOW\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP')
        .replace(/\bCURDATE\s*\(\s*\)/gi, 'CURRENT_DATE')
        .replace(/\bcurrent_timestamp\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP')
        // A parameterised interval cannot be spliced into an INTERVAL literal;
        // multiplying a unit interval is the portable form.
        .replace(/\bDATE_ADD\s*\(\s*CURRENT_TIMESTAMP\s*,\s*INTERVAL\s+\?\s+HOUR\s*\)/gi,
            "(CURRENT_TIMESTAMP + (? * INTERVAL '1 hour'))")
        // Everything else: Postgres wants the interval as a quoted literal.
        .replace(
            /\bDATE_(ADD|SUB)\s*\(\s*([^,()]+(?:\([^()]*\))?)\s*,\s*INTERVAL\s+(\d+)\s+(SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR)S?\s*\)/gi,
            (_m, op, expr, n, unit) =>
                `(${expr.trim()} ${op.toUpperCase() === 'ADD' ? '+' : '-'} INTERVAL '${n} ${unit.toLowerCase()}s')`)
        // MySQL's CAST(x AS UNSIGNED) yields the leading digits of a string and 0
        // when there are none - mini_game_exercises.exercise_order ('1A', 'START')
        // is sorted with it. A plain ::bigint would raise on 'START' instead.
        .replace(
            /\bCAST\s*\(\s*([^()]+?)\s+AS\s+(?:UNSIGNED|SIGNED)(?:\s+INTEGER)?\s*\)/gi,
            (_m, expr) => `COALESCE(NULLIF(substring((${expr.trim()})::text from '^[0-9]+'), '')::bigint, 0)`)
        .replace(
            /SUBSTRING_INDEX\s*\(\s*GROUP_CONCAT\s*\(\s*([A-Za-z0-9_."()]+)\s+ORDER\s+BY\s+([A-Za-z0-9_."()]+)\s+DESC\s+SEPARATOR\s+'([^']*)'\s*\)\s*,\s*'([^']*)'\s*,\s*1\s*\)/gi,
            "split_part(string_agg($1::text, '$3' ORDER BY $2 DESC), '$4', 1)")
        .replace(/\bJSON_ARRAY\s*\(/gi, 'json_build_array(')
        .replace(/\bjson_valid\s*\(\s*([^)]+)\s*\)/gi, '$1 IS NOT NULL')
        // Column types and table options.
        // TINYINT(1) becomes SMALLINT, never BOOLEAN: the existing schema stores
        // every flag as 0/1 and server.js compares them with `= 1`. Postgres will
        // not implicitly cast an integer to boolean, so a BOOLEAN column here
        // breaks `WHERE is_active = 1` outright.
        .replace(/\bTINYINT\s*\(\s*1\s*\)/gi, 'SMALLINT')
        .replace(/\bINT\s*\(\s*\d+\s*\)/gi, 'INTEGER')
        .replace(/\bVARCHAR\s*\(\s*(\d+)\s*\)/gi, 'VARCHAR($1)')
        .replace(/\bLONGTEXT\b/gi, 'TEXT')
        .replace(/\bDATETIME\b/gi, 'TIMESTAMP')
        .replace(/\benum\s*\(([^)]+)\)/gi, 'varchar(50)')
        .replace(/\s+AFTER\s+"?[a-zA-Z_][a-zA-Z0-9_]*"?/gi, '')
        .replace(/\bON\s+UPDATE\s+CURRENT_TIMESTAMP\b/gi, '')
        .replace(/\s+ENGINE\s*=\s*\w+/gi, '')
        .replace(/\s+DEFAULT\s+CHARSET\s*=\s*\w+/gi, '')
        .replace(/\s+COLLATE\s*=\s*\w+/gi, '')
        .replace(/\s+COLLATE\s+\w+/gi, '')
        .replace(/\s+CHARACTER\s+SET\s+\w+/gi, '')
        .replace(/,\s*(?:UNIQUE\s+)?KEY\s+"?[a-zA-Z_][a-zA-Z0-9_]*"?\s*\([^)]*\)/gi, '')
        .replace(/\bAUTO_INCREMENT\b/gi, 'GENERATED BY DEFAULT AS IDENTITY')
        // MySQL upsert -> Postgres upsert. The whole UPDATE body goes with it,
        // so there is deliberately no rule rewriting `VALUES(col)` to
        // `EXCLUDED.col`: such a rule cannot tell that form apart from an
        // ordinary single-column `INSERT ... VALUES (x)` and would corrupt it.
        .replace(/\s+ON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*?(?=;|$)/gi, ' ON CONFLICT DO NOTHING');

    if (/^\s*CREATE\s+TABLE/i.test(out)) out = transformCreateTableIndexes(out);

    // Callers read `result.insertId` after an INSERT; without RETURNING there is
    // nothing to read it from.
    if (/^\s*INSERT\s+INTO\b/i.test(out) && !/\bRETURNING\b/i.test(out)) {
        out = `${stripTrailingSemicolon(out)} RETURNING *`;
    }

    return replaceMysqlPlaceholders(out);
}

// The old layer serialised parameters itself. Two of its conversions have to be
// kept or working code changes meaning:
//   * booleans -> 1/0, because the flag columns are SMALLINT, and pg would send
//     a real boolean that Postgres refuses to compare against them.
//   * plain objects and arrays -> JSON text. pg would otherwise encode a JS
//     array as a Postgres ARRAY ('{1,2,3}'), which is not what a jsonb or text
//     column here expects.
//
// A third was added on 2026-08-25: Date -> ISO-8601 in UTC.
//
// pg serialises a Date using the LOCAL timezone offset, and PostgreSQL drops
// that offset when the value lands in a `timestamp without time zone` column -
// so the digits stored were local wall clock, while every value written by
// `current_timestamp` was UTC. Two conventions in one column type, which only
// stayed invisible while the reader was wrong in the matching direction.
//
// Now that reads are consistently UTC (see the type parser above), writes have
// to be too. Doing it here rather than at each call site means a Date passed
// anywhere is stored as the same instant it represents - including by code
// written later that has never heard of this. Correct for `timestamptz`
// columns as well, which read the offset and keep the instant either way.
function normalizeParams(params) {
    return (Array.isArray(params) ? params : []).map((value) => {
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (value === undefined) return null;
        if (value instanceof Date) return value.toISOString();
        if (value === null || Buffer.isBuffer(value)) return value;
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
    });
}

// mysql2's return shape: SELECT gives the rows, everything else gives a summary.
function buildMysqlLikeResult(result) {
    const command = String(result.command || '').toUpperCase();
    const rows = result.rows || [];
    const fields = result.fields || [];

    if (command === 'SELECT' || command === 'SHOW') return [rows, fields];

    const summary = {
        command,
        rowCount: result.rowCount || 0,
        affectedRows: result.rowCount || 0,
        changedRows: result.rowCount || 0,
        insertId: 0,
        rows,
    };

    if (command === 'INSERT' && rows[0]) {
        const idKey = Object.keys(rows[0]).find((key) => key === 'id' || key.endsWith('_id'));
        summary.insertId = idKey ? Number(rows[0][idKey]) : 0;
    }

    return [summary, fields];
}

async function runOn(client, sql, params) {
    const text = normalizeSql(sql);
    try {
        return buildMysqlLikeResult(await client.query(text, normalizeParams(params)));
    } catch (error) {
        // The translated SQL is what actually failed, so that is what gets
        // attached - reading the original hides the rewrite that broke it.
        error.sql = text;
        error.message = formatDbError(error);
        throw error;
    }
}

const db = {
    async query(sql, params = []) {
        const attempt = async () => {
            const activePool = await ensurePool();
            return runOn(activePool, sql, params);
        };
        try {
            return await attempt();
        } catch (error) {
            if (!isRecoverableError(error)) throw error;
            console.warn('[db] recoverable error, rebuilding pool:', error.code || error.message);
            await closePool();
            await ensurePool();
            return attempt();
        }
    },

    execute(sql, params = []) {
        return this.query(sql, params);
    },

    // A transaction has to stay on ONE client, so this checks one out of the
    // pool and hands back the mysql2 connection interface over it.
    async getConnection() {
        const activePool = await ensurePool();
        const client = await activePool.connect();
        let released = false;
        return {
            query: (sql, params = []) => runOn(client, sql, params),
            execute: (sql, params = []) => runOn(client, sql, params),
            beginTransaction: () => client.query('BEGIN'),
            commit: () => client.query('COMMIT'),
            rollback: () => client.query('ROLLBACK'),
            release() {
                // server.js releases in `finally` blocks that can run after an
                // error already released; releasing twice throws in pg.
                if (released) return;
                released = true;
                client.release();
            },
        };
    },

    async healthcheck() {
        const activePool = await ensurePool();
        await activePool.query('SELECT 1');
        return true;
    },

    config: { host: DB_CONFIG.host, port: DB_CONFIG.port, database: DB_CONFIG.database, user: DB_CONFIG.user },
};

(async () => {
    try {
        const [rows] = await db.query('SELECT current_database() AS database, current_user AS user, version() AS version');
        console.log(`เชื่อมต่อ PostgreSQL สำเร็จ: ${rows[0].database} (${rows[0].user})`);

        // Initialize Arcade Battle Royale tables in PostgreSQL
        await db.query(`
            CREATE TABLE IF NOT EXISTS arcade_rooms (
                room_id SERIAL PRIMARY KEY,
                room_code VARCHAR(10) UNIQUE NOT NULL,
                room_name VARCHAR(100) NOT NULL,
                host_name VARCHAR(50) NOT NULL,
                password VARCHAR(100) DEFAULT NULL,
                max_players INTEGER DEFAULT 5,
                current_round INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'WAITING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // is_host/is_eliminated are plain INTEGER (not BOOLEAN) because normalizeSql()
        // rewrites the literal words TRUE/FALSE to 1/0 for every query including this
        // CREATE TABLE, and Postgres has no implicit int->boolean cast for a BOOLEAN
        // column's DEFAULT clause (confirmed: "column is of type boolean but default
        // expression is of type integer"). server.js already only ever reads/writes
        // these as integer 0/1 literals, so INTEGER matches actual usage exactly.
        await db.query(`
            CREATE TABLE IF NOT EXISTS arcade_participants (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES arcade_rooms(room_id) ON DELETE CASCADE,
                user_name VARCHAR(50) NOT NULL,
                is_host INTEGER DEFAULT 0,
                score INTEGER DEFAULT 0,
                cash INTEGER DEFAULT 0,
                is_eliminated INTEGER DEFAULT 0,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (room_id, user_name)
            );
        `);

        // Idempotent migration: last_seen was added after the table already
        // existed on some databases, so CREATE TABLE IF NOT EXISTS above won't
        // retrofit it — this ADD COLUMN IF NOT EXISTS closes that gap safely.
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);

        // Idempotent migration: starting cash changed from 1000 to 0 (players
        // now earn cash purely from their per-round ranking) — retrofits the
        // column default on databases created before this change. Does not
        // touch existing rows' current cash values.
        await db.query(`
            ALTER TABLE arcade_participants ALTER COLUMN cash SET DEFAULT 0;
        `);

        // Server-authoritative match state: phase/phase_deadline let
        // tickArcadeMatches() (below) drive every client's round/timer/shop
        // transitions from one shared source instead of each browser running
        // its own independent simulation. last_round_summary is the ranking/
        // cash-gain/eliminated snapshot built at each round's finalize step,
        // polled by clients to render the round-summary screen.
        await db.query(`
            ALTER TABLE arcade_rooms ADD COLUMN IF NOT EXISTS phase VARCHAR(20) DEFAULT 'LOBBY';
        `);
        await db.query(`
            ALTER TABLE arcade_rooms ADD COLUMN IF NOT EXISTS phase_deadline TIMESTAMP DEFAULT NULL;
        `);
        await db.query(`
            ALTER TABLE arcade_rooms ADD COLUMN IF NOT EXISTS last_round_summary JSONB DEFAULT NULL;
        `);

        // Phase 8.4 — per-room mode settings chosen at creation. Kept on the
        // room (not in a global constant) so a room's pacing and task source
        // stay fixed for the whole match even if the server's defaults change
        // under it, and so two rooms with different settings can run at once.
        await db.query(`
            ALTER TABLE arcade_rooms ADD COLUMN IF NOT EXISTS round_duration_mode VARCHAR(10) DEFAULT 'standard';
        `);
        await db.query(`
            ALTER TABLE arcade_rooms ADD COLUMN IF NOT EXISTS difficulty VARCHAR(10) DEFAULT 'default';
        `);

        // The four task_ids this match will use, drawn at random when the host
        // starts it and then FIXED for the rest of the match. Stored on the
        // room (rather than each client picking for itself) because the server
        // scales bot scores by the round's real test-case count while the
        // client grades the player against the same task — if the two ever
        // disagreed, bots would be scored against a problem nobody solved.
        // NULL means a legacy/standard room using the fixed built-in tasks.
        await db.query(`
            ALTER TABLE arcade_rooms ADD COLUMN IF NOT EXISTS round_task_ids JSONB DEFAULT NULL;
        `);

        // pending_round_score/has_submitted hold a real player's judged round
        // result (passCount/readability/time folded into one score, computed
        // client-side via Pyodide same as before) until tickArcadeMatches()
        // finalizes the round for everyone at once. Reset to NULL/0 at the
        // start of every round.
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS pending_round_score INTEGER DEFAULT NULL;
        `);
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS has_submitted INTEGER DEFAULT 0;
        `);
        // What the player actually submitted, kept until the round closes.
        //
        // The browser used to judge its own code and send a finished score; the
        // server could only clamp it, so anyone who could edit a request won
        // every match without writing Python. Now the browser sends only the
        // code, and finalizeArcadePhase() grades it - correctness, AI code
        // quality, and time taken from the server's own clock - when the round
        // ends. See docs/adr/0001-server-owns-the-verdict.md.
        //
        // Judging at round close rather than on arrival is deliberate: what a
        // player must do in time is SEND their code, and how long grading takes
        // is the server's problem, not theirs. Nobody loses a round to a slow
        // network.
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS submitted_code TEXT DEFAULT NULL;
        `);
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT NULL;
        `);
        // Still reported by the browser, because item effects live there and
        // nowhere else. It only ever doubles a score the server computed, and
        // moving the shop inventory server-side is its own piece of work.
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS score_multiplier_active SMALLINT DEFAULT 0;
        `);
        // The player's work IN PROGRESS, resent every few seconds while a round
        // is open. Separate from submitted_code on purpose: submitted_code is
        // the answer being graded and must never move again once written,
        // while this is a live draft that changes on every keystroke.
        //
        // It exists so a player who has already sent their answer can watch how
        // far the others have got - the spectator view is only readable by
        // someone who can no longer act on what they see (already submitted, or
        // eliminated), which is what keeps it from being a way to copy.
        //
        // It also gives a player whose connection drops mid-round something to
        // come back to.
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS draft_code TEXT DEFAULT NULL;
        `);
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS draft_updated_at TIMESTAMP DEFAULT NULL;
        `);

        // Gold this player was paid for the finished match, written once when the
        // room reaches RESULT. Stored on the participant rather than derived on the
        // client so the RESULT screen shows what was actually credited, not a
        // second guess at the reward table.
        await db.query(`
            ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS coins_awarded INTEGER DEFAULT 0;
        `);

        // Delivery queue for player-vs-player sabotage: an attacker inserts a row,
        // the target's own client polls GET /api/arcade/rooms/:id/effects and the
        // matching row is atomically marked delivered=1 so it's only applied once.
        await db.query(`
            CREATE TABLE IF NOT EXISTS arcade_effects (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES arcade_rooms(room_id) ON DELETE CASCADE,
                attacker_name VARCHAR(50) NOT NULL,
                target_name VARCHAR(50) NOT NULL,
                effect_type VARCHAR(30) NOT NULL,
                item_name VARCHAR(100),
                amount INTEGER DEFAULT NULL,
                delivered INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS arcade_tasks (
                task_id SERIAL PRIMARY KEY,
                difficulty VARCHAR(20) NOT NULL,
                title_th VARCHAR(255) NOT NULL,
                title_en VARCHAR(255) NOT NULL,
                desc_th TEXT NOT NULL,
                desc_en TEXT NOT NULL,
                initial_code TEXT NOT NULL,
                test_cases JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // starter_code is what the player actually sees in the editor, and
        // work_chars is how much of the answer they still have to type once it
        // is on screen. Added for the beginner rebalance: the editor used to
        // start everyone at a bare `pass`, which measurement on 2026-08-19
        // showed left a beginner unable to physically type 70% of the bank
        // inside Quick Mode's usable seconds. drawArcadeRoundTasks() in
        // server.js filters on work_chars so a round cannot serve a problem
        // longer than its own timer allows. Both are backfilled by the seed
        // upsert below, hence nullable rather than NOT NULL.
        // These four ALTERs only apply while arcade_tasks is still a real table -
        // i.e. on a database that has not yet run the problem-bank merge. Once
        // it has, the name is a view over problems/problem_modes, which already
        // has every one of these fields, and ALTER on a view errors out.
        const [[arcadeRel]] = await db.query(
            `SELECT c.relkind FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE n.nspname = 'public' AND c.relname = 'arcade_tasks'`
        );
        const arcadeTasksIsTable = arcadeRel?.relkind === 'r';

        if (arcadeTasksIsTable) {
        await db.query(`ALTER TABLE arcade_tasks ADD COLUMN IF NOT EXISTS starter_code TEXT;`);
        await db.query(`ALTER TABLE arcade_tasks ADD COLUMN IF NOT EXISTS work_chars INTEGER;`);

        // Per-problem hints, revealed by the aiHelper shop item. That item cost
        // 600 cash and showed ONE hardcoded sentence for all 40 problems
        // ("try using a loop or a dictionary"), so it was never worth buying.
        // Nullable: an older row falls back to that generic string rather than
        // showing the player an empty hint.
        await db.query(`ALTER TABLE arcade_tasks ADD COLUMN IF NOT EXISTS hint_th TEXT;`);
        await db.query(`ALTER TABLE arcade_tasks ADD COLUMN IF NOT EXISTS hint_en TEXT;`);
        }

        // Phase 8.3 / Step 5 — round history must outlive its room.
        //
        // It was originally created with ON DELETE CASCADE to arcade_rooms,
        // which matched its first purpose (review on the RESULT screen while
        // the room still exists). But rooms are deleted as soon as they empty,
        // so a player lost their own code the moment they left the match —
        // there was no way to look back at a past game at all. These
        // migrations drop that link and denormalize enough to identify the
        // match without the room row still being there. Retention is handled
        // by sweepArcadeRoundHistory() in server.js instead of by cascade.
        await db.query(`
            ALTER TABLE arcade_round_history DROP CONSTRAINT IF EXISTS arcade_round_history_room_id_fkey;
        `);
        await db.query(`
            ALTER TABLE arcade_round_history ADD COLUMN IF NOT EXISTS room_code VARCHAR(10);
        `);
        await db.query(`
            ALTER TABLE arcade_round_history ADD COLUMN IF NOT EXISTS room_name VARCHAR(100);
        `);
        // Stamped when the match actually finishes. Doubles as "this match is
        // complete" — rows with a NULL value belong to a match that was
        // abandoned mid-way, which the history list hides.
        await db.query(`
            ALTER TABLE arcade_round_history ADD COLUMN IF NOT EXISTS match_ended_at TIMESTAMP DEFAULT NULL;
        `);

        // The room's own settings, copied onto each history row. Rooms are
        // deleted as soon as they empty, so without this a finished match can
        // no longer say what difficulty or round length it was played at — and
        // that is exactly what a playtest needs to know before it can judge a
        // result ("2 of 4 rounds finished" means nothing until you know whether
        // it was a 30-second or a 60-second round). Same reasoning as the
        // room_code/room_name columns above.
        await db.query(`
            ALTER TABLE arcade_round_history ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20);
        `);
        await db.query(`
            ALTER TABLE arcade_round_history ADD COLUMN IF NOT EXISTS round_duration_mode VARCHAR(20);
        `);
        // The history list is always "this player's recent matches, newest
        // first", so that is what gets the index.
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_arcade_history_user ON arcade_round_history (user_name, room_id DESC);
        `);

        // Phase 8.2 — room chat and emoji reactions. One table serves both:
        // `kind` says which, and the unused column stays NULL. Cascades away
        // with its room like the other match-scoped arcade tables.
        //
        // Chat is deliberately NOT allowed during ROUND_* phases (enforced in
        // the POST endpoint, not here) — an open channel while everyone is
        // solving the same problem is an answer-sharing channel.
        await db.query(`
            CREATE TABLE IF NOT EXISTS arcade_chat_messages (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES arcade_rooms(room_id) ON DELETE CASCADE,
                user_name VARCHAR(50) NOT NULL,
                kind VARCHAR(10) NOT NULL DEFAULT 'text',
                message VARCHAR(300),
                emoji VARCHAR(16),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Clients poll for "anything newer than the last id I saw", so this
        // index keeps that lookup cheap as a room's history grows.
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_arcade_chat_room_id ON arcade_chat_messages (room_id, id);
        `);

        // Phase 8.3 — per-round record of what a real player actually submitted,
        // written by POST /rooms/:id/submit-round. Powers the "review your code"
        // panel on the RESULT screen. Match-scoped review data, so it cascades
        // away with its room exactly like arcade_participants/arcade_effects do
        // (the durable cross-match numbers live in arcade_player_stats below).
        // Bots never write here — they have no code to review, and their round
        // score is synthesized server-side rather than submitted.
        await db.query(`
            CREATE TABLE IF NOT EXISTS arcade_round_history (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES arcade_rooms(room_id) ON DELETE CASCADE,
                user_name VARCHAR(50) NOT NULL,
                round_num INTEGER NOT NULL,
                code TEXT,
                pass_count INTEGER DEFAULT 0,
                total_count INTEGER DEFAULT 0,
                quality_score INTEGER DEFAULT 0,
                time_used_seconds INTEGER DEFAULT 0,
                round_score INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (room_id, user_name, round_num)
            );
        `);

        // Phase 8.3 — durable per-player Arcade career totals, updated once per
        // match when finalizeArcadePhase() moves a room to RESULT. Deliberately
        // NOT tied to arcade_rooms: rooms are deleted as soon as they empty, and
        // these numbers have to outlive them. Keyed by user_name because that is
        // the identity the whole arcade already uses (arcade_participants has no
        // user_id column).
        await db.query(`
            CREATE TABLE IF NOT EXISTS arcade_player_stats (
                user_name VARCHAR(50) PRIMARY KEY,
                matches_played INTEGER DEFAULT 0,
                wins INTEGER DEFAULT 0,
                best_rank INTEGER DEFAULT NULL,
                total_score INTEGER DEFAULT 0,
                total_cash_earned INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Problem bank. Upserted from server/arcadeTaskSeed.js on every boot,
        // matched on title_en.
        //
        // This used to seed only when the table was completely EMPTY, which
        // meant new problems could never be added and a wrong test case could
        // never be corrected without manually wiping the table — and one was
        // wrong: "Longest Word" expected "jumps" while its own reference
        // (max(words, key=len)) returns "quick", so a correct player was
        // marked incorrect. Making this an upsert is what lets the bank grow
        // and be repaired.
        //
        // Only title/description/code/starter/work_chars/test_cases are
        // written; task_id is never reused or reordered, so existing rows keep
        // their identity.
        // Every coding problem in the project lives in `problems` + `problem_modes`
        // now, and the four old tables are read-only views over them. See
        // server/problemsSchema.js for the shape and the identity rules.
        // This runs before the Arcade seed below, because that seed now writes
        // through the new tables rather than through the `arcade_tasks` name.
        const { migrateProblems, normalizeFunctionCases } = require('./problemsSchema.js');
        const movedProblems = await migrateProblems(db);
        const movedSummary = Object.entries(movedProblems).map(([t, n]) => `${t} ${n}`).join(', ');
        if (movedSummary) {
            console.log(`\u2705 merged problem bank: ${movedSummary}`);
        }

        // The learning system's per-learner task slot, used by the Challenge and
        // Debug Lab pages. It arrived with the imported SQL dump and was never
        // part of any boot-time schema, so a database created from scratch had
        // no such table and both pages failed outright - created here so a
        // fresh deployment works.
        await db.query(`
            CREATE TABLE IF NOT EXISTS learning_ai_tasks (
                task_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                mode VARCHAR(20) NOT NULL,
                title VARCHAR(255) NOT NULL,
                section_label VARCHAR(100),
                subtitle VARCHAR(100),
                accent VARCHAR(20),
                instructions_json TEXT NOT NULL,
                example_input TEXT,
                example_output TEXT,
                starter_code TEXT NOT NULL,
                test_cases_json TEXT NOT NULL,
                reward_xp INTEGER NOT NULL DEFAULT 100,
                reward_coins INTEGER NOT NULL DEFAULT 20,
                rerolls_used INTEGER NOT NULL DEFAULT 0,
                max_rerolls INTEGER NOT NULL DEFAULT 3,
                status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
                ai_payload TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            );
        `);
        // Which problem from the bank this task was drawn from, when it came
        // from the bank rather than from the model. Two jobs: it says where a
        // task came from, and it is how the draw avoids handing the same
        // learner the same problem twice in a row.
        await db.query(`
            ALTER TABLE learning_ai_tasks ADD COLUMN IF NOT EXISTS problem_id INTEGER DEFAULT NULL;
        `);

        // Problem titles used to carry their position in the bank ("1. เลขฟีโบนัชชี").
        // Rounds draw at random from the whole bank, so the number never matched
        // anything the player could see - round 1 might open "7." and round 2
        // "3.", which reads like the game skipped six problems. Stripped in the
        // database as well as in the seed file, and stripped BEFORE the upsert
        // below: that upsert matches rows on title_en, so renaming the seed
        // alone would have found no match and inserted 40 duplicate problems.
        await db.query(
            `UPDATE problems
                SET title_th = regexp_replace(title_th, '^[0-9]+\\.[ ]*', ''),
                    title_en = regexp_replace(title_en, '^[0-9]+\\.[ ]*', ''),
                    updated_at = CURRENT_TIMESTAMP
              WHERE title_th ~ '^[0-9]+\\.' OR title_en ~ '^[0-9]+\\.'`
        );

        const { ARCADE_TASKS } = require('./arcadeTaskSeed.js');
        let inserted = 0, updated = 0;
        for (const t of ARCADE_TASKS) {
            const cases = JSON.stringify(normalizeFunctionCases(t.test_cases));
            const [existing] = await db.query(
                `SELECT m.entry_id, m.problem_id FROM problem_modes m
                   JOIN problems p ON p.problem_id = m.problem_id
                  WHERE m.mode = 'arcade' AND p.title_en = ?`,
                [t.title_en]
            );
            if (existing && existing.length > 0) {
                await db.query(
                    `UPDATE problems SET title_th = ?, desc_th = ?, desc_en = ?, solution_code = ?,
                            starter_code = ?, hint_th = ?, hint_en = ?, test_cases = ?::jsonb,
                            test_kind = 'function', updated_at = CURRENT_TIMESTAMP
                     WHERE problem_id = ?`,
                    [t.title_th, t.desc_th, t.desc_en, t.initial_code,
                     t.starter_code, t.hint_th, t.hint_en, cases, existing[0].problem_id]
                );
                await db.query(
                    `UPDATE problem_modes SET difficulty = ?, extra = ?::jsonb, updated_at = CURRENT_TIMESTAMP
                      WHERE mode = 'arcade' AND entry_id = ?`,
                    [t.difficulty, JSON.stringify({ work_chars: t.work_chars }), existing[0].entry_id]
                );
                updated += 1;
            } else {
                const [ins] = await db.query(
                    `INSERT INTO problems (title_th, title_en, desc_th, desc_en, solution_code,
                                           starter_code, hint_th, hint_en, test_kind, test_cases)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'function', ?::jsonb) RETURNING problem_id`,
                    [t.title_th, t.title_en, t.desc_th, t.desc_en, t.initial_code,
                     t.starter_code, t.hint_th, t.hint_en, cases]
                );
                const [nextRows] = await db.query(
                    `SELECT COALESCE(MAX(entry_id), 0) + 1 AS id FROM problem_modes WHERE mode = 'arcade'`
                );
                await db.query(
                    `INSERT INTO problem_modes (mode, entry_id, problem_id, difficulty, extra)
                     VALUES ('arcade', ?, ?, ?, ?::jsonb)`,
                    [Number(nextRows[0].id), ins.insertId, t.difficulty,
                     JSON.stringify({ work_chars: t.work_chars })]
                );
                inserted += 1;
            }
        }
        console.log(`✅ คลังโจทย์ Arcade พร้อมใช้งาน: เพิ่มใหม่ ${inserted} ข้อ, อัปเดต ${updated} ข้อ (รวม ${ARCADE_TASKS.length} ข้อ)`);

        await db.query(`
            CREATE TABLE IF NOT EXISTS arcade_items (
                item_id SERIAL PRIMARY KEY,
                item_code VARCHAR(50) UNIQUE NOT NULL,
                name_th VARCHAR(255) NOT NULL,
                name_en VARCHAR(255) NOT NULL,
                desc_th TEXT NOT NULL,
                desc_en TEXT NOT NULL,
                price INTEGER NOT NULL,
                icon VARCHAR(20) NOT NULL,
                type VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const [itemRows] = await db.query(`SELECT COUNT(*) as count FROM arcade_items`);
        if (!itemRows || parseInt(itemRows[0].count) === 0) {
            console.log('📌 กำลังเพิ่มข้อมูลไอเทมก่อกวน 15 ชนิด ลงใน PostgreSQL ตาราง arcade_items...');
            const SEED_ITEMS = [
                { item_code: 'inkFog', name_th: 'หมอกดำบังจอ (Ink Fog)', name_en: 'Ink Fog', price: 400, icon: '🌫️', desc_th: 'ทำให้จอพิมพ์โค้ดของเป้าหมายเบลอเป็นเวลา 15 วินาที', desc_en: 'Blurs target editor screen for 15s.', type: 'attack' },
                { item_code: 'backspaceLock', name_th: 'ล็อกปุ่มลบ (Backspace Lock)', name_en: 'Backspace Lock', price: 500, icon: '🔒', desc_th: 'เป้าหมายไม่สามารถกดลบตัวอักษรได้ 10 วินาที', desc_en: 'Disables target backspace key for 10s.', type: 'attack' },
                { item_code: 'keyScrambler', name_th: 'สลับแป้นพิมพ์ (Key Scrambler)', name_en: 'Key Scrambler', price: 450, icon: '⌨️', desc_th: 'พิมพ์แล้วตัวอักษรจะสลับตำแหน่งมั่วๆ 10 วินาที', desc_en: 'Scrambles typed keys for 10s.', type: 'attack' },
                { item_code: 'aiHelper', name_th: 'AI บอกใบ้โค้ด (AI Helper)', name_en: 'AI Helper', price: 600, icon: '🤖', desc_th: 'ขอคำแนะนำและโครงสร้างโค้ดจากระบบ Gemini AI', desc_en: 'Requests AI hint for the current task.', type: 'buff' },
                { item_code: 'screenShake', name_th: 'แผ่นดินไหว (Earthquake)', name_en: 'Earthquake', price: 300, icon: '🌋', desc_th: 'เขย่าหน้าจอกล่องเขียนโค้ดของเป้าหมายอย่างรุนแรง 8 วินาที', desc_en: 'Violently shakes target editor for 8s.', type: 'attack' },
                { item_code: 'typoGenerator', name_th: 'Glitch ก่อกวน (Glitch Injector)', name_en: 'Glitch Injector', price: 550, icon: '🐛', desc_th: 'สุ่มพิมพ์ตัวอักษรแปลกปลอมแทรกในโค้ดเป้าหมาย 10 วินาที', desc_en: 'Injects random typos into target editor.', type: 'attack' },
                { item_code: 'timeFreeze', name_th: 'หยุดเวลาแช่แข็ง (Time Freeze)', name_en: 'Time Freeze', price: 1200, icon: '❄️', desc_th: 'หยุดศัตรูทั้งหมดไม่ให้แก้ไขโค้ดได้ชั่วคราว 5 วินาที', desc_en: 'Freezes all active opponents for 5s.', type: 'aoe' },
                { item_code: 'blackout', name_th: 'ระเบิดไฟดับ (EMP Strike)', name_en: 'EMP Strike', price: 900, icon: '🔌', desc_th: 'ปิดจอของเป้าหมายทุกคนให้มืดสนิทเป็นเวลา 8 วินาที', desc_en: 'Turns off target screens completely for 8s.', type: 'aoe' },
                { item_code: 'shield', name_th: 'กำแพงไฟร์วอลล์ (Firewall)', name_en: 'Firewall Shield', price: 700, icon: '🛡️', desc_th: 'ป้องกันความเสียหายจากดีบัฟครั้งถัดไป 100%', desc_en: 'Blocks next incoming attack completely.', type: 'buff' },
                { item_code: 'cashSteal', name_th: 'โจรกรรม Survival Cash (Data Heist)', name_en: 'Data Heist', price: 600, icon: '🎭', desc_th: 'ขโมยเงิน 🪙 300 จากเป้าหมายมาเป็นของตัวเอง', desc_en: 'Steals 🪙 300 Cash from a target.', type: 'attack' },
                { item_code: 'capsLockLock', name_th: 'กับดักอักษรใหญ่ (Caps Lock Trap)', name_en: 'Caps Lock Trap', price: 350, icon: '🔠', desc_th: 'บังคับให้พิมพ์เป็นตัวอักษรพิมพ์ใหญ่ทั้งหมด 10 วินาที (เกิด NameError)', desc_en: 'Forces target to type in ALL CAPS.', type: 'attack' },
                { item_code: 'mirrorMode', name_th: 'กระจกสลับฝั่ง (Mirror Mode)', name_en: 'Mirror Mode', price: 500, icon: '🪞', desc_th: 'สะท้อนหน้าจอเขียนโค้ดกลับด้านซ้าย-ขวาเป็นเวลา 12 วินาที', desc_en: 'Horizontally flips target editor container.', type: 'attack' },
                { item_code: 'taxCollection', name_th: 'เก็บภาษีคนรวย (Tax Collector)', name_en: 'Tax Collector', price: 800, icon: '💸', desc_th: 'ขโมยเงิน 20% จากผู้เล่นที่มี Survival Cash สูงสุดมาเป็นของคุณ', desc_en: 'Steals 20% cash from wealthiest player.', type: 'buff' },
                { item_code: 'scoreMultiplier', name_th: 'ตัวคูณคะแนน 2 เท่า (Score Booster)', name_en: 'Score Booster', price: 650, icon: '⚡', desc_th: 'คูณคะแนนที่จะได้รับในรอบปัจจุบันเป็น 2 เท่าเมื่อทำโจทย์สำเร็จ', desc_en: 'Doubles current round score gain.', type: 'buff' },
                { item_code: 'screenDimmer', name_th: 'แสงจ้าหน้าจอมืด (Screen Dimmer)', name_en: 'Screen Dimmer', price: 400, icon: '🕶️', desc_th: 'หรี่แสงหน้าจอกล่องพิมพ์โค้ดของเป้าหมายให้มืดลงเหลือ 10% นาน 15 วินาที', desc_en: 'Dims target editor brightness to 10%.', type: 'attack' }
            ];

            for (const item of SEED_ITEMS) {
                await db.query(
                    `INSERT INTO arcade_items (item_code, name_th, name_en, desc_th, desc_en, price, icon, type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [item.item_code, item.name_th, item.name_en, item.desc_th, item.desc_en, item.price, item.icon, item.type]
                );
            }
            console.log('✅ บันทึกข้อมูลไอเทมก่อกวน 15 ชนิด ลงใน PostgreSQL ตาราง arcade_items เรียบร้อยแล้ว!');
        }

        console.log('✅ ตารางข้อมูล Arcade Battle Royale, Arcade Tasks และ Arcade Items ใน PostgreSQL พร้อมใช้งานแล้ว');

        // ==================================================================
        // Cosmetic sets — a theme, a profile frame and a cursor effect that
        // belong together and cost less bought as one. shop_items keeps its
        // per-item price; shop_sets holds the bundle price, so the saving is a
        // stored number rather than something the client works out.
        // ==================================================================
        await db.query(`ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS set_key VARCHAR(50);`);
        await db.query(`
            CREATE TABLE IF NOT EXISTS shop_sets (
                set_key VARCHAR(50) PRIMARY KEY,
                name_th VARCHAR(255) NOT NULL,
                name_en VARCHAR(255) NOT NULL,
                description_th TEXT,
                price INTEGER NOT NULL,
                is_active SMALLINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Individual prices total 260 per set against a 200 bundle — a 60 coin
        // saving. Calibrated against what the game pays out: an Arcade win is 50
        // coins and a lesson exercise 5-10, so a full set is roughly four wins.
        const COSMETIC_SETS = [
            {
                set_key: 'space',
                name_th: 'เซ็ตธีมอวกาศ',
                name_en: 'Space Set',
                description_th: 'ธีมเว็บลายอวกาศ กรอบโปรไฟล์ดาวเคราะห์ และเคอร์เซอร์ฝุ่นดาว',
                price: 200,
                items: [
                    {
                        item_type: 'THEME', name: 'ธีมอวกาศ', price: 120, rarity: 'RARE',
                        description: 'เปลี่ยนพื้นหลังและโทนสีทั้งเว็บเป็นห้วงอวกาศสีม่วงพาสเทล',
                        asset_url: 'http://localhost:3001/uploads/space-theme.png',
                        effects: null,
                    },
                    {
                        item_type: 'PROFILE_FRAME', name: 'กรอบดาวเคราะห์', price: 80, rarity: 'RARE',
                        description: 'กรอบวงโคจรไล่สีม่วง-ฟ้า พร้อมดาวเคราะห์และดวงดาว',
                        asset_url: 'http://localhost:3001/uploads/frame-space.svg',
                        effects: null,
                    },
                    {
                        item_type: 'MOUSE_EFFECT', name: 'ฝุ่นดาว', price: 60, rarity: 'RARE',
                        description: 'คลิกแล้วมีประกายดาวกระจายตามเมาส์',
                        asset_url: '',
                        effects: [
                            { trigger: 'click', visual: '✨', color: '#7c3aed', size: 26, duration: 800 },
                            { trigger: 'dblclick', visual: '🪐', color: '#38bdf8', size: 34, duration: 1000 },
                        ],
                    },
                ],
            },
            {
                set_key: 'sakura',
                name_th: 'เซ็ตธีมซากุระ',
                name_en: 'Sakura Set',
                description_th: 'ธีมเว็บลายซากุระ กรอบโปรไฟล์กลีบซากุระ และเคอร์เซอร์กลีบปลิว',
                price: 200,
                items: [
                    {
                        item_type: 'THEME', name: 'ธีมซากุระ', price: 120, rarity: 'RARE',
                        description: 'เปลี่ยนพื้นหลังและโทนสีทั้งเว็บเป็นสวนซากุระสีชมพู',
                        asset_url: 'http://localhost:3001/uploads/1782844342595-474510254.png',
                        effects: null,
                    },
                    {
                        item_type: 'PROFILE_FRAME', name: 'กรอบกลีบซากุระ', price: 80, rarity: 'RARE',
                        description: 'กรอบวงกลมสีชมพูประดับดอกซากุระและกิ่งไม้',
                        asset_url: 'http://localhost:3001/uploads/frame-sakura.svg',
                        effects: null,
                    },
                    {
                        item_type: 'MOUSE_EFFECT', name: 'กลีบซากุระปลิว', price: 60, rarity: 'RARE',
                        description: 'คลิกแล้วมีกลีบซากุระร่วงตามเมาส์',
                        asset_url: '',
                        effects: [
                            { trigger: 'click', visual: '🌸', color: '#ec4899', size: 26, duration: 900 },
                            { trigger: 'dblclick', visual: '🌸', color: '#f9a8d4', size: 38, duration: 1200 },
                        ],
                    },
                ],
            },
        ];

        // The Sakura theme already exists as a hand-uploaded item that a player
        // owns and has equipped. Adopt that row into the set instead of creating a
        // second identical theme and orphaning theirs. Guarded so it runs once and
        // matches nothing on a database that never had it.
        await db.query(
            `UPDATE shop_items
                SET set_key = 'sakura'
              WHERE set_key IS NULL
                AND item_type = 'THEME'
                AND asset_url LIKE '%474510254%'`
        );

        let setsSeeded = 0;
        let itemsSeeded = 0;
        for (const set of COSMETIC_SETS) {
            const [existingSet] = await db.query('SELECT set_key FROM shop_sets WHERE set_key = ?', [set.set_key]);
            if (existingSet.length === 0) {
                await db.query(
                    `INSERT INTO shop_sets (set_key, name_th, name_en, description_th, price)
                     VALUES (?, ?, ?, ?, ?)`,
                    [set.set_key, set.name_th, set.name_en, set.description_th, set.price]
                );
                setsSeeded += 1;
            }

            for (const item of set.items) {
                // A set holds exactly one item of each type, so that pair is the
                // natural key and re-running this is a no-op.
                const [existing] = await db.query(
                    'SELECT item_id FROM shop_items WHERE set_key = ? AND item_type = ? LIMIT 1',
                    [set.set_key, item.item_type]
                );
                const effects = item.effects ? JSON.stringify(item.effects) : null;
                if (existing.length > 0) {
                    await db.query(
                        `UPDATE shop_items
                            SET name = ?, description = ?, type = ?, item_type = ?, rarity = ?,
                                price = ?, asset_url = ?, effects = ?, is_active = 1, is_available = 1
                          WHERE item_id = ?`,
                        [item.name, item.description, item.item_type, item.item_type, item.rarity,
                         item.price, item.asset_url, effects, existing[0].item_id]
                    );
                } else {
                    await db.query(
                        `INSERT INTO shop_items
                            (name, description, type, item_type, rarity, price, asset_url, effects,
                             is_active, is_available, set_key)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
                        [item.name, item.description, item.item_type, item.item_type, item.rarity,
                         item.price, item.asset_url, effects, set.set_key]
                    );
                    itemsSeeded += 1;
                }
            }
        }

        // Leftover test rows: mojibake names and asset URLs pointing at a
        // localhost:5000 that no longer exists. Hidden rather than deleted so
        // nothing referencing them breaks.
        const STALE_TEST_ITEMS = `set_key IS NULL
                AND is_active = 1
                AND (asset_url LIKE '%localhost:5000%' OR name IN ('asd', 'rtt', 'ffff'))`;
        const [[staleRow]] = await db.query(`SELECT COUNT(*) AS count FROM shop_items WHERE ${STALE_TEST_ITEMS}`);
        const staleCount = Number(staleRow?.count || 0);
        if (staleCount > 0) {
            await db.query(`UPDATE shop_items SET is_active = 0, is_available = 0 WHERE ${STALE_TEST_ITEMS}`);
        }

        console.log(`✅ ร้านค้า: เซ็ตเครื่องแต่งตัว ${COSMETIC_SETS.length} เซ็ต (เพิ่มใหม่ ${setsSeeded} เซ็ต, ${itemsSeeded} ชิ้น, ซ่อนของทดสอบเก่า ${staleCount} ชิ้น)`);

        // ==================================================================
        // Achievements. The twenty rows that came with the old data were all
        // written for the developer-life simulation — paying bills, surviving
        // days, buying coffee — and that mode is gone, so none of them could
        // ever be earned again. They are rewritten here against the modes that
        // remain, and given a machine-checkable rule so the server can actually
        // award them: `metric` names a number computed per player and
        // `threshold` is what it has to reach. One evaluator handles all twenty
        // rather than twenty hand-written conditions.
        // ==================================================================
        await db.query(`ALTER TABLE achievements ADD COLUMN IF NOT EXISTS code VARCHAR(50);`);
        await db.query(`ALTER TABLE achievements ADD COLUMN IF NOT EXISTS metric VARCHAR(50);`);
        await db.query(`ALTER TABLE achievements ADD COLUMN IF NOT EXISTS threshold INTEGER;`);
        await db.query(`ALTER TABLE achievements ADD COLUMN IF NOT EXISTS is_active SMALLINT DEFAULT 1;`);
        await db.query(`ALTER TABLE achievements ADD COLUMN IF NOT EXISTS icon VARCHAR(20);`);

        // Ordered by how early a player is likely to reach them, so the profile
        // list reads as a ladder rather than a jumble.
        const ACHIEVEMENTS = [
            // --- learning -------------------------------------------------
            { id: 1,  code: 'first_lesson',      name: 'บทแรกผ่านแล้ว',      icon: '📘', metric: 'lessons_completed',   threshold: 1,   difficulty: 'Medium',    reward: 50,
              desc: 'เรียนจบบทเรียนแรก ทั้งแบบทดสอบหลังเรียนและแบบฝึกหัดครบ' },
            { id: 2,  code: 'five_lessons',      name: 'ห้าบทติด',           icon: '📗', metric: 'lessons_completed',   threshold: 5,   difficulty: 'Medium',    reward: 150,
              desc: 'เรียนจบครบ 5 บท' },
            { id: 3,  code: 'half_course',       name: 'ครึ่งทางแล้ว',        icon: '📚', metric: 'lessons_completed',   threshold: 12,  difficulty: 'Hard',      reward: 400,
              desc: 'เรียนจบครึ่งหนึ่งของหลักสูตร (12 บท)' },
            { id: 4,  code: 'all_lessons',       name: 'จบหลักสูตร',         icon: '🎓', metric: 'lessons_completed',   threshold: 24,  difficulty: 'Very Hard', reward: 2000,
              desc: 'เรียนจบครบทุกบทในหลักสูตร' },

            // --- exercises ------------------------------------------------
            { id: 5,  code: 'first_exercise',    name: 'โค้ดแรกผ่าน',        icon: '✅', metric: 'exercises_passed',    threshold: 1,   difficulty: 'Medium',    reward: 30,
              desc: 'ทำแบบฝึกหัดผ่านเป็นครั้งแรก' },
            { id: 6,  code: 'twenty_exercises',  name: 'มือขยัน',            icon: '⌨️', metric: 'exercises_passed',    threshold: 20,  difficulty: 'Medium',    reward: 200,
              desc: 'ทำแบบฝึกหัดผ่านครบ 20 ข้อ' },
            { id: 7,  code: 'sixty_exercises',   name: 'นักฝึกตัวยง',        icon: '🛠️', metric: 'exercises_passed',    threshold: 60,  difficulty: 'Hard',      reward: 700,
              desc: 'ทำแบบฝึกหัดผ่านครบ 60 ข้อ' },

            // --- quizzes --------------------------------------------------
            { id: 8,  code: 'first_perfect',     name: 'เต็มครั้งแรก',        icon: '💯', metric: 'quizzes_perfect',     threshold: 1,   difficulty: 'Medium',    reward: 80,
              desc: 'ทำแบบทดสอบหลังเรียนได้คะแนนเต็ม' },
            { id: 9,  code: 'five_perfect',      name: 'เต็มห้าครั้ง',        icon: '🏅', metric: 'quizzes_perfect',     threshold: 5,   difficulty: 'Hard',      reward: 400,
              desc: 'ทำแบบทดสอบหลังเรียนได้คะแนนเต็ม 5 บท' },

            // --- mini game ------------------------------------------------
            { id: 10, code: 'first_minigame',    name: 'เริ่มผจญภัย',        icon: '🎮', metric: 'mini_games_completed', threshold: 1,  difficulty: 'Medium',    reward: 60,
              desc: 'เล่นมินิเกมเนื้อเรื่องจบเป็นครั้งแรก' },
            { id: 11, code: 'five_minigames',    name: 'นักผจญภัย',          icon: '🗺️', metric: 'mini_games_completed', threshold: 5,  difficulty: 'Hard',      reward: 350,
              desc: 'เล่นมินิเกมเนื้อเรื่องจบครบ 5 ด่าน' },

            // --- arcade ---------------------------------------------------
            { id: 12, code: 'first_arcade',      name: 'ลงสนามครั้งแรก',      icon: '🕹️', metric: 'arcade_matches',      threshold: 1,   difficulty: 'Medium',    reward: 50,
              desc: 'เล่น Arcade Battle Royale จบหนึ่งแมตช์' },
            { id: 13, code: 'ten_arcade',        name: 'ขาประจำสนาม',        icon: '🎯', metric: 'arcade_matches',      threshold: 10,  difficulty: 'Medium',    reward: 200,
              desc: 'เล่น Arcade จบครบ 10 แมตช์' },
            { id: 14, code: 'first_win',         name: 'ชนะครั้งแรก',        icon: '🏆', metric: 'arcade_wins',         threshold: 1,   difficulty: 'Medium',    reward: 150,
              desc: 'ชนะ Arcade เป็นครั้งแรก' },
            { id: 15, code: 'ten_wins',          name: 'เจ้าสนาม',           icon: '👑', metric: 'arcade_wins',         threshold: 10,  difficulty: 'Hard',      reward: 800,
              desc: 'ชนะ Arcade ครบ 10 ครั้ง' },
            { id: 16, code: 'perfect_round',     name: 'รอบไร้ที่ติ',         icon: '⚡', metric: 'arcade_perfect_rounds', threshold: 1, difficulty: 'Hard',      reward: 300,
              desc: 'ผ่านทุก test case ในหนึ่งรอบของ Arcade' },

            // --- persistence & collection ---------------------------------
            { id: 17, code: 'streak_seven',      name: 'ต่อเนื่องเจ็ดวัน',     icon: '🔥', metric: 'streak_days',         threshold: 7,   difficulty: 'Hard',      reward: 500,
              desc: 'เข้ามาเก็บ XP ต่อเนื่องกัน 7 วัน' },
            { id: 18, code: 'level_ten',         name: 'เลเวลสิบ',           icon: '🌟', metric: 'level',               threshold: 10,  difficulty: 'Hard',      reward: 600,
              desc: 'ไต่ถึงเลเวล 10' },
            { id: 19, code: 'first_cosmetic',    name: 'แต่งตัวครั้งแรก',      icon: '🎀', metric: 'cosmetics_owned',     threshold: 1,   difficulty: 'Medium',    reward: 40,
              desc: 'ซื้อของตกแต่งจากร้านค้าชิ้นแรก' },
            { id: 20, code: 'full_set',          name: 'ครบทั้งเซ็ต',         icon: '💎', metric: 'sets_completed',      threshold: 1,   difficulty: 'Very Hard', reward: 1000,
              desc: 'มีของครบทั้งเซ็ตของธีมใดธีมหนึ่ง' },
        ];

        for (const a of ACHIEVEMENTS) {
            const [existing] = await db.query('SELECT achievement_id FROM achievements WHERE achievement_id = ?', [a.id]);
            if (existing.length > 0) {
                await db.query(
                    `UPDATE achievements
                        SET code = ?, name = ?, description = ?, difficulty = ?, reward_money = ?,
                            metric = ?, threshold = ?, icon = ?, is_active = 1
                      WHERE achievement_id = ?`,
                    [a.code, a.name, a.desc, a.difficulty, a.reward, a.metric, a.threshold, a.icon, a.id]
                );
            } else {
                await db.query(
                    `INSERT INTO achievements (achievement_id, code, name, description, difficulty,
                                               reward_money, metric, threshold, icon, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                    [a.id, a.code, a.name, a.desc, a.difficulty, a.reward, a.metric, a.threshold, a.icon]
                );
            }
        }
        // Anything beyond the twenty defined here is left over from the old
        // simulation set and can never be earned; hidden rather than deleted so
        // an old unlock row still resolves to a name.
        await db.query(
            `UPDATE achievements SET is_active = 0 WHERE achievement_id NOT IN (${ACHIEVEMENTS.map(() => '?').join(', ')})`,
            ACHIEVEMENTS.map(a => a.id)
        );
        await db.query(`ALTER TABLE achievements ADD CONSTRAINT achievements_code_key UNIQUE (code);`)
            .catch(() => { /* already present */ });

        console.log(`✅ ความสำเร็จ: ${ACHIEVEMENTS.length} รายการพร้อมเงื่อนไขที่ตรวจได้อัตโนมัติ`);

        // ==================================================================
        // The survey a new account answers straight after registering.
        //
        // What was here before could not be finished: the last question is the
        // one that decides the starting level, and the client recognised it by
        // the hardcoded id 3 — but the row that actually held it had id 1003,
        // so the branch never fired and the player was left on the final
        // question with no way forward. The questions are keyed by a stable
        // `question_key` now, and the level options live alongside the others
        // instead of in a separate level_config table joined in by UNION.
        //
        // Order matters: the preference questions come first and the experience
        // question last, because answering that one sends the player into the
        // placement test and ends the survey.
        // ==================================================================
        await db.query(`ALTER TABLE survey_questions ADD COLUMN IF NOT EXISTS question_key VARCHAR(50);`);
        await db.query(`ALTER TABLE survey_questions ADD COLUMN IF NOT EXISTS is_active SMALLINT DEFAULT 1;`);
        await db.query(`ALTER TABLE survey_questions ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;`);
        await db.query(`ALTER TABLE survey_options ADD COLUMN IF NOT EXISTS level_value INTEGER;`);
        await db.query(`ALTER TABLE survey_options ADD COLUMN IF NOT EXISTS option_key VARCHAR(50);`);

        const SURVEY = [
            {
                id: 1, key: 'goal', order: 1,
                title: 'อยากเรียน Python ไปทำอะไร?',
                description: 'เลือกเป้าหมายหลัก เราจะใช้แนะนำเนื้อหาที่ตรงกับคุณ',
                options: [
                    { id: 1, key: 'web',      text: 'พัฒนาเว็บไซต์',        desc: 'สร้างเว็บแอปพลิเคชัน' },
                    { id: 2, key: 'data',     text: 'วิเคราะห์ข้อมูล',        desc: 'Data Science และการวิเคราะห์' },
                    { id: 3, key: 'game',     text: 'สร้างเกม',            desc: 'เขียนเกมและสิ่งที่โต้ตอบได้' },
                    { id: 4, key: 'automate', text: 'เขียนสคริปต์ช่วยงาน',   desc: 'ทำงานซ้ำๆ ให้เป็นอัตโนมัติ' },
                    { id: 5, key: 'general',  text: 'ยังไม่แน่ใจ',          desc: 'อยากลองดูก่อนว่าชอบอะไร' },
                ],
            },
            {
                id: 2, key: 'style', order: 2,
                title: 'คุณเรียนรู้ได้ดีที่สุดด้วยวิธีใด?',
                description: 'เราจะจัดลำดับเนื้อหาให้เหมาะกับวิธีที่คุณถนัด',
                options: [
                    { id: 6, key: 'doing',   text: 'ลงมือเขียนโค้ดเลย',     desc: 'เรียนจากการฝึกทำจริง' },
                    { id: 7, key: 'reading', text: 'อ่านคำอธิบายก่อน',      desc: 'เข้าใจหลักการแล้วค่อยลงมือ' },
                    { id: 8, key: 'example', text: 'ดูตัวอย่างแล้วทำตาม',    desc: 'เรียนจากโค้ดตัวอย่างทีละขั้น' },
                ],
            },
            {
                id: 3, key: 'time', order: 3,
                title: 'ตั้งใจจะใช้เวลาเรียนสัปดาห์ละประมาณเท่าไร?',
                description: 'ไม่มีคำตอบผิด ใช้ตั้งเป้าหมายที่ทำได้จริง',
                options: [
                    { id: 9,  key: 'light',   text: 'ไม่เกิน 1 ชั่วโมง',   desc: 'ค่อยเป็นค่อยไป' },
                    { id: 10, key: 'medium',  text: '1–3 ชั่วโมง',         desc: 'สัปดาห์ละไม่กี่ครั้ง' },
                    { id: 11, key: 'serious', text: 'มากกว่า 3 ชั่วโมง',   desc: 'ตั้งใจเรียนจริงจัง' },
                ],
            },
            {
                // Answering this ends the survey: "never" starts at level 1, the
                // other two open the placement test.
                id: 4, key: 'experience', order: 4,
                title: 'คุณเคยเขียนโปรแกรมมาก่อนไหม?',
                description: 'ถ้าเคยมาบ้าง เราจะให้ทำแบบวัดระดับสั้นๆ เพื่อข้ามบทที่คุณรู้อยู่แล้ว',
                options: [
                    { id: 12, key: 'none',   text: 'ยังไม่เคยเลย',          desc: 'เริ่มจากบทแรก',                level: 1 },
                    { id: 13, key: 'some',   text: 'เคยเขียนภาษาอื่นมาบ้าง', desc: 'ทำแบบวัดระดับเพื่อข้ามบทพื้นฐาน', level: 10 },
                    { id: 14, key: 'python', text: 'เขียน Python ได้อยู่แล้ว', desc: 'ทำแบบวัดระดับเพื่อเริ่มที่บทสูงขึ้น', level: 10 },
                ],
            },
        ];

        for (const q of SURVEY) {
            const [existing] = await db.query('SELECT id FROM survey_questions WHERE id = ?', [q.id]);
            if (existing.length > 0) {
                await db.query(
                    `UPDATE survey_questions SET question_key = ?, title = ?, description = ?, "order" = ?, is_active = 1 WHERE id = ?`,
                    [q.key, q.title, q.description, q.order, q.id]
                );
            } else {
                await db.query(
                    `INSERT INTO survey_questions (id, question_key, title, description, "order", is_active)
                     VALUES (?, ?, ?, ?, ?, 1)`,
                    [q.id, q.key, q.title, q.description, q.order]
                );
            }

            for (let i = 0; i < q.options.length; i += 1) {
                const o = q.options[i];
                const [ex] = await db.query('SELECT id FROM survey_options WHERE id = ?', [o.id]);
                if (ex.length > 0) {
                    await db.query(
                        `UPDATE survey_options
                            SET question_id = ?, option_key = ?, option_text = ?, option_description = ?,
                                "order" = ?, level_value = ?
                          WHERE id = ?`,
                        [q.id, o.key, o.text, o.desc, i + 1, o.level ?? null, o.id]
                    );
                } else {
                    await db.query(
                        `INSERT INTO survey_options (id, question_id, option_key, option_text, option_description, "order", level_value)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [o.id, q.id, o.key, o.text, o.desc, i + 1, o.level ?? null]
                    );
                }
            }
        }

        // The leftover rows are the damaged duplicates the old import produced
        // (ids in the 1001+ range, their Thai stored as literal '?'). Hidden and
        // detached from any question rather than deleted.
        const surveyIds = SURVEY.map(q => q.id);
        const optionIds = SURVEY.flatMap(q => q.options.map(o => o.id));
        await db.query(
            `UPDATE survey_questions SET is_active = 0 WHERE id NOT IN (${surveyIds.map(() => '?').join(', ')})`,
            surveyIds
        );
        // Their options are left in place: they hang off the now-inactive
        // questions, so nothing serves them, and nothing is thrown away.
        const [[staleOpts]] = await db.query(
            `SELECT COUNT(*) AS count FROM survey_options WHERE id NOT IN (${optionIds.map(() => '?').join(', ')})`,
            optionIds
        );

        console.log(`✅ แบบสำรวจตอนสมัคร: ${SURVEY.length} คำถาม (ซ่อนคำถามเก่าที่พังไว้ พร้อมตัวเลือก ${Number(staleOpts?.count || 0)} รายการ)`);
    } catch (err) {
        console.error('เชื่อมต่อ PostgreSQL ล้มเหลว:', err.message);
    }
})();

module.exports = db;
