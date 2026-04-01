"use client";

import { useEffect } from "react";

/** Dev-only double mount (React Strict Mode) fires useEffect twice in a row; dedupe within this window. */
const DEDUP_MS = 2500;
const lastViewSentAt = new Map<string, number>();

export function TrackPageView({ pageId }: { pageId: string }) {
  useEffect(() => {
    const now = Date.now();
    const prev = lastViewSentAt.get(pageId);
    if (prev !== undefined && now - prev < DEDUP_MS) {
      return;
    }
    lastViewSentAt.set(pageId, now);

    void fetch("/api/track", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_id: pageId, event_type: "view" }),
    });
  }, [pageId]);

  return null;
}
