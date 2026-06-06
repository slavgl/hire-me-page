import { WhyFitEditor } from "@/components/WhyFitEditor";
import { createClient } from "@/lib/supabase/server";
import { parseWhyFitStructured } from "@/lib/why-fit-schema";
import type { PageRow } from "@/lib/types";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: { pageId: string } };

export default async function EditWhyFitPage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", params.pageId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!page) {
    notFound();
  }

  const row = page as PageRow;
  const backHref = `/dashboard/${row.id}`;
  const whyFit = parseWhyFitStructured(row.why_fit_structured);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href={backHref}
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Back
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Edit &ldquo;Why I fit&rdquo;
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {row.target_role} at {row.target_company}
        {row.is_published && (
          <span className="ml-2 text-amber-700 dark:text-amber-400">
            · Live — changes are visible to recruiters immediately
          </span>
        )}
      </p>

      <div className="mt-8">
        {whyFit ? (
          <WhyFitEditor pageId={row.id} initial={whyFit} backHref={backHref} />
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No &ldquo;Why I fit&rdquo; content exists yet for this page.
            </p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
              Go back and use &ldquo;Regenerate AI sections&rdquo; to generate it first.
            </p>
            <Link
              href={backHref}
              className="mt-4 inline-block text-sm font-medium text-neutral-900 underline dark:text-neutral-100"
            >
              ← Back to page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
