import { PageCard } from "@/components/PageCard";
import { aggregatePageStats } from "@/lib/dashboard-stats";
import { getPublicBaseUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";
import type { PageRow, PageViewRow } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = (pages ?? []) as PageRow[];
  const ids = list.map((p) => p.id);
  let views: PageViewRow[] = [];
  if (ids.length) {
    const { data: v } = await supabase
      .from("page_views")
      .select("*")
      .in("page_id", ids);
    views = (v ?? []) as PageViewRow[];
  }

  const byPage = new Map<string, PageViewRow[]>();
  for (const v of views) {
    const arr = byPage.get(v.page_id) ?? [];
    arr.push(v);
    byPage.set(v.page_id, arr);
  }

  const baseUrl = getPublicBaseUrl();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Your pages
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Track views and downloads for each page.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Create new page
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
          <p className="text-neutral-700 dark:text-neutral-300">No pages yet.</p>
          <Link
            href="/dashboard/new"
            className="mt-4 inline-block font-medium text-neutral-900 underline dark:text-neutral-100"
          >
            Upload your resume and get a link
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {list.map((page) => {
            const stats = aggregatePageStats(byPage.get(page.id) ?? []);
            return (
              <li key={page.id}>
                <PageCard page={page} stats={stats} baseUrl={baseUrl} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
