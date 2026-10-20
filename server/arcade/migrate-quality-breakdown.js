// What the code judge said about each round answer (ADR 0006): the three
// criteria, its one-line reason, the advice shown to the player afterwards,
// and where the score came from (ai / fallback / flagged / starter). All
// nullable: rounds settled before this have none of it.
async function migrateArcadeQualityBreakdown(db) {
  await db.query(`ALTER TABLE arcade_round_history
    ADD COLUMN IF NOT EXISTS quality_rubric JSONB,
    ADD COLUMN IF NOT EXISTS quality_reason TEXT,
    ADD COLUMN IF NOT EXISTS quality_feedback TEXT,
    ADD COLUMN IF NOT EXISTS quality_source VARCHAR(16)`);
}

module.exports = { migrateArcadeQualityBreakdown };
