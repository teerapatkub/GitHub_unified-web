# Arcade A01–A02 verification

The API integration tests use real PostgreSQL and the application's session middleware. They never load `server/.env` or use the live Supabase project. Provide a disposable PostgreSQL database explicitly; each test creates and drops its own randomly named schema. Docker is optional, not an application dependency.

From `server/`, in PowerShell:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://postgres@127.0.0.1:55432/postgres'
npm test
```

Use your own isolated test database connection. `npm run test:arcade-state` runs only the Arcade API tests; `npm test` also runs the existing Auth tests. Do not point either command at the application database. Legacy scripts under `scripts/arcade-tests/` that assume anonymous API access are not part of this authenticated suite.

Coverage:

- Public room state excludes code; private code/history enforce the signed-in player's permissions.
- Member-host and waiting-room checks, concurrent starts, rollback after a database fault, and finish actions that cannot reopen a live match.
- Separate match identity and history for consecutive games in the same room, including after room deletion.
- Legacy backfill preserves recorded answers, is repeatable, and keeps newest-first ordering even under a hash aggregate query plan.
- First migration refuses an active legacy match.

## Rollout

`db.js` runs the transactional match-identity migration during startup. Finish legacy matches using the previous server version before restarting, and back up the database before rollout. If migration fails, Arcade endpoints return 503 and its ticker stays disabled; investigate the startup error before retrying. No migration was applied to the live Supabase database as part of this verification.

The migration preserves the one round set that the legacy schema could store per room. It cannot reconstruct rematches that the old uniqueness constraint never recorded. Legacy match start times remain unknown (`NULL`). New matches have their own immutable identity and settings snapshot; room and participant rows remain the current gameplay state.

## Browser verification (2026-10-07)

A separate backend on port 3301 with a disposable database was exercised through create, join, start, draft, submit, settlement, and rematch. Two recorded answers from the same room remained separate. Chrome checks at 1365px and 390px verified opening each match independently, correct recorded code, refresh persistence, no page errors, and no horizontal overflow.

Remaining readiness work (after A02): submission integrity (A03), atomic settlement/payout (A04–A05), authoritative shop/items (A06–A08), and complete leave/host-transfer behavior (A11). This change does not declare Arcade deployment-ready.

## Validation results

- Server `npm test`: 20 passed (10 Arcade and 10 Auth).
- Client production build passed.
- SQL checker against the isolated full schema: 301 accepted, 11 inconclusive due to placeholder substitution, 0 rejected.
- Undefined-function and JavaScript syntax checks passed.
- Targeted frontend lint still reports the pre-existing `motion` unused-variable error in `ArcadeBattleRoyale.jsx`; the history hook and history panel have no lint errors. The client has no `npm test` script.
- Independent Standards and Spec review found a legacy ordering issue; it was fixed and the regression verified red then green. No remaining scoped review findings.
