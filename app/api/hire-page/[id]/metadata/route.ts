import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const metadataEditSchema = z.object({
  target_company: z.string().trim().min(1).max(150),
  target_role: z.string().trim().min(1).max(150),
});

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = metadataEditSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("pages")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("pages")
    .update({
      target_company: parsed.data.target_company,
      target_role: parsed.data.target_role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
