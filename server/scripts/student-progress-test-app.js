const { startTestApp } = require('./theme-test-app');

async function startProgressApp(port = 0) {
  const app = await startTestApp(port);
  try {
    // Every target is explicitly pg_temp. Real accounts, scores and content are untouched.
    await app.client.query(`DELETE FROM pg_temp.lessons; DELETE FROM pg_temp.modules;
      DELETE FROM pg_temp.lesson_quizzes; DELETE FROM pg_temp.exercises;
      UPDATE pg_temp.users SET username = 'ผู้เรียนตัวอย่าง', email = 'learner@example.test', level = 3, xp = 120 WHERE user_id = 900002;
      INSERT INTO pg_temp.users (user_id, role, username, email, is_deleted) VALUES
        (900003, 'student', 'ผู้เรียนใหม่', 'new@example.test', 0),
        (900004, 'user', 'Deleted learner', 'deleted@example.test', 1);
      INSERT INTO pg_temp.modules (module_id, title, order_index) VALUES (100001, 'พื้นฐาน Python', 1), (100002, 'ฝึกเขียนโปรแกรม', 2);
      INSERT INTO pg_temp.lessons (lesson_id, module_id, title, order_index) VALUES
        (100001, 100001, 'เริ่มต้นกับ print()', 1), (100002, 100001, 'ตัวแปรและชนิดข้อมูล', 2),
        (100003, 100002, 'ฝึกใช้เงื่อนไข', 1), (100004, 100002, 'เอกสารอ่านเพิ่มเติม', 2),
        (100005, 100002, 'การทำงานซ้ำ', 3);
      INSERT INTO pg_temp.lesson_quizzes (quiz_id, lesson_id, quiz_type) VALUES
        (100001, 100001, 'pre'), (100002, 100001, 'post'),
        (100003, 100002, 'pre'), (100004, 100002, 'post'), (100005, 100005, 'post');
      INSERT INTO pg_temp.exercises (exercise_id, lesson_id) VALUES (100001, 100001), (100002, 100003), (100003, 100003);
      INSERT INTO pg_temp.lesson_quiz_attempts (user_id, lesson_id, quiz_type, score, total_questions, completed_at) VALUES
        (900002, 100001, 'pre', 1, 5, '2026-09-29T09:00:00Z'),
        (900002, 100001, 'post', 4, 5, '2026-09-29T10:00:00Z'),
        (900002, 100002, 'pre', 3, 5, '2026-09-30T09:00:00Z'),
        (900002, 100002, 'post', 2, 5, '2026-09-30T10:00:00Z');
      INSERT INTO pg_temp.exercise_submissions (user_id, exercise_id, is_passed, submitted_at) VALUES
        (900002, 100002, 0, '2026-09-30T11:00:00Z'), (900002, 100002, 1, '2026-09-30T12:00:00Z'),
        (900002, 100002, 1, '2026-09-30T13:00:00Z');
      INSERT INTO pg_temp.mini_game_user_exercise_progress (user_id, exercise_id, is_completed, updated_at) VALUES
        (900002, 100001, 1, '2026-09-30T14:00:00Z');`);
    return app;
  } catch (error) { await app.close(); throw error; }
}
module.exports = { startProgressApp };
if (require.main === module) startProgressApp(3102).then(app => console.log(`Progress preview (TEMP data only): ${app.origin}/qa-progress`)).catch(error => { console.error(error.code || error.name); process.exitCode = 1; });
