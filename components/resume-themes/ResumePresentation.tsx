import type { PageRow, ResumeStructured } from "@/lib/types";
import { DEFAULT_PAGE_THEME, type PageTheme } from "@/lib/themes";
import { Fraunces, Outfit, Source_Sans_3, Syne } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-editorial-display",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-editorial-body",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-bold-display",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-bold-body",
});

type Props = {
  page: PageRow;
  structured: ResumeStructured | null;
  theme?: PageTheme;
};

export function ResumePresentation({ page, structured, theme }: Props) {
  const t = theme ?? page.theme ?? DEFAULT_PAGE_THEME;
  if (t === "editorial") {
    return (
      <div
        className={`${fraunces.variable} ${sourceSans.variable} font-[family-name:var(--font-editorial-body)]`}
      >
        <EditorialLayout page={page} structured={structured} />
      </div>
    );
  }
  if (t === "bold") {
    return (
      <div
        className={`${syne.variable} ${outfit.variable} font-[family-name:var(--font-bold-body)]`}
      >
        <BoldLayout page={page} structured={structured} />
      </div>
    );
  }
  return <MinimalLayout page={page} structured={structured} />;
}

function MinimalLayout({
  page,
  structured,
}: {
  page: PageRow;
  structured: ResumeStructured | null;
}) {
  const raw = structured?.rawSections;
  const useRawOnly = raw && raw.length > 1;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
          {page.candidate_name}
        </h1>
        <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
          Application for {page.target_role} at {page.target_company}
        </p>
      </header>
      <ResumeBody
        page={page}
        structured={structured}
        useRawOnly={!!useRawOnly}
        sectionTitleClass="mb-3 border-b border-neutral-200 pb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
        bodyClass="text-neutral-800 dark:text-neutral-200"
      />
    </article>
  );
}

function EditorialLayout({
  page,
  structured,
}: {
  page: PageRow;
  structured: ResumeStructured | null;
}) {
  const raw = structured?.rawSections;
  const useRawOnly = raw && raw.length > 1;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-8 sm:py-20">
      <header className="mb-14 border-b border-neutral-200 pb-10 dark:border-neutral-700">
        <h1
          className="font-[family-name:var(--font-editorial-display)] text-4xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl"
        >
          {page.candidate_name}
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Application for{" "}
          <span className="text-neutral-900 dark:text-neutral-100">
            {page.target_role}
          </span>{" "}
          at{" "}
          <span className="italic text-neutral-800 dark:text-neutral-300">
            {page.target_company}
          </span>
        </p>
      </header>
      <ResumeBody
        page={page}
        structured={structured}
        useRawOnly={!!useRawOnly}
        sectionTitleClass="mb-4 font-[family-name:var(--font-editorial-display)] text-xl font-medium text-neutral-900 dark:text-neutral-100"
        bodyClass="text-neutral-800 leading-relaxed dark:text-neutral-200"
      />
    </article>
  );
}

function BoldLayout({
  page,
  structured,
}: {
  page: PageRow;
  structured: ResumeStructured | null;
}) {
  const raw = structured?.rawSections;
  const useRawOnly = raw && raw.length > 1;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-12 rounded-2xl bg-neutral-900 px-6 py-10 text-center text-white sm:px-10 dark:bg-neutral-800">
        <h1
          className="font-[family-name:var(--font-bold-display)] text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          {page.candidate_name}
        </h1>
        <p className="mt-3 text-base text-neutral-300">
          {page.target_role} · {page.target_company}
        </p>
      </header>
      <ResumeBody
        page={page}
        structured={structured}
        useRawOnly={!!useRawOnly}
        sectionTitleClass="mb-3 text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100"
        bodyClass="text-neutral-800 dark:text-neutral-200"
      />
    </article>
  );
}

function ResumeBody({
  page,
  structured,
  useRawOnly,
  sectionTitleClass,
  bodyClass,
}: {
  page: PageRow;
  structured: ResumeStructured | null;
  useRawOnly: boolean;
  sectionTitleClass: string;
  bodyClass: string;
}) {
  const raw = structured?.rawSections;

  if (useRawOnly && raw) {
    return (
      <>
        {raw.map((s, i) => (
          <section key={i} className="mb-10">
            <h2 className={sectionTitleClass}>{s.title}</h2>
            <div className={bodyClass}>
              <p className="whitespace-pre-wrap leading-relaxed">{s.body}</p>
            </div>
          </section>
        ))}
      </>
    );
  }

  if (structured) {
    return (
      <>
        {structured.summary ? (
          <section className="mb-10">
            <h2 className={sectionTitleClass}>Summary</h2>
            <div className={bodyClass}>
              <p className="whitespace-pre-wrap leading-relaxed">
                {structured.summary}
              </p>
            </div>
          </section>
        ) : null}
        {structured.experience && structured.experience.length > 0 ? (
          <section className="mb-10">
            <h2 className={sectionTitleClass}>Experience</h2>
            <div className={`space-y-8 ${bodyClass}`}>
              {structured.experience.map((job, ji) => (
                <div key={ji}>
                  {(job.title || job.company || job.period) && (
                    <div className="mb-2">
                      {job.title ? (
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {job.title}
                          {job.company ? (
                            <span className="font-normal text-neutral-600 dark:text-neutral-400">
                              {" "}
                              · {job.company}
                            </span>
                          ) : null}
                        </p>
                      ) : job.company ? (
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {job.company}
                        </p>
                      ) : null}
                      {job.period ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {job.period}
                        </p>
                      ) : null}
                    </div>
                  )}
                  {job.bullets.length > 0 ? (
                    <ul className="list-disc space-y-1.5 pl-5 leading-relaxed">
                      {job.bullets.map((b, bi) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {structured.skills && structured.skills.length > 0 ? (
          <section className="mb-10">
            <h2 className={sectionTitleClass}>Skills</h2>
            <div className={bodyClass}>
              <p className="leading-relaxed">
                {structured.skills.join(" · ")}
              </p>
            </div>
          </section>
        ) : null}
        {structured.education && structured.education.length > 0 ? (
          <section className="mb-10">
            <h2 className={sectionTitleClass}>Education</h2>
            <ul className={`list-disc space-y-2 pl-5 leading-relaxed ${bodyClass}`}>
              {structured.education.map((ed, i) => (
                <li key={i}>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {ed.institution}
                  </span>
                  {ed.detail ? (
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {" "}
                      — {ed.detail}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {raw && raw.length === 1 ? (
          <section className="mb-10">
            <h2 className={sectionTitleClass}>{raw[0]!.title}</h2>
            <div className={bodyClass}>
              <p className="whitespace-pre-wrap leading-relaxed">
                {raw[0]!.body}
              </p>
            </div>
          </section>
        ) : null}
      </>
    );
  }

  return (
    <section className="mb-10">
      <h2 className={sectionTitleClass}>Resume</h2>
      <div className={bodyClass}>
        <p className="whitespace-pre-wrap leading-relaxed">
          {page.resume_text}
        </p>
      </div>
    </section>
  );
}
