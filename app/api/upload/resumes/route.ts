import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export type SavedResumeItem = {
  path: string;
  candidate_name: string;
  target_company: string;
  label: string;
};

/**
 * List distinct resume files from the user's pages (most recent page per file first).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("pages")
    .select("resume_file_path, candidate_name, target_company, created_at")
    .eq("user_id", user.id)
    .not("resume_file_path", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const seen = new Set<string>();
  const resumes: SavedResumeItem[] = [];
  for (const row of rows ?? []) {
    const path = row.resume_file_path as string | null;
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const candidate_name = String(row.candidate_name ?? "");
    const target_company = String(row.target_company ?? "");
    const date = new Date(row.created_at as string).toLocaleDateString();
    resumes.push({
      path,
      candidate_name,
      target_company,
      label: `${candidate_name} · ${target_company} · ${date}`,
    });
    if (resumes.length >= 30) break;
  }

  return NextResponse.json({ resumes });
}
