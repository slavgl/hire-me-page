"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  pageId: string;
  initialCompany: string;
  initialRole: string;
};

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100";

export function PageTitleEditor({ pageId, initialCompany, initialRole }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState(initialCompany);
  const [role, setRole] = useState(initialRole);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    if (!company.trim() || !role.trim()) {
      setError("Company and role cannot be empty.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/hire-page/${pageId}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_company: company.trim(),
          target_role: role.trim(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function onCancel() {
    setCompany(initialCompany);
    setRole(initialRole);
    setError(null);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex min-w-0 items-start gap-2">
        <h1
          className="truncate text-2xl font-semibold text-neutral-900 dark:text-neutral-100"
          title={`${role} at ${company}`}
        >
          {role} at {company}
        </h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-1 shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          aria-label="Edit company and role"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474ZM3.75 14A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5Z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={busy}
            maxLength={150}
            autoFocus
            className={`${inputClass} w-full`}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={busy}
            maxLength={150}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSave()}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
