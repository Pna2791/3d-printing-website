-- Private bucket for B2B RFQ attachments (PDF/STEP/ZIP/images + STL). Keeps stl-files strict for quote slice uploads.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'rfq-files',
    'rfq-files',
    false,
    52428800,
    ARRAY[
      'model/stl',
      'application/octet-stream',
      'application/sla',
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed',
      'application/step',
      'model/step',
      'model/x-step',
      'text/plain'
    ]::text[]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
