# Fix dashboard learning progress

Date: 2026-10-03

- server/server.js: replace undefined LESSON_PASS_PERCENT with shared POST_PASS_RATIO * 100. Live API returned HTTP 500, which Dashboard displayed as empty data.
- No database writes or schema changes.
- Verified exact corrected handler against Supabase inside BEGIN READ ONLY: HTTP 200, 6 students, 24 lessons. Startup/schema setup bypassed for diagnostic.
- Lesson progress tests: 19 passed. npm test unavailable (no script).
- User-owned server must restart. Authenticated browser validation pending restart.
