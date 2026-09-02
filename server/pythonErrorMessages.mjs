// server/pythonErrorMessages.js
//
// Turns a Python traceback into one sentence a person who has never programmed
// can act on.
//
// PySim is for people who have not written a line of code before, and until now
// the only thing they got when their answer failed was Python's own traceback,
// in English, ending in something like `NameError: name 'x' is not defined`.
// That names the fault precisely and tells a beginner nothing about what to do.
//
// Every message here says three things: what happened, where, and what to try.
// The raw traceback is never thrown away - it is returned alongside for anyone
// who wants it, and it is what the AI explanation is built from.
//
// The catalogue is deliberately small. These are the errors beginners actually
// hit in the first chapters of this curriculum, measured by running the kinds of
// mistake the lessons produce. Anything unrecognised falls through to a message
// that still beats a bare traceback.

// Python reports the failing line as `File "solution.py", line N`.
// problemGrader trims the launcher frames first, so the last one named is the
// learner's own.
const findLine = (raw) => {
    const matches = [...String(raw || '').matchAll(/File "solution\.py", line (\d+)/g)];
    if (matches.length) return Number(matches[matches.length - 1][1]);
    // SyntaxError arrives before any frame exists and carries its own position.
    const bare = /line (\d+)/.exec(String(raw || ''));
    return bare ? Number(bare[1]) : null;
};

// The last line of a traceback is the exception itself.
const finalLine = (raw) => String(raw || '').trim().split('\n').filter(Boolean).pop() || '';

const quoted = (text, fallback = '') => {
    const m = /'([^']*)'/.exec(text);
    return m ? m[1] : fallback;
};

