import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { generatePdf, bulkGeneratePdf } from "md2pdf-core";
import type { GeneratePdfOptions, BulkGeneratePdfOptions } from "md2pdf-core";

export interface CliArgs {
  mode: "stdio" | "http" | "cli" | "bulk";
  inputPath?: string;
  inputDir?: string;
  outputPath?: string;
  outputDir?: string;
  port: number;
  theme?: string;
  paperSize?: string;
  landscape?: boolean;
  toc?: boolean;
  header?: string;
  footer?: string;
  baseDir?: string;
  cssPath?: string;
  recursive?: boolean;
}

export function parseCliArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const result: CliArgs = { mode: "stdio", port: 3000, recursive: true };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === "--http") {
      result.mode = "http";
      if (args[i + 1] && !args[i + 1].startsWith("--")) {
        result.port = parseInt(args[i + 1], 10);
        i += 2;
      } else {
        i += 1;
      }
      continue;
    }

    if (arg === "--bulk") {
      result.mode = "bulk";
      if (args[i + 1] && !args[i + 1].startsWith("--")) {
        result.inputDir = args[i + 1];
        i += 2;
      } else {
        i += 1;
      }
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      result.outputPath = args[i + 1];
      i += 2;
      continue;
    }

    if (arg === "--output-dir" || arg === "-O") {
      result.outputDir = args[i + 1];
      i += 2;
      continue;
    }

    if (arg === "--theme" || arg === "-t") {
      result.theme = args[i + 1];
      i += 2;
      continue;
    }

    if (arg === "--paper-size" || arg === "-p") {
      result.paperSize = args[i + 1];
      i += 2;
      continue;
    }

    if (arg === "--landscape" || arg === "-l") {
      result.landscape = true;
      i += 1;
      continue;
    }

    if (arg === "--toc") {
      result.toc = true;
      i += 1;
      continue;
    }

    if (arg === "--header") {
      result.header = args[i + 1];
      i += 2;
      continue;
    }

    if (arg === "--footer") {
      result.footer = args[i + 1];
      i += 2;
      continue;
    }

    if (arg === "--base-dir") {
      result.baseDir = args[i + 1];
      i += 2;
      continue;
    }

    if (arg === "--css") {
      result.cssPath = args[i + 1];
      i += 2;
      continue;
    }

    if (arg === "--no-recursive") {
      result.recursive = false;
      i += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (!arg.startsWith("-") && !result.inputPath) {
      result.inputPath = arg;
      result.mode = "cli";
      i += 1;
      continue;
    }

    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }

  return result;
}

function printHelp(): void {
  console.log(`mcp-md2pdf — Markdown to PDF generator

Usage:
  mcp-md2pdf                          Start MCP stdio server (default)
  mcp-md2pdf --http [port]            Start HTTP server
  mcp-md2pdf input.md [options]       Convert a Markdown file to PDF
  mcp-md2pdf --bulk <dir> [options]   Bulk convert all .md files in a directory

Options:
  -o, --output <path>     Output PDF file path (single file)
  -O, --output-dir <dir>  Output directory for bulk conversion
  -t, --theme <theme>     Theme: github | light | dark (default: github)
  -p, --paper-size <size> Paper size: A4 | Letter | Legal | Tabloid (default: A4)
  -l, --landscape         Use landscape orientation
  --toc                   Include Table of Contents
  --header <text>         Header HTML template
  --footer <text>         Footer HTML template
  --base-dir <path>       Base directory for relative image paths
  --css <path>            Path to custom CSS file
  --no-recursive          Disable recursive scanning in bulk mode
  -h, --help              Show this help message
`);
}

/* ------------------------------------------------------------------ */
/*  Single file CLI                                                   */
/* ------------------------------------------------------------------ */

export async function runSingleFileCli(args: CliArgs): Promise<void> {
  if (!args.inputPath) {
    console.error("Error: No input file specified.");
    process.exit(1);
  }

  const markdown = readFileSync(resolve(args.inputPath), "utf-8");

  let customCss: string | undefined;
  if (args.cssPath) {
    customCss = readFileSync(resolve(args.cssPath), "utf-8");
  }

  const resolvedInput = resolve(args.inputPath);
  const defaultOutput = args.outputPath
    ? resolve(args.outputPath)
    : resolvedInput.replace(/\.md$/i, ".pdf");

  const options: GeneratePdfOptions = {
    markdown,
    outputPath: defaultOutput,
    theme: ["light", "dark", "github"].includes(args.theme || "")
      ? (args.theme as GeneratePdfOptions["theme"])
      : "github",
    paperSize: ["A4", "Letter", "Legal", "Tabloid"].includes(args.paperSize || "")
      ? (args.paperSize as GeneratePdfOptions["paperSize"])
      : "A4",
    landscape: args.landscape,
    includeToc: args.toc,
    header: args.header,
    footer: args.footer,
    baseDir: args.baseDir ? resolve(args.baseDir) : dirname(resolvedInput),
    customCss,
  };

  const filePath = await generatePdf(options);
  console.log("PDF generated:", filePath);
}

/* ------------------------------------------------------------------ */
/*  Bulk CLI                                                          */
/* ------------------------------------------------------------------ */

export async function runBulkCli(args: CliArgs): Promise<void> {
  if (!args.inputDir) {
    console.error("Error: No input directory specified. Use --bulk <dir>");
    process.exit(1);
  }

  let customCss: string | undefined;
  if (args.cssPath) {
    customCss = readFileSync(resolve(args.cssPath), "utf-8");
  }

  const options: BulkGeneratePdfOptions = {
    inputDir: args.inputDir,
    outputDir: args.outputDir ? resolve(args.outputDir) : undefined,
    recursive: args.recursive,
    theme: ["light", "dark", "github"].includes(args.theme || "")
      ? (args.theme as BulkGeneratePdfOptions["theme"])
      : "github",
    paperSize: ["A4", "Letter", "Legal", "Tabloid"].includes(args.paperSize || "")
      ? (args.paperSize as BulkGeneratePdfOptions["paperSize"])
      : "A4",
    landscape: args.landscape,
    includeToc: args.toc,
    header: args.header,
    footer: args.footer,
    customCss,
  };

  const { outputDir: outDir, results } = await bulkGeneratePdf(options);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  console.log(`\nBulk conversion complete: ${successCount}/${results.length} succeeded`);
  if (failCount > 0) {
    console.log(`\nFailures (${failCount}):`);
    for (const r of results.filter((r) => !r.success)) {
      console.log(`  - ${r.inputPath}: ${r.error}`);
    }
  }

  if (successCount > 0) {
    console.log(`\nOutput folder: ${outDir}`);
    console.log(`  Files converted: ${successCount}`);
    if (results.length > 1) {
      console.log(`  Folder structure preserved from: ${args.inputDir}`);
    }
  }
}
