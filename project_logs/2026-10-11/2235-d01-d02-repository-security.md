# Implement D01 and D02 repository security gates

Date: 2026-10-11

- Removed four tracked SQL backups and archived migration dumps that contained account data.
- Documented the affected path categories, credential rotation and password-reset response, history-rewrite procedure, and collaborator recovery steps without copying secret values or account rows.
- Added recursive Git and Docker exclusions for environment files, database backups, compressed dumps, and local generated output.
- Added a repository scanner for tracked files and all reachable Git history. It rejects backup paths, account-data SQL, password hashes, credential assignments, private keys, database URLs with passwords, known provider-token formats, and oversized text blobs without printing matched values.
- Added a production-image scanner that checks image environment values and application-owned files. Required large game assets are allowed only at exact paths with matching SHA-256 hashes.
- Added GitHub Actions gates that run all security-rule tests, scan full Git history, build the production image, and inspect the built image.
- Commit `d0059f7` contains the focused D01/D02 implementation. Existing uncommitted application work was preserved outside this commit.
- Prepared a locally rewritten mirror at `.security-work/pyarena-d01-sanitized-d0059f7.git`; rewritten `main` is `c8754296e1ae799116d4b0773313a30b18f76ae3`.
- Validation from a fresh rewritten checkout: 10/10 security tests passed, the tracked/full-history scanner passed, every listed exposed path was absent, and `git fsck --full --no-reflogs --unreachable` reported no unreachable objects.
- Client tests and production build passed earlier in this implementation cycle. Server integration tests remain blocked locally because `TEST_DATABASE_URL` is not configured for a disposable PostgreSQL database.
- Docker Desktop is not running on this workstation, so the real image build and filesystem inspection could not run locally. The new GitHub Actions job enforces both checks on a Docker-enabled runner.
- Publishing the rewritten branches is pending explicit approval because it force-replaces public commit IDs and requires every collaborator to clone/reset before resuming work.
- Credential rotation, affected-user password resets, audit-log review, upstream/fork cleanup, and cached-view cleanup remain operational incident-response actions outside the repository commit.
