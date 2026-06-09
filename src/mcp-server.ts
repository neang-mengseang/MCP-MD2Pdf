#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { generatePdf, bulkGeneratePdf } from "md2pdf-core";
import { startHttpServer } from "./http-server.js";
import { parseCliArgs, runSingleFileCli, runBulkCli } from "./cli.js";
import type { GeneratePdfOptions, BulkGeneratePdfOptions } from "md2pdf-core";

/* ------------------------------------------------------------------ */
/*  MCP Tool Schemas                                                  */
/* ------------------------------------------------------------------ */

const PDF_TOOL: Tool = {
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
      theme: { type: "string", enum: ["light", "dark", "github"], description: "Visual theme. Default: github", default: "github" },
      paperSize: { type: "string", enum: ["A4", "Letter", "Legal", "Tabloid"], description: "Paper size. Default: A4", default: "A4" },
      landscape: { type: "boolean", description: "Landscape orientation. Default: false", default: false },
      margin: {
        type: "object",
        description: "Page margins",
        properties: { top: { type: "string", default: "30px" }, bottom: { type: "string", default: "30px" }, left: { type: "string", default: "30px" }, right: { type: "string", default: "30px" } },
      },
      includeToc: { type: "boolean", description: "Include auto-generated Table of Contents. Default: false", default: false },
      header: { type: "string", description: "HTML template for the page header" },
      footer: { type: "string", description: "HTML template for the page footer" },
      baseDir: { type: "string", description: "Base directory for resolving relative image paths" },
      customCss: { type: "string", description: "Custom CSS string to inject into the PDF" },
    },
    required: ["markdown"],
  },
};

const BULK_TOOL: Tool = {
  name: "bulk_generate_pdf",
  description:
    "Bulk convert all Markdown files in a directory to PDFs. Output folder is prefixed with 'md2pdf-'. " +
    "Returns a list of conversion results with input/output paths and success status.",
  inputSchema: {
    type: "object",
    properties: {
      inputDir: { type: "string", description: "Directory containing Markdown files to convert (required)" },
      outputDir: { type: "string", description: "Directory where PDFs should be saved. If omitted, a 'md2pdf-<timestamp>' folder is created." },
      recursive: { type: "boolean", description: "Scan subdirectories for .md files. Default: true", default: true },
      theme: { type: "string", enum: ["light", "dark", "github"], description: "Visual theme. Default: github", default: "github" },
      paperSize: { type: "string", enum: ["A4", "Letter", "Legal", "Tabloid"], description: "Paper size. Default: A4", default: "A4" },
      landscape: { type: "boolean", description: "Landscape orientation. Default: false", default: false },
      margin: {
        type: "object",
        description: "Page margins",
        properties: { top: { type: "string", default: "30px" }, bottom: { type: "string", default: "30px" }, left: { type: "string", default: "30px" }, right: { type: "string", default: "30px" } },
      },
      includeToc: { type: "boolean", description: "Include auto-generated Table of Contents. Default: false", default: false },
      header: { type: "string", description: "HTML template for the page header" },
      footer: { type: "string", description: "HTML template for the page footer" },
      customCss: { type: "string", description: "Custom CSS string to inject into the PDF" },
    },
    required: ["inputDir"],
  },
};

/* ------------------------------------------------------------------ */
/*  MCP Stdio Server                                                  */
/* ------------------------------------------------------------------ */

async function startStdioServer(): Promise<void> {
  const server = new Server(
    { name: "mcp-md2pdf", version: "1.3.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: [PDF_TOOL, BULK_TOOL] };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = request.params.arguments as Record<string, unknown>;

    if (request.params.name === "generate_pdf") {
      if (!args.markdown || typeof args.markdown !== "string") {
        throw new Error("Missing required 'markdown' field (must be a string).");
      }

      const options: GeneratePdfOptions = {
        markdown: args.markdown,
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

      const filePath = await generatePdf(options);
      return {
        content: [{ type: "text", text: `PDF generated successfully: ${filePath}` }],
        isError: false,
      };
    }

    if (request.params.name === "bulk_generate_pdf") {
      if (!args.inputDir || typeof args.inputDir !== "string") {
        throw new Error("Missing required 'inputDir' field (must be a string).");
      }

      const options: BulkGeneratePdfOptions = {
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

      const { outputDir: outDir, results } = await bulkGeneratePdf(options);
      const successCount = results.filter((r) => r.success).length;
      const summary = `Bulk conversion complete: ${successCount}/${results.length} succeeded\nOutput folder: ${outDir}`;

      return {
        content: [{ type: "text", text: summary }],
        isError: false,
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/* ------------------------------------------------------------------ */
/*  Main entrypoint                                                   */
/* ------------------------------------------------------------------ */

async function main() {
  const args = parseCliArgs(process.argv);

  if (args.mode === "http") {
    await startHttpServer(args.port);
  } else if (args.mode === "cli") {
    await runSingleFileCli(args);
  } else if (args.mode === "bulk") {
    await runBulkCli(args);
  } else {
    await startStdioServer();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
