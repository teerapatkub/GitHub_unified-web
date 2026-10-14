import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadExerciseList } from './exercise-data.js';

test('exercise list falls back only when a route is absent or has no lessons', async () => {
  const paths = [];
  const list = await loadExerciseList(12, {
    fetchImpl: async url => {
      paths.push(url);
      return url.includes('/list/')
        ? new Response('{}', { status: 404 })
        : new Response(JSON.stringify({ exercise: { exercise_id: 5 } }), { status: 200 });
    },
  });
  assert.deepEqual(list, [{ exercise_id: 5 }]);
  assert.deepEqual(paths, ['/api/exercises/list/12', '/api/exercises/12']);
});

test('exercise load reports server failure instead of claiming the lesson has no exercise', async () => {
  await assert.rejects(loadExerciseList(12, {
    fetchImpl: async () => new Response('{}', { status: 500 }),
  }), error => error.kind === 'server');
});

test('exercise load reports a malformed successful list', async () => {
  await assert.rejects(loadExerciseList(12, {
    fetchImpl: async () => new Response('{}', { status: 200 }),
  }), error => error.kind === 'invalid');
});
