// Additive revisioning: existing saved drafts remain recoverable as revision 0.
async function migrateArcadeDrafts(db) {
  await db.query('ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS draft_revision INTEGER NOT NULL DEFAULT 0');
}
module.exports = { migrateArcadeDrafts };
