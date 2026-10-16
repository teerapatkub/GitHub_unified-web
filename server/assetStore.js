// Where admin uploads (lesson media, cosmetic art) are kept.
//
// Every store answers save() with the same relative URL, /uploads/<name>, which
// is what the database has always stored: an absolute URL baked into a row
// breaks the day the domain changes. A store that lives off this machine also
// gives publicUrl(name), and /uploads/<name> redirects there.
//
// Production uses Supabase Storage because the free host has no persistent
// disk; a local disk store stays for development without a bucket.
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const freshName = (originalName) =>
  `${Date.now()}-${crypto.randomInt(1e9)}${path.extname(originalName || '').toLowerCase()}`;

function createDiskAssetStore(dir) {
  return {
    async save({ buffer, originalName }) {
      const name = freshName(originalName);
      await fs.writeFile(path.join(dir, name), buffer);
      return `/uploads/${name}`;
    },
    publicUrl: null,
  };
}

function createSupabaseAssetStore({ client, bucket, supabaseUrl }) {
  const base = String(supabaseUrl).replace(/\/+$/, '');
  let bucketReady = null;
  // The bucket is public-read; only this server, holding the secret key,
  // writes to it. Created on first use so a fresh project needs no manual step.
  const ensureBucket = () => {
    bucketReady ||= (async () => {
      const { error } = await client.storage.createBucket(bucket, { public: true });
      if (error && !/exist/i.test(error.message || '')) throw new Error('ASSET_STORE_UNAVAILABLE');
    })().catch((error) => {
      bucketReady = null;
      throw error;
    });
    return bucketReady;
  };
  return {
    async save({ buffer, originalName, contentType }) {
      await ensureBucket();
      const name = freshName(originalName);
      const { error } = await client.storage.from(bucket).upload(name, buffer, { contentType, upsert: false });
      if (error) throw new Error('ASSET_STORE_UNAVAILABLE');
      return `/uploads/${name}`;
    },
    publicUrl: (name) => `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(name)}`,
  };
}

module.exports = { createDiskAssetStore, createSupabaseAssetStore };
