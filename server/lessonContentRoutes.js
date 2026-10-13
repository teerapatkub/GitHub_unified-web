const express = require('express');
const { evaluateLesson } = require('./lessonProgress');

// Shared production reader used by the learner UI and publishing integration tests.
function createLessonContentRouter(db, { ensureQuizSchema = async () => {}, evaluateAchievements = async () => [] } = {}) {
  const router = express.Router();
  const quizQuestions = async (lessonId, quizType) => {
    const [rows] = await db.execute(
      `SELECT q.question_id, q.correct_answer
         FROM lesson_quizzes lq JOIN quiz_questions q ON q.quiz_id = lq.quiz_id
        WHERE lq.lesson_id = ? AND lq.quiz_type = ?
        ORDER BY lq.quiz_id, q.question_order, q.question_id`,
      [lessonId, quizType]
    );
    return rows;
  };
  const gradeAnswers = (questions, answers) => questions.map((question, index) => {
    const answer = String(answers?.[index] ?? '').trim().replace(/\s+/g, ' ');
    const expected = String(question.correct_answer ?? '').trim().replace(/\s+/g, ' ');
    return Boolean(answer && expected && answer === expected);
  });
  router.param('lessonId', (req, res, next, value) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) return res.status(400).json({ error: 'รหัสบทเรียนไม่ถูกต้อง' });
    next();
  });
  router.get('/course-content', async (req, res) => {
    try {
      const currentLevel = Number(req.query.user_level || req.query.userLevel || 0);
      const userId = req.query.user_id || req.query.userId || 0; // รับค่า userId จาก query

      // ปรับ Query โดยใช้ JOIN เพื่อดึงสถิติแบบฝึกหัดในคราวเดียว
      //
      // COUNT(DISTINCT ...) on both sides, not COUNT(*): the join fans out one
      // row per submission, so a learner who submits the same exercise twice
      // would otherwise be shown "ภาคปฏิบัติ 2/9" for a lesson that has five.
      const [modules] = await db.execute('SELECT module_id, title, order_index, required_level FROM modules ORDER BY order_index, module_id');
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
        ORDER BY l.order_index, l.lesson_id
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
        order_index: m.order_index,
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
              order_index: l.order_index,
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
      console.error('Course content failed:', err.code || err.name);
      const message = 'โหลดรายการบทเรียนไม่สำเร็จ';
      res.status(500).json({ error: message });
    }
  });

  router.get('/lessons/:lessonId', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT lesson_id, module_id, title, description, order_index, required_level FROM lessons WHERE lesson_id = ?', [req.params.lessonId]);
      if (!rows.length) return res.status(404).json({ error: 'ไม่พบบทเรียนนี้' });
      res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: 'โหลดข้อมูลบทเรียนไม่สำเร็จ' }); }
  });

  router.get('/lessons/:lessonId/slides', async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT slide_id, slide_order, slide_title AS title, slide_content, slide_src, slide_type FROM lesson_slides WHERE lesson_id = ? ORDER BY slide_order, slide_id',
        [req.params.lessonId]
      );
      res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // --- Lesson Quizzes ---
  router.get('/lessons/:lessonId/quizzes', async (req, res) => {
    try {
      const [quizRows] = await db.execute('SELECT quiz_id, quiz_type FROM lesson_quizzes WHERE lesson_id = ? ORDER BY quiz_type, quiz_id', [req.params.lessonId]);
      const quizzes = [];
      for (const quiz of quizRows) {
        const [questions] = await db.execute('SELECT question_id, question_text, question_type FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order, question_id', [quiz.quiz_id]);
        for (const q of questions) {
          if (q.question_type === 'choice') {
            const [choices] = await db.execute('SELECT choice_text FROM question_choices WHERE question_id = ? ORDER BY choice_id', [q.question_id]);
            q.choices = choices;
          } else {
            q.choices = [];
          }
        }
        quizzes.push({ quiz_type: quiz.quiz_type, questions: questions.map(q => ({
          question_id: q.question_id,
          question_text: q.question_text,
          question_type: q.question_type,
          choices: q.choices,
        })) });
      }
      res.json(quizzes);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
  router.post('/lessons/:lessonId/quiz-results', async (req, res) => {
    try {
      await ensureQuizSchema();
      const userId = Number(req.player?.user_id);
      const quizType = String(req.body?.quiz_type || '').trim().toLowerCase();
      const answers = req.body?.answers;
      if (!userId || !['pre', 'post'].includes(quizType) || !answers || typeof answers !== 'object' || Array.isArray(answers)) {
        return res.status(400).json({ error: 'Invalid quiz result payload' });
      }
      const questions = await quizQuestions(req.params.lessonId, quizType);
      if (!questions.length || questions.length > 100 || Object.keys(answers).length !== questions.length
        || questions.some((_, index) => !Object.hasOwn(answers, index))) {
        return res.status(400).json({ error: 'Invalid quiz answers' });
      }
      const correct = gradeAnswers(questions, answers);
      const score = correct.filter(Boolean).length;
      const totalQuestions = questions.length;
      const passed = quizType !== 'post' || score >= Math.ceil(totalQuestions * 0.6);
      if (passed) {
        await db.execute(
          `INSERT INTO lesson_quiz_attempts (user_id, lesson_id, quiz_type, score, total_questions, answers_json)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (user_id, lesson_id, quiz_type) DO UPDATE SET
             score = EXCLUDED.score, total_questions = EXCLUDED.total_questions,
             answers_json = EXCLUDED.answers_json, completed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP`,
          [userId, req.params.lessonId, quizType, score, totalQuestions, JSON.stringify(answers)]
        );
      }
      const newAchievements = passed ? await evaluateAchievements(userId) : [];
      res.json({ success: true, lesson_id: Number(req.params.lessonId), user_id: userId,
        quiz_type: quizType, score, total_questions: totalQuestions, passed,
        new_achievements: newAchievements });
    } catch (err) {
      console.error('Quiz grading failed:', err.code || err.name);
      res.status(500).json({ error: 'บันทึกผลแบบทดสอบไม่สำเร็จ' });
    }
  });
  router.get('/lessons/:lessonId/quiz-results/:userId', async (req, res) => {
    try {
      if (Number(req.params.userId) !== Number(req.player?.user_id)) return res.status(403).json({ error: 'ดำเนินการได้เฉพาะบัญชีของคุณ' });
      await ensureQuizSchema();
      const [rows] = await db.execute(
        `SELECT quiz_type, score, total_questions, answers_json, completed_at, updated_at
           FROM lesson_quiz_attempts WHERE lesson_id = ? AND user_id = ? ORDER BY quiz_type`,
        [req.params.lessonId, req.player.user_id]
      );
      const result = [];
      for (const row of rows) {
        let answers = {};
        try { answers = typeof row.answers_json === 'string' ? JSON.parse(row.answers_json) : row.answers_json || {}; } catch {}
        result.push({ quiz_type: row.quiz_type, score: Number(row.score || 0),
          total_questions: Number(row.total_questions || 0), answers,
          completed_at: row.completed_at, updated_at: row.updated_at });
      }
      res.json(result);
    } catch (err) {
      console.error('Quiz results failed:', err.code || err.name);
      res.status(500).json({ error: 'โหลดผลแบบทดสอบไม่สำเร็จ' });
    }
  });
  return router;
}

module.exports = { createLessonContentRouter };
