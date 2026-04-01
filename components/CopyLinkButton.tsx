"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function IconClipboardDocument({ className }: { className?: string }) {
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
        d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

const iconSm = "h-4 w-4 shrink-0";

type Props = {
  url: string;
  label?: string;
  className?: string;
  /** Shown to the left of the label (and with “Copied!”). */
  icon?: ReactNode;
  /** Minimal icon-only control (no border / label text). */
  iconOnly?: boolean;
  "aria-label"?: string;
};

export function CopyLinkButton({
  url,
  label = "Copy link",
  className,
  icon,
  iconOnly = false,
  "aria-label": ariaLabel,
}: Props) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }

  const a11yLabel = ariaLabel ?? label;

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() => void copy()}
        title={done ? "Copied" : a11yLabel}
        aria-label={done ? "Copied" : a11yLabel}
        className={
          className ??
          "inline-flex items-center justify-center rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        }
      >
        {done ? (
          <IconCheck className={`${iconSm} text-emerald-600`} />
        ) : (
          <span className="inline-flex shrink-0">{icon ?? <IconClipboardDocument className={iconSm} />}</span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={
        className ??
        "rounded-lg border border-neutral-300 bg-white px-6 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      }
    >
      <span className="inline-flex items-center justify-center gap-1.5">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        {done ? "Copied!" : label}
      </span>
    </button>
  );
}
