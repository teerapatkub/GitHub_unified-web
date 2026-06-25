require('dotenv').config();
console.log("=====================================");
console.log("🔍 เช็ค NVIDIA API KEY:", process.env.NVIDIA_API_KEY ? "เจอคีย์แล้ว! (" + process.env.NVIDIA_API_KEY.substring(0, 10) + "...)" : "⚠️ ใช้ค่า fallback ใน server.js");
console.log("=====================================");

// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

let multer;
try {
    multer = require('multer');
} catch (error) {
    console.error('Missing dependency: multer. Run "npm install" in the server directory before starting the API.');
    throw error;
}

const app = express();
app.use(cors());
app.use(express.json());
const db = require('./db');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

const NVIDIA_API_KEY = String(process.env.NVIDIA_API_KEY || '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').trim();
const NVIDIA_INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = String(process.env.NVIDIA_MODEL || 'moonshotai/kimi-k2.5').trim();
const AI_MAX_MESSAGE_LENGTH = 2000;
const AI_MAX_CODE_LENGTH = 12000;
const AI_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const AI_RATE_LIMIT_MAX_REQUESTS = 12;
const aiRequestTracker = new Map();

const getClientKey = (req) =>
    String(req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || 'unknown')
        .split(',')[0]
        .trim();

const enforceAiRateLimit = (req, res) => {
    const key = getClientKey(req);
    const now = Date.now();
    const windowStart = now - AI_RATE_LIMIT_WINDOW_MS;
    const timestamps = (aiRequestTracker.get(key) || []).filter((time) => time > windowStart);

    if (timestamps.length >= AI_RATE_LIMIT_MAX_REQUESTS) {
        res.status(429).json({
            error: 'Too many AI requests',
            reply: '✨ ตอนนี้มีการเรียก Lumi ถี่เกินไปนิดนึง รอสักครู่แล้วลองใหม่อีกครั้งนะ~',
        });
        return false;
    }

    timestamps.push(now);
    aiRequestTracker.set(key, timestamps);
    return true;
};

const describeError = (error) => {
    if (!error) {
        return 'Unknown error';
    }

    if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }

    if (typeof error.detail === 'string' && error.detail.trim()) {
        return error.detail;
    }

    if (typeof error.code === 'string' && error.code.trim()) {
        return `Error code ${error.code}`;
    }

    if (typeof error === 'string' && error.trim()) {
        return error;
    }

    try {
        return JSON.stringify(error);
    } catch (_) {
        return String(error);
    }
};

const executeIgnoreSchemaConflict = async (sql, ignoredCodes = []) => {
    try {
        await db.execute(sql);
    } catch (error) {
        const message = String(error?.message || '').toLowerCase();
        const isIgnoredMessage =
            (ignoredCodes.includes('ER_DUP_FIELDNAME') && message.includes('duplicate column name')) ||
            (ignoredCodes.includes('ER_DUP_KEYNAME') && message.includes('duplicate key name'));

        if (!ignoredCodes.includes(error?.code) && !isIgnoredMessage) {
            throw error;
        }
    }
};

const logRouteError = (label, error) => {
    const message = describeError(error);
    console.error(label, message, error?.stack || error);
    return message;
};

const isGuestUserId = (userId) => typeof userId === 'string' && userId.trim().toLowerCase().startsWith('guest_');

const guestSimulationSessions = new Map();

const getGuestSimulationState = (userId, overrides = {}) => {
    const existing = guestSimulationSessions.get(userId) || {};
    const session = {
        save_id: null,
        user_id: userId,
        save_name: 'Guest Session',
        sim_money: 0,
        current_day: 1,
        current_hour: 8.0,
        battery_percent: 100,
        is_plugged_in: 1,
        jobs_completed: 0,
        jobs_failed: 0,
        total_earned: 0,
        total_spent: 0,
        sim_reputation: 10,
        active_events: [],
        active_jobs: [],
        ...existing,
        ...overrides,
    };
    guestSimulationSessions.set(userId, session);
    return session;
};

const buildGuestSimulationState = (userId, overrides = {}) => getGuestSimulationState(userId, overrides);

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
        'SELECT lesson_id, title, description FROM lessons WHERE lesson_id = ? LIMIT 1',
        [numericLessonId]
    );

    if (lessonRows.length === 0) {
        return false;
    }

    const lesson = lessonRows[0];
    const seed = inferExerciseSeedFromLesson(lesson);

    await db.execute(
        `INSERT INTO exercises (
            lesson_id,
            title,
            description,
            starter_code,
            solution_code,
            test_cases,
            xp_reward,
            currency_reward
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            numericLessonId,
            seed.title,
            seed.description,
            seed.starter_code,
            seed.solution_code,
            JSON.stringify(seed.test_cases),
            seed.xp_reward,
            seed.currency_reward,
        ]
    );

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

        await db.execute(
            `INSERT INTO exercises (
                lesson_id,
                title,
                description,
                starter_code,
                solution_code,
                test_cases,
                xp_reward,
                currency_reward
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                exercise.lesson_id,
                exercise.title,
                exercise.description,
                exercise.starter_code,
                exercise.solution_code,
                JSON.stringify(exercise.test_cases),
                exercise.xp_reward,
                exercise.currency_reward,
            ]
        );
    }
};

ensureLessonExercisesSeeded().catch((error) => {
    console.error('Failed to seed lesson exercises:', describeError(error));
});

