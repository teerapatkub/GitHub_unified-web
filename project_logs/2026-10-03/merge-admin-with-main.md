# Merge admin work with origin/main

Date: 2026-10-03

- Resolved App.jsx and LearningPage.jsx conflicts between origin/main and full_project-1.
- Preserved main navigation, mode access gates, PyArena styling and profile routes.
- Preserved admin routes and surface, lesson catalog refresh, all lesson IDs, and tutorial hooks.
- Other incoming files were merged by Git; no database data or environment configuration was changed.
- Validation: frontend build passed; lesson progress tests 19/19; server syntax and diff whitespace checks passed.
- npm test unavailable (no script). Full client lint reports 48 errors and 8 warnings; not resolved as part of this merge.
- Admin lesson integration test blocked: configured database rejects SSL. Full authenticated admin/learner browser flow remains unverified.
- Browser smoke check: production preview redirects unauthenticated root to login; login renders. No narrow/authenticated flow validation in this merge.
- Preserve old local main as codex/backup-main-before-admin before renaming the integrated branch to main. No remote push.
