import { z } from "zod";

const experienceJobSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  period: z.string().optional(),
  bullets: z.array(z.string()),
});

const educationEntrySchema = z.object({
  institution: z.string(),
  detail: z.string().optional(),
});

export const resumeStructuredSchema = z.object({
  summary: z.string().optional(),
  experience: z
    .preprocess((val) => {
      if (!Array.isArray(val) || val.length === 0) return val;
      if (typeof val[0] === "string") {
        return [{ bullets: val as string[] }];
      }
      return val;
    }, z.array(experienceJobSchema).optional()),
  skills: z.array(z.string()).optional(),
  education: z
    .preprocess((val) => {
      if (!Array.isArray(val) || val.length === 0) return val;
      if (typeof val[0] === "string") {
        return (val as string[]).map((institution) => ({ institution }));
      }
      return val;
    }, z.array(educationEntrySchema).optional()),
  rawSections: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
      }),
    )
    .optional(),
});

export type ResumeStructuredParsed = z.infer<typeof resumeStructuredSchema>;

export function parseResumeStructured(
  raw: unknown,
): ResumeStructuredParsed | null {
  const r = resumeStructuredSchema.safeParse(raw);
  return r.success ? r.data : null;
}
