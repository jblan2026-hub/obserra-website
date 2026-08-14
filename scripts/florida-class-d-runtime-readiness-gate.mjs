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
const proxy = read("proxy.ts");
const handoff = read("docs/florida-class-d-lms/GATE-22-RUNTIME-READINESS-HANDOFF.md");

assert(service.includes('import "server-only"'), "runtime readiness must be server only");
assert(service.includes("reportExposesSecretValues: false"), "runtime readiness policy must prohibit secret-value exposure");
assert(service.includes('FloridaClassDRuntimeProfile = "production" | "nonproduction_acceptance"'), "runtime readiness must expose separate production and non-production profiles");
assert(service.includes("getFloridaClassDProductionRuntimeReadiness") && service.includes("getFloridaClassDNonProductionAcceptanceReadiness"), "runtime readiness must expose separate profile evaluators");
assert(service.includes("readyExceptForClassDSLicense") && service.includes("technicalReadinessComplete"), "production readiness must distinguish technical readiness from Class DS licensing blockers");
assert(service.includes('const CLASS_DS_LICENSE_KEYS = new Set(["ds_status", "ds_license_number"])'), "Class DS license blockers must be explicitly identified");
assert(service.includes("OBSERRA_SUPABASE_URL") && service.includes("OBSERRA_SUPABASE_SERVICE_ROLE_KEY"), "readiness must check explicit protected database configuration");
assert(service.includes("CLERK_SECRET_KEY") && service.includes("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"), "readiness must check identity configuration");
assert(service.includes("OBSERRA_FDACS_DAILY_API_KEY") && service.includes("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER"), "readiness must check live-media configuration");
assert(service.includes("OBSERRA_FDACS_DS_LICENSE_STATUS") && service.includes("OBSERRA_FDACS_DS_LICENSE_NUMBER") && service.includes("OBSERRA_FDACS_DI_LICENSE_NUMBER"), "production readiness must check private regulated license configuration without returning values");
assert(service.includes("OBSERRA_FDACS_DOCUMENTS_BUCKET"), "readiness must check private completion-document storage configuration");
assert(service.includes('new Set(["development", "sandbox", "staging", "uat"])'), "non-production environment allowlist must be explicit");
assert(service.includes("OBSERRA_FDACS_RUNTIME_ENVIRONMENT"), "non-production profile must require an explicit runtime environment marker");
assert(service.includes("OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED"), "non-production profile must require explicit acceptance authorization");
assert(service.includes("OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY"), "non-production profile must require synthetic-identity-only mode");
assert(service.includes("nonProductionReadinessMustNotRequireClassDSLicense: true"), "non-production profile must not require Class DS licensing");

const nonProdFunction = service.slice(
  service.indexOf("export function getFloridaClassDNonProductionAcceptanceReadiness"),
  service.indexOf("export function getFloridaClassDRuntimeReadiness"),
);
assert(!nonProdFunction.includes("OBSERRA_FDACS_DS_LICENSE_STATUS"), "non-production profile must not inspect Class DS license status");
assert(!nonProdFunction.includes("OBSERRA_FDACS_DS_LICENSE_NUMBER"), "non-production profile must not inspect Class DS license number");
assert(nonProdFunction.includes("NONPRODUCTION_ENVIRONMENTS.has(runtimeEnvironment)"), "production must not qualify for non-production readiness by hostname or inference");

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
assert(route.includes("readiness: getFloridaClassDProductionRuntimeReadiness()"), "backward-compatible readiness API field must remain production-oriented");
assert(route.includes("production: getFloridaClassDProductionRuntimeReadiness()"), "readiness API must return production profile");
assert(route.includes("nonProductionAcceptance: getFloridaClassDNonProductionAcceptanceReadiness()"), "readiness API must return non-production acceptance profile");

assert(page.includes("READY EXCEPT CLASS DS LICENSE"), "admin page must visibly distinguish staged readiness from generic failure");
assert(page.includes("READY FOR CONTROLLED ACTIVATION REVIEW"), "admin page must reserve controlled activation readiness for zero blockers");
assert(page.includes("READY FOR SYNTHETIC NON-PRODUCTION ACCEPTANCE"), "admin page must visibly distinguish non-production acceptance readiness");
assert(page.includes("FAIL CLOSED"), "admin page must preserve fail-closed status");
assert(page.includes("Class DS license issuance does not automatically activate the regulated LMS"), "admin page must preserve the controlled production activation boundary");
assert(page.includes("Forty instructional hours alone do not earn a completion certificate"), "runtime page must preserve the no-certificate-for-hours-alone rule");

assert(proxy.includes("export default clerkMiddleware"), "Clerk middleware must be the top-level Next.js proxy handler");
assert(proxy.includes('"/florida-security-training/admin"') && proxy.includes('"/api/florida-class-d/admin"'), "Florida Class D administrative surfaces must be protected by the proxy authentication boundary");

assert(handoff.includes("does not activate regulated functions") && handoff.includes("never written into the public repository"), "Gate 22 handoff must preserve the non-activating and secret-suppression boundary");
assert(handoff.includes("passing 170-question final examination at 128/170 or better"), "Gate 22 handoff must preserve the exam-before-certificate rule");

console.log("Florida Class D Gate 22 passed: separated production/non-production readiness profiles, staged Class DS-license-only readiness, protected identity routing, secret suppression, feature-flag fail-closed status, licensing boundaries, and completion controls are validated in source.");
