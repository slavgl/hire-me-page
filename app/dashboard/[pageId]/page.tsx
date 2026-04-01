import { AnalyticsSummary } from "@/components/AnalyticsSummary";
import {
  CopyLinkButton,
  IconClipboardDocument,
} from "@/components/CopyLinkButton";
import { PageActions } from "@/components/PageActions";
import { ThemeChangeControl } from "@/components/ThemeChangeControl";
import { ViewsChart } from "@/components/ViewsChart";
import {
  aggregatePageStats,
  uniqueVisitorCount,
  viewsByDay,
} from "@/lib/dashboard-stats";
import { getPublicBaseUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PAGE_THEME } from "@/lib/themes";
import type { PageRow, PageViewRow } from "@/lib/types";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: { pageId: string } };

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

const iconSm = "h-4 w-4 shrink-0";

const toolbarBtnClass =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-900 hover:bg-neutral-50";

export default async function PageAnalytics({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", params.pageId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!page) {
    notFound();
  }

  const row = page as PageRow;

  const { data: viewsRaw } = await supabase
    .from("page_views")
    .select("*")
    .eq("page_id", row.id)
    .order("viewed_at", { ascending: false });

  const views = (viewsRaw ?? []) as PageViewRow[];
  const stats = aggregatePageStats(views);
  const unique = uniqueVisitorCount(views);
  const chart30 = viewsByDay(views, 30);
  const baseUrl = getPublicBaseUrl();
  const publicUrl = row.is_published ? `${baseUrl}/${row.slug}` : null;

  const recent = views
    .filter((v) => !v.is_resume_download)
    .slice(0, 25);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        ← All pages
      </Link>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-2xl font-semibold text-neutral-900"
            title={`${row.target_role} at ${row.target_company}`}
          >
            {row.target_role} at {row.target_company}
          </h1>
          <p className="text-sm text-neutral-600">{row.candidate_name}</p>
          {!row.is_published ? (
            <p className="mt-2 text-sm font-medium text-amber-800">
              Draft —{" "}
              <Link
                href={`/dashboard/new/confirm?draftId=${row.id}`}
                className="underline"
              >
                finish publishing
              </Link>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
          {publicUrl ? (
            <>
              <Link
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={toolbarBtnClass}
              >
                <IconEye className={iconSm} />
                View
              </Link>
              <CopyLinkButton
                url={publicUrl}
                label="Copy"
                icon={<IconClipboardDocument className={iconSm} />}
                className={toolbarBtnClass}
              />
            </>
          ) : null}
          <PageActions
            pageId={row.id}
            resumeFilePath={row.resume_file_path}
          />
        </div>
      </div>

      {!row.is_published ? (
        <div className="mt-8">
          <ThemeChangeControl
            pageId={row.id}
            currentTheme={row.theme ?? DEFAULT_PAGE_THEME}
          />
        </div>
      ) : null}

      <div className="mt-8 space-y-8">
        <AnalyticsSummary stats={stats} uniqueVisitors={unique} />
        <div>
          <h2 className="mb-3 text-lg font-medium text-neutral-900">
            Views (last 30 days)
          </h2>
          <ViewsChart data={chart30} />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-medium text-neutral-900">
            Recent activity
          </h2>
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Viewer</th>
                  <th className="px-3 py-2 font-medium">Location</th>
                  <th className="px-3 py-2 font-medium">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-neutral-500">
                      No views yet. Share your link to see activity here.
                    </td>
                  </tr>
                ) : (
                  recent.map((v) => (
                    <tr key={v.id} className="border-t border-neutral-100">
                      <td className="px-3 py-2 text-neutral-800">
                        {new Date(v.viewed_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-neutral-800">
                        {v.is_owner_view ? (
                          <span title="You opened this page while signed in">
                            You (owner)
                          </span>
                        ) : (
                          <span title="Someone else opened your public link">
                            External
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-neutral-800">
                        {[v.city, v.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="max-w-xs truncate px-3 py-2 text-neutral-600">
                        {v.referrer || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
