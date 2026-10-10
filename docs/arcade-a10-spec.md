# A10 — Complete Arcade reconnect state

User ticket (blocked by A01, A03, A08):
- Restore the latest successfully saved draft, or the submitted answer, for the current round.
- Restore inventory, shop, cash, effects, timer and elimination state.
- Display draft saving status and errors.
- Acceptance: refresh/disconnect before or after submission and across phases never loses saved data or extends effect lifetimes.

Use authenticated HTTP and browser seams. Preserve A09 work. No commit or live database changes. At the start of A10, A09 targeted tests passed 41/41, independent Standards/Spec reviews passed, client build passed; its final browser and full-suite checks are still pending because automatic approval review is unavailable (usage quota).
