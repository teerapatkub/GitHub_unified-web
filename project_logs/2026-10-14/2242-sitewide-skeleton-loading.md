# Sitewide skeleton loading

Date: 2026-10-14

- Added reusable, accessible skeleton layouts for cards, lists, tables, profiles, forms, articles, quizzes, dashboards, and coding workspaces.
- Replaced initial route/auth placeholders and API data-loading placeholders across learner pages, Competitive Arena, Arcade, the shop, leaderboard, profile, and Admin pages. Kept progress indicators for save, submit, upload, and Python runtime operations.
- Arcade now distinguishes an initial room-list load from an empty list or a failed request; career stats and history also show skeletons until their requests finish.
- Client validation: `npm test` (35 passed), `npm run lint` (0 errors, 7 existing warnings), and `npm run build` passed.
- Browser validation with the existing player session: refresh showed the initial skeleton; leaderboard, learner dashboard, shop, and another player's profile loaded. At 390px, leaderboard and Arcade had no horizontal overflow. Arcade showed its new error state when the room-list API returned 401 instead of presenting a false empty list.
- Admin screens were code-reviewed and built but not opened in the browser because this session is a player account.
- Follow-up review closed three gaps: Competitive mailbox now uses a skeleton while fetching; Admin Theme hides old-tab rows/count during a tab load; and manual Arcade room refresh returns to skeleton. Added automated room-browser state coverage for loading, empty, error, ready, and refresh with prior data.
