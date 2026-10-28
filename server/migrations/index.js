const crypto = require('node:crypto');

const MIGRATION_TABLE = 'app_schema_migrations';
const MIGRATION_LOCK_KEY = 804651239;
// Hosted databases have recorded these migrations before their source was
// finalized. Accept only listed fingerprints paired with this exact,
// line-ending-normalized revision. Any other edit still fails closed.
const HISTORICAL_FINGERPRINTS = Object.freeze({
  '202610120001': {
    name: 'core_schema',
    applied: [
      '510e97a03e7a71f55b55055336de1e859bfd2dc60faa8fed4f950837ee7ab36a',
      'a32e43374eb674f64f68a96fe73264c347cde9fab53ee618b0566b9887baa4ed',
    ],
    current: 'e9c63aa7fef1f126ee6a5d1dd3f0859e71507b8e20759cda276409b26e4d0498',
  },
  '202610120002': {
    name: 'application_schema',
    applied: '8c9265911bc8d2dadbade7190308d2ec791af3e441def0b2b480715ce09ea895',
    current: 'd8dc162c488575994f322131575bb72190fe8ee8770843fa099d2241467c86cc',
  },
});

const defineMigration = ({ version, name, signature, up }) => {
  if (!/^\d{12,20}$/.test(String(version || ''))) {
    throw new Error(`Invalid migration version: ${version}`);
  }
  if (!/^[a-z][a-z0-9_]*$/.test(String(name || ''))) {
    throw new Error(`Invalid migration name: ${name}`);
  }
  if (typeof up !== 'function') {
    throw new Error(`Migration ${version} must provide an up function`);
  }

  const checksum = crypto
    .createHash('sha256')
    .update(`${version}\0${name}\0${String(signature || '').replace(/\r\n?/g, '\n')}`)
    .digest('hex');

  return Object.freeze({ version: String(version), name, checksum, up });
};

const validateMigrations = (migrations) => {
  const ordered = [...migrations].sort((a, b) => a.version.localeCompare(b.version));
  const versions = new Set();
  for (const migration of ordered) {
    if (versions.has(migration.version)) {
      throw new Error(`Duplicate migration version: ${migration.version}`);
    }
    versions.add(migration.version);
  }
  return ordered;
};

const ensureMigrationTable = async (db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      version VARCHAR(20) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const readAppliedMigrations = async (db) => {
  const [rows] = await db.query(`
    SELECT version, name, checksum
    FROM ${MIGRATION_TABLE}
    ORDER BY version ASC
  `);
  return new Map(rows.map((row) => [String(row.version), row]));
};

const assertMigrationMatches = (migration, applied) => {
  if (!applied) return;
  const historical = HISTORICAL_FINGERPRINTS[migration.version];
  const knownEarlierRevision = historical
    && migration.name === historical.name
    && applied.name === historical.name
    && historical.applied.includes(applied.checksum)
    && migration.checksum === historical.current;
  if (!knownEarlierRevision && (applied.name !== migration.name || applied.checksum !== migration.checksum)) {
    throw new Error(
      `Applied migration ${migration.version} differs from the repository; create a new migration instead of editing it`,
    );
  }
};

const runMigrations = async (db, migrations, options = {}) => {
  const ordered = validateMigrations(migrations);

  for (const migration of ordered) {
    await db.transaction(async () => {
      await db.query('SELECT pg_advisory_xact_lock(?) AS locked', [MIGRATION_LOCK_KEY]);
      await ensureMigrationTable(db);
      const applied = await readAppliedMigrations(db);
      const existing = applied.get(migration.version);
      assertMigrationMatches(migration, existing);
      if (existing) return;

      await migration.up();
      await db.query(
        `INSERT INTO ${MIGRATION_TABLE} (version, name, checksum) VALUES (?, ?, ?)`,
        [migration.version, migration.name, migration.checksum],
      );
    });
  }

  return getMigrationStatus(db, ordered, options);
};

const getMigrationStatus = async (db, migrations, { allowNewer = false } = {}) => {
  const ordered = validateMigrations(migrations);
  let applied;
  try {
    applied = await readAppliedMigrations(db);
  } catch (error) {
    // Readiness must remain read-only. A missing metadata table means the
    // migrations have not run yet; the migration runner is the only code that
    // may create it.
    if (error?.code !== '42P01') throw error;
    applied = new Map();
  }

  for (const migration of ordered) {
    assertMigrationMatches(migration, applied.get(migration.version));
  }

  const pendingVersions = ordered
    .filter((migration) => !applied.has(migration.version))
    .map((migration) => migration.version);
  const appliedVersions = [...applied.keys()].sort();
  const knownVersions = new Set(ordered.map((migration) => migration.version));
  const incompatibleVersions = appliedVersions.filter((version) => !knownVersions.has(version));

  return {
    ready: pendingVersions.length === 0 && (allowNewer || incompatibleVersions.length === 0),
    currentVersion: appliedVersions.at(-1) || null,
    requiredVersion: ordered.at(-1)?.version || null,
    pendingVersions,
    ...(incompatibleVersions.length > 0 ? { incompatibleVersions } : {}),
  };
};

module.exports = {
  MIGRATION_TABLE,
  defineMigration,
  getMigrationStatus,
  runMigrations,
};
