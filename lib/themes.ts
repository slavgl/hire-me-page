export const PAGE_THEMES = ["minimal", "editorial", "bold"] as const;

export type PageTheme = (typeof PAGE_THEMES)[number];

export const DEFAULT_PAGE_THEME: PageTheme = "minimal";

export function isValidPageTheme(value: unknown): value is PageTheme {
  return (
    typeof value === "string" &&
    (PAGE_THEMES as readonly string[]).includes(value)
  );
}
