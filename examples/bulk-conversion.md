# Example: Bulk Directory Conversion

Convert all Markdown files in a `docs/` directory to PDFs:

```bash
npx mcp-md2pdf@latest --bulk ./docs -O ./pdfs --theme github --toc
```

This will:
1. Recursively scan `./docs` for all `.md` files
2. Convert each to a PDF with the same relative path structure
3. Save outputs to `./pdfs/` (or `md2pdf-<timestamp>/` if `-O` is omitted)

## MCP Tool Usage

```json
{
  "inputDir": "/path/to/docs",
  "outputDir": "/path/to/output",
  "recursive": true,
  "theme": "github",
  "includeToc": true
}
```
