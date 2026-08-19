import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const policy = JSON.parse(
  fs.readFileSync(path.join(root, "config", "application-worker-scaling-policy.json"), "utf8"),
);
const applicationSource = fs.readFileSync(path.join(root, "app", "apps", "appsData.ts"), "utf8");
const applicationCount = [...applicationSource.matchAll(/slug:\s*"([^"]+)"/g)].length;

if (!Number.isInteger(applicationCount) || applicationCount < 1) {
  throw new Error("No applications were discovered for worker planning.");
}

const baseline = Number(policy.pool?.baselineWorkers);
const minimum = Number(policy.pool?.minimumWorkers);
const maximum = Number(policy.pool?.maximumWorkers);
const applicationsPerWorker = Number(policy.pool?.targetApplicationsPerWorker);
const requestedText = String(process.env.OBSERRA_DESIRED_WORKERS ?? "").trim();
const ownerApprovalReference = String(process.env.OBSERRA_OWNER_APPROVAL_REFERENCE ?? "").trim();
const runBudgetUsd = Number(process.env.OBSERRA_WORKER_RUN_BUDGET_USD ?? policy.cost?.defaultRunBudgetUsd);

for (const [name, value] of Object.entries({ baseline, minimum, maximum, applicationsPerWorker })) {
  if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer.`);
}
if (minimum > baseline || baseline > maximum) {
  throw new Error("Worker scaling bounds are inconsistent.");
}
if (!Number.isFinite(runBudgetUsd) || runBudgetUsd <= 0 || runBudgetUsd > Number(policy.cost?.maximumRunBudgetUsd)) {
  throw new Error("The requested worker run budget is outside the approved policy boundary.");
}

const calculated = Math.max(minimum, Math.ceil(applicationCount / applicationsPerWorker));
let desired = requestedText ? Number.parseInt(requestedText, 10) : Math.max(baseline, calculated);
if (!Number.isInteger(desired) || desired < minimum || desired > maximum) {
  throw new Error(`Desired workers must be between ${minimum} and ${maximum}.`);
}

if (
  desired > baseline
  && policy.authorization?.ownerApprovalReferenceRequiredAboveBaseline
  && ownerApprovalReference.length < Number(policy.authorization?.ownerApprovalReferenceMinimumLength ?? 8)
) {
  throw new Error("An owner approval reference is required to scale above the baseline worker pool.");
}

const workerIds = Array.from({ length: desired }, (_, index) => index + 1);
const plan = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  applicationCount,
  baselineWorkers: baseline,
  calculatedWorkers: calculated,
  desiredWorkers: desired,
  maximumWorkers: maximum,
  workerIds,
  runBudgetUsd,
  ownerApprovalReference: desired > baseline ? ownerApprovalReference : null,
  automaticProductionDeploymentAllowed: false,
  automaticPricingChangeAllowed: false,
  automaticCreditPurchaseAllowed: false,
};

const outputDirectory = path.join(root, "release", "application-pipeline-evidence");
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "worker-plan.json"), JSON.stringify(plan, null, 2));

const githubOutput = process.env.GITHUB_OUTPUT;
if (githubOutput) {
  fs.appendFileSync(githubOutput, `workers=${JSON.stringify(workerIds)}\n`);
  fs.appendFileSync(githubOutput, `desired_workers=${desired}\n`);
  fs.appendFileSync(githubOutput, `run_budget_usd=${runBudgetUsd}\n`);
}

console.log(`[Application Production] planned ${desired} worker(s) for ${applicationCount} application(s).`);
// Transient no-op used only to establish a user-authored PR head after governed evidence automation.
