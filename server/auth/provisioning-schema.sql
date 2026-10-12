CREATE TABLE IF NOT EXISTS auth_provisioning_operations (
  operation_key VARCHAR(64) PRIMARY KEY,
  kind VARCHAR(24) NOT NULL CHECK (kind IN ('signup', 'legacy_link')),
  subject_hash VARCHAR(64) NOT NULL,
  auth_user_id UUID,
  status VARCHAR(24) NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'auth_created', 'committed', 'compensated', 'reconcile_required')),
  last_error VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE auth_provisioning_operations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON auth_provisioning_operations FROM PUBLIC;
