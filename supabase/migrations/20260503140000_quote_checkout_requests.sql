-- Đơn đặt từ trang báo giá STL (khách không đăng nhập). Chỉ ghi qua service_role API.

CREATE TABLE IF NOT EXISTS public.quote_checkout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_note text NOT NULL DEFAULT '',
  slicer_task_id text NOT NULL,
  filename text NOT NULL,
  material text NOT NULL,
  is_student boolean NOT NULL DEFAULT false,
  student_id_verification_pending boolean NOT NULL DEFAULT false,
  quantity integer NOT NULL CHECK (quantity >= 1 AND quantity <= 9999),
  model_scale numeric NOT NULL,
  dim_x_mm numeric NOT NULL,
  dim_y_mm numeric NOT NULL,
  dim_z_mm numeric NOT NULL,
  filament_used_mm numeric NOT NULL CHECK (filament_used_mm >= 0),
  estimated_print_time text NOT NULL DEFAULT '',
  total_vnd integer NOT NULL CHECK (total_vnd >= 0),
  line_subtotal_vnd integer NOT NULL,
  floor_applied boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_quote_checkout_created_at ON public.quote_checkout_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_checkout_phone ON public.quote_checkout_requests (customer_phone);

ALTER TABLE public.quote_checkout_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.quote_checkout_requests FROM PUBLIC;
REVOKE ALL ON public.quote_checkout_requests FROM anon, authenticated;

COMMENT ON TABLE public.quote_checkout_requests IS 'STL quote checkout (guest); insert only via service_role /api/orders/checkout-quote';
COMMENT ON COLUMN public.quote_checkout_requests.student_id_verification_pending IS 'true when is_student — staff should verify student ID before discount';
