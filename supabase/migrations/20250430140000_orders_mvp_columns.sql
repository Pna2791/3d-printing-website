-- MVP order fields: material, printer, quantity, optional dimensions (nullable FKs keep old rows valid).
-- Apply after initial schema. Idempotent ADD COLUMN IF NOT EXISTS.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS material_id uuid REFERENCES public.materials (id) ON DELETE SET NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS printer_id uuid REFERENCES public.printers (id) ON DELETE SET NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS dim_x numeric;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS dim_y numeric;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS dim_z numeric;

CREATE INDEX IF NOT EXISTS idx_orders_material_id ON public.orders (material_id);
CREATE INDEX IF NOT EXISTS idx_orders_printer_id ON public.orders (printer_id);
