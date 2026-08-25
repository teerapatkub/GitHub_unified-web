/**
 * Regenerate the two files a fresh installation needs to become a working
 * PySim: the table structure, and the course content.
 *
 *   node scripts/dump-schema.js
 *     → server/schema.sql        every table, index and constraint, no rows
 *     → server/seed-content.sql  the curriculum and catalogue rows, no accounts
 *
 * WHY THIS EXISTS
 *
 * Until now the database structure lived nowhere except the developer's own
 * Postgres, restored years ago from a hand-made dump. db.js creates the tables
 * it owns (arcade_*, problems, shop, achievements, survey) but nothing has ever
 * created `users`, `lessons`, `lesson_slides`, `quiz_questions` and the rest -
 * they were simply always there. Proven on 2026-08-26 by starting the finished
 * container against an empty database: the API came up and then answered every
 * request with `relation "users" does not exist`. The app was undeployable for
 * a reason no amount of reading the code would have shown.
 *
 * WHAT IS AND IS NOT IN THE OUTPUT
 *
 * schema.sql is structure only. seed-content.sql carries the tables that are
 * the product - lessons, slides, quizzes, the 192-problem bank, the shop
 * catalogue, achievements - and NONE of the tables that are about people.
 * The whitelist below is explicit rather than an exclusion list on purpose: a
 * new table added later is left out and someone notices content is missing,
 * which is the harmless direction. An exclusion list would default to
 * including, and the first table it failed to exclude would put real accounts,
 * password hashes and email addresses into a file in git.
 *
 * Uses pg_dump through the official postgres image, so no client tools need to
 * be installed on the machine running this.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config();

// Tables whose rows ARE the product. Everything else is somebody's data.
const CONTENT_TABLES = [
    // Curriculum
    'modules', 'lessons', 'lesson_slides', 'lesson_quizzes',
    'quiz_questions', 'question_choices',
    'advanced_validation', 'advanced_validation_choices',
    'assessment_questions', 'assessment_choices',
    // The problem bank and its mode registrations
    'problems', 'problem_modes', 'exercises_files',
    // Developer-life mini game
    'mini_game_locations', 'mini_game_npcs', 'mini_game_dialogues',
    'mini_game_exercises_files',
    // Catalogue and rules
    'level_config', 'achievements', 'shop_sets', 'shop_items', 'cosmetics',
    'arcade_items', 'survey_questions', 'survey_options', 'music_tracks',
];

const PG = {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || '5432',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'postgres',
};

// localhost means "this machine" to the container too, and inside a container
// that is the container itself.
const hostForContainer = ['localhost', '127.0.0.1', '::1'].includes(PG.host)
    ? 'host.docker.internal'
    : PG.host;

const pgDump = (args) => {
    const run = spawnSync('docker', [
        'run', '--rm', '-e', `PGPASSWORD=${PG.password}`,
        'postgres:18-alpine', 'pg_dump',
        '-h', hostForContainer, '-p', String(PG.port), '-U', PG.user, '-d', PG.database,
        '--no-owner', '--no-privileges',
        '--schema=public',
        // Ten triggers on public tables call functions that live here - the
        // emulation of MySQL's ON UPDATE CURRENT_TIMESTAMP, left behind by the
        // original port. Dumping public alone produces a file that refers to a
        // schema it never creates, and restoring it stops at the first trigger.
        '--schema=fullprojectpython',
        ...args,
    ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

    if (run.status !== 0) {
        console.error(run.stderr || run.error?.message);
        process.exit(1);
    }
    return run.stdout;
};

// Two things pg_dump writes that this project cannot execute:
//
//   \restrict / \unrestrict - psql directives, and these files are run through
//   node-postgres, which has no idea what they are.
//
//   CREATE SCHEMA public - every Postgres database already has one, so the very
//   first statement of the restore fails and takes the rest of the file with
//   it. Dropping it is what pg_dump's own --clean flag would work around, and
//   dropping the public schema of the database being restored into is not a
//   thing this should ever do.
const stripPsqlDirectives = (sql) => sql
    .split('\n')
    .filter((l) => !/^\\(un)?restrict\b/.test(l))
    .filter((l) => !/^CREATE SCHEMA public;/.test(l))
    .filter((l) => !/^COMMENT ON SCHEMA public /.test(l))
    // pg_dump empties search_path for the session and then qualifies every name
    // itself. Correct for psql, which opens a connection and throws it away;
    // here the file runs on a POOLED connection that goes straight back into the
    // pool still carrying the empty path, and the next query to reuse it dies
    // with "no schema has been selected to create in". Removed, and the path set
    // explicitly in the header instead.
    .filter((l) => !/^SELECT pg_catalog\.set_config\('search_path'/.test(l))
    .join('\n');

const header = (title, note) => `--
-- ${title}
--
-- GENERATED FILE - do not edit by hand.
-- Regenerate with:  node scripts/dump-schema.js
--
-- ${note}
--

SET search_path TO public;

`;

const outDir = path.join(__dirname, '..');

const schema = stripPsqlDirectives(pgDump(['--schema-only']));
fs.writeFileSync(
    path.join(outDir, 'schema.sql'),
    header('PySim database structure', 'Structure only. Contains no rows of any kind.') + schema,
    'utf8'
);

// --column-inserts, not pg_dump's default COPY form. COPY ... FROM stdin puts
// the rows in the byte stream that follows the statement, which is a protocol
// node-postgres does not speak - the restore stopped at the first data line
// with "syntax error at or near 2". Naming the columns as well costs size and
// buys immunity to a column being added in a different position later.
const content = stripPsqlDirectives(pgDump([
    '--data-only', '--no-comments', '--column-inserts',
    ...CONTENT_TABLES.flatMap((t) => ['--table', `public.${t}`]),
]));
fs.writeFileSync(
    path.join(outDir, 'seed-content.sql'),
    header(
        'PySim course content',
        'Lessons, slides, quizzes, the problem bank and the shop catalogue.\n-- No accounts, no submissions, no personal data of any kind.'
    ) + content,
    'utf8'
);

const kb = (p) => (fs.statSync(path.join(outDir, p)).size / 1024).toFixed(0);
console.log(`✅ schema.sql        ${kb('schema.sql')} KB`);
console.log(`✅ seed-content.sql  ${kb('seed-content.sql')} KB  (${CONTENT_TABLES.length} ตาราง)`);
