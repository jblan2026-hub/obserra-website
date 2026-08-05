import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultReleaseRoot = "C:\\Users\\jblan\\OneDrive\\Desktop\\Final Production Release Courses";
const releaseRoot = path.resolve(process.argv[2] || defaultReleaseRoot);
const catalogPath = path.join(repoRoot, "app", "academy", "course-commerce-catalog.json");
const dryRun = process.argv.includes("--dry-run");

function fail(message) {
  console.error(`[Obserra Academy Publisher] ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (!fs.existsSync(releaseRoot)) fail(`Course release root not found: ${releaseRoot}`);

const courses = [];
for (const entry of fs.readdirSync(releaseRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const finalDir = path.join(releaseRoot, entry.name, "FINAL");
  const manifestPath = path.join(finalDir, "course-manifest.json");
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = readJson(manifestPath);
  const courseId = manifest?.course?.id;
  const title = manifest?.course?.title;
  const version = manifest?.release?.version;
  const priceUsd = Number(manifest?.commerce?.priceUsd);

  if (!courseId || !title || !version || !Number.isFinite(priceUsd) || priceUsd <= 0) {
    fail(`${manifestPath} must define course.id, course.title, release.version, and a positive commerce.priceUsd`);
  }

  courses.push({
    courseId,
    title,
    version,
    priceUsd,
    paymentLink: manifest?.commerce?.paymentLink || null,
    stripePriceId: manifest?.commerce?.stripePriceId || null,
    accessPolicy: "until-completion",
    completionThreshold: Number(manifest?.completion?.passingScore || 80),
    certificateEnabled: manifest?.completion?.certificateEnabled !== false,
    publishedAt: new Date().toISOString(),
  });
}

courses.sort((left, right) => left.title.localeCompare(right.title));
if (!courses.length) fail(`No publishable FINAL course releases found under ${releaseRoot}`);

const generatedAt = new Date().toISOString();
fs.writeFileSync(catalogPath, `${JSON.stringify({ schemaVersion: "1.0", generatedAt, courses }, null, 2)}\n`);
console.log(`[Obserra Academy Publisher] Synced ${courses.length} one-time purchase courses`);

if (!dryRun && process.env.OBSERRA_AUTO_GIT_PUSH === "true") {
  const generatedFiles = ["app/academy/course-commerce-catalog.json"];
  execFileSync("git", ["add", ...generatedFiles], { cwd: repoRoot, stdio: "inherit" });
  const status = execFileSync("git", ["status", "--porcelain", ...generatedFiles], { cwd: repoRoot, encoding: "utf8" }).trim();
  if (status) {
    execFileSync("git", ["commit", "-m", `Publish Academy course commerce catalog (${courses.length} courses)`], { cwd: repoRoot, stdio: "inherit" });
    execFileSync("git", ["push", "origin", "main"], { cwd: repoRoot, stdio: "inherit" });
  }
}
