import { ResumeUploader } from "@/components/ResumeUploader";
import Link from "next/link";

export default function NewPageStep1() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-neutral-900">
        Create a page
      </h1>
      <p className="mt-2 text-neutral-600">
        Select / upload your resume and paste the job posting link.
      </p>
      <div className="mt-8">
        <ResumeUploader />
      </div>
    </div>
  );
}
