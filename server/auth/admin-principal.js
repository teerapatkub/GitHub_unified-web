const requireAdminPrincipal = (req, res, next) => {
  if (!req.player) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบแอดมินใหม่' });
  if (req.player.role !== 'admin') {
    return res.status(403).json({ error: 'เฉพาะแอดมินเท่านั้นที่ใช้คำสั่งนี้ได้' });
  }
  return next();
};

module.exports = { requireAdminPrincipal };
