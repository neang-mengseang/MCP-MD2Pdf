import {
  escapeHtml,
  preprocessMermaid,
  injectHeadingIds,
  generateTocHtml,
} from "../src/markdown.js";
import { resolveBrowserExecutable } from "../src/browser.js";

describe("escapeHtml", () => {
  it("escapes <, >, &, \", and '", () => {
    const input = `<div class="foo">Bar & Baz's "stuff"</div>`;
    const expected =
      `&lt;div class=&quot;foo&quot;&gt;Bar &amp; Baz&#039;s &quot;stuff&quot;&lt;/div&gt;`;
    expect(escapeHtml(input)).toBe(expected);
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("returns unchanged string when no special chars", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

describe("preprocessMermaid", () => {
  it("converts fenced mermaid blocks to divs", () => {
    const input = "```mermaid\ngraph TD;\n  A-->B;\n```";
    const result = preprocessMermaid(input);
    expect(result).toContain('<div class="mermaid">');
    expect(result).toContain("graph TD;");
    expect(result).toContain("</div>");
    expect(result).not.toContain("```mermaid");
  });

  it("leaves regular code blocks untouched", () => {
    const input = "```js\nconst x = 1;\n```";
    expect(preprocessMermaid(input)).toBe(input);
  });

  it("handles multiple mermaid blocks", () => {
    const input = "```mermaid\nA\n```\n\n```mermaid\nB\n```";
    const result = preprocessMermaid(input);
    const matches = result.match(/<div class="mermaid">/g);
    expect(matches).toHaveLength(2);
  });
});

describe("injectHeadingIds", () => {
  it("adds id attributes to h1 through h6", () => {
    const html = `
      <h1>Hello World</h1>
      <h2>Sub Section</h2>
      <h3>Deep Dive</h3>
      <h4>Detail</h4>
      <h5>More</h5>
      <h6>Tiny</h6>
    `;
    const result = injectHeadingIds(html);
    expect(result).toContain('<h1 id="hello-world">');
    expect(result).toContain('<h2 id="sub-section">');
    expect(result).toContain('<h3 id="deep-dive">');
    expect(result).toContain('<h4 id="detail">');
    expect(result).toContain('<h5 id="more">');
    expect(result).toContain('<h6 id="tiny">');
  });

  it("deduplicates duplicate heading ids", () => {
    const html = `
      <h1>Foo</h1>
      <h1>Foo</h1>
      <h1>Foo</h1>
    `;
    const result = injectHeadingIds(html);
    expect(result).toContain('<h1 id="foo">');
    expect(result).toContain('<h1 id="foo-1">');
    expect(result).toContain('<h1 id="foo-2">');
  });
});

describe("generateTocHtml", () => {
  it("generates a TOC with correct nesting based on heading levels", () => {
    const html = `
      <h1 id="intro">Introduction</h1>
      <h2 id="setup">Setup</h2>
      <h3 id="install">Installation</h3>
      <h2 id="usage">Usage</h2>
      <h1 id="ref">Reference</h1>
    `;
    const toc = generateTocHtml(html);
    expect(toc).toContain("Table of Contents");
    expect(toc).toContain('<a href="#intro">Introduction</a>');
    expect(toc).toContain('<a href="#setup">Setup</a>');
    expect(toc).toContain('<a href="#install">Installation</a>');
    expect(toc).toContain('<a href="#usage">Usage</a>');
    expect(toc).toContain('<a href="#ref">Reference</a>');
    expect(toc).toContain('style="margin-left:0px"');
    expect(toc).toContain('style="margin-left:16px"');
    expect(toc).toContain('style="margin-left:32px"');
  });

  it("returns empty string when no headings exist", () => {
    expect(generateTocHtml("<p>No headings here</p>")).toBe("");
  });
});

describe("resolveBrowserExecutable", () => {
  it("returns a string or undefined", () => {
    const result = resolveBrowserExecutable();
    expect(typeof result === "string" || result === undefined).toBe(true);
  });

  it("returns PUPPETEER_EXECUTABLE_PATH when set", () => {
    const original = process.env.PUPPETEER_EXECUTABLE_PATH;
    process.env.PUPPETEER_EXECUTABLE_PATH = "/fake/browser";
    expect(resolveBrowserExecutable()).toBe("/fake/browser");
    process.env.PUPPETEER_EXECUTABLE_PATH = original;
  });
});
