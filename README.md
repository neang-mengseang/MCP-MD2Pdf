# mcp-md2pdf

An MCP (Model Context Protocol) server that converts Markdown to beautiful PDFs. Supports Mermaid diagrams, KaTeX math, syntax-highlighted code blocks, tables, auto-generated Table of Contents, and bulk directory conversion.

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

## Usage

### MCP stdio server (default)

```bash
mcp-md2pdf
```

### HTTP server

```bash
mcp-md2pdf --http 3000
```

### Single file CLI

```bash
mcp-md2pdf input.md -o output.pdf --theme dark --toc
```

### Bulk conversion CLI

```bash
mcp-md2pdf --bulk ./docs -O ./pdfs --theme github --toc
```

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

## Tools

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

## License

MIT
