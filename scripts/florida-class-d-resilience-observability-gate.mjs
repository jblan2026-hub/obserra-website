import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const service = read("lib/florida-class-d-resilience.ts");
const liveRoute = read("app/api/florida-class-d/health/live/route.ts");
const readyRoute = read("app/api/florida-class-d/health/ready/route.ts");
const adminRoute = read("app/api/florida-class-d/admin/resilience/route.ts");
const adminPage = read("app/florida-security-training/admin/resilience/page.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-27-RESILIENCE-OBSERVABILITY-HANDOFF.md");
const workflow = read(".github/workflows/florida-class-d-lms-gates.yml");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(`Gate 27 failed: ${message}`);
}

for (const [value, message] of [
  ["getFloridaClassDProductionRuntimeReadiness", "resilience must derive technical readiness from the protected Gate 22 source"],
  ["getFloridaClassDProductionActivationReport", "resilience must derive activation and HA state from Gate 26"],
  ["livenessIsNotReadiness: true", "liveness and readiness must remain separate states"],
  ["readinessIsNotActivationAuthorization: true", "technical readiness must not be represented as production activation"],
  ["activationAuthorizationIsNotFdacsApproval: true", "production activation authorization must not be represented as FDACS approval"],
  ["publicHealthResponsesSuppressDetails: true", "public health responses must remain minimal"],
  ["adminDetailedHealthRequiresAuthorization: true", "detailed resilience state must require authorization"],
  ["healthResponsesMustNotBeCached: true", "health responses must be non-cacheable"],
  ["haFailurePreventsReadyState: true", "HA failure must prevent ready state"],
  ["technicalFailurePreventsReadyState: true", "technical failure must prevent ready state"],
  ["entry.key.startsWith(\"ha:\")", "resilience must use the enforced Gate 26 HA checks"],
  ["process.uptime()", "liveness must be computed from the responding server process"],
  ["secretsExposed: false", "detailed resilience reports must preserve secret suppression"],
]) requireText(service, value, message);

requireText(liveRoute, "getFloridaClassDPublicLiveness", "liveness route must use the minimal liveness response");
requireText(liveRoute, 'status: 200', "liveness route must return HTTP 200 when the process executes the handler");
requireText(liveRoute, '"cache-control": "no-store', "liveness response must not be cached");
if (liveRoute.includes("getFloridaClassDResilienceSnapshot")) throw new Error("Gate 27 failed: public liveness may not expose the detailed resilience snapshot");

requireText(readyRoute, "getFloridaClassDResilienceSnapshot", "public readiness may inspect the detailed snapshot only for sanitized server diagnostics");
requireText(readyRoute, 'const ready = snapshot.readiness.state === "ready"', "readiness route must derive its public status from the server-controlled readiness state");
requireText(readyRoute, 'status: ready ? 200 : 503', "readiness route must return 503 when readiness is not satisfied");
requireText(readyRoute, '"retry-after": "60"', "degraded readiness must provide a bounded retry hint");
requireText(readyRoute, '"cache-control": "no-store', "readiness response must not be cached");
requireText(readyRoute, "console.warn", "degraded readiness must emit an internal diagnostic event");
requireText(readyRoute, "technicalFailureKeys", "internal readiness diagnostics must use a sanitized technical-failure label");
requireText(readyRoute, "snapshot.runtime.nonLicenseBlockingKeys", "internal readiness diagnostics must use non-license technical failure identifiers");
requireText(readyRoute, "highAvailabilityFailureKeys", "internal readiness diagnostics must use a sanitized HA-failure label");
requireText(readyRoute, "snapshot.highAvailability.failingCheckKeys", "internal readiness diagnostics must use HA failure identifiers");
requireText(readyRoute, "NextResponse.json", "public readiness must return a bounded JSON response");
requireText(readyRoute, 'service: "florida-class-d-lms"', "public readiness response must retain only the service identity");
requireText(readyRoute, 'status: ready ? "ready" : "not_ready"', "public readiness response must retain only the ready/not_ready status");
if (/NextResponse\.json\(\s*snapshot/.test(readyRoute)) throw new Error("Gate 27 failed: public readiness must not serialize the detailed resilience snapshot");
if (/nonLicenseBlockingKeys\s*:/.test(readyRoute)) throw new Error("Gate 27 failed: public readiness must not serialize raw technical failure keys");
if (/failingCheckKeys\s*:/.test(readyRoute)) throw new Error("Gate 27 failed: public readiness must not serialize raw HA failure keys");
for (const forbidden of ["process.env", "serviceRole", "apiKey"]) {
  if (readyRoute.toLowerCase().includes(forbidden.toLowerCase())) throw new Error(`Gate 27 failed: public readiness route contains forbidden runtime detail ${forbidden}`);
}

requireText(adminRoute, 'requireFloridaClassDStaff(["school_admin", "compliance_admin"])', "detailed resilience API must require protected staff roles");
requireText(adminRoute, "getFloridaClassDResilienceSnapshot", "detailed resilience API must return the server-controlled snapshot");
requireText(adminRoute, '"cache-control": "private, no-store', "detailed resilience API must be private and non-cacheable");
requireText(adminRoute, '"content-security-policy": "frame-ancestors \'none\'"', "detailed resilience API must deny framing");

requireText(adminPage, 'requireFloridaClassDStaff(["school_admin", "compliance_admin"])', "resilience console must require protected staff roles");
requireText(adminPage, "Liveness", "resilience console must display liveness separately");
requireText(adminPage, "Technical readiness", "resilience console must display readiness separately");
requireText(adminPage, "High availability", "resilience console must display HA separately");
requireText(adminPage, "Production activation", "resilience console must display activation separately");
requireText(adminPage, "FDACS approval are separate states", "resilience console must explicitly reject approval conflation");

requireText(handoff, "Liveness", "Gate 27 handoff must document liveness");
requireText(handoff, "Technical readiness", "Gate 27 handoff must document readiness");
requireText(handoff, "High availability", "Gate 27 handoff must document HA");
requireText(handoff, "Production activation authorization", "Gate 27 handoff must document activation authorization separately");
requireText(handoff, "Gate 27 makes no production database migration", "Gate 27 handoff must preserve the production database boundary");

requireText(workflow, "Run Gate 27 resilience and observability source verification", "the dedicated Class D workflow must make Gate 27 mandatory");
requireText(workflow, "node scripts/florida-class-d-resilience-observability-gate.mjs", "the Gate 27 verifier must run in CI");

console.log("Florida Class D Gate 27 passed: liveness, readiness, high availability, production activation authorization, and regulatory approval remain distinct; public health responses stay minimal while non-secret readiness failure keys may be logged server-side; detailed resilience state is staff protected and non-cacheable; HA failure blocks readiness; and CI enforcement is active.");
