#!/usr/bin/env bash
set -euo pipefail

# This script runs only against the disposable database and Auth project in the
# release-test GitHub environment. Never point it at a production project.
: "${RUNNER_TEMP:?}"
: "${SUPABASE_URL:?}"
: "${SUPABASE_PUBLISHABLE_KEY:?}"
: "${SUPABASE_SECRET_KEY:?}"

docker exec pyarena-release-db psql -U postgres -d postgres \
  -c 'CREATE DATABASE pyarena_container_test' >/dev/null

uploads_dir="$RUNNER_TEMP/pyarena-uploads"
mkdir -p "$uploads_dir"
sudo chown 1000:1000 "$uploads_dir"

start_app() {
  docker run -d --name pyarena-release-app --network host \
    --mount "type=bind,src=$uploads_dir,dst=/data/uploads" \
    --env NODE_ENV=production \
    --env PORT=3001 \
    --env DATABASE_URL=postgresql://postgres:example-release-only@127.0.0.1:5432/pyarena_container_test \
    --env PGSSLMODE=disable \
    --env SUPABASE_URL --env SUPABASE_PUBLISHABLE_KEY --env SUPABASE_SECRET_KEY \
    --env PUBLIC_BASE_URL=https://release-test.example.com \
    --env CLIENT_URL=https://release-test.example.com \
    --env AUTH_ALLOWED_ORIGINS=https://release-test.example.com \
    --env UPLOADS_DIR=/data/uploads \
    pyarena-release-candidate >/dev/null
}

wait_ready() {
  for attempt in {1..90}; do
    if curl --silent --fail --max-time 5 \
      http://127.0.0.1:3001/api/health/ready > "$RUNNER_TEMP/release-ready.json"; then
      return 0
    fi
    if [[ "$(docker inspect -f '{{.State.Running}}' pyarena-release-app)" != true ]]; then
      echo 'Application exited before readiness' >&2
      return 1
    fi
    sleep 2
  done
  echo 'Application did not become ready' >&2
  return 1
}

assert_startup_refuses_traffic() {
  for attempt in {1..60}; do
    if [[ "$(docker inspect -f '{{.State.Running}}' pyarena-release-app)" != true ]]; then
      if curl --silent --fail --max-time 3 http://127.0.0.1:3001/login >/dev/null; then
        echo 'Application traffic remained open after startup failed' >&2
        return 1
      fi
      return 0
    fi
    sleep 2
  done
  echo 'Application remained running after startup failed' >&2
  return 1
}

trap 'docker rm -f pyarena-release-app >/dev/null 2>&1 || true' EXIT
start_app
wait_ready
curl --silent --fail http://127.0.0.1:3001/api/health/live >/dev/null
docker exec pyarena-release-app sh -c 'printf persisted > /data/uploads/release-smoke.txt'

docker rm -f pyarena-release-app >/dev/null
start_app
wait_ready
test "$(docker exec pyarena-release-app cat /data/uploads/release-smoke.txt)" = persisted

# A lost database must never leave readiness green. Liveness remains separate.
docker stop pyarena-release-db >/dev/null
if curl --silent --fail --max-time 8 http://127.0.0.1:3001/api/health/ready >/dev/null; then
  echo 'Readiness passed while PostgreSQL was stopped' >&2
  exit 1
fi
curl --silent --fail http://127.0.0.1:3001/api/health/live >/dev/null
docker restart pyarena-release-app >/dev/null
assert_startup_refuses_traffic
docker start pyarena-release-db >/dev/null
for attempt in {1..60}; do
  [[ "$(docker inspect -f '{{.State.Health.Status}}' pyarena-release-db)" == healthy ]] && break
  sleep 2
done
docker start pyarena-release-app >/dev/null
wait_ready

# An incompatible migration fingerprint must fail both current readiness and
# startup after a container restart. This database is discarded with the job.
docker exec pyarena-release-db psql -U postgres -d pyarena_container_test \
  -c "UPDATE app_schema_migrations SET checksum = 'release_test_invalid' WHERE version = (SELECT MAX(version) FROM app_schema_migrations)" >/dev/null
if curl --silent --fail --max-time 8 http://127.0.0.1:3001/api/health/ready >/dev/null; then
  echo 'Readiness passed with an invalid migration fingerprint' >&2
  exit 1
fi
docker restart pyarena-release-app >/dev/null
assert_startup_refuses_traffic
