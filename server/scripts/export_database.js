import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportDatabase() {
    console.log('🚀 กำลังเริ่ม Export ข้อมูลทั้งหมดจากฐานข้อมูล PostgreSQL...');
    const outputFile = path.resolve(__dirname, '../../pysim_database_backup_2026-08-25.sql');
    const stream = fs.createWriteStream(outputFile, { encoding: 'utf8' });

    const now = new Date().toISOString();
    stream.write(`-- ========================================================\n`);
    stream.write(`-- PySim Database Backup (PostgreSQL)\n`);
    stream.write(`-- Export Date: ${now}\n`);
    stream.write(`-- Host: localhost:5432\n`);
    stream.write(`-- Database: postgres\n`);
    stream.write(`-- ========================================================\n\n`);
    stream.write(`SET statement_timeout = 0;\n`);
    stream.write(`SET lock_timeout = 0;\n`);
    stream.write(`SET client_encoding = 'UTF8';\n`);
    stream.write(`SET standard_conforming_strings = on;\n\n`);

    // 1. Fetch all BASE TABLES
    const [tables] = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name ASC
    `);

    console.log(`📋 ตารางที่พบ (${tables.length} ตาราง):`, tables.map(t => t.table_name).join(', '));

    // Disable triggers / constraints during import
    stream.write(`-- Disable foreign key checks / triggers during data restore\n`);
    stream.write(`SET session_replication_role = 'replica';\n\n`);

    for (const { table_name } of tables) {
        console.log(`⏳ กำลัง Dump ตาราง: "${table_name}"...`);

        // DDL: Fetch columns for this table
        const [columns] = await db.query(`
            SELECT 
                column_name, 
                data_type, 
                udt_name,
                is_nullable, 
                column_default,
                character_maximum_length
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = ?
            ORDER BY ordinal_position ASC
        `, [table_name]);

        // Primary Keys
        const [pkRows] = await db.query(`
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = 'public'
              AND tc.table_name = ?
        `, [table_name]);

        const pkCols = pkRows.map(r => `"${r.column_name}"`);

        stream.write(`-- --------------------------------------------------------\n`);
        stream.write(`-- Table structure for: "${table_name}"\n`);
        stream.write(`-- --------------------------------------------------------\n`);
        stream.write(`DROP TABLE IF EXISTS "${table_name}" CASCADE;\n`);
        stream.write(`CREATE TABLE "${table_name}" (\n`);

        const colDefs = columns.map(c => {
            let def = `    "${c.column_name}" `;
            
            // Format data type
            if (c.data_type === 'character varying') {
                def += c.character_maximum_length ? `VARCHAR(${c.character_maximum_length})` : 'VARCHAR(255)';
            } else if (c.data_type === 'character') {
                def += c.character_maximum_length ? `CHAR(${c.character_maximum_length})` : 'CHAR(1)';
            } else if (c.data_type === 'USER-DEFINED') {
                def += c.udt_name;
            } else if (c.data_type === 'ARRAY') {
                def += `${c.udt_name.replace(/^_/, '')}[]`;
            } else {
                def += c.data_type.toUpperCase();
            }

            if (c.column_default) {
                def += ` DEFAULT ${c.column_default}`;
            }

            if (c.is_nullable === 'NO') {
                def += ' NOT NULL';
            }

            return def;
        });

        if (pkCols.length > 0) {
            colDefs.push(`    PRIMARY KEY (${pkCols.join(', ')})`);
        }

        stream.write(colDefs.join(',\n') + '\n);\n\n');

        // DML: Dump data rows
        const [rows] = await db.query(`SELECT * FROM "${table_name}"`);
        if (rows && rows.length > 0) {
            console.log(`   + บันทึกข้อมูล ${rows.length} แถว ใน "${table_name}"`);
            const colNames = columns.map(c => `"${c.column_name}"`).join(', ');
            
            stream.write(`-- Dumping data for: "${table_name}" (${rows.length} rows)\n`);
            
            for (let i = 0; i < rows.length; i += 100) {
                const chunk = rows.slice(i, i + 100);
                const valuesClauses = chunk.map(row => {
                    const vals = columns.map(col => {
                        const v = row[col.column_name];
                        if (v === null || v === undefined) return 'NULL';
                        if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
                        if (typeof v === 'number') return v;
                        if (typeof v === 'object') {
                            if (v instanceof Date) {
                                return `'${v.toISOString().replace('T', ' ').replace('Z', '')}'`;
                            }
                            return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
                        }
                        // String escaping
                        const str = String(v).replace(/'/g, "''");
                        return `'${str}'`;
                    });
                    return `(${vals.join(', ')})`;
                });

                stream.write(`INSERT INTO "${table_name}" (${colNames}) VALUES\n${valuesClauses.join(',\n')};\n\n`);
            }
        }
    }

    // 2. Fetch all VIEWS
    const [views] = await db.query(`
        SELECT table_name, view_definition
        FROM information_schema.views
        WHERE table_schema = 'public'
        ORDER BY table_name ASC
    `);

    if (views && views.length > 0) {
        console.log(`📋 Views ที่พบ (${views.length} views):`, views.map(v => v.table_name).join(', '));
        stream.write(`-- ========================================================\n`);
        stream.write(`-- Database Views\n`);
        stream.write(`-- ========================================================\n\n`);

        for (const v of views) {
            stream.write(`-- View: "${v.table_name}"\n`);
            stream.write(`CREATE OR REPLACE VIEW "${v.table_name}" AS\n${v.view_definition};\n\n`);
        }
    }

    // 3. Reset Sequences to MAX(id)
    stream.write(`-- ========================================================\n`);
    stream.write(`-- Reset Sequences to prevent ID collision\n`);
    stream.write(`-- ========================================================\n`);
    for (const { table_name } of tables) {
        const [seqCols] = await db.query(`
            SELECT column_name, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' 
              AND table_name = ?
              AND column_default LIKE 'nextval(%'
        `, [table_name]);

        for (const col of seqCols) {
            stream.write(`SELECT setval(pg_get_serial_sequence('"${table_name}"', '${col.column_name}'), COALESCE(MAX("${col.column_name}"), 1)) FROM "${table_name}";\n`);
        }
    }

    stream.write(`\n-- Re-enable triggers and foreign keys\n`);
    stream.write(`SET session_replication_role = 'default';\n`);
    stream.write(`-- ========================================================\n`);
    stream.write(`-- Backup Complete!\n`);
    stream.write(`-- ========================================================\n`);

    stream.end();

    console.log(`\n🎉 สำเร็จ! บันทึกไฟล์ฐานข้อมูลเรียบร้อยแล้ว:`);
    console.log(`📁 ไฟล์: ${outputFile}`);
    process.exit(0);
}

exportDatabase().catch(err => {
    console.error('❌ เกิดข้อผิดพลาดในการ Export:', err);
    process.exit(1);
});
