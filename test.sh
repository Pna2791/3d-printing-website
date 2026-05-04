#!/bin/sh
# Smoke-test Docker Compose: thumb-service (STL API) + web (Next.js).
# Repo root: sh test.sh  |  chmod +x ./test.sh && ./test.sh
#
# Env:
#   WEB_PORT            host port for Next (default 3001 to avoid clashing with local :3000)
#   THUMB_SERVICE_PORT  host port for thumb API (default 8887; must match compose publish)
#   NO_CACHE=1          docker compose build --no-cache web thumb-service
#
# Requires: docker compose, curl, jq

set -eu

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "WARN: no .env in $ROOT — NEXT_PUBLIC_* will be empty; compose will warn." >&2
  echo "      Copy .env.example to .env and set your Supabase values." >&2
fi

export WEB_PORT="${WEB_PORT:-3001}"
export THUMB_SERVICE_PORT="${THUMB_SERVICE_PORT:-8887}"
export NO_CACHE="${NO_CACHE:-0}"

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required." >&2
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required." >&2
  exit 1
fi

if [ "$NO_CACHE" = "1" ]; then
  echo "==> docker compose build --no-cache web thumb-service"
  docker compose build --no-cache web thumb-service
else
  echo "==> docker compose build web thumb-service"
  docker compose build web thumb-service
fi

echo "==> docker compose up -d web (starts thumb-service first; web ${WEB_PORT}:3000, thumb ${THUMB_SERVICE_PORT}:8887)"
docker compose up -d web

echo "==> waiting for thumb-service /health on host :${THUMB_SERVICE_PORT} ..."
thumb_ready=0
i=1
while [ "$i" -le 90 ]; do
  if curl -sf "http://127.0.0.1:${THUMB_SERVICE_PORT}/health" >/dev/null 2>&1; then
    thumb_ready=1
    break
  fi
  i=$((i + 1))
  sleep 1
done

if [ "$thumb_ready" -ne 1 ]; then
  echo "ERROR: thumb-service did not become reachable in 90s. Logs:" >&2
  docker compose logs thumb-service --tail 80 >&2
  exit 1
fi

echo "==> GET thumb-service /health"
curl -sS "http://127.0.0.1:${THUMB_SERVICE_PORT}/health" | jq .

echo "==> waiting for Next.js /api/health on host :${WEB_PORT} ..."
ready=0
i=1
while [ "$i" -le 90 ]; do
  if curl -sf "http://127.0.0.1:${WEB_PORT}/api/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  i=$((i + 1))
  sleep 1
done

if [ "$ready" -ne 1 ]; then
  echo "ERROR: web did not become ready in 90s. Logs:" >&2
  docker compose logs web --tail 50 >&2
  exit 1
fi

echo "==> GET /api/health"
curl -sS "http://127.0.0.1:${WEB_PORT}/api/health" | jq .

echo "==> GET /api/health/supabase"
curl -sS "http://127.0.0.1:${WEB_PORT}/api/health/supabase" | jq .

echo "OK"
