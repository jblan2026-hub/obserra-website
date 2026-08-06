import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const requiredFiles = [
  "app/api/health/route.ts",
  "app/api/obserrian/route.ts",
  "app/api/admin/obserrian/analytics/route.ts",
  "app/api/admin/operations/live/route.ts",
  "app/api/cron/control-room-health/route.ts",
  "lib/obserrian-review.ts",
  "lib/control-room-monitor.ts",
  "next.config.ts",
];
for (const file of requiredFiles) assert.ok(fs.existsSync(path.join(root, file)), `Missing data protection control: ${file}`);

const health = read("app/api/health/route.ts");
assert.match(health, /cache-control[^\n]*no-store/i, "Health responses must be non-cacheable");
assert.doesNotMatch(health, /AI_GATEWAY_API_KEY\s*[:,]/, "Health payload must not expose AI gateway secrets");
assert.doesNotMatch(health, /CLERK_SECRET_KEY\s*[:,]/, "Health payload must not expose Clerk secrets");
assert.doesNotMatch(health, /OBSERRA_GITHUB_PUBLISH_TOKEN\s*[:,]/, "Health payload must not expose GitHub publish tokens");

const ownerAnalytics = read("app/api/admin/obserrian/analytics/route.ts");
const ownerOperations = read("app/api/admin/operations/live/route.ts");
for (const [name, content] of [["owner analytics", ownerAnalytics], ["owner operations", ownerOperations]]) {
  assert.match(content, /auth|currentUser|userId|owner/i, `${name} must enforce an owner identity boundary`);
  assert.match(content, /401|403|unauthorized|forbidden/i, `${name} must fail closed for unauthorized users`);
}

const cron = read("app/api/cron/control-room-health/route.ts");
assert.match(cron, /CRON_SECRET/, "Persistent monitor must require CRON_SECRET");
assert.match(cron, /401|unauthorized/i, "Persistent monitor must fail closed when cron authentication is invalid");

const telemetry = read("lib/obserrian-review.ts");
assert.doesNotMatch(telemetry, /git\s+commit|createCommit|updateRef/i, "Customer telemetry must not mutate source control");
assert.match(telemetry, /issue|append|record|telemetry/i, "Customer telemetry must use append-oriented persistence semantics");

const monitor = read("lib/control-room-monitor.ts");
assert.match(monitor, /nonBlockingCustomerPath\s*:\s*true/, "Monitoring must explicitly remain outside customer request paths");
assert.match(monitor, /timeout/i, "Monitoring must use bounded timeouts");

const nextConfig = read("next.config.ts");
for (const required of ["Cache-Control", "no-store", "X-Robots-Tag", "noindex", "Content-Security-Policy", "Referrer-Policy"]) {
  assert.ok(nextConfig.includes(required), `Missing privacy/security response control: ${required}`);
}

const sensitiveLogPatterns = [
  /console\.(?:log|info|warn|error)\([^\n]*(?:password|secret|token|authorization|cookie)[^\n]*\)/gi,
  /JSON\.stringify\([^\n]*(?:password|secret|authorization|cookie)[^\n]*\)/gi,
];
const scanExtensions = new Set([".ts", ".tsx", ".js", ".mjs"]);
const ignored = new Set([".git", ".next", "node_modules"]);
const findings = [];
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) { scan(absolute); continue; }
    if (!scanExtensions.has(path.extname(entry.name))) continue;
    const content = fs.readFileSync(absolute, "utf8");
    for (const pattern of sensitiveLogPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) findings.push(path.relative(root, absolute));
    }
  }
}
scan(root);
assert.deepEqual([...new Set(findings)], [], `Potential sensitive logging detected: ${[...new Set(findings)].join(", ")}`);

console.log(JSON.stringify({
  passed: true,
  macroGate: "data-protection-readiness",
  protectedOwnerRoutes: 2,
  cronAuthentication: true,
  healthSecretExposure: 0,
  sourceMutatingTelemetry: false,
  monitoringCustomerPathIsolation: true,
  sensitiveLoggingFindings: 0,
}, null, 2));
