-- Job posting URL, scraped description, and generated "Why I fit" JSON

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS job_posting_url TEXT,
  ADD COLUMN IF NOT EXISTS job_description_text TEXT,
  ADD COLUMN IF NOT EXISTS why_fit_structured JSONB;

COMMENT ON COLUMN public.pages.job_posting_url IS 'User-provided job posting page URL';
COMMENT ON COLUMN public.pages.job_description_text IS 'Scraped job body text used for AI';
COMMENT ON COLUMN public.pages.why_fit_structured IS 'Zod-validated why-fit JSON from Anthropic';
