# Arcade Battle Royale — Pre-Phase 8 Hardening To-Do

Tracks progress on the audit the user requested before starting Phase 8 (see `plan.md`).
Hypothesis: Phase 0-7's ✅ checkmarks aren't fully trustworthy — possible causes are (1) leftover
hardcoded/magic-number values from initial scaffold, (2) the same logic duplicated across files
so a fix in one place doesn't fully land, (3) undetected regressions from the Phase 6
server-authoritative rewrite. Phase 8 work is blocked until this list is done and reported.

Status markers: ✅ done, 🚧 in progress, ⬜ not started. Numbering matches the user's original
5-step instruction (Step 1 grew a sub-step 1b when the user asked to fix the audit's findings
before moving on).

---

## Step 1 — Hardcode / magic-number audit ✅

Grepped `server/db.js`, `server/server.js`, `client/src/pages/ArcadeBattleRoyale.jsx`,
`client/src/bot/*.js`, `client/src/pages/widget/*.jsx` for hardcoded values that should be
dynamic or that are duplicated across files. Found 6 real duplicate-source-of-truth issues
(Group A) + 1 already-mitigated item (elimination count clamp) + a few low-risk single-location
constants (Group B, left alone). Findings reported in chat.

### Step 1b — Fix Group A hardcode duplication ✅

User asked to fix these before moving on to re-verification. Root fix: new
`shared/arcadeConfig.json`, loaded by both `server/server.js` (CommonJS `require`) and every
client/bot file (Vite ESM `import`) — one file, no more hand-syncing.

- [x] `phaseDurations` (round/summary/shop timers, 60/5/20s) — was duplicated in
      `ROUND_TIMES` (client) vs `ARCADE_PHASE_DURATIONS` (server)
- [x] `roundCaseCounts` (test-case counts used to scale bot score) — centralized
- [x] `shopItems` price/type — was duplicated in `SHOP_ITEMS` (client) vs `SHOP_CATALOG` (bot)
- [x] `maxInventory` (3) / `maxAoeHeld` (1) — was duplicated in `ArcadeBattleRoyale.jsx` vs
      `botAI.js`
- [x] cashSteal formula (300 flat) / taxCollection formula (20%) — was duplicated in **4**
      places (one more than the initial audit estimate): server `/attack` endpoint, two separate
      branches in `ArcadeBattleRoyale.jsx`, and `botManager.js`'s bot-vs-bot simulation
- [x] `maxPlayers` bounds (2-5) — was duplicated across 2 call sites inside `server.js`;
      consolidated into `clampArcadeMaxPlayers()` (also fixed a real bug found along the way:
      `parseInt(x) || 5` silently treated `max_players: 0` as falsy instead of clamping to 2)

Tested: `node --check`, `npm run build`, `eslint` (no new errors), and live against a real dev
server (curl-verified both clamp edges; confirmed Vite serves `shared/arcadeConfig.json` over
`/@fs/...` with HTTP 200).

Work log: `project_logs/2026-08-16/1652-แก้ไข-hardcode-duplication-กลุ่ม-a-shared-arcade-config.md`

**Not yet done**: haven't visually confirmed the shop UI's displayed prices in a logged-in
browser session (blocked by the known `/matchmaking` auth-redirect bug, `plan.md` Phase 7 item
5) — folded into Step 2 below.

## Step 2 — Re-verify every Phase 0-7 ✅ checklist item by actually running it 🚧 (7/9 done)

Converted each Phase 0-7 checkmark in `plan.md` into a real runnable scenario and tested it live
(not just reading the code). Method: real Postgres-backed dev server + two real non-guest test
accounts (`qatester1`, `qatester2`, created via `/api/register`+`/api/login`) driven through the
actual browser UI, cross-checked against direct API/DB reads. 7 of 9 scenarios fully confirmed
(3 confirmed bugs found and fixed in Step 3 below); the last 2 (back-button, refresh) are blocked
by this session's own accumulated resource exhaustion, not an app defect — see their entries below.

### ✅ FIXED — `CreateRoomModal` (and 4 sibling modals) never closed (Phase 1 regression)

Root cause confirmed to be `AnimatePresence` failing to unmount its exit animation (React's own
`show` state was always correct). Fix: dropped `AnimatePresence`/`exit` in favor of plain
conditional rendering (`if (!show) return null`) across all 5 modal files sharing the pattern —
`CreateRoomModal.jsx`, `RoomSettingsModal.jsx`, `PasswordPromptModal.jsx`, `GlossaryModal.jsx`,
`ExitConfirmModal.jsx`. Trades the close fade-out animation for a guaranteed-correct close.
Re-tested live: room creation → modal closes → add-bot clickable immediately, 3 separate times;
glossary modal open/close also re-verified. Work log:
`project_logs/2026-08-16/2323-แก้ไข-3-บั๊กจาก-step-2-re-verification.md`.

