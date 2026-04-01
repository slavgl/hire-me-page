ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'minimal';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pages_theme_check'
  ) THEN
    ALTER TABLE public.pages
      ADD CONSTRAINT pages_theme_check
      CHECK (theme IN ('minimal', 'editorial', 'bold'));
  END IF;
END $$;