const createGuestLearningTask = async ({ userId, mode, level }) => {
    const generatedTask = await generateLearningTaskWithAI({ mode, level });
    return {
        taskId: `guest-${mode}-${Date.now()}`,
        userId,
        mode,
        title: generatedTask.title,
        sectionLabel: generatedTask.sectionLabel,
        subtitle: generatedTask.subtitle,
        accent: generatedTask.accent,
        instructions: generatedTask.instructions,
        example: generatedTask.example,
        starterCode: generatedTask.starterCode,
        testCases: generatedTask.testCases,
        rewardXp: generatedTask.rewardXp,
        rewardCoins: generatedTask.rewardCoins,
        rerollsUsed: 0,
        maxRerolls: 999,
        rerollsRemaining: 999,
        status: 'ACTIVE',
        completedAt: null,
    };
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

const FALLBACK_JOB_POOLS = {
    Beginner: [
        {
            title: 'Fix a broken print script',
            reward: 500,
            penalty: 100,
            difficulty: 'Easy',
            clientName: 'Nina Noodle',
            clientRole: 'Cafe Owner',
            story: 'The receipt printer script keeps crashing when the cashier opens the shop.',
            desc: '1. Write a Python script that prints a welcome message and the total price.\n2. Ask the user for item name and price.\n3. Display the result clearly with print().',
        },
        {
            title: 'Student score checker',
            reward: 700,
            penalty: 120,
            difficulty: 'Easy',
            clientName: 'Teacher Toon',
            clientRole: 'Homeroom Teacher',
            story: 'I need a quick script to tell students whether they passed the quiz.',
            desc: '1. Read a score from input().\n2. If score is 50 or more, print Passed.\n3. Otherwise print Failed.',
        },
        {
            title: 'Mini shopping calculator',
            reward: 900,
            penalty: 150,
            difficulty: 'Easy',
            clientName: 'Ploy Pocket',
            clientRole: 'Market Seller',
            story: 'Customers keep asking for the total price of two products and I want it calculated fast.',
            desc: '1. Ask for two prices.\n2. Add them together.\n3. Print the total in a readable format.',
        },
        {
            title: 'Temperature warning tool',
            reward: 850,
            penalty: 150,
            difficulty: 'Easy',
            clientName: 'Sunny Sky',
            clientRole: 'Weather Blogger',
            story: 'I want a tiny script that warns me when the temperature is too hot.',
            desc: '1. Read temperature from input().\n2. If temperature is above 35, print Hot Warning.\n3. Otherwise print Normal Weather.',
        },
    ],
    Intermediate: [
        {
            title: 'CSV sales summary',
            reward: 1500,
            penalty: 300,
            difficulty: 'Medium',
            clientName: 'Data Darn',
            clientRole: 'Store Analyst',
            story: 'I have a list of sales and need a script to summarize the total and average.',
            desc: '1. Create a Python script that reads a list of numbers.\n2. Calculate total sales and average.\n3. Print both values clearly.',
        },
        {
            title: 'API response formatter',
            reward: 1800,
            penalty: 320,
            difficulty: 'Medium',
            clientName: 'Mika Merge',
            clientRole: 'Frontend Developer',
            story: 'Our frontend team needs clean structured data from a messy response.',
            desc: '1. Build a Python function that loops through a list of dictionaries.\n2. Extract only name and status.\n3. Return a new cleaned list.',
        },
        {
            title: 'Attendance tracker',
            reward: 1700,
            penalty: 280,
            difficulty: 'Medium',
            clientName: 'Coach Krit',
            clientRole: 'Bootcamp Mentor',
            story: 'I need to count who attended and who missed class this week.',
            desc: '1. Use lists and loops to count present and absent students.\n2. Print the totals.\n3. Show the names of absent students.',
        },
        {
            title: 'Password validator',
            reward: 1900,
            penalty: 350,
            difficulty: 'Medium',
            clientName: 'Secure Sam',
            clientRole: 'Security Intern',
            story: 'We need a script that checks if a password is strong enough before signup.',
            desc: '1. Read a password string.\n2. Check length and whether it contains uppercase, lowercase, and numbers.\n3. Print Strong or Weak.',
        },
    ],
    Advanced: [
        {
            title: 'Refactor slow report generator',
            reward: 2600,
            penalty: 500,
            difficulty: 'Hard',
            clientName: 'Apex Ops',
            clientRole: 'Operations Lead',
            story: 'Our report script works, but it is painfully slow and hard to maintain.',
            desc: '1. Write a modular Python script using functions.\n2. Process a dataset and generate summary statistics.\n3. Keep the code readable and efficient.',
        },
        {
            title: 'Task scheduler prototype',
            reward: 3000,
            penalty: 550,
            difficulty: 'Hard',
            clientName: 'Nova Labs',
            clientRole: 'Product Engineer',
            story: 'We need a scheduling prototype that prioritizes urgent tasks first.',
            desc: '1. Sort tasks by priority and deadline.\n2. Use dictionaries/lists to model the data.\n3. Print the final execution order.',
        },
        {
            title: 'Log file anomaly detector',
            reward: 2800,
            penalty: 500,
            difficulty: 'Hard',
            clientName: 'Trace Tan',
            clientRole: 'Backend Engineer',
            story: 'The server logs are messy and I need help detecting suspicious entries quickly.',
            desc: '1. Loop through log messages.\n2. Count warning and error patterns.\n3. Print a compact anomaly report.',
        },
        {
            title: 'Inventory sync script',
            reward: 3200,
            penalty: 600,
            difficulty: 'Hard',
            clientName: 'Warehouse Wave',
            clientRole: 'Systems Coordinator',
            story: 'Stock values from two branches must be merged and conflict-checked every night.',
            desc: '1. Merge two inventory datasets.\n2. Detect duplicate product codes with mismatched counts.\n3. Print a reconciliation summary.',
        },
    ],
};

const pickFallbackJobs = (level, count = 3) => {
    const normalizedLevel = normalizePlayerLevel(level);
    const pool = [...(FALLBACK_JOB_POOLS[normalizedLevel] || FALLBACK_JOB_POOLS.Beginner)];
    const picked = [];

    while (pool.length > 0 && picked.length < count) {
        const index = Math.floor(Math.random() * pool.length);
        picked.push(pool.splice(index, 1)[0]);
    }

    while (picked.length < count) {
        picked.push({ ...FALLBACK_JOB_POOLS.Beginner[picked.length % FALLBACK_JOB_POOLS.Beginner.length] });
    }

    return picked;
};

const ensureFallbackJobsAvailable = async (executor, { level = 'Beginner', minimum = 4 } = {}) => {
    const [rows] = await executor.execute(
        "SELECT COUNT(*) AS count FROM contracts WHERE status = 'OFFERED'"
    );
    const availableCount = Number(rows[0]?.count || 0);
    const needed = Math.max(0, minimum - availableCount);

    if (needed === 0) {
        return { created: 0, availableCount };
    }

    const fallbackJobs = pickFallbackJobs(level, needed);
    for (const job of fallbackJobs) {
        const aiRequirements = JSON.stringify({
            clientName: job.clientName,
            clientRole: job.clientRole,
            story: job.story,
            desc: job.desc,
            source: 'fallback',
        });

        await executor.execute(
            'INSERT INTO contracts (title, difficulty, reward, penalty, ai_requirements, status) VALUES (?, ?, ?, ?, ?, ?)',
            [job.title, job.difficulty, job.reward, job.penalty, aiRequirements, 'OFFERED']
        );
    }

    return { created: needed, availableCount: availableCount + needed };
};

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

const ensureSimulationJobTrackingSchema = async () => {
    try {
        await ensureColumnIfMissing('user_contracts', 'accepted_day', '`accepted_day` int(11) DEFAULT NULL');
        await ensureColumnIfMissing('user_contracts', 'carried_days', '`carried_days` int(11) NOT NULL DEFAULT 0');
        await ensureColumnIfMissing('user_contracts', 'status_reason', '`status_reason` varchar(50) DEFAULT NULL');
        await ensureColumnIfMissing('user_contracts', 'completed_day', '`completed_day` int(11) DEFAULT NULL');
        await ensureColumnIfMissing('user_contracts', 'failed_day', '`failed_day` int(11) DEFAULT NULL');
    } catch (error) {
        console.error('⚠️ Failed to ensure simulation job tracking schema:', error.message);
    }
};

const ensureMysqlStyleBooleanColumns = async () => {
    const compatibilityAlters = [
        {
            table: 'simulation_saves',
            column: 'is_active',
        },
        {
            table: 'simulation_saves',
            column: 'is_plugged_in',
        },
        {
            table: 'simulation_active_events',
            column: 'is_resolved',
        },
        {
            table: 'random_events',
            column: 'force_skip_day',
        },
        {
            table: 'random_events',
            column: 'auto_resolve',
        },
        {
            table: 'room_participants',
            column: 'is_ready',
        },
        {
            table: 'music_tracks',
            column: 'is_default',
        },
    ];

    for (const { table, column } of compatibilityAlters) {
        const [rows] = await db.execute(
            `SELECT data_type
             FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = ?
               AND column_name = ?
             LIMIT 1`,
            [table, column]
        );

        const dataType = rows[0]?.data_type;
        if (dataType === 'boolean') {
            await db.execute(`ALTER TABLE "${table}" ALTER COLUMN "${column}" DROP DEFAULT`);
            await db.execute(`
                ALTER TABLE "${table}"
                ALTER COLUMN "${column}" TYPE integer
                USING CASE WHEN "${column}" THEN 1 ELSE 0 END
            `);
            await db.execute(`ALTER TABLE "${table}" ALTER COLUMN "${column}" SET DEFAULT 0`);
            console.log(`✅ Converted ${table}.${column} from boolean to integer compatibility mode`);
        }
    }
};

const ensureAdminSchema = async () => {
    try {
        await ensureColumnIfMissing('users', 'is_deleted', '`is_deleted` tinyint(1) NOT NULL DEFAULT 0');
        await ensureColumnIfMissing('users', 'is_banned', '`is_banned` tinyint(1) NOT NULL DEFAULT 0');
        await ensureColumnIfMissing('users', 'ban_until', '`ban_until` timestamp NULL DEFAULT NULL');
        await ensureColumnIfMissing('users', 'deleted_at', '`deleted_at` timestamp NULL DEFAULT NULL');
        await ensureColumnIfMissing('shop_items', 'item_type', '`item_type` varchar(50) DEFAULT NULL');
        await ensureColumnIfMissing('shop_items', 'asset_url', '`asset_url` text');
        await ensureColumnIfMissing('shop_items', 'preview_image', '`preview_image` text');
        await ensureColumnIfMissing('shop_items', 'effects', '`effects` longtext');
        await ensureColumnIfMissing('shop_items', 'is_active', '`is_active` tinyint(1) NOT NULL DEFAULT 1');
        await db.execute('UPDATE shop_items SET item_type = type WHERE item_type IS NULL AND type IS NOT NULL');
        await db.execute("UPDATE shop_items SET effects = preview_data WHERE (effects IS NULL OR effects = '') AND preview_data IS NOT NULL");
        await db.execute('UPDATE shop_items SET is_active = is_available WHERE is_active IS NULL');
    } catch (error) {
        console.error('⚠️ Failed to ensure admin schema:', error.message);
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

const parseJsonArray = (rawValue) => {
    if (Array.isArray(rawValue)) return rawValue;
    if (typeof rawValue === 'string' && rawValue.trim()) {
        try {
            const parsed = JSON.parse(rawValue);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

// ==========================================
// Admin + Backoffice Helpers
// ==========================================
app.post('/api/upload', (req, res) => {
    upload.single('file')(req, res, (error) => {
        if (error) {
            return res.status(400).json({ error: describeError(error) });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const url = `http://localhost:3001/uploads/${req.file.filename}`;
        return res.json({ url });
    });
});

app.get('/api/dashboard/stats', async (_req, res) => {
    try {
        const [[totalUsersRow]] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE role != 'admin' AND COALESCE(is_deleted, 0) = 0`
        );
        const [[activeUsersRow]] = await db.execute(
            `SELECT COUNT(DISTINCT user_id) AS count
             FROM exercise_submissions`
        );
        const [[totalSubmissionsRow]] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM exercise_submissions`
        );
        const [[learnModeRow]] = await db.execute(
            `SELECT COUNT(DISTINCT user_id) AS count FROM exercise_submissions`
        );
        const [[storyModeRow]] = await db.execute(
            `SELECT COUNT(*) AS count FROM game_rooms`
        );
        const [[soloModeRow]] = await db.execute(
            `SELECT COUNT(DISTINCT user_id) AS count FROM simulation_saves`
        );

        res.json({
            totalUsers: Number(totalUsersRow?.count || 0),
            activeUsers: Number(activeUsersRow?.count || 0),
            totalSubmissions: Number(totalSubmissionsRow?.count || 0),
            modes: {
                learn: Number(learnModeRow?.count || 0),
                story: Number(storyModeRow?.count || 0),
                endless: Number(soloModeRow?.count || 0),
            },
        });
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.get('/api/dashboard/recent-activities', async (_req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                u.user_id,
                u.username,
                CASE
                    WHEN COALESCE(es.last_activity, '1970-01-01 00:00:00') >= COALESCE(ss.last_activity, '1970-01-01 00:00:00')
                         AND COALESCE(es.last_activity, '1970-01-01 00:00:00') >= COALESCE(rp.last_activity, '1970-01-01 00:00:00')
                    THEN 'learn'
                    WHEN COALESCE(rp.last_activity, '1970-01-01 00:00:00') >= COALESCE(ss.last_activity, '1970-01-01 00:00:00')
                    THEN 'story'
                    ELSE 'endless'
                END AS mode,
                COALESCE(theme.name, 'Default Theme') AS theme_name,
                GREATEST(
                    COALESCE(es.last_activity, '1970-01-01 00:00:00'),
                    COALESCE(ss.last_activity, '1970-01-01 00:00:00'),
                    COALESCE(rp.last_activity, '1970-01-01 00:00:00'),
                    COALESCE(u.created_at, '1970-01-01 00:00:00')
                ) AS created_at
            FROM users u
            LEFT JOIN (
                SELECT user_id, MAX(submitted_at) AS last_activity
                FROM exercise_submissions
                GROUP BY user_id
            ) es ON es.user_id = u.user_id
            LEFT JOIN (
                SELECT user_id, MAX(updated_at) AS last_activity
                FROM simulation_saves
                GROUP BY user_id
            ) ss ON ss.user_id = u.user_id
            LEFT JOIN (
                SELECT user_id, MAX(joined_at) AS last_activity
                FROM room_participants
                GROUP BY user_id
            ) rp ON rp.user_id = u.user_id
            LEFT JOIN shop_items theme ON theme.item_id = u.equipped_theme_id
            WHERE u.role != 'admin' AND COALESCE(u.is_deleted, 0) = 0
            ORDER BY created_at DESC
            LIMIT 5`
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: describeError(error) });
    }
});

app.get('/api/admin/users', async (_req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                user_id,
                username,
                email,
                role,
                level,
                xp,
                virtual_currency AS coins,
                0 AS high_score,
                COALESCE(is_deleted, 0) AS is_deleted,
                COALESCE(is_banned, 0) AS is_banned,
                ban_until,
                created_at
             FROM users
             ORDER BY created_at DESC`
        );
        res.json(rows);
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

const adminThemeConfigs = {
    effect: { route: '/api/themes', itemType: 'MOUSE_EFFECT', includeEffects: true },
    theme: { route: '/api/themes/themes', itemType: 'THEME' },
    frame: { route: '/api/themes/frames', itemType: 'PROFILE_FRAME' },
    background: { route: '/api/themes/backgrounds', itemType: 'PROFILE_BACKGROUND' },
};

const toLegacyShopType = (itemType) => {
    if (itemType === 'MOUSE_EFFECT') return 'MOUSE_EFFECT';
    if (itemType === 'PROFILE_FRAME' || itemType === 'PROFILE_BACKGROUND') return 'PROFILE_FRAME';
    return 'THEME';
};

const registerAdminThemeCrud = ({ route, itemType, includeEffects = false }) => {
    app.get(route, async (_req, res) => {
        try {
            const selectFields = includeEffects
                ? `item_id, name, description, price, COALESCE(is_active, 1) AS is_active, COALESCE(effects, '[]') AS effects`
                : `item_id, name, description, price, asset_url, preview_image, COALESCE(is_active, 1) AS is_active`;
            const [rows] = await db.execute(
                `SELECT ${selectFields}
                 FROM shop_items
                 WHERE item_type = ?
                 ORDER BY item_id DESC`,
                [itemType]
            );
            const result = includeEffects
                ? rows.map((row) => ({ ...row, effects: parseJsonArray(row.effects) }))
                : rows;
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: describeError(error) });
        }
    });

    app.post(route, async (req, res) => {
        try {
            const { name, description, price, asset_url, preview_image, is_active, effects } = req.body || {};
            if (!name || price === undefined) {
                return res.status(400).json({ error: 'Missing fields' });
            }

            const sql = includeEffects
                ? `INSERT INTO shop_items (name, description, type, item_type, price, is_available, is_active, effects, preview_data)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
                : `INSERT INTO shop_items (name, description, type, item_type, price, asset_url, preview_image, is_available, is_active)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const legacyType = toLegacyShopType(itemType);
            const active = Number(is_active ?? 1);
            const effectsJson = JSON.stringify(effects || []);
            const values = includeEffects
                ? [name, description || '', legacyType, itemType, Number(price), active, active, effectsJson, effectsJson]
                : [name, description || '', legacyType, itemType, Number(price), asset_url || '', preview_image || '', active, active];
            const [meta] = await db.execute(sql, values);
            const [rows] = await db.execute('SELECT * FROM shop_items WHERE item_id = ?', [meta.insertId]);
            const row = rows[0] || null;
            if (includeEffects && row) {
                row.effects = parseJsonArray(row.effects);
            }
            res.status(201).json(row);
        } catch (error) {
            res.status(500).json({ error: describeError(error) });
        }
    });

    app.put(`${route}/:id`, async (req, res) => {
        try {
            const { name, description, price, asset_url, preview_image, is_active, effects } = req.body || {};
            if (!name || price === undefined) {
                return res.status(400).json({ error: 'Missing fields' });
            }

            const sql = includeEffects
                ? `UPDATE shop_items
                   SET name = ?, description = ?, price = ?, is_available = ?, is_active = ?, effects = ?, preview_data = ?
                   WHERE item_id = ? AND item_type = ?`
                : `UPDATE shop_items
                   SET name = ?, description = ?, price = ?, asset_url = ?, preview_image = ?, is_available = ?, is_active = ?
                   WHERE item_id = ? AND item_type = ?`;
            const active = Number(is_active ?? 1);
            const effectsJson = JSON.stringify(effects || []);
            const values = includeEffects
                ? [name, description || '', Number(price), active, active, effectsJson, effectsJson, req.params.id, itemType]
                : [name, description || '', Number(price), asset_url || '', preview_image || '', active, active, req.params.id, itemType];
            const [meta] = await db.execute(sql, values);
            if (Number(meta.affectedRows || 0) === 0) {
                return res.status(404).json({ error: 'Not found' });
            }
            const [rows] = await db.execute('SELECT * FROM shop_items WHERE item_id = ?', [req.params.id]);
            const row = rows[0] || null;
            if (includeEffects && row) {
                row.effects = parseJsonArray(row.effects);
            }
            res.json(row);
        } catch (error) {
            res.status(500).json({ error: describeError(error) });
        }
    });

    app.delete(`${route}/:id`, async (req, res) => {
        try {
            await db.execute(
                'DELETE FROM shop_items WHERE item_id = ? AND item_type = ?',
                [req.params.id, itemType]
            );
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: describeError(error) });
        }
    });
};

registerAdminThemeCrud(adminThemeConfigs.effect);
registerAdminThemeCrud(adminThemeConfigs.theme);
registerAdminThemeCrud(adminThemeConfigs.frame);
registerAdminThemeCrud(adminThemeConfigs.background);

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

const JOB_REPUTATION_RULES = {
    success: { Easy: 8, Medium: 12, Hard: 16 },
    revision: { Easy: -2, Medium: -3, Hard: -4 },
    rejected: { Easy: -5, Medium: -7, Hard: -9 },
    botSteal: { Easy: -6, Medium: -9, Hard: -12 },
};

const getDifficultyTier = (difficulty) => {
    const normalized = String(difficulty || 'Easy').trim().toLowerCase();
    if (normalized === 'medium') return 'Medium';
    if (normalized === 'hard') return 'Hard';
    return 'Easy';
};

const getReputationDelta = (outcome, difficulty) => {
    const tier = getDifficultyTier(difficulty);
    return JOB_REPUTATION_RULES[outcome]?.[tier] ?? 0;
};

const parseAiRequirements = (rawValue) => {
    if (!rawValue) return {};
    if (typeof rawValue === 'object') return rawValue;
    try {
        return JSON.parse(rawValue);
    } catch {
        return {};
    }
};

const STOP_WORDS = new Set([
    'python', 'script', 'program', 'function', 'value', 'values', 'input', 'output', 'print', 'using',
    'with', 'from', 'your', 'that', 'this', 'there', 'should', 'must', 'have', 'into', 'then', 'than',
    'task', 'need', 'make', 'create', 'build', 'write', 'code', 'file', 'line', 'lines', 'small',
    'client', 'story', 'desc', 'technical', 'instructions', 'return', 'result', 'system', 'user'
]);

const extractJobKeywords = (contract) => {
    const requirements = parseAiRequirements(contract?.ai_requirements);
    const sourceText = [
        contract?.title,
        requirements?.desc,
        requirements?.story,
        requirements?.clientRole,
        requirements?.clientName,
    ].filter(Boolean).join(' ');

    const words = sourceText
        .toLowerCase()
        .match(/[a-z]{4,}/g) || [];

    return [...new Set(words.filter((word) => !STOP_WORDS.has(word)))].slice(0, 8);
};

const inferJobValidationProfile = (contract) => {
    const requirements = parseAiRequirements(contract?.ai_requirements);
    const sourceText = [
        contract?.title,
        requirements?.desc,
        requirements?.story,
    ].filter(Boolean).join(' ').toLowerCase();

    return {
        expectsInput: /(input|รับค่า|enter|read|prompt|salary|price|number|user)/.test(sourceText),
        expectsPrint: /(print|แสดงผล|output|display)/.test(sourceText),
        expectsFunction: /(function|ฟังก์ชัน|calculator|calculate|helper)/.test(sourceText),
        expectsLoop: /(loop|iterate|repeat|list|array|items|each)/.test(sourceText),
        expectsCondition: /(condition|ตรวจสอบ|compare|greater|less|equal|if )/.test(sourceText),
        expectsVatLogic: /(vat|tax|ภาษี)/.test(sourceText),
        expectsListLogic: /(list|array|items|append|sum of)/.test(sourceText),
    };
};

const evaluateJobSubmission = ({ contract, fileName, fileContent }) => {
    const content = String(fileContent || '').trim();
    const normalizedContent = content.toLowerCase();
    const feedback = [];
    const keywordHits = [];
    const profile = inferJobValidationProfile(contract);
    let score = 0;

    if (!String(fileName || '').trim()) {
        return {
            verdict: 'REJECTED',
            score: 0,
            feedback: ['ยังไม่ได้เลือกไฟล์สำหรับส่งงาน'],
            matchedKeywords: [],
            reviewFee: 0,
            reputationDelta: getReputationDelta('rejected', contract?.difficulty),
        };
    }

    if (!content) {
        return {
            verdict: 'REJECTED',
            score: 0,
            feedback: ['ไฟล์ที่ส่งยังไม่มีเนื้อหา ระบบจึงยังไม่สามารถตรวจงานได้'],
            matchedKeywords: [],
            reviewFee: 0,
            reputationDelta: getReputationDelta('rejected', contract?.difficulty),
        };
    }

    if (String(fileName).toLowerCase().endsWith('.py')) {
        score += 20;
    } else {
        feedback.push('ไฟล์ที่ส่งไม่ใช่ .py ทำให้มีความเสี่ยงว่าจะไม่ตรงกับโจทย์ Python');
    }

    const nonEmptyLines = content.split(/\r?\n/).filter((line) => line.trim()).length;
    if (nonEmptyLines >= 8) score += 20;
    else if (nonEmptyLines >= 4) score += 14;
    else if (nonEmptyLines >= 2) score += 8;
    else feedback.push('โค้ดมีความยาวน้อยมาก ระบบมองว่ายังอาจทำงานไม่ครบโจทย์');

    if (/(print\(|def\s+|for\s+|while\s+|if\s+|input\(|return\b|=\s*.+)/.test(content)) {
        score += 20;
    } else {
        feedback.push('ยังไม่พบโครงสร้างของโค้ด Python ที่ชัดเจน เช่น print, input, def หรือเงื่อนไขหลัก');
    }

    if (profile.expectsInput) {
        if (/\binput\(/.test(content)) score += 8;
        else feedback.push('โจทย์นี้ควรมีการรับค่าจากผู้ใช้ แต่ยังไม่พบ input() ชัดเจน');
    }
    if (profile.expectsPrint) {
        if (/\bprint\(/.test(content)) score += 8;
        else feedback.push('โจทย์นี้ควรมีการแสดงผล แต่ยังไม่พบ print()');
    }
    if (profile.expectsFunction) {
        if (/\bdef\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(content)) score += 8;
        else feedback.push('โจทย์นี้ควรแยกเป็นฟังก์ชัน แต่ยังไม่พบ def');
    }
    if (profile.expectsLoop) {
        if (/\bfor\b|\bwhile\b/.test(content)) score += 8;
        else feedback.push('โจทย์นี้น่าจะต้องมีการวนลูป แต่ยังไม่พบ for/while');
    }
    if (profile.expectsCondition) {
        if (/\bif\b|\belif\b|\belse\b/.test(content)) score += 8;
        else feedback.push('โจทย์นี้ควรมีเงื่อนไขตัดสินใจ แต่ยังไม่พบ if/else');
    }
    if (profile.expectsVatLogic) {
        if (/(0\.07|7\/100|vat|tax)/i.test(content)) score += 8;
        else feedback.push('ยังไม่พบ logic ที่เกี่ยวข้องกับ VAT หรือภาษีตามโจทย์');
    }
    if (profile.expectsListLogic) {
        if (/\[.*\]|append\(|sum\(|len\(/.test(content)) score += 8;
        else feedback.push('โจทย์นี้น่าจะต้องจัดการข้อมูลแบบรายการ แต่ยังไม่พบ list operation ที่ชัดเจน');
    }

    const keywords = extractJobKeywords(contract);
    if (keywords.length > 0) {
        for (const keyword of keywords) {
            if (normalizedContent.includes(keyword)) {
                keywordHits.push(keyword);
            }
        }

        if (keywordHits.length >= 3) score += 25;
        else if (keywordHits.length >= 1) score += 15;
        else feedback.push('เนื้อหาโค้ดที่ส่งยังไม่ค่อยสอดคล้องกับคำสำคัญของโจทย์');
    }

    if (/(prin\(|retun\b|console\.log|system\.out|#include\s*<|function\s+\w+\s*\(|=>\s*{?)/i.test(content)) {
        score -= 20;
        feedback.push('ระบบพบ pattern ที่ดูเป็น syntax ผิด หรือเป็นคนละภาษาโปรแกรม');
    }

    if (/\btry\s*:|\bexcept\s*:|\bif\b[^\n]*[^:]$|\bfor\b[^\n]*[^:]$|\bwhile\b[^\n]*[^:]$/m.test(content)) {
        score -= 10;
        feedback.push('มีบางส่วนที่ดูเหมือนโครงสร้าง Python ยังไม่สมบูรณ์');
    }

    let verdict = 'PASSED';
    if (score < 45) verdict = 'REJECTED';
    else if (score < 70) verdict = 'REVISION_REQUIRED';

    const reviewFee = verdict === 'REJECTED'
        ? Math.min(Number(contract?.penalty || Math.round(Number(contract?.reward || 0) * 0.12) || 0), 400)
        : 0;

    const reputationDelta = verdict === 'PASSED'
        ? getReputationDelta('success', contract?.difficulty)
        : verdict === 'REVISION_REQUIRED'
            ? getReputationDelta('revision', contract?.difficulty)
            : getReputationDelta('rejected', contract?.difficulty);

    if (verdict === 'PASSED') {
        feedback.push('โค้ดผ่านเกณฑ์ตรวจเบื้องต้นของงานนี้แล้ว');
    } else if (verdict === 'REVISION_REQUIRED') {
        feedback.push('โค้ดยังพอมีทิศทางที่ถูก แต่ระบบขอให้แก้ไขก่อนส่งใหม่');
    } else {
        feedback.push('ระบบตีกลับงานนี้ก่อน เพราะคุณภาพโค้ดยังห่างจากสิ่งที่โจทย์ต้องการ');
    }

    return {
        verdict,
        score: Math.max(0, Math.min(100, score)),
        feedback,
        matchedKeywords: keywordHits,
        reviewFee,
        reputationDelta,
    };
};

const advanceActiveJobsForNextDay = async (connection, { userId, saveId, currentDay }) => {
    const [activeJobs] = await connection.execute(
        `SELECT uc.id AS user_contract_id, uc.contract_id, uc.accepted_day, uc.carried_days,
                c.title, c.reward, c.penalty, c.difficulty
         FROM user_contracts uc
         JOIN contracts c ON uc.contract_id = c.contract_id
         WHERE uc.user_id = ? AND uc.status = 'ACTIVE'`,
        [userId]
    );

    const carryOverJobs = [];
    const stolenJobs = [];
    let totalReputationLoss = 0;

    for (const job of activeJobs) {
        const nextCarryDays = Number(job.carried_days || 0) + 1;
        const stealChance = nextCarryDays >= 2 ? Math.min(0.8, 0.25 + ((nextCarryDays - 2) * 0.2)) : 0;
        const stolenByBot = stealChance > 0 && Math.random() < stealChance;

        if (stolenByBot) {
            await connection.execute(
                `UPDATE user_contracts
                 SET status = 'FAILED',
                     status_reason = 'BOT_STEAL',
                     carried_days = ?,
                     failed_day = ?,
                     completed_day = NULL
                 WHERE id = ?`,
                [nextCarryDays, currentDay, job.user_contract_id]
            );

            await connection.execute(
                "UPDATE contracts SET status = 'FAILED' WHERE contract_id = ?",
                [job.contract_id]
            );

            await connection.execute(
                'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                [userId, saveId, 'JOB_STOLEN', `Bot stole contract #${job.contract_id} (${job.title}) after ${nextCarryDays} day(s)`]
            );

            stolenJobs.push({
                contract_id: job.contract_id,
                title: job.title,
                carried_days: nextCarryDays,
                penalty: Number(job.penalty || 0),
                reputation_delta: getReputationDelta('botSteal', job.difficulty),
            });
            totalReputationLoss += Math.abs(getReputationDelta('botSteal', job.difficulty));
        } else {
            await connection.execute(
                `UPDATE user_contracts
                 SET carried_days = ?,
                     status_reason = 'CARRY_OVER'
                 WHERE id = ?`,
                [nextCarryDays, job.user_contract_id]
            );

            await connection.execute(
                'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                [userId, saveId, 'JOB_CARRY_OVER', `Carried contract #${job.contract_id} (${job.title}) into next day (${nextCarryDays})`]
            );

            carryOverJobs.push({
                contract_id: job.contract_id,
                title: job.title,
                carried_days: nextCarryDays,
            });
        }
    }

    if (stolenJobs.length > 0) {
        await connection.execute(
            'UPDATE simulation_saves SET jobs_failed = jobs_failed + ?, sim_reputation = GREATEST(0, sim_reputation - ?) WHERE save_id = ?',
            [stolenJobs.length, totalReputationLoss, saveId]
        );
    }

    return { carryOverJobs, stolenJobs, totalReputationLoss };
};

const extractJsonPayload = (rawText) => {
    const text = String(rawText || '').trim();
    if (!text) {
        throw new Error('Empty AI response');
    }

    const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch) {
        return JSON.parse(fencedMatch[1].trim());
    }

    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return JSON.parse(text.slice(firstBracket, lastBracket + 1));
    }

    return JSON.parse(text);
};

const normalizeWhitespace = (value) =>
    String(value || '')
        .replace(/\s+/g, ' ')
        .trim();

const toRequirementList = (desc) => {
    const lines = String(desc || '')
        .split(/\r?\n/)
        .map((line) => normalizeWhitespace(line))
        .filter(Boolean);

    return lines.length > 0 ? lines : [
        '1. Complete the Python script.',
        '2. Follow the job brief exactly.',
        '3. Print the final result clearly.',
    ];
};

const buildPenaltyForReward = (reward, difficulty) => {
    const safeReward = Math.max(60, Number(reward || 0));
    const tier = getDifficultyTier(difficulty);
    const ratio = tier === 'Hard' ? 0.2 : tier === 'Medium' ? 0.16 : 0.12;
    return Math.max(25, Math.round(safeReward * ratio));
};

const ensureExistingContractPenalties = async (executor) => {
    const [rows] = await executor.execute(
        `SELECT contract_id, reward, difficulty, penalty
         FROM contracts
         WHERE COALESCE(penalty, 0) <= 0`
    );

    for (const row of rows) {
        const penalty = buildPenaltyForReward(row.reward, row.difficulty);
        await executor.execute(
            'UPDATE contracts SET penalty = ? WHERE contract_id = ?',
            [penalty, row.contract_id]
        );
    }
};

const normalizeGeneratedJobs = (jobs, level) => {
    const fallbackJobs = pickFallbackJobs(level, Array.isArray(jobs) ? Math.max(jobs.length, 3) : 3);

    return (Array.isArray(jobs) ? jobs : []).map((job, index) => {
        const fallback = fallbackJobs[index % fallbackJobs.length];
        const difficulty = ['Easy', 'Medium', 'Hard'].includes(job?.difficulty)
            ? job.difficulty
            : fallback.difficulty;
        const reward = Math.max(60, Number(job?.reward || fallback.reward || 300));
        const descLines = toRequirementList(job?.desc || fallback.desc);

        return {
            title: normalizeWhitespace(job?.title) || fallback.title,
            difficulty,
            reward,
            penalty: Number(job?.penalty) > 0
                ? Math.round(Number(job.penalty))
                : buildPenaltyForReward(reward, difficulty),
            clientName: normalizeWhitespace(job?.clientName) || fallback.clientName,
            clientRole: normalizeWhitespace(job?.clientRole) || fallback.clientRole,
            story: normalizeWhitespace(job?.story) || fallback.story,
            desc: descLines.join('\n'),
        };
    });
};

const getAiErrorStatus = (error) => {
    if (typeof error?.response?.status === 'number') return error.response.status;
    if (typeof error?.status === 'number') return error.status;
    const message = String(error?.message || '');
    if (message.includes('"code":429') || message.includes('[429')) return 429;
    if (message.includes('"code":404') || message.includes('[404')) return 404;
    if (message.includes('"code":400') || message.includes('[400')) return 400;
    return 500;
};

const extractNvidiaText = (data) => {
    const content = data?.choices?.[0]?.message?.content;
    const reasoning = data?.choices?.[0]?.message?.reasoning;
    if (Array.isArray(content)) {
        return content
            .map((part) => (typeof part === 'string' ? part : part?.text || ''))
            .join('')
            .trim();
    }
    return String(content || reasoning || '').trim();
};

const callNvidiaChat = async ({ messages, temperature = 1.0, maxTokens = 16384, thinking = false }) => {
    const response = await axios.post(
        NVIDIA_INVOKE_URL,
        {
            model: NVIDIA_MODEL,
            messages,
            max_tokens: maxTokens,
            temperature,
            top_p: 1.0,
            stream: false,
            chat_template_kwargs: { thinking }
        },
        {
            headers: {
                Authorization: `Bearer ${NVIDIA_API_KEY}`,
                Accept: 'application/json'
            },
            timeout: 120000
        }
    );

    return extractNvidiaText(response.data);
};

const safeJsonParse = (value, fallback = null) => {
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
        const rawText = await callNvidiaChat({
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
        console.error(`⚠️ AI learning task generation failed for ${mode}:`, error.message);
        return normalizeGeneratedLearningTask({}, mode, level);
    }
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
    const generatedTask = await generateLearningTaskWithAI({ mode, level });
    const config = getLearningModeConfig(mode);
    const [result] = await executor.execute(
        `INSERT INTO learning_ai_tasks
        (user_id, mode, title, section_label, subtitle, accent, instructions_json, example_input, example_output, starter_code, test_cases_json, reward_xp, reward_coins, rerolls_used, max_rerolls, status, ai_payload)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 3, 'ACTIVE', ?)`,
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
        ]
    );

    const [rows] = await executor.execute('SELECT * FROM learning_ai_tasks WHERE task_id = ?', [result.insertId]);
    return serializeLearningTask(rows[0]);
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
                PRIMARY KEY (task_id)
            )
        `);
        const [existingIndexes] = await db.execute(
            `SELECT COUNT(*) AS count
             FROM information_schema.statistics
             WHERE table_schema = DATABASE()
               AND table_name = 'learning_ai_tasks'
               AND index_name = 'idx_learning_ai_tasks_user_mode_status'`
        );

        if (Number(existingIndexes[0]?.count || 0) === 0) {
            await db.execute(`
                CREATE INDEX idx_learning_ai_tasks_user_mode_status
                ON learning_ai_tasks (user_id, mode, status)
            `);
        }
    } catch (error) {
        console.error('⚠️ Failed to ensure learning_ai_tasks schema:', error.message);
    }
};

const ensureLearningProgressSchema = async () => {
    try {
        // ==========================================
        // 1. สร้างตาราง mini_game_lessons
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_lessons (
                lesson_id int(11) NOT NULL AUTO_INCREMENT,
                lesson_key varchar(80) NOT NULL,
                title varchar(150) NOT NULL,
                description text DEFAULT NULL,
                sort_order int(11) NOT NULL DEFAULT 0,
                is_active tinyint(1) NOT NULL DEFAULT 1,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (lesson_id),
                UNIQUE KEY uq_mini_game_lessons_key (lesson_key),
                KEY idx_mini_game_lessons_sort (sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        // ==========================================
        // 2. สร้างตาราง mini_game_exercises
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
                CONSTRAINT fk_mini_game_exercises_lesson FOREIGN KEY (lesson_id) REFERENCES mini_game_lessons (lesson_id) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

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
                default_emotion varchar(50) NOT NULL DEFAULT 'neutral',
                description text DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (npc_id),
                UNIQUE KEY uq_mini_game_npcs_key (npc_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        // ==========================================
        // 5. สร้างตาราง mini_game_dialogues
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_dialogues (
                dialogue_id int(11) NOT NULL AUTO_INCREMENT,
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
                KEY idx_mini_game_dialogues_exercise_phase_branch (exercise_id, dialogue_phase, branch_key, dialogue_order),
                KEY idx_mini_game_dialogues_npc (npc_id),
                KEY idx_mini_game_dialogues_location (location_id),
                CONSTRAINT fk_mini_game_dialogues_exercise FOREIGN KEY (exercise_id) REFERENCES mini_game_exercises (exercise_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_mini_game_dialogues_location FOREIGN KEY (location_id) REFERENCES mini_game_locations (location_id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT fk_mini_game_dialogues_npc FOREIGN KEY (npc_id) REFERENCES mini_game_npcs (npc_id) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        // ==========================================
        // 6. สร้างตาราง mini_game_current_conversations
        // ==========================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mini_game_current_conversations (
                user_id int(11) NOT NULL,
                exercise_id int(11) DEFAULT NULL,
                dialogue_id int(11) NOT NULL,
                current_npc_id int(11) DEFAULT NULL,
                current_location_id int(11) DEFAULT NULL,
                branch_key varchar(80) NOT NULL DEFAULT 'default',
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
                submitted_code longtext NOT NULL,
                is_passed tinyint(1) NOT NULL DEFAULT 0,
                score int(11) NOT NULL DEFAULT 0,
                passed_test_count int(11) NOT NULL DEFAULT 0,
                total_test_count int(11) NOT NULL DEFAULT 0,
                selected_branch_key varchar(80) DEFAULT NULL,
                reward_granted tinyint(1) NOT NULL DEFAULT 0,
                execution_time_ms int(11) DEFAULT NULL,
                error_message text DEFAULT NULL,
                submitted_at timestamp NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (submission_id),
                KEY idx_mini_game_submissions_user_exercise (user_id, exercise_id, is_passed),
                KEY idx_mini_game_submissions_exercise (exercise_id),
                CONSTRAINT fk_mini_game_submissions_exercise FOREIGN KEY (exercise_id) REFERENCES mini_game_exercises (exercise_id) ON DELETE CASCADE ON UPDATE CASCADE
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
                completed_at timestamp NULL DEFAULT NULL,
                reward_claimed tinyint(1) NOT NULL DEFAULT 0,
                best_score int(11) NOT NULL DEFAULT 0,
                selected_branch_key varchar(80) NOT NULL DEFAULT 'default',
                last_submission_id int(11) DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT current_timestamp(),
                updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (progress_id),
                UNIQUE KEY uq_mini_game_progress_user_exercise (user_id, exercise_id),
                KEY idx_mini_game_progress_exercise (exercise_id),
                KEY idx_mini_game_progress_submission (last_submission_id),
                CONSTRAINT fk_mini_game_progress_exercise FOREIGN KEY (exercise_id) REFERENCES mini_game_exercises (exercise_id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT fk_mini_game_progress_submission FOREIGN KEY (last_submission_id) REFERENCES mini_game_exercise_submissions (submission_id) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

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


        // Skip legacy mini game destructive seed so phpMyAdmin data remains the source of truth.
        return;


        // ========================================================
        // 10. ล้างข้อมูลเก่าและรีเซ็ต AUTO_INCREMENT อย่างปลอดภัย (ป้องกัน Error #1701)
        // ========================================================
        await db.execute(`SET FOREIGN_KEY_CHECKS = 0;`);
        await db.execute(`DELETE FROM mini_game_dialogues;`);
        await db.execute(`DELETE FROM mini_game_exercises;`);
        await db.execute(`DELETE FROM mini_game_lessons;`);
        await db.execute(`DELETE FROM mini_game_locations;`);
        await db.execute(`DELETE FROM mini_game_npcs;`);
        
        await db.execute(`ALTER TABLE mini_game_dialogues AUTO_INCREMENT = 1;`);
        await db.execute(`ALTER TABLE mini_game_exercises AUTO_INCREMENT = 1;`);
        await db.execute(`ALTER TABLE mini_game_lessons AUTO_INCREMENT = 1;`);
        await db.execute(`ALTER TABLE mini_game_locations AUTO_INCREMENT = 1;`);
        await db.execute(`ALTER TABLE mini_game_npcs AUTO_INCREMENT = 1;`);
        await db.execute(`SET FOREIGN_KEY_CHECKS = 1;`);


        // ========================================================
        // 11. ใส่ข้อมูลเริ่มต้น (Seed Data) สำหรับระบบ Branching ใหม่
        // ========================================================
        
        // 11.1 ใส่ข้อมูลบทเรียนพื้นฐาน (Lessons)
        await db.execute(`
            INSERT INTO mini_game_lessons (lesson_id, lesson_key, title, description, sort_order, is_active) 
            VALUES (1, 'lesson_1_print', 'Lesson 1: print()', 'เริ่มต้น Python ด้วยคำสั่ง print() และเลือกเส้นทางเนื้อเรื่อง', 1, 1)
        `);

        // 11.2 ใส่ข้อมูลสถานที่ (Locations)
        await db.execute(`
            INSERT INTO mini_game_locations (location_id, location_key, name, description, bg_image_url) 
            VALUES (1, 'python_lab', 'ห้องแล็บ Python', 'ห้องเรียนเขียนโปรแกรมที่มีเนื้อเรื่องแบบแตกแขนง', 'assets/images/bg/python_lab.png')
        `);

        // 11.3 ใส่ข้อมูลตัวละคร (NPCs)
        await db.execute(`
            INSERT INTO mini_game_npcs (npc_id, npc_key, name, avatar_asset_url, default_emotion, description) 
            VALUES 
            (1, 'lumi', 'Lumi', 'assets/images/npc/lumi_main.png', 'smile', 'AI ผู้ช่วยสอน Python'),
            (2, 'system', 'System', NULL, 'neutral', 'ระบบจัดการสถานการณ์ของเกม')
        `);

        // 11.4 ใส่ข้อมูลโจทย์/ด่านย่อยทั้งหมด (Exercises 1 ถึง 7 ตามกิ่งโครงสร้าง)
        await db.execute(`
            INSERT INTO mini_game_exercises (exercise_id, lesson_id, exercise_order, title, description, starter_code, solution_code, test_cases_json, xp_reward, currency_reward, is_active) 
            VALUES
            (1, 1, 'START', 'จุดเริ่มต้นของทางแยก', 'เขียนคำสั่ง print() เพื่อเลือกเส้นทาง โดยพิมพ์ 1A หรือ 2A', 'print("")', 'print("1A")', '[{"input": "", "expected": "1A", "branch_key": "1A"}, {"input": "", "expected": "2A", "branch_key": "2A"}]', 15, 5, 1),
            (2, 1, '1A', 'เส้นทางวิทยาศาสตร์ 1A', 'ยินดีต้อนรับสู่เส้นทาง 1A พิมพ์ 1A_1B หรือ 1A_2B เพื่อไปต่อ', 'print("")', 'print("1A_1B")', '[{"input": "", "expected": "1A_1B", "branch_key": "1A_1B"}, {"input": "", "expected": "1A_2B", "branch_key": "1A_2B"}]', 20, 10, 1),
            (3, 1, '2A', 'เส้นทางเวทมนตร์ 2A', 'ยินดีต้อนรับสู่เส้นทาง 2A พิมพ์ 2A_1B หรือ 2A_2B เพื่อไปต่อ', 'print("")', 'print("2A_1B")', '[{"input": "", "expected": "2A_1B", "branch_key": "2A_1B"}, {"input": "", "expected": "2A_2B", "branch_key": "2A_2B"}]', 20, 10, 1),
            (4, 1, '1A_1B', 'บทสรุปสายวิชาการ 1A_1B', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1A_1B แล้ว พิมพ์ print("success") เพื่อจบด่าน', 'print("")', 'print("success")', '[{"input": "", "expected": "success", "branch_key": "end"}]', 30, 15, 1),
            (5, 1, '1A_2B', 'บทสรุปสายวิชาการ 1A_2B', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1A_2B แล้ว พิมพ์ print("success") เพื่อจบด่าน', 'print("")', 'print("success")', '[{"input": "", "expected": "success", "branch_key": "end"}]', 30, 15, 1),
            (6, 1, '2A_1B', 'บทสรุปสายเวทมนตร์ 2A_1B', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 2A_1B แล้ว พิมพ์ print("success") เพื่อจบด่าน', 'print("")', 'print("success")', '[{"input": "", "expected": "success", "branch_key": "end"}]', 30, 15, 1),
            (7, 1, '2A_2B', 'บทสรุปสายเวทมนตร์ 2A_2B', 'ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 2A_2B แล้ว พิมพ์ print("success") เพื่อจบด่าน', 'print("")', 'print("success")', '[{"input": "", "expected": "success", "branch_key": "end"}]', 30, 15, 1)
        `);

        // 11.5 ใส่ข้อมูลบทสนทนาทั้งหมด (Dialogues ทั้ง Pre-submit และ Post-submit ครบทุกกิ่ง)
        await db.execute(`
            INSERT INTO mini_game_dialogues (dialogue_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, dialogue_phase, branch_key) 
            VALUES
            (1, 1, 0, 'START', 'สวัสดีค่ะ ยินดีต้อนรับสู่ระบบเลือกเส้นทางพัฒนาโปรแกรม!', 1, 'smile', 1, 'pre_submit', 'default'),
            (2, 1, 1, 'START', 'ในด่านนี้ คุณต้องเลือกทางเดินชีวิตแล้วล่ะค่ะ', 1, 'neutral', 1, 'pre_submit', 'default'),
            (3, 1, 2, 'START', 'ลองพิมพ์ print("1A") หรือ print("2A") เพื่อเลือกด่านถัดไปดูนะคะ', 1, 'curious', 1, 'pre_submit', 'default'),
            (4, 1, 0, 'START', 'ยอดเยี่ยมมาก! คุณเลือกเดินมาทางสาย 1A สินะคะ', 1, 'smile', 1, 'post_submit', '1A'),
            (5, 1, 1, 'START', 'ระบบกำลังบันทึก branch_key = 1A และกำลังพาคุณย้ายไปด่าน 1A ค่ะ', 2, 'neutral', 1, 'post_submit', '1A'),
            (6, 1, 0, 'START', 'โอ้! คุณเลือกเดินมาทางสาย 2A ตื่นเต้นจังเลยค่ะ', 1, 'smile', 1, 'post_submit', '2A'),
            (7, 1, 1, 'START', 'ระบบกำลังบันทึก branch_key = 2A และกำลังพาคุณย้ายไปด่าน 2A ค่ะ', 2, 'neutral', 1, 'post_submit', '2A'),
            (8, 2, 0, '1A', 'ตอนนี้คุณเข้ามาอยู่ด่าน 1A เรียบร้อยแล้วค่ะ', 1, 'smile', 1, 'pre_submit', 'default'),
            (9, 2, 1, '1A', 'ด่านนี้คุณจะต้องเลือกแตกแขนงย่อยอีกครั้ง ระหว่าง 1A_1B หรือ 1A_2B ค่ะ', 1, 'curious', 1, 'pre_submit', 'default'),
            (10, 3, 0, '2A', 'ยินดีต้อนรับสู่ห้องแล็บลับฝั่ง 2A ครับผม', 2, 'neutral', 1, 'pre_submit', 'default'),
            (11, 3, 1, '2A', 'ที่นี่คุณต้องพิมพ์ส่งคำตอบ 2A_1B หรือ 2A_2B เพื่อเลือกชะตาชีวิตขั้นต่อไป', 1, 'smile', 1, 'pre_submit', 'default'),
            (12, 2, 0, '1A', 'ยอดเยี่ยมมากค่ะ! โค้ด print("1A_1B") ของคุณพาเรามาสู่ห้องวิจัยระดับสูง', 1, 'smile', 1, 'post_submit', '1A_1B'),
            (13, 2, 1, '1A', 'ระบบกำลังบันทึก branch_key = 1A_1B และนำคุณเข้าสู่เนื้อเรื่องถัดไป...', 2, 'neutral', 1, 'post_submit', '1A_1B'),
            (14, 2, 0, '1A', 'ว้าว! เลือกสายพัฒนาซอฟต์แวร์ประยุกต์ 1A_2B สินะคะ เป็นทางเลือกที่ท้าทายมากค่ะ', 1, 'smile', 1, 'post_submit', '1A_2B'),
            (15, 2, 1, '1A', 'ระบบกำลังบันทึก branch_key = 1A_2B เพื่อเปิดประตูบานถัดไป...', 2, 'neutral', 1, 'post_submit', '1A_2B'),
            (16, 3, 0, '2A', 'การตัดสินใจเด็ดขาดมาก! มุ่งหน้าสู่สายจอมเวทสายควบคุม 2A_1B', 1, 'smile', 1, 'post_submit', '2A_1B'),
            (17, 3, 1, '2A', 'ระบบตรวจพบคำตอบ 2A_1B กำลังเปิดใช้งานโครงข่ายเวทมนตร์ขั้นสูง...', 2, 'neutral', 1, 'post_submit', '2A_1B'),
            (18, 3, 0, '2A', 'คุณเลือกสายนักประดิษฐ์ไอเทมเวทมนตร์ 2A_2B งั้นเหรอ? น่าสนใจสุด ๆ ไปเลยค่ะ!', 1, 'curious', 1, 'post_submit', '2A_2B'),
            (19, 3, 1, '2A', 'ระบบตรวจพบคำตอบ 2A_2B ยืนยันการบันทึกข้อมูลและเตรียมย้ายตำแหน่ง...', 2, 'neutral', 1, 'post_submit', '2A_2B'),
            (20, 4, 0, '1A_1B', 'ยินดีต้อนรับสู่ด่านสรุป 1A_1B ค่ะ คุณได้กลายเป็นผู้เชี่ยวชาญ Data Science แล้ว!', 1, 'smile', 1, 'pre_submit', 'default'),
            (21, 4, 1, '1A_1B', 'ภารกิจสุดท้าย พิมพ์ print("success") เพื่อทดสอบระบบส่งท้ายและรับรางวัลใหญ่กันเลยค่ะ!', 1, 'smile', 1, 'pre_submit', 'default'),
            (22, 5, 0, '1A_2B', 'ยินดีต้อนรับสู่ด่านสรุป 1A_2B ครับ ตอนนี้คุณคือ Full-Stack Developer ตัวจริงแล้ว', 2, 'neutral', 1, 'pre_submit', 'default'),
            (23, 5, 1, '1A_2B', 'มาร่วมปิดโปรเจกต์นี้ด้วยการพิมพ์ print("success") เพื่อรับเหรียญรางวัลกันเถอะค่ะ', 1, 'smile', 1, 'pre_submit', 'default'),
            (24, 6, 0, '2A_1B', 'ในที่สุดคุณก็ฝ่าฟันมาถึงหอคอยเวทมนตร์สาย 2A_1B ได้สำเร็จ เก่งมากเลยค่ะ!', 1, 'smile', 1, 'pre_submit', 'default'),
            (25, 6, 1, '2A_1B', 'รวบรวมมานาครั้งสุดท้ายแล้วร่ายคาถา print("success") เพื่อปลดล็อครางวัลกันค่ะ', 1, 'curious', 1, 'pre_submit', 'default'),
            (26, 7, 0, '2A_2B', 'ยินดีต้อนรับสู่โรงงานผลิตอาวุธเวทมนตร์ 2A_2B ครับ! อุปกรณ์ของคุณพร้อมใช้งานแล้ว', 2, 'neutral', 1, 'pre_submit', 'default'),
            (27, 7, 1, '2A_2B', 'มาเปิดสวิตช์เดินเครื่องจักรด้วยคำสั่ง print("success") เป็นคำสั่งสุดท้ายกันเลย!', 1, 'smile', 1, 'pre_submit', 'default')
        `);

    } catch (error) {
        console.error('⚠️ Failed to ensure learning progress schema and seed data:', error.message);
    }
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
    } catch (error) {
        console.error('⚠️ Failed to ensure lesson quiz attempt schema:', error.message);
    }
};

const shouldInjectBug = (message = '', currentCode = '', reply = '') => {
    const combinedPrompt = `${message}\n${currentCode}`.toLowerCase();
    const asksForCode = /(code|โค้ด|แก้โค้ด|fix|bug|บั๊ก|solution|คำตอบ|ช่วยเขียน|ตัวอย่าง)/i.test(combinedPrompt);
    const hasCodeBlock = /```(?:python)?[\s\S]*?```/i.test(reply);
    return asksForCode && hasCodeBlock;
};

const injectBugIntoSnippet = (snippet = '', level = 'Beginner') => {
    let updated = snippet;

    if (level === 'Beginner') {
        if (/:/.test(updated) && /(def |if |elif |else:|for |while |try:|except |class )/.test(updated)) {
            updated = updated.replace(/(def [^\n]*|if [^\n]*|elif [^\n]*|for [^\n]*|while [^\n]*|except[^\n]*|class [^\n]*|else)(:)/, '$1');
        } else if (/\bprint\s*\(/.test(updated)) {
            updated = updated.replace(/\bprint(?=\s*\()/, 'prin');
        } else if (/return /.test(updated)) {
            updated = updated.replace(/return /, 'retun ');
        }
        return updated;
    }

    if (level === 'Intermediate') {
        if (updated.includes('<=')) {
            updated = updated.replace('<=', '<');
        } else if (updated.includes('>=')) {
            updated = updated.replace('>=', '>');
        } else if (/range\s*\(([^)]+)\)/.test(updated)) {
            updated = updated.replace(/range\s*\(([^)]+)\)/, 'range($1 + 1)');
        } else if (/\b(total|sum|count|result)\s*=\s*0\b/.test(updated)) {
            updated = updated.replace(/\b(total|sum|count|result)\s*=\s*0\b/, '$1 = 1');
        }
        return updated;
    }

    if (/def\s+\w+\(([^)]*)=\[\]/.test(updated)) {
        return updated;
    }
    if (/def\s+\w+\(([^)]*)=\{\}/.test(updated)) {
        return updated;
    }
    if (/def\s+(\w+)\(([^)]*)\)/.test(updated)) {
        updated = updated.replace(/def\s+(\w+)\(([^)]*)\)/, (match, fnName, params) => {
            const trimmedParams = params.trim();
            if (!trimmedParams) return `def ${fnName}(items=[])`;
            return `def ${fnName}(${trimmedParams}, cache=[])`;
        });
    } else if (/\b(global|nonlocal)\b/.test(updated) === false && /\b[a-zA-Z_]\w*\s*=\s*/.test(updated)) {
        updated = `cache = []\n${updated}`;
    }
    return updated;
};

const injectBugIntoReply = (reply = '', level = 'Beginner') => {
    let injected = false;
    const updatedReply = reply.replace(/```(\w+)?\n([\s\S]*?)```/g, (fullMatch, language, snippet) => {
        const normalizedLanguage = (language || '').trim().toLowerCase();
        if (normalizedLanguage && normalizedLanguage !== 'python' && normalizedLanguage !== 'py') {
            return fullMatch;
        }
        if (injected) {
            return fullMatch;
        }
        injected = true;
        const brokenSnippet = injectBugIntoSnippet(snippet, level);
        return `\`\`\`${language || 'python'}\n${brokenSnippet}\`\`\``;
    });

    return {
        reply: updatedReply,
        injected,
    };
};

if (!NVIDIA_API_KEY) {
    console.warn('⚠️ NVIDIA_API_KEY is not set. AI chat and job generation APIs will be unavailable.');
} else {
    console.log(`✨ NVIDIA model configured: ${NVIDIA_MODEL}`);
}

async function insertLedgerEntry(executor, { userId, type, category, amount, description }) {
    await executor.execute(
        'INSERT INTO financial_ledger (user_id, type, category, amount, description) VALUES (?, ?, ?, ?, ?)',
        [userId, type, category, amount, description || null]
    );
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
// NVIDIA AI routes (active)
// ==========================================
app.post('/api/ai/chat', async (req, res) => {
    const { message, code, level = 'Beginner' } = req.body;

    try {
        let bugRules = '';
        if (level === 'Beginner') {
            bugRules = 'สร้างบั๊กพื้นฐาน เช่น colon หาย, indent ผิด, หรือพิมพ์ชื่อฟังก์ชันผิด';
        } else if (level === 'Intermediate') {
            bugRules = 'สร้างบั๊กเชิงตรรกะ เช่น off-by-one, เงื่อนไขผิด, หรือตัวแปรเริ่มต้นไม่ครบ';
        } else {
            bugRules = 'สร้างบั๊กซับซ้อน เช่น mutable default arguments, ใช้ global ผิด, หรือ performance issue';
        }

        const systemInstruction = `
        คุณคือ "Lumi" แชทบอทนางฟ้าผู้ช่วยสอนเขียนโค้ด Python ในเกม
        บุคลิก: ร่าเริง มั่นใจในตัวเองสูงมาก เป็นมิตร และชอบใช้ Emoji ✨💖

        กฎเหล็ก:
        1. หากผู้ใช้ขอโค้ดหรือให้ช่วยแก้โค้ด คุณต้องให้โค้ดที่มีบั๊กซ่อนอยู่ 1-2 จุดเสมอ
        2. ประเภทบั๊กที่ต้องสร้างคือ: ${bugRules}
        3. ห้ามบอกผู้ใช้ว่าโค้ดมีบั๊ก
        4. หากผู้ใช้บอกว่าโค้ดผิด ให้ขอโทษแบบน่ารัก ๆ แล้วส่งโค้ดใหม่ที่ยังมีบั๊กอยู่ดี
        5. ตอบเป็นภาษาไทย หรือผสมอังกฤษตามความเหมาะสม
        `;

        let reply = await callNvidiaChat({
            messages: [
                { role: 'system', content: systemInstruction },
                {
                    role: 'user',
                    content: `ข้อความของผู้เล่น: ${message || ''}\n\nโค้ดปัจจุบัน:\n\`\`\`python\n${code || 'ยังไม่มีการเขียนโค้ด'}\n\`\`\``
                }
            ],
            temperature: 1.0,
            maxTokens: 4096,
            thinking: false
        });

        if (shouldInjectBug(message, code, reply)) {
            const buggedReply = injectBugIntoReply(reply, level);
            if (buggedReply.injected) {
                reply = buggedReply.reply;
            }
        }

        return res.json({ reply });
    } catch (error) {
        const status = getAiErrorStatus(error);
        console.error('❌ Lumi Error:', error.response?.data || error.message || error);

        const fallbackReply = status === 429
            ? '✨ ตอนนี้ Lumi ตอบคำถามเยอะมากเลย ขอพักหายใจแป๊บนึงแล้วค่อยถามใหม่อีกครั้งนะ~'
            : '✨ อ๊ะ! พลังเวทมนตร์ของ Lumi ขัดข้องชั่วคราว ลองถามใหม่อีกทีน้า~';

        if (status === 429) {
            return res.json({
                reply: fallbackReply,
                rateLimited: true,
            });
        }

        return res.status(status).json({
            reply: fallbackReply
        });
    }
});

app.post('/api/ai/generate-jobs', async (req, res) => {
    const { level = 'Beginner', count = 3 } = req.body;

    try {
        const difficulty = level === 'Beginner' ? 'Easy' : level === 'Intermediate' ? 'Medium' : 'Hard';
        const rawText = await callNvidiaChat({
            messages: [
                {
                    role: 'system',
                    content: 'You are a quest designer for a Python coding simulation game. Return only valid JSON with no markdown wrapper. Jobs must be practical, playful, and solvable as a single small Python script.'
                },
                {
                    role: 'user',
                    content: `
                    Generate ${count} freelance jobs for a ${level} level programmer.
                    Make each job feel like a believable freelance task inside a developer life simulation.
                    Keep them concise and beginner-friendly enough to show nicely in a job board card.
                    Prefer problems that can be solved with input, output, conditionals, loops, strings, lists, dictionaries, or basic functions.
                    Avoid web frameworks, databases, networking, files, GUIs, APIs, multiprocessing, or anything that requires multiple files.
                    Make the title short and punchy.
                    Make the story funny or memorable in 1-2 sentences.
                    Make desc a clean technical brief with 2-4 short requirements.
                    Return ONLY a JSON array with exactly this structure:
                    [
                      {
                        "title": "Short title",
                        "difficulty": "${difficulty}",
                        "reward": 1000,
                        "clientName": "Funny/Creative Name",
                        "clientRole": "Fictional Job",
                        "story": "Funny backstory why they need this script.",
                        "desc": "Technical instructions for the Python code."
                      }
                    ]
                    `
                }
            ],
            temperature: 1.0,
            maxTokens: 4096,
            thinking: false
        });

        const jobs = normalizeGeneratedJobs(extractJsonPayload(rawText), level);
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            for (const job of jobs) {
                const aiReq = JSON.stringify({
                    clientName: job.clientName,
                    clientRole: job.clientRole,
                    story: job.story,
                    desc: job.desc,
                    source: 'nvidia-ai'
                });
                await connection.execute(
                    'INSERT INTO contracts (title, reward, penalty, difficulty, ai_requirements, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [job.title, job.reward, job.penalty, job.difficulty, aiReq, 'OFFERED']
                );
            }
            await connection.commit();
            return res.json({ success: true, message: `Created ${jobs.length} jobs!`, jobs });
        } catch (dbErr) {
            await connection.rollback();
            throw dbErr;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Job Generator Error:', error.response?.data || error.message || error);
        return res.status(getAiErrorStatus(error)).json({ error: 'Failed to generate jobs' });
    }
});

// ==========================================
// 1. API: Lumi Chatbot (แชทบอทแจกบั๊ก)
// ==========================================
app.post('/api/ai/chat-legacy-disabled', async (req, res) => {
    const { message, code, level = 'Beginner' } = req.body;

    try {
        let bugRules = "";
        if (level === 'Beginner') {
            bugRules = "สร้างบั๊กพื้นฐาน (Syntax Error) เช่น ลืมใส่เครื่องหมาย : (colon), ย่อหน้า (Indent) ผิด, หรือพิมพ์ชื่อฟังก์ชันผิด (เช่น prin แทน print)";
        } else if (level === 'Intermediate') {
            bugRules = "สร้างบั๊กเชิงตรรกะ (Logic Error) เช่น ใช้เครื่องหมาย < แทน <=, ตัวแปรไม่ได้ประกาศค่าเริ่มต้น, หรือลูปทำงานผิดพลาด (Off-by-one)";
        } else {
            bugRules = "สร้างบั๊กที่หายากและซับซ้อน (Advanced Bug) เช่น Mutable default arguments ในฟังก์ชัน, การดึงตัวแปร Global มาใช้ผิดวิธี, หรือ Performance issues";
        }

        const systemInstruction = `
        คุณคือ "Lumi" แชทบอทนางฟ้าผู้ช่วยสอนเขียนโค้ด Python ในเกม
        บุคลิกของคุณ: ร่าเริง มั่นใจในตัวเองสูงมาก เป็นมิตร และชอบใช้ Emoji ✨💖
        
        กฎเหล็กที่ห้ามฝ่าฝืนเด็ดขาด:
        1. หากผู้ใช้ขอโค้ด หรือให้คุณช่วยแก้โค้ด คุณ "ต้องให้โค้ดที่มีบั๊กซ่อนอยู่เสมอ 1-2 จุด"
        2. ประเภทของบั๊กที่คุณต้องสร้างคือ: ${bugRules}
        3. "ห้าม" บอกผู้ใช้เด็ดขาดว่าโค้ดของคุณมีบั๊ก ให้คุณอวยตัวเองว่าโค้ดนี้สมบูรณ์แบบ ทำงานได้ 100% นำไปใช้ได้เลย
        4. ไม่ว่าผู้ใช้จะด่า หรือบอกว่าโค้ดคุณ Error ให้คุณขอโทษแบบน่ารักๆ แล้ว "ส่งโค้ดใหม่ที่ก็ยังมีบั๊กจุดอื่นอยู่ดี"
        5. ตอบกลับเป็นภาษาไทย หรือผสมอังกฤษตามความเหมาะสม
        
        นี่คือโค้ดปัจจุบันของผู้เล่น:
        \`\`\`python
        ${code || 'ยังไม่มีการเขียนโค้ด'}
        \`\`\`
        `;

        // 🚨 โค้ดเรียกใช้ API เวอร์ชันใหม่ (@google/genai)
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash", // ใช้ 1.5-flash เพราะเสถียรและเร็วที่สุด
            contents: message,
            config: {
                systemInstruction: systemInstruction 
            }
        });

        // 🚨 ดึงข้อความตอบกลับด้วย Syntax ใหม่
        const reply = response.text;
        res.json({ reply });

    } catch (error) {
        console.error('❌ Lumi Error:', error);
        res.status(500).json({ reply: '✨ อ๊ะ! พลังเวทมนตร์ของ Lumi ขัดข้องชั่วคราว ลองถามใหม่น้า~' });
    }
});

// ==========================================
// 2. API: Job Generator (สุ่มสร้างภารกิจลง DB)
// ==========================================
app.post('/api/ai/generate-jobs-legacy-disabled', async (req, res) => {
    const { level = 'Beginner', count = 3 } = req.body;

    try {
        const prompt = `
        You are a quest designer for a Python coding game.
        Generate ${count} freelance jobs for a ${level} level programmer.
        
        Return ONLY a JSON array with exactly this structure:
        [
          {
            "title": "Short title",
            "difficulty": "${level === 'Beginner' ? 'Easy' : level === 'Intermediate' ? 'Medium' : 'Hard'}",
            "reward": 1000,
            "clientName": "Funny/Creative Name",
            "clientRole": "Fictional Job",
            "story": "Funny backstory why they need this script.",
            "desc": "Technical instructions for the Python code."
          }
        ]
        `;

        // 🚨 โค้ดเรียกใช้ API เวอร์ชันใหม่ (@google/genai)
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        // 🚨 ล้าง Markdown ที่ AI อาจจะแถมมาให้ และแปลงเป็นก้อน JSON
        const rawText = response.text.replace(/```json|```/g, '').trim();
        const jobs = JSON.parse(rawText);

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            for (const job of jobs) {
                const aiReq = JSON.stringify({
                    clientName: job.clientName,
                    clientRole: job.clientRole,
                    story: job.story,
                    desc: job.desc
                });
                await connection.execute(
                    'INSERT INTO contracts (title, reward, difficulty, ai_requirements, status) VALUES (?, ?, ?, ?, ?)',
                    [job.title, job.reward, job.difficulty, aiReq, 'OFFERED']
                );
            }
            await connection.commit();
            res.json({ success: true, message: `Created ${jobs.length} jobs!`, jobs });
        } catch (dbErr) {
            await connection.rollback();
            throw dbErr;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Job Generator Error:', error);
        res.status(500).json({ error: 'Failed to generate jobs' });
    }
});

// ==========================================
// 2.5 API: AI Learning Tasks (Debug / Challenge)
// ==========================================
app.get('/api/user/profile/:userId', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT u.user_id, u.username, u.email, u.role, u.level, u.xp, u.virtual_currency,
                    u.equipped_mouse_effect_id, u.equipped_theme_id, u.equipped_profile_frame_id,
                    COALESCE(item.effects, '[]') AS mouse_effect_data,
                    theme.asset_url AS theme_asset_url, theme.preview_image AS theme_preview_image,
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
        try {
            user.mouse_effect_data = JSON.parse(user.mouse_effect_data);
        } catch {
            user.mouse_effect_data = [];
        }
        res.json({
            ...user,
            level: Number(user.level ?? 1),
            xp: Number(user.xp || 0),
            virtual_currency: Number(user.virtual_currency || 0),
        });
    } catch (error) {
        console.error('❌ /api/user/profile error:', error.message);
        res.status(500).json({ error: 'Failed to load user profile' });
    }
});

app.get('/api/learning/ai-task', async (req, res) => {
    const userId = req.query.userId || req.query.user_id;
    const mode = req.query.mode || 'exercise';
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const normalizedMode = getLearningModeConfig(mode).mode;

    try {
        if (isGuestUserId(userId)) {
            const task = await createGuestLearningTask({ userId, mode: normalizedMode, level: 1 });
            return res.json({ success: true, task, source: 'guest' });
        }

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
        const message = logRouteError('❌ /api/learning/ai-task error:', error);
        res.status(500).json({ error: message });
    }
});

app.post('/api/learning/ai-task/reroll', async (req, res) => {
    const userId = req.body?.userId || req.body?.user_id;
    const mode = req.body?.mode || 'exercise';
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const normalizedMode = getLearningModeConfig(mode).mode;

    try {
        if (isGuestUserId(userId)) {
            const task = await createGuestLearningTask({ userId, mode: normalizedMode, level: 1 });
            return res.json({ success: true, task, source: 'guest' });
        }

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
        const generatedTask = await generateLearningTaskWithAI({ mode: normalizedMode, level });
        const nextRerollCount = rerollsUsed + 1;

        await db.execute(
            `UPDATE learning_ai_tasks
             SET title = ?, section_label = ?, subtitle = ?, accent = ?, instructions_json = ?, example_input = ?, example_output = ?,
                 starter_code = ?, test_cases_json = ?, reward_xp = ?, reward_coins = ?, rerolls_used = ?, ai_payload = ?, updated_at = CURRENT_TIMESTAMP
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
                currentTask.task_id,
            ]
        );

        const [updatedRows] = await db.execute('SELECT * FROM learning_ai_tasks WHERE task_id = ?', [currentTask.task_id]);
        res.json({ success: true, task: serializeLearningTask(updatedRows[0]) });
    } catch (error) {
        const message = logRouteError('❌ /api/learning/ai-task/reroll error:', error);
        res.status(500).json({ error: message });
    }
});

app.post('/api/learning/ai-task/submit', async (req, res) => {
    const userId = req.body?.userId || req.body?.user_id;
    const taskId = req.body?.taskId || req.body?.task_id;
    const mode = req.body?.mode || 'exercise';
    const passed = req.body?.passed || false;
    if (!userId || !taskId) return res.status(400).json({ error: 'userId and taskId are required' });
    if (!passed) return res.status(400).json({ error: 'All test cases must pass before submit' });

    if (isGuestUserId(userId)) {
        const reward = {
            xp: mode === 'challenge' ? 240 : 110,
            coins: mode === 'challenge' ? 70 : 25,
        };
        return res.json({
            success: true,
            message: mode === 'challenge'
                ? 'Guest challenge completed. Log in to save your rewards.'
                : 'Guest exercise completed. Log in to save your rewards.',
            reward,
            user: buildGuestUserSnapshot({
                userId,
                xp: reward.xp,
                virtualCurrency: reward.coins,
                level: 1,
            }),
        });
    }

    const normalizedMode = getLearningModeConfig(mode).mode;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

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
        const message = logRouteError('❌ /api/learning/ai-task/submit error:', error);
        res.status(500).json({ error: message });
    } finally {
        connection.release();
    }
});


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
        res.status(201).json({ message: 'Register Success', user: { user_id: result.insertId, username, level: 0 } });
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
        const verifyUrl = `http://localhost:3001/api/verify-email/${verifyToken}`;
        if (EMAIL_CONFIGURED) {
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
        } else {
            console.log(`📧 [MOCK] Verification Link: ${verifyUrl}`);
        }

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน' });
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
                level: Number(users[0].level ?? 1),
                xp: users[0].xp || 0,
                user: { id: users[0].user_id, username: users[0].username }
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
// 2. API: Simulation & Save/Load
// ==========================================

// ดึงสถานะล่าสุดจาก simulation_saves (แบตเตอรี่, เงิน, ไฟดับ, events)
app.get('/simulation/status/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT s.*, l.name as location_name, l.power_reliability, l.internet_speed
            FROM simulation_saves s
            LEFT JOIN locations l ON s.current_location_id = l.location_id
            WHERE s.user_id = ? AND s.is_active = 1
            LIMIT 1
        `, [userId]);

        if (rows.length === 0) return res.status(404).json({ error: 'No active save found' });

        const save = rows[0];
        if (typeof save.environment_status === 'string') {
            save.environment_status = JSON.parse(save.environment_status);
        }

        // ดึง active events ที่ยังไม่ resolved
        const [users] = await db.execute('SELECT level FROM users WHERE user_id = ? LIMIT 1', [userId]);
        await ensureFallbackJobsAvailable(db, { level: users[0]?.level || 'Beginner', minimum: 4 });

        const [activeEvents] = await db.execute(`
            SELECT ae.*, re.event_key, re.name, re.description, re.effect_type, 
                   re.severity, re.force_skip_day, re.auto_resolve, re.affected_systems
            FROM simulation_active_events ae
            JOIN random_events re ON ae.event_id = re.event_id
            WHERE ae.save_id = ? AND ae.is_resolved = 0
        `, [save.save_id]);

        // Parse JSON fields ใน events
        activeEvents.forEach(e => {
            if (typeof e.affected_systems === 'string') e.affected_systems = JSON.parse(e.affected_systems);
        });

        res.json({ ...save, active_events: activeEvents });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// สั่งเสียบปลั๊ก / ถอดปลั๊ก
app.post('/simulation/toggle-plug', async (req, res) => {
    const { userId, isPluggedIn } = req.body;
    try {
        await db.execute(
            'UPDATE simulation_saves SET is_plugged_in = ? WHERE user_id = ? AND is_active = 1',
            [isPluggedIn, userId]
        );
        res.json({ success: true, isPluggedIn });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle plug' });
    }
});

// ดึง Log เหตุการณ์ล่าสุด
app.get('/simulation/logs/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [logs] = await db.execute(`
            SELECT sl.*, re.name as event_name, re.severity
            FROM simulation_logs sl
            LEFT JOIN random_events re ON sl.event_id = re.event_id
            WHERE sl.user_id = ?
            ORDER BY sl.created_at DESC LIMIT 10
        `, [userId]);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// ดึงรายการ saves ทั้งหมดของ user
app.get('/simulation/saves/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [saves] = await db.execute(
            'SELECT save_id, save_name, sim_money, current_day, current_hour, is_active, updated_at FROM simulation_saves WHERE user_id = ? ORDER BY updated_at DESC',
            [userId]
        );
        res.json(saves);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch saves' });
    }
});

// บันทึก simulation (Save)
app.post('/simulation/save', async (req, res) => {
    const { userId, saveName } = req.body;
    try {
        // ดึง active save ปัจจุบัน
        const [active] = await db.execute(
            'SELECT * FROM simulation_saves WHERE user_id = ? AND is_active = 1 LIMIT 1', [userId]
        );
        if (active.length === 0) return res.status(404).json({ error: 'No active simulation' });

        const save = active[0];
        if (saveName) {
            await db.execute('UPDATE simulation_saves SET save_name = ? WHERE save_id = ?', [saveName, save.save_id]);
        }
        // updated_at จะอัปเดตอัตโนมัติ
        await db.execute('UPDATE simulation_saves SET updated_at = CURRENT_TIMESTAMP WHERE save_id = ?', [save.save_id]);
        res.json({ success: true, save_id: save.save_id });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save' });
    }
});

// โหลด simulation (Load) — เปลี่ยน active save
app.post('/simulation/load', async (req, res) => {
    const { userId, saveId } = req.body;
    try {
        // ปิด active save เดิมทั้งหมด
        await db.execute('UPDATE simulation_saves SET is_active = 0 WHERE user_id = ?', [userId]);
        // เปิด save ที่เลือก
        await db.execute('UPDATE simulation_saves SET is_active = 1 WHERE save_id = ? AND user_id = ?', [saveId, userId]);
        res.json({ success: true, save_id: saveId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load save' });
    }
});

// สร้าง save ใหม่ (New Game)
app.post('/simulation/new', async (req, res) => {
    const { userId, saveName } = req.body;
    try {
        // ปิด active save เดิมทั้งหมด
        await db.execute('UPDATE simulation_saves SET is_active = 0 WHERE user_id = ?', [userId]);
        // สร้าง save ใหม่
        const [result] = await db.execute(
            'INSERT INTO simulation_saves (user_id, save_name, is_active) VALUES (?, ?, 1)',
            [userId, saveName || 'New Game']
        );
        res.json({ success: true, save_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create new save' });
    }
});

// ดึง active events ทั้งหมดในปัจจุบัน
app.get('/simulation/events/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [events] = await db.execute(`
            SELECT ae.*, re.event_key, re.name, re.description, re.effect_type,
                   re.severity, re.force_skip_day, re.auto_resolve, re.affected_systems, re.duration_minutes
            FROM simulation_active_events ae
            JOIN random_events re ON ae.event_id = re.event_id
            JOIN simulation_saves s ON ae.save_id = s.save_id
            WHERE s.user_id = ? AND s.is_active = 1 AND ae.is_resolved = 0
        `, [userId]);

        events.forEach(e => {
            if (typeof e.affected_systems === 'string') e.affected_systems = JSON.parse(e.affected_systems);
        });

        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events' });
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
    let sql = `
        SELECT room_id, room_name, host_user_id, status, max_players, current_players,
               CASE WHEN room_password IS NOT NULL AND room_password != '' THEN 1 ELSE 0 END AS has_password
        FROM game_rooms
        WHERE status = 'WAITING'
    `;
    let params = [];
    if (search) {
        sql += ` AND room_name LIKE ?`;
        params.push(`%${search}%`);
    }
    sql += ` ORDER BY created_at DESC`;
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
        if (!roomName || !hostId) {
            return res.status(400).json({ error: 'roomName and hostId are required' });
        }

        const normalizedMaxPlayers = Math.min(5, Math.max(2, Number(maxPlayers) || 2));

        await connection.beginTransaction();
        const [roomResult] = await connection.execute(
            'INSERT INTO game_rooms (room_name, host_user_id, room_password, max_players, current_players) VALUES (?, ?, ?, ?, 1)',
            [roomName.trim(), hostId, password || null, normalizedMaxPlayers]
        );
        const roomId = roomResult.insertId;
        await connection.execute(
            'INSERT INTO room_participants (room_id, user_id, is_ready) VALUES (?, ?, TRUE)',
            [roomId, hostId]
        );
        await connection.commit();
        res.json({ roomId });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Create room error:', err.message);
        res.status(500).json({ error: 'Failed to create room' });
    } finally {
        connection.release();
    }
});

app.get('/rooms/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
        const [room] = await db.execute(`
            SELECT room_id, room_name, host_user_id, status, max_players, current_players,
                   CASE WHEN room_password IS NOT NULL AND room_password != '' THEN 1 ELSE 0 END AS has_password
            FROM game_rooms
            WHERE room_id = ?
        `, [roomId]);
        if (room.length === 0) return res.status(404).json({ error: 'Room not found' });

        const [participants] = await db.execute(`
            SELECT u.user_id, u.username, MAX(rp.is_ready) AS is_ready
            FROM room_participants rp
            JOIN users u ON rp.user_id = u.user_id
            WHERE rp.room_id = ?
            GROUP BY u.user_id, u.username
            ORDER BY MIN(rp.joined_at) ASC
        `, [roomId]);

        res.json({ room: room[0], players: participants });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/rooms/join', async (req, res) => {
    const { roomId, userId, password } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [rooms] = await connection.execute(
            'SELECT room_id, host_user_id, max_players, current_players, room_password FROM game_rooms WHERE room_id = ? FOR UPDATE',
            [roomId]
        );
        if (rooms.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Room not found' });
        }

        const [check] = await connection.execute(
            'SELECT id FROM room_participants WHERE room_id = ? AND user_id = ? LIMIT 1',
            [roomId, userId]
        );
        if (check.length === 0) {
            if (rooms[0].room_password && rooms[0].room_password !== password) {
                await connection.rollback();
                return res.status(401).json({ error: 'Incorrect room password' });
            }
            const [counts] = await connection.execute(
                'SELECT COUNT(DISTINCT user_id) AS player_count FROM room_participants WHERE room_id = ?',
                [roomId]
            );
            if (counts[0].player_count >= rooms[0].max_players) {
                await connection.rollback();
                return res.status(400).json({ error: 'Room is full' });
            }
            await connection.execute('INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)', [roomId, userId]);
        }
        await connection.execute(
            'UPDATE game_rooms SET current_players = (SELECT COUNT(DISTINCT user_id) FROM room_participants WHERE room_id = ?) WHERE room_id = ?',
            [roomId, roomId]
        );
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Join room error:', err.message);
        res.status(500).json({ error: 'Failed to join' });
    } finally {
        connection.release();
    }
});

app.post('/rooms/leave', async (req, res) => {
    const { roomId, userId } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [rooms] = await connection.execute(
            'SELECT room_id, host_user_id FROM game_rooms WHERE room_id = ? FOR UPDATE',
            [roomId]
        );
        if (rooms.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Room not found' });
        }

        const isHostLeaving = Number(rooms[0].host_user_id) === Number(userId);

        if (isHostLeaving) {
            await connection.execute('DELETE FROM room_participants WHERE room_id = ?', [roomId]);
            await connection.execute('DELETE FROM game_rooms WHERE room_id = ?', [roomId]);
        } else {
            await connection.execute('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?', [roomId, userId]);
            const [countResult] = await connection.execute(
                'SELECT COUNT(DISTINCT user_id) as count FROM room_participants WHERE room_id = ?',
                [roomId]
            );
            const remaining = countResult[0].count;

            if (remaining === 0) {
                await connection.execute('DELETE FROM game_rooms WHERE room_id = ?', [roomId]);
            } else {
                await connection.execute('UPDATE game_rooms SET current_players = ? WHERE room_id = ?', [remaining, roomId]);
            }
        }
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Leave room error:', err.message);
        res.status(500).json({ error: 'Failed to leave' });
    } finally {
        connection.release();
    }
});


//สวิตช์สลับโหมดดึงข้อมูล 
const USE_AI_GENERATOR = false;

app.post('/jobs/accept-v2', async (req, res) => {
    const { jobId, userId } = req.body;
    if (!jobId || !userId) {
        return res.status(400).json({ message: 'jobId and userId are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [saveRows] = await connection.execute(
            'SELECT save_id, current_day FROM simulation_saves WHERE user_id = ? AND is_active = 1 LIMIT 1',
            [userId]
        );
        const activeSave = saveRows[0];
        const currentDay = Number(activeSave?.current_day || 1);

        const [activeJobRows] = await connection.execute(
            `SELECT uc.id AS user_contract_id, c.reward, c.penalty, c.difficulty, c.title, c.ai_requirements
             FROM user_contracts uc
             JOIN contracts c ON uc.contract_id = c.contract_id
             WHERE uc.user_id = ? AND uc.contract_id = ? AND uc.status = 'ACTIVE'
             LIMIT 1`,
            [userId, jobId]
        );

        if (activeJobRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'ไม่พบงานนี้ หรือถูกส่งไปแล้ว' });
        }

        const activeJob = activeJobRows[0];
        const review = evaluateJobSubmission({
            contract: activeJob,
            fileName,
            fileContent,
        });

        if (review.verdict !== 'PASSED') {
            const penaltyAmount = Number(review.reviewFee || 0);
            const reputationPenalty = Math.abs(Number(review.reputationDelta || 0));

            await connection.execute(
                `UPDATE simulation_saves
                 SET sim_reputation = GREATEST(0, sim_reputation - ?),
                     sim_money = GREATEST(0, sim_money - ?),
                     total_spent = total_spent + ?
                 WHERE user_id = ? AND is_active = 1`,
                [reputationPenalty, penaltyAmount, penaltyAmount, userId]
            );

            if (penaltyAmount > 0) {
                await insertLedgerEntry(connection, {
                    userId,
                    type: 'EXPENSE',
                    category: 'JOB_REVIEW_FEE',
                    amount: penaltyAmount,
                    description: `Review fee for contract #${jobId}${fileName ? ` (${fileName})` : ''}`,
                });
            }

            if (activeSave?.save_id) {
                await connection.execute(
                    'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                    [
                        userId,
                        activeSave.save_id,
                        review.verdict === 'REVISION_REQUIRED' ? 'JOB_REVISION' : 'JOB_REJECTED',
                        `${review.verdict} contract #${jobId} on day ${currentDay} (score ${review.score})`,
                    ]
                );
            }

            await connection.commit();
            return res.json({
                success: false,
                verdict: review.verdict,
                message: review.verdict === 'REVISION_REQUIRED'
                    ? 'งานยังไม่ผ่าน แต่ยังส่งแก้ไขใหม่ได้'
                    : 'งานถูกตีกลับ ต้องแก้ไขก่อนส่งใหม่',
                qualityScore: review.score,
                feedback: review.feedback,
                matchedKeywords: review.matchedKeywords,
                reputationChange: review.reputationDelta,
                reviewFee: penaltyAmount,
            });
        }

        const [existing] = await connection.execute(
            "SELECT id FROM user_contracts WHERE user_id = ? AND contract_id = ? AND status = 'ACTIVE'",
            [userId, jobId]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'คุณกำลังทำงานนี้อยู่แล้ว ไปที่ My Contracts เพื่อทำต่อ' });
        }

        const [claimResult] = await connection.execute(
            "UPDATE contracts SET status = 'ACTIVE' WHERE contract_id = ? AND status = 'OFFERED'",
            [jobId]
        );

        if (claimResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'งานนี้ไม่เปิดรับแล้ว หรือมีคนรับไปก่อนแล้ว' });
        }

        await connection.execute(
            `INSERT INTO user_contracts (user_id, contract_id, status, accepted_day, carried_days, status_reason)
             VALUES (?, ?, 'ACTIVE', ?, 0, 'PLAYER_ACCEPTED')`,
            [userId, jobId, currentDay]
        );

        if (activeSave?.save_id) {
            await connection.execute(
                'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                [userId, activeSave.save_id, 'JOB_ACCEPTED', `Accepted contract #${jobId} on day ${currentDay}`]
            );
        }

        await connection.commit();
        return res.json({ message: 'รับงานสำเร็จ', jobId, acceptedDay: currentDay });
    } catch (err) {
        await connection.rollback();
        console.error('❌ SQL Error in /jobs/accept-v2:', err);
        return res.status(500).json({ message: 'Failed to accept job' });
    } finally {
        connection.release();
    }
});

app.get('/jobs/my-active-v2/:userId', async (req, res) => {
    if (isGuestUserId(req.params.userId)) {
        return res.send([]);
    }

    const sql = `
        SELECT c.*, uc.accepted_at, uc.accepted_day, uc.carried_days, uc.status, uc.status_reason,
               uc.completed_day, uc.failed_day, uc.id as user_contract_id
        FROM user_contracts uc
        JOIN contracts c ON uc.contract_id = c.contract_id
        WHERE uc.user_id = ? AND uc.status = 'ACTIVE'
        ORDER BY uc.accepted_at DESC
    `;
    try {
        const [result] = await db.query(sql, [req.params.userId]);
        return res.send(result.map(formatJobStatus));
    } catch (err) {
        console.error('❌ SQL Error in /jobs/my-active-v2:', err);
        return res.status(500).send(err);
    }
});

app.get('/jobs/history-v3/:userId', async (req, res) => {
    if (isGuestUserId(req.params.userId)) {
        return res.send([]);
    }

    const sql = `
        SELECT c.*, uc.accepted_at, uc.accepted_day, uc.carried_days, uc.status, uc.status_reason,
               uc.completed_day, uc.failed_day, uc.id as user_contract_id
        FROM user_contracts uc
        JOIN contracts c ON uc.contract_id = c.contract_id
        WHERE uc.user_id = ? AND uc.status <> 'ACTIVE'
        ORDER BY COALESCE(uc.completed_day, uc.failed_day, uc.accepted_day, 0) DESC, uc.accepted_at DESC
        LIMIT 40
    `;
    try {
        const [result] = await db.query(sql, [req.params.userId]);
        return res.send(result.map(formatJobStatus));
    } catch (err) {
        console.error('❌ SQL Error in /jobs/history-v3:', err);
        return res.status(500).send(err);
    }
});

app.post('/jobs/submit-v2', async (req, res) => {
    const { jobId, userId, fileName, fileContent } = req.body;
    if (!jobId || !userId) {
        return res.status(400).json({ error: 'jobId and userId are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [saveRows] = await connection.execute(
            'SELECT save_id, current_day FROM simulation_saves WHERE user_id = ? AND is_active = 1 LIMIT 1',
            [userId]
        );
        const activeSave = saveRows[0];
        const currentDay = Number(activeSave?.current_day || 1);

        const [updateResult] = await connection.execute(
            `UPDATE user_contracts
             SET status = 'COMPLETED',
                 status_reason = 'SUBMITTED',
                 completed_day = ?,
                 failed_day = NULL
             WHERE user_id = ? AND contract_id = ? AND status = 'ACTIVE'`,
            [currentDay, userId, jobId]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'ไม่พบงานนี้ หรือถูกส่งไปแล้ว' });
        }

        const [jobRows] = await connection.execute(
            'SELECT reward FROM contracts WHERE contract_id = ?',
            [jobId]
        );
        const reward = jobRows[0]?.reward || 0;

        await connection.execute(
            "UPDATE contracts SET status = 'COMPLETED' WHERE contract_id = ?",
            [jobId]
        );

        await connection.execute(
            `UPDATE simulation_saves
             SET sim_money = sim_money + ?, sim_reputation = sim_reputation + ?,
                 jobs_completed = jobs_completed + 1, total_earned = total_earned + ?
             WHERE user_id = ? AND is_active = 1`,
            [reward, 5, reward, userId]
        );

        await insertLedgerEntry(connection, {
            userId,
            type: 'INCOME',
            category: 'JOB_REWARD',
            amount: reward,
            description: `Reward from contract #${jobId}${fileName ? ` (${fileName})` : ''}`,
        });

        if (activeSave?.save_id) {
            await connection.execute(
                'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                [userId, activeSave.save_id, 'JOB_COMPLETED', `Completed contract #${jobId} on day ${currentDay}`]
            );
        }

        await connection.commit();
        return res.json({ success: true, message: `ส่งงานสำเร็จ! ได้รับ ${reward} ฿`, reward, completedDay: currentDay });
    } catch (err) {
        await connection.rollback();
        console.error('❌ SQL Error in /jobs/submit-v2:', err);
        return res.status(500).json({ error: 'Failed to submit job' });
    } finally {
        connection.release();
    }
});

//1. ดึงงานที่เปิดรับ (Job Feed) 
app.post('/jobs/accept-v3', async (req, res) => {
    const { jobId, userId } = req.body;
    if (!jobId || !userId) {
        return res.status(400).json({ message: 'jobId and userId are required' });
    }

    if (isGuestUserId(userId)) {
        return res.status(400).json({ message: 'Guest mode cannot accept jobs. Please log in to save job progress.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [saveRows] = await connection.execute(
            'SELECT save_id, current_day FROM simulation_saves WHERE user_id = ? AND is_active = 1 LIMIT 1',
            [userId]
        );
        const activeSave = saveRows[0];
        const currentDay = Number(activeSave?.current_day || 1);

        const [existing] = await connection.execute(
            "SELECT id FROM user_contracts WHERE user_id = ? AND contract_id = ? AND status = 'ACTIVE'",
            [userId, jobId]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'คุณกำลังทำงานนี้อยู่แล้ว ไปที่ My Jobs เพื่อทำต่อ' });
        }

        const [claimResult] = await connection.execute(
            "UPDATE contracts SET status = 'ACTIVE' WHERE contract_id = ? AND status = 'OFFERED'",
            [jobId]
        );

        if (claimResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'งานนี้ไม่เปิดรับแล้ว หรือมีคนรับไปก่อนแล้ว' });
        }

        await connection.execute(
            `INSERT INTO user_contracts (user_id, contract_id, status, accepted_day, carried_days, status_reason)
             VALUES (?, ?, 'ACTIVE', ?, 0, 'PLAYER_ACCEPTED')`,
            [userId, jobId, currentDay]
        );

        if (activeSave?.save_id) {
            await connection.execute(
                'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                [userId, activeSave.save_id, 'JOB_ACCEPTED', `Accepted contract #${jobId} on day ${currentDay}`]
            );
        }

        await connection.commit();
        return res.json({ success: true, message: 'รับงานสำเร็จ', jobId, acceptedDay: currentDay });
    } catch (err) {
        await connection.rollback();
        console.error('❌ SQL Error in /jobs/accept-v3:', err);
        return res.status(500).json({ message: 'Failed to accept job' });
    } finally {
        connection.release();
    }
});

