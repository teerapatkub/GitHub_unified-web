const express = require('express');
const { randomInt } = require('node:crypto');

// Fisher–Yates on a copy.
const shuffled = (items) => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = randomInt(i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

// Signup placement: the last survey question asks about prior experience, and
// the answer either starts a new account at level 1 or opens a short placement
// test that can start it higher.
//
// This used to be decided in the browser. GET /api/advanced-validation sent
// `correct_answer` with every question, FriendLogin graded locally, then posted
// the level it wanted to POST /api/user/update-level - which wrote any level the
// body named. POST /api/assessment/submit trusted a client-reported score.
// Either one let a player give themselves level 10 and unlock Competitive and
// Arcade (server/auth/index.js gates both at 10).
//
// Now, like promotionExamRoutes.js: the answer key stays here, the session
// (`req.player`) decides who is acting, the level a pass grants comes from the
// survey option row, and only this file moves the level. Placement is a signup
// step: it only applies to an account still at level 0, which is the level
// auth/index.js creates accounts with and the state FriendLogin shows the
// survey for. After that, levels move through lessons and promotion exams.

const SIGNUP_LEVEL = 0;
const BEGINNER_LEVEL = 1;

// FriendLogin passed at `score >= questions / 1.5`; kept as integer arithmetic.
const passScoreFor = (total) => Math.ceil((total * 2) / 3);

// `answers` is keyed by question id. Unanswered questions score zero.
const gradePlacement = (questions, answers) => {
    const score = questions.reduce(
        (sum, q) => sum + (answers[String(q.id)] === q.correct_answer ? 1 : 0),
        0,
    );
    const passScore = passScoreFor(questions.length);
    return { score, totalQuestions: questions.length, passScore, passed: score >= passScore };
};

function createPlacementRouter(db, { evaluateAchievements = async () => [] } = {}) {
    const router = express.Router();

    const loadPlayer = async (req, res) => {
        const playerId = Number(req.player?.user_id);
        if (!playerId) {
            res.status(401).json({ error: 'กรุณาเข้าสู่ระบบอีกครั้ง' });
            return null;
        }
        const [rows] = await db.execute(
            'SELECT user_id, username, level, xp, virtual_currency FROM users WHERE user_id = ? LIMIT 1',
            [playerId],
        );
        if (rows.length === 0) {
            res.status(404).json({ error: 'ไม่พบผู้ใช้' });
            return null;
        }
        return rows[0];
    };

    const publicUser = (player, level) => ({
        user_id: player.user_id,
        username: player.username,
        level,
        xp: Number(player.xp || 0),
        virtual_currency: Number(player.virtual_currency || 0),
    });

    // Conditional on level 0: a second submit, or a player who already left
    // signup, changes nothing.
    const placeAt = async (player, level) => {
        const [update] = await db.execute(
            'UPDATE users SET level = ? WHERE user_id = ? AND level = ?',
            [level, player.user_id, SIGNUP_LEVEL],
        );
        return Boolean(update?.affectedRows);
    };

    // Prompts and choices only - never `correct_answer`. Shuffled on every load:
    // the seed stores each right answer as the first choice, so a fixed order
    // let "tap the first option ten times" pass. Grading compares choice text,
    // so the order never affects the verdict.
    router.get('/advanced-validation', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try {
            const [questions] = await db.execute('SELECT id, question_text FROM advanced_validation ORDER BY id');
            const [choices] = await db.execute(
                'SELECT question_id, choice_text FROM advanced_validation_choices ORDER BY question_id, id',
            );
            res.json(shuffled(questions.map(q => ({
                id: q.id,
                question_text: q.question_text,
                choices: shuffled(choices.filter(c => Number(c.question_id) === Number(q.id)).map(c => c.choice_text)),
            }))));
        } catch (err) {
            console.error('❌ GET /api/advanced-validation error:', err?.message || err);
            res.status(500).json({ error: 'โหลดแบบวัดระดับไม่สำเร็จ' });
        }
    });

    // "Never programmed before": leave signup at level 1, no test.
    router.post('/assessment/beginner', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try {
            const player = await loadPlayer(req, res);
            if (!player) return;
            const current = Number(player.level ?? SIGNUP_LEVEL);
            if (current !== SIGNUP_LEVEL) return res.json({ user: publicUser(player, current) });
            const placed = await placeAt(player, BEGINNER_LEVEL);
            res.json({ user: publicUser(player, placed ? BEGINNER_LEVEL : current) });
        } catch (err) {
            console.error('❌ POST /api/assessment/beginner error:', err?.message || err);
            res.status(500).json({ error: 'บันทึกระดับเริ่มต้นไม่สำเร็จ' });
        }
    });

    // Body: { option_id, answers: { [question_id]: choice } }. Nothing else the
    // client sends - score, total, level - is read.
    router.post('/assessment/submit', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try {
            const optionId = Number(req.body?.option_id);
            const answers = req.body?.answers;
            if (!optionId || !answers || typeof answers !== 'object' || Array.isArray(answers)) {
                return res.status(400).json({ error: 'ต้องส่งตัวเลือกระดับและคำตอบมาด้วย' });
            }
            const player = await loadPlayer(req, res);
            if (!player) return;
            if (Number(player.level ?? SIGNUP_LEVEL) !== SIGNUP_LEVEL) {
                return res.status(409).json({ error: 'แบบวัดระดับใช้ได้เฉพาะตอนสมัครบัญชีใหม่' });
            }

            const [options] = await db.execute(
                `SELECT o.level_value FROM survey_options o
                   JOIN survey_questions q ON q.id = o.question_id
                  WHERE o.id = ? AND q.question_key = 'experience' AND q.is_active = 1`,
                [optionId],
            );
            const targetLevel = Number(options[0]?.level_value);
            if (!Number.isInteger(targetLevel) || targetLevel <= BEGINNER_LEVEL) {
                return res.status(400).json({ error: 'ตัวเลือกนี้ไม่ต้องทำแบบวัดระดับ' });
            }

            const [questions] = await db.execute('SELECT id, correct_answer FROM advanced_validation ORDER BY id');
            if (questions.length === 0) {
                return res.status(503).json({ error: 'ยังไม่มีแบบวัดระดับในระบบ' });
            }
            const result = gradePlacement(questions, answers);
            if (!result.passed) {
                return res.json({
                    ...result,
                    message: `ได้ ${result.score} จาก ${result.totalQuestions} ข้อ ต้องได้อย่างน้อย ${result.passScore} ข้อจึงจะผ่าน`,
                });
            }

            if (!await placeAt(player, targetLevel)) {
                return res.status(409).json({ error: 'ระดับของคุณเปลี่ยนไประหว่างทำแบบวัดระดับ กรุณาโหลดหน้าใหม่' });
            }
            await evaluateAchievements(player.user_id);
            res.json({ ...result, message: `ผ่าน! เริ่มที่เลเวล ${targetLevel}`, user: publicUser(player, targetLevel) });
        } catch (err) {
            console.error('❌ POST /api/assessment/submit error:', err?.message || err);
            res.status(500).json({ error: 'ส่งคำตอบไม่สำเร็จ' });
        }
    });

    return router;
}

module.exports = { createPlacementRouter, gradePlacement, passScoreFor };
