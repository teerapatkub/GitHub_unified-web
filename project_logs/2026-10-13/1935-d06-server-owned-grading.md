# D06 — Keep grading answers on the server

## Completed

- Protected lesson content routes with the existing authentication middleware. Quiz questions no longer expose answer keys; quiz submissions are graded against database answers for the signed-in player. The client receives only an aggregate score and pass result.
- Removed hidden test cases and reference answers from learning exercises, Competitive challenges, Arcade tasks, and MiniGame content responses. Browser trial runs use public examples or execution feedback only.
- Moved MiniGame correctness and branch selection to the server, using the shared Python grader and the exercise's supporting files. The server ignores client-supplied completion, score, and branch claims.
- Removed per-case expected and actual values from learner-facing failure responses. Kept aggregate counts and a public Python error hint. Protected exercise and MiniGame progress reads from cross-account access.
- Added regression tests for quiz answer secrecy and server grading, and for MiniGame grading with supporting files, forbidden output, empty output, and numeric substring mismatches.

## Validation

- Client `npm test`: 17 passed.
- Client `npm run build`: passed; existing bundle-size and Browserslist warnings remain.
- Server focused D06 tests: 3 passed.
- Server `npm run check:undef`: passed.
- Server `npm test` against a disposable local PostgreSQL database: 133 passed, 1 failed. The sole failure is the existing Arcade AOE expiry-bound assertion in `tests/arcade-attacks.test.js`; it also failed when run alone before the final D06 edits.
- Browser check: signed in as the test player, opened a lesson, refreshed it, and viewed it at a narrow viewport. No live quiz was submitted.

## Remaining

- Investigate the unrelated AOE expiry-bound test before treating the entire server suite as green.
- D06 changes are local. Other pre-existing working-tree edits were kept separate.