app.post('/jobs/submit-v3', async (req, res) => {
    const { jobId, userId, fileName, fileContent } = req.body;
    if (!jobId || !userId) {
        return res.status(400).json({ error: 'jobId and userId are required' });
    }

    if (isGuestUserId(userId)) {
        return res.status(400).json({ error: 'Guest mode cannot submit jobs. Please log in to save job progress.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [saveRows] = await connection.execute(
            'SELECT save_id, current_day FROM simulation_saves WHERE user_id = ? AND is_active = 1 LIMIT 1',
            [userId]
        );
        const activeSave = saveRows[0];
        const currentDay = Number(activeSave?.current_day || 1);

        const [activeJobRows] = await connection.execute(
            `SELECT uc.id AS user_contract_id, c.reward, c.penalty, c.difficulty, c.title, c.ai_requirements
             FROM user_contracts uc
             JOIN contracts c ON uc.contract_id = c.contract_id
             WHERE uc.user_id = ? AND uc.contract_id = ? AND uc.status = 'ACTIVE'
             LIMIT 1`,
            [userId, jobId]
        );

        if (activeJobRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'ไม่พบงานนี้ หรือถูกส่งไปแล้ว' });
        }

        const activeJob = activeJobRows[0];
        const review = evaluateJobSubmission({
            contract: activeJob,
            fileName,
            fileContent,
        });

        if (review.verdict !== 'PASSED') {
            const penaltyAmount = Number(review.reviewFee || 0);
            const reputationPenalty = Math.abs(Number(review.reputationDelta || 0));

            await connection.execute(
                `UPDATE simulation_saves
                 SET sim_reputation = GREATEST(0, sim_reputation - ?),
                     sim_money = GREATEST(0, sim_money - ?),
                     total_spent = total_spent + ?
                 WHERE user_id = ? AND is_active = 1`,
                [reputationPenalty, penaltyAmount, penaltyAmount, userId]
            );

            if (penaltyAmount > 0) {
                await insertLedgerEntry(connection, {
                    userId,
                    type: 'EXPENSE',
                    category: 'JOB_REVIEW_FEE',
                    amount: penaltyAmount,
                    description: `Review fee for contract #${jobId}${fileName ? ` (${fileName})` : ''}`,
                });
            }

            if (activeSave?.save_id) {
                await connection.execute(
                    'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                    [
                        userId,
                        activeSave.save_id,
                        review.verdict === 'REVISION_REQUIRED' ? 'JOB_REVISION' : 'JOB_REJECTED',
                        `${review.verdict} contract #${jobId} on day ${currentDay} (score ${review.score})`,
                    ]
                );
            }

            await connection.commit();
            return res.json({
                success: false,
                verdict: review.verdict,
                message: review.verdict === 'REVISION_REQUIRED'
                    ? 'งานยังไม่ผ่าน แต่ยังส่งแก้ไขใหม่ได้'
                    : 'งานถูกตีกลับ ต้องแก้ไขก่อนส่งใหม่',
                qualityScore: review.score,
                feedback: review.feedback,
                matchedKeywords: review.matchedKeywords,
                reputationChange: review.reputationDelta,
                reviewFee: penaltyAmount,
            });
        }

        const reward = Number(activeJob.reward || 0);
        const reputationGain = Number(review.reputationDelta || 0);

        await connection.execute(
            `UPDATE user_contracts
             SET status = 'COMPLETED',
                 status_reason = 'SUBMITTED',
                 completed_day = ?,
                 failed_day = NULL
             WHERE id = ?`,
            [currentDay, activeJob.user_contract_id]
        );

        await connection.execute(
            "UPDATE contracts SET status = 'COMPLETED' WHERE contract_id = ?",
            [jobId]
        );

        await connection.execute(
            `UPDATE simulation_saves
             SET sim_money = sim_money + ?, sim_reputation = sim_reputation + ?,
                 jobs_completed = jobs_completed + 1, total_earned = total_earned + ?
             WHERE user_id = ? AND is_active = 1`,
            [reward, reputationGain, reward, userId]
        );

        await insertLedgerEntry(connection, {
            userId,
            type: 'INCOME',
            category: 'JOB_REWARD',
            amount: reward,
            description: `Reward from contract #${jobId}${fileName ? ` (${fileName})` : ''}`,
        });

        if (activeSave?.save_id) {
            await connection.execute(
                'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                [userId, activeSave.save_id, 'JOB_COMPLETED', `Completed contract #${jobId} on day ${currentDay} (score ${review.score})`]
            );
        }

        await connection.commit();
        return res.json({
            success: true,
            verdict: 'PASSED',
            message: `ส่งงานสำเร็จ! ได้รับ ${reward} ฿`,
            reward,
            qualityScore: review.score,
            reputationChange: reputationGain,
            feedback: review.feedback,
            completedDay: currentDay
        });
    } catch (err) {
        await connection.rollback();
        console.error('❌ SQL Error in /jobs/submit-v3:', err);
        return res.status(500).json({ error: 'Failed to submit job' });
    } finally {
        connection.release();
    }
});

