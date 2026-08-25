# Arcade Battle Royale — Development Plan

Scope owner: **Person 3** (Arcade Battle Royale, Bot AI Engine, Sabotage/Item Systems, Room Management, PostgreSQL `arcade_*` tables — see root `CLAUDE.md`).

This document tracks the feature's development end-to-end: what shipped, in what order, why, and what's planned next. Each phase below was a distinct working session. Status markers: ✅ shipped & verified, 🚧 in progress, ⬜ planned.

**Verification policy (added 2026-08-17, see bottom of file for full rule)**: a ✅ next to a phase is only trustworthy if it lists what was actually run to confirm it. Phases below have been re-audited against this standard — see each phase's "Re-verified" note. Full audit trail: `TODO.md`.

---

## ✅ Phase 0 — Prototype migration

Historical standalone prototype (`prototype/`, a separate Node app with its own server on port 3002) fully migrated into the unified app as `client/src/pages/ArcadeBattleRoyale.jsx`. The prototype folder is kept only for reference; it is not wired into the real app anymore.

**Re-verified**: not re-tested in the 2026-08-16/17 audit pass — nothing in this phase's scope (a one-time file migration, no live logic) was touched by or relevant to that pass's scenarios. Kept ✅ on the original claim; flag if the prototype folder's presence/absence ever matters again.

## ✅ Phase 1 — Core room management & DB integration

- `server/db.js`: `arcade_rooms`, `arcade_participants` tables (room code generation `ARC-XXXX`, host/password/max_players, join/leave, host transfer, kick, add-bot).
- `server/server.js`: full REST surface for room lifecycle (`create`, `join`, `GET /:id` as a ~2s heartbeat/poll, `settings`, `transfer-host`, `kick`, `add-bot`, `leave`, `start`).
- Stale-connection sweep (`sweepStaleArcadeParticipants`, every 20s): removes participants whose `last_seen` is >45s old, reassigns host, deletes bot-only/empty rooms.
- Room passwords hashed with bcrypt before storage (never plaintext), per `CLAUDE.md` security rules.

