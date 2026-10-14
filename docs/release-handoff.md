# PyArena release acceptance and deployment handoff

This is the D13/D14 runbook. A release is **not approved** until the release
acceptance workflow and the browser matrix below pass on the same candidate
commit and the same deployment environment class. This document contains no
production credentials.

## D13: automated candidate gate

Run the `Release acceptance` GitHub Actions workflow against the exact commit
intended for deployment. Configure the `release-test` GitHub environment with
`RELEASE_TEST_SUPABASE_URL`, `RELEASE_TEST_SUPABASE_PUBLISHABLE_KEY`, and
`RELEASE_TEST_SUPABASE_SECRET_KEY` from a **disposable, non-production** Supabase
project. The workflow uses a fresh local PostgreSQL database and never points
its migrations at the hosted production database.

The workflow must pass, in order: full Git history/secret scan; deterministic
client/server install; production dependency audits; client/server lint;
client/server tests; migrations on fresh PostgreSQL; production build and bundle
budget; image filesystem and non-root checks; container liveness/readiness;
database and migration failure checks; and upload persistence across container
replacement. Its artifact records the candidate commit, local image config
digest, migration version, environment class, and passed gates. It also contains
the exact tested image archive and its SHA-256 checksum. Download the artifact,
verify the checksum, load it with `docker load`, and verify the loaded image
config digest before D14 or registry publication. Do not rebuild for D14.
Record the registry manifest digest after publishing that tested image.

Current blocker: historical Git backup/account data still fails the full-history
scan. The fixture-placeholder false positives in the tracked snapshot were
removed without weakening checks elsewhere; this is not a waiver for the real
historical findings. Follow `docs/security/repository-incident-2026-10-11.md`
before treating D13 as passed.

## D14: browser acceptance on the deployed candidate

Provide a real HTTPS deployment URL, a verified custom SMTP sender, an isolated
Auth test project, a test user and a test admin. Use accounts and mailbox
addresses in the test environment only. Record the URL, commit, registry digest,
migration version, and environment class before the first browser test. Verify
the served JavaScript corresponds to that candidate commit; repeat D13 if the
image or schema changes.

| Flow | Desktop | Narrow viewport (390 px) | Refresh/retry |
| --- | --- | --- | --- |
| Email signup, confirmation, username/email login | Pending | Pending | Pending |
| Password recovery and logout | Pending | Pending | Pending |
| Google login compatibility | Pending | Pending | Pending |
| Admin authorization and commands | Pending | Pending | Pending |
| Lessons, quiz, promotion exam, achievements | Pending | Pending | Pending |
| Leaderboard and another player's equipped profile | Pending | Pending | Pending |
| Competitive Arena and Arcade play | Pending | Pending | Pending |
| Arcade remain/leave, replacement join, rematch and network interruption | Pending | Pending | Pending |

For each flow, keep the browser result and the associated server/API result in
the release evidence. Record failures as failures; a missing test account,
domain, mailbox or external provider cannot be marked as passed.

## Deployment and rollback

Before traffic is routed, verify environment validation, exact Auth redirect
URLs, SMTP delivery to a non-team mailbox, backups, upload volume, TLS, health
checks, and monitoring. Publish the image by immutable registry digest, apply
only forward migrations, and route traffic only after `/api/health/ready`
returns 200 with the expected migration version. Keep the previous image digest
and a tested database backup available.

On failure, stop new traffic and inspect readiness and application logs. If the
new schema is backward-compatible, redeploy the previous image by its recorded
digest and keep the database at its current migration version. If the schema is
not backward-compatible, do not run an ad-hoc reverse migration: restore the
tested backup in a separate environment, validate data and Auth behavior, then
switch traffic after review. Preserve uploaded files and incident evidence.

Release record to fill only after acceptance:

- Candidate commit: **pending**
- Registry image digest: **pending**
- Migration version: **pending**
- Environment class and deployment URL: **pending**
- D13 artifact and D14 browser evidence: **pending**
- Previous image digest and tested backup reference: **pending**
