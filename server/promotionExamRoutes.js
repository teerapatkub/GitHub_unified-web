const express = require('express');

// Promotion exam: the gate between skill tiers (Beginner -> Intermediate ->
// Advanced). PromotionExamPage.jsx called these two routes for months while
// no server ever served them - the original implementation never reached git.
//
// The answer key lives here and nowhere else. GET hands the browser prompts and
// choices only; POST grades the choices the player picked and, on a pass, moves
// the level in the same request. Nothing the client says about its own score
// or level is read. The question bank is static on purpose: an AI-generated
// exam needs its answer key stored somewhere between the two requests, and the
// last attempt at that timed out on load (server/tmp-progression-server2.err.log
// in fd94742).
//
// Bump `version` whenever a stage's questions change, so an exam a player
// loaded before the change is refused instead of graded against new answers.
const PROMOTION_STAGES = Object.freeze({
    beginner_to_intermediate: {
        version: 1,
        fromTier: 'Beginner',
        toTier: 'Intermediate',
        title: 'แบบทดสอบเลื่อนขั้น Beginner → Intermediate',
        passScore: 7,
        questions: [
            { prompt: 'print(3 + 4 * 2) แสดงผลอะไร?', choices: ['14', '11', '24', '3 + 4 * 2'], answer: '11' },
            { prompt: 'ค่า 3.0 เป็นข้อมูลชนิดใดใน Python?', choices: ['int', 'str', 'float', 'bool'], answer: 'float' },
            { prompt: 'int("7") + 3 ได้ค่าเท่าไร?', choices: ['73', '10', 'Error', '"73"'], answer: '10' },
            { prompt: '"Py" * 3 ได้ผลเป็นอะไร?', choices: ['Py3', 'Py Py Py', 'Error', 'PyPyPy'], answer: 'PyPyPy' },
            { prompt: 'ฟังก์ชัน input() คืนค่าเป็นข้อมูลชนิดใดเสมอ?', choices: ['str', 'int', 'float', 'ขึ้นกับสิ่งที่ผู้ใช้พิมพ์'], answer: 'str' },
            { prompt: '7 // 2 ได้ค่าเท่าไร?', choices: ['3.5', '4', '3', '1'], answer: '3' },
            { prompt: '7 % 3 ได้ค่าเท่าไร?', choices: ['2', '1', '2.33', '21'], answer: '1' },
            { prompt: 'range(1, 5) ให้ตัวเลขชุดใด?', choices: ['1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '1, 2, 3, 4', '2, 3, 4, 5'], answer: '1, 2, 3, 4' },
            { prompt: 'ถ้า x = 15 แล้ว x > 10 and x < 20 ได้ผลเป็นอะไร?', choices: ['True', 'False', '15', 'Error'], answer: 'True' },
            { prompt: 'nums = [5, 6, 7] แล้ว nums[-1] ได้ค่าเท่าไร?', choices: ['5', '6', 'Error', '7'], answer: '7' },
        ],
    },
    intermediate_to_advanced: {
        version: 1,
        fromTier: 'Intermediate',
        toTier: 'Advanced',
        title: 'แบบทดสอบเลื่อนขั้น Intermediate → Advanced',
        passScore: 9,
        questions: [
            { prompt: 'def f(a, b=2): return a * b แล้ว f(5) ได้ค่าเท่าไร?', choices: ['7', '10', '5', 'Error'], answer: '10' },
            { prompt: 'ฟังก์ชันที่จบโดยไม่มีคำสั่ง return จะคืนค่าอะไร?', choices: ['0', '""', 'None', 'False'], answer: 'None' },
            { prompt: 'd = {"a": 1} แล้ว d.get("b", 0) ได้ค่าอะไร?', choices: ['None', 'KeyError', '1', '0'], answer: '0' },
            { prompt: '[x * 2 for x in range(3)] ได้ผลเป็นอะไร?', choices: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[0, 2, 4, 6]'], answer: '[0, 2, 4]' },
            { prompt: '"hello"[1:4] ได้ผลเป็นอะไร?', choices: ['hel', 'ell', 'ello', 'hell'], answer: 'ell' },
            { prompt: '"a,b,c".split(",") ได้ผลเป็นอะไร?', choices: ["'abc'", "('a', 'b', 'c')", "['a', 'b', 'c']", "['a,b,c']"], answer: "['a', 'b', 'c']" },
            { prompt: 'int("abc") ทำให้เกิด exception ชนิดใด?', choices: ['TypeError', 'KeyError', 'NameError', 'ValueError'], answer: 'ValueError' },
            { prompt: 'ข้อมูลชนิดใดแก้ไขสมาชิกหลังสร้างแล้วไม่ได้?', choices: ['tuple', 'list', 'dict', 'set'], answer: 'tuple' },
            { prompt: 'len(set([1, 1, 2, 3, 3])) ได้ค่าเท่าไร?', choices: ['5', '3', '2', '4'], answer: '3' },
            { prompt: 'sorted([3, 1, 2], reverse=True) ได้ผลเป็นอะไร?', choices: ['[1, 2, 3]', '[3, 1, 2]', 'None', '[3, 2, 1]'], answer: '[3, 2, 1]' },
            { prompt: 'เมธอดใดของคลาสถูกเรียกเพื่อกำหนดค่าเริ่มต้นตอนสร้างอ็อบเจกต์ใหม่?', choices: ['__str__', '__init__', 'self', '__call__'], answer: '__init__' },
            { prompt: 'ข้อดีหลักของ with open("data.txt") as f: คืออะไร?', choices: ['อ่านไฟล์ได้เร็วขึ้น', 'สร้างไฟล์ใหม่ถ้ายังไม่มี', 'ปิดไฟล์ให้อัตโนมัติเมื่อจบบล็อก', 'ล็อกไฟล์ไม่ให้โปรแกรมอื่นอ่าน'], answer: 'ปิดไฟล์ให้อัตโนมัติเมื่อจบบล็อก' },
        ],
    },
});

const examIdFor = (stage) => `${stage}:v${PROMOTION_STAGES[stage].version}`;

const stageForTier = (tier) => Object.keys(PROMOTION_STAGES)
    .find((stage) => PROMOTION_STAGES[stage].fromTier === tier) || null;

// What the browser may see: no `answer`, ever.
const publicExam = (stage) => {
    const { title, passScore, questions } = PROMOTION_STAGES[stage];
    return {
        examId: examIdFor(stage),
        stage,
        title,
        passScore,
        totalQuestions: questions.length,
        questions: questions.map(({ prompt, choices }) => ({ prompt, choices: [...choices] })),
    };
};

// `answers` is keyed by 1-based question number, as PromotionExamPage sends it.
const gradeExam = (stage, answers) => {
    const { passScore, questions } = PROMOTION_STAGES[stage];
    const score = questions.reduce(
        (sum, question, index) => sum + (answers[String(index + 1)] === question.answer ? 1 : 0),
        0,
    );
    return { score, totalQuestions: questions.length, passScore, passed: score >= passScore };
};

// The tier thresholds are not repeated here: the lowest level the server's own
// tier function calls the next tier is the level a pass promotes to.
const promotionTargetLevel = (currentLevel, toTier, tierForLevel) => {
    for (let level = Math.max(1, currentLevel + 1); level <= currentLevel + 100; level += 1) {
        if (tierForLevel(level) === toTier) return level;
    }
    return null;
};

function createPromotionExamRouter(db, {
    tierForLevel,
    evaluateAchievements = async () => [],
} = {}) {
    if (typeof tierForLevel !== 'function') throw new TypeError('tierForLevel is required');
    const router = express.Router();

    const loadPlayer = async (req, res) => {
        const playerId = Number(req.player?.user_id);
        if (!playerId) {
            res.status(401).json({ error: 'กรุณาเข้าสู่ระบบอีกครั้ง' });
            return null;
        }
        // The client still names itself; the session decides who is acting.
        const claimed = req.body?.userId ?? req.query?.userId;
        if (claimed != null && claimed !== '' && Number(claimed) !== playerId) {
            res.status(403).json({ error: 'ดำเนินการได้เฉพาะบัญชีของคุณ' });
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

    const currentStage = (player) => stageForTier(tierForLevel(Number(player.level ?? 1)));

    router.get('/learning/promotion-exam', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try {
            const player = await loadPlayer(req, res);
            if (!player) return;
            const stage = currentStage(player);
            if (!stage) {
                return res.status(409).json({ error: 'คุณอยู่ระดับสูงสุดแล้ว ไม่มีด่านเลื่อนขั้นให้สอบ' });
            }
            res.json({ exam: publicExam(stage) });
        } catch (error) {
            console.error('❌ GET /api/learning/promotion-exam error:', error?.message || error);
            res.status(500).json({ error: 'โหลดแบบทดสอบเลื่อนขั้นไม่สำเร็จ' });
        }
    });

    router.post('/learning/promotion-exam/submit', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try {
            const { examId, answers } = req.body || {};
            if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
                return res.status(400).json({ error: 'ต้องส่งคำตอบมาด้วย' });
            }
            const player = await loadPlayer(req, res);
            if (!player) return;

            const stage = currentStage(player);
            if (!stage) {
                return res.status(409).json({ error: 'คุณอยู่ระดับสูงสุดแล้ว ไม่มีด่านเลื่อนขั้นให้สอบ' });
            }
            if (examId !== examIdFor(stage)) {
                return res.status(409).json({ error: 'แบบทดสอบนี้ไม่ตรงกับระดับปัจจุบันของคุณ กรุณาโหลดหน้าใหม่' });
            }

            const { fromTier, toTier } = PROMOTION_STAGES[stage];
            const result = gradeExam(stage, answers);
            const previousLevel = Number(player.level ?? 1);

            if (!result.passed) {
                return res.json({
                    ...result,
                    stage,
                    message: `ได้ ${result.score} จาก ${result.totalQuestions} ข้อ ต้องได้อย่างน้อย ${result.passScore} ข้อจึงจะผ่าน ลองทบทวนแล้วสอบใหม่ได้`,
                });
            }

            const newLevel = promotionTargetLevel(previousLevel, toTier, tierForLevel);
            if (!newLevel) throw new Error(`No level maps to tier ${toTier}`);
            // Conditional on the level we graded against: two submits racing
            // each other promote once, and the loser is told to reload.
            const [update] = await db.execute(
                'UPDATE users SET level = ? WHERE user_id = ? AND level = ?',
                [newLevel, player.user_id, player.level],
            );
            if (!update?.affectedRows) {
                return res.status(409).json({ error: 'ระดับของคุณเปลี่ยนไประหว่างสอบ กรุณาโหลดหน้าใหม่' });
            }
            await evaluateAchievements(player.user_id);

            res.json({
                ...result,
                stage,
                message: `ผ่านแล้ว! เลื่อนขั้นเป็น ${toTier} (เลเวล ${newLevel})`,
                user: {
                    user_id: player.user_id,
                    username: player.username,
                    level: newLevel,
                    xp: Number(player.xp || 0),
                    virtual_currency: Number(player.virtual_currency || 0),
                    skill_tier: toTier,
                },
                celebration: { previousLevel, newLevel, previousTier: fromTier, newTier: toTier },
            });
        } catch (error) {
            console.error('❌ POST /api/learning/promotion-exam/submit error:', error?.message || error);
            res.status(500).json({ error: 'ส่งคำตอบไม่สำเร็จ' });
        }
    });

    return router;
}

module.exports = { PROMOTION_STAGES, createPromotionExamRouter, examIdFor, gradeExam, publicExam };
