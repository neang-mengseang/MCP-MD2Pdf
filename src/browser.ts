import { existsSync } from "fs";
import { platform } from "os";

const EDGE_PATHS: Record<string, string[]> = {
  win32: [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ],
  darwin: ["/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"],
  linux: ["/usr/bin/microsoft-edge"],
};

const CHROME_PATHS: Record<string, string[]> = {
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ],
  darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ],
};

export function resolveBrowserExecutable(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const p = platform();

  for (const path of [...(EDGE_PATHS[p] || []), ...(CHROME_PATHS[p] || [])]) {
    if (existsSync(path)) return path;
  }

  return undefined;
}
