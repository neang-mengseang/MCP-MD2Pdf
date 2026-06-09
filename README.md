# mcp-md2pdf

[![npm version](https://img.shields.io/npm/v/mcp-md2pdf.svg)](https://www.npmjs.com/package/mcp-md2pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Convert Markdown to beautiful PDFs. Works as an **MCP server**, a **CLI tool**, or a **programmatic library**.

Built on top of [`md2pdf-core`](https://www.npmjs.com/package/md2pdf-core).

## Features

- **GitHub-flavored Markdown** — tables, task lists, strikethrough, fenced code blocks
- **Mermaid diagrams** — flowcharts, sequence diagrams, class diagrams, ER diagrams, Gantt charts, and more (offline rendering)
- **KaTeX math** — inline `$...$` and block `$$...$$` math expressions
- **Syntax highlighting** — 180+ languages via Highlight.js
- **Auto Table of Contents** — generated from document headings
- **Bulk conversion** — convert entire directories of `.md` files to PDFs
- **Themes** — `github` (default), `light`, `dark`
- **Paper sizes** — A4, Letter, Legal, Tabloid
- **Landscape & custom margins**
- **Header/footer** with automatic page numbers
- **Local image resolution** via `baseDir` option
- **Custom CSS injection**
- **Zero browser downloads** — auto-detects Chrome, Edge, or Chromium

## Installation

### npx (no install)

```bash
npx -y mcp-md2pdf@latest
```

### Global install

```bash
npm install -g mcp-md2pdf
```

This provides two global commands:
- `mcp-md2pdf` — MCP server, HTTP server, and full CLI
- `m2p` — quick shorthand for file conversion (same binary, alias)

## CLI Usage

### Quick single-file conversion (`m2p`)

```bash
m2p readme.md                              # outputs readme.pdf
m2p readme.md --toc --theme dark           # with TOC, dark theme
m2p readme.md -o out.pdf -p Letter -l      # custom output, Letter, landscape
m2p guide.md --css custom.css --header "Draft"  # custom CSS and header
```

### MCP stdio server (default, no args)

```bash
mcp-md2pdf
```

Starts the Model Context Protocol server on stdio. Integrates with Claude, Cursor, Windsurf, etc.

### HTTP server

```bash
mcp-md2pdf --http          # port 3000
mcp-md2pdf --http 8080     # custom port
```

Endpoints:
- `GET /health` — health check
- `GET /tools/list` — list available tools
- `POST /tools/call` — call `generate_pdf` or `bulk_generate_pdf`

### Full CLI (single file)

```bash
mcp-md2pdf input.md -o output.pdf --theme dark --toc
```

### Bulk conversion

```bash
mcp-md2pdf --bulk ./docs -O ./pdfs --theme github --toc
mcp-md2pdf --bulk ./docs --no-recursive   # skip subdirectories
```

### CLI Options

| Flag | Description |
|------|-------------|
| `-o, --output <path>` | Output PDF file path (single file) |
| `-O, --output-dir <dir>` | Output directory for bulk conversion |
| `-t, --theme <theme>` | `github` (default), `light`, `dark` |
| `-p, --paper-size <size>` | `A4` (default), `Letter`, `Legal`, `Tabloid` |
| `-l, --landscape` | Landscape orientation |
| `--toc` | Include Table of Contents |
| `--header <html>` | HTML header template |
| `--footer <html>` | Footer HTML template |
| `--base-dir <path>` | Base directory for relative image paths |
| `--css <path>` | Path to custom CSS file |
| `--no-recursive` | Disable recursive scanning in bulk mode |
| `-h, --help` | Show help |

## Programmatic API

Install as a dependency and import the functions directly:

```bash
npm install mcp-md2pdf
```

### Single PDF

```ts
import { generatePdf } from "mcp-md2pdf";

const filePath = await generatePdf({
  markdown: "# Hello World\n\nThis is **bold** text.",
  outputPath: "/tmp/output.pdf",
  theme: "github",
  paperSize: "A4",
  includeToc: true,
});

console.log("PDF saved to:", filePath);
```

### Bulk conversion

```ts
import { bulkGeneratePdf } from "mcp-md2pdf";

const { outputDir, results } = await bulkGeneratePdf({
  inputDir: "./docs",
  outputDir: "./pdfs",
  recursive: true,
  theme: "dark",
  includeToc: true,
});

console.log(`Converted ${results.filter(r => r.success).length} files to ${outputDir}`);
```

### Markdown to HTML (no Puppeteer)

```ts
import { markdownToHtml } from "mcp-md2pdf";

const { html, toc } = await markdownToHtml("# Hello\n\nWorld", { includeToc: true });
```

### Available exports

| Export | Description |
|--------|-------------|
| `generatePdf(options)` | Convert Markdown string to PDF |
| `bulkGeneratePdf(options)` | Convert all `.md` files in a directory |
| `markdownToHtml(md, opts)` | Render Markdown to HTML + TOC |
| `resolveLocalImages(html, baseDir)` | Resolve relative `<img>` paths |
| `preprocessMermaid(md)` | Turn `` ```mermaid `` blocks into `<div class="mermaid">` |
| `preprocessMath(md)` | Turn `$...$` / `$$...$$` into KaTeX HTML |
| `injectHeadingIds(html)` | Add `id` attributes to `<h1>`–`<h6>` |
| `generateTocHtml(html)` | Build a Table of Contents from headings |
| `resolveBrowserExecutable()` | Auto-detect Chrome / Edge / Chromium path |
| `GITHUB_CSS`, `DARK_CSS` | Built-in theme stylesheets |

## MCP Client Configuration

### Claude Code / Devin CLI

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "pdf-generator": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-md2pdf@latest"]
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pdf-generator": {
      "command": "npx",
      "args": ["-y", "mcp-md2pdf@latest"]
    }
  }
}
```

## MCP Tools

### `generate_pdf`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `markdown` | `string` | Yes | Markdown content |
| `outputPath` | `string` | No | Where to save the PDF |
| `theme` | `string` | No | `github`, `light`, `dark` |
| `paperSize` | `string` | No | `A4`, `Letter`, `Legal`, `Tabloid` |
| `landscape` | `boolean` | No | Landscape orientation |
| `margin` | `object` | No | `{ top, bottom, left, right }` |
| `includeToc` | `boolean` | No | Auto Table of Contents |
| `header` | `string` | No | HTML header template |
| `footer` | `string` | No | HTML footer template |
| `baseDir` | `string` | No | Base dir for relative images |
| `customCss` | `string` | No | Custom CSS to inject |

### `bulk_generate_pdf`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `inputDir` | `string` | Yes | Directory with `.md` files |
| `outputDir` | `string` | No | Output directory (default: `md2pdf-<timestamp>`) |
| `recursive` | `boolean` | No | Scan subdirectories (default: `true`) |
| `theme` | `string` | No | Theme |
| `paperSize` | `string` | No | Paper size |
| `landscape` | `boolean` | No | Landscape |
| `margin` | `object` | No | Margins |
| `includeToc` | `boolean` | No | TOC |
| `header` | `string` | No | Header |
| `footer` | `string` | No | Footer |
| `customCss` | `string` | No | Custom CSS |

## Examples

See the [`examples/`](./examples) directory for sample usage.

## Requirements

- Node.js >= 18
- A Chromium-based browser (Chrome, Edge, or Chromium) installed, or set `PUPPETEER_EXECUTABLE_PATH`

## Troubleshooting

### "No Chromium-based browser found"

Install Chrome, Edge, or Chromium, or set the environment variable:

```bash
# macOS/Linux
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"

# Windows (PowerShell)
$env:PUPPETEER_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## Related Packages

- [`md2pdf-core`](https://www.npmjs.com/package/md2pdf-core) — Core library (programmatic API)

## License

MIT
