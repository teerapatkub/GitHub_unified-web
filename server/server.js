// server.js
require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const os = require('os');
// Competitive Arena runs a submission's Python in a child process to grade it.
const { spawn } = require('child_process');
// Single source of truth for arcade constants also read by the client bundle
// (client/src/pages/Arcade/ArcadeBattleRoyale.jsx, client/src/pages/Arcade/bot/*.js)
// — see shared/arcadeConfig.json's own header comment before editing values here.
const arcadeConfig = require('../shared/arcadeConfig.json');
// The single answer-checker. See server/problemGrader.js for why there is only
// one now, and server/problemsSchema.js for the problem bank it grades against.
const { gradeSubmission, screenUnverifiedSubmission } = require('./problemGrader');
// The single definition of how far through a lesson a learner is - see the
// header of server/lessonProgress.js for why it had to become one.
const { evaluateLesson, POST_PASS_RATIO } = require('./lessonProgress');

const app = express();
app.use(cors());
app.use(express.json());
const db = require('./db');

const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();
const isValidGoogleClientId = (clientId) => /^[\w.-]+\.apps\.googleusercontent\.com$/.test(clientId);
const GOOGLE_LOGIN_ENABLED = isValidGoogleClientId(GOOGLE_CLIENT_ID);
const googleOAuthClient = new OAuth2Client();

// ==========================================================================
// Merged in from Person 1's branch (origin/main, 2026-08-20).
// These endpoints and their helpers back the learning, mini-game, dashboard and
// admin screens that came across in the same merge. The SQL was written against
// MySQL; whatever db.js's normalizeSql() cannot rewrite generically — the
// upserts (they need an explicit conflict target) and GROUP_CONCAT — was converted
// here at the call site instead.
// ==========================================================================

const getBangkokDateString = (date = new Date()) => {
    const bangkokMs = date.getTime() + (date.getTimezoneOffset() * 60000) + (7 * 60 * 60000);
    const bangkokDate = new Date(bangkokMs);
    const yyyy = bangkokDate.getFullYear();
    const mm = String(bangkokDate.getMonth() + 1).padStart(2, '0');
    const dd = String(bangkokDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const diffInDays = (dateStrA, dateStrB) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const a = new Date(`${dateStrA}T00:00:00Z`);
    const b = new Date(`${dateStrB}T00:00:00Z`);
    return Math.round((a.getTime() - b.getTime()) / msPerDay);
};

const logUserXpForToday = async (executor, userId, xpDelta) => {
    if (!xpDelta || Number(xpDelta) <= 0) return;
    const today = getBangkokDateString();
    await executor.execute(
        `INSERT INTO user_xp_log (user_id, xp_date, xp_earned)
         VALUES (?, ?, ?)
         ON CONFLICT (user_id, xp_date) DO UPDATE SET
            xp_earned = user_xp_log.xp_earned + EXCLUDED.xp_earned`,
        [userId, today, Number(xpDelta)]
    );
};

const computeUserStreak = async (executor, userId) => {
    const [rows] = await executor.execute(
        `SELECT xp_date FROM user_xp_log
         WHERE user_id = ?
         ORDER BY xp_date DESC
         LIMIT 400`,
        [userId]
    );

    if (rows.length === 0) return 0;

    const today = getBangkokDateString();
    const dates = rows.map((row) => {
        const value = row.xp_date instanceof Date
            ? getBangkokDateString(row.xp_date)
            : String(row.xp_date).slice(0, 10);
        return value;
    });

    const gapFromToday = diffInDays(today, dates[0]);
    if (gapFromToday > 1) return 0; // ขาดไปแล้วอย่างน้อย 1 วันเต็ม สตรีคเป็น 0

    let streak = 1;
    for (let i = 1; i < dates.length; i += 1) {
        const gap = diffInDays(dates[i - 1], dates[i]);
        if (gap === 1) {
            streak += 1;
        } else if (gap === 0) {
            continue; // กันข้อมูลซ้ำวันเดียวกัน (ไม่ควรเกิดเพราะมี unique key)
        } else {
            break;
        }
    }
    return streak;
};

const applyXpRewardToUser = async (executor, userId, xpDelta = 0, coinDelta = 0) => {
    const [userRows] = await executor.execute(
        'SELECT user_id, username, level, xp, virtual_currency FROM users WHERE user_id = ? LIMIT 1',
        [userId]
    );

    if (userRows.length === 0) {
        throw new Error('User not found');
    }

    const currentUser = userRows[0];
    const currentLevel = Number(currentUser.level ?? 1);
    const nextXp = Number(currentUser.xp ?? 0) + Number(xpDelta || 0);
    const nextCoins = Number(currentUser.virtual_currency ?? 0) + Number(coinDelta || 0);
    const computedLevel = computeLevelFromXp(nextXp);
    const nextLevel = Math.max(currentLevel, computedLevel);
    const storedXp = nextLevel > currentLevel ? 0 : nextXp;

    await executor.execute(
        'UPDATE users SET xp = ?, virtual_currency = ?, level = ? WHERE user_id = ?',
        [storedXp, nextCoins, nextLevel, userId]
    );

    // อัปเดต log XP วันนี้ (ใช้คำนวณสตรีค) เฉพาะตอนได้ XP เพิ่มจริง ๆ
    await logUserXpForToday(executor, userId, xpDelta);
    const streakDays = await computeUserStreak(executor, userId);

    return {
        ...currentUser,
        level: nextLevel,
        xp: storedXp,
        virtual_currency: nextCoins,
        streak_days: streakDays,
    };
};

let multer;
try {
    multer = require('multer');
} catch (error) {
    console.error('Missing dependency: multer. Run "npm install" in the server directory before starting the API.');
    throw error;
}

// Where uploaded files live. Configurable because this directory is the one
// piece of state that is NOT in the database: profile pictures, lesson media
// and cosmetic art all land here, and a deployment that unpacks a new version
// over the old one would take them with it. Pointing UPLOADS_DIR at a mounted
// volume keeps them outside the release, which is the only way an update stops
// being a data loss event.
const uploadsDir = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Theme and lesson images uploaded through /api/upload are referenced from the
// database (shop_items.asset_url), so they have to be served back.
app.use('/uploads', express.static(uploadsDir));

// The address this deployment is reachable at from OUTSIDE.
//
// Almost nothing needs it - the front end talks to the API with relative paths
// now. The exception is anything that leaves the process and has to come back:
// an email verification link opens days later, in a mail client, on a different
// machine, and cannot be relative. That link was hardcoded to localhost, which
// meant every verification email the system had ever sent pointed the recipient
// at their own computer.
const publicBaseUrl = () =>
    String(process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3001}`)
        .trim().replace(/\/+$/, '');

const logRouteError = (label, error) => {
    const message = describeError(error);
    console.error(label, message, error?.stack || error);
    return message;
};

const isGuestUserId = (userId) => typeof userId === 'string' && userId.trim().toLowerCase().startsWith('guest_');

const buildGuestUserSnapshot = ({ userId, xp = 0, virtualCurrency = 0, level = 1 } = {}) => ({
    user_id: userId,
    username: 'Guest User',
    role: 'guest',
    level,
    xp,
    virtual_currency: virtualCurrency,
    isGuest: true,
});

const LESSON_EXERCISE_SEEDS = [
    {
        lesson_id: 1,
        title: 'ทักทายด้วย Python',
        description: 'เขียนโปรแกรมแสดงข้อความ "Hello, Python!" ออกทางหน้าจอ 1 บรรทัด',
        starter_code: 'print("Hello, Python!")',
        solution_code: 'print("Hello, Python!")',
        test_cases: [{ input: '', expected: 'Hello, Python!' }],
        xp_reward: 15,
        currency_reward: 5,
    },
    {
        lesson_id: 2,
        title: 'สร้างตัวแปรเก็บชื่อ',
        description: 'สร้างตัวแปรชื่อ name เก็บคำว่า "PySim" แล้วแสดงค่าตัวแปรออกทางหน้าจอ',
        starter_code: 'name = "PySim"\nprint(name)',
        solution_code: 'name = "PySim"\nprint(name)',
        test_cases: [{ input: '', expected: 'PySim' }],
        xp_reward: 20,
        currency_reward: 6,
    },
    {
        lesson_id: 3,
        title: 'รับชื่อแล้วทักทาย',
        description: 'รับชื่อจากผู้ใช้ 1 ค่า แล้วแสดงข้อความในรูปแบบ "สวัสดี <ชื่อ>"',
        starter_code: 'name = input()\nprint("สวัสดี", name)',
        solution_code: 'name = input()\nprint("สวัสดี", name)',
        test_cases: [
            { input: 'สมชาย', expected: 'สวัสดี สมชาย' },
            { input: 'Lumi', expected: 'สวัสดี Lumi' },
        ],
        xp_reward: 25,
        currency_reward: 8,
    },
    {
        lesson_id: 4,
        title: 'ผ่านหรือไม่ผ่าน',
        description: 'รับคะแนน 1 ค่า ถ้าคะแนนตั้งแต่ 50 ขึ้นไปให้แสดง "ผ่าน" ถ้าน้อยกว่า 50 ให้แสดง "ไม่ผ่าน"',
        starter_code: 'score = int(input())\nif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ไม่ผ่าน")',
        solution_code: 'score = int(input())\nif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ไม่ผ่าน")',
        test_cases: [
            { input: '80', expected: 'ผ่าน' },
            { input: '42', expected: 'ไม่ผ่าน' },
        ],
        xp_reward: 30,
        currency_reward: 10,
    },
    {
        lesson_id: 5,
        title: 'นับเลข 1 ถึง n',
        description: 'รับจำนวนเต็ม n แล้วแสดงตัวเลขตั้งแต่ 1 ถึง n ทีละบรรทัด',
        starter_code: 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)',
        solution_code: 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)',
        test_cases: [
            { input: '3', expected: '1\n2\n3' },
            { input: '1', expected: '1' },
        ],
        xp_reward: 35,
        currency_reward: 12,
    },
    {
        lesson_id: 6,
        title: 'สร้างฟังก์ชันบวกเลข',
        description: 'เขียนฟังก์ชัน add(a, b) ที่คืนค่าผลบวกของตัวเลขสองจำนวน แล้วแสดงผลจากค่าที่รับเข้ามา',
        starter_code: 'def add(a, b):\n    return a + b\n\na = int(input())\nb = int(input())\nprint(add(a, b))',
        solution_code: 'def add(a, b):\n    return a + b\n\na = int(input())\nb = int(input())\nprint(add(a, b))',
        test_cases: [
            { input: '2\n3', expected: '5' },
            { input: '10\n7', expected: '17' },
        ],
        xp_reward: 40,
        currency_reward: 15,
    },
];

const SEEDED_LESSON_IDS = LESSON_EXERCISE_SEEDS.map((exercise) => exercise.lesson_id);

const normalizeLessonTitle = (value) =>
    String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

const inferExerciseSeedFromLesson = (lesson) => {
    const title = normalizeLessonTitle(lesson?.title);

    if (title.includes('hello world') || title.includes('print')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'เขียนโปรแกรมแสดงข้อความ "Hello, Python!" ออกทางหน้าจอ 1 บรรทัด',
            starter_code: 'print("Hello, Python!")',
            solution_code: 'print("Hello, Python!")',
            test_cases: [{ input: '', expected: 'Hello, Python!' }],
            xp_reward: 15,
            currency_reward: 5,
        };
    }

    if (title.includes('comment')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'เขียนโปรแกรมที่มี comment อธิบาย 1 บรรทัด และแสดงข้อความ "Comments ready"',
            starter_code: '# อธิบายโค้ดของคุณที่นี่\nprint("Comments ready")',
            solution_code: '# อธิบายโค้ดของคุณที่นี่\nprint("Comments ready")',
            test_cases: [{ input: '', expected: 'Comments ready' }],
            xp_reward: 15,
            currency_reward: 5,
        };
    }

    if (title.includes('input') || title.includes('รับ')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'รับชื่อจากผู้ใช้ 1 ค่า แล้วแสดงข้อความในรูปแบบ "สวัสดี <ชื่อ>"',
            starter_code: 'name = input()\nprint("สวัสดี", name)',
            solution_code: 'name = input()\nprint("สวัสดี", name)',
            test_cases: [
                { input: 'Lumi', expected: 'สวัสดี Lumi' },
                { input: 'PySim', expected: 'สวัสดี PySim' },
            ],
            xp_reward: 20,
            currency_reward: 6,
        };
    }

    if (title.includes('ตัวแปร') || title.includes('variable')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'สร้างตัวแปรชื่อ course เก็บคำว่า "Python" แล้วแสดงค่าตัวแปรออกทางหน้าจอ',
            starter_code: 'course = "Python"\nprint(course)',
            solution_code: 'course = "Python"\nprint(course)',
            test_cases: [{ input: '', expected: 'Python' }],
            xp_reward: 20,
            currency_reward: 6,
        };
    }

    if (title.includes('type conversion') || title.includes('conversion')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'รับตัวเลข 2 ค่า แปลงเป็นจำนวนเต็ม แล้วแสดงผลรวม',
            starter_code: 'a = int(input())\nb = int(input())\nprint(a + b)',
            solution_code: 'a = int(input())\nb = int(input())\nprint(a + b)',
            test_cases: [
                { input: '2\n3', expected: '5' },
                { input: '10\n5', expected: '15' },
            ],
            xp_reward: 25,
            currency_reward: 8,
        };
    }

    if (title.includes('if') || title.includes('else') || title.includes('เงื่อนไข')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'รับคะแนน 1 ค่า ถ้าคะแนนตั้งแต่ 50 ขึ้นไปให้แสดง "ผ่าน" ไม่เช่นนั้นให้แสดง "ไม่ผ่าน"',
            starter_code: 'score = int(input())\nif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ไม่ผ่าน")',
            solution_code: 'score = int(input())\nif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ไม่ผ่าน")',
            test_cases: [
                { input: '80', expected: 'ผ่าน' },
                { input: '40', expected: 'ไม่ผ่าน' },
            ],
            xp_reward: 25,
            currency_reward: 8,
        };
    }

    if (title.includes('for loop') || title.includes('while loop') || title.includes('loop')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'รับตัวเลข n แล้วแสดงเลขตั้งแต่ 1 ถึง n ทีละบรรทัด',
            starter_code: 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)',
            solution_code: 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)',
            test_cases: [
                { input: '3', expected: '1\n2\n3' },
                { input: '1', expected: '1' },
            ],
            xp_reward: 30,
            currency_reward: 10,
        };
    }

    if (title.includes('parameter') || title.includes('return') || title.includes('ฟังก์ชัน') || title.includes('function')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'เขียนฟังก์ชัน add(a, b) ที่คืนค่าผลบวกของตัวเลขสองจำนวน แล้วแสดงผลลัพธ์',
            starter_code: 'def add(a, b):\n    return a + b\n\na = int(input())\nb = int(input())\nprint(add(a, b))',
            solution_code: 'def add(a, b):\n    return a + b\n\na = int(input())\nb = int(input())\nprint(add(a, b))',
            test_cases: [
                { input: '2\n3', expected: '5' },
                { input: '10\n7', expected: '17' },
            ],
            xp_reward: 35,
            currency_reward: 12,
        };
    }

    if (title.includes('list')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'สร้าง list ของตัวเลข [1, 2, 3] แล้วแสดงผลรวมของสมาชิกทั้งหมด',
            starter_code: 'numbers = [1, 2, 3]\nprint(sum(numbers))',
            solution_code: 'numbers = [1, 2, 3]\nprint(sum(numbers))',
            test_cases: [{ input: '', expected: '6' }],
            xp_reward: 30,
            currency_reward: 10,
        };
    }

    if (title.includes('dictionary') || title.includes('dict')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'สร้าง dictionary เก็บ name = "PySim" แล้วแสดงค่าของ key ชื่อ name',
            starter_code: 'student = {"name": "PySim"}\nprint(student["name"])',
            solution_code: 'student = {"name": "PySim"}\nprint(student["name"])',
            test_cases: [{ input: '', expected: 'PySim' }],
            xp_reward: 35,
            currency_reward: 12,
        };
    }

    if (title.includes('file')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'สร้างตัวแปร file_name เก็บคำว่า "data.txt" แล้วแสดงค่าตัวแปรนั้น',
            starter_code: 'file_name = "data.txt"\nprint(file_name)',
            solution_code: 'file_name = "data.txt"\nprint(file_name)',
            test_cases: [{ input: '', expected: 'data.txt' }],
            xp_reward: 25,
            currency_reward: 8,
        };
    }

    if (title.includes('except') || title.includes('try')) {
        return {
            title: `แบบฝึกหัด: ${lesson.title}`,
            description: 'เขียนโปรแกรมแปลงค่าที่รับเข้ามาเป็นจำนวนเต็ม ถ้าแปลงไม่ได้ให้แสดง "ข้อมูลไม่ถูกต้อง"',
            starter_code: 'try:\n    value = int(input())\n    print(value)\nexcept:\n    print("ข้อมูลไม่ถูกต้อง")',
            solution_code: 'try:\n    value = int(input())\n    print(value)\nexcept:\n    print("ข้อมูลไม่ถูกต้อง")',
            test_cases: [
                { input: '12', expected: '12' },
                { input: 'abc', expected: 'ข้อมูลไม่ถูกต้อง' },
            ],
            xp_reward: 35,
            currency_reward: 12,
        };
    }

    return {
        title: `แบบฝึกหัด: ${lesson.title || 'บทเรียนนี้'}`,
        description: `เขียนโปรแกรม Python สั้น ๆ ให้สอดคล้องกับหัวข้อ "${lesson?.title || 'บทเรียนนี้'}" แล้วแสดงผลลัพธ์ออกทางหน้าจอ`,
        starter_code: 'print("พร้อมเริ่มแบบฝึกหัด")',
        solution_code: 'print("พร้อมเริ่มแบบฝึกหัด")',
        test_cases: [{ input: '', expected: 'พร้อมเริ่มแบบฝึกหัด' }],
        xp_reward: 20,
        currency_reward: 6,
    };
};

const ensureLessonExerciseExists = async (lessonId) => {
    const numericLessonId = Number(lessonId);
    if (!Number.isFinite(numericLessonId) || numericLessonId <= 0) {
        return false;
    }

    const [existing] = await db.execute(
        'SELECT exercise_id FROM exercises WHERE lesson_id = ? LIMIT 1',
        [numericLessonId]
    );

    if (existing.length > 0) {
        return true;
    }

    const [lessonRows] = await db.execute(
        'SELECT lesson_id, title FROM lessons WHERE lesson_id = ? LIMIT 1',
        [numericLessonId]
    );

    if (lessonRows.length === 0) {
        return false;
    }

    const lesson = lessonRows[0];
    const seed = inferExerciseSeedFromLesson(lesson);

    await createProblem('lesson', {
        titleTh: seed.title,
        descTh: seed.description,
        starterCode: seed.starter_code,
        solutionCode: seed.solution_code,
        testCases: seed.test_cases,
        lessonId: numericLessonId,
        xpReward: seed.xp_reward,
        coinReward: seed.currency_reward,
    });

    return true;
};

const ensureLessonExercisesSeeded = async () => {
    const placeholders = SEEDED_LESSON_IDS.map(() => '?').join(', ');
    const [rows] = await db.execute(
        `SELECT lesson_id, COUNT(*) AS total
         FROM exercises
         WHERE lesson_id IN (${placeholders})
         GROUP BY lesson_id`,
        SEEDED_LESSON_IDS
    );

    const existingLessonIds = new Set(rows.map((row) => Number(row.lesson_id)));

    for (const exercise of LESSON_EXERCISE_SEEDS) {
        if (existingLessonIds.has(exercise.lesson_id)) {
            continue;
        }

        await createProblem('lesson', {
            titleTh: exercise.title,
            descTh: exercise.description,
            starterCode: exercise.starter_code,
            solutionCode: exercise.solution_code,
            testCases: exercise.test_cases,
            lessonId: exercise.lesson_id,
            xpReward: exercise.xp_reward,
            coinReward: exercise.currency_reward,
        });
    }
};

const uploadStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname || '').toLowerCase()}`);
    },
});

const upload = multer({
    storage: uploadStorage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedMime = /image\/|video\//;
        const allowedExt = /\.(png|jpg|jpeg|gif|webp|mp4|mov|webm|avi)$/i;
        const name = file.originalname || '';
        const mime = file.mimetype || '';

        if (allowedMime.test(mime) && allowedExt.test(name)) {
            cb(null, true);
            return;
        }

        cb(new Error('Only image and video uploads are allowed'));
    },
});

const ensureUserPresenceSchema = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS user_presence (
            user_id int(11) NOT NULL,
            mode varchar(40) NOT NULL DEFAULT 'learn',
            activity_label varchar(120) DEFAULT NULL,
            current_path varchar(255) DEFAULT NULL,
            last_seen timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (user_id),
            KEY idx_user_presence_last_seen (last_seen)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
};

const ensureLessonQuizAttemptSchema = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS lesson_quiz_attempts (
                attempt_id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) NOT NULL,
                lesson_id int(11) NOT NULL,
                quiz_type varchar(10) NOT NULL,
                score int(11) NOT NULL DEFAULT 0,
                total_questions int(11) NOT NULL DEFAULT 0,
                answers_json longtext DEFAULT NULL,
                completed_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (attempt_id),
                UNIQUE KEY uk_lesson_quiz_attempt (user_id, lesson_id, quiz_type),
                KEY idx_lesson_quiz_attempt_lesson (lesson_id, quiz_type),
                KEY idx_lesson_quiz_attempt_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        await db.execute(`
            WITH ranked_attempts AS (
                SELECT
                    attempt_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY user_id, lesson_id, quiz_type
                        ORDER BY updated_at DESC NULLS LAST, completed_at DESC NULLS LAST, attempt_id DESC
                    ) AS attempt_rank
                FROM lesson_quiz_attempts
            )
            DELETE FROM lesson_quiz_attempts
            WHERE attempt_id IN (
                SELECT attempt_id
                FROM ranked_attempts
                WHERE attempt_rank > 1
            )
        `);
        await db.execute(`
            CREATE UNIQUE INDEX IF NOT EXISTS uk_lesson_quiz_attempt
            ON lesson_quiz_attempts (user_id, lesson_id, quiz_type)
        `);
        await db.execute(`
            CREATE INDEX IF NOT EXISTS idx_lesson_quiz_attempt_lesson
            ON lesson_quiz_attempts (lesson_id, quiz_type)
        `);
        await db.execute(`
            CREATE INDEX IF NOT EXISTS idx_lesson_quiz_attempt_user
            ON lesson_quiz_attempts (user_id)
        `);
    } catch (error) {
        console.error('⚠️ Failed to ensure lesson quiz attempt schema:', error.message);
    }
};

const _miniGameModuleCache = new Map();

// ==========================================
// AI routes
app.post('/api/ai/chat', async (req, res) => {
    const { messages } = req.body;
    try {
        const reply = await callAiChat({
            messages,
            temperature: 0.7,
            maxTokens: 2048,
            thinking: false
        });
        return res.json({ reply });
    } catch (error) {
        console.error('❌ Lumi Error:', error.message);
        return res.status(500).json({
            reply: '✨ อ๊ะ! พลังเวทมนตร์ของ Lumi ขัดข้องชั่วคราว ลองถามใหม่อีกทีน้า~'
        });
    }
});

// Ported missing routes & helpers for learning tasks, sync-time, and profile v2
// ==========================================

// The chatbot model - Lumi (/api/ai/chat) and the exercise/challenge generator.
// Deliberately NOT the same client as judgeCodeQuality()'s further down: that one
// grades Arcade round code, is on its own key and model, and must not move when
// the chatbot's does.
//
// Both the key and the model name come from .env. The key used to be hard-coded
// here as a fallback, which put a live credential in the repo, and the model was
// a constant, which is why NVIDIA retiring `z-ai/glm-5.2` (HTTP 410 Gone) could
// only be answered by editing code. Swapping models is now a one-line .env edit.
const NVIDIA_AI_API_KEY = String(process.env.NVIDIA_API_KEY || process.env.NVIDIA_GLM_API_KEY || '').trim();
const NVIDIA_AI_MODEL = String(process.env.NVIDIA_AI_MODEL || 'deepseek-ai/deepseek-v4-flash-0731').trim();
// A chat reply sits on a user's critical path, so it fails fast rather than
// leaving somebody watching a spinner - the caller's own fallback beats a long
// wait. Retries are off: the SDK retries timeouts too, so a model that hangs
// rather than erroring would cost the caller two full timeouts instead of one.
const NVIDIA_AI_TIMEOUT_MS = Number(process.env.NVIDIA_AI_TIMEOUT_MS || 45000);

const aiChatClient = NVIDIA_AI_API_KEY
    ? new OpenAI({
        apiKey: NVIDIA_AI_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
        maxRetries: 0,
        timeout: NVIDIA_AI_TIMEOUT_MS,
    })
    : null;

if (!NVIDIA_AI_API_KEY) {
    console.warn('\u26a0\ufe0f NVIDIA_API_KEY is not set - Lumi chat and AI task generation will use their built-in fallbacks.');
}

// Callers already passed temperature/maxTokens/thinking before this rewrite, but
// the old body ignored all three and sent its own fixed values, so asking for a
// short deterministic answer silently got a long creative one.
const callAiChat = async ({ messages, systemInstruction = '', temperature = 1, maxTokens = 4096, thinking = false }) => {
    if (!aiChatClient) {
        throw new Error('NVIDIA_API_KEY is not set, so no AI model is configured');
    }

    const apiMessages = [];
    if (systemInstruction) {
        apiMessages.push({ role: 'system', content: systemInstruction });
    }
    for (const message of (Array.isArray(messages) ? messages : [])) {
        apiMessages.push({ role: message?.role || 'user', content: String(message?.content ?? '') });
    }
    if (apiMessages.length === 0) {
        throw new Error('callAiChat was given no messages to send');
    }

    let completion;
    try {
        completion = await aiChatClient.chat.completions.create({
            model: NVIDIA_AI_MODEL,
            messages: apiMessages,
            temperature,
            top_p: 0.95,
            max_tokens: maxTokens,
            chat_template_kwargs: { thinking: Boolean(thinking) },
            stream: false,
        });
    } catch (error) {
        // The bare SDK message ("Request failed with status code 410") never named
        // the model that was gone, which is what made the retirement hard to spot.
        const status = error?.status || error?.response?.status;
        const detail = error?.response?.data?.detail || error?.message || 'unknown error';
        throw new Error(`AI model "${NVIDIA_AI_MODEL}" failed${status ? ` (HTTP ${status})` : ''}: ${detail}`);
    }

    // Reasoning models split their output: the visible answer is in `content`,
    // the scratch work in `reasoning_content`. Only the answer is returned -
    // showing a learner the model's private deliberation would confuse them, and
    // for the task generator it would break JSON parsing outright.
    const reply = String(completion?.choices?.[0]?.message?.content || '').trim();
    if (!reply) {
        const finish = completion?.choices?.[0]?.finish_reason;
        throw new Error(`AI model "${NVIDIA_AI_MODEL}" returned an empty reply${finish ? ` (finish_reason: ${finish})` : ''}`);
    }
    return reply;
};


const normalizePlayerLevel = (level) => {
    if (typeof level === 'number') {
        if (level <= 1) return 'Beginner';
        if (level === 2) return 'Intermediate';
        return 'Advanced';
    }
    const value = String(level || '').trim().toLowerCase();
    if (value === 'intermediate' || value === 'medium' || value === '2') return 'Intermediate';
    if (value === 'advanced' || value === 'hard' || value === '3') return 'Advanced';
    return 'Beginner';
};

const formatJobStatus = (job) => {
    const carriedDays = Number(job?.carried_days || 0);
    const status = String(job?.status || 'ACTIVE').toUpperCase();
    const reason = String(job?.status_reason || '').toUpperCase();

    let displayStatus = 'IN_PROGRESS';
    let statusLabel = 'In Progress';
    let statusDescription = 'งานนี้กำลังดำเนินการอยู่';
    let statusTone = 'blue';

    if (status === 'COMPLETED') {
        displayStatus = 'COMPLETED';
        statusLabel = 'Completed';
        statusDescription = 'ส่งงานเรียบร้อยและได้รับรางวัลแล้ว';
        statusTone = 'green';
    } else if (status === 'FAILED' && reason === 'BOT_STEAL') {
        displayStatus = 'STOLEN';
        statusLabel = 'Bot Stole It';
        statusDescription = 'งานนี้ถูกบอทคู่แข่งแย่งไปก่อนที่คุณจะส่งทัน';
        statusTone = 'red';
    } else if (status === 'FAILED') {
        displayStatus = 'FAILED';
        statusLabel = 'Failed';
        statusDescription = 'งานนี้จบลงโดยไม่ได้รับรางวัล';
        statusTone = 'red';
    } else if (carriedDays >= 2) {
        displayStatus = 'AT_RISK';
        statusLabel = 'At Risk';
        statusDescription = `งานนี้ค้างมาแล้ว ${carriedDays} วัน มีโอกาสโดนบอทแย่งสูง`;
        statusTone = 'amber';
    } else if (carriedDays >= 1) {
        displayStatus = 'CARRY_OVER';
        statusLabel = 'Carry Over';
        statusDescription = `งานนี้ค้างข้ามวันมาแล้ว ${carriedDays} วัน`;
        statusTone = 'violet';
    }

    return {
        ...job,
        carried_days: carriedDays,
        display_status: displayStatus,
        status_label: statusLabel,
        status_description: statusDescription,
        status_tone: statusTone,
        is_carry_over: carriedDays > 0,
    };
};

// db.js hands back jsonb columns already decoded, unlike mysql2 which returns
// them as strings. Parsing one of those a second time throws (JSON.parse coerces
// the object to "[object Object]") and quietly yields the fallback, so anything
// that is not a string is passed straight through.
const safeJsonParse = (value, fallback = null) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const extractFirstJsonBlock = (rawText = '') => {
    const trimmed = String(rawText || '').trim();
    if (!trimmed) return null;

    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) return fencedMatch[1].trim();

    const objectStart = trimmed.indexOf('{');
    const objectEnd = trimmed.lastIndexOf('}');
    if (objectStart !== -1 && objectEnd > objectStart) {
        return trimmed.slice(objectStart, objectEnd + 1);
    }
    return null;
};

const computeLevelFromXp = (xp = 0) => Math.max(1, Math.floor(Number(xp || 0) / 1000) + 1);

// ==========================================================================
// Achievements.
//
// Every achievement in the table names a `metric` and a `threshold`; this
// computes each player's metrics and unlocks whatever they have reached. One
// evaluator covers all of them, so adding an achievement is a row in db.js, not
// another branch here.
//
// Called after anything that can move a metric. It is cheap enough to run on
// those events (a handful of counting queries) and is never allowed to throw:
// an achievement is a reward, and failing to award one must not fail the lesson
// submission or match that earned it.
// ==========================================================================


async function computeAchievementMetrics(userId, username) {
    const one = async (sql, params = []) => {
        const [rows] = await db.execute(sql, params);
        return Number(rows?.[0]?.n || 0);
    };

    // A lesson counts as completed on exactly the terms the learning page and
    // the profile page use, because all three ask evaluateLesson().
    const [lessonRows] = await db.execute(
        `SELECT l.lesson_id,
                (SELECT COUNT(*) FROM exercises e WHERE e.lesson_id = l.lesson_id) AS ex_total,
                (SELECT COUNT(DISTINCT s.exercise_id)
                   FROM exercise_submissions s
                   JOIN exercises e2 ON e2.exercise_id = s.exercise_id
                  WHERE e2.lesson_id = l.lesson_id AND s.user_id = ? AND s.is_passed = 1) AS ex_passed,
                (SELECT COUNT(*) FROM lesson_quizzes q
                  WHERE q.lesson_id = l.lesson_id AND q.quiz_type = 'post') AS has_post_quiz,
                (SELECT MAX(a.score) FROM lesson_quiz_attempts a
                  WHERE a.user_id = ? AND a.lesson_id = l.lesson_id AND a.quiz_type = 'post') AS post_score,
                (SELECT MAX(a.total_questions) FROM lesson_quiz_attempts a
                  WHERE a.user_id = ? AND a.lesson_id = l.lesson_id AND a.quiz_type = 'post') AS post_total
           FROM lessons l`,
        [userId, userId, userId]
    );
    let lessonsCompleted = 0;
    for (const r of lessonRows) {
        const progress = evaluateLesson({
            post: Number(r.post_total || 0) > 0
                ? { score: r.post_score, total_questions: r.post_total }
                : null,
            hasPostQuiz: Number(r.has_post_quiz || 0) > 0,
            exercisesTotal: Number(r.ex_total || 0),
            exercisesPassed: Number(r.ex_passed || 0),
        });
        if (progress.completed) lessonsCompleted += 1;
    }

    // Owning every piece of at least one cosmetic set.
    const [setRows] = await db.execute(
        `SELECT i.set_key,
                COUNT(*) AS total,
                COUNT(inv.item_id) AS owned
           FROM shop_items i
           LEFT JOIN user_inventory inv ON inv.item_id = i.item_id AND inv.user_id = ?
          WHERE i.set_key IS NOT NULL AND i.is_active = 1
          GROUP BY i.set_key`,
        [userId]
    );
    const setsCompleted = setRows.filter(r => Number(r.owned) >= Number(r.total) && Number(r.total) > 0).length;

    const [userRow] = await db.execute('SELECT level, xp FROM users WHERE user_id = ? LIMIT 1', [userId]);
    const [statRow] = await db.execute(
        'SELECT matches_played, wins FROM arcade_player_stats WHERE user_name = ? LIMIT 1', [username]
    );

    return {
        lessons_completed: lessonsCompleted,
        exercises_passed: await one(
            `SELECT COUNT(DISTINCT exercise_id) AS n FROM exercise_submissions WHERE user_id = ? AND is_passed = 1`, [userId]),
        quizzes_perfect: await one(
            `SELECT COUNT(*) AS n FROM lesson_quiz_attempts
              WHERE user_id = ? AND quiz_type = 'post' AND total_questions > 0 AND score >= total_questions`, [userId]),
        mini_games_completed: await one(
            `SELECT COUNT(*) AS n FROM mini_game_user_exercise_progress WHERE user_id = ? AND is_completed = 1`, [userId]),
        arcade_matches: Number(statRow?.[0]?.matches_played || 0),
        arcade_wins: Number(statRow?.[0]?.wins || 0),
        arcade_perfect_rounds: await one(
            `SELECT COUNT(*) AS n FROM arcade_round_history
              WHERE user_name = ? AND total_count > 0 AND pass_count >= total_count`, [username]),
        level: Number(userRow?.[0]?.level || 0),
        xp_total: Number(userRow?.[0]?.xp || 0),
        streak_days: await computeUserStreak(db, userId),
        cosmetics_owned: await one('SELECT COUNT(*) AS n FROM user_inventory WHERE user_id = ?', [userId]),
        sets_completed: setsCompleted,
    };
}

async function evaluateAchievements(userId, username = null) {
    try {
        const uid = Number(userId);
        if (!uid) return [];

        let name = username;
        if (!name) {
            const [rows] = await db.execute('SELECT username FROM users WHERE user_id = ? LIMIT 1', [uid]);
            name = rows?.[0]?.username;
            if (!name) return [];
        }

        const [defs] = await db.execute(
            `SELECT a.achievement_id, a.code, a.name, a.metric, a.threshold, a.reward_money
               FROM achievements a
              WHERE a.is_active = 1 AND a.metric IS NOT NULL
                AND NOT EXISTS (SELECT 1 FROM user_achievements ua
                                 WHERE ua.user_id = ? AND ua.achievement_id = a.achievement_id)`,
            [uid]
        );
        if (defs.length === 0) return [];

        const metrics = await computeAchievementMetrics(uid, name);
        const unlocked = [];

        for (const def of defs) {
            const value = Number(metrics[def.metric]);
            if (!Number.isFinite(value) || value < Number(def.threshold)) continue;

            // Two events finishing at once must not double-award, so the insert
            // itself is the guard rather than the SELECT above.
            const [ins] = await db.execute(
                `INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
                 SELECT ?, ?, CURRENT_TIMESTAMP
                  WHERE NOT EXISTS (SELECT 1 FROM user_achievements
                                     WHERE user_id = ? AND achievement_id = ?)`,
                [uid, def.achievement_id, uid, def.achievement_id]
            );
            if (!ins || ins.affectedRows === 0) continue;

            const reward = Math.round(Number(def.reward_money || 0));
            if (reward > 0) {
                await applyXpRewardToUser(db, uid, 0, reward);
            }
            unlocked.push({ achievement_id: def.achievement_id, code: def.code, name: def.name, reward });
            console.log(`🏆 ${name} unlocked "${def.name}" (+${reward} coins)`);
        }

        return unlocked;
    } catch (err) {
        console.error(`⚠️ achievement check failed for user ${userId} (the action itself still succeeded):`, describeError(err));
        return [];
    }
}

const getLearningModeConfig = (mode = 'exercise') => {
    const normalizedMode = String(mode || 'exercise').trim().toLowerCase();
    if (normalizedMode === 'challenge') {
        return {
            mode: 'challenge',
            sectionLabel: 'Hard Challenge',
            subtitle: 'Challenge',
            accent: 'rose',
            rewardXpRange: [220, 420],
            rewardCoinsRange: [60, 120],
        };
    }
    return {
        mode: 'exercise',
        sectionLabel: 'Exercise',
        subtitle: 'Debug Lab',
        accent: 'blue',
        rewardXpRange: [90, 180],
        rewardCoinsRange: [20, 60],
    };
};

const buildFallbackLearningTask = (mode = 'exercise', level = 1) => {
    const config = getLearningModeConfig(mode);
    const numericLevel = Number(level || 1);

    if (config.mode === 'challenge') {
        return {
            title: numericLevel >= 4 ? 'Analyze Monthly Sales Trend' : 'Calculate VAT',
            sectionLabel: config.sectionLabel,
            subtitle: config.subtitle,
            accent: config.accent,
            instructions: numericLevel >= 4
                ? [
                    'รับตัวเลขยอดขาย 3 เดือนจากผู้ใช้ แล้วคำนวณค่าเฉลี่ยของยอดขาย',
                    'ตรวจสอบว่าเดือนล่าสุดสูงกว่าค่าเฉลี่ยหรือไม่',
                    'แสดงผลในรูปแบบ Average is [value] และ Trend is Rising/Falling',
                ]
                : [
                    'เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%',
                    'แสดงผลในรูปแบบ Total price with VAT is [value]',
                ],
            example: numericLevel >= 4
                ? { input: '100\n120\n150', output: 'Average is 123.33\nTrend is Rising' }
                : { input: '100', output: 'Total price with VAT is 107.0' },
            starterCode: numericLevel >= 4
                ? '# Write your code from scratch here!\n# Challenge: Analyze Monthly Sales Trend'
                : '# Write your code from scratch here!\n# Challenge: Calculate VAT',
            testCases: numericLevel >= 4
                ? [
                    { input: '100\n120\n150', expected: 'Average is 123.33\nTrend is Rising' },
                    { input: '90\n90\n80', expected: 'Average is 86.67\nTrend is Falling' },
                    { input: '50\n60\n60', expected: 'Average is 56.67\nTrend is Rising' },
                  ]
                : [
                    { input: '100', expected: 'Total price with VAT is 107.0' },
                    { input: '500', expected: 'Total price with VAT is 535.0' },
                    { input: '1500', expected: 'Total price with VAT is 1605.0' },
                  ],
            rewardXp: numericLevel >= 4 ? 320 : 240,
            rewardCoins: numericLevel >= 4 ? 95 : 70,
        };
    }

    return {
        title: numericLevel >= 3 ? 'Fix the Discount Checker' : 'Fix the Tax Calculator',
        sectionLabel: config.sectionLabel,
        subtitle: config.subtitle,
        accent: config.accent,
        instructions: numericLevel >= 3
            ? [
                'แก้ไขโค้ดให้รับราคาสินค้าและเปอร์เซ็นต์ส่วนลดจากผู้ใช้',
                'คำนวณราคาสุทธิหลังหักส่วนลดให้ถูกต้อง',
                'แสดงผลในรูปแบบ Final price is [value]',
            ]
            : [
                'แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%',
                'ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]',
            ],
        example: numericLevel >= 3
            ? { input: '1000\n10', output: 'Final price is 900.0' }
            : { input: '10000', output: 'Tax is 700.0' },
        starterCode: numericLevel >= 3
            ? 'price = float(input("Enter price: "))\ndiscount = float(input("Enter discount percent: "))\nfinal_price = price * (discount / 100)\nprint(f"Final price is {final_price}")'
            : 'salary = int(input("Enter salary: "))\ntax = salary * 7\nprint(f"Tax is {tax}")',
        testCases: numericLevel >= 3
            ? [
                { input: '1000\n10', expected: 'Final price is 900.0' },
                { input: '850\n20', expected: 'Final price is 680.0' },
                { input: '500\n5', expected: 'Final price is 475.0' },
              ]
            : [
                { input: '10000', expected: 'Tax is 700.0' },
                { input: '500', expected: 'Tax is 35.0' },
                { input: '150000', expected: 'Tax is 10500.0' },
              ],
        rewardXp: numericLevel >= 3 ? 150 : 110,
        rewardCoins: numericLevel >= 3 ? 45 : 25,
    };
};

const normalizeGeneratedLearningTask = (task, mode = 'exercise', level = 1) => {
    const config = getLearningModeConfig(mode);
    const fallback = buildFallbackLearningTask(mode, level);
    const instructions = Array.isArray(task?.instructions) ? task.instructions.filter(Boolean) : fallback.instructions;
    const tests = Array.isArray(task?.testCases) ? task.testCases.filter((test) => test?.expected != null) : fallback.testCases;
    const example = task?.example && typeof task.example === 'object' ? task.example : fallback.example;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value || min)));

    return {
        title: String(task?.title || fallback.title).trim(),
        sectionLabel: config.sectionLabel,
        subtitle: config.subtitle,
        accent: config.accent,
        instructions: instructions.length > 0 ? instructions.slice(0, 4).map((item) => String(item).trim()) : fallback.instructions,
        example: {
            input: String(example?.input ?? fallback.example.input),
            output: String(example?.output ?? fallback.example.output),
        },
        starterCode: String(task?.starterCode || fallback.starterCode),
        testCases: (tests.length > 0 ? tests : fallback.testCases).slice(0, 5).map((test) => ({
            input: String(test.input ?? ''),
            expected: String(test.expected ?? ''),
        })),
        rewardXp: clamp(task?.rewardXp, config.rewardXpRange[0], config.rewardXpRange[1]),
        rewardCoins: clamp(task?.rewardCoins, config.rewardCoinsRange[0], config.rewardCoinsRange[1]),
    };
};

const generateLearningTaskWithAI = async ({ mode = 'exercise', level = 1 }) => {
    const config = getLearningModeConfig(mode);
    const descriptiveLevel = normalizePlayerLevel(level);
    const prompt = config.mode === 'challenge'
        ? `
You are a game designer for a Python learning platform.
Create ONE challenge task for a ${descriptiveLevel} learner.

Return ONLY valid JSON with this exact structure:
{
  "title": "short challenge title",
  "instructions": ["step 1", "step 2"],
  "example": { "input": "sample input", "output": "sample output" },
  "starterCode": "# only comments or a very small scaffold, do not solve it",
  "testCases": [
    { "input": "sample input", "expected": "exact expected output" }
  ],
  "rewardXp": 250,
  "rewardCoins": 70
}

Rules:
- The task must be solvable in one Python file.
- Use beginner/intermediate/advanced Python topics based on level.
- Generate 3 or 4 test cases.
- The expected outputs must be exact strings.
- Do not include markdown fences.
- Do not use external libraries.
`
        : `
You are a game designer for a Python learning platform.
Create ONE debug-lab task for a ${descriptiveLevel} learner.

Return ONLY valid JSON with this exact structure:
{
  "title": "short debug task title",
  "instructions": ["step 1", "step 2"],
  "example": { "input": "sample input", "output": "sample output" },
  "starterCode": "buggy python code that should almost work but contains 1-3 real mistakes",
  "testCases": [
    { "input": "sample input", "expected": "exact expected output" }
  ],
  "rewardXp": 120,
  "rewardCoins": 30
}

Rules:
- The starterCode MUST be intentionally buggy.
- The player should fix the existing code instead of writing a totally unrelated solution.
- Generate 3 or 4 test cases.
- The expected outputs must be exact strings.
- Do not include markdown fences.
- Do not use external libraries.
`;

    try {
        const rawText = await callAiChat({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            maxTokens: 2200,
            thinking: false,
        });

        const jsonBlock = extractFirstJsonBlock(rawText);
        const parsed = safeJsonParse(jsonBlock, null);
        if (!parsed) {
            throw new Error('AI task response is not valid JSON');
        }

        return normalizeGeneratedLearningTask(parsed, mode, level);
    } catch (error) {
        // Never fatal: a built-in task is a far better outcome for the learner
        // than an error screen, so the endpoint keeps working while the model is down.
        console.error(`⚠️ AI learning task generation failed for ${mode}, serving the built-in task instead:`, error.message);
        return normalizeGeneratedLearningTask({}, mode, level);
    }
};

// Draw a real problem out of the shared bank for the Challenge / Debug Lab
// pages, in the same shape generateLearningTaskWithAI() returns.
//
// Those two pages used to ask the model for a brand new problem every time.
// That has two costs a learner pays directly: a generated problem has never
// been run by anyone, so it can be unsolvable or its expected output can be
// wrong; and it burns chatbot tokens on every page load. The bank's 94
// auto-gradable lesson problems have all been verified against their own
// reference solutions by `npm run test:tasks`, so a problem drawn from here is
// known to be solvable.
//
// Restricted to `stdio` problems on purpose: this task record has no column
// saying how to run its test cases, and the submit endpoint grades everything
// as stdin/stdout. A `function` problem drawn in here would mark correct
// answers wrong.
//
// Returns null when the bank has nothing to offer, and the caller falls back to
// the model.
const drawLearningTaskFromBank = async ({ userId, mode, level }) => {
    const config = getLearningModeConfig(mode);
    // Later chapters unlock as the learner levels up, so a beginner is not
    // handed a problem about decorators on their first visit. The gate is
    // dropped entirely if it leaves nothing to draw.
    const lessonCeiling = Math.max(3, Math.min(24, Number(level || 1) * 3));

    const select = async (useGate) => {
        const [rows] = await db.query(
            `SELECT m.problem_id, m.xp_reward, m.coin_reward, m.lesson_id,
                    p.title_th, p.desc_th, p.starter_code, p.test_cases
               FROM problem_modes m
               JOIN problems p ON p.problem_id = m.problem_id
              WHERE m.mode = 'lesson'
                AND COALESCE(m.is_active, 1) = 1
                AND p.is_auto_gradable = 1
                AND p.test_kind = 'stdio'
                AND jsonb_array_length(p.test_cases) > 0
                ${useGate ? 'AND m.lesson_id <= ?' : ''}
                AND p.problem_id NOT IN (
                    SELECT problem_id FROM learning_ai_tasks
                     WHERE user_id = ? AND problem_id IS NOT NULL
                     ORDER BY updated_at DESC LIMIT 8
                )
              ORDER BY random()
              LIMIT 1`,
            useGate ? [lessonCeiling, userId] : [userId]
        );
        return rows?.[0] || null;
    };

    const row = (await select(true)) || (await select(false));
    if (!row) return null;

    const cases = Array.isArray(row.test_cases) ? row.test_cases : safeJsonParse(row.test_cases, []);
    if (!Array.isArray(cases) || cases.length === 0) return null;

    // The description is one block of prose; the page renders a numbered list.
    // Splitting on blank lines keeps the author's own paragraphing instead of
    // inventing steps that were never written.
    const instructions = String(row.desc_th || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const [xpMin] = config.rewardXpRange;
    const [coinMin] = config.rewardCoinsRange;

    return {
        problemId: Number(row.problem_id),
        title: row.title_th,
        sectionLabel: config.sectionLabel,
        subtitle: config.subtitle,
        accent: config.accent,
        instructions: instructions.length ? instructions : [String(row.desc_th || '').trim()],
        example: {
            input: String(cases[0]?.input ?? ''),
            output: String(cases[0]?.expected ?? ''),
        },
        starterCode: row.starter_code || '',
        testCases: cases,
        // The bank's own reward for the problem, so the same problem is worth
        // the same wherever it is met. Floored at the mode's minimum, since a
        // Hard Challenge paying a first-chapter lesson's six coins would read
        // as broken.
        rewardXp: Math.max(Number(row.xp_reward || 0), xpMin),
        rewardCoins: Math.max(Number(row.coin_reward || 0), coinMin),
    };
};

const serializeLearningTask = (row) => {
    const instructions = safeJsonParse(row.instructions_json, []);
    const testCases = safeJsonParse(row.test_cases_json, []);
    return {
        taskId: row.task_id,
        userId: row.user_id,
        mode: row.mode,
        title: row.title,
        sectionLabel: row.section_label,
        subtitle: row.subtitle,
        accent: row.accent,
        instructions: Array.isArray(instructions) ? instructions : [],
        example: {
            input: row.example_input || '',
            output: row.example_output || '',
        },
        starterCode: row.starter_code || '',
        testCases: Array.isArray(testCases) ? testCases : [],
        rewardXp: Number(row.reward_xp || 0),
        rewardCoins: Number(row.reward_coins || 0),
        rerollsUsed: Number(row.rerolls_used || 0),
        maxRerolls: Number(row.max_rerolls || 3),
        rerollsRemaining: Math.max(0, Number(row.max_rerolls || 3) - Number(row.rerolls_used || 0)),
        status: row.status,
        completedAt: row.completed_at,
    };
};

const createLearningTaskRecord = async (executor, { userId, mode, level }) => {
    // The bank first, the model only when the bank has nothing left to give.
    // A banked problem has been run against its own reference solution; a
    // generated one has never been run by anybody.
    const generatedTask = (await drawLearningTaskFromBank({ userId, mode, level }))
        || await generateLearningTaskWithAI({ mode, level });
    const config = getLearningModeConfig(mode);
    const [insertResult] = await executor.execute(
        `INSERT INTO learning_ai_tasks
        (user_id, mode, title, section_label, subtitle, accent, instructions_json, example_input, example_output, starter_code, test_cases_json, reward_xp, reward_coins, rerolls_used, max_rerolls, status, ai_payload, problem_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 3, 'ACTIVE', ?, ?) RETURNING task_id`,
        [
            userId,
            config.mode,
            generatedTask.title,
            generatedTask.sectionLabel,
            generatedTask.subtitle,
            generatedTask.accent,
            JSON.stringify(generatedTask.instructions),
            generatedTask.example.input,
            generatedTask.example.output,
            generatedTask.starterCode,
            JSON.stringify(generatedTask.testCases),
            generatedTask.rewardXp,
            generatedTask.rewardCoins,
            JSON.stringify(generatedTask),
            generatedTask.problemId ?? null,
        ]
    );

    // db.js only hands back real row arrays for SELECT; every other statement -
    // RETURNING clause or not - collapses to a { rowCount, affectedRows, insertId }
    // summary. Reading that as `insertResult[0].task_id` therefore threw
    // "Cannot read properties of undefined (reading 'task_id')" on EVERY new task,
    // with or without a working AI, which is what made this endpoint 500.
    const insertId = insertResult?.insertId || insertResult?.[0]?.task_id;
    if (!insertId) {
        throw new Error('learning_ai_tasks insert returned no task_id');
    }
    const [rows] = await executor.execute('SELECT * FROM learning_ai_tasks WHERE task_id = ?', [insertId]);
    if (!rows || rows.length === 0) {
        throw new Error(`learning_ai_tasks row ${insertId} vanished right after insert`);
    }
    return serializeLearningTask(rows[0]);
};

// Endpoints Ported



// Returns the equipped cosmetics alongside the account, which is what
// ThemeContext (theme_asset_url, equipped_theme_id) and MouseEffectLayer
// (mouse_effect_data) read. Taken from Person 1's branch; the version that was
// here selected only the plain account columns, so a purchased theme or cursor
// stopped applying as soon as the page reloaded.
app.get('/api/user/profile/:userId', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT u.user_id, u.username, u.email, u.role, u.level, u.xp, u.virtual_currency,
                    u.equipped_mouse_effect_id, u.equipped_theme_id, u.equipped_profile_frame_id,
                    COALESCE(item.effects, '[]') AS mouse_effect_data,
                    theme.name AS theme_name, theme.asset_url AS theme_asset_url, theme.preview_image AS theme_preview_image,
                    frame.asset_url AS profile_asset_url, frame.preview_image AS profile_preview_image
             FROM users u
             LEFT JOIN shop_items item ON item.item_id = u.equipped_mouse_effect_id
             LEFT JOIN shop_items theme ON theme.item_id = u.equipped_theme_id
             LEFT JOIN shop_items frame ON frame.item_id = u.equipped_profile_frame_id
             WHERE u.user_id = ?
             LIMIT 1`,
            [req.params.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = rows[0];
        // shop_items.effects is jsonb and arrives already decoded; the original
        // MySQL version parsed it here, which threw and left every equipped cursor
        // looking like it had no effects at all.
        user.mouse_effect_data = safeJsonParse(user.mouse_effect_data, []) || [];

        const streakDays = await computeUserStreak(db, req.params.userId);

        res.json({
            ...user,
            level: Number(user.level ?? 1),
            xp: Number(user.xp || 0),
            virtual_currency: Number(user.virtual_currency || 0),
            streak_days: streakDays,
        });
    } catch (error) {
        console.error('❌ /api/user/profile error:', error.message);
        res.status(500).json({ error: 'Failed to load user profile' });
    }
});

// ==========================================================================
// Everything the profile page shows, in one request: the account, how far
// through the curriculum this player is, their achievements, and their Arcade
// record. Assembled here rather than by the page firing six requests, so the
// figures on screen are all from the same moment.
// ==========================================================================
app.get('/api/profile/:userId', async (req, res) => {
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    try {
        const [userRows] = await db.execute(
            `SELECT user_id, username, email, role, level, xp, virtual_currency, created_at,
                    equipped_theme_id, equipped_profile_frame_id, equipped_mouse_effect_id
               FROM users WHERE user_id = ? LIMIT 1`,
            [userId]
        );
        if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = userRows[0];

        const [[frameRow]] = await db.execute(
            'SELECT asset_url FROM shop_items WHERE item_id = ? LIMIT 1',
            [user.equipped_profile_frame_id || 0]
        ).catch(() => [[null]]);

        // --- curriculum -----------------------------------------------------
        // A lesson's progress is measured against what it actually contains: the
        // pre-quiz, the post-quiz, and however many exercises hang off it. There
        // is no per-slide tracking in the schema, so those are the honest steps.
        const [modules] = await db.execute(
            'SELECT module_id, title, order_index, required_level FROM modules ORDER BY order_index, module_id'
        );
        const [lessons] = await db.execute(
            'SELECT lesson_id, module_id, title, order_index FROM lessons ORDER BY order_index, lesson_id'
        );
        const [exerciseCounts] = await db.execute(
            'SELECT lesson_id, COUNT(*) AS total FROM exercises GROUP BY lesson_id'
        );
        const [passedCounts] = await db.execute(
            `SELECT e.lesson_id, COUNT(DISTINCT s.exercise_id) AS passed
               FROM exercise_submissions s
               JOIN exercises e ON e.exercise_id = s.exercise_id
              WHERE s.user_id = ? AND s.is_passed = 1
              GROUP BY e.lesson_id`,
            [userId]
        );
        const [attemptedCounts] = await db.execute(
            `SELECT e.lesson_id, COUNT(DISTINCT s.exercise_id) AS attempted
               FROM exercise_submissions s
               JOIN exercises e ON e.exercise_id = s.exercise_id
              WHERE s.user_id = ?
              GROUP BY e.lesson_id`,
            [userId]
        );
        const [quizAttempts] = await db.execute(
            `SELECT lesson_id, quiz_type, score, total_questions, updated_at, completed_at
               FROM lesson_quiz_attempts WHERE user_id = ?`,
            [userId]
        );
        // Which quizzes each lesson HAS, which is a different question from which
        // ones this learner has taken: five lessons ship without a post-test.
        const [quizKindRows] = await db.execute('SELECT lesson_id, quiz_type FROM lesson_quizzes');

        const exTotal = new Map(exerciseCounts.map(r => [Number(r.lesson_id), Number(r.total)]));
        const exPassed = new Map(passedCounts.map(r => [Number(r.lesson_id), Number(r.passed)]));
        const exAttempted = new Map(attemptedCounts.map(r => [Number(r.lesson_id), Number(r.attempted)]));
        const quizKinds = new Map();
        for (const row of quizKindRows) {
            const key = Number(row.lesson_id);
            if (!quizKinds.has(key)) quizKinds.set(key, new Set());
            quizKinds.get(key).add(String(row.quiz_type).toLowerCase());
        }
        const quizByLesson = new Map();
        for (const a of quizAttempts) {
            const key = Number(a.lesson_id);
            if (!quizByLesson.has(key)) quizByLesson.set(key, {});
            quizByLesson.get(key)[String(a.quiz_type).toLowerCase()] = a;
        }

        let lastTouchedAt = null;
        let lastTouchedLesson = null;

        const lessonProgress = lessons.map((lesson) => {
            const id = Number(lesson.lesson_id);
            const quizzes = quizByLesson.get(id) || {};
            const pre = quizzes.pre || null;
            const post = quizzes.post || null;
            const progress = evaluateLesson({
                pre,
                post,
                hasPreQuiz: quizKinds.get(id)?.has('pre') || false,
                hasPostQuiz: quizKinds.get(id)?.has('post') || false,
                exercisesTotal: exTotal.get(id) || 0,
                exercisesPassed: exPassed.get(id) || 0,
                exercisesAttempted: exAttempted.get(id) || 0,
            });
            const { status, percent, postPassed, exercisesTotal, exercisesPassed } = progress;

            for (const stamp of [pre?.updated_at, pre?.completed_at, post?.updated_at, post?.completed_at]) {
                if (!stamp) continue;
                const at = new Date(stamp).getTime();
                if (Number.isFinite(at) && (lastTouchedAt === null || at > lastTouchedAt)) {
                    lastTouchedAt = at;
                    lastTouchedLesson = id;
                }
            }

            return {
                lesson_id: id,
                module_id: Number(lesson.module_id),
                title: lesson.title,
                order_index: Number(lesson.order_index || 0),
                status,
                percent,
                pre_score: pre ? { score: Number(pre.score), total: Number(pre.total_questions) } : null,
                post_score: post ? { score: Number(post.score), total: Number(post.total_questions), passed: postPassed } : null,
                exercises_total: exercisesTotal,
                exercises_passed: exercisesPassed,
            };
        });

        const byModule = modules.map((m) => {
            const own = lessonProgress.filter(l => l.module_id === Number(m.module_id));
            const done = own.filter(l => l.status === 'done').length;
            return {
                module_id: Number(m.module_id),
                title: m.title,
                required_level: Number(m.required_level || 0),
                lessons_total: own.length,
                lessons_done: done,
                percent: own.length > 0 ? Math.round((own.reduce((sum, l) => sum + l.percent, 0) / own.length)) : 0,
            };
        });

        // "Currently studying" is the lesson last worked on that is not finished;
        // failing that, the first one not yet started. Both beat guessing.
        let current = lessonProgress.find(l => l.lesson_id === lastTouchedLesson && l.status !== 'done')
            || lessonProgress.find(l => l.status === 'in_progress')
            || lessonProgress.find(l => l.status === 'not_started')
            || null;

        const lessonsDone = lessonProgress.filter(l => l.status === 'done').length;
        const lessonsInProgress = lessonProgress.filter(l => l.status === 'in_progress').length;
        const exercisesTotalAll = [...exTotal.values()].reduce((a, b) => a + b, 0);
        const exercisesPassedAll = lessonProgress.reduce((sum, l) => sum + l.exercises_passed, 0);

        // --- achievements ---------------------------------------------------
        const [achievements] = await db.execute(
            `SELECT a.achievement_id, a.code, a.icon, a.name, a.description, a.difficulty,
                    a.reward_money, a.metric, a.threshold, ua.unlocked_at
               FROM achievements a
               LEFT JOIN user_achievements ua
                      ON ua.achievement_id = a.achievement_id AND ua.user_id = ?
              WHERE a.is_active = 1
              ORDER BY (ua.unlocked_at IS NULL), a.achievement_id`,
            [userId]
        );
        const [showcaseRows] = await db.execute(
            `SELECT achievement_id, display_order FROM user_profile_showcase
              WHERE user_id = ? ORDER BY display_order, achievement_id`,
            [userId]
        );
        const showcaseOrder = new Map(showcaseRows.map(r => [Number(r.achievement_id), Number(r.display_order)]));

        const achievementItems = achievements.map(a => ({
            achievement_id: Number(a.achievement_id),
            code: a.code,
            icon: a.icon || '🏆',
            name: a.name,
            description: a.description,
            difficulty: a.difficulty,
            reward: Number(a.reward_money || 0),
            metric: a.metric,
            threshold: Number(a.threshold || 0),
            unlocked: Boolean(a.unlocked_at),
            unlocked_at: a.unlocked_at || null,
            showcased: showcaseOrder.has(Number(a.achievement_id)),
        }));

        // --- arcade ---------------------------------------------------------
        const [statRows] = await db.execute(
            `SELECT matches_played, wins, best_rank, total_score, total_cash_earned
               FROM arcade_player_stats WHERE user_name = ? LIMIT 1`,
            [user.username]
        );
        const st = statRows[0] || {};
        const matchesPlayed = Number(st.matches_played || 0);
        const wins = Number(st.wins || 0);

        const [historyRows] = await db.execute(
            `SELECT room_id, room_code, room_name, difficulty, round_duration_mode,
                    COUNT(*) AS rounds_played,
                    SUM(round_score) AS match_score,
                    SUM(pass_count) AS tests_passed,
                    SUM(total_count) AS tests_total,
                    MAX(match_ended_at) AS ended_at
               FROM arcade_round_history
              WHERE user_name = ? AND match_ended_at IS NOT NULL
              GROUP BY room_id, room_code, room_name, difficulty, round_duration_mode
              ORDER BY MAX(match_ended_at) DESC
              LIMIT 10`,
            [user.username]
        );

        const level = Number(user.level || 1);
        const xp = Number(user.xp || 0);
        const xpIntoLevel = xp % 1000;
        const streakDays = await computeUserStreak(db, userId);

        res.json({
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                virtual_currency: Number(user.virtual_currency || 0),
                profile_frame_url: frameRow?.asset_url || null,
            },
            progression: {
                level,
                xp,
                xp_into_level: xpIntoLevel,
                xp_needed_this_level: 1000,
                xp_percent: Math.min(100, Math.round((xpIntoLevel / 1000) * 100)),
                skill_tier: normalizePlayerLevel(level),
                streak_days: streakDays,
            },
            learning: {
                modules: byModule,
                lessons: lessonProgress,
                summary: {
                    lessons_total: lessonProgress.length,
                    lessons_done: lessonsDone,
                    lessons_in_progress: lessonsInProgress,
                    exercises_total: exercisesTotalAll,
                    exercises_passed: exercisesPassedAll,
                    percent: lessonProgress.length > 0
                        ? Math.round(lessonProgress.reduce((sum, l) => sum + l.percent, 0) / lessonProgress.length)
                        : 0,
                    current_lesson: current,
                },
            },
            achievements: {
                total: achievementItems.length,
                unlocked: achievementItems.filter(a => a.unlocked).length,
                // What this player chose to display. Empty means they have not
                // chosen; the page falls back to their most recent unlocks so a
                // profile is never blank just because nobody picked anything.
                showcase: [...showcaseOrder.keys()]
                    .map(id => achievementItems.find(a => a.achievement_id === id))
                    .filter(a => a && a.unlocked),
                max_showcase: PROFILE_SHOWCASE_MAX,
                items: achievementItems,
            },
            arcade: {
                matches_played: matchesPlayed,
                wins,
                losses: Math.max(0, matchesPlayed - wins),
                win_rate: matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0,
                best_rank: st.best_rank !== undefined && st.best_rank !== null ? Number(st.best_rank) : null,
                total_score: Number(st.total_score || 0),
                total_cash_earned: Number(st.total_cash_earned || 0),
                recent_matches: historyRows.map(r => ({
                    room_id: Number(r.room_id),
                    room_code: r.room_code,
                    room_name: r.room_name,
                    difficulty: r.difficulty,
                    round_duration_mode: r.round_duration_mode,
                    rounds_played: Number(r.rounds_played || 0),
                    match_score: Number(r.match_score || 0),
                    tests_passed: Number(r.tests_passed || 0),
                    tests_total: Number(r.tests_total || 0),
                    ended_at: r.ended_at,
                })),
            },
        });
    } catch (error) {
        console.error('❌ /api/profile error:', describeError(error));
        res.status(500).json({ error: 'Failed to load profile' });
    }
});

// How many achievements a player may pin to their profile. Small on purpose:
// a showcase that holds everything is the same as no showcase.
const PROFILE_SHOWCASE_MAX = 6;

// Replaces the player's chosen achievements in one go. Only unlocked ones can be
// pinned — otherwise a profile could advertise something never earned.
app.put('/api/profile/:userId/showcase', async (req, res) => {
    const userId = Number(req.params.userId);
    const ids = Array.isArray(req.body?.achievement_ids) ? req.body.achievement_ids : null;
    if (!userId || !ids) {
        return res.status(400).json({ error: 'userId and achievement_ids are required' });
    }
    // Deduplicate before counting: the same id sent twice is still one pick.
    const wanted = [...new Set(ids.map(Number).filter(Number.isFinite))];
    if (wanted.length > PROFILE_SHOWCASE_MAX) {
        return res.status(400).json({ error: `เลือกได้สูงสุด ${PROFILE_SHOWCASE_MAX} รายการ`, max: PROFILE_SHOWCASE_MAX });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        if (wanted.length > 0) {
            const placeholders = wanted.map(() => '?').join(', ');
            const [owned] = await connection.execute(
                `SELECT achievement_id FROM user_achievements
                  WHERE user_id = ? AND achievement_id IN (${placeholders})`,
                [userId, ...wanted]
            );
            if (owned.length !== wanted.length) {
                await connection.rollback();
                return res.status(400).json({ error: 'เลือกได้เฉพาะความสำเร็จที่ปลดล็อกแล้ว' });
            }
        }

        await connection.execute('DELETE FROM user_profile_showcase WHERE user_id = ?', [userId]);
        for (let i = 0; i < wanted.length; i += 1) {
            await connection.execute(
                'INSERT INTO user_profile_showcase (user_id, achievement_id, display_order) VALUES (?, ?, ?)',
                [userId, wanted[i], i]
            );
        }

        await connection.commit();
        res.json({ success: true, achievement_ids: wanted });
    } catch (err) {
        await connection.rollback();
        console.error('❌ PUT /api/profile/:userId/showcase error:', describeError(err));
        res.status(500).json({ error: 'บันทึกความสำเร็จที่เลือกไม่สำเร็จ' });
    } finally {
        connection.release();
    }
});

app.get('/api/learning/ai-task', async (req, res) => {
    const { userId, mode = 'exercise' } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const normalizedMode = getLearningModeConfig(mode).mode;
    try {
        await ensureLearningAiTaskSchema();
        const [existingRows] = await db.execute(
            `SELECT * FROM learning_ai_tasks
             WHERE user_id = ? AND mode = ? AND status = 'ACTIVE'
             ORDER BY updated_at DESC
             LIMIT 1`,
            [userId, normalizedMode]
        );
        if (existingRows.length > 0) {
            return res.json({ success: true, task: serializeLearningTask(existingRows[0]), source: 'existing' });
        }
        const [users] = await db.execute('SELECT level FROM users WHERE user_id = ? LIMIT 1', [userId]);
        const level = Number(users[0]?.level || 1);
        const task = await createLearningTaskRecord(db, { userId, mode: normalizedMode, level });
        res.json({ success: true, task, source: 'generated' });
    } catch (error) {
        console.error('❌ /api/learning/ai-task error:', describeError(error));
        res.status(500).json({ error: 'Failed to prepare AI task', detail: String(error?.message || error) });
    }
});

app.post('/api/learning/ai-task/reroll', async (req, res) => {
    const { userId, mode = 'exercise' } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const normalizedMode = getLearningModeConfig(mode).mode;
    try {
        await ensureLearningAiTaskSchema();
        const [taskRows] = await db.execute(
            `SELECT * FROM learning_ai_tasks
             WHERE user_id = ? AND mode = ? AND status = 'ACTIVE'
             ORDER BY updated_at DESC
             LIMIT 1`,
            [userId, normalizedMode]
        );
        if (taskRows.length === 0) {
            return res.status(404).json({ error: 'No active task to reroll' });
        }
        const currentTask = taskRows[0];
        const maxRerolls = Number(currentTask.max_rerolls || 3);
        const rerollsUsed = Number(currentTask.rerolls_used || 0);
        if (rerollsUsed >= maxRerolls) {
            return res.status(400).json({ error: 'Reroll limit reached', rerollsRemaining: 0 });
        }
        const [users] = await db.execute('SELECT level FROM users WHERE user_id = ? LIMIT 1', [userId]);
        const level = Number(users[0]?.level || 1);
        // Same order as the first draw: bank, then model. The draw skips the
        // learner's last few problems, so a reroll actually changes the
        // problem rather than handing back what they just rejected.
        const generatedTask = (await drawLearningTaskFromBank({ userId, mode: normalizedMode, level }))
            || await generateLearningTaskWithAI({ mode: normalizedMode, level });
        const nextRerollCount = rerollsUsed + 1;

        await db.execute(
            `UPDATE learning_ai_tasks
             SET title = ?, section_label = ?, subtitle = ?, accent = ?, instructions_json = ?, example_input = ?, example_output = ?,
                 starter_code = ?, test_cases_json = ?, reward_xp = ?, reward_coins = ?, rerolls_used = ?, ai_payload = ?,
                 problem_id = ?, updated_at = CURRENT_TIMESTAMP
             WHERE task_id = ?`,
            [
                generatedTask.title,
                generatedTask.sectionLabel,
                generatedTask.subtitle,
                generatedTask.accent,
                JSON.stringify(generatedTask.instructions),
                generatedTask.example.input,
                generatedTask.example.output,
                generatedTask.starterCode,
                JSON.stringify(generatedTask.testCases),
                generatedTask.rewardXp,
                generatedTask.rewardCoins,
                nextRerollCount,
                JSON.stringify(generatedTask),
                generatedTask.problemId ?? null,
                currentTask.task_id,
            ]
        );
        const [updatedRows] = await db.execute('SELECT * FROM learning_ai_tasks WHERE task_id = ?', [currentTask.task_id]);
        res.json({ success: true, task: serializeLearningTask(updatedRows[0]) });
    } catch (error) {
        console.error('❌ /api/learning/ai-task/reroll error:', describeError(error));
        res.status(500).json({ error: 'Failed to reroll AI task', detail: String(error?.message || error) });
    }
});

app.post('/api/learning/ai-task/submit', async (req, res) => {
    const { userId, taskId, mode = 'exercise', code } = req.body || {};
    if (!userId || !taskId) return res.status(400).json({ error: 'userId and taskId are required' });
    // `passed` used to come from the request body, so posting {passed:true}
    // collected the reward without writing any code. The submitted code is
    // graded below instead, against the task's own stored test cases.
    if (!String(code || '').trim()) {
        return res.status(400).json({ error: 'ต้องส่งโค้ดมาให้ตรวจก่อน' });
    }

    const normalizedMode = getLearningModeConfig(mode).mode;

    // Read and grade BEFORE opening a transaction. Grading spawns Python once
    // per test case, serially, each with its own timeout, so doing it inside a
    // transaction pinned a pooled connection for the whole run - ten slow
    // submissions were enough to starve every other request on the site.
    await ensureLearningAiTaskSchema();
    const [preTaskRows] = await db.execute(
        `SELECT * FROM learning_ai_tasks
         WHERE task_id = ? AND user_id = ? AND mode = ? AND status = 'ACTIVE'
         LIMIT 1`,
        [taskId, userId, normalizedMode]
    );
    if (preTaskRows.length === 0) {
        return res.status(404).json({ error: 'Active task not found' });
    }

    const gradedVerdict = await judgeLearnerSubmission({
        problem: {
            test_kind: 'stdio',
            test_cases: safeJsonParse(preTaskRows[0].test_cases_json, []),
            is_auto_gradable: 1,
        },
        code,
    });
    if (!gradedVerdict.accepted) {
        return res.status(400).json({
            error: 'ยังผ่านไม่ครบทุกเทสเคส',
            detail: gradedVerdict.reason,
            passed: gradedVerdict.passedCount ?? 0,
            total: gradedVerdict.totalCount ?? 0,
            results: gradedVerdict.results || [],
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Re-read inside the transaction: another request may have completed
        // this task while Python was running.
        const [taskRows] = await connection.execute(
            `SELECT * FROM learning_ai_tasks
             WHERE task_id = ? AND user_id = ? AND mode = ? AND status = 'ACTIVE'
             LIMIT 1`,
            [taskId, userId, normalizedMode]
        );

        if (taskRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Active task not found' });
        }

        const task = taskRows[0];

        await connection.execute(
            `UPDATE learning_ai_tasks
             SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE task_id = ?`,
            [taskId]
        );

        const [userRows] = await connection.execute(
            'SELECT user_id, username, level, xp, virtual_currency FROM users WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];
        const nextXp = Number(user.xp || 0) + Number(task.reward_xp || 0);
        const nextCoins = Number(user.virtual_currency || 0) + Number(task.reward_coins || 0);
        const computedLevel = computeLevelFromXp(nextXp);
        const nextLevel = Math.max(Number(user.level || 1), computedLevel);

        await connection.execute(
            'UPDATE users SET xp = ?, virtual_currency = ?, level = ? WHERE user_id = ?',
            [nextXp, nextCoins, nextLevel, userId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: normalizedMode === 'challenge' ? 'ผ่าน Challenge และได้รับรางวัลแล้ว' : 'แก้โจทย์สำเร็จและได้รับรางวัลแล้ว',
            reward: {
                xp: Number(task.reward_xp || 0),
                coins: Number(task.reward_coins || 0),
            },
            user: {
                ...user,
                level: nextLevel,
                xp: nextXp,
                virtual_currency: nextCoins,
            },
        });
    } catch (error) {
        await connection.rollback();
        console.error('❌ /api/learning/ai-task/submit error:', describeError(error));
        res.status(500).json({ error: 'Failed to submit learning task', detail: String(error?.message || error) });
    } finally {
        connection.release();
    }
});


// Adding a problem means two rows: the problem itself, and the registration
// that offers it to a mode. The four historical table names are read-only views
// over that pair now (see server/problemsSchema.js), so every insert goes
// through here.
//
// entry_id continues each mode's own numbering rather than being global, because
// that is the id every existing foreign key, saved room and stored progress row
// already refers to.
async function createProblem(mode, {
    titleTh, titleEn = null, descTh = '', descEn = null,
    hintTh = null, hintEn = null,
    starterCode = null, solutionCode = null,
    testKind = 'stdio', testCases = [],
    lessonId = null, orderIndex = null, difficulty = null,
    xpReward = 0, coinReward = 0, timeLimitSec = null, expiresAt = null,
    extra = {}, createdBy = null, isActive = 1,
} = {}) {
    // One transaction, and one writer at a time per mode.
    //
    // This used to be two independent statements: insert the problem, then read
    // COALESCE(MAX(entry_id), 0) + 1 and insert the registration. Two admins
    // creating a problem at the same moment read the same maximum, so the
    // second INSERT hit the (mode, entry_id) primary key and returned 500 -
    // leaving a problem row with no registration behind: invisible in every
    // mode, while permanently holding an id the schema says can never be reused.
    //
    // The advisory lock is released when the transaction ends and is scoped to
    // the mode, so creating in two different modes still runs in parallel.
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute('SELECT pg_advisory_xact_lock(hashtext(?))', [`problem_modes:${mode}`]);

        const [ins] = await connection.execute(
            `INSERT INTO problems (title_th, title_en, desc_th, desc_en, hint_th, hint_en,
                                   starter_code, solution_code, test_kind, test_cases, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?) RETURNING problem_id`,
            [titleTh, titleEn, descTh, descEn, hintTh, hintEn,
             starterCode, solutionCode, testKind,
             typeof testCases === 'string' ? testCases : JSON.stringify(testCases),
             createdBy]
        );
        const problemId = ins.insertId;

        const [nextRows] = await connection.execute(
            `SELECT COALESCE(MAX(entry_id), 0) + 1 AS id FROM problem_modes WHERE mode = ?`, [mode]);
        const entryId = Number(nextRows[0].id);

        await connection.execute(
            `INSERT INTO problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty,
                                        xp_reward, coin_reward, time_limit_sec, expires_at, extra, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?)`,
            [mode, entryId, problemId, lessonId, orderIndex, difficulty,
             xpReward, coinReward, timeLimitSec, expiresAt, JSON.stringify(extra), isActive]
        );

        await connection.commit();
        return { problemId, entryId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Judge a submission on the server.
//
// Whether an answer is correct is decided HERE, by running the learner's code,
// not by whatever the browser claims. Both learning endpoints used to take the
// client's word for it: /api/exercises/:id/submit marked every submission passed
// without ever running it, and /api/learning/ai-task/submit read `passed`
// straight out of the request body, so posting {passed:true} collected the XP
// and coins for free.
//
// `is_auto_gradable = 0` problems are the documented exception. They teach
// Flask, matplotlib, requests, reading a file that must already exist, or
// random - none of which has one fixed correct output - so running them would
// fail learners who wrote a perfectly good answer. Those stay accepted on
// submission. scripts/mark-auto-gradable.js decides which is which by running
// every reference solution, so the exception list is computed, not assumed.
async function judgeLearnerSubmission({ problem, code }) {
    if (!problem) {
        return { accepted: false, graded: false, reason: 'ไม่พบโจทย์ข้อนี้' };
    }
    if (Number(problem.is_auto_gradable ?? 1) === 0) {
        // Accepted without a verdict, but not accepted unconditionally: an
        // empty string used to collect the full reward here. See
        // screenUnverifiedSubmission() for what still has to hold.
        const screened = await screenUnverifiedSubmission({ problem, code });
        return {
            accepted: screened.accepted,
            graded: false,
            reason: screened.reason || (screened.accepted ? 'โจทย์ข้อนี้ตรวจอัตโนมัติไม่ได้ จึงรับคำตอบไว้' : ''),
        };
    }

    const result = await gradeSubmission({ problem, code });
    return {
        accepted: result.allPassed,
        graded: true,
        passedCount: result.passed,
        totalCount: result.total,
        results: result.results,
        reason: result.allPassed ? '' : (result.error || `ผ่าน ${result.passed} จาก ${result.total} เทสเคส`),
    };
}

// ==========================================
// Password Validation Helper
// ==========================================
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('ต้องมีอย่างน้อย 8 ตัวอักษร');
    if (!/[A-Z]/.test(password)) errors.push('ต้องมีตัวพิมพ์ใหญ่ (A-Z)');
    if (!/[a-z]/.test(password)) errors.push('ต้องมีตัวพิมพ์เล็ก (a-z)');
    if (!/[0-9]/.test(password)) errors.push('ต้องมีตัวเลข (0-9)');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('ต้องมีอักขระพิเศษ');
    return errors;
};

// ==========================================
// Email Transporter (Nodemailer)
// ==========================================
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
});

// ถ้าไม่มี config ให้ใช้ Console Mode
const EMAIL_CONFIGURED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);


// ==========================================
// 1. API: Login / Register / User Management
// ==========================================

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (username, password_hash, email, role, level, xp, virtual_currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hash, email || null, 'user', 0, 0, 0]
        );
        res.status(201).json({ message: 'Register Success', user: { user_id: result.insertId, username, level: 1 } });
    } catch (err) {
        console.error('❌ Register Error:', err.message);
        res.status(500).json({ error: 'Username already exists', message: 'Username หรือ Email นี้ถูกใช้ไปแล้ว' });
    }
});

// Friend's Login API (compatible format)
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'กรุณากรอกอีเมลที่ถูกต้อง' });
    }

    // Server-side password validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
        return res.status(400).json({ message: `รหัสผ่านไม่ผ่านเกณฑ์: ${passwordErrors.join(', ')}` });
    }

    try {
        const [existing] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Username หรือ Email นี้ถูกใช้ไปแล้ว' });

        const hash = await bcrypt.hash(password, 10);
        // level = 0 → บังคับให้ทำ survey หลัง login
        const [result] = await db.execute(
            'INSERT INTO users (username, password_hash, email, role, level, xp, virtual_currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hash, email, 'user', 0, 0, 0]
        );

        // สร้าง Email Verification Token
        const verifyToken = crypto.randomBytes(32).toString('hex');
        await db.execute(
            'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
            [result.insertId, verifyToken]
        );

        // ส่ง Verification Email
        const verifyUrl = `${publicBaseUrl()}/api/verify-email/${verifyToken}`;
        if (EMAIL_CONFIGURED) {
            try {
                await emailTransporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: '🐍 Python Coder Game — ยืนยันอีเมล',
                    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px">
                        <h2>ยินดีต้อนรับ ${username}!</h2>
                        <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
                        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;font-weight:bold">ยืนยันอีเมล</a>
                        <p style="color:#888;margin-top:20px;font-size:12px">ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
                    </div>`
                });
                console.log(`📧 ส่ง Verification Email ไปที่ ${email}`);
            } catch (mailErr) {
                console.error(`⚠️ ไม่สามารถส่งอีเมลยืนยันได้ (SMTP Error):`, mailErr.message);
                console.log(`📧 [MOCK] Verification Link (เนื่องจาก SMTP ล้มเหลว): ${verifyUrl}`);
            }
        } else {
            console.log(`📧 [MOCK] Verification Link: ${verifyUrl}`);
        }

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ' });
    } catch (err) {
        console.error('❌ Register Error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length > 0 && await bcrypt.compare(password, users[0].password_hash)) {
            res.json({
                success: true,
                user_id: users[0].user_id,
                username: users[0].username,
                email: users[0].email,
                role: users[0].role || 'user',
                level: users[0].level || 1,
                xp: users[0].xp || 0,
                user: { 
                    id: users[0].user_id, 
                    user_id: users[0].user_id, 
                    username: users[0].username,
                    role: users[0].role || 'user',
                    level: users[0].level || 1,
                    xp: users[0].xp || 0
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('❌ Login Error:', err.message);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.post('/user/update', async (req, res) => {
    const { userId, newName } = req.body;
    try {
        await db.execute('UPDATE users SET username = ? WHERE user_id = ?', [newName, userId]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// ==========================================
// 3. API: Achievements & Game Rooms (ของเดิม)
// ==========================================

app.get('/achievements/:userId', async (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT a.*,
            (SELECT COUNT(*) FROM user_achievements ua WHERE ua.achievement_id = a.achievement_id) * 100.0 / (SELECT COUNT(*) FROM users) as global_percent,
            CASE WHEN ua_me.id IS NOT NULL THEN 1 ELSE 0 END as is_unlocked
        FROM achievements a
        LEFT JOIN user_achievements ua_me ON a.achievement_id = ua_me.achievement_id AND ua_me.user_id = ?
        ORDER BY CASE a.difficulty WHEN 'Medium' THEN 1 WHEN 'Hard' THEN 2 WHEN 'Very Hard' THEN 3 END ASC
    `;
    try {
        const [rows] = await db.execute(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error('❌ Achievements Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

app.get('/rooms', async (req, res) => {
    const { search } = req.query;
    let sql = `SELECT * FROM game_rooms WHERE status = 'WAITING'`;
    let params = [];
    if (search) {
        sql += ` AND room_name LIKE ?`;
        params.push(`%${search}%`);
    }
    try {
        const [rooms] = await db.execute(sql, params);
        res.json(rooms);
    } catch (err) {
        console.error('❌ Rooms Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

app.post('/rooms/create', async (req, res) => {
    const { roomName, maxPlayers, password, hostId } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [roomResult] = await connection.execute(
            'INSERT INTO game_rooms (room_name, host_user_id, room_password, max_players, current_players) VALUES (?, ?, ?, ?, 1)',
            [roomName, hostId, password || null, maxPlayers]
        );
        const roomId = roomResult.insertId;
        await connection.execute(
            'INSERT INTO room_participants (room_id, user_id, is_ready) VALUES (?, ?, 1)',
            [roomId, hostId]
        );
        await connection.commit();
        res.json({ roomId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Failed to create room' });
    } finally {
        connection.release();
    }
});

app.get('/rooms/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
        const [room] = await db.execute('SELECT * FROM game_rooms WHERE room_id = ?', [roomId]);
        if (room.length === 0) return res.status(404).json({ error: 'Room not found' });

        const [participants] = await db.execute(`
            SELECT u.user_id, u.username, rp.is_ready 
            FROM room_participants rp
            JOIN users u ON rp.user_id = u.user_id
            WHERE rp.room_id = ?
        `, [roomId]);

        res.json({ room: room[0], players: participants });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/rooms/join', async (req, res) => {
    const { roomId, userId } = req.body;
    try {
        const [check] = await db.execute('SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?', [roomId, userId]);
        if (check.length === 0) {
            await db.execute('INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)', [roomId, userId]);
            await db.execute('UPDATE game_rooms SET current_players = (SELECT COUNT(*) FROM room_participants WHERE room_id = ?) WHERE room_id = ?', [roomId, roomId]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to join' });
    }
});

app.post('/rooms/leave', async (req, res) => {
    const { roomId, userId } = req.body;
    try {
        await db.execute('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?', [roomId, userId]);
        const [countResult] = await db.execute('SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?', [roomId]);
        const remaining = countResult[0].count;

        if (remaining === 0) {
            await db.execute('DELETE FROM game_rooms WHERE room_id = ?', [roomId]);
            console.log(`Room ${roomId} deleted because it is empty.`);
        } else {
            await db.execute('UPDATE game_rooms SET current_players = ? WHERE room_id = ?', [remaining, roomId]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to leave' });
    }
});


//สวิตช์สลับโหมดดึงข้อมูล 
const USE_AI_GENERATOR = false;

//1. ดึงงานที่เปิดรับ (Job Feed) 

//2. รับงาน

//3. ดึงงานที่กำลังทำอยู่ (My Contracts)

//4. ส่งงาน (Submit Job)

// ==========================================
// 5. API: Profile (Public)
// ==========================================

// ดึงข้อมูลโปรไฟล์สาธารณะ (cosmetics, showcase achievements)
// ==========================================
// 5.5 API: Assets (อุปกรณ์)
// ==========================================

// ดึงอุปกรณ์ทั้งหมดของ user

// ==========================================
// 5.6 API: Financial Ledger (บัญชีรายรับ-รายจ่าย)
// ==========================================

// ดึงรายการบัญชีของ user

// บันทึกรายรับ-รายจ่าย

// ==========================================
// 5.7 API: Music Tracks (เพลง)
// ==========================================

// ดึงเพลงทั้งหมด
app.get('/music/tracks', async (req, res) => {
    try {
        const [tracks] = await db.execute('SELECT * FROM music_tracks ORDER BY is_default DESC, track_name ASC');
        res.json(tracks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tracks' });
    }
});

// ==========================================
// 5.8 API: Locations (สถานที่)
// ==========================================

// ดึงสถานที่ทั้งหมด

// ย้ายสถานที่ (ใน simulation)

// ==========================================
// 6. API: Shop & Inventory
// ==========================================

// ดึงสินค้าทั้งหมดในร้าน

// ดึง inventory ของ user

// ซื้อสินค้า

// สวมใส่ cosmetic

// ==========================================
// 7. Learning Platform APIs (merged from friend's app)
// ==========================================

// --- Friend's Login API (compatible with FriendLogin.jsx) ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ message: 'User not found' });
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Wrong password' });
        res.json({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role || 'user',
            level: user.level || 1,
            xp: user.xp || 0
        });
    } catch (err) {
        console.error('❌ API Login Error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Google OAuth Login ---
app.get('/api/config/google', (req, res) => {
    res.json({
        clientId: GOOGLE_LOGIN_ENABLED ? GOOGLE_CLIENT_ID : '',
        enabled: GOOGLE_LOGIN_ENABLED
    });
});

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        if (!GOOGLE_LOGIN_ENABLED) {
            // Two audiences, two messages. Whoever is looking at the login
            // screen did not configure this and cannot fix it, so they get the
            // way in that works; the fix goes to the log, where the person who
            // can act on it will look.
            console.error(
                '❌ /api/auth/google ถูกเรียกทั้งที่ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID ' +
                '(ใส่ OAuth Web Client ID ใน server/.env แล้วรีสตาร์ท server)'
            );
            return res.status(503).json({
                message: 'ตอนนี้เข้าสู่ระบบด้วย Google ยังใช้ไม่ได้ กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน'
            });
        }

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'ไม่พบ Google token' });
        }

        const ticket = await googleOAuthClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, email_verified: emailVerified } = payload || {};

        if (!email) return res.status(400).json({ message: 'ไม่สามารถดึงอีเมลจาก Google ได้' });
        if (!emailVerified) return res.status(400).json({ message: 'บัญชี Google นี้ยังไม่ได้ยืนยันอีเมล' });

        // ตรวจสอบว่ามี user ในระบบแล้วหรือยัง
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            // Login ถ้ามี user อยู่แล้ว
            const user = existing[0];
            res.json({
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                level: user.level || 0,
                xp: user.xp || 0,
                email_verified: 1 // Google email ถือว่า verified แล้ว
            });
        } else {
            // สร้าง user ใหม่จาก Google
            const username = name || email.split('@')[0];
            const randomPass = crypto.randomBytes(16).toString('hex');
            const hash = await bcrypt.hash(randomPass, 10);

            const [result] = await db.execute(
                'INSERT INTO users (username, password_hash, email, role, level, xp, virtual_currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [username, hash, email, 'user', 0, 0, 0]
            );

            // Google user ถือว่า email verified แล้ว
            await db.execute(
                'INSERT INTO email_verifications (user_id, token, verified_at) VALUES (?, ?, NOW())',
                [result.insertId, 'google-oauth']
            );

            res.json({
                user_id: result.insertId,
                username,
                email,
                role: 'user',
                level: 0,  // ต้องทำ survey
                xp: 0,
                email_verified: 1
            });
        }
    } catch (err) {
        console.error('❌ Google Auth Error:', err.message);
        // A failed verifyIdToken() is the common case here, and it means the
        // id the browser signed in with is not the id this server checks
        // against - the two halves of the same setting, out of step.
        res.status(500).json({
            message: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่ หรือเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน'
        });
    }
});

// --- Email Verification ---
app.get('/api/verify-email/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM email_verifications WHERE token = ? AND verified_at IS NULL AND expires_at > NOW()',
            [token]
        );
        if (rows.length === 0) {
            return res.status(400).send(`
                <div style="font-family:sans-serif;text-align:center;padding:60px">
                    <h2 style="color:#ef4444">❌ ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว</h2>
                    <p>กรุณาสมัครสมาชิกใหม่</p>
                </div>
            `);
        }

        await db.execute('UPDATE email_verifications SET verified_at = NOW() WHERE token = ?', [token]);

        res.send(`
            <div style="font-family:sans-serif;text-align:center;padding:60px">
                <h2 style="color:#22c55e">✅ ยืนยันอีเมลสำเร็จ!</h2>
                <p>คุณสามารถกลับไปเข้าสู่ระบบได้เลย</p>
                <a href="http://localhost:5173" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;font-weight:bold">กลับหน้าเข้าสู่ระบบ</a>
            </div>
        `);
    } catch (err) {
        console.error('❌ Email Verify Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// --- Course Content ---
// ===========================================================================

// Competitive Arena, admin dashboard, mailbox and password reset.

// Merged in from Person 2's branch on 2026-08-25. Their versions of the

// routes we already had are the ones kept here: this is their area of the

// project and they had carried every one of them further than we had.

//

// One deliberate change from their source: the AI review below calls our

// callCodeJudgeChat() rather than their callNvidiaChat(). Theirs fell back to a

// key written into the file; ours reads key and model from .env. It was moved

// onto the code-judge model on 2026-08-25 - grading a submission in a ranked

// match is the same job as Arcade's code judging, and neither belongs on the

// chatbot's budget.

// ===========================================================================



const AI_MAX_CODE_LENGTH = 12000;

const ensureColumnIfMissing = async (tableName, columnName, definition) => {
    const [rows] = await db.execute(
        `SELECT COUNT(*) AS count
         FROM information_schema.columns
         WHERE table_schema = DATABASE()
           AND table_name = ?
           AND column_name = ?`,
        [tableName, columnName]
    );

    if (Number(rows[0]?.count || 0) === 0) {
        await db.execute(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definition}`);
        console.log(`✅ Added column ${tableName}.${columnName}`);
    }
};

const ensurePostgresSequenceDefault = async ({ tableName, columnName, sequenceName }) => {
    // Only ever touch a real table.
    //
    // `multiplayer_challenges` is a VIEW over problems + problem_modes since the
    // problem banks were merged (see server/problemsSchema.js), and a view's
    // id column has no default and no sequence of its own to repair. Running
    // the repair against it found the identity sequence belonging to the old
    // pre-merge table and failed on ALTER SEQUENCE ... OWNED BY with "cannot
    // change ownership of identity sequence", which aborted the whole
    // competitive-arena schema step behind it - including the parts that had
    // nothing to do with sequences.
    const [tables] = await db.execute(
        `SELECT table_type FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = ?`,
        [tableName]
    );
    if (tables[0]?.table_type !== 'BASE TABLE') return;

    const [rows] = await db.execute(
        `SELECT column_default, is_identity
         FROM information_schema.columns
         WHERE table_schema = DATABASE()
           AND table_name = ?
           AND column_name = ?`,
        [tableName, columnName]
    );
    const column = rows[0];
    if (!column || column.is_identity === 'YES' || String(column.column_default || '').includes('nextval')) {
        return;
    }

    await db.execute(`CREATE SEQUENCE IF NOT EXISTS "${sequenceName}"`);
    await db.execute(
        `SELECT setval(
            '${sequenceName}',
            COALESCE((SELECT MAX("${columnName}") FROM "${tableName}"), 0) + 1,
            false
        )`
    );
    await db.execute(
        `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT nextval('${sequenceName}')`
    );
    await db.execute(
        `ALTER SEQUENCE "${sequenceName}" OWNED BY "${tableName}"."${columnName}"`
    );
    console.log(`✅ Restored sequence default for ${tableName}.${columnName}`);
};

const ensureLearningAiTaskSchema = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS learning_ai_tasks (
                task_id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) NOT NULL,
                mode varchar(20) NOT NULL,
                title varchar(255) NOT NULL,
                section_label varchar(100) DEFAULT NULL,
                subtitle varchar(100) DEFAULT NULL,
                accent varchar(20) DEFAULT NULL,
                instructions_json longtext NOT NULL,
                example_input text DEFAULT NULL,
                example_output text DEFAULT NULL,
                starter_code longtext NOT NULL,
                test_cases_json longtext NOT NULL,
                reward_xp int(11) NOT NULL DEFAULT 100,
                reward_coins int(11) NOT NULL DEFAULT 20,
                rerolls_used int(11) NOT NULL DEFAULT 0,
                max_rerolls int(11) NOT NULL DEFAULT 3,
                status varchar(20) NOT NULL DEFAULT 'ACTIVE',
                ai_payload longtext DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                completed_at timestamp NULL DEFAULT NULL,
                PRIMARY KEY (task_id),
                KEY idx_learning_ai_tasks_user_mode_status (user_id, mode, status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        await ensurePostgresSequenceDefault({
            tableName: 'learning_ai_tasks',
            columnName: 'task_id',
            sequenceName: 'learning_ai_tasks_task_id_seq',
        });
        await db.execute(`
            CREATE INDEX IF NOT EXISTS idx_learning_ai_tasks_user_mode_status
            ON learning_ai_tasks (user_id, mode, status)
        `);
    } catch (error) {
        console.error('⚠️ Failed to ensure learning AI task schema:', error.message);
    }
};

const ensureCompetitiveArenaSchema = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS multiplayer_challenges (
                challenge_id int(11) NOT NULL AUTO_INCREMENT,
                title varchar(255) NOT NULL,
                description text NOT NULL,
                difficulty varchar(50) NOT NULL DEFAULT 'Easy',
                challenge_type varchar(40) NOT NULL DEFAULT 'standard',
                challenge_scope varchar(40) NOT NULL DEFAULT 'standard',
                reward int(11) NOT NULL DEFAULT 300,
                time_limit int(11) NOT NULL DEFAULT 300,
                expires_at timestamp DEFAULT NULL,
                test_cases longtext DEFAULT NULL,
                created_by int(11) DEFAULT NULL,
                is_test tinyint(1) NOT NULL DEFAULT 0,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (challenge_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS active_accepted_challenges (
                id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) NOT NULL,
                challenge_id int(11) NOT NULL,
                code_state longtext DEFAULT NULL,
                accepted_at timestamp NOT NULL DEFAULT current_timestamp(),
                last_saved_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id),
                UNIQUE KEY uq_active_challenge_user (user_id, challenge_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS multiplayer_submissions (
                submission_id int(11) NOT NULL AUTO_INCREMENT,
                challenge_id int(11) NOT NULL,
                user_id int(11) NOT NULL,
                code longtext DEFAULT NULL,
                score int(11) NOT NULL DEFAULT 0,
                passed_cases int(11) NOT NULL DEFAULT 0,
                total_cases int(11) NOT NULL DEFAULT 0,
                efficiency_ms int(11) NOT NULL DEFAULT 0,
                ai_feedback longtext DEFAULT NULL,
                breakdown longtext DEFAULT NULL,
                submitted_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (submission_id),
                UNIQUE KEY uq_multiplayer_submission_user_challenge (user_id, challenge_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS user_mailbox (
                mail_id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) NOT NULL,
                title varchar(255) NOT NULL,
                content text NOT NULL,
                attachment_coins int(11) NOT NULL DEFAULT 0,
                is_read tinyint(1) NOT NULL DEFAULT 0,
                is_claimed tinyint(1) NOT NULL DEFAULT 0,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (mail_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await ensureColumnIfMissing('active_accepted_challenges', 'accepted_at', '`accepted_at` timestamp NOT NULL DEFAULT current_timestamp()');
        await ensureColumnIfMissing('active_accepted_challenges', 'last_saved_at', '`last_saved_at` timestamp NOT NULL DEFAULT current_timestamp()');
        await ensureColumnIfMissing('multiplayer_submissions', 'breakdown', '`breakdown` longtext DEFAULT NULL');
        await ensureColumnIfMissing('multiplayer_submissions', 'submitted_at', '`submitted_at` timestamp NOT NULL DEFAULT current_timestamp()');
        await ensureColumnIfMissing('multiplayer_challenges', 'challenge_type', '`challenge_type` varchar(40) NOT NULL DEFAULT \'standard\' AFTER difficulty');
        await ensureColumnIfMissing('multiplayer_challenges', 'challenge_scope', '`challenge_scope` varchar(40) NOT NULL DEFAULT \'standard\' AFTER challenge_type');
        await db.execute(`
            ALTER TABLE active_accepted_challenges
            ALTER COLUMN accepted_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
        `);
        await db.execute(`
            ALTER TABLE active_accepted_challenges
            ALTER COLUMN last_saved_at SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
        `);
        await ensurePostgresSequenceDefault({
            tableName: 'multiplayer_challenges',
            columnName: 'challenge_id',
            sequenceName: 'multiplayer_challenges_challenge_id_seq',
        });
        await ensurePostgresSequenceDefault({
            tableName: 'active_accepted_challenges',
            columnName: 'id',
            sequenceName: 'active_accepted_challenges_id_seq',
        });
        await ensurePostgresSequenceDefault({
            tableName: 'multiplayer_submissions',
            columnName: 'submission_id',
            sequenceName: 'multiplayer_submissions_submission_id_seq',
        });
        await ensurePostgresSequenceDefault({
            tableName: 'user_mailbox',
            columnName: 'mail_id',
            sequenceName: 'user_mailbox_mail_id_seq',
        });
    } catch (error) {
        console.error('⚠️ Failed to ensure competitive arena schema:', error.message);
    }
};

const ensureLearningProgressSchema = async () => {
    try {
        // ==========================================
        // 1. สร้างตาราง mini_game_exercises
        //    ใช้ lesson_id อ้างอิงตาราง lessons โดยตรง
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_exercises (
                exercise_id int(11) NOT NULL AUTO_INCREMENT,
                lesson_id int(11) DEFAULT NULL,
                exercise_order varchar(20) DEFAULT NULL,
                title varchar(150) NOT NULL,
                description text DEFAULT NULL,
                starter_code longtext DEFAULT NULL,
                solution_code longtext DEFAULT NULL,
                test_cases_json longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(test_cases_json)),
                xp_reward int(11) NOT NULL DEFAULT 10,
                currency_reward int(11) NOT NULL DEFAULT 5,
                is_active tinyint(1) NOT NULL DEFAULT 1,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (exercise_id),
                KEY idx_mini_game_exercises_lesson (lesson_id),
                KEY idx_mini_game_exercises_order (exercise_order),
                CONSTRAINT fk_mini_game_exercises_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (lesson_id) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        const [miniGameExerciseActiveColumns] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name = 'mini_game_exercises'
               AND column_name = 'is_active'`
        );

        // The ALTER that used to live here is gone. mini_game_exercises is a view
        // over problems/problem_modes since the problem-bank merge, and
        // problem_modes always has is_active, so the column can no longer be
        // missing - and ALTER on a view errors out. The check above is kept
        // because it is what proves the column is there.
        if (Number(miniGameExerciseActiveColumns[0]?.count || 0) === 0) {
            console.warn('⚠️ mini_game_exercises has no is_active column — the problem-bank merge did not run.');
        }

        // ==========================================
        // 3. สร้างตาราง mini_game_locations
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_locations (
                location_id int(11) NOT NULL AUTO_INCREMENT,
                location_key varchar(50) NOT NULL,
                name varchar(100) NOT NULL,
                description text DEFAULT NULL,
                bg_image_url varchar(255) DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (location_id),
                UNIQUE KEY uq_mini_game_locations_key (location_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        // ==========================================
        // 4. สร้างตาราง mini_game_npcs
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_npcs (
                npc_id int(11) NOT NULL AUTO_INCREMENT,
                npc_key varchar(50) NOT NULL,
                name varchar(100) NOT NULL,
                avatar_asset_url varchar(255) DEFAULT NULL,
                description text DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (npc_id),
                UNIQUE KEY uq_mini_game_npcs_key (npc_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        // ==========================================
        // 5. สร้างตาราง mini_game_dialogues
        //    [แก้ไข] ตัด dialogue_phase และ branch_key ออก
        //    [แก้ไข] ปรับ Index ให้เหลือเฉพาะ exercise_id และ dialogue_order
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_dialogues (
                dialogue_id int(11) NOT NULL AUTO_INCREMENT,
                lesson_id int(11) NOT NULL DEFAULT 1,
                exercise_id int(11) DEFAULT NULL,
                dialogue_order int(11) NOT NULL DEFAULT 0,
                exercise_order varchar(20) DEFAULT NULL,
                dialogue_text text NOT NULL,
                npc_id int(11) DEFAULT NULL,
                npc_emotion varchar(50) NOT NULL DEFAULT 'neutral',
                location_id int(11) DEFAULT NULL,
                dialogue_phase enum('pre_submit','post_submit') NOT NULL DEFAULT 'pre_submit',
                branch_key varchar(80) NOT NULL DEFAULT 'default',
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (dialogue_id),
                KEY idx_mini_game_dialogues_exercise_order (exercise_id, dialogue_order),
                KEY idx_mini_game_dialogues_npc (npc_id),
                KEY idx_mini_game_dialogues_location (location_id),
                KEY fk_mgd_lesson (lesson_id),
                CONSTRAINT fk_mini_game_dialogues_exercise FOREIGN KEY (exercise_id) REFERENCES mini_game_exercises (exercise_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_mini_game_dialogues_location FOREIGN KEY (location_id) REFERENCES mini_game_locations (location_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_mini_game_dialogues_npc FOREIGN KEY (npc_id) REFERENCES mini_game_npcs (npc_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_mgd_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (lesson_id) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        // ลบฟังก์ชัน ensureColumnIfMissing ของสองคอลัมน์นั้นออก เพื่อไม่ให้ถูกเพิ่มกลับเข้าไปในตารางเก่าซ้ำอีกค่ะ

        // ==========================================
        // 6. สร้างตาราง mini_game_current_conversations
        //    [แก้ไข] ตัด branch_key ออกไปจากโครงสร้างตาราง
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_current_conversations (
                user_id int(11) NOT NULL,
                exercise_id int(11) DEFAULT NULL,
                dialogue_id int(11) NOT NULL,
                current_npc_id int(11) DEFAULT NULL,
                current_location_id int(11) DEFAULT NULL,
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (user_id),
                KEY idx_mini_game_current_exercise (exercise_id),
                KEY idx_mini_game_current_dialogue (dialogue_id),
                KEY idx_mini_game_current_npc (current_npc_id),
                KEY idx_mini_game_current_location (current_location_id),
                CONSTRAINT fk_mini_game_current_dialogue FOREIGN KEY (dialogue_id) REFERENCES mini_game_dialogues (dialogue_id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_mini_game_current_exercise FOREIGN KEY (exercise_id) REFERENCES mini_game_exercises (exercise_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_mini_game_current_location FOREIGN KEY (current_location_id) REFERENCES mini_game_locations (location_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_mini_game_current_npc FOREIGN KEY (current_npc_id) REFERENCES mini_game_npcs (npc_id) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        // ==========================================
        // 7. สร้างตาราง mini_game_exercise_submissions
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_exercise_submissions (
                submission_id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) NOT NULL,
                exercise_id int(11) NOT NULL,
                submitted_code text NOT NULL,
                submitted_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (submission_id),
                UNIQUE KEY uq_user_exercise_submission (user_id, exercise_id),
                KEY fk_mini_game_submissions_exercise (exercise_id),
                CONSTRAINT fk_mini_game_submissions_exercise FOREIGN KEY (exercise_id) REFERENCES mini_game_exercises (exercise_id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_mges_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        // ==========================================
        // 8. สร้างตาราง mini_game_user_exercise_progress
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_user_exercise_progress (
                progress_id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) NOT NULL,
                exercise_id int(11) NOT NULL,
                is_completed tinyint(1) NOT NULL DEFAULT 0,
                score int(11) NOT NULL DEFAULT 0,
                xp_reward int(11) NOT NULL DEFAULT 0,
                currency_reward int(11) NOT NULL DEFAULT 0,
                selected_branch_key varchar(80) NOT NULL DEFAULT 'default',
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (progress_id),
                UNIQUE KEY uq_user_exercise_progress (user_id, exercise_id),
                KEY fk_mini_game_progress_exercise (exercise_id),
                CONSTRAINT fk_mini_game_progress_exercise FOREIGN KEY (exercise_id) REFERENCES mini_game_exercises (exercise_id) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        const [miniGameDialoguePhaseColumns] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name = 'mini_game_dialogues'
               AND column_name = 'dialogue_phase'`
        );

        if (Number(miniGameDialoguePhaseColumns[0]?.count || 0) === 0) {
            await db.execute(
                `ALTER TABLE mini_game_dialogues
                 ADD COLUMN dialogue_phase enum('pre_submit','post_submit') NOT NULL DEFAULT 'pre_submit' AFTER location_id`
            );
        }

        const [miniGameDialogueBranchColumns] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name = 'mini_game_dialogues'
               AND column_name = 'branch_key'`
        );

        if (Number(miniGameDialogueBranchColumns[0]?.count || 0) === 0) {
            await db.execute(
                `ALTER TABLE mini_game_dialogues
                 ADD COLUMN branch_key varchar(80) NOT NULL DEFAULT 'default' AFTER dialogue_phase`
            );
        }

        const [miniGameProgressCompletedColumns] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name = 'mini_game_user_exercise_progress'
               AND column_name = 'is_completed'`
        );

        if (Number(miniGameProgressCompletedColumns[0]?.count || 0) === 0) {
            await db.execute(
                `ALTER TABLE mini_game_user_exercise_progress
                 ADD COLUMN is_completed tinyint(1) NOT NULL DEFAULT 0 AFTER exercise_id`
            );
        }

        const [miniGameProgressScoreColumns] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name = 'mini_game_user_exercise_progress'
               AND column_name = 'score'`
        );

        if (Number(miniGameProgressScoreColumns[0]?.count || 0) === 0) {
            await db.execute(
                `ALTER TABLE mini_game_user_exercise_progress
                 ADD COLUMN score int(11) NOT NULL DEFAULT 0 AFTER is_completed`
            );
        }

        const [miniGameProgressBranchColumns] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
               AND table_name = 'mini_game_user_exercise_progress'
               AND column_name = 'selected_branch_key'`
        );

        if (Number(miniGameProgressBranchColumns[0]?.count || 0) === 0) {
            await db.execute(
                `ALTER TABLE mini_game_user_exercise_progress
                 ADD COLUMN selected_branch_key varchar(80) NOT NULL DEFAULT 'default' AFTER currency_reward`
            );
        }

        // ==========================================
        // 9. สร้างตาราง game_sessions
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS game_sessions (
                session_id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) DEFAULT NULL,
                mode varchar(20) NOT NULL,
                started_at timestamp NOT NULL DEFAULT current_timestamp(),
                ended_at timestamp NULL DEFAULT NULL,
                PRIMARY KEY (session_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        return;

    } catch (error) {
        console.error('⚠️ Failed to ensure learning progress schema and seed data:', error.message);
    }
};

const CLIENT_URL = String(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const sendAppEmail = async ({ to, subject, html }) => {
    if (!EMAIL_CONFIGURED) {
        return false;
    }

    await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });

    return true;
};

const clampScore = (value, min, max) => Math.max(min, Math.min(max, Math.round(Number(value || 0))));

const normalizeCompetitiveTestCases = (testCases = []) => {
    if (!Array.isArray(testCases)) return [];
    return testCases
        .map((testCase) => ({
            input: String(testCase?.input ?? ''),
            expected: String(testCase?.expected ?? testCase?.output ?? ''),
        }))
        .filter((testCase) => testCase.expected.trim() !== '');
};

const parseCompetitiveTestCases = (rawTestCases) => {
    if (!rawTestCases) return [];
    if (Array.isArray(rawTestCases)) return normalizeCompetitiveTestCases(rawTestCases);

    try {
        const parsed = typeof rawTestCases === 'string'
            ? JSON.parse(rawTestCases)
            : rawTestCases;
        return normalizeCompetitiveTestCases(parsed);
    } catch (_) {
        return [];
    }
};

const normalizeCompetitiveChallengeScope = (scope) => {
    const normalized = String(scope || '').trim().toLowerCase();
    return ['daily', 'weekly'].includes(normalized) ? normalized : 'standard';
};

const normalizeCompetitiveChallengeType = (type, scope) => {
    const normalized = String(type || '').trim().toLowerCase();
    if (normalized === 'scheduled' || scope !== 'standard') return 'scheduled';
    return 'standard';
};

const calculateCompetitiveTimeAdjustedScore = ({ challenge, elapsedSeconds, defaultScore = 100 }) => {
    const scope = normalizeCompetitiveChallengeScope(challenge?.challenge_scope);
    if (!['daily', 'weekly'].includes(scope) || elapsedSeconds == null) {
        return clampScore(defaultScore, 0, 100);
    }

    const timeLimit = Number(challenge?.time_limit || 0);
    if (!timeLimit) return clampScore(defaultScore, 0, 100);

    const usedRatio = Math.max(0, Math.min(1, Number(elapsedSeconds || 0) / timeLimit));
    const timePenalty = Math.round(usedRatio * 25);
    return clampScore(defaultScore - timePenalty, 75, 100);
};

const getCompetitiveAcceptedAtMs = (acceptedAt, nowMs = Date.now()) => {
    if (!acceptedAt) return NaN;
    const parsed = new Date(acceptedAt).getTime();
    if (!Number.isFinite(parsed)) return NaN;
    if (parsed <= nowMs + 1000) return parsed;

    const timezoneAdjusted = parsed + new Date().getTimezoneOffset() * 60000;
    if (Number.isFinite(timezoneAdjusted) && timezoneAdjusted <= nowMs + 1000) {
        return timezoneAdjusted;
    }

    return nowMs;
};

const isCompetitiveChallengeExpired = (challenge, acceptedAt) => {
    if (!challenge || Number(challenge.is_test) === 1) return false;
    const timeLimit = Number(challenge.time_limit || 0);
    if (!timeLimit || !acceptedAt) return false;
    const acceptedAtMs = getCompetitiveAcceptedAtMs(acceptedAt);
    if (!Number.isFinite(acceptedAtMs)) return false;
    return Date.now() - acceptedAtMs >= timeLimit * 1000;
};

const buildCompetitiveTimeUpScore = (testCases = []) => ({
    score: 0,
    passedCases: 0,
    totalCases: Array.isArray(testCases) ? testCases.length : 0,
    breakdown: {
        correctness: 0,
        complexity: 0,
        cleanCode: 0,
        speedBonus: 0,
        elapsedSeconds: null,
        timeExpired: true,
    },
    feedback: 'Time limit exceeded. This challenge receives 0 score.',
});

const buildCompetitivePerfectTestScore = ({ challenge, testResult, acceptedAt = null }) => {
    const acceptedTime = getCompetitiveAcceptedAtMs(acceptedAt);
    const elapsedSeconds = Number.isFinite(acceptedTime)
        ? Math.max(0, Math.round((Date.now() - acceptedTime) / 1000))
        : null;
    const score = calculateCompetitiveTimeAdjustedScore({
        challenge,
        elapsedSeconds,
        defaultScore: 100,
    });

    return {
        score,
        passedCases: Number(testResult?.passed || 0),
        totalCases: Number(testResult?.total || 0),
        breakdown: {
            correctness: 50,
            complexity: 20,
            cleanCode: 30,
            speedBonus: 0,
            elapsedSeconds,
            timeAdjustedScore: score,
            allTestsPassed: true,
            aiReviewed: false,
            aiApproved: true,
            aiVerdict: 'approved',
        },
        feedback: score === 100
            ? 'ผ่าน test cases ครบทุกข้อและส่งได้เร็ว ได้คะแนน 100/100'
            : `ผ่าน test cases ครบทุกข้อ คะแนนปรับตามเวลาที่ใช้ ${score}/100`,
    };
};

const COMPETITIVE_AI_REWARD_THRESHOLD = 70;

// The Competitive Arena used to carry its own copy of normalizeOutput,
// resolvePythonBin and runPythonCase, written before the merge. Two copies of
// "spawn python, feed stdin, kill it after N seconds" is how this project ended
// up with five disagreeing answer-checkers in the first place, and the copies
// had already drifted: this one never set PYTHONIOENCODING, so any competitive
// answer that printed Thai died with UnicodeEncodeError, produced empty output,
// and was marked wrong. Now there is one runner, in server/pythonRunner.js.
const { normalizeOutput } = require('./pythonRunner');

const runCompetitivePythonTests = async ({ code, testCases }) => {
    const normalizedCases = normalizeCompetitiveTestCases(testCases);
    if (normalizedCases.length === 0) {
        return { total: 0, passed: 0, results: [], runnerAvailable: true };
    }

    // Through the one grader, the same one the lessons and mini-games use.
    // This path used to loop over runPythonCase itself, which meant the
    // Competitive Arena quietly missed anything the grader learned later - the
    // `regexp:` expected values its own problems are written with, and the
    // several-accepted-answers shape. Capped at 8 cases as before so one heavy
    // submission cannot fan out into an unbounded number of processes.
    const verdict = await gradeSubmission({
        problem: { test_kind: 'stdio', test_cases: normalizedCases.slice(0, 8) },
        code,
    });

    return {
        total: verdict.total,
        passed: verdict.passed,
        results: verdict.results,
        runnerAvailable: !verdict.results.some((r) => String(r.error || '').startsWith('Python runner failed')),
    };
};

const scoreCompetitiveSubmission = ({ code = '', testCases = [], acceptedAt = null, testResult = null }) => {
    const source = String(code || '');
    const trimmed = source.trim();
    const lines = trimmed ? trimmed.split(/\r?\n/) : [];
    const nonEmptyLines = lines.filter((line) => line.trim());
    const expectedCaseCount = Array.isArray(testCases) && testCases.length > 0 ? testCases.length : 1;

    let correctness;
    if (testResult && Number(testResult.total || 0) > 0) {
        correctness = (Number(testResult.passed || 0) / Number(testResult.total || 1)) * 50;
    } else {
        correctness = trimmed ? 28 : 5;
        if (/\bprint\s*\(/.test(source)) correctness += 8;
        if (/\binput\s*\(/.test(source)) correctness += 5;
        if (/\breturn\b/.test(source) || /\bdef\s+\w+\s*\(/.test(source)) correctness += 4;
        if (!/\bpass\b/.test(source) && !/TODO/i.test(source)) correctness += 5;
    }
    correctness = clampScore(correctness, 0, 50);

    const loopCount = (source.match(/\b(for|while)\b/g) || []).length;
    const nestedLoopLikely = /\b(for|while)\b[\s\S]*\n\s{4,}\b(for|while)\b/.test(source);
    let complexity = 12;
    if (/\b(dict|set)\s*\(/.test(source) || /[\w\]]\s*\[.+\]\s*=/.test(source)) complexity += 4;
    if (/\bsort(?:ed)?\s*\(/.test(source)) complexity += 2;
    if (loopCount <= 1) complexity += 3;
    if (nestedLoopLikely) complexity -= 5;
    complexity = clampScore(complexity, 0, 20);

    let cleanCode = 16;
    if (nonEmptyLines.length > 0 && nonEmptyLines.length <= 35) cleanCode += 4;
    if (/\b[a-z_][a-z0-9_]*\b/.test(source)) cleanCode += 3;
    if (!/\beval\s*\(|\bexec\s*\(/.test(source)) cleanCode += 4;
    if (nonEmptyLines.every((line) => line.length <= 100)) cleanCode += 3;
    cleanCode = clampScore(cleanCode, 0, 30);

    const acceptedTime = getCompetitiveAcceptedAtMs(acceptedAt);
    const elapsedSeconds = Number.isFinite(acceptedTime) ? Math.max(0, Math.round((Date.now() - acceptedTime) / 1000)) : null;
    const speedBonus = elapsedSeconds == null
        ? 0
        : elapsedSeconds <= 60
            ? 3
            : elapsedSeconds <= 180
                ? 2
                : elapsedSeconds <= 300
                    ? 1
                    : 0;

    const baseScore = correctness + complexity + cleanCode;
    const score = clampScore(baseScore + speedBonus, 0, 100);

    return {
        score,
        passedCases: testResult ? Number(testResult.passed || 0) : (correctness >= 35 ? expectedCaseCount : Math.max(0, expectedCaseCount - 1)),
        totalCases: testResult ? Number(testResult.total || 0) : expectedCaseCount,
        breakdown: {
            correctness,
            complexity,
            cleanCode,
            speedBonus,
            elapsedSeconds,
        },
        feedback: `Rubric score: correctness ${correctness}/50, complexity ${complexity}/20, clean code ${cleanCode}/30. ${speedBonus ? `Speed tie-breaker +${speedBonus}.` : 'No speed bonus.'}`,
    };
};

const parseCompetitiveAiReview = ({ rawText, fallbackScore, testResult }) => {
    const jsonText = extractFirstJsonBlock(rawText);
    const parsed = safeJsonParse(jsonText, null);
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('AI review response is not valid JSON');
    }

    const allTestsPassed = Number(testResult?.total || 0) > 0
        ? Number(testResult?.passed || 0) === Number(testResult?.total || 0)
        : false;
    const maxCorrectness = Number(testResult?.total || 0) > 0
        ? (Number(testResult?.passed || 0) / Number(testResult?.total || 1)) * 50
        : 50;
    const correctness = clampScore(Math.min(Number(parsed.correctness ?? fallbackScore.breakdown.correctness), maxCorrectness), 0, 50);
    const complexity = clampScore(Number(parsed.complexity ?? fallbackScore.breakdown.complexity), 0, 20);
    const cleanCode = clampScore(Number(parsed.cleanCode ?? fallbackScore.breakdown.cleanCode), 0, 30);
    const speedBonus = clampScore(fallbackScore.breakdown.speedBonus || 0, 0, 3);
    const score = clampScore(correctness + complexity + cleanCode + speedBonus, 0, 100);
    const parsedApproved = parsed.approved === true || String(parsed.approved).toLowerCase() === 'true';
    const aiApproved = parsedApproved && allTestsPassed && score >= COMPETITIVE_AI_REWARD_THRESHOLD;

    return {
        score,
        passedCases: Number(testResult?.passed || fallbackScore.passedCases || 0),
        totalCases: Number(testResult?.total || fallbackScore.totalCases || 0),
        breakdown: {
            correctness,
            complexity,
            cleanCode,
            speedBonus,
            elapsedSeconds: fallbackScore.breakdown.elapsedSeconds,
            aiReviewed: true,
            aiApproved,
            aiVerdict: aiApproved ? 'approved' : 'needs_fix',
        },
        feedback: String(parsed.feedback || fallbackScore.feedback || '').slice(0, 1200),
    };
};

const reviewCompetitiveSubmissionWithAI = async ({ challenge, code, testCases, testResult, fallbackScore }) => {
    const visibleCases = normalizeCompetitiveTestCases(testCases).slice(0, 6);
    const testSummary = {
        passed: Number(testResult?.passed || 0),
        total: Number(testResult?.total || 0),
        cases: (testResult?.results || []).slice(0, 6).map((result) => ({
            input: result.input,
            expected: result.expected,
            actual: result.actual,
            passed: Boolean(result.passed),
            error: result.error || '',
        })),
    };

    try {
        // Judged by the code-judge model, not the chatbot's. This is code
        // grading inside a live ranked match, the same job as Arcade's
        // judgeCodeQuality(), so it belongs on that key and model - see the AI
        // Models table in CLAUDE.md. (Defined further down the file; that is
        // fine because this only runs on a request, long after module load.)
        const rawText = await callCodeJudgeChat({
            messages: [
                {
                    role: 'system',
                    content: `You are a strict Python code reviewer for a Thai coding challenge game.
Return ONLY valid JSON. Do not use markdown.
Score with this rubric:
- correctness: 0-50, must respect provided test results and cannot ignore failing tests.
- complexity: 0-20, judge time/space complexity and whether the approach fits the problem.
- cleanCode: 0-30, judge readability, simplicity, naming, and risky code.
approved must be true only when the solution satisfies the prompt, passes all tests, and is safe to reward.
JSON shape: {"correctness":0,"complexity":0,"cleanCode":0,"approved":false,"feedback":"short Thai feedback"}`
                },
                {
                    role: 'user',
                    content: JSON.stringify({
                        title: challenge.title,
                        description: challenge.description,
                        reward: Number(challenge.reward || 0),
                        testCases: visibleCases,
                        testSummary,
                        code: String(code || '').slice(0, AI_MAX_CODE_LENGTH),
                    })
                }
            ],
            temperature: 0.2,
            maxTokens: 1200,
            thinking: false,
            // Longer than Arcade's 8s: a competitive submission is graded once
            // when the player submits, not while a 60-second round is closing.
            timeoutMs: 30000,
        });

        return parseCompetitiveAiReview({ rawText, fallbackScore, testResult });
    } catch (error) {
        console.error('Competitive AI review failed:', error.response?.data || error.message || error);
        return {
            ...fallbackScore,
            breakdown: {
                ...fallbackScore.breakdown,
                aiReviewed: false,
                aiApproved: Number(testResult?.total || 0) > 0 && Number(testResult?.passed || 0) === Number(testResult?.total || 0),
                aiVerdict: 'fallback',
                aiUnavailable: true,
            },
            feedback: `${fallbackScore.feedback} AI review is temporarily unavailable, so this score used automated test results and local rubric fallback.`,
        };
    }
};

const calculateCompetitiveSolverReward = (challenge, scored) => {
    if (scored?.breakdown?.timeExpired) return 0;
    const reward = Number(challenge?.reward || 0);
    const score = Number(scored?.score || 0);
    if (!reward || !score) return 0;
    if (scored?.breakdown?.aiReviewed) {
        return scored?.breakdown?.aiApproved ? reward : 0;
    }
    return Math.max(0, Math.round((reward * score) / 100));
};

const calculateCompetitiveCreatorBonus = (challenge, solverUserId) => {
    const creatorId = Number(challenge?.created_by || 0);
    if (!creatorId || creatorId === Number(solverUserId)) return 0;
    if (String(challenge?.creator_role || '').toLowerCase() === 'admin') return 0;
    const reward = Number(challenge?.reward || 0);
    return Math.max(10, Math.round(reward * 0.15));
};

const createCompetitiveMailbox = async ({ userId, title, content, coins = 0 }) => {
    if (!userId) return;
    const [existing] = await db.execute(
        'SELECT mail_id FROM user_mailbox WHERE user_id = ? AND title = ? AND content = ? LIMIT 1',
        [userId, title, content]
    );
    if (existing.length > 0) return;

    await db.execute(`
        INSERT INTO user_mailbox (user_id, title, content, attachment_coins, is_read, is_claimed)
        VALUES (?, ?, ?, ?, 0, 0)
    `, [userId, title, content, Math.max(0, Math.round(Number(coins || 0)))]);
};

const sendCompetitiveResultMail = async ({ challenge, userId, scored, testResult, timedOut }) => {
    const rewardCoins = timedOut ? 0 : calculateCompetitiveSolverReward(challenge, scored);
    const passed = Number(testResult?.passed || scored?.passedCases || 0);
    const total = Number(testResult?.total || scored?.totalCases || 0);
    const aiReviewed = Boolean(scored?.breakdown?.aiReviewed);
    const aiApproved = Boolean(scored?.breakdown?.aiApproved);
    const title = timedOut
        ? `สรุปโจทย์ไม่สำเร็จ: ${challenge.title}`
        : aiReviewed && !aiApproved
            ? `AI ตรวจแล้วต้องแก้ไข: ${challenge.title}`
        : `สรุปโจทย์สำเร็จ: ${challenge.title}`;
    const content = timedOut
        ? `คุณทำโจทย์ "${challenge.title}" ไม่ทันเวลาที่กำหนด จึงได้รับคะแนน 0 และรางวัล 0 เหรียญ`
        : aiReviewed && !aiApproved
            ? `AI ตรวจโค้ดโจทย์ "${challenge.title}" แล้ว คะแนนรวม ${scored.score}/100 ผ่าน test cases ${passed}/${total} ยังไม่ผ่านเกณฑ์รับรางวัล จึงได้รับ 0 เหรียญ\n\nFeedback: ${scored.feedback}`
        : `คุณส่งโจทย์ "${challenge.title}" แล้ว คะแนนรวม ${scored.score}/100 ผ่าน test cases ${passed}/${total} ได้รับรางวัล ${rewardCoins} เหรียญ`;

    await createCompetitiveMailbox({
        userId,
        title,
        content,
        coins: rewardCoins,
    });

    return rewardCoins;
};

const sendCompetitiveCreatorBonusMail = async ({ challenge, solverUserId, scored }) => {
    const creatorId = Number(challenge?.created_by || 0);
    const bonusCoins = calculateCompetitiveCreatorBonus(challenge, solverUserId);
    if (!creatorId || bonusCoins <= 0) return 0;

    const [creatorRows] = await db.execute(
        'SELECT role FROM users WHERE user_id = ? LIMIT 1',
        [creatorId]
    );
    if (String(creatorRows[0]?.role || '').toLowerCase() === 'admin') return 0;

    await createCompetitiveMailbox({
        userId: creatorId,
        title: `มีคนทำโจทย์ของคุณแล้ว: ${challenge.title}`,
        content: `ผู้เล่น #${solverUserId} ส่งคำตอบโจทย์ "${challenge.title}" ของคุณแล้ว คะแนนที่ได้คือ ${scored.score}/100 คุณได้รับโบนัสผู้สร้างโจทย์ ${bonusCoins} เหรียญ`,
        coins: bonusCoins,
    });

    return bonusCoins;
};

const finalizeExpiredCompetitiveChallenges = async (userId) => {
    if (!userId) return;

    const [activeRows] = await db.execute(`
        SELECT a.challenge_id, a.code_state, a.accepted_at, c.*
        FROM active_accepted_challenges a
        JOIN multiplayer_challenges c ON c.challenge_id = a.challenge_id
        LEFT JOIN multiplayer_submissions s
          ON s.challenge_id = a.challenge_id
         AND s.user_id = a.user_id
        WHERE a.user_id = ?
          AND s.submission_id IS NULL
    `, [userId]);

    for (const row of activeRows) {
        if (!isCompetitiveChallengeExpired(row, row.accepted_at)) continue;

        const parsedTestCases = parseCompetitiveTestCases(row.test_cases);
        const scored = buildCompetitiveTimeUpScore(parsedTestCases);
        const breakdownJson = JSON.stringify(scored.breakdown);
        const feedbackJson = JSON.stringify({ review: scored.feedback });

        try {
            await db.execute(`
                INSERT INTO multiplayer_submissions
                    (challenge_id, user_id, code, score, passed_cases, total_cases, efficiency_ms, ai_feedback, breakdown)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                row.challenge_id,
                userId,
                row.code_state || '',
                0,
                0,
                parsedTestCases.length,
                Number(row.time_limit || 0) * 1000,
                feedbackJson,
                breakdownJson,
            ]);

            await sendCompetitiveResultMail({
                challenge: row,
                userId,
                scored,
                testResult: { total: parsedTestCases.length, passed: 0, results: [] },
                timedOut: true,
            });
        } catch (error) {
            if (!String(error.message || '').toLowerCase().includes('duplicate')) {
                throw error;
            }
        }

        await db.execute(
            'DELETE FROM active_accepted_challenges WHERE user_id = ? AND challenge_id = ?',
            [userId, row.challenge_id]
        );
    }
};



app.get('/api/dashboard/learning-progress', async (_req, res) => {
    try {
        await ensureLessonQuizAttemptSchema();

        const safeSelect = async (sql, params = []) => {
            try {
                const [rows] = await db.execute(sql, params);
                return Array.isArray(rows) ? rows : [];
            } catch (error) {
                console.warn('Dashboard learning query skipped:', describeError(error));
                return [];
            }
        };

        const [students, lessons, exerciseCountRows, quizRows, exerciseRows, miniGameRows] = await Promise.all([
            safeSelect(
                `SELECT user_id, username, created_at
                 FROM users
                 WHERE role != 'admin' AND COALESCE(is_deleted, 0) = 0
                 ORDER BY username`
            ),
            safeSelect(
                `SELECT
                    l.lesson_id,
                    l.title,
                    l.order_index,
                    l.module_id,
                    COALESCE(m.title, 'ไม่ระบุหมวด') AS module_title
                 FROM lessons l
                 LEFT JOIN modules m ON m.module_id = l.module_id
                 ORDER BY COALESCE(m.order_index, 0), l.order_index, l.lesson_id`
            ),
            safeSelect(
                `SELECT lesson_id, COUNT(*) AS total
                 FROM exercises
                 GROUP BY lesson_id`
            ),
            safeSelect(
                `SELECT
                    user_id,
                    lesson_id,
                    MAX(CASE WHEN quiz_type = 'pre' THEN score ELSE NULL END) AS pre_score,
                    MAX(CASE WHEN quiz_type = 'pre' THEN total_questions ELSE NULL END) AS pre_total,
                    MAX(CASE WHEN quiz_type = 'pre' THEN completed_at ELSE NULL END) AS pre_completed_at,
                    MAX(CASE WHEN quiz_type = 'post' THEN score ELSE NULL END) AS post_score,
                    MAX(CASE WHEN quiz_type = 'post' THEN total_questions ELSE NULL END) AS post_total,
                    MAX(CASE WHEN quiz_type = 'post' THEN completed_at ELSE NULL END) AS post_completed_at,
                    MAX(updated_at) AS latest_quiz_at
                 FROM lesson_quiz_attempts
                 GROUP BY user_id, lesson_id`
            ),
            safeSelect(
                `SELECT
                    es.user_id,
                    e.lesson_id,
                    COUNT(DISTINCT es.exercise_id) AS exercise_attempts,
                    SUM(CASE WHEN es.is_passed = 1 THEN 1 ELSE 0 END) AS passed_exercises,
                    MAX(es.submitted_at) AS latest_exercise_at
                 FROM exercise_submissions es
                 JOIN exercises e ON e.exercise_id = es.exercise_id
                 GROUP BY es.user_id, e.lesson_id`
            ),
            safeSelect(
                `SELECT
                    p.user_id,
                    mge.lesson_id,
                    COUNT(DISTINCT p.exercise_id) AS mini_game_attempts,
                    SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) AS completed_mini_games,
                    MAX(p.updated_at) AS latest_mini_game_at
                 FROM mini_game_user_exercise_progress p
                 JOIN mini_game_exercises mge ON mge.exercise_id = p.exercise_id
                 WHERE mge.lesson_id IS NOT NULL
                 GROUP BY p.user_id, mge.lesson_id`
            ),
        ]);

        const lessonMap = new Map(lessons.map((lesson) => [Number(lesson.lesson_id), lesson]));
        const exerciseTotals = new Map(exerciseCountRows.map((row) => [
            Number(row.lesson_id),
            Number(row.total || 0),
        ]));
        const recordMap = new Map();
        const makeKey = (userId, lessonId) => `${Number(userId)}:${Number(lessonId)}`;
        const percent = (score, total) => {
            const numericTotal = Number(total || 0);
            if (!numericTotal) return null;
            return Math.round((Number(score || 0) / numericTotal) * 100);
        };
        const latestDate = (...values) => (
            values
                .filter(Boolean)
                .map((value) => new Date(value))
                .filter((date) => Number.isFinite(date.getTime()))
                .sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString() || null
        );
        const getRecord = (userId, lessonId) => {
            const key = makeKey(userId, lessonId);
            if (!recordMap.has(key)) {
                const lesson = lessonMap.get(Number(lessonId)) || {};
                recordMap.set(key, {
                    user_id: Number(userId),
                    lesson_id: Number(lessonId),
                    lesson_title: lesson.title || `บทเรียน #${lessonId}`,
                    module_title: lesson.module_title || 'ไม่ระบุหมวด',
                    pre_score: null,
                    pre_total: null,
                    pre_percent: null,
                    post_score: null,
                    post_total: null,
                    post_percent: null,
                    growth_percent: null,
                    exercise_attempts: 0,
                    passed_exercises: 0,
                    mini_game_attempts: 0,
                    completed_mini_games: 0,
                    started: false,
                    completed: false,
                    status: 'not_started',
                    last_activity_at: null,
                });
            }
            return recordMap.get(key);
        };

        quizRows.forEach((row) => {
            const record = getRecord(row.user_id, row.lesson_id);
            record.pre_score = row.pre_score == null ? null : Number(row.pre_score || 0);
            record.pre_total = row.pre_total == null ? null : Number(row.pre_total || 0);
            record.pre_percent = percent(record.pre_score, record.pre_total);
            record.post_score = row.post_score == null ? null : Number(row.post_score || 0);
            record.post_total = row.post_total == null ? null : Number(row.post_total || 0);
            record.post_percent = percent(record.post_score, record.post_total);
            record.growth_percent = record.pre_percent == null || record.post_percent == null
                ? null
                : record.post_percent - record.pre_percent;
            record.started = true;
            record.last_activity_at = latestDate(row.latest_quiz_at, row.pre_completed_at, row.post_completed_at);
        });

        exerciseRows.forEach((row) => {
            const record = getRecord(row.user_id, row.lesson_id);
            record.exercise_attempts = Number(row.exercise_attempts || 0);
            record.passed_exercises = Number(row.passed_exercises || 0);
            record.started = record.started || record.exercise_attempts > 0;
            record.last_activity_at = latestDate(record.last_activity_at, row.latest_exercise_at);
        });

        miniGameRows.forEach((row) => {
            const record = getRecord(row.user_id, row.lesson_id);
            record.mini_game_attempts = Number(row.mini_game_attempts || 0);
            record.completed_mini_games = Number(row.completed_mini_games || 0);
            record.started = record.started || record.mini_game_attempts > 0;
            record.last_activity_at = latestDate(record.last_activity_at, row.latest_mini_game_at);
        });

        recordMap.forEach((record) => {
            const requiredExercises = exerciseTotals.get(Number(record.lesson_id)) || 0;
            const passedPostTest = Number(record.post_percent || 0) >= LESSON_PASS_PERCENT;
            const passedExercises = Number(record.passed_exercises || 0) >= requiredExercises;
            record.completed = passedPostTest && passedExercises;
            record.status = record.completed ? 'completed' : record.started ? 'in_progress' : 'not_started';
        });

        const studentRows = students.map((student) => {
            const lessonsForStudent = lessons
                .map((lesson) => recordMap.get(makeKey(student.user_id, lesson.lesson_id)))
                .filter(Boolean)
                .sort((a, b) => new Date(b.last_activity_at || 0) - new Date(a.last_activity_at || 0));
            const completedLessons = lessonsForStudent.filter((record) => record.completed).length;
            const inProgressLessons = lessonsForStudent.filter((record) => record.status === 'in_progress').length;
            const currentLesson = lessonsForStudent.find((record) => record.status === 'in_progress')
                || lessonsForStudent[0]
                || null;
            const preScores = lessonsForStudent.map((record) => record.pre_percent).filter((value) => value != null);
            const postScores = lessonsForStudent.map((record) => record.post_percent).filter((value) => value != null);
            const average = (values) => values.length
                ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
                : null;
            const avgPrePercent = average(preScores);
            const avgPostPercent = average(postScores);

            return {
                user_id: Number(student.user_id),
                username: student.username,
                completed_lessons: completedLessons,
                in_progress_lessons: inProgressLessons,
                total_lessons: lessons.length,
                status: currentLesson?.status || 'not_started',
                current_lesson: currentLesson,
                avg_pre_percent: avgPrePercent,
                avg_post_percent: avgPostPercent,
                growth_percent: avgPrePercent == null || avgPostPercent == null ? null : avgPostPercent - avgPrePercent,
                last_activity_at: currentLesson?.last_activity_at || student.created_at || null,
                lessons: lessonsForStudent,
            };
        });

        const lessonSummaries = lessons.map((lesson) => {
            const rows = students.map((student) => {
                const record = recordMap.get(makeKey(student.user_id, lesson.lesson_id));
                return {
                    user_id: Number(student.user_id),
                    username: student.username,
                    ...(record || {
                        lesson_id: Number(lesson.lesson_id),
                        lesson_title: lesson.title,
                        module_title: lesson.module_title,
                        pre_score: null,
                        pre_total: null,
                        pre_percent: null,
                        post_score: null,
                        post_total: null,
                        post_percent: null,
                        growth_percent: null,
                        exercise_attempts: 0,
                        passed_exercises: 0,
                        mini_game_attempts: 0,
                        completed_mini_games: 0,
                        started: false,
                        completed: false,
                        status: 'not_started',
                        last_activity_at: null,
                    }),
                };
            });
            const completed = rows.filter((row) => row.status === 'completed');
            const inProgress = rows.filter((row) => row.status === 'in_progress');
            const notStarted = rows.filter((row) => row.status === 'not_started');
            const prePercents = rows.map((row) => row.pre_percent).filter((value) => value != null);
            const postPercents = rows.map((row) => row.post_percent).filter((value) => value != null);
            const average = (values) => values.length
                ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
                : null;
            const avgPrePercent = average(prePercents);
            const avgPostPercent = average(postPercents);

            return {
                lesson_id: Number(lesson.lesson_id),
                title: lesson.title,
                module_title: lesson.module_title,
                completed_count: completed.length,
                in_progress_count: inProgress.length,
                not_started_count: notStarted.length,
                not_completed_count: students.length - completed.length,
                avg_pre_percent: avgPrePercent,
                avg_post_percent: avgPostPercent,
                growth_percent: avgPrePercent == null || avgPostPercent == null ? null : avgPostPercent - avgPrePercent,
                students: rows,
                completed_students: completed,
                in_progress_students: inProgress,
                not_started_students: notStarted,
            };
        });

        res.json({
            total_students: students.length,
            total_lessons: lessons.length,
            completed_lesson_records: Array.from(recordMap.values()).filter((record) => record.completed).length,
            in_progress_students: studentRows.filter((student) => student.status === 'in_progress').length,
            lesson_summaries: lessonSummaries,
            students: studentRows,
        });
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.get('/api/admin/users', async (_req, res) => {
    try {
        await ensureCompetitiveArenaSchema();
        await ensureLearningProgressSchema();

        const [rows] = await db.execute(
            `WITH competitive_scores AS (
                SELECT
                    user_id,
                    COALESCE(SUM(score), 0) AS competitive_score
                FROM multiplayer_submissions
                GROUP BY user_id
             ),
             arcade_scores AS (
                SELECT
                    user_id,
                    COALESCE(SUM(
                        CASE
                            WHEN is_completed = 1 AND COALESCE(score, 0) = 0 THEN 100
                            ELSE COALESCE(score, 0)
                        END
                    ), 0) AS arcade_score
                FROM mini_game_user_exercise_progress
                GROUP BY user_id
             )
             SELECT
                u.user_id,
                u.username,
                u.email,
                u.role,
                u.level,
                u.xp,
                u.virtual_currency AS coins,
                COALESCE(cs.competitive_score, 0) AS competitive_score,
                COALESCE(a.arcade_score, 0) AS arcade_score,
                COALESCE(cs.competitive_score, 0) + COALESCE(a.arcade_score, 0) AS high_score,
                COALESCE(u.is_deleted, 0) AS is_deleted,
                COALESCE(u.is_banned, 0) AS is_banned,
                u.ban_until,
                u.created_at
             FROM users u
             LEFT JOIN competitive_scores cs ON cs.user_id = u.user_id
             LEFT JOIN arcade_scores a ON a.user_id = u.user_id
             ORDER BY high_score DESC, u.level DESC, u.virtual_currency DESC, u.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.post('/api/password/forgot', async (req, res) => {
    const email = String(req.body?.email || '').trim();
    const genericMessage = 'ถ้าอีเมลนี้มีบัญชีอยู่ในระบบ เราจะส่งลิงก์สำหรับเปลี่ยนรหัสผ่านให้ทันที';

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'กรุณากรอกอีเมลให้ถูกต้อง' });
    }

    try {
        const [users] = await db.execute(
            'SELECT user_id, username, email FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
            [email]
        );

        if (users.length === 0) {
            return res.json({ message: genericMessage, emailSent: false });
        }

        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetUrl = `${CLIENT_URL}/login?reset=${resetToken}`;

        await db.execute(
            'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL',
            [user.user_id]
        );
        await db.execute(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR))',
            [user.user_id, tokenHash]
        );

        const emailSent = await sendAppEmail({
            to: user.email,
            subject: 'เปลี่ยนรหัสผ่าน PySim',
            html: `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;color:#0f172a">
                <h2 style="margin:0 0 12px">เปลี่ยนรหัสผ่านของคุณ</h2>
                <p>สวัสดี ${user.username || ''}</p>
                <p>เราได้รับคำขอให้เปลี่ยนรหัสผ่านบัญชี PySim ของคุณ กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
                <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 22px;background:#2563eb;color:white;text-decoration:none;border-radius:12px;font-weight:700">ตั้งรหัสผ่านใหม่</a>
                <p style="font-size:13px;color:#64748b">ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้เป็นคนขอเปลี่ยนรหัสผ่าน สามารถละเว้นอีเมลนี้ได้</p>
                <p style="font-size:12px;color:#94a3b8;word-break:break-all">หากปุ่มใช้งานไม่ได้ ให้คัดลอกลิงก์นี้ไปเปิดในเบราว์เซอร์: ${resetUrl}</p>
            </div>`
        });

        if (!emailSent) {
            console.log(`[MOCK] Password reset link for ${user.email}: ${resetUrl}`);
        }

        res.json({
            message: genericMessage,
            emailSent,
            ...(emailSent ? {} : { debugResetUrl: resetUrl }),
        });
    } catch (err) {
        console.error('Password forgot error:', err.message);
        res.status(500).json({ message: 'ไม่สามารถส่งอีเมลเปลี่ยนรหัสผ่านได้' });
    }
});

app.get('/api/password/reset/:token', async (req, res) => {
    const resetToken = String(req.params.token || '').trim();
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    try {
        const [rows] = await db.execute(
            `SELECT prt.id, prt.user_id, u.email
             FROM password_reset_tokens prt
             JOIN users u ON u.user_id = prt.user_id
             WHERE prt.token_hash = ?
               AND prt.used_at IS NULL
               AND prt.expires_at > CURRENT_TIMESTAMP
             LIMIT 1`,
            [tokenHash]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'ลิงก์เปลี่ยนรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว' });
        }

        res.json({ valid: true, email: rows[0].email });
    } catch (err) {
        console.error('Password reset token check error:', err.message);
        res.status(500).json({ message: 'ตรวจสอบลิงก์ไม่สำเร็จ' });
    }
});

app.post('/api/password/reset', async (req, res) => {
    const resetToken = String(req.body?.token || '').trim();
    const password = String(req.body?.password || '');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    if (!resetToken || !password) {
        return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
        return res.status(400).json({ message: `รหัสผ่านไม่ผ่านเกณฑ์: ${passwordErrors.join(', ')}` });
    }

    try {
        const [rows] = await db.execute(
            `SELECT prt.id, prt.user_id
             FROM password_reset_tokens prt
             WHERE prt.token_hash = ?
               AND prt.used_at IS NULL
               AND prt.expires_at > CURRENT_TIMESTAMP
             LIMIT 1`,
            [tokenHash]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'ลิงก์เปลี่ยนรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await db.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, rows[0].user_id]);
        await db.execute('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [rows[0].id]);
        await db.execute(
            'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL',
            [rows[0].user_id]
        );

        res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' });
    } catch (err) {
        console.error('Password reset error:', err.message);
        res.status(500).json({ message: 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
    }
});

app.get('/api/course-content', async (req, res) => {
    try {
        const currentLevel = Number(req.query.user_level || req.query.userLevel || 0);
        const userId = req.query.user_id || req.query.userId || 0; // รับค่า userId จาก query

        // ปรับ Query โดยใช้ JOIN เพื่อดึงสถิติแบบฝึกหัดในคราวเดียว
        //
        // COUNT(DISTINCT ...) on both sides, not COUNT(*): the join fans out one
        // row per submission, so a learner who submits the same exercise twice
        // would otherwise be shown "ภาคปฏิบัติ 2/9" for a lesson that has five.
        const [modules] = await db.execute('SELECT module_id, title, order_index, required_level FROM modules ORDER BY order_index');
        const [lessons] = await db.execute(`
            SELECT
                l.lesson_id,
                l.module_id,
                l.title,
                l.order_index,
                l.required_level,
                COUNT(DISTINCT e.exercise_id) as total_count,
                COUNT(DISTINCT CASE WHEN es.is_passed = 1 THEN es.exercise_id END) as completed_count,
                COUNT(DISTINCT es.exercise_id) as attempted_count
            FROM lessons l
            LEFT JOIN exercises e ON l.lesson_id = e.lesson_id
            LEFT JOIN exercise_submissions es ON e.exercise_id = es.exercise_id AND es.user_id = ?
            GROUP BY l.lesson_id, l.module_id, l.title, l.order_index, l.required_level
            ORDER BY l.order_index
        `, [userId]);

        // What this learner has done in each lesson's quizzes, and - separately -
        // which quizzes each lesson even has. The learning page's badge and its
        // sub-lesson unlocking both hang off these, and until now the endpoint
        // returned neither, so every lesson on screen read "ยังไม่เริ่ม".
        const [quizAttempts] = await db.execute(
            `SELECT lesson_id, quiz_type, score, total_questions
               FROM lesson_quiz_attempts WHERE user_id = ?`,
            [userId]
        );
        const [quizKindRows] = await db.execute('SELECT lesson_id, quiz_type FROM lesson_quizzes');

        const attemptByLesson = new Map();
        for (const a of quizAttempts) {
            const key = Number(a.lesson_id);
            if (!attemptByLesson.has(key)) attemptByLesson.set(key, {});
            attemptByLesson.get(key)[String(a.quiz_type).toLowerCase()] = a;
        }
        const quizKinds = new Map();
        for (const row of quizKindRows) {
            const key = Number(row.lesson_id);
            if (!quizKinds.has(key)) quizKinds.set(key, new Set());
            quizKinds.get(key).add(String(row.quiz_type).toLowerCase());
        }

        const moduleRows = Array.isArray(modules) ? modules : [];
        const lessonRows = Array.isArray(lessons) ? lessons : [];

        const data = moduleRows.map((m) => ({
            module_id: m.module_id,
            title: m.title,
            required_level: m.required_level || 0,
            is_locked: currentLevel < Number(m.required_level || 0),
            lessons: lessonRows
                .filter(l => l.module_id === m.module_id)
                .map(l => {
                    const id = Number(l.lesson_id);
                    const attempts = attemptByLesson.get(id) || {};
                    const kinds = quizKinds.get(id) || new Set();
                    const progress = evaluateLesson({
                        pre: attempts.pre || null,
                        post: attempts.post || null,
                        hasPreQuiz: kinds.has('pre'),
                        hasPostQuiz: kinds.has('post'),
                        exercisesTotal: Number(l.total_count || 0),
                        exercisesPassed: Number(l.completed_count || 0),
                        exercisesAttempted: Number(l.attempted_count || 0),
                    });
                    return {
                        lesson_id: l.lesson_id,
                        id: l.lesson_id,
                        title: l.title,
                        required_level: l.required_level || 0,
                        is_locked: currentLevel < Number(l.required_level || 0),
                        completed_count: progress.exercisesPassed,
                        total_count: progress.exercisesTotal,
                        attempted_count: progress.exercisesAttempted,
                        has_pre_quiz: kinds.has('pre'),
                        has_post_quiz: kinds.has('post'),
                        pre_quiz_completed: progress.preTaken,
                        post_quiz_completed: progress.postPassed,
                        // What the page actually renders: the badge reads
                        // `status`, and the next sub-lesson opens on `opens_next`.
                        status: progress.status,
                        percent: progress.percent,
                        is_started: progress.started,
                        is_completed: progress.completed,
                        opens_next: progress.opensNext,
                    };
                })
        }));
        
        res.json(data);
    } catch (err) {
        const message = logRouteError('❌ Course Content Error:', err);
        res.status(500).json({ error: message });
    }
});

app.get('/api/competitive/challenges', async (req, res) => {
    const userId = Number(req.query.userId);

    try {
        if (Number.isFinite(userId) && userId > 0) {
            await finalizeExpiredCompetitiveChallenges(userId);
        }

        const [challenges] = await db.execute(`
            SELECT c.*,
                   COALESCE(u.username, 'Admin') AS creator_name,
                   COALESCE(u.role, 'admin') AS creator_role,
                   (
                       SELECT COUNT(*)
                       FROM active_accepted_challenges a
                       WHERE a.challenge_id = c.challenge_id
                   ) AS active_count,
                   (
                       SELECT COUNT(*)
                       FROM multiplayer_submissions s
                       WHERE s.challenge_id = c.challenge_id
                   ) AS submission_count
            FROM multiplayer_challenges c
            LEFT JOIN users u ON c.created_by = u.user_id
            -- A challenge's expires_at is its shelf life, and until now
            -- nothing enforced it: every one of the arena's challenges was
            -- weeks past its date and still listed, still acceptable, still
            -- payable. Expired now means gone from the arena. The row itself
            -- stays in the problems table - see CONTEXT.md, a problem outlives the
            -- mode registration that showed it.
            --
            -- Two exceptions, both from Person 2's scheduling work:
            -- 'special' scope is not part of the ordinary rotation and is
            -- listed by its own endpoint, and is_test rows are the system's own
            -- fixtures, which have to stay reachable for the tests that use
            -- them regardless of any date.
            WHERE COALESCE(c.challenge_scope, 'standard') <> 'special'
              AND (
                  c.is_test = 1
                  OR c.expires_at IS NULL
                  OR c.expires_at > CURRENT_TIMESTAMP
              )
            ORDER BY c.challenge_id DESC
        `);

        if (Number.isFinite(userId) && userId > 0) {
            const [accepted] = await db.execute(
                'SELECT challenge_id, code_state, accepted_at FROM active_accepted_challenges WHERE user_id = ?',
                [userId]
            );
            const [submitted] = await db.execute(
                'SELECT challenge_id, score, passed_cases, total_cases FROM multiplayer_submissions WHERE user_id = ?',
                [userId]
            );

            const acceptedIds = new Set(accepted.map((item) => item.challenge_id));
            const acceptedMap = Object.fromEntries(accepted.map((item) => [item.challenge_id, item]));
            const submittedIds = new Set(submitted.map((item) => item.challenge_id));

            for (const challenge of challenges) {
                challenge.is_accepted = acceptedIds.has(challenge.challenge_id) ? 1 : 0;
                challenge.code_state = acceptedMap[challenge.challenge_id]?.code_state || '';
                challenge.accepted_at = acceptedMap[challenge.challenge_id]?.accepted_at || null;
                challenge.is_submitted = submittedIds.has(challenge.challenge_id) ? 1 : 0;
            }
        } else {
            for (const challenge of challenges) {
                challenge.is_accepted = 0;
                challenge.code_state = '';
                challenge.accepted_at = null;
                challenge.is_submitted = 0;
            }
        }

        res.json(challenges);
    } catch (err) {
        console.error('Competitive challenges fetch error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/competitive/challenges', async (req, res) => {
    const {
        title,
        description,
        difficulty,
        reward,
        time_limit: timeLimit,
        expires_at: expiresAt,
        test_cases: testCases,
        created_by: createdBy,
        challenge_type: challengeType,
        challenge_scope: challengeScope,
    } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'title and description are required' });
    }

    try {
        const normalizedScope = normalizeCompetitiveChallengeScope(challengeScope);
        const normalizedType = normalizeCompetitiveChallengeType(challengeType, normalizedScope);
        const expires = expiresAt || new Date(Date.now() + 24 * 3600000).toISOString();
        const tests = testCases
            ? (typeof testCases === 'string' ? testCases : JSON.stringify(testCases))
            : '[]';

        // Stored in the canonical shape: the expected side of a case is named
        // `expected`, whichever of the two spellings the caller sent.
        const { entryId } = await createProblem('competitive', {
            titleTh: title,
            descTh: description,
            testKind: 'stdio',
            testCases: normalizeCompetitiveTestCases(parseCompetitiveTestCases(tests)),
            difficulty: difficulty || 'Easy',
            coinReward: Number(reward || 500),
            timeLimitSec: Number(timeLimit || 300),
            expiresAt: expires,
            extra: {
                is_test: 0,
                challenge_type: normalizedType,
                challenge_scope: normalizedScope,
            },
            createdBy: createdBy || null,
        });

        res.status(201).json({
            message: 'Challenge created successfully',
            challenge_id: entryId,
        });
    } catch (err) {
        console.error('Competitive challenge create error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/competitive/challenges/:id/accept', async (req, res) => {
    const challengeId = Number(req.params.id);
    const { user_id: userId } = req.body;

    if (!challengeId || !userId) {
        return res.status(400).json({ error: 'challengeId and user_id are required' });
    }

    try {
        const [challengeRows] = await db.execute(
            'SELECT challenge_id, expires_at, is_test, challenge_scope FROM multiplayer_challenges WHERE challenge_id = ?',
            [challengeId]
        );

        if (challengeRows.length === 0) {
            return res.status(404).json({ error: 'challenge not found' });
        }

        if (String(challengeRows[0]?.challenge_scope || '').toLowerCase() === 'special') {
            return res.status(410).json({ error: 'challenge is no longer available' });
        }

        const expiresAt = challengeRows[0]?.expires_at ? new Date(challengeRows[0].expires_at).getTime() : NaN;
        if (Number(challengeRows[0]?.is_test) !== 1 && Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
            return res.status(410).json({ error: 'challenge is no longer available' });
        }

        const [existing] = await db.execute(
            'SELECT 1 FROM active_accepted_challenges WHERE user_id = ? AND challenge_id = ?',
            [userId, challengeId]
        );

        if (existing.length > 0) {
            return res.json({ success: true, message: 'Already accepted' });
        }

        // Checked here as well as in the listing: a player whose browser is
        // still showing a list fetched before the expiry could otherwise
        // accept a challenge that no longer exists as far as the arena is
        // concerned, and then be scored on it.
        const [live] = await db.execute(
            'SELECT challenge_id FROM multiplayer_challenges WHERE challenge_id = ? AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)',
            [challengeId]
        );
        if (live.length === 0) {
            return res.status(410).json({ error: 'โจทย์ข้อนี้หมดอายุแล้ว' });
        }

        await db.execute(`
            INSERT INTO active_accepted_challenges (user_id, challenge_id, code_state)
            VALUES (?, ?, '')
        `, [userId, challengeId]);

        res.json({ success: true, message: 'Challenge accepted successfully' });
    } catch (err) {
        console.error('Competitive challenge accept error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/competitive/challenges/:id/save-draft', async (req, res) => {
    const challengeId = Number(req.params.id);
    const { user_id: userId, code } = req.body;

    if (!challengeId || !userId) {
        return res.status(400).json({ error: 'challengeId and user_id are required' });
    }

    try {
        await db.execute(`
            UPDATE active_accepted_challenges
            SET code_state = ?, last_saved_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND challenge_id = ?
        `, [code || '', userId, challengeId]);

        res.json({ success: true });
    } catch (err) {
        console.error('Competitive draft save error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/competitive/challenges/:id/run-tests', async (req, res) => {
    const challengeId = Number(req.params.id);
    const { user_id: userId, code } = req.body;

    if (!challengeId) {
        return res.status(400).json({ error: 'challengeId is required' });
    }

    try {
        const [challenges] = await db.execute(
            'SELECT challenge_id, title, reward, created_by, test_cases, time_limit, is_test FROM multiplayer_challenges WHERE challenge_id = ?',
            [challengeId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (userId) {
            const [acceptedRows] = await db.execute(
                'SELECT accepted_at FROM active_accepted_challenges WHERE user_id = ? AND challenge_id = ?',
                [userId, challengeId]
            );
            if (isCompetitiveChallengeExpired(challenges[0], acceptedRows[0]?.accepted_at)) {
                return res.status(400).json({ error: 'Time limit exceeded. This challenge is lost.' });
            }
        }

        const parsedTestCases = parseCompetitiveTestCases(challenges[0].test_cases);
        if (parsedTestCases.length === 0) {
            return res.status(400).json({ error: 'This challenge has no runnable test cases.' });
        }

        const testResult = await runCompetitivePythonTests({
            code,
            testCases: parsedTestCases,
        });

        res.json({
            success: true,
            passed: testResult.passed,
            total: testResult.total,
            results: testResult.results,
            runnerAvailable: testResult.runnerAvailable,
        });
    } catch (err) {
        console.error('Competitive test run error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/competitive/challenges/:id/submit', async (req, res) => {
    const challengeId = Number(req.params.id);
    const { user_id: userId, code } = req.body;

    if (!challengeId || !userId) {
        return res.status(400).json({ error: 'challengeId and user_id are required' });
    }

    try {
        const [challenges] = await db.execute(
            'SELECT * FROM multiplayer_challenges WHERE challenge_id = ?',
            [challengeId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const [acceptedRows] = await db.execute(
            'SELECT accepted_at FROM active_accepted_challenges WHERE user_id = ? AND challenge_id = ?',
            [userId, challengeId]
        );
        const parsedTestCases = parseCompetitiveTestCases(challenges[0].test_cases);
        const timedOut = isCompetitiveChallengeExpired(challenges[0], acceptedRows[0]?.accepted_at);
        const testResult = timedOut
            ? { total: parsedTestCases.length, passed: 0, results: [], runnerAvailable: true }
            : await runCompetitivePythonTests({
                code,
                testCases: parsedTestCases,
            });
        const allTestsPassed = !timedOut
            && Number(testResult.total || 0) > 0
            && Number(testResult.passed || 0) === Number(testResult.total || 0);

        const preliminaryScore = timedOut
            ? buildCompetitiveTimeUpScore(parsedTestCases)
            : allTestsPassed
                ? buildCompetitivePerfectTestScore({
                    challenge: challenges[0],
                    testResult,
                    acceptedAt: acceptedRows[0]?.accepted_at,
                })
            : scoreCompetitiveSubmission({
                code,
                testCases: parsedTestCases,
                acceptedAt: acceptedRows[0]?.accepted_at,
                testResult,
            });
        const scored = timedOut
            ? preliminaryScore
            : allTestsPassed
                ? preliminaryScore
            : await reviewCompetitiveSubmissionWithAI({
                challenge: challenges[0],
                code,
                testCases: parsedTestCases,
                testResult,
                fallbackScore: preliminaryScore,
            });
        const breakdownJson = JSON.stringify(scored.breakdown);
        const feedbackJson = JSON.stringify({ review: scored.feedback });

        const [existing] = await db.execute(
            'SELECT submission_id FROM multiplayer_submissions WHERE user_id = ? AND challenge_id = ?',
            [userId, challengeId]
        );

        if (existing.length > 0) {
            await db.execute(`
                UPDATE multiplayer_submissions
                SET code = ?, score = ?, passed_cases = ?, total_cases = ?, efficiency_ms = ?, ai_feedback = ?, breakdown = ?, submitted_at = CURRENT_TIMESTAMP
                WHERE submission_id = ?
            `, [
                code || '',
                scored.score,
                scored.passedCases,
                scored.totalCases,
                Number(scored.breakdown.elapsedSeconds || 0) * 1000,
                feedbackJson,
                breakdownJson,
                existing[0].submission_id,
            ]);
        } else {
            await db.execute(`
                INSERT INTO multiplayer_submissions
                    (challenge_id, user_id, code, score, passed_cases, total_cases, efficiency_ms, ai_feedback, breakdown)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                challengeId,
                userId,
                code || '',
                scored.score,
                scored.passedCases,
                scored.totalCases,
                Number(scored.breakdown.elapsedSeconds || 0) * 1000,
                feedbackJson,
                breakdownJson,
            ]);
        }

        let rewardCoins = calculateCompetitiveSolverReward(challenges[0], scored);
        let creatorBonusCoins = 0;

        rewardCoins = await sendCompetitiveResultMail({
            challenge: challenges[0],
            userId,
            scored,
            testResult,
            timedOut,
        });

        if (!timedOut && (!scored.breakdown?.aiReviewed || scored.breakdown?.aiApproved)) {
            creatorBonusCoins = await sendCompetitiveCreatorBonusMail({
                challenge: challenges[0],
                solverUserId: userId,
                scored,
            });
        }

        await db.execute(
            'DELETE FROM active_accepted_challenges WHERE user_id = ? AND challenge_id = ?',
            [userId, challengeId]
        );

        res.json({
            success: true,
            score: scored.score,
            passed: scored.passedCases,
            total: scored.totalCases,
            breakdown: scored.breakdown,
            feedback: scored.feedback,
            timeExpired: timedOut,
            rewardCoins,
            creatorBonusCoins,
            testResults: testResult.results,
        });
    } catch (err) {
        console.error('Competitive challenge submit error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/competitive/challenges/:id/force-summary', async (req, res) => {
    const challengeId = Number(req.params.id);

    if (!challengeId) {
        return res.status(400).json({ error: 'challengeId is required' });
    }

    try {
        const [challenges] = await db.execute(
            'SELECT * FROM multiplayer_challenges WHERE challenge_id = ?',
            [challengeId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const challenge = challenges[0];
        if (Number(challenge.is_test) !== 1) {
            return res.status(400).json({ error: 'Only test challenges can be summarized instantly.' });
        }

        const [participants] = await db.execute(`
            SELECT DISTINCT
                u.user_id,
                u.username,
                COALESCE(s.score, 0) AS score,
                COALESCE(s.efficiency_ms, 999999999) AS efficiency_ms
            FROM (
                SELECT user_id FROM active_accepted_challenges WHERE challenge_id = ?
                UNION
                SELECT user_id FROM multiplayer_submissions WHERE challenge_id = ?
            ) p
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN multiplayer_submissions s
                ON s.user_id = p.user_id
               AND s.challenge_id = ?
            ORDER BY score DESC, efficiency_ms ASC
        `, [challengeId, challengeId, challengeId]);

        for (let index = 0; index < participants.length; index += 1) {
            const participant = participants[index];
            const rank = index + 1;
            let coins = 0;

            if (rank === 1) coins = Number(challenge.reward || 0);
            else if (rank === 2) coins = Math.round(Number(challenge.reward || 0) * 0.5);
            else if (rank === 3) coins = Math.round(Number(challenge.reward || 0) * 0.25);
            else if (rank <= 10) coins = 15;

            await db.execute(`
                INSERT INTO user_mailbox (user_id, title, content, attachment_coins, is_read, is_claimed)
                VALUES (?, ?, ?, ?, 0, 0)
            `, [
                participant.user_id,
                `Challenge Summary: ${challenge.title}`,
                `Congratulations! You placed rank ${rank} in '${challenge.title}'. Your score is ${participant.score}/100 and you received ${coins} Code Coins.`,
                coins,
            ]);
        }

        await db.execute('DELETE FROM active_accepted_challenges WHERE challenge_id = ?', [challengeId]);
        await db.execute('DELETE FROM multiplayer_submissions WHERE challenge_id = ?', [challengeId]);

        res.json({
            success: true,
            message: `Evaluated and generated mail rewards for ${participants.length} users. Challenge resets.`,
        });
    } catch (err) {
        console.error('Competitive force summary error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/competitive/leaderboard', async (_req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                s.user_id,
                COALESCE(u.username, 'Coder') AS username,
                SUM(s.score) AS score,
                COUNT(DISTINCT s.challenge_id) AS challenge_count,
                COALESCE(ROUND(AVG(s.score)), 0) AS avg_score,
                MAX(s.score) AS best_score,
                MIN(s.efficiency_ms) AS best_efficiency_ms,
                MAX(s.submitted_at) AS last_submitted_at,
                split_part(string_agg(c.title::text, '||' ORDER BY s.submitted_at DESC), '||', 1) AS title
            FROM multiplayer_submissions s
            JOIN multiplayer_challenges c ON c.challenge_id = s.challenge_id
            LEFT JOIN users u ON u.user_id = s.user_id
            GROUP BY s.user_id, u.username
            ORDER BY score DESC, best_score DESC, best_efficiency_ms ASC, last_submitted_at ASC
            LIMIT 20
        `);

        res.json(rows);
    } catch (err) {
        console.error('Competitive leaderboard error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// The learner-facing leaderboard, behind the main menu's Leaderboard card.
//
// Separate from /api/competitive/leaderboard, which ranks people by their
// scores in one mode. This ranks the whole game: XP is earned in lessons,
// exercises, mini-games and matches alike, so it is the only number that means
// the same thing to every player.
//
// Only fields a player is already shown about other players go out: name,
// level, XP, coins. Never the email, and never a row for a deleted or banned
// account. The admin roster endpoint (/api/admin/users) returns far more than
// this and must not be what a student page calls.
//
// SIX BOARDS, ONE SHAPE. Every board returns the same row - name, level, xp,
// coins, plus `metric` (the number this board is actually sorted by) and
// `metricDetail` (the raw counts behind it, so a percentage can show its own
// working). The client renders one table and only changes the column header.
//
// Every board is built from the same eligible-players base: no deleted
// accounts, no banned accounts, no admins. A board that quietly used a
// different population would rank the same people differently for no visible
// reason.
const eligiblePlayers = (t = '') => `COALESCE(${t}is_deleted, 0) = 0
                                 AND COALESCE(${t}is_banned, 0) = 0
                                 AND ${t}role <> 'admin'`;
const LEADERBOARD_ELIGIBLE = eligiblePlayers();
const LEADERBOARD_ELIGIBLE_U = eligiblePlayers('u.');

// A win rate needs a floor under it or it means nothing: one match won is
// 100%, and that player would sit above someone who has won forty out of
// sixty for the rest of time. Three matches is low enough that a new player
// can appear within an evening and high enough that a single lucky match
// cannot top the board.
const ARCADE_WINRATE_MIN_MATCHES = 3;

const LEADERBOARD_BOARDS = {
    // XP - the original board, and still the default. It is the only number
    // earned in every mode, so it is the one that compares everybody.
    xp: {
        sql: `SELECT username, COALESCE(level, 1) AS level, COALESCE(xp, 0) AS xp,
                     COALESCE(virtual_currency, 0) AS coins,
                     COALESCE(xp, 0) AS metric, NULL AS metric_detail
                FROM users
               WHERE ${LEADERBOARD_ELIGIBLE}
               ORDER BY metric DESC, level DESC, username ASC
               LIMIT ?`,
    },
    level: {
        sql: `SELECT username, COALESCE(level, 1) AS level, COALESCE(xp, 0) AS xp,
                     COALESCE(virtual_currency, 0) AS coins,
                     COALESCE(level, 1) AS metric, NULL AS metric_detail
                FROM users
               WHERE ${LEADERBOARD_ELIGIBLE}
               ORDER BY metric DESC, xp DESC, username ASC
               LIMIT ?`,
    },
    // Arcade win rate, as a percentage with its counts carried alongside.
    // arcade_player_stats is keyed by the arcade display name, which is the
    // username - an INNER JOIN, so a stats row left behind by a name that no
    // longer has an account cannot appear on a player-facing board.
    arcade_winrate: {
        sql: `SELECT u.username, COALESCE(u.level, 1) AS level, COALESCE(u.xp, 0) AS xp,
                     COALESCE(u.virtual_currency, 0) AS coins,
                     ROUND((s.wins::numeric * 100) / NULLIF(s.matches_played, 0), 1) AS metric,
                     json_build_object('wins', s.wins, 'matches', s.matches_played) AS metric_detail
                FROM arcade_player_stats s
                JOIN users u ON u.username = s.user_name
               WHERE ${LEADERBOARD_ELIGIBLE_U}
                 AND s.matches_played >= ?
               ORDER BY metric DESC, s.matches_played DESC, u.username ASC
               LIMIT ?`,
        params: [ARCADE_WINRATE_MIN_MATCHES],
    },
    // Distinct challenges solved in the Competitive Arena. DISTINCT because a
    // player may submit the same challenge more than once, and re-submitting
    // one problem is not the same achievement as solving another.
    competitive: {
        sql: `SELECT u.username, COALESCE(u.level, 1) AS level, COALESCE(u.xp, 0) AS xp,
                     COALESCE(u.virtual_currency, 0) AS coins,
                     COUNT(DISTINCT m.challenge_id) AS metric, NULL AS metric_detail
                FROM multiplayer_submissions m
                JOIN users u ON u.user_id = m.user_id
               WHERE ${LEADERBOARD_ELIGIBLE_U}
               GROUP BY u.username, u.level, u.xp, u.virtual_currency
               ORDER BY metric DESC, u.xp DESC, u.username ASC
               LIMIT ?`,
    },
    coins: {
        sql: `SELECT username, COALESCE(level, 1) AS level, COALESCE(xp, 0) AS xp,
                     COALESCE(virtual_currency, 0) AS coins,
                     COALESCE(virtual_currency, 0) AS metric, NULL AS metric_detail
                FROM users
               WHERE ${LEADERBOARD_ELIGIBLE}
               ORDER BY metric DESC, xp DESC, username ASC
               LIMIT ?`,
    },
    // Cosmetics owned. Counted from user_inventory rather than from anything
    // the shop page holds, so it reflects what the account actually owns.
    cosmetics: {
        sql: `SELECT u.username, COALESCE(u.level, 1) AS level, COALESCE(u.xp, 0) AS xp,
                     COALESCE(u.virtual_currency, 0) AS coins,
                     COUNT(i.item_id) AS metric, NULL AS metric_detail
                FROM user_inventory i
                JOIN users u ON u.user_id = i.user_id
               WHERE ${LEADERBOARD_ELIGIBLE_U}
               GROUP BY u.username, u.level, u.xp, u.virtual_currency
               ORDER BY metric DESC, u.xp DESC, u.username ASC
               LIMIT ?`,
    },
};

app.get('/api/leaderboard', async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        // An unknown board name falls back to xp rather than erroring: this is
        // a page a learner lands on, and an empty screen with a 400 behind it
        // helps nobody. The key is looked up in a fixed table, never
        // interpolated, so no query text can arrive from the URL.
        const boardKey = Object.prototype.hasOwnProperty.call(LEADERBOARD_BOARDS, String(req.query.board || ''))
            ? String(req.query.board)
            : 'xp';
        const board = LEADERBOARD_BOARDS[boardKey];

        const [rows] = await db.query(board.sql, [...(board.params || []), limit]);
        res.json({
            board: boardKey,
            minMatches: boardKey === 'arcade_winrate' ? ARCADE_WINRATE_MIN_MATCHES : undefined,
            rows: rows.map((r, i) => ({ rank: i + 1, ...r, metric: Number(r.metric) || 0 })),
        });
    } catch (err) {
        console.error('❌ GET /api/leaderboard error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// How many people are playing RIGHT NOW. The main menu used to state a
// hardcoded 244, which is worse than showing nothing: a player who opens an
// empty room browser has been told a number that was never true.
//
// "Playing" means measurable activity, not a session that was opened once:
// someone whose Arcade client is still polling (last_seen inside the same
// staleness window the room sweeper uses), or someone holding an accepted
// Competitive Arena challenge. If the honest answer is 0, 0 is what it says.
app.get('/api/stats/active-players', async (_req, res) => {
    try {
        const staleSeconds = Number(arcadeConfig.staleParticipantSeconds) || 150;
        const [arcadeRows] = await db.query(
            `SELECT COUNT(DISTINCT user_name)::int AS n
               FROM arcade_participants
              WHERE last_seen > CURRENT_TIMESTAMP - (? * INTERVAL '1 second')`,
            [staleSeconds]
        );
        // Bounded by the challenge's own time limit, so an accepted challenge
        // whose clock ran out weeks ago stops counting as somebody playing.
        // Capped at an hour on top of that: the system-test challenges carry a
        // deliberately enormous limit, and without the cap a single old row
        // would inflate this number forever.
        const [competitiveRows] = await db.query(
            `SELECT COUNT(DISTINCT a.user_id)::int AS n
               FROM active_accepted_challenges a
               JOIN multiplayer_challenges c ON c.challenge_id = a.challenge_id
              WHERE a.accepted_at > CURRENT_TIMESTAMP
                    - (LEAST(GREATEST(COALESCE(c.time_limit, 0), 60), 3600) * INTERVAL '1 second')`
        );
        const arcade = Number(arcadeRows?.[0]?.n || 0);
        const competitive = Number(competitiveRows?.[0]?.n || 0);
        res.json({ count: arcade + competitive, arcade, competitive });
    } catch (err) {
        console.error('❌ GET /api/stats/active-players error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/competitive/admin/overview', async (_req, res) => {
    try {
        const [[stats]] = await db.execute(`
            SELECT
                (SELECT COUNT(*) FROM multiplayer_challenges WHERE COALESCE(challenge_scope, 'standard') <> 'special') AS total_challenges,
                (SELECT COUNT(*)
                 FROM active_accepted_challenges a
                 JOIN multiplayer_challenges c ON c.challenge_id = a.challenge_id
                 WHERE COALESCE(c.challenge_scope, 'standard') <> 'special') AS active_accepts,
                (SELECT COUNT(*)
                 FROM multiplayer_submissions s
                 JOIN multiplayer_challenges c ON c.challenge_id = s.challenge_id
                 WHERE COALESCE(c.challenge_scope, 'standard') <> 'special') AS total_submissions,
                (SELECT COALESCE(SUM(attachment_coins), 0) FROM user_mailbox WHERE title LIKE '%โจทย์%' OR title LIKE '%Challenge%') AS pending_mail_coins
        `);

        const [challenges] = await db.execute(`
            SELECT
                c.challenge_id,
                c.title,
                c.reward,
                c.time_limit,
                c.expires_at,
                c.challenge_type,
                c.challenge_scope,
                c.created_at,
                COALESCE(u.username, 'Admin') AS creator_name,
                (
                    SELECT COUNT(*)
                    FROM active_accepted_challenges a
                    WHERE a.challenge_id = c.challenge_id
                ) AS active_count,
                (
                    SELECT COUNT(*)
                    FROM multiplayer_submissions s
                    WHERE s.challenge_id = c.challenge_id
                ) AS submission_count,
                (
                    SELECT COALESCE(ROUND(AVG(s.score)), 0)
                    FROM multiplayer_submissions s
                    WHERE s.challenge_id = c.challenge_id
                ) AS avg_score
            FROM multiplayer_challenges c
            LEFT JOIN users u ON c.created_by = u.user_id
            WHERE COALESCE(c.challenge_scope, 'standard') <> 'special'
            ORDER BY c.challenge_id DESC
            LIMIT 12
        `);

        const [creators] = await db.execute(`
            SELECT
                c.created_by AS user_id,
                COALESCE(u.username, 'Admin') AS username,
                COUNT(DISTINCT c.challenge_id) AS challenge_count,
                COUNT(s.submission_id) AS submission_count,
                (
                    SELECT COALESCE(SUM(m.attachment_coins), 0)
                    FROM user_mailbox m
                    WHERE m.user_id = c.created_by
                      AND m.title LIKE 'มีคนทำโจทย์ของคุณแล้ว:%'
                ) AS creator_bonus_coins
            FROM multiplayer_challenges c
            LEFT JOIN users u ON u.user_id = c.created_by
            LEFT JOIN multiplayer_submissions s ON s.challenge_id = c.challenge_id
            WHERE COALESCE(c.challenge_scope, 'standard') <> 'special'
            GROUP BY c.created_by, u.username
            ORDER BY submission_count DESC, challenge_count DESC
            LIMIT 8
        `);

        res.json({
            stats: {
                totalChallenges: Number(stats?.total_challenges || 0),
                activeAccepts: Number(stats?.active_accepts || 0),
                totalSubmissions: Number(stats?.total_submissions || 0),
                pendingMailCoins: Number(stats?.pending_mail_coins || 0),
            },
            challenges,
            creators,
        });
    } catch (err) {
        console.error('Competitive admin overview error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/mailbox/:userId', async (req, res) => {
    const userId = Number(req.params.userId);

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        const [mails] = await db.execute(
            'SELECT * FROM user_mailbox WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(mails);
    } catch (err) {
        console.error('Mailbox fetch error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/mailbox/:userId/read-all', async (req, res) => {
    const userId = Number(req.params.userId);

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        await db.execute(
            'UPDATE user_mailbox SET is_read = 1 WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Mailbox read-all error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/mailbox/:mailId/claim', async (req, res) => {
    const mailId = Number(req.params.mailId);
    const { user_id: userId } = req.body;

    if (!mailId || !userId) {
        return res.status(400).json({ error: 'mailId and user_id are required' });
    }

    try {
        const [mails] = await db.execute(
            'SELECT * FROM user_mailbox WHERE mail_id = ? AND user_id = ?',
            [mailId, userId]
        );

        if (mails.length === 0) {
            return res.status(404).json({ error: 'Mail message not found' });
        }

        const mail = mails[0];
        if (Number(mail.is_claimed) === 1) {
            return res.status(400).json({ error: 'Coins already claimed from this message.' });
        }

        const coins = Number(mail.attachment_coins || 0);
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            await connection.execute(
                'UPDATE user_mailbox SET is_claimed = 1, is_read = 1 WHERE mail_id = ?',
                [mailId]
            );
            await connection.execute(
                'UPDATE users SET virtual_currency = virtual_currency + ? WHERE user_id = ?',
                [coins, userId]
            );
            await connection.commit();
        } catch (trxErr) {
            await connection.rollback();
            throw trxErr;
        } finally {
            connection.release();
        }

        res.json({ success: true, claimed_coins: coins });
    } catch (err) {
        console.error('Mailbox claim error:', err.message);
        res.status(500).json({ error: err.message });
    }
});



const ensurePasswordResetSchema = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id int(11) NOT NULL AUTO_INCREMENT,
                user_id int(11) NOT NULL,
                token_hash varchar(255) NOT NULL,
                expires_at timestamp NOT NULL,
                used_at timestamp DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (id),
                UNIQUE KEY uq_password_reset_token_hash (token_hash)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } catch (error) {
        console.error('Failed to ensure password reset schema:', error.message);
    }
};

// --- end of merged Person 2 section ----------------------------------------


// --- Lesson Slides ---
app.get('/api/lessons/:lessonId/slides', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT slide_id, slide_order, slide_title AS title, slide_content, slide_src, slide_type FROM lesson_slides WHERE lesson_id = ? ORDER BY slide_order',
            [req.params.lessonId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Lesson Quizzes ---
app.get('/api/lessons/:lessonId/quizzes', async (req, res) => {
    try {
        const [quizRows] = await db.execute('SELECT quiz_id, quiz_type FROM lesson_quizzes WHERE lesson_id = ? ORDER BY quiz_type', [req.params.lessonId]);
        const quizzes = [];
        for (const quiz of quizRows) {
            const [questions] = await db.execute('SELECT question_id, question_text, question_type, correct_answer FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order', [quiz.quiz_id]);
            for (const q of questions) {
                if (q.question_type === 'choice') {
                    const [choices] = await db.execute('SELECT choice_text FROM question_choices WHERE question_id = ? ORDER BY choice_id', [q.question_id]);
                    q.choices = choices;
                } else {
                    q.choices = [];
                }
            }
            quizzes.push({ quiz_type: quiz.quiz_type, questions });
        }
        res.json(quizzes);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- User Level Update ---
app.post('/api/user/update-level', async (req, res) => {
    const { user_id, level } = req.body;
    try {
        await db.execute('UPDATE users SET level = ? WHERE user_id = ?', [level, user_id]);
        res.json({ success: true, level });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Survey ---
// The signup survey. Only active questions are served: the old damaged
// duplicates are still in the table but switched off. Each question carries a
// stable `key` so the client can recognise the experience question without
// depending on a row id.
app.get('/api/survey', async (req, res) => {
    try {
        const [questions] = await db.execute(
            `SELECT id, question_key, title, description, image
               FROM survey_questions WHERE is_active = 1 ORDER BY "order" ASC, id ASC`
        );
        const [options] = await db.execute(
            `SELECT o.id, o.question_id, o.option_key, o.option_text AS label,
                    o.option_description AS description, o."order", o.level_value AS level
               FROM survey_options o
               JOIN survey_questions q ON q.id = o.question_id AND q.is_active = 1
              ORDER BY o."order" ASC, o.id ASC`
        );
        res.json(questions.map(q => ({
            id: q.id,
            key: q.question_key,
            title: q.title,
            text: q.description,
            img: q.image,
            options: options.filter(o => o.question_id === q.id),
        })));
    } catch (err) {
        console.error('❌ Survey Error:', describeError(err));
        res.status(500).json({ error: 'โหลดแบบสำรวจไม่สำเร็จ' });
    }
});

// Stores what a new account answered. Nothing used to write here at all — the
// answers were collected on screen and dropped, so the table stayed empty and
// none of it could be used to tailor anything.
app.post('/api/survey/responses', async (req, res) => {
    const userId = Number(req.body?.userId);
    const answers = Array.isArray(req.body?.answers) ? req.body.answers : null;
    if (!userId || !answers) {
        return res.status(400).json({ error: 'userId and answers are required' });
    }

    try {
        let saved = 0;
        for (const a of answers) {
            const questionId = Number(a?.question_id);
            const selected = String(a?.selected_option ?? '').slice(0, 255);
            if (!questionId || !selected) continue;

            // Re-answering replaces the previous choice rather than stacking up
            // a row per attempt, so a player who goes back does not end up with
            // two conflicting answers to the same question.
            await db.execute(
                'DELETE FROM user_survey_responses WHERE user_id = ? AND question_id = ?',
                [userId, questionId]
            );
            await db.execute(
                `INSERT INTO user_survey_responses (user_id, question_id, selected_option, created_at)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, questionId, selected]
            );
            saved += 1;
        }
        res.json({ success: true, saved });
    } catch (err) {
        console.error('❌ /api/survey/responses error:', describeError(err));
        res.status(500).json({ error: 'บันทึกคำตอบไม่สำเร็จ' });
    }
});

// --- Advanced Validation (ข้อสอบวัดระดับ) ---
app.get('/api/advanced-validation', async (req, res) => {
    try {
        const [questions] = await db.execute('SELECT * FROM advanced_validation ORDER BY id');
        for (const q of questions) {
            const [choices] = await db.execute('SELECT choice_text FROM advanced_validation_choices WHERE question_id = ? ORDER BY id', [q.id]);
            q.choices = choices.map(c => c.choice_text);
        }
        res.json(questions);
    } catch (err) {
        console.error('❌ Assessment Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- Assessment Submit ---
app.post('/api/assessment/submit', async (req, res) => {
    const { user_id, selected_level, score, total_questions } = req.body;
    try {
        const isPassed = score >= Math.ceil(total_questions * 0.6);
        if (isPassed) {
            await db.execute('UPDATE users SET level = ? WHERE user_id = ?', [selected_level, user_id]);
            return res.json({ success: true, message: 'ผ่าน!', new_level: selected_level });
        } else {
            return res.json({ success: false, message: 'ไม่ผ่าน' });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 7.5 API: Day Progression & Game State
// ==========================================

/**
 * GET /simulation/state/:userId
 * ดึง state ครบชุดสำหรับ Desktop (เงิน, วัน, ค่าเช่า, events)
 * แก้ bug: ใช้ user_id ตรงๆ แทน userData.id ที่ client ส่งมาผิด
 */

/**
 * POST /simulation/next-day
 * จบวันปัจจุบัน — คำนวณรายรับ/รายจ่าย, เช็คค่าเช่า, เช็ค Game Over
 * Body: { userId }
 * Returns: { newDay, money, rentDue, rentPaid, gameOver, summary }
 */

/**
 * POST /simulation/new-game
 * สร้าง save ใหม่และ reset state ทั้งหมด (ใช้หลัง Game Over)
 * Body: { userId }
 */

// ==========================================
// 7.6 API: Competitive Arena (Mode 1)
// ==========================================

// Get all competitive challenges

// Post a new challenge

// Accept a challenge

// Update draft code state when typing

// Submit a solution

// Force summary immediately (only for test challenges)

// Get user mailbox messages

// Claim coins from mail attachment

// ==========================================
// 7.7 API: Arcade Battle Royale Mode
// ==========================================

const ARCADE_SHOP_ITEMS = [
    { id: 'inkFog', nameTH: 'หมอกดำบังจอ (Ink Fog)', nameEN: 'Ink Fog', price: 400, icon: '🌫️', descTH: 'ทำให้จอพิมพ์โค้ดของเป้าหมายเบลอเป็นเวลา 15 วินาที', descEN: 'Blurs target editor screen for 15s.', type: 'attack' },
    { id: 'backspaceLock', nameTH: 'ล็อกปุ่มลบ (Backspace Lock)', nameEN: 'Backspace Lock', price: 500, icon: '🔒', descTH: 'เป้าหมายไม่สามารถกดลบตัวอักษรได้ 10 วินาที', descEN: 'Disables target backspace key for 10s.', type: 'attack' },
    { id: 'keyScrambler', nameTH: 'สลับแป้นพิมพ์ (Key Scrambler)', nameEN: 'Key Scrambler', price: 450, icon: '⌨️', descTH: 'พิมพ์แล้วตัวอักษรจะสลับตำแหน่งมั่วๆ 10 วินาที', descEN: 'Scrambles typed keys for 10s.', type: 'attack' },
    { id: 'aiHelper', nameTH: 'AI บอกใบ้โค้ด (AI Helper)', nameEN: 'AI Helper', price: 600, icon: '🤖', descTH: 'ขอคำแนะนำและโครงสร้างโค้ดจากระบบ Gemini AI', descEN: 'Requests AI hint for the current task.', type: 'buff' },
    { id: 'screenShake', nameTH: 'แผ่นดินไหว (Earthquake)', nameEN: 'Earthquake', price: 300, icon: '🌋', descTH: 'เขย่าหน้าจอกล่องเขียนโค้ดของเป้าหมายอย่างรุนแรง 8 วินาที', descEN: 'Violently shakes target editor for 8s.', type: 'attack' },
    { id: 'typoGenerator', nameTH: 'Glitch ก่อกวน (Glitch Injector)', nameEN: 'Glitch Injector', price: 550, icon: '🐛', descTH: 'สุ่มพิมพ์ตัวอักษรแปลกปลอมแทรกในโค้ดเป้าหมาย 10 วินาที', descEN: 'Injects random typos into target editor.', type: 'attack' },
    { id: 'timeFreeze', nameTH: 'หยุดเวลาแช่แข็ง (Time Freeze)', nameEN: 'Time Freeze', price: 1200, icon: '❄️', descTH: 'หยุดศัตรูทั้งหมดไม่ให้แก้ไขโค้ดได้ชั่วคราว 5 วินาที', descEN: 'Freezes all active opponents for 5s.', type: 'aoe' },
    { id: 'blackout', nameTH: 'ระเบิดไฟดับ (EMP Strike)', nameEN: 'EMP Strike', price: 900, icon: '🔌', descTH: 'ปิดจอของเป้าหมายทุกคนให้มืดสนิทเป็นเวลา 8 วินาที', descEN: 'Turns off target screens completely for 8s.', type: 'aoe' },
    { id: 'shield', nameTH: 'กำแพงไฟร์วอลล์ (Firewall)', nameEN: 'Firewall Shield', price: 700, icon: '🛡️', descTH: 'ป้องกันความเสียหายจากดีบัฟครั้งถัดไป 100%', descEN: 'Blocks next incoming attack completely.', type: 'buff' },
    { id: 'cashSteal', nameTH: 'โจรกรรม Survival Cash (Data Heist)', nameEN: 'Data Heist', price: 600, icon: '🎭', descTH: 'ขโมยเงิน 🪙 300 จากเป้าหมายมาเป็นของตัวเอง', descEN: 'Steals 🪙 300 Cash from a target.', type: 'attack' },
    { id: 'capsLockLock', nameTH: 'กับดักอักษรใหญ่ (Caps Lock Trap)', nameEN: 'Caps Lock Trap', price: 350, icon: '🔠', descTH: 'บังคับให้พิมพ์เป็นตัวอักษรพิมพ์ใหญ่ทั้งหมด 10 วินาที (เกิด NameError)', descEN: 'Forces target to type in ALL CAPS.', type: 'attack' },
    { id: 'mirrorMode', nameTH: 'กระจกสลับฝั่ง (Mirror Mode)', nameEN: 'Mirror Mode', price: 500, icon: '🪞', descTH: 'สะท้อนหน้าจอเขียนโค้ดกลับด้านซ้าย-ขวาเป็นเวลา 12 วินาที', descEN: 'Horizontally flips target editor container.', type: 'attack' },
    { id: 'taxCollection', nameTH: 'เก็บภาษีคนรวย (Tax Collector)', nameEN: 'Tax Collector', price: 800, icon: '💸', descTH: 'ขโมยเงิน 20% จากผู้เล่นที่มี Survival Cash สูงสุดมาเป็นของคุณ', descEN: 'Steals 20% cash from wealthiest player.', type: 'buff' },
    { id: 'scoreMultiplier', nameTH: 'ตัวคูณคะแนน 2 เท่า (Score Booster)', nameEN: 'Score Booster', price: 650, icon: '⚡', descTH: 'คูณคะแนนที่จะได้รับในรอบปัจจุบันเป็น 2 เท่าเมื่อทำโจทย์สำเร็จ', descEN: 'Doubles current round score gain.', type: 'buff' },
    { id: 'screenDimmer', nameTH: 'แสงจ้าหน้าจอมืด (Screen Dimmer)', nameEN: 'Screen Dimmer', price: 400, icon: '🕶️', descTH: 'หรี่แสงหน้าจอกล่องพิมพ์โค้ดของเป้าหมายให้มืดลงเหลือ 10% นาน 15 วินาที', descEN: 'Dims target editor brightness to 10%.', type: 'attack' }
];

const ARCADE_TASKS = {
    ROUND_1: {
        round: 1,
        title: "ง่าย: เลขฟีโบนัชชี (Fibonacci)",
        desc: "เขียนฟังก์ชัน `fib(n)` เพื่อคืนค่าตัวเลขฟีโบนัชชีลำดับที่ n (รอบแรกวัดฝีมือเพียวๆ ไม่อนุญาตให้ใช้ไอเทม)",
        initialCode: "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)"
    },
    ROUND_2: {
        round: 2,
        title: "กลาง: ตรวจสอบแอนนาแกรม (Anagram)",
        desc: "เขียนฟังก์ชัน `is_anagram(s, t)` เพื่อตรวจสอบว่าข้อความสองชุดสลับตัวอักษรกันหรือไม่",
        initialCode: "def is_anagram(s, t):\n    return sorted(s) == sorted(t)"
    },
    ROUND_3: {
        round: 3,
        title: "ยาก: ผลรวมสองจำนวน (Two Sum)",
        desc: "กำหนดอาร์เรย์ตัวเลขและเป้าหมาย คืนค่าตำแหน่งของตัวเลข 2 ตัวที่บวกกันได้เท่ากับเป้าหมาย",
        initialCode: "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i"
    }
};


// ==========================================================================
// Shop — charged against users.virtual_currency (the coins earned from every
// mode), taken from Person 1's branch. The version that used to live here spent
// sim_money out of simulation_saves, which went away with the simulation.
// ==========================================================================

// Every shop route answers on BOTH /api/shop/... and the bare /shop/... it was
// originally written as.
//
// /api is the real address, and the only one a deployed browser can rely on:
// the dev server proxies exactly /api and /uploads through to this process, and
// in production this process serves the front end and treats everything outside
// those two prefixes as a page route. A bare /shop/items therefore came back as
// index.html, and the shop page died on 'Unexpected token <' - HTML where JSON
// was expected - which is what a learner saw instead of the store.
//
// The bare paths stay so that anything still calling them (a bookmark, a script,
// a page not yet updated) keeps working rather than failing the same silent way.
const shopPath = (suffix) => [`/api/shop${suffix}`, `/shop${suffix}`];

app.get(shopPath('/items'), async (req, res) => {
    const { type } = req.query;
    let sql = `
        SELECT item_id, name, description, item_type AS type, price, asset_url, preview_image,
               effects AS preview_data, is_active AS is_available, rarity, set_key
        FROM shop_items
        WHERE is_active = 1
    `;
    let params = [];
    if (type) {
        sql += ' AND item_type = ?';
        params.push(type);
    }
    sql += ' ORDER BY item_type, price ASC';
    try {
        const [items] = await db.execute(sql, params);
        items.forEach(i => {
            if (typeof i.preview_data === 'string') i.preview_data = JSON.parse(i.preview_data);
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch shop items' });
    }
});

app.get(shopPath('/inventory/:userId'), async (req, res) => {
    const { userId } = req.params;
    try {
        const [items] = await db.execute(`
            SELECT si.item_id, si.name, si.description, si.item_type AS type, si.price, si.asset_url, si.preview_image,
                   si.effects AS preview_data, si.is_active AS is_available, ui.purchased_at
            FROM user_inventory ui
            JOIN shop_items si ON ui.item_id = si.item_id
            WHERE ui.user_id = ?
            ORDER BY ui.purchased_at DESC
        `, [userId]);
        items.forEach(i => {
            if (typeof i.preview_data === 'string') i.preview_data = JSON.parse(i.preview_data);
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// Cosmetic sets: a theme, a profile frame and a cursor effect that belong
// together. shop_sets.price is the bundle price for the whole set; buying the
// three separately costs the sum of shop_items.price, which is deliberately more.
app.get(shopPath('/sets'), async (req, res) => {
    const { userId } = req.query;
    try {
        const [sets] = await db.execute(
            `SELECT set_key, name_th, name_en, description_th, price
               FROM shop_sets WHERE is_active = 1 ORDER BY set_key`
        );
        const [items] = await db.execute(
            `SELECT item_id, set_key, name, description, item_type AS type, price,
                    asset_url, preview_image, effects AS preview_data
               FROM shop_items
              WHERE is_active = 1 AND set_key IS NOT NULL
              ORDER BY set_key, price DESC`
        );

        // Which pieces this player already has, so the client can show what a set
        // would still cost them rather than only the sticker price.
        let owned = new Set();
        if (userId && Number(userId)) {
            const [rows] = await db.execute('SELECT item_id FROM user_inventory WHERE user_id = ?', [Number(userId)]);
            owned = new Set(rows.map(r => Number(r.item_id)));
        }

        const payload = sets.map((set) => {
            const setItems = items
                .filter(i => i.set_key === set.set_key)
                .map((i) => {
                    if (typeof i.preview_data === 'string') {
                        try { i.preview_data = JSON.parse(i.preview_data); } catch { i.preview_data = null; }
                    }
                    return { ...i, owned: owned.has(Number(i.item_id)) };
                });
            const individualTotal = setItems.reduce((sum, i) => sum + Number(i.price || 0), 0);
            const setPrice = Number(set.price || 0);
            const remaining = setItems.filter(i => !i.owned);
            const remainingTotal = remaining.reduce((sum, i) => sum + Number(i.price || 0), 0);
            return {
                ...set,
                price: setPrice,
                items: setItems,
                individual_total: individualTotal,
                savings: Math.max(0, individualTotal - setPrice),
                owned_count: setItems.length - remaining.length,
                // What this player would pay right now: the bundle discount applied
                // to just the pieces they are missing.
                price_for_user: individualTotal > 0
                    ? Math.ceil(setPrice * (remainingTotal / individualTotal))
                    : 0,
                fully_owned: remaining.length === 0,
            };
        });
        res.json(payload);
    } catch (err) {
        console.error('❌ /shop/sets error:', describeError(err));
        res.status(500).json({ error: 'Failed to fetch shop sets' });
    }
});

// Buys every piece of a set the player does not already own, at the bundle rate.
// Owning part of a set does not forfeit the discount and is never charged twice:
// the price is the bundle price scaled to the share of the set still missing.
app.post(shopPath('/buy-set'), async (req, res) => {
    const { userId, setKey } = req.body || {};
    if (!userId || !setKey) {
        return res.status(400).json({ error: 'userId and setKey are required' });
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [users] = await connection.execute(
            'SELECT user_id, virtual_currency FROM users WHERE user_id = ? LIMIT 1 FOR UPDATE',
            [userId]
        );
        if (users.length === 0) {
            await connection.rollback();
            return res.status(401).json({ error: 'กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้ง' });
        }

        const [sets] = await connection.execute(
            'SELECT set_key, name_th, price FROM shop_sets WHERE set_key = ? AND is_active = 1 LIMIT 1',
            [setKey]
        );
        if (sets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'ไม่พบเซ็ตนี้ในร้านค้า' });
        }
        const set = sets[0];

        const [setItems] = await connection.execute(
            'SELECT item_id, name, price FROM shop_items WHERE set_key = ? AND is_active = 1',
            [setKey]
        );
        if (setItems.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'เซ็ตนี้ยังไม่มีของอยู่ข้างใน' });
        }

        const [ownedRows] = await connection.execute(
            'SELECT item_id FROM user_inventory WHERE user_id = ?', [userId]
        );
        const owned = new Set(ownedRows.map(r => Number(r.item_id)));
        const missing = setItems.filter(i => !owned.has(Number(i.item_id)));
        if (missing.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'คุณมีของในเซ็ตนี้ครบแล้ว' });
        }

        const individualTotal = setItems.reduce((sum, i) => sum + Number(i.price || 0), 0);
        const missingTotal = missing.reduce((sum, i) => sum + Number(i.price || 0), 0);
        const price = individualTotal > 0
            ? Math.ceil(Number(set.price) * (missingTotal / individualTotal))
            : 0;

        const balance = Number(users[0].virtual_currency || 0);
        if (balance < price) {
            await connection.rollback();
            return res.status(400).json({ error: 'เงินไม่พอ', price, balance });
        }

        const nextBalance = balance - price;
        await connection.execute(
            'UPDATE users SET virtual_currency = ? WHERE user_id = ?', [nextBalance, userId]
        );
        for (const item of missing) {
            await connection.execute(
                'INSERT INTO user_inventory (user_id, item_id) VALUES (?, ?)', [userId, item.item_id]
            );
        }

        await connection.commit();
        const newAchievements = await evaluateAchievements(userId);
        return res.json({
            success: true,
            new_achievements: newAchievements,
            message: `ซื้อ ${set.name_th} สำเร็จ! ได้ของ ${missing.length} ชิ้น`,
            set_key: setKey,
            purchased: missing.map(i => ({ item_id: i.item_id, name: i.name })),
            paid: price,
            saved: Math.max(0, missingTotal - price),
            virtual_currency: nextBalance,
        });
    } catch (err) {
        await connection.rollback();
        console.error('❌ /shop/buy-set error:', describeError(err));
        return res.status(500).json({ error: 'Failed to purchase set' });
    } finally {
        connection.release();
    }
});

app.post(shopPath('/buy'), async (req, res) => {
    const { userId, itemId } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ตรวจสอบว่ามีสินค้านี้อยู่
        const [users] = await connection.execute(
            'SELECT user_id, virtual_currency FROM users WHERE user_id = ? LIMIT 1 FOR UPDATE',
            [userId]
        );
        if (users.length === 0) {
            await connection.rollback();
            return res.status(401).json({ error: 'กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้ง' });
        }

        const [items] = await connection.execute(`
            SELECT item_id, name, description, item_type AS type, price, asset_url, preview_image,
                   effects AS preview_data, is_active AS is_available
            FROM shop_items
            WHERE item_id = ? AND is_active = 1
        `, [itemId]);
        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Item not found' });
        }
        const item = items[0];

        // ตรวจสอบว่าซื้อไปแล้วหรือยัง
        const [owned] = await connection.execute('SELECT * FROM user_inventory WHERE user_id = ? AND item_id = ?', [userId, itemId]);
        if (owned.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'คุณมีไอเทมนี้อยู่แล้ว' });
        }

        // ตรวจสอบเงินใน simulation
        const price = Number(item.price);
        let nextVirtualCurrency = Number(users[0].virtual_currency || 0);
        if (price > 0) {
        const [saves] = await connection.execute('SELECT virtual_currency AS sim_money FROM users WHERE user_id = ? LIMIT 1', [userId]);
        if (saves.length === 0 || Number(saves[0].sim_money) < price) {
            await connection.rollback();
            return res.status(400).json({ error: 'เงินไม่พอ' });
        }

        // หักเงินจาก simulation
        nextVirtualCurrency = Number(saves[0].sim_money) - price;
        await connection.execute(
            'UPDATE users SET virtual_currency = ? WHERE user_id = ?',
            [nextVirtualCurrency, userId]
        );
        // Person 1's version also wrote an EXPENSE row to financial_ledger here.
        // That table belonged to the simulation and has been dropped, so the
        // purchase is no longer double-booked anywhere.
        }

        // เพิ่มเข้า inventory
        await connection.execute('INSERT INTO user_inventory (user_id, item_id) VALUES (?, ?)', [userId, itemId]);

        await connection.commit();
        const newAchievements = await evaluateAchievements(userId);
        return res.json({
            success: true,
            new_achievements: newAchievements,
            message: `ซื้อ ${item.name} สำเร็จ!`,
            virtual_currency: nextVirtualCurrency,
        });
    } catch (err) {
        await connection.rollback();
        console.error('Shop buy error:', err);
        res.status(500).json({ error: 'Failed to purchase item' });
    } finally {
        connection.release();
    }
});

app.post(shopPath('/equip'), async (req, res) => {
    const { userId, itemId, type } = req.body;
    const columnMap = {
        'THEME': 'equipped_theme_id',
        'MOUSE_EFFECT': 'equipped_mouse_effect_id',
        'PROFILE_FRAME': 'equipped_profile_frame_id',
        'PROFILE_BACKGROUND': 'equipped_profile_frame_id'
    };
    const column = columnMap[type];
    if (!column) return res.status(400).json({ error: 'Invalid type' });

    try {
        // ตรวจสอบว่าเป็นเจ้าของ
        if (itemId) {
            const [owned] = await db.execute(`
                SELECT si.item_id
                FROM user_inventory ui
                JOIN shop_items si ON si.item_id = ui.item_id
                WHERE ui.user_id = ? AND ui.item_id = ? AND si.item_type = ? AND si.is_active = 1
            `, [userId, itemId, type]);
            if (owned.length === 0) return res.status(400).json({ error: 'คุณไม่มีไอเทมนี้' });
        }

        const [result] = await db.execute(`UPDATE users SET ${column} = ? WHERE user_id = ?`, [itemId || null, userId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to equip item' });
    }
});

app.get('/api/arcade/items', async (req, res) => {
    try {
        const [dbItems] = await db.query(`SELECT item_id, item_code as id, name_th as nameTH, name_en as nameEN, desc_th as descTH, desc_en as descEN, price, icon, type FROM arcade_items ORDER BY item_id ASC`);
        res.json({ success: true, items: dbItems && dbItems.length > 0 ? dbItems : ARCADE_SHOP_ITEMS });
    } catch (err) {
        console.error('❌ GET /api/arcade/items error:', err.message);
        res.json({ success: true, items: ARCADE_SHOP_ITEMS });
    }
});

app.get('/api/arcade/tasks', async (req, res) => {
    try {
        const [easyTasks] = await db.query(`SELECT * FROM arcade_tasks WHERE difficulty = 'easy' ORDER BY task_id ASC`);
        const [mediumTasks] = await db.query(`SELECT * FROM arcade_tasks WHERE difficulty = 'medium' ORDER BY task_id ASC`);
        const [hardTasks] = await db.query(`SELECT * FROM arcade_tasks WHERE difficulty = 'hard' ORDER BY task_id ASC`);

        res.json({
            success: true,
            easy: easyTasks || [],
            medium: mediumTasks || [],
            hard: hardTasks || [],
            all_tasks: {
                easy_count: (easyTasks || []).length,
                medium_count: (mediumTasks || []).length,
                hard_count: (hardTasks || []).length
            }
        });
    } catch (err) {
        console.error('❌ GET /api/arcade/tasks error:', err.message);
        res.status(500).json({ error: err.message, fallback: ARCADE_TASKS });
    }
});

app.post('/api/arcade/evaluate', (req, res) => {
    const { round, code, scoreMultiplierActive } = req.body;
    let baseScore = 500;
    if (scoreMultiplierActive) baseScore *= 2;
    const baseCash = 400;

    res.json({
        success: true,
        scoreEarned: baseScore,
        cashEarned: baseCash,
        message: `ประมวลผลโค้ดรอบที่ ${round} สำเร็จ!`
    });
});

// --- ARCADE ROOM MANAGEMENT ENDPOINTS ---

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ARC-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Strips control characters and clamps length so player-entered room/user
// names can't break the room browser UI or bloat the DB. React already
// escapes rendered text so this isn't an XSS fix — it's the input-validation
// pass CLAUDE.md requires at every point that accepts player input.
function sanitizeName(raw, maxLen) {
    return String(raw || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLen);
}

// Clamps a requested max_players to arcadeConfig.maxPlayers' [min, max] bound
// (shared with the client's "Max Players (2-5)" room-creation label) — used
// by both room creation and the settings-update endpoint.
function clampArcadeMaxPlayers(raw, fallback) {
    const { min, max } = arcadeConfig.maxPlayers;
    const parsed = parseInt(raw);
    return Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : fallback));
}

// Deterministic backup scorer for code quality, used when the AI judge is
// unavailable (no API key, timeout, request error) so judging a round never
// blocks on AI. Rewards short lines and some comments/docstring, penalizes
// very long lines. Score 0-100.
function heuristicCodeQualityScore(code) {
    const lines = String(code || '').split('\n');
    const codeLines = lines.filter(l => l.trim().length > 0);
    if (codeLines.length === 0) return 0;

    const avgLen = codeLines.reduce((sum, l) => sum + l.length, 0) / codeLines.length;
    const longLineRatio = codeLines.filter(l => l.length > 79).length / codeLines.length;
    const hasComment = /#|"""|'''/.test(code);

    let score = 70;
    score -= Math.max(0, avgLen - 40) * 0.5;
    score -= longLineRatio * 30;
    score += hasComment ? 10 : 0;

    return Math.max(0, Math.min(100, Math.round(score)));
}

// NVIDIA-hosted judge for Arcade round code quality (beauty/readability AND
// efficiency combined into one score), kept entirely separate from
// callAiChat()/NVIDIA_API_KEY above (the Lumi chatbot and the AI task
// generator) — this uses its own dedicated API key and
// model since it deliberately judges a different thing (competitive code
// quality, not general chat). Always resolves (never throws) so a round can
// never get stuck waiting on this — falls back to the heuristic scorer above
// on any missing key, timeout, or API error. Runs non-streaming with
// extended thinking off: this sits in a live match's round-finalize path, so
// a fast, deterministic JSON answer matters more than the reasoning trace a
// streaming/thinking response would add.
//
// The key and the model name both come from .env. The model name used to be
// hard-coded here, which meant this could not be pointed elsewhere or turned
// off without editing code - and CLAUDE.md already required model names to live
// in .env for exactly this reason. Leaving either value empty disables the AI
// path entirely: both callers fall back to scoring in-process, and no player's
// code leaves the machine.
//
// TWO callers share this client and this budget: judgeCodeQuality() below
// (Arcade round code) and reviewCompetitiveSubmissionWithAI() further up
// (Competitive Arena submissions). Both are code judging, both run inside a
// live match, and both are deliberately kept off the chatbot's key and model -
// see the AI Models table in CLAUDE.md.
const NVIDIA_CODE_JUDGE_MODEL = String(process.env.NVIDIA_CODE_JUDGE_MODEL || '').trim();
const NVIDIA_CODE_JUDGE_KEY = String(process.env.NVIDIA_CODE_JUDGE_API_KEY || '').trim();

const nvidiaCodeJudgeClient = (NVIDIA_CODE_JUDGE_KEY && NVIDIA_CODE_JUDGE_MODEL)
    ? new OpenAI({ apiKey: NVIDIA_CODE_JUDGE_KEY, baseURL: 'https://integrate.api.nvidia.com/v1', maxRetries: 0 })
    : null;

if (!nvidiaCodeJudgeClient) {
    console.warn('ℹ️  ตัวตรวจโค้ดด้วย AI ปิดอยู่ (NVIDIA_CODE_JUDGE_API_KEY/MODEL ว่าง) - Arcade และโหมดแข่งจะให้คะแนนในเครื่องแทน');
} else {
    console.log(`✅ ตัวตรวจโค้ดด้วย AI: ${NVIDIA_CODE_JUDGE_MODEL}`);
}

// Same call shape as callAiChat() so a caller moves between the chatbot model
// and the judge model by changing one word. Throws when unconfigured or on any
// API error - every caller already has a non-AI fallback and must use it rather
// than failing the request, because both sit in a live match's critical path.
const callCodeJudgeChat = async ({ messages, systemInstruction = '', temperature = 0.3, maxTokens = 1200, thinking = false, timeoutMs = 8000 }) => {
    if (!nvidiaCodeJudgeClient) {
        throw new Error('NVIDIA_CODE_JUDGE_API_KEY/MODEL is not set, so no code-judging model is configured');
    }

    const apiMessages = [];
    if (systemInstruction) apiMessages.push({ role: 'system', content: systemInstruction });
    for (const message of (Array.isArray(messages) ? messages : [])) {
        apiMessages.push({ role: message?.role || 'user', content: String(message?.content ?? '') });
    }

    let completion;
    try {
        completion = await nvidiaCodeJudgeClient.chat.completions.create({
            model: NVIDIA_CODE_JUDGE_MODEL,
            messages: apiMessages,
            temperature,
            top_p: 0.95,
            max_tokens: maxTokens,
            // Reasoning off and streaming off on purpose: this runs while a round
            // is finalising, so a fast deterministic JSON answer beats a
            // reasoning trace nobody reads.
            chat_template_kwargs: { enable_thinking: Boolean(thinking) },
            stream: false,
        }, { timeout: timeoutMs });
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const detail = error?.response?.data?.detail || error?.message || 'unknown error';
        throw new Error(`Code-judge model "${NVIDIA_CODE_JUDGE_MODEL}" failed${status ? ` (HTTP ${status})` : ''}: ${detail}`);
    }

    // Reasoning models split their answer: `content` holds the reply,
    // `reasoning_content` the scratch work. Only the reply is returned - the
    // scratch work would break JSON parsing outright.
    return String(completion?.choices?.[0]?.message?.content || '').trim();
};

async function judgeCodeQuality(code) {
    if (!nvidiaCodeJudgeClient) {
        return { score: heuristicCodeQualityScore(code), source: 'fallback' };
    }
    try {
        const text = await callCodeJudgeChat({
            systemInstruction: 'You are a strict but fair code reviewer grading Python code for a coding competition. Judge BOTH readability/beauty (naming, structure, consistency, comments) AND efficiency (algorithmic complexity, unnecessary work) combined into one score — never judge correctness. If the code is empty, only a stub (e.g. just "pass"), or otherwise has nothing substantive to evaluate, score it low (0-10). Respond with ONLY a JSON object, no markdown: {"score": <integer 0-100>, "reason": "<one short sentence in Thai>"}',
            messages: [{ role: 'user', content: code || '' }],
            temperature: 0.3,
            maxTokens: 300,
            timeoutMs: 8000,
        });
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
        if (Number.isNaN(score)) throw new Error('Invalid score from NVIDIA judge response');
        return { score, reason: parsed.reason, source: 'ai' };
    } catch (err) {
        console.error('⚠️ NVIDIA code-quality judge failed, using fallback:', err.message);
        return { score: heuristicCodeQualityScore(code), source: 'fallback' };
    }
}

// Server-authoritative match clock — mirrors client/src/pages/Arcade/ArcadeBattleRoyale.jsx's
// PHASES/ROUND_TIMES/RANK_CASH_REWARDS exactly (keep both in sync by hand when
// either changes). tickArcadeMatches() below is the ONLY thing that advances a
// room's phase now — every connected browser just polls GET /rooms/:id and
// mirrors whatever phase/phase_deadline it finds, so the match keeps moving
// even if the host who started it disconnects mid-round.
const ARCADE_PHASE_SEQUENCE = [
    'ROUND_1', 'SUMMARY_1', 'SHOP_1',
    'ROUND_2', 'SUMMARY_2', 'SHOP_2',
    'ROUND_3', 'SUMMARY_3', 'SHOP_3',
    'ROUND_4'
];
const ARCADE_PHASE_DURATIONS = arcadeConfig.phaseDurations;
const ARCADE_QUICK_PHASE_DURATIONS = arcadeConfig.quickModePhaseDurations;

// Phase 8.4 — a room's phase lengths come from its own `round_duration_mode`,
// not from a module-level constant. Every timing decision (start, and each
// finalize step) goes through this, so a Quick Mode room and a standard room
// can run side by side with the right pacing each. Falls back to standard for
// any unrecognised/legacy value, including rooms created before the column
// existed.
function arcadePhaseDurations(room) {
    return room?.round_duration_mode === 'quick' ? ARCADE_QUICK_PHASE_DURATIONS : ARCADE_PHASE_DURATIONS;
}
// How many of the lowest cumulative scorers get cut after each round finishes
// (Round 1 is a free look — nobody's cut until Round 2, matching the client's
// existing 5→5→3→2→1 pattern).
const ARCADE_ELIMINATE_COUNT = { 1: 0, 2: 2, 3: 1, 4: 1 };
const ARCADE_RANK_CASH_REWARDS = [500, 400, 300, 200, 100];
// Real test-case counts per round's fixed task (client's TASK_TEST_CASES) —
// only used to scale a bot's synthetic round score onto the same range a
// human's real passCount could reach. Round 4 pulls its count live from
// arcade_tasks (DB hard pool) since that task isn't fixed.
const ARCADE_ROUND_CASE_COUNTS = arcadeConfig.roundCaseCounts;

// A bot has no real code to judge, so its round score is synthesized on the
// same equal-weight scale used for real players (see submitMyRound()
// client-side): testScore + qualityScore + timeScore, each 0-100, summed to
// a 0-300 round score — ported here so it's computed once, authoritatively,
// instead of separately (and inconsistently) per browser.
//
// Two things about this must stay in lockstep with the client's own formula:
//
//   1. timeScore is EARNED BY CORRECTNESS - it is scaled by the fraction of
//      test cases passed. Awarding it flat meant finishing instantly with
//      nothing written scored close to 100 on time, while fighting to a real
//      3-of-5 finish scored ~17: the rules paid better for giving up than for
//      trying. Beginners felt that hardest, being the players most likely to
//      have nothing to submit.
//   2. How strong a bot is now follows the room's own difficulty. One fixed
//      band for every room meant picking an easy room got you easier problems
//      against exactly the same opposition, so it was not actually easier to
//      survive. arcadeConfig's `medium` band reproduces the old fixed numbers
//      exactly, so any change in behaviour is attributable to the room.
function synthesizeBotRoundScore(totalCount, roundDuration, difficulty) {
    const skill = arcadeConfig.botSkillByDifficulty[difficulty]
        || arcadeConfig.botSkillByDifficulty.default;
    const band = Math.min(1, Math.max(0, skill.passMin + Math.random() * skill.passSpread));
    const passCount = totalCount === 0 ? 0 : Math.min(totalCount, Math.max(0, Math.round(totalCount * band)));
    const passRatio = totalCount === 0 ? 0 : passCount / totalCount;
    const testScore = passRatio * 100;
    const qualityScore = skill.qualityMin + Math.floor(Math.random() * skill.qualitySpread);
    const timeUsed = Math.floor(Math.random() * roundDuration);
    const timeScore = passRatio * ((roundDuration - timeUsed) / roundDuration) * 100;
    return Math.round(testScore + qualityScore + timeScore);
}

// Every match now draws its own problems instead of always serving the same
// three built-in tasks in the same order. Drawn ONCE here, when the host starts
// the match, and written to arcade_rooms.round_task_ids so the server (scaling
// bot scores by the round's test-case count) and every client (grading the
// player, showing the title and the starting code) all read one identical
// line-up. Letting each side roll its own would silently score bots against a
// problem nobody was asked to solve.
//
// Rounds 1-3 come from the room's chosen difficulty, or from easy+medium when
// it is 'default'. Round 4's pool follows arcadeConfig.finalePoolByDifficulty
// rather than always being `hard`: an easy room whose decider nobody could
// finish scored everyone equally at zero and so decided nothing.
// Sampling is without replacement, so a match never repeats a problem.
//
// The draw is also filtered against the room's own clock. Every task carries
// work_chars - how much of the answer a player still has to type once
// starter_code is on screen - and a problem that cannot be typed inside the
// round is not a challenge, it is a guaranteed zero for everyone. A Quick Mode
// room therefore draws from a genuinely smaller pool than a standard one,
// which is the intent rather than a side effect.
async function drawArcadeRoundTasks(room) {
    const pickFrom = room.difficulty && room.difficulty !== 'default'
        ? [room.difficulty]
        : ['easy', 'medium'];
    const finaleDifficulty = arcadeConfig.finalePoolByDifficulty[room.difficulty || 'default']
        || arcadeConfig.finalePoolByDifficulty.default;

    const [pool] = await db.query(
        `SELECT task_id, work_chars FROM arcade_tasks WHERE difficulty IN (${pickFrom.map(() => '?').join(',')})`,
        pickFrom
    );
    const [finalePool] = await db.query(
        `SELECT task_id, work_chars FROM arcade_tasks WHERE difficulty = ?`,
        [finaleDifficulty]
    );

    // Every round in a mode is the same length, so one budget covers the draw.
    // autoSubmitLeadSeconds comes off the top because the client submits for
    // the player that far before the deadline - those seconds were never
    // typing time.
    const roundSeconds = arcadePhaseDurations(room).ROUND_1;
    const budget = Math.max(0, roundSeconds - arcadeConfig.autoSubmitLeadSeconds)
        * arcadeConfig.beginnerCharsPerMinute / 60;

    const shuffle = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    // Prefer problems that fit the clock, but never fail the draw over it. If
    // too few fit - a very short mode, or rows seeded before work_chars existed
    // and still NULL - fall back to the shortest available. Returning null here
    // would silently drop the match back onto the three fixed built-in tasks.
    const fitted = (rows, needed) => {
        const list = (rows || []).map(r => ({ id: r.task_id, work: r.work_chars ?? Infinity }));
        const inBudget = shuffle(list.filter(r => r.work <= budget)).map(r => r.id);
        if (inBudget.length >= needed) return inBudget;
        const rest = list.filter(r => r.work > budget)
            .sort((a, b) => a.work - b.work)
            .map(r => r.id);
        return [...inBudget, ...rest];
    };

    const early = fitted(pool, 3).slice(0, 3);
    // Round 4 must not repeat anything Rounds 1-3 already used, which is
    // possible whenever the finale pool is the same one Rounds 1-3 drew from.
    const finale = fitted(finalePool, 1).filter(id => !early.includes(id))[0];

    if (early.length < 3 || finale === undefined) return null;
    return [...early, finale];
}

// Phase 8.3 — fold one finished match into every real player's career totals.
// Called exactly once per match, at the moment finalizeArcadePhase() moves the
// room to RESULT, so it can't double-count: RESULT is terminal (the phase
// sequence never leaves it, and tickArcadeMatches skips rooms already in it).
// Bots are excluded — they have no career to track. Final standings are read
// from the participants' cumulative `score`, which is the same number the
// RESULT screen ranks on, so "wins" here always agrees with the winner the
// players actually saw. Never allowed to throw: a stats-bookkeeping problem
// must not stop a match from ending.
async function recordArcadePlayerStats(roomId) {
    try {
        // Step 5 — mark this match's history rows as belonging to a FINISHED
        // match. The history list only shows completed matches, so an
        // abandoned room's half-played rounds don't clutter a player's
        // review screen. Done here because this runs exactly once per match,
        // at the moment the room reaches RESULT.
        await db.query(
            `UPDATE arcade_round_history SET match_ended_at = CURRENT_TIMESTAMP WHERE room_id = ? AND match_ended_at IS NULL`,
            [roomId]
        );
        const [participants] = await db.query(
            `SELECT user_name, score, cash FROM arcade_participants WHERE room_id = ?`,
            [roomId]
        );
        const humans = (participants || []).filter(p => !p.user_name.startsWith('Bot_'));
        if (humans.length === 0) return;

        // Rank across everyone in the room (bots included) — placing 2nd in a
        // 5-player room is a 2nd place regardless of how many were bots.
        const standings = [...(participants || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

        for (const player of humans) {
            const rank = standings.findIndex(p => p.user_name === player.user_name) + 1;
            if (rank < 1) continue;
            await db.query(
                `INSERT INTO arcade_player_stats
                    (user_name, matches_played, wins, best_rank, total_score, total_cash_earned, updated_at)
                 VALUES (?, 1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT (user_name) DO UPDATE SET
                    matches_played = arcade_player_stats.matches_played + 1,
                    wins = arcade_player_stats.wins + EXCLUDED.wins,
                    best_rank = LEAST(COALESCE(arcade_player_stats.best_rank, EXCLUDED.best_rank), EXCLUDED.best_rank),
                    total_score = arcade_player_stats.total_score + EXCLUDED.total_score,
                    total_cash_earned = arcade_player_stats.total_cash_earned + EXCLUDED.total_cash_earned,
                    updated_at = CURRENT_TIMESTAMP`,
                [player.user_name, rank === 1 ? 1 : 0, rank, player.score || 0, player.cash || 0]
            );

            await awardArcadeMatchCoins(roomId, player.user_name, rank);

            // Playing and winning are both achievement metrics, and this is the
            // one moment per match where either can change.
            const [accounts] = await db.query(
                'SELECT user_id FROM users WHERE username = ? LIMIT 1', [player.user_name]
            );
            if (accounts?.length) {
                await evaluateAchievements(accounts[0].user_id, player.user_name);
            }
        }
    } catch (err) {
        console.error('⚠️ arcade_player_stats update failed (match still ended normally):', err.message);
    }
}

// Pays a finished match out into users.virtual_currency — the single wallet the
// lessons pay into and the shop spends from, so gold earned here buys the same
// cosmetics. Goes through applyXpRewardToUser for exactly that reason: one code
// path owns the wallet, whichever mode credits it.
//
// Survival Cash inside a match is a separate, per-match thing and is not carried
// over; this is paid on final rank only.
//
// Never allowed to throw. A wallet problem for one player must not stop the other
// players being paid, and must not stop the match ending.
async function awardArcadeMatchCoins(roomId, userName, rank) {
    try {
        const byRank = arcadeConfig.coinRewardByRank || {};
        const coins = Number(byRank[String(rank)] ?? arcadeConfig.coinRewardParticipation ?? 0);
        if (!Number.isFinite(coins) || coins <= 0) return;

        // Arcade identifies players by name; only a name that belongs to a real
        // account has a wallet to pay into (guests and test rigs simply do not).
        const [users] = await db.query('SELECT user_id FROM users WHERE username = ? LIMIT 1', [userName]);
        if (!users || users.length === 0) return;

        await applyXpRewardToUser(db, users[0].user_id, 0, coins);
        // Recorded on the participant so the RESULT screen can state what was
        // actually credited. Written after the wallet update, so a payout that
        // failed never shows up as if it had happened.
        await db.query(
            'UPDATE arcade_participants SET coins_awarded = ? WHERE room_id = ? AND user_name = ?',
            [coins, roomId, userName]
        );
        console.log(`🪙 arcade: paid ${coins} coins to ${userName} (rank ${rank})`);
    } catch (err) {
        console.error(`⚠️ arcade coin payout failed for ${userName} (match still ended normally):`, err.message);
    }
}

// Finalizes whichever phase just expired for one room: ROUND_N scores/pays/
// eliminates and moves to SUMMARY_N (or straight to RESULT after Round 4,
// matching the client's existing behavior of skipping a summary screen post-
// finale); SUMMARY_N opens the shop; SHOP_N starts the next round. Called
// only from tickArcadeMatches() below, never from a client request, so there
// is exactly one place in the whole system that decides a room's phase.
// Grade everything a round's human players submitted, at the moment the round
// closes.
//
// This is the whole point of ADR 0001: the browser sends code, and every number
// that decides a match is worked out here. Correctness comes from running the
// code against the round's real test cases through the one grader; quality from
// the code-quality judge; and time from the server's own clock, by comparing
// when the submission arrived against when the round started.
//
// The three legs are scored 0-100 each and summed, exactly as the browser used
// to compute them, so scores stay on the same scale as synthesizeBotRoundScore()
// and as every match already played.
async function gradeArcadeRoundSubmissions({ room, roundNum, participants, roundDuration }) {
    const graded = new Map();
    const humans = (participants || []).filter(
        (p) => !p.user_name.startsWith('Bot_') && p.has_submitted && typeof p.submitted_code === 'string'
    );
    if (humans.length === 0) return graded;

    const drawn = Array.isArray(room.round_task_ids) ? room.round_task_ids : null;
    const taskId = drawn ? drawn[roundNum - 1] : undefined;
    let problem = null;
    if (taskId !== undefined) {
        const [rows] = await db.query(
            `SELECT p.test_kind, p.test_cases, p.solution_code, p.starter_code
               FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
              WHERE m.mode = 'arcade' AND m.entry_id = ?`,
            [taskId]
        );
        problem = rows?.[0] || null;
    }

    // The round's timer is the source of truth for when it started: the server
    // set phase_deadline itself when the round opened.
    const deadlineMs = room.phase_deadline ? new Date(room.phase_deadline).getTime() : null;
    const startedMs = deadlineMs ? deadlineMs - roundDuration * 1000 : null;

    // In parallel: four players each cost one Python run and one judge call,
    // and the tick loop is serial, so doing these one after another would hold
    // the whole match up.
    await Promise.all(humans.map(async (p) => {
        const code = p.submitted_code || '';
        let passCount = 0;
        let totalCount = 0;

        if (problem) {
            try {
                const verdict = await gradeSubmission({ problem, code });
                passCount = verdict.passed;
                totalCount = verdict.total;
            } catch (err) {
                console.error(`⚠️ Arcade grading failed for ${p.user_name}:`, describeError(err));
            }
        }

        let quality = 0;
        try {
            const judged = await judgeCodeQuality(code.slice(0, 4000));
            quality = Number(judged?.score || 0);
        } catch (err) {
            console.error(`⚠️ Arcade quality judge failed for ${p.user_name}:`, describeError(err));
        }

        const submittedMs = p.submitted_at ? new Date(p.submitted_at).getTime() : null;
        const timeUsed = (startedMs && submittedMs)
            ? Math.max(0, Math.min(roundDuration, Math.round((submittedMs - startedMs) / 1000)))
            : roundDuration;

        const passRatio = totalCount === 0 ? 0 : passCount / totalCount;
        const testScore = passRatio * 100;
        // Speed only counts for work that actually runs, the same rule the
        // browser used: paying the time leg flat rewarded submitting an
        // untouched starter the second the round opened.
        const timeScore = passRatio * ((roundDuration - timeUsed) / roundDuration) * 100;
        let roundScore = testScore + quality + timeScore;
        if (Number(p.score_multiplier_active) === 1) roundScore *= 2;

        graded.set(p.id, {
            roundScore: Math.max(0, Math.min(arcadeConfig.maxSubmittableRoundScore, Math.round(roundScore))),
            passCount, totalCount, quality: Math.round(quality), timeUsed, code,
        });
    }));

    // The RESULT screen's review panel reads these. Written here rather than on
    // submission because this is where the numbers finally exist. Never allowed
    // to fail the round: a player's result matters more than its history row.
    await Promise.all([...graded.entries()].map(async ([participantId, g]) => {
        const p = humans.find((h) => h.id === participantId);
        try {
            await db.query(
                `INSERT INTO arcade_round_history
                    (room_id, room_code, room_name, difficulty, round_duration_mode, user_name, round_num,
                     code, pass_count, total_count, quality_score, time_used_seconds, round_score)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT (room_id, user_name, round_num) DO NOTHING`,
                [room.room_id, room.room_code, room.room_name,
                 room.difficulty || 'default', room.round_duration_mode || 'standard',
                 p.user_name, roundNum, g.code.slice(0, 20000),
                 g.passCount, g.totalCount, g.quality, g.timeUsed, g.roundScore]
            );
        } catch (historyErr) {
            console.error('⚠️ arcade_round_history insert failed (round result still stands):', historyErr.message);
        }
    }));

    return graded;
}

async function finalizeArcadePhase(room) {
    const roomId = room.room_id;
    const phase = room.phase;

    if (phase.startsWith('ROUND_')) {
        const roundNum = parseInt(phase.split('_')[1], 10);
        const roundDuration = arcadePhaseDurations(room)[phase];
        const eliminateCount = ARCADE_ELIMINATE_COUNT[roundNum] || 0;

        // How many test cases this round's task actually has — only used to
        // scale a bot's synthesized score onto the same range a human could
        // reach, so it has to describe the task the humans were really given.
        //
        // Round 4 has always come from the DB's hard pool. Phase 8.4 adds the
        // same situation to Rounds 1-3 for rooms that picked a difficulty:
        // they draw from the DB pool too, so the fixed ARCADE_ROUND_CASE_COUNTS
        // would be describing tasks nobody was asked to solve. The offset
        // (roundNum - 1) with ORDER BY task_id must match the client's own
        // pick in useRoundJudging.getRoundTask(), or bots would be scored
        // against a different task than the players saw.
        // How many test cases this round's task actually has — used to scale a
        // bot's synthesized score onto the same range a human could reach, so
        // it must describe the task the humans were really given.
        //
        // A match now draws its own problems at start (round_task_ids), so the
        // count is looked up from that line-up. The fixed
        // ARCADE_ROUND_CASE_COUNTS is only a fallback for legacy rooms started
        // before the draw existed, or if the draw somehow failed.
        let totalCount = ARCADE_ROUND_CASE_COUNTS[roundNum];
        const drawn = Array.isArray(room.round_task_ids) ? room.round_task_ids : null;
        if (drawn && drawn[roundNum - 1] !== undefined) {
            const [drawnTask] = await db.query(
                `SELECT test_cases FROM arcade_tasks WHERE task_id = ?`,
                [drawn[roundNum - 1]]
            );
            const cases = drawnTask?.[0]?.test_cases;
            if (Array.isArray(cases)) totalCount = cases.length;
        } else if (roundNum === 4) {
            // Legacy rooms only (started before round_task_ids existed). This
            // has to read the same pool the client's own Round 4 fallback
            // picks from, which now follows the room's difficulty rather than
            // always being `hard` - otherwise bots would be scaled against a
            // different problem than the humans were shown.
            const finaleDifficulty = arcadeConfig.finalePoolByDifficulty[room.difficulty || 'default']
                || arcadeConfig.finalePoolByDifficulty.default;
            const [finaleTasks] = await db.query(
                `SELECT test_cases FROM arcade_tasks WHERE difficulty = ? ORDER BY task_id ASC LIMIT 1`,
                [finaleDifficulty]
            );
            const cases = finaleTasks?.[0]?.test_cases;
            totalCount = Array.isArray(cases) ? cases.length : 2;
        }

        const [participants] = await db.query(`SELECT * FROM arcade_participants WHERE room_id = ?`, [roomId]);
        const alive = (participants || []).filter(p => !p.is_eliminated);

        // Elimination counts are tuned for a full 5-player bracket
        // (5→5→3→2→1) but rooms are allowed as small as 2 players — clamp so
        // a round can never cut everyone left standing (always leave at
        // least 1 survivor to be the match's eventual winner).
        const safeEliminateCount = Math.min(eliminateCount, Math.max(0, alive.length - 1));

        // Grade the humans now, from what they submitted. Until ADR 0001 this
        // read pending_round_score - a number the browser had computed and sent.
        const graded = await gradeArcadeRoundSubmissions({
            room, roundNum, participants: alive, roundDuration,
        });

        const roundResults = alive.map(p => {
            const isBot = p.user_name.startsWith('Bot_');
            const roundScore = isBot
                ? synthesizeBotRoundScore(totalCount, roundDuration, room.difficulty)
                : (graded.get(p.id)?.roundScore || 0);
            return { participant: p, roundScore };
        });

        // Rank this round's performance only (not cumulative) to pay out coins.
        roundResults.sort((a, b) => b.roundScore - a.roundScore);
        for (let i = 0; i < roundResults.length; i++) {
            const cashGain = ARCADE_RANK_CASH_REWARDS[i] || 0;
            const { participant, roundScore } = roundResults[i];
            await db.query(
                `UPDATE arcade_participants SET score = score + ?, cash = cash + ?, has_submitted = 0, pending_round_score = NULL, submitted_code = NULL, submitted_at = NULL, score_multiplier_active = 0, draft_code = NULL, draft_updated_at = NULL WHERE id = ?`,
                [roundScore, cashGain, participant.id]
            );
        }

        // Cumulative-score elimination — recompute standings from the fresh
        // totals just written above so a round's own score counts toward
        // whether its owner survives it.
        const eliminatedNames = new Set();
        if (safeEliminateCount > 0) {
            const cumulative = roundResults.map(({ participant, roundScore }) => ({
                user_name: participant.user_name,
                newScore: participant.score + roundScore
            }));
            cumulative.sort((a, b) => a.newScore - b.newScore);
            for (const p of cumulative.slice(0, safeEliminateCount)) {
                eliminatedNames.add(p.user_name);
                await db.query(`UPDATE arcade_participants SET is_eliminated = 1 WHERE room_id = ? AND user_name = ?`, [roomId, p.user_name]);
            }
        }

        const summary = {
            roundNum,
            entries: roundResults.map(({ participant, roundScore }, i) => ({
                name: participant.user_name,
                rank: i + 1,
                cashGain: ARCADE_RANK_CASH_REWARDS[i] || 0,
                eliminated: eliminatedNames.has(participant.user_name)
            }))
        };

        // A small room (as few as 2 players) can reach a sole survivor
        // before Round 4 — finish the match right there instead of dragging
        // everyone through empty rounds nobody else can be cut from.
        const remainingAlive = alive.length - eliminatedNames.size;
        if (roundNum === 4 || remainingAlive <= 1) {
            await db.query(
                `UPDATE arcade_rooms SET phase = 'RESULT', phase_deadline = NULL, current_round = ?, last_round_summary = ? WHERE room_id = ?`,
                [roundNum, JSON.stringify(summary), roomId]
            );
            await recordArcadePlayerStats(roomId);
        } else {
            const nextDeadline = new Date(Date.now() + arcadePhaseDurations(room)[`SUMMARY_${roundNum}`] * 1000);
            await db.query(
                `UPDATE arcade_rooms SET phase = ?, phase_deadline = ?, current_round = ?, last_round_summary = ? WHERE room_id = ?`,
                [`SUMMARY_${roundNum}`, nextDeadline, roundNum, JSON.stringify(summary), roomId]
            );
        }
        return;
    }

    if (phase.startsWith('SUMMARY_')) {
        const roundNum = phase.split('_')[1];
        const nextPhase = `SHOP_${roundNum}`;
        const nextDeadline = new Date(Date.now() + arcadePhaseDurations(room)[nextPhase] * 1000);
        await db.query(`UPDATE arcade_rooms SET phase = ?, phase_deadline = ? WHERE room_id = ?`, [nextPhase, nextDeadline, roomId]);
        return;
    }

    if (phase.startsWith('SHOP_')) {
        const roundNum = parseInt(phase.split('_')[1], 10);
        const nextPhase = `ROUND_${roundNum + 1}`;
        const nextDeadline = new Date(Date.now() + arcadePhaseDurations(room)[nextPhase] * 1000);
        await db.query(`UPDATE arcade_rooms SET phase = ?, phase_deadline = ? WHERE room_id = ?`, [nextPhase, nextDeadline, roomId]);
        return;
    }
}

// Drives every in-progress room's clock. Runs every 1s, picks up any room
// whose phase_deadline has passed, and finalizes exactly that one phase step
// (finalizeArcadePhase only ever advances ONE phase per call — a room stuck
// for multiple missed ticks, e.g. server hiccup, catches up one tick at a
// time on subsequent runs rather than skipping phases).
async function tickArcadeMatches() {
    const [dueRooms] = await db.query(
        `SELECT * FROM arcade_rooms WHERE status = 'PLAYING' AND phase NOT IN ('LOBBY', 'RESULT') AND phase_deadline IS NOT NULL AND phase_deadline <= CURRENT_TIMESTAMP`
    );
    for (const room of dueRooms || []) {
        await finalizeArcadePhase(room);
    }
}

// Turns anything thrown into a line worth reading. An Error with an empty
// message formats as "" under `${err.message}`, which is precisely how a
// database problem managed to print 2,336 log lines that named no cause at all.
function describeError(err) {
    if (!err) return 'unknown error (nothing was thrown)';
    if (typeof err === 'string') return err;
    const parts = [];
    if (err.name && err.name !== 'Error') parts.push(err.name);
    if (err.code) parts.push(`[${err.code}]`);
    parts.push(err.message && err.message.trim() ? err.message : `<no message> ${JSON.stringify(err)}`);
    if (err.sql) parts.push(`\n    sql: ${String(err.sql).slice(0, 200)}`);
    const frame = String(err.stack || '').split('\n')[1];
    if (frame) parts.push(`\n    at ${frame.trim()}`);
    return parts.join(' ');
}

// The tick is scheduled with a self-rearming setTimeout rather than
// setInterval, for two independent reasons.
//
// 1. BACK-OFF. setInterval fires regardless of whether the previous attempt
//    worked, so a database that went away turned this into a 1Hz error printer:
//    when postgres restarted underneath the server on 2026-08-18 it logged
//    56,492 identical failures before the process died, and the volume buried
//    the one line that said what had actually happened. The delay now doubles
//    on consecutive failures up to tickMaxBackoffMs and snaps back to normal on
//    the first success. Backing off costs nothing: while the database is
//    unreachable no phase can advance anyway, and because every deadline is a
//    stored timestamp rather than a countdown held in memory, one successful
//    tick after recovery picks up every room that came due in the meantime.
//
// 2. NO OVERLAPPING TICKS. setInterval does not wait for an async callback, so
//    a tick that ran long (many rooms, or a slow query) could still be inside
//    finalizeArcadePhase() when the next one started - and both would read the
//    same overdue room out of the SELECT above and finalize it twice, paying
//    out its score and cash twice. Re-arming only after the previous tick has
//    settled makes that impossible by construction.
const ARCADE_TICK_INTERVAL_MS = arcadeConfig.tickIntervalMs;
const ARCADE_TICK_MAX_BACKOFF_MS = arcadeConfig.tickMaxBackoffMs;
let arcadeTickFailures = 0;

function arcadeTickDelay() {
    if (arcadeTickFailures === 0) return ARCADE_TICK_INTERVAL_MS;
    // Exponent capped before the multiply so the intermediate cannot overflow
    // during a long outage; the min() is what actually bounds the wait.
    const grown = ARCADE_TICK_INTERVAL_MS * 2 ** Math.min(arcadeTickFailures, 10);
    return Math.min(grown, ARCADE_TICK_MAX_BACKOFF_MS);
}

async function runArcadeTick() {
    try {
        await tickArcadeMatches();
        if (arcadeTickFailures > 0) {
            console.log(`✅ Arcade match tick recovered after ${arcadeTickFailures} failed attempt(s) — back to ${ARCADE_TICK_INTERVAL_MS}ms`);
            arcadeTickFailures = 0;
        }
    } catch (err) {
        arcadeTickFailures += 1;
        // Log the first failure in full, then only at powers of two. An outage
        // lasting hours produces a couple of dozen lines instead of tens of
        // thousands, while still proving the server is alive and still trying.
        const isPowerOfTwo = (arcadeTickFailures & (arcadeTickFailures - 1)) === 0;
        if (isPowerOfTwo) {
            // describeError, not err.message: the old log printed err.message
            // alone, and the errors that actually occurred had an EMPTY
            // message, so the log filled with 2,336 lines reading
            // "Arcade match tick error:" and nothing after the colon.
            console.error(`❌ Arcade match tick failed (attempt ${arcadeTickFailures}, retrying in ${arcadeTickDelay()}ms): ${describeError(err)}`);
        }
    } finally {
        arcadeTickTimer = setTimeout(runArcadeTick, arcadeTickDelay());
        // Never let the retry timer be the reason the process cannot exit.
        if (arcadeTickTimer.unref) arcadeTickTimer.unref();
    }
}

let arcadeTickTimer = setTimeout(runArcadeTick, ARCADE_TICK_INTERVAL_MS);
if (arcadeTickTimer.unref) arcadeTickTimer.unref();

// 1. Get joinable public rooms (status = 'WAITING')
app.get('/api/arcade/rooms', async (req, res) => {
    try {
        const [rooms] = await db.query(
            `SELECT r.room_id, r.room_code, r.room_name, r.host_name, r.max_players, r.status, r.created_at,
                    (r.password IS NOT NULL AND r.password != '') AS is_password_protected,
                    COUNT(p.id) AS current_players
             FROM arcade_rooms r
             LEFT JOIN arcade_participants p ON r.room_id = p.room_id
             WHERE r.status = 'WAITING'
             GROUP BY r.room_id, r.room_code, r.room_name, r.host_name, r.max_players, r.status, r.created_at, r.password
             ORDER BY r.created_at DESC`
        );
        res.json({ success: true, rooms: rooms || [] });
    } catch (err) {
        console.error('❌ GET /api/arcade/rooms error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. Create new room
app.post('/api/arcade/rooms/create', async (req, res) => {
    try {
        const { room_name, password, max_players = 5, host_name, round_duration_mode, difficulty } = req.body;
        if (!room_name || !host_name) {
            return res.status(400).json({ error: 'กรุณาระบุชื่อห้องและชื่อผู้สร้างห้อง' });
        }
        const cleanRoomName = sanitizeName(room_name, 60);
        const cleanHostName = sanitizeName(host_name, 24);
        if (!cleanRoomName || !cleanHostName) {
            return res.status(400).json({ error: 'ชื่อห้องหรือชื่อผู้สร้างห้องไม่ถูกต้อง' });
        }
        const maxPlayersNum = clampArcadeMaxPlayers(max_players, 5);
        // Phase 8.4 — validated against the whitelists in shared/arcadeConfig.json
        // rather than trusted, since both end up in the room row that drives
        // match pacing and task selection for everyone in it.
        const durationMode = arcadeConfig.roundDurationModes.includes(round_duration_mode)
            ? round_duration_mode : 'standard';
        const roomDifficulty = arcadeConfig.difficulties.includes(difficulty)
            ? difficulty : 'default';
        const roomCode = generateRoomCode();
        const pwdValue = (password && password.trim().length > 0) ? await bcrypt.hash(password.trim(), 10) : null;

        const [insertResult] = await db.query(
            `INSERT INTO arcade_rooms (room_code, room_name, host_name, password, max_players, status, round_duration_mode, difficulty)
             VALUES (?, ?, ?, ?, ?, 'WAITING', ?, ?) RETURNING room_id`,
            [roomCode, cleanRoomName, cleanHostName, pwdValue, maxPlayersNum, durationMode, roomDifficulty]
        );

        const roomId = insertResult[0]?.room_id || insertResult.insertId;

        // Add host as first participant
        await db.query(
            `INSERT INTO arcade_participants (room_id, user_name, is_host) VALUES (?, ?, 1)`,
            [roomId, cleanHostName]
        );

        res.json({
            success: true,
            room: {
                room_id: roomId,
                room_code: roomCode,
                room_name: cleanRoomName,
                host_name: cleanHostName,
                max_players: maxPlayersNum,
                is_password_protected: !!pwdValue
            }
        });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/create error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. Join room by Code or ID. Runs inside a transaction with the room row
// locked (SELECT ... FOR UPDATE) so two players racing for the last open
// slot can't both pass the capacity check and both get inserted.
app.post('/api/arcade/rooms/join', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { room_code_or_id, password, user_name } = req.body;
        if (!room_code_or_id || !user_name) {
            connection.release();
            return res.status(400).json({ error: 'กรุณาระบุรหัสห้องและชื่อผู้ใช้' });
        }
        const cleanUserName = sanitizeName(user_name, 24);
        if (!cleanUserName) {
            connection.release();
            return res.status(400).json({ error: 'ชื่อผู้ใช้ไม่ถูกต้อง' });
        }

        const queryTerm = String(room_code_or_id).trim().toUpperCase();

        await connection.beginTransaction();
        const [rooms] = await connection.query(
            `SELECT * FROM arcade_rooms WHERE (UPPER(room_code) = ? OR CAST(room_id AS TEXT) = ?) FOR UPDATE`,
            [queryTerm, queryTerm]
        );

        if (!rooms || rooms.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'ไม่พบห้องแข่งขันที่ระบุ' });
        }

        const room = rooms[0];

        if (room.status !== 'WAITING') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: 'ห้องนี้เริ่มการแข่งขันไปแล้ว ไม่สามารถเข้าร่วมได้' });
        }

        if (room.password && !(await bcrypt.compare(password || '', room.password))) {
            await connection.rollback();
            connection.release();
            return res.status(401).json({ error: 'รหัสผ่านเข้าห้องไม่ถูกต้อง' });
        }

        const [participants] = await connection.query(
            `SELECT * FROM arcade_participants WHERE room_id = ?`,
            [room.room_id]
        );

        if (participants.length >= room.max_players) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: 'ห้องนี้มีผู้เล่นเต็มจำนวนแล้ว' });
        }

        // Add player if not already in room
        const alreadyIn = participants.find(p => p.user_name === cleanUserName);
        if (!alreadyIn) {
            await connection.query(
                `INSERT INTO arcade_participants (room_id, user_name, is_host) VALUES (?, ?, 0)`,
                [room.room_id, cleanUserName]
            );
        }
        await connection.commit();
        connection.release();

        const [updatedParticipants] = await db.query(
            `SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at ASC`,
            [room.room_id]
        );

        const { password: _pwd, ...roomSafe } = room;
        res.json({
            success: true,
            room: roomSafe,
            participants: updatedParticipants
        });
    } catch (err) {
        try { await connection.rollback(); } catch { /* connection already closed */ }
        try { connection.release(); } catch { /* already released */ }
        console.error('❌ POST /api/arcade/rooms/join error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. Get specific room state & participants. Polled every ~2s by every
// connected client for the whole lobby+match lifetime, so it also doubles as
// the presence heartbeat consumed by the stale-connection sweep below.
app.get('/api/arcade/rooms/:id', async (req, res) => {
    try {
        const roomId = req.params.id;
        const userName = req.query.user_name;
        if (userName) {
            await db.query(
                `UPDATE arcade_participants SET last_seen = CURRENT_TIMESTAMP WHERE room_id = ? AND user_name = ?`,
                [roomId, userName]
            );
        }
        const [rooms] = await db.query(`SELECT * FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ error: 'ไม่พบห้องแข่งขัน' });
        }
        const [participants] = await db.query(
            `SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at ASC`,
            [roomId]
        );
        const { password: _pwd, ...roomSafe } = rooms[0];
        res.json({ success: true, room: roomSafe, participants });
    } catch (err) {
        console.error('❌ GET /api/arcade/rooms/:id error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5. Host updates room settings
app.post('/api/arcade/rooms/:id/settings', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { host_name, room_name, max_players, password } = req.body;

        const [rooms] = await db.query(`SELECT * FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (rooms[0].host_name !== host_name) return res.status(403).json({ error: 'สิทธิ์เฉพาะหัวห้องเท่านั้น' });

        const newName = room_name ? sanitizeName(room_name, 60) || rooms[0].room_name : rooms[0].room_name;
        const newMax = max_players ? clampArcadeMaxPlayers(max_players, rooms[0].max_players) : rooms[0].max_players;
        const newPwd = password !== undefined ? (password ? await bcrypt.hash(password.trim(), 10) : null) : rooms[0].password;

        await db.query(
            `UPDATE arcade_rooms SET room_name = ?, max_players = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?`,
            [newName, newMax, newPwd, roomId]
        );

        res.json({ success: true, message: 'อัปเดตการตั้งค่าห้องสำเร็จ' });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/settings error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 6. Host transfers host role
app.post('/api/arcade/rooms/:id/transfer-host', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { current_host, target_user_name } = req.body;

        const [rooms] = await db.query(`SELECT * FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (rooms[0].host_name !== current_host) return res.status(403).json({ error: 'สิทธิ์เฉพาะหัวห้องเท่านั้น' });
        if (target_user_name.startsWith('Bot_')) return res.status(400).json({ error: 'ไม่สามารถโอนตำแหน่งหัวห้องให้บอทได้' });

        await db.query(`UPDATE arcade_rooms SET host_name = ? WHERE room_id = ?`, [target_user_name, roomId]);
        await db.query(`UPDATE arcade_participants SET is_host = 0 WHERE room_id = ?`, [roomId]);
        await db.query(`UPDATE arcade_participants SET is_host = 1 WHERE room_id = ? AND user_name = ?`, [roomId, target_user_name]);

        res.json({ success: true, message: `โอนตำแหน่งหัวห้องให้คุณ ${target_user_name} เรียบร้อยแล้ว` });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/transfer-host error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 7. Host kicks player
app.post('/api/arcade/rooms/:id/kick', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { host_name, target_user_name } = req.body;

        const [rooms] = await db.query(`SELECT * FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (rooms[0].host_name !== host_name) return res.status(403).json({ error: 'สิทธิ์เฉพาะหัวห้องเท่านั้น' });

        await db.query(`DELETE FROM arcade_participants WHERE room_id = ? AND user_name = ?`, [roomId, target_user_name]);

        res.json({ success: true, message: `เตะผู้เล่น ${target_user_name} ออกจากห้องแล้ว` });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/kick error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 7.5 Host adds random bot player
app.post('/api/arcade/rooms/:id/add-bot', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { host_name } = req.body;

        const [rooms] = await db.query(`SELECT * FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (rooms[0].host_name !== host_name) return res.status(403).json({ error: 'สิทธิ์เฉพาะหัวห้องเท่านั้นในการเพิ่มบอท' });
        // A bot added mid-match would join with score/cash both 0 while
        // everyone else already has a full match's worth of cumulative
        // score, guaranteeing it gets cut on the very next elimination
        // regardless of that round's own performance — and nothing would
        // stop a host from doing this repeatedly through an entire match.
        // `join` (the real-player equivalent) already refuses this same way;
        // add-bot never had the matching guard.
        if (rooms[0].status !== 'WAITING') {
            return res.status(400).json({ error: 'ไม่สามารถเพิ่มบอทระหว่างการแข่งขันได้' });
        }

        const [participants] = await db.query(`SELECT * FROM arcade_participants WHERE room_id = ?`, [roomId]);
        if (participants.length >= rooms[0].max_players) {
            return res.status(400).json({ error: 'ห้องแข่งขันมีผู้เล่นเต็มจำนวนแล้ว' });
        }

        const botNamesPool = [
            "Bot_PyNinja", "Bot_SyntaxPro", "Bot_CyberCoder", "Bot_NullPointer",
            "Bot_AlgorithmX", "Bot_LogicCraft", "Bot_BugHunter", "Bot_CodeMaster",
            "Bot_StackOverflow", "Bot_Pythonic"
        ];

        const existingNames = new Set(participants.map(p => p.user_name));
        const availableBots = botNamesPool.filter(name => !existingNames.has(name));

        const chosenBotName = availableBots.length > 0 
            ? availableBots[Math.floor(Math.random() * availableBots.length)]
            : `Bot_Player_${Math.floor(Math.random() * 900) + 100}`;

        await db.query(
            `INSERT INTO arcade_participants (room_id, user_name, is_host) VALUES (?, ?, 0)`,
            [roomId, chosenBotName]
        );

        const [updatedParticipants] = await db.query(
            `SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at ASC`,
            [roomId]
        );

        res.json({ success: true, bot_name: chosenBotName, participants: updatedParticipants });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/add-bot error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 8. Host starts room match
app.post('/api/arcade/rooms/:id/start', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { host_name } = req.body;

        const [rooms] = await db.query(`SELECT * FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (rooms[0].host_name !== host_name) return res.status(403).json({ error: 'สิทธิ์เฉพาะหัวห้องเท่านั้น' });

        const [participants] = await db.query(`SELECT id FROM arcade_participants WHERE room_id = ?`, [roomId]);
        if (!participants || participants.length < 2) {
            return res.status(400).json({ error: 'ต้องมีผู้เล่นในห้องอย่างน้อย 2 คนจึงจะเริ่มการแข่งขันได้' });
        }

        const deadline = new Date(Date.now() + arcadePhaseDurations(rooms[0]).ROUND_1 * 1000);
        // Draw this match's problems before anyone can see a round.
        const drawnTasks = await drawArcadeRoundTasks(rooms[0]);
        await db.query(
            `UPDATE arcade_rooms SET status = 'PLAYING', phase = 'ROUND_1', phase_deadline = ?, current_round = 1, last_round_summary = NULL, round_task_ids = ? WHERE room_id = ?`,
            [deadline, drawnTasks ? JSON.stringify(drawnTasks) : null, roomId]
        );
        await db.query(
            `UPDATE arcade_participants SET score = 0, cash = 0, is_eliminated = 0, has_submitted = 0, pending_round_score = NULL, submitted_code = NULL, submitted_at = NULL, score_multiplier_active = 0, draft_code = NULL, draft_updated_at = NULL WHERE room_id = ?`,
            [roomId]
        );

        res.json({ success: true, message: 'เริ่มการแข่งขันแล้ว!' });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/start error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 8b. A real player reports their own already-judged round result (passCount/
// readability/timeBonus folded into one score, computed client-side via
// Pyodide exactly as before — the server has no Python runtime to re-check
// it, the same trust boundary Person 1's learning-system exercises already
// rely on). tickArcadeMatches()/finalizeArcadePhase() is the only thing that
// ever turns a round's result into real score/cash. (pending_round_score is
// no longer written: the score is computed at finalize from submitted_code.)
app.post('/api/arcade/rooms/:id/submit-round', async (req, res) => {
    try {
        const roomId = req.params.id;
        // Phase 8.3: the client now also reports the breakdown behind
        // round_score (and the code itself) so the RESULT screen can show the
        // player what they actually wrote each round. All optional — an older
        // client that only sends round_score still works exactly as before,
        // it just records a history row with zeroed detail.
        // Only the code, and a flag for an item effect the server cannot see.
        // round_score/pass_count/total_count/quality_score/time_used_seconds
        // used to arrive here fully computed by the browser; they are no longer
        // read at all, because a value the server cannot recompute is a value a
        // player can choose. finalizeArcadePhase() works all of them out when
        // the round closes. See docs/adr/0001-server-owns-the-verdict.md.
        const { user_name, code, score_multiplier_active } = req.body;
        if (!user_name || typeof code !== 'string') {
            return res.status(400).json({ error: 'ข้อมูลการส่งคำตอบไม่ถูกต้อง' });
        }

        const [rooms] = await db.query(`SELECT * FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (rooms[0].status !== 'PLAYING' || !String(rooms[0].phase).startsWith('ROUND_')) {
            return res.status(400).json({ error: 'ไม่อยู่ในช่วงเวลาที่ส่งคำตอบได้' });
        }

        const [participants] = await db.query(
            `SELECT * FROM arcade_participants WHERE room_id = ? AND user_name = ?`,
            [roomId, user_name]
        );
        const participant = participants?.[0];
        if (!participant) return res.status(404).json({ error: 'ไม่พบผู้เล่นในห้องนี้' });
        if (participant.is_eliminated) return res.status(400).json({ error: 'คุณตกรอบไปแล้ว' });
        if (participant.has_submitted) {
            return res.json({ success: true, message: 'ส่งคำตอบไปแล้วสำหรับรอบนี้' });
        }

        // The submission is stored, not scored. finalizeArcadePhase() grades it
        // when the round's timer runs out: it runs the code against the round's
        // real test cases, asks the code-quality judge, and takes the time from
        // the server's own clock. Nothing a player sends can raise their score.
        //
        // What the player has to do in time is SEND. Grading happens later, so
        // a slow network cannot cost anyone a round.
        const multiplierActive = score_multiplier_active ? 1 : 0;
        await db.query(
            `UPDATE arcade_participants
                SET submitted_code = ?, submitted_at = CURRENT_TIMESTAMP,
                    has_submitted = 1, score_multiplier_active = ?
              WHERE id = ?`,
            [String(code).slice(0, 20000), multiplierActive, participant.id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/submit-round error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// The player's current draft, resent every few seconds while a round is open.
// Accepted only during a coding round, and only from a player who has not
// already submitted - once an answer is in, the draft stops moving so the
// spectator view keeps showing what was actually sent rather than whatever the
// editor still happens to contain.
//
// Deliberately not part of submit-round: what gets graded is submitted_code and
// nothing else. A draft can never become an answer by itself.
app.post('/api/arcade/rooms/:id/code-draft', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { user_name, code } = req.body;
        if (!user_name || typeof code !== 'string') {
            return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
        }

        const [rooms] = await db.query(`SELECT status, phase FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (rooms[0].status !== 'PLAYING' || !String(rooms[0].phase).startsWith('ROUND_')) {
            return res.json({ success: true, ignored: true });
        }

        await db.query(
            `UPDATE arcade_participants
                SET draft_code = ?, draft_updated_at = CURRENT_TIMESTAMP
              WHERE room_id = ? AND user_name = ? AND has_submitted = 0 AND is_eliminated = 0`,
            [String(code).slice(0, 20000), roomId, user_name]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/code-draft error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Read another player's code during a match - the spectator view.
//
// The permission rule is the whole point: only a viewer who has already
// submitted this round, or who is out of the match, may look. Anyone still able
// to edit their own answer would simply be copying, so they are refused even
// when the player they want to watch has finished. A viewer may always read
// their own row back, which is what makes this double as reconnect recovery.
//
// Bots have no code. They are answered honestly rather than with an empty
// editor that reads like a player who has written nothing.
app.get('/api/arcade/rooms/:id/code/:user_name', async (req, res) => {
    try {
        const roomId = req.params.id;
        const target = req.params.user_name;
        const viewer = req.query.viewer;
        if (!viewer) return res.status(400).json({ error: 'ต้องระบุผู้ขอดู' });

        const [rows] = await db.query(
            `SELECT user_name, draft_code, submitted_code, has_submitted, is_eliminated, draft_updated_at
               FROM arcade_participants WHERE room_id = ? AND user_name IN (?, ?)`,
            [roomId, viewer, target]
        );
        const viewerRow = rows.find((r) => r.user_name === viewer);
        const targetRow = rows.find((r) => r.user_name === target);
        if (!viewerRow) return res.status(404).json({ error: 'ไม่พบผู้ขอดูในห้องนี้' });
        if (!targetRow) return res.status(404).json({ error: 'ไม่พบผู้เล่นคนนี้ในห้อง' });

        const lookingAtSelf = viewer === target;
        const mayWatch = lookingAtSelf
            || Number(viewerRow.has_submitted) === 1
            || Number(viewerRow.is_eliminated) === 1;
        if (!mayWatch) {
            return res.status(403).json({ error: 'ดูโค้ดของผู้เล่นคนอื่นได้หลังจากส่งคำตอบแล้วเท่านั้น' });
        }

        if (String(target).startsWith('Bot_')) {
            return res.json({ user_name: target, is_bot: true, code: null, has_submitted: Number(targetRow.has_submitted) === 1 });
        }

        const submitted = Number(targetRow.has_submitted) === 1;
        res.json({
            user_name: target,
            is_bot: false,
            has_submitted: submitted,
            code: (submitted ? targetRow.submitted_code : targetRow.draft_code) || '',
            updated_at: targetRow.draft_updated_at,
        });
    } catch (err) {
        console.error('❌ GET /api/arcade/rooms/:id/code/:user_name error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Shop buy/sell/reroll all reduce to "add or subtract some amount of cash,
// authoritatively" — before this endpoint existed, ArcadeBattleRoyale.jsx's
// buyItem()/sellItem()/rollShop() only ever called local setPlayerState(),
// so the room-state poller's unconditional `cash: myRow.cash` merge (see
// that file's fetchRoomState, which mirrors DB-authoritative cash every 2s)
// silently reverted every purchase within ~2 seconds — items stayed in the
// player's local inventory, but the DB never actually charged for them, so
// every item was effectively free. This mirrors the same
// read-current-cash-then-write pattern the /attack endpoint's
// cashSteal/taxCollection branch already uses. Only usable during a SHOP_
// phase, matching Phase 4's "purchase only during shop phase" rule (which
// was previously enforced only by which screen the client happened to be
// showing, not by the server).
app.post('/api/arcade/rooms/:id/shop-cash-delta', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { user_name, delta } = req.body;
        if (!user_name || !Number.isFinite(delta)) {
            return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
        }

        const [rooms] = await db.query(`SELECT * FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (!String(rooms[0].phase).startsWith('SHOP_')) {
            return res.status(400).json({ error: 'ทำได้เฉพาะช่วงร้านค้าเท่านั้น' });
        }

        const [participants] = await db.query(
            `SELECT * FROM arcade_participants WHERE room_id = ? AND user_name = ?`,
            [roomId, user_name]
        );
        const participant = participants?.[0];
        if (!participant) return res.status(404).json({ error: 'ไม่พบผู้เล่นในห้องนี้' });

        const newCash = participant.cash + Math.round(delta);
        if (newCash < 0) {
            return res.status(400).json({ error: 'เงินไม่พอ' });
        }

        await db.query(`UPDATE arcade_participants SET cash = ? WHERE id = ?`, [newCash, participant.id]);
        res.json({ success: true, cash: newCash });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/shop-cash-delta error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Step 5 — a player's own past matches, newest first, with every round they
// submitted. Scoped to one player for the same reason the in-match version is:
// handing out everyone's solutions would turn this into an answer key.
// Only finished matches appear (match_ended_at IS NOT NULL).
app.get('/api/arcade/players/:user_name/history', async (req, res) => {
    try {
        const userName = req.params.user_name;
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

        const [rows] = await db.query(
            `SELECT room_id, room_code, room_name, difficulty, round_duration_mode, round_num, code,
                    pass_count, total_count, quality_score, time_used_seconds, round_score, match_ended_at
             FROM arcade_round_history
             WHERE user_name = ? AND match_ended_at IS NOT NULL
             ORDER BY room_id DESC, round_num ASC`,
            [userName]
        );

        // Group flat rows into matches, preserving the newest-first ordering
        // the query already established.
        const byRoom = new Map();
        for (const row of rows || []) {
            if (!byRoom.has(row.room_id)) {
                byRoom.set(row.room_id, {
                    room_id: row.room_id,
                    room_code: row.room_code,
                    room_name: row.room_name,
                    // What the match was actually played at. Needed to judge a
                    // result at all: "2 of 4 rounds finished" means something
                    // different in a 30-second room than a 60-second one.
                    difficulty: row.difficulty,
                    round_duration_mode: row.round_duration_mode,
                    ended_at: row.match_ended_at,
                    total_score: 0,
                    rounds: []
                });
            }
            const match = byRoom.get(row.room_id);
            match.total_score += row.round_score || 0;
            match.rounds.push({
                round_num: row.round_num, code: row.code,
                pass_count: row.pass_count, total_count: row.total_count,
                quality_score: row.quality_score, time_used_seconds: row.time_used_seconds,
                round_score: row.round_score
            });
        }

        res.json({ success: true, matches: Array.from(byRoom.values()).slice(0, limit) });
    } catch (err) {
        console.error('❌ GET /api/arcade/players/:user_name/history error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Phase 8.2 — room chat and emoji reactions.
//
// Chat is refused during ROUND_* phases on purpose. Every player in a room is
// solving the SAME problem at the same time, so a live text channel mid-round
// is an answer-sharing channel; the lobby, the round summary and the shop
// intermission are where talking belongs. This is enforced here rather than by
// hiding the input client-side, since hiding a control is not a rule.
const ARCADE_CHAT_MAX_LEN = 300;
// Whitelisted reaction set. Emoji are stored as-is, so accepting arbitrary
// strings here would make this a free-form text channel that bypasses the
// round-phase rule above (and the length cap).
const ARCADE_CHAT_EMOJI = ['👍', '😂', '🔥', '😮', '😢', '👏', '😎', '😕'];
// Minimum gap between two messages from the same player, to stop one client
// from flooding a room's history (and everyone else's poll payload).
const ARCADE_CHAT_MIN_INTERVAL_MS = 700;

app.post('/api/arcade/rooms/:id/chat', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { user_name, message, emoji } = req.body;
        if (!user_name) return res.status(400).json({ error: 'กรุณาระบุ user_name' });

        const [rooms] = await db.query(`SELECT phase FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        if (!rooms || rooms.length === 0) return res.status(404).json({ error: 'ไม่พบห้อง' });
        if (String(rooms[0].phase).startsWith('ROUND_')) {
            return res.status(400).json({ error: 'ปิดแชทระหว่างรอบแข่งขัน' });
        }

        // Must actually be in the room — otherwise anyone who knows a room id
        // could post into a match they are not part of.
        const [participants] = await db.query(
            `SELECT id FROM arcade_participants WHERE room_id = ? AND user_name = ?`,
            [roomId, user_name]
        );
        if (!participants || participants.length === 0) {
            return res.status(403).json({ error: 'คุณไม่ได้อยู่ในห้องนี้' });
        }

        const isEmoji = typeof emoji === 'string' && emoji.length > 0;
        let cleanMessage = null;
        if (isEmoji) {
            if (!ARCADE_CHAT_EMOJI.includes(emoji)) {
                return res.status(400).json({ error: 'อีโมจิไม่ถูกต้อง' });
            }
        } else {
            cleanMessage = sanitizeName(message, ARCADE_CHAT_MAX_LEN);
            if (!cleanMessage) return res.status(400).json({ error: 'ข้อความว่างเปล่า' });
        }

        const [recent] = await db.query(
            `SELECT created_at FROM arcade_chat_messages
             WHERE room_id = ? AND user_name = ?
             ORDER BY id DESC LIMIT 1`,
            [roomId, user_name]
        );
        if (recent && recent.length > 0) {
            const last = new Date(String(recent[0].created_at).replace(' ', 'T') + 'Z').getTime();
            if (Number.isFinite(last) && Date.now() - last < ARCADE_CHAT_MIN_INTERVAL_MS) {
                return res.status(429).json({ error: 'ส่งข้อความเร็วเกินไป' });
            }
        }

        await db.query(
            `INSERT INTO arcade_chat_messages (room_id, user_name, kind, message, emoji)
             VALUES (?, ?, ?, ?, ?)`,
            [roomId, user_name, isEmoji ? 'emoji' : 'text', cleanMessage, isEmoji ? emoji : null]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/chat error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Incremental fetch: clients pass the highest id they already hold, so a poll
// on a long-running room stays a small payload instead of re-sending history.
app.get('/api/arcade/rooms/:id/chat', async (req, res) => {
    try {
        const roomId = req.params.id;
        const since = parseInt(req.query.since, 10);
        const sinceId = Number.isFinite(since) && since > 0 ? since : 0;

        const [rows] = await db.query(
            `SELECT id, user_name, kind, message, emoji, created_at
             FROM arcade_chat_messages
             WHERE room_id = ? AND id > ?
             ORDER BY id ASC
             LIMIT 100`,
            [roomId, sinceId]
        );
        res.json({ success: true, messages: rows || [], emojiSet: ARCADE_CHAT_EMOJI });
    } catch (err) {
        console.error('❌ GET /api/arcade/rooms/:id/chat error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Phase 8.3 — every round this player submitted in this room, for the
// "review your code" panel on the RESULT screen. Scoped to one player on
// purpose: a match is a competition, and handing everyone else's solutions to
// every player at the end would turn the RESULT screen into an answer key.
app.get('/api/arcade/rooms/:id/round-history', async (req, res) => {
    try {
        const roomId = req.params.id;
        const userName = req.query.user_name;
        if (!userName) return res.status(400).json({ error: 'ต้องระบุชื่อผู้เล่น' });

        const [rows] = await db.query(
            `SELECT round_num, code, pass_count, total_count, quality_score, time_used_seconds, round_score
             FROM arcade_round_history
             WHERE room_id = ? AND user_name = ?
             ORDER BY round_num ASC`,
            [roomId, userName]
        );
        res.json({ success: true, history: rows || [] });
    } catch (err) {
        console.error('❌ GET /api/arcade/rooms/:id/round-history error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Phase 8.3 — a player's Arcade career totals for the lobby stats card.
// Returns a zeroed record rather than 404 for someone who has never finished
// a match, so the client can render the card unconditionally.
app.get('/api/arcade/players/:user_name/stats', async (req, res) => {
    try {
        const userName = req.params.user_name;
        const [rows] = await db.query(
            `SELECT user_name, matches_played, wins, best_rank, total_score, total_cash_earned
             FROM arcade_player_stats WHERE user_name = ?`,
            [userName]
        );
        const stats = rows?.[0] || {
            user_name: userName, matches_played: 0, wins: 0,
            best_rank: null, total_score: 0, total_cash_earned: 0
        };
        res.json({ success: true, stats });
    } catch (err) {
        console.error('❌ GET /api/arcade/players/:user_name/stats error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Removes a participant and reassigns host / deletes an empty room. Shared
// by the explicit "leave" action below and the stale-connection sweep, so
// a disconnected player is cleaned up exactly the same way as one who
// clicked Leave.
async function leaveRoom(roomId, userName) {
    await db.query(`DELETE FROM arcade_participants WHERE room_id = ? AND user_name = ?`, [roomId, userName]);

    const [remaining] = await db.query(`SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at ASC`, [roomId]);

    if (!remaining || remaining.length === 0) {
        await db.query(`DELETE FROM arcade_rooms WHERE room_id = ?`, [roomId]);
        return;
    }

    const [rooms] = await db.query(`SELECT host_name FROM arcade_rooms WHERE room_id = ?`, [roomId]);
    if (rooms?.[0]?.host_name === userName) {
        const nextHost = remaining[0].user_name;
        await db.query(`UPDATE arcade_rooms SET host_name = ? WHERE room_id = ?`, [nextHost, roomId]);
        await db.query(`UPDATE arcade_participants SET is_host = 1 WHERE room_id = ? AND user_name = ?`, [roomId, nextHost]);
    }
}

// 9. Leave room
app.post('/api/arcade/rooms/:id/leave', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { user_name } = req.body;

        await leaveRoom(roomId, user_name);

        res.json({ success: true, message: 'ออกจากห้องเรียบร้อยแล้ว' });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/leave error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 10. Post-match finish choice (REMAIN vs LEAVE)
app.post('/api/arcade/rooms/:id/finish-choice', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { user_name, choice } = req.body; // 'REMAIN' or 'LEAVE'

        if (choice === 'LEAVE') {
            await db.query(`DELETE FROM arcade_participants WHERE room_id = ? AND user_name = ?`, [roomId, user_name]);
        } else if (choice === 'REMAIN') {
            await db.query(
                `UPDATE arcade_participants SET score = 0, cash = 0, is_eliminated = 0, has_submitted = 0, pending_round_score = NULL, submitted_code = NULL, submitted_at = NULL, score_multiplier_active = 0, draft_code = NULL, draft_updated_at = NULL WHERE room_id = ? AND user_name = ?`,
                [roomId, user_name]
            );
            await db.query(
                `UPDATE arcade_rooms SET status = 'WAITING', current_round = 0, phase = 'LOBBY', phase_deadline = NULL, last_round_summary = NULL WHERE room_id = ?`,
                [roomId]
            );
        }

        res.json({ success: true, choice });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/finish-choice error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 11. Attack another real participant (or a bot — bots are real
// arcade_participants rows too) — targeted or AOE debuffs go into the
// arcade_effects delivery queue; cashSteal/taxCollection are settled
// immediately since they're a direct cash transfer, not a visual debuff.
app.post('/api/arcade/rooms/:id/attack', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { attacker_name, target_name, effect_type, item_name } = req.body;
        if (!attacker_name || !target_name || !effect_type) {
            return res.status(400).json({ error: 'ข้อมูลการโจมตีไม่ครบถ้วน' });
        }
        if (attacker_name === target_name) {
            return res.status(400).json({ error: 'ไม่สามารถโจมตีตัวเองได้' });
        }

        const [participants] = await db.query(
            `SELECT * FROM arcade_participants WHERE room_id = ? AND user_name IN (?, ?)`,
            [roomId, attacker_name, target_name]
        );
        const attacker = participants.find(p => p.user_name === attacker_name);
        const target = participants.find(p => p.user_name === target_name);
        if (!attacker || !target) {
            return res.status(404).json({ error: 'ไม่พบผู้เล่นในห้องนี้' });
        }
        if (target.is_eliminated) {
            return res.status(400).json({ error: 'เป้าหมายถูกคัดออกไปแล้ว' });
        }

        if (effect_type === 'cashSteal' || effect_type === 'taxCollection') {
            const stolen = effect_type === 'taxCollection'
                ? Math.floor(target.cash * arcadeConfig.cashSteal.taxPercent)
                : Math.min(arcadeConfig.cashSteal.flatAmount, target.cash);
            await db.query(`UPDATE arcade_participants SET cash = cash - ? WHERE room_id = ? AND user_name = ?`, [stolen, roomId, target_name]);
            await db.query(`UPDATE arcade_participants SET cash = cash + ? WHERE room_id = ? AND user_name = ?`, [stolen, roomId, attacker_name]);
            // Also queue a delivery row so the victim's own client (polling /effects)
            // deducts the same amount from their locally-held cash state.
            await db.query(
                `INSERT INTO arcade_effects (room_id, attacker_name, target_name, effect_type, item_name, amount) VALUES (?, ?, ?, ?, ?, ?)`,
                [roomId, attacker_name, target_name, effect_type, item_name || effect_type, stolen]
            );
            return res.json({ success: true, stolen });
        }

        await db.query(
            `INSERT INTO arcade_effects (room_id, attacker_name, target_name, effect_type, item_name) VALUES (?, ?, ?, ?, ?)`,
            [roomId, attacker_name, target_name, effect_type, item_name || effect_type]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('❌ POST /api/arcade/rooms/:id/attack error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 12. Poll for incoming sabotage effects — atomically claims and marks delivered
// so each row is applied by the target exactly once.
app.get('/api/arcade/rooms/:id/effects', async (req, res) => {
    try {
        const roomId = req.params.id;
        const userName = req.query.user_name;
        if (!userName) return res.status(400).json({ error: 'กรุณาระบุ user_name' });

        // db.js's query() only returns real row arrays for SELECT — an UPDATE ...
        // RETURNING collapses to a { rowCount, insertId, ... } summary object, not
        // the actual rows — so the pending rows have to be read first and marked
        // delivered as a second query.
        const [pending] = await db.query(
            `SELECT id, attacker_name, target_name, effect_type, item_name, amount, created_at
             FROM arcade_effects WHERE room_id = ? AND target_name = ? AND delivered = 0
             ORDER BY created_at ASC`,
            [roomId, userName]
        );

        if (pending && pending.length > 0) {
            const ids = pending.map(p => p.id);
            const placeholders = ids.map(() => '?').join(',');
            await db.query(`UPDATE arcade_effects SET delivered = 1 WHERE id IN (${placeholders})`, ids);
        }

        res.json({ success: true, effects: pending || [] });
    } catch (err) {
        console.error('❌ GET /api/arcade/rooms/:id/effects error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// The old POST /rooms/:id/judge-round is gone. It existed so the browser could
// fetch a quality score and fold it into a round score it computed itself;
// finalizeArcadePhase() does both now. Left in place it would have been an
// unauthenticated endpoint that runs a paid AI call on any code posted to it,
// with nothing in the product still calling it.

// ==========================================
// Stale-connection sweep: a real player who closes the tab, loses network,
// or crashes never calls /leave, so their row would otherwise sit in the
// room forever. GET /api/arcade/rooms/:id doubles as a ~2s heartbeat (see
// above), so anyone who hasn't been seen in staleParticipantSeconds is
// treated as disconnected. Bots are excluded by name pattern — they're
// simulated client-side and never poll on their own behalf, so they'd
// otherwise always look stale. Runs every 20s.
//
// The window used to be a hardcoded 45s, which was below what a browser
// actually guarantees: Chrome throttles timers in a backgrounded tab to
// roughly one wake per minute, so a player who simply switched tabs during a
// round stopped heartbeating and got swept out of their own match (observed
// live on 2026-08-17 — a match was deleted mid-round this way). The value now
// comes from shared/arcadeConfig.json so client and server agree on it.
async function sweepStaleArcadeParticipants() {
    try {
        const [stale] = await db.query(
            `SELECT room_id, user_name FROM arcade_participants
             WHERE last_seen < CURRENT_TIMESTAMP - (? || ' seconds')::interval
               AND user_name NOT LIKE 'Bot\\_%'`,
            [arcadeConfig.staleParticipantSeconds]
        );
        for (const row of stale || []) {
            await leaveRoom(row.room_id, row.user_name);
        }

        // A room where every remaining participant is a bot has no human left
        // to host or play it out — clean it up instead of leaving it to sit
        // in the room list forever.
        const [botOnlyRooms] = await db.query(`
            SELECT room_id FROM arcade_participants
            GROUP BY room_id
            HAVING COUNT(*) FILTER (WHERE user_name NOT LIKE 'Bot\\_%') = 0
        `);
        for (const row of botOnlyRooms || []) {
            await db.query(`DELETE FROM arcade_rooms WHERE room_id = ?`, [row.room_id]);
        }
    } catch (err) {
        // Rethrown rather than swallowed here: runArcadeSweep() owns the
        // logging and the back-off, and it can only do that if it is told.
        throw err;
    }
}
// Scheduled the same way as the match tick, and for the same two reasons —
// see the comment above runArcadeTick(). Its own failure counter, so a sweep
// problem cannot slow the match clock or vice versa.
const ARCADE_SWEEP_INTERVAL_MS = 20000;
let arcadeSweepFailures = 0;

async function runArcadeSweep() {
    try {
        await sweepStaleArcadeParticipants();
        if (arcadeSweepFailures > 0) {
            console.log(`✅ Arcade stale-room sweep recovered after ${arcadeSweepFailures} failed attempt(s)`);
            arcadeSweepFailures = 0;
        }
    } catch (err) {
        arcadeSweepFailures += 1;
        if ((arcadeSweepFailures & (arcadeSweepFailures - 1)) === 0) {
            console.error(`❌ Arcade stale-room sweep failed (attempt ${arcadeSweepFailures}): ${describeError(err)}`);
        }
    } finally {
        const grown = ARCADE_SWEEP_INTERVAL_MS * 2 ** Math.min(arcadeSweepFailures, 10);
        const delay = arcadeSweepFailures === 0
            ? ARCADE_SWEEP_INTERVAL_MS
            : Math.min(grown, ARCADE_TICK_MAX_BACKOFF_MS);
        const timer = setTimeout(runArcadeSweep, delay);
        if (timer.unref) timer.unref();
    }
}

const arcadeSweepTimer = setTimeout(runArcadeSweep, ARCADE_SWEEP_INTERVAL_MS);
if (arcadeSweepTimer.unref) arcadeSweepTimer.unref();

// Step 5 — round history is no longer bounded by its room's lifetime (the
// cascading FK was dropped so players can review past matches), so it needs an
// explicit bound or it grows without limit. Each player keeps their most
// recent roundHistoryKeepMatchesPerPlayer matches; everything older goes.
// Deliberately per-player rather than a global row cap or a time window, so a
// rarely-playing user doesn't lose their history just because someone else
// played a lot this week.
async function sweepArcadeRoundHistory() {
    try {
        const keep = arcadeConfig.roundHistoryKeepMatchesPerPlayer;
        await db.query(
            `DELETE FROM arcade_round_history
             WHERE id IN (
                 SELECT id FROM (
                     SELECT id, DENSE_RANK() OVER (PARTITION BY user_name ORDER BY room_id DESC) AS match_rank
                     FROM arcade_round_history
                 ) ranked
                 WHERE match_rank > ?
             )`,
            [keep]
        );
    } catch (err) {
        console.error('❌ Arcade round-history retention sweep error:', err.message);
    }
}
// Hourly: this trims history, not live match state, so it has no reason to run
// on the same cadence as the presence sweep above.
setInterval(sweepArcadeRoundHistory, 60 * 60 * 1000);

// ==========================================
// 8. Start Server & Simulation Engine
// ==========================================

// PORT comes from the environment because hosts assign it - most container
// platforms hand the process a port and expect it to listen there. 3001 stays
// as the local-development default so nothing needs a .env to run.
const PORT = Number(process.env.PORT) || 3001;

app.put('/api/admin/users/:id/ban', async (req, res) => {
    try {
        const hours = Math.max(1, Number(req.body?.hours || 24));
        await db.execute(
            'UPDATE users SET is_banned = 1, ban_until = DATE_ADD(NOW(), INTERVAL ? HOUR) WHERE user_id = ?',
            [hours, req.params.id]
        );
        res.json({ message: 'Account banned' });
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.put('/api/admin/users/:id/delete', async (req, res) => {
    try {
        await db.execute(
            'UPDATE users SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [req.params.id]
        );
        res.json({ message: 'Account deleted' });
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.put('/api/admin/users/:id/recover', async (req, res) => {
    try {
        await db.execute(
            'UPDATE users SET is_deleted = 0, deleted_at = NULL, is_banned = 0, ban_until = NULL WHERE user_id = ?',
            [req.params.id]
        );
        res.json({ message: 'Account recovered' });
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.get('/api/dashboard/stats', async (_req, res) => {
    try {
        await ensureUserPresenceSchema();
        const [[totalUsersRow]] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE role != 'admin' AND COALESCE(is_deleted, 0) = 0`
        );
        const [[totalSubmissionsRow]] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM exercise_submissions`
        );
        const [onlineUsers] = await db.execute(
            `SELECT
                u.user_id,
                u.username,
                up.mode,
                up.last_seen
             FROM user_presence up
             JOIN users u ON u.user_id = up.user_id
             WHERE u.role != 'admin'
               AND COALESCE(u.is_deleted, 0) = 0
               AND up.last_seen >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
             ORDER BY up.last_seen DESC`
        );
        const currentModeCounts = onlineUsers.reduce((counts, user) => {
            const mode = ['online', 'competitive', 'arcade', 'story', 'solo'].includes(String(user.mode || '').toLowerCase())
                ? 'online'
                : 'learn';
            counts[mode] = (counts[mode] || 0) + 1;
            return counts;
        }, { learn: 0, online: 0 });

        res.json({
            totalUsers: Number(totalUsersRow?.count || 0),
            activeUsers: onlineUsers.length,
            onlineUsers,
            totalSubmissions: Number(totalSubmissionsRow?.count || 0),
            modes: {
                learn: currentModeCounts.learn,
                online: currentModeCounts.online,
            },
        });
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.get('/api/dashboard/recent-activities', async (_req, res) => {
    try {
        await ensureUserPresenceSchema();
        const [rows] = await db.execute(
            `SELECT *
             FROM (
                SELECT
                    u.user_id,
                    u.username,
                    'presence' AS type,
                    'กำลังใช้งานอยู่' AS title,
                    COALESCE(up.activity_label, 'ใช้งานเว็บไซต์') AS description,
                    up.mode AS mode,
                    up.last_seen AS created_at
                FROM user_presence up
                JOIN users u ON u.user_id = up.user_id
                WHERE up.last_seen >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)
                  AND u.role != 'admin'
                  AND COALESCE(u.is_deleted, 0) = 0

                UNION ALL

                SELECT
                    u.user_id,
                    u.username,
                    'signup' AS type,
                    'สมัครสมาชิกใหม่' AS title,
                    'เข้าร่วม PySim แล้ว' AS description,
                    'account' AS mode,
                    u.created_at AS created_at
                FROM users u
                WHERE u.role != 'admin' AND COALESCE(u.is_deleted, 0) = 0

                UNION ALL

                SELECT
                    u.user_id,
                    u.username,
                    'lesson_complete' AS type,
                    'เรียนจบบทเรียน' AS title,
                    COALESCE(l.title, CONCAT('บทเรียน #', lqa.lesson_id)) AS description,
                    'learn' AS mode,
                    lqa.completed_at AS created_at
                FROM lesson_quiz_attempts lqa
                JOIN users u ON u.user_id = lqa.user_id
                LEFT JOIN lessons l ON l.lesson_id = lqa.lesson_id
                WHERE u.role != 'admin' AND COALESCE(u.is_deleted, 0) = 0

                UNION ALL

                SELECT
                    u.user_id,
                    u.username,
                    'exercise_complete' AS type,
                    'ทำแบบฝึกหัดสำเร็จ' AS title,
                    COALESCE(e.title, CONCAT('แบบฝึกหัด #', es.exercise_id)) AS description,
                    'learn' AS mode,
                    es.submitted_at AS created_at
                FROM exercise_submissions es
                JOIN users u ON u.user_id = es.user_id
                LEFT JOIN exercises e ON e.exercise_id = es.exercise_id
                WHERE es.is_passed = 1
                  AND u.role != 'admin'
                  AND COALESCE(u.is_deleted, 0) = 0

                UNION ALL

                SELECT
                    u.user_id,
                    u.username,
                    'mini_game_complete' AS type,
                    'จบมินิเกม' AS title,
                    COALESCE(mge.title, l.title, CONCAT('มินิเกม #', p.exercise_id)) AS description,
                    'mini-game' AS mode,
                    p.updated_at AS created_at
                FROM mini_game_user_exercise_progress p
                JOIN users u ON u.user_id = p.user_id
                LEFT JOIN mini_game_exercises mge ON mge.exercise_id = p.exercise_id
                LEFT JOIN lessons l ON l.lesson_id = mge.lesson_id
                WHERE p.is_completed = 1
                  AND u.role != 'admin'
                  AND COALESCE(u.is_deleted, 0) = 0

                UNION ALL

                SELECT
                    u.user_id,
                    u.username,
                    'active_task' AS type,
                    'กำลังทำโจทย์ AI' AS title,
                    lat.title AS description,
                    lat.mode AS mode,
                    lat.updated_at AS created_at
                FROM learning_ai_tasks lat
                JOIN users u ON u.user_id = lat.user_id
                WHERE lat.status = 'ACTIVE'
                  AND u.role != 'admin'
                  AND COALESCE(u.is_deleted, 0) = 0

                UNION ALL

                SELECT
                    u.user_id,
                    u.username,
                    'online_room' AS type,
                    'เข้าห้องออนไลน์' AS title,
                    COALESCE(gr.room_name, CONCAT('ห้อง #', rp.room_id)) AS description,
                    'online' AS mode,
                    rp.joined_at AS created_at
                FROM room_participants rp
                JOIN users u ON u.user_id = rp.user_id
                LEFT JOIN game_rooms gr ON gr.room_id = rp.room_id
                WHERE u.role != 'admin'
                  AND COALESCE(u.is_deleted, 0) = 0

                UNION ALL

                SELECT
                    u.user_id,
                    u.username,
                    'arcade' AS type,
                    'เล่น Arcade Battle Royale' AS title,
                    CONCAT('รอบที่ ', h.round_num, ' — ได้ ', h.pass_count, '/', h.total_count, ' เทสต์') AS description,
                    'arcade' AS mode,
                    h.created_at AS created_at
                FROM arcade_round_history h
                JOIN users u ON u.username = h.user_name
                WHERE u.role != 'admin'
                  AND COALESCE(u.is_deleted, 0) = 0
             ) activities
             WHERE created_at IS NOT NULL
             ORDER BY created_at DESC
             LIMIT 12`
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.get('/api/user-stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.execute(
            'SELECT user_id, username, level, xp, virtual_currency FROM users WHERE user_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'ไม่พบผู้ใช้ในระบบ' });
        }

        res.json(rows[0]);
    } catch (error) {
        logRouteError('GET /api/user-stats', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

app.get('/api/exercises/:lessonId', async (req, res) => {
    try {
        await ensureLessonExercisesSeeded();
        const { lessonId } = req.params;
        await ensureLessonExerciseExists(lessonId);
        if (lessonId === 'list' || lessonId === 'progress') {
            return res.status(404).json({ error: 'not found' });
        }

        const [rows] = await db.execute(
            `SELECT exercise_id, lesson_id, title, description, title_en, description_en, starter_code, test_cases, xp_reward, currency_reward
             FROM exercises
             WHERE lesson_id = ?
             ORDER BY exercise_id ASC
             LIMIT 1`,
            [lessonId]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: 'ไม่พบแบบฝึกหัดสำหรับบทเรียนนี้' });
        }

        const exercise = rows[0];
        res.json({
            success: true,
            exercise: {
                exercise_id: exercise.exercise_id,
                title: exercise.title,
                description: exercise.description,
                // English half of the same problem; the client falls back to the
                // Thai field when a problem has not been translated yet.
                title_en: exercise.title_en,
                description_en: exercise.description_en,
                initial_code: exercise.starter_code,
                starter_code: exercise.starter_code,
                test_cases: exercise.test_cases ?? [],
                xp_reward: exercise.xp_reward,
                currency_reward: exercise.currency_reward,
            },
        });
    } catch (err) {
        logRouteError('❌ Exercise fallback error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.get('/api/exercises/list/:lessonId', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT e.* FROM exercises e WHERE e.lesson_id = ? ORDER BY e.exercise_id ASC`,
            [req.params.lessonId]
        );

        const [files] = await db.execute(
            `SELECT ef.* FROM exercises_files ef 
             JOIN exercises e ON ef.exercise_id = e.exercise_id 
             WHERE e.lesson_id = ?`,
            [req.params.lessonId]
        );

        const result = rows.map(exercise => ({
            ...exercise,
            // รวมโครงสร้างไฟล์ให้มีทั้งชื่อและเนื้อหา
            files: [
                { name: "main.py", content: exercise.starter_code || "" },
                ...files
                    .filter(f => f.exercise_id === exercise.exercise_id)
                    .map(f => ({ name: f.file_name, content: f.file_content || "" }))
            ]
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Error loading exercises" });
    }
});

app.get('/api/exercises/progress/:lessonId/:userId', async (req, res) => {
    try {
        await ensureLessonExercisesSeeded();
        await ensureLessonExerciseExists(req.params.lessonId);
        const { lessonId, userId } = req.params;
        const [rows] = await db.execute(
            `SELECT es.exercise_id,
                    es.is_passed,
                    COALESCE(es.submitted_code, '') AS latest_submitted_code
             FROM exercise_submissions es
             JOIN exercises e ON es.exercise_id = e.exercise_id
             WHERE e.lesson_id = ? AND es.user_id = ?`,
            [lessonId, userId]
        );
        res.json(rows);
    } catch (err) {
        try {
            const { lessonId, userId } = req.params;
            const [rows] = await db.execute(
                `SELECT es.exercise_id,
                        es.is_passed,
                        '' AS latest_submitted_code
                 FROM exercise_submissions es
                 JOIN exercises e ON es.exercise_id = e.exercise_id
                 WHERE e.lesson_id = ? AND es.user_id = ?`,
                [lessonId, userId]
            );
            res.json(rows);
        } catch (_) {
            res.json([]);
        }
    }
});

app.post('/api/exercises/:exerciseId/submit', async (req, res) => {
    const { exerciseId } = req.params;
    const { user_id, submitted_code } = req.body || {};

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    try {
        await ensureLessonExercisesSeeded();
        const [exerciseLessonRows] = await db.execute(
            'SELECT lesson_id FROM exercises WHERE exercise_id = ?',
            [exerciseId]
        );
        if (exerciseLessonRows.length > 0) {
            await ensureLessonExerciseExists(exerciseLessonRows[0].lesson_id);
        }
        const [exerciseRows] = await db.execute(
            'SELECT xp_reward, currency_reward FROM exercises WHERE exercise_id = ?',
            [exerciseId]
        );

        if (exerciseRows.length === 0) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // Run the submitted code before paying for it. This endpoint used to set
        // is_passed = true for every request without looking at the code at all.
        const [problemRows] = await db.execute(
            `SELECT p.problem_id, p.test_kind, p.test_cases, p.solution_code, p.starter_code, p.is_auto_gradable
               FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
              WHERE m.mode = 'lesson' AND m.entry_id = ?`,
            [exerciseId]
        );
        const verdict = await judgeLearnerSubmission({
            problem: problemRows[0],
            code: submitted_code,
        });
        if (!verdict.accepted) {
            return res.status(400).json({
                error: 'ยังผ่านไม่ครบทุกเทสเคส',
                detail: verdict.reason,
                passed: verdict.passedCount ?? 0,
                total: verdict.totalCount ?? 0,
                results: verdict.results || [],
            });
        }

        const rewardXp = Number(exerciseRows[0].xp_reward || 50);
        const rewardCoins = Number(exerciseRows[0].currency_reward || 10);

        if (isGuestUserId(user_id)) {
            return res.json({
                success: true,
                xp_reward: 0,
                currency_reward: 0,
                alreadyPassed: false,
                user: buildGuestUserSnapshot({ userId: user_id }),
            });
        }

        let alreadyPassed = false;
        let existingSubmissionId = null;
        try {
            const [existing] = await db.execute(
                `SELECT submission_id, is_passed
                 FROM exercise_submissions
                 WHERE user_id = ? AND exercise_id = ?
                 ORDER BY submission_id DESC
                 LIMIT 1`,
                [user_id, exerciseId]
            );
            alreadyPassed = Boolean(existing[0]?.is_passed);
            existingSubmissionId = existing[0]?.submission_id || null;
        } catch (_) {
            alreadyPassed = false;
        }

        try {
            if (existingSubmissionId) {
                await db.execute(
                    `UPDATE exercise_submissions
                     SET submitted_code = ?, is_passed = 1, submitted_at = CURRENT_TIMESTAMP
                     WHERE submission_id = ?`,
                    [submitted_code || '', existingSubmissionId]
                );
            } else {
                await db.execute(
                    `INSERT INTO exercise_submissions (user_id, exercise_id, submitted_code, is_passed, score)
                     VALUES (?, ?, ?, 1, 100)`,
                    [user_id, exerciseId, submitted_code || '']
                );
            }
        } catch (innerError) {
            return res.status(500).json({ error: describeError(innerError) });
        }

        if (alreadyPassed) {
            const [userRows] = await db.execute(
                'SELECT user_id, username, level, xp, virtual_currency FROM users WHERE user_id = ? LIMIT 1',
                [user_id]
            );
            return res.json({
                success: true,
                alreadyPassed: true,
                xp_reward: 0,
                currency_reward: 0,
                user: userRows[0] || null,
            });
        }

        const updatedUser = await applyXpRewardToUser(db, user_id, rewardXp, rewardCoins);

        // Anything that can move an achievement metric checks afterwards.
        const newAchievements = await evaluateAchievements(user_id);

        res.json({
            success: true,
            new_achievements: newAchievements,
            xp_reward: rewardXp,
            currency_reward: rewardCoins,
            user: updatedUser,
        });
    } catch (err) {
        logRouteError('❌ Exercise submit error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.get('/api/lessons/:lessonId/exercise', async (req, res) => {
    try {
        await ensureLessonExercisesSeeded();
        await ensureLessonExerciseExists(req.params.lessonId);
        const [rows] = await db.execute(
            `SELECT exercise_id, lesson_id, title, description, title_en, description_en, starter_code, test_cases, xp_reward, currency_reward
             FROM exercises
             WHERE lesson_id = ?
             LIMIT 1`,
            [req.params.lessonId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบแบบฝึกหัดสำหรับบทเรียนนี้' });
        }

        res.json(rows[0]);
    } catch (err) {
        logRouteError('❌ Lesson exercise error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.post('/api/lessons/:lessonId/quiz-results', async (req, res) => {
    try {
        await ensureLessonQuizAttemptSchema();
        const lessonId = Number(req.params.lessonId);
        const userId = Number(req.body?.user_id);
        const quizType = String(req.body?.quiz_type || '').trim().toLowerCase();
        const score = Number(req.body?.score || 0);
        const totalQuestions = Number(req.body?.total_questions || 0);
        const answersJson = JSON.stringify(req.body?.answers || {});

        if (!lessonId || !userId || !['pre', 'post'].includes(quizType)) {
            return res.status(400).json({ error: 'Invalid quiz result payload' });
        }

        await db.execute(
            `INSERT INTO lesson_quiz_attempts (
                user_id, lesson_id, quiz_type, score, total_questions, answers_json
             ) VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT (user_id, lesson_id, quiz_type) DO UPDATE SET
                score = EXCLUDED.score,
                total_questions = EXCLUDED.total_questions,
                answers_json = EXCLUDED.answers_json,
                completed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP`,
            [userId, lessonId, quizType, score, totalQuestions, answersJson]
        );

        // Anything that can move an achievement metric checks afterwards.
        const newAchievements = await evaluateAchievements(userId);

        res.json({
            success: true,
            new_achievements: newAchievements,
            lesson_id: lessonId,
            user_id: userId,
            quiz_type: quizType,
            score,
            total_questions: totalQuestions,
        });
    } catch (err) {
        res.status(500).json({ error: describeError(err) });
    }
});

app.get('/api/lessons/:lessonId/quiz-results/:userId', async (req, res) => {
    try {
        await ensureLessonQuizAttemptSchema();
        const { lessonId, userId } = req.params;
        const [rows] = await db.execute(
            `SELECT quiz_type, score, total_questions, answers_json, completed_at, updated_at
             FROM lesson_quiz_attempts
             WHERE lesson_id = ? AND user_id = ?
             ORDER BY quiz_type`,
            [lessonId, userId]
        );
        const normalized = rows.map((row) => ({
            quiz_type: row.quiz_type,
            score: Number(row.score || 0),
            total_questions: Number(row.total_questions || 0),
            answers: (() => {
                if (!row.answers_json) return {};
                try {
                    return JSON.parse(row.answers_json);
                } catch (_) {
                    return {};
                }
            })(),
            completed_at: row.completed_at,
            updated_at: row.updated_at,
        }));
        res.json(normalized);
    } catch (err) {
        res.status(500).json({ error: describeError(err) });
    }
});

app.get('/api/mini-game/modules', async (_req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT l.lesson_id AS module_id,
                    l.lesson_id,
                    l.title,
                    NULL AS description,
                    l.order_index AS order_index,
                    1 AS is_active
             FROM lessons l
             JOIN mini_game_exercises e ON e.lesson_id = l.lesson_id AND e.is_active = 1
             GROUP BY l.lesson_id, l.title, l.order_index
             ORDER BY l.order_index ASC, l.lesson_id ASC`
        );
        res.json(rows);
    } catch (err) {
        logRouteError('MiNi Game lessons list error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.get('/api/mini-game/modules/:moduleId', async (req, res) => {
    try {
        const lessonId = Number(req.params.moduleId);
        if (!lessonId) {
            return res.status(400).json({ error: 'Invalid lessonId' });
        }

        const [miniGameRows] = await db.execute(
            `SELECT exercise_id
             FROM mini_game_exercises
             WHERE lesson_id = ? AND is_active = 1
             LIMIT 1`,
            [lessonId]
        );
        if (miniGameRows.length === 0) {
            return res.status(404).json({ error: 'MiNi Game lesson not found' });
        }

        // ถ้ามีข้อมูลใน cache และยังไม่หมดอายุ (2 วินาที) ให้คืนทันที
        const cached = _miniGameModuleCache.get(lessonId);
        if (cached && Date.now() - cached.ts < 2000) {
            return res.json(cached.data);
        }

        const [lessonRows] = await db.execute(
            `SELECT lesson_id,
                    title,
                    NULL AS description,
                    order_index AS sort_order,
                    1 AS is_active
             FROM lessons
             WHERE lesson_id = ?
             LIMIT 1`,
            [lessonId]
        );

        if (lessonRows.length === 0) {
            return res.status(404).json({ error: 'MiNi Game lesson not found' });
        }

        // หมายเหตุ: ตาราง mini_game_exercises ไม่มีคอลัมน์ required_syntax_json,
        // required_vars_json, success_message, scene_background_image จริง ๆ
        // (เช็คจาก schema แล้ว) ค่าด้านล่างจึงเป็นค่า default ที่ derive จากข้อมูลจริง
        // (title) เท่าที่ทำได้ ถ้าต้องการให้แก้ไขค่าพวกนี้ผ่าน phpMyAdmin ได้
        // ต้อง ALTER TABLE เพิ่มคอลัมน์เหล่านี้ก่อน แล้วเปลี่ยนมาดึงจากคอลัมน์จริงแทน
        const [exerciseRows] = await db.execute(
            `SELECT exercise_id AS mini_game_module_id,
                    exercise_id,
                    lesson_id AS module_id,
                    lesson_id,
                    title,
                    title_en,
                    exercise_order AS order_index,
                    xp_reward AS reward_xp,
                    currency_reward AS reward_coins,
                    description AS hint,
                    description_en AS hint_en,
                    starter_code,
                    CASE
                        WHEN LOWER(title) LIKE '%comment%' OR title LIKE '%คอมเมน%'
                        THEN JSON_ARRAY('#', 'print')
                        ELSE JSON_ARRAY('print')
                    END AS required_syntax_json,
                    JSON_ARRAY() AS required_vars_json,
                    test_cases_json,
                    'แบบฝึกหัดผ่านแล้ว' AS success_message,
                    '/data_MiNiGame/locations/classroom.jpg' AS scene_background_image,
                    1 AS is_active
             FROM mini_game_exercises
             WHERE lesson_id = ?
             ORDER BY CAST(exercise_order AS UNSIGNED) ASC, exercise_order ASC, exercise_id ASC
             LIMIT 3`,
            [lessonId]
        );

        if (exerciseRows.length === 0) {
            return res.status(404).json({ error: 'No mini game exercises found for this lesson' });
        }

        // exercise_id ของด่านทั้งหมดในบทเรียนนี้ ใช้กรอง dialogue/ไฟล์เสริมต่อ
        const targetExerciseIds = exerciseRows.map((row) => row.exercise_id);
        const placeholder = targetExerciseIds.length > 0 ? targetExerciseIds.map(() => '?').join(',') : 'NULL';
        const queryValues = targetExerciseIds.length > 0 ? targetExerciseIds : [];

        const [dialogueRows] = await db.execute(
            `SELECT d.dialogue_id,
                    d.exercise_id AS mini_game_module_id,
                    d.exercise_id,
                    d.dialogue_order AS step_index,
                    COALESCE(n.npc_key, 'system') AS speaker,
                    d.dialogue_text,
                    d.npc_emotion AS emotion,
                    COALESCE(d.dialogue_phase, 'pre_submit') AS dialogue_phase,
                    COALESCE(d.branch_key, 'default') AS branch_key,
                    n.avatar_asset_url,
                    l.bg_image_url,
                    l.location_key,
                    l.name AS location_name
             FROM mini_game_dialogues d
             LEFT JOIN mini_game_npcs n ON n.npc_id = d.npc_id
             LEFT JOIN mini_game_locations l ON l.location_id = d.location_id
             WHERE d.exercise_id IN (${placeholder})
             ORDER BY d.exercise_id ASC, d.dialogue_order ASC, d.dialogue_id ASC`,
            queryValues
        );

        // ดึง end dialogues (exercise_id = NULL, exercise_order = 'end') แยก
        // เพราะ WHERE exercise_id IN (...) กรองออกไปหมด
        const [endDialogueRows] = await db.execute(
            `SELECT d.dialogue_id,
                    d.exercise_id,
                    d.exercise_order,
                    d.dialogue_order AS step_index,
                    COALESCE(n.npc_key, 'system') AS speaker,
                    d.dialogue_text,
                    d.npc_emotion AS emotion,
                    COALESCE(d.dialogue_phase, 'pre_submit') AS dialogue_phase,
                    COALESCE(d.branch_key, 'default') AS branch_key,
                    n.avatar_asset_url,
                    l.bg_image_url,
                    l.location_key,
                    l.name AS location_name
             FROM mini_game_dialogues d
             LEFT JOIN mini_game_npcs n ON n.npc_id = d.npc_id
             LEFT JOIN mini_game_locations l ON l.location_id = d.location_id
             WHERE d.lesson_id = ?
               AND d.exercise_id IS NULL
               AND d.exercise_order = 'end'
             ORDER BY d.dialogue_order ASC, d.dialogue_id ASC`,
            [lessonId]
        );

        // ดึงไฟล์เสริมของแต่ละด่าน (data.txt, math_util.py, ฯลฯ) เพื่อให้ MiNi_Game.jsx
        // ดึงไฟล์มาแสดงเป็นแท็บได้เหมือนกับ ExercisePage.jsx
        let miniGameFileRows = [];
        if (targetExerciseIds.length > 0) {
            const [fileRows] = await db.execute(
                `SELECT file_id, exercise_id, file_name, file_content
                 FROM mini_game_exercises_files
                 WHERE exercise_id IN (${placeholder})`,
                queryValues
            );
            miniGameFileRows = fileRows;
        }

        // มินิเกมยังไม่มีระบบตัวเลือกบทสนทนา (dialogue choices) ในสคีมาปัจจุบัน
        // เก็บไว้เป็น array ว่างเผื่ออนาคตมีตาราง mini_game_dialogue_choices
        const choiceRows = [];

        // 1. จัดกลุ่มบทสนทนาตาม exercise_id ไว้ล่วงหน้า (สแกนรอบเดียวจบ)
        const dialogueMap = new Map();
        dialogueRows.forEach((d) => {
            if (!dialogueMap.has(d.exercise_id)) dialogueMap.set(d.exercise_id, []);
            dialogueMap.get(d.exercise_id).push(d);
        });

        // 2. จัดกลุ่มตัวเลือกตาม dialogue_id ไว้ล่วงหน้า (สแกนรอบเดียวจบ)
        const choiceMap = new Map();
        choiceRows.forEach((c) => {
            if (!choiceMap.has(c.dialogue_id)) choiceMap.set(c.dialogue_id, []);
            choiceMap.get(c.dialogue_id).push(c);
        });

        // 3. ประกอบร่างข้อมูลรอบเดียวเสร็จ ไม่ต้องลูปกรองซ้ำซ้อน
        const subtopics = exerciseRows.map((row) => {
            const currentDialogues = dialogueMap.get(row.exercise_id) || [];
            const allChoicesForExercise = [];

            const dialogues = currentDialogues.map((dialogue) => {
                const choices = choiceMap.get(dialogue.dialogue_id) || [];
                allChoicesForExercise.push(...choices);
                return {
                    ...dialogue,
                    choices
                };
            });

            const extraFiles = miniGameFileRows
                .filter((f) => f.exercise_id === row.exercise_id)
                .map((f) => ({ name: f.file_name, content: f.file_content || "" }));

            return {
                ...row,
                dialogues,
                dialogue_choices: allChoicesForExercise,
                dialogue_branches: [],
                terminal_logic: [],
                // โครงสร้างไฟล์ของด่านนี้ (main.py + ไฟล์เสริม) เหมือนกับ /api/exercises/list/:lessonId
                files: [
                    { name: "main.py", content: row.starter_code || "" },
                    ...extraFiles,
                ],
            };
        });

        const rewardXp = subtopics.reduce((total, row) => total + Number(row.reward_xp || 0), 0);
        const rewardCoins = subtopics.reduce((total, row) => total + Number(row.reward_coins || 0), 0);
        const first = subtopics[0];

        const result = {
            ...first,
            module_id: lessonId,
            lesson_id: lessonId,
            title: lessonRows[0].title,
            description: lessonRows[0].description,
            reward_xp: rewardXp,
            reward_coins: rewardCoins,
            scene_background_image: first.scene_background_image,
            subtopics,
            // dialogues ของ exercise_order = 'end' (exercise_id = NULL)
            end_dialogues: endDialogueRows,
        };
        _miniGameModuleCache.set(lessonId, { data: result, ts: Date.now() });
        res.json(result);
    } catch (err) {
        console.error('❌ MiNi Game lesson detail error:', err?.message);
        console.error(err?.stack);
        logRouteError('MiNi Game lesson detail error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.post('/api/mini-game/modules/:moduleId/progress', async (req, res) => {
    const lessonId = Number(req.params.moduleId);
    const {
        mini_game_module_id,
        user_id,
        submitted_code = '',
        is_completed = false,
        score = 0,
        selected_branch_key = 'default',
        last_terminal_reply = null,
    } = req.body || {};

    if (!lessonId || !mini_game_module_id || !user_id) {
        return res.status(400).json({ error: 'lessonId, exercise id and user_id are required' });
    }

    try {
        const [exerciseRows] = await db.execute(
            `SELECT exercise_id, lesson_id, xp_reward, currency_reward
             FROM mini_game_exercises
             WHERE lesson_id = ? AND exercise_id = ?
             LIMIT 1`,
            [lessonId, mini_game_module_id]
        );

        if (exerciseRows.length === 0) {
            return res.status(404).json({ error: 'MiNi Game exercise not found' });
        }

        const exercise = exerciseRows[0];

        if (isGuestUserId(user_id)) {
            return res.json({
                success: true,
                user: buildGuestUserSnapshot({ userId: user_id }),
                xp_reward: 0,
                currency_reward: 0,
                alreadyCompleted: false,
                is_module_completed: Boolean(is_completed),
            });
        }

        const [existingProgressRows] = await db.execute(
            `SELECT progress_id, xp_reward, currency_reward
             FROM mini_game_user_exercise_progress
             WHERE user_id = ? AND exercise_id = ?
             LIMIT 1`,
            [user_id, exercise.exercise_id]
        );
        const existingProgress = existingProgressRows[0] || null;
        const shouldGrantReward = Boolean(is_completed) && !existingProgress;

        const [submissionResult] = await db.execute(
            `INSERT INTO mini_game_exercise_submissions (
                user_id, exercise_id, submitted_code
             ) VALUES (?, ?, ?)
             ON CONFLICT (user_id, exercise_id) DO UPDATE SET
                submitted_code = EXCLUDED.submitted_code,
                submitted_at = CURRENT_TIMESTAMP`,
            [
                user_id,
                exercise.exercise_id,
                submitted_code,
            ]
        );

        await db.execute(
            `INSERT INTO mini_game_user_exercise_progress (
                user_id, exercise_id, is_completed, xp_reward, currency_reward, selected_branch_key
             ) VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT (user_id, exercise_id) DO UPDATE SET
                is_completed = GREATEST(mini_game_user_exercise_progress.is_completed, EXCLUDED.is_completed),
                xp_reward = GREATEST(mini_game_user_exercise_progress.xp_reward, EXCLUDED.xp_reward),
                currency_reward = GREATEST(mini_game_user_exercise_progress.currency_reward, EXCLUDED.currency_reward),
                selected_branch_key = EXCLUDED.selected_branch_key,
                updated_at = CURRENT_TIMESTAMP`,
            [
                user_id,
                exercise.exercise_id,
                Boolean(is_completed),
                shouldGrantReward ? Number(exercise.xp_reward || 0) : 0,
                shouldGrantReward ? Number(exercise.currency_reward || 0) : 0,
                selected_branch_key || 'default',
            ]
        );

        let xpReward = 0;
        let coinReward = 0;
        let updatedUser = null;
        if (shouldGrantReward) {
            xpReward = Number(exercise.xp_reward || 0);
            coinReward = Number(exercise.currency_reward || 0);
            updatedUser = await applyXpRewardToUser(db, user_id, xpReward, coinReward);
        }

        // Anything that can move an achievement metric checks afterwards.
        const newAchievements = await evaluateAchievements(user_id);

        res.json({
            success: true,
            new_achievements: newAchievements,
            alreadyCompleted: Boolean(existingProgress),
            is_module_completed: Boolean(is_completed),
            xp_reward: xpReward,
            currency_reward: coinReward,
            user: updatedUser || null,
        });
    } catch (err) {
        logRouteError('MiNi Game exercise progress upsert error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.get('/api/mini-game/modules/:moduleId/progress/:userId', async (req, res) => {
    try {
        const lessonId = Number(req.params.moduleId);
        const userId = req.params.userId;
        if (!lessonId || !userId) {
            return res.status(400).json({ error: 'Invalid progress lookup' });
        }

        if (isGuestUserId(userId)) {
            return res.json([]);
        }

const [rows] = await db.execute(
            `SELECT p.progress_id,
       p.user_id,
       p.exercise_id,
       p.exercise_id AS mini_game_module_id,
       e.lesson_id,
       s.submitted_code,
       0 AS score,
       s.submitted_code AS last_terminal_input,
       '' AS last_terminal_reply,
       COALESCE(p.selected_branch_key, '') AS selected_branch_key,
       '' AS last_output,
       NULL AS choice_history_json,
       NULL AS ending_key,
       NULL AS completed_at,
       p.updated_at
             FROM mini_game_user_exercise_progress p
             JOIN mini_game_exercises e ON e.exercise_id = p.exercise_id
             LEFT JOIN mini_game_exercise_submissions s ON s.user_id = p.user_id AND s.exercise_id = p.exercise_id
             WHERE e.lesson_id = ?
               AND p.user_id = ?
             ORDER BY e.exercise_id ASC`,
            [lessonId, userId]
        );

        res.json(rows);
    } catch (err) {
        logRouteError('MiNi Game exercise progress error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.post('/api/presence', async (req, res) => {
    try {
        const { userId, mode = 'learn', activityLabel = 'ใช้งานเว็บไซต์', currentPath = '/' } = req.body || {};
        const numericUserId = Number(userId);

        if (!numericUserId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        await ensureUserPresenceSchema();
        await db.execute(
            `INSERT INTO user_presence (user_id, mode, activity_label, current_path, last_seen)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id) DO UPDATE SET
                mode = EXCLUDED.mode,
                activity_label = EXCLUDED.activity_label,
                current_path = EXCLUDED.current_path,
                last_seen = CURRENT_TIMESTAMP`,
            [
                numericUserId,
                String(mode).slice(0, 40),
                String(activityLabel).slice(0, 120),
                String(currentPath).slice(0, 255),
            ]
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.post('/api/upload', (req, res) => {
    upload.single('file')(req, res, (error) => {
        if (error) {
            return res.status(400).json({ error: describeError(error) });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Relative on purpose. This string is stored in the database and
        // rendered months later, possibly from a different host than the one
        // that took the upload - an absolute URL baked in here is a picture
        // that 404s for every user the day the domain changes.
        const url = `/uploads/${req.file.filename}`;
        return res.json({ url });
    });
});

// Tables that the merged Person 2 routes rely on. Their branch created these
// lazily on the first request that happened to need them, which left the schema
// depending on which endpoint a user hit first; here they are part of starting
// up, alongside db.js's own initialisation, so the database is complete before
// the first request arrives.
const ensureMergedSchemas = async () => {
    for (const [label, ensure] of [
        ['competitive arena', ensureCompetitiveArenaSchema],
        ['learning progress', ensureLearningProgressSchema],
        ['learning AI tasks', ensureLearningAiTaskSchema],
        ['lesson quiz attempts', ensureLessonQuizAttemptSchema],
        ['password reset', ensurePasswordResetSchema],
    ]) {
        try {
            await ensure();
        } catch (error) {
            // Never fatal: a missing optional table should not stop the server
            // from serving everything else.
            console.error(`\u26a0\ufe0f Failed to ensure ${label} schema:`, describeError(error));
        }
    }
};

// Which problems can be graded automatically depends on what is installed HERE,
// not on what was installed wherever the seed data was produced.
//
// problems.is_auto_gradable is computed by running every reference solution and
// seeing which ones pass their own tests. The value that ships in
// seed-content.sql was computed on a development machine without flask,
// requests or pytest, so 26 problems arrive marked ungradable. On a machine
// that has them - which the container does, by construction - only 15 really
// are, and the other 11 would otherwise stay on the honour system forever for
// no reason but a missing import at dump time.
//
// Runs once, on the boot that installed the database, and in the background:
// it executes 192 Python programs and takes a minute or two, which is not
// something to make the first visitor wait for.
const recomputeGradabilityAfterInstall = () => {
    if (!db.freshInstall) return;

    console.log('🧪 ติดตั้งใหม่ — กำลังตรวจว่าโจทย์ข้อไหนตรวจอัตโนมัติได้บ้างบนเครื่องนี้ (ทำงานเบื้องหลัง)');
    const child = require('child_process').spawn(
        process.execPath,
        [path.join(__dirname, 'scripts', 'mark-auto-gradable.js'), '--apply'],
        { cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    let tail = '';
    child.stdout.on('data', (d) => { tail = String(d); });
    child.on('error', (err) => console.warn('⚠️ ตรวจความสามารถในการตรวจโจทย์ไม่สำเร็จ:', describeError(err)));
    child.on('close', (code) => {
        if (code === 0) console.log('✅ ปรับสถานะการตรวจอัตโนมัติของคลังโจทย์เรียบร้อย\n' + tail.trim());
        else console.warn(`⚠️ ตรวจความสามารถในการตรวจโจทย์จบด้วยรหัส ${code} — โจทย์บางข้ออาจถูกข้ามการตรวจ`);
    });
};

// Serve the built front end from the API server itself.
//
// This is what makes the whole thing ONE deployable unit: one process, one
// origin, one port. It also removes cross-origin requests entirely - the page
// and the API it calls are the same site, so there is no CORS configuration to
// get wrong on a domain nobody has bought yet.
//
// Skipped silently when the build is absent: during development Vite serves the
// front end on :5174 and proxies here, and there is no dist/ to serve.
const clientDist = process.env.CLIENT_DIST
    ? path.resolve(process.env.CLIENT_DIST)
    : path.join(__dirname, '..', 'client', 'dist');

if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist));

    // Single-page app fallback. React Router owns every path that is not an API
    // route or a real file, so a hard reload on /leaderboard has to be answered
    // with index.html rather than a 404 - reloading a deep link is not an edge
    // case, it is how people use bookmarks.
    app.get(/^(?!\/api\/|\/uploads\/).*/, (req, res, next) => {
        if (req.method !== 'GET') return next();
        return res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log(`\u2705 เสิร์ฟหน้าเว็บที่ build แล้วจาก ${clientDist}`);
} else {
    console.log('\u2139\uFE0F  ไม่พบไฟล์หน้าเว็บที่ build แล้ว — โหมดพัฒนาใช้ Vite เสิร์ฟที่ :5174 แทน');
}

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // db.js creates and seeds its own tables on import. On an established
    // database both that and ensureMergedSchemas() below are no-ops and the
    // order never mattered; on an empty one they raced, and whichever lost
    // aborted the rest of its own setup with "already exists".
    await db.ready;
    await ensureMergedSchemas();
    recomputeGradabilityAfterInstall();
    console.log('\u2705 ตารางของ Competitive Arena, Dashboard และการรีเซ็ตรหัสผ่าน พร้อมใช้งานแล้ว');
});