<details><summary>Original finding (kept for reference)</summary>

### 🔴 Confirmed blocker found — `CreateRoomModal` never closes (Phase 1 regression)

After successfully creating a room, `CreateRoomModal`'s full-screen backdrop stays mounted
forever at `opacity:0` with `pointer-events:auto`, silently intercepting every click meant for
the room lobby underneath (add bot, start match, settings, leave — all of it). Confirmed root
cause via React Fiber inspection: the `show` prop **does** correctly flip to `false` (the app's
own state logic in `handleCreateRoom` is correct), but framer-motion's `AnimatePresence` fails to
actually unmount the exiting node afterward. Reproduced identically in both the dev server and a
full production build (`vite preview`), ruling out a React StrictMode/dev-only artifact — this is
a real bug a live user would hit. Very likely introduced by today's earlier widget-extraction
work (`CreateRoomModal` was pulled into its own file this session) and never caught because
verification after that refactor was code-reading, not a full click-through. This blocks the
*primary entry point* into the whole Arcade Battle Royale feature for any freshly created room.
Root cause is on the animation-unmount layer, not app logic — flagged for Step 3, not fixed here.
Continuing Step 2 testing via a JS workaround that force-removes the stuck node in-session only
(no source change).

</details>

- [x] **2-3 player room elimination clamp — PASS.** Live 2-player room (real host + 1 bot):
      round 1 eliminated 0 (correct), round 2 eliminated exactly 1 of the 2 remaining and jumped
      straight to RESULT instead of dragging through rounds 3-4. Confirms Phase 7 #4's fix is
      real, not just present in code. Method: browser UI + forced `phase_deadline` via direct DB
      read/write for speed (matches the precedent already set in the Phase 6 work log), verified
      against `GET /rooms/:id` after each forced tick.
- [x] **Round finalize mechanics — PASS.** Score, per-round cash reward (500/400/300/200/100 by
      rank), and phase sequencing (ROUND_N → SUMMARY_N → SHOP_N → ROUND_N+1, or straight to
      RESULT once ≤1 survivor remains) all matched server logic exactly across two separate live
      rooms (room 51, room 53).
- [x] **Shop price display reflects the new shared config — PASS.** Confirms the Group A fix
      (Step 1b) actually renders correctly, not just resolves at build time.
- [x] **Stale-sweep + bot-only-room auto-cleanup — PASS (found by accident).** A test room got
      fully deleted automatically ~45-65s after its only human stopped polling (my own testing
      detour, not deliberate) — bots don't keep a room alive on their own. Matches Phase 1's
      design intent.
- [x] **Kick / add-bot while a match is `PLAYING` (mid-round) — PASS on kick, bug found + FIXED
      on add-bot.** Kicking a bot mid-`SHOP_1` and forcing the next round to finalize worked
      cleanly: no crash, remaining participants' scores/cash carried forward correctly,
      elimination math recomputed correctly for the smaller field. `transfer-host` correctly
      refuses to target a bot. **Bug (now fixed)**: `add-bot` had no `status === 'WAITING'` guard,
      unlike `join`. Live-tested: added a bot to a room already in `ROUND_2` — it joined with
      `score:0, cash:0` while everyone else had ~30,000,000 cumulative score already, guaranteeing
      it gets cut next round regardless of that round's own performance. Fixed by adding the same
      status guard `join` already had; re-tested live — a second add-bot attempt on a `PLAYING`
      room is now correctly rejected with `"ไม่สามารถเพิ่มบอทระหว่างการแข่งขันได้"`.
- [x] **5-player room, all bots, full match — PASS.** Host + 4 bots, drove all 4 rounds to
      completion via forced deadlines. Confirmed the full 5→5→3→2→1 elimination curve exactly:
      round 1 eliminated 0 (5 alive), round 2 eliminated 2 (3 alive), round 3 eliminated 1
      (2 alive), round 4 eliminated 1, landing on exactly 1 winner at `RESULT`. No crashes, no
      stuck phases across the entire match.
