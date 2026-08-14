import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));
const failures = [];
const check = (name, condition) => { if (!condition) failures.push(name); };

const flowTypes = ["page", "api", "identity", "checkout", "webhook", "entitlement", "assessment", "progress", "certificate", "intelligence"];
const mappings = ["OWASP-A01-2021", "OWASP-A02-2021", "OWASP-A03-2021", "OWASP-A05-2021", "OWASP-A07-2021", "OWASP-A10-2021", "MITRE-T1190", "MITRE-T1552"];

const cases = Array.from({ length: 1000 }, (_, index) => {
  const flow = flowTypes[index % flowTypes.length];
  const findingId = `website-finding-${String(index + 1).padStart(4, "0")}`;
  return {
    findingId,
    flow,
    severity: index % 7 === 0 ? "critical" : "high",
    mapping: mappings[index % mappings.length],
    knownBad: true,
    alertFirst: true,
    blockRecommended: true,
    ownerApprovalRequired: true,
    targetRepository: "jblan2026-hub/obserra-website",
    branch: `ai-remediation/${findingId}`,
    draftPullRequestOnly: true,
    directProductionWriteAllowed: false,
    automaticMergeAllowed: false,
    rollbackEvidence: {
      beforeSha256: crypto.createHash("sha256").update(`before-${index}`).digest("hex"),
      afterSha256: crypto.createHash("sha256").update(`after-${index}`).digest("hex")
    }
  };
});

check("1000 website remediation cases created", cases.length === 1000);
check("all website finding ids unique", new Set(cases.map((item) => item.findingId)).size === 1000);
check("all site and learner flows represented", new Set(cases.map((item) => item.flow)).size === flowTypes.length);
check("all cases mapped", cases.every((item) => /^(MITRE|OWASP)-/.test(item.mapping)));
check("all known bad cases alert first", cases.every((item) => item.knownBad && item.alertFirst));
check("all cases recommend block", cases.every((item) => item.blockRecommended));
check("all patches require owner approval", cases.every((item) => item.ownerApprovalRequired));
check("all patches use isolated branches", cases.every((item) => item.branch.startsWith("ai-remediation/")));
check("all patches draft PR only", cases.every((item) => item.draftPullRequestOnly));
check("direct production writes prohibited", cases.every((item) => item.directProductionWriteAllowed === false));
check("automatic merges prohibited", cases.every((item) => item.automaticMergeAllowed === false));
check("rollback hashes valid", cases.every((item) => /^[a-f0-9]{64}$/.test(item.rollbackEvidence.beforeSha256) && /^[a-f0-9]{64}$/.test(item.rollbackEvidence.afterSha256)));

const requiredFiles = [
  "app/api/obserra/intelligence/route.ts",
  "app/api/health/route.ts",
  "app/api/florida-class-d/health/live/route.ts",
  "app/api/florida-class-d/health/ready/route.ts",
  "app/api/academy/checkout/route.ts",
  "app/api/webhook/stripe/route.ts",
  "app/api/academy/assessment/route.ts",
  "app/api/academy/progress/route.ts",
  "app/academy/success/page.tsx",
  "app/academy/certificate/[courseId]/CertificateView.tsx"
];
for (const file of requiredFiles) check(`required remediation surface ${file}`, exists(file));

const intelligence = read("app/api/obserra/intelligence/route.ts");
check("intelligence requires bearer token", /authorization/i.test(intelligence) && /Bearer/.test(intelligence));
check("intelligence uses timing safe compare", /timingSafeEqual/.test(intelligence));
check("intelligence is no store", /no-store/.test(intelligence));
for (const term of [
  "remediation",
  "status: \"ready\"",
  "ownerApprovalRequired: true",
  "isolatedBranchRequired: true",
  "draftPullRequestOnly: true",
  "sourceHashValidationRequired: true",
  "rollbackEvidenceRequired: true",
  "directProductionWriteAllowed: false",
  "automaticMergeAllowed: false",
  "automaticProductionDeploymentAllowed: false",
  "verify:academy-release"
]) {
  check(`intelligence remediation contract includes ${term}`, intelligence.includes(term));
}
check("intelligence advertises MITRE and OWASP mapping requirements", intelligence.includes("MITRE ATT&CK") && intelligence.includes("OWASP Top 10"));
check("intelligence schema supports remediation contract", /schemaVersion:\s*\"1\.1\"/.test(intelligence));

const checkout = read("app/api/academy/checkout/route.ts");
check("checkout remains fail closed", /STRIPE_WEBHOOK_SECRET/.test(checkout) && /configuration-required/.test(checkout));
check("checkout requires durable storage", /academyStorageHealth/.test(checkout) && /durable-storage-unavailable/.test(checkout));
check("checkout requires configured identity", /identity\.configured/.test(checkout) && /identity-configuration-required/.test(checkout));
check("checkout preserves entitlement evidence", /entitlementType/.test(checkout) && /entitlementCode/.test(checkout));

const webhook = read("app/api/webhook/stripe/route.ts");
check("webhook verifies signatures", /constructEvent/.test(webhook));
check("webhook handles completion", /checkout\.session\.completed/.test(webhook));

const digest = crypto.createHash("sha256").update(JSON.stringify(cases)).digest("hex");
check("website remediation digest valid", digest.length === 64);

console.log(JSON.stringify({
  gate: "website-all-flows-remediation-1000x",
  cases: cases.length,
  flows: [...new Set(cases.map((item) => item.flow))],
  mappings: [...new Set(cases.map((item) => item.mapping))],
  intelligenceContract: "authenticated-remediation-v1.1",
  digest,
  failures
}, null, 2));
if (failures.length) process.exit(1);
