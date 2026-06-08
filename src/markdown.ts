import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import katex from "katex";
import { resolve as resolvePath } from "path";

/* ------------------------------------------------------------------ */
/*  Marked setup                                                      */
/* ------------------------------------------------------------------ */

marked.use(markedHighlight({
  langPrefix: "hljs language-",
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function preprocessMermaid(markdown: string): string {
  return markdown.replace(
    /```mermaid\n([\s\S]*?)\n```/g,
    (_match, code) => `<div class="mermaid">${escapeHtml(code.trim())}</div>`
  );
}

export function preprocessMath(markdown: string): string {
  // Block math: $$...$$
  let result = markdown.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_match, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return `<pre class="katex-error">${escapeHtml(tex.trim())}</pre>`;
      }
    }
  );

  // Inline math: $...$ (avoid matches inside code blocks)
  result = result.replace(
    /(?<![\w\\])\$([^$\n]+?)\$(?![\w])/g,
    (_match, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return `<span class="katex-error">${escapeHtml(tex.trim())}</span>`;
      }
    }
  );

  return result;
}

export function injectHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(
    /<h([1-6])(?:\s+[^>]*)?>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/h\1>/g,
    (match, level, text) => {
      let id = text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const count = seen.get(id) || 0;
      seen.set(id, count + 1);
      if (count > 0) id += `-${count}`;
      return `<h${level} id="${id}">${text}</h${level}>`;
    }
  );
}

export function generateTocHtml(html: string): string {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const headingRegex = /<h([1-6])(?:\s+([^>]*))?>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/h\1>/g;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const attrs = match[2] || "";
    const text = match[3].trim();
    const existingId = /id="([^"]+)"/.exec(attrs);
    const id = existingId
      ? existingId[1]
      : text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ level, text, id });
  }

  if (headings.length === 0) return "";

  const tocItems = headings
    .map((h) => `<li style="margin-left:${(h.level - 1) * 16}px"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`)
    .join("\n");

  return `<div class="toc"><h2>Table of Contents</h2><ul>${tocItems}</ul></div>`;
}

export function resolveLocalImages(html: string, baseDir?: string): string {
  if (!baseDir) return html;
  return html.replace(
    /<img([^>]+?)src="([^"]+)"([^>]*)>/g,
    (match, pre, src, post) => {
      if (/^(https?:|file:|data:|\/)/i.test(src)) return match;
      const abs = resolvePath(baseDir, src);
      return `<img${pre}src="${abs}"${post}>`;
    }
  );
}

export async function markdownToHtml(
  markdown: string,
  opts: { includeToc?: boolean } = {}
): Promise<{ html: string; toc: string }> {
  let processed = preprocessMath(markdown);
  processed = preprocessMermaid(processed);
  let html = await marked.parse(processed, { gfm: true });
  html = injectHeadingIds(html);
  const toc = opts.includeToc ? generateTocHtml(html) : "";
  return { html, toc };
}
