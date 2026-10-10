# Arcade A01–A13 verification

The API integration tests use real PostgreSQL and the production Auth middleware. Arcade fixtures resolve users through the Supabase bearer-token branch; only the external token-verification boundary is deterministic. Tests never load `server/.env` automatically. Provide a disposable PostgreSQL database or dedicated Supabase test project/branch explicitly; each test creates and drops its own randomly named schema. Docker is optional, not an application dependency.

From `server/`, in PowerShell:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://postgres@127.0.0.1:55432/postgres'
npm test
```

Use your own isolated test database connection. `npm run test:arcade-acceptance` runs the A13 15-item/20-player release gate, `npm run test:arcade-state` runs all Arcade API tests, and `npm test` also runs the Auth tests. Hosted Supabase test runs execute files sequentially to respect connection limits. Do not point CI at the production database. Legacy scripts under `scripts/arcade-tests/` that assume anonymous API access are not part of this authenticated suite.

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

The A01–A13 implementation and automated release gate are complete. Deployment still requires a clean full regression run, production build, and the browser checklist in [`docs/arcade-a13-acceptance.md`](../../docs/arcade-a13-acceptance.md) against the release candidate.

## Validation results

- Server `npm test`: 79 passed (69 Arcade and 10 Auth).
- Client production build passed.
- SQL checker against the isolated full schema: 301 accepted, 11 inconclusive due to placeholder substitution, 0 rejected.
- Undefined-function and JavaScript syntax checks passed.
- Targeted frontend lint still reports the pre-existing `motion` unused-variable error in `ArcadeBattleRoyale.jsx`; the history hook and history panel have no lint errors. The client has no `npm test` script.
- Independent Standards and Spec review found a legacy ordering issue; it was fixed and the regression verified red then green. No remaining scoped review findings.

## A03 submission contract and verification (2026-10-07)

Both `submit-round` and `code-draft` require an integer `match_id`, `round_num` (1–4), and string `code` (at most 20,000 characters). The signed-in member is the actor; the room phase is the authoritative round. Old clients without identity receive 400 and must refresh when this server version is deployed.

Room and participant locks serialize writes. The database clock is checked after lock acquisition, and the deadline must be strictly in the future. The first answer wins; an identical retry during the same round returns the same success without changing the stored answer/time, even if the deadline has since elapsed. Different answers and requests after a phase/match change receive 409. Drafts cannot change a submitted answer. Grading waits for in-flight participant writes before taking its snapshot; A04 now commits round settlement atomically across workers.

Frontend success is shown only after API confirmation. Definitive validation rejection permits editing and resubmitting. Ambiguous failures retain the original request for retry; on acceptance the editor displays that accepted code. Old-round responses cannot mark a new round as submitted. Automatic retry stops at the deadline.

New authenticated integration coverage exercises expired/stale requests, missing identity, outsiders, eliminated players, concurrent differing answers, duplicate retries, immutable submitted code, and lock waits that cross the deadline. The stale-round regression also covers the existing production transition where `phase` advances before `current_round`.

Chrome verification used the built app and real backend on port 3301, synthetic sessions, and an isolated PostgreSQL database. An oversized answer was rejected, corrected, and accepted; submitted state survived refresh at 1365px and 390px without horizontal overflow. The actual ticker advanced SUMMARY_1 → SHOP_1 → ROUND_2 and accepted a second-round answer. A simulated HTTP 503 at the network boundary verified retrying the original payload. Monaco's CDN files were served from the installed local package in the test browser. No live database was touched, no A03 schema migration was needed, and no commit was created.

A03 review: both Standards and Spec reviewers rechecked the round-validation and corrected-answer fixes and reported no remaining scoped findings. The pre-existing component `motion` lint error remains; the changed judging hook passes lint.

## A04 atomic round settlement (2026-10-07)

The ticker delegates to `arcade/match-ticker.js` and `arcade/phase-finalizer.js`. Each finalizer locks the room, re-reads its current match/phase, checks the database clock after acquiring the lock, and locks current-match participants in ID order. History, scores, in-match cash, elimination, answer cleanup, summary, and the next phase commit on one connection in one transaction. The committed phase is the once-only marker: stale workers and repeated calls cannot apply the same round again. SUMMARY and SHOP transitions use the same identity/deadline guard.

A database or unexpected grading exception rolls the whole round back, preserving answers for a retry. History errors are no longer swallowed. A failed room remains due while other rooms in the same tick continue; query-wide failures still use the existing scheduler backoff. The production quality judge retains its established local fallback when its remote provider is unavailable.

The agreed worker test seam uses real PostgreSQL and reads observable state through authenticated APIs. Six settlement regressions cover concurrent workers/repeated calls, history write failure, grading exception, failure at the final phase write with real Python grading, stale phase/rematch snapshots, and a failing room alongside a healthy room. The duplicate-cash, swallowed-error, and batch-abort defects were reproduced before their fixes. No new schema migration is required.

Chrome verification against the isolated full backend submitted actual answers through the editor and followed SUMMARY_1 → SHOP_1 → ROUND_2 → RESULT. Both saved answers passed their real cases, both history rows remained, and cash/score stayed unchanged after subsequent ticks and reloads. Result screens were checked at 1365px and 390px without page errors or horizontal overflow. Monaco assets were served from the installed local package for this test. The script waits for editor initialization and verifies the actual submitted payload.

Round grading currently holds the room/participant locks until commit, so requests touching that room can wait for grading to finish. This avoids publishing partial results; it is not a throughput/load-test result. At the A04 checkpoint, wallet rewards and career statistics still ran after the round commit; A05 below replaces that path. No live Supabase database was changed, and no commit was made.

## A05 durable match rewards (2026-10-08)

The final round now commits the shared-wallet credit, career statistics, completed history, saved final standings, reward receipt, and RESULT transition together. `arcade_reward_receipts` has a `(match_id, user_id)` primary key and is independent of the room/participant lifetime. Account locks are acquired in user-ID order. Coins increment the current wallet balance directly; no XP or level is rewritten. The existing reward table remains 50/35/25/15/10 by rank with 10 participation coins beyond that. Bots and names without an account do not receive credits or career statistics.

A failure before commit leaves the round due and rolls back the receipt and all rewards, including when paying a later account fails. The existing ticker retries it after recovery. A lost acknowledgement after commit sees RESULT on retry and cannot pay again. Rematches have separate IDs. This intentionally means a wallet/statistics outage delays RESULT instead of showing a finished match with an uncertain payout. Grading continues to hold the existing A04 room locks; payout adds only database work, with no external requests inside the transaction.

Saved standings use descending cumulative score, then join time and participant ID for ties. Every player's result screen displays that same snapshot, so tied players no longer each see themselves first. The API stats route was moved unchanged into the shared room-read installer so the tests use the production endpoint. Achievement evaluation remains a separate, best-effort post-commit operation; achievement reward durability and wallet writers in other modes are outside A05.

Startup applies the receipt migration transactionally and enables Arcade only after the statistics table and receipt schema are ready. Receipts have RLS enabled and no grants to public/anonymous/authenticated Data API roles. Existing finished matches are not retroactively paid: the previous version has no reliable receipt proving whether a partially recorded legacy reward already reached a wallet. Reconcile such historical cases separately, without blindly replaying them. Deploy backend and frontend together after stopping old backend workers; do not run old non-atomic payout workers alongside this version. No live Supabase migration was applied during this task.

Seven A05 regressions exercise concurrent/repeated workers, stats rollback, bot-inclusive tied standings, second-account wallet failure, rematches/room deletion/repeated migration, concurrent matches sharing accounts, and interruption after commit. Tests use the agreed finalizer/ticker seam, real disposable PostgreSQL, and authenticated wallet/stats/room/history APIs. The missing wallet credit, missing atomic stats, and missing shared standings were observed red before their fixes. Full server suite: 37/37; client production build, undefined-function and syntax checks passed. The pre-existing component `motion` lint issue remains.

Both independent Standards and Spec reviews reported no actionable A05 findings. The original A05 issue could not be retrieved; the Spec review used the established A05 scope from this conversation, not an invented issue citation.

Chrome verification used the actual built app, isolated backend, real grading, and synthetic players. Two submitted rounds progressed through summary/shop to RESULT. The wallet received the 50-coin match prize once, career match/win counters incremented once, saved standings matched the displayed winner, and both history rows survived refresh at 1365px and 390px without page errors or overflow. The browser harness also reads the achievements API: these reused test accounts unlocked separate achievement bonuses, so total wallet growth is the match prize plus those independently observed bonuses. A05 was not committed; the earlier authorized Auth and A01/A02 commits are separate, with no push.

## A06 authoritative in-match shop (2026-10-08)

The authenticated `/api/arcade/rooms/:id/shop` API owns four random offers, bought-stock flags, inventory instances, prices paid, and reroll cost for each match/player. The first shop read initializes that phase once; refreshes and other tabs receive the same saved offers. Each new shop phase resets rerolls to 200 while retaining the bag. Rerolls double in price, purchases enforce the configured three-slot/one-AOE limits, and sales refund half the saved purchase price rounded down. The old arbitrary `shop-cash-delta` route now returns 410.

Commands carry match/phase identity, a request UUID and an offer/instance ID. Server-side room/participant locks serialize commands with the match clock; the deadline is checked with `clock_timestamp()` after locking. Cash, stock, inventory and the command receipt commit together. Replaying the same request in the same phase returns current saved state without repeating the mutation; reusing its UUID for a different command is rejected. Stale matches/phases, outsiders, eliminated players, unknown/foreign/sold instances, insufficient funds and over-capacity purchases cannot mutate state. Private inventory and command tables have RLS and Data API grants revoked.

The client renders saved state and marks success only after server confirmation. Scoped responses and revisions prevent old requests from overwriting later shop state. A visible retry action resolves an ambiguous purchase even after polling marks its original card sold out. No optimistic stock/inventory changes or client-chosen cash deltas remain in shop operations.

A06 also records item consumption by instance during an open, unsubmitted coding round (rounds 2–4), so a used item cannot be restored by refresh or sold in the next shop. This is a compatibility bridge: local buff/attack effects still follow the existing code after consumption is acknowledged. If the page reloads or the phase changes between consumption and local effect execution, the effect can still be lost. Atomic server-side effect application, shields and multiplier authority remain A07/A08; A06 does not claim those paths are deployment-ready.

On first rollout, finish active legacy matches and stop old backend workers before restarting with this version: their browser-only bags cannot be migrated. The shop migration refuses ongoing legacy matches, rolls back, and keeps Arcade unavailable; repeated startup after installation preserves current shop state. No live Supabase migration was applied.

Ten API regressions cover persistent offers/server prices, duplicate/concurrent commands, sales/rerolls, consumption, authorization/stale state, capacity/AOE limits, transaction rollback, post-lock expiry/rematch separation, legacy rollout protection, and insufficient funds/foreign inventory. Full server suite: 47/47. Build and undefined-function/syntax checks passed. The changed shop/combat hooks and shop view pass lint; the existing `motion` unused-variable error and lifecycle dependency warning remain. Independent Standards and Spec reviews found no actionable scoped issues; the review used the established conversation scope because the original A06 issue is unavailable.

Chrome exercised actual buy/sell/reroll buttons, a committed purchase whose response was replaced by HTTP 503, retry with the identical command UUID after polling marked its card sold out, and subsequent item consumption. Offers, stock, bag, cash and reroll cost survived refresh at 1365px and 390px; consumed inventory remained absent after reloading the coding round. The first browser pass exposed the fixed navbar intercepting the retry button; moving its banner beneath the header fixed it and the full flow passed without page errors or horizontal overflow. Verification used only synthetic accounts and disposable local PostgreSQL. A06 remains uncommitted.

## A07 self items and verified multiplier (2026-10-08)

Scope: [user-supplied A07 ticket](../../docs/arcade-a07-spec.md). `shield`, `scoreMultiplier` and `aiHelper` activation now consumes the owned instance and saves its effect in the same shop transaction. Duplicate commands replay without extending expiry; attempting to stack an active self effect retains the second inventory item. The shield retains its previous 99,999,999ms lifetime across rounds within the same match; hint/multiplier expire at their activation round's original deadline and do not carry into another round. Reads do not extend these timestamps.

Submission ignores the client multiplier flag and captures a verified multiplier from the authenticated player's saved effects under the same room lock. Settlement uses that immutable submission snapshot, so an effect expiring while grading is pending does not change accepted scoring. Repeating the same answer with a different forged flag cannot modify it. The client restores self effects on polling/refresh and renders the hint for the current localized task only when the server grants the entitlement.

Review caught a compatibility regression: the old human/bot receiver removed shields locally, allowing polling to restore them. The temporary `release-shield` command now relinquishes only the caller's exact shield activation. Its instance UUID is also the retry ID; an old release cannot remove a replacement shield. The receiver persists an outstanding release intent locally, hides that spent shield, and retries across response loss and refresh. This command cannot activate anything or remove another player's shield. **A08/A09 still own authoritative attack validation, atomic attack/shield/money resolution and bot decisions**; this compatibility path is not a claim of complete combat authority.

The self-effect migration refuses first installation during an active pre-A07 match: browser-only buffs and client-claimed submission multipliers cannot safely be recovered. Finish old matches before rollout. Repeated migration preserves current state. No live Supabase changes were made.

Ten new API regressions cover atomic use/duplicate requests, exact verified score multiplication, round separation, real expiry, unauthorized/late/after-submit use, rollback, non-stacking/rematch isolation, shield release retry versus a replacement shield, concurrent use/submission, and the migration guard. Full server suite: **57/57**. Production build, changed hooks/bot lint and undefined-function/syntax checks pass. The existing unrelated unused `motion` import in ArcadeBattleRoyale remains outside this change.

Chrome on an isolated backend with synthetic accounts exercised purchase and use of all three self items, a committed multiplier use with its response replaced by HTTP503, retry with the same request ID, desktop/mobile refresh, and a human attack followed by a lost shield-release acknowledgement and refresh. Effects and expiry stayed saved; the used shield remained absent. No page errors or horizontal document overflow at 1365px/390px. A07 remains uncommitted.

## A08 authoritative attacks (2026-10-09)

Owned item consumption, target validation, shield removal, effect expiry, transfers and the command receipt now share the room transaction. Single-target attacks reject self/absent/eliminated/already-debuffed targets; AOE selects all live rivals; tax selects the richest rival (participant ID breaks ties). Shields block one attack, including economic attacks. Cash theft is capped by available cash and tax rounds down 20%. Retries preserve the original result without consuming another item/shield or transferring again. Old `/attack` and delivery-queue `/effects` endpoints return 410.

Effects use the existing catalog durations and expire no later than their current round. The UI reads saved snapshots; refresh does not restart their timer. Remaining server lifetime is translated to browser time, conservatively subtracting request duration. Server attack effects are also mirrored into bot simulation, without reapplying damage or shields. Bot-origin purchases, shield activations and attacks remain A09; no client is permitted to impersonate a bot through the old endpoint.

First migration requires old active matches to finish. No live Supabase migration was run. Full authenticated server suite: **79/79**, including all ten visual attack types, target/actor rejection, AOE rollback, wallet rollback, post-lock deadline, same-command retries, actual expiry, rematch separation and startup guard. Production build, changed-module lint, syntax and undefined-function checks pass.

Two actual Chrome sessions verified shielded theft, a targeted attack with a lost committed response and same-ID retry, effect restoration at 1365px/390px, AOE and real expiry. The victim browser clock was deliberately 60 seconds fast; the overlay still appeared with its remaining server lifetime. No page errors or horizontal document overflow. Standards and Spec re-reviews have no unresolved findings after clock-skew and bot-effect mirroring fixes. A08 remains uncommitted.

## A09 server bots (2026-10-09)

Bot purchases, owned item use, attacks, shields, money transfers, revenge memory and progress now run under the server room transaction. The existing scheduler is the only production decision driver. Human and bot participants have explicit `participant_kind`; a human account beginning with `Bot_` is graded and rewarded normally. Browser code no longer imports the old bot simulation. Legacy bot scripts remain historical checks, not acceptance coverage of the server worker.

The first typed-participant migration refuses active matches and unowned legacy participant rows. Finish games and remove old bots/close their rooms using the previous version before rollout. Existing registered accounts are retained as humans regardless of name; the migration never guesses identity from prefixes.

Verification: 9 A09 tests passed, plus the combined A07/A08/A09 targeted run passed 41/41. Client build and independent Standards/Spec reviews passed. A09 browser verification and the final full suite were NOT completed: automatic approval review could not run because its usage quota was exhausted. No live database changes or commit.

## A10 reconnect and draft recovery (2026-10-09)

The editor waits for its own current match/phase code and the existing server inventory/effect snapshot before becoming editable. An empty saved draft is distinct from an unsaved starter. A submitted answer restores read-only. Old-scope responses cannot replace the next round's editor. Room countdowns use the server clock and remaining duration; item snapshots retain fixed server expiry.

Drafts save serially, show bilingual saving/saved/unsaved/error states and retry uncertain requests unchanged. The additive `draft_revision` column permits compare-and-swap saves: duplicate acknowledgements replay successfully, while an old request cannot replace a newer confirmed revision. New clients always send the revision; older clients remain compatible. Definite 400/403 failures discard the rejected payload so corrected text can be saved. Revision conflicts require explicitly loading the saved version; they never silently replace local edits.

Added `arcade-reconnect.test.js` to `npm test`, covering saved empty drafts, submitted answers, phase identity, late retries, and oversized-to-corrected drafts. These new tests have NOT been executed because the approval-service quota blocks isolated database/browser verification. Static lint/syntax and client build checks passed; both independent reviews have no remaining findings. A10 is implemented but not runtime-accepted yet. No commit or live migration.

Pending browser acceptance: refresh before/after submission, save failure and retry, response loss, oversized draft corrected to valid text, disconnect across phases, inventory/cash/effect expiry, and 390px mobile layout. Run against the disposable test backend after approval review becomes available; do not use application secrets or the live database.

## A11 room continuation and ownership (2026-10-10)

Leaving from the lobby, an active-match exit, the result screen and stale-member cleanup now share one transactional membership service. The authenticated session selects the actor; request-body names cannot remove or impersonate another player. When the host leaves, ownership moves to the oldest remaining human and every `is_host` flag is normalized in the same transaction. Bots are never promoted, and a room is deleted as soon as no humans remain.

`REMAIN` requires both a human room membership and a match with a persisted `ended_at`; changing the room phase alone cannot reset a live or unsettled match. Each player choosing to remain is reset idempotently even if another player already reopened the lobby. A later match receives a new match ID while the previous result and submitted code remain readable. Client navigation now waits for a successful server response, so a failed leave no longer hides a room that still exists.

Verification against isolated temporary schemas on the configured Supabase project: the combined match/membership suite passed **12/12**, including concurrent start, rematch history, actor spoofing, host transfer, final-human cleanup and transaction rollback. The two existing settlement/shop rematch regressions affected by the stronger settled-match guard passed **2/2**. Production build and changed-file lint/syntax checks passed. In the real UI as `pong`, creating and leaving a room returned to the browser and the empty room disappeared; refresh at 390px had no horizontal overflow and no console errors. No schema migration was required and no A11 commit was created.

## A12 persisted score and reward breakdown (2026-10-10)

Each saved round now records the server-verified score multiplier beside its test count, code-quality score, elapsed time and final round score. Elapsed time is calculated by PostgreSQL from the stored submission and deadline timestamps, avoiding host-timezone interpretation of zone-less database timestamps. Startup adds `score_multiplier` with a default of 1, so older history remains readable. The current-result and personal-history APIs return this persisted breakdown; completed history also joins the durable reward receipt for the recorded final rank and coin award.

The result screen uses the saved final-standing order, ranks and scores without sorting a second client-side participant snapshot. The result and past-match panels show tests, code quality, time, multiplier and round total. Past matches also show the saved match total, final rank and coins credited. Labels are available in Thai and English, and the compact metric layout stacks at narrow widths.

The focused score-breakdown test passed **1/1** and the self-item/multiplier suite passed **10/10** against isolated temporary schemas on the configured Supabase project. The reward and history regressions used in the focused A12 run also passed. Production build, changed-file lint, server syntax, undefined-call and diff checks passed. In the real UI as `pong`, four saved matches displayed server totals/ranks/rewards; an expanded match displayed both round breakdowns in Thai and English. At 390px there was no horizontal overflow, and data returned after refresh without console errors.

The repository-wide run was attempted with file concurrency disabled to respect Supabase connection limits. It progressed through the attack suite without pool exhaustion, but one existing A08 rollback test observed its five-second `timeFreeze` effect only after it had expired during multiple hosted-database HTTP round trips. The focused A12 regressions are green; this timing-sensitive A08 test still prevents claiming a clean full-suite result in this environment. A12 remains uncommitted.
