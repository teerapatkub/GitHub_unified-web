const { normalizeEmail, hashToken } = require('./policy');

function createProvisioningService({ db, admin, publicClient }) {
  const keyFor = (kind, subject, email) => hashToken(`${kind}:${subject}:${email}`);
  const update = async (operationKey, status, authUserId, lastError = null) => {
    await db.execute(
      `UPDATE auth_provisioning_operations
       SET status = ?, auth_user_id = COALESCE(?, auth_user_id), last_error = ?, updated_at = CURRENT_TIMESTAMP
       WHERE operation_key = ?`,
      [status, authUserId || null, lastError, operationKey],
    );
  };
  const begin = async (kind, subject, email) => {
    const operationKey = keyFor(kind, subject, email);
    const subjectHash = hashToken(String(subject));
    await db.execute(
      `INSERT INTO auth_provisioning_operations (operation_key, kind, subject_hash)
       VALUES (?, ?, ?) ON CONFLICT (operation_key) DO NOTHING`,
      [operationKey, kind, subjectHash],
    );
    const [rows] = await db.execute(
      'SELECT * FROM auth_provisioning_operations WHERE operation_key = ?',
      [operationKey],
    );
    if (!rows[0] || rows[0].kind !== kind || rows[0].subject_hash !== subjectHash) {
      throw new Error('AUTH_RECONCILE_REQUIRED');
    }
    return rows[0];
  };
  const acceptsPassword = async (email, password) => {
    const { data, error } = await publicClient().auth.signInWithPassword({ email, password });
    return Boolean(data?.session) || error?.code === 'email_not_confirmed';
  };
  const findByEmail = async email => {
    for (let page = 1; ; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error('AUTH_RECONCILE_REQUIRED');
      const users = data?.users || [];
      const found = users.find(user => normalizeEmail(user.email) === email);
      if (found) return found;
      if (users.length < 1000) return null;
    }
  };
  const findById = async authUserId => {
    const { data, error } = await admin.auth.admin.getUserById(authUserId);
    if (!error) return data?.user || null;
    if (error.status === 404 || error.code === 'user_not_found') return null;
    throw new Error('AUTH_RECONCILE_REQUIRED');
  };
  const createOrRecover = async ({ kind, subject, email, password, createInput }) => {
    const operation = await begin(kind, subject, email);
    if (operation.auth_user_id && operation.status !== 'compensated') {
      const savedUser = await findById(operation.auth_user_id);
      if (savedUser && normalizeEmail(savedUser.email) !== email) return null;
      if (savedUser) {
        return await acceptsPassword(email, password)
          ? { operationKey: operation.operation_key, authUserId: savedUser.id }
          : null;
      }
    }
    const { data, error } = await admin.auth.admin.createUser(createInput);
    let authUser = !error && data?.user ? data.user : null;
    if (!authUser) {
      authUser = await findByEmail(email);
      if (!authUser || !await acceptsPassword(email, password)) return null;
    }
    await update(operation.operation_key, 'auth_created', authUser.id);
    return { operationKey: operation.operation_key, authUserId: authUser.id };
  };
  const completeIfPresent = async (kind, subject, email, authUserId) => {
    const operationKey = keyFor(kind, subject, email);
    const [rows] = await db.execute(
      'SELECT operation_key FROM auth_provisioning_operations WHERE operation_key = ?',
      [operationKey],
    );
    if (rows.length) await update(operationKey, 'committed', authUserId);
  };
  const compensate = async (operationKey, authUserId) => {
    if (!authUserId) return;
    let bindings;
    try {
      [bindings] = await db.execute(
        'SELECT user_id FROM player_auth_identities WHERE auth_user_id = ?',
        [authUserId],
      );
    } catch {
      try { await update(operationKey, 'reconcile_required', authUserId, 'mapping_lookup_failed'); } catch {}
      throw new Error('AUTH_RECONCILE_REQUIRED');
    }
    if (bindings.length) {
      await update(operationKey, 'committed', authUserId);
      return;
    }
    try {
      const { error } = await admin.auth.admin.deleteUser(authUserId);
      if (error) throw error;
      await update(operationKey, 'compensated', authUserId);
    } catch {
      try { await update(operationKey, 'reconcile_required', authUserId, 'auth_cleanup_failed'); } catch {}
      throw new Error('AUTH_RECONCILE_REQUIRED');
    }
  };
  const transaction = connection => {
    let committed = false;
    let closed = false;
    let operationKey = null;
    let authUserId = null;
    return {
      track(operation) {
        operationKey = operation.operationKey;
        authUserId = operation.authUserId;
      },
      async commit() {
        await connection.commit();
        committed = true;
        if (operationKey) await update(operationKey, 'committed', authUserId);
      },
      async close() {
        if (closed) return;
        closed = true;
        try {
          if (!committed) {
            try { await connection.rollback(); }
            finally { await compensate(operationKey, authUserId); }
          }
        } finally {
          connection.release();
        }
      },
    };
  };

  return { acceptsPassword, completeIfPresent, createOrRecover, transaction };
}

module.exports = { createProvisioningService };
