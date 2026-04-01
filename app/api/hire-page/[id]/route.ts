import { createClient } from "@/lib/supabase/server";
import { isValidPageTheme } from "@/lib/themes";
import { NextResponse } from "next/server";

export async function PATCH(
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

  let body: { theme?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidPageTheme(body.theme)) {
    return NextResponse.json(
      { error: "Invalid or missing theme" },
      { status: 400 },
    );
  }
  const theme = body.theme;

  const { data: existing, error: fetchError } = await supabase
    .from("pages")
    .select("id, user_id, is_published")
    .eq("id", id)
    .single();

  if (fetchError || !existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.is_published) {
    return NextResponse.json(
      { error: "Theme cannot be changed after publishing." },
      { status: 403 },
    );
  }

  const { error: updateError } = await supabase
    .from("pages")
    .update({
      theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, theme });
}
