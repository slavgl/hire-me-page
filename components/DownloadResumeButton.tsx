"use client";

type Props = {
  pageId: string;
  slug: string;
};

export function DownloadResumeButton({ pageId, slug }: Props) {
  async function handleClick() {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_id: pageId,
        event_type: "resume_download",
      }),
    });
    window.location.href = `/api/resume/${encodeURIComponent(slug)}`;
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50"
    >
      Download Resume
    </button>
  );
}
