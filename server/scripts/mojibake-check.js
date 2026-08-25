/**
 * Is any Thai text in the source garbled?
 *
 *   node scripts/mojibake-check.js        (from server/, no DB, no server)
 *
 * A player opening the Competitive Arena saw problem titles rendered as
 * "เนเธเธ—เธขเนเธ—เธ”เธชเธญเธ 2" - the classic shape of UTF-8 bytes that were
 * once read back as CP874. It was not a browser or a database fault: the
 * garbled text was sitting in the JSX source as a string literal, written by an
 * editor that guessed the wrong encoding on save. Nothing anywhere would have
 * complained, because it is perfectly valid Thai-range Unicode - just not any
 * word.
 *
 * The test is a round trip. Take a run of non-ASCII characters, put each one
 * back as the byte(s) it would have been in CP874, and try to read the result
 * as UTF-8. Real Thai fails that (it is not CP874 to begin with); text that got
 * garbled this way succeeds and yields readable Thai, which is what gets
 * reported - along with what it was supposed to say.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SKIP_DIRS = new Set(['node_modules', '.git', '_archive', 'dist', 'build', '.vite']);
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.json', '.css', '.html', '.md', '.sql']);
const THAI = /[฀-๿]/;

// CP874: identical to Latin-1 below 0x80, Thai from 0xA1 upward, and a handful
// of punctuation borrowed from Windows-1252 in 0x80-0x9F.
const CP874_EXTRA = {
    0x20AC: 0x80, 0x2026: 0x85, 0x2018: 0x91, 0x2019: 0x92,
    0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
};
const toCp874Byte = (code) => {
    if (code < 0x100) return code;                       // passed through undecoded
    if (code >= 0x0E01 && code <= 0x0E5B) return code - 0x0E00 + 0xA0;
    if (code in CP874_EXTRA) return CP874_EXTRA[code];
    return null;
};

const decodeAsUtf8 = (run) => {
    const bytes = [];
    for (const ch of run) {
        const b = toCp874Byte(ch.codePointAt(0));
        if (b === null) return null;
        bytes.push(b);
    }
    const decoder = new TextDecoder('utf-8', { fatal: true });
    try {
        return decoder.decode(Uint8Array.from(bytes));
    } catch {
        return null;
    }
};

const walk = (dir, out = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('GitHub_')) continue;
            walk(path.join(dir, entry.name), out);
        } else if (EXTENSIONS.has(path.extname(entry.name))) {
            out.push(path.join(dir, entry.name));
        }
    }
    return out;
};

const findings = [];
for (const file of walk(ROOT)) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    if (!THAI.test(text)) continue;

    text.split('\n').forEach((line, i) => {
        // A run of non-ASCII, stopped by quotes so one bad literal is reported
        // on its own rather than swallowing the rest of the line.
        for (const match of line.matchAll(/[^\x00-\x7f][^\x00-\x7f'"`]*/g)) {
            const run = match[0];
            if (!THAI.test(run) || run.length < 3) continue;
            const decoded = decodeAsUtf8(run);
            if (decoded && decoded !== run && THAI.test(decoded)) {
                findings.push({
                    file: path.relative(ROOT, file), line: i + 1,
                    was: run.slice(0, 40), should: decoded.slice(0, 40),
                });
            }
        }
    });
}

if (findings.length === 0) {
    console.log('PASS  ไม่พบข้อความไทยที่เข้ารหัสผิด');
    process.exitCode = 0;
} else {
    console.log(`FAIL  พบข้อความไทยที่เข้ารหัสผิด ${findings.length} จุด`);
    for (const f of findings.slice(0, 20)) {
        console.log(`      ${f.file}:${f.line}`);
        console.log(`        เป็น: ${f.was}`);
        console.log(`        ควรเป็น: ${f.should}`);
    }
    if (findings.length > 20) console.log(`      ... อีก ${findings.length - 20} จุด`);
    process.exitCode = 1;
}
