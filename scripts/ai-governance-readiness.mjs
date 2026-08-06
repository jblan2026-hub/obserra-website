import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const requiredFiles = [
  "lib/obserrian-agent.ts",
  "lib/owner-ai-site-changes.ts",
  "lib/owner-site-publishing.ts",
  "app/api/obserrian/route.ts",
  "app/api/admin/site-change/plan/route.ts",
  "app/api/admin/site-change/preview/route.ts",
];
for (const file of requiredFiles) assert.ok(fs.existsSync(path.join(root, file)), `Missing AI governance control: ${file}`);

const agent = read("lib/obserrian-agent.ts");
assert.match(agent, /Use only the supplied Obserra application and Academy catalogs/i, "Obserrian must be grounded to approved catalogs");
assert.match(agent, /Never pressure the visitor, fabricate scarcity, make guarantees, or invent/i, "Obserrian must prohibit deceptive sales behavior");
assert.match(agent, /confidence/, "Obserrian responses must include confidence");
assert.match(agent, /groundedIn/, "Obserrian responses must include grounding evidence");
assert.match(agent, /fallbackReply/, "Obserrian must provide a deterministic fallback");
assert.match(agent, /AbortSignal\.timeout\(18_000\)/, "Obserrian gateway calls must use a bounded timeout");
assert.match(agent, /temperature:\s*0\.2/, "Obserrian must use low-variance generation settings");
assert.match(agent, /response_format:\s*\{\s*type:\s*"json_object"\s*\}/, "Obserrian must require structured JSON output");
assert.match(agent, /slice\(0,\s*2000\)/, "User prompt size must be bounded");
assert.match(agent, /slice\(-8\)/, "Conversation context must be bounded");
assert.match(agent, /href\.startsWith\("\/"\)/, "Generated actions must remain on approved internal routes");
assert.doesNotMatch(agent, /eval\(|new Function\(|child_process|exec\(/, "AI response handling must not execute generated code");

const publishing = read("lib/owner-site-publishing.ts");
assert.match(publishing, /owner-preview\//, "AI website changes must be restricted to preview branches");
assert.match(publishing, /draft:\s*true/, "AI website changes must open draft pull requests");
assert.match(publishing, /productionChanged:\s*false/, "AI preview operations must report that production is unchanged");
assert.match(publishing, /requiresOwnerApproval/, "AI website changes must require owner approval");
assert.match(publishing, /pending-approval/, "Course and catalog changes must preserve pending approval state");
assert.doesNotMatch(publishing, /update_ref[^\n]*main|force:\s*true|branch:\s*defaultBranch/, "AI publishing must not directly mutate production main");

const planRoute = read("app/api/admin/site-change/plan/route.ts");
const previewRoute = read("app/api/admin/site-change/preview/route.ts");
for (const [name, content] of [["plan route", planRoute], ["preview route", previewRoute]]) {
  assert.match(content, /auth|currentUser|userId|owner/i, `${name} must enforce owner identity`);
  assert.match(content, /401|403|unauthorized|forbidden/i, `${name} must fail closed for unauthorized users`);
}

const route = read("app/api/obserrian/route.ts");
assert.match(route, /message|pathname/, "Obserrian API must validate required request context");
assert.match(route, /400|bad request|invalid/i, "Obserrian API must reject invalid requests");
assert.match(route, /no-store|cache-control/i, "Obserrian API responses must not be cached");

console.log(JSON.stringify({
  passed: true,
  macroGate: "ai-governance-readiness",
  catalogGrounding: true,
  structuredOutput: true,
  boundedPromptAndContext: true,
  deterministicFallback: true,
  confidenceAndGrounding: true,
  deceptiveSalesClaimsProhibited: true,
  generatedCodeExecution: false,
  previewOnlyPublishing: true,
  directProductionMutation: false,
  ownerAuthorizationRequired: true,
}, null, 2));
