/**
 * pdfjs-dist (via pdf-parse) expects browser globals. Vercel/Node has no DOMMatrix.
 * Must be imported before any pdf-parse / pdfjs-dist load.
 */
import CSSMatrix from "dommatrix";

if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = CSSMatrix as unknown as typeof DOMMatrix;
}
