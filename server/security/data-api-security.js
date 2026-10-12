const DATA_API_ROLE_NAMES = Object.freeze(['anon', 'authenticated']);

const quoteIdentifier = (identifier) => `"${String(identifier).replaceAll('"', '""')}"`;

const revokeFrom = async (db, objectType, objectName, principal) => {
  await db.raw(`REVOKE ALL PRIVILEGES ON ${objectType} ${objectName} FROM ${principal}`);
};

const applyDataApiSecurity = async (db) => {
  const [roleRows] = await db.query(`
    SELECT rolname AS name
    FROM pg_roles
    WHERE rolname IN ('anon', 'authenticated')
    ORDER BY rolname
  `);
  const roles = roleRows.map((row) => row.name);
  const principals = ['PUBLIC', ...roles.map(quoteIdentifier)];

  const [relations] = await db.query(`
    SELECT c.relname AS name,
           c.relkind AS kind,
           pg_get_userbyid(c.relowner) = current_user AS owned
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'S')
    ORDER BY c.relkind, c.relname
  `);
  const [functions] = await db.query(`
    SELECT format(
             '%I.%I(%s)',
             n.nspname,
             p.proname,
             pg_get_function_identity_arguments(p.oid)
           ) AS identity,
           p.proname AS name,
           pg_get_userbyid(p.proowner) = current_user AS owned
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    ORDER BY p.proname, p.oid
  `);

  const unowned = [
    ...relations.filter((relation) => !relation.owned).map((relation) => relation.name),
    ...functions.filter((fn) => !fn.owned).map((fn) => `${fn.name}()`),
  ].sort();
  if (unowned.length > 0) {
    throw new Error(`Cannot secure public relations not owned by the migration role: ${unowned.join(', ')}`);
  }

  for (const principal of principals) {
    await revokeFrom(db, 'SCHEMA', 'public', principal);
  }

  for (const relation of relations) {
    const qualified = `public.${quoteIdentifier(relation.name)}`;
    if (relation.kind === 'r' || relation.kind === 'p') {
      await db.raw(`ALTER TABLE ${qualified} ENABLE ROW LEVEL SECURITY`);
    } else if (relation.kind === 'v') {
      await db.raw(`ALTER VIEW ${qualified} SET (security_invoker = true)`);
    }

    const objectType = relation.kind === 'S' ? 'SEQUENCE' : 'TABLE';
    for (const principal of principals) {
      await revokeFrom(db, objectType, qualified, principal);
    }
  }

  for (const fn of functions) {
    for (const principal of principals) {
      await revokeFrom(db, 'FUNCTION', fn.identity, principal);
    }
  }

  const defaultObjectTypes = ['TABLES', 'SEQUENCES', 'FUNCTIONS'];
  for (const objectType of defaultObjectTypes) {
    for (const principal of principals) {
      await db.raw(
        `ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ${objectType} FROM ${principal}`,
      );
    }
  }

  return {
    tables: relations.filter((relation) => ['r', 'p'].includes(relation.kind)).length,
    views: relations.filter((relation) => ['v', 'm'].includes(relation.kind)).length,
    sequences: relations.filter((relation) => relation.kind === 'S').length,
    roles: roles.length,
  };
};

module.exports = {
  applyDataApiSecurity,
  quoteIdentifier,
};
