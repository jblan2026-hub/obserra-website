import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const certification = read("supabase/migrations/20260813052400_fdacs_class_d_makeup_certification.sql");
const security = read("supabase/migrations/20260813052500_fdacs_class_d_makeup_certification_security.sql");
const service = read("lib/florida-class-d-makeup-certification.ts");
const adminApi = read("app/api/florida-class-d/admin/makeup/route.ts");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

for (const [value, message] of [
  ["fdacs_class_d_certify_makeup_atomic", "Atomic make-up certification RPC is required."],
  ["for update", "Certification must lock the make-up assignment row before reconciliation."],
  ["make-up credit exceeds remaining daily deficit", "Certification must enforce the daily instructional ceiling."],
  ["make-up credit exceeds remaining course deficit", "Certification must enforce the 40-hour course ceiling."],
  ["recorded make-up credit exceeds 600 minutes", "Certification must enforce the recorded make-up ceiling."],
  ["instructor_attested_makeup", "Certified make-up must create a controlled instruction-time entry."],
  ["'made_up'", "Certified make-up must create separate attendance evidence without rewriting original live attendance."],
  ["makeup_certified", "Certification must append an audit event."],
]) requireText(certification, value, message);

requireText(security, "security definer", "Certification RPC must execute through a protected server-side security boundary.");
requireText(security, "revoke all on function public.fdacs_class_d_certify_makeup_atomic", "Certification RPC must revoke direct public/browser execution.");
requireText(security, "from public, anon, authenticated", "Certification RPC must be inaccessible to public, anon, and authenticated browser roles.");
requireText(security, "to service_role", "Certification RPC execute permission must be limited to service_role.");

requireText(service, "certifyFloridaClassDMakeupAtomic", "A server-only certification service is required.");
requireText(service, "OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY", "Certification service must use the protected Supabase service-role boundary.");
requireText(service, "/rest/v1/rpc/", "Certification must call the database transaction through the RPC boundary.");
requireText(service, "idempotencyKey", "Certification must require an idempotency key.");
requireText(service, "correlationId", "Certification must carry a correlation id.");

requireText(adminApi, 'body.action === "certify"', "Administrative API must expose the controlled certification action.");
requireText(adminApi, "certifyFloridaClassDMakeupAtomic", "Administrative certification must use the atomic server-side service.");
requireText(adminApi, "evidenceReference", "Certification API must require an evidence reference.");
requireText(adminApi, "evidenceStartedAt", "Certification API must require evidence start time.");
requireText(adminApi, "evidenceEndedAt", "Certification API must require evidence end time.");
requireText(adminApi, "idempotencyKey", "Certification API must require an idempotency key.");

console.log("Florida Class D Gate 10 certification subgate passed: atomic make-up credit, service-role-only RPC execution, evidence validation, daily/course/recorded ceilings, and audit boundaries validated in source.");
