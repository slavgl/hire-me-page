import { createClient } from "@/lib/supabase/server";
import { whyFitEditSchema } from "@/lib/why-fit-schema";
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = whyFitEditSchema.safeParse(body);
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
      why_fit_structured: parsed.data as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
