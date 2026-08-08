import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePath = path.join(root, "app", "apps", "appsData.ts");
const policyPath = path.join(root, "config", "application-production-policy.json");
const responsibilityPath = path.join(root, "config", "application-worker-responsibilities.json");
const workerId = Number.parseInt(
  process.env.OBSERRA_APPLICATION_WORKER_ID ?? process.argv[2] ?? "0",
  10,
);
const workerCount = Number.parseInt(
  process.env.OBSERRA_APPLICATION_WORKER_COUNT ?? "20",
  10,
);

if (!Number.isInteger(workerId) || workerId < 1 || workerId > workerCount) {
  throw new Error(`Worker ID must be between 1 and ${workerCount}. Received ${workerId}.`);
}

const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const responsibilities = JSON.parse(fs.readFileSync(responsibilityPath, "utf8"));
const allocation = policy.portfolioWorkerAllocation ?? {};
if (
  allocation.totalLogicalWorkers !== 36
  || allocation.applicationWorkers !== 20
  || allocation.courseWorkers !== 16
  || allocation.applicationWorkers + allocation.courseWorkers !== allocation.totalLogicalWorkers
) {
  throw new Error(
    "Portfolio worker allocation must remain fixed at 36 total: "
      + "20 application workers and 16 course workers.",
  );
}
if (policy.workerPool?.logicalWorkers !== workerCount) {
  throw new Error(
    `Policy worker count ${policy.workerPool?.logicalWorkers} does not match runtime count ${workerCount}.`,
  );
}
if (workerCount !== allocation.applicationWorkers) {
  throw new Error(
    `Application runtime count ${workerCount} does not match the approved `
      + `application allocation ${allocation.applicationWorkers}.`,
  );
}
if (
  responsibilities.portfolio?.totalWorkers !== 36
  || responsibilities.portfolio?.applicationWorkers !== 20
  || responsibilities.portfolio?.academyWorkers !== 16
  || responsibilities.portfolio?.crossPoolBorrowingAllowed !== false
) {
  throw new Error("Application worker responsibility allocation is invalid.");
}
if (!Array.isArray(responsibilities.workers) || responsibilities.workers.length !== workerCount) {
  throw new Error(`Exactly ${workerCount} application worker responsibilities are required.`);
}
const responsibility = responsibilities.workers.find((item) => item.workerId === workerId);
if (!responsibility) {
  throw new Error(`Persistent responsibility is missing for application worker ${workerId}.`);
}
if (
  typeof responsibility.area !== "string"
  || responsibility.area.trim().length < 3
  || typeof responsibility.repository !== "string"
  || !responsibility.repository.startsWith("jblan2026-hub/")
  || !Number.isInteger(responsibility.priority)
  || responsibility.priority < 0
  || responsibility.priority > 100
) {
  throw new Error(`Application worker ${workerId} responsibility is incomplete or invalid.`);
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
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app.slug)) {
    findings.push(`${app.slug}: invalid slug`);
  }
  if (!app.name.trim()) findings.push(`${app.slug}: missing application name`);
  if (!allowedStatuses.has(app.status)) {
    findings.push(`${app.slug}: unsupported marketplace status ${app.status}`);
  }
  if (!app.category.trim()) findings.push(`${app.slug}: missing category`);
  if (!app.deployment.length) {
    findings.push(`${app.slug}: at least one deployment model is required`);
  }
  for (const model of app.deployment) {
    if (!allowedDeployments.has(model)) {
      findings.push(`${app.slug}: unsupported deployment model ${model}`);
    }
  }
}

const evidence = {
  schemaVersion: "1.2",
  portfolioWorkerCount: allocation.totalLogicalWorkers,
  applicationWorkerAllocation: allocation.applicationWorkers,
  courseWorkerAllocation: allocation.courseWorkers,
  workerId,
  workerName: `application-worker-${String(workerId).padStart(3, "0")}`,
  workerCount,
  persistentResponsibility: {
    area: responsibility.area,
    repository: responsibility.repository,
    priority: responsibility.priority,
    continuousUntilOwnerProductionAcceptance:
      responsibilities.continuousUntilOwnerProductionAcceptance === true,
    productionAcceptanceMarker: responsibilities.productionAcceptanceMarker,
  },
  assignedApplications: assigned.map((app) => app.slug),
  checkedApplications: assigned.length,
  findings,
  passed: findings.length === 0,
  generatedAt: new Date().toISOString(),
  claimBoundary:
    "This worker output proves its current validation and owner-assigned responsibility only. "
    + "It is not a live-worker, deployment, or production-completion claim without an "
    + "authenticated heartbeat and execution evidence.",
};

const outputDir = path.join(root, "release", "application-pipeline-evidence");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, `worker-${String(workerId).padStart(2, "0")}.json`),
  JSON.stringify(evidence, null, 2),
);

console.log(
  `[Application Production] worker ${workerId}/${workerCount}: ${assigned.length} `
    + `assigned application(s); responsibility=${responsibility.area}; `
    + "portfolio allocation 20 application + 16 course = 36 total.",
);
for (const app of assigned) {
  console.log(`- ${app.slug}: ${app.status} · ${app.deployment.join(", ")}`);
}
if (findings.length) throw new Error(findings.join("\n"));
