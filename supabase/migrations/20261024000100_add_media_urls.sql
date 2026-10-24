BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'leaders'
  ) THEN
    ALTER TABLE public.leaders
      ADD COLUMN IF NOT EXISTS photo_url TEXT;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'announcements'
  ) THEN
    ALTER TABLE public.announcements
      ADD COLUMN IF NOT EXISTS flyer_url TEXT;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages
      ADD COLUMN IF NOT EXISTS youtube_url TEXT;
  END IF;
END $$;

COMMIT;
