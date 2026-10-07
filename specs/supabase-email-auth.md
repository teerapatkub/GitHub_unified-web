# Supabase Email Authentication

Status: implementation approved and in progress, 2026-10-02. Cutover and public email delivery are not verified.

## Confirmed scope

- Supabase owns email/password signup, confirmation, sign-in, sign-out and password recovery.
- Preserve all existing player accounts, levels, XP, coins, inventory and equipped cosmetics.
- Keep the existing Google sign-in experience for this phase; do not migrate Google to Supabase OAuth.
- Accept both email and the existing username in the sign-in form.
- Prepare public email delivery with custom SMTP, rather than team-only testing.
- Existing password accounts prove ownership using their current credentials, then confirm their email once. Preserve their existing password and player data; do not create a second player account.

## Baseline system findings (before this implementation)

- FriendLogin uses the application's username/password endpoints.
- Player progress references the existing numeric users.user_id.
- Supabase JavaScript dependencies and configuration helpers already exist in the working tree.
- The browser Supabase helper currently disables session persistence, refresh and callback detection.
- Current application guards trust localStorage; they are not proof of authenticated identity.
- Existing Google verifies its ID token on the server but returns a player object rather than an application session.

## Accepted design

Keep the player ID stable and associate it with a separately verified authentication identity. Do not merge accounts solely on a client-supplied email. Preserve Google login with a server-verifiable session compatible with protected player operations. Do not trust a localStorage profile, URL profile parameter or user-editable metadata for ownership or administrator privileges.

## Confirmed setup and remaining blockers

- User approved implementation (Q8) and the recommended initial setup (Q7); no public domain is available yet. Local callback origins are localhost:5174 and 127.0.0.1:5174.
- Use the existing Gmail sender initially, subject to successful SMTP authentication. Never include credentials in tracked files or chat.
- On 2026-10-03 the replacement token successfully read and updated Auth configuration. The saved settings were read back and verified.
- Remote Site URL is now http://localhost:5174. The redirect allowlist contains /login?auth=confirm and /login?auth=recovery for both http://localhost:5174 and http://127.0.0.1:5174. Email authentication and confirmation are enabled. Custom SMTP is not yet configured.
- Gmail SMTP verification still failed on 2026-10-03 (the earlier diagnostic returned EAUTH / SMTP 535). A working SMTP credential is required before configuring delivery. No test email was sent.
- Auth regression tests: 10 passed. The server manifest has no npm test script; the suite was run with node --test tests/auth.test.js.
- Real confirmation/recovery email delivery, live account migration and browser verification remain pending. The system is not ready for public cutover.
- Do not commit or push this implementation until requested.

## Implementation plan

1. Add a unique verified Auth identity mapping while retaining numeric player IDs and all progress references.
2. Replace email signup/login/recovery with Supabase-backed flows. Username sign-in is resolved server-side without a public username-to-email lookup.
3. Migrate legacy password accounts only after verifying existing credentials. Require email confirmation and handle missing/inaccessible email through an ownership-verified correction flow. Stop and flag normalized-email collisions rather than merging accounts automatically.
4. Retain the Google button and existing server-side Google verification, with a trusted session mechanism compatible with protected APIs.
5. Make server-verified identity authoritative for player ownership and roles; remove URL/localStorage-based authentication. Preserve level 0 and the onboarding survey.
6. Retire or deliberately bridge duplicate legacy signup/login/reset routes so old endpoints cannot bypass the new verification rules or change a disconnected password store.
7. Configure local and public callbacks, custom SMTP and recovery/confirmation messages. Do not claim public email delivery works until a real test message is received.
8. Verify sessions, account migration, Google compatibility, protected operations and browser flows before cutover.

## Verification to cover

New signup and confirmation; pending/expired links and resend; existing account migration preserving player ID and data; sign-in and refresh; logout; password recovery; Google compatibility; rejecting spoofed identities; callback error handling; desktop and mobile forms.

## Official references

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/platform/migrating-to-supabase/auth0

Supabase default SMTP is restricted to project team addresses, with a low sending limit. Public email delivery requires a configured sender. Migration strategy details remain subject to verified current APIs and the user's decisions.

## Browser verification on 2026-10-03

- Removed the optional legacy email replacement panel and its client state at the user's request. Accounts without a usable stored email are directed to administrator support.
- The running backend was stale and returned HTML 404 for /api/auth/me and /api/auth/sign-up. Restarted it with the current Auth routes; the real endpoints now return JSON 401 (signed out) and 400 (invalid signup data).
- Verified the login UI in Chrome, reload, and 390px viewport. Invalid credentials display the expected error. The removed panel is absent and login/signup have no horizontal overflow.
- Simulated an HTML signup error in the browser and verified a friendly Thai message replaces the JSON parse error.
- Auth regression suite: 10 passed. Successful signup, confirmation, recovery and real Google sign-in still require end-to-end verification; SMTP remains a blocker for email delivery.
