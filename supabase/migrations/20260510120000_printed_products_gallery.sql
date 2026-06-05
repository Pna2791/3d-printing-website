-- Landing page "Printed Models" gallery: metadata in DB, files in Storage bucket `gallery` (public).

CREATE TABLE IF NOT EXISTS public.printed_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  category text NOT NULL DEFAULT '',
  storage_path text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_printed_products_created_at ON public.printed_products (created_at DESC);

COMMENT ON TABLE public.printed_products IS 'Homepage printed models gallery; images in Storage bucket gallery/';
COMMENT ON COLUMN public.printed_products.storage_path IS 'Object path in bucket gallery (for delete)';

ALTER TABLE public.printed_products ENABLE ROW LEVEL SECURITY;

-- Public read for landing page (anon + authenticated)
DROP POLICY IF EXISTS printed_products_select_public ON public.printed_products;
CREATE POLICY printed_products_select_public
  ON public.printed_products
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE ALL ON public.printed_products FROM PUBLIC;
GRANT SELECT ON public.printed_products TO anon, authenticated;

-- Inserts/updates/deletes: no policy for anon/auth → denied; service_role bypasses RLS for admin API

-- Optional: after creating the public bucket `gallery` in Dashboard, allow anonymous read of objects.
DROP POLICY IF EXISTS gallery_public_read ON storage.objects;
CREATE POLICY gallery_public_read
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'gallery');
