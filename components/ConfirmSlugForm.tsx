"use client";

import { ThemePicker } from "@/components/ThemePicker";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { getPublicBaseUrl } from "@/lib/app-url";
import { DEFAULT_PAGE_THEME, type PageTheme } from "@/lib/themes";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
type Props = {
  pageId: string;
  suggestedSlug: string;
};

export function ConfirmSlugForm({ pageId, suggestedSlug }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(suggestedSlug);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<PageTheme>(DEFAULT_PAGE_THEME);

  const baseUrl = useMemo(() => getPublicBaseUrl(), []);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuggestions([]);
    setLoading(true);
    const res = await fetch(`/api/hire-page/${pageId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim().toLowerCase(),
        theme,
      }),
    });
    const json = (await res.json()) as {
      error?: string;
      suggestions?: string[];
      slug?: string;
    };
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Could not publish");
      if (json.suggestions?.length) setSuggestions(json.suggestions);
      return;
    }
    if (json.slug) {
      setPublishedUrl(`${baseUrl}/${json.slug}`);
    }
  }

  if (publishedUrl) {
    const companyPlaceholder = "[company]";
    const rolePlaceholder = "[role]";
    const namePlaceholder = "[name]";
    const link = publishedUrl;
    const emailBody = `Hi ${namePlaceholder}, I applied for ${rolePlaceholder} at ${companyPlaceholder}. Here's a quick overview of my background: ${link}`;
    const linkedInBody = `Hi ${namePlaceholder}, here's a quick summary of my background relevant to this role: ${link}`;

    return (
      <div className="mx-auto max-w-xl space-y-8 text-center">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Your page is live
          </h2>
          <p className="mt-2 text-neutral-600">
            Share this link in your application follow-ups.
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 break-all text-left text-sm text-neutral-800">
          {publishedUrl}
        </div>
        <CopyLinkButton
          url={publishedUrl}
          className="w-full rounded-lg border border-neutral-300 bg-white px-6 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-50"
        />
        <div className="space-y-4 text-left">
          <p className="text-sm font-medium text-neutral-700">Email template</p>
          <pre className="whitespace-pre-wrap rounded-lg border border-neutral-200 bg-white p-4 text-xs text-neutral-800">
            {emailBody}
          </pre>
          <CopyLinkButton
            url={emailBody}
            label="Copy email message"
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-1 ring-neutral-300 hover:bg-neutral-50"
          />
          <p className="text-sm font-medium text-neutral-700">LinkedIn DM</p>
          <pre className="whitespace-pre-wrap rounded-lg border border-neutral-200 bg-white p-4 text-xs text-neutral-800">
            {linkedInBody}
          </pre>
          <CopyLinkButton
            url={linkedInBody}
            label="Copy LinkedIn message"
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-1 ring-neutral-300 hover:bg-neutral-50"
          />
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-sm font-medium text-neutral-600 underline"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mx-auto max-w-md space-y-8"
    >
      <ThemePicker value={theme} onChange={setTheme} disabled={loading} />
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Public link slug
        </label>        <p className="mb-2 text-xs text-neutral-500">
          Only the URL slug can be edited. Use lowercase letters, numbers, and hyphens
          (3–60 characters).
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">{baseUrl}/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            autoComplete="off"
          />
        </div>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {suggestions.length > 0 ? (
        <div className="text-sm text-neutral-600">
          <p className="mb-1">Try:</p>
          <ul className="list-inside list-disc">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="text-neutral-900 underline"
                  onClick={() => setSlug(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? "Publishing…" : "Publish page"}
      </button>
    </form>
  );
}
