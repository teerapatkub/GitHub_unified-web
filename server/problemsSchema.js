// server/problemsSchema.js
//
// One home for every coding problem in the project, and the compatibility layer
// that lets the rest of the codebase keep reading it the way it always has.
//
// WHY
// ---
// Coding problems used to live in four unrelated tables, one per person who
// built a mode: `exercises` (lessons), `mini_game_exercises` (story mini-games),
// `multiplayer_challenges` (competitive arena) and `arcade_tasks` (battle
// royale). They all store the same idea - a title, a description, starter code,
// a reference solution and a set of test cases - but each invented its own
// spelling of it. Three of the four are plain stdin/stdout problems that
// disagreed on whether the expected output field is called `expected` or
// `output`; the fourth calls a function with an argument list instead.
//
// That split had costs: five separate answer-checkers grew up around it, and a
// problem written for one mode could not be offered in another.
//
// SHAPE
// -----
//   problems       - the problem itself, once. Bilingual prose, code, and test
//                    cases normalised to ONE representation with a `test_kind`
//                    discriminator saying how to run them.
//   problem_modes  - which modes offer that problem, and the settings that only
//                    make sense for a given mode (a lesson's ordering, an
//                    arcade round's typing budget, a challenge's time limit).
//
// It is a many-to-many on purpose: a newly written problem can be registered in
// every mode at once, which is the whole point of merging the tables. A problem
// that belongs to a single mode is just a row with one registration.
//
// IDENTITY (the part to read before changing anything)
// ---------------------------------------------------
// `problem_modes` is keyed on (mode, entry_id) where entry_id is the id that
// mode has ALWAYS used - `exercises.exercise_id`, `arcade_tasks.task_id` and so
// on, unchanged. Nothing was renumbered, for two reasons:
//
//   * Twelve foreign keys point at these ids, several with ON DELETE CASCADE
//     that real behaviour depends on (deleting a mini-game exercise must take
//     its dialogue rows with it).
//   * `arcade_rooms.round_task_ids` stores arcade task ids inside a jsonb array
//     on every room ever played. Renumbering would silently invalidate the
//     history of finished matches.
//
// The child tables keep their single-column id and gain a generated constant
// column naming their mode, so the foreign key becomes composite and points at
// (mode, entry_id). Verified on PostgreSQL 18: cascade still fires.
//
// The four original tables become read-only views over this pair, so the ~41
// places that read them did not have to change. Writes go to `problems` /
// `problem_modes` directly - the views are deliberately not updatable, so code
// that writes through an old name fails loudly instead of quietly doing nothing.

const MODES = {
    lesson: { table: 'exercises', idColumn: 'exercise_id' },
    minigame: { table: 'mini_game_exercises', idColumn: 'exercise_id' },
    competitive: { table: 'multiplayer_challenges', idColumn: 'challenge_id' },
    arcade: { table: 'arcade_tasks', idColumn: 'task_id' },
};

// Child tables whose foreign key has to be re-pointed at problem_modes, with
// the mode each one implicitly belongs to and the constraints to replace.
const CHILD_FKS = [
    { table: 'exercise_submissions', column: 'exercise_id', mode: 'lesson', onDelete: 'CASCADE' },
    { table: 'exercises_files', column: 'exercise_id', mode: 'lesson', onDelete: 'CASCADE' },
    // virtual_emails.related_exercise_id is deliberately NOT re-linked. PostgreSQL
    // refuses ON DELETE SET NULL on a foreign key that contains a generated
    // column, and the alternatives are both wrong here: CASCADE would delete a
    // player's mail because an exercise was removed, and NO ACTION would block
    // removing an exercise any mail ever referenced. The column is nullable and
    // currently references nothing, so it is left unconstrained.
    { table: 'mini_game_current_conversations', column: 'exercise_id', mode: 'minigame', onDelete: 'CASCADE' },
    { table: 'mini_game_dialogues', column: 'exercise_id', mode: 'minigame', onDelete: 'CASCADE' },
    { table: 'mini_game_exercise_submissions', column: 'exercise_id', mode: 'minigame', onDelete: 'CASCADE' },
    { table: 'mini_game_exercises_files', column: 'exercise_id', mode: 'minigame', onDelete: 'CASCADE' },
    { table: 'mini_game_user_exercise_progress', column: 'exercise_id', mode: 'minigame', onDelete: 'CASCADE' },
    { table: 'active_accepted_challenges', column: 'challenge_id', mode: 'competitive', onDelete: 'CASCADE' },
    { table: 'multiplayer_submissions', column: 'challenge_id', mode: 'competitive', onDelete: 'CASCADE' },
];

