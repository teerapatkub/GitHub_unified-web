const assert = require('node:assert/strict');
const test = require('node:test');

const db = require('../db');
const {
  archiveExistingLegacyBackup,
  ensureChildForeignKeyColumn,
  migrateLegacyRows,
} = require('../problemsSchema');

const legacyExercise = {
  exercise_id: 7,
  title: 'Legacy exercise',
  description: 'Legacy description',
  test_cases_json: '[]',
  xp_reward: 10,
  currency_reward: 5,
  is_active: 1,
};

test('mini-game choices schema creates the choice table and dialogue-order index', async () => {
  const originalQuery = db.query;
  const statements = [];
  db.query = async (sql) => {
    statements.push(sql);
    if (/SELECT c\.relkind/i.test(sql)) return [[], []];
    return [[], []];
  };

  try {
    await db.ensureMiniGameChoicesSchema();
  } finally {
    db.query = originalQuery;
  }

  assert.equal(statements.length, 4);
  assert.match(statements[0], /SELECT c\.relkind/);
  assert.match(statements[1], /CREATE TABLE IF NOT EXISTS mini_game_choices/);
  assert.match(statements[1], /next_dialogue_id BIGINT/);
  assert.match(statements[1], /next_branch_key VARCHAR\(80\)/);
  assert.match(statements[2], /idx_mini_game_choices_dialogue_order/);
  assert.match(statements[3], /CREATE OR REPLACE VIEW mini_game_exercises/);
  assert.match(statements[3], /'code_checks'/);
  assert.match(statements[3], /'isinstance'/);
});

test('mini-game choices migration converts a legacy exercise table before replacing its view', async () => {
  const originalQuery = db.query;
  const problemSchema = require('../problemsSchema');
  const originalMigrateProblems = problemSchema.migrateProblems;
  const steps = [];
  db.query = async (sql) => {
    if (/SELECT c\.relkind/i.test(sql)) return [[{ relkind: 'r' }], []];
    steps.push(sql);
    return [[], []];
  };
  problemSchema.migrateProblems = async () => {
    steps.push('migrate legacy problem tables');
  };

  try {
    await db.ensureMiniGameChoicesSchema();
  } finally {
    db.query = originalQuery;
    problemSchema.migrateProblems = originalMigrateProblems;
  }

  assert.equal(steps[0], 'migrate legacy problem tables');
  assert.match(steps[steps.length - 1], /CREATE OR REPLACE VIEW mini_game_exercises/);
});

test('legacy rows already present in problem_modes are not inserted a second time', async () => {
  const statements = [];
  const fakeDb = {
    async query(sql) {
      statements.push(sql);
      return [[{ exists: 1 }], []];
    },
  };

  const migrated = await migrateLegacyRows(fakeDb, 'minigame', [legacyExercise]);

  assert.equal(migrated, 0);
  assert.equal(statements.length, 1);
  assert.match(statements[0], /SELECT 1 FROM problem_modes/);
});

test('legacy rows absent from problem_modes are migrated normally', async () => {
  const statements = [];
  const fakeDb = {
    async query(sql) {
      statements.push(sql);
      if (/SELECT 1 FROM problem_modes/.test(sql)) return [[], []];
      if (/INSERT INTO problems/.test(sql)) return [{ insertId: 99 }, []];
      return [[], []];
    },
  };

  const migrated = await migrateLegacyRows(fakeDb, 'minigame', [legacyExercise]);

  assert.equal(migrated, 1);
  assert.equal(statements.length, 3);
  assert.match(statements[1], /INSERT INTO problems/);
  assert.match(statements[2], /INSERT INTO problem_modes/);
});

test('existing pre-merge backup is preserved under an unused name before replacement', async () => {
  const statements = [];
  const existingRelations = new Set([
    'mini_game_exercises_pre_merge',
    'mini_game_exercises_pre_merge_previous_1',
  ]);
  const fakeDb = {
    async query(sql, params = []) {
      if (/SELECT c\.relkind/i.test(sql)) {
        return [existingRelations.has(params[0]) ? [{ relkind: 'r' }] : [], []];
      }
      statements.push(sql);
      return [[], []];
    },
  };

  const archivedName = await archiveExistingLegacyBackup(fakeDb, 'mini_game_exercises');

  assert.equal(archivedName, 'mini_game_exercises_pre_merge_previous_2');
  assert.deepEqual(statements, [
    'ALTER TABLE "mini_game_exercises_pre_merge" RENAME TO "mini_game_exercises_pre_merge_previous_2"',
  ]);
});

test('missing current-conversation exercise_id is restored before adding its foreign key', async () => {
  const statements = [];
  const fakeDb = {
    async query(sql) {
      statements.push(sql);
      return [[], []];
    },
  };

  await ensureChildForeignKeyColumn(fakeDb, {
    table: 'mini_game_current_conversations',
    column: 'exercise_id',
  });
  await ensureChildForeignKeyColumn(fakeDb, {
    table: 'mini_game_dialogues',
    column: 'exercise_id',
  });

  assert.equal(statements.length, 1);
  assert.match(statements[0], /ADD COLUMN IF NOT EXISTS "exercise_id" BIGINT/);
});
