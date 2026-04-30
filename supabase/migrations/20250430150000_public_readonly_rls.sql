-- Public read-only mode: remove row-changing access for anon/authenticated on app tables.
-- SELECT policies for catalog remain; orders INSERT/UPDATE policies removed; REVOKE writes.
-- Apply after prior migrations. Idempotent.

-- Orders: remove write policies (no INSERT/UPDATE without a policy under RLS)
DROP POLICY IF EXISTS orders_insert_own ON public.orders;
DROP POLICY IF EXISTS orders_update_own ON public.orders;

-- Defensive: revoke any table-level DML from browser-facing roles
REVOKE INSERT, UPDATE, DELETE ON public.printers FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.materials FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.pricing_rules FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.workshop_info FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon, authenticated;

-- Keep read path explicit (idempotent)
GRANT SELECT ON public.printers TO anon, authenticated;
GRANT SELECT ON public.materials TO anon, authenticated;
GRANT SELECT ON public.pricing_rules TO anon, authenticated;
GRANT SELECT ON public.workshop_info TO anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
