# A09 — Server-owned Arcade bots

User ticket (blocked by A08):
- Move bot purchases, item use and attacks to the server.
- Preserve existing personalities and difficulty; clients cannot impersonate bots.
- Identify participant kind explicitly, never from a `Bot_` name prefix.
- Acceptance: bots actually attack, all participants see the same results, and human accounts are never classified as bots.

Verification uses the approved authenticated HTTP API and server scheduler seams with disposable PostgreSQL, plus real browser sessions. Do not commit this work or modify the live database. A10–A13 remain separate work.
