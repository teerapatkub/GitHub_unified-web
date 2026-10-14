# D13 release gate and D14 handoff progress — 2026-10-14

The user clarified the numbered ticket list today. D12 is route guard and API
errors; it was implemented earlier in commits `77c8ff3` and `897f4d7` under
the older roadmap's D11 label. This work starts D13 and prepares D14.

## Completed in this increment

- Added a manual `Release acceptance` workflow that checks one candidate commit
  with full history scanning, deterministic installs, production audits, lint,
  client/server tests, fresh PostgreSQL migrations, production image build and
  filesystem inspection, plus container readiness and upload persistence.
- Added a disposable-container smoke script for database outage and migration
  mismatch behavior, including refusal of application traffic after failed
  startup. The workflow preserves the exact tested image archive with SHA-256,
  and evidence records the commit, image config digest, archive checksum,
  migration version, and environment class.
- Scoped fixture-placeholder exceptions in the secret scanner to exact known
  values and files. Scanner unit tests pass 14/14 and the tracked snapshot scan
  passes; arbitrary credentials in those files remain detectable.
- Wrote `docs/release-handoff.md` with the D14 browser matrix, evidence fields,
  deployment prerequisites, and rollback procedure.

## Validation and remaining blockers

- Full-history scan still finds **35 real historical issues**, including SQL
  backups, account rows/password hashes, and old environment files. No release
  gate can pass until the history response in
  `docs/security/repository-incident-2026-10-11.md` is completed.
- The release workflow and container smoke script were syntax-checked, but not
  executed end to end: the Docker Desktop engine is unavailable here. The
  `release-test` GitHub environment also needs a disposable Supabase Auth
  project and its three test keys before the workflow can run beyond the source
  gate. No production database was used.
- D14 browser acceptance remains pending. There is no production HTTPS URL or
  verified custom SMTP sender, so signup confirmation, recovery, Google,
  admin, lessons, profile, leaderboard, and Arcade rematch cannot be signed off
  on a deployed candidate. The handoff intentionally records these as pending.

Next: complete the D01 Git history response and password-reset/rotation work,
configure the disposable release-test environment, run the workflow on a clean
checkout, fix any resulting integration failures, then run the D14 browser
matrix against the immutable deployed candidate and fill its registry digest.
