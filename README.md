# mcp-md2pdf

An MCP (Model Context Protocol) server that generates beautiful PDFs from Markdown. Supports Mermaid diagrams, syntax-highlighted code blocks, tables, auto-generated Table of Contents, and multiple themes.

## Features

- **GitHub-flavored Markdown** — tables, task lists, strikethrough, fenced code blocks
- **Mermaid diagrams** — flowcharts, sequence diagrams, class diagrams, ER diagrams, Gantt charts, and more
- **Syntax highlighting** — 180+ languages via Highlight.js
- **Auto Table of Contents** — generated from document headings
- **Themes** — `github` (default), `light`, `dark`
- **Paper sizes** — A4, Letter, Legal, Tabloid
- **Landscape & custom margins**
- **Zero browser downloads** — auto-detects Chrome, Edge, or Chromium already installed on your system

## Requirements

- Node.js 18+
- A Chromium-based browser (Google Chrome, Microsoft Edge, or Chromium)
  - **Windows**: Edge or Chrome (auto-detected)
  - **macOS**: Chrome or Edge in `/Applications`
  - **Linux**: `google-chrome`, `chromium-browser`, `chromium`, or `microsoft-edge`
  - **Override**: Set `PUPPETEER_EXECUTABLE_PATH` to force a specific browser path

## Installation

### npx (no install)

```bash
npx -y mcp-md2pdf@latest
```

### Global install

```bash
npm install -g mcp-md2pdf
```

### From source

```bash
git clone https://github.com/yourusername/mcp-md2pdf.git
cd mcp-md2pdf
npm install
npm run build
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

### Cursor / VS Code

Add to your MCP settings:

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

## Tool: `generate_pdf`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `markdown` | `string` | Yes | Markdown content to convert |
| `outputPath` | `string` | No | Absolute file path where the PDF should be saved. If omitted, a temporary file is created. |
| `theme` | `string` | No | Visual theme. Options: `github` (default), `light`, `dark` |
| `paperSize` | `string` | No | Paper size. Options: `A4` (default), `Letter`, `Legal`, `Tabloid` |
| `landscape` | `boolean` | No | Landscape orientation. Default: `false` |
| `margin` | `object` | No | Page margins. Default: `{ top: "30px", bottom: "30px", left: "30px", right: "30px" }` |
| `includeToc` | `boolean` | No | Auto-generate Table of Contents from headings. Default: `false` |

## Example Usage

### Basic document

```json
{
  "markdown": "# Project Report\n\n## Introduction\n\nThis is a sample report generated from Markdown.\n\n## Architecture\n\n```mermaid\nflowchart TD\n    A[Client] --> B[API Gateway]\n    B --> C[Auth Service]\n    C --> D[Database]\n```",
  "theme": "github",
  "paperSize": "A4",
  "includeToc": true
}
```

### Code with syntax highlighting

```json
{
  "markdown": "## Code Example\n\n```typescript\ninterface User {\n  id: string;\n  email: string;\n  role: \"admin\" | \"user\";\n}\n\nfunction getUser(id: string): User {\n  return { id, email: \"test@example.com\", role: \"user\" };\n}\n```",
  "theme": "dark",
  "outputPath": "/Users/me/report.pdf"
}
```

### Dark theme with landscape

```json
{
  "markdown": "# System Design\n\n```mermaid\nsequenceDiagram\n    participant C as Client\n    participant S as Server\n    participant D as DB\n    C->>S: POST /api/login\n    S->>D: SELECT * FROM users\n    D-->>S: user row\n    S-->>C: JWT token\n```",
  "theme": "dark",
  "landscape": true,
  "paperSize": "Letter"
}
```

## Troubleshooting

### "No Chromium-based browser found"

Install Chrome, Edge, or Chromium, or set the environment variable:

```bash
# Windows PowerShell
$env:PUPPETEER_EXECUTABLE_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# macOS / Linux
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

### Mermaid diagrams not rendering

Mermaid diagrams require an internet connection to load the Mermaid JS library from CDN. If you're offline, diagrams will appear as plain text.

### Large PDFs timing out

For very large documents, increase your MCP client's tool timeout. The server itself has no timeout limit.

## License

MIT
