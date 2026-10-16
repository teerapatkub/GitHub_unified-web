const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');

const { createSupabaseAssetStore } = require('../assetStore');
const { createUploadRouter, redirectUploadsToStore } = require('../uploadRoutes');

// Admin uploads (lesson media, cosmetic art) must survive a restart, and the
// free host has no persistent disk. They go to object storage; the database
// keeps the same relative /uploads/<name> URL it always has, and /uploads/<name>
// redirects to the stored object when the file is not on local disk.

const memoryStore = ({ fail = false } = {}) => {
  const saved = [];
  return {
    saved,
    async save(file) {
      if (fail) throw new Error('storage down');
      saved.push(file);
      return `/uploads/stored-${saved.length}${file.originalName.slice(file.originalName.lastIndexOf('.'))}`;
    },
    publicUrl: (name) => `https://project.supabase.co/storage/v1/object/public/uploads/${name}`,
  };
};

async function serve(t, store) {
  const app = express();
  app.use('/api/upload', createUploadRouter({ store }));
  app.use('/uploads', redirectUploadsToStore(store));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const upload = (name, type, bytes = Buffer.from('fake image bytes')) => {
    const form = new FormData();
    form.append('file', new Blob([bytes], { type }), name);
    return fetch(`${base}/api/upload`, { method: 'POST', body: form });
  };
  return { base, upload };
}

test('an admin upload is saved to the store and answered with its /uploads URL', async (t) => {
  const store = memoryStore();
  const { upload } = await serve(t, store);
  const response = await upload('Lesson Art.PNG', 'image/png');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { url: '/uploads/stored-1.PNG' });
  assert.equal(store.saved.length, 1);
  assert.equal(store.saved[0].originalName, 'Lesson Art.PNG');
  assert.equal(store.saved[0].contentType, 'image/png');
  assert.equal(store.saved[0].buffer.toString(), 'fake image bytes');
});

test('uploads that are not images or videos, or are missing, are refused before storage', async (t) => {
  const store = memoryStore();
  const { upload, base } = await serve(t, store);
  assert.equal((await upload('notes.html', 'text/html')).status, 400);
  assert.equal((await upload('trick.png', 'text/html')).status, 400);
  assert.equal((await fetch(`${base}/api/upload`, { method: 'POST', body: new FormData() })).status, 400);
  assert.equal(store.saved.length, 0);
});

test('a storage outage is reported instead of returning a URL that will not load', async (t) => {
  const { upload } = await serve(t, memoryStore({ fail: true }));
  const response = await upload('art.png', 'image/png');
  assert.equal(response.status, 503);
  assert.equal('url' in await response.json(), false);
});

test('/uploads/<name> redirects to the stored object; odd names fall through', async (t) => {
  const { base } = await serve(t, memoryStore());
  const hit = await fetch(`${base}/uploads/1792-55.png`, { redirect: 'manual' });
  assert.equal(hit.status, 302);
  assert.equal(hit.headers.get('location'), 'https://project.supabase.co/storage/v1/object/public/uploads/1792-55.png');
  assert.equal((await fetch(`${base}/uploads/..%2F.env`, { redirect: 'manual' })).status, 404);
  assert.equal((await fetch(`${base}/uploads/a/b.png`, { redirect: 'manual' })).status, 404);
});

test('the Supabase store creates its public bucket once and uploads under a fresh name', async () => {
  const calls = [];
  const client = { storage: {
    createBucket: async (name, options) => { calls.push(['createBucket', name, options]); return { error: calls.length > 1 ? { message: 'The resource already exists' } : null }; },
    from: (bucket) => ({
      upload: async (name, buffer, options) => { calls.push(['upload', bucket, name, options.contentType, buffer.length]); return { error: null }; },
    }),
  } };
  const store = createSupabaseAssetStore({ client, bucket: 'uploads', supabaseUrl: 'https://project.supabase.co/' });
  const first = await store.save({ buffer: Buffer.from('abc'), originalName: 'A.WebP', contentType: 'image/webp' });
  const second = await store.save({ buffer: Buffer.from('defg'), originalName: 'clip.mp4', contentType: 'video/mp4' });
  assert.match(first, /^\/uploads\/\d+-\d+\.webp$/);
  assert.match(second, /^\/uploads\/\d+-\d+\.mp4$/);
  assert.notEqual(first, second);
  assert.deepEqual(calls.filter(([kind]) => kind === 'createBucket'), [['createBucket', 'uploads', { public: true }]]);
  assert.deepEqual(calls.filter(([kind]) => kind === 'upload').map((call) => call.slice(3)), [['image/webp', 3], ['video/mp4', 4]]);
  assert.equal(store.publicUrl('x.png'), 'https://project.supabase.co/storage/v1/object/public/uploads/x.png');
});

test('the Supabase store surfaces a failed upload as unavailable', async () => {
  const client = { storage: {
    createBucket: async () => ({ error: { message: 'already exists' } }),
    from: () => ({ upload: async () => ({ error: { message: 'quota exceeded' } }) }),
  } };
  const store = createSupabaseAssetStore({ client, bucket: 'uploads', supabaseUrl: 'https://project.supabase.co' });
  await assert.rejects(store.save({ buffer: Buffer.from('a'), originalName: 'a.png', contentType: 'image/png' }), /ASSET_STORE_UNAVAILABLE/);
});
