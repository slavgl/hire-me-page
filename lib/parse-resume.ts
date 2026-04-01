import type { ResumeStructured } from "@/lib/types";

async function getPDFParseCtor() {
  const { initPdfJsForNode } = await import("@/lib/polyfills/pdfjs-node");
  await initPdfJsForNode();
  const { PDFParse } = await import("pdf-parse");
  return PDFParse;
}

function isLetterCodePoint(cp: number): boolean {
  if (cp >= 0x41 && cp <= 0x5a) return true;
  if (cp >= 0x61 && cp <= 0x7a) return true;
  if (cp >= 0xc0 && cp <= 0xd6) return true;
  if (cp >= 0xd8 && cp <= 0xf6) return true;
  if (cp >= 0xf8 && cp <= 0xff) return true;
  if (cp >= 0x100 && cp <= 0x17f) return true;
  if (cp >= 0x180 && cp <= 0x24f) return true;
  if (cp >= 0x1e00 && cp <= 0x1eff) return true;
  if (cp >= 0x370 && cp <= 0x3ff) return true;
  if (cp >= 0x400 && cp <= 0x4ff) return true;
  return false;
}

/** Letter-only runs from a line (no digits/punctuation); splits on non-letters. */
function letterWordsFromLine(line: string): string[] {
  const words: string[] = [];
  let buf = "";
  for (const ch of line) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    if (isLetterCodePoint(cp)) {
      buf += ch;
    } else if (buf.length > 0) {
      words.push(buf);
      buf = "";
    }
  }
  if (buf.length > 0) words.push(buf);
  return words;
}

/**
 * First line of the resume, keeping only letter runs (drops digits/symbols),
 * up to four words, title-cased (first letter of each word uppercase, rest lowercase).
 */
function firstLineName(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] ?? "";
  const letterWords = letterWordsFromLine(firstLine).slice(0, 4);
  if (letterWords.length === 0) return "Candidate";
  return letterWords
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function heuristicStructure(text: string): ResumeStructured {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const lowerBlocks = text.toLowerCase();
  const structured: ResumeStructured = {};

  const expIdx = lowerBlocks.search(
    /\b(experience|employment|work history|professional experience)\b/i,
  );
  const sumIdx = lowerBlocks.search(
    /\b(summary|objective|profile|about)\b/i,
  );

  if (sumIdx >= 0) {
    const slice = text.slice(sumIdx, expIdx > sumIdx ? expIdx : sumIdx + 800);
    structured.summary = slice.replace(/^[^\n]*\n/, "").trim().slice(0, 4000);
  }

  const sections: { title: string; body: string }[] = [];
  let currentTitle = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    const isHeader =
      line.length < 80 &&
      (line === line.toUpperCase() ||
        /^(experience|education|skills|summary|objective|projects|certifications)/i.test(
          line,
        ));

    if (isHeader && line.length < 60) {
      if (currentTitle || currentBody.length) {
        sections.push({
          title: currentTitle || "Section",
          body: currentBody.join("\n").trim(),
        });
      }
      currentTitle = line;
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentTitle || currentBody.length) {
    sections.push({
      title: currentTitle || "Section",
      body: currentBody.join("\n").trim(),
    });
  }

  if (sections.length > 0) {
    structured.rawSections = sections.slice(0, 20);
  }

  const expLines: string[] = [];
  const skillLines: string[] = [];
  const eduLines: string[] = [];
  let mode: "exp" | "skills" | "edu" | null = null;

  for (const line of lines) {
    const l = line.toLowerCase();
    if (/experience|employment|work history/.test(l)) {
      mode = "exp";
      continue;
    }
    if (/^skills|^technical/.test(l)) {
      mode = "skills";
      continue;
    }
    if (/education|academic/.test(l)) {
      mode = "edu";
      continue;
    }
    if (!line || line.length > 200) continue;
    if (mode === "exp") expLines.push(line);
    if (mode === "skills") skillLines.push(line);
    if (mode === "edu") eduLines.push(line);
  }

  if (expLines.length) {
    structured.experience = [{ bullets: expLines.slice(0, 40) }];
  }
  if (skillLines.length) {
    const joined = skillLines.join(" ");
    structured.skills = joined
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
  }
  if (eduLines.length) {
    structured.education = eduLines
      .slice(0, 20)
      .map((line) => ({ institution: line }));
  }

  return structured;
}

export async function parseResumePdf(buffer: Buffer): Promise<{
  text: string;
  structured: ResumeStructured;
  candidateName: string;
}> {
  const PDFParse = await getPDFParseCtor();
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  const text = (data.text || "").replace(/\f/g, "\n").trim();
  const candidateName = firstLineName(text || "Candidate");
  const structured =
    text.length > 0 ? heuristicStructure(text) : { rawSections: [] };

  const hasContent =
    (structured.summary && structured.summary.length > 20) ||
    (structured.experience && structured.experience.length > 0) ||
    (structured.rawSections && structured.rawSections.length > 1);

  if (!hasContent && text.length > 0) {
    return {
      text,
      structured: { rawSections: [{ title: "Resume", body: text }] },
      candidateName,
    };
  }

  return { text: text || " ", structured, candidateName };
}
