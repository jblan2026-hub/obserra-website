#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_SOURCE = path.join(ROOT, "app", "academy", "courseData.ts");
const DEFAULT_OUTPUT = path.join(ROOT, "release", "learnworlds-course-shells");
const EXPECTED_COURSES = 60;

function fail(message) {
  console.error(`[learnworlds-course-shells] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { mode: "plan" };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--mode") args.mode = argv[++index];
    else if (token === "--source") args.source = argv[++index];
    else if (token === "--output") args.output = argv[++index];
    else if (token === "--help") args.help = true;
    else fail(`Unknown argument: ${token}`);
  }
  return args;
}

function printHelp() {
  console.log(`Usage:\n  node scripts/learnworlds-course-shells.mjs\n  node scripts/learnworlds-course-shells.mjs --mode validate\n\nOptions:\n  --source <courseData.ts path>\n  --output <output directory>`);
}

function parseCourseSpecs(sourceText) {
  const pattern = /\[\s*"([a-z0-9-]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g;
  const courses = [];
  for (const match of sourceText.matchAll(pattern)) {
    courses.push({
      id: match[1],
      title: match[2],
      level: match[3],
      department: match[4],
      track: match[5],
      focus: match[6],
    });
  }
  return courses;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function writeCsv(filePath, records) {
  const fields = [
    "sequence",
    "courseId",
    "title",
    "slug",
    "department",
    "track",
    "level",
    "accessType",
    "publicationState",
    "creationMethod",
    "templateCourseId",
    "ownerApprovalRequired",
  ];
  const lines = [
    fields.join(","),
    ...records.map((record) => fields.map((field) => csvCell(record[field])).join(",")),
  ];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function buildShells(courses) {
  return courses.map((course, index) => ({
    sequence: index + 1,
    courseId: course.id,
    title: course.title,
    slug: course.id,
    department: course.department,
    track: course.track,
    level: course.level,
    focus: course.focus,
    accessType: "Draft",
    publicationState: course.id === "cybersecurity-foundations" ? "Sandbox pilot" : "In production",
    creationMethod: course.id === "cybersecurity-foundations" ? "existing governed canary" : "clone governed master shell",
    templateCourseId: "cybersecurity-foundations-for-new-professionals",
    requiredSections: [
      "Course Welcome and Orientation",
      "Module 1",
      "Module 2",
      "Module 3",
      "Module 4",
      "Module 5",
      "Final Assessment and Completion",
    ],
    videoStandard: "Obserra Cinematic Executive Learning Standard",
    ownerApprovalRequired: true,
  }));
}

function validate(shells) {
  const findings = [];
  if (shells.length !== EXPECTED_COURSES) findings.push(`course-count:${shells.length}`);
  const ids = new Set();
  const slugs = new Set();
  for (const shell of shells) {
    if (!/^[a-z0-9][a-z0-9-]{1,120}$/.test(shell.courseId)) findings.push(`invalid-course-id:${shell.courseId}`);
    if (!/^[a-z0-9][a-z0-9-]{1,120}$/.test(shell.slug)) findings.push(`invalid-slug:${shell.courseId}`);
    if (ids.has(shell.courseId)) findings.push(`duplicate-course-id:${shell.courseId}`);
    if (slugs.has(shell.slug)) findings.push(`duplicate-slug:${shell.slug}`);
    if (shell.accessType !== "Draft") findings.push(`not-draft:${shell.courseId}`);
    if (!shell.ownerApprovalRequired) findings.push(`approval-not-required:${shell.courseId}`);
    if (shell.requiredSections.length !== 7) findings.push(`section-contract:${shell.courseId}`);
    ids.add(shell.courseId);
    slugs.add(shell.slug);
  }
  if (!ids.has("cybersecurity-foundations")) findings.push("canary-missing");
  return findings;
}

const args = parseArgs(process.argv);
if (args.help) {
  printHelp();
  process.exit(0);
}
if (!["plan", "validate"].includes(args.mode)) fail("--mode must be plan or validate.");

const sourcePath = path.resolve(args.source || DEFAULT_SOURCE);
const outputRoot = path.resolve(args.output || DEFAULT_OUTPUT);
if (!fs.existsSync(sourcePath)) fail(`Course source not found: ${sourcePath}`);

const courses = parseCourseSpecs(fs.readFileSync(sourcePath, "utf8"));
const shells = buildShells(courses);
const findings = validate(shells);
if (findings.length) fail(`Validation failed: ${findings.join(", ")}`);

const manifest = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  source: path.relative(ROOT, sourcePath).replaceAll("\\", "/"),
  schoolName: "Obserra EPI Academy",
  schoolId: "6a7a693d353feb69c94c7654",
  targetCount: EXPECTED_COURSES,
  shellCount: shells.length,
  supportedDeploymentMethod: "Create or retain the governed master course, then clone it within the same LearnWorlds school and keep every new shell in Draft until its release gates pass.",
  automationBoundary: "No automated LearnWorlds course creation is claimed until an authenticated, documented course creation endpoint or author session is proven.",
  shells,
};
manifest.manifestSha256 = sha256(JSON.stringify({ ...manifest, manifestSha256: undefined }));

if (args.mode === "validate") {
  console.log(JSON.stringify({
    passed: true,
    shellCount: shells.length,
    uniqueCourseIds: new Set(shells.map((shell) => shell.courseId)).size,
    uniqueSlugs: new Set(shells.map((shell) => shell.slug)).size,
    canaryCourseId: "cybersecurity-foundations",
  }, null, 2));
  process.exit(0);
}

writeJson(path.join(outputRoot, "learnworlds-course-shell-manifest.json"), manifest);
writeCsv(path.join(outputRoot, "learnworlds-course-shell-manifest.csv"), shells);
writeJson(path.join(outputRoot, "learnworlds-course-shell-validation.json"), {
  passed: true,
  shellCount: shells.length,
  findings: [],
  manifestSha256: manifest.manifestSha256,
  generatedAt: new Date().toISOString(),
});
console.log(`[learnworlds-course-shells] Generated ${shells.length} governed LearnWorlds course shells in ${outputRoot}.`);
