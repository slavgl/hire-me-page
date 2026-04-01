"use client";

import type { PageTheme } from "@/lib/themes";
import { DEFAULT_PAGE_THEME, PAGE_THEMES } from "@/lib/themes";

const LABELS: Record<PageTheme, { name: string; blurb: string }> = {
  minimal: {
    name: "Minimal",
    blurb: "Clean, neutral, lots of whitespace.",
  },
  editorial: {
    name: "Editorial",
    blurb: "Magazine-style serif headlines.",
  },
  bold: {
    name: "Bold",
    blurb: "Strong type and high contrast.",
  },
};

type Props = {
  value: PageTheme;
  onChange: (theme: PageTheme) => void;
  disabled?: boolean;
};

export function ThemePicker({ value, onChange, disabled }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Page style
      </legend>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Default is {LABELS[DEFAULT_PAGE_THEME].name}. You can change this before
        publishing.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {PAGE_THEMES.map((id) => {
          const selected = value === id;
          return (
            <label
              key={id}
              className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-colors ${
                selected
                  ? "border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-800"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-600 dark:hover:border-neutral-500"
              } ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="theme"
                value={id}
                checked={selected}
                onChange={() => onChange(id)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {LABELS[id].name}
              </span>
              <span className="mt-1 block text-xs text-neutral-600 dark:text-neutral-400">
                {LABELS[id].blurb}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