**Re-verified 2026-08-16/17**, tested via: real browser UI + direct API calls against a live Postgres-backed dev server (test accounts `qatester1`/`qatester2`, not guests). Confirmed live: room create/join/leave, add-bot (both in-lobby and — critically — attempted mid-match), kick (including mid-match), transfer-host (including its bot-target rejection), and the 45s stale-connection sweep + bot-only-room auto-cleanup (the latter caught by accident when a test room's human went stale). **2 bugs found and fixed** in this phase's surface during the pass: (1) the create-room modal never closed after a successful create, silently blocking every subsequent lobby action — root cause was `AnimatePresence` failing to unmount, not app logic; fixed by dropping it in favor of plain conditional rendering, same fix applied to all 5 modal files sharing the pattern; (2) `add-bot` had no `status === 'WAITING'` guard (unlike `join`, which already had one) — a host could pad an in-progress match with fresh 0-score bots indefinitely; fixed by adding the matching guard. Password hashing itself (bcrypt) was not re-exercised this pass (no code in that path changed) — carried forward on the original claim.

## ✅ Phase 2 — Bot AI Engine & Sabotage/Item systems

- `client/src/bot/botProfiles.js`: 4 personas (Speed Coder, Saboteur, Revenge Seeker, Balanced Pro).
- `client/src/bot/botAI.js` (`BotAIEngine`) + `client/src/bot/botManager.js`: per-bot simulated coding progress, shop purchases, item usage, attack targeting.
- 15-item shop catalog (`SHOP_ITEMS` in `ArcadeBattleRoyale.jsx`, mirrored in `client/src/bot/shopCatalog.js` for bots) — attack/buff/aoe debuffs (Ink Fog, Freeze, Mirror Code, Screen Dimmer, Screen Shake, Cash Steal, Tax Collection, Shield, etc.).
- `arcade_effects` delivery-queue table: attacker inserts a row, target's client polls `GET /rooms/:id/effects` and atomically claims it — this is what makes sabotage work between two *real* players, not just against bots.

**Re-verified 2026-08-16/17**, tested via: partial. The economic side of the shop (buy/sell/reroll cash) was live-tested and had a real, severe bug — see Phase 4's note below, since that's where the fix landed. The visual/debuff item effects themselves (Ink Fog, Freeze, Mirror Code, Screen Dimmer, Screen Shake, etc.) and the `arcade_effects` delivery-queue mechanic were **not** re-exercised end-to-end this pass (no bug reports or code changes touched that path). Bot AI targeting/purchasing logic was exercised indirectly via the 5-bot full-match baseline (Step 2) with no anomalies observed. Downgrading confidence slightly pending a dedicated debuff-effects pass; not marking ✅ as fully re-verified.

## ✅ Phase 3 — First bug-fix pass (6 issues)

Found via live 4-bot playtesting: solo-start allowed with 1 player, phantom placeholder bot names leaking into real matches, timer appearing frozen, round screen not scrollable (hid Run/Submit), starting coins not tied to per-round rank, browser back-button silently forfeiting an active match. All fixed; work log: `project_logs/2026-08-16/1116-...md`.

**Re-verified 2026-08-16/17**, tested via: partial. The "min 2 players to start" rule was re-confirmed live (server's `/start` endpoint still rejects <2 participants, exercised repeatedly across the 2026-08-16/17 pass's many test rooms). The **browser back-button item specifically could not be re-verified this pass** — two attempts hit `net::ERR_INSUFFICIENT_RESOURCES` from the test session's own accumulated OS-level socket exhaustion (confirmed via `netstat` showing 9,000+ entries), reproduced even on a brand-new browser tab, so the failure is attributable to the test environment, not necessarily the app. Needs a clean-session re-test before this specific item can be marked re-verified. The other 3 items (placeholder names, frozen timer, scrollable round screen) were not directly re-exercised this pass either — no related bug reports surfaced.

## ✅ Phase 4 — Item/Bot/Elimination overhaul (11 issues)

Root cause: `botAI.js` never followed the same buff/attack/aoe semantics the real player's own item code already used. Fixed: Shield bug (bots "attacking" with their own shield instead of defending), buff/attack/aoe separated correctly, purchases restricted to Shop phases only, `favoriteItems` weighting actually used, debuffed targets filtered from targeting (with AOE as the deliberate exception), inventory capped at 3 items / 1 AOE, bots target the current #1 by score instead of a fixed human, sell-back at 50% during shop, notification dedup/cap. Work log: `project_logs/2026-08-16/0223-...md`.

**Re-verified 2026-08-16/17**, tested via: real purchase through the live browser UI, cross-checked against the DB directly. **Found a severe regression**: "purchases restricted to Shop phases only" and the sell-back/cash mechanics had silently broken sometime after Phase 6 (see that phase's note) — `buyItem()`/`sellItem()`/`rollShop()` only ever mutated local React state; there was no server endpoint for a shop transaction at all, so the room-state poller's unconditional DB-cash sync reverted every purchase's cost within ~2 seconds while the item stayed in inventory, making every item effectively free (and sell-back/reroll costs equally meaningless). Confirmed live: bought a 300-cost item, DB cash never moved from 300. **Fixed**: new `POST /rooms/:id/shop-cash-delta` endpoint, server-authoritative, and — as a direct byproduct — the "shop phase only" rule is now enforced server-side too (previously UI-only). Re-tested live after the fix: a real purchase moved DB cash 400→100 and it **stayed there** on a follow-up check; the phase gate correctly rejects the same call during `WAITING`/`SUMMARY_*`. Inventory cap (3 items / 1 AOE) and MAX_INVENTORY/MAX_AOE_HELD were also touched during the same pass's Group A hardcode-deduplication fix (now sourced from `shared/arcadeConfig.json` instead of being hand-duplicated between the player's own code and `botAI.js`) but their *behavior* wasn't independently re-exercised this pass beyond what Group A's own testing covered.

## ✅ Phase 5 — Round restructuring (4 rounds + summary screens)

Reshaped 5→3→2→1 into 5→5→3→2→1: Round 1 no longer eliminates anyone, a Round 4 was added (task pulled live from the `arcade_tasks` DB pool, hard difficulty), and a 5-second auto-advancing `RoundSummaryView` shows rank/coins between each round and its shop. Work log: `project_logs/2026-08-16/1158-...md`.

**Re-verified 2026-08-16/17**, tested via: a full live match, host + 4 bots, driven through all 4 rounds via the real dev server (forced `phase_deadline` expiry for speed, matching this project's own established testing convention from the Phase 6 work log). Confirmed the exact 5→5→3→2→1 curve: round 1 eliminated 0 (5 alive), round 2 eliminated 2 (3 alive), round 3 eliminated 1 (2 alive), round 4 eliminated the last non-winner, landing on exactly 1 winner at `RESULT`. Also separately confirmed on 2-3-4 player rooms that the elimination-count clamp (see Phase 7 #4) correctly shrinks the cut instead of ever reaching 0 survivors. No stuck phases or crashes across any of these runs.

## ✅ Phase 6 — Server-authoritative multiplayer (the core "play with real people" rewrite)

**Problem**: phase/timer/scoring were each computed independently per browser, and — critically — `evaluateRound()` synthesized *random fake scores* for real human opponents instead of judging their actual code. Two real players in one room saw different timers and made-up scores for each other.

**Fix**: moved match authority to the server.
- `server/db.js`: new columns — `arcade_rooms.phase`, `phase_deadline`, `last_round_summary`; `arcade_participants.pending_round_score`, `has_submitted`.
- `server/server.js`: `tickArcadeMatches()` (1s loop, same pattern as the stale-sweep) is the *only* thing that ever advances a room's phase. New `POST /rooms/:id/submit-round` lets a real player report their own already-judged (Pyodide + readability) result. Bots' scores synthesized server-side too, so every viewer sees identical outcomes. `taxCollection` extended to be a real server-settled cash transfer (previously only `cashSteal` was).
- `client/src/pages/ArcadeBattleRoyale.jsx`: `handlePhaseTransition`/`evaluateRound`/`eliminateBottom` (all client-driven) removed. The room-state poller is now the single place phase changes get adopted; `submitMyRound()` replaces local ranking with a report-to-server call; auto-submit fires if the timer runs out before the player clicks submit.
- `client/src/bot/botManager.js`: role inverted — now pulls *down* authoritative `eliminated` status from the DB-backed `opponents` state into each bot instance, and only pushes *up* cosmetic fields (`progress`, `isDebuffed`). Real score/cash/elimination live in Postgres only.

Verified via direct API tests (phase timing exact to the second, rank/cash payout correct, elimination math 3→1 correct) and in-browser (real Pyodide judging, real countdown, DB-driven Round 4 task). Work log: `project_logs/2026-08-16/1322-...md`.

**Re-verified 2026-08-16/17**, tested via: this is the phase the whole 2026-08-16/17 audit was most worried about (Phase 6 was a large rewrite that pulled out a lot of client-driven logic — exactly the shape of change most likely to hide a regression), so it got the most direct test: 2 *real* player accounts (`qatester1`, `qatester2`, no bots) in the same room, each submitted a deliberately distinct, made-up round score (12,345,678 and 87,654,321). After server finalize, each participant's row held **exactly** their own submitted score — not a randomized one — and ranked/paid out by that exact value. This is the literal original bug this phase fixed (the server used to synthesize fake scores for real opponents), now double-confirmed. Also confirmed structurally that `phase_deadline` and `last_round_summary` live as single fields on the room row itself, so any two real clients polling `GET /rooms/:id` are guaranteed identical phase/timer/summary data by construction — the specific "two players saw different timers" failure mode from before this phase is no longer structurally possible. Could not visually confirm two *simultaneous* browser tabs rendering in sync (same single-profile/shared-`localStorage` limitation this project's own Phase 6 work log already flagged and deferred) — the server-side guarantee proven here is the stronger and more fundamental of the two checks. One regression traced back to this phase's migration was found and fixed: see Phase 4's note (shop cash never became DB-authoritative the way combat cash did).

##  Phase 7 — Bug hunt & hardening

Found and fixed after Phase 6 landed:
1. **Room creation broken** — root cause was infrastructure (the Vite dev server had stopped running), not app code. Restarted, verified end-to-end through the real dev-proxy path.
2. **A JSX comment (`SHOP_*/`) self-closed early**, silently breaking the entire page for anyone loading it fresh — introduced and caught in the same session, fixed.
3. **Eliminated players kept seeing the live coding view** for rounds they were no longer part of, since the old client-driven elimination→RESULT check didn't survive the move to server-driven phases. Added a proper "you're out, spectating" screen.
4. **Small rooms (2–3 players, which room creation explicitly allows) could eliminate every remaining participant in one round**, since elimination counts were hardcoded for a 5-player bracket. Clamped so a round can never cut the last survivor, and the match now jumps straight to `RESULT` once only one player remains instead of dragging through empty further rounds.
5. **Found but not yet fixed** (flagged as out-of-scope/needs confirmation, since it's core routing, not an arcade file): hard-reloading a protected deep link (e.g. typing `/matchmaking` directly) bounces through `/login` and lands on `/learn` instead of the requested page — an auth-state hydration race in `App.jsx`. This is a *blocker* for Phase 8's resume-match feature (see below), so it gets folded in there.

**Re-verified 2026-08-16/17**, tested via: real browser UI. Item 3 (spectate screen): set up a 4-player room, deliberately submitted a losing round-2 score to force a real elimination, confirmed the client rendered "🛡️ โหมดผู้สังเกตการณ์" / "คุณตกรอบไปแล้ว" (Observer Mode / You've been eliminated) for Round 3 instead of the coding editor — holds. Item 4 (small-room elimination clamp): confirmed on 2, 3, and 4-player live rooms — never eliminates the last survivor, correctly short-circuits straight to `RESULT` once ≤1 player remains instead of dragging through empty further rounds. Items 1-2 not independently re-exercised (nothing in this pass's scope touched dev-server infra or that specific JSX comment). Item 5 is still open — unchanged, still needs the `App.jsx` fix + explicit confirmation before touching (outside this scope owner's direct file ownership per `CLAUDE.md`).

---

## 🚧 Phase 8 — 60–80% scope expansion (current)

**2026-08-17 update**: before continuing this phase, the user asked for a full audit of whether Phase 0-7's ✅ marks could actually be trusted — the concern was leftover hardcoded values, the same logic silently duplicated across files, and undetected regressions from Phase 6's big rewrite. That audit ran (full trail in `TODO.md`): found and fixed 6 hardcode-duplication issues (now centralized in `shared/arcadeConfig.json`) plus 3 real, confirmed, live-tested bugs (create-room modal never closing, shop purchases not persisting cash, `add-bot` missing a mid-match guard — see the relevant phase notes above for each). 7 of 9 planned re-verification scenarios were completed live; the last 2 (browser back-button, page-refresh recovery) were blocked by this test session's own accumulated resource exhaustion, not an app defect, and should be re-run in a fresh session. Phase 8 resumes on that now-hardened foundation.

User-requested expansion, explicitly prioritizing "think of the player first." Four workstreams, all built on the Phase 6 server-authoritative foundation (DB as source of truth, REST polling — no new transport like WebSockets). Full detail in the approved plan; summarized here:

### 8.1 Reliability & Continuity — *highest priority, mostly implemented; UI pass not yet verified on a real screen*
- **Resume an active match**: persist `{room_id, room_code}` per user to `localStorage`; on mount, silently try to reconnect instead of dropping the player back to an empty lobby. ✅ **Verified 2026-08-19 — and it had never actually worked.** Testing it for the first time found two stacked bugs. (1) The effect that SAVES the room and the effect that RESTORES it both run on mount, and the saving one is declared first: it saw `currentRoom === null` on a fresh page and called `localStorage.removeItem()`, erasing the saved room a moment before the restore effect went looking for it. The feature was destroying its own input on every startup. *Proved by writing the key by hand and reloading: it came back `null`.* Fixed by only clearing once the restore attempt has had its turn. (2) With that fixed, resume reconnected but handed the player the WRONG STARTING CODE: restoring resolves the round's problem, and the DB task pool is fetched separately and had not arrived yet, so the lookup fell back to a fixed built-in task — a resumed medium match showed "Valid Parentheses" above `def fib(n):` (room `ARC-CJVQ`). Fixed by gating the restore on the pool being loaded (`tasksReady`). *Tested via: a live 5-player medium match, solved Round 1 to stay alive, closed the browser TAB entirely mid-Round-2, reopened `/matchmaking` — came back to the same room at Round 2 with the correct title AND the matching `count_unique` scaffold.*
- **Fix the `/learn` redirect-on-hard-reload bug** (`App.jsx`) — required for the above to work when a player actually closes and reopens their browser, not just refreshes within the SPA. ✅ **Fixed 2026-08-17 with the user's explicit permission** (`App.jsx` is outside Person 3's ownership; permission granted this session). Root cause: `useState(null)` left the first render unauthenticated, so the route guard redirected to `/login` before the hydration effect could restore the saved session — and the URL had already changed. Now seeded synchronously from `localStorage` in the `useState` initializer. *Tested via: loading `http://localhost:5174/matchmaking` directly in real Chrome — lands on the Arcade page instead of `/learn`, which it did on every previous attempt.*
- **Connection-instability banner**: warn the player instead of them just silently vanishing from the match. ✅ *Implemented and verified 2026-08-17, tested via: overriding `window.fetch` to reject in the live page — the banner appeared after 3 consecutive failed polls and cleared itself on the first successful poll after `fetch` was restored.*
- **Room-vanished recovery** (added 2026-08-17, not in the original plan — found by hitting it live): if the room is deleted under a connected client (host empties it, or the stale sweep removes it), the client used to sit forever on a match that could never progress. `GET /rooms/:id` returning 404 now resets state and returns the player to the lobby with an explanation. ✅ **Verified on screen 2026-08-19.** The `CLAUDE.md` obstacle turned out to be avoidable: no row needs deleting by hand, because the server already removes a room once only bots are left in it. *Tested via: joined a live match in the browser, then left through the API so the browser still believed it was playing; the room became bot-only, the sweep deleted it, and the client's next poll 404'd — it returned to the lobby with an explanation and cleared its saved room instead of sitting on a dead match.* **One bug found doing this**: the recovery reset the room but not the per-match player state, so the "🛡️ spectating" badge stayed lit in the lobby afterwards. `handleRoomVanished` now clears eliminated/score/cash/inventory too.
- **Heartbeat vs. background-tab throttling** (added 2026-08-17, not in the original plan): the stale window was a hardcoded 45s, but Chrome throttles timers in a backgrounded tab to roughly one wake per minute — so a player who merely switched tabs mid-round stopped heartbeating and got swept out of their own match. Observed live: a test match was deleted mid-round exactly this way. Now `staleParticipantSeconds: 150` in `shared/arcadeConfig.json`, plus a `visibilitychange` listener that polls immediately on return. ✅ *Re-verified 2026-08-17, tested via: `SELECT CURRENT_TIMESTAMP - (150 || ' seconds')::interval` run against the real DB before shipping the query; server restarted and the sweep run repeatedly for several minutes with zero `sweep error` entries in the log.*

**Blocking bug found and fixed while testing 8.1 (2026-08-17)** — a render loop, root cause of four separate symptoms: the timer effect listed `playerState`/`opponents` (whole objects) in its deps while itself calling `botManager.update()`, which rewrites both. Measured at **328 timeout re-arms in 2 seconds** in the live page. Consequences: the phase countdown never advanced on screen; the `timeLeft === 0` auto-submit safety net never fired (a player who didn't click submit silently scored 0); and the same object-in-deps mistake in both polling effects (`currentRoom`, plus a `t` that was re-created every render) turned them into unthrottled request loops that exhausted the browser's connection pool — **990 `Failed to fetch` console errors**, which is what made shop purchases fail. Not a refactor regression: the committed version used `playerState.name`. ✅ *Fixed and re-verified 2026-08-17, tested via: patching `window.setTimeout` in the live page to count re-arms (**328 in 2s before → 0 after**, since the tick is now a single `setInterval`); measuring request volume (**hundreds per second before → 4 requests in 6 seconds after**); and watching the Round 1 countdown actually run down on screen from ~47s to 5s, which it never did before.* Note this very likely also explains the `ERR_INSUFFICIENT_RESOURCES` seen in the previous session, which was wrongly attributed to the test harness's own footprint.

✅ **Bot balance re-checked and fixed 2026-08-18.** The follow-up turned up something bigger than a tuning question: bot behaviour was driven by *how often* `botManager.update()` happened to be called, not by the profile values. Buying and item-use were bare per-call probability rolls, and coding progress advanced one step per call, so the render-loop bug had silently rebalanced the whole game — and merely fixing the loop rebalanced it again. Now all three are gated on real elapsed time (`botBuyAttemptIntervalMs`, `botItemUseIntervalMs`, and progress advancing by however many `typingSpeedMs` intervals actually elapsed). *Tested via a deterministic simulation driving the real `BotAIEngine` with a mocked clock at different tick rates, averaged over 40 runs: before, a bot filled its bag in 15ms and emptied its whole inventory onto the player in 21ms at ~164Hz versus 2750ms/3575ms at 1Hz — a ~170× swing purely from tick rate; after, 8385ms/17473ms at 164Hz versus 9575ms/16775ms at 1Hz, i.e. within RNG noise. Also confirmed live in a 5-player match that progress bars advance naturally and no longer jump to full at the start of a round* (a real hazard introduced by the catch-up logic and fixed by re-basing `lastActionTime` in both reset paths). Scoring is unaffected either way — bot round scores come from the server's `synthesizeBotRoundScore`; what changed is how the match *feels*, and `attackChance` per profile finally means something.

### 8.2 Social / Party — ✅ **implemented and verified 2026-08-18**
- Lobby + shop-phase text chat (`arcade_chat_messages` table, `POST`/`GET /rooms/:id/chat` mirroring the existing `/effects` poll pattern). Deliberately *not* available during coding rounds (would be an answer-sharing channel) — **enforced in the endpoint, not by hiding the input**, since hiding a control is not a rule.
- Quick emoji reactions, reusing the same table/endpoints, restricted to an 8-emoji whitelist (accepting arbitrary strings would have made the emoji field a free-form text channel that bypassed both the round-phase ban and the length cap).
- ✅ *Tested via 12 API checks against the real server: message accepted in lobby, whitelisted emoji accepted, non-whitelisted emoji refused, rapid repeat rate-limited (429), non-participant refused (403), control characters stripped, over-long message truncated to 300, empty refused, `since=` returning only newer rows, and — the important one — chat refused during a coding round with the attempted message never stored. On screen: sent a Thai message and an emoji from the real input in the lobby, confirmed chat is entirely absent during a coding round, and confirmed it returns during the shop intermission with a message that persisted to the DB.*
- 🚧 *Note: the `chatLockedDuringRound` state in ChatPanel is currently unreachable through the UI, because the panel isn't rendered during rounds at all. It is kept as a defensive fallback; the rule that actually binds is the server check.*

### 8.3 Progression / Replay — ✅ **implemented and verified 2026-08-17**
- Per-round history (`arcade_round_history`: code + pass count + quality + time + score per round per player) written alongside `submit-round`, surfaced as a "review your code" panel on the RESULT screen. ✅ *Tested via: 4 full matches driven through the real server/DB to RESULT — one history row per submitted round, code preserved byte-for-byte, full score breakdown preserved, ordered by round, re-submitting neither duplicates nor overwrites a row, missing `user_name` returns 400. On screen: the RESULT panel rendered "รอบ 1 | ✅ 4/4 | 📖 90/100 | ⏱ 24s | 250 pt" from a real Fibonacci submission, and 250 matches the formula exactly (100 + 90 + 60).*
- Personal Arcade stats (`arcade_player_stats`: matches played, wins, best rank, total score, total cash earned) shown as a card in the lobby. ✅ *Tested via: `matches_played` incrementing across 4 real matches; `total_score` accumulating (203 → 406 → 1800409); **`best_rank` improving on a win (2 → 1) and then correctly NOT degrading when a later match placed 2nd**; `wins` incrementing only on an actual 1st place; bots excluded; a finished match not double-counted by later ticks. On screen: the lobby card showed all-zeros plus a "no finished matches yet" badge for a new player, then 1 match / 0 wins / 0% / #2 / 250 / 🪙 900 — matching the DB row cell for cell.*
- ✅ **Past-match review shipped 2026-08-19** (the design limit above is resolved). The cascading FK to `arcade_rooms` was dropped and the room's identity denormalized onto each history row, so a player keeps their code after leaving the match; `match_ended_at` marks a match complete so abandoned rooms don't clutter the list. Since cascade no longer bounds the table, retention is explicit: `roundHistoryKeepMatchesPerPlayer: 10`, per-player rather than a global cap so an infrequent player doesn't lose history because someone else played a lot. New `GET /players/:user_name/history` (own matches only — same answer-key reasoning as the in-match panel) and a `PastMatchesPanel` in the lobby that reuses `RoundHistoryPanel` so an old match reads like a fresh one. ✅ *Tested via: an unfinished match correctly hidden; a finished one listed with room code/name and code intact; **the room deleted for real (API returns 404, SQL confirms the row is gone) while the history endpoint still serves the match and its code**; retention seeded with 12 synthetic matches then swept, leaving exactly the newest 10 and not touching an under-limit player. On screen: the lobby panel showed a match whose room no longer exists, expanded to both rounds and the code written in them.*

### Problem bank expansion + per-match randomization — ✅ **2026-08-19**

✅ **RESOLVED 2026-08-19 — see the entry below. Original finding, kept for the numbers:** ⚠️ **the bank and the round timers were mismatched.** A full 4-round match on the new bank confirmed the pipeline works (line-up `[16,35,34,38]`, three of four rounds drawing brand-new tasks, Round 2 grading 5/5 at quality 100 on a new task, match reaching `current_round=4`/RESULT). But measuring the reference solutions' **typing burden** against the round clocks shows the pairing is too tight for the beginner audience this app targets: counting only the function body (the `def` line is given) at ~90 chars/min for a beginner, and subtracting the 8s auto-submit lead, **70% of the 40 tasks cannot even be TYPED inside Quick Mode's 22 usable seconds** (48% for an intermediate typist), and **42% cannot be typed inside Standard's 52s**. In Quick Mode a beginner can type **0 of the 10 hard tasks** and only 8 of 15 easy ones; even "Average of List" needs ~41s. These figures are typing alone — zero thinking time, and assuming the player already knows the answer. Partial credit and the quality/time components mean this isn't an automatic zero, and everyone faces the same clock so ranking stays fair, but "couldn't finish a single problem" is a poor experience. Options (a game-balance decision, deliberately left to the user): restrict Quick Mode's draw to short/easy tasks, weight the draw by solution length, lengthen rounds when a long task is drawn, or pre-fill more scaffolding so the challenge stays conceptual rather than mechanical.
- Task bank grew from 25 to **40** (easy 15 / medium 15 / hard 10), and every task now carries **4-5 test cases (189 total)** instead of the previous 1-2 — with only one case the correctness component of a round score could only ever be 0 or 100.
- The bank moved to `server/arcadeTaskSeed.js` and is now **upserted on every boot** (matched on `title_en`) rather than seeded only into an empty table, which had made it impossible to add a problem or repair a bad one without wiping the table.
- 🐛 **Data bug found and fixed**: "6. Longest Word" stored the expected answer `"jumps"`, but its own reference solution `max(words, key=len)` returns the FIRST longest word — `"quick"`. Any player who solved it correctly was marked wrong, and the reference answer failed its own test. ✅ *Guarded against recurrence by a verifier that executes every task's reference solution against every one of its test cases in real Python: 40/40 tasks, 189/189 cases pass — and the verifier was itself checked by planting two deliberate errors, both of which it caught.*
- **Every match now draws its own problems** instead of always serving the same fixed task per round. The draw happens **once, server-side, at match start** and is stored in `arcade_rooms.round_task_ids`, because the server scales bot scores by the round's test-case count while the client grades the player — if each side rolled its own, bots would be scored against a problem nobody solved (the same trap as Phase 8.4). Rounds 1-3 come from the room's difficulty (easy+medium when `default`), Round 4 from the finale pool for that difficulty (`hard` only for medium/hard rooms — see the rebalance entry below; it was unconditionally `hard` when this shipped), sampled without replacement. ✅ *Tested via: 6 matches producing 6 distinct line-ups, no repeat within a match, Round 4 always hard, a hard room drawing all four from hard. On screen: Round 1 served "Factorial" rather than the previously hardcoded Fibonacci, grading showed 0/5 and 5/5 (the expanded cases), and Round 2 drew `sum_to_n` — one of the newly added tasks — played and scored 5/5.*

✅ **Beginner rebalance shipped & verified 2026-08-19.** The mismatch above was closed by shrinking the
*work*, not by loosening the clock — Quick Mode is still 30s and Standard still 60s. Six changes, all
driven by the measurement above:

1. **`starter_code` on all 40 tasks.** The editor no longer starts at a bare `pass`: every problem now
   arrives with its variables, loop and `return` in place and only the line or two carrying the actual
   idea left as a Thai `# TODO`. `initial_code` was redefined as *the finished answer that scaffold leads
   to* rather than a terser one-liner, because otherwise the work measurement would be scoring a solution
   nobody was being steered toward.
2. **The draw now respects the clock.** Each task carries `work_chars` (characters of the answer the
   scaffold does not already show), computed by script; `drawArcadeRoundTasks()` filters on it against
   `(roundSeconds - autoSubmitLeadSeconds) × beginnerCharsPerMinute / 60`, with a shortest-first fallback
   so the draw can never return null and silently revert to the fixed built-in tasks.
3. **Round 4 climbs with the room** (`finalePoolByDifficulty`) instead of always being `hard`. An easy
   room's decider used to be a problem nobody in it could finish, which scored everyone zero and decided
   nothing.
4. **Worked input/output examples** under the problem statement (2 of 4–5 cases, rendered as Python
   literals) — beginners were being asked to infer the exact shape of a return value from prose.
5. **`timeScore` is now earned by correctness** (scaled by pass ratio), client and bot in lockstep.
   The old flat formula paid ~100 time points for submitting an untouched starter instantly versus ~17 for
   fighting to a real 3-of-5 finish: it rewarded giving up over trying, and hit beginners hardest.
6. **Bot strength follows room difficulty** (`botSkillByDifficulty`), with `medium` reproducing the old
   fixed band exactly. Picking an easy room previously gave easier problems against identical opposition.

*Tested via:* `verify_tasks.py` — 40 tasks / 378 assertions, every reference solution passing its own
cases and every scaffold proven to compile, keep its signature, **and not pass its own tests**;
`difficulty_analysis.py` — beginners now unable to type only **14/40** in Quick Mode (was 31/40) and
**2/40** in Standard (was 23/40); `draw_test.js` against the live API — 7/7 checks over 16 matches
(every drawn problem inside budget, easy rooms drawing a medium finale, hard rooms still all-hard and
non-repeating, line-ups still distinct 6-of-6); `bot_skill_test.js` — 12 live matches, easy-room bots
averaging **91.4** vs hard-room **183.9**. On screen with a real browser: a Quick+easy room showing the
scaffold and matching examples for the same problem; a **complete 4-round easy match (ARC-FAES)** whose
Round 4 drew *medium* "Flatten Nested List", all four rounds solved from the scaffold inside the timer
(5/5 each, 20–26s of 60s used, scores 212/255/257/242) and won 966 vs the bots' 571/401/266/191; and the
scoring change isolated within one match — an untouched scaffold at 21s scoring **67** against a real
answer at the same 21s scoring **215**, with a 0-of-5 submission scoring **5** where the old formula
would have handed it ~35.

**Fixed along the way (found on screen, not in the plan):** the problem panel and the editor could
disagree about which problem the round was — ARC-VB44 displayed "Sum Array" with its correct examples
while the editor held `def fib(n):`. The room poller calls `setCurrentRoom()` and then decides whether the
phase changed *in the same tick*, so `currentRoom` was still the pre-match room with no `round_task_ids`,
the pool lookup returned null, and the caller fell back to a fixed built-in task. `getPoolTask()` and
`getRound4Task()` now accept the fresh payload directly. The resume-match path had the same defect and
additionally never resolved rounds 1–3 from the pool at all.

**Still not verified, and not verifiable by script:** no real beginner has played this. The character
counts prove a solution can be *typed* in time; whether the idea is *reachable* in the seconds left over
needs a human, especially in Quick Mode. Per-task hints (and making the 600-cash `aiHelper` item show a
real hint instead of one fixed string) were explicitly agreed as a separate follow-up.

**Second blocking bug found while testing 8.3 (2026-08-17)** — the "player never pressed submit" auto-submit safety net could essentially never succeed. `submitMyRound()` runs the code through Pyodide **and** calls the AI quality judge before it POSTs — several seconds of async work — but the net fired at `remaining === 0`, so the request always arrived after the server had finalized the round and `POST /submit-round` refused it as out-of-phase. Anyone who didn't click submit silently scored 0. (This was hidden behind the render-loop bug: before that fix `timeLeft` never reached 0, so the net never fired at all — two bugs stacked.) Fixed by adding `autoSubmitLeadSeconds: 8` to `shared/arcadeConfig.json` and firing at `remaining <= lead`. ✅ *Premise verified via: submitting 8s before the deadline is accepted (200, phase still `ROUND_1`), writes its history row, and counts toward the real score (123); submitting after finalize is refused (400, phase `SUMMARY_1`) and writes nothing.* ✅ *Confirmed on a real screen 2026-08-18, tested via: an in-page 500ms recorder capturing the countdown and the judging notification through a real match where submit was never pressed — judging began at exactly countdown = 8, the POST landed before the round closed, a history row was written (0/4 tests, quality 5/100 for the untouched `pass` stub, 51s used), and the score counted for real (20, not 0).* Follow-up worth doing: warn the player on screen when the auto-submit window opens.

**Shop economy verification (2026-08-17)** — the `useShopEconomy` hook left untested by the refactor pass has now been verified server-side: ✅ *tested via a script driving real HTTP against the real server and real PostgreSQL, creating a room, adding bots, starting the match and waiting for the server tick to actually reach `SHOP_1` — 10/10 checks passed (spend rejected outside a shop phase; buy debits exactly the price and persists to the DB; sell refunds; overspend refused with cash left untouched; unknown player 404; non-numeric delta 400). Re-run and passed again after a server restart.* ✅ **Also fully verified on a real screen** (room `ARC-9CQB`, 2026-08-17) — *tested via*: affordability gating (600-cash item disabled at 500 cash); exact debits across three consecutive buys (5000→4100→3500→3000); half-price sell-back label and refund (900-cost item shows "ขาย 🪙 450", refund took 3000→3450); "ขายแล้ว" sold-out overlay on purchased cards; **the 3-slot inventory cap** (a 650-cost card, easily affordable at 3000 cash, correctly disabled once the bag held 3); freeing a slot re-enabling that same card immediately; **the 1-item AoE cap tested with the confounds removed** — holding one AoE with **2 free bag slots and 900,000 cash**, a second AoE card was disabled while non-AoE cards in the same roll stayed enabled, so the cap was provably the cause; and the reroll price doubling (200 → 400, with 200 actually debited).

### 8.4 Mode Variety — ✅ **implemented and verified 2026-08-18**
- Quick Mode toggle at room creation (30s rounds vs. the default 60s) — `arcade_rooms.round_duration_mode`, with every deadline calculation now going through `arcadePhaseDurations(room)` instead of a flat constant. ✅ *Tested via 8 API checks: settings persisted and exposed, invalid values rejected to safe defaults, omitted values defaulting correctly, ROUND_1 measuring 30s vs 60s per mode, and **two rooms in different modes running simultaneously at their own pacing** — the quick room left ROUND_1 while the standard room was still in it. On screen: created a Quick room through the real modal and saw a 30s round-1 clock.*
- Difficulty selection at room creation — Rounds 1–3 draw from the `arcade_tasks` DB pool by difficulty (mirroring Round 4), with the built-in tasks remaining the default. ✅ *Tested via a side-by-side comparison of the client's pick (`GET /api/arcade/tasks`, index `roundNum-1`) against the server's (`ORDER BY task_id ASC OFFSET roundNum-1`) for every difficulty × round — identical task_ids and case counts throughout, which is the invariant that keeps bots from being scored against a task the players never saw. On screen: a medium room served "Anagram Checker" with matching `def is_anagram(s, t):` starting code.*
- The auto-submit warning threshold now scales with round length (capped at 40% of the round), so a flat 16s warning doesn't swallow half of a 30s Quick Mode round.

✅ **Both remaining 8.4 test gaps closed 2026-08-18** — *tested via a single match that was Quick Mode AND hard difficulty at once (room `ARC-2TF2`, 5 players), played through all 10 phases to RESULT on a real screen*: the four rounds served `max_sub_array` → `length_of_longest_substring` → `simulate_lru` → `trap`, **all distinct** (Round 4 correctly offset instead of repeating Round 1), with title and starting code matching every round. Quick Mode was proven to drive **scoring**, not just display, by working the time component back out of each round score: 93/93/93/90, which matches (30−t)/30 exactly and does not match the 60s formula in any round. History showed 1/1, 2/2, 1/1, 1/1 test cases — the DB pool's real counts, not the built-in 4/3/2 — and all four solutions passed 100%, which could not happen if the signature or test cases disagreed with the displayed task. Elimination ran 5→5→3→2→1 and `arcade_player_stats` updated to 7 matches / 1 win / best_rank improving to #1.

**Two bugs found while testing 8.4:** (1) in a `hard` room the finale repeated Round 1's problem, since Rounds 1–3 took `hard[0..2]` while Round 4 also used `hard[0]` — Round 4 now offsets to `hard[3]` (verified all four rounds distinct). (2) The room-state poller resolved each round's task through a **closure captured at mount**, when `dbTasks` was empty and `currentRoom` null — so a difficulty room showed the pool task's title while handing the player the *old* task's starting code (seen live: "Anagram Checker" with `def fib(n):`). Fixed with a `taskResolverRef`, the same pattern used for the tick loop. This also silently repaired a long-standing bug: **Round 4 had always used `ROUND_4_FALLBACK_TASK` rather than the DB's hard task**, which went unnoticed only because the fallback was written to be byte-identical to it. The `react-hooks/exhaustive-deps` warning that had been dismissed as baseline was pointing at exactly this.
- **Explicitly deferred**: 2v2 team mode — would require reworking scoring/elimination from per-player to per-team, too large a change to fold into this pass safely. Proposed as its own future phase once 8.1–8.4 are stable.

### Suggested order
1. 8.1 in full (including the `App.jsx` confirmation) — unblocks real player continuity, the most "player-first" win.
2. 8.3.1 (round history) — reuses the exact patterns just built for 8.1.
3. 8.2 (chat/reactions).
4. 8.4 + 8.3.2 in parallel — minimal overlap with everything else.

---

## Out of scope (noted, not planned)

- Team modes (2v2+) — see 8.4 deferral above.
- WebSocket/real-time transport — deliberately staying on REST polling to match the existing architecture; revisit only if polling latency becomes a real player complaint.
- Anything under Person 1 (`LearningPage`, `ExercisePage`, promotion exams, Pyodide worker) or Person 2 (Admin panel, Competitive Arena, global leaderboard, theming) per `CLAUDE.md` team boundaries.

---

## ✅ Phase 9 — Ship-readiness pass (2026-08-19)

Closing the gap between "works in our hands" and "safe to hand to real players". No new features.

**Score integrity.** `POST /submit-round` took the client's word for a round score and clamped it at
999,999,999 — one hand-edited request won every match and wrote a permanent `arcade_player_stats`
row to match. The ceiling is now `maxSubmittableRoundScore: 10000` in `shared/arcadeConfig.json`
(the real formula maximum is 600; the headroom is deliberate). The display fields were stored raw
too, so history could read "7/5 tests passed" — `pass_count`, `total_count`, `quality_score` and
`time_used_seconds` are now each bounded to what the game can actually produce. ✅ *Tested via
`npm run test:score`, which submits `round_score: 999999999, pass_count: 7, total_count: 5,
quality_score: 5000, time_used_seconds: 99999` at a live server and reads the result back through
the public API: stored as 10000, 5/5, quality 100, time 60. Also confirms a repeat submission does
not stack and a non-participant gets 404.* **Known and accepted**: this bounds absurd values, it does
not stop a determined cheater posting 10000. Narrowing it is a one-value change.

**A real test suite, in the repo.** Every check written during Phases 8-9 lived in a scratch
directory and would have been lost. They are now `server/scripts/arcade-tests/` behind
`npm run test:arcade`: the 458-assertion problem-bank verifier (which has already caught two bugs
that reached players — the "Longest Word" test case that marked correct answers wrong, and six hints
that quoted the answer line), the score-bounds attack, the draw/budget checks, the bot-difficulty
comparison, and the UI clipping detector. ✅ *Tested via: running the suite end-to-end (exit 0), and
by sabotage — a copy of the bank with four deliberate faults planted (a broken expected output, a
scaffold containing the full answer, a blank hint, an answer line pasted into a hint) was caught on
all four with exit code 1.*

**The six untested-on-screen items are now tested.** Resume-after-browser-close and room-vanished
recovery are written up above (both were broken; both are fixed). The rest: hard-reload and the
browser back button mid-match both return to the running round rather than `/learn`; the English
hint path shows the right per-problem hint through the real shop item (room `ARC-LSGC`, Round 4
"Valid Parentheses"); `medium` and `default` rooms were confirmed on screen with title, worked
examples and scaffold all naming the same problem; and the draw/budget checks were re-run after the
score changes. The UI clipping detector reports zero at 1280x720 and 375x812.

**Still open, stated plainly**: the intermittent tick failures seen on 2026-08-18 (~43% of ticks
while postgres was healthy) did not recur once across this entire session, and their cause is still
unknown — the logging now names the error code, so the next occurrence will be diagnosable. And no
real beginner has played the mode yet; that is the last gate before calling it done, and it is the
one thing no script can stand in for.

---

## Verification policy (added 2026-08-17)

Added after a full audit found that several previously ✅-marked phases had real, live, user-facing
bugs that pure code review had never caught — most notably a modal that silently blocked the
entire room-creation flow, and a shop economy where every item was effectively free because a
purchase's cash cost never reached the database. Both existed in already-"verified" code.

**Going forward, a phase (or any individual claim) may only be marked ✅ shipped & verified if the
entry lists the actual scenarios that were run to confirm it** — not just an assertion that it
works. "Tested via: read the code and it looks right" does not qualify; "Tested via: created a
2-player room through the real UI, forced round 2 to finalize, confirmed elimination count and
DB state" does. If a scenario genuinely wasn't re-tested, say so explicitly (as several of the
notes above do) rather than leaving a stale ✅ standing unqualified. This mirrors the standard
`CLAUDE.md` already sets for Bot AI/sabotage/real-time changes ("ทดสอบผ่าน dev server จริงก่อนถือว่าเสร็จ")
— extended here to apply to *marking something done*, not just to making the change.
