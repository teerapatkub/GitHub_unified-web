require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DEFAULT_DUMP_PATH = path.join(ROOT_DIR, 'python_coder_game (2).sql');
const OUTPUT_PATH = path.join(__dirname, 'generated_postgres_migration.sql');

const config = {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'FullProjectPython',
};

const normalizeIdentifierList = (raw) => raw
    .split(',')
    .map((part) => `"${part.replace(/`/g, '').trim()}"`)
    .join(', ');

const convertColumnType = (line, tableName, autoColumns) => {
    const columnMatch = line.match(/^\s*`([^`]+)`\s+(.+?)(,?)\s*$/);
    if (!columnMatch) return null;

    const [, columnName, rawDefinition, comma] = columnMatch;
    let definition = rawDefinition;

    if (autoColumns.get(tableName) === columnName) {
        definition = definition.replace(/\bint\(\d+\)\b/i, 'SERIAL');
    }

    definition = definition
        .replace(/\bint\(\d+\)\b/gi, 'integer')
        .replace(/\btinyint\(\d+\)\b/gi, 'integer')
        .replace(/\blongtext\b/gi, 'text')
        .replace(/\bmediumtext\b/gi, 'text')
        .replace(/\bdatetime\b/gi, 'timestamp')
        .replace(/\bdouble\b/gi, 'double precision')
        .replace(/\benum\s*\(([^)]+)\)/gi, 'varchar(50)')
        .replace(/\bAUTO_INCREMENT\b/gi, '')
        .replace(/\bUNSIGNED\b/gi, '')
        .replace(/\s+CHARACTER\s+SET\s+\w+/gi, '')
        .replace(/\s+COLLATE\s+[\w_]+/gi, '')
        .replace(/\s+ON\s+UPDATE\s+current_timestamp\(\)/gi, '')
        .replace(/current_timestamp\(\)/gi, 'CURRENT_TIMESTAMP')
        .trim();

    return `  "${columnName}" ${definition}${comma}`;
};

const convertCreateTable = (match, autoColumns) => {
    const tableName = match[1];
    const body = match[2];
    const columnLines = body
        .split(/\r?\n/)
        .map((line) => convertColumnType(line, tableName, autoColumns))
        .filter(Boolean)
        .map((line, index, lines) => (index === lines.length - 1 ? line.replace(/,\s*$/, '') : line));

    return `DROP TABLE IF EXISTS "${tableName}" CASCADE;\nCREATE TABLE "${tableName}" (\n${columnLines.join('\n')}\n);\n`;
};

const convertIndexes = (dump) => {
    const statements = [];
    const alterRegex = /ALTER TABLE `([^`]+)`\s+([\s\S]*?);/g;
    let match;

    while ((match = alterRegex.exec(dump)) !== null) {
        const tableName = match[1];
        const body = match[2];

        const primaryMatch = body.match(/ADD PRIMARY KEY \(([^)]+)\)/i);
        if (primaryMatch) {
            statements.push(`ALTER TABLE "${tableName}" ADD PRIMARY KEY (${normalizeIdentifierList(primaryMatch[1])});`);
        }

        const uniqueRegex = /ADD UNIQUE KEY `([^`]+)` \(([^)]+)\)/gi;
        let uniqueMatch;
        while ((uniqueMatch = uniqueRegex.exec(body)) !== null) {
            statements.push(`CREATE UNIQUE INDEX IF NOT EXISTS "${uniqueMatch[1]}" ON "${tableName}" (${normalizeIdentifierList(uniqueMatch[2])});`);
        }

        const indexRegex = /ADD KEY `([^`]+)` \(([^)]+)\)/gi;
        let indexMatch;
        while ((indexMatch = indexRegex.exec(body)) !== null) {
            statements.push(`CREATE INDEX IF NOT EXISTS "${indexMatch[1]}" ON "${tableName}" (${normalizeIdentifierList(indexMatch[2])});`);
        }
    }

    return statements;
};

const convertInsert = (statement) => statement
    .replace(/`([^`]+)`/g, '"$1"')
    .replace(/\bNULL\b/g, 'NULL');

const convertDump = (dump) => {
    const autoColumns = new Map();
    const autoRegex = /ALTER TABLE `([^`]+)`\s+MODIFY `([^`]+)` int\(\d+\) NOT NULL AUTO_INCREMENT/gi;
    let autoMatch;
    while ((autoMatch = autoRegex.exec(dump)) !== null) {
        autoColumns.set(autoMatch[1], autoMatch[2]);
    }

    const createStatements = [];
    const createRegex = /CREATE TABLE `([^`]+)` \(([\s\S]*?)\)\s*ENGINE=.*?;/g;
    let createMatch;
    while ((createMatch = createRegex.exec(dump)) !== null) {
        createStatements.push(convertCreateTable(createMatch, autoColumns));
    }

    const insertStatements = [];
    const insertRegex = /INSERT INTO `[^`]+`[\s\S]*?;/g;
    let insertMatch;
    while ((insertMatch = insertRegex.exec(dump)) !== null) {
        insertStatements.push(convertInsert(insertMatch[0]));
    }

    const indexStatements = convertIndexes(dump);
    const sequenceStatements = [];
    for (const [tableName, columnName] of autoColumns.entries()) {
        sequenceStatements.push(
            `SELECT setval(pg_get_serial_sequence('"${tableName}"', '${columnName}'), GREATEST(COALESCE((SELECT MAX("${columnName}") FROM "${tableName}"), 0), 1), true);`
        );
    }

    return [
        'BEGIN;',
        'SET client_encoding = \'UTF8\';',
        'SET standard_conforming_strings = off;',
        ...createStatements,
        ...insertStatements,
        ...indexStatements,
        ...sequenceStatements,
        'COMMIT;',
        '',
    ].join('\n\n');
};

const ensureDatabase = async () => {
    const adminClient = new Client({ ...config, database: 'postgres' });
    await adminClient.connect();
    try {
        const { rows } = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [config.database]);
        if (rows.length === 0) {
            await adminClient.query(`CREATE DATABASE "${config.database}"`);
            console.log(`Created database "${config.database}"`);
        }
    } finally {
        await adminClient.end();
    }
};

const runMigration = async (sql) => {
    const client = new Client(config);
    await client.connect();
    try {
        await client.query(sql);
    } finally {
        await client.end();
    }
};

const main = async () => {
    const dumpPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_DUMP_PATH;
    if (!fs.existsSync(dumpPath)) {
        throw new Error(`SQL dump not found: ${dumpPath}`);
    }

    const dump = fs.readFileSync(dumpPath, 'utf8');
    const converted = convertDump(dump);
    fs.writeFileSync(OUTPUT_PATH, converted, 'utf8');

    await ensureDatabase();
    await runMigration(converted);
    console.log(`Migrated ${path.basename(dumpPath)} to PostgreSQL database "${config.database}"`);
    console.log(`Generated SQL: ${OUTPUT_PATH}`);
};

main().catch((error) => {
    console.error('Migration failed:', error.message);
    process.exit(1);
});
