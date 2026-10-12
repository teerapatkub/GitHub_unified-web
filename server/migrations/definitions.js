const { defineMigration } = require('./index');
const {
  APPLICATION_SCHEMA_VERSION,
  CORE_SCHEMA_VERSION,
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

module.exports = {
  createApplicationSchemaMigration,
  createCoreSchemaMigration,
};
