import { BrandLogo } from "@/components/BrandLogo";
import { DownloadResumeButton } from "@/components/DownloadResumeButton";
import { PublicPageTabs } from "@/components/PublicPageTabs";
import { TrackPageView } from "@/components/TrackPageView";
import { RESERVED_SLUGS } from "@/lib/slug";
import { parseResumeStructured } from "@/lib/resume-schema";
import { createClient } from "@/lib/supabase/server";
import type { PageRow, ResumeStructured } from "@/lib/types";
import { parseWhyFitStructured } from "@/lib/why-fit-schema";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("candidate_name, target_role, target_company")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!page) {
    return { title: "HireMe.page" };
  }

  return {
    title: `${page.candidate_name} · ${page.target_company}`,
    description: `Application for ${page.target_role} at ${page.target_company}`,
  };
}

export default async function PublicCandidatePage({ params }: Props) {
  if (RESERVED_SLUGS.has(params.slug) || params.slug.startsWith("draft-")) {
    notFound();
  }

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!page) {
    notFound();
  }

  const row = page as PageRow;
  const structured: ResumeStructured | null =
    parseResumeStructured(row.resume_structured) ??
    (row.resume_structured as ResumeStructured | null);
  const whyFit = parseWhyFitStructured(row.why_fit_structured);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <TrackPageView pageId={row.id} />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 pt-8 sm:flex-row sm:justify-end sm:px-6">
        <DownloadResumeButton pageId={row.id} slug={row.slug} />
      </div>
      <PublicPageTabs page={row} structured={structured} whyFit={whyFit} />
      <p className="mx-auto max-w-3xl px-4 pb-4 text-center text-xs text-neutral-500 sm:px-6">
        This page records anonymous view analytics.
      </p>
      <footer className="border-t border-neutral-100 py-8 text-center text-sm text-neutral-500">
        <p className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <span className="text-neutral-600">Made with</span>
          <BrandLogo href="/" height={28} />
          <span className="max-w-xs sm:max-w-none">
            — know when they see your application
          </span>
        </p>
      </footer>
    </div>
  );
}
