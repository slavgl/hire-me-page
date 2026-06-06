import Link from "next/link";
import type { PageRow } from "@/lib/types";
import { CopyLinkButton } from "@/components/CopyLinkButton";

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

function IconPencil({ className }: { className?: string }) {
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
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

function IconBarChart({ className }: { className?: string }) {
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
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      />
    </svg>
  );
}

const iconSm = "h-4 w-4 shrink-0";

type Props = {
  page: PageRow;
  stats: {
    totalViews: number;
    downloads: number;
    lastViewed: string | null;
  };
  baseUrl: string;
};

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function PageCard({ page, stats, baseUrl }: Props) {
  const url = `${baseUrl}/${page.slug}`;
  const isDraft = !page.is_published;

  const detailHref = isDraft
    ? `/dashboard/new/confirm?draftId=${page.id}`
    : `/dashboard/${page.id}`;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="px-3 py-2.5 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={detailHref}
            className="min-w-0 flex-1 truncate text-base font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {page.target_role} · {page.target_company}
          </Link>
          {!isDraft ? (
            <div className="shrink-0">
              <CopyLinkButton url={url} iconOnly aria-label="Copy page link" />
            </div>
          ) : null}
        </div>
        <Link href={detailHref} className="mt-0.5 block">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {page.candidate_name} ·{" "}
            {new Date(page.created_at).toLocaleDateString()}
          </p>
          {isDraft ? (
            <p className="mt-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              Draft — finish your link
            </p>
          ) : null}
          {!isDraft ? (
            <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-0.5 text-center text-xs sm:text-left">
              <div>
                <dt className="text-neutral-500 dark:text-neutral-400">Views</dt>
                <dd className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                  {stats.totalViews}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500 dark:text-neutral-400">Downloads</dt>
                <dd className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                  {stats.downloads}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500 dark:text-neutral-400">Last viewed</dt>
                <dd className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatRelative(stats.lastViewed)}
                </dd>
              </div>
            </dl>
          ) : null}
        </Link>
      </div>
      {!isDraft ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-3 py-2 dark:border-neutral-800 sm:px-4">
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            <IconEye className={iconSm} />
            View
          </Link>
          <Link
            href={`/dashboard/${page.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            <IconPencil className={iconSm} />
            Edit
          </Link>
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            <IconBarChart className={iconSm} />
            Track
          </Link>
        </div>
      ) : null}
    </div>
  );
}
