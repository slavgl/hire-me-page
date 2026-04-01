import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_PAGE_THEME,
  isValidPageTheme,
  type PageTheme,
} from "@/lib/themes";
import {
  isSlugAvailable,
  isValidSlugFormat,
  suggestAlternateSlugs,
} from "@/lib/slug";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
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

  let body: { slug?: string; theme?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const theme: PageTheme =
    body.theme !== undefined && isValidPageTheme(body.theme)
      ? body.theme
      : DEFAULT_PAGE_THEME;

  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!isValidSlugFormat(slug)) {
    return NextResponse.json(
      { error: "Invalid slug format or reserved word" },
      { status: 400 },
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from("pages")
    .select("id, user_id, slug, is_published")
    .eq("id", id)
    .single();

  if (fetchError || !existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.is_published) {
    return NextResponse.json(
      { error: "This page is already published." },
      { status: 403 },
    );
  }

  const available = await isSlugAvailable(supabase, slug, id);
  if (!available) {
    const suggestions = await suggestAlternateSlugs(supabase, slug, id);
    return NextResponse.json(
      { error: "Slug already taken", suggestions },
      { status: 409 },
    );
  }

  const { error: updateError } = await supabase
    .from("pages")
    .update({
      slug,
      theme,
      is_published: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug, theme });
}
