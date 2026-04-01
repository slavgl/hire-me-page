import Link from "next/link";

type Props = {
  /** Logo mark height in px; width follows intrinsic aspect ratio */
  height?: number;
  className?: string;
  href?: string;
};

export function BrandLogo({
  height = 36,
  className = "",
  href = "/",
}: Props) {
  const wordmarkPx = Math.round(
    0.7 * Math.min(36, Math.max(22, height * 0.92)),
  );

  const label = (
    <span
      className="font-bold tracking-tight text-[#2D3E40]"
      style={{
        fontSize: `${wordmarkPx}px`,
        lineHeight: 1.05,
      }}
    >
      HireMe.page
    </span>
  );

  const mark = (
    // eslint-disable-next-line @next/next/no-img-element -- PNG from /public
    <img
      src="/logo.png"
      alt=""
      style={{ height: `${height}px`, width: "auto" }}
      className="object-contain"
    />
  );

  const inner = (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`.trim()}>
      {mark}
      {label}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {inner}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0 items-center">{inner}</span>;
}
