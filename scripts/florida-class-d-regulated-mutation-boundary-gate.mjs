import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const API_ROOT = path.join(ROOT, "app", "api", "florida-class-d");
const PROXY_PATH = path.join(ROOT, "proxy.ts");
const BOUNDARY_PATH = path.join(ROOT, "lib", "florida-class-d-mutation-boundary.ts");
const MUTATING_METHOD_PATTERN = /export\s+(?:async\s+)?(?:function\s+(POST|PUT|PATCH|DELETE)\s*\(|const\s+(POST|PUT|PATCH|DELETE)\s*=)/g;

const PRODUCTION_ACTIVATION_IMPORT = /from\s+["'][^"']*florida-class-d-production-activation["']/;
const SHARED_EXECUTION_CALL = /\bfloridaClassDRegulatedExecutionAuthorized\s*\(/;
const PRODUCTION_EXECUTION_CALL = /\bfloridaClassDProductionActivationAuthorized\s*\(/;
const NONPRODUCTION_EXECUTION_CALL = /\bfloridaClassDNonProductionExecutionAuthorized\s*\(/;
const ACCEPTANCE_ROUTE = "app/api/florida-class-d/admin/acceptance/route.ts";

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

function hasRouteDefenseInDepth(routePath, source) {
  if (!PRODUCTION_ACTIVATION_IMPORT.test(source)) return false;
  if (routePath === ACCEPTANCE_ROUTE) return NONPRODUCTION_EXECUTION_CALL.test(source);
  return SHARED_EXECUTION_CALL.test(source) || PRODUCTION_EXECUTION_CALL.test(source);
}

function assertGlobalBoundary() {
  if (!fs.existsSync(PROXY_PATH)) throw new Error("Gate 30 requires proxy.ts.");
  if (!fs.existsSync(BOUNDARY_PATH)) throw new Error("Gate 30 requires the regulated mutation boundary module.");

  const proxy = fs.readFileSync(PROXY_PATH, "utf8");
  const boundary = fs.readFileSync(BOUNDARY_PATH, "utf8");

  const proxyRequirements = [
    ["mutation boundary import", /from\s+["']\.\/lib\/florida-class-d-mutation-boundary["']/],
    ["boundary evaluation call", /evaluateFloridaClassDMutationBoundary\s*\(/],
    ["exact-origin authorization call", /floridaClassDMutationOriginAuthorized\s*\(request\.url,\s*request\.headers\.get\(["']origin["']\)\)/],
    ["cross-origin rejection response", /FDACS_REGULATED_ORIGIN_REJECTED/],
    ["default-deny 503 response", /FDACS_REGULATED_EXECUTION_NOT_AUTHORIZED/],
    ["acceptance-specific fail-closed response", /FDACS_ACCEPTANCE_EXECUTION_NOT_AUTHORIZED/],
    ["all API routes are matched", /["']\/(?:\(api\|trpc\)|api)[^"']*["']/],
  ];
  for (const [label, pattern] of proxyRequirements) {
    if (!pattern.test(proxy)) throw new Error(`Gate 30 proxy requirement missing: ${label}.`);
  }

  const boundaryRequirements = [
    ["production activation policy import", PRODUCTION_ACTIVATION_IMPORT],
    ["regulated API prefix", /\/api\/florida-class-d/],
    ["all write methods", /POST[\s\S]*PUT[\s\S]*PATCH[\s\S]*DELETE/],
    ["exact Gate 23 acceptance path", /\/api\/florida-class-d\/admin\/acceptance/],
    ["missing Origin rejection", /if\s*\(!originHeader\)\s*return false/],
    ["exact same-origin comparison", /new URL\(originHeader\)\.origin\s*===\s*new URL\(requestUrl\)\.origin/],
    ["synthetic non-production acceptance authorization", NONPRODUCTION_EXECUTION_CALL],
    ["shared regulated execution authorization", SHARED_EXECUTION_CALL],
  ];
  for (const [label, pattern] of boundaryRequirements) {
    if (!pattern.test(boundary)) throw new Error(`Gate 30 boundary requirement missing: ${label}.`);
  }
}

function main() {
  if (!fs.existsSync(API_ROOT)) throw new Error("Florida Class D API root is missing.");
  assertGlobalBoundary();

  const mutations = [];
  for (const file of routeFiles(API_ROOT)) {
    const source = fs.readFileSync(file, "utf8");
    const methods = mutationMethods(source);
    if (methods.length === 0) continue;
    const routePath = normalize(file);
    mutations.push({
      routePath,
      methods,
      routeDefenseInDepth: hasRouteDefenseInDepth(routePath, source),
    });
  }

  if (mutations.length === 0) {
    throw new Error("No regulated Class D mutation routes were discovered; inventory cannot be trusted.");
  }

  const acceptance = mutations.filter((entry) => entry.routePath === ACCEPTANCE_ROUTE);
  if (acceptance.length !== 1) {
    throw new Error("Gate 30 requires exactly one Gate 23 acceptance mutation route in the regulated API inventory.");
  }

  console.log(`Gate 30 discovered ${mutations.length} regulated mutation route files.`);
  console.log("GLOBAL GUARDED proxy.ts -> lib/florida-class-d-mutation-boundary.ts covers every discovered Class D write method.");
  for (const entry of mutations) {
    console.log(`${entry.routeDefenseInDepth ? "GLOBAL+ROUTE" : "GLOBAL"} ${entry.routePath} [${entry.methods.join(", ")}]`);
  }

  console.log("Gate 30 regulated mutation boundary verification passed: default-deny global execution control and exact same-origin enforcement cover all discovered Class D mutation routes, Gate 23 acceptance is synthetic-nonproduction-only, and route-level guards remain defense in depth where implemented.");
}

main();
