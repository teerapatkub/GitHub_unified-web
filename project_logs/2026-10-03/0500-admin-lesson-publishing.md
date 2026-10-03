# Admin-created content reaches learner pages

Request: publish lessons, slides, Pre-test and Post-test from the admin UI into the learner course.

Changes:
- Admin lesson editor now explains when content becomes visible and includes a curriculum list with saved slide/quiz counts and links to add each section for a selected lesson. Both Pre-test and Post-test accept choice and fill-in questions; backend validation matches.
- Extracted existing course/slides/quizzes readers to lessonContentRoutes.js and mounted them in production and the TEMP-table fixture. Added lesson detail read endpoint for title/description after direct navigation or refresh, deterministic ordering and ID validation. Existing curriculum progress criteria are unchanged.
- Learner course uses module IDs without dropping same-title modules or merging modules based on a fixed lesson count. Reloads the catalog on focus/visibility return with request cancellation.
- LessonPage reads persisted metadata, uses assetUrl for media, renders video slides with their text, and cancels obsolete lesson requests. New content loads when the lesson is opened/reloaded; it does not replace a quiz mid-attempt.
- No production data migration, seed run, replacement of existing slides/questions, quiz-attempt reset or change to grading/reward rules. New lessons are added within existing modules; level/sequence locks still apply.

Validation:
- npm run test:lesson-admin: 46 checks passed, including create -> production reader, both quiz types, choice order/answers, video metadata, invalid IDs, append-only writes, rollback, and unchanged public/TEMP-original data digests.
- npm run test:lessons: 19 checks passed.
- ESLint passed on AddLesson, LearningPage and LessonPage. Client production build passed (existing eval/large-chunk/Browserslist warnings).
- npm test attempted: no script in client manifest.
- Browser on TEMP-table fixture: created a new lesson, text slide, Pre-test with choice+fill, Post-test fill; switched to test learner, opened the course entry, answered Pre-test 2/2, viewed slide text, answered Post-test 1/1 and saw summary. Refreshed direct lesson URL: title, description and persisted results remained. Quiz-result persistence in preview is fixture-only; production grading/rewards were not invoked.
- Mobile 390x844 learner quiz checked without horizontal page overflow. Browser console had no errors. Final built page reloaded successfully. Preview stopped and tab closed; viewport reset.
- Screenshot: C:/Users/TUF GAMING/.codex/visualizations/2026/10/01/01a0f6b2-0e83-7b10-bf05-0e04fd2ca1c5/admin-published-lesson.png

Running an older backend requires a restart to load lessonContentRoutes.js; admin tokens are process-local, so sign in again after restart.
