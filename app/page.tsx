import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="mx-auto flex max-w-5xl flex-row items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6 sm:py-6">
        <BrandLogo href="/" height={36} compact />
        <div className="flex shrink-0 flex-nowrap items-center gap-1.5 text-xs sm:gap-3 sm:text-sm">
          <Link
            href="/login"
            className="whitespace-nowrap text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1.5 font-medium text-white hover:bg-neutral-800 sm:px-3 sm:py-1.5 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            <span className="sm:hidden">Sign up</span>
            <span className="hidden sm:inline">Get early access</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl sm:leading-tight dark:text-neutral-50">
            Know the moment a recruiter
            <br />
            opens your application.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-neutral-400">
            Share one link instead of a PDF. See who looked, and when — so you
            know exactly when to follow up.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex rounded-lg bg-neutral-900 px-6 py-3 text-base font-medium text-white hover:bg-neutral-800"
          >
            Get early access
          </Link>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-500">
            Free during beta · No credit card required
          </p>
        </div>

        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
            How it works
          </h2>
          <ol className="mt-12 flex flex-col gap-4 lg:grid lg:grid-cols-5 lg:gap-4">
            <li className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                1
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                Upload your resume
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600 dark:text-neutral-400">
                Drop your PDF or .docx. We extract the content — no reformatting
                needed.
              </p>
            </li>
            <li className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                2
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                Paste the job URL
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600 dark:text-neutral-400">
                We automatically scrape the job posting so you don&apos;t have to
                copy anything manually.
              </p>
            </li>
            <li className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                3
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                AI builds your page
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600 dark:text-neutral-400">
                Claude analyzes your resume against the role and writes a
                tailored, compelling hire-me page.
              </p>
            </li>
            <li className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                4
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                Share your unique link
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600 dark:text-neutral-400">
                Drop{" "}
                <code className="break-all rounded bg-white px-1 py-0.5 text-[0.65rem] text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
                  hireme.page/your-id
                </code>{" "}
                in your application or LinkedIn message.
              </p>
            </li>
            <li className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                5
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                Know when recruiters look
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600 dark:text-neutral-400">
                Get an email notification when someone opens your page.
              </p>
            </li>
          </ol>
        </section>

        <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-0">
          <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
            Why it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/60">
              <p className="text-2xl" aria-hidden>
                ⚡
              </p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Zero friction, instant link
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Sign up once, generate your page in under a minute and share it
                immediately.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/60">
              <p className="text-2xl" aria-hidden>
                🧠
              </p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                AI-powered fit analysis
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Claude reads the job requirements and your background, then
                writes a requirement-by-requirement breakdown of why you&apos;re
                the right hire.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/60 sm:col-span-2 lg:col-span-1">
              <p className="text-2xl" aria-hidden>
                📊
              </p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Smart Tracking
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Track when recruiters view your page, with analytics built for
                real visits — not bot crawlers filling up your numbers.
              </p>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-neutral-100 py-10 dark:border-neutral-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <BrandLogo href="/" height={32} />
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-600">
              <Link href="/login" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Log in
              </Link>
              <Link href="/signup" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Sign up
              </Link>
              <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Privacy Policy
              </Link>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              © {new Date().getFullYear()} hireme.page — All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
