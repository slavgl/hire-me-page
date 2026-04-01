import Link from "next/link";

type Props = {
  /** Logo mark height in px; width follows intrinsic aspect ratio */
  height?: number;
  /** Smaller mark + wordmark for tight headers (e.g. mobile one-line nav) */
  compact?: boolean;
  className?: string;
  href?: string;
};

export function BrandLogo({
  height = 36,
  compact = false,
  className = "",
  href = "/",
}: Props) {
  const wordmarkPx = Math.round(
    0.7 * Math.min(36, Math.max(22, height * 0.92)),
  );

  const label = (
    <span
      className={`font-bold tracking-tight text-[#2D3E40] dark:text-neutral-200 ${
        compact ? "min-w-0 truncate sm:whitespace-nowrap" : "whitespace-nowrap"
      }`}
      style={
        compact
          ? {
              fontSize: "clamp(17px, 3.5vw, 22px)",
              lineHeight: 1.05,
            }
          : {
              fontSize: `${wordmarkPx}px`,
              lineHeight: 1.05,
            }
      }
    >
      HireMe.page
    </span>
  );

  const imgStyle = compact
    ? undefined
    : ({ height: `${height}px`, width: "auto" as const });
  const markSizeClass = compact
    ? "h-8 w-auto sm:h-9"
    : undefined;
  const mark = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- PNG from /public */}
      <img
        src="/logo.png"
        alt=""
        style={imgStyle}
        className={`object-contain dark:hidden ${markSizeClass ?? ""}`.trim()}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- PNG from /public */}
      <img
        src="/logo-dark.png"
        alt=""
        style={imgStyle}
        className={`hidden object-contain dark:block ${markSizeClass ?? ""}`.trim()}
      />
    </>
  );

  const inner = (
    <span
      className={`inline-flex min-w-0 items-center ${compact ? "gap-1.5 sm:gap-2.5" : "gap-2 sm:gap-2.5"}`}
    >
      <span className="shrink-0">{mark}</span>
      {label}
    </span>
  );

  const outerClass =
    compact
      ? "min-w-0 flex-1 overflow-hidden sm:flex-none sm:overflow-visible"
      : "shrink-0";

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex min-w-0 items-center ${outerClass} ${className}`.trim()}
      >
        {inner}
      </Link>
    );
  }

  return (
    <span className={`inline-flex min-w-0 items-center ${outerClass} ${className}`.trim()}>
      {inner}
    </span>
  );
}
