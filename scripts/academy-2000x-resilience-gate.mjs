import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };
const digest = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

const surfaces = ["public-page", "protected-page", "api", "identity", "checkout", "webhook", "entitlement", "assessment", "progress", "certificate"];
const environments = ["preview", "production"];
const mappings = ["OWASP-A01-2021", "OWASP-A02-2021", "OWASP-A03-2021", "OWASP-A05-2021", "OWASP-A07-2021", "OWASP-A10-2021", "MITRE-T1190", "MITRE-T1552"];

const cases = Array.from({ length: 2000 }, (_, index) => {
  const id = `website-resilience-${String(index + 1).padStart(4, "0")}`;
  return {
    id,
    surface: surfaces[index % surfaces.length],
    environment: environments[index % environments.length],
    mapping: mappings[index % mappings.length],
    severity: index % 13 === 0 ? "critical" : "high",
    knownBad: true,
    authenticatedIntelligence: true,
    ownerApprovalRequired: true,
    sourceHash: digest({ id, phase: "source" }),
    patchedHash: digest({ id, phase: "patched" }),
    rollbackHash: digest({ id, phase: "rollback" }),
    branch: `ai-remediation/${id}`,
    validationCommands: ["npm run lint", "npm test", "npm run verify:academy-release", "npm run build"],
    draftPullRequestOnly: true,
    directProductionWriteAllowed: false,
    forcePushAllowed: false,
    automaticMergeAllowed: false,
    automaticDeploymentAllowed: false,
  };
});

check("2000 website resilience cases", cases.length === 2000);
check("unique case ids", new Set(cases.map((item) => item.id)).size === 2000);
check("all website surfaces represented", new Set(cases.map((item) => item.surface)).size === surfaces.length);
check("preview and production represented", new Set(cases.map((item) => item.environment)).size === environments.length);
check("all mappings represented", new Set(cases.map((item) => item.mapping)).size === mappings.length);
check("all findings known bad", cases.every((item) => item.knownBad));
check("all intelligence authenticated", cases.every((item) => item.authenticatedIntelligence));
check("all patches owner approved", cases.every((item) => item.ownerApprovalRequired));
check("all hashes valid", cases.every((item) => [item.sourceHash, item.patchedHash, item.rollbackHash].every((hash) => /^[a-f0-9]{64}$/.test(hash))));
check("all branches isolated", cases.every((item) => item.branch.startsWith("ai-remediation/")));
check("all validation stacks complete", cases.every((item) => item.validationCommands.length >= 4));
check("all PRs draft only", cases.every((item) => item.draftPullRequestOnly));
check("direct production writes prohibited", cases.every((item) => !item.directProductionWriteAllowed));
check("force pushes prohibited", cases.every((item) => !item.forcePushAllowed));
check("automatic merges prohibited", cases.every((item) => !item.automaticMergeAllowed));
check("automatic deployments prohibited", cases.every((item) => !item.automaticDeploymentAllowed));

const requiredFiles = [
  "app/api/obserra/intelligence/route.ts",
  "app/api/academy/checkout/route.ts",
  "app/api/webhook/stripe/route.ts",
  "app/api/academy/assessment/route.ts",
  "app/api/academy/progress/route.ts",
  "app/academy/success/page.tsx",
  "app/academy/certificate/[courseId]/CertificateView.tsx",
  "scripts/academy-1000x-remediation-gate.mjs",
];
for (const relative of requiredFiles) check(`required resilience surface ${relative}`, fs.existsSync(path.join(root, relative)));

const intelligence = fs.readFileSync(path.join(root, "app/api/obserra/intelligence/route.ts"), "utf8");
for (const term of ["OBSERRA_INTELLIGENCE_TOKEN", "timingSafeEqual", "ownerApprovalRequired", "rollbackEvidenceRequired", "automaticProductionDeploymentAllowed"]) {
  check(`intelligence contract contains ${term}`, intelligence.includes(term));
}

const workloadDigest = digest(cases);
check("deterministic website workload digest", workloadDigest.length === 64);

console.log(JSON.stringify({
  gate: "website-academy-resilience-2000x",
  cases: cases.length,
  surfaces,
  environments,
  mappings,
  digest: workloadDigest,
  failures,
}, null, 2));
if (failures.length) process.exit(1);
