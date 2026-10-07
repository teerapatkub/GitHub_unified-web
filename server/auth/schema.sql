-- Auth bindings are separate from game identity. No player IDs are rewritten.
CREATE TABLE IF NOT EXISTS player_auth_identities (
  user_id integer PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  auth_user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS player_auth_email_unique ON player_auth_identities (lower(email));
CREATE TABLE IF NOT EXISTS player_google_sessions (
  token_hash text PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS player_google_sessions_expiry ON player_google_sessions(expires_at);
ALTER TABLE player_auth_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_google_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON player_auth_identities, player_google_sessions FROM PUBLIC;
