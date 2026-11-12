#!/usr/bin/env bash
# Downloads everything PySim needs on the KKU host (docs/deploy-kku.md), so
# that starting the site later only has to start containers:
#
#   1. Docker and Docker Compose from Ubuntu's own packages
#   2. every image the compose files use (Ollama, busybox, Tailscale, Node)
#   3. the language model(s) named in server/.env.production.local, straight
#      into the volume the running stack will use
#   4. the app image itself (npm and pip packages, front-end build)
#
# It starts nothing that serves players. Run it from the unpacked project:
#
#   cd ~/pyarena && bash deploy/kku/prepare-host.sh
#
# sudo asks for the account password once; type it yourself. Safe to run
# again: every step skips or reuses what is already there.
set -euo pipefail

cd "$(dirname "$0")/../.."
ENV_FILE=server/.env.production.local
PROJECT=pyarena

step() { printf '\n==> %s\n' "$*"; }
fail() { printf '\n!! %s\n' "$*" >&2; exit 1; }

[ -f docker-compose.yml ] || fail "Run this from the unpacked project (docker-compose.yml not found)."
[ -f "$ENV_FILE" ] || fail "$ENV_FILE is missing. Copy it from the laptop first (docs/deploy-kku.md step 1)."
chmod 600 "$ENV_FILE"

step "1/4 Docker"
if ! command -v docker >/dev/null || ! docker compose version >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose-v2
fi
sudo systemctl enable --now docker >/dev/null
id -nG "$USER" | grep -qw docker || sudo usermod -aG docker "$USER"

# This shell does not have the new docker group yet, so use sudo here.
DOCKER="sudo docker"
compose_version=$($DOCKER compose version --short | sed 's/^v//')
echo "Docker $($DOCKER version --format '{{.Server.Version}}'), Compose $compose_version"
if [ "$(printf '%s\n2.24.0\n' "$compose_version" | sort -V | head -1)" != "2.24.0" ]; then
  fail "Compose $compose_version is older than 2.24, which docker-compose.funnel.yml needs. Send this output to the team."
fi

step "2/4 Images"
for image in ollama/ollama:0.30.0 busybox:1.37.0 tailscale/tailscale:v1.104.2 node:22-bookworm-slim; do
  $DOCKER pull "$image"
done

step "3/4 Language model"
# Only the model names are read from the env file; nothing else is printed.
models=$(grep -E '^LLM_(CHAT|JUDGE|ADVICE)_MODEL=' "$ENV_FILE" | cut -d= -f2- | tr -d '"'"'"'\r' | sort -u | grep -v '^$' || true)
if [ -z "$models" ]; then
  echo "No model named in $ENV_FILE; every AI job will use its local fallback."
else
  # The same volume compose creates for project "pyarena", so the running stack
  # finds the model already there instead of downloading it on first start.
  $DOCKER volume create "${PROJECT}_ollama-models" >/dev/null
  $DOCKER rm -f pyarena-prepare-ollama >/dev/null 2>&1 || true
  $DOCKER run -d --name pyarena-prepare-ollama \
    -v "${PROJECT}_ollama-models:/root/.ollama" ollama/ollama:0.30.0 >/dev/null
  trap '$DOCKER rm -f pyarena-prepare-ollama >/dev/null 2>&1 || true' EXIT
  until $DOCKER exec pyarena-prepare-ollama ollama list >/dev/null 2>&1; do sleep 1; done
  for model in $models; do
    echo "Pulling $model"
    $DOCKER exec pyarena-prepare-ollama ollama pull "$model"
  done
  $DOCKER exec pyarena-prepare-ollama ollama list
  $DOCKER rm -f pyarena-prepare-ollama >/dev/null
  trap - EXIT
fi

step "4/4 App image (npm, pip, front-end build: 5-15 minutes)"
$DOCKER compose -p "$PROJECT" -f docker-compose.yml -f docker-compose.funnel.yml --env-file "$ENV_FILE" build

step "Done"
$DOCKER images --format '{{.Repository}}:{{.Tag}}  {{.Size}}' | grep -E 'pyarena|ollama|tailscale|busybox|node' || true
df -h / | tail -1
cat <<'NEXT'

Everything is downloaded. Log out and back in once (so docker works without
sudo), then continue with step 3 of docs/deploy-kku.md:
  docker compose -p pyarena --env-file server/.env.production.local up -d
NEXT
