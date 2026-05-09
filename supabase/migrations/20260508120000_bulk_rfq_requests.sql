-- Bulk B2B RFQ submissions (guest). Inserts via service_role only.

CREATE TABLE IF NOT EXISTS public.bulk_rfq_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  quantity_estimate integer NOT NULL CHECK (quantity_estimate >= 1),
  technical_requirements text NOT NULL DEFAULT '',
  attachment_paths text[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_bulk_rfq_created ON public.bulk_rfq_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_rfq_qty ON public.bulk_rfq_requests (quantity_estimate);

ALTER TABLE public.bulk_rfq_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.bulk_rfq_requests FROM PUBLIC;
REVOKE ALL ON public.bulk_rfq_requests FROM anon, authenticated;

COMMENT ON TABLE public.bulk_rfq_requests IS 'B2B RFQ (>500 units); inserts via service_role /api/rfq/bulk-upload';
