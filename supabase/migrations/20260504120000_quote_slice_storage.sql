-- Buckets: STL (private) + preview PNG (public). Policies for anonymous read on previews only.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'stl-files',
    'stl-files',
    false,
    52428800,
    ARRAY['model/stl', 'application/octet-stream', 'application/sla']::text[]
  ),
  (
    'model-previews',
    'model-previews',
    true,
    15728640,
    ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for preview images (bucket is public=true; explicit SELECT for anon).
DROP POLICY IF EXISTS "model_previews_public_read" ON storage.objects;
CREATE POLICY "model_previews_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'model-previews');

ALTER TABLE public.quote_checkout_requests
  ADD COLUMN IF NOT EXISTS quote_asset_id uuid,
  ADD COLUMN IF NOT EXISTS stl_storage_path text,
  ADD COLUMN IF NOT EXISTS preview_image_url text;

COMMENT ON COLUMN public.quote_checkout_requests.quote_asset_id IS 'UUID đồng bộ với uploads/.../uuid.stl và previews/uuid.png';
COMMENT ON COLUMN public.quote_checkout_requests.stl_storage_path IS 'Đường dẫn object trong bucket stl-files (private)';
COMMENT ON COLUMN public.quote_checkout_requests.preview_image_url IS 'URL công khai ảnh preview (bucket model-previews)';