const asJson = (value, fallback) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') return value;
    try { return JSON.parse(String(value)); } catch { return fallback; }
};

// --- test-case normalisation ----------------------------------------------
// Everything ends up as either
//   stdio    : [{ input: '<stdin>', expected: '<stdout>' }]
//   function : [{ args: [...],      expected: <value>    }]

function normalizeStdioCases(raw, { outputKey = 'expected' } = {}) {
    const list = Array.isArray(raw) ? raw : [];
    return list
        .filter((c) => c && typeof c === 'object')
        .map((c) => ({
            input: String(c.input ?? ''),
            expected: String(c[outputKey] ?? c.expected ?? c.output ?? c.expected_output ?? ''),
            // Some competitive challenges match on a pattern rather than a literal;
            // keeping the flag explicit means the grader never has to sniff for it.
            ...(Array.isArray(c.expected_any) ? { expected_any: c.expected_any.map(String) } : {}),
        }));
}

function normalizeFunctionCases(raw) {
    const list = Array.isArray(raw) ? raw : [];
    return list
        .filter((c) => c && typeof c === 'object')
        .map((c) => ({
            args: Array.isArray(c.input) ? c.input : [c.input],
            expected: c.output !== undefined ? c.output : c.expected,
        }));
}

// Mini-games store one object holding the branching rules AND the real cases.
// Only `correctness` is a test case; the rest describes the story branch and
// belongs with the mode's settings, not with the grading data.
function splitMiniGamePayload(raw) {
    const parsed = asJson(raw, null);
    if (Array.isArray(parsed)) {
        return { cases: normalizeStdioCases(parsed), extra: {} };
    }
    if (parsed && typeof parsed === 'object') {
        return {
            cases: normalizeStdioCases(parsed.correctness || []),
            extra: {
                expected_format: parsed.expected_format ?? '',
                rules: Array.isArray(parsed.rules) ? parsed.rules : [],
            },
        };
    }
    return { cases: [], extra: {} };
}

// --- schema + one-time migration -------------------------------------------

