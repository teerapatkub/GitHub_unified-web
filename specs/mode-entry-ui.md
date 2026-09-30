# PyArena navigation and mode identity

## Agreed scope

All student pages share the PyArena navbar: learning, lessons, coding workspaces,
Competitive Arena, Arcade, shop, profile, leaderboard and achievements. Login and
administration retain their dedicated navigation. Page content, gameplay rules and
each mode's distinctive palette remain unchanged by the navigation revision.

## Navigation

- Brand: **PyArena + mode or page name**.
- Common controls: profile menu, coins, language, cosmetic shop and leaderboard.
- Profile menu retains profile access, achievements and logout.
- Competitive adds its mailbox; Arcade adds its item glossary.
- Learning shortcuts contain learning, debugging and challenges; shop lives only
  in the main navbar.
- The old hub page is removed. `/menu` redirects old bookmarks to `/learn`.
- The fixed navbar measures its height so mobile wrapping does not cover content.
- Existing profile pictures, frames and shop-theme navbar hooks remain supported.

## Mode access and match safety

Competitive and Arcade tabs use the existing mode-access rule. Below level 10,
users see disabled tabs, lock icons and the required/current levels. Direct route
access remains guarded. Account updates refresh navbar coins and level status.

Arcade intercepts all navbar destinations and logout during an active match.
Cancel keeps the player in the match. Confirm leaves the room and opens the selected
destination. Leaving from the waiting lobby also removes the room membership and
saved room reference before navigation.

## Visual identity

Shared brand mark, typography, buttons, focus treatment, spacing and card radii
connect the modes. Learning keeps Python blue/yellow, Competitive blue/indigo,
and Arcade rose/orange. Their illustrations and content layouts stay distinctive.

## Verification — 2026-09-30

- Production client build.
- Isolated Chrome with fixture APIs: learning, Competitive, Arcade, shop,
  leaderboard, achievements and profile at 1440, 768, 390 and 320 px, including
  refresh, one navbar per page, visible controls and no horizontal overflow.
- Fixed positioning on scroll, language switch, profile menu, shop/leaderboard
  links, logout, `/menu` redirect and immediate coin updates.
- Level 3 lock indicators and direct-route guards; level 10 mode access.
- Active Arcade match: cancel stays, confirm leaves once, opens requested profile,
  and clears the saved active-room reference.
- No JavaScript page errors in the fixture run. Live gameplay/backend behavior
  beyond these navigation checks is not covered by this UI verification.
- Client has no `npm test` script; repository lint has pre-existing failures.

## Mode-switch motion

Committed navigation between Learning, Competitive and Arcade moves the active
underline from the previous tab in 360 ms, settles the mode icon in 300 ms and
fades the destination content in 320 ms. Mode colors stay distinct. Navigation
is immediate, with no overlay or delay. Navbar positioning and match-exit
confirmation remain unchanged. Initial loads and refreshes do not replay this
transition. Rapid navigation cancels the previous animation; reduced-motion
preferences disable it, including when that preference changes mid-transition.

Verified in isolated Chrome at 1440 and 390 px: all three modes, reverse direction,
rapid switching, fixed navbar, refresh, reduced motion and no page errors.
