"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SavedResume = {
  path: string;
  candidate_name: string;
  target_company: string;
  label: string;
};

export function ResumeUploader() {
  const router = useRouter();
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [source, setSource] = useState<"new" | "reuse">("new");
  const [file, setFile] = useState<File | null>(null);
  const [reusePath, setReusePath] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/upload/resumes");
        const json = (await res.json()) as { resumes?: SavedResume[] };
        if (!cancelled && res.ok && json.resumes?.length) {
          setSavedResumes(json.resumes);
          setSource("reuse");
          setReusePath(json.resumes[0]!.path);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!jobUrl.trim()) {
      setError("Add the job posting URL.");
      return;
    }
    if (source === "new" && !file) {
      setError("Choose a PDF file.");
      return;
    }
    if (source === "reuse" && !reusePath) {
      setError("Choose a saved resume.");
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(jobUrl.trim());
    } catch {
      setError("Enter a valid job posting URL (http or https).");
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      setError("Job posting URL must start with http:// or https://");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.set("job_posting_url", jobUrl.trim());
    if (source === "reuse") {
      fd.set("reuse_resume_path", reusePath);
    } else if (file) {
      fd.set("file", file);
    }
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = (await res.json()) as {
      error?: string;
      pageId?: string;
    };
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Upload failed");
      return;
    }
    if (json.pageId) {
      router.push(
        `/dashboard/new/confirm?draftId=${encodeURIComponent(json.pageId)}`,
      );
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mx-auto max-w-lg space-y-6"
    >
      {loadingList ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Checking for saved resumes…
        </p>
      ) : savedResumes.length > 0 ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Resume
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
              <input
                type="radio"
                name="resume_source"
                checked={source === "reuse"}
                onChange={() => setSource("reuse")}
                className="border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              Use a saved resume
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
              <input
                type="radio"
                name="resume_source"
                checked={source === "new"}
                onChange={() => setSource("new")}
                className="border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              Upload a new PDF
            </label>
          </div>
          {source === "reuse" ? (
            <div>
              <label className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Saved resume
              </label>
              <select
                value={reusePath}
                onChange={(e) => setReusePath(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100"
                required={source === "reuse"}
              >
                {savedResumes.map((r) => (
                  <option key={r.path} value={r.path}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                PDF file
              </label>
              <input
                type="file"
                accept="application/pdf"
                required={source === "new"}
                className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:text-neutral-400 file:dark:bg-neutral-100 file:dark:text-neutral-900"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}
        </fieldset>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Resume (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            required
            className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Job posting URL
        </label>
        <input
          type="url"
          required
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100"
        />
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          We load this page to extract the job description, company, and role, then
          generate your &quot;Why I fit&quot; section. Use a direct link to the posting.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading || loadingList}
        className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
      >
        {loading ? "Creating your page…" : "Continue"}
      </button>
    </form>
  );
}
