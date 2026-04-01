import { z } from "zod";

const keyHighlightSchema = z.object({
  requirement: z.string(),
  how_i_meet_it: z.string(),
});

export const whyFitStructuredSchema = z.object({
  headline: z.string(),
  why_i_am_a_fit: z.string(),
  key_highlights: z.array(keyHighlightSchema).min(1),
});

export type WhyFitStructured = z.infer<typeof whyFitStructuredSchema>;

export function parseWhyFitStructured(raw: unknown): WhyFitStructured | null {
  const r = whyFitStructuredSchema.safeParse(raw);
  return r.success ? r.data : null;
}
