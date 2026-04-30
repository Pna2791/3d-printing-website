-- Supabase Realtime for public.printers (docs/architecture.md).
-- Run after initial schema. Idempotent.

-- Full row payload for UPDATE/DELETE broadcasts (recommended for realtime dashboards).
ALTER TABLE public.printers REPLICA IDENTITY FULL;

DO
$$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'printers'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.printers;
    END IF;
  END IF;
END
$$;
