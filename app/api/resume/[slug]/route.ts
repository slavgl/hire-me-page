import { createServiceClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const { data: page, error } = await admin
    .from("pages")
    .select("resume_file_path")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !page?.resume_file_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signed, error: signError } = await admin.storage
    .from("resumes")
    .createSignedUrl(page.resume_file_path, 3600);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not create link" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
