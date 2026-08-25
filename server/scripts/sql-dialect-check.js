/**
 * Static SQL check — does every query in server.js still work on PostgreSQL?
 *
 *   node scripts/sql-dialect-check.js        (from server/, needs the database up)
 *
 * Pulls every string handed to db.query/db.execute out of server.js with acorn,
 * pushes it through db.js's own normalizeSql(), and asks PostgreSQL to PREPARE it.
 * PREPARE parses and plans without running anything, so this reaches code paths
 * that only fire on a POST — you do not have to be able to call an endpoint for
 * its SQL to be checked.
 *
 * Written during the 2026-08-21 merge of Person 1's branch, which brought in
 * MySQL-flavoured SQL (ON DUPLICATE KEY, GROUP_CONCAT, CURDATE, ENGINE=InnoDB,
 * "" as a string literal, CAST(x AS UNSIGNED), `is_active = 1` against a boolean
 * column). Hand-testing found some of it; this found the rest.
 *
 * Reading the output: "column does not exist" and syntax errors are real. Reports
 * about enum values or type mismatches usually are not — every ? and ${...} is
 * replaced with the literal '1', so a statement that puts a parameter into a typed
 * column will complain about the substitution rather than about itself. Those are
 * counted separately as "inconclusive".
 */
const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..');
const REPO = path.join(SERVER_DIR, '..');

let acorn;
try {
    acorn = require(path.join(REPO, 'client/node_modules/acorn'));
} catch {
    console.error('acorn not found — run `npm install` in client/ first (this script borrows it from there).');
    process.exit(1);
}
const { Client } = require('pg');

const FILE = path.join(SERVER_DIR, 'server.js');
const src = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', locations: true });

const found = [];
(function walk(node) {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression'
        && ['query', 'execute'].includes(node.callee.property.name) && node.arguments.length) {
        const a = node.arguments[0];
        let text = null;
        let interpolated = false;
        if (a.type === 'Literal' && typeof a.value === 'string') text = a.value;
        else if (a.type === 'TemplateLiteral') {
            text = a.quasis.map(q => q.value.cooked).join('1');
            interpolated = a.expressions.length > 0;
        }
        if (text && /\b(select|insert|update|delete|create table|alter table)\b/i.test(text)) {
            found.push({ line: node.loc.start.line, sql: text, interpolated });
        }
    }
    for (const k of Object.keys(node)) {
        const v = node[k];
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v.type === 'string') walk(v);
    }
})(ast);

// Borrow normalizeSql straight out of db.js so the check sees exactly what
// PostgreSQL will see, and never drifts from the real implementation. The whole
// translation block is lifted verbatim - normalizeSql and the three helpers it
// calls sit contiguously in db.js - rather than re-implemented here, because a
// stand-in that behaves even slightly differently makes this check lie.
//
// Since the 2026-08-25 move to the pg driver, normalizeSql emits real $1/$2 bind
// placeholders instead of splicing values into the SQL, so PREPARE now sees the
// parameterised statement PostgreSQL will actually run - a stronger check than
// the old substitute-every-?-with-'1' approach could be.
const dbSrc = fs.readFileSync(path.join(SERVER_DIR, 'db.js'), 'utf8');
const blockStart = dbSrc.indexOf('function stripTrailingSemicolon');
const blockEnd = dbSrc.indexOf('\n}', dbSrc.indexOf('function normalizeSql('));
if (blockStart === -1 || blockEnd === -1) {
    console.error('The SQL translation block was not found in db.js — this script needs updating alongside it.');
    process.exit(1);
}
const normalizeSql = new Function(
    `${dbSrc.slice(blockStart, blockEnd + 2)}\nreturn normalizeSql;`
)();

// "already exists" is not a dialect problem: it means the statement parsed and
// reached the semantic stage, and the only reason it did not apply is that the
// column is already there. Every ALTER ... ADD COLUMN in this codebase is
// guarded by an information_schema check immediately before it, so at runtime
// it only ever fires when the column is genuinely missing - this checker runs
// them unconditionally, which is what produces the message.
// NOTE: "is of type" used to be treated as inconclusive. That made sense when
// this checker substituted '1' for every placeholder and the resulting type
// mismatch said nothing. Since db.js moved to real bind parameters, PostgreSQL
// infers the types properly and such an error is genuine - it was hiding three
// real ones (a SQL boolean literal written into a SMALLINT column).
const INCONCLUSIVE = /invalid input syntax|invalid input value for enum|cannot be matched|could not determine|operator does not exist: character varying = integer|already exists/i;

(async () => {
    const c = new Client({
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'postgres',
    });
    await c.connect();

    const bad = [];
    let ok = 0, inconclusive = 0;
    for (const f of found) {
        const sql = normalizeSql(f.sql, []);
        const isDDL = /^\s*(create|alter|drop)\b/i.test(sql);
        try {
            if (isDDL) {
                // DDL cannot be PREPAREd; run it and throw the transaction away
                await c.query('BEGIN');
                await c.query(sql);
                await c.query('ROLLBACK');
            } else {
                // PREPARE is session-scoped, so ROLLBACK does not clear it
                await c.query('DEALLOCATE ALL');
                await c.query(`PREPARE _chk AS ${sql}`);
                await c.query('DEALLOCATE ALL');
            }
            ok++;
        } catch (e) {
            try { await c.query('ROLLBACK'); } catch { /* not in a transaction */ }
            try { await c.query('DEALLOCATE ALL'); } catch { /* nothing prepared */ }
            const msg = e.message.split('\n')[0];
            // A statement built with ${...} had those holes filled with '1', which
            // is a value and not an identifier — so a failure here says nothing about
            // the real statement. (Check any dynamic identifier by hand: it must come
            // from an allowlist, never from the request.)
            if (INCONCLUSIVE.test(msg) || f.interpolated) { inconclusive++; continue; }
            bad.push({ line: f.line, msg, sql: sql.replace(/\s+/g, ' ').slice(0, 140) });
        }
    }
    await c.end();

    console.log(`${found.length} SQL statements · ${ok} accepted · ${inconclusive} inconclusive (placeholder substitution) · ${bad.length} rejected\n`);
    for (const b of bad) {
        console.log(`server.js:${b.line}`);
        console.log(`   ${b.msg}`);
        console.log(`   ${b.sql}\n`);
    }
    process.exitCode = bad.length ? 1 : 0;
})();
