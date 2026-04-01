import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="mx-auto flex max-w-5xl flex-row items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6 sm:py-6">
        <BrandLogo href="/" height={36} compact />
        <div className="flex shrink-0 items-center">
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
}
