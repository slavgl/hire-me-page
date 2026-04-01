import type { PageViewRow } from "@/lib/types";

export type PageStats = {
  totalViews: number;
  downloads: number;
  lastViewed: string | null;
};

export function aggregatePageStats(views: PageViewRow[]): PageStats {
  const pageViews = views.filter((v) => !v.is_resume_download);
  const downloads = views.filter((v) => v.is_resume_download).length;
  const last = pageViews
    .map((v) => v.viewed_at)
    .sort()
    .reverse()[0];
  return {
    totalViews: pageViews.length,
    downloads,
    lastViewed: last ?? null,
  };
}

export function uniqueVisitorCount(views: PageViewRow[]): number {
  const seen = new Set<string>();
  for (const v of views) {
    if (v.is_resume_download) continue;
    const key = `${v.ip_address ?? ""}|${v.user_agent ?? ""}`;
    seen.add(key);
  }
  return seen.size;
}

export function viewsByDay(
  views: PageViewRow[],
  days: number,
): { date: string; count: number }[] {
  const cutoff = Date.now() - days * 86400000;
  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }
  for (const v of views) {
    if (v.is_resume_download) continue;
    const t = new Date(v.viewed_at).getTime();
    if (t < cutoff) continue;
    const key = v.viewed_at.slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  return Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}
