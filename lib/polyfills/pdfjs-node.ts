/**
 * pdfjs-dist (via pdf-parse) needs browser globals and a resolvable worker file on Node/Vercel.
 * Import order matters: globals and workerSrc must be set before `pdf-parse` loads pdf.mjs.
 */
import CSSMatrix from "dommatrix";
import path from "node:path";
import { pathToFileURL } from "node:url";

let initialized = false;

export async function initPdfJsForNode(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (typeof globalThis.DOMMatrix === "undefined") {
    globalThis.DOMMatrix = CSSMatrix as unknown as typeof DOMMatrix;
  }
  if (typeof globalThis.Path2D === "undefined") {
    globalThis.Path2D = class Path2D {} as unknown as typeof Path2D;
  }
  if (typeof globalThis.ImageData === "undefined") {
    globalThis.ImageData = class ImageData {
      data = new Uint8ClampedArray(0);

      width = 0;

      height = 0;
    } as unknown as typeof ImageData;
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  );
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
}
