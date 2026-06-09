# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-06-09

### Added
- **Programmatic API**: import `mcp-md2pdf` as a library (`generatePdf`, `bulkGeneratePdf`, `markdownToHtml`, etc.).
- New `exports` field in `package.json` with `"."` (library) and `"./server"` (MCP server) subpaths.
- New `src/lib.ts` clean library entry point — no side effects on import.
- TypeScript declaration files (`*.d.ts`) generated for all modules.

### Changed
- `bin` entry moved from `dist/index.js` to `dist/mcp-server.js`.
- `src/index.ts` is now the library entry point (re-exports from `lib.ts`).
- `src/mcp-server.ts` is the dedicated MCP server / CLI entry point.

### Fixed
- `require.resolve` in ESM context replaced with `createRequire(import.meta.url)`.
- Default page-number footer now always renders (was never shown when no custom header/footer was provided).
- Jest worker leak resolved by separating library entry from MCP server startup.

## [1.2.3] - 2026-06-09

### Fixed
- `require.resolve` ESM compatibility fix.
- Footer template rendering fix.

## [1.2.2] - 2026-06-08

### Fixed
- Build artifacts and distribution cleanup.

## [1.2.1] - 2026-06-08

### Fixed
- `bulkGeneratePdf` now returns `{ outputDir, results }` so callers get the correct root output folder.
- CLI bulk output message now prints the actual output directory instead of a nested file path.
- Default bulk output directory changed from `tmpdir()` to `process.cwd()` for better discoverability.

## [1.2.0] - 2026-06-08

### Added
- **Bulk conversion**: `bulk_generate_pdf` tool and `--bulk <dir>` CLI flag.
- Recursively scans directories for `.md` files and converts them all to PDFs.
- Output folder prefixed with `md2pdf-` (e.g. `md2pdf-1717861234567/`).
- Preserves directory structure in output.
- Per-file success/error reporting.

### Changed
- Refactored monolithic source into modular files:
  - `src/types.ts` — shared interfaces
  - `src/browser.ts` — browser auto-detection
  - `src/css.ts` — theme stylesheets
  - `src/markdown.ts` — markdown preprocessing (mermaid, math, TOC, images)
  - `src/pdf-engine.ts` — core `generatePdf` + `bulkGeneratePdf`
  - `src/http-server.ts` — HTTP transport
  - `src/cli.ts` — CLI parsing and execution
  - `src/index.ts` — MCP stdio server entry point

## [1.1.0] - 2026-06-08

### Added
- HTTP/SSE transport support via `--http` flag.
- Standalone CLI mode: `mcp-md2pdf input.md output.pdf`.
- Offline Mermaid diagram rendering (no CDN required).
- KaTeX math rendering for inline `$...$` and block `$$...$$` math.
- Header/footer templates with automatic page numbers.
- Local image resolution via `baseDir` option.
- Custom CSS injection via `customCss` option.
- System font stack with emoji support.
- Jest test suite (13 tests).
- GitHub Actions CI workflow.

## [1.0.0] - 2026-06-08

### Added
- Initial release with MCP stdio transport.
- Markdown to PDF conversion.
- Mermaid diagram support (CDN-based).
- Syntax highlighting.
- Table of Contents generation.
- Browser auto-detection.
