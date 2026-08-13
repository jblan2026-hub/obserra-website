import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`Gate 22 failed: ${message}`);
};

const service = read("lib/florida-class-d-runtime-readiness.ts");
const route = read("app/api/florida-class-d/admin/runtime-readiness/route.ts");
const page = read("app/florida-security-training/admin/runtime-readiness/page.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-22-RUNTIME-READINESS-HANDOFF.md");

assert(service.includes('import "server-only"'), "runtime readiness must be server only");
assert(service.includes("reportExposesSecretValues: false"), "runtime readiness policy must prohibit secret-value exposure");
assert(service.includes("OBSERRA_SUPABASE_URL") && service.includes("OBSERRA_SUPABASE_SERVICE_ROLE_KEY"), "readiness must check explicit protected database configuration");
assert(service.includes("CLERK_SECRET_KEY") && service.includes("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"), "readiness must check identity configuration");
assert(service.includes("OBSERRA_FDACS_DAILY_API_KEY") && service.includes("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER"), "readiness must check live-media configuration");
assert(service.includes("OBSERRA_FDACS_DS_LICENSE_STATUS") && service.includes("OBSERRA_FDACS_DS_LICENSE_NUMBER") && service.includes("OBSERRA_FDACS_DI_LICENSE_NUMBER"), "readiness must check private regulated license configuration without returning values");
assert(service.includes("OBSERRA_FDACS_DOCUMENTS_BUCKET"), "readiness must check private completion-document storage configuration");
for (const flag of [
  "OBSERRA_FDACS_CLASS_D_LIVE_ENABLED",
  "OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED",
  "OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED",
  "OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED",
  "OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED",
]) assert(service.includes(flag), `readiness must inventory ${flag}`);
assert(service.includes("enabledRegulatedFeatureFlags") && service.includes("!enabled(name)"), "regulated flags must be explicitly inspected and expected disabled during readiness review");
assert(route.includes('requireFloridaClassDStaff(["school_admin", "compliance_admin"])'), "readiness API must require protected staff roles");
assert(route.includes('"cache-control": "private, no-store'), "readiness API must be private and noncacheable");
assert(page.includes("secret values are never displayed") && page.includes("FAIL CLOSED"), "admin page must communicate the protected fail-closed readiness boundary");
assert(page.includes("Forty instructional hours alone do not earn a completion certificate"), "runtime page must preserve the no-certificate-for-hours-alone rule");
assert(handoff.includes("does not activate regulated functions") && handoff.includes("never written into the public repository"), "Gate 22 handoff must preserve the non-activating and secret-suppression boundary");
assert(handoff.includes("passing 170-question final examination at 128/170 or better"), "Gate 22 handoff must preserve the exam-before-certificate rule");

console.log("Florida Class D Gate 22 passed: protected runtime configuration presence, secret suppression, regulated feature-flag fail-closed status, licensing boundaries, and completion/certificate controls are validated in source.");
