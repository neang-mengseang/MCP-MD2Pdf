export const GITHUB_CSS = `
* { box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
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
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
  line-height: 1.45;
  margin-bottom: 16px;
  border: 1px solid #d0d7de;
}

code {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
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

.katex { font-size: 1.1em; }
.katex-display { margin: 16px 0; overflow-x: auto; }
`;

export const DARK_CSS = GITHUB_CSS.replace(/#fff/g, "#0d1117")
  .replace(/#f6f8fa/g, "#161b22")
  .replace(/#24292f/g, "#c9d1d9")
  .replace(/#1f2328/g, "#f0f6fc")
  .replace(/#656d76/g, "#8b949e")
  .replace(/#d0d7de/g, "#30363d")
  .replace(/#d8dee4/g, "#21262d")
  .replace(/#0969da/g, "#58a6ff")
  .replace(/background: #0d1117/g, "background: #0d1117");
