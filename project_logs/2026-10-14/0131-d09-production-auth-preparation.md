# D09 — Production Auth URLs and SMTP preparation

Status: **partially implemented; external release gate pending**.

## Done

- Production server now accepts only exact public HTTPS origins for `PUBLIC_BASE_URL`, `CLIENT_URL`, and `AUTH_ALLOWED_ORIGINS`. Its CORS allowlist no longer adds localhost automatically. Setup and runtime share the same URL validation.
- Supabase Auth setup script has a non-mutating `--check`, SMTP connection-only `--verify-smtp`, and explicit `--apply`. It requires dedicated `AUTH_SMTP_*` values, replaces callback allowlist with exact confirmation/recovery URLs, and verifies the saved Site URL, redirects, email confirmation, and SMTP settings without printing credentials.
- Moved SMTP setup examples to the ignored management environment. Production runtime rejects `AUTH_SMTP_PASS` and `SUPABASE_ACCESS_TOKEN`. Added a deployment runbook for provider verification, external mailbox tests, callback expiry, and rate limits.
- Added regression tests for URL/SMTP validation, no implicit localhost CORS, and setup/readback matching. Read-only spec and standards review found no remaining D09 code issue after consolidating duplicate URL checks.

## Checks

- New/production environment tests: 10 passed.
- Server pretest: 13 passed. Complete server suite: 133 passed, 1 failed. The sole failure is the existing Arcade AOE expiry-bound assertion in `tests/arcade-attacks.test.js`, also recorded in the D06 log.
- Client `npm test`: 17 passed. Server `npm run check:undef` and syntax checks passed.
- Local `--check` correctly refused to continue because `PUBLIC_BASE_URL` is not set. No Management API mutation or SMTP message was sent.

## Still needed to finish D09

- User confirmed there is no public production URL and no verified SMTP provider yet. Once available, set exact URL values and setup-only SMTP credentials, run `--check`, `--verify-smtp`, then `--apply`.
- Test signup confirmation and password recovery with a mailbox outside the Supabase team. Check delivery, expiry, HTTPS production redirects, rejected unlisted URLs, and rate limits. D09 must not be marked release-ready until those results are recorded.
