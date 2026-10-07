const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { normalizeEmail, validEmail, hashToken, accountEnabled, strongPassword, actorMatches } = require('./policy');
const COOKIE = 'pyarena_google_session';
const SESSION_DAYS = 7;
const message = (res, status, text, code) => res.status(status).json({ message: text, code });

function installAuth(app, db, admin, env = process.env, options = {}) {
  const origins = new Set(String(env.AUTH_ALLOWED_ORIGINS || 'http://localhost:5174,http://127.0.0.1:5174').split(',').map(v => v.trim()).filter(Boolean));
  if (env.CLIENT_URL) origins.add(new URL(env.CLIENT_URL).origin);
  const publicKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const publicClient = () => {
    if (options.createPublicClient) return options.createPublicClient();
    if (!env.SUPABASE_URL || !publicKey || !admin) throw new Error('AUTH_CONFIG');
    return createClient(env.SUPABASE_URL, publicKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  };
  const ready = (async () => {
    for (const statement of fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8').split(';').map(s => s.trim()).filter(Boolean)) {
      await db.execute(statement);
    }
    const [roles] = await db.execute("SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated')");
    for (const role of roles) {
      // Names come from a fixed allowlist, not request input.
      await db.execute(`REVOKE ALL ON player_auth_identities, player_google_sessions FROM "${role.rolname}"`);
    }
  })();
  // A failed schema check keeps authentication closed, without an unhandled rejection.
  ready.catch(() => console.error('Auth schema unavailable; authentication requests will return 503.'));
  const limited = new Map();
  const limit = (key, max = 12, duration = 15 * 60000) => {
    const now = Date.now();
    for (const [k, value] of limited) if (value.until <= now) limited.delete(k);
    const entry = limited.get(key) || { count: 0, until: now + duration };
    entry.count++; limited.set(key, entry);
    return entry.count > max;
  };
  const redirect = (req, kind) => {
    const origin = req.get('origin') || env.CLIENT_URL || 'http://localhost:5174';
    if (!origins.has(origin)) throw new Error('ORIGIN');
    return `${origin}/login?auth=${kind}`;
  };
  const safeUser = user => ({ user_id: user.user_id, username: user.username, email: user.email,
    role: user.role || 'user', level: Number(user.level ?? 0), xp: Number(user.xp || 0),
    virtual_currency: Number(user.virtual_currency || 0), isGuest: false });
  const findPlayer = async (identifier, executor = db) => {
    const [rows] = await executor.execute(
      'SELECT * FROM users WHERE username = ? OR lower(trim(email)) = ? LIMIT 2',
      [String(identifier || '').trim(), normalizeEmail(identifier)]);
    return rows.length === 1 ? rows[0] : null;
  };
  const bindingFor = async (id, executor = db) => {
    const [rows] = await executor.execute('SELECT * FROM player_auth_identities WHERE user_id = ?', [id]);
    return rows[0];
  };
  const resend = async (req, email) => {
    const { error } = await publicClient().auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirect(req, 'confirm') } });
    if (error) throw new Error('EMAIL_DELIVERY');
  };
  const route = handler => async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try { await ready; return await handler(req, res); }
    catch (error) {
      // Never return upstream messages, passwords, SMTP credentials or reset links.
      console.error('Auth request failed:', ['AUTH_CONFIG', 'EMAIL_DELIVERY', 'ORIGIN'].includes(error.message) ? error.message : 'operation_failed');
      return message(res, 503, error.message === 'EMAIL_DELIVERY' ? 'บันทึกบัญชีแล้ว แต่ส่งอีเมลไม่สำเร็จ กรุณาขอส่งใหม่หรือติดต่อผู้ดูแล' : 'ยังดำเนินการไม่ได้ กรุณาลองอีกครั้งหรือติดต่อผู้ดูแล', error.message === 'EMAIL_DELIVERY' ? 'EMAIL_DELIVERY' : undefined);
    }
  };

  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/auth/')) return next();
    const origin = req.get('origin');
    if (origin && !origins.has(origin)) return message(res, 403, 'ไม่อนุญาตเว็บไซต์ต้นทางนี้');
    if (req.method !== 'GET' && limit('ip:' + req.ip, 40)) return message(res, 429, 'ลองหลายครั้งเกินไป กรุณารอสักครู่');
    next();
  });

  app.post('/api/auth/sign-up', route(async (req, res) => {
    const username = String(req.body.username || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    if (!/^[^\s@<>]{2,40}$/.test(username) || !validEmail(email) || !strongPassword(password)) {
      return message(res, 400, 'ตรวจชื่อผู้ใช้ อีเมล และรหัสผ่านให้ครบตามเงื่อนไข');
    }
    if (!admin) throw new Error('AUTH_CONFIG');
    if (limit('signup:' + hashToken(email), 5, 3600000)) return message(res, 429, 'กรุณารอก่อนขออีเมลอีกครั้ง');
    const connection = await db.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();
      // Serialize registrations for the same email even when letter case differs.
      await connection.execute('SELECT pg_advisory_xact_lock(hashtext(?))', ['auth:' + email]);
      const [existing] = await connection.execute('SELECT user_id FROM users WHERE username = ? OR lower(trim(email)) = ?', [username, email]);
      if (existing.length) { await connection.rollback(); return message(res, 409, 'ชื่อผู้ใช้หรืออีเมลนี้มีบัญชีแล้ว กรุณาเข้าสู่ระบบหรือลืมรหัสผ่าน'); }
      // Confirmation is forced even if project auto-confirm was accidentally enabled.
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: false });
      if (error || !data.user) { await connection.rollback(); return message(res, 409, 'สร้างบัญชีไม่ได้ หากเคยสมัครแล้วให้เข้าสู่ระบบหรือติดต่อผู้ดูแล'); }
      const [created] = await connection.execute(
        `INSERT INTO users (username, email, password_hash, role, level, xp, virtual_currency)
         VALUES (?, ?, ?, 'user', 0, 0, 0)`, [username, email, await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)]);
      await connection.execute('INSERT INTO player_auth_identities (user_id, auth_user_id, email) VALUES (?, ?, ?)', [created.insertId, data.user.id, email]);
      await connection.commit(); committed = true;
      await resend(req, email);
      return res.status(201).json({ confirmationRequired: true, message: 'ส่งอีเมลยืนยันแล้ว กรุณาเปิดลิงก์ก่อนเข้าสู่ระบบ' });
    } finally { if (!committed) await connection.rollback(); connection.release(); }
  }));

  app.post('/api/auth/sign-in', route(async (req, res) => {
    const identifier = String(req.body.identifier || '').trim();
    const password = req.body.password;
    if (!identifier || typeof password !== 'string' || password.length > 128) return message(res, 400, 'กรอกอีเมลหรือชื่อผู้ใช้และรหัสผ่าน');
    if (limit('login:' + hashToken(identifier.toLowerCase()), 12)) return message(res, 429, 'ลองหลายครั้งเกินไป กรุณารอ 15 นาที');
    const user = await findPlayer(identifier);
    if (!accountEnabled(user)) return message(res, 401, 'เข้าสู่ระบบไม่ได้ กรุณาตรวจข้อมูลหรือสถานะบัญชี');
    let binding = await bindingFor(user.user_id);
    if (!binding) {
      if (!await bcrypt.compare(password, user.password_hash)) return message(res, 401, 'อีเมล ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง');
      const email = normalizeEmail(req.body.migrationEmail || user.email);
      if (!validEmail(email)) return message(res, 409, 'ยืนยันรหัสผ่านเดิมแล้ว กรุณาระบุอีเมลที่รับข้อความได้เพื่อเชื่อมบัญชี', 'EMAIL_REQUIRED');
      const connection = await db.getConnection();
      let committed = false;
      try {
        await connection.beginTransaction();
        await connection.execute('SELECT user_id FROM users WHERE user_id = ? FOR UPDATE', [user.user_id]);
        binding = await bindingFor(user.user_id, connection);
        if (!binding) {
          await connection.execute('SELECT pg_advisory_xact_lock(hashtext(?))', ['auth:' + email]);
          const [duplicates] = await connection.execute('SELECT user_id FROM users WHERE lower(trim(email)) = ? AND user_id != ?', [email, user.user_id]);
          if (duplicates.length) { await connection.rollback(); return message(res, 409, 'อีเมลซ้ำกับบัญชีอื่น กรุณาติดต่อผู้ดูแลเพื่อเชื่อมบัญชีโดยไม่สูญเสียข้อมูล'); }
          const { data, error } = await admin.auth.admin.createUser({ email, password_hash: user.password_hash, email_confirm: false });
          if (error || !data.user) { await connection.rollback(); return message(res, 409, 'เชื่อมบัญชีไม่ได้ กรุณาติดต่อผู้ดูแล ไม่ต้องสมัครผู้เล่นใหม่'); }
          await connection.execute('INSERT INTO player_auth_identities (user_id, auth_user_id, email) VALUES (?, ?, ?)', [user.user_id, data.user.id, email]);
          await connection.execute('UPDATE users SET email = ? WHERE user_id = ?', [email, user.user_id]);
          binding = { email, auth_user_id: data.user.id };
        }
        await connection.commit(); committed = true;
      } finally { if (!committed) await connection.rollback(); connection.release(); }
      await resend(req, binding.email);
      return res.json({ confirmationRequired: true, message: 'เชื่อมบัญชีเดิมแล้ว กรุณายืนยันอีเมลหนึ่งครั้ง ข้อมูลเกมและรหัสผ่านเดิมยังอยู่ครบ' });
    }
    const { data, error } = await publicClient().auth.signInWithPassword({ email: binding.email, password });
    if (error) {
      if (error.code === 'email_not_confirmed') return res.json({ confirmationRequired: true, message: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ หากไม่พบอีเมลสามารถขอส่งใหม่ได้' });
      return message(res, 401, 'อีเมล ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง');
    }
    return res.json({ session: data.session });
  }));

  app.post('/api/auth/resend', route(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    if (!validEmail(email)) return message(res, 400, 'กรุณากรอกอีเมลให้ถูกต้อง');
    if (limit('mail:' + hashToken(email), 5, 3600000)) return message(res, 429, 'กรุณารอก่อนขออีเมลอีกครั้ง');
    await resend(req, email);
    return res.json({ message: 'หากมีบัญชีที่รอยืนยัน ระบบจะส่งอีเมลให้ กรุณาตรวจกล่องจดหมายและสแปม' });
  }));
  app.post('/api/auth/forgot-password', route(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    if (!validEmail(email)) return message(res, 400, 'กรุณากรอกอีเมลให้ถูกต้อง');
    if (limit('mail:' + hashToken(email), 5, 3600000)) return message(res, 429, 'กรุณารอก่อนขออีเมลอีกครั้ง');
    // Only mapped accounts belong to this application. Legacy accounts must first
    // prove ownership with their existing password or through administrator support.
    const [bindings] = await db.execute('SELECT user_id FROM player_auth_identities WHERE lower(email) = ?', [email]);
    if (bindings.length) {
      const { error } = await publicClient().auth.resetPasswordForEmail(email, { redirectTo: redirect(req, 'recovery') });
      if (error) throw new Error('EMAIL_DELIVERY');
    }
    return res.json({ message: 'หากบัญชีนี้เชื่อมระบบใหม่แล้ว ระบบจะส่งลิงก์ให้ หากยังไม่เคยเชื่อมและจำรหัสผ่านเดิมไม่ได้ กรุณาติดต่อผู้ดูแล' });
  }));

  async function authenticate(req) {
    await ready;
    const bearer = /^Bearer (.+)$/i.exec(req.get('authorization') || '');
    let user;
    if (bearer) {
      if (!admin) throw new Error('AUTH_CONFIG');
      const { data, error } = await admin.auth.getUser(bearer[1]);
      if (error || !data.user?.email_confirmed_at) return null;
      const [rows] = await db.execute('SELECT u.* FROM users u JOIN player_auth_identities a ON a.user_id = u.user_id WHERE a.auth_user_id = ?', [data.user.id]);
      user = rows[0];
      req.authProvider = 'supabase';
    } else {
      const token = String(req.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
      if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
      const [rows] = await db.execute('SELECT u.* FROM users u JOIN player_google_sessions s ON s.user_id = u.user_id WHERE s.token_hash = ? AND s.expires_at > NOW()', [hashToken(token)]);
      user = rows[0];
      req.authProvider = 'google';
    }
    return accountEnabled(user) ? user : null;
  }
  const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production', path: '/' };
  async function issueGoogleSession(res, userId) {
    await ready;
    const token = crypto.randomBytes(32).toString('hex');
    await db.execute('DELETE FROM player_google_sessions WHERE expires_at <= NOW()');
    await db.execute('INSERT INTO player_google_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)', [hashToken(token), userId, new Date(Date.now() + SESSION_DAYS * 86400000)]);
    res.cookie(COOKIE, token, { ...cookieOptions, maxAge: SESSION_DAYS * 86400000 });
  }
  app.post('/api/auth/sign-out', route(async (req, res) => {
    if (req.get('x-pyarena-request') !== '1') return message(res, 403, 'คำขอไม่ถูกต้อง');
    const token = String(req.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    if (token) await db.execute('DELETE FROM player_google_sessions WHERE token_hash = ?', [hashToken(token)]);
    res.clearCookie(COOKIE, cookieOptions);
    return res.json({ success: true });
  }));

  // No old password store is allowed to bypass Supabase confirmation or recovery.
  app.use((req, res, next) => {
    if (['/login', '/register', '/api/login', '/api/register'].includes(req.path) && req.method === 'POST' || /^\/api\/(password\/|verify-email\/)/.test(req.path)) {
      return message(res, 410, 'ระบบเข้าสู่ระบบเปลี่ยนแล้ว กรุณารีเฟรชและใช้หน้าเข้าสู่ระบบปัจจุบัน');
    }
    next();
  });
  app.use(async (req, res, next) => {
    const publicRoutes = ['/api/config/google', '/api/auth/google'];
    if (publicRoutes.includes(req.path) || !/^\/(api(?:\/|$)|rooms(?:\/|$)|user\/|shop(?:\/|$)|achievements\/|music\/)/.test(req.path)) return next();
    try {
      req.player = await authenticate(req);
      if (!req.player) return message(res, 401, 'กรุณาเข้าสู่ระบบอีกครั้ง');
      const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
      if (mutating && (req.get('x-pyarena-request') !== '1' || (req.get('origin') && !origins.has(req.get('origin'))))) return message(res, 403, 'คำขอไม่ถูกต้อง');
      if (mutating && req.player.role !== 'admin' && Number(req.player.level) < 10 && /^\/api\/(competitive\/challenges|arcade\/rooms)/.test(req.path)) return message(res, 403, 'โหมดแข่งขันปลดล็อกที่เลเวล 10');
      const adminOnly = /^\/api\/(admin|dashboard)(\/|$)/.test(req.path) || req.path === '/api/upload' || req.path === '/api/competitive/admin/overview' || /\/force-summary$/.test(req.path);
      if (adminOnly && req.player.role !== 'admin') return message(res, 403, 'ต้องใช้สิทธิ์ผู้ดูแล');
      if (req.player.role !== 'admin') {
        if (!actorMatches(req.player, req.body) || !actorMatches(req.player, req.query)) return message(res, 403, 'ดำเนินการได้เฉพาะบัญชีของคุณ');
        const privateId = /^\/api\/(?:user\/profile|mailbox|user-stats|shop\/inventory)\/(\d+)(?:\/read-all)?$/.exec(req.path)?.[1];
        const editedId = mutating && /^\/api\/profile\/(\d+)\//.exec(req.path)?.[1];
        if ((privateId && Number(privateId) !== Number(req.player.user_id)) || (editedId && Number(editedId) !== Number(req.player.user_id))) return message(res, 403, 'ดำเนินการได้เฉพาะบัญชีของคุณ');
      }
      next();
    } catch { return message(res, 503, 'ตรวจสอบการเข้าสู่ระบบไม่ได้ กรุณาลองอีกครั้ง'); }
  });
  app.get('/api/auth/me', (req, res) => { res.set('Cache-Control', 'no-store'); res.json(safeUser(req.player)); });
  return { issueGoogleSession, accountEnabled, ready, origins };
}
module.exports = { installAuth };
