# Example: Single File Conversion

```bash
npx mcp-md2pdf@latest document.md -o report.pdf --theme github --toc --header "Company Report" --footer "Confidential"
```

Or using the MCP tool:

```json
{
  "markdown": "# Hello World\n\nThis is a sample document.",
  "theme": "github",
  "paperSize": "A4",
  "includeToc": true
}
```
