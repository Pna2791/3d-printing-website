-- Lightweight page view analytics (privacy-oriented: IP stored as hash only).
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL CHECK (char_length(url) <= 4096),
  referrer text,
  user_agent text,
  ip_hash text NOT NULL CHECK (char_length(ip_hash) <= 128),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security: no public SELECT; anon/authenticated may INSERT only
-- ---------------------------------------------------------------------------

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- No SELECT policies for anon/authenticated → reads denied via PostgREST for those roles.

DROP POLICY IF EXISTS page_views_insert_public ON public.page_views;
CREATE POLICY page_views_insert_public
  ON public.page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Grants: insert-only for browser-facing roles; service_role uses bypass
-- ---------------------------------------------------------------------------

REVOKE ALL ON TABLE public.page_views FROM PUBLIC;
GRANT INSERT ON TABLE public.page_views TO anon, authenticated;
-- service_role bypasses RLS; explicit grant keeps tooling consistent
GRANT SELECT, INSERT ON TABLE public.page_views TO service_role;

-- ---------------------------------------------------------------------------
-- Aggregation helpers (EXECUTE restricted; call with service role from app)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.analytics_page_views_by_hour(p_since timestamptz)
RETURNS TABLE(bucket timestamptz, view_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT date_trunc('hour', created_at) AS bucket, count(*)::bigint AS view_count
  FROM public.page_views
  WHERE created_at >= p_since
  GROUP BY 1
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_page_views_by_day(p_since timestamptz)
RETURNS TABLE(bucket date, view_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT (created_at AT TIME ZONE 'UTC')::date AS bucket, count(*)::bigint AS view_count
  FROM public.page_views
  WHERE created_at >= p_since
  GROUP BY 1
  ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.analytics_top_urls(p_since timestamptz, p_limit integer DEFAULT 10)
RETURNS TABLE(url text, view_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT pv.url, count(*)::bigint AS view_count
  FROM public.page_views pv
  WHERE pv.created_at >= p_since
  GROUP BY pv.url
  ORDER BY view_count DESC, pv.url ASC
  LIMIT greatest(1, least(p_limit, 100));
$$;

REVOKE ALL ON FUNCTION public.analytics_page_views_by_hour(timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.analytics_page_views_by_day(timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.analytics_top_urls(timestamptz, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.analytics_page_views_by_hour(timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_page_views_by_day(timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.analytics_top_urls(timestamptz, integer) TO service_role;
