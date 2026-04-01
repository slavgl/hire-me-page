import { extractResumeWithAnthropic } from "@/lib/ai/extract-resume";
import { aiGenerationSchema } from "@/lib/ai-generation";
import { generateWhyFitWithAnthropic } from "@/lib/ai/generate-why-fit";
import { createClient } from "@/lib/supabase/server";
import { parseResumePdf } from "@/lib/parse-resume";
import { fetchJobPostingDescription } from "@/lib/scraping/job-posting";
import { suggestSlug } from "@/lib/slug";
import { DEFAULT_PAGE_THEME } from "@/lib/themes";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function isValidHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const reuse_resume_path = String(form.get("reuse_resume_path") ?? "").trim();
  const job_posting_url = String(form.get("job_posting_url") ?? "").trim();

  let buffer: Buffer;

  if (reuse_resume_path) {
    if (file instanceof File && file.size > 0) {
      return NextResponse.json(
        { error: "Use either a new PDF upload or a saved resume, not both." },
        { status: 400 },
      );
    }
    if (!reuse_resume_path.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: "Invalid saved resume path." },
        { status: 400 },
      );
    }
    const { data: owns } = await supabase
      .from("pages")
      .select("id")
      .eq("user_id", user.id)
      .eq("resume_file_path", reuse_resume_path)
      .limit(1)
      .maybeSingle();
    if (!owns) {
      return NextResponse.json(
        { error: "Saved resume not found or no longer available." },
        { status: 404 },
      );
    }
    const { data: blob, error: dlError } = await supabase.storage
      .from("resumes")
      .download(reuse_resume_path);
    if (dlError || !blob) {
      return NextResponse.json(
        { error: "Could not load saved resume file." },
        { status: 400 },
      );
    }
    buffer = Buffer.from(await blob.arrayBuffer());
  } else if (file instanceof File && file.size > 0) {
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    return NextResponse.json(
      { error: "Upload a PDF or choose a saved resume." },
      { status: 400 },
    );
  }

  if (!job_posting_url) {
    return NextResponse.json(
      { error: "Job posting URL is required." },
      { status: 400 },
    );
  }

  if (!isValidHttpUrl(job_posting_url)) {
    return NextResponse.json(
      { error: "Enter a valid http or https job posting URL." },
      { status: 400 },
    );
  }

  const { text, candidateName } = await parseResumePdf(buffer);

  const [extraction, jobResult] = await Promise.all([
    extractResumeWithAnthropic(text, candidateName),
    fetchJobPostingDescription(job_posting_url),
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

  if (!jobResult.ok) {
    return NextResponse.json({ error: jobResult.error }, { status: 422 });
  }

  const target_company = jobResult.companyName;
  const target_role = jobResult.roleTitle;

  const whyFit = await generateWhyFitWithAnthropic(
    text,
    jobResult.descriptionText,
  );

  if (!whyFit.ok) {
    const status =
      whyFit.error.includes("ANTHROPIC_API_KEY") ||
      whyFit.error.includes("not configured")
        ? 503
        : 502;
    return NextResponse.json({ error: whyFit.error }, { status });
  }

  const resumeStructured = extraction.data;
  const draftSlug = `draft-${randomUUID()}`;
  const ext = "pdf";
  const path = `${user.id}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const firstName = candidateName.split(/\s+/)[0] ?? candidateName;
  const suggestedSlug = suggestSlug(firstName, target_company);

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

  const { data: page, error: insertError } = await supabase
    .from("pages")
    .insert({
      user_id: user.id,
      slug: draftSlug,
      candidate_name: candidateName,
      target_company,
      target_role,
      resume_text: text,
      resume_structured: resumeStructured as unknown as Record<string, unknown>,
      resume_file_path: path,
      job_posting_url: jobResult.url,
      job_description_text: jobResult.descriptionText,
      why_fit_structured: whyFit.data as unknown as Record<string, unknown>,
      is_published: false,
      theme: DEFAULT_PAGE_THEME,
      ai_generation,
    })
    .select("id")
    .single();

  if (insertError || !page) {
    await supabase.storage.from("resumes").remove([path]);
    return NextResponse.json(
      { error: insertError?.message ?? "Insert failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    pageId: page.id,
    suggestedSlug,
    candidateName,
  });
}
