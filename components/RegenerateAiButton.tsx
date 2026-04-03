"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  pageId: string;
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
};

export function RegenerateAiButton({
  pageId,
  disabled = false,
  disabledReason,
  className,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/hire-page/${pageId}/regenerate-ai`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const isDisabled = disabled || busy;

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isDisabled}
        title={disabled && disabledReason ? disabledReason : undefined}
        onClick={() => void run()}
        className={
          className ??
          "inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        }
      >
        {busy ? "Regenerating…" : "Regenerate AI sections"}
      </button>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
