import { sendViewNotificationEmail } from "@/lib/email/send-view-notification";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeInet(ip: string | null): string | null {
  if (!ip) return null;
  const trimmed = ip.split(",")[0]?.trim() ?? "";
  if (!trimmed || trimmed.length > 45) return null;
  return trimmed;
}

function shouldSendViewNotification(lastAt: string | null): boolean {
  const raw = process.env.VIEW_NOTIFICATION_THROTTLE_MINUTES ?? "90";
  const minutes = Number.parseInt(raw, 10);
  const windowMs =
    (Number.isFinite(minutes) && minutes > 0 ? minutes : 90) * 60 * 1000;
  if (!lastAt) return true;
  return Date.now() - new Date(lastAt).getTime() >= windowMs;
}

export async function POST(request: Request) {
  let body: { page_id?: string; event_type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const page_id = body.page_id;
  const event_type = body.event_type;

  if (!page_id || typeof page_id !== "string") {
    return NextResponse.json({ error: "page_id required" }, { status: 400 });
  }

  if (event_type !== "view" && event_type !== "resume_download") {
    return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: page, error: pageError } = await admin
    .from("pages")
    .select(
      "id, user_id, slug, target_company, target_role, last_view_notification_at",
    )
    .eq("id", page_id)
    .eq("is_published", true)
    .maybeSingle();

  if (pageError || !page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const is_owner_view = !!(user && user.id === page.user_id);

  const ip = safeInet(
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip"),
  );
  const country = request.headers.get("x-vercel-ip-country");
  const city = request.headers.get("x-vercel-ip-city");
  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");

  const row = {
    page_id,
    ip_address: ip,
    user_agent: userAgent,
    referrer,
    country: country || null,
    city: city || null,
    is_resume_download: event_type === "resume_download",
    is_owner_view,
  };

  let insertError = (await admin.from("page_views").insert(row)).error;
  if (insertError) {
    insertError = (
      await admin.from("page_views").insert({
        ...row,
        ip_address: null,
      })
    ).error;
  }

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (
    event_type === "view" &&
    !is_owner_view &&
    shouldSendViewNotification(page.last_view_notification_at)
  ) {
    const { data: ownerAuth, error: ownerErr } =
      await admin.auth.admin.getUserById(page.user_id);
    const email = ownerAuth?.user?.email;
    if (email && !ownerErr) {
      const viewerRegion =
        [city, country].filter(Boolean).join(", ") || null;
      const result = await sendViewNotificationEmail({
        to: email,
        page: {
          id: page.id,
          slug: page.slug,
          target_company: page.target_company,
          target_role: page.target_role,
        },
        viewerRegion,
      });
      if (result.sent) {
        await admin
          .from("pages")
          .update({ last_view_notification_at: new Date().toISOString() })
          .eq("id", page.id);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
