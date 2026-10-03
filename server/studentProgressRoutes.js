const express = require('express');
const { verifyAdminToken } = require('./adminAccess');
const { evaluateLesson, POST_PASS_RATIO } = require('./lessonProgress');

const mean = values => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
const latest = values => values.filter(Boolean).map(value => new Date(value)).filter(date => Number.isFinite(date.getTime())).sort((a, b) => b - a)[0]?.toISOString() || null;
function quizResult(row) {
  if (!row) return null;
  const score = Number(row.score);
  const total = Number(row.total_questions);
  return { score, total, percent: total > 0 && score >= 0 && score <= total ? Math.round(score / total * 100) : null, at: latest([row.updated_at, row.completed_at]) };
}

function buildProgressReport(student, curriculum, attempts, exerciseRows, miniGames) {
  const quizMap = new Map();
  for (const row of attempts) {
    const id = Number(row.lesson_id);
    if (!quizMap.has(id)) quizMap.set(id, {});
    const previous = quizMap.get(id)[row.quiz_type];
    if (!previous || new Date(latest([row.updated_at, row.completed_at]) || 0) >= new Date(latest([previous.updated_at, previous.completed_at]) || 0)) quizMap.get(id)[row.quiz_type] = row;
  }
  const exercises = new Map(exerciseRows.map(row => [Number(row.lesson_id), row]));
  const lessons = curriculum.map(lesson => {
    const quiz = quizMap.get(Number(lesson.lesson_id)) || {};
    const exercise = exercises.get(Number(lesson.lesson_id)) || {};
    const progress = evaluateLesson({ pre: quiz.pre, post: quiz.post, hasPreQuiz: lesson.has_pre,
      hasPostQuiz: lesson.has_post, exercisesTotal: lesson.exercise_total,
      exercisesPassed: exercise.passed, exercisesAttempted: exercise.attempted });
    // Content-only lessons have no measurable completion criterion. Do not present them as achievements.
    const measurable = Boolean(lesson.has_post) || Number(lesson.exercise_total) > 0;
    const pre = quizResult(quiz.pre);
    const post = quizResult(quiz.post);
    return { lesson_id: Number(lesson.lesson_id), title: lesson.title, module_id: lesson.module_id,
      module_title: lesson.module_title, has_pre: lesson.has_pre, has_post: lesson.has_post,
      status: measurable ? progress.status : 'no_criteria', measurable,
      pre, post, gain: pre?.percent != null && post?.percent != null ? post.percent - pre.percent : null,
      exercises: { total: progress.exercisesTotal, attempted: progress.exercisesAttempted, passed: progress.exercisesPassed, submissions: Number(exercise.submissions || 0) },
      last_activity_at: latest([pre?.at, post?.at, exercise.last_activity_at]),
      needs_review: Boolean(lesson.has_post && post?.percent != null && !progress.postPassed),
    };
  });
  const measured = lessons.filter(lesson => lesson.measurable);
  const completed = measured.filter(lesson => lesson.status === 'done').length;
  const paired = lessons.filter(lesson => lesson.gain != null);
  const lastLesson = lessons.filter(lesson => lesson.last_activity_at).sort((a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at))[0] || null;
  const nextLesson = measured.find(lesson => lesson.status !== 'done') || null;
  const modules = [...new Set(lessons.map(lesson => lesson.module_id))].map(id => {
    const rows = lessons.filter(lesson => lesson.module_id === id);
    return { module_id: id, title: rows[0].module_title, total: rows.filter(row => row.measurable).length,
      completed: rows.filter(row => row.measurable && row.status === 'done').length };
  });
  return { student, lessons, modules, last_lesson: lastLesson, next_lesson: nextLesson,
    summary: { total: measured.length, content_only: lessons.length - measured.length, completed,
      in_progress: measured.filter(lesson => lesson.status === 'in_progress').length,
      not_started: measured.filter(lesson => lesson.status === 'not_started').length,
      completion_percent: measured.length ? Math.round(completed / measured.length * 100) : null,
      average_pre: mean(lessons.filter(lesson => lesson.pre?.percent != null).map(lesson => lesson.pre.percent)),
      average_post: mean(lessons.filter(lesson => lesson.post?.percent != null).map(lesson => lesson.post.percent)),
      paired_gain: mean(paired.map(lesson => lesson.gain)), paired_count: paired.length,
      pre_count: lessons.filter(lesson => lesson.pre?.percent != null).length,
      post_count: lessons.filter(lesson => lesson.post?.percent != null).length,
      needs_review: lessons.filter(lesson => lesson.needs_review).length,
      exercises_passed: lessons.reduce((sum, lesson) => sum + lesson.exercises.passed, 0),
      exercises_total: lessons.reduce((sum, lesson) => sum + lesson.exercises.total, 0),
      exercises_attempted: lessons.reduce((sum, lesson) => sum + lesson.exercises.attempted, 0),
      exercise_submissions: lessons.reduce((sum, lesson) => sum + lesson.exercises.submissions, 0),
      mini_games_attempted: Number(miniGames?.attempted || 0), mini_games_completed: Number(miniGames?.completed || 0),
      last_activity_at: latest([lastLesson?.last_activity_at, miniGames?.last_activity_at]),
    }, post_pass_percent: POST_PASS_RATIO * 100 };
}

