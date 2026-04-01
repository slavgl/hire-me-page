import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Page not found
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        This link doesn&apos;t exist or isn&apos;t published.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="font-medium text-neutral-900 underline dark:text-neutral-100"
        >
          Back to HireMe.page
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}
