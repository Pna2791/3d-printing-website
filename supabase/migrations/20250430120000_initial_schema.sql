-- Initial schema (docs/database.md, docs/rules.md — RLS on all tables).
-- Target: Supabase Postgres (auth schema + anon / authenticated roles).
-- Idempotent: safe to re-run on the same database (uses IF NOT EXISTS / DROP POLICY IF EXISTS).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.printers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model text NOT NULL,
  status text NOT NULL CHECK (status IN ('ready', 'busy', 'maintenance')),
  build_volume_x numeric NOT NULL CHECK (build_volume_x > 0),
  build_volume_y numeric NOT NULL CHECK (build_volume_y > 0),
  build_volume_z numeric NOT NULL CHECK (build_volume_z > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('PLA', 'PETG', 'ABS', 'Resin')),
  color text NOT NULL,
  density numeric NOT NULL CHECK (density > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials (id) ON DELETE CASCADE,
  base_price numeric NOT NULL CHECK (base_price >= 0),
  min_volume numeric NOT NULL CHECK (min_volume >= 0),
  discount_factor numeric NOT NULL CHECK (discount_factor >= 0 AND discount_factor <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (material_id)
);

CREATE TABLE IF NOT EXISTS public.workshop_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  total_price numeric NOT NULL CHECK (total_price >= 0),
  estimated_delivery timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_material_id ON public.pricing_rules (material_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS printers_select_public ON public.printers;
CREATE POLICY printers_select_public
  ON public.printers
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS materials_select_public ON public.materials;
CREATE POLICY materials_select_public
  ON public.materials
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS pricing_rules_select_public ON public.pricing_rules;
CREATE POLICY pricing_rules_select_public
  ON public.pricing_rules
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS workshop_info_select_public ON public.workshop_info;
CREATE POLICY workshop_info_select_public
  ON public.workshop_info
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS orders_insert_own ON public.orders;
CREATE POLICY orders_insert_own
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS orders_update_own ON public.orders;
CREATE POLICY orders_update_own
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.printers TO anon, authenticated;
GRANT SELECT ON public.materials TO anon, authenticated;
GRANT SELECT ON public.pricing_rules TO anon, authenticated;
GRANT SELECT ON public.workshop_info TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
