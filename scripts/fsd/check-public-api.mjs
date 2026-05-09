import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const rootDir = process.cwd();
const scanDirs = ["src", "server"];
const allowedFiles = new Set([]);
const fileExtensions = new Set([".ts", ".vue", ".js", ".mjs"]);
const deepImportPattern =
  /from\s+["']~\/(?:entities|features|widgets|shared)\/[^"']+\/(?:ui|model|lib|api|config)\//g;

const collectedFiles = [];

const shouldScan = (filePath) => {
  for (const ext of fileExtensions) {
    if (filePath.endsWith(ext)) {
      return true;
    }
  }
  return false;
};

const walk = async (dir) => {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (shouldScan(fullPath)) {
      collectedFiles.push(fullPath);
    }
  }
};

for (const target of scanDirs) {
  await walk(join(rootDir, target));
}

const violations = [];

for (const file of collectedFiles) {
  const relPath = relative(rootDir, file).replaceAll("\\", "/");
  if (allowedFiles.has(relPath) || relPath.endsWith("/index.ts")) {
    continue;
  }

  const content = await readFile(file, "utf8");
  const matches = content.match(deepImportPattern);
  if (!matches) {
    continue;
  }

  violations.push({
    relPath,
    imports: [...new Set(matches.map((entry) => entry.replace(/^from\s+/, "")))]
  });
}

if (violations.length > 0) {
  console.error("FSD deep-import violations found:");
  for (const violation of violations) {
    console.error(`- ${violation.relPath}`);
    for (const importPath of violation.imports) {
      console.error(`  ${importPath}`);
    }
  }
  process.exit(1);
}

console.log("FSD import check passed.");
