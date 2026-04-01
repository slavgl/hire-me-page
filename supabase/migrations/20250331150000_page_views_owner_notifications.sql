-- Owner-aware view tracking + throttled view notification emails

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS is_owner_view BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS last_view_notification_at TIMESTAMPTZ NULL;
