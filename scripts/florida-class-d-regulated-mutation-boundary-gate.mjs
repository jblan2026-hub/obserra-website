import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const API_ROOT = path.join(ROOT, "app", "api", "florida-class-d");
const MUTATING_METHOD_PATTERN = /export\s+(?:async\s+)?(?:function\s+(POST|PUT|PATCH|DELETE)\s*\(|const\s+(POST|PUT|PATCH|DELETE)\s*=)/g;

const PRODUCTION_ACTIVATION_IMPORT = /from\s+["'][^"']*florida-class-d-production-activation["']/;
const SHARED_EXECUTION_CALL = /\bfloridaClassDRegulatedExecutionAuthorized\s*\(/;
const PRODUCTION_EXECUTION_CALL = /\bfloridaClassDProductionActivationAuthorized\s*\(/;
const NONPRODUCTION_EXECUTION_CALL = /\bfloridaClassDNonProductionExecutionAuthorized\s*\(/;

const NONPRODUCTION_ONLY_MUTATION_ROUTES = new Set([
  "app/api/florida-class-d/admin/acceptance/route.ts",
]);

function normalize(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function routeFiles(directory) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...routeFiles(absolute));
    else if (entry.isFile() && entry.name === "route.ts") results.push(absolute);
  }
  return results.sort();
}

function mutationMethods(source) {
  const methods = new Set();
  for (const match of source.matchAll(MUTATING_METHOD_PATTERN)) {
    methods.add(match[1] || match[2]);
  }
  return [...methods].sort();
}

function hasApprovedGuard(routePath, source) {
  if (!PRODUCTION_ACTIVATION_IMPORT.test(source)) return false;
  if (NONPRODUCTION_ONLY_MUTATION_ROUTES.has(routePath)) {
    return NONPRODUCTION_EXECUTION_CALL.test(source);
  }
  return SHARED_EXECUTION_CALL.test(source) || PRODUCTION_EXECUTION_CALL.test(source);
}

function main() {
  if (!fs.existsSync(API_ROOT)) {
    throw new Error("Florida Class D API root is missing.");
  }

  const mutations = [];
  const failures = [];
  for (const file of routeFiles(API_ROOT)) {
    const source = fs.readFileSync(file, "utf8");
    const methods = mutationMethods(source);
    if (methods.length === 0) continue;

    const routePath = normalize(file);
    const guarded = hasApprovedGuard(routePath, source);
    mutations.push({ routePath, methods, guarded });
    if (!guarded) failures.push(`${routePath} [${methods.join(", ")}]`);
  }

  if (mutations.length === 0) {
    throw new Error("No regulated Class D mutation routes were discovered; inventory cannot be trusted.");
  }

  console.log(`Gate 30 discovered ${mutations.length} regulated mutation route files.`);
  for (const entry of mutations) {
    console.log(`${entry.guarded ? "GUARDED" : "UNGUARDED"} ${entry.routePath} [${entry.methods.join(", ")}]`);
  }

  if (failures.length > 0) {
    throw new Error(
      `Gate 30 found ${failures.length} regulated mutation route(s) without an approved execution boundary:\n${failures.map((item) => `- ${item}`).join("\n")}`,
    );
  }

  console.log("Gate 30 regulated mutation boundary verification passed.");
}

main();
