#!/bin/sh
# Apply Supabase SQL in order (requires DATABASE_URL — direct Postgres URL, not PostgREST).
# Usage: from repo root, with .env loaded or exported:
#   export DATABASE_URL='postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres'
#   sh scripts/apply-supabase-sql.sh
#
# Prefer Supabase SQL Editor for hosted projects if you cannot use direct DB URLs.

set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Add it to .env (see .env.example)." >&2
  exit 1
fi

echo "==> 1/5 migrations/20250430120000_initial_schema.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20250430120000_initial_schema.sql"

echo "==> 2/5 migrations/20250430130000_realtime_printers.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20250430130000_realtime_printers.sql"

echo "==> 3/5 migrations/20250430140000_orders_mvp_columns.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20250430140000_orders_mvp_columns.sql"

echo "==> 4/5 migrations/20250430150000_public_readonly_rls.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20250430150000_public_readonly_rls.sql"

echo "==> 5/5 seed.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/seed.sql"

echo "OK — schema, realtime, orders MVP, public read-only RLS, and seed applied."
