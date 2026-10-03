const express = require('express');
const { verifyAdminToken } = require('./adminAccess');

const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const positive = (value) => Number.isInteger(value) && value > 0 && value <= 2147483647;
const mediaUrl = (value) => typeof value === 'string' && value.length <= 255
  && (!value || /^\/(?!\/)[^\\\r\n]*$/.test(value) || /^https?:\/\/[^\s]+$/i.test(value));

function createLessonAdminRouter(db) {
  const router = express.Router();
  router.use(async (req, res, next) => {
    const id = verifyAdminToken((req.get('Authorization') || '').replace(/^Bearer /, ''));
    if (!id) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบแอดมินใหม่' });
    try {
      const [users] = await db.execute("SELECT user_id FROM users WHERE user_id = ? AND role = 'admin' AND COALESCE(is_deleted, 0) = 0 AND COALESCE(is_banned, 0) = 0", [id]);
      if (!users.length) return res.status(403).json({ error: 'เฉพาะแอดมินเท่านั้นที่เพิ่มบทเรียนได้' });
      next();
    } catch (error) { next(error); }
  });

  router.get('/', async (_req, res, next) => {
    try {
      const [modules] = await db.query('SELECT module_id, title, required_level FROM modules ORDER BY order_index, module_id');
      const [lessons] = await db.query(`SELECT l.lesson_id, l.module_id, l.title, l.description, l.order_index,
        (SELECT COUNT(*) FROM lesson_slides s WHERE s.lesson_id = l.lesson_id) AS slide_count,
        (SELECT COUNT(*) FROM quiz_questions q JOIN lesson_quizzes z ON z.quiz_id = q.quiz_id WHERE z.lesson_id = l.lesson_id AND z.quiz_type = 'pre') AS pre_count,
        (SELECT COUNT(*) FROM quiz_questions q JOIN lesson_quizzes z ON z.quiz_id = q.quiz_id WHERE z.lesson_id = l.lesson_id AND z.quiz_type = 'post') AS post_count
        FROM lessons l ORDER BY l.module_id, l.order_index, l.lesson_id`);
      res.json({ modules, lessons });
    } catch (error) { next(error); }
  });

  router.post('/', async (req, res, next) => {
    const b = req.body || {};
    if (!positive(b.moduleId) || !positive(b.orderIndex) || !text(b.title, 100)
      || typeof b.description !== 'string' || b.description.length > 10000) {
      return res.status(400).json({ error: 'กรุณาเลือกหมวดบทเรียน กรอกลำดับเป็นจำนวนเต็มบวก และชื่อไม่เกิน 100 ตัวอักษร' });
    }
    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
      const [modules] = await conn.query('SELECT module_id, required_level FROM modules WHERE module_id = ? FOR UPDATE', [b.moduleId]);
      if (!modules.length) { await conn.rollback(); return res.status(404).json({ error: 'ไม่พบหมวดบทเรียน' }); }
      const [existing] = await conn.query('SELECT lesson_id FROM lessons WHERE module_id = ? AND order_index = ?', [b.moduleId, b.orderIndex]);
      if (existing.length) { await conn.rollback(); return res.status(409).json({ error: 'ลำดับนี้มีบทเรียนแล้ว กรุณาใช้ลำดับอื่น' }); }
      const [result] = await conn.query('INSERT INTO lessons (module_id, title, description, order_index, required_level) VALUES (?, ?, ?, ?, ?) RETURNING lesson_id',
        [b.moduleId, b.title.trim(), b.description.trim(), b.orderIndex, modules[0].required_level || 1]);
      await conn.commit();
      res.status(201).json(result.rows[0]);
    } catch (error) { if (conn) await conn.rollback(); next(error); }
    finally { conn?.release(); }
  });

  // Append content in one transaction, locking the parent lesson to serialize ordering.
  // Existing slides, questions and student attempts are never replaced or deleted.
  router.post('/:lessonId/:section', async (req, res, next) => {
    const id = Number(req.params.lessonId);
    const section = req.params.section;
    const entries = req.body?.entries;
    if (!positive(id) || !['slides', 'pre', 'post'].includes(section)) return res.status(400).json({ error: 'บทเรียนหรือประเภทเนื้อหาไม่ถูกต้อง' });
    if (!Array.isArray(entries) || entries.length < 1 || entries.length > 100) return res.status(400).json({ error: 'เพิ่มได้ครั้งละ 1–100 รายการ' });
    for (const entry of entries) {
      if (section === 'slides') {
        if (!entry || !text(entry.title, 255) || typeof entry.content !== 'string' || entry.content.length > 20000
          || !mediaUrl(entry.mediaUrl) || !['image', 'gif', 'video'].includes(entry.mediaType)
          || (!entry.content.trim() && !entry.mediaUrl)) {
          return res.status(400).json({ error: 'กรอกหัวข้อสไลด์และเนื้อหาหรือไฟล์สื่อให้ครบทุกสไลด์ (URL ไม่เกิน 255 ตัวอักษร)' });
        }
      } else {
        if (!entry || !text(entry.question, 10000) || !['fill', 'choice'].includes(entry.type)) return res.status(400).json({ error: 'กรอกคำถามและประเภทคำถามให้ถูกต้อง' });
        if (entry.type === 'fill' && !text(entry.answer, 10000)) return res.status(400).json({ error: 'กรอกคำตอบของข้อสอบเติมคำให้ครบ' });
        if (entry.type === 'choice' && (!Array.isArray(entry.options) || entry.options.length !== 4
          || !entry.options.every(option => text(option, 255)) || new Set(entry.options.map(option => option.trim())).size !== 4
          || !Number.isInteger(entry.correct) || entry.correct < 0 || entry.correct > 3)) {
          return res.status(400).json({ error: 'กรอก 4 ตัวเลือกที่ไม่ซ้ำกัน และเลือกคำตอบที่ถูกต้องทุกข้อ' });
        }
      }
    }
    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();
      const [lessons] = await conn.query('SELECT lesson_id FROM lessons WHERE lesson_id = ? FOR UPDATE', [id]);
      if (!lessons.length) { await conn.rollback(); return res.status(404).json({ error: 'ไม่พบบทเรียนที่เลือก' }); }
      if (section === 'slides') {
        const [rows] = await conn.query('SELECT COALESCE(MAX(slide_order), 0) AS last_order FROM lesson_slides WHERE lesson_id = ?', [id]);
        let order = Number(rows[0].last_order);
        for (const entry of entries) await conn.query('INSERT INTO lesson_slides (lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) VALUES (?, ?, ?, ?, ?, ?)',
          [id, ++order, entry.title.trim(), entry.content.trim(), entry.mediaUrl, entry.mediaType === 'gif' ? 'image' : entry.mediaType]);
      } else {
        const [quizzes] = await conn.query('SELECT quiz_id FROM lesson_quizzes WHERE lesson_id = ? AND quiz_type = ? ORDER BY quiz_id', [id, section]);
        let quizId = quizzes[0]?.quiz_id;
        if (!quizId) {
          const [created] = await conn.query('INSERT INTO lesson_quizzes (lesson_id, quiz_type) VALUES (?, ?) RETURNING quiz_id', [id, section]);
          quizId = created.rows[0].quiz_id;
        }
        const [rows] = await conn.query('SELECT COALESCE(MAX(question_order), 0) AS last_order FROM quiz_questions WHERE quiz_id = ?', [quizId]);
        let order = Number(rows[0].last_order);
        for (const entry of entries) {
          const answer = entry.type === 'choice' ? entry.options[entry.correct].trim() : entry.answer.trim();
          const [created] = await conn.query('INSERT INTO quiz_questions (quiz_id, question_order, question_text, question_type, correct_answer) VALUES (?, ?, ?, ?, ?) RETURNING question_id',
            [quizId, ++order, entry.question.trim(), entry.type, answer]);
          if (entry.type === 'choice') for (const option of entry.options) {
            await conn.query('INSERT INTO question_choices (question_id, choice_text) VALUES (?, ?)', [created.rows[0].question_id, option.trim()]);
          }
        }
      }
      await conn.commit();
      res.status(201).json({ added: entries.length });
    } catch (error) { if (conn) await conn.rollback(); next(error); }
    finally { conn?.release(); }
  });
  router.use((error, _req, res, _next) => {
    console.error('Admin lesson request failed:', error.code || error.name);
    res.status(500).json({ error: 'บันทึกบทเรียนไม่สำเร็จ กรุณาลองใหม่' });
  });
  return router;
}

module.exports = { createLessonAdminRouter };
