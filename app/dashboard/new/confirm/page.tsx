import { ConfirmSlugForm } from "@/components/ConfirmSlugForm";
import { suggestSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  searchParams: { draftId?: string };
};

export default async function ConfirmSlugPage({ searchParams }: Props) {
  const draftId = searchParams.draftId;
  if (!draftId) {
    redirect("/dashboard/new");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: page } = await supabase
    .from("pages")
    .select("id, is_published, candidate_name, target_company")
    .eq("id", draftId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!page) {
    redirect("/dashboard/new");
  }

  if (page.is_published) {
    redirect(`/dashboard/${page.id}`);
  }

  const first = page.candidate_name.split(/\s+/)[0] ?? page.candidate_name;
  const suggestedSlug = suggestSlug(first, page.target_company);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/dashboard/new"
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        ← Back
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-neutral-900">
        Choose your link
      </h1>
      <p className="mt-2 text-neutral-600">
        Confirm the URL for your page. You can edit the slug only; company and role
        stay as you entered.
      </p>
      <div className="mt-8">
        <ConfirmSlugForm pageId={page.id} suggestedSlug={suggestedSlug} />
      </div>
    </div>
  );
}
