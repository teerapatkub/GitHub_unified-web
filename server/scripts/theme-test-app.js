// Isolated integration fixture: production tables are only SELECTed. All writes
// go to connection-local TEMP tables, destroyed when the connection closes.
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), quiet: true });
const { Client } = require('pg');
const express = require('express');
const path = require('path');
const { createThemeRouter } = require('../themeRoutes');
const { createLessonAdminRouter } = require('../lessonAdminRoutes');
const { createLessonContentRouter } = require('../lessonContentRoutes');
const { createStudentProgressRouter } = require('../studentProgressRoutes');
const { issueAdminToken } = require('../adminAccess');

async function startTestApp(port = 0) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const client = new Client({
    ...(connectionString ? { connectionString } : {
      host: process.env.PGHOST, port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER, password: process.env.PGPASSWORD, database: process.env.PGDATABASE,
    }),
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000, statement_timeout: 15000,
  });
  await client.connect();
  try {
    await client.query(`CREATE TEMP TABLE shop_items (LIKE public.shop_items INCLUDING DEFAULTS);
      CREATE TEMP SEQUENCE theme_test_ids START 1000000;
      ALTER TABLE pg_temp.shop_items ALTER COLUMN item_id SET DEFAULT nextval('pg_temp.theme_test_ids');
      INSERT INTO pg_temp.shop_items SELECT * FROM public.shop_items;
      CREATE TEMP TABLE users (user_id integer, role text, is_deleted integer DEFAULT 0, is_banned integer DEFAULT 0);
      INSERT INTO pg_temp.users (user_id, role) VALUES (900001, 'admin'), (900002, 'user');`);
    await client.query(`ALTER TABLE pg_temp.users ADD COLUMN username text DEFAULT 'Test learner',
      ADD COLUMN email text, ADD COLUMN level integer DEFAULT 1, ADD COLUMN xp integer DEFAULT 0,
      ADD COLUMN created_at timestamp DEFAULT CURRENT_TIMESTAMP;
      CREATE TEMP TABLE exercises AS SELECT exercise_id, lesson_id FROM public.exercises;
      CREATE TEMP TABLE lesson_quiz_attempts (user_id integer, lesson_id integer, quiz_type text, score integer, total_questions integer, completed_at timestamptz, updated_at timestamptz);
      CREATE TEMP TABLE exercise_submissions (user_id integer, exercise_id integer, is_passed integer, submitted_at timestamptz);
      CREATE TEMP TABLE mini_game_user_exercise_progress (user_id integer, exercise_id integer, is_completed integer, updated_at timestamptz);`);
    for (const [table, id] of Object.entries({ modules: 'module_id', lessons: 'lesson_id', lesson_slides: 'slide_id', lesson_quizzes: 'quiz_id', quiz_questions: 'question_id', question_choices: 'choice_id' })) {
      await client.query(`CREATE TEMP TABLE ${table} (LIKE public.${table} INCLUDING DEFAULTS);
        CREATE TEMP SEQUENCE ${table}_qa_ids START 1000000;
        ALTER TABLE pg_temp.${table} ALTER COLUMN ${id} SET DEFAULT nextval('pg_temp.${table}_qa_ids');
        INSERT INTO pg_temp.${table} SELECT * FROM public.${table}`);
    }
    const db = {
      async query(sql, params = []) {
        let index = 0;
        const result = await client.query(sql.replace(/\?/g, () => `$${++index}`), params);
        return [result.command === 'SELECT' ? result.rows : { rows: result.rows, affectedRows: result.rowCount }];
      },
      execute(sql, params) { return this.query(sql, params); },
      async getConnection() {
        return { query: this.query.bind(this), execute: this.execute.bind(this),
          beginTransaction: () => client.query('BEGIN'), commit: () => client.query('COMMIT'),
          rollback: () => client.query('ROLLBACK'), release() {} };
      },
    };
    const app = express();
    app.use(express.json());
    app.use('/api/themes', createThemeRouter(db));
    app.use('/api/admin/lessons', createLessonAdminRouter(db));
    app.use('/api', createLessonContentRouter(db));
    app.use('/api/admin/student-progress', createStudentProgressRouter(db));
    const user = { user_id: 900001, username: 'Theme QA', role: 'admin', level: 10 };
    const adminToken = issueAdminToken(user);
    app.get('/qa-login', (_req, res) => res.redirect(`/admin/theme?user=${encodeURIComponent(JSON.stringify({ ...user, admin_token: adminToken }))}`));
    app.get('/qa-lessons', (_req, res) => res.redirect(`/admin/add-lesson?user=${encodeURIComponent(JSON.stringify({ ...user, admin_token: adminToken }))}`));
    const learner = { user_id: 900002, username: 'Lesson QA learner', role: 'user', level: 99, xp: 0, coins: 0 };
    app.get('/qa-learner', (_req, res) => res.redirect(`/learn?user=${encodeURIComponent(JSON.stringify(learner))}`));
    app.get('/qa-progress', (_req, res) => res.redirect(`/admin/student-progress?user=${encodeURIComponent(JSON.stringify({ ...user, admin_token: adminToken }))}`));
    app.get('/api/shop/items', async (_req, res) => {
      const [rows] = await db.query('SELECT *, item_type AS type, effects AS preview_data FROM shop_items WHERE is_active = 1');
      res.json(rows);
    });
    app.get('/api/shop/sets', (_req, res) => res.json([]));
    app.get('/api/shop/inventory/:id', (_req, res) => res.json([]));
    app.get('/api/user/profile/:id', (req, res) => res.json(Number(req.params.id) === learner.user_id ? learner : user));
    // Preview-only quiz persistence; production grading/rewards are not invoked.
    const previewAnswers = new Map();
    app.get('/api/lessons/:id/quiz-results/:userId', async (req, res) => {
      const result = await client.query('SELECT * FROM pg_temp.lesson_quiz_attempts WHERE lesson_id=$1 AND user_id=$2', [req.params.id, req.params.userId]);
      res.json(result.rows.map(row => ({ ...row, answers: previewAnswers.get(`${row.lesson_id}:${row.user_id}:${row.quiz_type}`) || {} })));
    });
    app.post('/api/lessons/:id/quiz-results', async (req, res) => {
      const { user_id, quiz_type, score, total_questions, answers } = req.body;
      await client.query('DELETE FROM pg_temp.lesson_quiz_attempts WHERE lesson_id=$1 AND user_id=$2 AND quiz_type=$3', [req.params.id, user_id, quiz_type]);
      await client.query('INSERT INTO pg_temp.lesson_quiz_attempts (lesson_id, user_id, quiz_type, score, total_questions, completed_at, updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW())', [req.params.id, user_id, quiz_type, score, total_questions]);
      previewAnswers.set(`${req.params.id}:${user_id}:${quiz_type}`, answers);
      res.json({ success: true });
    });
    app.post('/api/presence', (_req, res) => res.json({ success: true }));
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use(express.static(path.join(__dirname, '../../client/dist')));
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(__dirname, '../../client/dist/index.html')));
    const server = await new Promise(resolve => { const listener = app.listen(port, '127.0.0.1', () => resolve(listener)); });
    return {
      client, adminToken, origin: `http://127.0.0.1:${server.address().port}`,
      async close() { await new Promise(resolve => server.close(resolve)); await client.end(); },
    };
  } catch (error) { await client.end(); throw error; }
}

module.exports = { startTestApp };
if (require.main === module) {
  startTestApp(3101).then(({ origin }) => console.log(`Temporary-table preview: ${origin}`)).catch(error => {
    console.error('Preview failed:', error.code || error.name); process.exitCode = 1;
  });
}
