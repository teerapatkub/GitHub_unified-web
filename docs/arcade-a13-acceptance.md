# Arcade A13 acceptance

This is the release gate for the server-authoritative Arcade work in A01–A12. It does not add a new game mode or future formats such as 2v2.

## Automated acceptance

Run from `server/` with a disposable PostgreSQL database or a dedicated Supabase test project/branch:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://...'
npm run test:arcade-acceptance
```

The test process never reads `.env` automatically. It creates a random schema for each test and drops it afterward, but the supplied role must still be allowed to create/drop schemas. Do not use a production database for CI. Hosted Supabase runs must keep `--test-concurrency=1` because the shared pooler has a finite connection allowance.

`test:arcade-acceptance` verifies:

- the production Auth middleware remains enabled and resolves each Arcade actor through the Supabase bearer-token path;
- all 15 catalog items are bought and applied through authenticated server commands;
- retrying the same item request replays its receipt without a second effect, shield use, or money transfer;
- 20 authenticated humans can play four five-player rooms through RESULT;
- every submitted answer is accepted only for its own room, match and round;
- completed rooms create exactly one reward receipt per human, with no cross-room history;
- retrying the worker does not duplicate wallet rewards;
- all members can remain, start a new match in the same room, and still read the completed match.

Run the complete Auth and Arcade regression set with:

```powershell
npm test
```

The suite runs test files sequentially to avoid exhausting hosted PostgreSQL connection slots. For a faster Arcade-only check use `npm run test:arcade-state`. These tests still use concurrent requests inside individual cases where concurrency is the behavior under test.

## Browser acceptance

Use the built client served by the real backend. Sign in normally; do not disable or replace the Auth middleware.

1. Open Arcade and verify saved match totals, rank, reward and per-round score breakdown.
2. Create or join a room, start a match, save a draft, refresh, submit, and refresh again.
3. Buy and use a self item and an attack item; verify the inventory/effect returns from the server after refresh.
4. Stop the backend briefly while a match or lobby is visible. The page must show the reconnect state without discarding saved data. Restart it and verify recovery.
5. Finish a match, choose to remain, start a rematch, and confirm the old result stays in history.
6. Repeat the refresh checks at 390×844. The document must not scroll horizontally and primary actions must remain readable.
7. Check the browser console after recovery. Expected request failures while the backend is stopped are acceptable; no uncaught React error may remain after recovery.

## Deployment notes

- The runtime and Docker images use Node 22. Supabase client libraries dropped Node 20 support in June 2026.
- Arcade game tables are private server-owned tables. Migrations enable RLS and revoke Data API access from `PUBLIC`, `anon`, and `authenticated`; browser code reaches them through the authenticated application API.
- The application server uses a persistent PostgreSQL pool. Configure the Supabase direct or session-pooler connection for the deployment environment and keep application pool size within the project's connection limit.
- Run `npm test`, the client production build, and the browser acceptance checklist against the release candidate before deployment.