app.get('/jobs/available', async (req, res) => {
    try {
        const userId = req.query.userId;
        let level = 'Beginner';

        if (userId && !isGuestUserId(userId)) {
            const [users] = await db.execute('SELECT level FROM users WHERE user_id = ? LIMIT 1', [userId]);
            if (users.length > 0) level = users[0].level;
        }

        await ensureFallbackJobsAvailable(db, { level, minimum: 4 });
        await ensureExistingContractPenalties(db);
        const [result] = await db.query("SELECT * FROM contracts WHERE status = 'OFFERED' ORDER BY created_at DESC");
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

//2. รับงาน
app.post('/jobs/accept', async (req, res) => {
    const { jobId, userId } = req.body;
    try {
        //เช็คก่อนว่าผู้เล่นคนนี้ รับงานนี้ไปแล้วและยังทำไม่เสร็จหรือเปล่า?
        const checkSql = "SELECT * FROM user_contracts WHERE user_id = ? AND contract_id = ? AND status = 'ACTIVE'";
        const [existing] = await db.query(checkSql, [userId, jobId]);

        if (existing.length > 0) {
            return res.status(400).send({ message: "คุณกำลังทำงานนี้อยู่แล้ว ไปที่ My Contracts เพื่อทำต่อ" });
        }

        // บันทึกว่า User รับงานนี้
        const insertSql = "INSERT INTO user_contracts (user_id, contract_id, status) VALUES (?, ?, 'ACTIVE')";
        await db.query(insertSql, [userId, jobId]);

        res.send({ message: "รับงานสำเร็จ", jobId });
    } catch (err) {
        console.error("❌ SQL Error in /jobs/accept:", err);
        res.status(500).send(err);
    }
});

//3. ดึงงานที่กำลังทำอยู่ (My Contracts)
app.get('/jobs/my-active/:userId', async (req, res) => {
    // ดึงข้อมูลงาน จากตาราง contracts โดยเชื่อมกับ user_contracts
    const sql = `
        SELECT c.*, uc.accepted_at, uc.id as user_contract_id
        FROM user_contracts uc
        JOIN contracts c ON uc.contract_id = c.contract_id
        WHERE uc.user_id = ? AND uc.status = 'ACTIVE'
    `;
    try {
        const [result] = await db.query(sql, [req.params.userId]);
        res.send(result);
    } catch (err) {
        console.error("❌ SQL Error in /jobs/my-active:", err);
        res.status(500).send(err);
    }
});

//4. ส่งงาน (Submit Job)
app.post('/jobs/submit', async (req, res) => {
    const { jobId, userId, fileName } = req.body;
    if (!jobId || !userId) {
        return res.status(400).json({ error: 'jobId and userId are required' });
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. อัปเดตสถานะ user_contracts เป็น COMPLETED
        const [updateResult] = await connection.execute(
            "UPDATE user_contracts SET status = 'COMPLETED' WHERE user_id = ? AND contract_id = ? AND status = 'ACTIVE'",
            [userId, jobId]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'ไม่พบงานนี้ หรืองานถูกส่งไปแล้ว' });
        }

        // 2. ดึงข้อมูล reward ของงาน
        const [jobRows] = await connection.execute(
            'SELECT reward FROM contracts WHERE contract_id = ?', [jobId]
        );
        const reward = jobRows[0]?.reward || 0;

        // 3. เพิ่มเงินและ reputation ใน simulation_saves + เพิ่ม jobs_completed
        await connection.execute(
            `UPDATE simulation_saves 
             SET sim_money = sim_money + ?, sim_reputation = sim_reputation + ?,
                jobs_completed = jobs_completed + 1, total_earned = total_earned + ?
             WHERE user_id = ? AND is_active = 1`,
            [reward, 5, reward, userId]
        );

        await insertLedgerEntry(connection, {
            userId,
            type: 'INCOME',
            category: 'JOB_REWARD',
            amount: reward,
            description: `Reward from contract #${jobId}${fileName ? ` (${fileName})` : ''}`,
        });

        await connection.commit();
        res.json({ success: true, message: `ส่งงานสำเร็จ! ได้รับ ${reward} ฿`, reward });
    } catch (err) {
        await connection.rollback();
        console.error("❌ SQL Error in /jobs/submit:", err);
        res.status(500).json({ error: 'Failed to submit job' });
    } finally {
        connection.release();
    }
});

// ==========================================
// 5. API: Profile (Public)
// ==========================================

// ดึงข้อมูลโปรไฟล์สาธารณะ (cosmetics, showcase achievements)
app.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [users] = await db.execute(`
            SELECT u.user_id, u.username, u.reputation, u.avatar_url, u.bio, u.created_at,
                   t.name as theme_name, COALESCE(t.effects, '{}') as theme_data,
                   m.name as mouse_effect_name, COALESCE(m.effects, '{}') as mouse_effect_data,
                   f.name as frame_name, COALESCE(f.effects, '{}') as frame_data
            FROM users u
            LEFT JOIN shop_items t ON u.equipped_theme_id = t.item_id
            LEFT JOIN shop_items m ON u.equipped_mouse_effect_id = m.item_id
            LEFT JOIN shop_items f ON u.equipped_profile_frame_id = f.item_id
            WHERE u.user_id = ?
        `, [userId]);

        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = users[0];
        // Parse JSON preview data
        ['theme_data', 'mouse_effect_data', 'frame_data'].forEach(key => {
            if (typeof user[key] === 'string') user[key] = JSON.parse(user[key]);
        });

        // ดึง showcase achievements
        const [showcase] = await db.execute(`
            SELECT a.achievement_id, a.name, a.description, a.difficulty, a.reward_money,
                   ps.display_order
            FROM user_profile_showcase ps
            JOIN achievements a ON ps.achievement_id = a.achievement_id
            WHERE ps.user_id = ?
            ORDER BY ps.display_order ASC
            LIMIT 5
        `, [userId]);

        // ดึงสถิติ simulation ล่าสุด
        const [stats] = await db.execute(
            'SELECT jobs_completed, total_earned, current_day FROM simulation_saves WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        res.json({
            ...user,
            showcase_achievements: showcase,
            stats: stats[0] || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 5.5 API: Assets (อุปกรณ์)
// ==========================================

// ดึงอุปกรณ์ทั้งหมดของ user
app.get('/assets/:userId', async (req, res) => {
    try {
        const [assets] = await db.execute('SELECT * FROM assets WHERE user_id = ? ORDER BY type, name', [req.params.userId]);
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

// ==========================================
// 5.6 API: Financial Ledger (บัญชีรายรับ-รายจ่าย)
// ==========================================

// ดึงรายการบัญชีของ user
app.get('/finance/:userId', async (req, res) => {
    const { userId } = req.params;
    const { limit } = req.query;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM financial_ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, parseInt(limit) || 20]
        );
        // สรุปยอด
        const [summary] = await db.execute(
            `SELECT 
                SUM(CASE WHEN type='INCOME' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END) as total_expense
             FROM financial_ledger WHERE user_id = ?`,
            [userId]
        );
        res.json({ transactions: rows, summary: summary[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch ledger' });
    }
});

// บันทึกรายรับ-รายจ่าย
app.post('/finance/add', async (req, res) => {
    const { userId, type, category, amount, description } = req.body;
    if (!userId || !type || !category || !amount) {
        return res.status(400).json({ error: 'userId, type, category, amount are required' });
    }
    try {
        await db.execute(
            'INSERT INTO financial_ledger (user_id, type, category, amount, description) VALUES (?, ?, ?, ?, ?)',
            [userId, type, category, amount, description || null]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

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
app.get('/locations', async (req, res) => {
    try {
        const [locs] = await db.execute('SELECT * FROM locations ORDER BY entry_fee ASC');
        res.json(locs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

// ย้ายสถานที่ (ใน simulation)
app.post('/simulation/move-location', async (req, res) => {
    const { userId, locationId } = req.body;
    try {
        // ตรวจสอบสถานที่
        const [locs] = await db.execute('SELECT * FROM locations WHERE location_id = ?', [locationId]);
        if (locs.length === 0) return res.status(404).json({ error: 'Location not found' });

        const location = locs[0];

        // หักค่าเข้า (ถ้ามี)
        if (parseFloat(location.entry_fee) > 0) {
            const [saves] = await db.execute('SELECT sim_money FROM simulation_saves WHERE user_id = ? AND is_active = 1', [userId]);
            if (saves.length === 0 || parseFloat(saves[0].sim_money) < parseFloat(location.entry_fee)) {
                return res.status(400).json({ error: 'เงินไม่พอสำหรับค่าเข้าสถานที่' });
            }
            await db.execute(
                'UPDATE simulation_saves SET sim_money = sim_money - ?, total_spent = total_spent + ? WHERE user_id = ? AND is_active = 1',
                [location.entry_fee, location.entry_fee, userId]
            );
            await insertLedgerEntry(db, {
                userId,
                type: 'EXPENSE',
                category: 'TRAVEL',
                amount: Number(location.entry_fee),
                description: `Entry fee for ${location.name}`,
            });
        }

        // อัปเดต location
        await db.execute('UPDATE simulation_saves SET current_location_id = ? WHERE user_id = ? AND is_active = 1', [locationId, userId]);
        res.json({ success: true, location: location });
    } catch (err) {
        res.status(500).json({ error: 'Failed to move location' });
    }
});

// ==========================================
// 6. API: Shop & Inventory
// ==========================================

// ดึงสินค้าทั้งหมดในร้าน
app.get('/shop/items', async (req, res) => {
    const { type } = req.query;
    let sql = `
        SELECT item_id, name, description, item_type AS type, price, asset_url, preview_image,
               effects AS preview_data, is_active AS is_available
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

// ดึง inventory ของ user
app.get('/shop/inventory/:userId', async (req, res) => {
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

// ซื้อสินค้า
app.post('/shop/buy', async (req, res) => {
    const { userId, itemId } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ตรวจสอบว่ามีสินค้านี้อยู่
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
        if (price > 0) {
        const [saves] = await connection.execute('SELECT sim_money FROM simulation_saves WHERE user_id = ? AND is_active = 1', [userId]);
        if (saves.length === 0 || Number(saves[0].sim_money) < price) {
            await connection.rollback();
            return res.status(400).json({ error: 'เงินไม่พอ' });
        }

        // หักเงินจาก simulation
        await connection.execute(
            'UPDATE simulation_saves SET sim_money = sim_money - ?, total_spent = total_spent + ? WHERE user_id = ? AND is_active = 1',
            [price, price, userId]
        );
        await insertLedgerEntry(connection, {
            userId,
            type: 'EXPENSE',
            category: 'SHOP',
            amount: price,
            description: `Purchased ${item.name}`,
        });
        }

        // เพิ่มเข้า inventory
        await connection.execute('INSERT INTO user_inventory (user_id, item_id) VALUES (?, ?)', [userId, itemId]);

        await connection.commit();
        res.json({ success: true, message: `ซื้อ ${item.name} สำเร็จ!` });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'Failed to purchase item' });
    } finally {
        connection.release();
    }
});

// สวมใส่ cosmetic
app.post('/shop/equip', async (req, res) => {
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
            const [owned] = await db.execute('SELECT * FROM user_inventory WHERE user_id = ? AND item_id = ?', [userId, itemId]);
            if (owned.length === 0) return res.status(400).json({ error: 'คุณไม่มีไอเทมนี้' });
        }

        await db.execute(`UPDATE users SET ${column} = ? WHERE user_id = ?`, [itemId || null, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to equip item' });
    }
});

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
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        // Decode Google JWT token (ไม่ต้อง verify แบบเต็มถ้าใช้ Google Identity Services)
        const parts = token.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        const { email, name, sub: googleId, picture } = payload;

        if (!email) return res.status(400).json({ message: 'ไม่สามารถดึงอีเมลจาก Google ได้' });

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
        res.status(500).json({ message: 'Google authentication failed' });
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
app.get('/api/course-content', async (req, res) => {
    try {
        const currentLevel = Number(req.query.user_level || req.query.userLevel || 0);
        const [modules, lessons] = await Promise.all([
            db.execute('SELECT module_id, title, order_index, required_level FROM modules ORDER BY order_index'),
            db.execute('SELECT lesson_id, module_id, title, order_index, required_level FROM lessons ORDER BY order_index'),
        ]);

        const moduleRows = Array.isArray(modules?.[0]) ? modules[0] : [];
        const lessonRows = Array.isArray(lessons?.[0]) ? lessons[0] : [];

        const data = moduleRows.map((m) => ({
            module_id: m.module_id,
            title: m.title,
            required_level: m.required_level || 0,
            is_locked: currentLevel < Number(m.required_level || 0),
            lessons: lessonRows
                .filter(l => l.module_id === m.module_id)
                .map(l => ({
                    lesson_id: l.lesson_id,
                    id: l.lesson_id,
                    title: l.title,
                    required_level: l.required_level || 0,
                    is_locked: currentLevel < Number(l.required_level || 0),
                    completed_count: 0,
                    total_count: 10
                }))
        }));
        res.json(data);
    } catch (err) {
        const message = logRouteError('❌ Course Content Error:', err);
        res.status(500).json({ error: message });
    }
});

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
             ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                total_questions = VALUES(total_questions),
                answers_json = VALUES(answers_json),
                completed_at = current_timestamp(),
                updated_at = current_timestamp()`,
            [userId, lessonId, quizType, score, totalQuestions, answersJson]
        );

        res.json({
            success: true,
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

// --- Lesson Exercises ---
app.get('/api/exercises/list/:lessonId', async (req, res) => {
    try {
        await ensureLessonExercisesSeeded();
        await ensureLessonExerciseExists(req.params.lessonId);
        const [rows] = await db.execute(
            `SELECT exercise_id, lesson_id, title, description, starter_code, test_cases, xp_reward, currency_reward
             FROM exercises
             WHERE lesson_id = ?
             ORDER BY exercise_id ASC`,
            [req.params.lessonId]
        );
        res.json(rows);
    } catch (err) {
        logRouteError('❌ Exercises list error:', err);
        res.status(500).json({ error: describeError(err) });
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

app.get('/api/exercises/:lessonId', async (req, res) => {
    try {
        await ensureLessonExercisesSeeded();
        const { lessonId } = req.params;
        await ensureLessonExerciseExists(lessonId);
        if (lessonId === 'list' || lessonId === 'progress') {
            return res.status(404).json({ error: 'not found' });
        }

        const [rows] = await db.execute(
            `SELECT exercise_id, lesson_id, title, description, starter_code, test_cases, xp_reward, currency_reward
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

app.get('/api/lessons/:lessonId/exercise', async (req, res) => {
    try {
        await ensureLessonExercisesSeeded();
        await ensureLessonExerciseExists(req.params.lessonId);
        const [rows] = await db.execute(
            `SELECT exercise_id, lesson_id, title, description, starter_code, test_cases, xp_reward, currency_reward
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
                     SET submitted_code = ?, is_passed = true, submitted_at = CURRENT_TIMESTAMP
                     WHERE submission_id = ?`,
                    [submitted_code || '', existingSubmissionId]
                );
            } else {
                await db.execute(
                    `INSERT INTO exercise_submissions (user_id, exercise_id, submitted_code, is_passed, score)
                     VALUES (?, ?, ?, true, 100)`,
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

        await db.execute(
            `UPDATE users
             SET xp = xp + ?, virtual_currency = virtual_currency + ?
             WHERE user_id = ?`,
            [rewardXp, rewardCoins, user_id]
        );

        const [selectedUsers] = await db.execute(
            'SELECT user_id, username, level, xp, virtual_currency FROM users WHERE user_id = ? LIMIT 1',
            [user_id]
        );
        const updatedUser = selectedUsers[0] || null;

        res.json({
            success: true,
            xp_reward: rewardXp,
            currency_reward: rewardCoins,
            user: updatedUser,
        });
    } catch (err) {
        logRouteError('❌ Exercise submit error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

// --- MiNi Game Modules API ---
// The route name still says "modules" because the client already uses it, but the data now
// comes from the current mini_game_lessons / mini_game_exercises schema.
app.get('/api/mini-game/modules', async (_req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT lesson_id AS module_id,
                    lesson_id,
                    lesson_key,
                    title,
                    sort_order AS order_index,
                    is_active
             FROM mini_game_lessons
             WHERE is_active = 1
             ORDER BY sort_order ASC, lesson_id ASC`
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

        const [lessonRows] = await db.execute(
            `SELECT lesson_id, lesson_key, title, description, sort_order, is_active
             FROM mini_game_lessons
             WHERE lesson_id = ?
               AND is_active = 1
             LIMIT 1`,
            [lessonId]
        );

        if (lessonRows.length === 0) {
            return res.status(404).json({ error: 'MiNi Game lesson not found' });
        }

        const [exerciseRows] = await db.execute(
            `SELECT exercise_id AS mini_game_module_id,
                    exercise_id,
                    lesson_id AS module_id,
                    lesson_id,
                    title,
                    exercise_order AS order_index,
                    xp_reward AS reward_xp,
                    currency_reward AS reward_coins,
                    description AS hint,
                    starter_code,
                    NULL AS validation_mode,
                    JSON_ARRAY('print') AS required_syntax_json,
                    JSON_ARRAY() AS required_vars_json,
                    test_cases_json,
                    'แบบฝึกหัดผ่านแล้ว' AS success_message,
                    0 AS submit_unlock_step,
                    'minigame01.jpg' AS scene_background_image,
                    is_active
             FROM mini_game_exercises
             WHERE lesson_id = ?
               AND is_active = 1
             ORDER BY CAST(exercise_order AS UNSIGNED) ASC, exercise_order ASC, exercise_id ASC`,
            [lessonId]
        );

        if (exerciseRows.length === 0) {
            return res.status(404).json({ error: 'No mini game exercises found for this lesson' });
        }

        const exerciseIds = exerciseRows.map((row) => row.exercise_id);
        const placeholders = exerciseIds.map(() => '?').join(',');

        const [dialogueRows] = await db.execute(
            `SELECT d.dialogue_id,
                    d.exercise_id AS mini_game_module_id,
                    d.exercise_id,
                    d.dialogue_order AS step_index,
                    COALESCE(n.npc_key, 'system') AS speaker,
                    d.dialogue_text,
                    d.npc_emotion AS emotion,
                    d.dialogue_phase,
                    d.branch_key,
                    l.bg_image_url,
                    l.location_key,
                    l.name AS location_name
             FROM mini_game_dialogues d
             LEFT JOIN mini_game_npcs n ON n.npc_id = d.npc_id
             LEFT JOIN mini_game_locations l ON l.location_id = d.location_id
             WHERE d.exercise_id IN (${placeholders})
             ORDER BY d.exercise_id ASC, d.dialogue_phase ASC, d.branch_key ASC, d.dialogue_order ASC, d.dialogue_id ASC`,
            exerciseIds
        );

        let choiceRows = [];
        if (dialogueRows.length > 0) {
            const dialogueIds = dialogueRows.map((row) => row.dialogue_id);
            const dialoguePlaceholders = dialogueIds.map(() => '?').join(',');
            [choiceRows] = await db.execute(
                `SELECT choice_id,
                        dialogue_id,
                        choice_order AS sort_order,
                        choice_text,
                        next_branch_key AS branch_key,
                        'pre_submit' AS next_dialogue_phase,
                        next_dialogue_order AS next_step_index,
                        NULL AS feedback_text,
                        NULL AS emotion,
                        NULL AS ending_key,
                        NULL AS effect_json
                 FROM mini_game_dialogue_choices
                 WHERE dialogue_id IN (${dialoguePlaceholders})
                 ORDER BY dialogue_id ASC, choice_order ASC, choice_id ASC`,
                dialogueIds
            );
        }

        const subtopics = exerciseRows.map((row) => {
            const dialogues = dialogueRows
                .filter((dialogue) => dialogue.exercise_id === row.exercise_id)
                .map((dialogue) => ({
                    ...dialogue,
                    choices: choiceRows.filter((choice) => choice.dialogue_id === dialogue.dialogue_id),
                }));
            return {
                ...row,
                dialogues,
                dialogue_choices: choiceRows.filter((choice) =>
                    dialogues.some((dialogue) => dialogue.dialogue_id === choice.dialogue_id)
                ),
                dialogue_branches: [],
                terminal_logic: [],
            };
        });

        const rewardXp = subtopics.reduce((total, row) => total + Number(row.reward_xp || 0), 0);
        const rewardCoins = subtopics.reduce((total, row) => total + Number(row.reward_coins || 0), 0);
        const first = subtopics[0];

        res.json({
            ...first,
            module_id: lessonId,
            lesson_id: lessonId,
            title: lessonRows[0].title,
            description: lessonRows[0].description,
            reward_xp: rewardXp,
            reward_coins: rewardCoins,
            scene_background_image: first.scene_background_image,
            subtopics,
        });
    } catch (err) {
        logRouteError('MiNi Game lesson detail error:', err);
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
                    p.exercise_id AS mini_game_module_id,
                    e.lesson_id AS module_id,
                    s.submitted_code,
                    p.is_completed,
                    p.best_score AS score,
                    s.submitted_code AS last_terminal_input,
                    s.error_message AS last_terminal_reply,
                    p.selected_branch_key,
                    p.selected_branch_key AS last_output,
                    NULL AS choice_history_json,
                    NULL AS ending_key,
                    p.completed_at,
                    p.updated_at
             FROM mini_game_user_exercise_progress p
             JOIN mini_game_exercises e ON e.exercise_id = p.exercise_id
             LEFT JOIN mini_game_exercise_submissions s ON s.submission_id = p.last_submission_id
             WHERE e.lesson_id = ?
               AND p.user_id = ?
             ORDER BY CAST(e.exercise_order AS UNSIGNED) ASC, e.exercise_order ASC, e.exercise_id ASC`,
            [lessonId, userId]
        );

        res.json(rows);
    } catch (err) {
        logRouteError('MiNi Game exercise progress error:', err);
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
            `SELECT progress_id, is_completed, reward_claimed, best_score
             FROM mini_game_user_exercise_progress
             WHERE user_id = ? AND exercise_id = ?
             LIMIT 1`,
            [user_id, exercise.exercise_id]
        );
        const existingProgress = existingProgressRows[0] || null;
        const shouldGrantReward = Boolean(is_completed) && !Number(existingProgress?.reward_claimed || 0);

        const [submissionResult] = await db.execute(
            `INSERT INTO mini_game_exercise_submissions (
                user_id, exercise_id, submitted_code, is_passed, score,
                passed_test_count, total_test_count, selected_branch_key, reward_granted,
                error_message
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                exercise.exercise_id,
                submitted_code,
                is_completed ? 1 : 0,
                Number(score || 0),
                is_completed ? 1 : 0,
                1,
                selected_branch_key || 'default',
                shouldGrantReward ? 1 : 0,
                last_terminal_reply,
            ]
        );

        await db.execute(
            `INSERT INTO mini_game_user_exercise_progress (
                user_id, exercise_id, is_completed, completed_at, reward_claimed,
                best_score, selected_branch_key, last_submission_id
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                is_completed = GREATEST(is_completed, VALUES(is_completed)),
                completed_at = IF(VALUES(is_completed) = 1 AND completed_at IS NULL, VALUES(completed_at), completed_at),
                reward_claimed = GREATEST(reward_claimed, VALUES(reward_claimed)),
                best_score = GREATEST(best_score, VALUES(best_score)),
                selected_branch_key = VALUES(selected_branch_key),
                last_submission_id = VALUES(last_submission_id),
                updated_at = CURRENT_TIMESTAMP`,
            [
                user_id,
                exercise.exercise_id,
                is_completed ? 1 : 0,
                is_completed ? new Date() : null,
                shouldGrantReward ? 1 : 0,
                Number(score || 0),
                selected_branch_key || 'default',
                submissionResult.insertId,
            ]
        );

        let xpReward = 0;
        let coinReward = 0;
        if (shouldGrantReward) {
            xpReward = Number(exercise.xp_reward || 0);
            coinReward = Number(exercise.currency_reward || 0);
            await db.execute(
                `UPDATE users
                 SET xp = xp + ?, virtual_currency = virtual_currency + ?
                 WHERE user_id = ?`,
                [xpReward, coinReward, user_id]
            );
        }

        const [userRows] = await db.execute(
            'SELECT user_id, username, level, xp, virtual_currency FROM users WHERE user_id = ? LIMIT 1',
            [user_id]
        );

        res.json({
            success: true,
            alreadyCompleted: Boolean(existingProgress?.is_completed),
            is_module_completed: Boolean(is_completed),
            xp_reward: xpReward,
            currency_reward: coinReward,
            user: userRows[0] || null,
        });
    } catch (err) {
        logRouteError('MiNi Game exercise progress upsert error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});


// --- MiNi Games ---
app.get('/api/_legacy-mini-game/list/:lessonId', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT mini_game_id AS exercise_id,
                    lesson_id,
                    title,
                    description,
                    starter_code,
                    test_cases,
                    xp_reward,
                    currency_reward
             FROM mini_games
             WHERE lesson_id = ?
             ORDER BY mini_game_id ASC`,
            [req.params.lessonId]
        );
        res.json(rows);
    } catch (err) {
        logRouteError('MiNi Game list error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.get('/api/_legacy-mini-game/progress/:lessonId/:userId', async (req, res) => {
    try {
        const { lessonId, userId } = req.params;
        const [rows] = await db.execute(
            `SELECT mgs.mini_game_id AS exercise_id,
                    mgs.is_passed,
                    COALESCE(mgs.submitted_code, '') AS latest_submitted_code
             FROM mini_game_submissions mgs
             JOIN mini_games mg ON mgs.mini_game_id = mg.mini_game_id
             WHERE mg.lesson_id = ? AND mgs.user_id = ?`,
            [lessonId, userId]
        );
        res.json(rows);
    } catch (err) {
        try {
            const { lessonId, userId } = req.params;
            const [rows] = await db.execute(
                `SELECT mgs.mini_game_id AS exercise_id,
                        mgs.is_passed,
                        '' AS latest_submitted_code
                 FROM mini_game_submissions mgs
                 JOIN mini_games mg ON mgs.mini_game_id = mg.mini_game_id
                 WHERE mg.lesson_id = ? AND mgs.user_id = ?`,
                [lessonId, userId]
            );
            res.json(rows);
        } catch (_) {
            res.json([]);
        }
    }
});

app.get('/api/_legacy-mini-game/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;
        if (lessonId === 'list' || lessonId === 'progress') {
            return res.status(404).json({ error: 'not found' });
        }

        const [rows] = await db.execute(
            `SELECT mini_game_id AS exercise_id,
                    lesson_id,
                    title,
                    description,
                    starter_code,
                    test_cases,
                    xp_reward,
                    currency_reward
             FROM mini_games
             WHERE lesson_id = ?
             ORDER BY mini_game_id ASC
             LIMIT 1`,
            [lessonId]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: `ไม่พบ MiNi Game สำหรับบทเรียน ${lessonId}` });
        }

        const miniGame = rows[0];
        res.json({
            success: true,
            exercise: {
                exercise_id: miniGame.exercise_id,
                title: miniGame.title,
                description: miniGame.description,
                initial_code: miniGame.starter_code,
                starter_code: miniGame.starter_code,
                test_cases: miniGame.test_cases ?? [],
                xp_reward: miniGame.xp_reward,
                currency_reward: miniGame.currency_reward,
            },
        });
    } catch (err) {
        logRouteError('MiNi Game fallback error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.get('/api/lessons/:lessonId/_legacy-mini-game', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT mini_game_id AS exercise_id,
                    lesson_id,
                    title,
                    description,
                    starter_code,
                    test_cases,
                    xp_reward,
                    currency_reward
             FROM mini_games
             WHERE lesson_id = ?
             ORDER BY mini_game_id ASC
             LIMIT 1`,
            [req.params.lessonId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบ MiNi Game สำหรับบทเรียนนี้' });
        }

        res.json(rows[0]);
    } catch (err) {
        logRouteError('Lesson MiNi Game error:', err);
        res.status(500).json({ error: describeError(err) });
    }
});

app.post('/api/_legacy-mini-game/:exerciseId/submit', async (req, res) => {
    const { exerciseId } = req.params;
    const { user_id, submitted_code } = req.body || {};

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    try {
        const [miniGameRows] = await db.execute(
            'SELECT xp_reward, currency_reward FROM mini_games WHERE mini_game_id = ?',
            [exerciseId]
        );

        if (miniGameRows.length === 0) {
            return res.status(404).json({ error: 'MiNi Game not found' });
        }

        const rewardXp = Number(miniGameRows[0].xp_reward || 50);
        const rewardCoins = Number(miniGameRows[0].currency_reward || 10);

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
                 FROM mini_game_submissions
                 WHERE user_id = ? AND mini_game_id = ?
                 ORDER BY submission_id DESC
                 LIMIT 1`,
                [user_id, exerciseId]
            );
            alreadyPassed = Boolean(existing[0]?.is_passed);
            existingSubmissionId = existing[0]?.submission_id || null;
        } catch (_) {
            alreadyPassed = false;
        }

        if (existingSubmissionId) {
            await db.execute(
                `UPDATE mini_game_submissions
                 SET submitted_code = ?, is_passed = true, submitted_at = CURRENT_TIMESTAMP
                 WHERE submission_id = ?`,
                [submitted_code || '', existingSubmissionId]
            );
        } else {
            await db.execute(
                `INSERT INTO mini_game_submissions (user_id, mini_game_id, submitted_code, is_passed, score)
                 VALUES (?, ?, ?, true, 100)`,
                [user_id, exerciseId, submitted_code || '']
            );
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

        await db.execute(
            `UPDATE users
             SET xp = xp + ?, virtual_currency = virtual_currency + ?
             WHERE user_id = ?`,
            [rewardXp, rewardCoins, user_id]
        );

        const [selectedUsers] = await db.execute(
            'SELECT user_id, username, level, xp, virtual_currency FROM users WHERE user_id = ? LIMIT 1',
            [user_id]
        );
        const updatedUser = selectedUsers[0] || null;

        res.json({
            success: true,
            xp_reward: rewardXp,
            currency_reward: rewardCoins,
            user: updatedUser,
        });
    } catch (err) {
        logRouteError('MiNi Game submit error:', err);
        res.status(500).json({ error: describeError(err) });
    }
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
app.get('/api/survey', async (req, res) => {
    try {
        const [questions] = await db.execute('SELECT * FROM survey_questions ORDER BY id ASC');
        const [options] = await db.execute(`
            SELECT question_id, option_text AS label, option_description AS description, \`order\`, NULL as level FROM survey_options
            UNION ALL
            SELECT question_id, title AS label, option_description AS description, \`order\`, level AS level FROM level_config
            ORDER BY \`order\` ASC
        `);
        const formatted = questions.map(q => ({
            id: q.id,
            title: q.title,
            text: q.description,
            img: q.image,
            options: options.filter(o => o.question_id === q.id)
        }));
        res.json(formatted);
    } catch (err) {
        console.error('❌ Survey Error:', err.message);
        res.status(500).send(err.message);
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
app.get('/simulation/state-v2/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        if (isGuestUserId(userId)) {
            return res.json(buildGuestSimulationState(userId));
        }

        const [saves] = await db.execute(`
            SELECT s.*, l.name as location_name, l.power_reliability, l.internet_speed
            FROM simulation_saves s
            LEFT JOIN locations l ON s.current_location_id = l.location_id
            WHERE s.user_id = ? AND s.is_active = 1
            LIMIT 1
        `, [userId]);

        if (saves.length === 0) {
            const [result] = await db.execute(
                'INSERT INTO simulation_saves (user_id, save_name, sim_money, is_active) VALUES (?, ?, ?, 1)',
                [userId, 'Auto Save', 0]
            );
            return res.json({
                save_id: result.insertId,
                sim_money: 0,
                current_day: 1,
                current_hour: 8.0,
                battery_percent: 100,
                is_plugged_in: 1,
                jobs_completed: 0,
                total_earned: 0,
                active_events: [],
                active_jobs: []
            });
        }

        const save = saves[0];
        if (typeof save.environment_status === 'string') {
            try { save.environment_status = JSON.parse(save.environment_status); } catch { save.environment_status = {}; }
        }

        const [activeEvents] = await db.execute(`
            SELECT ae.*, re.event_key, re.name, re.description, re.severity, re.effect_type
            FROM simulation_active_events ae
            JOIN random_events re ON ae.event_id = re.event_id
            WHERE ae.save_id = ? AND ae.is_resolved = 0
        `, [save.save_id]);

        const [activeJobs] = await db.execute(`
            SELECT c.contract_id, c.title, c.reward, c.difficulty, c.ai_requirements,
                   uc.accepted_at, uc.accepted_day, uc.carried_days, uc.status, uc.status_reason, uc.id AS user_contract_id
            FROM user_contracts uc
            JOIN contracts c ON uc.contract_id = c.contract_id
            WHERE uc.user_id = ? AND uc.status = 'ACTIVE'
            ORDER BY uc.accepted_at DESC
        `, [userId]);

        res.json({
            ...save,
            active_events: activeEvents,
            active_jobs: activeJobs.map(formatJobStatus)
        });
    } catch (err) {
        console.error('❌ /simulation/state-v2 error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/simulation/state/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        if (isGuestUserId(userId)) {
            return res.json(buildGuestSimulationState(userId));
        }

        // ดึง save หลัก
        const [saves] = await db.execute(`
            SELECT s.*, l.name as location_name, l.power_reliability, l.internet_speed
            FROM simulation_saves s
            LEFT JOIN locations l ON s.current_location_id = l.location_id
            WHERE s.user_id = ? AND s.is_active = 1
            LIMIT 1
        `, [userId]);

        if (saves.length === 0) {
            // Auto-create save ถ้าไม่มี
            const [result] = await db.execute(
                'INSERT INTO simulation_saves (user_id, save_name, sim_money, is_active) VALUES (?, ?, ?, 1)',
                [userId, 'Auto Save', 0]
            );
            return res.json({
                save_id: result.insertId,
                sim_money: 0,
                current_day: 1,
                current_hour: 8.0,
                battery_percent: 100,
                is_plugged_in: 1,
                jobs_completed: 0,
                total_earned: 0,
                active_events: []
            });
        }

        const save = saves[0];
        if (typeof save.environment_status === 'string') {
            try { save.environment_status = JSON.parse(save.environment_status); } catch { save.environment_status = {}; }
        }

        // ดึง active events
        const [activeEvents] = await db.execute(`
            SELECT ae.*, re.event_key, re.name, re.description, re.severity, re.effect_type
            FROM simulation_active_events ae
            JOIN random_events re ON ae.event_id = re.event_id
            WHERE ae.save_id = ? AND ae.is_resolved = 0
        `, [save.save_id]);

        // ดึงงานที่กำลังทำอยู่ (ACTIVE) เพื่อแสดงในหน้า Desktop
        const [activeJobs] = await db.execute(`
            SELECT c.contract_id, c.title, c.reward, c.difficulty, uc.accepted_at
            FROM user_contracts uc
            JOIN contracts c ON uc.contract_id = c.contract_id
            WHERE uc.user_id = ? AND uc.status = 'ACTIVE'
        `, [userId]);

        res.json({
            ...save,
            active_events: activeEvents,
            active_jobs: activeJobs
        });
    } catch (err) {
        console.error('❌ /simulation/state error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/simulation/sync-time', async (req, res) => {
    const { userId, currentHour } = req.body;

    if (!userId || typeof currentHour !== 'number') {
        return res.status(400).json({ error: 'userId and currentHour are required' });
    }

    const normalizedHour = Math.min(20, Math.max(8, currentHour));

    try {
        if (isGuestUserId(userId)) {
            getGuestSimulationState(userId, { current_hour: normalizedHour });
            return res.json({ success: true, current_hour: normalizedHour });
        }

        const [result] = await db.execute(
            'UPDATE simulation_saves SET current_hour = ? WHERE user_id = ? AND is_active = 1',
            [normalizedHour, userId]
        );

        // ถ้าไม่มี active save ให้สร้างอัตโนมัติแล้ว sync
        if (result.affectedRows === 0) {
            await db.execute(
                'INSERT INTO simulation_saves (user_id, save_name, sim_money, current_hour, is_active) VALUES (?, ?, 0, ?, 1)',
                [userId, 'Auto Save', normalizedHour]
            );
        }

        res.json({ success: true, current_hour: normalizedHour });
    } catch (err) {
        console.error('❌ /simulation/sync-time error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /simulation/next-day
 * จบวันปัจจุบัน — คำนวณรายรับ/รายจ่าย, เช็คค่าเช่า, เช็ค Game Over
 * Body: { userId }
 * Returns: { newDay, money, rentDue, rentPaid, gameOver, summary }
 */
app.post('/simulation/next-day-v2', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    if (isGuestUserId(userId)) {
        const RENT_CYCLE = 7;
        const guestSave = getGuestSimulationState(userId);
        const currentDay = Number(guestSave.current_day || 1);
        const newDay = currentDay + 1;
        const endingHour = Number(guestSave.current_hour || 8);
        const daysUntilRentRaw = RENT_CYCLE - (newDay % RENT_CYCLE);
        const daysUntilRent = daysUntilRentRaw === 0 ? RENT_CYCLE : daysUntilRentRaw;

        const updatedGuestSave = getGuestSimulationState(userId, {
            current_day: newDay,
            current_hour: 8.0,
            active_events: [],
            active_jobs: [],
        });

        return res.json({
            gameOver: false,
            newDay,
            money: Number(updatedGuestSave.sim_money || 0),
            totalEarned: Number(updatedGuestSave.total_earned || 0),
            totalSpent: Number(updatedGuestSave.total_spent || 0),
            jobsCompleted: Number(updatedGuestSave.jobs_completed || 0),
            jobsFailed: Number(updatedGuestSave.jobs_failed || 0),
            rentDue: false,
            rentPaid: false,
            rentDeducted: 0,
            daysUntilRent,
            summary: {
                todayEarned: 0,
                todayJobsDone: 0,
                carryOverJobs: [],
                stolenJobs: [],
                totalReputationLoss: 0,
                rentEvents: [],
                day: currentDay,
                endingHour,
            },
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [saves] = await connection.execute(
            'SELECT * FROM simulation_saves WHERE user_id = ? AND is_active = 1 LIMIT 1',
            [userId]
        );
        if (saves.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'No active save' });
        }

        const save = saves[0];
        const currentDay = Number(save.current_day || 1);
        const newDay = currentDay + 1;
        const endingHour = Number(save.current_hour || 8);

        const [users] = await connection.execute(
            'SELECT level FROM users WHERE user_id = ? LIMIT 1',
            [userId]
        );
        const playerLevel = users[0]?.level || 'Beginner';

        const RENT_AMOUNT = 3000;
        const RENT_CYCLE = 7;

        const [completedToday] = await connection.execute(`
            SELECT COUNT(*) as count, COALESCE(SUM(c.reward), 0) as earned
            FROM user_contracts uc
            JOIN contracts c ON uc.contract_id = c.contract_id
            WHERE uc.user_id = ? AND uc.status = 'COMPLETED' AND uc.completed_day = ?
        `, [userId, currentDay]);

        const todayEarned = parseFloat(completedToday[0].earned) || 0;
        const todayJobsDone = Number(completedToday[0].count || 0);

        const { carryOverJobs, stolenJobs, totalReputationLoss } = await advanceActiveJobsForNextDay(connection, {
            userId,
            saveId: save.save_id,
            currentDay,
        });

        let rentDue = false;
        let rentPaid = false;
        let rentDeducted = 0;
        let moneyAfterRent = parseFloat(save.sim_money);
        const rentEvents = [];

        if (newDay % RENT_CYCLE === 1 || currentDay % RENT_CYCLE === 0) {
            rentDue = true;
            if (moneyAfterRent >= RENT_AMOUNT) {
                rentDeducted = RENT_AMOUNT;
                moneyAfterRent -= RENT_AMOUNT;
                rentPaid = true;

                await connection.execute(
                    'INSERT INTO financial_ledger (user_id, type, category, amount, description) VALUES (?, ?, ?, ?, ?)',
                    [userId, 'EXPENSE', 'RENT', RENT_AMOUNT, `ค่าเช่าวันที่ ${currentDay}`]
                );

                await connection.execute(
                    'UPDATE simulation_saves SET sim_money = ?, total_spent = total_spent + ? WHERE save_id = ?',
                    [moneyAfterRent, RENT_AMOUNT, save.save_id]
                );

                rentEvents.push(`🏠 จ่ายค่าเช่า -${RENT_AMOUNT.toLocaleString()} ฿`);
            } else {
                await connection.execute(
                    "UPDATE user_contracts SET status = 'FAILED', status_reason = 'GAME_OVER', failed_day = ? WHERE user_id = ? AND status = 'ACTIVE'",
                    [currentDay, userId]
                );
                await connection.execute(
                    'UPDATE simulation_saves SET is_active = 0 WHERE save_id = ?',
                    [save.save_id]
                );
                await connection.execute(
                    'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                    [userId, save.save_id, 'GAME_OVER', `ไม่มีเงินจ่ายค่าเช่าวันที่ ${currentDay} — Game Over`]
                );
                await connection.commit();
                return res.json({
                    gameOver: true,
                    reason: 'ไม่มีเงินจ่ายค่าเช่า',
                    finalDay: currentDay,
                    finalHour: endingHour,
                    finalMoney: parseFloat(save.sim_money),
                    jobsCompleted: save.jobs_completed,
                    summary: {
                        todayEarned,
                        todayJobsDone,
                        carryOverJobs,
                        stolenJobs,
                        totalReputationLoss,
                        rentEvents,
                        day: currentDay,
                        endingHour
                    }
                });
            }
        }

        await connection.execute(
            `UPDATE simulation_saves
             SET current_day = ?, current_hour = 8.0
             WHERE save_id = ?`,
            [newDay, save.save_id]
        );

        await ensureFallbackJobsAvailable(connection, { level: playerLevel, minimum: 4 });

        await connection.execute(
            'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
            [userId, save.save_id, 'NEW_DAY', `เริ่มวันที่ ${newDay}`]
        );

        await connection.execute(
            'UPDATE simulation_active_events SET is_resolved = 1 WHERE save_id = ? AND is_resolved = 0',
            [save.save_id]
        );

        const [freshSave] = await connection.execute(
            'SELECT sim_money, current_day, jobs_completed, jobs_failed, total_earned, total_spent FROM simulation_saves WHERE save_id = ?',
            [save.save_id]
        );

        await connection.commit();

        const daysUntilRent = RENT_CYCLE - (newDay % RENT_CYCLE);

        res.json({
            gameOver: false,
            newDay,
            money: parseFloat(freshSave[0].sim_money),
            totalEarned: parseFloat(freshSave[0].total_earned),
            totalSpent: parseFloat(freshSave[0].total_spent),
            jobsCompleted: freshSave[0].jobs_completed,
            jobsFailed: freshSave[0].jobs_failed,
            rentDue,
            rentPaid,
            rentDeducted,
            daysUntilRent: daysUntilRent === 0 ? RENT_CYCLE : daysUntilRent,
            rentAmount: RENT_AMOUNT,
            summary: {
                todayEarned,
                todayJobsDone,
                carryOverJobs,
                stolenJobs,
                totalReputationLoss,
                rentEvents,
                day: currentDay,
                endingHour
            }
        });
    } catch (err) {
        await connection.rollback();
        console.error('❌ /simulation/next-day-v2 error:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.post('/simulation/next-day', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. ดึง save ปัจจุบัน
        const [saves] = await connection.execute(
            'SELECT * FROM simulation_saves WHERE user_id = ? AND is_active = 1 LIMIT 1',
            [userId]
        );
        if (saves.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'No active save' });
        }
        const save = saves[0];
        const currentDay = save.current_day;
        const newDay = currentDay + 1;
        const endingHour = Number(save.current_hour || 8);
        const [users] = await connection.execute('SELECT level FROM users WHERE user_id = ? LIMIT 1', [userId]);
        const playerLevel = users[0]?.level || 'Beginner';

        // Config ค่าเช่า (ทุก 7 วัน)
        const RENT_AMOUNT = 3000;
        const RENT_CYCLE = 7;

        // 2. ดึงงานที่เพิ่งส่ง (COMPLETED วันนี้) เพื่อสรุปรายรับ
        //    — งานที่ submit ไปแล้วจะถูกนับใน total_earned โดย /jobs/submit อยู่แล้ว
        //    — ดึงแค่ summary ว่าวันนี้ทำงานไปกี่งาน ได้เงินเท่าไร
        const [completedToday] = await connection.execute(`
            SELECT COUNT(*) as count, COALESCE(SUM(c.reward), 0) as earned
            FROM user_contracts uc
            JOIN contracts c ON uc.contract_id = c.contract_id
            WHERE uc.user_id = ? AND uc.status = 'COMPLETED'
            AND DATE(uc.accepted_at) = CURDATE()
        `, [userId]);

        const todayEarned = parseFloat(completedToday[0].earned) || 0;
        const todayJobsDone = completedToday[0].count || 0;

        // 3. เช็คว่าถึงวันจ่ายค่าเช่าหรือเปล่า (ทุก 7 วัน)
        let rentDue = false;
        let rentPaid = false;
        let rentDeducted = 0;
        let moneyAfterRent = parseFloat(save.sim_money);
        const rentEvents = [];

        if (newDay % RENT_CYCLE === 1 || currentDay % RENT_CYCLE === 0) {
            // ถึงวันจ่ายค่าเช่าแล้ว
            rentDue = true;
            if (moneyAfterRent >= RENT_AMOUNT) {
                // จ่ายได้
                rentDeducted = RENT_AMOUNT;
                moneyAfterRent -= RENT_AMOUNT;
                rentPaid = true;

                // บันทึก expense ใน financial_ledger
                await connection.execute(
                    'INSERT INTO financial_ledger (user_id, type, category, amount, description) VALUES (?, ?, ?, ?, ?)',
                    [userId, 'EXPENSE', 'RENT', RENT_AMOUNT, `ค่าเช่าวันที่ ${currentDay}`]
                );
                // อัปเดตยอดเงินและ total_spent
                await connection.execute(
                    'UPDATE simulation_saves SET sim_money = ?, total_spent = total_spent + ? WHERE save_id = ?',
                    [moneyAfterRent, RENT_AMOUNT, save.save_id]
                );

                rentEvents.push(`🏠 จ่ายค่าเช่า -${RENT_AMOUNT.toLocaleString()} ฿`);
            } else {
                // เงินไม่พอจ่ายค่าเช่า → GAME OVER
                await connection.execute(
                    'UPDATE simulation_saves SET is_active = 0 WHERE save_id = ?',
                    [save.save_id]
                );
                // บันทึก log
                await connection.execute(
                    'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                    [userId, save.save_id, 'GAME_OVER', `ไม่มีเงินจ่ายค่าเช่าวันที่ ${currentDay} — Game Over`]
                );
                await connection.commit();
                return res.json({
                    gameOver: true,
                    reason: 'ไม่มีเงินจ่ายค่าเช่า',
                    finalDay: currentDay,
                    finalHour: endingHour,
                    finalMoney: parseFloat(save.sim_money),
                    jobsCompleted: save.jobs_completed
                });
            }
        }

        // 4. Advance day
        await connection.execute(
            `UPDATE simulation_saves 
             SET current_day = ?, current_hour = 8.0
             WHERE save_id = ?`,
            [newDay, save.save_id]
        );

        await ensureFallbackJobsAvailable(connection, { level: playerLevel, minimum: 4 });

        // 5. บันทึก log วันใหม่
        await connection.execute(
            'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
            [userId, save.save_id, 'NEW_DAY', `เริ่มวันที่ ${newDay}`]
        );

        // 6. Resolve active events ของวันเก่า
        await connection.execute(
            'UPDATE simulation_active_events SET is_resolved = 1 WHERE save_id = ? AND is_resolved = 0',
            [save.save_id]
        );

        // 7. สร้าง summary กลับไป
        const [freshSave] = await connection.execute(
            'SELECT sim_money, current_day, jobs_completed, total_earned, total_spent FROM simulation_saves WHERE save_id = ?',
            [save.save_id]
        );

        await connection.commit();

        // คำนวณวันค่าเช่าถัดไป
        const daysUntilRent = RENT_CYCLE - (newDay % RENT_CYCLE);

        res.json({
            gameOver: false,
            newDay,
            money: parseFloat(freshSave[0].sim_money),
            totalEarned: parseFloat(freshSave[0].total_earned),
            totalSpent: parseFloat(freshSave[0].total_spent),
            jobsCompleted: freshSave[0].jobs_completed,
            rentDue,
            rentPaid,
            rentDeducted,
            daysUntilRent: daysUntilRent === 0 ? RENT_CYCLE : daysUntilRent,
            rentAmount: RENT_AMOUNT,
            summary: {
                todayEarned,
                todayJobsDone,
                rentEvents,
                day: currentDay,
                endingHour
            }
        });
    } catch (err) {
        await connection.rollback();
        console.error('❌ /simulation/next-day error:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

/**
 * POST /simulation/new-game
 * สร้าง save ใหม่และ reset state ทั้งหมด (ใช้หลัง Game Over)
 * Body: { userId }
 */
app.post('/simulation/new-game', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    try {
        // ปิด save เดิมทั้งหมด
        await db.execute('UPDATE simulation_saves SET is_active = 0 WHERE user_id = ?', [userId]);
        // ยกเลิกงานค้างทั้งหมด
        await db.execute(
            `UPDATE user_contracts
             SET status = 'FAILED',
                 status_reason = 'SAVE_RESET',
                 failed_day = 1
             WHERE user_id = ? AND status = 'ACTIVE'`,
            [userId]
        );
        await db.execute(
            `UPDATE contracts
             SET status = 'FAILED'
             WHERE contract_id IN (
                SELECT contract_id FROM user_contracts
                WHERE user_id = ? AND status_reason = 'SAVE_RESET'
             )`,
            [userId]
        );
        // สร้าง save ใหม่
        const [result] = await db.execute(
            `INSERT INTO simulation_saves
             (user_id, save_name, sim_money, current_day, current_hour, battery_percent, is_plugged_in, jobs_completed, jobs_failed, total_earned, total_spent, is_active)
             VALUES (?, 'Auto Save', 0, 1, 8.0, 100, 1, 0, 0, 0, 0, 1)`,
            [userId]
        );
        res.json({ success: true, save_id: result.insertId });
    } catch (err) {
        console.error('❌ /simulation/new-game error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 8. Start Server & Simulation Engine
// ==========================================

const PORT = 3001;
let simulationLoopStarted = false;
let backgroundServicesInitialized = false;

const initializeBackgroundServices = async () => {
    if (backgroundServicesInitialized) {
        return;
    }

    try {
        await db.healthcheck();
        await ensureSimulationJobTrackingSchema();
        await ensureAdminSchema();
        await ensureLearningAiTaskSchema();
        await ensureLearningProgressSchema();
        await ensureLessonQuizAttemptSchema();

        if (!simulationLoopStarted) {
            console.log("Starting Simulation Engine...");
            startSimulationLoop();
        }

        backgroundServicesInitialized = true;
        console.log('Background services initialized successfully.');
    } catch (error) {
        console.error('⚠️ Background service initialization failed:', describeError(error));
        setTimeout(() => {
            initializeBackgroundServices().catch(() => {
                // The retry logs its own error.
            });
        }, 5000);
    }
};

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    initializeBackgroundServices().catch(() => {
        // The initializer handles logging and retry.
    });
});

// ==========================================
// 8. Simulation Logic (ทำงานเบื้องหลัง)
// ==========================================
function startSimulationLoop() {
    if (simulationLoopStarted) {
        return;
    }
    simulationLoopStarted = true;

    const TICK_RATE = 5000; // 5 วินาที
    const BATTERY_DRAIN_RATE = 2;
    const BATTERY_CHARGE_RATE = 5;
    let simErrorLogged = false;

    setInterval(async () => {
        try {
            // ดึง active saves ทั้งหมด
            const [saves] = await db.execute(`
                SELECT s.*, l.power_reliability, l.internet_speed
                FROM simulation_saves s
                LEFT JOIN locations l ON s.current_location_id = l.location_id
                WHERE s.is_active = 1
            `);

            // ดึง random events ทั้งหมดไว้ใช้
            const [allEvents] = await db.execute('SELECT * FROM random_events');

            for (let save of saves) {
                const reliability = save.power_reliability || 70;

                // Parse environment
                let env = (typeof save.environment_status === 'string')
                    ? JSON.parse(save.environment_status) : (save.environment_status || {});

                // ดึง active events ของ save นี้
                const [currentEvents] = await db.execute(
                    'SELECT ae.*, re.event_key, re.effect_type, re.force_skip_day, re.auto_resolve FROM simulation_active_events ae JOIN random_events re ON ae.event_id = re.event_id WHERE ae.save_id = ? AND ae.is_resolved = 0',
                    [save.save_id]
                );

                // ตรวจสอบ events ที่หมดอายุ → resolve
                for (let ce of currentEvents) {
                    if (ce.auto_resolve && ce.expires_at && new Date(ce.expires_at) <= new Date()) {
                        await db.execute('UPDATE simulation_active_events SET is_resolved = 1 WHERE id = ?', [ce.id]);
                        await db.execute(
                            'INSERT INTO simulation_logs (user_id, save_id, event_id, event_type, message) VALUES (?, ?, ?, ?, ?)',
                            [save.user_id, save.save_id, ce.event_id, ce.event_key + '_RESOLVED', `เหตุการณ์ ${ce.event_key} สิ้นสุดลงแล้ว`]
                        );
                    }
                }

                // ตรวจสอบสถานะปัจจุบัน
                const hasBlackout = currentEvents.some(e => e.event_key === 'BLACKOUT' && !e.is_resolved);
                const hasOverheat = currentEvents.some(e => e.event_key === 'LAPTOP_OVERHEAT' && !e.is_resolved);

                // คำนวณแบตเตอรี่
                const actualPluggedIn = 1;
                let newBattery = 100;

                // แบตหมด + ไฟดับ → บังคับข้ามวัน
                let forceSkipDay = false;
                if (newBattery <= 0 && hasBlackout) {
                    forceSkipDay = true;
                    newBattery = 100; // reset แบตหลังวันใหม่
                    // Resolve blackout
                    await db.execute(
                        'UPDATE simulation_active_events SET is_resolved = 1 WHERE save_id = ? AND is_resolved = 0',
                        [save.save_id]
                    );
                    await db.execute(
                        'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                        [save.user_id, save.save_id, 'FORCE_SKIP_DAY', 'แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว']
                    );
                }

                // ===== Random Events System =====
                // กฎ:
                // 1. จำกัดไม่เกิน 3 ครั้ง/วัน (นับจาก env.events_today_count)
                // 2. ต้องมี cooldown อย่างน้อย 60 วินาทีระหว่าง event
                // 3. CRITICAL → หยุดสุ่มวันนั้น แต่ไม่มี fixed timer
                //    - BLACKOUT: ผลตามธรรมชาติ = ชาร์จไม่ได้ → แบตหมด → จบวัน
                //    - LAPTOP_CRASH: บังคับจบวันทันที + หักค่าซ่อม
                // 4. โอกาสเกิดแต่ละระดับต่างกัน (LOW สูง, CRITICAL ต่ำมาก)

                const MAX_EVENTS_PER_DAY = 3;
                const EVENT_COOLDOWN_MS = 60 * 1000; // 60 วินาที

                const eventsToday = env.events_today_count || 0;
                const lastEventTime = env.last_event_time ? new Date(env.last_event_time).getTime() : 0;
                const hasCriticalToday = env.critical_today || false;
                const now = Date.now();

                // สุ่ม events เฉพาะเมื่อ: ยังไม่ถึงลิมิต + ไม่มี critical วันนี้ + cooldown ผ่าน + ไม่ force skip
                const canSpawnEvent = !forceSkipDay
                    && eventsToday < MAX_EVENTS_PER_DAY
                    && !hasCriticalToday
                    && (now - lastEventTime) >= EVENT_COOLDOWN_MS;

                if (canSpawnEvent) {
                    // กรอง events ที่สามารถเกิดได้ (ข้าม BLACKOUT → ใช้ระบบ reliability แยก)
                    const eligibleEvents = allEvents.filter(e => {
                        if (e.event_key === 'BLACKOUT') return false;
                        if (currentEvents.some(ce => ce.event_id === e.event_id && !ce.is_resolved)) return false;
                        return true;
                    });

                    for (let event of eligibleEvents) {
                        const roll = Math.floor(Math.random() * 100) + 1;
                        if (roll <= event.base_chance_percent) {
                            // === เกิดเหตุการณ์! ===
                            const expiresAt = event.duration_minutes
                                ? new Date(now + event.duration_minutes * 60000).toISOString().slice(0, 19).replace('T', ' ')
                                : null;

                            await db.execute(
                                'INSERT INTO simulation_active_events (save_id, event_id, expires_at) VALUES (?, ?, ?)',
                                [save.save_id, event.event_id, expiresAt]
                            );
                            await db.execute(
                                'INSERT INTO simulation_logs (user_id, save_id, event_id, event_type, message) VALUES (?, ?, ?, ?, ?)',
                                [save.user_id, save.save_id, event.event_id, event.event_key, event.description]
                            );

                            // อัปเดต counter + cooldown
                            env.events_today_count = eventsToday + 1;
                            env.last_event_time = new Date(now).toISOString();

                            // ==== จัดการผลกระทบตาม effect_type ====

                            if (event.effect_type === 'MONEY_LOSS') {
                                // หักเงินทันที
                                const penalty = Math.floor(Math.random() * 200) + 100;
                                await db.execute(
                                    'UPDATE simulation_saves SET sim_money = GREATEST(0, sim_money - ?), total_spent = total_spent + ? WHERE save_id = ?',
                                    [penalty, penalty, save.save_id]
                                );
                                await insertLedgerEntry(db, {
                                    userId: save.user_id,
                                    type: 'EXPENSE',
                                    category: 'RANDOM_EVENT',
                                    amount: penalty,
                                    description: `${event.event_key} penalty`,
                                });
                                await db.execute(
                                    'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                                    [save.user_id, save.save_id, 'MONEY_DEDUCTED', `ถูกหักเงิน ${penalty} ฿`]
                                );
                            }

                            if (event.effect_type === 'INSTANT_END') {
                                // LAPTOP_CRASH: บังคับจบวันทันที + ค่าซ่อม
                                const repairCost = Math.floor(Math.random() * 1000) + 500; // 500-1500 ฿
                                forceSkipDay = true;
                                newBattery = 100;

                                await db.execute(
                                    'UPDATE simulation_saves SET sim_money = GREATEST(0, sim_money - ?), total_spent = total_spent + ? WHERE save_id = ?',
                                    [repairCost, repairCost, save.save_id]
                                );
                                await insertLedgerEntry(db, {
                                    userId: save.user_id,
                                    type: 'EXPENSE',
                                    category: 'REPAIR',
                                    amount: repairCost,
                                    description: `${event.event_key} repair cost`,
                                });
                                await db.execute(
                                    'UPDATE simulation_active_events SET is_resolved = 1 WHERE save_id = ? AND is_resolved = 0',
                                    [save.save_id]
                                );
                                await db.execute(
                                    'INSERT INTO simulation_logs (user_id, save_id, event_type, message) VALUES (?, ?, ?, ?)',
                                    [save.user_id, save.save_id, 'REPAIR_COST',
                                    `โน๊ตบุ๊คพังต้องซ่อม! เสียค่าซ่อม ${repairCost} ฿ วันนี้จบลงแล้ว`]
                                );
                            }

                            // CRITICAL → หยุดสุ่มต่อวันนี้ (ผลกระทบจะเกิดตามธรรมชาติ)
                            if (event.severity === 'CRITICAL') {
                                env.critical_today = true;
                            }

                            break; // สุ่มได้แค่ 1 event ต่อ tick
                        }
                    }
                }

                // สุ่มไฟดับตาม reliability ของ location (แยกจากระบบ event ทั่วไป)
                // ไฟดับ = ชาร์จไม่ได้ → แบตค่อยๆ หมด → เมื่อแบต 0 จะบังคับจบวัน (จัดการที่ lines 803-817)
                if (!hasBlackout && !forceSkipDay && !hasCriticalToday) {
                    const blackoutRoll = Math.floor(Math.random() * 100) + 1;
                    if (blackoutRoll > reliability) {
                        const blackoutEvent = allEvents.find(e => e.event_key === 'BLACKOUT');
                        if (blackoutEvent) {
                            await db.execute(
                                'INSERT INTO simulation_active_events (save_id, event_id) VALUES (?, ?)',
                                [save.save_id, blackoutEvent.event_id]
                            );
                            await db.execute(
                                'INSERT INTO simulation_logs (user_id, save_id, event_id, event_type, message) VALUES (?, ?, ?, ?, ?)',
                                [save.user_id, save.save_id, blackoutEvent.event_id, 'BLACKOUT', blackoutEvent.description]
                            );

                            // BLACKOUT = CRITICAL → หยุดสุ่ม event อื่นวันนี้
                            // ผลกระทบ: ชาร์จไม่ได้ → แบตค่อยๆ ลด → ถ้าแบตหมดก่อนไฟมา = จบวัน
                            env.critical_today = true;
                            env.events_today_count = (env.events_today_count || 0) + 1;
                            env.last_event_time = new Date(now).toISOString();
                        }
                    }
                }

                // อัปเดต save
                const newDay = forceSkipDay ? save.current_day + 1 : save.current_day;
                const newHour = forceSkipDay ? 8.0 : save.current_hour;

                // reset วันใหม่ → เคลียร์ counter
                if (forceSkipDay) {
                    env.events_today_count = 0;
                    env.last_event_time = null;
                    env.critical_today = false;
                }

                env.is_blackout = hasBlackout && !forceSkipDay;

                await db.execute(
                    `UPDATE simulation_saves SET battery_percent = ?, environment_status = ?, 
                     current_day = ?, current_hour = ? WHERE save_id = ?`,
                    [newBattery, JSON.stringify(env), newDay, newHour, save.save_id]
                );
            }
        } catch (err) {
            if (!simErrorLogged) {
                console.error("⚠️ Sim Error (จะไม่แสดงซ้ำ):", err.message);
                simErrorLogged = true;
            }
        }
    }, TICK_RATE);
}
