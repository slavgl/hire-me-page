import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import { assertUrlSafeForServerFetch } from "@/lib/scraping/url-safe";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36";

const MAX_HTML_BYTES = 2_500_000;
const MIN_JOB_CHARS = 200;

const JOB_LIKE_PHRASES =
  /\b(responsibilities|requirements|qualifications|experience|about the role|what you(?:'ll)? do|what we(?:'ll)? offer|apply|benefits|skills|description|overview|the role|you will|you have)\b/gi;

const BOILERPLATE_PHRASES =
  /\b(equal opportunity|privacy policy|terms of use|cookie policy|accommodations? (?:request|accessibility)|applicant privacy|diversity,? equity|we are an equal)\b/gi;

export type FetchJobResult =
  | {
      ok: true;
      descriptionText: string;
      url: string;
      /** Derived from page title / headings and URL (see prompt-iteration-tool job_scraper). */
      companyName: string;
      roleTitle: string;
    }
  | { ok: false; error: string };

const LABEL_MAX = 240;

function sanitizeLabel(s: string, maxLen: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1).trimEnd() + "…";
}

function titleCaseWords(s: string): string {
  return s
    .split(/[-\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function inferCompanyFromUrl(u: URL): string {
  try {
    const host = (u.hostname || "").toLowerCase().trim();
    const path = (u.pathname || "").replace(/^\/+|\/+$/g, "");
    const pathParts = path
      .split("/")
      .filter(
        (p) =>
          p && !["jobs", "job", "positions", "careers", "listing"].includes(p),
      );
    if (!host) return "";

    if (host.includes("lever.co") && pathParts.length > 0) {
      return sanitizeLabel(titleCaseWords(pathParts[0]!.replace(/-/g, " ")), LABEL_MAX);
    }
    if (host.includes("greenhouse.io") && pathParts.length > 0) {
      return sanitizeLabel(titleCaseWords(pathParts[0]!.replace(/-/g, " ")), LABEL_MAX);
    }

    let name: string;
    if (host.startsWith("careers.")) {
      name = host.replace(/^careers\./, "").split(".")[0] ?? "";
    } else if (host.includes(".careers")) {
      const parts = host.split(".careers")[0]?.split(".") ?? [];
      name = parts[parts.length - 1] ?? "";
    } else {
      name = host.split(".")[0] ?? "";
    }

    if (["www", "jobs", "job", "careers", "recruit", "apply"].includes(name)) {
      const parts = host.split(".");
      if (parts.length >= 2) {
        const mid = parts[parts.length - 2];
        if (mid && !["com", "co", "io"].includes(mid)) name = mid;
      }
    }

    if (!name || name.length < 2) return "";
    return sanitizeLabel(titleCaseWords(name.replace(/-/g, " ")), LABEL_MAX);
  } catch {
    return "";
  }
}

function inferCompanyAndRole($: CheerioAPI): { company: string; role: string } {
  const titleText = $("title").first().text().trim() || "";
  const h1Text = $("h1").first().text().trim() || "";
  const combined = h1Text || titleText;
  const seps = ["\u2013", "\u2014", "-", "|", "·"];
  for (const sep of seps) {
    if (combined.includes(sep)) {
      const idx = combined.indexOf(sep);
      const left = combined.slice(0, idx).trim();
      const right = combined.slice(idx + sep.length).trim();
      const role = left;
      const company = right;
      return {
        company: sanitizeLabel(company, LABEL_MAX),
        role: sanitizeLabel(role, LABEL_MAX),
      };
    }
  }
  return {
    company: "",
    role: sanitizeLabel(combined, LABEL_MAX),
  };
}

function deriveCompanyAndRole(
  $: CheerioAPI,
  safeUrl: URL,
): { companyName: string; roleTitle: string } {
  const inferred = inferCompanyAndRole($);
  let companyName = inferred.company;
  let roleTitle = inferred.role;

  if (!companyName) {
    companyName = inferCompanyFromUrl(safeUrl);
  }

  if (!roleTitle) {
    roleTitle = sanitizeLabel(
      $("title").first().text().trim() || "Job posting",
      LABEL_MAX,
    );
  }

  if (!companyName) {
    companyName = sanitizeLabel(
      safeUrl.hostname.replace(/^www\./, "") || "Company",
      LABEL_MAX,
    );
  }

  if (!roleTitle) {
    roleTitle = "Job posting";
  }

  return { companyName, roleTitle };
}

function reflowExtractedText(text: string): string {
  if (!text) return "";
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = [];
  let blankRun = 0;
  for (const line of lines) {
    const t = line.trimEnd();
    if (t.trim() === "") {
      blankRun += 1;
      if (blankRun <= 2) out.push("");
    } else {
      blankRun = 0;
      out.push(t);
    }
  }
  return out.join("\n").trim();
}

function jobContentScore(text: string): number {
  if (!text || text.length < 100) return 0;
  const lower = text.toLowerCase();
  const jobHits = (lower.match(JOB_LIKE_PHRASES) ?? []).length;
  const boilerHits = (lower.match(BOILERPLATE_PHRASES) ?? []).length;
  const lengthOk =
    text.length >= 200 && text.length <= 60_000
      ? 1
      : text.length < 200
        ? 0.5
        : 0.7;
  return jobHits * 2 - boilerHits * 1.5 + lengthOk;
}

function stripCommonBoilerplate(text: string): string {
  if (!text || text.length < 500) return text;
  const lower = text.toLowerCase();
  const phrases = [
    "equal opportunity",
    "accommodations",
    "applicant privacy",
    "privacy policy",
    "terms of use",
    "cookie policy",
    "we are an equal",
    "diversity, equity and inclusion",
  ];
  for (const phrase of phrases) {
    const idx = lower.indexOf(phrase);
    if (idx > text.length * 0.3) {
      const before = text.slice(0, idx).trimEnd();
      if (before.length > 400) return before;
    }
  }
  return text;
}

function extractNextJsStreamedDescription(rawHtml: string): string {
  const $ = cheerio.load(rawHtml);
  const chunks: string[] = [];
  $("script").each((_, el) => {
    const text = $(el).html() ?? "";
    if (!text.includes("__next_f.push")) return;

    let i = 0;
    while (i < text.length) {
      const start = text.indexOf('__next_f.push([1,"', i);
      if (start === -1) break;
      let pos = start + '__next_f.push([1,"'.length;
      const result: string[] = [];
      while (pos < text.length) {
        if (text[pos] === "\\" && pos + 1 < text.length) {
          if (text[pos + 1] === "u" && pos + 5 < text.length) {
            try {
              const code = parseInt(text.slice(pos + 2, pos + 6), 16);
              if (!Number.isNaN(code)) {
                result.push(String.fromCharCode(code));
                pos += 6;
                continue;
              }
            } catch {
              /* fallthrough */
            }
          }
          result.push(text[pos + 1]!);
          pos += 2;
          continue;
        }
        if (text[pos] === '"') break;
        result.push(text[pos]!);
        pos += 1;
      }
      const htmlFragment = result.join("");
      const stripped = htmlFragment.trim();
      if (
        stripped.length > 80 &&
        (stripped.startsWith("<") ||
          (stripped.includes("<div") && stripped.includes("<p>")) ||
          (stripped.includes("class=") && stripped.toLowerCase().includes("content")))
      ) {
        chunks.push(htmlFragment);
      }
      i = pos + 1;
    }
  });

  if (chunks.length === 0) return "";
  const combined = chunks.join("");
  const sub = cheerio.load(combined);
  return sub.root().text().replace(/\s+/g, " ").trim();
}

function extractByCommonSelectors($: CheerioAPI): string {
  const selectors = [
    "[role='main']",
    "main",
    "article",
    ".job-description",
    ".job-content",
    ".job-details",
    ".job-body",
    ".position-description",
    ".role-description",
    ".posting-description",
    ".posting-content",
    ".job-posting",
    ".job-summary",
    ".position-summary",
    "#job-description",
    ".careers-content",
    ".job-full-description",
    ".job-detail",
    ".position-detail",
    ".description-content",
    ".job_info",
    ".job-info",
    "[data-qa='job-description']",
    ".content-intro",
  ];
  for (const sel of selectors) {
    try {
      const els = $(sel);
      for (const el of els.toArray()) {
        const tag = "tagName" in el ? String(el.tagName).toLowerCase() : "";
        if (/^(script|style|nav|header|footer)$/.test(tag)) continue;
        const t = $(el).text();
        if (t && t.length >= 300 && t.length <= 100_000) return t;
      }
    } catch {
      /* continue */
    }
  }
  return "";
}

function extractLinkedInDescription($: CheerioAPI): string {
  const parts: string[] = [];
  $(".description__text, .show-more-less-html__markup").each((_, el) => {
    parts.push($(el).text());
  });
  return parts.filter(Boolean).join("\n\n").trim();
}

function extractGreenhouseDescription($: CheerioAPI): string {
  const container = $(".content, .main, .application, .job").first();
  if (!container.length) return "";
  return container.text();
}

function extractLeverDescription($: CheerioAPI): string {
  const container = $(".section-wrapper, .posting-description").first();
  if (!container.length) return "";
  return container.text();
}

function extractBestTextBlock($: CheerioAPI): string {
  const candidates: { text: string; score: number }[] = [];
  $("div, section, article, main").each((_, tag) => {
    const $tag = $(tag);
    if ($tag.find("nav").length || $tag.find("footer").length) return;
    const t = $tag.text();
    if (t.length >= 500 && t.length <= 80_000) {
      candidates.push({ text: t, score: jobContentScore(t) });
    }
  });
  if (candidates.length === 0) {
    let bestText = "";
    $("div, section, article, main").each((_, tag) => {
      const t = $(tag).text();
      if (t.length > bestText.length && t.length >= 200 && t.length <= 100_000) {
        bestText = t;
      }
    });
    return bestText;
  }
  candidates.sort((a, b) => b.score - a.score || b.text.length - a.text.length);
  return candidates[0]!.text;
}

/**
 * Fetch a job posting URL and extract the best job-description text (ported from prompt-iteration-tool).
 */
export async function fetchJobPostingDescription(
  rawUrl: string,
): Promise<FetchJobResult> {
  let safeUrl: URL;
  try {
    safeUrl = await assertUrlSafeForServerFetch(rawUrl);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Invalid URL.";
    return { ok: false, error: msg };
  }

  let html: string;
  try {
    const res = await fetch(safeUrl.toString(), {
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      return {
        ok: false,
        error: `Could not load job page (HTTP ${res.status}).`,
      };
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) {
      return { ok: false, error: "Job page is too large to process." };
    }
    html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Failed to fetch job posting: ${msg}` };
  }

  const $ = cheerio.load(html);

  const candidates: { text: string; score: number }[] = [];

  const nextJs = extractNextJsStreamedDescription(html);
  if (nextJs.length > 200) {
    candidates.push({ text: nextJs, score: jobContentScore(nextJs) });
  }

  const bySelectors = extractByCommonSelectors($);
  if (bySelectors.length > 200) {
    candidates.push({ text: bySelectors, score: jobContentScore(bySelectors) });
  }

  const li = extractLinkedInDescription($);
  if (li.length > 200) {
    candidates.push({ text: li, score: jobContentScore(li) });
  }

  const gh = extractGreenhouseDescription($);
  if (gh.length > 200) {
    candidates.push({ text: gh, score: jobContentScore(gh) });
  }

  const lev = extractLeverDescription($);
  if (lev.length > 200) {
    candidates.push({ text: lev, score: jobContentScore(lev) });
  }

  const fallback = extractBestTextBlock($);
  if (fallback.length > 200) {
    candidates.push({ text: fallback, score: jobContentScore(fallback) });
  }

  if (candidates.length === 0) {
    return {
      ok: false,
      error:
        "Could not extract a job description from this page. Try a direct link to the posting.",
    };
  }

  candidates.sort((a, b) => b.score - a.score || b.text.length - a.text.length);
  let text = candidates[0]!.text;
  text = stripCommonBoilerplate(text);
  const descriptionText = reflowExtractedText(text);

  if (descriptionText.length < MIN_JOB_CHARS) {
    return {
      ok: false,
      error:
        "Job description appears too short after scraping. Try another URL.",
    };
  }

  const { companyName, roleTitle } = deriveCompanyAndRole($, safeUrl);

  return {
    ok: true,
    descriptionText,
    url: safeUrl.toString(),
    companyName,
    roleTitle,
  };
}