const RULES = [
    {
        kind: 'NameError',
        test: (last) => last.startsWith('NameError'),
        message: (last) => {
            const name = quoted(last, 'ตัวนี้');
            return `ยังไม่ได้สร้างตัวแปรหรือฟังก์ชันชื่อ \`${name}\` ก่อนเอาไปใช้ — ` +
                'ตรวจว่าสะกดตรงกับตอนที่สร้างไหม และสร้างไว้ก่อนบรรทัดที่เรียกใช้หรือยัง';
        },
    },
    {
        kind: 'SyntaxError',
        test: (last) => last.includes("expected ':'"),
        message: () => 'ลืมใส่เครื่องหมาย `:` ท้ายบรรทัด — คำสั่งอย่าง `if`, `for`, `while` และ `def` ' +
            'ต้องมี `:` ปิดท้ายเสมอ',
    },
    {
        kind: 'SyntaxError',
        test: (last) => /was never closed/.test(last),
        message: (last) => {
            const bracket = quoted(last, '(');
            return `เปิดวงเล็บ \`${bracket}\` ไว้แล้วยังไม่ได้ปิด — นับวงเล็บเปิดกับปิดให้เท่ากัน`;
        },
    },
    {
        kind: 'IndentationError',
        test: (last) => last.startsWith('IndentationError'),
        message: () => 'การย่อหน้าไม่ถูกต้อง — บรรทัดที่อยู่ใต้ `if`, `for` หรือ `def` ' +
            'ต้องเว้นวรรคเข้าไปข้างใน (ปกติใช้ 4 ช่อง) และทุกบรรทัดในกลุ่มเดียวกันต้องเว้นเท่ากัน',
    },
    {
        kind: 'TabError',
        test: (last) => last.startsWith('TabError'),
        message: () => 'ใช้ Tab ปนกับการเว้นวรรคในการย่อหน้า — เลือกอย่างใดอย่างหนึ่งให้เหมือนกันทั้งไฟล์',
    },
    {
        kind: 'SyntaxError',
        test: (last) => last.startsWith('SyntaxError'),
        message: () => 'เขียนคำสั่งผิดรูปแบบ — ลองดูบรรทัดที่แจ้งและบรรทัดก่อนหน้า ' +
            'ว่าลืมวงเล็บ เครื่องหมายคำพูด หรือ `:` หรือเปล่า',
    },
    {
        kind: 'ZeroDivisionError',
        test: (last) => last.startsWith('ZeroDivisionError'),
        message: () => 'หารด้วยศูนย์ — ตรวจว่าตัวหารมีโอกาสเป็น 0 ไหม แล้วกันกรณีนั้นไว้ก่อนหาร',
    },
    {
        kind: 'IndexError',
        test: (last) => last.startsWith('IndexError'),
        message: () => 'เรียกสมาชิกในลิสต์เกินจำนวนที่มีอยู่ — ลิสต์เริ่มนับที่ 0 ' +
            'ตัวสุดท้ายจึงเป็นตำแหน่ง (จำนวนสมาชิก − 1)',
    },
    {
        kind: 'KeyError',
        test: (last) => last.startsWith('KeyError'),
        message: (last) => `ไม่มีคีย์ \`${quoted(last, '')}\` อยู่ใน dictionary — ตรวจการสะกด ` +
            'หรือใช้ `.get()` เมื่อไม่แน่ใจว่ามีคีย์นั้น',
    },
    {
        kind: 'TypeError',
        test: (last) => /can only concatenate str/.test(last),
        message: () => 'เอาข้อความมาบวกกับตัวเลขโดยตรงไม่ได้ — ' +
            'ถ้าต้องการต่อข้อความให้แปลงตัวเลขด้วย `str()` ก่อน เช่น `"อายุ " + str(age)`',
    },
    {
        kind: 'TypeError',
        test: (last) => last.startsWith('TypeError'),
        message: () => 'ใช้ชนิดข้อมูลผิดประเภทในคำสั่งนี้ — ' +
            'ตรวจว่าค่าที่ใช้เป็นตัวเลขหรือข้อความตามที่คำสั่งต้องการไหม (`int()` และ `str()` ใช้แปลงได้)',
    },
    {
        kind: 'ValueError',
        test: (last) => /invalid literal for int/.test(last),
        message: (last) => {
            const value = /: '(.*)'$/.exec(last);
            return `แปลงข้อความ${value ? ` \`${value[1]}\` ` : ''}เป็นตัวเลขไม่ได้ — ` +
                '`int()` ใช้ได้เฉพาะกับข้อความที่เป็นตัวเลขล้วน';
        },
    },
    {
        kind: 'ValueError',
        test: (last) => last.startsWith('ValueError'),
        message: () => 'ค่าที่ส่งให้คำสั่งนี้ไม่ถูกต้อง — ตรวจว่าค่าที่ใช้อยู่ในรูปแบบที่คำสั่งรับได้',
    },
    {
        kind: 'AttributeError',
        test: (last) => last.startsWith('AttributeError'),
        message: (last) => {
            const name = quoted(last.split('has no attribute')[1] || '', '');
            return `เรียกใช้คำสั่ง${name ? ` \`${name}\` ` : ''}กับค่าที่ไม่มีคำสั่งนั้น — ` +
                'ตรวจการสะกด และตรวจว่าตัวแปรเก็บค่าชนิดที่คิดไว้จริงไหม';
        },
    },
    {
        kind: 'EOFError',
        test: (last) => last.startsWith('EOFError'),
        message: () => 'เรียก `input()` มากกว่าจำนวนค่าที่โจทย์ป้อนให้ — ' +
            'นับดูว่าโจทย์ให้กรอกกี่ค่า แล้วเรียก `input()` เท่านั้นครั้ง',
    },
    {
        kind: 'ModuleNotFoundError',
        test: (last) => last.startsWith('ModuleNotFoundError'),
        message: (last) => `ไม่มีไลบรารี \`${quoted(last, '')}\` ให้ใช้ — ` +
            'ตรวจการสะกดชื่อ หรือโจทย์ข้อนี้อาจไม่ได้ตั้งใจให้ใช้ไลบรารีนี้',
    },
    {
        kind: 'RecursionError',
        test: (last) => last.startsWith('RecursionError'),
        message: () => 'ฟังก์ชันเรียกตัวเองไม่รู้จบ — ต้องมีเงื่อนไขที่ทำให้หยุดเรียกตัวเอง',
    },
];

/**
 * @param {string} rawError  stderr/traceback as the runner captured it
 * @returns {{kind: string, message: string, line: number|null, raw: string}}
 */
function explainPythonError(rawError) {
    const raw = String(rawError || '').trim();
    if (!raw) return { kind: '', message: '', line: null, raw: '' };

    const last = finalLine(raw);
    const line = findLine(raw);
    const rule = RULES.find((r) => r.test(last));

    return {
        kind: rule ? rule.kind : (last.split(':')[0] || 'Error'),
        // The fallback still beats a bare traceback: it names the line and says
        // where to look, instead of only naming the exception class.
        message: rule
            ? rule.message(last)
            : 'โปรแกรมหยุดทำงานกลางคัน — ดูรายละเอียดด้านล่างประกอบ แล้วตรวจบรรทัดที่แจ้ง',
        line,
        raw,
    };
}

export { explainPythonError };