const CREATE_PROBLEMS = `
    CREATE TABLE IF NOT EXISTS problems (
        problem_id      BIGSERIAL PRIMARY KEY,
        title_th        TEXT NOT NULL DEFAULT '',
        title_en        TEXT,
        desc_th         TEXT NOT NULL DEFAULT '',
        desc_en         TEXT,
        hint_th         TEXT,
        hint_en         TEXT,
        starter_code    TEXT,
        solution_code   TEXT,
        test_kind       VARCHAR(20) NOT NULL DEFAULT 'stdio',
        test_cases      JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_by      INTEGER,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

const CREATE_PROBLEM_MODES = `
    CREATE TABLE IF NOT EXISTS problem_modes (
        mode            VARCHAR(20) NOT NULL,
        entry_id        INTEGER NOT NULL,
        problem_id      BIGINT NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
        lesson_id       INTEGER,
        order_index     VARCHAR(50),
        difficulty      VARCHAR(50),
        xp_reward       INTEGER NOT NULL DEFAULT 0,
        coin_reward     INTEGER NOT NULL DEFAULT 0,
        time_limit_sec  INTEGER,
        -- A real column, not a key in "extra": a timestamp stored as JSON text
        -- has to be parsed back out, and "timestamp without time zone" reads a
        -- UTC ISO string as local time, moving every deadline by the offset.
        expires_at      TIMESTAMP,
        extra           JSONB NOT NULL DEFAULT '{}'::jsonb,
        is_active       SMALLINT NOT NULL DEFAULT 1,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (mode, entry_id)
    )`;

// The compatibility views. Each rebuilds exactly the column list its mode's
// code already selects, including turning the normalised test cases back into
// the dialect that mode was written against.
//
// The three non-Arcade views also expose title_en/description_en, which their
// original tables never had. Nothing existing selects those names, so no caller
// changes meaning; they are what lets a page render EN without reaching past
// the view into `problems`. The Thai columns keep their original names, so a
// caller that never learned about English is unaffected.
const VIEWS = {
    exercises: `
        CREATE VIEW exercises AS
        SELECT m.entry_id                              AS exercise_id,
               m.lesson_id                             AS lesson_id,
               p.title_th                              AS title,
               p.desc_th                               AS description,
               p.title_en                              AS title_en,
               p.desc_en                               AS description_en,
               p.starter_code                          AS starter_code,
               p.solution_code                         AS solution_code,
               p.test_cases                            AS test_cases,
               m.xp_reward                             AS xp_reward,
               m.coin_reward                           AS currency_reward,
               NULLIF(m.extra->>'file_name', '')       AS file_name,
               NULLIF(m.order_index, '')::integer      AS order_index
          FROM problem_modes m
          JOIN problems p ON p.problem_id = m.problem_id
         WHERE m.mode = 'lesson'`,

    mini_game_exercises: `
        CREATE VIEW mini_game_exercises AS
        SELECT m.entry_id                              AS exercise_id,
               m.lesson_id                             AS lesson_id,
               m.order_index                           AS exercise_order,
               p.title_th                              AS title,
               p.desc_th                               AS description,
               p.title_en                              AS title_en,
               p.desc_en                               AS description_en,
               p.starter_code                          AS starter_code,
               p.solution_code                         AS solution_code,
               (jsonb_build_object(
                    'expected_format', COALESCE(m.extra->'expected_format', '""'::jsonb),
                    'rules',           COALESCE(m.extra->'rules', '[]'::jsonb),
                    'correctness',     p.test_cases))::text  AS test_cases_json,
               m.xp_reward                             AS xp_reward,
               m.coin_reward                           AS currency_reward,
               p.created_at                            AS created_at,
               p.updated_at                            AS updated_at,
               m.is_active                             AS is_active
          FROM problem_modes m
          JOIN problems p ON p.problem_id = m.problem_id
         WHERE m.mode = 'minigame'`,

    multiplayer_challenges: `
        CREATE VIEW multiplayer_challenges AS
        SELECT m.entry_id                              AS challenge_id,
               p.title_th                              AS title,
               p.desc_th                               AS description,
               p.title_en                              AS title_en,
               p.desc_en                               AS description_en,
               m.difficulty                            AS difficulty,
               m.coin_reward                           AS reward,
               m.time_limit_sec                        AS time_limit,
               -- "expected" rather than "output": the stored rows used both
               -- spellings, and normalizeCompetitiveTestCases() reads "expected"
               -- first and falls back to "output", so the canonical name is the
               -- one that needs no fallback.
               p.test_cases                            AS test_cases,
               p.created_by                            AS created_by,
               p.created_at                            AS created_at,
               COALESCE((m.extra->>'is_test')::integer, 0)   AS is_test,
               COALESCE(NULLIF(m.extra->>'challenge_type', ''), 'standard') AS challenge_type,
               COALESCE(NULLIF(m.extra->>'challenge_scope', ''), 'standard') AS challenge_scope,
               m.expires_at                            AS expires_at
          FROM problem_modes m
          JOIN problems p ON p.problem_id = m.problem_id
         WHERE m.mode = 'competitive'`,

    arcade_tasks: `
        CREATE VIEW arcade_tasks AS
        SELECT m.entry_id                              AS task_id,
               m.difficulty                            AS difficulty,
               p.title_th                              AS title_th,
               p.title_en                              AS title_en,
               p.desc_th                               AS desc_th,
               p.desc_en                               AS desc_en,
               p.solution_code                         AS initial_code,
               (SELECT COALESCE(jsonb_agg(jsonb_build_object('input', c->'args', 'output', c->'expected')), '[]'::jsonb)
                  FROM jsonb_array_elements(p.test_cases) c) AS test_cases,
               p.created_at                            AS created_at,
               p.starter_code                          AS starter_code,
               (m.extra->>'work_chars')::integer       AS work_chars,
               p.hint_th                               AS hint_th,
               p.hint_en                               AS hint_en
          FROM problem_modes m
          JOIN problems p ON p.problem_id = m.problem_id
         WHERE m.mode = 'arcade'`,
};

// Turn one legacy row into the pair of rows that replace it.
function projectLegacyRow(mode, row) {
    if (mode === 'lesson') {
        return {
            entryId: Number(row.exercise_id),
            problem: {
                title_th: row.title || '', desc_th: row.description || '',
                starter_code: row.starter_code, solution_code: row.solution_code,
                test_kind: 'stdio', test_cases: normalizeStdioCases(asJson(row.test_cases, [])),
            },
            registration: {
                lesson_id: row.lesson_id ?? null,
                order_index: row.order_index === null || row.order_index === undefined ? null : String(row.order_index),
                difficulty: null,
                expires_at: null,
                xp_reward: Number(row.xp_reward || 0), coin_reward: Number(row.currency_reward || 0),
                time_limit_sec: null,
                extra: row.file_name ? { file_name: row.file_name } : {},
                is_active: 1,
            },
        };
    }

    if (mode === 'minigame') {
        const { cases, extra } = splitMiniGamePayload(row.test_cases_json);
        return {
            entryId: Number(row.exercise_id),
            problem: {
                title_th: row.title || '', desc_th: row.description || '',
                starter_code: row.starter_code, solution_code: row.solution_code,
                test_kind: 'stdio', test_cases: cases,
            },
            registration: {
                lesson_id: row.lesson_id ?? null,
                order_index: row.exercise_order === null || row.exercise_order === undefined ? null : String(row.exercise_order),
                difficulty: null,
                expires_at: null,
                xp_reward: Number(row.xp_reward || 0), coin_reward: Number(row.currency_reward || 0),
                time_limit_sec: null,
                extra,
                is_active: Number(row.is_active ?? 1),
            },
        };
    }

    if (mode === 'competitive') {
        return {
            entryId: Number(row.challenge_id),
            problem: {
                title_th: row.title || '', desc_th: row.description || '',
                starter_code: null, solution_code: null,
                // Their cases spell the expected side `output`; everything else says `expected`.
                test_kind: 'stdio', test_cases: normalizeStdioCases(asJson(row.test_cases, []), { outputKey: 'output' }),
                created_by: row.created_by ?? null,
            },
            registration: {
                lesson_id: null, order_index: null,
                difficulty: row.difficulty || null,
                xp_reward: 0, coin_reward: Number(row.reward || 0),
                time_limit_sec: row.time_limit === null || row.time_limit === undefined ? null : Number(row.time_limit),
                expires_at: row.expires_at ?? null,
                extra: {
                    is_test: Number(row.is_test || 0),
                    challenge_type: row.challenge_type || 'standard',
                    challenge_scope: row.challenge_scope || 'standard',
                },
                is_active: 1,
            },
        };
    }

    // arcade
    return {
        entryId: Number(row.task_id),
        problem: {
            title_th: row.title_th || '', title_en: row.title_en || null,
            desc_th: row.desc_th || '', desc_en: row.desc_en || null,
            hint_th: row.hint_th || null, hint_en: row.hint_en || null,
            starter_code: row.starter_code, solution_code: row.initial_code,
            test_kind: 'function', test_cases: normalizeFunctionCases(asJson(row.test_cases, [])),
        },
        registration: {
            lesson_id: null, order_index: null,
            difficulty: row.difficulty || null,
            xp_reward: 0, coin_reward: 0, time_limit_sec: null, expires_at: null,
            extra: row.work_chars === null || row.work_chars === undefined ? {} : { work_chars: Number(row.work_chars) },
            is_active: 1,
        },
    };
}

// Is `name` still a real table (as opposed to the view we replace it with, or
// simply absent)? This is what makes the migration safe to run on every boot.
async function relationKind(db, name) {
    const [rows] = await db.query(
        `SELECT c.relkind FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public' AND c.relname = ?`,
        [name]
    );
    return rows?.[0]?.relkind || null; // 'r' = table, 'v' = view, null = missing
}

