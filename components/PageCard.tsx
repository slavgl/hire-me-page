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

function IconCog({ className }: { className?: string }) {
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
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.723 6.723 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.37.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
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
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="px-3 py-2.5 hover:bg-neutral-50/80 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={detailHref}
            className="min-w-0 flex-1 truncate text-base font-semibold text-neutral-900"
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
          <p className="text-xs text-neutral-500">
            {page.candidate_name} ·{" "}
            {new Date(page.created_at).toLocaleDateString()}
          </p>
          {isDraft ? (
            <p className="mt-0.5 text-xs font-medium text-amber-700">
              Draft — finish your link
            </p>
          ) : null}
          {!isDraft ? (
            <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-0.5 text-center text-xs sm:text-left">
              <div>
                <dt className="text-neutral-500">Views</dt>
                <dd className="text-sm font-semibold tabular-nums text-neutral-900">
                  {stats.totalViews}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Downloads</dt>
                <dd className="text-sm font-semibold tabular-nums text-neutral-900">
                  {stats.downloads}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Last viewed</dt>
                <dd className="text-sm font-semibold text-neutral-900">
                  {formatRelative(stats.lastViewed)}
                </dd>
              </div>
            </dl>
          ) : null}
        </Link>
      </div>
      {!isDraft ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-3 py-2 sm:px-4">
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
          >
            <IconEye className={iconSm} />
            View
          </Link>
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
          >
            <IconCog className={iconSm} />
            Manage
          </Link>
        </div>
      ) : null}
    </div>
  );
}
