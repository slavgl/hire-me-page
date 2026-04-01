import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">Page not found</h1>
      <p className="mt-2 text-neutral-600">
        This link doesn&apos;t exist or isn&apos;t published.
      </p>
      <Link
        href="/"
        className="mt-8 font-medium text-neutral-900 underline"
      >
        Back to HireMe.page
      </Link>
    </div>
  );
}
