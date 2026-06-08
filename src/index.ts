#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { generatePdf, GeneratePdfOptions } from "./pdf-generator.js";

const PDF_TOOL: Tool = {
  name: "generate_pdf",
  description:
    "Generate a PDF document from Markdown content. Supports GitHub-flavored Markdown, " +
    "Mermaid diagrams, syntax-highlighted code blocks, tables, and more. " +
    "Returns the absolute file path to the generated PDF.",
  inputSchema: {
    type: "object",
    properties: {
      markdown: {
        type: "string",
        description: "The Markdown content to convert to PDF (required)",
      },
      outputPath: {
        type: "string",
        description:
          "Absolute file path where the PDF should be saved. If omitted, a temporary file is created.",
      },
      theme: {
        type: "string",
        enum: ["light", "dark", "github"],
        description: "Visual theme for the PDF. Default: github",
        default: "github",
      },
      paperSize: {
        type: "string",
        enum: ["A4", "Letter", "Legal", "Tabloid"],
        description: "Paper size for the PDF. Default: A4",
        default: "A4",
      },
      landscape: {
        type: "boolean",
        description: "Whether to use landscape orientation. Default: false",
        default: false,
      },
      margin: {
        type: "object",
        description: "Page margins",
        properties: {
          top: { type: "string", default: "30px" },
          bottom: { type: "string", default: "30px" },
          left: { type: "string", default: "30px" },
          right: { type: "string", default: "30px" },
        },
      },
      includeToc: {
        type: "boolean",
        description: "Include an auto-generated Table of Contents. Default: false",
        default: false,
      },
    },
    required: ["markdown"],
  },
};

const server = new Server(
  {
    name: "pdf-generator-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [PDF_TOOL] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "generate_pdf") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = request.params.arguments as Record<string, unknown>;

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
    margin:
      args.margin && typeof args.margin === "object"
        ? (args.margin as GeneratePdfOptions["margin"])
        : undefined,
    includeToc: Boolean(args.includeToc),
  };

  try {
    const filePath = await generatePdf(options);
    return {
      content: [
        {
          type: "text",
          text: `PDF generated successfully: ${filePath}`,
        },
      ],
      isError: false,
    };
  } catch (err: any) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to generate PDF: ${err?.message || String(err)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error starting PDF Generator MCP server:", err);
  process.exit(1);
});
