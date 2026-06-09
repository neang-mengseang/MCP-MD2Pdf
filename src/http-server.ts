import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { generatePdf, bulkGeneratePdf } from "md2pdf-core";
import type { GeneratePdfOptions, BulkGeneratePdfOptions } from "md2pdf-core";

/* ------------------------------------------------------------------ */
/*  Shared tool schemas                                               */
/* ------------------------------------------------------------------ */

const TOOL_SCHEMAS = [
  {
    name: "generate_pdf",
    description:
      "Generate a PDF document from Markdown content. Supports GitHub-flavored Markdown, " +
      "Mermaid diagrams, KaTeX math, syntax-highlighted code blocks, tables, and more. " +
      "Returns the absolute file path to the generated PDF.",
    inputSchema: {
      type: "object",
      properties: {
        markdown: { type: "string", description: "The Markdown content to convert to PDF (required)" },
        outputPath: { type: "string", description: "Absolute file path where the PDF should be saved." },
        theme: { type: "string", enum: ["light", "dark", "github"], description: "Visual theme. Default: github" },
        paperSize: { type: "string", enum: ["A4", "Letter", "Legal", "Tabloid"], description: "Paper size. Default: A4" },
        landscape: { type: "boolean", description: "Landscape orientation. Default: false" },
        margin: {
          type: "object",
          description: "Page margins",
          properties: { top: { type: "string" }, bottom: { type: "string" }, left: { type: "string" }, right: { type: "string" } },
        },
        includeToc: { type: "boolean", description: "Include auto-generated Table of Contents. Default: false" },
        header: { type: "string", description: "Header HTML template" },
        footer: { type: "string", description: "Footer HTML template" },
        baseDir: { type: "string", description: "Base directory for resolving relative image paths" },
        customCss: { type: "string", description: "Custom CSS string to inject into the PDF" },
      },
      required: ["markdown"],
    },
  },
  {
    name: "bulk_generate_pdf",
    description:
      "Bulk convert all Markdown files in a directory to PDFs. Output folder is prefixed with 'md2pdf-'. " +
      "Returns a list of conversion results with input/output paths and success status.",
    inputSchema: {
      type: "object",
      properties: {
        inputDir: { type: "string", description: "Directory containing Markdown files to convert (required)" },
        outputDir: { type: "string", description: "Directory where PDFs should be saved. If omitted, a 'md2pdf-<timestamp>' folder is created." },
        recursive: { type: "boolean", description: "Scan subdirectories for .md files. Default: true" },
        theme: { type: "string", enum: ["light", "dark", "github"], description: "Visual theme. Default: github" },
        paperSize: { type: "string", enum: ["A4", "Letter", "Legal", "Tabloid"], description: "Paper size. Default: A4" },
        landscape: { type: "boolean", description: "Landscape orientation. Default: false" },
        margin: {
          type: "object",
          description: "Page margins",
          properties: { top: { type: "string" }, bottom: { type: "string" }, left: { type: "string" }, right: { type: "string" } },
        },
        includeToc: { type: "boolean", description: "Include auto-generated Table of Contents. Default: false" },
        header: { type: "string", description: "Header HTML template" },
        footer: { type: "string", description: "Footer HTML template" },
        customCss: { type: "string", description: "Custom CSS string to inject into the PDF" },
      },
      required: ["inputDir"],
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Server                                                            */
/* ------------------------------------------------------------------ */

export async function startHttpServer(port: number): Promise<void> {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = req.url || "";

    if (url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", transport: "http", port }));
      return;
    }

    if (url === "/tools/list" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ tools: TOOL_SCHEMAS }));
      return;
    }

    if (url === "/tools/call" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body);

          if (payload.name === "generate_pdf") {
            const args = payload.arguments || {};
            if (!args.markdown || typeof args.markdown !== "string") {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: "Missing required 'markdown' field." }));
              return;
            }

            const options: GeneratePdfOptions = buildGenerateOptions(args);
            const filePath = await generatePdf(options);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: { filePath } }));
            return;
          }

          if (payload.name === "bulk_generate_pdf") {
            const args = payload.arguments || {};
            if (!args.inputDir || typeof args.inputDir !== "string") {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: "Missing required 'inputDir' field." }));
              return;
            }

            const options: BulkGeneratePdfOptions = buildBulkOptions(args);
            const { outputDir: outDir, results } = await bulkGeneratePdf(options);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: { outputDir: outDir, results } }));
            return;
          }

          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: `Unknown tool: ${payload.name}` }));
        } catch (err: any) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err?.message || String(err) }));
        }
      });
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`HTTP server listening on http://localhost:${port}`);
      console.log(`  GET  /health       - health check`);
      console.log(`  GET  /tools/list   - list available tools`);
      console.log(`  POST /tools/call   - call a tool`);
      resolve();
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Option builders                                                   */
/* ------------------------------------------------------------------ */

function buildGenerateOptions(args: Record<string, unknown>): GeneratePdfOptions {
  return {
    markdown: String(args.markdown),
    outputPath: args.outputPath ? String(args.outputPath) : undefined,
    theme: ["light", "dark", "github"].includes(String(args.theme))
      ? (String(args.theme) as GeneratePdfOptions["theme"])
      : "github",
    paperSize: ["A4", "Letter", "Legal", "Tabloid"].includes(String(args.paperSize))
      ? (String(args.paperSize) as GeneratePdfOptions["paperSize"])
      : "A4",
    landscape: Boolean(args.landscape),
    margin: args.margin && typeof args.margin === "object" ? (args.margin as GeneratePdfOptions["margin"]) : undefined,
    includeToc: Boolean(args.includeToc),
    header: args.header ? String(args.header) : undefined,
    footer: args.footer ? String(args.footer) : undefined,
    baseDir: args.baseDir ? String(args.baseDir) : undefined,
    customCss: args.customCss ? String(args.customCss) : undefined,
  };
}

function buildBulkOptions(args: Record<string, unknown>): BulkGeneratePdfOptions {
  return {
    inputDir: String(args.inputDir),
    outputDir: args.outputDir ? String(args.outputDir) : undefined,
    recursive: args.recursive !== false,
    theme: ["light", "dark", "github"].includes(String(args.theme))
      ? (String(args.theme) as BulkGeneratePdfOptions["theme"])
      : "github",
    paperSize: ["A4", "Letter", "Legal", "Tabloid"].includes(String(args.paperSize))
      ? (String(args.paperSize) as BulkGeneratePdfOptions["paperSize"])
      : "A4",
    landscape: Boolean(args.landscape),
    margin: args.margin && typeof args.margin === "object" ? (args.margin as BulkGeneratePdfOptions["margin"]) : undefined,
    includeToc: Boolean(args.includeToc),
    header: args.header ? String(args.header) : undefined,
    footer: args.footer ? String(args.footer) : undefined,
    customCss: args.customCss ? String(args.customCss) : undefined,
  };
}
