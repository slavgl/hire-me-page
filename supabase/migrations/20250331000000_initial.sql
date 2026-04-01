-- HireMe MVP: pages + page_views + storage

CREATE TABLE public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  candidate_name TEXT NOT NULL,
  target_company TEXT NOT NULL,
  target_role TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  resume_structured JSONB,
  resume_file_path TEXT,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_user_id ON public.pages(user_id);
CREATE INDEX idx_pages_published ON public.pages(is_published);

CREATE TABLE public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  duration_seconds INTEGER,
  is_resume_download BOOLEAN DEFAULT false NOT NULL
);

CREATE INDEX idx_page_views_page_id ON public.page_views(page_id);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Pages: read published for anyone; owners read all their rows
CREATE POLICY "Anyone can read published pages"
  ON public.pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can read own pages"
  ON public.pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages"
  ON public.pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages"
  ON public.pages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages"
  ON public.pages FOR DELETE
  USING (auth.uid() = user_id);

-- page_views: owners can read views for their pages (analytics)
CREATE POLICY "Users can read views for own pages"
  ON public.page_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_views.page_id AND p.user_id = auth.uid()
    )
  );

-- Inserts only via service role (no INSERT policy for authenticated users)

-- Storage: private bucket for resume PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own resume files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can update own resume files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can delete own resume files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "Users can read own resume files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
