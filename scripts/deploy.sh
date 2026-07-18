#!/usr/bin/env bash
# Production deploy script — runs ON THE PRODUCTION SERVER (invoked over SSH by CI).
#
# Usage (from the deploy directory, which must contain .env and docker-compose.prod.yml):
#   WEB_IMAGE_REPO=ghcr.io/<owner>/3d-printing-website-web \
#   THUMB_IMAGE_REPO=ghcr.io/<owner>/3d-printing-website-thumb \
#   IMAGE_TAG=sha-abc1234 \
#   bash deploy.sh
#
# Guarantees:
#   - Zero build: only `docker compose pull` + `up -d` (never `build`).
#   - Never touches .env (fails fast if it is missing).
#   - Never removes volumes (no `down -v`, no `down` at all on the happy path).
#   - Health-checks the stack after deploy; on failure, rolls back to the tag
#     recorded from the last successful deploy (.last_successful_tag).

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
STATE_FILE=".last_successful_tag"
HEALTH_WAIT_TIMEOUT="${HEALTH_WAIT_TIMEOUT:-240}"

: "${WEB_IMAGE_REPO:?WEB_IMAGE_REPO is required (e.g. ghcr.io/owner/3d-printing-website-web)}"
: "${THUMB_IMAGE_REPO:?THUMB_IMAGE_REPO is required (e.g. ghcr.io/owner/3d-printing-website-thumb)}"
: "${IMAGE_TAG:?IMAGE_TAG is required (e.g. sha-abc1234)}"

log() { printf '\n==> %s\n' "$*"; }

[ -f "$COMPOSE_FILE" ] || { echo "ERROR: $COMPOSE_FILE not found in $(pwd)" >&2; exit 1; }
if [ ! -f .env ]; then
  echo "ERROR: .env not found in $(pwd)." >&2
  echo "Create it manually on the server (it is never created or overwritten by CI)." >&2
  exit 1
fi

compose() {
  WEB_IMAGE="${WEB_IMAGE_REPO}:${1}" \
  THUMB_IMAGE="${THUMB_IMAGE_REPO}:${1}" \
  docker compose -f "$COMPOSE_FILE" "${@:2}"
}

# External HTTP probe of the web app through its published port (in addition to
# the container-level healthchecks that `up --wait` already enforces).
health_check() {
  local web_port
  web_port="$(grep -E '^WEB_PORT=' .env | tail -n1 | cut -d= -f2- || true)"
  web_port="${web_port:-3000}"
  local url="http://127.0.0.1:${web_port}/api/health"
  log "Probing ${url}"
  local deadline=$((SECONDS + 60))
  until curl -fsS --max-time 5 "$url" >/dev/null 2>&1; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      echo "ERROR: web app did not answer on ${url}" >&2
      return 1
    fi
    sleep 3
  done
  echo "OK: ${url} is healthy"
}

deploy_tag() {
  local tag="$1"
  log "Pulling images for tag ${tag} (zero build on production)"
  compose "$tag" pull
  log "Starting stack with tag ${tag}"
  # --wait blocks until every started container reports healthy (or fails).
  compose "$tag" up -d --remove-orphans --wait --wait-timeout "$HEALTH_WAIT_TIMEOUT"
  health_check
}

PREVIOUS_TAG=""
[ -f "$STATE_FILE" ] && PREVIOUS_TAG="$(cat "$STATE_FILE")"

log "Deploying ${IMAGE_TAG} (previous successful tag: ${PREVIOUS_TAG:-<none>})"

if deploy_tag "$IMAGE_TAG"; then
  printf '%s\n' "$IMAGE_TAG" > "$STATE_FILE"
  log "Deploy of ${IMAGE_TAG} succeeded"
  # Remove only dangling image layers; keeps the previous tagged images for rollback.
  docker image prune -f >/dev/null || true
  exit 0
fi

log "Deploy of ${IMAGE_TAG} FAILED — collecting logs"
compose "$IMAGE_TAG" ps || true
compose "$IMAGE_TAG" logs --tail=100 || true

if [ -z "$PREVIOUS_TAG" ] || [ "$PREVIOUS_TAG" = "$IMAGE_TAG" ]; then
  echo "ERROR: no previous successful tag recorded — cannot roll back automatically." >&2
  exit 1
fi

log "Rolling back to ${PREVIOUS_TAG}"
if deploy_tag "$PREVIOUS_TAG"; then
  log "Rollback to ${PREVIOUS_TAG} succeeded — but the deploy of ${IMAGE_TAG} failed."
  exit 1
fi

echo "ERROR: rollback to ${PREVIOUS_TAG} ALSO failed — manual intervention required." >&2
exit 1
