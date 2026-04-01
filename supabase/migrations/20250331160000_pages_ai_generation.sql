-- Token usage + model metadata for Anthropic calls during page generation (not shown in product UI)
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS ai_generation JSONB;

COMMENT ON COLUMN public.pages.ai_generation IS 'Anthropic model id and per-step input/output token counts from resume_extract and why_fit';
