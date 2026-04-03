import { extractResumeWithAnthropic } from "@/lib/ai/extract-resume";
import { aiGenerationSchema } from "@/lib/ai-generation";
import { generateWhyFitWithAnthropic } from "@/lib/ai/generate-why-fit";
import { createClient } from "@/lib/supabase/server";
import { fetchJobPostingDescription } from "@/lib/scraping/job-posting";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: page, error: fetchError } = await supabase
    .from("pages")
    .select(
      "id, user_id, candidate_name, resume_text, job_posting_url, job_description_text, target_company, target_role",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const resumeText = (page.resume_text ?? "").trim();
  if (!resumeText) {
    return NextResponse.json(
      { error: "No resume text on this page to regenerate from." },
      { status: 400 },
    );
  }

  let jobDescriptionText = (page.job_description_text ?? "").trim();
  let jobUpdate: {
    job_posting_url: string;
    job_description_text: string;
    target_company: string;
    target_role: string;
  } | null = null;

  const postingUrl = (page.job_posting_url ?? "").trim();
  if (postingUrl) {
    const jobResult = await fetchJobPostingDescription(postingUrl);
    if (jobResult.ok) {
      jobDescriptionText = jobResult.descriptionText;
      jobUpdate = {
        job_posting_url: jobResult.url,
        job_description_text: jobResult.descriptionText,
        target_company: jobResult.companyName,
        target_role: jobResult.roleTitle,
      };
    } else if (!jobDescriptionText) {
      return NextResponse.json({ error: jobResult.error }, { status: 422 });
    }
  }

  if (!jobDescriptionText) {
    return NextResponse.json(
      {
        error:
          "No job description available. Add a job posting URL or recreate the page with a valid posting.",
      },
      { status: 400 },
    );
  }

  const candidateName = page.candidate_name ?? "";

  const [extraction, whyFit] = await Promise.all([
    extractResumeWithAnthropic(resumeText, candidateName),
    generateWhyFitWithAnthropic(resumeText, jobDescriptionText),
  ]);

  if (!extraction.ok) {
    const status =
      extraction.error.includes("ANTHROPIC_API_KEY") ||
      extraction.error.includes("not configured")
        ? 503
        : extraction.error.includes("No readable text")
          ? 400
          : 502;
    return NextResponse.json({ error: extraction.error }, { status });
  }

  if (!whyFit.ok) {
    const status =
      whyFit.error.includes("ANTHROPIC_API_KEY") ||
      whyFit.error.includes("not configured")
        ? 503
        : 502;
    return NextResponse.json({ error: whyFit.error }, { status });
  }

  const ai_generation = aiGenerationSchema.parse({
    model: extraction.model,
    calls: [
      {
        step: "resume_extract" as const,
        input_tokens: extraction.usage.input_tokens,
        output_tokens: extraction.usage.output_tokens,
      },
      {
        step: "why_fit" as const,
        input_tokens: whyFit.usage.input_tokens,
        output_tokens: whyFit.usage.output_tokens,
      },
    ],
  });

  const patch: Record<string, unknown> = {
    resume_structured: extraction.data as unknown as Record<string, unknown>,
    why_fit_structured: whyFit.data as unknown as Record<string, unknown>,
    ai_generation,
    updated_at: new Date().toISOString(),
  };
  if (jobUpdate) {
    Object.assign(patch, jobUpdate);
  }

  const { error: updateError } = await supabase
    .from("pages")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
