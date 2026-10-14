# D12 audit and D13 quality gates — 2026-10-14

The ticket list supplied today defines D12 as protected routes and API error
handling. Those behaviors were implemented in commits `77c8ff3` and `897f4d7`
under the earlier roadmap's D11 label. The existing client suite passes the
guard, return-path, split-origin, empty/401/500/network, and refresh cases.
No duplicate D12 implementation was added.

This change advances D13's dependency and clean-install gates:

- Production audit reports zero vulnerabilities for client and server.
- Both lockfiles install with `npm ci`; the server image still installs only
  production dependencies. Nodemon and ESLint are development-only.
- Client source lint reports zero errors (seven existing hook warnings), tests
  pass 33/33, and the production build passes. The largest JavaScript chunk is
  347.48 KiB, below the enforced 500 KiB limit.
- Server application lint reports zero errors with a fixed ceiling of 30
  existing warnings; production-environment tests pass 13/13.
- The Docker build stage now copies the production Auth settings module needed
  by build-time environment validation.

The full release acceptance is **not complete**. The repository history scan
still reports forbidden historical backup/account data and several tracked
test/documentation placeholders. Docker Desktop's engine is unavailable in
this workspace, so image build, PostgreSQL integration, and container readiness
have not been verified locally. D13 must keep these as blocking gates, not
record them as passed. D14 still needs a disposable Auth project, test users,
production URL, verified SMTP sender, and a running container before the full
browser acceptance and deployment handoff can be signed off.
