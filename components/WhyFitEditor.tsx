"use client";

import type { WhyFitStructured } from "@/lib/why-fit-schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Highlight = { requirement: string; how_i_meet_it: string };

type Props = {
  pageId: string;
  initial: WhyFitStructured;
  backHref: string;
};

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100";

const labelClass = "mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300";

export function WhyFitEditor({ pageId, initial, backHref }: Props) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initial.headline);
  const [whyText, setWhyText] = useState(initial.why_i_am_a_fit);
  const [highlights, setHighlights] = useState<Highlight[]>(
    initial.key_highlights.map((h) => ({ ...h })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function updateHighlight(i: number, field: keyof Highlight, value: string) {
    setHighlights((prev) =>
      prev.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)),
    );
  }

  function addHighlight() {
    setHighlights((prev) => [...prev, { requirement: "", how_i_meet_it: "" }]);
  }

  function removeHighlight(i: number) {
    setHighlights((prev) => prev.filter((_, idx) => idx !== i));
  }

  function moveHighlight(i: number, dir: -1 | 1) {
    const j = i + dir;
    setHighlights((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function validate(): string | null {
    if (!headline.trim()) return "Headline cannot be empty.";
    if (headline.trim().length > 300) return "Headline must be 300 characters or fewer.";
    if (!whyText.trim()) return "Why I fit text cannot be empty.";
    if (whyText.trim().length > 5000) return "Why I fit text must be 5000 characters or fewer.";
    if (highlights.length === 0) return "At least one role fit row is required.";
    if (highlights.length > 20) return "Maximum 20 role fit rows.";
    for (let i = 0; i < highlights.length; i++) {
      if (!highlights[i].requirement.trim())
        return `Row ${i + 1}: requirement cannot be empty.`;
      if (!highlights[i].how_i_meet_it.trim())
        return `Row ${i + 1}: "How I meet it" cannot be empty.`;
    }
    return null;
  }

  async function onSave() {
    const ve = validate();
    if (ve) {
      setValidationError(ve);
      return;
    }
    setValidationError(null);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/hire-page/${pageId}/why-fit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: headline.trim(),
          why_i_am_a_fit: whyText.trim(),
          key_highlights: highlights.map((h) => ({
            requirement: h.requirement.trim(),
            how_i_meet_it: h.how_i_meet_it.trim(),
          })),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Try again.");
        return;
      }
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Headline */}
      <div>
        <label className={labelClass}>Headline</label>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          disabled={busy}
          maxLength={300}
          className={inputClass}
        />
      </div>

      {/* Why I fit prose */}
      <div>
        <label className={labelClass}>Why I fit</label>
        <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
          Use a blank line between paragraphs.
        </p>
        <textarea
          value={whyText}
          onChange={(e) => setWhyText(e.target.value)}
          disabled={busy}
          maxLength={5000}
          rows={8}
          className={`${inputClass} resize-y`}
        />
        <p className="mt-1 text-right text-xs text-neutral-400">
          {whyText.length}/5000
        </p>
      </div>

      {/* Role Fit table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Role Fit rows
        </h2>
        <div className="space-y-3">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Row {i + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={busy || i === 0}
                    onClick={() => moveHighlight(i, -1)}
                    className="rounded px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={busy || i === highlights.length - 1}
                    onClick={() => moveHighlight(i, 1)}
                    className="rounded px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={busy || highlights.length <= 1}
                    onClick={() => removeHighlight(i)}
                    className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-30 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="mb-0.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Requirement
                  </label>
                  <input
                    type="text"
                    value={h.requirement}
                    onChange={(e) => updateHighlight(i, "requirement", e.target.value)}
                    disabled={busy}
                    maxLength={500}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    How I meet it
                  </label>
                  <textarea
                    value={h.how_i_meet_it}
                    onChange={(e) => updateHighlight(i, "how_i_meet_it", e.target.value)}
                    disabled={busy}
                    maxLength={500}
                    rows={2}
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={busy || highlights.length >= 20}
          onClick={addHighlight}
          className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          + Add row
        </button>
      </div>

      {/* Errors */}
      {validationError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {validationError}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSave()}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => router.push(backHref)}
          className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