function createStudentProgressRouter(db) {
  const router = express.Router();
  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const id = verifyAdminToken((req.get('Authorization') || '').replace(/^Bearer /, ''));
    if (!id) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบแอดมินใหม่' });
    try {
      const [users] = await db.execute("SELECT user_id FROM users WHERE user_id = ? AND role = 'admin' AND COALESCE(is_deleted, 0) = 0 AND COALESCE(is_banned, 0) = 0", [id]);
      if (!users.length) return res.status(403).json({ error: 'เฉพาะแอดมินเท่านั้นที่ดูรายงานผู้เรียนได้' });
      next();
    } catch (error) { next(error); }
  });
  router.get('/', async (req, res, next) => {
    const search = String(req.query.q || '').trim().slice(0, 100);
    const page = Number(req.query.page || 1);
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000) return res.status(400).json({ error: 'หมายเลขหน้าไม่ถูกต้อง' });
    // strpos treats %, _ and quotes as literal search characters.
    const where = "role IN ('user', 'student') AND COALESCE(is_deleted, 0) = 0 AND (strpos(lower(username), lower(?)) > 0 OR strpos(lower(COALESCE(email, '')), lower(?)) > 0)";
    try {
      const [counts] = await db.execute(`SELECT COUNT(*) AS total FROM users WHERE ${where}`, [search, search]);
      const [students] = await db.execute(`SELECT user_id, username, email, level, is_banned FROM users WHERE ${where} ORDER BY lower(username), user_id LIMIT 20 OFFSET ?`, [search, search, (page - 1) * 20]);
      res.json({ students, total: Number(counts[0].total), page, page_size: 20 });
    } catch (error) { next(error); }
  });
  router.get('/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) return res.status(400).json({ error: 'รหัสผู้เรียนไม่ถูกต้อง' });
    try {
      const [users] = await db.execute("SELECT user_id, username, email, level, xp, created_at, is_banned FROM users WHERE user_id = ? AND role IN ('user', 'student') AND COALESCE(is_deleted, 0) = 0", [id]);
      if (!users.length) return res.status(404).json({ error: 'ไม่พบผู้เรียนนี้ หรือบัญชีถูกลบแล้ว' });
      const [[curriculum], [attempts], [exerciseRows], [miniGames]] = await Promise.all([
        db.execute(`SELECT l.lesson_id, l.title, l.module_id, COALESCE(m.title, 'ไม่ระบุหมวด') AS module_title,
          EXISTS(SELECT 1 FROM lesson_quizzes q WHERE q.lesson_id = l.lesson_id AND q.quiz_type = 'pre') AS has_pre,
          EXISTS(SELECT 1 FROM lesson_quizzes q WHERE q.lesson_id = l.lesson_id AND q.quiz_type = 'post') AS has_post,
          (SELECT COUNT(*) FROM exercises e WHERE e.lesson_id = l.lesson_id) AS exercise_total
          FROM lessons l LEFT JOIN modules m ON m.module_id = l.module_id
          ORDER BY COALESCE(m.order_index, 0), l.order_index, l.lesson_id`),
        db.execute('SELECT lesson_id, quiz_type, score, total_questions, completed_at, updated_at FROM lesson_quiz_attempts WHERE user_id = ?', [id]),
        db.execute(`SELECT e.lesson_id, COUNT(DISTINCT es.exercise_id) AS attempted,
          COUNT(DISTINCT CASE WHEN es.is_passed = 1 THEN es.exercise_id END) AS passed,
          COUNT(*) AS submissions, MAX(es.submitted_at) AS last_activity_at
          FROM exercise_submissions es JOIN exercises e ON e.exercise_id = es.exercise_id WHERE es.user_id = ? GROUP BY e.lesson_id`, [id]),
        db.execute(`SELECT COUNT(DISTINCT exercise_id) AS attempted,
          COUNT(DISTINCT CASE WHEN is_completed = 1 THEN exercise_id END) AS completed,
          MAX(updated_at) AS last_activity_at FROM mini_game_user_exercise_progress WHERE user_id = ?`, [id]),
      ]);
      res.json(buildProgressReport(users[0], curriculum, attempts, exerciseRows, miniGames[0]));
    } catch (error) { next(error); }
  });
  router.use((error, _req, res, _next) => {
    console.error('Student progress report failed:', error.code || error.name);
    res.status(500).json({ error: 'โหลดรายงานไม่สำเร็จ กรุณาลองใหม่' });
  });
  return router;
}
module.exports = { createStudentProgressRouter, buildProgressReport };
