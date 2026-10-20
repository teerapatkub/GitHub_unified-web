const { defineMigration } = require('./index');
const {
  APPLICATION_SCHEMA_VERSION,
  AUTH_PROVISIONING_VERSION,
  CORE_SCHEMA_VERSION,
  DATA_API_SECURITY_VERSION,
  TUTORIALS_SEEN_VERSION,
} = require('./versions');

const signatureFor = (up, supplemental = '') => [
  up.toString(),
  String(supplemental || ''),
].join('\n-- migration dependency --\n');

const createCoreSchemaMigration = (up, signature) => defineMigration({
  version: CORE_SCHEMA_VERSION,
  name: 'core_schema',
  signature: signatureFor(up, signature),
  up,
});

const createApplicationSchemaMigration = (up, signature) => defineMigration({
  version: APPLICATION_SCHEMA_VERSION,
  name: 'application_schema',
  signature: signatureFor(up, signature),
  up,
});

const createDataApiSecurityMigration = (up, signature) => defineMigration({
  version: DATA_API_SECURITY_VERSION,
  name: 'restrict_supabase_data_api',
  signature: signatureFor(up, signature),
  up,
});

const createAuthProvisioningMigration = (up, signature) => defineMigration({
  version: AUTH_PROVISIONING_VERSION,
  name: 'auth_provisioning_reconciliation',
  signature: signatureFor(up, signature),
  up,
});

const createTutorialsSeenMigration = (up, signature) => defineMigration({
  version: TUTORIALS_SEEN_VERSION,
  name: 'users_tutorials_seen',
  signature: signatureFor(up, signature),
  up,
});

module.exports = {
  createApplicationSchemaMigration,
  createAuthProvisioningMigration,
  createCoreSchemaMigration,
  createDataApiSecurityMigration,
  createTutorialsSeenMigration,
};