// Everything here happens on ONE connection inside ONE transaction. Swapping a
// table for a view is several statements per mode, and a failure halfway through
// would leave the database in a shape neither the old code nor the new code can
// work with - far worse than not having migrated at all.
async function migrateProblems(pool) {
    const db = await pool.getConnection();
    try {
        await db.beginTransaction();
        const moved = await runMigration(db);
        await db.commit();
        return moved;
    } catch (error) {
        await db.rollback();
        throw error;
    } finally {
        db.release();
    }
}

async function runMigration(db) {
    await db.query(CREATE_PROBLEMS);
    await db.query(CREATE_PROBLEM_MODES);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_problem_modes_problem ON problem_modes(problem_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_problem_modes_lesson ON problem_modes(mode, lesson_id)`);

    // Columns added after the first migration shipped. Adding them here rather
    // than in a one-off script means a database that has already migrated
    // converges on the next boot, same as a fresh one.
    await db.query(`ALTER TABLE problem_modes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP`);

    // Whether this problem can be marked right or wrong by running it.
    //
    // Most can. Some of the lesson exercises cannot, and it is not a defect in
    // them: they teach Flask, matplotlib, requests, reading a file that has to
    // exist, or random - things whose output is not a fixed string, needs the
    // network, or never terminates. Running those would fail every learner who
    // wrote a perfectly good answer.
    //
    // The flag is COMPUTED, not guessed: scripts/mark-auto-gradable.js runs each
    // problem's own reference solution against its own tests and records what
    // happened. Anything marked 0 is on an explicit, auditable list rather than
    // being quietly excused.
    await db.query(`ALTER TABLE problems ADD COLUMN IF NOT EXISTS is_auto_gradable SMALLINT NOT NULL DEFAULT 1`);

    // Views are rebuilt on every boot so a change to their definition takes
    // effect without anyone remembering to drop them by hand. DROP + CREATE
    // rather than CREATE OR REPLACE, because replacing cannot change a column's
    // type or drop one.
    const rebuildViews = async () => {
        for (const [name, sql] of Object.entries(VIEWS)) {
            if ((await relationKind(db, name)) === 'v') {
                await db.query(`DROP VIEW ${name}`);
                await db.query(sql);
            }
        }
    };

    const moved = {};
    for (const [mode, { table }] of Object.entries(MODES)) {
        if ((await relationKind(db, table)) !== 'r') continue; // already migrated

        const [rows] = await db.query(`SELECT * FROM ${table}`);
        let count = 0;
        for (const row of rows || []) {
            const { entryId, problem, registration } = projectLegacyRow(mode, row);
            const [ins] = await db.query(
                `INSERT INTO problems (title_th, title_en, desc_th, desc_en, hint_th, hint_en,
                                       starter_code, solution_code, test_kind, test_cases, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?) RETURNING problem_id`,
                [problem.title_th, problem.title_en ?? null, problem.desc_th, problem.desc_en ?? null,
                 problem.hint_th ?? null, problem.hint_en ?? null,
                 problem.starter_code ?? null, problem.solution_code ?? null,
                 problem.test_kind, JSON.stringify(problem.test_cases), problem.created_by ?? null]
            );
            const problemId = ins.insertId;
            await db.query(
                `INSERT INTO problem_modes (mode, entry_id, problem_id, lesson_id, order_index, difficulty,
                                            xp_reward, coin_reward, time_limit_sec, expires_at, extra, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?)`,
                [mode, entryId, problemId, registration.lesson_id, registration.order_index,
                 registration.difficulty, registration.xp_reward, registration.coin_reward,
                 registration.time_limit_sec, registration.expires_at ?? null,
                 JSON.stringify(registration.extra), registration.is_active]
            );
            count += 1;
        }

        // Drop every foreign key aimed at this table, then park the table under a
        // _pre_merge name. Renaming rather than dropping keeps the original rows
        // recoverable without a restore if anything about the projection is wrong.
        const [fks] = await db.query(
            `SELECT con.conname, cls.relname AS child
               FROM pg_constraint con
               JOIN pg_class cls ON cls.oid = con.conrelid
               JOIN pg_class ref ON ref.oid = con.confrelid
              WHERE con.contype = 'f' AND ref.relname = ?`,
            [table]
        );
        for (const fk of fks || []) {
            await db.query(`ALTER TABLE "${fk.child}" DROP CONSTRAINT "${fk.conname}"`);
        }

        await db.query(`ALTER TABLE ${table} RENAME TO ${table}_pre_merge`);
        await db.query(VIEWS[table]);
        moved[table] = count;
    }

    // Re-point the children at problem_modes. The mode is a constant per child
    // table, so a generated column supplies the other half of the composite key
    // without any row having to be rewritten.
    for (const fk of CHILD_FKS) {
        if ((await relationKind(db, fk.table)) !== 'r') continue;
        const marker = `problem_mode_${fk.mode}`;
        const [existing] = await db.query(
            `SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name=? AND column_name=?`,
            [fk.table, marker]
        );
        if (existing && existing.length > 0) continue;

        await db.query(
            `ALTER TABLE "${fk.table}" ADD COLUMN "${marker}" VARCHAR(20)
             GENERATED ALWAYS AS ('${fk.mode}') STORED`
        );
        // NOT VALID: legacy rows pointing at an id that never existed would
        // otherwise block the whole migration. New and updated rows are checked.
        await db.query(
            `ALTER TABLE "${fk.table}"
             ADD CONSTRAINT "fk_${fk.table}_problem_modes"
             FOREIGN KEY ("${marker}", "${fk.column}") REFERENCES problem_modes(mode, entry_id)
             ON DELETE ${fk.onDelete} NOT VALID`
        );
    }

    await rebuildViews();

    // One-time repair for databases migrated before expires_at became a real
    // column: the original rows are still sitting in the _pre_merge table, so
    // the correct values can be read straight back rather than reconstructed
    // from the text that lost its timezone.
    if ((await relationKind(db, 'multiplayer_challenges_pre_merge')) === 'r') {
        await db.query(
            `UPDATE problem_modes m
                SET expires_at = legacy.expires_at
               FROM multiplayer_challenges_pre_merge legacy
              WHERE m.mode = 'competitive'
                AND m.entry_id = legacy.challenge_id
                AND m.expires_at IS DISTINCT FROM legacy.expires_at`
        );
    }

    return moved;
}

module.exports = {
    MODES,
    CHILD_FKS,
    VIEWS,
    normalizeStdioCases,
    normalizeFunctionCases,
    splitMiniGamePayload,
    projectLegacyRow,
    migrateProblems,
};

