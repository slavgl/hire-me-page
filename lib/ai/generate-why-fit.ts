import Anthropic from "@anthropic-ai/sdk";
import {
  type WhyFitStructured,
  whyFitStructuredSchema,
} from "@/lib/why-fit-schema";

export type GenerateWhyFitResult =
  | { ok: true; data: WhyFitStructured }
  | { ok: false; error: string };

function err(message: string): GenerateWhyFitResult {
  return { ok: false, error: message };
}

function normalizeDashes(text: string): string {
  return text.replace(/\u2014/g, "-");
}

function buildPrompt(resumeText: string, jobDescription: string): string {
  const rt = resumeText.slice(0, 120_000);
  const jd = jobDescription.slice(0, 120_000);
  return `You are an expert career strategist and professional writer.

A job candidate is applying for a specific role. Your task is to generate a compelling, honest, one-page professional summary that explains why this candidate is a strong fit for this role.

## Inputs

All available information about the candidate and role comes from the resume and job description. Infer the candidate name, target company, and target role from these sources.

Candidate's Resume:
${rt}

Job Description:
${jd}

## Instructions

1. Analyze the resume and job description carefully.
2. Identify the strongest 3-5 connections between the candidate's experience and the job requirements.
3. Respond with **only** a single JSON object (no other text, no markdown wrapper). Required keys:

- **headline** (string): One-sentence pitch (e.g., "Senior data engineer with 6 years building the exact pipeline infrastructure Stripe needs").
- **why_i_am_a_fit** (string): 2-3 paragraphs connecting specific experience to the role's key requirements. Reference concrete details — project names, technologies, metrics, outcomes. Never be vague. Markdown is OK.
- **key_highlights** (array): 3-5 objects, each with:
  - **requirement** (string): A key job requirement.
  - **how_i_meet_it** (string): The candidate's relevant experience with specifics. Do not repeat or paraphrase points already made in why_i_am_a_fit — use different examples or angles.

Example shape:
{"headline": "...", "why_i_am_a_fit": "...", "key_highlights": [{"requirement": "...", "how_i_meet_it": "..."}, ...]}

## Rules

- NEVER hallucinate or invent experience, skills, projects, or metrics not in the resume.
- NEVER use generic filler phrases like "passionate team player" or "proven track record."
- If the candidate is a weak fit, say so honestly and focus on transferable skills.
- Write in first person from the candidate's perspective.
- Keep total output under 500 words (across headline + why_i_am_a_fit + key_highlights).
- Do not repeat or paraphrase content from why_i_am_a_fit in key_highlights. Key highlights must add distinct requirement–evidence pairs; use different examples, metrics, or angles.
- Tone: confident, specific, professional. Not salesy. Not robotic.
`;
}

export async function generateWhyFitWithAnthropic(
  resumeText: string,
  jobDescriptionText: string,
): Promise<GenerateWhyFitResult> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    return err(
      "Resume extraction is not configured (set ANTHROPIC_API_KEY on the server).",
    );
  }
  if (!resumeText.trim()) {
    return err("No resume text available for Why I fit generation.");
  }
  if (!jobDescriptionText.trim()) {
    return err("No job description text available for Why I fit generation.");
  }

  const client = new Anthropic({ apiKey: key });
  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

  const prompt = buildPrompt(resumeText, jobDescriptionText);

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });
    const block = msg.content[0];
    if (!block || block.type !== "text") {
      return err(
        "Why I fit generation failed: the model did not return text. Try again in a moment.",
      );
    }
    let text = block.text.trim();
    if (text.startsWith("```")) {
      text = text
        .replace(/^```(?:json)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();
    }
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return err(
        "Why I fit generation failed: the model returned invalid JSON. Try uploading again.",
      );
    }

    if (json && typeof json === "object") {
      const o = json as Record<string, unknown>;
      if (typeof o.headline === "string") o.headline = normalizeDashes(o.headline);
      if (typeof o.why_i_am_a_fit === "string") {
        o.why_i_am_a_fit = normalizeDashes(o.why_i_am_a_fit);
      }
      if (Array.isArray(o.key_highlights)) {
        o.key_highlights = o.key_highlights.map((item) => {
          if (!item || typeof item !== "object") return item;
          const h = item as Record<string, unknown>;
          const out = { ...h };
          if (typeof out.requirement === "string") {
            out.requirement = normalizeDashes(out.requirement);
          }
          if (typeof out.how_i_meet_it === "string") {
            out.how_i_meet_it = normalizeDashes(out.how_i_meet_it);
          }
          return out;
        });
      }
      json = o;
    }

    const parsed = whyFitStructuredSchema.safeParse(json);
    if (!parsed.success) {
      return err(
        "Why I fit generation failed: the model output did not match the expected format. Try again.",
      );
    }
    return { ok: true, data: parsed.data };
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : String(e);
    return err(`Why I fit generation failed (Anthropic): ${detail}`);
  }
}
