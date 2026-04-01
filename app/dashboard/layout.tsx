import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

export default function DashboardLayout({  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo href="/dashboard" height={34} />          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/dashboard/new"
              className="text-neutral-600 hover:text-neutral-900"
            >
              New page
            </Link>
            <Link
              href="/dashboard"
              className="text-neutral-600 hover:text-neutral-900"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
