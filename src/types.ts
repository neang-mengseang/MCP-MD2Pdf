export interface MarginOptions {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export interface GeneratePdfOptions {
  markdown: string;
  outputPath?: string;
  theme?: "light" | "dark" | "github";
  paperSize?: "A4" | "Letter" | "Legal" | "Tabloid";
  landscape?: boolean;
  margin?: MarginOptions;
  includeToc?: boolean;
  header?: string;
  footer?: string;
  baseDir?: string;
  customCss?: string;
}

export interface BulkGeneratePdfOptions
  extends Omit<GeneratePdfOptions, "markdown" | "outputPath" | "baseDir"> {
  inputDir: string;
  outputDir?: string;
  recursive?: boolean;
}

export interface BulkResult {
  inputPath: string;
  outputPath: string;
  success: boolean;
  error?: string;
}

export interface BulkOutput {
  outputDir: string;
  results: BulkResult[];
}
