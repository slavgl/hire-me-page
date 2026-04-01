import type { PageRow } from "@/lib/types";
import type { WhyFitStructured } from "@/lib/why-fit-schema";

type Props = {
  page: PageRow;
  whyFit: WhyFitStructured;
};

function paragraphsFromText(text: string) {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function WhyFitPresentation({ page, whyFit }: Props) {
  const bodyParas = paragraphsFromText(whyFit.why_i_am_a_fit);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Why I fit
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-snug text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {whyFit.headline}
        </h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {page.candidate_name} · {page.target_role} at {page.target_company}
        </p>
      </header>

      <div className="space-y-4 text-neutral-800 dark:text-neutral-200">
        {bodyParas.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      <section className="mt-12 border-t border-neutral-200 pt-10 dark:border-neutral-700">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Role fit
        </h2>
        <ul className="space-y-6">
          {whyFit.key_highlights.map((row, i) => (
            <li
              key={`${i}-${row.requirement.slice(0, 24)}`}
              className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-700 dark:bg-neutral-900/50 sm:p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Requirement
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {row.requirement}
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                How I meet it
              </p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                {row.how_i_meet_it}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
