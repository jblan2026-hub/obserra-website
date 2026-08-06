import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packagePath = path.join(root, "package.json");
const lockPath = path.join(root, "package-lock.json");

assert.ok(fs.existsSync(packagePath), "package.json is required");
assert.ok(fs.existsSync(lockPath), "package-lock.json is required for reproducible installs");

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));

assert.equal(lock.lockfileVersion >= 3, true, "package-lock.json must use npm lockfileVersion 3 or newer");
assert.equal(lock.name, pkg.name, "package-lock package name must match package.json");
assert.equal(pkg.private, true, "application package must remain private to prevent accidental npm publication");

const allDependencies = {
  ...(pkg.dependencies ?? {}),
  ...(pkg.devDependencies ?? {}),
  ...(pkg.optionalDependencies ?? {}),
};

const unsupportedSources = Object.entries(allDependencies).filter(([, version]) =>
  /^(git\+|git:|github:|https?:|file:|link:)/i.test(String(version)),
);
assert.deepEqual(unsupportedSources, [], `Unsupported dependency sources detected: ${JSON.stringify(unsupportedSources)}`);

const wildcardDependencies = Object.entries(allDependencies).filter(([, version]) =>
  ["*", "latest", "next"].includes(String(version).trim().toLowerCase()),
);
assert.deepEqual(wildcardDependencies, [], `Unbounded dependency versions detected: ${JSON.stringify(wildcardDependencies)}`);

for (const required of ["next", "react", "react-dom"]) {
  assert.ok(pkg.dependencies?.[required], `${required} must be a production dependency`);
  assert.ok(lock.packages?.[`node_modules/${required}`]?.version, `${required} must be resolved in package-lock.json`);
}

for (const forbidden of ["typescript", "eslint", "@types/node", "@types/react", "@types/react-dom"]) {
  assert.equal(Boolean(pkg.dependencies?.[forbidden]), false, `${forbidden} must not be a production dependency`);
}

const scripts = pkg.scripts ?? {};
for (const requiredScript of ["build", "lint", "test", "verify:release"]) {
  assert.ok(scripts[requiredScript], `Missing required npm script: ${requiredScript}`);
}
assert.match(scripts["verify:release"], /npm run build/, "verify:release must include a production build");

const sensitivePatterns = [
  /sk_live_[0-9a-zA-Z]+/g,
  /sk_test_[0-9a-zA-Z]+/g,
  /ghp_[0-9a-zA-Z]{20,}/g,
  /github_pat_[0-9a-zA-Z_]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
];
const scannedExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".yml", ".yaml", ".md"]);
const ignoredDirectories = new Set([".git", ".next", "node_modules"]);
const secretFindings = [];

function scanDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
      continue;
    }
    if (!scannedExtensions.has(path.extname(entry.name))) continue;
    const content = fs.readFileSync(fullPath, "utf8");
    for (const pattern of sensitivePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) secretFindings.push(path.relative(root, fullPath));
    }
  }
}
scanDirectory(root);
assert.deepEqual([...new Set(secretFindings)], [], `Potential embedded secrets detected: ${[...new Set(secretFindings)].join(", ")}`);

console.log(JSON.stringify({
  passed: true,
  macroGate: "software-supply-chain-readiness",
  dependencyCount: Object.keys(allDependencies).length,
  lockfileVersion: lock.lockfileVersion,
  reproducibleInstall: true,
  unsupportedSources: 0,
  unboundedVersions: 0,
  embeddedSecretFindings: 0,
}, null, 2));
