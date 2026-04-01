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
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {page.candidate_name} · {page.target_role} at {page.target_company}
      </p>

      <p className="mt-4 text-left text-base font-normal leading-relaxed text-neutral-800 dark:text-neutral-200">
        {whyFit.headline}
      </p>

      <h2 className="mt-10 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Why I fit
      </h2>
      <div className="mt-4 space-y-4 text-left text-base font-normal leading-relaxed text-neutral-800 dark:text-neutral-200">
        {bodyParas.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Role Fit
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full min-w-[min(100%,36rem)] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/60">
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100"
              >
                Requirement
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100"
              >
                How I meet it
              </th>
            </tr>
          </thead>
          <tbody>
            {whyFit.key_highlights.map((row, i) => (
              <tr
                key={`${i}-${row.requirement.slice(0, 24)}`}
                className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800"
              >
                <td className="align-top px-4 py-3 text-neutral-900 dark:text-neutral-100">
                  {row.requirement}
                </td>
                <td className="align-top px-4 py-3 text-neutral-700 dark:text-neutral-300">
                  {row.how_i_meet_it}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
