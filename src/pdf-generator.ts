import puppeteer from "puppeteer-core";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { writeFileSync, mkdtempSync, rmSync, existsSync, copyFileSync } from "fs";
import { join } from "path";
import { tmpdir, platform } from "os";

function resolveBrowserExecutable(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const p = platform();

  if (p === "win32") {
    const edgePaths = [
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    for (const p of edgePaths) {
      if (existsSync(p)) return p;
    }

    const chromePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    for (const p of chromePaths) {
      if (existsSync(p)) return p;
    }
  }

  if (p === "darwin") {
    const macPaths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];
    for (const p of macPaths) {
      if (existsSync(p)) return p;
    }
  }

  if (p === "linux") {
    const linuxPaths = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/usr/bin/microsoft-edge",
    ];
    for (const p of linuxPaths) {
      if (existsSync(p)) return p;
    }
  }

  return undefined;
}

export interface GeneratePdfOptions {
  markdown: string;
  outputPath?: string;
  theme?: "light" | "dark" | "github";
  paperSize?: "A4" | "Letter" | "Legal" | "Tabloid";
  landscape?: boolean;
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  includeToc?: boolean;
  header?: string;
  footer?: string;
}

const GITHUB_CSS = `
/* GitHub-like Markdown Styles */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #24292f;
  background: #fff;
  padding: 40px;
  max-width: 100%;
  margin: 0 auto;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: #1f2328;
}
h1 { font-size: 28px; border-bottom: 1px solid #d8dee4; padding-bottom: 8px; }
h2 { font-size: 22px; border-bottom: 1px solid #d8dee4; padding-bottom: 6px; }
h3 { font-size: 18px; }
h4 { font-size: 16px; }
h5 { font-size: 14px; }
h6 { font-size: 13px; color: #656d76; }

p { margin-top: 0; margin-bottom: 10px; }

a { color: #0969da; text-decoration: none; }
a:hover { text-decoration: underline; }

strong { font-weight: 600; }

img { max-width: 100%; height: auto; display: block; }

pre {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
  margin-bottom: 16px;
  border: 1px solid #d0d7de;
}

code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace;
  font-size: 12px;
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #1f2328;
}

pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
}

blockquote {
  margin: 0 0 16px;
  padding: 0 16px;
  color: #656d76;
  border-left: 4px solid #d0d7de;
}

ul, ol {
  margin-top: 0;
  margin-bottom: 16px;
  padding-left: 24px;
}

li + li { margin-top: 4px; }

table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
  font-size: 13px;
}

th, td {
  padding: 8px 12px;
  border: 1px solid #d0d7de;
  text-align: left;
}

th {
  background: #f6f8fa;
  font-weight: 600;
}

tr:nth-child(even) { background: #f6f8fa; }

hr {
  height: 2px;
  padding: 0;
  margin: 24px 0;
  background: #d0d7de;
  border: 0;
}

.mermaid {
  background: #fff;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 24px;
  margin: 16px 0;
  text-align: center;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mermaid svg {
  max-width: 100%;
  height: auto;
}

.page-break { page-break-after: always; }

.toc {
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 24px;
}

.toc h2 { margin-top: 0; font-size: 18px; border-bottom: none; }
.toc ul { list-style: none; padding-left: 0; }
.toc li { margin: 4px 0; }
.toc a { color: #0969da; }
`;

const DARK_CSS = GITHUB_CSS.replace(/#fff/g, "#0d1117")
  .replace(/#f6f8fa/g, "#161b22")
  .replace(/#24292f/g, "#c9d1d9")
  .replace(/#1f2328/g, "#f0f6fc")
  .replace(/#656d76/g, "#8b949e")
  .replace(/#d0d7de/g, "#30363d")
  .replace(/#d8dee4/g, "#21262d")
  .replace(/#0969da/g, "#58a6ff")
  .replace(/background: #0d1117/g, "background: #0d1117");

marked.use(markedHighlight({
  langPrefix: "hljs language-",
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
}));

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function preprocessMermaid(markdown: string): string {
  return markdown.replace(
    /```mermaid\n([\s\S]*?)\n```/g,
    (_match, code) => `<div class="mermaid">${escapeHtml(code.trim())}</div>`
  );
}

function generateTocHtml(html: string): string {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const headingRegex = /<h([1-6])[^>]*>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/h\1>/g;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ level, text, id });
  }

  if (headings.length === 0) return "";

  const tocItems = headings
    .map((h) => `<li style="margin-left:${(h.level - 1) * 16}px"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`)
    .join("\n");

  return `<div class="toc"><h2>Table of Contents</h2><ul>${tocItems}</ul></div>`;
}

function injectHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(/<h([1-6])[^>]*>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/h\1>/g, (match, level, text) => {
    let id = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const count = seen.get(id) || 0;
    seen.set(id, count + 1);
    if (count > 0) id += `-${count}`;
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
}

export async function generatePdf(options: GeneratePdfOptions): Promise<string> {
  const {
    markdown,
    outputPath,
    theme = "github",
    paperSize = "A4",
    landscape = false,
    margin = { top: "30px", bottom: "30px", left: "30px", right: "30px" },
    includeToc = false,
  } = options;

  const processedMd = preprocessMermaid(markdown);
  let htmlContent = await marked.parse(processedMd, { gfm: true });
  htmlContent = injectHeadingIds(htmlContent);

  const css = theme === "dark" ? DARK_CSS : GITHUB_CSS;
  const tocHtml = includeToc ? generateTocHtml(htmlContent) : "";

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Generated PDF</title>
  <style>${css}</style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.0/styles/${theme === "dark" ? "github-dark" : "github"}.min.css">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: '${theme === "dark" ? "dark" : "default"}',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif'
    });
  </script>
</head>
<body>
  ${tocHtml}
  ${htmlContent}
</body>
</html>`;

  const tempDir = mkdtempSync(join(tmpdir(), "pdf-gen-"));
  const htmlPath = join(tempDir, "input.html");
  writeFileSync(htmlPath, fullHtml, "utf-8");

  const browserPath = resolveBrowserExecutable();
  if (!browserPath) {
    throw new Error(
      "No Chromium-based browser found. Install Chrome, Edge, or Chromium, " +
      "or set PUPPETEER_EXECUTABLE_PATH environment variable."
    );
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: browserPath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

    await page.evaluate(async () => {
      const mermaidElements = document.querySelectorAll(".mermaid");
      if (mermaidElements.length > 0) {
        await (window as any).mermaid.run({ querySelector: ".mermaid" });
      }
    });

    await new Promise((r) => setTimeout(r, 500));

    const finalOutputPath = outputPath || join(tmpdir(), `pdf-gen-${Date.now()}.pdf`);

    await page.pdf({
      path: finalOutputPath,
      format: paperSize,
      landscape,
      margin: {
        top: margin.top || "30px",
        bottom: margin.bottom || "30px",
        left: margin.left || "30px",
        right: margin.right || "30px",
      },
      printBackground: true,
      displayHeaderFooter: false,
    });

    return finalOutputPath;
  } finally {
    await browser.close();
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch { /* ignore cleanup errors */ }
  }
}
