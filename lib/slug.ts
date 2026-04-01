import type { SupabaseClient } from "@supabase/supabase-js";

export const RESERVED_SLUGS = new Set([
  "dashboard",
  "login",
  "signup",
  "api",
  "admin",
  "settings",
  "about",
  "pricing",
  "blog",
  "help",
  "support",
  "terms",
  "privacy",
  "auth",
  "favicon",
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifySegment(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlugFormat(slug: string): boolean {
  if (slug.length < 3 || slug.length > 60) return false;
  if (!SLUG_RE.test(slug)) return false;
  if (RESERVED_SLUGS.has(slug)) return false;
  if (slug.startsWith("draft-")) return false;
  return true;
}

export function suggestSlug(firstName: string, company: string): string {
  const a = slugifySegment(firstName);
  const b = slugifySegment(company);
  if (!a && !b) return "my-page";
  if (!a) return (b || "page").slice(0, 60);
  if (!b) return a.slice(0, 60);
  const combined = `${a}-${b}`;
  return combined.slice(0, 60);
}

export async function isSlugAvailable(
  supabase: SupabaseClient,
  slug: string,
  excludePageId?: string,
): Promise<boolean> {
  if (!isValidSlugFormat(slug)) return false;
  const { data } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return true;
  if (excludePageId && data.id === excludePageId) return true;
  return false;
}

export async function suggestAlternateSlugs(
  supabase: SupabaseClient,
  base: string,
  excludePageId?: string,
): Promise<string[]> {
  const candidates = [
    `${base}-2`,
    `${base}-sde`,
    `${base}-3`,
  ].filter((s) => s.length <= 60);
  const out: string[] = [];
  for (const c of candidates) {
    if (await isSlugAvailable(supabase, c, excludePageId)) out.push(c);
    if (out.length >= 2) break;
  }
  return out;
}
