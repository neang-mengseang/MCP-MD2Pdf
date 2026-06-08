import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

let latestPublished;
try {
  latestPublished = execSync(`npm view ${pkg.name} version`, { encoding: "utf-8" }).trim();
} catch {
  // Package not yet published
  latestPublished = "0.0.0";
}

function parseVersion(v) {
  const [major, minor, patch] = v.replace(/^v/, "").split(".").map(Number);
  return { major, minor, patch };
}

function compareVersions(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

const local = parseVersion(pkg.version);
const published = parseVersion(latestPublished);

if (compareVersions(local, published) <= 0) {
  // Auto-increment patch version
  const newVersion = `${published.major}.${published.minor}.${published.patch + 1}`;
  pkg.version = newVersion;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`Auto-bumped version: ${pkg.version} -> ${newVersion}`);
} else {
  console.log(`Version ${pkg.version} is already ahead of published ${latestPublished}`);
}
