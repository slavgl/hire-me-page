import Anthropic from "@anthropic-ai/sdk";
import type { AnthropicUsage } from "@/lib/ai-generation";
import { usageFromAnthropicMessage } from "@/lib/ai-generation";
import {
  resumeStructuredSchema,
  type ResumeStructuredParsed,
} from "@/lib/resume-schema";

export type ExtractResumeResult =
  | { ok: true; data: ResumeStructuredParsed; usage: AnthropicUsage; model: string }
  | { ok: false; error: string };

function err(message: string): ExtractResumeResult {
  return { ok: false, error: message };
}

export async function extractResumeWithAnthropic(
  resumeText: string,
  candidateNameHint?: string,
): Promise<ExtractResumeResult> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    return err(
      "Resume extraction is not configured (set ANTHROPIC_API_KEY on the server).",
    );
  }
  if (!resumeText.trim()) {
    return err(
      "No readable text was found in this PDF. Try a text-based PDF or another file.",
    );
  }

  const client = new Anthropic({ apiKey: key });
  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

  const prompt = `Extract resume content into JSON only. Output valid JSON with no markdown code fences and no explanation.

Candidate name hint (often first line): ${candidateNameHint ?? "unknown"}

Plain text resume:
---
${resumeText.slice(0, 120000)}
---

Schema:
- "summary": optional string
- "experience": optional array of objects, each job one object: { "title"?, "company"?, "period"?, "bullets": string[] }
- "skills": optional string[]
- "education": optional array of { "institution": string, "detail"?: string }

Rules: Preserve factual content; do not invent employers, dates, or degrees. Use empty arrays for bullets only when there is no bullet content for that job. If the text is too messy, you may use "rawSections": [ { "title": string, "body": string } ] instead of structured fields.`;

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });
    const block = msg.content[0];
    if (!block || block.type !== "text") {
      return err(
        "Resume extraction failed: the model did not return text. Try again in a moment.",
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
        "Resume extraction failed: the model returned invalid JSON. Try uploading again.",
      );
    }
    const parsed = resumeStructuredSchema.safeParse(json);
    if (!parsed.success) {
      return err(
        "Resume extraction failed: the model output did not match the expected resume format. Try again or use a clearer PDF.",
      );
    }
    const resolvedModel = msg.model ?? model;
    return {
      ok: true,
      data: parsed.data,
      usage: usageFromAnthropicMessage(msg),
      model: resolvedModel,
    };
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : String(e);
    return err(`Resume extraction failed (Anthropic): ${detail}`);
  }
}
