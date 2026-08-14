#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const defaultCatalogPath = path.join(root, "app", "academy", "courseData.ts");
const defaultMappingsPath = path.join(root, "config", "learnworlds-products.json");
const defaultOutputPath = path.join(root, "release", "learnworlds-course-shells", "learnworlds-course-shell-plan.json");

function fail(message) {
  console.error(`[learnworlds-course-shell-plan] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const result = { validateOnly: false };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--catalog") result.catalogPath = argv[++index];
    else if (token === "--mappings") result.mappingsPath = argv[++index];
    else if (token === "--output") result.outputPath = argv[++index];
    else if (token === "--validate-only") result.validateOnly = true;
    else if (token === "--help") result.help = true;
    else fail(`Unknown argument: ${token}`);
  }
  return result;
}

function printHelp() {
  console.log(`Usage:\n  node scripts/learnworlds-course-shell-plan.mjs\n  node scripts/learnworlds-course-shell-plan.mjs --validate-only\n\nOptions:\n  --catalog <courseData.ts>\n  --mappings <learnworlds-products.json>\n  --output <plan.json>`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Unable to read ${filePath}: ${error.message}`);
  }
}

function parseCatalog(sourceText) {
  const pattern = /\[\s*"([a-z0-9-]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g;
  const courses = [];
  for (const match of sourceText.matchAll(pattern)) {
    courses.push({
      courseId: match[1],
      title: match[2],
      level: match[3],
      department: match[4],
      track: match[5],
      focus: match[6],
    });
  }
  return courses;
}

function canonicalSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function hash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function validatePlan(plan) {
  const findings = [];
  if (plan.schemaVersion !== "1.0.0") findings.push("schema-version:unsupported");
  if (plan.targetCourseCount !== 60) findings.push(`target-course-count:${plan.targetCourseCount}`);
  if (plan.shells.length !== plan.targetCourseCount) findings.push("shell-count:mismatch");
  if (plan.preserveCount + plan.createCount !== plan.targetCourseCount) findings.push("action-count:mismatch");

  const courseIds = new Set();
  const slugs = new Set();
  for (const shell of plan.shells) {
    if (!/^[a-z0-9][a-z0-9-]{1,120}$/.test(shell.courseId)) findings.push(`course-id:invalid:${shell.courseId}`);
    if (!/^[a-z0-9][a-z0-9-]{1,120}$/.test(shell.learnWorldsCourseId)) findings.push(`learnworlds-course-id:invalid:${shell.courseId}`);
    if (courseIds.has(shell.courseId)) findings.push(`course-id:duplicate:${shell.courseId}`);
    if (slugs.has(shell.learnWorldsCourseId)) findings.push(`learnworlds-course-id:duplicate:${shell.learnWorldsCourseId}`);
    courseIds.add(shell.courseId);
    slugs.add(shell.learnWorldsCourseId);
    if (!['preserve', 'create-draft'].includes(shell.action)) findings.push(`action:invalid:${shell.courseId}`);
    if (shell.publish !== false) findings.push(`publish:must-be-false:${shell.courseId}`);
    if (shell.checkoutEnabled !== false) findings.push(`checkout:must-be-false:${shell.courseId}`);
    if (shell.visibility !== "draft-private") findings.push(`visibility:invalid:${shell.courseId}`);
  }

  const canary = plan.shells.find((shell) => shell.courseId === "cybersecurity-foundations");
  if (!canary) findings.push("canary:missing");
  else if (canary.action !== "preserve") findings.push("canary:must-preserve-existing");

  return findings;
}

const args = parseArgs(process.argv);
if (args.help) {
  printHelp();
  process.exit(0);
}

const catalogPath = path.resolve(args.catalogPath || defaultCatalogPath);
const mappingsPath = path.resolve(args.mappingsPath || defaultMappingsPath);
const outputPath = path.resolve(args.outputPath || defaultOutputPath);
if (!fs.existsSync(catalogPath)) fail(`Catalog not found: ${catalogPath}`);
if (!fs.existsSync(mappingsPath)) fail(`Mappings not found: ${mappingsPath}`);

const courses = parseCatalog(fs.readFileSync(catalogPath, "utf8"));
if (courses.length !== 60) fail(`Expected exactly 60 governed website courses, found ${courses.length}.`);

const mappings = readJson(mappingsPath);
const mappedProducts = Array.isArray(mappings.products) ? mappings.products : [];
const mappingsByCourse = new Map(mappedProducts.map((item) => [String(item.courseId), item]));

const shells = courses.map((course) => {
  const existing = mappingsByCourse.get(course.courseId);
  const learnWorldsCourseId = existing?.learnWorldsCourseId || canonicalSlug(course.title);
  return {
    ...course,
    learnWorldsCourseId,
    action: existing ? "preserve" : "create-draft",
    visibility: "draft-private",
    publish: false,
    checkoutEnabled: false,
    priceActivation: "blocked-until-course-release",
    contentState: course.courseId === "cybersecurity-foundations" ? "existing-canary" : "shell-only",
    learnerAccess: existing ? "preserve-existing-state" : "none",
    existingProductId: existing?.productId || null,
    existingPackageId: existing?.packageId || null,
  };
});

const plan = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  sourceCatalog: path.relative(root, catalogPath).replaceAll("\\", "/"),
  sourceMappings: path.relative(root, mappingsPath).replaceAll("\\", "/"),
  targetCourseCount: shells.length,
  preserveCount: shells.filter((shell) => shell.action === "preserve").length,
  createCount: shells.filter((shell) => shell.action === "create-draft").length,
  conflictCount: 0,
  executionAuthorized: false,
  executionMode: "plan-only",
  shells,
};
plan.planSha256 = hash({ ...plan, generatedAt: undefined, planSha256: undefined });

const findings = validatePlan(plan);
if (findings.length) fail(`Plan validation failed: ${findings.join(", ")}`);

if (!args.validateOnly) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({
  passed: true,
  targetCourseCount: plan.targetCourseCount,
  preserveCount: plan.preserveCount,
  createCount: plan.createCount,
  conflictCount: plan.conflictCount,
  executionAuthorized: plan.executionAuthorized,
  outputPath: args.validateOnly ? null : outputPath,
  planSha256: plan.planSha256,
}, null, 2));