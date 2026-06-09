/**
 * mcp-md2pdf — Programmatic API
 *
 * Import this module to use the PDF engine as a library:
 *
 *   import { generatePdf, bulkGeneratePdf } from "mcp-md2pdf";
 *
 * All core functionality is re-exported from md2pdf-core.
 */

export {
  generatePdf,
  bulkGeneratePdf,
  markdownToHtml,
  resolveLocalImages,
  preprocessMermaid,
  preprocessMath,
  injectHeadingIds,
  generateTocHtml,
  escapeHtml,
  resolveBrowserExecutable,
  GITHUB_CSS,
  DARK_CSS,
} from "md2pdf-core";

export type {
  GeneratePdfOptions,
  BulkGeneratePdfOptions,
  BulkResult,
  BulkOutput,
  MarginOptions,
} from "md2pdf-core";
