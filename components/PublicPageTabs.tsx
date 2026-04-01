"use client";

import { ResumePresentation } from "@/components/resume-themes/ResumePresentation";
import { WhyFitPresentation } from "@/components/WhyFitPresentation";
import type { PageRow, ResumeStructured } from "@/lib/types";
import type { WhyFitStructured } from "@/lib/why-fit-schema";
import { useState } from "react";

type Props = {
  page: PageRow;
  structured: ResumeStructured | null;
  whyFit: WhyFitStructured | null;
};

export function PublicPageTabs({ page, structured, whyFit }: Props) {
  const [tab, setTab] = useState<"resume" | "why">("resume");

  if (!whyFit) {
    return <ResumePresentation page={page} structured={structured} />;
  }

  return (
    <div>
      <div
        className="mx-auto flex max-w-3xl justify-center gap-1 px-4 pt-4 sm:px-6"
        role="tablist"
        aria-label="Page sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "resume"}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "resume"
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          }`}
          onClick={() => setTab("resume")}
        >
          Resume
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "why"}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "why"
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          }`}
          onClick={() => setTab("why")}
        >
          Why I fit
        </button>
      </div>

      {tab === "resume" ? (
        <ResumePresentation page={page} structured={structured} />
      ) : (
        <WhyFitPresentation page={page} whyFit={whyFit} />
      )}
    </div>
  );
}
