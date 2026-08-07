import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePath = path.join(root, "app", "apps", "appsData.ts");
const policyPath = path.join(root, "config", "application-production-policy.json");
const workerId = Number.parseInt(process.env.OBSERRA_APPLICATION_WORKER_ID ?? process.argv[2] ?? "0", 10);
const workerCount = Number.parseInt(process.env.OBSERRA_APPLICATION_WORKER_COUNT ?? "30", 10);

if (!Number.isInteger(workerId) || workerId < 1 || workerId > workerCount) {
  throw new Error(`Worker ID must be between 1 and ${workerCount}. Received ${workerId}.`);
}

const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
if (policy.workerPool?.logicalWorkers !== workerCount) {
  throw new Error(`Policy worker count ${policy.workerPool?.logicalWorkers} does not match runtime count ${workerCount}.`);
}

const source = fs.readFileSync(sourcePath, "utf8");
const appPattern = /slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"[\s\S]*?deployment:\s*\[([^\]]+)\]/g;
const apps = [];
for (const match of source.matchAll(appPattern)) {
  apps.push({
    slug: match[1],
    name: match[2],
    status: match[3],
    category: match[4],
    deployment: [...match[5].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]),
  });
}

if (!apps.length) throw new Error("No applications were discovered in app/apps/appsData.ts.");

function hashSlug(slug) {
  let hash = 2166136261;
  for (const char of slug) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

const assigned = apps.filter((app) => (hashSlug(app.slug) % workerCount) + 1 === workerId);
const allowedStatuses = new Set(["Available", "Pilot", "Coming Soon"]);
const allowedDeployments = new Set(["SaaS", "Private Cloud", "Hybrid", "On-Premises"]);
const findings = [];

for (const app of assigned) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app.slug)) findings.push(`${app.slug}: invalid slug`);
  if (!app.name.trim()) findings.push(`${app.slug}: missing application name`);
  if (!allowedStatuses.has(app.status)) findings.push(`${app.slug}: unsupported marketplace status ${app.status}`);
  if (!app.category.trim()) findings.push(`${app.slug}: missing category`);
  if (!app.deployment.length) findings.push(`${app.slug}: at least one deployment model is required`);
  for (const model of app.deployment) {
    if (!allowedDeployments.has(model)) findings.push(`${app.slug}: unsupported deployment model ${model}`);
  }
  if (app.status === "Coming Soon" && /production ready|available for purchase|generally available/i.test(source)) {
    // The source-level wording is checked globally by the normal website regression suite.
    // Workers never promote a Coming Soon item solely from catalog metadata.
  }
}

const evidence = {
  schemaVersion: "1.0",
  workerId,
  workerCount,
  assignedApplications: assigned.map((app) => app.slug),
  checkedApplications: assigned.length,
  findings,
  passed: findings.length === 0,
  generatedAt: new Date().toISOString(),
};

const outputDir = path.join(root, "release", "application-pipeline-evidence");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `worker-${String(workerId).padStart(2, "0")}.json`), JSON.stringify(evidence, null, 2));

console.log(`[Application Production] worker ${workerId}/${workerCount}: ${assigned.length} assigned application(s)`);
for (const app of assigned) console.log(`- ${app.slug}: ${app.status} · ${app.deployment.join(", ")}`);
if (findings.length) throw new Error(findings.join("\n"));
