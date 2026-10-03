const assert = require('node:assert/strict');
const { startProgressApp } = require('./student-progress-test-app');
const { issueAdminToken } = require('../adminAccess');

(async () => {
  const app = await startProgressApp();
  let checks = 0;
  const eq = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
  const get = async (path = '', token = app.adminToken) => {
    const response = await fetch(`${app.origin}/api/admin/student-progress${path}`, { headers: { Authorization: `Bearer ${token}` } });
    return { status: response.status, data: await response.json(), cache: response.headers.get('cache-control') };
  };
  try {
    eq((await get('', '')).status, 401);
    eq((await get('/900002', 'forged')).status, 401);
    eq((await get('/900002', issueAdminToken({ user_id: 900002, role: 'admin' }))).status, 403);
    const list = await get();
    eq(list.status, 200); eq(list.cache, 'no-store'); eq(list.data.total, 2);
    eq(list.data.students.map(row => row.user_id).sort(), [900002, 900003]);
    eq((await get('?q=new@example.test')).data.students.map(row => row.user_id), [900003]);
    eq((await get('?q=%25')).data.total, 0);
    eq((await get('?q=%27%20OR%201%3D1')).data.total, 0);
    eq((await get('?page=0')).status, 400); eq((await get('?page=2')).data.students.length, 0);
    eq((await get('/invalid')).status, 400); eq((await get('/900004')).status, 404); eq((await get('/900001')).status, 404);
    const report = (await get('/900002')).data;
    eq(report.student.username, 'ผู้เรียนตัวอย่าง');
    eq(Object.keys(report.student).sort(), ['user_id', 'username', 'email', 'level', 'xp', 'created_at', 'is_banned'].sort());
    eq([report.summary.total, report.summary.completed, report.summary.in_progress, report.summary.not_started, report.summary.content_only], [4, 1, 2, 1, 1]);
    eq(report.summary.completion_percent, 25);
    eq(report.lessons.map(row => row.status), ['done', 'in_progress', 'in_progress', 'no_criteria', 'not_started']);
    eq([report.summary.average_pre, report.summary.average_post, report.summary.paired_gain, report.summary.paired_count], [40, 60, 20, 2]);
    eq([report.summary.exercises_passed, report.summary.exercises_attempted, report.summary.exercise_submissions], [1, 1, 3]);
    eq(report.summary.needs_review, 1);
    eq(report.next_lesson.lesson_id, 100002); eq(report.last_lesson.lesson_id, 100003);
    eq(report.summary.last_activity_at, '2026-09-30T14:00:00.000Z');
    const fresh = (await get('/900003')).data;
    eq([fresh.summary.completed, fresh.summary.average_pre, fresh.summary.average_post, fresh.summary.paired_gain, fresh.summary.last_activity_at], [0, null, null, null, null]);
    // An unpaired post-test must not skew the pre/post growth measurement.
    await app.client.query("INSERT INTO pg_temp.lesson_quiz_attempts (user_id,lesson_id,quiz_type,score,total_questions) VALUES (900002,100005,'post',5,5)");
    eq((await get('/900002')).data.summary.paired_gain, 20);
    await app.client.query('UPDATE pg_temp.users SET is_banned=1 WHERE user_id=900001');
    eq((await get('/900002')).status, 403);
    await app.client.query('UPDATE pg_temp.users SET is_banned=0 WHERE user_id=900001');
    // A real query failure must return an error, never a plausible zero-filled report.
    const failedDb = { execute: async sql => { if (sql.includes("role = 'admin'")) return [[{ user_id: 1 }]]; throw new Error('offline'); } };
    const express = require('express');
    const server = express().use('/report', require('../studentProgressRoutes').createStudentProgressRouter(failedDb)).listen(0, '127.0.0.1');
    await new Promise(resolve => server.on('listening', resolve));
    try { eq((await fetch(`http://127.0.0.1:${server.address().port}/report`, { headers: { Authorization: `Bearer ${app.adminToken}` } })).status, 500); }
    finally { await new Promise(resolve => server.close(resolve)); }
    console.log(`PASS: ${checks} student progress checks (TEMP data only)`);
  } finally { await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
