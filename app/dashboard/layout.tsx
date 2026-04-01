import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-5xl flex-row items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
          <BrandLogo href="/dashboard" height={34} compact />
          <nav className="flex shrink-0 flex-nowrap items-center gap-1.5 text-xs sm:gap-4 sm:text-sm">
            <Link
              href="/dashboard/new"
              className="whitespace-nowrap text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              New page
            </Link>
            <Link
              href="/dashboard"
              className="whitespace-nowrap text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Home
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
