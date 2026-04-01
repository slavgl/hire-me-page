import { getPublicBaseUrl } from "@/lib/app-url";
import { Resend } from "resend";

type PageInfo = {
  id: string;
  slug: string;
  target_company: string;
  target_role: string;
};

/**
 * Sends a throttled “someone viewed your page” email. No-op when RESEND_API_KEY is unset.
 */
export async function sendViewNotificationEmail(args: {
  to: string;
  page: PageInfo;
  /** Optional hint from geo headers (may be empty). */
  viewerRegion: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "no_resend_key" };
  }

  const from = process.env.RESEND_FROM;
  if (!from) {
    console.warn("sendViewNotificationEmail: RESEND_API_KEY set but RESEND_FROM missing");
    return { sent: false, reason: "no_from" };
  }

  const base = getPublicBaseUrl();
  const publicUrl = `${base}/${args.page.slug}`;
  const dashboardUrl = `${base}/dashboard/${args.page.id}`;
  const when = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const regionLine = args.viewerRegion
    ? `Approximate region: ${args.viewerRegion}\n`
    : "";

  const text = [
    `Your hire page for ${args.page.target_role} at ${args.page.target_company} was viewed.`,
    "",
    `Time: ${when}`,
    regionLine,
    `Public page: ${publicUrl}`,
    `Analytics: ${dashboardUrl}`,
    "",
    "You received this because someone opened your public page (not counted when you’re logged in as yourself in this browser).",
  ]
    .filter(Boolean)
    .join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: `New view: ${args.page.target_company} — ${args.page.target_role}`,
    text,
  });

  if (error) {
    console.error("sendViewNotificationEmail:", error);
    return { sent: false, reason: error.message };
  }

  return { sent: true };
}
