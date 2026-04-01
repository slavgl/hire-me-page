import type { PageTheme } from "@/lib/themes";
import type { ResumeStructuredParsed } from "@/lib/resume-schema";
import type { WhyFitStructured } from "@/lib/why-fit-schema";

/** Canonical resume JSON (AI + heuristic + Zod-normalized). */
export type ResumeStructured = ResumeStructuredParsed;

export type PageRow = {
  id: string;
  user_id: string;
  slug: string;
  candidate_name: string;
  target_company: string;
  target_role: string;
  resume_text: string;
  resume_structured: ResumeStructured | null;
  resume_file_path: string | null;
  job_posting_url: string | null;
  job_description_text: string | null;
  why_fit_structured: WhyFitStructured | null;
  is_published: boolean;
  /** Throttle for “new view” notification emails */
  last_view_notification_at?: string | null;
  /** Set after migration; default `minimal` in UI when absent */
  theme?: PageTheme;
  created_at: string;
  updated_at: string;
};

export type PageViewRow = {
  id: string;
  page_id: string;
  viewed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  duration_seconds: number | null;
  is_resume_download: boolean;
  is_owner_view: boolean;
};
