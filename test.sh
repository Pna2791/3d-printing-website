#!/bin/sh
# Smoke-test Docker web + health endpoints (repo root: sh test.sh  |  chmod +x ./test.sh && ./test.sh)

set -eu

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "WARN: no .env in $ROOT — NEXT_PUBLIC_* will be empty; compose will warn." >&2
  echo "      Copy .env.example to .env and set your Supabase values." >&2
fi

export WEB_PORT="${WEB_PORT:-3001}"

echo "==> docker compose build --no-cache web"
docker compose build --no-cache web

echo "==> docker compose up -d web (host port ${WEB_PORT} -> container 3000)"
docker compose up -d web

echo "==> waiting for Next.js to accept HTTP on :${WEB_PORT} ..."
ready=0
i=1
while [ "$i" -le 60 ]; do
  if curl -sf "http://127.0.0.1:${WEB_PORT}/api/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  i=$((i + 1))
  sleep 1
done

if [ "$ready" -ne 1 ]; then
  echo "ERROR: server did not become ready in 60s. Logs:" >&2
  docker compose logs web --tail 50 >&2
  exit 1
fi

echo "==> GET /api/health"
curl -sS "http://127.0.0.1:${WEB_PORT}/api/health" | jq .

echo "==> GET /api/health/supabase"
curl -sS "http://127.0.0.1:${WEB_PORT}/api/health/supabase" | jq .

echo "OK"