- [x] **2 real players in the same room, no bots — PASS (server-level, see caveat).** Both
      submitted deliberately distinct scores (12,345,678 and 87,654,321); after finalize, each
      participant's row held their **exact** submitted score — not a randomized one — and ranked/
      paid out correctly by that exact value. This is the literal Phase 6 regression class
      (server used to synthesize fake scores for real opponents). Further confirmed
      `phase_deadline` and `last_round_summary` live as single fields on the room row itself, so
      two real clients polling `GET /rooms/:id` are structurally guaranteed to see identical
      phase/timer/summary data — divergence between two real players' views is no longer
      possible by construction. **Caveat**: could not visually confirm two *simultaneous browser
      tabs* rendering in sync, since both would share one localStorage session on this single-profile
      test setup — same limitation the Phase 6 work log already flagged and deferred. The
      server-side guarantee proven here is the stronger, more fundamental check of the two.
- [x] **Eliminated player sees "spectating" screen — PASS.** Set up a 4-player room, deliberately
      submitted a losing round-2 score for the test account to force its own elimination, then
      confirmed the client rendered "🛡️ โหมดผู้สังเกตการณ์" / "คุณตกรอบไปแล้ว" (Observer Mode /
      You've been eliminated) for Round 3 instead of the live coding editor. Phase 7 #3 holds.
- [ ] **Browser back-button mid-match — inconclusive, not an app-side finding.** Two attempts (one
      from an already-long-lived tab, one from a completely fresh tab) both hit
      `net::ERR_INSUFFICIENT_RESOURCES` on every fetch immediately after navigating back, and the
      page went blank. Traced this to genuine OS-level socket exhaustion from this session's own
      cumulative testing load (`netstat` showed 9,000+ entries; the backend log separately showed
      `timeout waiting for PostgreSQL` and `Arcade match tick error` around the same time, from the
      many one-off `node -e` scripts each opening a fresh, uncooperatively-closed DB connection
      during this session's testing). Reproducing on a *fresh* tab with no prior navigation rules
      out per-tab state as the cause. This needs to be re-tested in a clean session/environment —
      not marking it pass or fail off a contaminated trial.
- [ ] **Page refresh mid-match — not run.** Blocked by the same resource exhaustion before it could
      be attempted; also expected to be a soft "drop back to lobby" today regardless (Phase 8.1's
      resume-match/localStorage persistence hasn't been built yet), so even a clean run would only
      confirm "doesn't crash," not "resumes" — worth doing in a fresh session but lower urgency.

### ✅ FIXED — shop purchases didn't persist, items were effectively free (Phase 4)

Live-tested in room 53's `SHOP_1` (deadline manually extended so there was no time pressure):
player's DB cash was 300; bought a 300-cost item through the real UI. Item appeared in inventory.
**DB cash stayed at 300** (`GET /rooms/53` confirmed, `arcade_participants.cash` never moved) —
because `buyItem()`/`sellItem()`/`rollShop()` only ever called `setPlayerState` (local React
state); there was no server endpoint for a shop purchase at all, and the 2s room-state poller
unconditionally overwrote `playerState.cash` with the DB's value on every tick. Root cause: Phase
6's "cash is DB-authoritative" migration covered combat cash transfers (cashSteal/taxCollection)
but never covered shop spending, which was never migrated off Phase 1-4's original client-only
model — the single clearest confirmation yet of the user's hypothesis #3.

**Fix**: new `POST /rooms/:id/shop-cash-delta` endpoint (server-authoritative, rejects if it would
go negative, rejects outside a `SHOP_*` phase — the latter is a bonus: purchase-phase-gating is
now server-enforced, not just UI-enforced). `buyItem`/`sellItem`/`rollShop` in
`ArcadeBattleRoyale.jsx` now all go through one shared `applyCashDelta()` helper that calls this
endpoint and only updates local inventory/state once the server confirms. `buyItem` was also
de-duplicated out of `ShopPhaseView.jsx` (it had its own competing local-only copy) into the same
place as the other two. Re-tested live: `POST shop-cash-delta` with `delta:-300` during a real
`SHOP_1` phase moved DB cash 400→100, **confirmed via a separate follow-up `GET`** (not just the
mutating call's own response) that the deduction actually persisted. Also verified the phase gate
rejects the same call outside `SHOP_*` (`WAITING` and `SUMMARY_1` both correctly rejected).

## Step 3 — Fix every bug found in Step 2 ✅ (for the 3 confirmed bugs; Step 2 itself isn't 100% exhaustive yet)

All 3 confirmed bugs fixed at root cause and re-tested live against the real dev server + Postgres
(not just read back). Work log:
`project_logs/2026-08-16/2323-แก้ไข-3-บั๊กจาก-step-2-re-verification.md`.

- [x] Create-room modal never closing → all 5 modal files fixed (see above)
- [x] Shop purchases not persisting → `shop-cash-delta` endpoint + client refactor (see above)
- [x] `add-bot` missing mid-match guard → status check added, mirrors `join`'s existing guard

`node --check`, `eslint` (no new errors beyond this session's known baseline), and `npm run build`
all pass after every fix.

## Step 4 — Update `plan.md` ✅

Every Phase 0-7 section in `plan.md` now has a "Re-verified 2026-08-16/17, tested via: ..." note
reflecting exactly what was and wasn't re-run this pass — including the 2 items (back-button,
page-refresh) honestly marked as blocked-by-environment rather than silently left as a stale ✅.
Added a new "Verification policy" section at the bottom of `plan.md` (full rule text there) plus
a pointer bullet in `CLAUDE.md`'s Workflow section: going forward, a ✅ shipped-and-verified claim
must list the actual tested scenarios, not just an assertion.

## Step 5 — Final report ✅, awaiting user go-ahead on Phase 8

### Bugs found, by phase

| Phase | Bug | Status |
|---|---|---|
| 1 | Create-room modal never closes (`AnimatePresence` stuck), blocking the entire lobby | ✅ Fixed |
| 1 | `add-bot` had no mid-match guard, unlike `join` | ✅ Fixed |
| 4 | Shop purchases never persisted — items effectively free | ✅ Fixed |
| Group A (cross-cutting) | `max_players: 0` clamped to 5 instead of 2 (`\|\| 5` falsy bug) | ✅ Fixed (found while fixing hardcode duplication, not separately hunted) |
| 7 (pre-existing, known before this audit) | Hard-reload of `/matchmaking` bounces through `/login` to `/learn` | ✅ Fixed 2026-08-17 in `App.jsx` with the user's explicit permission — the user is now seeded synchronously from localStorage in the `useState` initializer, so the first render is already authenticated and the route guard never redirects. Re-confirmed live 2026-08-19: hard-reload AND browser back mid-match both land on `/matchmaking` and resume the running round. |

**Total: 4 real bugs found and fixed this session** (3 from live Step 2 testing + 1 side-effect of
the Step 1b hardcode fix). The 1 pre-existing item was fixed later the same day — see the table
row above; this note used to say it was still open, which was stale.

### Why the one remaining item isn't fixed

The `/matchmaking` hard-reload → `/learn` redirect bug was already known and flagged *before* this
audit started (`plan.md` Phase 7 item 5). It wasn't in scope for this pass because: (1) its fix
lives in `App.jsx`, which is core routing shared by all three team members, not an arcade-only
file — `CLAUDE.md` requires explicit user confirmation before editing outside owned scope; (2) it
was already correctly identified as a blocker for Phase 8.1's resume-match feature specifically,
so it's slated to be handled *inside* that Phase 8 workstream rather than as a standalone fix now.

Separately, 2 Step 2 scenarios (browser back-button, page-refresh mid-match) couldn't be verified
either way this session — not because of an app defect, but because the test session itself
exhausted OS-level socket resources after extensive testing (confirmed via `netstat` showing
9,000+ entries and backend logs showing `timeout waiting for PostgreSQL`). These aren't "bugs
left unfixed" — they're "not yet confirmed," and should be re-run in a fresh session.

### Hardcode findings and how they were handled

Step 1's audit found 6 real duplicate-source-of-truth issues (Group A), all fixed by centralizing
into a new `shared/arcadeConfig.json` loaded by both the server (CommonJS) and every client/bot
file (Vite ESM) — `phaseDurations`, `roundCaseCounts`, `shopItems` price/type, `maxInventory`/
`maxAoeHeld`, the cashSteal/taxCollection formula (found in **4** places, not the 3 first
estimated), and `maxPlayers` bounds. A handful of lower-risk, single-location constants (Group B —
elimination-count-per-round, stale-sweep timing, poll intervals, bcrypt rounds) were deliberately
left alone as intentional or low-risk. Full detail in Step 1/1b above.

### Is Phase 0-7 a safe foundation for Phase 8?

**Yes, with two caveats to keep in mind, not blockers.** The two scenarios most central to Phase
8.1 specifically — server-authoritative sync between real players (Phase 6) and small-room
elimination correctness (Phase 7 #4) — were the *most* thoroughly re-verified of everything in
this audit, both live-tested and passing cleanly. The three bugs that were found are all fixed
and re-tested. The two open items are: (1) the already-known, already-scoped `/matchmaking`
redirect bug, which Phase 8.1 was already planning to fix as part of its own resume-match work,
not a new surprise; (2) back-button/refresh, unverified but not confirmed broken — worth a quick
clean re-check early in Phase 8 rather than a blocker to starting it.
