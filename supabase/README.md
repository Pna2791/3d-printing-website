# Supabase SQL — apply order

1. `migrations/20250430120000_initial_schema.sql` — tables, RLS, grants (idempotent).
2. `migrations/20250430130000_realtime_printers.sql` — `REPLICA IDENTITY FULL` + `supabase_realtime` publication.
3. `migrations/20250430140000_orders_mvp_columns.sql` — order line fields (`material_id`, `printer_id`, `quantity`, dimensions).
4. `migrations/20250430150000_public_readonly_rls.sql` — drop order write policies; `REVOKE` DML from `anon`/`authenticated` on app tables; keep `SELECT` grants.
5. `migrations/20260430152000_update_material_pricing_vnd.sql` — apply PLA/PETG VND-per-gram pricing update.
6. `seed.sql` — catalog seed (transactional, idempotent `ON CONFLICT`).

## Option A — Supabase Dashboard (recommended for hosted)

1. Project → **SQL** → **New query**.
2. Paste and run **files (1) → (2) → (3) → (4) → (5) → (6)** in order.
3. Enable **Realtime** for `printers` in **Database → Publications** if the migration did not run (managed UI).

## Option B — `psql` with `DATABASE_URL`

Use the **direct Postgres** connection string from Supabase (**Settings → Database**). Example:

```bash
export DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres'
sh scripts/apply-supabase-sql.sh
```

Or run each file manually:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20250430120000_initial_schema.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20250430130000_realtime_printers.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20250430140000_orders_mvp_columns.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20250430150000_public_readonly_rls.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260430152000_update_material_pricing_vnd.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
```

After apply, verify from the app host:

```bash
curl -sS "http://127.0.0.1:${WEB_PORT:-3000}/api/health/supabase" | jq .
```

Expected: `{ "ok": true, "printerCount": 3 }` (or your row count).
