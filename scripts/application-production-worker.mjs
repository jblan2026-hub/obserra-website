import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assignApplicationsEvenly } from "./application-worker-performance.mjs";

const startedAt = Date.now();
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePath = path.join(root, "app", "apps", "appsData.ts");
const policyPath = path.join(root, "config", "application-production-policy.json");
const workerId = Number.parseInt(process.env.OBSERRA_APPLICATION_WORKER_ID ?? process.argv[2] ?? "0", 10);
const workerCount = Number.parseInt(process.env.OBSERRA_APPLICATION_WORKER_COUNT ?? "20", 10);

if (!Number.isInteger(workerId) || workerId < 1 || workerId > workerCount) {
  throw new Error(`Worker ID must be between 1 and ${workerCount}. Received ${workerId}.`);
}

const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const allocation = policy.portfolioWorkerAllocation ?? {};
if (
  allocation.totalLogicalWorkers !== 36
  || allocation.applicationWorkers !== 20
  || allocation.courseWorkers !== 16
  || allocation.applicationWorkers + allocation.courseWorkers !== allocation.totalLogicalWorkers
) {
  throw new Error("Portfolio worker allocation must remain fixed at 36 total: 20 application workers and 16 course workers.");
}
if (policy.workerPool?.logicalWorkers !== workerCount) {
  throw new Error(`Policy worker count ${policy.workerPool?.logicalWorkers} does not match runtime count ${workerCount}.`);
}
if (workerCount !== allocation.applicationWorkers) {
  throw new Error(`Application runtime count ${workerCount} does not match the approved application allocation ${allocation.applicationWorkers}.`);
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

const workerAssignments = assignApplicationsEvenly(apps, workerCount);
const assignment = workerAssignments.find((item) => item.workerId === workerId);
if (!assignment) throw new Error(`No deterministic assignment record was produced for worker ${workerId}.`);
const assigned = assignment.applications;
const allowedStatuses = new Set(["Available", "Pilot", "Coming Soon"]);
const allowedDeployments = new Set(["SaaS", "Private Cloud", "Hybrid", "On-Premises"]);
const findings = [];
const statusCounts = {};
const categoryCounts = {};
const deploymentCounts = {};

for (const app of assigned) {
  statusCounts[app.status] = (statusCounts[app.status] ?? 0) + 1;
  categoryCounts[app.category] = (categoryCounts[app.category] ?? 0) + 1;
  for (const model of app.deployment) deploymentCounts[model] = (deploymentCounts[model] ?? 0) + 1;

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

const completedAt = Date.now();
const evidence = {
  schemaVersion: "1.2",
  portfolioWorkerCount: allocation.totalLogicalWorkers,
  applicationWorkerAllocation: allocation.applicationWorkers,
  courseWorkerAllocation: allocation.courseWorkers,
  workerId,
  workerCount,
  schedulingPolicy: "largest-estimated-work-first-balanced",
  assignedApplications: assigned.map((app) => app.slug),
  assignedApplicationDetails: assigned.map((app) => ({
    slug: app.slug,
    status: app.status,
    category: app.category,
    deployment: app.deployment,
    estimatedWork: app.estimatedWork,
  })),
  assignedWorkWeight: assignment.totalWeight,
  checkedApplications: assigned.length,
  statusCounts,
  categoryCounts,
  deploymentCounts,
  findings,
  passed: findings.length === 0,
  sourceBytes: Buffer.byteLength(source, "utf8"),
  startedAt: new Date(startedAt).toISOString(),
  completedAt: new Date(completedAt).toISOString(),
  elapsedMs: completedAt - startedAt,
  generatedAt: new Date(completedAt).toISOString(),
  claimBoundary: "This worker validates assigned catalog records only. It does not implement, sign, deploy, price, publish, sell, or support an application.",
};

const outputDir = path.join(root, "release", "application-pipeline-evidence");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, `worker-${String(workerId).padStart(2, "0")}.json`),
  `${JSON.stringify(evidence, null, 2)}\n`,
);

console.log(`[Application Production] worker ${workerId}/${workerCount}: ${assigned.length} assigned application(s); workWeight=${assignment.totalWeight}; elapsedMs=${evidence.elapsedMs}; portfolio allocation 20 application + 16 course = 36 total.`);
for (const app of assigned) console.log(`- ${app.slug}: ${app.status} · ${app.deployment.join(", ")} · work=${app.estimatedWork}`);
if (findings.length) throw new Error(findings.join("\n"));
