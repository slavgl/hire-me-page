import { BrandLogo } from "@/components/BrandLogo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How hireme.page collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo href="/" height={36} />
          <Link
            href="/"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Last updated: {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="mt-10 space-y-4 text-[15px] leading-relaxed text-neutral-700">
          <p>
            hireme.page (&quot;we&quot;, &quot;us&quot;) operates this website and
            service. This policy describes how we collect, use, and share personal
            information when you use hireme.page.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            Information we collect
          </h2>
          <p className="pt-1">
            <strong className="text-neutral-900">Account data.</strong> When you
            sign up, we process your email address and authentication data through
            our identity provider (Supabase Auth).
          </p>
          <p>
            <strong className="text-neutral-900">Application content.</strong>{" "}
            You may upload a resume (PDF), provide a job posting URL, and we
            store derived text and structured data used to build your public page.
          </p>
          <p>
            <strong className="text-neutral-900">Analytics and views.</strong>{" "}
            When someone visits your published page, we may record the time of
            the visit, approximate location (e.g. country or city when available
            from our hosting provider), IP address, browser type, referrer, and
            whether the visitor appears to be you (e.g. when you are signed in).
            This helps you understand interest in your page.
          </p>
          <p>
            <strong className="text-neutral-900">Email notifications.</strong>{" "}
            If enabled, we may send you email about activity on your pages (for
            example, when someone views your page), using the address associated
            with your account.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            How we use information
          </h2>
          <p>We use the information above to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Provide, operate, and secure the service</li>
            <li>Generate and display your hire-me page and related content</li>
            <li>Show analytics and optional notifications to you</li>
            <li>Communicate with you about the service</li>
            <li>Comply with law and protect rights and safety</li>
          </ul>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            AI processing
          </h2>
          <p>
            We may send portions of your resume text and job-related content to
            third-party AI providers (for example Anthropic) solely to generate
            features you request, such as structured resume data and
            role-specific &quot;why I fit&quot; content. Do not upload information
            you are not allowed to share with such providers.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            Service providers
          </h2>
          <p>
            We rely on vendors that process data on our behalf, including
            hosting/infrastructure (for example Vercel), database and auth
            (Supabase), email delivery (for example Resend), and AI as described
            above. Their use of data is governed by their terms and our
            agreements with them.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            Cookies and similar technologies
          </h2>
          <p>
            We use cookies and similar technologies as needed for session
            management (keeping you signed in) and for core site functionality.
            Public pages may use lightweight client requests to record analytics
            events as described above.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            Retention and deletion
          </h2>
          <p>
            We retain information as long as your account exists and as needed to
            provide the service. You may delete pages or your account subject to
            features we offer in the product; residual backups may persist for a
            limited period.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            Your choices
          </h2>
          <p>
            Depending on where you live, you may have rights to access, correct,
            or delete personal information, or to object to or restrict certain
            processing. Contact us to make a request. We may need to verify your
            identity before responding.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            Changes
          </h2>
          <p>
            We may update this policy from time to time. We will post the updated
            version on this page and adjust the &quot;Last updated&quot; date.
          </p>

          <h2 className="mt-10 text-xl font-semibold text-neutral-900">
            Contact
          </h2>
          <p>
            For privacy questions, contact us through the channels listed on the
            site or at the support email for hireme.page.
          </p>
        </div>

        <p className="mt-12 text-sm text-neutral-500">
          <Link href="/" className="font-medium text-neutral-700 hover:text-neutral-900">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
