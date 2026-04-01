"use client";

import type { PageTheme } from "@/lib/themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemePicker } from "@/components/ThemePicker";

type Props = {
  pageId: string;
  currentTheme: PageTheme;
};

export function ThemeChangeControl({ pageId, currentTheme }: Props) {
  const router = useRouter();
  const [theme, setTheme] = useState<PageTheme>(currentTheme);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const dirty = theme !== currentTheme;

  async function save() {
    setStatus("saving");
    setMessage(null);
    const res = await fetch(`/api/hire-page/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setStatus("error");
      setMessage(json.error ?? "Could not update theme");
      return;
    }
    setStatus("idle");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-medium text-neutral-900">Public page style</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Choose before you publish. After publishing, this cannot be changed.
      </p>
      <div className="mt-4">
        <ThemePicker
          value={theme}
          onChange={setTheme}
          disabled={status === "saving"}
        />
      </div>
      {dirty ? (
        <button
          type="button"
          disabled={status === "saving"}
          onClick={() => void save()}
          className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save theme"}
        </button>
      ) : null}
      {message ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
