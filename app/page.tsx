import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <BrandLogo href="/" height={40} />
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/login"
            className="text-neutral-600 hover:text-neutral-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-800"
          >
            Get early access
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl sm:leading-tight">
            Stand out from every
            <br />
            other applicant.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 sm:text-xl">
            Upload your resume, paste a job URL — get a shareable page that shows
            exactly why you&apos;re the right fit for the role.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex rounded-lg bg-neutral-900 px-6 py-3 text-base font-medium text-white hover:bg-neutral-800"
          >
            Get early access
          </Link>
          <p className="mt-3 text-sm text-neutral-500">
            Free during beta · No credit card required
          </p>
        </div>

        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            How it works
          </h2>
          <ol className="mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:snap-none lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
            <li className="min-w-[min(100%,17.5rem)] shrink-0 snap-start rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                1
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900">
                Upload your resume
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600">
                Drop your PDF or .docx. We extract the content — no reformatting
                needed.
              </p>
            </li>
            <li className="min-w-[min(100%,17.5rem)] shrink-0 snap-start rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                2
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900">
                Paste the job URL
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600">
                We automatically scrape the job posting so you don&apos;t have to
                copy anything manually.
              </p>
            </li>
            <li className="min-w-[min(100%,17.5rem)] shrink-0 snap-start rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                3
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900">
                AI builds your page
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600">
                Claude analyzes your resume against the role and writes a
                tailored, compelling hire-me page.
              </p>
            </li>
            <li className="min-w-[min(100%,17.5rem)] shrink-0 snap-start rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                4
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900">
                Share your unique link
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600">
                Drop{" "}
                <code className="break-all rounded bg-white px-1 py-0.5 text-[0.65rem] text-neutral-800 ring-1 ring-neutral-200">
                  hireme.page/your-id
                </code>{" "}
                in your application or LinkedIn message.
              </p>
            </li>
            <li className="min-w-[min(100%,17.5rem)] shrink-0 snap-start rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                5
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-neutral-900">
                Know when recruiters look
              </h3>
              <p className="mt-2 text-xs leading-snug text-neutral-600">
                Get an email notification when someone opens your page.
              </p>
            </li>
          </ol>
        </section>

        <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-0">
          <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Why it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-2xl" aria-hidden>
                ⚡
              </p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                Zero friction, instant link
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Sign up once, generate your page in under a minute and share it
                immediately.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-2xl" aria-hidden>
                🧠
              </p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                AI-powered fit analysis
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Claude reads the job requirements and your background, then
                writes a requirement-by-requirement breakdown of why you&apos;re
                the right hire.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-2xl" aria-hidden>
                📊
              </p>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                Smart Tracking
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Track when recruiters view your page, with analytics built for
                real visits — not bot crawlers filling up your numbers.
              </p>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-neutral-100 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <BrandLogo href="/" height={32} />
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-600">
              <Link href="/login" className="hover:text-neutral-900">
                Log in
              </Link>
              <Link href="/signup" className="hover:text-neutral-900">
                Sign up
              </Link>
              <Link href="/privacy" className="hover:text-neutral-900">
                Privacy Policy
              </Link>
            </div>
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} hireme.page — All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
