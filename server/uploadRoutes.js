// POST /api/upload for admin media, and the /uploads/<name> fallback that sends
// a browser to the stored object. Admin-only access is enforced by the player
// auth middleware in front of these routes (server/auth/index.js).
const express = require('express');
const multer = require('multer');

const ALLOWED_MIME = /^(image|video)\//;
const ALLOWED_EXT = /\.(png|jpg|jpeg|gif|webp|mp4|mov|webm|avi)$/i;

function createUploadRouter({ store, maxBytes = 25 * 1024 * 1024 }) {
  const upload = multer({
    // The file goes straight on to the store; nothing is written to local disk.
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME.test(file.mimetype || '') && ALLOWED_EXT.test(file.originalname || '')) return cb(null, true);
      return cb(new Error('อัปโหลดได้เฉพาะไฟล์ภาพหรือวิดีโอ'));
    },
  });
  const router = express.Router();
  router.post('/', (req, res) => {
    upload.single('file')(req, res, async (error) => {
      if (error) return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'ไฟล์ใหญ่เกินกำหนด' : error.message });
      if (!req.file) return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
      try {
        const url = await store.save({
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          contentType: req.file.mimetype,
        });
        return res.json({ url });
      } catch (storeError) {
        console.error('Upload storage failed:', storeError.message);
        return res.status(503).json({ error: 'เก็บไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง' });
      }
    });
  });
  return router;
}

// Mounted after the local /uploads directories, so a file that ships with the
// app or was uploaded to local disk is served first.
function redirectUploadsToStore(store) {
  return (req, res, next) => {
    if (!store.publicUrl || !['GET', 'HEAD'].includes(req.method)) return next();
    const name = req.path.slice(1);
    if (!/^[\w.-]+$/.test(name) || name.startsWith('.')) return next();
    return res.redirect(302, store.publicUrl(name));
  };
}

module.exports = { createUploadRouter, redirectUploadsToStore };
