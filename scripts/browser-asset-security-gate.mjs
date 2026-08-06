import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif"]);
const sourceFiles = [];
const publicAssets = new Set();

function walk(directory, visitor) {
  for (const entry of readdirSync(directory)) {
    if ([".git", ".next", "node_modules"].includes(entry)) continue;
    const absolute = join(directory, entry);
    const stats = statSync(absolute);
    if (stats.isDirectory()) walk(absolute, visitor);
    else visitor(absolute);
  }
}

for (const directory of ["app", "components", "lib"]) {
  const absolute = join(root, directory);
  if (existsSync(absolute)) {
    walk(absolute, (file) => {
      if (sourceExtensions.has(extname(file))) sourceFiles.push(file);
    });
  }
}

const publicDirectory = join(root, "public");
if (existsSync(publicDirectory)) {
  walk(publicDirectory, (file) => publicAssets.add(`/${relative(publicDirectory, file).replaceAll("\\", "/")}`));
}

const failures = [];
const warnings = [];
const imageReferences = new Set();
const routeFiles = sourceFiles.filter((file) => /app[\\/].+[\\/](page|layout|route)\.(ts|tsx|js|jsx)$/.test(file));

for (const file of sourceFiles) {
  const relativePath = relative(root, file).replaceAll("\\", "/");
  const content = readFileSync(file, "utf8");

  for (const match of content.matchAll(/(?:src|href)=["'`]\/(?!\/)([^"'`?#]+\.(?:png|jpe?g|webp|avif|svg|gif))/gi)) {
    imageReferences.add(`/${match[1]}`);
  }

  if (/<img\b/i.test(content)) {
    for (const match of content.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt\s*=/.test(match[0])) failures.push(`${relativePath}: img element missing alt text`);
    }
  }

  if (/target=["']_blank["']/.test(content) && !/rel=["'][^"']*noopener/.test(content)) {
    failures.push(`${relativePath}: target=_blank link missing rel=noopener`);
  }

  if (/onClick=/.test(content) && /<(div|span)\b[^>]*onClick=/.test(content) && !/(role=|tabIndex=)/.test(content)) {
    warnings.push(`${relativePath}: non-semantic clickable element requires accessibility review`);
  }

  if (/\bTODO\b|\bFIXME\b|coming soon|placeholder/i.test(content) && !/test|schema|docs/i.test(relativePath)) {
    warnings.push(`${relativePath}: contains unfinished-content marker`);
  }
}

for (const imageReference of imageReferences) {
  if (!publicAssets.has(imageReference)) failures.push(`Missing public asset referenced by source: ${imageReference}`);
}

const nextConfigPath = join(root, "next.config.ts");
assert.ok(existsSync(nextConfigPath), "next.config.ts is required");
const nextConfig = readFileSync(nextConfigPath, "utf8");
for (const requiredHeader of [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Cross-Origin-Opener-Policy",
]) {
  if (!nextConfig.includes(requiredHeader)) failures.push(`Missing security header configuration: ${requiredHeader}`);
}
if (!nextConfig.includes("poweredByHeader: false")) failures.push("Next.js powered-by disclosure is not disabled");
if (!nextConfig.includes("Cache-Control") || !nextConfig.includes("no-store")) failures.push("Protected-route no-store policy is missing");

const layoutPath = join(root, "app", "layout.tsx");
assert.ok(existsSync(layoutPath), "Root app/layout.tsx is required");
const layout = readFileSync(layoutPath, "utf8");
for (const metadataSignal of ["title", "description"]) {
  if (!layout.includes(metadataSignal)) failures.push(`Root metadata missing ${metadataSignal}`);
}
if (!/lang=["']en["']/.test(layout)) failures.push("Root html element must declare lang=en");

if (routeFiles.length < 10) failures.push(`Insufficient route surface detected: ${routeFiles.length}`);
if (publicAssets.size === 0) failures.push("No public assets were discovered");

console.log(JSON.stringify({
  passed: failures.length === 0,
  macroGate: "browser-asset-accessibility-security",
  metrics: {
    sourceFileCount: sourceFiles.length,
    routeFileCount: routeFiles.length,
    publicAssetCount: publicAssets.size,
    referencedImageCount: imageReferences.size,
    warningCount: warnings.length,
  },
  failures,
  warnings,
}, null, 2));

assert.equal(failures.length, 0, `${failures.length} browser, asset, accessibility, or security gate failure(s)`);
