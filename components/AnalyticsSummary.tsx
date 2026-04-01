import type { PageStats } from "@/lib/dashboard-stats";

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
}

export function AnalyticsSummary({
  stats,
  uniqueVisitors,
}: {
  stats: PageStats;
  uniqueVisitors: number;
}) {
  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <dt className="text-sm text-neutral-500 dark:text-neutral-400">Total views</dt>
        <dd className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {stats.totalViews}
        </dd>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <dt className="text-sm text-neutral-500 dark:text-neutral-400">Unique visitors</dt>
        <dd className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {uniqueVisitors}
        </dd>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <dt className="text-sm text-neutral-500 dark:text-neutral-400">Resume downloads</dt>
        <dd className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {stats.downloads}
        </dd>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <dt className="text-sm text-neutral-500 dark:text-neutral-400">Last viewed</dt>
        <dd className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {formatRelative(stats.lastViewed)}
        </dd>
      </div>
    </dl>
  );
}
