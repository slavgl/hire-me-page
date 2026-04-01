import { z } from "zod";

/** Per-call token counts from Anthropic Messages API `usage`. */
export const anthropicUsageSchema = z.object({
  input_tokens: z.number().int().nonnegative(),
  output_tokens: z.number().int().nonnegative(),
});

export type AnthropicUsage = z.infer<typeof anthropicUsageSchema>;

export const aiGenerationCallSchema = z.object({
  step: z.enum(["resume_extract", "why_fit"]),
  input_tokens: z.number().int().nonnegative(),
  output_tokens: z.number().int().nonnegative(),
});

export const aiGenerationSchema = z.object({
  model: z.string(),
  calls: z.array(aiGenerationCallSchema),
});

export type AiGenerationMeta = z.infer<typeof aiGenerationSchema>;

export function usageFromAnthropicMessage(msg: {
  usage?: { input_tokens?: number | null; output_tokens?: number | null } | null;
}): AnthropicUsage {
  return {
    input_tokens: msg.usage?.input_tokens ?? 0,
    output_tokens: msg.usage?.output_tokens ?? 0,
  };
}
