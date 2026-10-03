const assert = require('node:assert/strict');
const { startTestApp } = require('./theme-test-app');
const { issueAdminToken } = require('../adminAccess');

(async () => {
  const app = await startTestApp();
  let checks = 0;
  const equal = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
  const tables = ['modules', 'lessons', 'lesson_slides', 'lesson_quizzes', 'quiz_questions', 'question_choices'];
  const snapshot = async schema => {
    const result = {};
    for (const table of tables) result[table] = (await app.client.query(`SELECT md5(COALESCE(string_agg(row_to_json(t)::text, '' ORDER BY row_to_json(t)::text), '')) AS digest FROM ${schema}.${table} t`)).rows[0].digest;
    return result;
  };
  const send = async (path = '', body, token = app.adminToken) => {
    const response = await fetch(`${app.origin}/api/admin/lessons${path}`, {
      method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, data: await response.json() };
  };
  try {
    const original = await snapshot('public');
    const tempOriginal = await snapshot('pg_temp');
    equal((await send('', undefined, '')).status, 401);
    equal((await send('', undefined, issueAdminToken({ user_id: 900002, role: 'admin' }))).status, 403);
    const catalog = await send();
    equal(catalog.status, 200);
    const moduleId = catalog.data.modules[0].module_id;
    const info = { moduleId, orderIndex: 9999, title: 'QA lesson', description: 'Isolated test' };
    equal((await send('', { ...info, title: '' })).status, 400);
    equal((await send('', { ...info, moduleId: 2147483647 })).status, 404);
    const created = await send('', info);
    equal(created.status, 201);
    const id = created.data.lesson_id;
    equal((await send('', info)).status, 409);
    const slide = { title: 'New slide', content: 'print("hello")', mediaUrl: '', mediaType: 'image' };
    equal((await send(`/${id}/slides`, { entries: [slide] })).status, 201);
    equal((await send(`/${id}/slides`, { entries: [{ ...slide, title: 'GIF', mediaUrl: '/uploads/test.gif', mediaType: 'gif' }] })).status, 201);
    equal((await send(`/${id}/slides`, { entries: [slide, { ...slide, mediaUrl: 'javascript:alert(1)' }] })).status, 400);
    equal((await send(`/${id}/slides`, { entries: [{ ...slide, content: '' }] })).status, 400);
    equal((await send('/2147483647/slides', { entries: [slide] })).status, 404);
    const question = { type: 'choice', question: '2 + 2?', options: ['3', '4', '5', '6'], correct: 1 };
    equal((await send(`/${id}/pre`, { entries: [question] })).status, 201);
    equal((await send(`/${id}/pre`, { entries: [question] })).status, 201);
    equal((await send(`/${id}/post`, { entries: [{ type: 'fill', question: 'Output?', answer: 'hello' }, question] })).status, 201);
    equal((await send(`/${id}/pre`, { entries: [{ type: 'fill', question: 'Fill pre', answer: 'x' }] })).status, 201);
    equal((await send(`/${id}/pre`, { entries: [{ type: 'fill', question: 'Empty answer', answer: ' ' }] })).status, 400);
    equal((await send(`/${id}/post`, { entries: [{ ...question, correct: 4 }] })).status, 400);
    equal((await send(`/${id}/post`, { entries: [{ ...question, options: ['x', 'x', 'y', 'z'] }] })).status, 400);
    equal((await send(`/${id}/post`, { entries: [] })).status, 400);
    const [counts] = (await send()).data.lessons.filter(row => row.lesson_id === id);
    equal([Number(counts.slide_count), Number(counts.pre_count), Number(counts.post_count)], [2, 3, 2]);
    const slides = (await app.client.query('SELECT slide_order, slide_type FROM pg_temp.lesson_slides WHERE lesson_id=$1 ORDER BY slide_order', [id])).rows;
    equal(slides, [{ slide_order: 1, slide_type: 'image' }, { slide_order: 2, slide_type: 'image' }]);
    const questions = (await app.client.query('SELECT z.quiz_type, q.question_order, q.correct_answer FROM pg_temp.quiz_questions q JOIN pg_temp.lesson_quizzes z USING (quiz_id) WHERE z.lesson_id=$1 ORDER BY z.quiz_type, q.question_order', [id])).rows;
    equal(questions.map(q => [q.quiz_type, q.question_order, q.correct_answer]), [['post', 1, 'hello'], ['post', 2, '4'], ['pre', 1, '4'], ['pre', 2, '4'], ['pre', 3, 'x']]);
    // Read through the exact router mounted in production, not a mock reader.
    const read = async path => {
      const response = await fetch(`${app.origin}/api${path}`);
      equal(response.status, 200);
      return response.json();
    };
    const course = await read('/course-content?user_id=900002&user_level=99');
    const published = course.find(module => module.module_id === moduleId).lessons.find(lesson => lesson.lesson_id === id);
    equal([published.title, published.order_index, published.has_pre_quiz, published.has_post_quiz], [info.title, 9999, true, true]);
    const details = await read(`/lessons/${id}`);
    equal([details.title, details.description], [info.title, info.description]);
    const learnerSlides = await read(`/lessons/${id}/slides`);
    equal(learnerSlides.map(row => [row.title, row.slide_content, row.slide_src]), [['New slide', slide.content, ''], ['GIF', slide.content, '/uploads/test.gif']]);
    const learnerQuizzes = await read(`/lessons/${id}/quizzes`);
    equal(learnerQuizzes.find(quiz => quiz.quiz_type === 'pre').questions.map(q => q.question_type), ['choice', 'choice', 'fill']);
    const post = learnerQuizzes.find(quiz => quiz.quiz_type === 'post').questions;
    equal(post[1].choices.map(choice => choice.choice_text), question.options);
    const { isQuizAnswerCorrect } = await import('../../client/src/utils/quizAnswer.js');
    equal(post.map(q => isQuizAnswerCorrect({ answer: q.correct_answer }, q.question_type === 'choice' ? '4' : 'hello')), [true, true]);
    equal((await fetch(`${app.origin}/api/lessons/2147483647`)).status, 404);
    equal((await fetch(`${app.origin}/api/lessons/invalid`)).status, 400);
    equal((await send(`/${id}/slides`, { entries: [{ ...slide, title: 'Video', mediaUrl: '/uploads/lesson.mp4', mediaType: 'video' }] })).status, 201);
    const videoSlides = await read(`/lessons/${id}/slides`);
    equal([videoSlides[2].slide_type, videoSlides[2].slide_src, videoSlides[2].slide_content], ['video', '/uploads/lesson.mp4', slide.content]);
    equal(Number((await app.client.query('SELECT COUNT(*) FROM pg_temp.question_choices WHERE question_id >= 1000000')).rows[0].count), 12);
    // Force an error on the second insert to prove an incomplete batch is rolled back.
    await app.client.query("ALTER TABLE pg_temp.lesson_slides ADD CONSTRAINT qa_reject CHECK (slide_title <> 'FAIL')");
    equal((await send(`/${id}/slides`, { entries: [slide, { ...slide, title: 'FAIL' }] })).status, 500);
    equal(Number((await app.client.query('SELECT COUNT(*) FROM pg_temp.lesson_slides WHERE lesson_id=$1', [id])).rows[0].count), 3);
    const existingId = catalog.data.lessons[0].lesson_id;
    const lastOrder = Number((await app.client.query('SELECT COALESCE(MAX(slide_order),0) AS n FROM pg_temp.lesson_slides WHERE lesson_id=$1', [existingId])).rows[0].n);
    equal((await send(`/${existingId}/slides`, { entries: [slide] })).status, 201);
    equal(Number((await app.client.query('SELECT MAX(slide_order) AS n FROM pg_temp.lesson_slides WHERE lesson_id=$1', [existingId])).rows[0].n), lastOrder + 1);
    equal((await send(`/${existingId}/pre`, { entries: [question] })).status, 201);
    // Remove only fixture rows from TEMP tables; the original copies must match exactly.
    for (const [table, column] of Object.entries({ lessons: 'lesson_id', lesson_slides: 'slide_id', lesson_quizzes: 'quiz_id', quiz_questions: 'question_id', question_choices: 'choice_id' })) {
      await app.client.query(`DELETE FROM pg_temp.${table} WHERE ${column} >= 1000000`);
    }
    equal(await snapshot('pg_temp'), tempOriginal);
    equal(await snapshot('public'), original);
    console.log(`PASS: ${checks} admin lesson checks (all writes in TEMP tables; public data unchanged)`);
  } finally { await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
